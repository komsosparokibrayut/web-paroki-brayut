import { ChurchStatistics, UMKM } from '@/types/data';
import { ScheduleEvent } from '@/features/schedule/types';
import { getFile } from '@/services/github/content';
import { getScheduleEvents as getScheduleFromService, getJadwalMisa } from '@/services/github/schedule';
import { JadwalMisaData } from '@/features/schedule/types';

export async function getChurchStatistics(): Promise<ChurchStatistics | null> {
  try {
    const fileContent = await getFile('statistik.json');
    if (!fileContent) return null;
    return JSON.parse(fileContent) as ChurchStatistics;
  } catch (error) {
    console.error('Error reading statistik.json:', error);
    return null;
  }
}

/**
 * Fetches schedule events using the service layer.
 * Re-exports from @/services/github/schedule for backward compatibility.
 */
export async function getScheduleEvents(): Promise<ScheduleEvent[]> {
  // Delegate to service layer - ScheduleEvent is now an alias for JadwalEvent
  return getScheduleFromService();
}

/**
 * Fetches the Mass Schedule data (Jadwal Misa) including special masses.
 * @returns Promise resolving to JadwalMisaData object, or null if not found.
 */
export async function getJadwalMisaData(): Promise<JadwalMisaData | null> {
  return getJadwalMisa();
}

