'use client';

interface ChatbotButtonProps {
  onClick: () => void;
}

export default function ChatbotButton({ onClick }: ChatbotButtonProps) {
  return (
    <>
      {/* Desktop Button */}
      <button
        onClick={onClick}
        className="hidden md:flex fixed right-[40px] bottom-[40px] bg-[#ff9797] rounded-[40px] px-[20px] py-[28px] hover:bg-[#ff8585] transition-colors shadow-lg z-40 items-center justify-center"
      >
        <div className="w-[32px] h-[14px] relative">
          <svg viewBox="0 0 40 17" fill="none" className="w-full h-full">
            <path
              d="M2 8.5 C2 8.5 8 2 15 2 C22 2 28 8.5 28 8.5 M28 8.5 L38 8.5 M28 4 L32 8.5 L28 13"
              stroke="black"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </button>

      {/* Mobile Button */}
      <button
        onClick={onClick}
        className="md:hidden fixed right-[16px] bottom-[40px] bg-[#ff9797] rounded-[40px] px-[18px] py-[24px] hover:bg-[#ff8585] transition-colors shadow-lg z-40 flex items-center justify-center"
      >
        <div className="w-[28px] h-[12px] relative">
          <svg viewBox="0 0 34 14" fill="none" className="w-full h-full">
            <path
              d="M2 7 C2 7 7 2 13 2 C19 2 24 7 24 7 M24 7 L32 7 M24 3.5 L28 7 L24 10.5"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </button>
    </>
  );
}
