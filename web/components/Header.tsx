'use client';

import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  nomCount?: number;
  onSettingsClick?: () => void;
}

export default function Header({ nomCount = 1, onSettingsClick }: HeaderProps) {
  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex bg-[#f7cbcb] px-[40px] py-[22px] items-center justify-between gap-[24px] w-full">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/wordmark.png"
            alt="NomNom wordmark"
            width={118}
            height={34}
            priority
          />
        </Link>
        <div className="flex items-center gap-[28px]">
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
          <div className="flex items-center gap-2 font-normal text-[24px] text-black">
            <span>Nom: {nomCount}</span>
            <Image
              src="/images/sleeping-cat.png"
              alt="Cat badge"
              width={30}
              height={30}
              className="rounded-full border border-[#4c5fe3] object-cover"
            />
          </div>
          <button 
            onClick={onSettingsClick}
            className="w-[42px] h-[42px] rounded-full border-[3px] border-[#4c5fe3] bg-[#ffc2c2] hover:bg-[#ffb0b0] transition-colors flex items-center justify-center"
            aria-label="Open settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Zm0-6.5 2 3.5 4-.5-.5 4 3.5 2-3.5 2 .5 4-4-.5-2 3.5-2-3.5-4 .5.5-4-3.5-2 3.5-2-.5-4 4 .5Z" stroke="#390202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex bg-[#f7cbcb] px-[18px] py-[14px] items-center justify-between gap-[16px] w-full">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/wordmark.png" alt="NomNom" width={94} height={26} />
        </Link>
        <div className="flex items-center gap-3">
          <p className="font-normal text-[21.926px] text-black">Nom: {nomCount}</p>
          <Image
            src="/images/sleeping-cat.png"
            alt="Cat badge"
            width={26}
            height={26}
            className="rounded-full border border-[#4c5fe3] object-cover"
          />
          <button 
            onClick={onSettingsClick}
            className="w-[40px] h-[40px] rounded-full border-[2px] border-[#4c5fe3] bg-[#ffc2c2] hover:bg-[#ffb0b0] transition-colors flex items-center justify-center"
            aria-label="Open settings"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Zm0-6.5 2 3.5 4-.5-.5 4 3.5 2-3.5 2 .5 4-4-.5-2 3.5-2-3.5-4 .5.5-4-3.5-2 3.5-2-.5-4 4 .5Z" stroke="#390202" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>
    </>
  );
}
