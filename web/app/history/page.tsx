'use client';

import { useState, useEffect } from 'react';
import DesktopHistoryView from './components/DesktopHistoryView';
import MobileHistoryView from './components/MobileHistoryView';
import { SettingsModal, ChatbotModal } from '@/components/Modals';
import {
  createEmptyWeekData,
  formatTooltipLabel,
  formatWeekRange,
  getStartOfIsoWeek,
  getYAxisMax,
  getYAxisTicks,
  shiftDate,
  toWeekKey,
  WeekOption,
  WeekData,
} from './utils';

export const dynamic = 'force-dynamic';

export default function HistoryPage() {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [isWeekDropdownOpen, setIsWeekDropdownOpen] = useState(false);
  const [weeklyData, setWeeklyData] = useState<Record<string, WeekData>>({});
  const [availableWeeks, setAvailableWeeks] = useState<WeekOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  // Fetch feeding history data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/history?weeks=8');
        const data = await response.json();
        
        if (data.weeklyData) {
          setWeeklyData(data.weeklyData);
          
          // Build available weeks list
          const weeks: WeekOption[] = Object.entries(data.weeklyData)
            .map(([key, value]: [string, any]) => ({
              key,
              start: new Date(value.weekStart),
            }))
            .sort((a, b) => b.start.getTime() - a.start.getTime())
            .map((week) => ({
              ...week,
              label: formatWeekRange(week.start),
            }));
          
          setAvailableWeeks(weeks);
        }
      } catch (error) {
        console.error('Failed to fetch feeding history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const weekKey = toWeekKey(weekStart);
  const activeWeekData = weeklyData[weekKey];
  const chartData = activeWeekData?.weekly?.length ? activeWeekData.weekly : createEmptyWeekData();
  
  // Determine which date to display events for
  const allHistoryEntries = activeWeekData?.history ?? [];
  
  // Find the date to display: hover date, or last date with activity, or current day
  let displayDate = selectedDate;
  if (!isHovering || !displayDate) {
    // Not hovering - find last date with activity in this week
    if (allHistoryEntries.length > 0) {
      const sortedEntries = [...allHistoryEntries].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      displayDate = new Date(sortedEntries[0].timestamp);
      displayDate.setHours(0, 0, 0, 0);
    } else {
      // No entries - show current day if in this week, otherwise first day of week
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      if (today >= weekStart && today <= weekEnd) {
        displayDate = today;
      } else {
        displayDate = new Date(weekStart);
      }
    }
  }
  
  // Filter history entries - if hovering show only that day, else show all week
  const historyEntries = isHovering && displayDate
    ? allHistoryEntries
        .filter((entry) => {
          const entryDate = new Date(entry.timestamp);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === displayDate.getTime();
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [...allHistoryEntries].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const weekRangeLabel = formatWeekRange(weekStart);
  const yAxisMax = getYAxisMax(chartData);
  const yAxisTicks = getYAxisTicks(yAxisMax);
  const hasWeekData = Boolean(activeWeekData?.weekly?.length);
  const hasHistoryEntries = Boolean(historyEntries.length);

  const handlePreviousWeek = () => {
    setWeekStart((prev) => shiftDate(prev, -7));
    setIsWeekDropdownOpen(false);
  };

  const handleNextWeek = () => {
    setWeekStart((prev) => shiftDate(prev, 7));
    setIsWeekDropdownOpen(false);
  };

  const handleWeekButtonClick = () => {
    setIsWeekDropdownOpen((prev) => !prev);
  };

  const handleWeekSelect = (key: string) => {
    const nextWeekStart = getStartOfIsoWeek(key);
    setWeekStart(nextWeekStart);
    setIsWeekDropdownOpen(false);
  };

  const handleChartHover = (dayLabel: string | null) => {
    if (!dayLabel) {
      setIsHovering(false);
      return;
    }
    
    setIsHovering(true);
    
    // Convert day label (Mon, Tue, etc.) to date
    const dayIndex = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(dayLabel);
    if (dayIndex === -1) return;
    
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex);
    date.setHours(0, 0, 0, 0);
    setSelectedDate(date);
  };
  
  const handleChartLeave = () => {
    setIsHovering(false);
    setSelectedDate(null);
  };

  const formatTooltipValue = (value: number | string): [string, string] => [
    `${value}g`,
    'Total',
  ];
  const formatTooltipLabelWithWeek = (label: string) => formatTooltipLabel(String(label), weekStart);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feeding history...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DesktopHistoryView
        weekRangeLabel={weekRangeLabel}
        availableWeeks={availableWeeks}
        isWeekDropdownOpen={isWeekDropdownOpen}
        onWeekButtonClick={handleWeekButtonClick}
        onSelectWeek={handleWeekSelect}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        hasWeekData={hasWeekData}
        chartData={chartData}
        yAxisMax={yAxisMax}
        yAxisTicks={yAxisTicks}
        formatTooltipValue={formatTooltipValue}
        formatTooltipLabel={formatTooltipLabelWithWeek}
        historyEntries={historyEntries}
        hasHistoryEntries={hasHistoryEntries}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onChartHover={handleChartHover}
        onChartLeave={handleChartLeave}
        selectedDate={displayDate}
        isHovering={isHovering}
      />
      <MobileHistoryView
        weekRangeLabel={weekRangeLabel}
        availableWeeks={availableWeeks}
        isWeekDropdownOpen={isWeekDropdownOpen}
        onWeekButtonClick={handleWeekButtonClick}
        onSelectWeek={handleWeekSelect}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        hasWeekData={hasWeekData}
        chartData={chartData}
        yAxisMax={yAxisMax}
        yAxisTicks={yAxisTicks}
        formatTooltipValue={formatTooltipValue}
        formatTooltipLabel={formatTooltipLabelWithWeek}
        historyEntries={historyEntries}
        hasHistoryEntries={hasHistoryEntries}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onChartHover={handleChartHover}
        selectedDate={selectedDate}
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
