# 2. THIẾT KẾ CƠ SỞ DỮ LIỆU

## 2.1. Lược đồ cơ sở dữ liệu

Khóa chính được gạch dưới, khóa ngoại được bôi đen

- Roles (<u>role_id</u>, role_name, description): Dùng để chứa danh mục các quyền của hệ thống (Super Admin, Admin, Member, ...)
- ActionTypes (<u>action_type_id</u>): Dùng để chứa các loại thao tác để log lịch sử hệ thống
- Users (<u>user_id</u>, full_name, email, password_hash, status, created_at, last_login, heal_condition, **role_id**): Dùng để chứa thông tin chi tiết về tài khoản người dùng và quản trị viên trong hệ thống
- AuditLogs (<u>log_id</u>, ip_address, timestamp, **user_id**, **action_type_id**): Dùng để ghi lại phân tích truy vết thao tác và lịch sử của người dùng
- Cities (<u>city_id</u>, province_name, slug, latitude, longitude, region, is_active): Dùng để lưu thông tin về các Tỉnh/Thành phố hiện hành
- CityAirQualitySnapshots (<u>snapshot_id</u>, timestamp, temperature, feels_like, humidity, pressure, wind_speed, wind_deg, cloud_cover, visibility, weather_main, weather_description, weather_icon, pm25, pm10, co, no2, so2, o3, nh3, aqi_pm25, aqi_pm10, aqi_co, aqi_no2, aqi_so2, aqi_o3, calculated_aqi, **city_id**): Dùng để lưu trữ toàn cảnh thông số lịch sử thời tiết và tổng hợp không khí của mọi thành phố
- Stations (<u>station_id</u>, station_name, latitude, longitude, is_active, provider, city): Dùng để chứa thông tin chi tiết và tọa độ định vị của các trạm đo chất lượng không khí
- AirQualityObservations (<u>observation_id</u>, timestamp, pm25, pm10, co, no2, so2, o3, temperature, humidity, wind_speed, wind_deg, pressure, calculated_aqi, is_valid, is_imputed, **station_id**): Dùng để lưu trữ kết quả dữ liệu thời tiết và chất lượng không khí chi tiết theo thời gian thực tại các trạm
- AQICategories (<u>category_id</u>, min_aqi, max_aqi, level_name, color_code, health_recommendation): Dùng để chứa các mốc chuẩn AQI, mã màu hiển thị và các khuyến nghị sức khỏe tương ứng
- UserFavoriteStations (<u>**user_id**</u>, <u>**station_id**</u>, added_at): Dùng để lưu danh sách các trạm quan trắc yêu thích của người dùng để cập nhật màn hình Home
- CommunityReports (<u>report_id</u>, latitude, longitude, image_url, description, report_time, upvotes, status, **user_id**): Dùng để quản lý các báo cáo về sự cố ô nhiễm từ cộng đồng
- AIModels (<u>model_id</u>, model_name, version, hyperparameters, is_active, updated_at): Dùng để quản lý, cấu hình tên miền hệ thống mô hình dự báo AI
- ModelEvaluations (<u>evaluation_id</u>, rmse, mae, r2_score, mape, evaluated_at, **model_id**): Dùng để lưu trữ kết quả đánh giá độ tin cậy và sai số của mô hình học máy
- ForecastData (<u>forecast_id</u>, generated_at, target_time, predicted_aqi, predicted_pm25, confidence_interval, **station_id**, **model_id**): Dùng để chứa dữ liệu suy luận chỉ số không khí trong khung thời gian tương lai lấy từ machine learning
- AffiliateProducts (<u>product_id</u>, product_name, image_url, affiliate_url, category, min_aqi_trigger, target_health_condition): Dùng để lưu liên kết sản phẩm, đề xuất khuyến mãi chăm sóc khi chỉ số không khí đi xuống
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
| full_name | Nvarchar | No | | None | | Họ và tên đầy đủ |
| email | Nvarchar | No | | None | | Địa chỉ email |
| password_hash | Nvarchar | No | | None | | Chuỗi băm mật khẩu |
| status | Int | No | | 1 | | Trạng thái |
| created_at | Datetime2 | No | | None | | Thời gian tạo tài khoản |
| last_login | Datetime2 | Yes | | None | | Lần cuối truy cập đăng nhập |
| heal_condition | Nvarchar | Yes | | None | | Chi tiết tình trạng sức khoẻ cá nhân |
| role_id | Int | No | FK | None | | Khoá ngoại định vị quyền hạn |

<br/>

-Table AuditLogs : Dùng để ghi lại phân tích truy vết thao tác và lịch sử của người dùng.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| log_id | Int | No | PK | None | auto_increment | ID gốc quá trình thao tác |
| ip_address | Nvarchar | No | | None | | Địa chỉ IP của client gửi |
| timestamp | Datetime2 | No | | None | | Lưu vết giờ hiện tại |
| user_id | Int | No | FK | None | | Ref tới tài khoản cá nhân thay đổi |
| action_type_id | Int | No | FK | None | | Ref về thao tác gì đã làm |

<br/>

-Table Cities : Dùng để lưu thông tin về các Tỉnh/Thành phố hiện hành.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| city_id | Int | No | PK | None | auto_increment | ID thành phố |
| province_name | Nvarchar | No | | None | | Tên địa lý quốc gia hành chính |
| slug | Nvarchar | No | | None | Unique | Slug hỗ trợ truy suất website |
| latitude | Decimal | No | | None | | Vĩ độ |
| longitude | Decimal | No | | None | | Kinh độ |
| region | Nvarchar | Yes | | None | | Miền / Khu vực |
| is_active | Int | No | | 1 | | Có hiển thị hay không |

<br/>

-Table CityAirQualitySnapshots : Dùng để lưu trữ toàn cảnh thông số lịch sử thời tiết và tổng hợp không khí của mọi thành phố.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| snapshot_id | Int | No | PK | None | auto_increment | ID khoảnh khắc thu thập |
| timestamp | Datetime2 | No | | None | | Giờ đồng bộ |
| temperature | Float | Yes | | None | | Mức nhiệt |
| feels_like | Float | Yes | | None | | Cảm giác nóng |
| humidity | Float | Yes | | None | | Độ ẩm |
| pressure | Float | Yes | | None | | Mức áp kế không khí |
| wind_speed | Float | Yes | | None | | Mức tốc độ gió |
| wind_deg | Float | Yes | | None | | Độ gió |
| cloud_cover | Int | Yes | | None | | Độ phủ mây của trời |
| visibility | Int | Yes | | None | | Tỉ lệ thấy bằng mắt xa |
| weather_main | Nvarchar | Yes | | None | | Loại thời tiết cơ bản |
| weather_description | Nvarchar | Yes | | None | | Tả chữ chi tiết thời tiết |
| weather_icon | Nvarchar | Yes | | None | | Biểu tượng icon mây/gió |
| pm25 | Float | Yes | | None | | Chỉ số bụi siêu mịn |
| pm10 | Float | Yes | | None | | Chỉ số bụi lớn |
| co | Float | Yes | | None | | CO2/CO xả |
| no2 | Float | Yes | | None | | Khí NO2 |
| so2 | Float | Yes | | None | | Khí SO2 |
| o3 | Float | Yes | | None | | Khí bốc mùi O3 |
| nh3 | Float | Yes | | None | | Khí NH3 rác |
| aqi_pm25, aqi_co,.. | Int | Yes | | None | | Phân số chuẩn hóa riêng biệt |
| calculated_aqi | Int | Yes | | None | | Số đỉnh lớn nhất tổng hợp |
| city_id | Int | No | FK | None | | Truy vết về Tỉnh/TP nào |

<br/>

-Table Stations : Dùng để chứa thông tin chi tiết và tọa độ định vị của các trạm đo chất lượng không khí.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| station_id | Int | No | PK | None | auto_increment | ID thực thi trạm |
| station_name | Nvarchar | No | | None | | Tên riêng trạm cung cấp |
| latitude | Decimal | No | | None | | Vĩ độ |
| longitude | Decimal | No | | None | | Kinh độ |
| is_active | Int | No | | 1 | | Còn hoạt động nhả Data không |
| provider | Nvarchar | No | | None | | Đơn vị cung cấp tài trợ API |
| city | Nvarchar | No | | None | | TP của trạm chỉ định tự nhiên |

<br/>

-Table AirQualityObservations : Dùng để lưu trữ kết quả dữ liệu thời tiết và chất lượng không khí chi tiết theo thời gian thực tại các trạm.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| observation_id | Int | No | PK | None | auto_increment | Khóa ID |
| timestamp | Datetime2 | No | | None | | Lúc Data được thu lại do trạm |
| pm25, pm10.. o3 | Float | Yes | | None | | Trị số khí hoá học |
| temperature, ... | Float | Yes | | None | | Dữ liệu kèm thời tiết |
| calculated_aqi | Int | Yes | | None | | AQI chính trung bình chung |
| is_valid | Int | No | | 1 | | Nếu bị hư sensor sẽ đánh dấu 0 |
| is_imputed | Int | No | | 0 | | Nếu bị ML bù dữ liệu thì chọn 1 |
| station_id | Int | No | FK | None | | Gắn cho Trạm nào |

<br/>

-Table AQICategories : Dùng để chứa các mốc chuẩn AQI, mã màu hiển thị và các khuyến nghị sức khỏe tương ứng.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| category_id | Int | No | PK | None | auto_increment | Mã phân loại |
| min_aqi | Int | No | | None | | Ngưỡng màu nhỏ |
| max_aqi | Int | No | | None | | Ngưỡng kịch kim chỉ định |
| level_name | Nvarchar | No | | None | | Tiêu đề cho mức độ |
| color_code | Nvarchar | No | | None | | Màu #HEX |
| health_recommendation | Nvarchar | Yes | | None | | Viết giải thích về rủi ro |

<br/>

-Table UserFavoriteStations : Dùng để lưu danh sách các trạm quan trắc yêu thích của người dùng để cập nhật màn hình Home.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| user_id | Int | No | PK,FK | None | | Composite key kết user |
| station_id | Int | No | PK,FK | None | | Composite key kết station |
| added_at | Datetime2 | No | | None | | Lúc đã thả tim vào danh sách |

<br/>

-Table CommunityReports : Dùng để quản lý các báo cáo về sự cố ô nhiễm nhận diện từ cộng đồng.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| report_id | Bigint | No | PK | None | auto_increment | Mã bài phàn nàn |
| latitude | Float | No | | None | | Tọa độ điểm cắm map |
| longitude | Float | No | | None | | Tọa độ điểm cắm map |
| image_url | Nvarchar | Yes | | None | | Hình chứng minh Upload CND |
| description | Nvarchar | No | | None | | Mẩu chuyện / giải thích tình trạng |
| report_time | Datetime2 | No | | GETDATE() | | Time in |
| upvotes | Int | No | | 0 | | Vote ủng hộ bài |
| status | Nvarchar | No | | "Pending" | | Chưa phê duyệt duyệt Web |
| user_id | Int | No | FK | None | | Của user post lên |

<br/>

-Table AIModels : Dùng để quản lý, cấu hình tên miền hệ thống mô hình dự báo AI.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| model_id | Int | No | PK | None | auto_increment | Căn gốc mô hình sinh |
| model_name | Nvarchar(150)| No | | None | | LSTM cấu hình |
| version | Nvarchar(150)| No | | None | | Dòng version chạy |
| hyperparameters | Text | Yes | | None | | JSON lưu Hyper parameters |
| is_active | Int | No | | 1 | | Nếu fail thì 0 dừng lại |
| updated_at | Datetime2 | Yes | | None | | Sửa code training ngày |

<br/>

-Table ModelEvaluations : Dùng để lưu trữ kết quả đánh giá độ tin cậy và sai số của mô hình học máy.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| evaluation_id | Int | No | PK | None | auto_increment | Định danh Log rà soát Accuracy |
| rmse | Float | Yes | | None | | Benchmark |
| mae | Float | Yes | | None | | Benchmark |
| r2_score | Float | Yes | | None | | Benchmark |
| mape | Float | Yes | | 1.0 | | Tách ra tính benchmark |
| evaluated_at | Datetime2 | Yes | | None | | Mốc chạy script evaluate |
| model_id | Int | No | FK | None | | Trỏ về model cha |

<br/>

-Table ForecastData : Dùng để chứa dữ liệu suy luận chỉ số không khí trong khung thời gian tương lai lấy từ machine learning.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| forecast_id | Int | No | PK | None | auto_increment | ID kết quả Output cho UI hiển thị |
| generated_at | Datetime2 | No | | None | | Thời gian Batch ML vừa đẩy db |
| target_time | Datetime2 | No | | None | | Time cho mốc ví dụ "14/1" |
| predicted_aqi | Int | Yes | | None | | Lôi ra chỉ số tiên đoán AQI |
| predicted_pm25 | Float | Yes | | None | | Tách bụi riêng cũng có |
| confidence_interval | Nvarchar | Yes | | None | | Chuỗi thống kê chuẩn Error % |
| station_id | Int | No | FK | None | | Dùng API trạm nào dự phóng cho trạm đó |
| model_id | Int | No | FK | None | | Dùng model nào tạo ra |

<br/>

-Table AffiliateProducts : Dùng để lưu liên kết sản phẩm, đề xuất khuyến mãi chăm sóc khi chỉ số không khí đi xuống.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| product_id | Int | No | PK | None | auto_increment | Mã hàng ecommerce bán |
| product_name | Nvarchar(200)| No | | None | | Label tiêu đề giỏ hàng |
| image_url | Nvarchar(500)| Yes | | None | | Poster banner chèn UX |
| affiliate_url| Nvarchar(500)| No | | None | | Mua click Ref link Shopee |
| category | Nvarchar(50) | No | | None | | Nhóm ngành thiết bị |
| min_aqi_trigger | Int | No | | 100 | | Kể từ mức AQI thì mới PR |
| target_health_condition| Nvarchar(50)| Yes | | "All" | | Nhắm thẳng vô nhóm người nào |

<br/>

-Table NotificationPlatforms : Dùng để chứa thông tin các nền tảng thông báo hiện hành.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| platform_id | Int | No | PK | None | auto_increment | Khóa gốc mã API |
| platform_name | Nvarchar | No | | None | | Tên nền tảng chèn Text |
| api_config | Nvarchar | Yes | | None | | URL endpoint Push |

<br/>

-Table UserLinkedAccounts : Dùng để chứa thông tin các tài khoản điểm cuối mà người dùng đã liên kết để nhận thông báo.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| link_id | Int | No | PK | None | auto_increment | Map ghim lại cho user đó |
| external_account_id | Nvarchar | No | | None | | Số mã hóa định danh người Chat bên ngoài |
| linked_at | Datetime2 | No | | None | | Đã Subscribe hôm |
| user_id | Int | No | FK | None | | Của Member nào |
| platform_id | Int | No | FK | None | | Thuộc service FCM Zalo Tele |

<br/>

-Table AlertConfigs : Dùng để chứa cấu hình ngữ cảnh ngưỡng AQI giới hạn kích hoạt thông báo tự động cho từng User.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| config_id | Int | No | PK | None | auto_increment | Cụm cài đặt Save Push |
| aqi_threshold | Int | No | | None | | Qua X phát là auto nhồi Push |
| is_active | Int | No | | 1 | | Nếu phiền thì Off tắt đi (0) |
| user_id | Int | No | FK | None | | Owner cài đặt này |
| station_id | Int | No | FK | None | | Track cho duy nhất Station này |
| platform_id | Int | No | FK | None | | Send thẳng vào nền tảng đã gắn với list Link |

<br/>

-Table NotificationHistories : Dùng để tracking lịch sử và record nội dung SMS/Email mà Job đã ngầm vận hành đẩy cho User.

| Field | Type | Null | Key | Default | Extra | Description |
|---|---|---|---|---|---|---|
| notification_id | Int | No | PK | None | auto_increment | Log Push Messages |
| message_content | Nvarchar | No | | None | | Dòng thông điệp lưu trữ |
| sent_at | Datetime2 | No | | None | | Thời gian đã nhả Payload Server |
| status | Nvarchar | No | | None | | Confirm API Result ("OK", "Crashed") |
| user_id | Int | No | FK | None | | Mục tiêu thả email |
| platform_id | Int | No | FK | None | | Bằng bên nền Webhooks nào |
