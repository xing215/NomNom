'use client';

import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-static';

export default function LoginPage() {
  return (
    <div className="relative w-full md:h-screen h-[90vh] bg-[#f4dfdf] flex items-center justify-center overflow-hidden p-[10px]">
      {/* Background decorations */}
      <div className="absolute left-0 bottom-0 flex items-center justify-center w-[1462px] md:w-[3000px] h-[10px] md:h-[70px]">
        <div className="rotate-90">
          <div className="w-[70px] md:w-[70px] h-[1462px] md:h-[5000px] bg-[#f7cbcb]" />
        </div>
      </div>

      {/* Image 9 - Left side cat */}
      <div className="absolute left-0 md:left-[40px] bottom-10 md:top-[301px] w-[177px] md:w-[299px] h-[340px] md:h-[574px]">
        <Image
          src="https://www.figma.com/api/mcp/asset/6ef47083-dc79-4b87-8c22-0c340d23a0a0"
          alt="Cat decoration"
          fill
          className="object-cover md:hidden"
        />
        <Image
          src="https://www.figma.com/api/mcp/asset/825c475f-9307-4c0a-bbd2-04964809aa41"
          alt="Cat decoration"
          fill
          className="hidden md:block object-cover"
        />
      </div>

      {/* Image 10 - Bottom right */}
      <div className="absolute left-[335px] md:left-auto md:right-10 bottom-10 md:bottom-15 w-[109px] md:w-[280px] h-[71px] md:h-[200px]">
        <Image
          src="https://www.figma.com/api/mcp/asset/a4312bf6-c211-4ae5-9cbc-422cd2b60844"
          alt="Cat decoration"
          fill
          className="object-cover md:hidden"
        />
        <Image
          src="https://www.figma.com/api/mcp/asset/92d355cb-7ec5-439c-82b2-05cac69cebff"
          alt="Cat decoration"
          fill
          className="hidden md:block object-cover"
        />
      </div>

      {/* Image 11 - Bottom */}
      <div className="absolute left-[239px] md:left-auto md:right-[400px] bottom-10 md:bottom-15 w-[56px] md:w-[120px] h-[40px] md:h-[80px]">
        <Image
          src="https://www.figma.com/api/mcp/asset/659d0fa6-d89e-4bda-bc69-6c0beb787b4f"
          alt="Cat decoration"
          fill
          className="object-cover md:hidden"
        />
        <Image
          src="https://www.figma.com/api/mcp/asset/13f79933-56a7-4fcb-ad4d-bc35d51a0b0f"
          alt="Cat decoration"
          fill
          className="hidden md:block object-cover"
        />
      </div>

      {/* Main form content */}
      <div className="relative z-10 flex flex-col items-center gap-[70px] md:gap-[24px] p-[10px] w-full max-w-md md:max-w-none">
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/">
            <h1 className="font-bold text-[40px] md:text-[50px] text-[#390202] md:leading-tight md:mb-[12px] cursor-pointer hover:opacity-80 transition-opacity">
              Log In
            </h1>
          </Link>
          <p className="font-bold text-[18px] text-[#390202]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Signup
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-[30px] md:gap-[28px] items-center px-[30px] md:px-0 w-full">
          <div className="flex flex-col items-center gap-[20px] md:gap-[12px] w-full">
            <label htmlFor="email" className="font-semibold text-[24px] md:text-[20px] text-[#390202] text-center">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full max-w-[332px] md:max-w-[480px] h-[53px] md:h-[60px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[18px] md:rounded-[16px] px-[15px] md:px-[18px] text-[18px] focus:outline-none focus:border-[#3d4ec4]"
            />
          </div>

          <div className="flex flex-col items-center gap-[20px] md:gap-[12px] w-full">
            <label htmlFor="password" className="font-semibold text-[24px] md:text-[20px] text-[#390202] text-center">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full max-w-[332px] md:max-w-[480px] h-[53px] md:h-[60px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[18px] md:rounded-[16px] px-[15px] md:px-[18px] text-[18px] focus:outline-none focus:border-[#3d4ec4]"
            />
          </div>

          <Link href="/main" className="mt-2">
            <div className="bg-[#ff9797] rounded-[14.612px] md:rounded-[12px] px-[60px] md:px-[48px] py-[15px] md:py-[12px] flex items-center justify-center cursor-pointer hover:bg-[#ff8585] transition-colors">
              <p className="font-semibold text-[24px] md:text-[20px] text-black text-center">
                FIND
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
