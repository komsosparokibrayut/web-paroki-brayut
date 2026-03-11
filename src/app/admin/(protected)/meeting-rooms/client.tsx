"use client";

import { useState } from "react";
import { MeetingBooking, MeetingPlace } from "@/features/booking/types";
import { updateBookingStatus, deleteBooking, submitBooking } from "@/features/booking/actions/bookings";
import { saveMeetingPlace, deleteMeetingPlace } from "@/features/booking/actions/places";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle, XCircle, Clock, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PasswordInputWithValidation } from "@/components/ui/password-input-with-validation";

import { setMeetingRoomPassword } from "@/features/booking/actions/auth";

export default function MeetingRoomsClient({
  initialBookings,
  initialPlaces,
  isSuperAdmin,
}: {
  initialBookings: MeetingBooking[];
  initialPlaces: MeetingPlace[];
  isSuperAdmin?: boolean;
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [places, setPlaces] = useState(initialPlaces);
  const router = useRouter();

  // States for Places
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: "", capacity: 10, description: "", isActive: true });

  // States for Bookings
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({
    placeId: "",
    date: "",
    startTime: "",
    endTime: "",
    userName: "",
    userContact: "",
    purpose: ""
  });

  // States for Settings
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getPlaceName = (id: string) => places.find(p => p.id === id)?.name || "Unknown Room";

  const handleApprove = async (id: string) => {
    toast.promise(updateBookingStatus(id, "confirmed"), {
      loading: "Approving booking...",
      success: () => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "confirmed" } : b));
        return "Booking approved!";
      },
      error: "Failed to approve booking",
    });
  };

  const handleReject = async (id: string) => {
    toast.promise(updateBookingStatus(id, "rejected"), {
      loading: "Rejecting booking...",
      success: () => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "rejected" } : b));
        return "Booking rejected";
      },
      error: "Failed to reject booking",
    });
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    toast.promise(deleteBooking(id), {
      loading: "Deleting booking...",
      success: () => {
        setBookings(prev => prev.filter(b => b.id !== id));
        return "Booking deleted";
      },
      error: "Failed to delete booking",
    });
  };

  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlace.name) return toast.error("Place name is required");

    toast.promise(saveMeetingPlace(newPlace), {
      loading: "Saving place...",
      success: (res) => {
        if (res.success && res.data) {
          setPlaces(prev => [...prev, { ...newPlace, id: res.data, createdAt: Date.now(), updatedAt: Date.now() } as MeetingPlace]);
        }
        setIsAddPlaceOpen(false);
        setNewPlace({ name: "", capacity: 10, description: "", isActive: true });
        return "Place saved!";
      },
      error: "Failed to save place",
    });
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.placeId || !newBooking.date || !newBooking.startTime || !newBooking.endTime) {
      return toast.error("Semua field harus diisi");
    }

    toast.promise(submitBooking({ ...newBooking, isAdminDirectCreate: true } as any), {
      loading: "Saving booking...",
      success: (res) => {
        if (res.success && res.data) {
          setBookings(prev => [{
            ...newBooking,
            id: res.data,
            status: "confirmed",
            createdAt: Date.now(),
            updatedAt: Date.now()
          } as MeetingBooking, ...prev]);
        }
        setIsAddBookingOpen(false);
        setNewBooking({ placeId: "", date: "", startTime: "", endTime: "", userName: "", userContact: "", purpose: "" });
        return "Booking created automatically!";
      },
      error: "Failed to create booking",
    });
  };

  const handleDeletePlace = async (id: string) => {
    if (!confirm("Are you sure? This may affect existing bookings for this place.")) return;
    toast.promise(deleteMeetingPlace(id), {
      loading: "Deleting place...",
      success: () => {
        setPlaces(prev => prev.filter(p => p.id !== id));
        return "Place deleted";
      },
      error: "Failed to delete place",
    });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) return toast.error("Password must be at least 8 characters");

    setIsUpdatingPassword(true);
    try {
      const res = await setMeetingRoomPassword(newPassword);
      if (res.success) {
        toast.success("Password updated successfully");
        setNewPassword("");
      } else {
        toast.error(res.error || "Failed to update password");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Ruang</h1>
        <p className="text-muted-foreground">Konfirmasi booking dan manajemen ruang pertemuan.</p>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="places">Ruang Pertemuan</TabsTrigger>
          {isSuperAdmin && <TabsTrigger value="settings">Setting Password</TabsTrigger>}
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Current Bookings</h2>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => router.refresh()}>Refresh Data</Button>
              <Dialog open={isAddBookingOpen} onOpenChange={setIsAddBookingOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Booking
                  </Button>
                </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Booking</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSaveBooking} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="place">Meeting Room</Label>
                    <Select value={newBooking.placeId} onValueChange={(val) => setNewBooking({ ...newBooking, placeId: val })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Room" />
                      </SelectTrigger>
                      <SelectContent>
                        {places.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name} (Cap: {p.capacity})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" value={newBooking.date} onChange={e => setNewBooking({ ...newBooking, date: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start</Label>
                        <Input id="startTime" type="time" value={newBooking.startTime} onChange={e => setNewBooking({ ...newBooking, startTime: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End</Label>
                        <Input id="endTime" type="time" value={newBooking.endTime} onChange={e => setNewBooking({ ...newBooking, endTime: e.target.value })} required />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userName">Booked By (Name / Group)</Label>
                    <Input id="userName" value={newBooking.userName} onChange={e => setNewBooking({ ...newBooking, userName: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userContact">Contact (Phone / WA)</Label>
                    <Input id="userContact" value={newBooking.userContact} onChange={e => setNewBooking({ ...newBooking, userContact: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Textarea id="purpose" value={newBooking.purpose} onChange={e => setNewBooking({ ...newBooking, purpose: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full mt-4">Save Booking</Button>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.length === 0 ? (
              <p className="text-muted-foreground col-span-full">No bookings found.</p>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{getPlaceName(booking.placeId)}</CardTitle>
                        <CardDescription>{booking.date} · {booking.startTime} - {booking.endTime}</CardDescription>
                      </div>
                      <Badge variant={
                        booking.status === "confirmed" ? "default" :
                          booking.status === "rejected" ? "destructive" : "secondary"
                      } className="capitalize">
                        {booking.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-xs text-muted-foreground uppercase">Booked By</span>
                      <p className="font-medium">{booking.userName}</p>
                      <p className="text-muted-foreground">{booking.userContact}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-muted-foreground uppercase">Purpose</span>
                      <p>{booking.purpose}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50 border-t justify-end gap-2 p-3">
                    {booking.status === "pending" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleReject(booking.id)} className="text-red-600">
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => handleApprove(booking.id)} className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteBooking(booking.id)}>
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-600" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="places" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Managed Places</h2>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => router.refresh()}>Refresh Data</Button>
              <Dialog open={isAddPlaceOpen} onOpenChange={setIsAddPlaceOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Place
                  </Button>
                </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Meeting Place</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSavePlace} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Place Name</Label>
                    <Input id="name" value={newPlace.name} onChange={e => setNewPlace({ ...newPlace, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (Persons)</Label>
                    <Input id="capacity" type="number" value={newPlace.capacity} onChange={e => setNewPlace({ ...newPlace, capacity: parseInt(e.target.value) || 0 })} min={1} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea id="description" value={newPlace.description} onChange={e => setNewPlace({ ...newPlace, description: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full">Save Place</Button>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {places.length === 0 ? (
              <p className="text-muted-foreground">No places added yet.</p>
            ) : (
              places.map(place => (
                <Card key={place.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{place.name}</CardTitle>
                        <CardDescription>Capacity: {place.capacity} persons</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{place.description || "No description provided."}</p>
                  </CardContent>
                  <CardFooter className="justify-end border-t p-3 bg-slate-50">
                    <Button variant="ghost" size="sm" onClick={() => handleDeletePlace(place.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {isSuperAdmin && (
          <TabsContent value="settings" className="space-y-4">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Update the shared password used to access the public booking page.</CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdatePassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <PasswordInputWithValidation 
                      value={newPassword} 
                      onChange={setNewPassword} 
                      placeholder="Enter new password"
                      minLength={8}
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t p-4">
                  <Button type="submit" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
