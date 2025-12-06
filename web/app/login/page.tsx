'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:flex relative w-full h-screen bg-[#f4dfdf] items-center justify-center overflow-hidden p-[10px]">
        {/* Background decorations */}
        <div className="absolute left-0 top-[849px] flex items-center justify-center w-[1462px] h-[716px]">
          <div className="rotate-90">
            <div className="w-[716px] h-[1462px] bg-[#f7cbcb]" />
          </div>
        </div>

        {/* Image 9 - Left side */}
        <div className="absolute left-[40px] top-[301px] w-[299px] h-[574px]">
          <Image
            src="/images/cat-tree.png"
            alt="Cat decoration"
            fill
            className="object-cover"
          />
        </div>

        {/* Image 10 - Bottom right */}
        <div className="absolute left-[1216px] top-[745px] w-[181px] h-[119px]">
          <Image
            src="/images/cat-toy.png"
            alt="Cat decoration"
            fill
            className="object-cover"
          />
        </div>

        {/* Image 11 - Bottom */}
        <div className="absolute left-[1057px] top-[809px] w-[93px] h-[66px]">
          <Image
            src="/images/dream-cat.png"
            alt="Cat decoration"
            fill
            className="object-cover"
          />
        </div>

        {/* Main form content */}
        <div className="relative z-10 flex flex-col items-center gap-[24px] p-[10px]">
          <div className="text-center">
            <h1 className="font-bold text-[48px] text-[#390202] leading-tight mb-[12px]">
              Log In
            </h1>
            <p className="font-bold text-[18px] text-[#390202]">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="underline">
                Signup
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-[28px] items-center">
            <div className="flex flex-col gap-[12px] items-center">
              <p className="font-semibold text-[20px] text-[#390202] text-center">
                Email
              </p>
              <input
                type="email"
                className="w-[480px] h-[60px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[16px] px-[18px] text-[18px] focus:outline-none focus:border-[#3d4ec4]"
              />
            </div>

            <div className="flex flex-col gap-[12px] items-center">
              <p className="font-semibold text-[20px] text-[#390202] text-center">
                Password
              </p>
              <input
                type="password"
                className="w-[480px] h-[60px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[16px] px-[18px] text-[18px] focus:outline-none focus:border-[#3d4ec4]"
              />
            </div>

            <Link href="/main">
              <div className="bg-[#ff9797] rounded-[12px] px-[48px] py-[12px] flex items-center justify-center cursor-pointer hover:bg-[#ff8585] transition-colors">
                <p className="font-semibold text-[20px] text-black text-center">
                  FIND
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden relative w-full h-screen bg-[#f4dfdf] flex flex-col py-[115px] overflow-hidden">
        {/* Background decorations */}
        <div className="absolute left-0 top-[849px] flex items-center justify-center w-[1462px] h-[716px]">
          <div className="rotate-90">
            <div className="w-[716px] h-[1462px] bg-[#f7cbcb]" />
          </div>
        </div>

        {/* Image 7 - Logo top right */}
        <div className="absolute left-[236px] top-[31px] w-[140px] h-[44px]">
          <Image
            src="/images/wordmark.png"
            alt="NomNom Logo"
            fill
            className="object-cover"
          />
        </div>

        {/* Image 9 - Left side */}
        <div className="absolute left-[20px] top-[535px] w-[177px] h-[340px]">
          <Image
            src="/images/cat-tree.png"
            alt="Cat decoration"
            fill
            className="object-cover"
          />
        </div>

        {/* Image 10 - Bottom right */}
        <div className="absolute left-[335px] top-[788px] w-[109px] h-[71px]">
          <Image
            src="/images/cat-toy.png"
            alt="Cat decoration"
            fill
            className="object-cover"
          />
        </div>

        {/* Image 11 - Bottom */}
        <div className="absolute left-[239px] top-[826px] w-[56px] h-[40px]">
          <Image
            src="/images/dream-cat.png"
            alt="Cat decoration"
            fill
            className="object-cover"
          />
        </div>

        {/* Main form content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-[94px] p-[10px]">
          <h1 className="font-bold text-[36px] text-[#390202] text-center w-full">
            Log In
          </h1>

          <div className="flex flex-col gap-[40px] items-center px-[30px] w-full">
            <div className="flex flex-col items-center gap-[20px]">
              <p className="font-semibold text-[24px] text-[#390202] text-center">
                Email
              </p>
              <input
                type="email"
                className="w-[332px] h-[53px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[18px] px-[15px] text-[18px] focus:outline-none focus:border-[#3d4ec4]"
              />
            </div>

            <div className="flex flex-col items-center gap-[20px]">
              <p className="font-semibold text-[24px] text-[#390202] text-center">
                Password
              </p>
              <input
                type="password"
                className="w-[332px] h-[53px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[18px] px-[15px] text-[18px] focus:outline-none focus:border-[#3d4ec4]"
              />
            </div>

            <Link href="/main">
              <div className="bg-[#ff9797] rounded-[14.612px] px-[60px] py-[15px] flex items-center justify-center cursor-pointer hover:bg-[#ff8585] transition-colors">
                <p className="font-semibold text-[24px] text-black text-center">
                  FIND
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
