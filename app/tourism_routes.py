"""Tourism geocoding and routing endpoints for Grandview Hotel.

Goong REST API resolves destination names to geographic coordinates.
TomTom Routing API calculates driving routes and returns route geometry.
API keys remain server-side in environment variables.
"""
from __future__ import annotations

import json
import ssl
from typing import Any, Literal

import certifi
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, quote
from urllib.request import Request as UrlRequest, urlopen

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app import config

router = APIRouter(prefix="/api/tourism", tags=["tourism"])

# Dùng cùng CA bundle certifi đã xác minh thành công khi kiểm tra TomTom độc lập.
SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())


class DirectionRequest(BaseModel):
    destination_name: str = Field(min_length=2, max_length=180)
    travel_mode: Literal["car", "motorcycle"] = "car"
    # Tọa độ tham chiếu của marker POI do website hiển thị.
    # Dùng để chọn đúng kết quả Goong gần điểm tham quan đã đề xuất,
    # tránh lấy nhầm một địa điểm trùng tên ở nơi khác.
    reference_lat: float | None = Field(default=None, ge=-90, le=90)
    reference_lng: float | None = Field(default=None, ge=-180, le=180)


def _haversine_m(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    from math import asin, cos, radians, sin, sqrt

    d_lat = radians(lat2 - lat1)
    d_lng = radians(lng2 - lng1)
    a = sin(d_lat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lng / 2) ** 2
    return 6_371_000 * 2 * asin(sqrt(min(1.0, a)))


def _get_json(url: str, provider: str) -> dict[str, Any]:
    request = UrlRequest(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": "GrandviewHotel/1.0 (tourism route feature)",
        },
    )
    try:
        with urlopen(request, timeout=20, context=SSL_CONTEXT) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        # Không trả URL hoặc query string về frontend vì query string chứa API key.
        raise HTTPException(
            status_code=502,
            detail=f"{provider} từ chối yêu cầu (HTTP {exc.code}). Hãy kiểm tra API key, quyền API và hạn mức.",
        ) from exc
    except (URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Không thể kết nối {provider}. Vui lòng thử lại sau.",
        ) from exc

    if not isinstance(payload, dict):
        raise HTTPException(status_code=502, detail=f"{provider} trả về dữ liệu không hợp lệ.")
    return payload


def _geocode_destination(
    destination_name: str,
    reference_lat: float | None = None,
    reference_lng: float | None = None,
) -> tuple[float, float, str, float | None]:
    if not config.GOONG_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Chưa cấu hình GOONG_API_KEY trong file .env của máy chủ.",
        )

    address = f"{destination_name}, Đà Lạt, Lâm Đồng, Việt Nam"
    query = urlencode({
        "address": address,
        "api_key": config.GOONG_API_KEY,
        "has_deprecated_administrative_unit": "true",
    })
    data = _get_json(f"https://rsapi.goong.io/v2/geocode?{query}", "Goong Geocoding API")

    results = data.get("results") or []
    if not results:
        raise HTTPException(
            status_code=404,
            detail=f"Goong không tìm thấy tọa độ cho địa điểm: {destination_name}.",
        )

    candidates: list[tuple[float, float, str, float | None]] = []
    for result in results:
        location = (result.get("geometry") or {}).get("location") or {}
        try:
            lat = float(location["lat"])
            lng = float(location["lng"])
        except (KeyError, TypeError, ValueError):
            continue
        if not (-90 <= lat <= 90 and -180 <= lng <= 180):
            continue
        distance = None
        if reference_lat is not None and reference_lng is not None:
            distance = _haversine_m(reference_lat, reference_lng, lat, lng)
        formatted_address = str(result.get("formatted_address") or address)
        candidates.append((lat, lng, formatted_address, distance))

    if not candidates:
        raise HTTPException(status_code=502, detail="Goong không trả về tọa độ hợp lệ cho địa điểm này.")

    # Nếu có tọa độ marker tham chiếu, chọn kết quả Goong gần marker nhất
    # thay vì mặc định lấy results[0] (có thể là kết quả trùng tên khác).
    if reference_lat is not None and reference_lng is not None:
        candidates.sort(key=lambda item: item[3] if item[3] is not None else float("inf"))
        selected = candidates[0]
        match_distance = selected[3] or 0.0
        # Không âm thầm chỉ đường tới một địa điểm cách marker đề xuất quá xa.
        if match_distance > 8_000:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Goong tìm thấy '{selected[2]}' nhưng vị trí này cách điểm tham quan "
                    f"được đề xuất khoảng {match_distance / 1000:.1f} km. Đã dừng để tránh chỉ đường sai địa điểm."
                ),
            )
        return selected[0], selected[1], selected[2], match_distance

    lat, lng, formatted_address, _ = candidates[0]
    return lat, lng, formatted_address, None


def _calculate_tomtom_route(
    origin_lat: float,
    origin_lng: float,
    destination_lat: float,
    destination_lng: float,
    travel_mode: str,
) -> dict[str, Any]:
    if not config.TOMTOM_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Chưa cấu hình TOMTOM_API_KEY trong file .env của máy chủ.",
        )

    # TomTom Routing v1 nhận từng vị trí theo thứ tự latitude,longitude.
    locations = (
        f"{origin_lat:.6f},{origin_lng:.6f}:"
        f"{destination_lat:.6f},{destination_lng:.6f}"
    )
    params = urlencode({
        "key": config.TOMTOM_API_KEY,
        "computeTravelTimeFor": "all",
        "traffic": "true",
        "routeType": "fastest",
        "travelMode": travel_mode,
        "sectionType": "traffic",
    })
    url = (
        "https://api.tomtom.com/routing/1/calculateRoute/"
        f"{quote(locations, safe=',.:')}/json?{params}"
    )
    data = _get_json(url, "TomTom Routing API")
    routes = data.get("routes") or []
    if not routes:
        raise HTTPException(status_code=404, detail="TomTom không tìm được tuyến đường phù hợp.")

    route = routes[0]
    summary = route.get("summary") or {}
    legs = route.get("legs") or []
    if not legs:
        raise HTTPException(status_code=502, detail="TomTom không trả về dữ liệu hình học tuyến đường.")

    points = legs[0].get("points") or []
    route_points: list[list[float]] = []
    for point in points:
        try:
            route_points.append([float(point["latitude"]), float(point["longitude"])])
        except (KeyError, TypeError, ValueError):
            continue

    if len(route_points) < 2:
        raise HTTPException(status_code=502, detail="TomTom trả về tuyến đường thiếu tọa độ để vẽ bản đồ.")

    try:
        distance_m = float(summary["lengthInMeters"])
        duration_s = float(summary["travelTimeInSeconds"])
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="TomTom trả về thông tin quãng đường/thời gian không hợp lệ.") from exc

    traffic_delay_s = float(summary.get("trafficDelayInSeconds") or 0)
    traffic_sections = []
    for section in route.get("sections") or []:
        if section.get("sectionType") == "TRAFFIC":
            traffic_sections.append({
                "startPointIndex": section.get("startPointIndex"),
                "endPointIndex": section.get("endPointIndex"),
                "simpleCategory": section.get("simpleCategory"),
            })

    return {
        "distance_m": round(distance_m),
        "distance_km": round(distance_m / 1000, 2),
        "duration_seconds": round(duration_s),
        "duration_minutes": round(duration_s / 60, 1),
        "traffic_delay_seconds": round(traffic_delay_s),
        "traffic_delay_minutes": round(traffic_delay_s / 60, 1),
        "points": route_points,
        "traffic_sections": traffic_sections,
    }


@router.get("/hotel-location")
def get_hotel_location() -> dict[str, Any]:
    """Public hotel pin used by the visitor-facing tourism map."""
    return {
        "name": "Grandview Hotel",
        "label": config.GRANDVIEW_HOTEL_LABEL,
        "lat": config.GRANDVIEW_HOTEL_LAT,
        "lng": config.GRANDVIEW_HOTEL_LNG,
    }


@router.post("/directions")
def get_tourism_directions(payload: DirectionRequest) -> dict[str, Any]:
    """Resolve a Da Lat place with Goong, then request a route from TomTom."""
    if (payload.reference_lat is None) != (payload.reference_lng is None):
        raise HTTPException(
            status_code=422,
            detail="reference_lat và reference_lng phải được gửi cùng nhau.",
        )

    destination_lat, destination_lng, formatted_address, reference_distance_m = _geocode_destination(
        payload.destination_name.strip(),
        payload.reference_lat,
        payload.reference_lng,
    )
    route = _calculate_tomtom_route(
        config.GRANDVIEW_HOTEL_LAT,
        config.GRANDVIEW_HOTEL_LNG,
        destination_lat,
        destination_lng,
        payload.travel_mode,
    )
    return {
        "origin": {
            "lat": config.GRANDVIEW_HOTEL_LAT,
            "lng": config.GRANDVIEW_HOTEL_LNG,
            "label": config.GRANDVIEW_HOTEL_LABEL,
        },
        "destination": {
            "name": payload.destination_name.strip(),
            "formatted_address": formatted_address,
            "lat": destination_lat,
            "lng": destination_lng,
            # Khoảng cách từ marker tham chiếu tới kết quả Goong; null nếu không gửi marker.
            "reference_distance_m": round(reference_distance_m) if reference_distance_m is not None else None,
        },
        "travel_mode": payload.travel_mode,
        "provider": {"geocoding": "Goong", "routing": "TomTom"},
        **route,
    }
