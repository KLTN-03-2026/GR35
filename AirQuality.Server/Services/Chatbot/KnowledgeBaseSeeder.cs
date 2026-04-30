using AirQuality.Server.Data;
using AirQuality.Server.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AirQuality.Server.Services.Chatbot;

/// <summary>
/// Seed knowledge base với dữ liệu kiến thức cho RAG pipeline
/// </summary>
public static class KnowledgeBaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext db, EmbeddingService embeddingService)
    {
        // Nếu đã có dữ liệu thì bỏ qua
        if (await db.Set<KnowledgeDocument>().AnyAsync())
            return;

        var documents = GetSeedDocuments();

        foreach (var doc in documents)
        {
            // Tạo embedding cho mỗi document
            var embedding = await embeddingService.GetEmbeddingAsync(doc.Content);
            doc.EmbeddingJson = JsonSerializer.Serialize(embedding);
            doc.CreatedAt = DateTime.UtcNow;
            doc.UpdatedAt = DateTime.UtcNow;
        }

        db.Set<KnowledgeDocument>().AddRange(documents);
        await db.SaveChangesAsync();
    }

    private static List<KnowledgeDocument> GetSeedDocuments() => new()
    {
        // ═══════════════════════════════════════════════════════════════
        // THUẬT NGỮ (terminology)
        // ═══════════════════════════════════════════════════════════════
        new()
        {
            Title = "AQI là gì - Chỉ số chất lượng không khí",
            Category = "terminology",
            Content = @"AQI (Air Quality Index) là chỉ số chất lượng không khí, thang điểm từ 0 đến 500 theo chuẩn US EPA (Cơ quan Bảo vệ Môi trường Hoa Kỳ).
Các mức AQI:
- 0-50 🟢 Tốt: Chất lượng không khí tốt, không ảnh hưởng sức khỏe. An toàn cho mọi hoạt động ngoài trời.
- 51-100 🟡 Trung bình: Chấp nhận được, nhưng nhóm nhạy cảm (hen suyễn, bệnh hô hấp) nên hạn chế hoạt động ngoài trời kéo dài.
- 101-150 🟠 Không tốt cho nhóm nhạy cảm: Người già, trẻ em, người bệnh hô hấp, tim mạch nên ở trong nhà.
- 151-200 🔴 Không tốt: Mọi người nên giảm hoạt động ngoài trời, đeo khẩu trang N95 khi ra ngoài.
- 201-300 🟣 Rất không tốt: Tránh ra ngoài, đóng cửa sổ, bật máy lọc không khí.
- 301-500 🟤 Nguy hiểm: Nguy cơ sức khỏe nghiêm trọng cho toàn bộ dân số, ở trong nhà hoàn toàn.
AQI được tính dựa trên nồng độ các chất ô nhiễm: PM2.5, PM10, O3, CO, NO2, SO2."
        },
        new()
        {
            Title = "PM2.5 là gì - Bụi mịn",
            Category = "terminology",
            Content = @"PM2.5 là bụi mịn có đường kính ≤ 2.5 micromet (nhỏ hơn 1/30 sợi tóc người).
Đặc điểm nguy hiểm:
- Xâm nhập sâu vào phế nang phổi, thậm chí vào máu
- Gây viêm phổi, hen suyễn, bệnh tim mạch, ung thư phổi khi tiếp xúc lâu dài
- Nguồn phát sinh: khí thải xe cộ, nhà máy, đốt rác, bụi xây dựng, đốt rơm rạ
Ngưỡng an toàn theo WHO (2021): ≤ 15 µg/m³ trung bình 24h, ≤ 5 µg/m³ trung bình năm
Ngưỡng QCVN (Việt Nam): ≤ 50 µg/m³ trung bình 24h
Tại Việt Nam, PM2.5 thường cao nhất vào mùa đông (tháng 11-3) do nghịch nhiệt và đốt rơm rạ."
        },
        new()
        {
            Title = "PM10 là gì - Bụi thô",
            Category = "terminology",
            Content = @"PM10 là bụi có đường kính ≤ 10 micromet.
- Lớn hơn PM2.5, chủ yếu bám ở đường hô hấp trên (mũi, họng, phế quản)
- Gây ho, viêm họng, viêm phế quản
- Nguồn: bụi đường, xây dựng, hoạt động nông nghiệp, khai thác mỏ
Ngưỡng an toàn WHO: ≤ 45 µg/m³ trung bình 24h
Ngưỡng QCVN: ≤ 150 µg/m³ trung bình 24h"
        },
        new()
        {
            Title = "CO là gì - Carbon Monoxide",
            Category = "terminology",
            Content = @"CO (Carbon Monoxide - Cacbon monoxit) là khí độc không màu, không mùi.
- Sinh ra từ quá trình đốt cháy không hoàn toàn (xe cộ, bếp than, cháy rừng)
- Rất nguy hiểm vì liên kết với hemoglobin mạnh gấp 200 lần oxy
- Gây đau đầu, chóng mặt, ngộ độc, thậm chí tử vong ở nồng độ cao
- Đặc biệt nguy hiểm trong không gian kín
Ngưỡng an toàn: < 10 mg/m³ (trung bình 8h)"
        },
        new()
        {
            Title = "NO2 là gì - Nitrogen Dioxide",
            Category = "terminology",
            Content = @"NO2 (Nitrogen Dioxide - Nitơ điôxit) là khí ô nhiễm có màu nâu đỏ, mùi hắc.
- Nguồn chính: khí thải xe cộ (đặc biệt xe diesel), nhà máy nhiệt điện
- Gây viêm đường hô hấp, giảm chức năng phổi
- Là tiền chất tạo O3 tầng mặt đất và bụi PM2.5 thứ cấp
- Trẻ em, người bị hen suyễn đặc biệt nhạy cảm
Ngưỡng WHO: 25 µg/m³ trung bình 24h"
        },
        new()
        {
            Title = "SO2 là gì - Sulfur Dioxide",
            Category = "terminology",
            Content = @"SO2 (Sulfur Dioxide - Lưu huỳnh điôxit) là khí ô nhiễm có mùi hắc.
- Nguồn: đốt nhiên liệu hóa thạch (than, dầu), nhà máy luyện kim
- Gây kích ứng mắt, mũi, họng; làm nặng hen suyễn
- Là nguyên nhân chính gây mưa axit
- Phản ứng trong khí quyển tạo bụi PM2.5 thứ cấp (sulfate)
Ngưỡng WHO: 40 µg/m³ trung bình 24h"
        },
        new()
        {
            Title = "O3 là gì - Ozone tầng mặt đất",
            Category = "terminology",
            Content = @"O3 (Ozone) ở tầng mặt đất là chất ô nhiễm thứ cấp có hại (khác O3 tầng bình lưu bảo vệ trái đất).
- Hình thành khi NOx + VOCs phản ứng dưới ánh nắng mặt trời
- Nồng độ cao nhất vào buổi trưa và chiều nắng nóng
- Gây kích ứng mắt, đường hô hấp, giảm chức năng phổi
- Đặc biệt nguy hiểm cho người tập thể dục ngoài trời vào trưa nắng
Ngưỡng WHO: 100 µg/m³ trung bình 8h"
        },

        // ═══════════════════════════════════════════════════════════════
        // SỨC KHỎE (health)
        // ═══════════════════════════════════════════════════════════════
        new()
        {
            Title = "Khuyến nghị sức khỏe theo mức AQI",
            Category = "health",
            Content = @"Khuyến nghị sức khỏe chi tiết theo từng mức AQI:

🟢 AQI 0-50 (Tốt):
- Mọi người có thể hoạt động ngoài trời bình thường
- Thích hợp cho tập thể dục, chạy bộ, đạp xe

🟡 AQI 51-100 (Trung bình):
- Người bình thường: hoạt động bình thường
- Nhóm nhạy cảm (hen suyễn, COPD, bệnh tim): giảm hoạt động gắng sức kéo dài ngoài trời

🟠 AQI 101-150 (Không tốt cho nhóm nhạy cảm):
- Trẻ em, người già: hạn chế chơi ngoài trời
- Người bệnh hô hấp, tim mạch: ở trong nhà
- Người bình thường: tránh hoạt động gắng sức kéo dài

🔴 AQI 151-200 (Không tốt):
- Mọi người nên giảm hoạt động ngoài trời
- Đeo khẩu trang N95/KN95 khi phải ra ngoài
- Đóng cửa sổ, bật máy lọc không khí nếu có
- Người nhạy cảm: ở trong nhà hoàn toàn

🟣 AQI 201-300 (Rất không tốt):
- Tránh ra ngoài trừ khi cần thiết
- Đóng tất cả cửa, bật máy lọc không khí
- Đeo khẩu trang N95 khi ra ngoài
- Theo dõi triệu chứng: khó thở, ho, đau đầu

🟤 AQI 301+ (Nguy hiểm):
- Ở trong nhà hoàn toàn
- Sử dụng máy lọc không khí HEPA
- Chuẩn bị thuốc hen suyễn nếu có bệnh nền
- Gọi cấp cứu nếu có triệu chứng nặng"
        },
        new()
        {
            Title = "Hen suyễn và ô nhiễm không khí",
            Category = "health",
            Content = @"Người bị hen suyễn rất nhạy cảm với ô nhiễm không khí:

Tác động:
- PM2.5 và O3 có thể kích hoạt cơn hen, gây khó thở, thở khò khè
- NO2 làm viêm đường thở, tăng tần suất cơn hen
- Thay đổi thời tiết đột ngột cũng là yếu tố kích phát

Khuyến nghị:
- Luôn mang theo ống hít khẩn (salbutamol)
- Kiểm tra AQI trước khi ra ngoài (khuyến nghị AQI < 100)
- Đeo khẩu trang N95 khi AQI > 100
- Tránh tập thể dục ngoài trời khi AQI > 100
- Đóng cửa sổ, bật máy lọc không khí tại nhà
- Theo dõi triệu chứng và ghi nhật ký hen
- Tham vấn bác sĩ để điều chỉnh thuốc khi ô nhiễm kéo dài

Lưu ý: Đây là tham khảo, cần tham vấn bác sĩ chuyên khoa."
        },
        new()
        {
            Title = "Trẻ em và ô nhiễm không khí",
            Category = "health",
            Content = @"Trẻ em đặc biệt dễ bị tổn thương bởi ô nhiễm không khí vì:
- Phổi đang phát triển (hoàn thiện đến 18-20 tuổi)
- Hít thở nhanh hơn người lớn → hấp thụ chất ô nhiễm nhiều hơn
- Thường hoạt động ngoài trời nhiều

Tác hại lâu dài:
- Giảm phát triển chức năng phổi
- Tăng nguy cơ hen suyễn, viêm phế quản
- Ảnh hưởng đến sự phát triển trí not

Khuyến nghị cho phụ huynh:
- Không cho trẻ chơi ngoài trời khi AQI > 100
- Giữ trẻ trong nhà khi AQI > 150
- Hạn chế đi bộ dọc đường giao thông lớn
- Sử dụng máy lọc không khí trong phòng ngủ trẻ
- Rửa mũi bằng nước muối sinh lý hàng ngày khi ô nhiễm cao"
        },
        new()
        {
            Title = "Người già và ô nhiễm không khí",
            Category = "health",
            Content = @"Người cao tuổi (trên 60) thuộc nhóm nguy cơ cao khi ô nhiễm không khí tăng:
- Chức năng phổi suy giảm tự nhiên theo tuổi
- Nhiều người có bệnh nền: COPD, bệnh tim, tiểu đường
- Hệ miễn dịch yếu hơn

Tác động:
- Tăng nguy cơ đột quỵ, nhồi máu cơ tim khi PM2.5 cao
- Viêm phổi, nhiễm trùng đường hô hấp
- Các triệu chứng: khó thở, mệt mỏi, đau ngực

Khuyến nghị:
- Ở trong nhà khi AQI > 100
- Uống thuốc đúng giờ (thuốc tim mạch, huyết áp)
- Sử dụng máy lọc không khí
- Tránh tập thể dục ngoài trời sáng sớm (ô nhiễm cao)
- Liên hệ bác sĩ nếu xuất hiện khó thở, đau ngực"
        },
        new()
        {
            Title = "Thai phụ và ô nhiễm không khí",
            Category = "health",
            Content = @"Phụ nữ mang thai cần đặc biệt chú ý đến chất lượng không khí:

Tác động đến thai nhi:
- PM2.5 có thể đi qua nhau thai, ảnh hưởng phát triển thai
- Tăng nguy cơ sinh non, nhẹ cân
- Có liên quan đến rối loạn phát triển thần kinh

Khuyến nghị:
- Hạn chế ra ngoài khi AQI > 100
- Đeo khẩu trang N95 khi cần ra ngoài
- Sử dụng máy lọc không khí HEPA tại nhà và nơi làm việc
- Ăn nhiều rau xanh, trái cây (chất chống oxy hóa)
- Khám thai định kỳ, thông báo bác sĩ nếu sống ở khu vực ô nhiễm cao

Lưu ý: Luôn tham vấn bác sĩ sản khoa."
        },
        new()
        {
            Title = "Tập thể dục khi ô nhiễm không khí",
            Category = "health",
            Content = @"Hướng dẫn tập thể dục an toàn theo mức AQI:

🟢 AQI 0-50: Tập thoải mái ngoài trời (chạy bộ, đạp xe, bơi lội)
🟡 AQI 51-100: Có thể tập ngoài trời, giảm cường độ nếu nhạy cảm
🟠 AQI 101-150: Tập trong nhà, hoặc giảm thời gian/cường độ ngoài trời
🔴 AQI 151-200: Chỉ tập trong nhà (gym, yoga tại nhà)
🟣 AQI 201+: Tạm dừng tập luyện gắng sức, chỉ tập nhẹ trong nhà

Thời điểm tốt nhất: sáng sớm (5-7h) hoặc tối (sau 19h) - ô nhiễm thường thấp hơn.
Tránh: tập dọc đường giao thông lớn, giờ cao điểm.
Lưu ý khi AQI cao: hít thở bằng mũi (lọc bụi tốt hơn miệng), không mở cửa sổ phòng tập."
        },
        new()
        {
            Title = "Khẩu trang và bảo vệ sức khỏe",
            Category = "health",
            Content = @"Hướng dẫn sử dụng khẩu trang khi ô nhiễm không khí:

Loại khẩu trang hiệu quả:
- N95/KN95: Lọc được 95% bụi PM2.5, hiệu quả nhất
- FFP2: Tương đương N95, chuẩn châu Âu
- Khẩu trang y tế (surgical mask): Chỉ lọc bụi lớn, KHÔNG lọc PM2.5 hiệu quả
- Khẩu trang vải: Không có tác dụng lọc bụi mịn

Cách sử dụng đúng:
- Đảm bảo khẩu trang áp sát mặt, không hở
- Thay khẩu trang N95 sau 40h sử dụng
- Không giặt khẩu trang N95 (làm hỏng lớp lọc)

Khi nào cần đeo:
- AQI > 150: Nên đeo N95 khi ra ngoài
- AQI > 200: Bắt buộc đeo N95
- Đi xe máy: Luôn đeo khẩu trang có lớp lọc bụi"
        },

        // ═══════════════════════════════════════════════════════════════
        // THÔNG TIN ỨNG DỤNG (app_info)
        // ═══════════════════════════════════════════════════════════════
        new()
        {
            Title = "Giới thiệu ứng dụng EcoAir",
            Category = "app_info",
            Content = @"EcoAir là hệ thống giám sát chất lượng không khí thời gian thực tại 63 tỉnh/thành phố Việt Nam.

Các tính năng chính:
🗺️ Bản đồ AQI: Xem AQI toàn quốc trên bản đồ tương tác
📊 Chi tiết tỉnh/trạm: AQI, PM2.5, PM10, CO, NO2, SO2, O3, thời tiết
📈 Biểu đồ lịch sử: Theo dõi xu hướng AQI theo thời gian
🔮 Dự báo 7 ngày: Dự báo AQI dựa trên mô hình AI/ML
🔔 Cảnh báo: Nhận thông báo qua Telegram và Email khi AQI vượt ngưỡng
🛣️ Eco-Routing: Tìm đường đi né vùng ô nhiễm
💬 Chatbot AI: Hỏi đáp về chất lượng không khí

Nguồn dữ liệu: Các trạm quan trắc tự động (TEDP), OpenWeatherMap.
Tính toán AQI theo chuẩn US EPA."
        },
        new()
        {
            Title = "Tài khoản PRO - Nâng cấp Premium",
            Category = "app_info",
            Content = @"Tài khoản PRO của EcoAir cung cấp các tính năng nâng cao:

✨ Lợi ích khi nâng cấp PRO:
- 📊 Xem dữ liệu lịch sử 7 ngày và 30 ngày
- 📥 Xuất dữ liệu CSV để phân tích
- 🔔 Thiết lập cảnh báo cá nhân tự động qua Telegram và Email
- 💚 Tùy chỉnh hồ sơ sức khỏe và nhận khuyến nghị cá nhân hóa
- 📈 Xem biểu đồ phân tích chuyên sâu
- 🤖 Không giới hạn lượt hỏi Chatbot AI
- 🗝️ API Key để truy cập dữ liệu qua REST API

💰 Cách nâng cấp:
1. Bấm vào avatar tài khoản ở góc phải trên cùng
2. Chọn 'Nâng cấp PRO'
3. Thanh toán qua VNPay (thẻ ATM nội địa, Visa, MasterCard)

👉 Xem chi tiết gói dịch vụ: /goi"
        },
        new()
        {
            Title = "Hướng dẫn sử dụng EcoAir",
            Category = "app_info",
            Content = @"Hướng dẫn sử dụng các tính năng EcoAir:

1. Xem AQI tỉnh/thành phố: Vào trang chủ → chọn tỉnh trên bản đồ hoặc thanh tìm kiếm
2. Thêm yêu thích: Ở trang chi tiết tỉnh → bấm icon ⭐ để theo dõi
3. Xem biểu đồ: Trang chi tiết tỉnh → cuộn xuống phần History Chart
4. Thiết lập cảnh báo (PRO): Cài đặt → Cảnh báo → Chọn tỉnh/trạm + ngưỡng AQI
5. Liên kết Telegram: Cài đặt → Liên kết tài khoản → Telegram → Quét QR
6. Xuất CSV (PRO): Trang chi tiết → Export → Chọn khoảng thời gian
7. API Key (PRO): Cài đặt → API Key → Tạo key mới
8. Eco-Routing: Menu → Eco Route → Nhập điểm đến"
        },

        // ═══════════════════════════════════════════════════════════════
        // MÔI TRƯỜNG (environment)
        // ═══════════════════════════════════════════════════════════════
        new()
        {
            Title = "Nguồn ô nhiễm không khí tại Việt Nam",
            Category = "environment",
            Content = @"Các nguồn ô nhiễm không khí chính tại Việt Nam:

🚗 Giao thông (40-50%): Xe máy, ô tô, xe tải - nguồn NOx, CO, PM2.5 lớn nhất tại đô thị
🏭 Công nghiệp (20-30%): Nhà máy nhiệt điện than, xi măng, thép, hóa chất
🔥 Đốt biomass (10-20%): Đốt rơm rạ (sau mùa gặt), đốt rác ngoài trời
🏗️ Xây dựng: Bụi từ công trình, xe ben chở vật liệu
🌾 Nông nghiệp: Phân bón, thuốc trừ sâu bay hơi

Thời điểm ô nhiễm cao:
- Mùa đông (tháng 11-3): Nghịch nhiệt giữ ô nhiễm ở tầng thấp
- Giờ cao điểm: 7-9h sáng, 17-19h chiều
- Sau mùa gặt: Đốt rơm rạ (tháng 6, tháng 10)"
        },
        new()
        {
            Title = "Máy lọc không khí và giải pháp trong nhà",
            Category = "environment",
            Content = @"Giải pháp cải thiện chất lượng không khí trong nhà:

🏠 Máy lọc không khí:
- Chọn máy có bộ lọc HEPA (lọc 99.97% hạt ≥ 0.3µm)
- Kiểm tra CADR (Clean Air Delivery Rate) phù hợp diện tích phòng
- Thay bộ lọc đúng lịch (thường 6-12 tháng)
- Đặt ở phòng ngủ / phòng làm việc

🪴 Cây xanh lọc không khí:
- Lưỡi hổ (Snake Plant): Lọc formaldehyde
- Trầu Bà (Pothos): Lọc CO, benzene
- Cau cảnh (Areca Palm): Tăng độ ẩm, lọc toluene
- Lưu ý: Cây xanh chỉ hỗ trợ, không thay thế máy lọc

💨 Thông gió thông minh:
- Mở cửa sổ khi AQI < 100 (thường 10-14h trưa)
- Đóng cửa khi AQI cao (sáng sớm, chiều tối)
- Sử dụng quạt thông gió có bộ lọc"
        },
        new()
        {
            Title = "Thời tiết ảnh hưởng đến chất lượng không khí",
            Category = "environment",
            Content = @"Mối quan hệ giữa thời tiết và ô nhiễm không khí:

🌡️ Nhiệt độ:
- Nghịch nhiệt (mùa đông, sáng sớm): Không khí lạnh ở dưới 'đậy nắp' ô nhiễm, AQI tăng cao
- Nhiệt độ cao (trưa nắng): Tăng phản ứng quang hóa → O3 tầng mặt đất tăng

💨 Gió:
- Gió mạnh: Phân tán ô nhiễm, AQI giảm
- Lặng gió: Ô nhiễm tích tụ, AQI tăng

🌧️ Mưa:
- Mưa rửa trôi bụi → AQI giảm đáng kể sau mưa
- Mưa nhỏ/ phùn: Có thể tăng độ ẩm → nồng độ PM tăng tạm thời

☁️ Sương mù:
- Sương mù + ô nhiễm = smog (sương khói) rất nguy hiểm
- Thường xuất hiện sáng sớm mùa đông tại Hà Nội"
        },
    };
}
