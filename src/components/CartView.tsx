import React, { type ComponentType } from "react";
import {
  Banknote,
  ChevronRight,
  Clock,
  CreditCard,
  Home,
  Loader2,
  MapPin,
  Minus,
  Navigation,
  Plus,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Ticket,
  Truck,
  WalletCards,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { type Food } from "@/data/foods";
import { formatItemDiscountedINR, formatINR, getItemDiscountedPrice } from "@/lib/currency";

export type PaymentMethod = "upi" | "card" | "wallet" | "cod";
export type DeliveryOption = "standard" | "priority" | "scheduled";

export type SavedLocation = {
  id: string;
  title: string;
  address: string;
  icon: ComponentType<{ className?: string }>;
};

export const paymentMethods = [
  {
    id: "upi",
    title: "UPI",
    detail: "Pay instantly with PhonePe, GPay, Paytm",
    icon: Smartphone,
    badge: "Fastest",
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    detail: "Visa, Mastercard, RuPay supported",
    icon: CreditCard,
    badge: "Secure",
  },
  {
    id: "wallet",
    title: "Wallet",
    detail: "Use app wallet balance or rewards",
    icon: WalletCards,
    badge: "Offers",
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    detail: "Pay when your order arrives",
    icon: Banknote,
    badge: "Easy",
  },
] satisfies Array<{
  id: PaymentMethod;
  title: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
  badge: string;
}>;

export const defaultSavedLocations: SavedLocation[] = [
  {
    id: "home",
    title: "Home",
    address: "12, Food Street, Hyderabad",
    icon: Home,
  },
  {
    id: "work",
    title: "Work",
    address: "5th Floor, Tech Park, Hitech City",
    icon: MapPin,
  },
  {
    id: "current",
    title: "Current Location",
    address: "Use live location near you",
    icon: Navigation,
  },
];

type StoredSavedLocation = Pick<SavedLocation, "id" | "title" | "address">;

const savedLocationIcons: Record<string, ComponentType<{ className?: string }>> = {
  home: Home,
  work: MapPin,
  current: Navigation,
};

export const normalizeSavedLocations = (saved: string | null): SavedLocation[] => {
  if (!saved) return defaultSavedLocations;

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return defaultSavedLocations;

    const locations = parsed
      .map((location): SavedLocation | null => {
        if (!location || typeof location !== "object") return null;

        const id = String((location as Partial<StoredSavedLocation>).id ?? "").trim();
        const title = String((location as Partial<StoredSavedLocation>).title ?? "").trim();
        const address = String((location as Partial<StoredSavedLocation>).address ?? "").trim();

        if (!id || !title || !address) return null;

        return {
          id,
          title,
          address,
          icon: savedLocationIcons[id] ?? MapPin,
        };
      })
      .filter((location): location is SavedLocation => location !== null);

    return locations.length > 0 ? locations : defaultSavedLocations;
  } catch {
    return defaultSavedLocations;
  }
};

export const serializeSavedLocations = (locations: SavedLocation[]): StoredSavedLocation[] =>
  locations.map(({ id, title, address }) => ({ id, title, address }));

export const deliveryOptions = [
  {
    id: "standard",
    title: "Standard Delivery",
    detail: "Best value for regular orders",
    eta: "25-30 mins",
    fee: 29,
    icon: Truck,
  },
  {
    id: "priority",
    title: "Priority Delivery",
    detail: "Assigned first to a delivery partner",
    eta: "15-20 mins",
    fee: 49,
    icon: Navigation,
  },
  {
    id: "scheduled",
    title: "Schedule Delivery",
    detail: "Deliver around your preferred time",
    eta: "45-60 mins",
    fee: 19,
    icon: Clock,
  },
] satisfies Array<{
  id: DeliveryOption;
  title: string;
  detail: string;
  eta: string;
  fee: number;
  icon: ComponentType<{ className?: string }>;
}>;

type CartViewProps = {
  cartItems: Array<{ food: Food; qty: number }>;
  count: number;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  taxes: number;
  discountAmount: number;
  total: number;
  isCouponApplied: boolean;
  selectedDelivery: (typeof deliveryOptions)[number];
  selectedLocation: SavedLocation;
  selectedPayment: (typeof paymentMethods)[number];
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  locationId: string;
  setLocationId: (id: string) => void;
  deliveryOption: DeliveryOption;
  setDeliveryOption: (option: DeliveryOption) => void;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  locationQuery: string;
  setLocationQuery: (query: string) => void;
  setLocationError: (error: string | null) => void;
  locationSuggestions: SavedLocation[];
  isFetchingLocation: boolean;
  locationError: string | null;
  savedLocations: SavedLocation[];
  hasValidDeliveryAddress: boolean;
  setIsCartOpen: (open: boolean) => void;
  setIsMapOpen: (open: boolean) => void;
  clear: (id: number) => void;
  remove: (id: number) => void;
  add: (food: Food, showToast?: boolean) => void;
  toggleCoupon: () => void;
  requestGpsLocation: () => void;
  saveTypedLocation: () => void;
  placeOrder: () => void;
  setCart: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  FoodImage: React.ComponentType<{ food: Food; className: string }>;
};

export function CartView({
  cartItems,
  count,
  subtotal,
  deliveryFee,
  platformFee,
  taxes,
  discountAmount,
  total,
  isCouponApplied,
  selectedDelivery,
  selectedLocation,
  selectedPayment,
  paymentMethod,
  setPaymentMethod,
  locationId,
  setLocationId,
  deliveryOption,
  setDeliveryOption,
  deliveryAddress,
  setDeliveryAddress,
  locationQuery,
  setLocationQuery,
  setLocationError,
  locationSuggestions,
  isFetchingLocation,
  locationError,
  savedLocations,
  hasValidDeliveryAddress,
  setIsCartOpen,
  setIsMapOpen,
  clear,
  remove,
  add,
  toggleCoupon,
  requestGpsLocation,
  saveTypedLocation,
  placeOrder,
  setCart,
  FoodImage,
}: CartViewProps) {
  const deliveryAddressText = deliveryAddress || selectedLocation.address;
  const deliveryLocationTitle =
    deliveryAddressText !== selectedLocation.address ? "Custom address" : selectedLocation.title;

  if (cartItems.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto bg-secondary/20 p-3 sm:p-4">
        <div className="flex h-full min-h-[55vh] flex-col items-center justify-center rounded-2xl border border-dashed bg-card p-8 text-center">
          <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <ShoppingCart className="h-10 w-10 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-foreground">Your cart is empty</h3>
          <p className="mb-7 max-w-[260px] text-sm text-muted-foreground">
            Add your favorite dishes and they will appear here with delivery and bill details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-secondary/20 p-3 sm:p-4">
        <div className="space-y-3">
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Checkout progress</p>
                <p className="text-xs text-muted-foreground">
                  Review items, address, payment, and delivery speed
                </p>
              </div>
              <Badge className="rounded-full">{selectedDelivery.eta}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold">
              <div className="rounded-xl bg-primary/10 px-2 py-2 text-primary">Cart</div>
              <div className="rounded-xl bg-primary/10 px-2 py-2 text-primary">Address</div>
              <div className="rounded-xl bg-primary/10 px-2 py-2 text-primary">Pay</div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="font-semibold">Your Order</p>
                <p className="text-xs text-muted-foreground">
                  {count} item{count > 1 ? "s" : ""} from Yummy Gate
                </p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                {selectedDelivery.eta}
              </Badge>
            </div>
            <div className="divide-y">
              {cartItems.map(({ food, qty }) => (
                <div key={food.id} className="flex gap-3 px-4 py-3">
                  <FoodImage food={food} className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-semibold">{food.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatItemDiscountedINR(food.price, food.category)}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 shrink-0 rounded-full text-muted-foreground hover:text-destructive"
                        onClick={() => clear(food.id)}
                        aria-label={`Remove ${food.name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="flex h-8 items-center rounded-md border bg-background">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-md text-destructive"
                          onClick={() => remove(food.id)}
                          aria-label={`Decrease ${food.name}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-7 text-center text-sm font-bold text-primary">{qty}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-md text-primary"
                          onClick={() => add(food, false)}
                          aria-label={`Increase ${food.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <span className="text-sm font-bold">
                        {formatINR(getItemDiscountedPrice(food.price, food.category) * qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="flex w-full items-center justify-between border-t px-4 py-3 text-left text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              <span>Add more items</span>
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div
            className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-primary/50 bg-card p-4 shadow-sm transition-colors hover:bg-primary/5"
            onClick={toggleCoupon}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Ticket className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold">TRYNEW offer</p>
                <p className="truncate text-xs text-muted-foreground">
                  Save up to {formatINR(100)} on this order
                </p>
              </div>
            </div>
            <Button variant={isCouponApplied ? "default" : "outline"} size="sm" className="h-8 rounded-full font-bold">
              {isCouponApplied ? "Applied" : "Apply"}
            </Button>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-semibold">1. Payment Method</p>
                <p className="text-xs text-muted-foreground">Choose how you want to pay</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              className="gap-2"
            >
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;

                return (
                  <Label
                    key={method.id}
                    htmlFor={`payment-${method.id}`}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "hover:bg-secondary/60"
                    }`}
                  >
                    <div
                      className={`rounded-md p-2 ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{method.title}</span>
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                          {method.badge}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{method.detail}</p>
                    </div>
                    <RadioGroupItem id={`payment-${method.id}`} value={method.id} />
                  </Label>
                );
              })}
            </RadioGroup>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-semibold">2. Add Location</p>
                <p className="text-xs text-muted-foreground">Select where we should deliver</p>
              </div>
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-primary">Delivering to</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{deliveryLocationTitle}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {deliveryAddressText}
                  </p>
                </div>
                <Badge variant={hasValidDeliveryAddress ? "secondary" : "outline"} className="shrink-0">
                  {hasValidDeliveryAddress ? "Ready" : "Required"}
                </Badge>
              </div>
            </div>
            <RadioGroup
              value={locationId}
              onValueChange={(value) => {
                const location = savedLocations.find((item) => item.id === value);
                setLocationId(value);
                if (location) {
                  setDeliveryAddress(location.address);
                  setLocationQuery("");
                  setLocationError(null);
                }
              }}
              className="grid gap-2"
            >
              {savedLocations.map((location) => {
                const Icon = location.icon;
                const isSelected = locationId === location.id;

                return (
                  <Label
                    key={location.id}
                    htmlFor={`location-${location.id}`}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "hover:bg-secondary/60"
                    }`}
                  >
                    <div
                      className={`rounded-md p-2 ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium">{location.title}</span>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{location.address}</p>
                    </div>
                    <RadioGroupItem id={`location-${location.id}`} value={location.id} />
                  </Label>
                );
              })}
            </RadioGroup>
            <div className="mt-3 space-y-3">
              <div>
                <Label htmlFor="delivery-address" className="text-xs font-medium text-muted-foreground">
                  Delivery address
                </Label>
                <Input
                  id="delivery-address"
                  className="mt-1"
                  value={deliveryAddress}
                  onChange={(event) => {
                    setDeliveryAddress(event.target.value);
                    setLocationError(null);
                  }}
                  placeholder="Enter house no, street, city"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                <Input
                  id="location-search"
                  value={locationQuery}
                  onChange={(event) => setLocationQuery(event.target.value)}
                  placeholder="Search saved locations"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => setIsMapOpen(true)}>
                  <MapPin className="mr-1 h-4 w-4" /> Map
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={requestGpsLocation}
                  disabled={isFetchingLocation}
                >
                  {isFetchingLocation ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="mr-1 h-4 w-4" />
                  )}
                  {isFetchingLocation ? "Fetching GPS..." : "Use GPS"}
                </Button>
              </div>
              {locationSuggestions.length > 0 && locationQuery.trim() !== "" && (
                <div className="rounded-xl border bg-card p-3">
                  <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                    Suggestions
                  </p>
                  <div className="space-y-2">
                    {locationSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => {
                          setLocationId(suggestion.id);
                          setDeliveryAddress(suggestion.address);
                          setLocationQuery("");
                          setLocationError(null);
                        }}
                        className="w-full rounded-lg border px-3 py-2 text-left text-sm text-foreground hover:border-primary hover:bg-primary/5"
                      >
                        <div className="font-medium">{suggestion.title}</div>
                        <div className="text-xs text-muted-foreground">{suggestion.address}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <Button type="button" variant="secondary" className="w-full" onClick={saveTypedLocation}>
                Save typed address
              </Button>
              {locationError && <p className="text-xs text-destructive">{locationError}</p>}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-semibold">3. Delivery Speed</p>
                <p className="text-xs text-muted-foreground">Pick speed and delivery fee</p>
              </div>
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <RadioGroup
              value={deliveryOption}
              onValueChange={(value) => setDeliveryOption(value as DeliveryOption)}
              className="grid gap-2"
            >
              {deliveryOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = deliveryOption === option.id;
                const optionFee =
                  option.id === "standard" && subtotal >= 499 ? 0 : option.fee;

                return (
                  <Label
                    key={option.id}
                    htmlFor={`delivery-${option.id}`}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "hover:bg-secondary/60"
                    }`}
                  >
                    <div
                      className={`rounded-md p-2 ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{option.title}</span>
                        <span className="text-xs font-semibold">
                          {optionFee === 0 ? "Free" : formatINR(optionFee)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{option.detail}</p>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{option.eta}</span>
                      </div>
                    </div>
                    <RadioGroupItem id={`delivery-${option.id}`} value={option.id} />
                  </Label>
                );
              })}
            </RadioGroup>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">Bill Details</p>
              <ReceiptText className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item total</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery fee</span>
                <span>{deliveryFee === 0 ? "Free" : formatINR(deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform fee</span>
                <span>{formatINR(platformFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes (GST)</span>
                <span>{formatINR(taxes)}</span>
              </div>
              {isCouponApplied && (
                <div className="flex justify-between pb-1 font-medium text-green-600">
                  <span>Item Discount</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{selectedDelivery.title}</span>
                <span>{selectedDelivery.eta}</span>
              </div>
              <div className="flex justify-between text-base font-bold">
                <span>To pay</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 border-t bg-background/95 p-4 shadow-[0_-12px_24px_-16px_rgba(0,0,0,0.35)] backdrop-blur-md">
        <div className="mb-3 flex items-start justify-between gap-3 px-1">
          <div className="min-w-0">
            <span className="block text-xs font-medium text-muted-foreground">
              Paying with <strong className="text-foreground">{selectedPayment.title}</strong>
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              To {deliveryLocationTitle}: {deliveryAddressText}
            </span>
          </div>
          <div className="shrink-0 text-right">
            <span className="block text-[11px] text-muted-foreground">ETA</span>
            <span className="text-xs font-bold text-primary">{selectedDelivery.eta}</span>
          </div>
        </div>
        <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <div className="mb-2 font-semibold text-slate-900">Delivery Address</div>
          <div className="truncate text-xs text-muted-foreground">{deliveryLocationTitle}</div>
          <div className="text-sm font-medium text-slate-900">{deliveryAddressText}</div>
        </div>
        <Button
          className="h-14 w-full justify-between rounded-xl px-5 text-base font-bold shadow-lg shadow-primary/30"
          disabled={!hasValidDeliveryAddress}
          onClick={placeOrder}
        >
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold text-primary-foreground/90 opacity-90">
              {count} item{count > 1 ? "s" : ""}
            </span>
            <span className="text-lg">{formatINR(total)}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            Place Order <ChevronRight className="h-5 w-5" />
          </div>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 w-full text-xs text-muted-foreground"
          onClick={() => setCart({})}
        >
          Empty cart
        </Button>
      </div>
    </>
  );
}
