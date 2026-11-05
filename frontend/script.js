const I18N = window.GV_I18N;
const t = I18N.t;

// ===== Từ điển trang chủ =====
// Khóa chỉ dùng trong HTML chỉ cần "en" (tiếng Việt lấy từ chính HTML).
// Khóa dùng trong JavaScript cần đủ "vi" và "en".
I18N.add({
  // Đầu trang và điều hướng
  "home.title": { en: "Grandview Hotel | A resort hotel in the pine forest" },
  "home.metaDescription": { en: "Book Grandview Hotel: Deluxe, Superior, Suite and villa rooms in the pine forest. Check availability by date, then order food, cars and spa from your phone." },
  "home.skip": { en: "Skip to content" },
  "home.navLabel": { en: "Main navigation" },
  "home.nav.about": { en: "About" },
  "home.nav.amenities": { en: "Amenities" },
  "home.nav.rooms": { en: "Rooms" },
  "home.nav.services": { en: "Services" },
  "home.nav.lookup": { en: "Find my booking" },
  "home.nav.roomService": { en: "Room service" },
  "home.nav.explore": { en: "Explore Da Lat" },
  "home.bookCta": { en: "Book a room" },
  "home.menu": { vi: "Mở menu", en: "Open menu" },
  "home.menuClose": { vi: "Đóng menu", en: "Close menu" },
  "home.staffLogin": { vi: "Đăng nhập nhân viên", en: "Staff sign-in" },
  "home.staffLoginTitle": { vi: "Đăng nhập cho nhân viên", en: "Sign in for staff" },
  "home.openManagement": { vi: "Mở quản lý", en: "Open management" },
  "home.close": { en: "Close" },

  // Hero và thanh tìm phòng
  "home.hero.alt": { en: "Grandview Hotel grounds with a pool and green trees" },
  "home.hero.chipsLabel": { en: "Highlights" },
  "home.hero.chip1": { en: "Resort stay" },
  "home.hero.chip2": { en: "Pine forest" },
  "home.hero.chip3": { en: "Room service to your door" },
  "home.hero.title": { en: 'Stay among the pines, <em class="script">wake up</em> to morning mist' },
  "home.hero.cta": { en: "Check availability" },
  "home.hero.caption": { en: "Rooms, a restaurant and a spa in one quiet estate, away from the town." },
  "home.heroCard.alt": { en: "Guest room with a double bed and natural light" },
  "home.heroCard.text": { en: "Staying with us? Order food, book a car or the spa from your phone." },
  "home.heroCard.cta": { en: "Open room service" },
  "home.search.label": { en: "Find available rooms" },
  "home.search.checkin": { en: "Check-in" },
  "home.search.checkout": { en: "Check-out" },
  "home.search.guests": { en: "Guests" },
  "home.search.g1": { en: "1 guest" },
  "home.search.g2": { en: "2 guests" },
  "home.search.g3": { en: "3 guests" },
  "home.search.g4": { en: "4 guests" },
  "home.search.g5": { en: "5 guests" },
  "home.search.submit": { en: "Find available rooms" },

  // Giới thiệu và tiện ích
  "home.about.title": { en: 'Where time <em class="script">slows down</em>' },
  "home.about.p1": { en: "Grandview is a resort hotel in the pine hills, with 10 rooms from Deluxe to a private family villa. Every room has a large window onto the forest and is cleaned and checked before each arrival." },
  "home.about.p2": { en: "You book without an account, find your booking with your phone number, and during your stay you can order food, book a car or the spa without going down to reception." },
  "home.about.link": { en: "See the room types" },
  "home.amen.alt": { en: "Pool overlooking a green valley" },
  "home.amen.title": { en: 'Why guests <em class="script">come back</em>' },
  "home.amen.c1": { en: "Rooms facing the pine hills" },
  "home.amen.c2": { en: "Seasonal restaurant" },
  "home.amen.c3": { en: "Spa and steam room" },
  "home.amen.c4": { en: "Heated pool" },
  "home.amen.c5": { en: "Airport transfers" },
  "home.amen.c6": { en: "Book without an account" },
  "home.amen.c7": { en: "Order services from your phone" },
  "home.amen.perksLabel": { en: "Why booking is easy" },
  "home.amen.gridLabel": { en: "Amenities at the resort" },
  "home.amenCard.view.title": { en: "Rooms facing the pine hills" },
  "home.amenCard.view.text": { en: "Every room has a large glass wall onto the forest, with a balcony or a private garden." },
  "home.amenCard.view.alt": { en: "A path through the pine forest in the morning mist" },
  "home.amenCard.pool.title": { en: "Heated pool" },
  "home.amenCard.pool.text": { en: "A pool looking out over the pine hills, with loungers and towels ready." },
  "home.amenCard.pool.alt": { en: "Pool overlooking the pine hills" },
  "home.amenCard.dining.title": { en: "Seasonal restaurant" },
  "home.amenCard.dining.text": { en: "Local dishes made with seasonal produce, tables right by the windows." },
  "home.amenCard.dining.alt": { en: "Dinner table by the window at sunset" },
  "home.amenCard.spa.title": { en: "Spa and steam room" },
  "home.amenCard.spa.text": { en: "Open 9:00 to 21:00. Book from your phone; charges go on your room bill." },
  "home.amenCard.spa.alt": { en: "Stacked stones and steam in the steam room" },
  "home.amenCard.roomService.title": { en: "Room service" },
  "home.amenCard.roomService.text": { en: "Food to your room from 6:00 to 23:00, plus cleaning and laundry, without calling reception." },
  "home.amenCard.roomService.alt": { en: "Breakfast tray on the bed" },
  "home.amenCard.transfer.title": { en: "Airport transfers" },
  "home.amenCard.transfer.text": { en: "4- or 7-seat cars, booked ahead or on demand. Reception tells you the driver and plate number." },
  "home.amenCard.transfer.alt": { en: "Transfer car on a mountain road through the pines" },
  "home.amen.cta": { en: "Book now" },

  // Phòng nghỉ
  "home.rooms.link": { en: "Search by date" },
  "home.rooms.loading": { vi: "Đang tải danh sách phòng…", en: "Loading rooms…" },
  "home.rooms.title": { vi: 'Các hạng phòng <em class="script">được yêu thích</em>', en: 'Rooms guests <em class="script">love</em>' },
  "home.rooms.titleAvailable": { vi: 'Phòng <em class="script">còn trống</em> cho bạn', en: 'Rooms <em class="script">available</em> for you' },
  "home.rooms.none": { vi: "Hiện chưa có hạng phòng nào mở đặt. Vui lòng quay lại sau.", en: "No room types are open for booking yet. Check back soon." },
  "home.rooms.hint": { vi: "Chọn ngày ở thanh tìm phòng để xem phòng còn trống và số phòng cụ thể.", en: "Pick dates in the search bar to see which rooms are free." },
  "home.rooms.loadFailed": { vi: "Chưa tải được danh sách hạng phòng. Đây là các hạng phòng tham khảo, hãy tải lại trang sau ít phút.", en: "Couldn't load the room types. These are sample rooms; reload the page in a few minutes." },
  "home.rooms.reset": { vi: "Xem lại các hạng phòng", en: "Back to all room types" },
  "home.rooms.soldOut": { vi: "Không còn phòng trống cho ngày và số khách bạn chọn. Thử đổi ngày hoặc giảm số khách.", en: "No rooms are free for these dates and guests. Try other dates or fewer guests." },
  "home.rooms.availableSummary": { vi: "{count} hạng phòng còn trống từ {from} đến {to}. Chọn hạng phòng để đặt, số phòng được xếp khi bạn nhận phòng.", en: "{count} room types free from {from} to {to}. Pick one to book; your room number is assigned at check-in." },
  "home.rooms.alt": { vi: "{name} tại Grandview", en: "{name} at Grandview" },
  "home.rooms.pickDates": { vi: "Chọn ngày cho {name}", en: "Choose dates for {name}" },
  "home.rooms.book": { vi: "Đặt {name}", en: "Book {name}" },
  "home.rooms.maxGuests": { vi: "Tối đa {n} khách", en: "Up to {n} guests" },
  "home.rooms.count": { vi: "{n} phòng", en: "{n} rooms" },
  "home.rooms.onlyLeft": { vi: "Chỉ còn {n} phòng", en: "Only {n} left" },
  "home.rooms.left": { vi: "Còn {n} phòng", en: "{n} left" },
  "home.rooms.fromPerNight": { vi: "từ <strong>{price}</strong>/đêm", en: "from <strong>{price}</strong>/night" },
  "home.rooms.forNights": { vi: "<strong>{price}</strong>/{n} đêm", en: "<strong>{price}</strong> for {n} nights" },
  "home.rooms.forOneNight": { vi: "<strong>{price}</strong>/1 đêm", en: "<strong>{price}</strong> for 1 night" },
  "home.rooms.layout": { vi: "Xem cấu trúc phòng", en: "See room layout" },
  "home.sample.deluxe": { en: "Deluxe Room" },
  "home.sample.superior": { en: "Superior Room" },
  "home.sample.villa": { en: "Villa" },
  "home.sample.deluxeAlt": { en: "Deluxe Room with a double bed" },
  "home.sample.superiorAlt": { en: "Superior Room with a modern design" },
  "home.sample.villaAlt": { en: "Family villa" },
  "home.sample.deluxePrice": { en: "from <strong>₫2,500,000</strong>/night" },
  "home.sample.superiorPrice": { en: "from <strong>₫3,200,000</strong>/night" },
  "home.sample.villaPrice": { en: "from <strong>₫8,900,000</strong>/night" },
  "home.sample.max2": { en: "Up to 2 guests" },
  "home.sample.max5": { en: "Up to 5 guests" },

  // Cấu trúc hạng phòng
  "home.rt.area": { vi: "Diện tích", en: "Size" },
  "home.rt.bed": { vi: "Giường", en: "Beds" },
  "home.rt.view": { vi: "Hướng nhìn", en: "View" },
  "home.rt.layout": { vi: "Bố trí", en: "Layout" },
  "home.rt.capacity": { vi: "Sức chứa", en: "Sleeps" },
  "home.rt.price": { vi: "Giá", en: "Price" },
  "home.rt.priceValue": { vi: "từ {price}/đêm", en: "from {price}/night" },
  "home.rt.planCaption": { vi: "Sơ đồ bố trí phòng.", en: "Room floor plan." },
  "home.rt.sketchCaption": { vi: "Ảnh minh họa phòng, ảnh thật sẽ thay sau.", en: "Illustration; real photos coming soon." },
  "home.rt.imageAlt": { vi: "{name}, hình {n}", en: "{name}, image {n}" },
  "home.rt.pick": { en: "Choose this room type" },
  "home.rt.view3d": { vi: "Xem 3D", en: "3D view" },
  "home.rt.3dCaption": { vi: "Mô hình 3D minh họa. Kéo để xoay, chọn Đứng ở cửa để nhìn như khi bước vào phòng.", en: "Illustrative 3D model. Drag to turn it; choose Stand at the door to see the room as you walk in." },
  "home.rt.3dLoading": { vi: "Đang tải mô hình 3D…", en: "Loading the 3D model…" },
  "home.rt.3dFailed": { vi: "Không tải được trình xem 3D. Kiểm tra kết nối mạng rồi thử lại.", en: "Couldn't load the 3D viewer. Check your connection and try again." },
  "home.rt.pickToast": { vi: "Chọn ngày rồi bấm Tìm phòng trống để xem phòng {name} còn trống.", en: "Pick your dates, then press Find available rooms to see free {name} rooms." },
  "home.rt.pickToastAny": { vi: "Chọn ngày nhận và trả phòng rồi bấm Tìm phòng trống để đặt.", en: "Pick check-in and check-out dates, then press Find available rooms to book." },

  // Dịch vụ
  "home.svc.title": { en: 'For days <em class="script">worth remembering</em>' },
  "home.svc.lead": { en: "See the menus and prices before your trip. Once you've checked in, order these services from your phone; charges go on your room bill and you pay at check-out." },
  "home.svc.tableLabel": { en: "Services during your stay" },
  "home.svc.colService": { en: "Service" },
  "home.svc.colPrice": { en: "Price" },
  "home.svc.colNote": { en: "Notes" },
  "home.svc.dining": { en: "In-room dining" },
  "home.svc.popular": { en: "Popular" },
  "home.svc.diningHours": { en: "6:00 to 23:00" },
  "home.svc.local": { en: "Local dishes" },
  "home.svc.diningAria": { en: "See the in-room dining menu" },
  "home.svc.transport": { en: "Transport" },
  "home.svc.airport": { en: "Airport transfers" },
  "home.svc.tour": { en: "Sightseeing" },
  "home.svc.transportAria": { en: "See transport prices" },
  "home.svc.spa": { en: "Spa and steam room" },
  "home.svc.couples": { en: "For two" },
  "home.svc.spaHours": { en: "9:00 to 21:00" },
  "home.svc.spaAria": { en: "See spa prices" },
  "home.svc.housekeeping": { en: "Housekeeping and laundry" },
  "home.svc.cleanFree": { en: "Room cleaning <strong>free</strong>" },
  "home.svc.sameDay": { en: "Same-day laundry" },
  "home.svc.housekeepingAria": { en: "See housekeeping and laundry" },
  "home.svc.more": { en: "See the full service list and prices" },
  "home.svc.from": { vi: "từ <strong>{price}</strong>", en: "from <strong>{price}</strong>" },

  // Khách đã đặt phòng
  "home.tools.title": { en: 'For guests <em class="script">with a booking</em>' },
  "home.phoneLabel": { en: "Phone number used for the booking" },
  "home.phonePlaceholder": { en: "e.g. 0901234567" },
  "home.lookup.lead": { en: "Enter the phone number you booked with to see your booking code, status and total, including services used." },
  "home.lookup.submit": { vi: "Tra cứu đơn đặt phòng", en: "Find my booking" },
  "home.lookup.loading": { vi: "Đang tra cứu...", en: "Searching..." },
  "home.lookup.note": { en: "Results show your booking code. Search on your own device." },
  "home.lookup.one": { vi: "Tìm thấy 1 đơn đặt phòng.", en: "Found 1 booking." },
  "home.lookup.many": { vi: "Tìm thấy {n} đơn đặt phòng, đơn đang diễn ra ở trên cùng.", en: "Found {n} bookings; current ones are at the top." },
  "home.lookup.room": { vi: "Phòng", en: "Room" },
  "home.lookup.roomNumber": { vi: "Phòng {n}, ", en: "Room {n}, " },
  "home.lookup.roomHint": { vi: "Số phòng được xếp khi nhận phòng", en: "Room number is assigned at check-in" },
  "home.lookup.stay": { vi: "Lưu trú", en: "Stay" },
  "home.lookup.stayValue": { vi: "{from} đến {to}, {n} đêm", en: "{from} to {to}, {n} nights" },
  "home.lookup.stayValueOne": { vi: "{from} đến {to}, 1 đêm", en: "{from} to {to}, 1 night" },
  "home.lookup.booker": { vi: "Người đặt", en: "Booked by" },
  "home.lookup.guests": { vi: "Số khách", en: "Guests" },
  "home.lookup.guestsValue": { vi: "{n} người", en: "{n}" },
  "home.lookup.roomTotal": { vi: "Tiền phòng", en: "Room" },
  "home.lookup.services": { vi: "Dịch vụ phòng", en: "Room service" },
  "home.lookup.noServices": { vi: "Chưa dùng", en: "None yet" },
  "home.lookup.total": { vi: "Tổng cộng", en: "Total" },
  "home.lookup.deposit": { vi: "Đã đặt cọc", en: "Deposit paid" },
  "home.lookup.due": { vi: "Còn phải thanh toán", en: "Balance due" },
  "home.lookup.openService": { vi: "Mở dịch vụ phòng", en: "Open room service" },
  "home.lookup.note.pending": { vi: "Yêu cầu đang chờ lễ tân kiểm tra và xác nhận.", en: "Reception is reviewing your request." },
  "home.lookup.note.confirmed": { vi: "Đặt phòng đã được xác nhận. Hẹn gặp bạn tại Grandview.", en: "Your booking is confirmed. See you at Grandview." },
  "home.lookup.note.checked_in": { vi: "Bạn đang lưu trú. Tiền dịch vụ được cộng khi lễ tân tiếp nhận yêu cầu.", en: "You're staying with us. Service charges are added once reception accepts a request." },
  "home.lookup.note.checked_out": { vi: "Lượt lưu trú đã hoàn tất. Cảm ơn bạn đã nghỉ tại Grandview.", en: "Your stay is complete. Thank you for staying at Grandview." },
  "home.lookup.note.rejected": { vi: "Vui lòng liên hệ khách sạn nếu cần được hỗ trợ thêm.", en: "Contact the hotel if you need more help." },
  "home.lookup.note.cancelled": { vi: "Đơn này đã được hủy.", en: "This booking was cancelled." },
  "home.bookingCode": { vi: "Mã đặt phòng", en: "Booking code" },
  "home.copyCode": { vi: "Sao chép mã", en: "Copy code" },
  "home.invalidPhone": { vi: "Vui lòng nhập số điện thoại hợp lệ.", en: "Enter a valid phone number." },
  "home.rs.lead": { en: "Staying at Grandview? Order food to your room, book a car, ask for cleaning or book the spa without calling." },
  "home.rs.submit": { vi: "Vào dịch vụ phòng", en: "Open room service" },
  "home.rs.loading": { vi: "Đang kiểm tra...", en: "Checking..." },
  "home.rs.choose": { en: "This phone number is on more than one room. Choose the room to order for:" },
  "home.rs.roomButton": { vi: "Phòng {n}", en: "Room {n}" },
  "home.rs.note": { en: 'Opens after reception checks you in. Charges go on your bill and you pay at check-out. Not here yet? <a href="/dich-vu.html">See services and prices</a>.' },
  "home.rs.preview": { vi: "Xem trước dịch vụ và bảng giá", en: "See services and prices" },

  // Chân trang
  "home.foot.tagline": { en: "A resort hotel in the pine forest." },
  "home.foot.navLabel": { en: "Footer links" },
  "home.foot.explore": { en: "Explore Da Lat (beta)" },
  "home.foot.copy": { en: "© 2026 Grandview Hotel. A student project prototype." },

  // Đăng nhập nhân viên
  "home.auth.title": { en: "Staff sign-in" },
  "home.auth.intro": { en: "For Grandview reception and admin staff." },
  "home.auth.emailPh": { en: "name@grandview.com" },
  "home.auth.password": { en: "Password" },
  "home.auth.passwordPh": { en: "Enter your password" },
  "home.auth.submit": { vi: "Đăng nhập", en: "Sign in" },
  "home.auth.loading": { vi: "Đang xử lý...", en: "Signing in..." },
  "home.auth.staffOnly": { vi: "Cổng đăng nhập này chỉ dành cho Lễ tân và Quản trị viên.", en: "This sign-in is for reception and admin staff only." },
  "home.auth.signedOut": { vi: "Đã đăng xuất tài khoản nhân viên.", en: "Signed out of the staff account." },
  "home.auth.foot": { en: "Guests don't need an account to book." },

  // Đặt phòng
  "home.gb.title": { en: "Booking details" },
  "home.gb.summary": { vi: "{room}, {from} đến {to}, {n} khách.", en: "{room}, {from} to {to}, {n} guests." },
  "home.gb.name": { en: "Full name" },
  "home.gb.namePh": { en: "Jane Nguyen" },
  "home.gb.phone": { en: "Phone number" },
  "home.gb.emailPh": { en: "you@example.com" },
  "home.gb.note": { en: "Notes" },
  "home.optional": { en: "(optional)" },
  "home.gb.notePh": { en: "Arrival time, bed type, any special help…" },
  "home.gb.submit": { vi: "Gửi yêu cầu đặt phòng", en: "Send booking request" },
  "home.gb.loading": { vi: "Đang gửi yêu cầu...", en: "Sending request..." },
  "home.gb.foot": { en: "You'll use this phone number to find your booking and open room service later." },
  "home.gb.pickRoom": { vi: "Vui lòng chọn phòng trước khi đặt.", en: "Choose a room before booking." },
  "home.gb.pickDates": { vi: "Vui lòng chọn ngày nhận và trả phòng trước.", en: "Choose check-in and check-out dates first." },
  "home.ok.title": { en: "Booking request sent" },
  "home.ok.intro": { en: "Reception will confirm soon. You can look up your booking any time with the phone number you entered." },
  "home.ok.total": { vi: "{room}, tiền phòng dự kiến {price}. Số phòng được xếp khi bạn nhận phòng.", en: "{room}, estimated room price {price}. Your room number is assigned at check-in." },
  "home.ok.done": { en: "Done" },
  "home.search.badDates": { vi: "Ngày trả phòng phải sau ngày nhận phòng. Chọn lại ngày trả phòng.", en: "Check-out must be after check-in. Choose another check-out date." },
  "home.search.failed": { vi: "Chưa tìm được phòng trống. {error}", en: "Couldn't search for rooms. {error}" },
});

const menuToggle = document.querySelector("#menuToggle");
const nav = document.querySelector("#mainNav");
const toast = document.querySelector("#toast");
const checkin = document.querySelector("#checkin");
const checkout = document.querySelector("#checkout");
const roomGrid = document.querySelector(".room-grid");
const authModal = document.querySelector("#authModal");
const authForm = document.querySelector("#authForm");
const authError = document.querySelector("#authError");
const authSubmit = document.querySelector("#authSubmit");
const accountBtn = document.querySelector("#accountBtn");
const guestBookingModal = document.querySelector("#guestBookingModal");
const guestBookingForm = document.querySelector("#guestBookingForm");
const guestBookingError = document.querySelector("#guestBookingError");
const guestBookingSubmit = document.querySelector("#guestBookingSubmit");
const bookingSuccessModal = document.querySelector("#bookingSuccessModal");
const bookingLookupForm = document.querySelector("#bookingLookupForm");
const bookingLookupPhone = document.querySelector("#bookingLookupPhone");
const bookingLookupError = document.querySelector("#bookingLookupError");
const bookingLookupResult = document.querySelector("#bookingLookupResult");
const bookingLookupSubmit = document.querySelector("#bookingLookupSubmit");

let currentUser = null;
let selectedRoom = null;
let toastTimer;

function setMenuOpen(open) {
  nav.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", t(open ? "home.menuClose" : "home.menu"));
}

menuToggle.addEventListener("click", () => setMenuOpen(!nav.classList.contains("open")));
document.querySelectorAll("#mainNav a").forEach(link => {
  link.addEventListener("click", () => setMenuOpen(false));
});

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);
const dayAfter = new Date(today);
dayAfter.setDate(today.getDate() + 2);
const asDateInput = date => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
checkin.min = asDateInput(today);
checkin.value = asDateInput(tomorrow);
checkout.min = asDateInput(dayAfter);
checkout.value = asDateInput(dayAfter);

checkin.addEventListener("change", () => {
  const next = new Date(`${checkin.value}T12:00:00`);
  next.setDate(next.getDate() + 1);
  checkout.min = asDateInput(next);
  if (checkout.value <= checkin.value) checkout.value = asDateInput(next);
});

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 5000);
}

function guestCount() {
  const match = document.querySelector("#guests").value.match(/^\s*(\d+)/);
  return match ? Number(match[1]) : 2;
}

async function apiRequest(url, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = sessionStorage.getItem("hotel_access_token");
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(data.detail)
      ? data.detail.map(item => I18N.error(String(item.msg || t("common.dataError")).replace(/^Value error, /, ""))).join("; ")
      : I18N.error(data.detail || t("common.genericError"));
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return data;
}

const formatPrice = value => I18N.money(value);
const formatDateForSummary = value => I18N.date(value);
const nightsBetween = (from, to) => Math.max(1, Math.round((new Date(to) - new Date(from)) / 86400000));

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

// ===== Modal: trả tiêu điểm về nút đã mở =====
let lastFocus = null;
function openModal(modal, focusTarget) {
  lastFocus = document.activeElement;
  modal.hidden = false;
  (focusTarget || modal.querySelector("button, input")).focus();
}
function closeModal(modal) {
  if (modal.hidden) return;
  modal.hidden = true;
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  lastFocus = null;
}

const roomsStatus = document.querySelector("#roomsStatus");
const roomsTitle = document.querySelector("#roomsTitle");
const ARROW_ICON = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg>';
const PERSON_ICON = '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 4-5 7-5s5.8 1.4 7 5"/></svg>';
const FALLBACK_ROOM_IMAGE = "/images/phong-deluxe.svg";

let roomTypes = [];
let preferredTypeId = null;
// Lưu lần hiển thị gần nhất để vẽ lại khi đổi ngôn ngữ
let roomsView = { kind: "loading" };

// Mặc định: chỉ hiện hạng phòng, không lộ số phòng
function renderRoomTypes(types) {
  roomTypes = types;
  roomsView = { kind: "types" };
  roomsTitle.innerHTML = t("home.rooms.title");
  if (!types.length) {
    roomGrid.innerHTML = `<p class="room-empty">${escapeHtml(t("home.rooms.none"))}</p>`;
    roomsStatus.textContent = "";
    return;
  }
  roomsStatus.textContent = t("home.rooms.hint");
  roomGrid.innerHTML = types.map(raw => {
    const type = I18N.roomType(raw);
    const name = escapeHtml(type.name);
    return `
      <article class="room-card is-bookable" data-type-id="${Number(type.id)}">
        <img src="${escapeHtml(type.image_url || FALLBACK_ROOM_IMAGE)}" alt="${escapeHtml(t("home.rooms.alt", { name: type.name }))}" width="800" height="1000" loading="lazy">
        <button class="room-arrow" type="button" data-pick-type="${Number(type.id)}" aria-label="${escapeHtml(t("home.rooms.pickDates", { name: type.name }))}">${ARROW_ICON}</button>
        <div class="room-overlay">
          <ul class="chip-row">
            <li class="chip chip-glass">${PERSON_ICON} ${escapeHtml(t("home.rooms.maxGuests", { n: Number(type.max_guests) }))}</li>
            ${type.area_sqm ? `<li class="chip chip-glass">${Number(type.area_sqm)} m²</li>` : ""}
          </ul>
          <div class="room-name-row">
            <h3>${name}</h3>
            <p>${t("home.rooms.fromPerNight", { price: escapeHtml(formatPrice(type.price_per_night)) })}</p>
          </div>
          <button class="room-detail-link" type="button" data-type-detail="${Number(type.id)}">${escapeHtml(t("home.rooms.layout"))}</button>
        </div>
      </article>`;
  }).join("");
}

// Sau khi tìm theo ngày: hiện hạng phòng còn trống và số lượng, không hiện số phòng
function renderAvailability(types) {
  roomsView = { kind: "availability", types, from: checkin.value, to: checkout.value };
  // Nút "Xem cấu trúc phòng" cần dữ liệu hạng phòng kể cả khi /api/room-types chưa tải được
  types.forEach(type => {
    if (!roomTypes.some(item => Number(item.id) === Number(type.id))) roomTypes.push(type);
  });
  const resetLink = `<button type="button" class="link-button" data-show-types>${escapeHtml(t("home.rooms.reset"))}</button>`;
  roomsTitle.innerHTML = t("home.rooms.titleAvailable");
  if (!types.length) {
    roomGrid.innerHTML = `<p class="room-empty">${escapeHtml(t("home.rooms.soldOut"))} ${resetLink}</p>`;
    roomsStatus.textContent = "";
    return;
  }
  if (preferredTypeId) {
    types = [...types].sort((a, b) => (Number(b.id) === preferredTypeId) - (Number(a.id) === preferredTypeId));
  }
  roomsStatus.innerHTML = `${escapeHtml(t("home.rooms.availableSummary", {
    count: types.length,
    from: formatDateForSummary(roomsView.from),
    to: formatDateForSummary(roomsView.to),
  }))} ${resetLink}`;
  const nights = nightsBetween(roomsView.from, roomsView.to);
  roomGrid.innerHTML = types.map(raw => {
    const type = I18N.roomType(raw);
    const name = escapeHtml(type.name);
    const left = Number(type.available_count);
    const total = escapeHtml(formatPrice(type.price_per_night * nights));
    return `
      <article class="room-card is-bookable">
        <img src="${escapeHtml(type.image_url || FALLBACK_ROOM_IMAGE)}" alt="${escapeHtml(t("home.rooms.alt", { name: type.name }))}" width="800" height="1000" loading="lazy">
        <button class="room-arrow" type="button" data-room-type-id="${Number(type.id)}" data-room-name="${escapeHtml(raw.name)}"
                aria-label="${escapeHtml(t("home.rooms.book", { name: type.name }))}">${ARROW_ICON}</button>
        <div class="room-overlay">
          <ul class="chip-row">
            <li class="chip chip-glass chip-strong">${escapeHtml(t(left <= 2 ? "home.rooms.onlyLeft" : "home.rooms.left", { n: left }))}</li>
            <li class="chip chip-glass">${PERSON_ICON} ${escapeHtml(t("home.rooms.maxGuests", { n: Number(type.max_guests) }))}</li>
          </ul>
          <div class="room-name-row">
            <h3>${name}</h3>
            <p>${t(nights === 1 ? "home.rooms.forOneNight" : "home.rooms.forNights", { price: total, n: nights })}</p>
          </div>
          <button class="room-detail-link" type="button" data-type-detail="${Number(type.id)}">${escapeHtml(t("home.rooms.layout"))}</button>
        </div>
      </article>`;
  }).join("");
}

function renderRoomsFailed() {
  roomsView = { kind: "failed" };
  roomsStatus.textContent = t("home.rooms.loadFailed");
}

function rerenderRooms() {
  if (roomsView.kind === "types") renderRoomTypes(roomTypes);
  else if (roomsView.kind === "availability") renderAvailability(roomsView.types);
  else if (roomsView.kind === "failed") renderRoomsFailed();
  else roomsStatus.textContent = t("home.rooms.loading");
}

async function loadRooms() {
  try {
    renderRoomTypes(await apiRequest("/api/room-types"));
  } catch {
    renderRoomsFailed();
  }
}

// Giá "từ ..." trong bảng dịch vụ lấy từ danh mục thật ở máy chủ
function renderServicePrices() {
  document.querySelectorAll("[data-min-price]").forEach(cell => {
    const value = Number(cell.dataset.minValue);
    if (value > 0) cell.innerHTML = t("home.svc.from", { price: escapeHtml(formatPrice(value)) });
  });
}

async function loadServicePrices() {
  try {
    const catalog = await apiRequest("/api/services/catalog");
    catalog.forEach(category => {
      const cell = document.querySelector(`[data-service-category="${category.id}"] [data-min-price]`);
      const prices = category.items.map(item => Number(item.price)).filter(price => price > 0);
      if (cell && prices.length) cell.dataset.minValue = String(Math.min(...prices));
    });
  } catch {
    /* giữ giá mẫu trong HTML */
  }
  renderServicePrices();
}

document.querySelector("#booking").addEventListener("submit", async event => {
  event.preventDefault();
  if (!checkin.value || !checkout.value || checkout.value <= checkin.value) {
    notify(t("home.search.badDates"));
    return;
  }
  const params = new URLSearchParams({
    check_in: checkin.value,
    check_out: checkout.value,
    guests: String(guestCount()),
  });
  try {
    renderAvailability(await apiRequest(`/api/room-availability?${params.toString()}`));
    document.querySelector("#rooms").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    notify(t("home.search.failed", { error: error.message }));
  }
});

// ===== Cấu trúc hạng phòng =====
const roomTypeModal = document.querySelector("#roomTypeModal");
let detailTypeId = null;
let detailImageIndex = 0;

function detailType() {
  const raw = roomTypes.find(item => Number(item.id) === Number(detailTypeId));
  if (!raw) return null;
  const type = I18N.roomType(raw);
  const gallery = [...(type.gallery || [])];
  if (type.image_url && !gallery.includes(type.image_url)) gallery.unshift(type.image_url);
  if (!gallery.length) gallery.push(FALLBACK_ROOM_IMAGE);
  return { ...type, gallery };
}

function galleryCaption(src) {
  if (/so-do/.test(src)) return t("home.rt.planCaption");
  if (/\.svg($|\?)/.test(src)) return t("home.rt.sketchCaption");
  return "";
}

// ----- Mô hình 3D trong cửa sổ cấu trúc phòng (tải thư viện khi khách bấm "Xem 3D") -----
const VIEWER_SCRIPTS = [
  "https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js",
  "https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/controls/OrbitControls.js",
  "https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/loaders/GLTFLoader.js",
  "/js/room-3d.js?v=2",
];
const MODEL_KEYS = { "Phòng Deluxe": "deluxe", "Phòng Superior": "superior", "Suite": "suite", "Biệt thự": "villa" };
let viewerScripts = null;
let roomViewer = null;
let showing3d = false;

function modelKeyFor(raw) {
  const match = String(raw.image_url || "").match(/phong-(deluxe|superior|suite|villa)\./);
  return match ? match[1] : (MODEL_KEYS[raw.name] || null);
}

function loadViewerScripts() {
  if (!viewerScripts) {
    viewerScripts = VIEWER_SCRIPTS.reduce((chain, src) => chain.then(() => new Promise((resolve, reject) => {
      const tag = document.createElement("script");
      tag.src = src;
      tag.onload = resolve;
      tag.onerror = () => reject(new Error(src));
      document.head.appendChild(tag);
    })), Promise.resolve()).catch(error => { viewerScripts = null; throw error; });
  }
  return viewerScripts;
}

function closeRoomViewer() {
  showing3d = false;
  if (roomViewer) { roomViewer.destroy(); roomViewer = null; }
  const box = document.querySelector("#roomType3d");
  box.hidden = true;
  box.className = "room-3d";
  box.innerHTML = "";
  document.querySelector("#roomTypeImage").hidden = false;
}

async function showRoomViewer() {
  if (roomViewer || showing3d) return;
  const raw = roomTypes.find(item => Number(item.id) === Number(detailTypeId));
  if (!raw) return;
  showing3d = true;
  const box = document.querySelector("#roomType3d");
  document.querySelectorAll("#roomTypeThumbs button").forEach(button => {
    button.setAttribute("aria-pressed", String(button.hasAttribute("data-view-3d")));
  });
  document.querySelector("#roomTypeImage").hidden = true;
  box.hidden = false;
  box.textContent = t("home.rt.3dLoading");
  document.querySelector("#roomTypeCaption").textContent = t("home.rt.3dCaption");
  const idAtStart = detailTypeId;
  try {
    await loadViewerScripts();
    if (detailTypeId !== idAtStart || !showing3d) return;
    box.textContent = "";
    roomViewer = window.GrandviewRoom3D.mount(box, modelKeyFor(raw));
  } catch {
    if (showing3d) box.textContent = t("home.rt.3dFailed");
  }
}

function showGalleryImage(index) {
  const type = detailType();
  if (!type) return;
  closeRoomViewer();
  detailImageIndex = Math.min(index, type.gallery.length - 1);
  const src = type.gallery[detailImageIndex];
  const picture = document.querySelector("#roomTypeImage");
  picture.classList.toggle("is-plan", /so-do/.test(src));
  picture.src = src;
  picture.alt = t("home.rt.imageAlt", { name: type.name, n: detailImageIndex + 1 });
  document.querySelector("#roomTypeCaption").textContent = galleryCaption(src);
  document.querySelectorAll("#roomTypeThumbs button").forEach((button, position) => {
    button.setAttribute("aria-pressed", String(position === detailImageIndex));
  });
}

function renderRoomTypeDetail() {
  const type = detailType();
  if (!type) return;
  document.querySelector("#roomTypeTitle").textContent = type.name;
  document.querySelector("#roomTypeLead").textContent = type.description || "";
  document.querySelector("#roomTypeThumbs").innerHTML = type.gallery.map((src, index) =>
    `<button type="button" data-gallery="${index}" aria-pressed="${index === detailImageIndex}"
             aria-label="${escapeHtml(t("home.rt.imageAlt", { name: type.name, n: index + 1 }))}">
       <img src="${escapeHtml(src)}" alt="" width="120" height="90" loading="lazy">
     </button>`).join("")
    + (modelKeyFor(roomTypes.find(item => Number(item.id) === Number(detailTypeId)) || {})
      ? `<button type="button" class="thumb-3d" data-view-3d aria-pressed="false">${escapeHtml(t("home.rt.view3d"))}</button>` : "");
  const rows = [
    [t("home.rt.area"), type.area_sqm ? `${Number(type.area_sqm)} m²` : null],
    [t("home.rt.bed"), type.bed_type],
    [t("home.rt.view"), type.view_name],
    [t("home.rt.layout"), type.layout_summary],
    [t("home.rt.capacity"), t("home.rooms.maxGuests", { n: Number(type.max_guests) })],
    [t("home.rt.price"), t("home.rt.priceValue", { price: formatPrice(type.price_per_night) })],
  ].filter(([, value]) => value);
  document.querySelector("#roomTypeLayout").innerHTML = rows.map(([label, value]) =>
    `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(String(value))}</dd>`).join("");
  document.querySelector("#roomTypeAmenities").innerHTML = (type.amenities || [])
    .map(item => `<li class="chip chip-line">${escapeHtml(item)}</li>`).join("");
  if (showing3d) {
    // Đổi ngôn ngữ khi đang xem 3D: giữ nguyên khung 3D, chỉ cập nhật chữ
    document.querySelectorAll("#roomTypeThumbs button").forEach(button => {
      button.setAttribute("aria-pressed", String(button.hasAttribute("data-view-3d")));
    });
    document.querySelector("#roomTypeCaption").textContent = t("home.rt.3dCaption");
  } else {
    showGalleryImage(detailImageIndex);
  }
}

function openRoomTypeDetail(typeId) {
  if (!roomTypes.some(item => Number(item.id) === Number(typeId))) return;
  closeRoomViewer();
  detailTypeId = Number(typeId);
  detailImageIndex = 0;
  renderRoomTypeDetail();
  openModal(roomTypeModal, document.querySelector("#roomTypeClose"));
}

function closeRoomTypeDetail() {
  closeRoomViewer();
  closeModal(roomTypeModal);
  detailTypeId = null;
}

document.querySelector("#roomTypeClose").addEventListener("click", closeRoomTypeDetail);
roomTypeModal.addEventListener("click", event => {
  if (event.target === roomTypeModal) { closeRoomTypeDetail(); return; }
  if (event.target.closest("[data-view-3d]")) { showRoomViewer(); return; }
  const thumb = event.target.closest("[data-gallery]");
  if (thumb) showGalleryImage(Number(thumb.dataset.gallery));
});
document.querySelector("#roomTypePick").addEventListener("click", () => {
  const typeId = detailTypeId || 0;
  closeRoomTypeDetail();
  // Đã tìm theo ngày và hạng phòng này còn trống: mở luôn bước điền thông tin
  const available = roomsView.kind === "availability"
    && roomsView.types.find(item => Number(item.id) === typeId);
  if (available) {
    selectedRoom = { typeId, name: available.name };
    openGuestBooking();
    return;
  }
  pickRoomType(typeId);
});

function pickRoomType(typeId) {
  preferredTypeId = typeId || null;
  const raw = roomTypes.find(item => Number(item.id) === preferredTypeId);
  document.querySelector("#booking").scrollIntoView({ behavior: "smooth", block: "center" });
  checkin.focus({ preventScroll: true });
  notify(raw
    ? t("home.rt.pickToast", { name: I18N.roomTypeName(raw.name) })
    : t("home.rt.pickToastAny"));
}

document.querySelector("#rooms").addEventListener("click", event => {
  if (event.target.closest("[data-show-types]")) {
    preferredTypeId = null;
    if (roomTypes.length) renderRoomTypes(roomTypes); else loadRooms();
  }
});

roomGrid.addEventListener("click", event => {
  if (event.target.closest("[data-show-types]")) return;
  const detailButton = event.target.closest("[data-type-detail]");
  if (detailButton) { openRoomTypeDetail(Number(detailButton.dataset.typeDetail)); return; }
  const card = event.target.closest(".room-card");
  const button = card && card.querySelector(".room-arrow");
  if (!button || !button.dataset.roomTypeId) {
    if (card) pickRoomType(Number(card.dataset.typeId || button?.dataset.pickType || 0));
    return;
  }
  if (!checkin.value || !checkout.value || checkout.value <= checkin.value) {
    notify(t("home.gb.pickDates"));
    document.querySelector("#booking").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  selectedRoom = { typeId: Number(button.dataset.roomTypeId), name: button.dataset.roomName };
  openGuestBooking();
});

// ===== Đăng nhập nhân viên =====
function openStaffLogin() {
  authError.textContent = "";
  openModal(authModal, document.querySelector("#authEmail"));
}

function closeStaffLogin() {
  closeModal(authModal);
  authError.textContent = "";
}

accountBtn.addEventListener("click", () => {
  if (currentUser) {
    window.location.href = "/management.html";
  } else {
    openStaffLogin();
  }
});

document.querySelector("#authClose").addEventListener("click", closeStaffLogin);
authModal.addEventListener("click", event => {
  if (event.target === authModal) closeStaffLogin();
});

authForm.addEventListener("submit", async event => {
  event.preventDefault();
  authError.textContent = "";
  authSubmit.disabled = true;
  authSubmit.textContent = t("home.auth.loading");
  const email = document.querySelector("#authEmail").value.trim();
  const password = document.querySelector("#authPassword").value;
  try {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!["admin", "receptionist"].includes(response.user.role)) {
      throw new Error(t("home.auth.staffOnly"));
    }
    sessionStorage.setItem("hotel_access_token", response.access_token);
    currentUser = response.user;
    closeStaffLogin();
    window.location.replace("/management.html");
  } catch (error) {
    authError.textContent = error.message;
  } finally {
    authSubmit.disabled = false;
    authSubmit.textContent = t("home.auth.submit");
  }
});

// ===== Khách đặt phòng =====
function renderGuestBookingSummary() {
  if (!selectedRoom) return;
  document.querySelector("#guestBookingSummary").textContent = t("home.gb.summary", {
    room: I18N.roomTypeName(selectedRoom.name),
    from: formatDateForSummary(checkin.value),
    to: formatDateForSummary(checkout.value),
    n: guestCount(),
  });
}

function openGuestBooking() {
  renderGuestBookingSummary();
  guestBookingError.textContent = "";
  openModal(guestBookingModal, document.querySelector("#customerName"));
}

function closeGuestBooking() {
  closeModal(guestBookingModal);
  guestBookingError.textContent = "";
}

document.querySelector("#guestBookingClose").addEventListener("click", closeGuestBooking);
guestBookingModal.addEventListener("click", event => {
  if (event.target === guestBookingModal) closeGuestBooking();
});

let lastBooking = null;
function renderBookingSuccess() {
  if (!lastBooking) return;
  document.querySelector("#successBookingCode").textContent = lastBooking.booking_code;
  document.querySelector("#successBookingTotal").textContent = t("home.ok.total", {
    room: I18N.roomTypeName(lastBooking.room_type),
    price: formatPrice(lastBooking.total_price),
  });
}

async function submitGuestBooking(event) {
  event.preventDefault();
  if (!selectedRoom) {
    closeGuestBooking();
    notify(t("home.gb.pickRoom"));
    return;
  }
  guestBookingError.textContent = "";
  guestBookingSubmit.disabled = true;
  guestBookingSubmit.textContent = t("home.gb.loading");
  const payload = {
    room_type_id: selectedRoom.typeId,
    check_in: checkin.value,
    check_out: checkout.value,
    guests: guestCount(),
    customer_name: document.querySelector("#customerName").value.trim(),
    customer_phone: document.querySelector("#customerPhone").value.trim(),
    customer_email: document.querySelector("#customerEmail").value.trim() || null,
    note: document.querySelector("#bookingNote").value.trim() || null,
  };

  try {
    const booking = await apiRequest("/api/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    closeGuestBooking();
    selectedRoom = null;
    guestBookingForm.reset();
    lastBooking = booking;
    renderBookingSuccess();
    openModal(bookingSuccessModal, document.querySelector("#copyBookingCode"));
    try {
      const params = new URLSearchParams({ check_in: checkin.value, check_out: checkout.value, guests: String(guestCount()) });
      renderAvailability(await apiRequest(`/api/room-availability?${params.toString()}`));
    } catch (refreshError) {
      console.info("Không thể làm mới danh sách phòng sau khi đặt:", refreshError.message);
    }
  } catch (error) {
    guestBookingError.textContent = error.message;
  } finally {
    guestBookingSubmit.disabled = false;
    guestBookingSubmit.textContent = t("home.gb.submit");
  }
}

guestBookingForm.addEventListener("submit", submitGuestBooking);

const closeBookingSuccess = () => closeModal(bookingSuccessModal);
document.querySelector("#bookingSuccessClose").addEventListener("click", closeBookingSuccess);
document.querySelector("#bookingSuccessDone").addEventListener("click", closeBookingSuccess);
bookingSuccessModal.addEventListener("click", event => {
  if (event.target === bookingSuccessModal) closeBookingSuccess();
});

async function copyCode(code) {
  try {
    await navigator.clipboard.writeText(code);
    notify(t("common.copied"));
  } catch {
    notify(t("common.copyFailed"));
  }
}

document.querySelector("#copyBookingCode").addEventListener("click", () => {
  copyCode(document.querySelector("#successBookingCode").textContent);
});

// ===== Tra cứu đặt phòng =====
const BOOKING_STATUSES = ["pending", "confirmed", "rejected", "cancelled", "checked_in", "checked_out"];
let lastLookup = null;

function renderBookingCard(booking) {
  const status = String(booking.status || "").toLowerCase();
  const safeStatus = BOOKING_STATUSES.includes(status) ? status : "unknown";
  const services = Number(booking.service_total || 0);
  const nights = Number(booking.nights);
  const stayKey = nights === 1 ? "home.lookup.stayValueOne" : "home.lookup.stayValue";
  return `
    <article class="lookup-booking-card ${safeStatus}">
      <div class="lookup-result-heading">
        <div>
          <small>${escapeHtml(t("home.bookingCode"))}</small>
          <h3 class="lookup-code">${escapeHtml(booking.booking_code)}</h3>
        </div>
        <span class="status-badge ${safeStatus}">${escapeHtml(t(`status.${safeStatus}`))}</span>
      </div>
      <button type="button" class="lookup-copy" data-copy-code="${escapeHtml(booking.booking_code)}">${escapeHtml(t("home.copyCode"))}</button>
      <dl class="lookup-detail-grid">
        <div><dt>${escapeHtml(t("home.lookup.room"))}</dt><dd>${booking.room_number ? escapeHtml(t("home.lookup.roomNumber", { n: booking.room_number })) : ""}${escapeHtml(I18N.roomTypeName(booking.room_type))}${booking.room_number ? "" : `<small class="lookup-hint">${escapeHtml(t("home.lookup.roomHint"))}</small>`}</dd></div>
        <div><dt>${escapeHtml(t("home.lookup.stay"))}</dt><dd>${escapeHtml(t(stayKey, { from: I18N.date(booking.check_in) || "—", to: I18N.date(booking.check_out) || "—", n: nights }))}</dd></div>
        <div><dt>${escapeHtml(t("home.lookup.booker"))}</dt><dd>${escapeHtml(booking.customer_name)}</dd></div>
        <div><dt>${escapeHtml(t("home.lookup.guests"))}</dt><dd>${escapeHtml(t("home.lookup.guestsValue", { n: Number(booking.guests) }))}</dd></div>
      </dl>
      <dl class="lookup-money">
        <dt>${escapeHtml(t("home.lookup.roomTotal"))}</dt><dd>${formatPrice(booking.room_total)}</dd>
        <dt>${escapeHtml(t("home.lookup.services"))}</dt><dd>${services ? formatPrice(services) : escapeHtml(t("home.lookup.noServices"))}</dd>
        <dt class="lookup-money-total">${escapeHtml(t("home.lookup.total"))}</dt><dd class="lookup-money-total">${formatPrice(booking.grand_total)}</dd>
        ${Number(booking.deposit_paid) ? `
          <dt>${escapeHtml(t("home.lookup.deposit"))}</dt><dd>− ${formatPrice(booking.deposit_paid)}</dd>
          <dt class="lookup-money-due">${escapeHtml(t("home.lookup.due"))}</dt><dd class="lookup-money-due">${formatPrice(booking.amount_due)}</dd>` : ""}
      </dl>
      ${status === "checked_in"
        ? `<button class="gold-btn lookup-service-btn" type="button" data-open-room-service="${escapeHtml(booking.booking_code)}">${escapeHtml(t("home.lookup.openService"))}</button>`
        : ""}
      ${BOOKING_STATUSES.includes(status) ? `<p class="lookup-result-footnote">${escapeHtml(t(`home.lookup.note.${status}`))}</p>` : ""}
    </article>`;
}

function renderBookingLookup(bookings) {
  lastLookup = bookings;
  bookingLookupResult.innerHTML = `
    <p class="lookup-count">${escapeHtml(bookings.length === 1 ? t("home.lookup.one") : t("home.lookup.many", { n: bookings.length }))}</p>
    ${bookings.map(renderBookingCard).join("")}`;
  bookingLookupResult.hidden = false;
}

bookingLookupForm.addEventListener("submit", async event => {
  event.preventDefault();
  bookingLookupError.textContent = "";
  bookingLookupResult.hidden = true;
  bookingLookupResult.innerHTML = "";
  lastLookup = null;

  const phone = bookingLookupPhone.value.trim();
  if ((phone.match(/\d/g) || []).length < 8) {
    bookingLookupError.textContent = t("home.invalidPhone");
    return;
  }

  bookingLookupSubmit.disabled = true;
  bookingLookupSubmit.textContent = t("home.lookup.loading");
  try {
    const bookings = await apiRequest("/api/bookings/lookup-by-phone", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
    renderBookingLookup(bookings);
    bookingLookupResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } catch (error) {
    bookingLookupError.textContent = error.message;
  } finally {
    bookingLookupSubmit.disabled = false;
    bookingLookupSubmit.textContent = t("home.lookup.submit");
  }
});

bookingLookupResult.addEventListener("click", async event => {
  const copy = event.target.closest("[data-copy-code]");
  if (copy) { copyCode(copy.dataset.copyCode); return; }
  // Nút "Mở dịch vụ phòng" trong kết quả tra cứu đơn dùng mã đặt phòng
  const button = event.target.closest("[data-open-room-service]");
  if (!button) return;
  try {
    await enterRoomService({ booking_code: button.dataset.openRoomService });
  } catch (error) {
    notify(error.message);
  }
});

// ===== Dịch vụ phòng: khách nhập số điện thoại người đặt phòng =====
const roomServiceForm = document.querySelector("#roomServiceForm");
const roomServiceError = document.querySelector("#roomServiceError");
const roomServiceSubmit = document.querySelector("#roomServiceSubmit");
const roomServiceChoices = document.querySelector("#roomServiceChoices");
const roomServiceChoiceList = document.querySelector("#roomServiceChoiceList");
const GUEST_TOKEN_KEY = "gv_guest_token";
let pendingStays = [];

function openRoomServiceStay(stay) {
  sessionStorage.setItem(GUEST_TOKEN_KEY, stay.token);
  window.location.href = "/dich-vu.html";
}

function renderStayChoices() {
  roomServiceChoiceList.innerHTML = pendingStays.map((stay, index) => `
    <button type="button" class="secondary-button" data-stay-index="${index}">
      ${escapeHtml(t("home.rs.roomButton", { n: stay.room_number }))}<small>${escapeHtml(I18N.roomTypeName(stay.room_type))}</small>
    </button>`).join("");
}

async function enterRoomService(credentials) {
  const result = await apiRequest("/api/guest/service-session", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  if (result.stays.length === 1) {
    openRoomServiceStay(result.stays[0]);
    return;
  }
  pendingStays = result.stays;
  renderStayChoices();
  roomServiceChoices.hidden = false;
}

roomServiceForm.addEventListener("submit", async event => {
  event.preventDefault();
  roomServiceError.textContent = "";
  roomServiceChoices.hidden = true;
  const phone = document.querySelector("#roomServicePhone").value.trim();
  if ((phone.match(/\d/g) || []).length < 8) {
    roomServiceError.textContent = t("home.invalidPhone");
    return;
  }
  roomServiceSubmit.disabled = true;
  roomServiceSubmit.textContent = t("home.rs.loading");
  try {
    await enterRoomService({ phone });
  } catch (error) {
    roomServiceError.textContent = error.message;
    // Khách đã đặt nhưng chưa nhận phòng: gợi ý xem trước dịch vụ thay vì để ngõ cụt
    if (error.status === 403) {
      roomServiceError.append(" ");
      const link = document.createElement("a");
      link.href = "/dich-vu.html";
      link.textContent = t("home.rs.preview");
      roomServiceError.append(link);
    }
  } finally {
    roomServiceSubmit.disabled = false;
    roomServiceSubmit.textContent = t("home.rs.submit");
  }
});

roomServiceChoiceList.addEventListener("click", event => {
  const button = event.target.closest("[data-stay-index]");
  if (button) openRoomServiceStay(pendingStays[Number(button.dataset.stayIndex)]);
});

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  if (!roomTypeModal.hidden) closeRoomTypeDetail();
  if (!authModal.hidden) closeStaffLogin();
  if (!guestBookingModal.hidden) closeGuestBooking();
  if (!bookingSuccessModal.hidden) closeBookingSuccess();
  if (nav.classList.contains("open")) { setMenuOpen(false); menuToggle.focus(); }
});

function updateAccountButton() {
  accountBtn.textContent = t(currentUser ? "home.openManagement" : "home.staffLogin");
  accountBtn.title = currentUser ? `${currentUser.full_name} (${currentUser.role})` : t("home.staffLoginTitle");
}

async function restoreSession() {
  if (!sessionStorage.getItem("hotel_access_token")) return;
  try {
    currentUser = await apiRequest("/api/auth/me");
    if (["admin", "receptionist"].includes(currentUser.role)) {
      window.location.replace("/management.html");
      return;
    }
    sessionStorage.removeItem("hotel_access_token");
    currentUser = null;
  } catch {
    sessionStorage.removeItem("hotel_access_token");
    currentUser = null;
  }
  updateAccountButton();
}

// ===== Đổi ngôn ngữ: vẽ lại mọi phần do JavaScript tạo =====
function renderLanguage() {
  updateAccountButton();
  setMenuOpen(nav.classList.contains("open"));
  rerenderRooms();
  renderServicePrices();
  if (!roomTypeModal.hidden) renderRoomTypeDetail();
  if (!guestBookingModal.hidden) renderGuestBookingSummary();
  renderBookingSuccess();
  if (lastLookup) renderBookingLookup(lastLookup);
  if (pendingStays.length) renderStayChoices();
  bookingLookupSubmit.textContent = t(bookingLookupSubmit.disabled ? "home.lookup.loading" : "home.lookup.submit");
  roomServiceSubmit.textContent = t(roomServiceSubmit.disabled ? "home.rs.loading" : "home.rs.submit");
}

document.addEventListener("gv:langchange", renderLanguage);

I18N.apply();
renderLanguage();
restoreSession().finally(() => { loadRooms(); loadServicePrices(); });
