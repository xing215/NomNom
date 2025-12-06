'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="relative w-full h-[90vh] md:h-screen bg-[#f4dfdf] overflow-hidden">
      {/* Background pink rectangle */}
      <div className="absolute bottom-[-859.82px] left-[-106.55%] right-[-162.47%] md:left-[38.68%] md:right-[-44.27%] md:top-[2.34%] md:bottom-[-54.47%] flex items-center justify-center">
        <div className="w-[716px] md:w-[580px] h-[1462px] md:h-[1185px] rotate-[42.967deg] md:rotate-[42.97deg] bg-[#f7cbcb]" />
      </div>

      {/* Image 7 - Logo */}
      <div className="absolute left-[241px] md:left-[44px] top-[26px] md:top-[30px] w-[140px] md:w-[200px] h-[44px] md:h-[62px]">
        <Image
          src="https://www.figma.com/api/mcp/asset/8772ca63-d8f3-4343-b14e-67f2ba212280"
          alt="NomNom Logo"
          fill
          className="object-cover md:hidden"
        />
        <Image
          src="https://www.figma.com/api/mcp/asset/c05ab5c8-a236-41c0-9820-c3189fa9c10f"
          alt="NomNom Logo"
          fill
          className="hidden md:block object-cover"
        />
      </div>

      {/* Image 2 - Top decoration */}
      <div className="absolute left-10 md:left-[calc(60%+160px)] top-[48px] md:top-[60px] md:-translate-x-1/2 w-[162px] md:w-[220px] h-[85.89px] md:h-[118px]">
        <Image
          src="https://www.figma.com/api/mcp/asset/d4e3c3f8-d87e-4bf3-a743-24952b84ef9c"
          alt="Cat decoration"
          fill
          className="object-cover md:hidden"
        />
        <Image
          src="https://www.figma.com/api/mcp/asset/c17bcf13-b7bc-4a26-a458-cafbb25f4873"
          alt="Cat decoration"
          fill
          className="hidden md:block object-cover"
        />
      </div>

      {/* Image 3 - Bottom left fish */}
      <div className="absolute bottom-10 md:bottom-auto md:top-[600px] right-0 md:right-auto md:left-[295px] w-[151.234px] md:w-[240px] h-[128.285px] md:h-[120px]">
        <div className="md:hidden rotate-[328.689deg] w-full h-full flex items-center justify-center">
          <div className="relative w-[136px] h-[67.429px]">
            <Image
              src="https://www.figma.com/api/mcp/asset/141c7535-51f4-4905-a848-5d24e01e3aa4"
              alt="Cat decoration"
              fill
              className="object-cover"
            />
          </div>
        </div>
        <Image
          src="https://www.figma.com/api/mcp/asset/d936e7cf-c73d-4a2c-b26b-ef5f85890361"
          alt="Cat decoration"
          fill
          className="hidden md:block object-cover"
        />
      </div>

      {/* Main content - Speech bubble / Hungry cat */}
      <div className="absolute right-[-60px] md:right-auto md:left-[360px] top-[100px] md:top-[45%] translate-y-1/2 md:-translate-y-1/2 md:translate-x-1/2 w-[370px] md:w-[640px] h-[250px] md:h-[520px]">
        {/* Mobile speech bubble */}
        <div className="md:hidden relative w-full h-full flex items-center justify-center">
          <div className="relative w-[360px] h-[300px]">
            <div className="absolute inset-0 rotate-[14.079deg]">
              <Image
                src="https://www.figma.com/api/mcp/asset/25e869f5-f0e7-4518-8d2d-5eba60c40400"
                alt="Hungry cat"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute inset-[15%] flex flex-col items-center top-20 gap-4 text-center">
              <p className="font-bold text-[32px] text-[#390202] leading-tight">
                I&apos;M HUNGRY!!
              </p>
              <Link href="/login" className="w-full max-w-[170px]">
                <div className="w-full bg-[#ffc2c2] rounded-[10px] px-4 py-2 flex items-center justify-center cursor-pointer hover:bg-[#ffb0b0] transition-colors">
                  <p className="font-semibold text-[20px] text-black">FEED ME &gt;</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop speech bubble */}
        <div className="hidden md:block">
          <div className="relative flex items-center justify-center w-[640px] h-[520px]">
            <div className="rotate-[8.891deg]">
              <div className="relative w-[580px] h-[432px]">
                <Image
                  src="/images/landing-speech.png"
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
            <div className="absolute left-[220px] top-1/2 -translate-y-1/2 bg-[#ffc2c2] rounded-[12px] px-[18px] py-[12px] flex items-center justify-center cursor-pointer hover:bg-[#ffb0b0] transition-colors">
              <p className="font-semibold text-[30px] text-black">FEED ME &gt;</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Image 1 - Right/Bottom cat */}
      <div className="absolute bottom-0 left-0 md:left-auto md:right-0 w-[300px] md:w-[600px] h-[350px] md:h-[720px]">
        <Image
          src="https://www.figma.com/api/mcp/asset/97878c1e-a944-4a35-ab15-215588a4182a"
          alt="Cat"
          fill
          className="object-cover transform scale-x-[-1] md:scale-x-100 md:hidden"
        />
        <Image
          src="https://www.figma.com/api/mcp/asset/a8f9b469-032e-40ef-ba7b-74e7a0919402"
          alt="Cat"
          fill
          className="hidden md:block object-cover"
        />
      </div>
    </div>
  );
}

