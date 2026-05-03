import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import LoginPage from './pages/auth/LoginPage';
import LandingPage from './pages/auth/LandingPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import EcoAirDashboard from './pages/auth/EcoAirDashboard';
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './pages/auth/AdminOverview';
import AirQualityDataPage from './pages/auth/AirQualityDataPage';
import NationalAirQualityPage from './pages/auth/NationalAirQualityPage';
import StationDetailPage from './pages/auth/StationDetailPage';
import CityDetailPage from './pages/auth/CityDetailPage';
import NotFoundPage from './pages/auth/NotFoundPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminProtectedRoute from './components/common/AdminProtectedRoute';
import EcoAirAIConfig_1 from './pages/auth/EcoAirAIConfig_1';
import EcoAirUserManagement from './pages/auth/EcoAirUserManagement';
import EcoAirStationMonitor from './pages/auth/EcoAirStationMonitor';
import GiamSatDuLieuAQI from './pages/auth/GiamSatDuLieuAQI';
import DuyetBaoCaoDiemNongCongDong from './pages/auth/DuyetBaoCaoDiemNongCongDong';
import PricingPage from './pages/auth/PricingPage';
import ContactPage from './pages/auth/ContactPage';
import ApiDocumentationPage from './pages/auth/ApiDocumentationPage';
import AdminContactManagement from './pages/auth/AdminContactManagement';
import AdminAuthorization from './pages/auth/AdminAuthorization';
import AdminStatistics from './pages/auth/AdminStatistics';
import AdminSystemLogs from './pages/auth/AdminSystemLogs';
import ChatbotWidget from './components/common/ChatbotWidget';

function getPageTitle(pathname) {
    if (pathname === '/') return 'Trang chủ | EcoAir VN';
    if (pathname === '/login') return 'Đăng nhập | EcoAir VN';
    if (pathname === '/register') return 'Đăng ký | EcoAir VN';
    if (pathname === '/forgot-password') return 'Quên mật khẩu | EcoAir VN';
    if (pathname === '/reset-password') return 'Đặt lại mật khẩu | EcoAir VN';
    if (pathname === '/du-lieu') return 'Dữ liệu chất lượng không khí | EcoAir VN';
    if (pathname === '/ban-do') return 'Bản đồ nhiệt toàn quốc | EcoAir VN';
    if (pathname === '/lien-he') return 'Liên hệ | EcoAir VN';
    if (pathname === '/goi') return 'Gói dịch vụ | EcoAir VN';
    if (pathname === '/tai-lieu-api') return 'Tài liệu API | EcoAir VN';
    if (pathname.startsWith('/tram/')) return 'Chi tiết trạm quan trắc | EcoAir VN';
    if (pathname.startsWith('/thanh-pho/')) return 'Chi tiết thành phố | EcoAir VN';
    if (pathname === '/dashboard') return 'Dashboard | EcoAir VN';

    if (pathname.startsWith('/admin')) {
        if (pathname === '/admin') return 'Admin tổng quan | EcoAir VN';
        if (pathname === '/admin/ai-config') return 'Admin - Cấu hình AI | EcoAir VN';
        if (pathname === '/admin/user-management') return 'Admin - Quản lý người dùng | EcoAir VN';
        if (pathname === '/admin/station-monitor') return 'Admin - Giám sát trạm | EcoAir VN';
        if (pathname === '/admin/data') return 'Admin - Giám sát dữ liệu AQI | EcoAir VN';
        if (pathname === '/admin/reports') return 'Admin - Duyệt báo cáo | EcoAir VN';
        if (pathname === '/admin/authorization') return 'Admin - Phân quyền chức năng | EcoAir VN';
        if (pathname === '/admin/statistics') return 'Admin - Thống kê & Báo cáo | EcoAir VN';
        if (pathname === '/admin/logs') return 'Admin - Hệ thống & Logs | EcoAir VN';
        return 'Admin | EcoAir VN';
    }

    if (pathname === '/404') return 'Không tìm thấy trang | EcoAir VN';
    return 'EcoAir VN';
}

function ScrollToTopOnRouteChange() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        document.title = getPageTitle(pathname);
    }, [pathname]);

    return null;
}

export default function App() {
    return (
        <>
            <ScrollToTopOnRouteChange />
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/du-lieu" element={<AirQualityDataPage />} />
                <Route path="/ban-do" element={<NationalAirQualityPage />} />
                <Route path="/lien-he" element={<ContactPage />} />
                <Route path="/goi" element={<PricingPage />} />
                <Route path="/tai-lieu-api" element={<ApiDocumentationPage />} />
                <Route path="/tram/:stationId" element={<StationDetailPage />} />
                <Route path="/thanh-pho/:slug" element={<CityDetailPage />} />
                <Route path="/404" element={<NotFoundPage />} />

                {/* Protected user routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <EcoAirDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <AdminProtectedRoute>
                            <AdminLayout />
                        </AdminProtectedRoute>
                    }
                >
                    <Route index element={<AdminOverview />} />
                    <Route path="ai-config" element={<EcoAirAIConfig_1 />} />
                    <Route path="user-management" element={<EcoAirUserManagement />} />
                    <Route path="station-monitor" element={<EcoAirStationMonitor />} />
                    <Route path="data" element={<GiamSatDuLieuAQI />} />
                    <Route path="reports" element={<DuyetBaoCaoDiemNongCongDong />} />
                    <Route path="contacts" element={<AdminContactManagement />} />
                    <Route path="authorization" element={<AdminAuthorization />} />
                    <Route path="statistics" element={<AdminStatistics />} />
                    <Route path="logs" element={<AdminSystemLogs />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            <ChatbotWidget />
        </>
    );
}
