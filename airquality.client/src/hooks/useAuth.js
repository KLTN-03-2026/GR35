/**
 * useAuth – reads authentication state from localStorage.
 * Returns { isLoggedIn, role, userName, accessToken, logout }
 */
export function useAuth() {
    const accessToken = localStorage.getItem("accessToken") ?? "";
    const role = (localStorage.getItem("role") ?? "").toLowerCase();
    const userName = localStorage.getItem("userName") ?? "Người dùng";
    const subscriptionTier = localStorage.getItem("subscriptionTier") ?? "Free";
    const isLoggedIn = !!accessToken;

    function logout() {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        localStorage.removeItem("subscriptionTier");
        window.location.href = "/";
    }

    return { isLoggedIn, role, userName, accessToken, subscriptionTier, logout };
}
