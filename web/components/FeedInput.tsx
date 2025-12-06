interface FeedInputProps {
  onFeed?: (amount: number) => void;
}

export default function FeedInput({ onFeed }: FeedInputProps) {
  return (
    <div className="flex flex-col gap-4 items-center">
      <p className="font-medium text-[20px] text-[#390202] text-center">
        Give a lil more ?
      </p>
      <div className="flex gap-[18px] items-center">
        <input
          type="number"
          placeholder="100"
          className="w-[180px] h-[54px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[14px] px-4 text-[18px] focus:outline-none focus:border-[#3d4ec4]"
        />
        <button 
          className="bg-[#ff9797] rounded-[12px] px-10 py-3 hover:bg-[#ff8585] transition-colors"
          onClick={() => onFeed?.(100)}
        >
          <p className="font-semibold text-[20px] text-black text-center">
            FEED
          </p>
        </button>
      </div>
    </div>
  );
}
