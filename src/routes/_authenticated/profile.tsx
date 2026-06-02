import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Home, MapPin, User, LogOut, Heart, CreditCard, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import {
  normalizeSavedLocations,
  serializeSavedLocations,
  type SavedLocation,
} from "@/routes/_authenticated/menu";

const defaultSavedLocations: SavedLocation[] = [
  { id: "home", title: "Home", address: "123 Main Street, Pune", icon: Home },
  { id: "work", title: "Work", address: "Office Park, Mumbai", icon: MapPin },
];

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
});

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const [userName, setUserName] = useState<string>(user?.name ?? "");
  const [userEmail, setUserEmail] = useState<string>(user?.email ?? "");
  const [userPhone, setUserPhone] = useState<string>("");
  const [savedMessage, setSavedMessage] = useState<string>("");
  const [savedAddresses, setSavedAddresses] = useState<SavedLocation[]>([]);
  const [editLocationId, setEditLocationId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editAddress, setEditAddress] = useState<string>("");
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newLocationTitle, setNewLocationTitle] = useState<string>("");
  const [newLocationAddress, setNewLocationAddress] = useState<string>("");

  // Load profile data and addresses from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const rawProfile = localStorage.getItem("tastely_profile");
        if (rawProfile) {
          const parsedProfile = JSON.parse(rawProfile);
          setUserName(parsedProfile.name ?? user?.name ?? "");
          setUserEmail(parsedProfile.email ?? user?.email ?? "");
          setUserPhone(parsedProfile.phone ?? "");
        } else {
          // If no profile in localStorage, use auth user data
          setUserName(user?.name ?? "");
          setUserEmail(user?.email ?? "");
        }

        const loadedAddresses = normalizeSavedLocations(localStorage.getItem("tastely_saved_locations"));
        setSavedAddresses(loadedAddresses);
      } catch (error) {
        console.error("Failed to load profile or addresses from localStorage:", error);
        // Fallback to default or user data
        setUserName(user?.name ?? "");
        setUserEmail(user?.email ?? "");
        setSavedAddresses(defaultSavedLocations);
      }
    }
  }, [user]); // Depend on user to update if auth state changes

  const saveProfile = () => {
    if (typeof window !== "undefined") {
      const payload = { name: userName, email: userEmail, phone: userPhone };
      localStorage.setItem("tastely_profile", JSON.stringify(payload));
      setSavedMessage("Profile saved!");
      toast.success("Profile details updated.");
      setTimeout(() => setSavedMessage(""), 2500);
    }
  };

  const saveLocations = (locations: SavedLocation[]) => {
    setSavedAddresses(locations);
    if (typeof window !== "undefined") {
      localStorage.setItem("tastely_saved_locations", JSON.stringify(serializeSavedLocations(locations)));
    }
  };

  const handleRemoveLocation = (locationId: string) => {
    const chosen = savedAddresses.find((location) => location.id === locationId);
    if (!chosen) return;

    if (!window.confirm(`Remove ${chosen.title} from saved addresses?`)) return;

    const updated = savedAddresses.filter((location) => location.id !== locationId);
    saveLocations(updated);
    toast.success(`${chosen.title} removed.`);
    if (editLocationId === locationId) {
      setEditLocationId(null);
      setEditTitle("");
      setEditAddress("");
    }
  };

  const handleEditLocation = (location: SavedLocation) => {
    setEditLocationId(location.id);
    setEditTitle(location.title);
    setEditAddress(location.address);
    setIsAdding(false);
  };

  const handleSaveEditedLocation = () => {
    if (!editLocationId) return;
    const trimmedTitle = editTitle.trim();
    const trimmedAddress = editAddress.trim();
    if (!trimmedTitle || !trimmedAddress) {
      toast.error("Both title and address are required.");
      return;
    }

    const updated = savedAddresses.map((location) =>
      location.id === editLocationId
        ? { ...location, title: trimmedTitle, address: trimmedAddress }
        : location,
    );

    saveLocations(updated);
    setEditLocationId(null);
    setEditTitle("");
    setEditAddress("");
    toast.success("Address updated.");
  };

  const handleAddNewAddress = () => {
    setIsAdding(true);
    setEditLocationId(null);
    setNewLocationTitle("");
    setNewLocationAddress("");
  };

  const handleSaveNewAddress = () => {
    const trimmedTitle = newLocationTitle.trim();
    const trimmedAddress = newLocationAddress.trim();
    if (!trimmedTitle || !trimmedAddress) {
      toast.error("Both title and address are required.");
      return;
    }

    const newLocation: SavedLocation = {
      id: `${trimmedTitle.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      title: trimmedTitle,
      address: trimmedAddress,
      icon: MapPin,
    };

    saveLocations([...savedAddresses, newLocation]);
    setIsAdding(false);
    setNewLocationTitle("");
    setNewLocationAddress("");
    toast.success("Address added.");
  };

  const handleCancelEdit = () => {
    setEditLocationId(null);
    setEditTitle("");
    setEditAddress("");
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewLocationTitle("");
    setNewLocationAddress("");
  };

  const handleLogout = async () => {
    if (signOut) {
      await signOut();
      toast.info("You have been logged out.");
      // Redirect is handled by AuthLayout after signOut
    } else {
      toast.error("Logout functionality not available.");
    }
  };

  const initials = (userName || userEmail || "").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const summaryStats = [
    { label: "Orders", value: 24, icon: Star },
    { label: "Favorites", value: 12, icon: Heart },
    { label: "Saved cards", value: 2, icon: CreditCard },
    { label: "Saved addresses", value: savedAddresses.length, icon: MapPin },
  ];

  const memberSince = "January 2024";
  const currentAddress = savedAddresses[0]?.address ?? "No delivery address saved";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-8 pb-24 lg:pb-12 max-w-6xl">
        <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-primary/10 text-4xl font-bold text-primary">
                {initials || "U"}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-primary">My profile</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">{userName || "Your Name"}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{userEmail || "yourname@example.com"}</p>
                <p className="mt-1 text-sm text-muted-foreground">Member since {memberSince}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[40%]">
              <Button variant="secondary" className="h-12" onClick={saveProfile}>
                Save profile
              </Button>
              <Button variant="outline" className="h-12" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryStats.map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div key={stat.label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3 text-primary">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                      <StatIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{stat.label}</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Account details</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Personal information</h2>
                </div>
                <p className="text-sm text-muted-foreground">Update your account details for faster checkout.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">Name</Label>
                  <Input
                    id="name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="mt-2"
                    placeholder="e.g., +91 98765 43210"
                  />
                </div>
                <div>
                  <Label htmlFor="member-since" className="text-sm font-medium text-slate-700">Member since</Label>
                  <Input
                    id="member-since"
                    value={memberSince}
                    disabled
                    className="mt-2 bg-slate-100"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Delivery address</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Primary delivery location</h2>
                </div>
                <Button variant="outline" className="h-12" onClick={handleAddNewAddress}>
                  <MapPin className="mr-2 h-4 w-4" /> Add address
                </Button>
              </div>

              {isAdding && (
                <div className="mb-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="new-location-title" className="text-sm font-medium text-slate-700">
                        Address label
                      </Label>
                      <Input
                        id="new-location-title"
                        value={newLocationTitle}
                        onChange={(e) => setNewLocationTitle(e.target.value)}
                        className="mt-2"
                        placeholder="Home / Work / Current Location"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-location-address" className="text-sm font-medium text-slate-700">
                        Full address
                      </Label>
                      <Input
                        id="new-location-address"
                        value={newLocationAddress}
                        onChange={(e) => setNewLocationAddress(e.target.value)}
                        className="mt-2"
                        placeholder="Enter delivery address"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" onClick={handleSaveNewAddress}>
                      Save address
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancelAdd}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {savedAddresses.length > 0 ? (
                  savedAddresses.map((location) => {
                    const Icon = location.icon || MapPin;
                    const isEditing = editLocationId === location.id;
                    return (
                      <div key={location.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <Label htmlFor="edit-title" className="text-sm font-medium text-slate-700">
                                  Label
                                </Label>
                                <Input
                                  id="edit-title"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="mt-2"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-address" className="text-sm font-medium text-slate-700">
                                  Address
                                </Label>
                                <Input
                                  id="edit-address"
                                  value={editAddress}
                                  onChange={(e) => setEditAddress(e.target.value)}
                                  className="mt-2"
                                />
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button variant="secondary" size="sm" onClick={handleSaveEditedLocation}>
                                Save
                              </Button>
                              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm text-primary">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900">{location.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{location.address}</p>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditLocation(location)}>
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleRemoveLocation(location.id)}>
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">No saved addresses yet. Add one to speed up checkout.</p>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Summary</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Tastely overview</h2>
                </div>
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div className="grid gap-3">
                {summaryStats.map((stat) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <StatIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{stat.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Payment</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Saved payment methods</h2>
                </div>
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Visa ending in 1234</p>
                      <p className="text-sm text-muted-foreground">Default payment method</p>
                    </div>
                    <Button variant="ghost" size="sm">Manage</Button>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">PhonePe / Paytm</p>
                      <p className="text-sm text-muted-foreground">Wallet linked</p>
                    </div>
                    <Button variant="ghost" size="sm">Manage</Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Support</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Security & help</h2>
              </div>
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </section>
          </aside>
        </div>
      </main>

      {/* Mobile Navigation (if applicable, copied from menu.tsx for consistency) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[68px] items-center justify-around border-t bg-white pb-1 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.2)] lg:hidden">
        <a
          href="/"
          className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-500 transition-colors hover:text-primary"
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </a>
        <a
          href="/menu"
          className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-500 transition-colors hover:text-primary"
        >
          <MapPin className="h-5 w-5" /> {/* Using MapPin for Menu as a placeholder */}
          <span className="text-[10px] font-medium">Menu</span>
        </a>
        <a
          href="/profile"
          className="flex h-full w-full flex-col items-center justify-center gap-1 text-primary transition-colors"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-bold">Profile</span>
        </a>
      </nav>
    </div>
  );
}