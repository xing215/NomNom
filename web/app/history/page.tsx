'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import Header from '@/components/Header';
import ChatbotButton from '@/components/ChatbotButton';
import { SettingsModal, ChatbotModal } from '@/components/Modals';

export default function HistoryPage() {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const weeklyData = [
    { day: 'Mon', grams: 450 },
    { day: 'Tue', grams: 320 },
    { day: 'Wed', grams: 380 },
    { day: 'Thu', grams: 340 },
    { day: 'Fri', grams: 310 },
    { day: 'Sat', grams: 420 },
    { day: 'Sun', grams: 360 },
  ];
  const formatTooltipValue = (value: number | string): [string, string] => [
    `${value}g`,
    'Total',
  ];

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:flex flex-col w-full h-screen bg-[#f4dfdf]">
        <Header nomCount={1} onSettingsClick={() => setIsSettingsModalOpen(true)} />
        
        <div className="flex-1 flex flex-col items-center gap-[36px] px-[60px] py-[40px] overflow-y-auto">
          {/* Date selector */}
          <div className="bg-[#ffeaea] rounded-[40px] px-[18px] py-0 flex items-center justify-center">
            <p className="font-normal text-[24px] text-black">
              {'<<   10/11/2025 - 17/11/2025   >>'}
            </p>
          </div>

          {/* Bar Chart */}
          <div className="bg-[#f9d6d6] rounded-[18px] w-full h-[460px] p-[32px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid stroke="#f4bcbc" vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#390202', fontSize: 16 }}
                  axisLine={{ stroke: '#390202', strokeWidth: 3 }}
                  tickLine={{ stroke: '#390202', strokeWidth: 3 }}
                />
                <YAxis
                  tick={{ fill: '#390202', fontSize: 14 }}
                  axisLine={{ stroke: '#390202', strokeWidth: 3 }}
                  tickLine={{ stroke: '#390202', strokeWidth: 3 }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#ffeaea', borderRadius: 12, borderColor: '#ff9797' }}
                  labelStyle={{ color: '#390202', fontWeight: 600 }}
                  formatter={formatTooltipValue}
                />
                <Bar dataKey="grams" fill="#ff9797" radius={[16, 16, 0, 0]} barSize={80} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* History Table */}
          <div className="bg-[#f9d6d6] rounded-[18px] w-full h-[180px] relative overflow-hidden">
            {/* Header row */}
            <div className="absolute left-[50px] top-[26px] flex gap-[80px] items-center">
              <p className="font-normal text-[24px] text-black w-[240px]">Time</p>
              <p className="font-normal text-[24px] text-black">Amount</p>
              <p className="font-normal text-[24px] text-black">Type</p>
            </div>

            {/* Data row */}
            <div className="absolute left-[50px] top-[110px] flex gap-[80px] items-center">
              <p className="font-normal text-[24px] text-black">10/11/2025 - 12:00</p>
              <p className="font-normal text-[24px] text-black w-[100px]">500g</p>
              <p className="font-normal text-[24px] text-black">Scheduled</p>
            </div>

            {/* Separator line */}
            <div className="absolute left-[44px] top-[92px] w-[1100px] h-0 border-t-[1px] border-black" />
          </div>
        </div>

        <ChatbotButton onClick={() => setIsChatbotOpen(true)} />
      </div>

      {/* Mobile Version */}
      <div className="md:hidden flex flex-col w-full min-h-screen bg-[#f4dfdf]">
        <Header nomCount={1} onSettingsClick={() => setIsSettingsModalOpen(true)} />
        
        <div className="flex-1 flex flex-col items-center gap-[20px] px-[20px] py-[26px] overflow-y-auto">
          {/* Date selector */}
          <div className="bg-[#ffeaea] rounded-[40px] px-[18px] py-0 flex items-center justify-center">
            <p className="font-normal text-[18px] text-black">
              {'<<   10/11/2025 - 17/11/2025   >>'}
            </p>
          </div>

          {/* Bar Chart - smaller */}
          <div className="bg-[#f9d6d6] rounded-[8px] w-full h-[220px] p-[20px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 6, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#f4bcbc" vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#390202', fontSize: 14 }}
                  axisLine={{ stroke: '#390202', strokeWidth: 2 }}
                  tickLine={{ stroke: '#390202', strokeWidth: 2 }}
                />
                <YAxis
                  tick={{ fill: '#390202', fontSize: 12 }}
                  axisLine={{ stroke: '#390202', strokeWidth: 2 }}
                  tickLine={{ stroke: '#390202', strokeWidth: 2 }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#ffeaea', borderRadius: 12, borderColor: '#ff9797' }}
                  labelStyle={{ color: '#390202', fontWeight: 600 }}
                  formatter={formatTooltipValue}
                />
                <Bar dataKey="grams" fill="#ff9797" radius={[12, 12, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* History Table - smaller */}
          <div className="bg-[#f9d6d6] rounded-[8px] w-full h-[220px] relative overflow-hidden">
            {/* Header row */}
            <div className="absolute left-[26px] top-[12px] flex gap-[36px] items-center">
              <p className="font-normal text-[13px] text-black w-[105px]">Time</p>
              <p className="font-normal text-[13px] text-black">Amount</p>
              <p className="font-normal text-[13px] text-black">Type</p>
            </div>

            {/* Data row */}
            <div className="absolute left-[26px] top-[48px] flex gap-[36px] items-center">
              <p className="font-normal text-[11px] text-black">10/11/2025 - 12:00</p>
              <p className="font-normal text-[11px] text-black w-[50px]">500g</p>
              <p className="font-normal text-[11px] text-black">Scheduled</p>
            </div>

            {/* Separator line */}
            <div className="absolute left-[22px] top-[40px] w-[320px] h-0 border-t-[0.44px] border-black" />
          </div>
        </div>

        <ChatbotButton onClick={() => setIsChatbotOpen(true)} />
      </div>

      {/* Modals */}
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
