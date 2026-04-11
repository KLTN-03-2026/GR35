import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import LandingPage from './pages/auth/LandingPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import EcoAirDashboard from './pages/auth/EcoAirDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';

export default function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected: requires login (user role) */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <EcoAirDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Fallback: redirect unknown paths to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
