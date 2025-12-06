import { Plus } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  onAdd?: () => void;
  addButtonSize?: number;
}

export default function SectionHeader({ title, onAdd, addButtonSize = 32 }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full">
      <p className="font-bold text-[24px] text-[#390202] text-left">
        {title}
      </p>
      {onAdd && (
        <button 
          onClick={onAdd}
          className="flex items-center justify-center hover:opacity-80 transition-opacity"
          aria-label={`Add ${title}`}
        >
          <Plus size={addButtonSize} strokeWidth={2.5} color="#000000" />
        </button>
      )}
    </div>
  );
}
