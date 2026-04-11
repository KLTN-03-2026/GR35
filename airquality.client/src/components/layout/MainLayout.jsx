import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Layout chung: Navbar + nội dung trang + Footer.
 *
 * Sử dụng:
 *   <MainLayout activePage="Ten trang">
 *     <NoiDungTrang />
 *   </MainLayout>
 *
 * Props:
 *   - children: nội dung body của trang
 *   - activePage: label của nav link đang active (mặc định "Trang chu")
 */
export default function MainLayout({ children, activePage = "Trang chu" }) {
    return (
        <div style={{ fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" }}>
            <Navbar activePage={activePage} />
            <main>{children}</main>
            <Footer />
        </div>
    );
}
