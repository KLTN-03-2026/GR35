import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Box, Paper, Typography } from '@mui/material';

const sampleData = [
    { time: '08:00', aqi: 78 },
    { time: '09:00', aqi: 84 },
    { time: '10:00', aqi: 91 },
    { time: '11:00', aqi: 88 },
    { time: '12:00', aqi: 95 },
];

export default function ResponsiveAqiChart({ data = sampleData }) {
    return (
        <Paper sx={{ p: 2, width: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
                AQI Trend
            </Typography>
            <Box sx={{ width: '100%', height: { xs: 220, sm: 280 } }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                        <YAxis width={32} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="aqi" stroke="#2e7d32" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}
