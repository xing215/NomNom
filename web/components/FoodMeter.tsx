import Image from 'next/image';

interface FoodMeterProps {
  currentAmount: number;
  maxAmount: number;
  percentage: number;
}

export default function FoodMeter({ currentAmount, maxAmount, percentage }: FoodMeterProps) {
  return (
    <div className="relative w-full max-w-[692px] h-[250px] flex flex-col items-center justify-center z-100 pt-1">
      <div className="absolute top-[15px]  w-[580px] h-[200px]">
        <Image
          src="/images/fish-meter.png"
          alt="Food bowl"
          fill
          className="object-contain opacity-60"
        />
      </div>
      
      <div className="absolute w-[500px] h-[222px]">
        <Image
          src="/images/fish-meter-gloss.png"
          alt="Food bowl overlay"
          fill
          className="object-contain"
        />
      </div>

      <p className="absolute -left-[150px] top-[80px] font-extrabold text-[64px] text-white text-center z-10">
        {currentAmount}g
      </p>
      <p className="absolute top-[120px] left-[120px] -translate-x-full font-extrabold text-[36px] text-white text-right w-[312px] z-10">
        /{maxAmount}
      </p>
      
      <div className="absolute -top-[10px] flex items-center justify-center h-[68.78px] w-[87.378px] -left-[85px]">
        <div className="rotate-[348.226deg]">
          <p className="font-bold text-[36px] text-[#4c5fe3]">{percentage}%</p>
        </div>
      </div>
    </div>
  );
}
