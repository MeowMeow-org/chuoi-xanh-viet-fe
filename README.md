# Chuỗi Xanh Việt — Frontend (Web)

Ứng dụng web **Next.js 16** (App Router), TypeScript, Tailwind, React Query, Zustand — phục vụ **người mua**, **nông dân**, **hợp tác xã**, **quản trị** (đăng nhập theo vai trò). Giao tiếp với backend qua REST; có **Socket.IO client** cho chat.

---

## 1. Điều kiện trước khi bắt đầu

| Yêu cầu | Chi tiết |
|---------|----------|
| **Node.js** | Khuyến nghị **20 LTS** trở lên (`node -v`) |
| **npm** | Đi kèm Node (`npm -v`) |
| **Backend** | API phải chạy và có prefix **`/v1/api`** — xem [README backend](../chuoi-xanh-viet-be/README.md) |

---

## 2. Lấy mã nguồn và vào đúng thư mục

```bash
cd chuoi-xanh-viet-fe
```

(Nếu clone riêng repo frontend, `cd` vào thư mục tương ứng sau `git clone`.)

---

## 3. Tạo file `.env`

1. Trong thư mục `chuoi-xanh-viet-fe`, tìm **`.env.example`**.
2. **Sao chép** thành file **`.env`** (cùng cấp với `package.json`).

### Biến bắt buộc

| Biến | Ý nghĩa |
|------|---------|
| `NEXT_PUBLIC_API_URL` | URL gốc của API, **phải kèm** đường dẫn `/v1/api` |

**Ví dụ** khi backend chạy trên máy bạn tại cổng **8000**:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/v1/api
```

- Nếu backend dùng cổng khác (ví dụ `8888`), đổi cho khớp: `http://localhost:8888/v1/api`.
- **Không** thêm dấu `/` ở cuối (tránh lỗi nối đường dẫn).

Next.js chỉ đọc biến bắt đầu bằng `NEXT_PUBLIC_` ở **phía client**; sau khi sửa `.env` cần **khởi động lại** `npm run dev`.

---

## 4. Cài dependency

```bash
npm install
```

---

## 5. Chạy chế độ phát triển

```bash
npm run dev
```

Mở trình duyệt: **[http://localhost:3000](http://localhost:3000)** (Next.js mặc định cổng 3000; nếu cổng bận, terminal sẽ đề xuất cổng khác).

**Kiểm tra nhanh**

- Trang chủ / đăng nhập tải được.
- Mở DevTools → Network: request API tới đúng host trong `NEXT_PUBLIC_API_URL`.

---

## 6. Các lệnh npm hữu ích

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Dev server, hot reload |
| `npm run build` | Build production (`next build`) |
| `npm run start` | Chạy bản đã build: `next start` (cần `build` trước) |
| `npm run lint` | ESLint |

---

## 7. Production (tóm tắt)

1. Set `NEXT_PUBLIC_API_URL` trỏ tới API **production** (HTTPS, đúng `/v1/api`).
2. `npm run build` rồi `npm run start` (hoặc deploy lên Netlify/Vercel — tuỳ cấu hình team).

---

## 8. Gỡ lỗi thường gặp

| Hiện tượng | Hướng xử lý |
|------------|-------------|
| Trang load nhưng mọi API fail / network error | Backend chưa chạy, sai cổng, hoặc `NEXT_PUBLIC_API_URL` thiếu `/v1/api` |
| CORS | Cấu hình backend: `NODE_ENV=development` hoặc `FRONTEND_URL` / `CORS_ORIGIN` đúng origin (ví dụ `http://localhost:3000`) — xem README backend |
| Sửa `.env` mà không thấy đổi | Restart `npm run dev` |
| Gọi API từ máy khác trong LAN | Dùng IP máy chạy API trong `NEXT_PUBLIC_API_URL` (ví dụ `http://192.168.1.10:8000/v1/api`) và đảm bảo backend cho phép origin đó |

---

## 9. Cấu trúc thư mục (tham khảo)

- `app/` — App Router (route, layout, page)
- `components/` — UI dùng chung
- `services/` — Gọi API (axios)
- `lib/axios.ts` — axios instance + interceptors (token, refresh)
- `store/` — Zustand (auth, v.v.)

---

## 10. Tài liệu API

Swagger của backend (khi server đang chạy): ví dụ **`http://localhost:8000/api-docs`** — thay cổng theo `PORT` của bạn.

---

*Dự án phục vụ mục đích học tập / WDU (theo ghi chú team).*
