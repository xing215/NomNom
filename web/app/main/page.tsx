'use client';

import { useCallback, useEffect, useState } from 'react';
import { Edit3 } from 'lucide-react';
import Header from '@/components/Header';
import ChatbotButton from '@/components/ChatbotButton';
import FoodMeter from '@/components/FoodMeter';
import FeedInput from '@/components/FeedInput';
import EnvironmentCard from '@/components/EnvironmentCard';
import NomCard from '@/components/NomCard';
import CatDecoration from '@/components/CatDecoration';
import SectionHeader from '@/components/SectionHeader';
import { NomsModal, SettingsModal, ChatbotModal } from '@/components/Modals';

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

export default function MainPage() {
  const [isNomsModalOpen, setIsNomsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);
  const [feedStatus, setFeedStatus] = useState<FeedStatus>(null);
  const [telemetry, setTelemetry] = useState<TelemetryState>(null);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);

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
      setTelemetry(result.summary);
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

  const handleFeed = useCallback(async (amount: number) => {
    setFeedStatus(null);
    setIsFeeding(true);

    try {
      const response = await fetch('/api/mqtt/manual-feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grams: amount }),
      });

      let body: ManualFeedResponse | null = null;
      try {
        body = (await response.json()) as ManualFeedResponse;
      } catch {
        body = null;
      }

      if (!response.ok) {
        throw new Error(body?.error ?? 'Unable to send feed command');
      }

      setFeedStatus({ type: 'success', message: `Command sent for ${amount}g.` });
      const latest = await loadTelemetry();
      setTelemetry(latest.summary);
      setTelemetryError(latest.error);
    } catch (error) {
      setFeedStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to trigger feeding.',
      });
    } finally {
      setIsFeeding(false);
    }
  }, [loadTelemetry]);

  const maxFoodCapacity = 500;
  const currentFoodAmount = Math.max(0, Math.round(telemetry?.weightGrams ?? 0));
  const foodPercentage = Math.min(100, Math.round((currentFoodAmount / maxFoodCapacity) * 100));

  const humidityDisplay = telemetry?.humidity !== undefined && telemetry?.humidity !== null
    ? `${telemetry.humidity.toFixed(1)}%`
    : '--';
  const temperatureDisplay = telemetry?.temperature !== undefined && telemetry?.temperature !== null
    ? `${telemetry.temperature.toFixed(1)}°C`
    : '--';

  return (
    <div className="flex flex-col w-full h-screen bg-[#f4dfdf] overflow-y-auto md:overflow-hidden hidden-scrollbar">
      <Header nomCount={1} onSettingsClick={() => setIsSettingsModalOpen(true)} />
      <div className="fixed left-0 md:left-10 bottom-0 z-100 scale-90 md:scale-80">
         <CatDecoration />
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto md:overflow-hidden hidden-scrollbar">
        {/* Main feeding interface */}
        <div className="flex-1 relative flex items-center justify-center flex-col md:min-h-0">
          <div className="relative w-full h-full flex flex-col items-center justify-center md:justify-start pt-8 md:pt-0">
            {/* Food bowl meter */}
            <div className="relative z-100 mt-10 scale-75 md:scale-80 lg:scale-90">
              <FoodMeter 
                currentAmount={currentFoodAmount}
                maxAmount={maxFoodCapacity}
                percentage={Number.isFinite(foodPercentage) ? foodPercentage : 0}
              />
            </div>

            {/* Feed input section */}
            <div className="relative z-20 mb-6">
              <FeedInput onFeed={handleFeed} isSubmitting={isFeeding} />
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
              <div className="flex items-center justify-between w-full">
                <p className="font-bold text-[24px] text-[#390202]">Next Noms</p>
                <button
                  onClick={() => setIsNomsModalOpen(true)}
                  className="flex items-center justify-center text-[#390202] hover:text-black transition-colors"
                  aria-label="Configure feeding cadence"
                >
                  <Edit3 size={28} strokeWidth={2.5} />
                </button>
              </div>

              <NomCard
                time="7am"
                amount="500g"
                note="add 300g more"
                variant="upcoming"
              />

              <NomCard
                time="7am"
                amount="500g"
                note="add 300g more"
                variant="upcoming"
              />
            </div>

            {/* Noms List Section */}
            <div className="flex flex-col gap-4">
              <SectionHeader 
                title="Noms List" 
              />
              
              <NomCard
                time="7am"
                amount="500g"
                note="add 300g more"
                variant="scheduled"
                statusColor="#93b7d9"
                onClick={() => setIsNomsModalOpen(true)}
              />

              <NomCard
                time="7am"
                amount="500g"
                note="add 300g more"
                variant="scheduled"
                statusColor="#f4dfdf"
                onClick={() => setIsNomsModalOpen(true)}
              />

              <NomCard
                time="8am"
                amount="500g"
                note="add 300g more"
                variant="scheduled"
                statusColor="#93b7d9"
                onClick={() => setIsNomsModalOpen(true)}
              />

              <NomCard
                time="9am"
                amount="500g"
                note="add 300g more"
                variant="scheduled"
                statusColor="#f4dfdf"
                onClick={() => setIsNomsModalOpen(true)}
              />

              <NomCard
                time="10am"
                amount="500g"
                note="add 300g more"
                variant="scheduled"
                statusColor="#93b7d9"
                onClick={() => setIsNomsModalOpen(true)}
              />

              <div className='h-30 block md:hidden'/>
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
        onSave={() => setIsSettingsModalOpen(false)}
      />
      <ChatbotModal 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)}
      />
    </div>
  );
}
