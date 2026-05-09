import { useState } from "react";
import { toast } from "sonner";
import { MeetingPlace } from "@/features/booking/types";
import { saveMeetingPlace, deleteMeetingPlace } from "@/features/booking/actions/places";
import { canManagePlace } from "@/lib/roles";
import { useAdminRole } from "@/components/admin/AdminRoleProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";

export function PlacesTab({
  places,
  setPlaces,
  isRefreshing,
  onRefresh,
  openConfirm,
  wilayahs = [],
}: {
  places: MeetingPlace[];
  setPlaces: React.Dispatch<React.SetStateAction<MeetingPlace[]>>;
  isRefreshing: boolean;
  onRefresh: () => void;
  openConfirm: (title: string, message: string, variant: "default" | "destructive", action: () => Promise<void>) => void;
  wilayahs?: { id: string; name: string; lingkungan?: string[] }[];
}) {
  const { user } = useAdminRole();
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [newPlace, setNewPlace] = useState<{ id?: string, name: string, capacity: number, description: string, isActive: boolean, wilayah_id?: string }>({ name: "", capacity: 10, description: "", isActive: true, wilayah_id: "" });
  
  const [placeSearch, setPlaceSearch] = useState("");
  const [placePage, setPlacePage] = useState(1);
  const PLACE_PAGE_SIZE = 9;

  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlace.name) return toast.error("Nama ruangan harus diisi");

    toast.promise(saveMeetingPlace(newPlace), {
      loading: "Menyimpan ruangan...",
      success: (res) => {
        if (res.success && res.data) {
          setPlaces(prev => {
            if (newPlace.id) {
              return prev.map(p => p.id === newPlace.id ? { ...newPlace, id: res.data, updatedAt: Date.now() } as MeetingPlace : p);
            } else {
              return [...prev, { ...newPlace, id: res.data, createdAt: Date.now(), updatedAt: Date.now() } as MeetingPlace];
            }
          });
        }
        setIsAddPlaceOpen(false);
        setNewPlace({ name: "", capacity: 10, description: "", isActive: true });
        return "Ruangan tersimpan!";
      },
      error: "Gagal menyimpan ruangan",
    });
  };

  const handleDeletePlace = (id: string) => {
    openConfirm("Hapus Ruangan", "Apakah Anda yakin? Ini dapat mempengaruhi peminjaman yang ada untuk ruangan ini.", "destructive", async () => {
      const res = await deleteMeetingPlace(id);
      if (res.success) {
        setPlaces(prev => prev.filter(p => p.id !== id));
        toast.success("Ruangan dihapus");
      } else {
        toast.error("Gagal menghapus ruangan");
      }
    });
  };

  const filteredPlaces = places.filter(p => {
    const q = placeSearch.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
  });
  const placePageCount = Math.max(1, Math.ceil(filteredPlaces.length / PLACE_PAGE_SIZE));
  const pagedPlaces = filteredPlaces.slice((placePage - 1) * PLACE_PAGE_SIZE, placePage * PLACE_PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Kelola Ruangan</h2>
          <div className="flex space-x-2">
            <Button variant="outline" className="bg-white text-blue-500 hover:bg-blue-50 hover:text-blue-600" onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <Dialog open={isAddPlaceOpen} onOpenChange={(open) => {
              setIsAddPlaceOpen(open);
              if (!open) setNewPlace({ name: "", capacity: 10, description: "", isActive: true });
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Ruangan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{newPlace.id ? "Edit Ruangan" : "Tambah Ruang Pertemuan"}</DialogTitle>
                  <DialogDescription>Isi detail ruangan meeting.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSavePlace} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Ruangan</Label>
                    <Input id="name" value={newPlace.name} onChange={e => setNewPlace({ ...newPlace, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Kapasitas (Orang)</Label>
                    <Input id="capacity" type="number" value={newPlace.capacity} onChange={e => setNewPlace({ ...newPlace, capacity: parseInt(e.target.value) || 0 })} min={1} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi (Opsional)</Label>
                    <Textarea id="description" value={newPlace.description} onChange={e => setNewPlace({ ...newPlace, description: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wilayah_id">Wilayah (Territory)</Label>
                    <Select value={newPlace.wilayah_id || ""} onValueChange={(val) => setNewPlace({ ...newPlace, wilayah_id: val === "none" ? "" : val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Wilayah" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak Ada</SelectItem>
                        {wilayahs.map(w => (
                          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">{newPlace.id ? "Simpan Perubahan" : "Simpan Ruangan"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau deskripsi ruangan..."
            value={placeSearch}
            onChange={e => { setPlaceSearch(e.target.value); setPlacePage(1); }}
            className="pl-9 bg-white"
          />
        </div>
      </div>

      {isRefreshing ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardHeader><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2 mt-1" /></CardHeader><CardContent><Skeleton className="h-4 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pagedPlaces.length === 0 ? (
            <p className="text-muted-foreground">{placeSearch ? "Tidak ada hasil yang cocok." : "Belum ada ruangan ditambahkan."}</p>
          ) : (
            pagedPlaces.map(place => (
              <Card key={place.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{place.name}</CardTitle>
                      <CardDescription>Kapasitas: {place.capacity} orang{place.wilayah_id ? ` • Wilayah: ${wilayahs.find(w => w.id === place.wilayah_id)?.name.replace(/^Wilayah\s+/i, '') || place.wilayah_id}` : ""}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{place.description || "Tidak ada deskripsi."}</p>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t justify-end gap-2 p-3">
                  {canManagePlace(user, place) ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => {
                        setNewPlace({ id: place.id, name: place.name, capacity: place.capacity, description: place.description || "", isActive: place.isActive, wilayah_id: place.wilayah_id || "" });
                        setIsAddPlaceOpen(true);
                      }} className="text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700">
                        <Pencil className="w-4 h-4" />
                        Ubah
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeletePlace(place.id!)} className="text-red-500 border-red-200 hover:bg-red-100 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Tidak memiliki akses mengelola ruangan ini</p>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
      {!isRefreshing && placePageCount > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button variant="outline" size="icon" disabled={placePage <= 1} onClick={() => setPlacePage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Halaman {placePage} / {placePageCount}</span>
          <Button variant="outline" size="icon" disabled={placePage >= placePageCount} onClick={() => setPlacePage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
