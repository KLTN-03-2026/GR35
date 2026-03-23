# Yêu cầu sinh Model Entity Framework Core (Code-First)

[cite_start]Hệ quản trị CSDL: Microsoft SQL Server[cite: 29].
[cite_start]Mô hình: Relational Database (3NF)[cite: 30].
Yêu cầu: Sinh các lớp (class) C# mô tả các thực thể (Entities) dưới đây. [cite_start]Vui lòng thêm đầy đủ Data Annotations (như `[Key]`, `[Required]`, `[MaxLength]`, `[Table]`) và cấu hình Navigation Properties cho các quan hệ (Relationships)[cite: 32].

## [cite_start]1. Bảng Roles (Phân quyền) [cite: 54]
* [cite_start]`role_id` (int): Khóa chính, tự động tăng[cite: 55].
* [cite_start]`role_name` (varchar 100): Bắt buộc[cite: 55].
* [cite_start]`description` (varchar 255): Có thể null[cite: 55].

## [cite_start]2. Bảng NotificationPlatforms (Nền tảng nhận thông báo) [cite: 56]
* [cite_start]`platform_id` (int): Khóa chính, tự động tăng[cite: 57].
* [cite_start]`platform_name` (varchar 100): Bắt buộc[cite: 57].
* [cite_start]`api_config` (text): Có thể null[cite: 57].

## [cite_start]3. Bảng AQICategories (Danh mục AQI) [cite: 58]
* [cite_start]`category_id` (int): Khóa chính, tự động tăng[cite: 59].
* [cite_start]`min_aqi` (int): Bắt buộc[cite: 59].
* [cite_start]`max_aqi` (int): Bắt buộc[cite: 59].
* [cite_start]`level_name` (varchar 100): Bắt buộc[cite: 59].
* [cite_start]`color_code` (varchar 20): Bắt buộc[cite: 59].
* [cite_start]`health_recommendation` (text): Có thể null[cite: 59].

## [cite_start]4. Bảng Users (Người dùng) [cite: 60]
* [cite_start]`user_id` (int): Khóa chính, tự động tăng[cite: 61].
* [cite_start]`full_name` (varchar 150): Bắt buộc[cite: 61].
* [cite_start]`email` (varchar 255): Bắt buộc[cite: 61].
* [cite_start]`password_hash` (varchar 255): Bắt buộc[cite: 61].
* [cite_start]`status` (int): Bắt buộc, mặc định là 1[cite: 61].
* [cite_start]`created_at` (datetime): Bắt buộc[cite: 61].
* [cite_start]`last_login` (datetime): Có thể null[cite: 61].
* [cite_start]`role_id` (int): Khóa ngoại liên kết tới bảng `Roles`[cite: 61].
* [cite_start]*Lưu ý: Bổ sung thêm trường `heal_condition` (varchar) có thể null theo lược đồ thực tế*[cite: 40].

## 5. Bảng UserLinkedAccounts (Tài khoản liên kết) [cite: 62]
* [cite_start]`link_id` (int): Khóa chính, tự động tăng[cite: 63].
* [cite_start]`external_account_id` (varchar 150): Bắt buộc[cite: 63].
* [cite_start]`linked_at` (datetime): Bắt buộc[cite: 63].
* [cite_start]`user_id` (int): Khóa ngoại liên kết tới bảng `Users`[cite: 63].
* [cite_start]`platform_id` (int): Khóa ngoại liên kết tới bảng `NotificationPlatforms`[cite: 63].

## [cite_start]6. Bảng Stations (Trạm quan trắc) [cite: 64]
* [cite_start]`station_id` (int): Khóa chính, tự động tăng[cite: 65].
* [cite_start]`station_name` (varchar 150): Bắt buộc[cite: 65].
* [cite_start]`latitude` (decimal 10,6): Bắt buộc[cite: 65].
* [cite_start]`longitude` (decimal 10,6): Bắt buộc[cite: 65].
* [cite_start]`is_active` (int): Bắt buộc, mặc định là 1[cite: 65].
* [cite_start]`provider` (varchar 100): Bắt buộc[cite: 65].
* [cite_start]`city` (varchar 50): Bắt buộc[cite: 69, 70, 71].

## [cite_start]7. Bảng UserFavoriteStations (Trạm yêu thích của người dùng) [cite: 74]
* [cite_start]`user_id` (int): Khóa chính & Khóa ngoại tới `Users`[cite: 75].
* [cite_start]`station_id` (int): Khóa chính & Khóa ngoại tới `Stations`[cite: 75].
* [cite_start]`added_at` (datetime): Bắt buộc[cite: 75].

## [cite_start]8. Bảng AirQualityObservations (Dữ liệu quan trắc) [cite: 76]
* [cite_start]`observation_id` (int): Khóa chính, tự động tăng[cite: 77].
* [cite_start]`timestamp` (datetime): Bắt buộc[cite: 77].
* [cite_start]`pm25` (float): Có thể null[cite: 77].
* [cite_start]`pm10` (float): Có thể null[cite: 77].
* [cite_start]`co` (float): Có thể null[cite: 77].
* [cite_start]`no2` (float): Có thể null[cite: 77].
* [cite_start]`so2` (float): Có thể null[cite: 77].
* [cite_start]`o3` (float): Có thể null[cite: 77].
* [cite_start]`temperature` (float): Có thể null[cite: 77].
* [cite_start]`humidity` (float): Có thể null[cite: 77].
* [cite_start]`wind_speed` (float): Có thể null[cite: 77].
* [cite_start]`pressure` (float): Có thể null[cite: 77].
* [cite_start]`calculated_aqi` (int): Có thể null[cite: 77].
* [cite_start]`is_valid` (int): Bắt buộc, mặc định 1[cite: 77].
* [cite_start]`is_imputed` (int): Bắt buộc, mặc định 0[cite: 77].
* [cite_start]`station_id` (int): Khóa ngoại tới `Stations`[cite: 77].

## [cite_start]9. Bảng AIModels (Mô hình AI) [cite: 78]
* [cite_start]`model_id` (int): Khóa chính, tự động tăng[cite: 79].
* [cite_start]`model_name` (varchar 150): Bắt buộc[cite: 79].
* [cite_start]`version` (varchar 150): Bắt buộc[cite: 79].
* [cite_start]`hyperparameters` (text): Có thể null[cite: 79].
* [cite_start]`is_active` (int): Bắt buộc, mặc định 1[cite: 79].
* [cite_start]`updated_at` (datetime): Có thể null[cite: 79].

## [cite_start]10. Bảng ModelEvaluations (Đánh giá mô hình) [cite: 83]
* [cite_start]`evaluation_id` (int): Khóa chính, tự động tăng[cite: 84].
* [cite_start]`rmse` (float): Có thể null[cite: 84].
* [cite_start]`mae` (float): Có thể null[cite: 84].
* [cite_start]`r2_score` (float): Có thể null[cite: 84].
* [cite_start]`mape` (float): Có thể null, mặc định 1[cite: 84].
* [cite_start]`evaluated_at` (datetime): Có thể null[cite: 84].
* [cite_start]`model_id` (int): Khóa ngoại tới `AIModels`[cite: 87, 88, 89, 90].

## [cite_start]11. Bảng ForecastData (Dữ liệu dự báo) [cite: 92]
* [cite_start]`forecast_id` (int): Khóa chính, tự động tăng[cite: 93].
* [cite_start]`generated_at` (datetime): Bắt buộc[cite: 93].
* [cite_start]`target_time` (datetime): Bắt buộc[cite: 93].
* [cite_start]`predicted_aqi` (int): Có thể null[cite: 93].
* [cite_start]`predicted_pm25` (float): Có thể null[cite: 93].
* [cite_start]`confidence_interval` (varchar 50): Có thể null[cite: 93].
* [cite_start]`station_id` (int): Khóa ngoại tới `Stations`[cite: 96, 97, 98, 99].
* [cite_start]`model_id` (int): Khóa ngoại tới `AIModels`[cite: 101, 102, 103, 104].

## [cite_start]12. Bảng AlertConfigs (Cấu hình cảnh báo) [cite: 106]
* [cite_start]`config_id` (int): Khóa chính, tự động tăng[cite: 107].
* [cite_start]`aqi_threshold` (int): Bắt buộc[cite: 107].
* [cite_start]`is_active` (int): Bắt buộc, mặc định 1[cite: 107].
* [cite_start]`user_id` (int): Khóa ngoại tới `Users`[cite: 107].
* [cite_start]`station_id` (int): Khóa ngoại tới `Stations`[cite: 107].
* [cite_start]`platform_id` (int): Khóa ngoại tới `NotificationPlatforms`[cite: 107].

## [cite_start]13. Bảng NotificationHistory (Lịch sử cảnh báo) [cite: 110]
* [cite_start]`notification_id` (int): Khóa chính, tự động tăng[cite: 111].
* [cite_start]`message_content` (text): Bắt buộc[cite: 111].
* [cite_start]`sent_at` (datetime): Bắt buộc[cite: 111].
* [cite_start]`status` (varchar 50): Bắt buộc[cite: 111].
* [cite_start]`user_id` (int): Khóa ngoại tới `Users`[cite: 111].
* [cite_start]`platform_id` (int): Khóa ngoại tới `NotificationPlatforms`[cite: 111].

## [cite_start]14. Bảng AuditLogs (Nhật ký hệ thống) [cite: 112]
* [cite_start]`log_id` (int): Khóa chính, tự động tăng[cite: 113].
* [cite_start]`ip_address` (varchar 50): Bắt buộc[cite: 113].
* [cite_start]`timestamp` (datetime): Bắt buộc[cite: 113].
* [cite_start]`user_id` (int): Khóa ngoại tới `Users`[cite: 113].
* [cite_start]`action_type_id` (int): Khóa ngoại tới bảng `ActionTypes` (bảng này có `action_type_id` làm khóa chính theo sơ đồ ERD)[cite: 113, 118].

## [cite_start]15. Bảng AffiliateProducts (Sản phẩm tiếp thị) [cite: 114]
* [cite_start]`product_id` (int): Khóa chính, tự động tăng[cite: 115].
* [cite_start]`product_name` (nvarchar 200): Bắt buộc[cite: 115].
* [cite_start]`image_url` (varchar 500): Có thể null[cite: 115].
* [cite_start]`affiliate_url` (varchar 500): Bắt buộc[cite: 115].
* [cite_start]`category` (varchar 50): Bắt buộc[cite: 115].
* [cite_start]`min_aqi_trigger` (int): Bắt buộc, mặc định 100[cite: 115].
* [cite_start]`target_health_condition` (varchar 50): Có thể null, mặc định 'All'[cite: 115].

## [cite_start]16. Bảng CommunityReports (Báo cáo cộng đồng) [cite: 116]
* [cite_start]`report_id` (bigint): Khóa chính, tự động tăng[cite: 117].
* [cite_start]`latitude` (float): Bắt buộc[cite: 117].
* [cite_start]`longitude` (float): Bắt buộc[cite: 117].
* [cite_start]`image_url` (varchar 500): Có thể null[cite: 117].
* [cite_start]`description` (nvarchar 1000): Bắt buộc[cite: 117].
* [cite_start]`report_time` (datetime): Bắt buộc, mặc định là thời gian hiện tại[cite: 117].
* [cite_start]`upvotes` (int): Bắt buộc, mặc định 0[cite: 117].
* [cite_start]`status` (varchar 50): Bắt buộc, mặc định 'Pending'[cite: 117].
* [cite_start]`user_id` (int): Khóa ngoại tới `Users`[cite: 117].