interface EnvironmentCardProps {
  label: string;
  value: string;
}

export default function EnvironmentCard({ label, value }: EnvironmentCardProps) {
  return (
    <div className="relative bg-[#ff9797] rounded-[16px] h-[96px] flex-1 min-w-[150px]">
      <p className="absolute top-[6px] left-1/2 -translate-x-1/2 font-normal text-[18px] text-black text-center">
        {label}
      </p>
      <p className="absolute top-[34px] left-1/2 -translate-x-1/2 font-bold text-[32px] text-black text-center w-[150px]">
        {value}
      </p>
    </div>
  );
}
