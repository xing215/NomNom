'use client';

import { Fish } from 'lucide-react';

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
        <Fish size={32} strokeWidth={2} color="#000000" />
      </button>

      {/* Mobile Button */}
      <button
        onClick={onClick}
        className="md:hidden fixed right-[16px] bottom-[40px] bg-[#ff9797] rounded-[40px] px-[18px] py-[24px] hover:bg-[#ff8585] transition-colors shadow-lg z-40 flex items-center justify-center"
      >
        <Fish size={28} strokeWidth={2} color="#000000" />
      </button>
    </>
  );
}
