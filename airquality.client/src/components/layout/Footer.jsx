import { useNavigate } from "react-router-dom";
import { Box, Grid, Stack, Typography } from "@mui/material";
import theme from "./theme";

/**
 * Footer dùng chung cho các trang có MainLayout.
 */
export default function Footer() {
    const navigate = useNavigate();

    return (
        <Box
            component="footer"
            sx={{
                background: "white",
                borderTop: `1px solid ${theme.border}`,
                py: { xs: 3, md: 4 },
                px: { xs: 2, md: 6 },
                fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
            }}
        >
            <Box sx={{ maxWidth: 960, mx: "auto" }}>
                <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mb: { xs: 2.5, md: 4 } }}>
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.2 }}>
                            <Box sx={{ width: 26, height: 26, borderRadius: "6px", background: "linear-gradient(135deg,#0d6e4e,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                                    <path d="M12 2C8 2 4 5.5 4 10c0 4.2 3.2 7.5 8 10.2C17 17.5 20 14.2 20 10c0-4.5-4-8-8-8z" />
                                </svg>
                            </Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 15, color: theme.text }}>EcoAir VN</Typography>
                        </Stack>
                        <Typography sx={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.7, maxWidth: 320 }}>
                            Nền tảng AI giám sát và dự báo chất lượng không khí giúp cộng đồng chủ động bảo vệ sức khỏe.
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 6, md: 2.3 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: theme.text, mb: 1 }}>Giải pháp</Typography>
                        <Stack spacing={0.8}>
                            {["Dự báo AI", "Bản đồ nhiệt", "Eco-routing"].map((item) => (
                                <a key={item} href="#" style={{ fontSize: 13, color: theme.textMuted, textDecoration: "none" }}>{item}</a>
                            ))}
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 6, md: 2.3 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: theme.text, mb: 1 }}>Tài nguyên</Typography>
                        <Stack spacing={0.8}>
                            {["Tài liệu API", "Báo cáo", "Cộng đồng"].map((item) => (
                                <a key={item} href="#" style={{ fontSize: 13, color: theme.textMuted, textDecoration: "none" }}>{item}</a>
                            ))}
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 2.4 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: theme.text, mb: 1 }}>Liên hệ</Typography>
                        <Stack spacing={0.8}>
                            <Typography sx={{ fontSize: 13, color: theme.textMuted }}>support@ecoair.vn</Typography>
                            <Typography sx={{ fontSize: 13, color: theme.textMuted }}>1900 6789</Typography>
                        </Stack>
                    </Grid>
                </Grid>

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    spacing={1.2}
                    sx={{ borderTop: `1px solid ${theme.border}`, pt: 2 }}
                >
                    <Typography sx={{ fontSize: 12.5, color: theme.textLight }}>
                        © 2024 EcoAir VN
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        {["Về chúng tôi", "Bảo mật"].map((item) => (
                            <a key={item} href="#" style={{ fontSize: 12.5, color: theme.textMuted, textDecoration: "none" }}>
                                {item}
                            </a>
                        ))}
                        <Box
                            onClick={() => navigate("/ai-chat")}
                            sx={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                background: theme.green,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2C8 2 4 5.5 4 10c0 4.2 3.2 7.5 8 10.2C17 17.5 20 14.2 20 10c0-4.5-4-8-8-8z" />
                            </svg>
                        </Box>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}
