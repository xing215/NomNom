interface ChatBubbleProps {
    message: string;
    isBot: boolean;
}

export default function ChatBubble({ message, isBot }: ChatBubbleProps) {
    return (
        <div className={`chat-bubble ${isBot ? 'bot' : 'user'}`}>
            {isBot && <span className="bot-avatar">🐱</span>}
            <p className="bubble-content">{message}</p>
        </div>
    );
}
