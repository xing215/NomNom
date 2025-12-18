import Header from '@/components/Header';
import ChatbotButton from '@/components/ChatbotButton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  formatHistoryTimestamp,
  HistoryEntry,
  WeekOption,
  WeeklyChartPoint,
} from '../utils';

type MobileHistoryViewProps = {
  weekRangeLabel: string;
  availableWeeks: WeekOption[];
  isWeekDropdownOpen: boolean;
  onWeekButtonClick: () => void;
  onSelectWeek: (key: string) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  hasWeekData: boolean;
  chartData: WeeklyChartPoint[];
  yAxisMax: number;
  yAxisTicks: number[];
  formatTooltipValue: (value: number | string) => [string, string];
  formatTooltipLabel: (label: string) => string;
  historyEntries: HistoryEntry[];
  hasHistoryEntries: boolean;
  onOpenSettings: () => void;
  onOpenChatbot: () => void;
  onChartHover: (dayLabel: string | null) => void;
  onChartLeave: () => void;
  selectedDate: Date | null;
  isHovering: boolean;
};

export default function MobileHistoryView({
  weekRangeLabel,
  availableWeeks,
  isWeekDropdownOpen,
  onWeekButtonClick,
  onSelectWeek,
  onPreviousWeek,
  onNextWeek,
  hasWeekData,
  chartData,
  yAxisMax,
  yAxisTicks,
  formatTooltipValue,
  formatTooltipLabel,
  historyEntries,
  hasHistoryEntries,
  onOpenSettings,
  onOpenChatbot,
  onChartHover,
  onChartLeave,
  selectedDate,
  isHovering,
}: MobileHistoryViewProps) {
  const formatSelectedDate = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };
  return (
    <div className="md:hidden flex flex-col w-full min-h-screen bg-[#f4dfdf]">
      <Header nomCount={1} onSettingsClick={onOpenSettings} />

      <div className="flex-1 flex flex-col items-center gap-[20px] px-[20px] py-[26px] overflow-y-auto">
        {/* Date selector */}
        <div className="bg-[#ffeaea] rounded-[40px] px-[18px] py-0 flex items-center justify-center gap-[14px] relative min-w-[300px]">
          <button
            type="button"
            onClick={onPreviousWeek}
            className="text-[#390202] text-[18px] font-semibold px-[10px] py-[6px] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9797]"
            aria-label="Previous week"
          >
            {'<<'}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={onWeekButtonClick}
              className="font-normal text-[18px] text-black px-[10px] py-[6px] hover:text-[#390202] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9797]"
              aria-label="Select a week"
            >
              {weekRangeLabel}
            </button>
            {isWeekDropdownOpen && (
              <div className="absolute left-1/2 top-full z-10 mt-[10px] w-[calc(100%+28px)] -translate-x-1/2 rounded-[14px] bg-[#ffeaea] p-[10px] shadow-lg border border-[#ff9797]">
                {availableWeeks.length === 0 ? (
                  <p className="text-center text-[14px] text-[#390202]">No saved weeks</p>
                ) : (
                  <ul className="flex flex-col items-center gap-[6px]">
                    {availableWeeks.map(({ key, label }) => (
                      <li key={key} className="w-full">
                        <button
                          type="button"
                          onClick={() => onSelectWeek(key)}
                          className="w-full rounded-[10px] px-[8px] py-[6px] text-center text-[14px] text-[#390202] hover:bg-[#ffcece] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9797]"
                        >
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onNextWeek}
            className="text-[#390202] text-[18px] font-semibold px-[10px] py-[6px] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff9797]"
            aria-label="Next week"
          >
            {'>>'}
          </button>
        </div>

        {/* Bar Chart - smaller */}
        <div className="bg-[#f9d6d6] rounded-[8px] w-full p-[20px]">
          {hasWeekData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart 
                data={chartData} 
                margin={{ top: 10, right: 6, left: -10, bottom: 0 }}
                onMouseLeave={onChartLeave}
              >
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
                  domain={[0, yAxisMax]}
                  ticks={yAxisTicks}
                  tickCount={yAxisTicks.length}
                  tickMargin={8}
                  interval={0}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#ffeaea', borderRadius: 12, borderColor: '#ff9797' }}
                  labelStyle={{ color: '#390202', fontWeight: 600 }}
                  formatter={formatTooltipValue}
                  labelFormatter={formatTooltipLabel}
                />
                <Bar 
                  dataKey="grams" 
                  fill="#ff9797" 
                  radius={[12, 12, 0, 0]} 
                  barSize={32}
                  onMouseEnter={(data: any) => onChartHover(data.day)}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-[16px] text-[#390202]">
              No data available
            </div>
          )}
        </div>

        {/* History Table - smaller */}
        <div className="bg-[#f9d6d6] rounded-[8px] w-full p-[20px]">
          <div className="mb-3 text-[#390202] font-semibold text-[16px] text-center">
            {isHovering && selectedDate
              ? `Events for ${formatSelectedDate(selectedDate)}`
              : 'Events for this week'}
          </div>
          <div className="mx-auto w-full max-w-[560px] overflow-x-auto">
            <div className="min-w-[360px]">
              <div className="mx-auto flex w-full max-w-[360px] justify-center text-black">
                <p className="w-[160px] text-center font-normal text-[13px]">Time</p>
                <p className="w-[100px] text-center font-normal text-[13px]">Amount</p>
                <p className="w-[100px] text-center font-normal text-[13px]">Type</p>
              </div>

              <div className="mt-[16px] flex flex-col">
                {hasHistoryEntries ? (
                  historyEntries.map((entry, index) => (
                    <div
                      key={`${entry.timestamp}-${index}`}
                      className="mx-auto flex w-full max-w-[360px] justify-center py-[10px] text-black border-b border-black/30 last:border-b-0"
                    >
                      <p className="w-[160px] text-center font-normal text-[11px]">{formatHistoryTimestamp(entry.timestamp)}</p>
                      <p className="w-[100px] text-center font-normal text-[11px]">
                        {entry.eventType === 'begging' ? '—' : `${entry.grams}g`}
                      </p>
                      <p className="w-[100px] text-center font-normal text-[11px]">{entry.type}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[12px] text-center text-[#390202]">No events for this date</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChatbotButton onClick={onOpenChatbot} />
    </div>
  );
}
