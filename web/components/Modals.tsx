'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative max-h-[90vh] overflow-y-auto">
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
          className="absolute right-[16px] top-[16px] w-[56px] h-[56px] flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <div className="rotate-45">
            <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
              <path d="M25 5 L25 45 M5 25 L45 25" stroke="black" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
        </button>

        <h2 className="font-bold text-[32px] text-[#390202] text-center w-full">
          NOMS
        </h2>

        <div className="h-px w-[24px] bg-transparent" />

        <div className="flex flex-col gap-[8px] items-end w-full">
          <p className="font-semibold text-[20px] text-[#390202] uppercase w-full text-right">
            Time
          </p>
          <input
            type="time"
            className="w-full h-[60px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[16px] px-[16px] text-[18px] focus:outline-none focus:border-[#3d4ec4]"
          />
        </div>

        <div className="flex flex-col gap-[8px] items-end w-full">
          <p className="font-semibold text-[20px] text-[#390202] uppercase w-full text-right">
            AMOUNT (Grams)
          </p>
          <input
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
            <p className="font-semibold text-[20px] text-black text-center">
              DELETE
            </p>
          </button>
          <button
            onClick={() => onSave?.('', '')}
            className="bg-[#ff9797] rounded-[12px] px-[40px] py-[12px] hover:bg-[#ff8585] transition-colors"
          >
            <p className="font-semibold text-[20px] text-black text-center">
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
      <div className="bg-[#f4dfdf] rounded-[18px] p-[40px] flex flex-col gap-[24px] items-start relative w-[560px]">
        {/* Close button (X) */}
        <button
          onClick={onClose}
          className="absolute right-[16px] top-[16px] w-[56px] h-[56px] flex items-center justify-center hover:opacity-80 transition-opacity"
        >
          <div className="rotate-45">
            <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
              <path d="M25 5 L25 45 M5 25 L45 25" stroke="black" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
        </button>

        <h2 className="font-bold text-[32px] text-[#390202] text-center w-full">
          SETTINGS
        </h2>

        <div className="h-px w-[24px] bg-transparent" />

        <div className="flex flex-col gap-[8px] items-end w-full">
          <p className="font-semibold text-[20px] text-[#390202] uppercase w-full text-right">
            Maximum amount
          </p>
          <input
            type="number"
            placeholder="500"
            className="w-full h-[60px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[16px] px-[16px] text-[18px] focus:outline-none focus:border-[#3d4ec4]"
          />
        </div>

        <div className="flex flex-col gap-[8px] items-end w-full">
          <p className="font-semibold text-[20px] text-[#390202] uppercase w-full text-right">
            treat AMOUNT
          </p>
          <input
            type="number"
            placeholder="100"
            className="w-full h-[60px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[16px] px-[16px] text-[18px] focus:outline-none focus:border-[#3d4ec4]"
          />
        </div>

        <div className="flex flex-col gap-[8px] items-end w-full">
          <p className="font-semibold text-[20px] text-[#390202] uppercase w-full text-right">
            treat AMOUNT
          </p>
          <input
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
            <p className="font-semibold text-[20px] text-black text-center">
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

export function ChatbotModal({ isOpen, onClose }: ChatbotModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div className="absolute bottom-[90px] md:bottom-[110px] right-[16px] md:right-[50px] pointer-events-auto drop-shadow-xl">
        <div className="bg-[#f4dfdf] rounded-[16px] px-[18px] py-[24px] pb-[14px] flex flex-col gap-[32px] items-start relative w-[320px] max-h-[65vh]">
          {/* Close/back button */}
          <button
            onClick={onClose}
            className="absolute left-[20px] top-[20px] bg-[#ff9797] rounded-[40px] px-[12px] py-[18px] hover:bg-[#ff8585] transition-colors"
            aria-label="Close chatbot"
          >
            <div className="w-[24px] h-[10px] relative">
              <svg viewBox="0 0 24 10" fill="none" className="w-full h-full">
                <path
                  d="M2 5 L18 5 M18 1 L22 5 L18 9"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>

          <h2 className="font-bold text-[22px] text-[#390202] text-center w-full">
            BONES
          </h2>

          {/* Chat messages area */}
          <div className="flex-1 w-full min-h-[200px] flex flex-col gap-[18px] overflow-y-auto pr-1">
            <div className="bg-[#f7cbcb] rounded-bl-[25px] rounded-br-[25px] rounded-tr-[25px] p-[20px] max-w-[192px]">
              <p className="text-[14px] text-black">
                Hello! How can I help you with feeding your pet today?
              </p>
            </div>
            <div className="bg-[#f7cbcb] rounded-bl-[25px] rounded-br-[25px] rounded-tl-[25px] p-[20px] max-w-[192px] ml-auto">
              <p className="text-[14px] text-black">Hi!</p>
            </div>
          </div>

          <div className="flex gap-[12px] items-center w-full h-[40px]">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 h-full bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[16px] px-[12px] text-[15px] focus:outline-none focus:border-[#3d4ec4]"
            />
            <button className="bg-[#ff9797] rounded-[12px] w-[40px] h-[40px] flex items-center justify-center hover:bg-[#ff8585] transition-colors" aria-label="Send message">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 10 L18 10 M10 2 L18 10 L10 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
