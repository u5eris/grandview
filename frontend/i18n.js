/* ==========================================================
   Grandview Hotel: chuyển ngôn ngữ VI / EN dùng chung cho các trang khách.

   Cách dùng trong HTML:
     data-i18n="key"            thay textContent (khóa chỉ dùng trong HTML chỉ cần bản "en")
     data-i18n-html="key"       thay innerHTML (chỉ dùng cho chuỗi trong từ điển, có <em>)
     data-i18n-attr="attr:key; attr2:key2"   thay thuộc tính (aria-label, placeholder, content…)
     <div data-lang-switch>…<button data-lang="vi">…<button data-lang="en">…</div>

   Thứ tự chọn ngôn ngữ: ?lang= trên URL, rồi lựa chọn đã lưu, rồi tiếng Việt.
   Mỗi trang thêm từ điển riêng bằng GV_I18N.add({...}) rồi gọi GV_I18N.apply().
   Khi đổi ngôn ngữ, sự kiện "gv:langchange" được phát để trang vẽ lại nội dung động.
   ========================================================== */
(() => {
  const STORAGE_KEY = "gv_lang";
  const SUPPORTED = ["vi", "en"];
  const dict = {};

  function readStored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  }

  function initialLang() {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (SUPPORTED.includes(fromUrl)) return fromUrl;
    const stored = readStored();
    return SUPPORTED.includes(stored) ? stored : "vi";
  }

  let lang = initialLang();

  const add = entries => Object.assign(dict, entries);
  const has = key => Object.hasOwn(dict, key);

  function t(key, vars) {
    const entry = dict[key];
    let text = entry ? (entry[lang] ?? entry.vi) : key;
    if (vars) text = text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
    return text;
  }

  // Chọn theo ngôn ngữ từ một cặp { vi, en } viết tại chỗ
  const pick = pair => (pair && typeof pair === "object" ? (pair[lang] ?? pair.vi) : pair);

  // Chữ tiếng Việt gốc trong HTML được giữ lại lần đầu, nên khóa chỉ dùng trong HTML
  // chỉ cần bản "en"; chuyển về VI sẽ trả lại đúng nội dung gốc.
  const originals = new WeakMap();
  function original(element, slot, read) {
    let saved = originals.get(element);
    if (!saved) { saved = {}; originals.set(element, saved); }
    if (!(slot in saved)) saved[slot] = read();
    return saved[slot];
  }

  function resolve(key, element, slot, read) {
    if (!has(key)) return null;
    const base = original(element, slot, read);
    const entry = dict[key];
    return lang === "vi" ? (entry.vi ?? base) : (entry[lang] ?? base);
  }

  function apply(root = document) {
    root.querySelectorAll("[data-i18n]").forEach(element => {
      const text = resolve(element.dataset.i18n, element, "text", () => element.textContent);
      if (text !== null) element.textContent = text;
    });
    root.querySelectorAll("[data-i18n-html]").forEach(element => {
      const html = resolve(element.dataset.i18nHtml, element, "html", () => element.innerHTML);
      if (html !== null) element.innerHTML = html;
    });
    root.querySelectorAll("[data-i18n-attr]").forEach(element => {
      element.dataset.i18nAttr.split(";").forEach(pair => {
        const [attr, key] = pair.split(":").map(part => part && part.trim());
        if (!attr || !key) return;
        const value = resolve(key, element, `attr:${attr}`, () => element.getAttribute(attr) || "");
        if (value !== null) element.setAttribute(attr, value);
      });
    });
    document.documentElement.lang = lang;
    syncSwitches();
  }

  function syncSwitches() {
    document.querySelectorAll("[data-lang-switch]").forEach(group => {
      if (has("lang.label")) group.setAttribute("aria-label", t("lang.label"));
      group.querySelectorAll("[data-lang]").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
      });
    });
  }

  function setLang(next) {
    if (!SUPPORTED.includes(next) || next === lang) return;
    lang = next;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* trình duyệt chặn bộ nhớ: vẫn đổi trong phiên này */ }
    const params = new URLSearchParams(location.search);
    if (lang === "vi") params.delete("lang"); else params.set("lang", lang);
    const query = params.toString();
    history.replaceState(history.state, "", `${location.pathname}${query ? `?${query}` : ""}${location.hash}`);
    apply();
    document.dispatchEvent(new CustomEvent("gv:langchange", { detail: { lang } }));
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-lang-switch] [data-lang]");
    if (button) setLang(button.dataset.lang);
  });

  const locale = () => (lang === "en" ? "en-GB" : "vi-VN");

  function money(value) {
    return new Intl.NumberFormat(locale(), { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(value));
  }

  function date(value, options) {
    if (!value) return "";
    const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return new Intl.DateTimeFormat(locale(), options || { day: "2-digit", month: "2-digit", year: "numeric" }).format(parsed);
  }

  // ---------- Hạng phòng: dữ liệu trong MySQL đang là tiếng Việt ----------
  // Khóa là tên hạng phòng trong bảng room_types. Hạng mới chưa có ở đây sẽ hiện tiếng Việt.
  const ROOM_TYPES_EN = {
    "Phòng Deluxe": {
      name: "Deluxe Room",
      description: "A calm, well-kept room for an easy, restful stay.",
      bed_type: "1 double bed, 1.8 m",
      view_name: "Pine hill view",
      layout_summary: "Wardrobe by the entrance, shower room, bed facing the glass wall, work desk and a 1.5 m balcony.",
    },
    "Phòng Superior": {
      name: "Superior Room",
      description: "A comfortable room with a modern design.",
      bed_type: "1 double bed, 1.8 m",
      view_name: "Pine hill and pool view",
      layout_summary: "Bathroom with a separate tub and shower, large bedroom, reading chair and a 1.8 m balcony with a lounger.",
    },
    "Suite": {
      name: "Suite",
      description: "A spacious suite with its own living area.",
      bed_type: "1 double bed, 1.8 m, and 1 sofa bed",
      view_name: "Corner view over the pine forest on two sides",
      layout_summary: "Entrance hall and guest toilet, living room with dining table and bar, separate bedroom with a 10 m² bathroom and a long balcony.",
    },
    "Biệt thự": {
      name: "Villa",
      description: "A private villa for families and groups of friends.",
      bed_type: "2 bedrooms: 1 double bed and 2 single beds",
      view_name: "Private garden in the pine forest",
      layout_summary: "Two bedrooms, each with its own bathroom, and a living room with kitchen opening onto a private garden and pool.",
    },
  };

  const AMENITIES_EN = {
    "Điều hòa": "Air conditioning", "Tivi": "TV", "2 tivi": "2 TVs", "Két an toàn": "In-room safe",
    "Ấm đun nước": "Kettle", "Wifi": "Wi-Fi", "Đồ vệ sinh cá nhân": "Toiletries", "Bồn tắm": "Bathtub",
    "Máy pha cà phê": "Coffee machine", "Áo choàng tắm": "Bathrobes", "Bếp nhỏ": "Kitchenette",
    "Bếp đầy đủ": "Full kitchen", "Máy giặt": "Washing machine", "Sân vườn riêng": "Private garden",
    "Chỗ đỗ xe": "Parking", "Quầy bar": "Bar counter", "WC khách": "Guest toilet",
    "Hồ bơi riêng": "Private pool", "Sen tắm ngoài trời": "Outdoor shower",
  };

  function roomType(type) {
    if (!type || lang === "vi") return type;
    const en = ROOM_TYPES_EN[type.name];
    if (!en) return type;
    return {
      ...type,
      ...en,
      amenities: (type.amenities || []).map(item => AMENITIES_EN[item] || item),
    };
  }

  const roomTypeName = name => (lang === "en" && ROOM_TYPES_EN[name] ? ROOM_TYPES_EN[name].name : name);

  // ---------- Danh mục dịch vụ: bảng giá ở app/main.py (SERVICE_CATALOG) ----------
  // Khóa là id nhóm và id món, giữ đúng như máy chủ. Món mới chưa dịch sẽ hiện tiếng Việt.
  const SERVICES_EN = {
    dining: {
      label: "Dining",
      description: "Served to your room from 6:00 to 23:00, usually within 25 to 35 minutes.",
      items: {
        "pho-bo": ["Rare beef phở", "Slow-simmered bone broth, fresh rice noodles"],
        "com-rang": ["Seafood fried rice", "Prawns, squid, egg and seasonal vegetables"],
        "banh-mi-chao": ["Skillet bánh mì", "Fried egg, pâté, sausage and a warm baguette"],
        "salad": ["Garden salad", "Organic greens with passion fruit dressing"],
        "trai-cay": ["Seasonal fruit plate", "For 2"],
        "ca-phe": ["Iced milk coffee", "Vietnamese phin-dripped coffee"],
        "nuoc-cam": ["Fresh orange juice", "Fresh oranges, no added sugar"],
        "nuoc-suoi": ["Mineral water", "500 ml bottle"],
      },
    },
    transport: {
      label: "Transport",
      description: "Leave the time empty if you need a car now. Reception will call you back with the driver and plate number.",
      items: {
        "san-bay-4": ["Airport transfer, 4-seat car", "Up to 3 guests, 2 suitcases"],
        "san-bay-7": ["Airport transfer, 7-seat car", "Up to 6 guests"],
        "tham-quan": ["Half-day sightseeing car", "4 hours, 4-seat car with driver"],
        "taxi": ["Call a taxi", "Pay the driver directly", "Metered"],
      },
    },
    housekeeping: {
      label: "Housekeeping and laundry",
      description: "Laundry handed in before 10:00 comes back the same day.",
      items: {
        "don-phong": ["Room cleaning", "Fresh sheets, cleaning and rubbish removal"],
        "khan-tam": ["Extra bath towels", "2 towels per request"],
        "goi": ["Extra pillow", ""],
        "giat-say": ["Wash and dry", "Charged per kg"],
        "la-ui": ["Ironing", "Charged per item"],
      },
    },
    spa: {
      label: "Spa",
      description: "Open 9:00 to 21:00. Leave the time empty to go in as soon as a slot opens.",
      items: {
        "massage-chan": ["60-minute foot massage", "Herbal foot soak"],
        "massage-body": ["90-minute full-body massage", "Lemongrass oil"],
        "xong-hoi": ["45-minute herbal steam", ""],
      },
    },
  };

  function serviceCategory(category) {
    if (!category || lang === "vi") return category;
    const en = SERVICES_EN[category.id];
    if (!en) return category;
    return {
      ...category,
      label: en.label,
      description: en.description,
      items: (category.items || []).map(item => serviceItem(category.id, item)),
    };
  }

  function serviceItem(categoryId, item) {
    if (!item || lang === "vi") return item;
    const id = item.id || item.item_id;
    const en = SERVICES_EN[categoryId] && SERVICES_EN[categoryId].items[id];
    if (!en) return item;
    const [name, detail, priceLabel] = en;
    return { ...item, name, detail: item.detail ? detail : item.detail, ...(item.price_label ? { price_label: priceLabel || item.price_label } : {}) };
  }

  const serviceLabel = (categoryId, fallback) =>
    (lang === "en" && SERVICES_EN[categoryId] ? SERVICES_EN[categoryId].label : fallback);

  // ---------- Thông báo lỗi từ máy chủ (máy chủ trả tiếng Việt) ----------
  const ERRORS_EN = [
    ["Ngày nhận phòng không thể ở trong quá khứ", "The check-in date can't be in the past."],
    ["Ngày trả phòng phải sau ngày nhận phòng", "The check-out date must be after the check-in date."],
    ["Cần truyền cả ngày nhận phòng và ngày trả phòng", "Choose both a check-in and a check-out date."],
    ["Vui lòng chọn hạng phòng", "Choose a room type."],
    ["Hạng phòng này vừa hết phòng trống", "This room type just sold out for your dates. Choose another room type or change the dates."],
    ["Phòng vừa được đặt cho khoảng thời gian này", "This room was just booked for these dates. Search again for another room."],
    ["Phòng chỉ phục vụ tối đa", "This room can't take that many guests. Choose a larger room type."],
    ["Vui lòng nhập họ tên hợp lệ", "Enter your full name."],
    ["Số điện thoại chỉ được chứa chữ số", "Phone numbers can only contain digits and + ( ) . -"],
    ["Số điện thoại phải có từ 8 đến 15 chữ số", "Phone numbers need 8 to 15 digits."],
    ["Vui lòng nhập số điện thoại hợp lệ", "Enter a valid phone number."],
    ["Bạn đã thử quá nhiều lần", "Too many attempts. Wait 10 minutes or contact reception."],
    ["Không tìm thấy đơn nào với số điện thoại này", "No bookings found for this phone number. Use the number you booked with."],
    ["Không tìm thấy lượt lưu trú nào với số điện thoại này", "No current stay found for this phone number. Use the number you booked with."],
    ["Bạn chưa nhận phòng", "You haven't checked in yet. Room service opens after reception checks you in."],
    ["Dịch vụ phòng chỉ mở khi bạn đang lưu trú", "Room service is only open during your stay."],
    ["Không tìm thấy đơn đặt phòng", "Booking not found."],
    ["Phiên dịch vụ phòng đã hết hạn", "Your room service session has expired. Enter your phone number again."],
    ["Lượt lưu trú đã kết thúc hoặc chưa nhận phòng", "Room service is closed because your stay has ended or hasn't started."],
    ["Lượt lưu trú đã kết thúc nên không thể gọi thêm dịch vụ", "Your stay has ended, so no more services can be ordered."],
    ["Có dịch vụ không còn trong danh mục", "One of these services is no longer offered. Reload the page."],
    ["Mỗi yêu cầu đặt xe chỉ chọn một chuyến", "Choose one trip per transport request."],
    ["Thời gian mong muốn không thể ở trong quá khứ", "The requested time can't be in the past."],
    ["Chỉ đặt trước tối đa 30 ngày", "You can book up to 30 days ahead."],
    ["Vui lòng nhập điểm đến", "Enter a destination."],
    ["Bạn đang có nhiều yêu cầu chờ xử lý", "You have several requests waiting. Wait for reception to pick them up."],
    ["Yêu cầu đã được tiếp nhận nên không thể tự hủy", "This request is already being handled, so it can't be cancelled here. Call reception."],
    ["Không tìm thấy yêu cầu dịch vụ", "Service request not found."],
    ["Email hoặc mật khẩu không chính xác", "Incorrect email or password."],
    ["Đăng nhập chỉ dành cho tài khoản Lễ tân và Quản trị viên", "Sign-in is for reception and admin accounts only."],
    ["API chạy nhưng chưa kết nối được MySQL", "The server can't reach the database right now. Try again in a few minutes."],
    ["Có lỗi xảy ra", "Something went wrong. Try again."],
  ];

  function error(message) {
    if (lang === "vi" || !message) return message;
    const text = String(message);
    const match = ERRORS_EN.find(([vi]) => text.includes(vi));
    if (match) return match[1];
    // Lỗi kiểm tra định dạng email của Pydantic đã là tiếng Anh
    return /[ạ-ỹđĐăâêôơư]/i.test(text) ? "Something went wrong. Check your details and try again." : text;
  }

  // ---------- Chuỗi dùng chung giữa các trang ----------
  add({
    "lang.label": { vi: "Ngôn ngữ", en: "Language" },
    "brand.sub": { vi: "Khách sạn & nghỉ dưỡng", en: "Hotel & resort" },
    "brand.home": { vi: "Grandview Hotel, về trang chủ", en: "Grandview Hotel, back to home" },
    "brand.top": { vi: "Grandview Hotel, về đầu trang", en: "Grandview Hotel, back to top" },
    "status.pending": { vi: "Chờ lễ tân xác nhận", en: "Waiting for confirmation" },
    "status.confirmed": { vi: "Đã xác nhận", en: "Confirmed" },
    "status.rejected": { vi: "Yêu cầu bị từ chối", en: "Declined" },
    "status.cancelled": { vi: "Đã hủy", en: "Cancelled" },
    "status.checked_in": { vi: "Đang lưu trú", en: "Staying now" },
    "status.checked_out": { vi: "Đã hoàn tất", en: "Completed" },
    "status.unknown": { vi: "Đang cập nhật", en: "Updating" },
    "common.free": { vi: "Miễn phí", en: "Free" },
    "common.genericError": { vi: "Có lỗi xảy ra khi gọi API.", en: "Something went wrong. Try again." },
    "common.dataError": { vi: "Lỗi dữ liệu", en: "Invalid data" },
    "common.copied": { vi: "Đã sao chép mã đặt phòng.", en: "Booking code copied." },
    "common.copyFailed": { vi: "Không thể sao chép tự động. Hãy chọn và lưu lại mã đặt phòng.", en: "Couldn't copy automatically. Select the code and save it yourself." },
  });

  window.GV_I18N = {
    add, t, pick, apply, setLang, locale, money, date, error,
    roomType, roomTypeName, serviceCategory, serviceItem, serviceLabel,
    get lang() { return lang; },
  };
})();
