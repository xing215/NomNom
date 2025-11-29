'use client';

import { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import ChatbotButton from '@/components/ChatbotButton';
import { NomsModal, SettingsModal, ChatbotModal } from '@/components/Modals';

export default function MainPage() {
  const [isNomsModalOpen, setIsNomsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:flex flex-col w-full h-screen bg-[#f4dfdf]">
        <Header nomCount={1} onSettingsClick={() => setIsSettingsModalOpen(true)} />
        
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left side - Main feeding interface */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            {/* Anchor container for cat + bubble */}
            <div className="relative w-full h-full">
              {/* Food bowl bubble positioned above cat */}
              <div className="absolute bottom-[220px] left-1/2 -translate-x-1/2 z-20">
                <div className="relative w-[540px] h-[210px] flex flex-col items-center justify-center pt-[40px]">
                  <div className="absolute left-[60px] top-[40px] w-[450px] h-[170px]">
                    <Image
                      src="https://www.figma.com/api/mcp/asset/5aabd9a8-8969-4832-894b-ea545e716e7c"
                      alt="Food bowl"
                      fill
                      className="object-cover opacity-60"
                    />
                  </div>
                  
                  <div className="absolute left-[32px] top-[24px] w-[480px] h-[190px]">
                    <Image
                      src="https://www.figma.com/api/mcp/asset/a143f520-ae75-49e0-8075-e6103145242b"
                      alt="Food bowl overlay"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <p className="absolute top-[90px] left-1/2 -translate-x-1/2 font-extrabold text-[48px] text-white text-center w-[400px] z-10">
                    200g
                  </p>
                  <p className="absolute top-[128px] right-[168px] font-extrabold text-[28px] text-white text-right w-[240px] z-10">
                    /500
                  </p>
                  
                  <div className="absolute left-[210px] top-0 flex items-center justify-center w-[70px] h-[55px]">
                    <div className="rotate-[348.226deg]">
                      <p className="font-bold text-[28px] text-[#4c5fe3]">53%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add more food section anchored above cat */}
              <div className="absolute bottom-[90px] left-1/2 -translate-x-1/2 z-20 flex flex-col gap-[16px] items-center">
                <p className="font-medium text-[20px] text-[#390202] text-center w-[320px]">
                  Give a lil more ?
                </p>
                <div className="flex gap-[18px] items-center">
                  <input
                    type="number"
                    placeholder="100"
                    className="w-[180px] h-[54px] bg-[#f7cbcb] border-[3px] border-[#4c5fe3] rounded-[14px] px-[16px] text-[18px] focus:outline-none focus:border-[#3d4ec4]"
                  />
                  <button className="bg-[#ff9797] rounded-[12px] px-[40px] py-[12px] w-[110px] hover:bg-[#ff8585] transition-colors">
                    <p className="font-semibold text-[20px] text-black text-center">
                      FEED
                    </p>
                  </button>
                </div>
              </div>

              {/* Cat images */}
              <div className="absolute bottom-0 left-[30px] w-[600px] h-[360px]">
                <Image
                  src="https://www.figma.com/api/mcp/asset/fe24ea05-d1d4-4387-aa2e-0f1113678ee5"
                  alt="Cat"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="absolute bottom-[100px] left-[190px] flex items-center justify-center w-[210px] h-[176px]">
                <div className="rotate-[349.154deg]">
                  <div className="relative w-[190px] h-[144px]">
                    <Image
                      src="https://www.figma.com/api/mcp/asset/e988b5e0-d9f0-4b5c-b7cf-39b626aa7052"
                      alt="Cat decoration"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side panel */}
          <div className="w-[360px] flex flex-col gap-[16px] items-center px-[18px] py-[40px] overflow-y-auto">
            {/* Humidity and Temperature */}
            <div className="grid grid-cols-2 gap-[10px] w-full">
              <div className="relative bg-[#ff9797] rounded-[16px] h-[96px] w-[170px]">
                <p className="absolute top-[6px] left-1/2 -translate-x-1/2 font-normal text-[18px] text-black text-center">
                  Humidity:
                </p>
                <p className="absolute top-[34px] left-1/2 -translate-x-1/2 font-bold text-[32px] text-black text-center w-[150px]">
                  100%
                </p>
              </div>
              <div className="relative bg-[#ff9797] rounded-[16px] h-[96px] w-[170px]">
                <p className="absolute top-[6px] left-1/2 -translate-x-1/2 font-normal text-[18px] text-black text-center">
                  Temperature
                </p>
                <p className="absolute top-[34px] left-1/2 -translate-x-1/2 font-bold text-[32px] text-black text-center w-[150px]">
                  20°
                </p>
              </div>
            </div>

            {/* Next Noms */}
            <p className="font-bold text-[28px] text-[#390202] text-center w-full">
              Next Noms
            </p>
            
            <div className="relative bg-[#ff9797] rounded-[16px] w-full p-[15px] pb-[18px] text-center">
              <p className="font-bold text-[24px] text-black">7am - 500g</p>
              <p className="font-normal text-[16px] text-black">add 300g more</p>
            </div>

            <div className="relative bg-[#ff9797] rounded-[16px] w-full p-[15px] pb-[18px] text-center">
              <p className="font-bold text-[24px] text-black">7am - 500g</p>
              <p className="font-normal text-[16px] text-black">add 300g more</p>
            </div>

            <button 
              onClick={() => setIsNomsModalOpen(true)}
              className="absolute right-[24px] top-[180px] w-[32px] h-[32px] hover:opacity-80 transition-opacity"
            >
              <svg viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="17" fill="#ff9797" stroke="black" strokeWidth="2"/>
                <path d="M18 8 L18 28 M8 18 L28 18" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Noms List */}
            <p className="font-bold text-[28px] text-[#390202] text-center w-full mt-[12px]">
              Noms List
            </p>
            
            <button 
              onClick={() => setIsNomsModalOpen(true)}
              className="relative bg-[#f7cbcb] rounded-[16px] w-full p-[14px] pb-[16px] text-center hover:bg-[#f0c0c0] transition-colors"
            >
              <div className="absolute left-[13px] top-[13px] w-[24px] h-[24px] bg-[#93b7d9] rounded-full" />
              <p className="font-bold text-[22px] text-black">7am - 500g</p>
              <p className="font-normal text-[16px] text-black">add 300g more</p>
            </button>

            <button 
              onClick={() => setIsNomsModalOpen(true)}
              className="relative bg-[#f7cbcb] rounded-[16px] w-full p-[14px] pb-[16px] text-center hover:bg-[#f0c0c0] transition-colors"
            >
              <div className="absolute left-[13px] top-[13px] w-[24px] h-[24px] bg-[#f4dfdf] rounded-full" />
              <p className="font-bold text-[22px] text-black">7am - 500g</p>
              <p className="font-normal text-[16px] text-black">add 300g more</p>
            </button>
          </div>
        </div>

        <ChatbotButton onClick={() => setIsChatbotOpen(true)} />
      </div>

      {/* Mobile Version */}
      <div className="md:hidden flex flex-col w-full min-h-screen bg-[#f4dfdf]">
        <Header nomCount={1} onSettingsClick={() => setIsSettingsModalOpen(true)} />
        
        <div className="flex-1 flex flex-col items-center gap-[10px] px-[23px] py-[30px] overflow-y-auto relative">
          {/* Food bowl display - smaller */}
          <div className="relative w-[365.376px] h-[132px] flex flex-col items-center justify-center pt-[26.4px]">
            <div className="absolute left-[37.49px] top-[26.4px] w-[306.24px] h-[105.6px]">
              <Image
                src="https://www.figma.com/api/mcp/asset/baca9381-d1e2-4709-a17b-7cde030ca185"
                alt="Food bowl"
                fill
                className="object-cover opacity-60"
              />
            </div>
            
            <div className="absolute left-[21.65px] top-[14.78px] w-[322.27px] h-[117.147px]">
              <Image
                src="https://www.figma.com/api/mcp/asset/ef75877e-62fc-42a0-9bbc-f9cb47e93d89"
                alt="Food bowl overlay"
                fill
                className="object-cover"
              />
            </div>

            <p className="absolute top-[54.91px] left-[155.76px] -translate-x-1/2 font-extrabold text-[33.792px] text-white text-center w-[270.336px] z-10">
              200g
            </p>
            <p className="absolute top-[77.62px] left-[253.44px] -translate-x-full font-extrabold text-[19.008px] text-white text-right w-[164.736px] z-10">
              /500
            </p>
          </div>

          {/* Add more food section */}
          <div className="flex flex-col gap-[18.323px] items-center px-[38.845px] py-[25.653px] pb-[39.578px] w-[365px]">
            <p className="font-medium text-[17.59px] text-[#390202] text-center w-[287.309px]">
              Give a lil more ?
            </p>
            <div className="flex gap-[18.323px] items-center">
              <input
                type="number"
                placeholder="100"
                className="w-[156.114px] h-[48.373px] bg-[#f7cbcb] border-[2.199px] border-[#4c5fe3] rounded-[13.193px] px-[15px] text-[17.59px] focus:outline-none focus:border-[#3d4ec4]"
              />
              <button className="bg-[#ff9797] rounded-[10.71px] px-[43.976px] py-[10.994px] w-[87.219px] hover:bg-[#ff8585] transition-colors">
                <p className="font-semibold text-[17.59px] text-black text-center">
                  FEED
                </p>
              </button>
            </div>
          </div>

          {/* Next Noms and Noms List */}
          <div className="flex flex-col gap-[20px] w-full px-[23px]">
            <p className="font-bold text-[36px] text-[#390202] text-center w-full">
              Next Noms
            </p>
            
            <div className="bg-[#ff9797] rounded-[18px] w-full p-[15px] pb-[20px] text-center">
              <p className="font-bold text-[20px] text-black">7am - 500g</p>
              <p className="font-normal text-[16px] text-black">add 300g more</p>
            </div>

            <div className="bg-[#ff9797] rounded-[18px] w-full p-[15px] pb-[20px] text-center">
              <p className="font-bold text-[20px] text-black">7am - 500g</p>
              <p className="font-normal text-[16px] text-black">add 300g more</p>
            </div>

            <p className="font-bold text-[36px] text-[#390202] text-center w-full mt-[20px]">
              Noms List
            </p>
            
            <button 
              onClick={() => setIsNomsModalOpen(true)}
              className="bg-[#f7cbcb] rounded-[18px] w-full p-[15px] pb-[20px] text-center hover:bg-[#f0c0c0] transition-colors"
            >
              <p className="font-bold text-[20px] text-black">7am - 500g</p>
              <p className="font-normal text-[16px] text-black">add 300g more</p>
            </button>

            <button 
              onClick={() => setIsNomsModalOpen(true)}
              className="bg-[#f7cbcb] rounded-[18px] w-full p-[15px] pb-[20px] text-center hover:bg-[#f0c0c0] transition-colors"
            >
              <p className="font-bold text-[20px] text-black">7am - 500g</p>
              <p className="font-normal text-[16px] text-black">add 300g more</p>
            </button>
          </div>

          {/* Cat images */}
          <div className="absolute left-0 top-[690px] w-[373px] h-[227px]">
            <Image
              src="https://www.figma.com/api/mcp/asset/d436b2af-857c-4532-9080-3f1cdb6554ed"
              alt="Cat"
              fill
              className="object-cover"
            />
          </div>

          <div className="absolute left-[95px] top-[644px] flex items-center justify-center w-[193px] h-[160.006px]">
            <div className="rotate-[349.154deg]">
              <div className="relative w-[171.595px] h-[130.04px]">
                <Image
                  src="https://www.figma.com/api/mcp/asset/e98edf7c-07ea-4c5d-9ca2-c03035ab7e18"
                  alt="Cat decoration"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <ChatbotButton onClick={() => setIsChatbotOpen(true)} />
      </div>

      {/* Modals */}
      <NomsModal 
        isOpen={isNomsModalOpen} 
        onClose={() => setIsNomsModalOpen(false)}
        onSave={() => setIsNomsModalOpen(false)}
        onDelete={() => setIsNomsModalOpen(false)}
      />
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={() => setIsSettingsModalOpen(false)}
      />
      <ChatbotModal 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)}
      />
    </>
  );
}
