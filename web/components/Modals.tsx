'use client';

import { X } from 'lucide-react';
import { ReactNode, useEffect, useRef, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// Noms Edit Modal
interface NomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (time: string, amount: string) => void;
  onDelete?: () => void;
}

export function NomsModal({ isOpen, onClose, onSave, onDelete }: NomsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-[#f4dfdf] rounded-[18px] p-[40px] flex flex-col gap-[24px] items-start relative w-[560px]">
        {/* Close button (X) */}
        <button
          onClick={onClose}
          className="absolute right-[20px] top-[20px] w-[35px] h-[35px] bg-[#ff9797] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
          aria-label="Close modal"
        >
          <X size={30} strokeWidth={3} color="#000000" />
        </button>

        <h2 className="font-bold text-[32px] text-[#390202] text-center w-full">
          NOMS
        </h2>
        <p className="text-[18px] text-[#390202] text-center w-full">
          Configure the interval between feedings and how much to serve each time.
        </p>

        <div className="h-px w-[24px] bg-transparent" />

        <div className="flex flex-col gap-[8px] items-end w-full">
          <label htmlFor="noms-time" className="font-semibold text-[20px] text-[#390202] uppercase w-full text-left">
            Time (Minutes)
          </label>
          <input
            id="noms-time"
            type="number"
            placeholder="Enter time in minutes"
            className="w-full h-[60px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[16px] px-[16px] text-[18px] focus:outline-none focus:border-[#3d4ec4]"
          />
        </div>

        <div className="flex flex-col gap-[8px] items-end w-full">
          <label htmlFor="noms-amount" className="font-semibold text-[20px] text-[#390202] uppercase w-full text-left">
            Amount (Grams)
          </label>
          <input
            id="noms-amount"
            type="number"
            placeholder="500"
            className="w-full h-[60px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[16px] px-[16px] text-[18px] focus:outline-none focus:border-[#3d4ec4]"
          />
        </div>

        <div className="h-px w-[24px] bg-transparent" />

        <div className="flex gap-[20px] items-start justify-center w-full">
          <button
            onClick={onDelete}
            className="bg-[#f7cbcb] rounded-[12px] px-[40px] py-[12px] hover:bg-[#f0c0c0] transition-colors"
          >
            <p className="font-semibold text-[20px] text-black text-left">
              DELETE
            </p>
          </button>
          <button
            onClick={() => onSave?.('', '')}
            className="bg-[#ff9797] rounded-[12px] px-[40px] py-[12px] hover:bg-[#ff8585] transition-colors"
          >
            <p className="font-semibold text-[20px] text-black text-left">
              SAVE
            </p>
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Settings Modal
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: { maxAmount: string; treatAmount1: string; treatAmount2: string }) => void;
}

export function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-[#f4dfdf] rounded-[18px] p-[24px] flex flex-col gap-[16px] items-start relative w-[320px] md:w-[480px]">
        {/* Close button (X) */}
        <button
          onClick={onClose}
          className="absolute right-[20px] top-[20px] w-[35px] h-[35px] bg-[#ff9797] rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
          aria-label="Close modal"
        >
          <X size={30} strokeWidth={3} color="#000000" />
        </button>

        {/* <div className="h-[35px] w-[24px] bg-transparent" /> */}
        <h2 className="font-bold text-[32px] text-[#390202] text-center w-full">
          SETTINGS
        </h2>

        <div className="flex flex-col gap-[8px] items-end w-full">
          <label htmlFor="max-amount" className="font-semibold text-[20px] text-[#390202] uppercase w-full text-left">
            Maximum amount
          </label>
          <input
            id="max-amount"
            type="number"
            placeholder="500"
            className="w-full h-[60px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[16px] px-[16px] text-[18px] focus:outline-none focus:border-[#3d4ec4]"
          />
        </div>

        <div className="flex flex-col gap-[8px] items-end w-full">
          <label htmlFor="treat-amount" className="font-semibold text-[20px] text-[#390202] uppercase w-full text-left">
            Treat Amount
          </label>
          <input
            id="treat-amount"
            type="number"
            placeholder="100"
            className="w-full h-[60px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[16px] px-[16px] text-[18px] focus:outline-none focus:border-[#3d4ec4]"
          />
        </div>

        <div className="h-px w-[24px] bg-transparent" />

        <div className="flex gap-[20px] items-start justify-center w-full">
          <button
            onClick={() => onSave?.({ maxAmount: '', treatAmount1: '', treatAmount2: '' })}
            className="bg-[#ff9797] rounded-[12px] px-[40px] py-[12px] hover:bg-[#ff8585] transition-colors"
          >
            <p className="font-semibold text-[20px] text-black text-left">
              SAVE
            </p>
          </button>
        </div>
      </div>
    </Modal>
  );
}

// Chatbot Modal
interface ChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PROMPT_SUGGESTIONS = [
  'Mèo ăn bao nhiêu?',
  'Nhiệt độ hiện tại?',
  'Còn bao nhiêu thức ăn?',
];

export function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    setInput('');
    setIsLoading(true);

    // Add user message
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
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
        throw new Error('Không thể kết nối');
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
      setMessages([
        ...newMessages,
        { role: 'assistant', content: '❌ Đã xảy ra lỗi. Vui lòng thử lại.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  // Chat content component - shared between mobile and desktop
  const ChatContent = () => (
    <div className="flex flex-col gap-[16px] items-start h-full w-full px-[16px] py-[20px] pb-[16px] md:px-[18px] md:py-[24px] md:pb-[14px]">
      {/* Header with close button */}
      <div className="flex items-center justify-between w-full">
        <h2 className="font-bold text-[22px] text-[#390202] text-left">
          🐱 BONES
        </h2>
        <button
          onClick={onClose}
          className="bg-[#ff9797] rounded-full p-[10px] hover:bg-[#ff8585] transition-colors"
          aria-label="Close chatbot"
        >
          <X size={20} strokeWidth={2.5} color="#000000" />
        </button>
      </div>

      {/* Chat messages area */}
      <div className="flex-1 w-full overflow-y-auto flex flex-col gap-[12px] pr-1">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-2">
            <div className="bg-[#f7cbcb] rounded-bl-[25px] rounded-br-[25px] rounded-tr-[25px] p-[16px] max-w-[280px] md:max-w-[260px]">
              <p className="text-[14px] text-black">
                Xin chào! Tôi là trợ lý chăm sóc mèo. Hỏi tôi bất cứ điều gì! 🐾
              </p>
            </div>
            {/* Prompt suggestions */}
            <div className="flex flex-wrap gap-2 mt-2">
              {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(suggestion)}
                  className="text-xs bg-[#ff9797] hover:bg-[#ff8585] text-black px-3 py-2 md:py-1.5 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, idx) => (
            <div
              key={idx}
              className={`${message.role === 'user'
                ? 'bg-[#ff9797] rounded-bl-[25px] rounded-br-[25px] rounded-tl-[25px] ml-auto'
                : 'bg-[#f7cbcb] rounded-bl-[25px] rounded-br-[25px] rounded-tr-[25px]'
                } p-[12px] max-w-[75%] md:max-w-[260px]`}
            >
              <p className="text-[14px] md:text-[13px] text-black whitespace-pre-wrap">
                {message.content || (isLoading && message.role === 'assistant' ? '...' : '')}
              </p>
            </div>
          ))
        )}
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <div className="bg-[#f7cbcb] rounded-bl-[25px] rounded-br-[25px] rounded-tr-[25px] p-[12px] max-w-[200px]">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-[#390202] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-[#390202] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-[#390202] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex gap-[12px] items-center w-full">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập tin nhắn..."
          disabled={isLoading}
          className="flex-1 h-[48px] md:h-[40px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[16px] px-[14px] md:px-[12px] text-[16px] md:text-[15px] focus:outline-none focus:border-[#3d4ec4] disabled:opacity-50"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="bg-[#ff9797] rounded-[12px] w-[48px] h-[48px] md:w-[40px] md:h-[40px] flex items-center justify-center hover:bg-[#ff8585] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Send message"
        >
          {isLoading ? (
            <div className="w-5 h-5 md:w-4 md:h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" className="md:w-[20px] md:h-[20px]">
              <path d="M2 10 L18 10 M10 2 L18 10 L10 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile: Full screen - shows on screens < md */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: '#f4dfdf',
        }}
      >
        <ChatContent />
      </div>

      {/* Desktop: Floating popup - shows on screens >= md */}
      <div className="hidden md:flex fixed bottom-[110px] right-[50px] z-[9999] w-[380px] h-[500px] max-h-[70vh] bg-[#f4dfdf] rounded-[16px] drop-shadow-xl flex-col">
        <ChatContent />
      </div>
    </>
  );
}

