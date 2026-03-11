"use client";

import { useState } from "react";
import { MeetingBooking, MeetingPlace } from "@/features/booking/types";
import { updateBookingStatus, deleteBooking } from "@/features/booking/actions/bookings";
import { saveMeetingPlace, deleteMeetingPlace } from "@/features/booking/actions/places";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

  // States for Places
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: "", capacity: 10, description: "", isActive: true });

  // States for Settings
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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
      success: () => {
        // Optimistic cache missing ID but forces a reload since this is a quick client rebuild
        setIsAddPlaceOpen(false);
        setTimeout(() => window.location.reload(), 1000); 
        return "Place saved!";
      },
      error: "Failed to save place",
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
    if (!newPassword || newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    
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
        <h1 className="text-3xl font-bold tracking-tight">Meeting Rooms</h1>
        <p className="text-muted-foreground">Approve bookings and manage physical meeting rooms.</p>
      </div>

      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="places">Meeting Places</TabsTrigger>
          {isSuperAdmin && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
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
                    <Input id="name" value={newPlace.name} onChange={e => setNewPlace({...newPlace, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (Persons)</Label>
                    <Input id="capacity" type="number" value={newPlace.capacity} onChange={e => setNewPlace({...newPlace, capacity: parseInt(e.target.value) || 0})} min={1} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea id="description" value={newPlace.description} onChange={e => setNewPlace({...newPlace, description: e.target.value})} />
                  </div>
                  <Button type="submit" className="w-full">Save Place</Button>
                </form>
              </DialogContent>
            </Dialog>
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
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      placeholder="Enter new password"
                      required 
                      minLength={6}
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
