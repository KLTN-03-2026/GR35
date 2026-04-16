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
// Sửa 2 dòng này
import EcoAirAIConfig_1 from './pages/auth/EcoAirAIConfig_1';
import EcoAirUserManagement from './pages/auth/EcoAirUserManagement';
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
            <Route path="/EcoAirAIConfig_1" element={<EcoAirAIConfig_1 />} />
            <Route path="/EcoAirUserManagement" element={<EcoAirUserManagement />} /> {/* 👈 thêm dòng này */}

            {/* Protected: requires login (user role) */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <EcoAirDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Protected: requires admin or super admin role */}
            <Route
                path="/admin"
                element={
                    <AdminProtectedRoute>
                        <AdminDashboard />
                    </AdminProtectedRoute>
                }
            />

            {/* Fallback: redirect unknown paths to 404 */}
            <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
    );
}