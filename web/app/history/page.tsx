'use client';

import { useState } from 'react';
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
} from './utils';
import {
  WEEKLY_HISTORY_DATA,
  DEFAULT_WEEK_START,
  buildAvailableWeeks,
} from './data';

const AVAILABLE_WEEKS: WeekOption[] = buildAvailableWeeks();

export const dynamic = 'force-static';

export default function HistoryPage() {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(() => new Date(DEFAULT_WEEK_START));
  const [isWeekDropdownOpen, setIsWeekDropdownOpen] = useState(false);

  const weekKey = toWeekKey(weekStart);
  const activeWeekData = WEEKLY_HISTORY_DATA[weekKey];
  const chartData = activeWeekData?.weekly?.length ? activeWeekData.weekly : createEmptyWeekData();
  const historyEntries = activeWeekData?.history ?? [];
  const weekRangeLabel = formatWeekRange(weekStart);
  const yAxisMax = getYAxisMax(chartData);
  const yAxisTicks = getYAxisTicks(yAxisMax);
  const hasWeekData = Boolean(activeWeekData?.weekly?.length);
  const hasHistoryEntries = Boolean(activeWeekData?.history?.length);

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

  const formatTooltipValue = (value: number | string): [string, string] => [
    `${value}g`,
    'Total',
  ];
  const formatTooltipLabelWithWeek = (label: string) => formatTooltipLabel(String(label), weekStart);

  return (
    <>
      <DesktopHistoryView
        weekRangeLabel={weekRangeLabel}
        availableWeeks={AVAILABLE_WEEKS}
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
      />
      <MobileHistoryView
        weekRangeLabel={weekRangeLabel}
        availableWeeks={AVAILABLE_WEEKS}
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
