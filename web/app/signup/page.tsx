'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function SignupPage() {
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
            src="https://www.figma.com/api/mcp/asset/95f11669-dd1b-43ff-a652-eef8408beeb5"
            alt="Cat decoration"
            fill
            className="object-cover"
          />
        </div>

        {/* Image 10 - Bottom right */}
        <div className="absolute left-[1216px] top-[745px] w-[181px] h-[119px]">
          <Image
            src="https://www.figma.com/api/mcp/asset/02630d1c-cdf0-4250-ad5a-03915ebf30e1"
            alt="Cat decoration"
            fill
            className="object-cover"
          />
        </div>

        {/* Image 11 - Bottom */}
        <div className="absolute left-[1057px] top-[809px] w-[93px] h-[66px]">
          <Image
            src="https://www.figma.com/api/mcp/asset/d3ddeecd-9288-4cca-ba77-74df162f9592"
            alt="Cat decoration"
            fill
            className="object-cover"
          />
        </div>

        {/* Main form content */}
        <div className="relative z-10 flex flex-col items-center gap-[24px] p-[10px]">
          <div className="text-center">
            <h1 className="font-bold text-[48px] text-[#390202] leading-tight mb-[12px]">
              Sign Up
            </h1>
            <p className="font-bold text-[18px] text-[#390202]">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Login
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-[22px] items-center">
            <div className="flex flex-col gap-[12px] items-center">
              <p className="font-semibold text-[20px] text-[#390202] text-center">
                Name
              </p>
              <input
                type="text"
                className="w-[480px] h-[60px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[16px] px-[18px] text-[18px] focus:outline-none focus:border-[#3d4ec4]"
              />
            </div>

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
            src="https://www.figma.com/api/mcp/asset/62ee227e-98b2-41ca-a83b-f8426af5a51f"
            alt="NomNom Logo"
            fill
            className="object-cover"
          />
        </div>

        {/* Image 9 - Left side */}
        <div className="absolute left-[20px] top-[535px] w-[177px] h-[340px]">
          <Image
            src="https://www.figma.com/api/mcp/asset/08f52c05-a995-445c-b991-cb99f13f07e2"
            alt="Cat decoration"
            fill
            className="object-cover"
          />
        </div>

        {/* Image 10 - Bottom right */}
        <div className="absolute left-[335px] top-[788px] w-[109px] h-[71px]">
          <Image
            src="https://www.figma.com/api/mcp/asset/de228b6e-a01e-458b-9837-73bf805478cb"
            alt="Cat decoration"
            fill
            className="object-cover"
          />
        </div>

        {/* Image 11 - Bottom */}
        <div className="absolute left-[239px] top-[826px] w-[56px] h-[40px]">
          <Image
            src="https://www.figma.com/api/mcp/asset/27fcf04e-342f-4da2-b240-40b240c1ec71"
            alt="Cat decoration"
            fill
            className="object-cover"
          />
        </div>

        {/* Main form content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-[94px] p-[10px]">
          <h1 className="font-bold text-[36px] text-[#390202] text-center w-full">
            Sign Up
          </h1>

          <div className="flex flex-col gap-[40px] items-center px-[30px] w-full">
            <div className="flex flex-col items-center gap-[20px]">
              <p className="font-semibold text-[24px] text-[#390202] text-center">
                Name
              </p>
              <input
                type="text"
                className="w-[332px] h-[53px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[18px] px-[15px] text-[18px] focus:outline-none focus:border-[#3d4ec4]"
              />
            </div>

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
