import { Button, Card, CardContent, IconButton, Stack, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function ResponsiveInfoStack() {
    return (
        <Stack spacing={2} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
            <Card sx={{ flex: 1 }}>
                <CardContent>
                    <Typography variant="h6">Current AQI</Typography>
                    <Typography variant="h3">92</Typography>
                    <Button variant="contained" sx={{ mt: 1.5, minWidth: 44, minHeight: 44, px: 2 }}>
                        Details
                    </Button>
                    <IconButton sx={{ ml: 1, width: 44, height: 44 }}>
                        <RefreshIcon />
                    </IconButton>
                </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
                <CardContent>
                    <Typography variant="h6">PM2.5</Typography>
                    <Typography variant="h4">38 ug/m3</Typography>
                </CardContent>
            </Card>
        </Stack>
    );
}
