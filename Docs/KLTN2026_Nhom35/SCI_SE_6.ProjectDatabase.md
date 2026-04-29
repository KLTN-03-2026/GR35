# 2. THIẾT KẾ CƠ SỞ DỮ LIỆU

## 2.1. Lược đồ cơ sở dữ liệu

Khóa chính được gạch dưới, khóa ngoại được bôi đen

- Roles (<u>role_id</u>, role_name, description): Dùng để chứa danh mục các quyền của hệ thống (Super Admin, Admin, Member, ...)
- ActionTypes (<u>action_type_id</u>): Dùng để chứa các loại thao tác để log lịch sử hệ thống
- Users (<u>user_id</u>, full_name, email, password_hash, status, created_at, last_login, heal_condition, subscription_tier, subscription_started_at, subscription_expires_at, **role_id**): Dùng để chứa thông tin chi tiết về tài khoản người dùng và quản trị viên trong hệ thống
- ApiKeys (<u>api_key_id</u>, project_name, key_value, created_at, expires_at, calls_used, **user_id**): Dùng để cung cấp chìa khóa API cho Developer / Third-party truy xuất thông tin từ nền tảng
- AuditLogs (<u>log_id</u>, ip_address, timestamp, **user_id**, **action_type_id**): Dùng để ghi lại phân tích truy vết thao tác và lịch sử của người dùng
- Contacts (<u>id</u>, full_name, email, subject, message, status, created_at, updated_at, replied_by_admin_id): Dùng để lưu lại đơn liên hệ, góp ý, hoặc yêu cầu hỗ trợ từ khách vãng lai và người dùng hệ thống
- Cities (<u>city_id</u>, province_name, slug, latitude, longitude, region, is_active): Dùng để lưu thông tin về các Tỉnh/Thành phố hiện hành
- CityAirQualitySnapshots (<u>snapshot_id</u>, timestamp, temperature, feels_like, humidity, pressure, wind_speed, wind_deg, cloud_cover, visibility, weather_main, weather_description, weather_icon, pm25, pm10, co, no2, so2, o3, nh3, aqi_pm25, aqi_pm10, aqi_co, aqi_no2, aqi_so2, aqi_o3, calculated_aqi, **city_id**): Dùng để lưu trữ toàn cảnh thông số lịch sử thời tiết và tổng hợp không khí của mọi thành phố
- Stations (<u>station_id</u>, station_name, latitude, longitude, is_active, provider, city): Dùng để chứa thông tin chi tiết và tọa độ định vị của các trạm đo chất lượng không khí
- AirQualityObservations (<u>observation_id</u>, timestamp, pm25, pm10, co, no2, so2, o3, temperature, humidity, wind_speed, wind_deg, pressure, calculated_aqi, is_valid, is_imputed, **station_id**): Dùng để lưu trữ kết quả dữ liệu thời tiết và chất lượng không khí chi tiết theo thời gian thực tại các trạm
- AQICategories (<u>category_id</u>, min_aqi, max_aqi, level_name, color_code, health_recommendation): Dùng để chứa các mốc chuẩn AQI, mã màu hiển thị và các khuyến nghị sức khỏe tương ứng
- UserFavoriteStations (<u>**user_id**</u>, <u>**station_id**</u>, added_at): Dùng để lưu danh sách các trạm quan trắc yêu thích của người dùng để cập nhật màn hình Home
- UserFavoriteCities (<u>**user_id**</u>, <u>**city_id**</u>, added_at): Dùng để lưu danh sách các thành phố theo dõi nhanh yêu thích của người dùng để tiện tra cứu
- CommunityReports (<u>report_id</u>, latitude, longitude, image_url, description, report_time, upvotes, status, report_type, expires_at, reject_reason, **user_id**): Dùng để quản lý các báo cáo về sự cố ô nhiễm từ cộng đồng
- AIModels (<u>model_id</u>, model_name, version, hyperparameters, is_active, updated_at): Dùng để quản lý, cấu hình tên miền hệ thống mô hình dự báo AI
- ModelEvaluations (<u>evaluation_id</u>, rmse, mae, r2_score, mape, evaluated_at, **model_id**): Dùng để lưu trữ kết quả đánh giá độ tin cậy và sai số của mô hình học máy
- ForecastData (<u>forecast_id</u>, generated_at, target_time, predicted_aqi, predicted_pm25, confidence_interval, **station_id**, **model_id**): Dùng để chứa dữ liệu suy luận chỉ số không khí trong khung thời gian tương lai lấy từ machine learning
- AffiliateProducts (<u>product_id</u>, product_name, image_url, affiliate_url, category, min_aqi_trigger, target_health_condition): Dùng để lưu liên kết sản phẩm, đề xuất khuyến mãi chăm sóc khi chỉ số không khí đi xuống
- SubscriptionPayments (<u>payment_id</u>, provider, txn_ref, amount_vnd, status, gateway_transaction_no, bank_code, raw_response, created_at, paid_at, **user_id**): Dùng để quản lý các giao dịch thanh toán từ hoạt động mua gói trả phí của người dùng
- NotificationPlatforms (<u>platform_id</u>, platform_name, api_config): Dùng để chứa thông tin các nền tảng thông báo hiện hành
- UserLinkedAccounts (<u>link_id</u>, external_account_id, linked_at, **user_id**, **platform_id**): Dùng để chứa thông tin các tài khoản mạng xã hội mà người dùng đã liên kết để nhận thông báo
- AlertConfigs (<u>config_id</u>, aqi_threshold, is_active, **user_id**, **station_id**, **platform_id**): Dùng để chứa cấu hình ngữ cảnh ngưỡng AQI giới hạn kích hoạt thông báo tự động cho từng User
- NotificationHistories (<u>notification_id</u>, message_content, sent_at, status, **user_id**, **platform_id**): Dùng để tracking lịch sử và content SMS/Email mà App đã ngầm vận hành đẩy cho User

<br/>

## 2.2. Thiết kế kiến trúc bảng

-Table Roles : Dùng để chứa danh mục các quyền của hệ thống (Super Admin, Admin, Member, ...)

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| role_id | Int | No | PK | None | auto_increment | Định danh duy nhất cho quyền |
| role_name | Nvarchar | No | | None | | Tên vai trò |
| description | Nvarchar | Yes | | None | | Mô tả chi tiết vai trò |

<br/>

-Table ActionTypes : Dùng để chứa các loại thao tác để log lịch sử hệ thống.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| action_type_id | Int | No | PK | None | auto_increment | Định danh phân loại thao tác duy nhất |

<br/>

-Table Users : Dùng để chứa thông tin chi tiết về tài khoản người dùng và quản trị viên trong hệ thống.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| user_id | Int | No | PK | None | auto_increment | Định danh tài khoản |
| full_name | Nvarchar(150) | No | | None | | Họ và tên đầy đủ |
| email | Nvarchar(255) | No | | None | | Địa chỉ email |
| password_hash | Nvarchar(255) | No | | None | | Chuỗi băm mật khẩu |
| status | Int | No | | 1 | | Trạng thái (Active/Blocked) |
| created_at | Datetime2 | No | | None | | Thời gian tạo tài khoản |
| last_login | Datetime2 | Yes | | None | | Lần cuối truy cập đăng nhập |
| heal_condition | Nvarchar(255) | Yes | | None | | Chi tiết tình trạng sức khoẻ cá nhân |
| role_id | Int | No | FK | None | | Khoá ngoại định vị quyền hạn (Roles) |
| subscription_tier| Nvarchar(20) | No | | "Free" | | Hạng mức gói cước (Free / Pro) |
| subscription_started_at| Datetime2 | Yes | | None | | Thời điểm gia hạn gói cước |
| subscription_expires_at| Datetime2 | Yes | | None | | Ngày dự kiến hết hạn dịch vụ |

<br/>

-Table ApiKeys : Dùng để cung cấp chìa khóa API cho Developer truy xuất dữ liệu ngoài nền tảng.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| api_key_id | Int | No | PK | None | auto_increment | ID gốc định danh Key cấp phát |
| user_id | Int | No | FK | None | | Nhà phát triển sở hữu |
| project_name | Nvarchar(100) | No | | None | | Tên dự án ngoại vi tích hợp lấy API |
| key_value | Nvarchar | No | | None | | Chuỗi API Key bí mật cấp ra |
| created_at | Datetime2 | No | | None | | Thời điểm đăng ký API |
| expires_at | Datetime2 | No | | None | | Hạn sử dụng của key |
| calls_used | Int | No | | 0 | | Số lượt Request gọi đã consume |

<br/>

-Table AuditLogs : Dùng để ghi lại phân tích truy vết thao tác và lịch sử của người dùng.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| log_id | Int | No | PK | None | auto_increment | ID gốc quá trình thao tác |
| ip_address | Nvarchar | No | | None | | Địa chỉ IP của client gửi do server bắt |
| timestamp | Datetime2 | No | | None | | Thời gian lưu vết theo System Clock |
| user_id | Int | No | FK | None | | Ref tới tài khoản tạo ra log |
| action_type_id | Int | No | FK | None | | Ref loại thao tác theo danh mục |

<br/>

-Table Contacts : Dùng để cung cấp hệ thống lưu trữ phản hồi biểu mẫu liên hệ hỗ trợ.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| id | UniqueIdentifier | No | PK | None | auto_increment | UUID mã đơn thư liên hệ |
| full_name | Nvarchar(100) | No | | None | | Tên người liên hệ |
| email | Nvarchar(100) | No | | None | | Địa chỉ email để admin phản hồi |
| subject | Nvarchar(200) | No | | None | | Tiêu đề tóm tắt chủ đề |
| message | Nvarchar(1000)| No | | None | | Nội dung text chi tiết góp ý |
| status | Int (Enum) | No | | 0 (Pending) | | Mã định dạng trạng thái Support |
| created_at | Datetime2 | No | | None | | Lần ghi nhận mail vào hòm |
| updated_at | Datetime2 | No | | None | | Thời khắc Admin rep mail cuối |
| replied_by_admin_id | Nvarchar | Yes | | None | | Reference Admin nào xử lý case này |

<br/>

-Table Cities : Dùng để lưu thông tin về các Tỉnh/Thành phố hiện hành.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| city_id | Int | No | PK | None | auto_increment | Mã phân biệt thành phố (Identity) |
| province_name | Nvarchar | No | | None | Index | Tên Tỉnh / Thành bản địa |
| slug | Nvarchar | No | | None | Unique | Slug dẫn URL trên Webapp |
| latitude | Decimal | No | | None | | Tọa độ (Vĩ độ) địa phương |
| longitude | Decimal | No | | None | | Tọa độ (Kinh độ) địa phương |
| region | Nvarchar | Yes | | None | | Vùng lãnh thổ Việt Nam (vd: North) |
| is_active | Int | No | | 1 | | Nếu có sự cố API sẽ Off |

<br/>

-Table CityAirQualitySnapshots : Dùng để lưu trữ toàn cảnh thông số lịch sử thời tiết và tổng hợp không khí của mọi thành phố.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| snapshot_id | Int | No | PK | None | auto_increment | ID khoảnh khắc Snapshot theo JOB |
| timestamp | Datetime2 | No | | None | | Lịch đo trên hệ thống mốc giờ |
| temperature | Float | Yes | | None | | Nền nhiệt hệ C |
| feels_like | Float | Yes | | None | | Độ oi bức cảm nhận người |
| humidity | Float | Yes | | None | | Tỷ lệ giọt nước trong khí (%) |
| pressure | Float | Yes | | None | | Áp suất hPa thông dụng |
| wind_speed | Float | Yes | | None | | Vận tải luồng gió m/s |
| wind_deg | Float | Yes | | None | | Hướng gió thổi bao nhiêu góc độ |
| cloud_cover | Int | Yes | | None | | Kích cỡ rèm mây hiện tại (%) |
| visibility | Int | Yes | | None | | Quang học nhìn tầm xa giới hạn mét |
| weather_main | Nvarchar | Yes | | None | | Keyword định bệnh thời tiết OpenWeather |
| weather_description | Nvarchar | Yes | | None | | Giãi nghĩa khí tượng (Sương mù...) |
| weather_icon | Nvarchar | Yes | | None | | Mã số render ra UX |
| pm25 | Float | Yes | | None | | Dòng bụi PM2.5 rất nguy hiểm |
| pm10 | Float | Yes | | None | | Dòng hạt PM10 hạt trung |
| co | Float | Yes | | None | | Carbon monoxide nồng độ |
| no2 | Float | Yes | | None | | Đi-ô-xít nitơ |
| so2 | Float | Yes | | None | | Sulfur dioxide |
| o3 | Float | Yes | | None | | Ozone khí bạt |
| nh3 | Float | Yes | | None | | Mức Ammoniac amoni |
| aqi_pm25 | Int | Yes | | None | | Áp công thức lấy AQI PM2.5 |
| aqi_pm10 | Int | Yes | | None | | Áp công thức lấy AQI PM10 |
| aqi_co | Int | Yes | | None | | Điểm AQI cấu thành từ CO |
| aqi_no2 | Int | Yes | | None | | AQI điểm sô do tác động NO2 |
| aqi_so2 | Int | Yes | | None | | Khung điểm AQI SO2 chi tiết |
| aqi_o3 | Int | Yes | | None | | Tính quy đổi O3 ra Air Quality Index |
| calculated_aqi | Int | Yes | | None | | Lấy cái bẩn nhất làm chốt AQI |
| city_id | Int | No | FK | None | | Gắn cho TP nào được khảo sát |

<br/>

-Table Stations : Dùng để chứa thông tin chi tiết và tọa độ định vị của các trạm đo chất lượng không khí.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| station_id | Int | No | PK | None | auto_increment | ID phần cứng trạm ghi |
| station_name | Nvarchar | No | | None | Index | Tên cụ thể cắm đặt (vd Bệnh viện Bạch Mai) |
| latitude | Decimal | No | | None | | Trục đứng định vị GPS |
| longitude | Decimal | No | | None | | Trục ngang định vị GPS |
| is_active | Int | No | | 1 | | Có đang live hay đang cúp điện sửa chữa |
| provider | Nvarchar | No | | None | | API / Đối tác cấp dữ liệu này (WAQI) |
| city | Nvarchar | No | | None | Index | Thành phố đang trực thuộc |

<br/>

-Table AirQualityObservations : Dùng để lưu trữ kết quả dữ liệu thời tiết và chất lượng không khí chi tiết theo thời gian thực tại các trạm.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| observation_id | Int | No | PK | None | auto_increment | ID kết quả Sensor ghi vào |
| timestamp | Datetime2 | No | | None | | Khung thời gian bắn JSON lên |
| pm25 | Float | Yes | | None | | Khí thải mịn 2.5 micromet |
| pm10 | Float | Yes | | None | | Khí thô bụi xây dựng PM10 |
| co | Float | Yes | | None | | Lượng CO |
| no2 | Float | Yes | | None | | Oxyde NO2 |
| so2 | Float | Yes | | None | | Hợp chất SO2 |
| o3 | Float | Yes | | None | | Khí O3 |
| temperature | Float | Yes | | None | | Nhiệt độ tại Node Edge trạm đo |
| humidity | Float | Yes | | None | | Phần trăm ẩm sát trạm |
| wind_speed | Float | Yes | | None | | Quạt gió tốc độ sát trạm |
| wind_deg | Float | Yes | | None | | Độ quặt gió trạm đón được |
| pressure | Float | Yes | | None | | Khí áp |
| calculated_aqi | Int | Yes | | None | | Suy ra AQI của riêng Trạm |
| is_valid | Int | No | | 1 | | Nếu Node trục trặc, data trả về rác sẽ là 0 |
| is_imputed | Int | No | | 0 | | Nếu thiếu, mô hình auto nhồi Data ảo (1) |
| station_id | Int | No | FK | None | | Khóa tới Trạm thu thập dữ liệu |

<br/>

-Table AQICategories : Dùng để chứa các mốc chuẩn AQI, mã màu hiển thị và các khuyến nghị sức khỏe tương ứng.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| category_id | Int | No | PK | None | auto_increment | Mã phân vùng EPA |
| min_aqi | Int | No | | None | | Chuẩn Aqi (Từ X) |
| max_aqi | Int | No | | None | | Chuẩn Aqi chặn trần cao (Tới Y) |
| level_name | Nvarchar | No | | None | | String định nghĩa Text mức ô nhiễm |
| color_code | Nvarchar | No | | None | | String render UX Box Màu thẻ hệ Hex |
| health_recommendation | Nvarchar | Yes | | None | | Chỉ định mang khẩu trang không |

<br/>

-Table UserFavoriteStations : Dùng để lưu danh sách các trạm quan trắc yêu thích của người dùng để cập nhật màn hình Home.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| user_id | Int | No | PK,FK | None | | Key Người xem theo dõi trạm |
| station_id | Int | No | PK,FK | None | | Station được đưa lên Watchlist |
| added_at | Datetime2 | No | | None | | Log lịch sử nhấn Favorite |

<br/>

-Table UserFavoriteCities : Dùng để lưu danh sách thành phố mà user đã chọn Favorite ghim lên Feed.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| user_id | Int | No | PK,FK | None | | Composite key kết Member |
| city_id | Int | No | PK,FK | None | | Composite key kết City ID |
| added_at | Datetime2 | No | | None | | Time ấn ghim Widget của User |

<br/>

-Table CommunityReports : Dùng để quản lý các báo cáo về sự cố ô nhiễm nhận diện từ cộng đồng.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| report_id | Bigint | No | PK | None | auto_increment | ID Post Tố Cáo Cộng Đồng |
| latitude | Float | No | | None | | Chọn Checkin Trục Tung |
| longitude | Float | No | | None | | Chọn Checkin Trục Hoàng |
| image_url | Nvarchar(500) | Yes | | None | | Url Azure/S3 Upload |
| description | Nvarchar(1000) | No | | None | | Diễn giải viết Text sự kiện hỏa hoạn |
| report_time | Datetime2 | No | | GETDATE() | | Đăng Status lên Feed |
| upvotes | Int | No | | 0 | | Gamification Voting ủng hộ Post |
| status | Nvarchar(50) | No | | "Pending" | | Bị Filter xóa hay duyệt lên App (Approved) |
| report_type | Nvarchar(50) | No | | "Khác" | | Loại hình báo cáo (Đốt rác, Khí thải,..) |
| expires_at | Datetime2 | No | | None | | Ngày sự kiện này sẽ bị gỡ xuống |
| reject_reason | Nvarchar(500) | Yes | | None | | Khắc phục ghi chú lý do bị từ chối |
| user_id | Int | No | FK | None | | Trỏ về Kênh Profile người Tố Cáo |

<br/>

-Table AIModels : Dùng để quản lý, cấu hình tên miền hệ thống mô hình dự báo AI.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| model_id | Int | No | PK | None | auto_increment | Mã Job / Thuật toán ghim cứng |
| model_name | Nvarchar(150)| No | | None | | Thuật toán Model Random Forest/LSTM |
| version | Nvarchar(150)| No | | None | | Đời model để A/B Testing |
| hyperparameters | Text | Yes | | None | | Data Json cho Learning Rate |
| is_active | Int | No | | 1 | | Tool còn xài để generate prediction không |
| updated_at | Datetime2 | Yes | | None | | Khung giờ thay tệp ML Weights |

<br/>

-Table ModelEvaluations : Dùng để lưu trữ kết quả đánh giá độ tin cậy và sai số của mô hình học máy.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| evaluation_id | Int | No | PK | None | auto_increment | Tricket ghi log Metric kiểm thu Model |
| rmse | Float | Yes | | None | | R-Mean Squared Error Report |
| mae | Float | Yes | | None | | Mean Absolute Error Value |
| r2_score | Float | Yes | | None | | Hàm tính Độ giải thích phương sai R2 |
| mape | Float | Yes | | 1.0 | | Hàm đo đạc tỉ lệ phần trăm Map Error |
| evaluated_at | Datetime2 | Yes | | None | | Lần Check Accuracy sau Training |
| model_id | Int | No | FK | None | | Cho bài trắc nghiệm Model Machine nào |

<br/>

-Table ForecastData : Dùng để chứa dữ liệu suy luận chỉ số không khí trong khung thời gian tương lai lấy từ machine learning.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| forecast_id | Int | No | PK | None | auto_increment | ID kết quả Output Plot lên Widget Tương lai |
| generated_at | Datetime2 | No | | None | | Engine Python đã tính ra lúc đó |
| target_time | Datetime2 | No | | None | | Điểm đích dự bị tới |
| predicted_aqi | Int | Yes | | None | | Mức không khí ước đoán AQI |
| predicted_pm25 | Float | Yes | | None | | Bụi bặm ước tính |
| confidence_interval | Nvarchar | Yes | | None | | Mô tả khoảng tin cậy của thuật toán % |
| station_id | Int | No | FK | None | | Cho Điểm trạm cụ thể tại đâu |
| model_id | Int | No | FK | None | | Bằng kỹ thuật AI Machine nào đúc ra |

<br/>

-Table AffiliateProducts : Dùng để lưu liên kết sản phẩm, đề xuất khuyến mãi chăm sóc khi chỉ số không khí đi xuống.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| product_id | Int | No | PK | None | auto_increment | Định danh kho Ads Item |
| product_name | Nvarchar(200)| No | | None | | Mô tả PR Món hàng y tế |
| image_url | Nvarchar(500)| Yes | | None | | Cover đại diện sản phẩm Web App |
| affiliate_url| Nvarchar(500)| No | | None | | Backlink trỏ sàn Shopee / Tiki |
| category | Nvarchar(50) | No | | None | | Thuộc thẻ nào (Air Purifier / Mask) |
| min_aqi_trigger | Int | No | | 100 | | Điều kiện AQI xấu >= kích hoạt Sale Ticking |
| target_health_condition| Nvarchar(50)| Yes | | "All" | | Hướng đối tượng bệnh nền (Hen Suyển..) |

<br/>

-Table SubscriptionPayments : Dùng để quản lý thông tin các giao dịch thanh toán gói trả phí của người dùng.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| payment_id | Bigint | No | PK | None | auto_increment | Mã hóa đơn giao dịch |
| user_id | Int | No | FK | None | | Profile User xuống tiền |
| provider | Nvarchar(30) | No | | "VNPAY" | | Bank tích hợp API vnpay |
| txn_ref | Nvarchar(100) | No | | None | Unique | Request GUID định dạng Tracking IPN VNPAY |
| amount_vnd | Decimal | No | | None | | Giá VND gói cước |
| status | Nvarchar(30) | No | | "Pending" | | Chưa chuyển thì Pending, Chuyển xong thì Paid |
| gateway_transaction_no | Nvarchar(100) | Yes | | None | | Số chứng từ giao dịch phía Bank lưu qua IPN |
| bank_code | Nvarchar(50) | Yes | | None | | App banking quét pay (NCB, VCB) |
| raw_response | Nvarchar | Yes | | None | | Cục Res JSON thô để Logging lại |
| created_at | Datetime2 | No | | None | | Nhảy qua page Pay VNPAY |
| paid_at | Datetime2 | Yes | | None | | Server Webhook bắt lại được xác nhận |

<br/>

-Table NotificationPlatforms : Dùng để chứa thông tin các nền tảng thông báo hiện hành.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| platform_id | Int | No | PK | None | auto_increment | ID Kênh Third-party liên kết |
| platform_name | Nvarchar | No | | None | | Service tích hợp Email SMS Notification |
| api_config | Nvarchar | Yes | | None | | Khóa Private token |

<br/>

-Table UserLinkedAccounts : Dùng để chứa thông tin các tài khoản điểm cuối mà người dùng đã liên kết để nhận thông báo.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| link_id | Int | No | PK | None | auto_increment | Ref cho Device Notification |
| external_account_id | Nvarchar | No | | None | | Endpoint Firebase FCM hay ID Zalo |
| linked_at | Datetime2 | No | | None | | Mốc đã bấm cài đặt App |
| user_id | Int | No | FK | None | | Của Member gốc nào |
| platform_id | Int | No | FK | None | | Target vào System SDK nào |

<br/>

-Table AlertConfigs : Dùng để chứa cấu hình ngữ cảnh ngưỡng AQI giới hạn kích hoạt thông báo tự động cho từng User.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| config_id | Int | No | PK | None | auto_increment | Chốt Cài đặt Save Tới Server |
| aqi_threshold | Int | No | | None | | Khi AQI cao hơn thì bắt Dispatch |
| is_active | Int | No | | 1 | | Nếu user mệt ko muốn nghe nữa thì tắt Tool cờ này (0) |
| user_id | Int | No | FK | None | | Admin Bot ai Request |
| station_id | Int | No | FK | None | | Muốn soi ngầm trạm Local cụ thể |
| platform_id | Int | No | FK | None | | Báo bằng Call SMS Điện thoại / Hay Notify app |

<br/>

-Table NotificationHistories : Dùng để tracking lịch sử và record nội dung SMS/Email mà App đã ngầm vận hành đẩy cho User.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| notification_id | Int | No | PK | None | auto_increment | Audit Log Report Tác vụ |
| message_content | Nvarchar | No | | None | | Đoạn Note nhúng Payload ("Không khí HN bụi...") |
| sent_at | Datetime2 | No | | None | | Giờ Trigger đẩy ra hệ thống |
| status | Nvarchar | No | | None | | Confirm Result "Thành CÔng" (Sent) / Cúp điện failed |
| user_id | Int | No | FK | None | | Gửi cho ai |
| platform_id | Int | No | FK | None | | Nến gửi kênh nào |
