import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let muiTheme = createTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },
    palette: {
        primary: { main: '#2e7d32' },
        background: { default: '#f4f6f8' },
    },
    typography: {
        h1: { fontSize: '2rem', fontWeight: 700 },
        h2: { fontSize: '1.75rem', fontWeight: 700 },
        h3: { fontSize: '1.5rem', fontWeight: 600 },
        body1: { fontSize: '0.95rem', lineHeight: 1.6 },
        body2: { fontSize: '0.875rem', lineHeight: 1.5 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    WebkitTapHighlightColor: 'transparent',
                },
            },
        },
    },
});

muiTheme = responsiveFontSizes(muiTheme, { factor: 2 });

export default muiTheme;
