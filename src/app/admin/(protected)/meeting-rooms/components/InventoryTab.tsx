import { useState } from "react";
import { toast } from "sonner";
import { InventoryItem } from "@/features/booking/types";
import { saveInventoryItem, deleteInventoryItem } from "@/features/booking/actions/inventory";
import { canManageInventoryItem } from "@/lib/roles";
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

export function InventoryTab({
  inventory,
  setInventory,
  isRefreshing,
  onRefresh,
  openConfirm,
  borrowingStats = {},
  wilayahs = [],
}: {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  isRefreshing: boolean;
  onRefresh: () => void;
  openConfirm: (title: string, message: string, variant: "default" | "destructive", action: () => Promise<void>) => void;
  borrowingStats?: Record<string, { totalHours: number; totalMinutes: number; bookingCount: number }>;
  wilayahs?: { id: string; name: string; lingkungan?: string[] }[];
}) {
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [newInventoryItem, setNewInventoryItem] = useState<{ id?: string, name: string, totalQuantity: number, description: string, isActive: boolean, wilayah_id?: string }>({ name: "", totalQuantity: 1, description: "", isActive: true, wilayah_id: "" });
  
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryPage, setInventoryPage] = useState(1);
  const INV_PAGE_SIZE = 9;
  const { user } = useAdminRole();

  const handleSaveInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInventoryItem.name) return toast.error("Nama barang harus diisi");

    toast.promise(saveInventoryItem(newInventoryItem), {
      loading: "Menyimpan barang...",
      success: (res) => {
        if (res.success && res.data) {
          setInventory(prev => {
            if (newInventoryItem.id) {
              return prev.map(item => item.id === newInventoryItem.id ? { ...newInventoryItem, id: res.data, updatedAt: Date.now() } as InventoryItem : item);
            } else {
              return [...prev, { ...newInventoryItem, id: res.data, createdAt: Date.now(), updatedAt: Date.now() } as InventoryItem];
            }
          });
        }
        setIsAddInventoryOpen(false);
        setNewInventoryItem({ name: "", totalQuantity: 1, description: "", isActive: true });
        return "Barang tersimpan!";
      },
      error: "Gagal menyimpan barang",
    });
  };

  const handleDeleteInventory = (id: string) => {
    openConfirm("Hapus Barang", "Apakah Anda yakin? Ini dapat mempengaruhi data peminjaman inventaris yang lalu.", "destructive", async () => {
      const res = await deleteInventoryItem(id);
      if (res.success) {
        setInventory(prev => prev.filter(p => p.id !== id));
        toast.success("Barang dihapus");
      } else {
        toast.error("Gagal menghapus barang");
      }
    });
  };

  const filteredInventory = inventory.filter(item => {
    const q = inventorySearch.toLowerCase();
    return !q || item.name.toLowerCase().includes(q) || (item.description || "").toLowerCase().includes(q);
  });
  const inventoryPageCount = Math.max(1, Math.ceil(filteredInventory.length / INV_PAGE_SIZE));
  const pagedInventory = filteredInventory.slice((inventoryPage - 1) * INV_PAGE_SIZE, inventoryPage * INV_PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Kelola Inventaris</h2>
          <div className="flex space-x-2">
            <Button variant="outline" className="bg-white text-blue-500 hover:bg-blue-50 hover:text-blue-600" onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <Dialog open={isAddInventoryOpen} onOpenChange={(open) => {
              setIsAddInventoryOpen(open);
              if (!open) setNewInventoryItem({ name: "", totalQuantity: 1, description: "", isActive: true });
            }}>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Barang
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{newInventoryItem.id ? "Edit Barang Inventaris" : "Tambah Barang Inventaris"}</DialogTitle>
                  <DialogDescription>Isi detail barang inventaris.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSaveInventory} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inv-name">Nama Barang</Label>
                    <Input id="inv-name" value={newInventoryItem.name} onChange={e => setNewInventoryItem({ ...newInventoryItem, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inv-qty">Jumlah (Stok Total)</Label>
                    <Input id="inv-qty" type="number" value={newInventoryItem.totalQuantity} onChange={e => setNewInventoryItem({ ...newInventoryItem, totalQuantity: parseInt(e.target.value) || 0 })} min={1} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inv-desc">Deskripsi (Opsional)</Label>
                    <Textarea id="inv-desc" value={newInventoryItem.description} onChange={e => setNewInventoryItem({ ...newInventoryItem, description: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inv-wilayah">Wilayah (Territory)</Label>
                    <Select value={newInventoryItem.wilayah_id || ""} onValueChange={(val) => setNewInventoryItem({ ...newInventoryItem, wilayah_id: val === "none" ? "" : val })}>
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
                  <Button type="submit" className="w-full">{newInventoryItem.id ? "Simpan Perubahan" : "Simpan Barang"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau deskripsi barang..."
            value={inventorySearch}
            onChange={e => { setInventorySearch(e.target.value); setInventoryPage(1); }}
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
          {pagedInventory.length === 0 ? (
            <p className="text-muted-foreground w-full col-span-full">{inventorySearch ? "Tidak ada hasil yang cocok." : "Belum ada barang ditambahkan."}</p>
          ) : (
            pagedInventory.map(item => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{item.name}</CardTitle>
                      <CardDescription>Stok: <span className="font-bold text-foreground">{item.totalQuantity}</span>{item.wilayah_id ? ` • Wilayah: ${wilayahs.find(w => w.id === item.wilayah_id)?.name.replace(/^Wilayah\s+/i, '') || item.wilayah_id}` : ""}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description || "Tidak ada deskripsi."}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-muted-foreground mb-1">Total Durasi Peminjaman:</p>
                    {borrowingStats[item.id] && borrowingStats[item.id].totalHours > 0 ? (
                      <p className="text-sm font-semibold text-brand-dark">
                        {borrowingStats[item.id].totalHours} jam ({borrowingStats[item.id].bookingCount} peminjaman)
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-muted-foreground">Belum Ada Data Peminjaman</p>
                    )}
                  </div>
                  {(item.created_by || item.modified_by) && (
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                      {item.created_by && <span>dibuat oleh: {item.created_by}{item.created_at ? ` (${new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})` : ''}</span>}
                      {item.modified_by && <span> · diubah oleh: {item.modified_by}{item.modified_at ? ` (${new Date(item.modified_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})` : ''}</span>}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="bg-slate-50 border-t justify-end gap-2 p-3">
                  {canManageInventoryItem(user, item) ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => {
                        setNewInventoryItem({ id: item.id, name: item.name, totalQuantity: item.totalQuantity, description: item.description || "", isActive: item.isActive, wilayah_id: item.wilayah_id || "" });
                        setIsAddInventoryOpen(true);
                      }} className="text-blue-600 border-blue-200 hover:bg-blue-100 hover:text-blue-700">
                        <Pencil className="w-4 h-4" />
                        Ubah
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteInventory(item.id!)} className="text-red-500 border-red-200 hover:bg-red-100 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </Button>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">Hanya bisa diedit oleh admin wilayah terkait</p>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
      {!isRefreshing && inventoryPageCount > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button variant="outline" size="icon" disabled={inventoryPage <= 1} onClick={() => setInventoryPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Halaman {inventoryPage} / {inventoryPageCount}</span>
          <Button variant="outline" size="icon" disabled={inventoryPage >= inventoryPageCount} onClick={() => setInventoryPage(p => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
