'use client';

import { useEffect, useState } from 'react';

interface FeedInputProps {
  onFeed?: (amount: number) => void | Promise<void>;
  isSubmitting?: boolean;
  defaultAmount?: number;
  hungry?: boolean;
}

export default function FeedInput({ onFeed, isSubmitting = false, defaultAmount = 100, hungry = false }: FeedInputProps) {
  const [amountInput, setAmountInput] = useState(String(defaultAmount));

  // Sync with defaultAmount when it changes (e.g., from API fetch)
  useEffect(() => {
    setAmountInput(String(defaultAmount));
  }, [defaultAmount]);

  const parsedAmount = Number(amountInput);
  const isAmountValid = amountInput.trim().length > 0 && Number.isFinite(parsedAmount) && parsedAmount > 0;
  const isDisabled = !isAmountValid || isSubmitting;

  const handleFeedClick = async () => {
    if (!onFeed || !isAmountValid) {
      return;
    }

    await onFeed(parsedAmount);
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <p className="font-medium text-[20px] text-[#390202] text-center">
        {hungry ? "Hungry!! Give your cat some more food ?" : "Give a lil more ?"}
      </p>
      <div className="flex gap-[18px] items-center">
        <input
          type="number"
          placeholder="100"
          inputMode="decimal"
          value={amountInput}
          onChange={(event) => setAmountInput(event.target.value)}
          className="w-[180px] h-[54px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[14px] px-4 text-[18px] focus:outline-none focus:border-[#3d4ec4]"
        />
        <button
          className="bg-[#ff9797] rounded-[12px] px-10 py-3 hover:bg-[#ff8585] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleFeedClick}
          disabled={isDisabled}
        >
          <p className="font-semibold text-[20px] text-black text-center">
            {isSubmitting ? '...' : 'FEED'}
          </p>
        </button>
      </div>
    </div>
  );
}
