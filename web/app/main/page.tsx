'use client';

import CatDecoration from '@/components/CatDecoration';
import ChatbotButton from '@/components/ChatbotButton';
import EnvironmentCard from '@/components/EnvironmentCard';
import FeedInput from '@/components/FeedInput';
import FoodMeter from '@/components/FoodMeter';
import Header from '@/components/Header';
import { ChatbotModal, NomsModal, SettingsModal } from '@/components/Modals';
import NomCard from '@/components/NomCard';
import SectionHeader from '@/components/SectionHeader';
import { useCallback, useEffect, useState } from 'react';

export const dynamic = 'force-static';

interface TelemetrySummary {
  weightGrams?: number;
  humidity?: number;
  temperature?: number;
  distanceMm?: number;
  limitSwitchPressed?: boolean;
  bowlLikelyEmpty?: boolean;
  updatedAt?: string;
}

type TelemetryState = TelemetrySummary | null;

type FeedStatus = {
  type: 'success' | 'error';
  message: string;
} | null;

interface TelemetryEndpointResponse {
  summary?: TelemetrySummary | null;
  error?: string;
  [key: string]: unknown;
}

interface ManualFeedResponse {
  ok?: boolean;
  error?: string;
  [key: string]: unknown;
}

interface UpcomingFeeding {
  time: string;
  amount: number;
  note: string;
}

interface FeedingHistoryItem {
  id: string;
  time: string;
  amount: number;
  note: string;
  type: 'automatic' | 'manual';
  timestamp: string;
}

interface FeedingScheduleResponse {
  upcomingFeedings: UpcomingFeeding[];
  feedingHistory: FeedingHistoryItem[];
}

interface SettingsResponse {
  maxBowlCapacity: number;
  defaultTreatAmount: number;
}

export default function MainPage() {
  const [isNomsModalOpen, setIsNomsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false); // Đang cho ăn ?
  const [feedStatus, setFeedStatus] = useState<FeedStatus>(null); // Kết quả cho ăn
  const [telemetry, setTelemetry] = useState<TelemetryState>(null);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);
  const [showCatBubble, setShowCatBubble] = useState(false);
  const [upcomingFeedings, setUpcomingFeedings] = useState<UpcomingFeeding[]>([]);
  const [feedingHistory, setFeedingHistory] = useState<FeedingHistoryItem[]>([]);
  const [settings, setSettings] = useState<SettingsResponse>({ maxBowlCapacity: 500, defaultTreatAmount: 100 });

  const loadTelemetry = useCallback(async () => {
    try {
      const response = await fetch('/api/mqtt/telemetry', { cache: 'no-store' });
      let body: TelemetryEndpointResponse | null = null;

      try {
        body = (await response.json()) as TelemetryEndpointResponse;
      } catch {
        body = null;
      }

      if (!response.ok) {
        throw new Error(body?.error ?? 'Unable to load telemetry');
      }

      return { summary: body?.summary ?? null, error: null as string | null };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load telemetry';
      return { summary: null, error: message };
    }
  }, []);

  useEffect(() => {
    let active = true;

    const poll = async () => {
      const result = await loadTelemetry();
      if (!active) return;
      if (JSON.stringify(result.summary) !== JSON.stringify(telemetry)) {
        setTelemetry(result.summary);
      }
      setTelemetryError(result.error);
    };

    void poll();
    const intervalId = setInterval(() => {
      void poll();
    }, 5000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [loadTelemetry]);

  // Handle cat begging bubble visibility
  useEffect(() => {
    setShowCatBubble(telemetry?.limitSwitchPressed ?? false);
  }, [telemetry?.limitSwitchPressed]);

  // Load feeding schedule
  const loadFeedingSchedule = useCallback(async () => {
    try {
      const response = await fetch('/api/feeding-schedule', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json() as FeedingScheduleResponse;
      setUpcomingFeedings(data.upcomingFeedings || []);
      setFeedingHistory(data.feedingHistory || []);
    } catch (error) {
      console.error('Failed to load feeding schedule:', error);
    }
  }, []);

  useEffect(() => {
    loadFeedingSchedule();
    const intervalId = setInterval(loadFeedingSchedule, 30000); // Refresh every 30 seconds
    return () => clearInterval(intervalId);
  }, [loadFeedingSchedule]);

  // Load settings
  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/settings', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json() as SettingsResponse;
      setSettings({
        maxBowlCapacity: data.maxBowlCapacity || 500,
        defaultTreatAmount: data.defaultTreatAmount || 100,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleFeed = useCallback(async (amount: number) => {
    setFeedStatus(null);
    setIsFeeding(true); // Để nút Feed đổi trạng thái sang đang cho ăn

    try {
      const response = await fetch('/api/mqtt/manual-feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grams: amount }),
      });

      let body: ManualFeedResponse | null = null; // Response từ API
      try {
        body = (await response.json()) as ManualFeedResponse;
      } catch {
        body = null;
      }

      if (!response.ok) {
        throw new Error(body?.error ?? 'Unable to send feed command');
      }

      setFeedStatus({ type: 'success', message: `Command sent for ${amount}g.` });
      //Refresh telemetry data
      const latest = await loadTelemetry();
      setTelemetry(latest.summary);
      setTelemetryError(latest.error);
      await loadFeedingSchedule();
    } catch (error) {
      setFeedStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to trigger feeding.',
      });
    } finally {
      setIsFeeding(false);
    }
  }, [loadTelemetry, loadFeedingSchedule]);

  const maxFoodCapacity = settings.maxBowlCapacity;

  // Calculate percentage from ToF distance (container fullness)
  // ToF measures distance in mm, less distance = more food
  // Assuming: 200mm = empty, 50mm = full (adjust these values based on your container)
  const tofDistanceMm = telemetry?.distanceMm ?? 200;
  const minDistance = 50; // Full container
  const maxDistance = 200; // Empty container
  const foodPercentage = Math.min(100, Math.max(0, Math.round(((maxDistance - tofDistanceMm) / (maxDistance - minDistance)) * 100)));

  // Use loadcell for bowl weight display (not for percentage)
  const currentBowlWeight = Math.max(0, Math.round(telemetry?.weightGrams ?? 0));

  const humidityDisplay = telemetry?.humidity !== undefined && telemetry?.humidity !== null
    ? `${telemetry.humidity.toFixed(1)}%`
    : '--';
  const temperatureDisplay = telemetry?.temperature !== undefined && telemetry?.temperature !== null
    ? `${telemetry.temperature.toFixed(1)}°C`
    : '--';


  useEffect(() => {
    console.log('Telemetry updated:', telemetry);
  }, [telemetry]);

  return (
    <div className="flex flex-col w-full h-screen bg-[#f4dfdf] overflow-y-auto md:overflow-hidden hidden-scrollbar">
      <Header nomCount={1} onSettingsClick={() => setIsSettingsModalOpen(true)} />
      <div className="fixed left-0 md:left-10 bottom-0 z-100 scale-90 md:scale-80">
        <CatDecoration hungry={showCatBubble} />
      </div>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto md:overflow-hidden hidden-scrollbar">
        {/* Main feeding interface */}
        <div className="flex-1 relative flex items-center justify-center flex-col md:min-h-0">
          <div className="relative w-full h-full flex flex-col items-center justify-center md:justify-start pt-8 md:pt-0">
            {/* Food bowl meter */}
            <div className="relative z-100 mt-10 scale-75 md:scale-80 lg:scale-90">
              <FoodMeter
                currentAmount={currentBowlWeight}
                maxAmount={maxFoodCapacity}
                percentage={Number.isFinite(foodPercentage) ? foodPercentage : 0}
              />
            </div>

            {/* Feed input section */}
            <div className="relative z-20 mb-6">
              <FeedInput onFeed={handleFeed} isSubmitting={isFeeding} defaultAmount={settings.defaultTreatAmount} hungry={showCatBubble} />
              {feedStatus && (
                <p
                  className={`mt-3 text-center text-sm ${feedStatus.type === 'error' ? 'text-red-700' : 'text-green-700'}`}
                >
                  {feedStatus.message}
                </p>
              )}
            </div>

            {/* Cat decoration - only visible on desktop */}

          </div>
        </div>

        {/* Right side panel - Environment & Noms */}
        <div className="w-full md:w-[360px] flex flex-col h-full px-5 py-6 md:pt-10 md:pb-1 md:min-h-0">
          {/* Environment cards */}
          <div className="grid grid-cols-2 gap-2.5 w-full mb-4">
            <EnvironmentCard label="Humidity" value={humidityDisplay} />
            <EnvironmentCard label="Temperature" value={temperatureDisplay} />
          </div>

          {telemetryError && (
            <p className="text-sm text-red-700 mb-2">{telemetryError}</p>
          )}

          {/* Noms Sections - Scrollable */}
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto hidden-scrollbar">
            {/* Next Noms Section */}
            <div className="flex flex-col gap-3 mb-4">
              <p className="font-bold text-[24px] text-[#390202]">Next Noms</p>

              {upcomingFeedings.length > 0 ? (
                upcomingFeedings.map((feeding, index) => (
                  <NomCard
                    key={`upcoming-${index}`}
                    time={feeding.time}
                    amount={`${feeding.amount}g`}
                    note={feeding.note}
                    variant="upcoming"
                  />
                ))
              ) : (
                <p className="text-[#390202]/60 text-sm">No upcoming feedings scheduled</p>
              )}
            </div>

            {/* Noms List Section */}
            <div className="flex flex-col gap-4">
              <SectionHeader
                title="Noms List"
              />

              {feedingHistory.length > 0 ? (
                feedingHistory.map((feeding, index) => (
                  <NomCard
                    key={feeding.id}
                    time={feeding.time}
                    amount={`${feeding.amount}g`}
                    note={feeding.note}
                    variant="scheduled"
                    statusColor={feeding.type === 'automatic' ? '#93b7d9' : '#f4dfdf'}
                    onClick={() => setIsNomsModalOpen(true)}
                  />
                ))
              ) : (
                <p className="text-[#390202]/60 text-sm">No feeding history yet</p>
              )}

              <div className='h-30 block md:hidden' />
            </div>
          </div>

        </div>

      </div>

      <ChatbotButton onClick={() => setIsChatbotOpen(true)} />

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
        onSave={() => {
          loadSettings();
          loadFeedingSchedule();
          setIsSettingsModalOpen(false);
        }}
      />
      <ChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />
    </div>
  );
}
