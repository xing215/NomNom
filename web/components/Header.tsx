'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Cat, TrendingUp, Target, LogOut, Bolt } from 'lucide-react';

interface HeaderProps {
  nomCount?: number;
  onSettingsClick?: () => void;
  onLogout?: () => void;
}

export default function Header({ nomCount = 1, onSettingsClick, onLogout }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    router.push('/login');
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex bg-[#f7cbcb] px-[50px] py-[30px] items-between justify-between gap-[50px] w-full">
          <div className="flex items-center gap-2 font-normal text-[24px] text-black">
          <span>Nom PIN: {nomCount}</span>
          </div>

        <div className="flex flex-row gap-5" >
        <Link href="/main">
          <p className="font-normal text-[24px] text-black hover:text-[#390202] transition-colors cursor-pointer">
            Main-meow
          </p>
        </Link>
        <Link href="/history">
          <p className="font-normal text-[24px] text-black hover:text-[#390202] transition-colors cursor-pointer">
            Nom-history
          </p>
        </Link>

        <button 
          onClick={onSettingsClick}
          className="hover:opacity-80 transition-opacity"
          aria-label="Open settings"
        >
          <Bolt size={38} strokeWidth={1.5} color="#000000" />
        </button>
        <button 
          onClick={handleLogout}
          className="hover:opacity-80 transition-opacity"
          aria-label="Log out"
        >
          <LogOut size={38} strokeWidth={1.5} color="#000000" />
        </button>
      </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex bg-[#f7cbcb] px-[18px] py-[14px] items-center justify-between gap-[16px] w-full">
        <div className="flex items-center gap-3">
          <p className="font-normal text-[21.926px] text-black">Nom: {nomCount}</p>
        </div>
        <div className="flex items-center gap-[20px]">
          <Cat size={24} strokeWidth={2} color="#000000" className="cursor-pointer" />
          <Link href="/history">
            <TrendingUp size={24} strokeWidth={2} color="#000000" className="cursor-pointer" />
          </Link>
          <Link href="/main">
            <Target size={24} strokeWidth={2} color="#000000" className="cursor-pointer" />
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center"
            aria-label="Log out"
          >
            <LogOut size={24} strokeWidth={2} color="#000000" />
          </button>
        </div>
      </header>
    </>
  );
}
