import { useState } from 'react';
import './App.css';

function App() {
    const [form, setForm] = useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
        verificationCode: ''
    });
    const [message, setMessage] = useState('');
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });
    const [loginMessage, setLoginMessage] = useState('');
    const [isSentCode, setIsSentCode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="page-container">
            <div className="register-container">
                <h1>Đăng ký tài khoản</h1>
                <p>Nhập thông tin và xác thực email để hoàn tất đăng ký.</p>

                <div className="form-group">
                    <label>Tên đăng nhập</label>
                    <input
                        value={form.userName}
                        onChange={(e) => setForm({ ...form, userName: e.target.value })}
                        placeholder="Nhập tên đăng nhập"
                    />
                </div>

                <div className="form-group">
                    <label>Gmail</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="example@gmail.com"
                    />
                </div>

                <div className="form-group">
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Tối thiểu 8 ký tự"
                    />
                </div>

                <div className="form-group">
                    <label>Nhập lại mật khẩu</label>
                    <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        placeholder="Nhập lại mật khẩu"
                    />
                </div>

                <button disabled={isLoading} onClick={sendVerificationCode}>
                    Gửi mã xác thực
                </button>

                {isSentCode && (
                    <>
                        <div className="form-group">
                            <label>Mã xác thực</label>
                            <input
                                value={form.verificationCode}
                                onChange={(e) => setForm({ ...form, verificationCode: e.target.value })}
                                placeholder="Nhập mã đã gửi qua Gmail"
                            />
                        </div>

                        <button disabled={isLoading} onClick={registerAccount}>
                            Hoàn tất đăng ký
                        </button>
                    </>
                )}

                {message && <p className="message">{message}</p>}
            </div>

            <div className="register-container">
                <h1>Đăng nhập</h1>
                <p>Kiểm tra phân quyền điều hướng theo vai trò.</p>

                <div className="form-group">
                    <label>Gmail</label>
                    <input
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        placeholder="example@gmail.com"
                    />
                </div>

                <div className="form-group">
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        placeholder="Nhập mật khẩu"
                    />
                </div>

                <button disabled={isLoading} onClick={loginAccount}>
                    Đăng nhập
                </button>

                {loginMessage && <p className="message">{loginMessage}</p>}
            </div>
        </div>
    );

    async function sendVerificationCode() {
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/auth/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userName: form.userName,
                    email: form.email,
                    password: form.password,
                    confirmPassword: form.confirmPassword
                })
            });

            const result = await response.json();
            if (!response.ok) {
                setMessage(result.message || 'Gửi mã xác thực thất bại.');
                return;
            }

            setIsSentCode(true);
            setMessage(result.message || 'Đã gửi mã xác thực.');
        } catch {
            setMessage('Không gọi được API backend.');
        } finally {
            setIsLoading(false);
        }
    }

    async function registerAccount() {
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    verificationCode: form.verificationCode
                })
            });

            const result = await response.json();
            setMessage(result.message || (response.ok ? 'Đăng ký thành công.' : 'Đăng ký thất bại.'));
        } catch {
            setMessage('Không gọi được API backend.');
        } finally {
            setIsLoading(false);
        }
    }

    async function loginAccount() {
        setIsLoading(true);
        setLoginMessage('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: loginForm.email,
                    password: loginForm.password
                })
            });

            const result = await response.json();
            if (!response.ok) {
                setLoginMessage(result.message || 'Đăng nhập thất bại.');
                return;
            }

            setLoginMessage(`Vai trò: ${result.role}. Chuyển đến: ${result.redirectUrl}`);
        } catch {
            setLoginMessage('Không gọi được API backend.');
        } finally {
            setIsLoading(false);
        }
    }
}

export default App;