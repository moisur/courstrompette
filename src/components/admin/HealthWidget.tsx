"use client";

import { useEffect, useState } from "react";
import { Activity, Server, Database } from "lucide-react";

type HealthData = {
  system: {
    uptime: string;
    loadAvg: number[];
    memory: {
      free: string;
      total: string;
      usagePercent: string;
    };
  };
  process: {
    memory: {
      rss: string;
    };
  };
};

export function HealthWidget() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch("/api/admin/system/health");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to fetch health", e);
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="animate-pulse h-20 bg-stone-50 rounded-2xl" />;
  if (!data) return null;

  const usagePercent = parseFloat(data.system.memory.usagePercent);
  const isCritical = usagePercent > 85;

  return (
    <div className={`rounded-2xl border p-4 shadow-sm transition-colors ${isCritical ? 'border-red-200 bg-red-50' : 'border-stone-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className={isCritical ? 'text-red-600' : 'text-amber-600'} />
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Santé Serveur</p>
        </div>
        <span className={`h-2 w-2 rounded-full ${isCritical ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-bold text-stone-600">RAM (VPS)</span>
            <span className={`font-mono ${isCritical ? 'text-red-700 font-bold' : 'text-stone-500'}`}>
              {data.system.memory.usagePercent}
            </span>
          </div>
          <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`} 
              style={{ width: data.system.memory.usagePercent }}
            />
          </div>
        </div>

        <div className="flex justify-between items-end">
            <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase">Charge CPU</p>
                <p className="text-xs font-mono text-stone-600">{(data.system.loadAvg[0]).toFixed(2)}</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-bold text-stone-400 uppercase">Uptime</p>
                <p className="text-xs font-mono text-stone-600">{data.system.uptime}</p>
            </div>
        </div>
      </div>
    </div>
  );
}
