import { useState, useRef, useEffect } from 'react';
import './ChatbotWidget.css';

const SUGGESTIONS = [
    'AQI Hà Nội hôm nay?',
    'Nồng độ ô nhiễm TP.HCM?',
    'So sánh Đà Nẵng và Huế',
    'Tài khoản PRO có gì?',
    'AQI là gì?',
    'Tỉnh nào ô nhiễm nhất?',
];

// Format markdown cơ bản: **bold**, \n → <br>, - list, [text](link)
function formatBotText(text) {
    if (!text) return '';
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // 1. Markdown links: [text](/path) → clickable anchor
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="chatbot-link">$1</a>')
        // 2. Catch raw /thanh-pho/slug paths NOT already inside an href
        .replace(/(?<!href=")(?<!">)(\/thanh-pho\/[a-z0-9-]+)/g, '<a href="$1" class="chatbot-link">Xem chi tiết</a>')
        // 3. Fallback: "Xem chi tiết: /path" or "Xem chi tiết tại: /path"
        .replace(/Xem chi tiết[^:]*:\s*(\/[^\s<]+)/g, '<a href="$1" class="chatbot-link">Xem chi tiết</a>')
        // bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // --- horizontal rule
        .replace(/\n---\n/g, '<hr class="chatbot-hr"/>')
        // newlines → br
        .replace(/\n/g, '<br/>');
    return html;
}

// Response type badge
function ResponseTypeBadge({ responseType, functionsCalled, documentsUsed }) {
    if (!responseType || responseType === 'error') return null;

    const config = {
        function_calling: {
            icon: '📊',
            label: 'Dữ liệu thực tế',
            className: 'chatbot-badge-fc',
        },
        rag: {
            icon: '📚',
            label: 'Kiến thức',
            className: 'chatbot-badge-rag',
        },
        hybrid: {
            icon: '🔄',
            label: 'Kết hợp',
            className: 'chatbot-badge-hybrid',
        },
    };

    const c = config[responseType];
    if (!c) return null;

    return (
        <div className={`chatbot-badge ${c.className}`}>
            <span>{c.icon} {c.label}</span>
            {functionsCalled && functionsCalled.length > 0 && (
                <span className="chatbot-badge-detail">
                    {functionsCalled.map(f => f.replace('get_', '').replace(/_/g, ' ')).join(', ')}
                </span>
            )}
            {documentsUsed > 0 && (
                <span className="chatbot-badge-detail">
                    {documentsUsed} tài liệu tham khảo
                </span>
            )}
        </div>
    );
}

// Source chips
function SourceChips({ sources }) {
    if (!sources || sources.length === 0) return null;
    return (
        <div className="chatbot-sources">
            {sources.map((s, i) => (
                <span key={i} className="chatbot-source-chip">{s}</span>
            ))}
        </div>
    );
}

export default function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            text: 'Xin chào! Tôi là **EcoAir Assistant**.\nHãy hỏi tôi về chất lượng không khí tại bất kỳ tỉnh/thành nào ở Việt Nam!',
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll xuống cuối
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    // Focus input khi mở
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 350);
        }
    }, [open]);

    const sendMessage = async (text) => {
        const question = (text || input).trim();
        if (!question || loading) return;

        // Thêm message user
        setMessages((prev) => [...prev, { role: 'user', text: question }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chatbot/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            });

            if (!res.ok) throw new Error('API error');

            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                {
                    role: 'bot',
                    text: data.answer || 'Không có phản hồi.',
                    responseType: data.responseType,
                    sources: data.sources,
                    functionsCalled: data.functionsCalled,
                    documentsUsed: data.documentsUsed,
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: 'bot',
                    text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                className={`chatbot-fab${open ? ' open' : ''}`}
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? 'Đóng chatbot' : 'Mở chatbot'}
                title="EcoAir Assistant"
            >
                {open ? '✕' : '🤖'}
            </button>

            {/* Chat Window */}
            <div className={`chatbot-window${open ? ' visible' : ''}`}>
                {/* Header */}
                <div className="chatbot-header">
                    <div className="chatbot-avatar">🌿</div>
                    <div className="chatbot-header-info">
                        <p className="chatbot-header-title">EcoAir Assistant</p>
                        <p className="chatbot-header-subtitle">
                            AI Chatbot
                        </p>
                    </div>
                    <button
                        className="chatbot-close"
                        onClick={() => setOpen(false)}
                        aria-label="Đóng"
                    >
                        ✕
                    </button>
                </div>

                {/* Messages */}
                <div className="chatbot-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`chatbot-msg ${msg.role}`}>
                            <div className="chatbot-msg-avatar">
                                {msg.role === 'bot' ? '🌿' : '👤'}
                            </div>
                            <div className="chatbot-msg-content">
                                <div
                                    className="chatbot-msg-bubble"
                                    dangerouslySetInnerHTML={{
                                        __html: formatBotText(msg.text),
                                    }}
                                />
                                {msg.role === 'bot' && (
                                    <>
                                        <ResponseTypeBadge
                                            responseType={msg.responseType}
                                            functionsCalled={msg.functionsCalled}
                                            documentsUsed={msg.documentsUsed}
                                        />
                                        <SourceChips sources={msg.sources} />
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {loading && (
                        <div className="chatbot-msg bot">
                            <div className="chatbot-msg-avatar">🌿</div>
                            <div className="chatbot-msg-bubble">
                                <div className="chatbot-typing">
                                    <span className="chatbot-typing-dot" />
                                    <span className="chatbot-typing-dot" />
                                    <span className="chatbot-typing-dot" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestion chips (chỉ hiện khi ít tin nhắn) */}
                {messages.length <= 2 && !loading && (
                    <div className="chatbot-suggestions">
                        {SUGGESTIONS.map((s, i) => (
                            <button
                                key={i}
                                className="chatbot-chip"
                                onClick={() => sendMessage(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="chatbot-input-area">
                    <input
                        ref={inputRef}
                        className="chatbot-input"
                        type="text"
                        placeholder="Hỏi về chất lượng không khí..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        maxLength={500}
                    />
                    <button
                        className="chatbot-send-btn"
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        aria-label="Gửi"
                    >
                        ➤
                    </button>
                </div>
            </div>
        </>
    );
}
