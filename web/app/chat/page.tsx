'use client';

import { ChatBubble, LoadingBubble, PromptSuggestions } from '@/app/components/chat';
import { useEffect, useRef, useState } from 'react';
import './chat.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const PROMPT_SUGGESTIONS = [
    'Mèo của tôi đã ăn bao nhiêu hôm nay?',
    'Nhiệt độ phòng hiện tại là bao nhiêu?',
    'Còn bao nhiêu thức ăn trong hộp?',
    'Mèo có xin ăn nhiều không?',
    'Mèo nên ăn bao nhiêu mỗi ngày?',
];

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSuggestionClick = (suggestion: string) => {
        setInput(suggestion);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setError(null);
        setIsLoading(true);

        // Add user message
        const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({
                        role: m.role,
                        content: m.content,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            // Add empty assistant message
            setMessages([...newMessages, { role: 'assistant', content: '' }]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    assistantMessage += chunk;

                    // Update the last message with new content
                    setMessages([
                        ...newMessages,
                        { role: 'assistant', content: assistantMessage },
                    ]);
                }
            }
        } catch (err) {
            console.error('Chat error:', err);
            setError('Đã xảy ra lỗi. Vui lòng thử lại.');
            // Remove the empty assistant message on error
            setMessages(newMessages);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chat-page">
            {/* Header */}
            <header className="chat-header">
                <div className="header-content">
                    <h1>🐱 NomNom AI Assistant</h1>
                    <p>Hỏi về mèo của bạn và dữ liệu máy cho ăn</p>
                </div>
            </header>

            {/* Messages Area */}
            <main className="chat-messages">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🐾</div>
                        <h2>Xin chào!</h2>
                        <p>Tôi là trợ lý chăm sóc mèo của bạn.</p>
                        <p>Hỏi bất kỳ câu hỏi nào về mèo hoặc máy cho ăn!</p>
                        <PromptSuggestions
                            suggestions={PROMPT_SUGGESTIONS}
                            onSuggestionClick={handleSuggestionClick}
                        />
                    </div>
                ) : (
                    <div className="messages-list">
                        {messages.map((message, idx) => (
                            <ChatBubble
                                key={idx}
                                message={message.content}
                                isBot={message.role === 'assistant'}
                            />
                        ))}
                        {isLoading && <LoadingBubble />}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}
            </main>

            {/* Input Area */}
            <footer className="chat-input-area">
                <form onSubmit={handleSubmit} className="input-form">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Nhập câu hỏi của bạn..."
                        className="chat-input"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="send-btn"
                        disabled={isLoading || !input.trim()}
                    >
                        {isLoading ? '⏳' : '📤'}
                    </button>
                </form>
            </footer>
        </div>
    );
}
