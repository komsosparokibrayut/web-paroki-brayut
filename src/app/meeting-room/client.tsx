"use client";

import { useState, useTransition } from "react";
import { MeetingBooking, MeetingPlace, InventoryItem } from "@/features/booking/types";
import { getBookings } from "@/features/booking/actions/bookings";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RefreshCw, ChevronDown, Package, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { AuthView } from "./components/AuthView";
import { BookingDialog } from "./components/BookingDialog";
import { CalendarTab } from "./components/CalendarTab";
import { PendingListTab } from "./components/PendingListTab";
import { BookingDetailModal } from "./components/BookingDetailModal";

export default function MeetingRoomClient({
    isAuthenticated,
    initialBookings,
    places,
    inventoryItems,
    wilayahs = [],
}: {
    isAuthenticated: boolean;
    initialBookings: MeetingBooking[];
    places: MeetingPlace[];
    inventoryItems: InventoryItem[];
    wilayahs?: { id: string; name: string }[];
}) {
    const [isAuth, setIsAuth] = useState(isAuthenticated);
    const [bookings, setBookings] = useState(initialBookings);
    
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [bookingType, setBookingType] = useState<"room" | "inventory">("room");
    
    const [isRefreshing, startRefresh] = useTransition();
    const handleRefresh = () => {
        startRefresh(async () => {
            const fresh = await getBookings();
            setBookings(fresh);
        });
    };

    const [selectedBooking, setSelectedBooking] = useState<MeetingBooking | null>(null);

    if (!isAuth) {
        return <AuthView onSuccess={() => setIsAuth(true)} />;
    }

    return (
        <div className="min-h-screen pt-32 pb-16 bg-brand-warm">
            <div className="container mx-auto px-4 max-w-6xl space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2 border-b-2 border-slate-200">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight text-brand-dark sm:text-5xl">Peminjaman Ruang</h1>
                        <p className="text-muted-foreground text-lg">Cek ketersediaan jadwal dan ajukan peminjaman ruangan atau inventaris.</p>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto">
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button className="bg-brand-dark hover:bg-brand-dark/90 text-white hover:text-white">
                                    Buat Peminjaman
                                    <ChevronDown className="size-4 ml-2 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="bg-white">
                                <DropdownMenuItem onClick={() => { setBookingType("room"); setIsBookingOpen(true); }} className="py-3 cursor-pointer">
                                    <Building2 className="size-4 mr-3 text-brand-blue" />
                                    <span>Ruangan / Gedung</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setBookingType("inventory"); setIsBookingOpen(true); }} className="py-3 cursor-pointer">
                                    <Package className="size-4 mr-3 text-emerald-600" />
                                    <span>Inventaris / Barang</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="outline"
                            className="bg-white text-brand-dark hover:bg-brand-dark/10 hover:text-brand-dark h-11 w-11"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            aria-label="Perbarui data jadwal"
                        >
                            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                        </Button>
                        
                        <BookingDialog
                            open={isBookingOpen}
                            onOpenChange={setIsBookingOpen}
                            defaultBookingType={bookingType}
                            places={places}
                            inventoryItems={inventoryItems}
                            bookings={bookings}
                            wilayahs={wilayahs}
                            onSuccess={handleRefresh}
                        />
                    </div>
                </div>

                <Tabs defaultValue="approved" className="w-full">
                    <TabsList className="mb-4 bg-transparent justify-start border-b rounded-none p-0 h-auto w-full gap-6">
                        <TabsTrigger value="approved" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand-dark rounded-none px-0 py-3 font-semibold text-muted-foreground data-[state=active]:text-brand-dark text-base border-b-2 border-transparent">
                            Jadwal Disahkan
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-brand-dark rounded-none px-0 py-3 font-semibold text-muted-foreground data-[state=active]:text-brand-dark text-base border-b-2 border-transparent">
                            Menunggu Persetujuan
                            <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                                {bookings.filter(b => b.status === "pending").length}
                            </span>
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="approved">
                        <CalendarTab 
                            bookings={bookings} 
                            places={places} 
                            onSelectBooking={setSelectedBooking} 
                        />
                    </TabsContent>
                    
                    <TabsContent value="pending" className="space-y-4">
                        <PendingListTab 
                            bookings={bookings} 
                            places={places} 
                            isRefreshing={isRefreshing} 
                        />
                    </TabsContent>
                </Tabs>
            </div>

            <BookingDetailModal 
                booking={selectedBooking} 
                places={places} 
                onClose={() => setSelectedBooking(null)} 
            />
        </div>
    );
}
