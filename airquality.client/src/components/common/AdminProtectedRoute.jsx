import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * AdminProtectedRoute – wraps routes that require admin or super admin role.
 * - If not logged in → redirect to /login
 * - If logged in but role is not admin/super admin → show 404 page
 * - If role is "admin" or "super admin" → render children
 */
export default function AdminProtectedRoute({ children }) {
    const { isLoggedIn, role } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    const isAdmin = role === "admin" || role === "super admin";

    if (!isAdmin) {
        return <Navigate to="/404" replace />;
    }

    return children;
}
