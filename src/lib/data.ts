import { ChurchStatistics, ScheduleEvent, UMKM } from '@/types/data';
import { getFile } from '@/lib/github/operations';

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

export async function getScheduleEvents(): Promise<ScheduleEvent[]> {
  try {
    const fileContent = await getFile('jadwal-kegiatan.json');
    if (!fileContent) return [];
    
    const data = JSON.parse(fileContent);
    // Ensure it's an array
    if (Array.isArray(data)) {
        // Sort by date/time if needed? Maybe nearest future first.
        // For now just return as is or sort by date asc
        const events = data.sort((a: any, b: any) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
        
        // Inject dummy event for testing CTA
        events.push({
            id: "dummy-event-1",
            title: "Festival Kuliner Paroki (Dummy)",
            date: new Date().toISOString().split('T')[0], // Today
            time: "09:00",
            location: "Halaman Gereja",
            category: "Wilayah",
            description: "Festival kuliner tahunan.",
            fileUrl: "",
            imageUrl: "",
            linkUrl: "https://example.com/register-festival"
        });

        return events;
    }
    return [];
  } catch (error) {
    console.error('Error reading jadwal-kegiatan.json:', error);
    return [];
  }
}

export async function getUMKM(): Promise<UMKM[]> {
  try {
    const fileContent = await getFile('umkm.json');
    if (!fileContent) return [];
    
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading umkm.json:', error);
    return [];
  }
}
