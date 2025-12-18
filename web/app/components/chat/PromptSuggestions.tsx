interface PromptSuggestionsProps {
    suggestions: string[];
    onSuggestionClick: (prompt: string) => void;
}

export default function PromptSuggestions({
    suggestions,
    onSuggestionClick,
}: PromptSuggestionsProps) {
    return (
        <div className="prompt-suggestions">
            {suggestions.map((suggestion, idx) => (
                <button
                    key={idx}
                    className="suggestion-btn"
                    onClick={() => onSuggestionClick(suggestion)}
                >
                    💬 {suggestion}
                </button>
            ))}
        </div>
    );
}
