import { Box, IconButton, Paper, Typography, useMediaQuery } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useTheme } from '@mui/material/styles';

export default function MobileMapOverlays({ map }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100dvh' }}>
            <Box sx={{ width: '100%', height: '100%' }}>{map}</Box>

            <IconButton
                aria-label="open filters"
                sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 48,
                    height: 48,
                    bgcolor: 'background.paper',
                    boxShadow: 3,
                    zIndex: 10,
                }}
            >
                <FilterListIcon />
            </IconButton>

            <Paper
                elevation={6}
                sx={{
                    position: 'absolute',
                    left: 12,
                    right: 12,
                    bottom: isMobile ? 12 : 20,
                    p: 1.5,
                    borderRadius: 3,
                    zIndex: 10,
                    maxHeight: isMobile ? '35vh' : '40vh',
                    overflowY: 'auto',
                    pointerEvents: 'auto',
                }}
            >
                <Typography variant="subtitle2">AQI summary and map legends</Typography>
                <Typography variant="body2" color="text.secondary">
                    Place compact cards, legends, and quick filters here to avoid blocking map gestures.
                </Typography>
            </Paper>
        </Box>
    );
}
