import { useState } from 'react';
import {
    AppBar,
    BottomNavigation,
    BottomNavigationAction,
    Box,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Toolbar,
    Typography,
    useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import InsightsIcon from '@mui/icons-material/Insights';
import { useTheme } from '@mui/material/styles';

const navItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon /> },
    { id: 'map', label: 'Map', icon: <MapIcon /> },
    { id: 'stats', label: 'Stats', icon: <InsightsIcon /> },
];

export default function ResponsiveNavShell({ title = 'EcoAir VN', children }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [bottomValue, setBottomValue] = useState('home');

    return (
        <Box sx={{ minHeight: '100dvh', pb: isMobile ? 8 : 0 }}>
            <AppBar position="sticky">
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={() => setDrawerOpen(true)}
                            sx={{ mr: 1, width: 44, height: 44 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {title}
                    </Typography>

                    {!isMobile && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {navItems.map((item) => (
                                <ListItemButton
                                    key={item.id}
                                    sx={{ borderRadius: 2, minHeight: 44 }}
                                >
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            ))}
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                ModalProps={{ keepMounted: true }}
            >
                <Box sx={{ width: 280 }}>
                    <List>
                        {navItems.map((item) => (
                            <ListItemButton key={item.id} onClick={() => setDrawerOpen(false)}>
                                {item.icon}
                                <ListItemText sx={{ ml: 1 }} primary={item.label} />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            </Drawer>

            <Box component="main" sx={{ p: { xs: 1.5, sm: 2 } }}>
                {children}
            </Box>

            {isMobile && (
                <BottomNavigation
                    value={bottomValue}
                    onChange={(_, value) => setBottomValue(value)}
                    sx={{
                        position: 'fixed',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        zIndex: (z) => z.zIndex.appBar,
                    }}
                >
                    {navItems.map((item) => (
                        <BottomNavigationAction
                            key={item.id}
                            value={item.id}
                            label={item.label}
                            icon={item.icon}
                        />
                    ))}
                </BottomNavigation>
            )}
        </Box>
    );
}
