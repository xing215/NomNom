interface NomCardProps {
  time: string;
  amount: string;
  note: string;
  variant?: 'upcoming' | 'scheduled';
  statusColor?: string;
  onClick?: () => void;
}

export default function NomCard({ 
  time, 
  amount, 
  note, 
  variant = 'upcoming',
  statusColor,
  onClick 
}: NomCardProps) {
  const bgColor = variant === 'upcoming' ? 'bg-[#ff9797]' : 'bg-[#f7cbcb] hover:bg-[#f0c0c0]';
  const isClickable = variant === 'scheduled';

  const content = (
    <>
      {variant === 'scheduled' && statusColor && (
        <div 
          className="absolute left-[13px] top-[13px] w-[24px] h-[24px] rounded-full" 
          style={{ backgroundColor: statusColor }}
        />
      )}
      <p className="font-bold text-[22px] md:text-[24px] text-black">
        {time} - {amount}
      </p>
      <p className="font-normal text-[16px] text-black">{note}</p>
    </>
  );

  if (isClickable) {
    return (
      <button 
        onClick={onClick}
        className={`relative ${bgColor} rounded-[16px] w-full p-[15px] pb-[18px] text-center transition-colors`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`relative ${bgColor} rounded-[16px] w-full p-[15px] pb-[18px] text-center`}>
      {content}
    </div>
  );
}
