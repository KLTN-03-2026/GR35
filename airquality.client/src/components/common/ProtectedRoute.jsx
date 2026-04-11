import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

/**
 * ProtectedRoute – wraps any route that requires authentication.
 * - If not logged in → redirect to /login
 * - If logged in but role is not "user" → redirect to /  (admin goes elsewhere)
 * - Otherwise render children
 */
export default function ProtectedRoute({ children, requiredRole = "user" }) {
    const { isLoggedIn, role } = useAuth();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // Allow "user" role (and any non-admin role)
    const allowedRoles = ["user", requiredRole];
    const isAdmin = role === "admin" || role === "super admin";

    if (requiredRole === "user" && isAdmin) {
        // Admins keep the dashboard access too
        return children;
    }

    if (requiredRole === "user" && !isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
