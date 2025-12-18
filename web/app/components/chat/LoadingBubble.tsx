export default function LoadingBubble() {
    return (
        <div className="chat-bubble bot loading">
            <span className="bot-avatar">🐱</span>
            <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    );
}
