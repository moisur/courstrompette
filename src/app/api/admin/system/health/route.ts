import { NextResponse } from 'next/server';
import os from 'os';
import { requireAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Basic security check: only admins can see system health
    await requireAdminSession();

    const memory = process.memoryUsage();
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const loadAvg = os.loadavg();
    const uptime = os.uptime();

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      system: {
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
        loadAvg,
        memory: {
          free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
          total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB`,
          usagePercent: `${((1 - freeMem / totalMem) * 100).toFixed(1)}%`,
        },
      },
      process: {
        memory: {
          rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
          heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        },
      },
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json({ status: 'unauthorized' }, { status: 401 });
  }
}
