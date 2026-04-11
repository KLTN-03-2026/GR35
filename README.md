<div align="center">
  <img src="https://img.icons8.com/color/120/000000/air-quality.png" alt="Logo" width="120" height="120">

  # 🌬️ Air Quality Monitoring System
  
  **Hệ thống theo dõi và cảnh báo chất lượng không khí**

  [![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)](#)
  [![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](#)
  [![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](#)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

</div>

<br />

## 📖 Giới thiệu (About The Project)

Dự án Hệ thống Theo dõi Chất lượng Không khí được phát triển với mục đích cung cấp thông tin theo thời gian thực về chỉ số chất lượng không khí (AQI), đưa ra các cảnh báo sớm thông qua nền tảng Web. 

## ✨ Tính năng nổi bật (Features)

- **Theo dõi thời gian thực:** Cập nhật dữ liệu AQI liên tục từ các trạm đo.
- **Trực quan hóa dữ liệu:** Hiển thị bản đồ phân bố và biểu đồ biến động chất lượng không khí.
- **Cảnh báo thông minh:** Hệ thống gửi thông báo/cảnh báo khi chỉ số AQI vượt mức an toàn.
- **Tích hợp Zalo OA:** Gửi cảnh báo trực tiếp đến người dùng qua Zalo.

---

## 🛠️ Kiến trúc Công nghệ (Tech Stack)

### Backend (ASP.NET Core Web API)
- **Framework:** .NET 8 / C#
- **ORM:** Entity Framework Core (Code-First)
- **Database:** Microsoft SQL Server
- **Caching & Tối ưu:** Redis Cache (Cache-Aside pattern)
- **Xử lý tác vụ ngầm:** C# BackgroundService / Hangfire

### Frontend (React SPA)
- **Build Tool:** Vite (Hot Module Replacement)
- **Quản lý Trạng thái:** Zustand (Client State) + TanStack Query v5 (Server State)
- **UI Framework:** Material-UI (MUI) v5
- **Thư viện tích hợp:** `react-leaflet` (Bản đồ), `recharts` (Biểu đồ), `axios`

---

## 🚀 Hướng dẫn Cài đặt (Installation & Setup)

Dự án được cấu trúc theo dạng Decoupled (Tách rời Front/Back) trong cùng một Solution của Visual Studio 2022.

### 1. Yêu cầu hệ thống (Prerequisites)
- [Node.js](https://nodejs.org/) (Phiên bản 18.x hoặc 20.x LTS)
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- SQL Server & SQL Server Management Studio (SSMS)
- Visual Studio 2022 (Khuyên dùng)

### 2. Cấu hình Backend (ASP.NET Core)
1. Mở file `AirQuality.sln` bằng Visual Studio 2022.
2. Mở file `AirQuality.Server/appsettings.json`. Cập nhật chuỗi kết nối Database và các API Key (WAQI, Zalo OA):
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=AirQualityDB;Trusted_Connection=True;TrustServerCertificate=True;"
   },
   "ApiKeys": {
     "WaqiToken": "YOUR_WAQI_TOKEN_HERE"
   }
   ```
3. Mở **Package Manager Console** (Tools > NuGet Package Manager), đặt Default Project là `AirQuality.Server` và chạy lệnh cập nhật CSDL:
   ```bash
   Update-Database
   ```

### 3. Cài đặt Frontend (React/Vite)
1. Trong Visual Studio, chuột phải vào project `airquality.client` -> Chọn **Open in Terminal**.
2. Chạy lệnh cài đặt các gói thư viện Node:
   ```bash
   npm install
   ```
3. Cấp quyền chứng chỉ SSL cục bộ để trình duyệt không chặn kết nối API (Quan trọng):
   ```bash
   dotnet dev-certs https --trust
   ```

### 4. Khởi chạy Hệ thống
- Chỉ cần bấm nút **Start (F5)** trên Visual Studio 2022.
- Hệ thống sẽ tự động build Backend, khởi chạy Proxy và mở trình duyệt web tại `http://localhost:5173`.

---

## 📝 Giấy phép (License)
Dự án được phân phối dưới giấy phép MIT. Xem file `LICENSE.txt` để biết thêm chi tiết.
