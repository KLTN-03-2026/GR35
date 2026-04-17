import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import LandingPage from './pages/auth/LandingPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import EcoAirDashboard from './pages/auth/EcoAirDashboard';
import AdminDashboard from './pages/auth/AdminDashboard';
import AirQualityDataPage from './pages/auth/AirQualityDataPage';
import StationDetailPage from './pages/auth/StationDetailPage';
import NotFoundPage from './pages/auth/NotFoundPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminProtectedRoute from './components/common/AdminProtectedRoute';


//addmin
// Giám sát & Cấu hình AI//*
import EcoAirAIConfig_1 from './pages/auth/EcoAirAIConfig_1';
// Quản lý Người dùng & API//*
import EcoAirUserManagement from './pages/auth/EcoAirUserManagement';
//Quản lý Trạm quan trắc//*
import EcoAirStationMonitor from './pages/auth/EcoAirStationMonitor';
//GiamSatDuLieuAQI
import GiamSatDuLieuAQI from './pages/auth/GiamSatDuLieuAQI';
//DuyetBaoCaoDiemNongCongDong
import DuyetBaoCaoDiemNongCongDong from './pages/auth/DuyetBaoCaoDiemNongCongDong';


export default function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/du-lieu" element={<AirQualityDataPage />} />
            <Route path="/tram/:stationId" element={<StationDetailPage />} />
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

            {/* Test routes */}
            <Route path="/test/ai-config" element={<EcoAirAIConfig_1 />} />
  
            <Route path="/test/user-management" element={<EcoAirUserManagement />} />
            <Route path="/test/station-monitor" element={<EcoAirStationMonitor />} />
            <Route path="/test/giam-sat-du-lieu-aqi" element={<GiamSatDuLieuAQI />} />
            <Route path="/test/duyet-bao-cao-diem-nong-cong-dong" element={<DuyetBaoCaoDiemNongCongDong />} />



            {/* Ẩn tạm admin routes để test
            <Route
                path="/admin"
                element={
                    <AdminProtectedRoute>
                        <AdminDashboard />
                    </AdminProtectedRoute>
                }
            />
            <Route
                path="/admin/ai-config"
                element={
                    <AdminProtectedRoute>
                        <EcoAirAIConfig_1 />
                    </AdminProtectedRoute>
                }
            />
            <Route
                path="/admin/ai-config-1-1"
                element={
                    <AdminProtectedRoute>
                        <EcoAirAIConfig_1_1 />
                    </AdminProtectedRoute>
                }
            />
            <Route
                path="/admin/user-management"
                element={
                    <AdminProtectedRoute>
                        <EcoAirUserManagement />
                    </AdminProtectedRoute>
                }
            />
            <Route
                path="/admin/station-monitor"
                element={
                    <AdminProtectedRoute>
                        <EcoAirStationMonitor />
                    </AdminProtectedRoute>
                }
            />
            */}

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
    );
}
