import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import LandingPage from './pages/auth/LandingPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import EcoAirDashboard from './pages/auth/EcoAirDashboard';
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './pages/auth/AdminOverview';
import AirQualityDataPage from './pages/auth/AirQualityDataPage';
import StationDetailPage from './pages/auth/StationDetailPage';
import NotFoundPage from './pages/auth/NotFoundPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminProtectedRoute from './components/common/AdminProtectedRoute';
import EcoAirAIConfig_1 from './pages/auth/EcoAirAIConfig_1';
import EcoAirUserManagement from './pages/auth/EcoAirUserManagement';
import EcoAirStationMonitor from './pages/auth/EcoAirStationMonitor';
import GiamSatDuLieuAQI from './pages/auth/GiamSatDuLieuAQI';
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
            </Route>


            {/* Fallback */}
            <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
    );
}
