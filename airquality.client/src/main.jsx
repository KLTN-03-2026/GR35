import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { GoogleOAuthProvider } from '@react-oauth/google'

const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 300000 } },
})

const theme = createTheme({
    palette: {
        primary: { main: '#2e7d32' }, // Xanh lá cây sinh thái
        background: { default: '#f4f6f8' }
    }
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId="560466672097-rc4je8539aderar7hh563buauqbtsstv.apps.googleusercontent.com">
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </ThemeProvider>
            </QueryClientProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>,
)