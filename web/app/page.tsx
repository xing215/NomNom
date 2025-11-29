'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:block relative w-full h-screen bg-[#f4dfdf] overflow-hidden">
        {/* Background pink rectangle */}
        <div className="absolute inset-[2.34%_-44.27%_-54.47%_38.68%] flex items-center justify-center">
          <div className="w-[580px] h-[1185px] rotate-[42.97deg] bg-[#f7cbcb]" />
        </div>

        {/* Image 7 - Logo top left */}
        <div className="absolute left-[44px] top-[30px] w-[200px] h-[62px]">
          <Image
            src="https://www.figma.com/api/mcp/asset/c05ab5c8-a236-41c0-9820-c3189fa9c10f"
            alt="NomNom Logo"
            fill
            className="object-cover"
          />
        </div>

        {/* Image 2 - Top right */}
        <div className="absolute left-[calc(50%+160px)] top-[140px] -translate-x-1/2 w-[220px] h-[118px]">
          <Image
            src="https://www.figma.com/api/mcp/asset/c17bcf13-b7bc-4a26-a458-cafbb25f4873"
            alt="Cat decoration"
            fill
            className="object-cover"
          />
        </div>

        {/* Image 3 - Bottom left */}
        <div className="absolute left-[105px] top-[720px] w-[240px] h-[120px]">
          <Image
            src="https://www.figma.com/api/mcp/asset/d936e7cf-c73d-4a2c-b26b-ef5f85890361"
            alt="Cat decoration"
            fill
            className="object-cover"
          />
        </div>

        {/* Main content - Image 4 with text overlay */}
        <div className="absolute left-[22px] top-1/2 -translate-y-1/2">
          <div className="relative flex items-center justify-center w-[640px] h-[520px]">
            <div className="rotate-[8.891deg]">
              <div className="relative w-[580px] h-[432px]">
                <Image
                  src="https://www.figma.com/api/mcp/asset/08db36ff-f0ef-4bd0-aa76-159416f862bf"
                  alt="Hungry cat"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          
          <p className="absolute left-[168px] top-[calc(50%-140px)] font-bold text-[48px] text-[#744d4d] leading-normal">
            I&apos;M HUNGRY!!
          </p>
          
          <Link href="/login">
            <div className="absolute left-[260px] top-1/2 -translate-y-1/2 bg-[#ffc2c2] rounded-[12px] px-[18px] py-[12px] flex items-center justify-center cursor-pointer hover:bg-[#ffb0b0] transition-colors">
              <p className="font-semibold text-[30px] text-black">FEED ME &gt;</p>
            </div>
          </Link>
        </div>

        {/* Image 1 - Right side cat */}
        <div className="absolute right-[-20px] top-[250px] w-[520px] h-[620px]">
          <Image
            src="https://www.figma.com/api/mcp/asset/a8f9b469-032e-40ef-ba7b-74e7a0919402"
            alt="Cat"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden relative w-full h-screen bg-[#f4dfdf] overflow-hidden">
        {/* Background pink rectangle */}
        <div className="absolute bottom-[-859.82px] left-[-106.55%] right-[-162.47%] flex items-center justify-center">
          <div className="w-[716px] h-[1462px] rotate-[42.967deg] bg-[#f7cbcb]" />
        </div>

        {/* Image 7 - Logo top right */}
        <div className="absolute left-[241px] top-[26px] w-[140px] h-[44px]">
          <Image
            src="https://www.figma.com/api/mcp/asset/8772ca63-d8f3-4343-b14e-67f2ba212280"
            alt="NomNom Logo"
            fill
            className="object-cover"
          />
        </div>

        {/* Image 2 - Top left rotated */}
        <div className="absolute left-[-23px] top-[48px] w-[162px] h-[85.89px]">
          <Image
            src="https://www.figma.com/api/mcp/asset/d4e3c3f8-d87e-4bf3-a743-24952b84ef9c"
            alt="Cat decoration"
            fill
            className="object-cover"
          />
        </div>

        {/* Image 8 - Main cat rotated */}
        <div className="absolute left-[-186px] top-0 flex items-center justify-center w-[650.96px] h-[584.105px]">
          <div className="rotate-[14.079deg]">
            <div className="relative w-[555px] h-[463px]">
              <Image
                src="https://www.figma.com/api/mcp/asset/25e869f5-f0e7-4518-8d2d-5eba60c40400"
                alt="Hungry cat"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Text and button */}
        <p className="absolute left-[21px] top-[192.34px] font-bold text-[48.442px] text-[#390202] leading-normal">
          I&apos;M HUNGRY!!
        </p>
        
        <Link href="/login">
          <div className="absolute left-[89.93px] top-[282.65px] bg-[#ffc2c2] rounded-[10.399px] px-[17.332px] py-[10.675px] flex items-center justify-center cursor-pointer hover:bg-[#ffb0b0] transition-colors">
            <p className="font-semibold text-[28.801px] text-black">FEED ME &gt;</p>
          </div>
        </Link>

        {/* Image 3 - Bottom rotated */}
        <div className="absolute bottom-[438.65px] left-[245.01px] flex items-center justify-center w-[151.234px] h-[128.285px]">
          <div className="rotate-[328.689deg]">
            <div className="relative w-[136px] h-[67.429px]">
              <Image
                src="https://www.figma.com/api/mcp/asset/141c7535-51f4-4905-a848-5d24e01e3aa4"
                alt="Cat decoration"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Image 1 - Bottom cat */}
        <div className="absolute bottom-0 left-[56px] w-[409px] h-[478px]">
          <Image
            src="https://www.figma.com/api/mcp/asset/97878c1e-a944-4a35-ab15-215588a4182a"
            alt="Cat"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </>
  );
}

