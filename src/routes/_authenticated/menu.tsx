import { createFileRoute } from "@tanstack/react-router";
import React, { type ComponentType, useMemo, useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { FOODS, CATEGORIES, type Food } from "@/data/foods";
import { formatINR, formatItemDiscountedINR, getItemDiscountedPrice, getItemDiscountPercent } from "@/lib/currency";
import {
  Banknote,
  Beef,
  CakeSlice,
  Clock,
  CreditCard,
  CupSoda,
  Drumstick,
  Home,
  Heart,
  Loader2,
  MapPin,
  Minus,
  Navigation,
  Pizza,
  Plus,
  ReceiptText,
  RotateCcw,
  Salad,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Soup,
  Truck,
  Ticket,
  Trash2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Star,
  Utensils,
  WalletCards,
  Wheat,
  X,
  Share2,
  Facebook,
  Twitter,
  User,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

// Leaflet and react-leaflet are client-only. They will be dynamically imported inside the map component
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

type Cart = Record<number, number>;
type PaymentMethod = "upi" | "card" | "wallet" | "cod";
type DeliveryOption = "standard" | "priority" | "scheduled";
type CheckoutStep = 0 | 1 | 2 | 3 | 4 | 5;
type QuickFilter = "veg" | "fast" | "deal" | "topRated"; // Removed "southBangalore" | "bannerghatta"
type VoucherMessage = {
  text: string;
  type: "" | "success" | "error";
};
type PostOrderVoucher = {
  code: string;
  text: string;
  amount?: number;
};

type VoucherDefinition = {
  label: string;
  description: string;
  discount: string;
  minSubtotal?: number;
};

const VOUCHER_DEFINITIONS: Record<string, VoucherDefinition> = {
  TRYNEW: {
    label: "TRYNEW",
    description: "New users get 20% off, up to ₹100.",
    discount: "20% off",
  },
  YUMMY25: {
    label: "YUMMY25",
    description: "Save 25% on orders of ₹299 or more, up to ₹125.",
    discount: "25% off",
    minSubtotal: 299,
  },
};

const getVoucherDefinition = (code: string) => VOUCHER_DEFINITIONS[code.toUpperCase()] ?? null;

type RecentOrder = {
  id: number;
  userEmail: string | null;
  items: Array<{ food: Food; qty: number }>;
  total: number;
  paymentTitle: string;
  deliveryTitle: string;
  eta: string;
  address: string;
  placedAt: string;
  status: "Preparing" | "Out for Delivery" | "Delivered" | "Cancelled";
};

export type SavedLocation = {
  id: string;
  title: string;
  address: string;
  icon: ComponentType<{ className?: string }>;
};

// Add these types and data structures for location-based filtering
type DeliveryArea =
  | "jpNagar"
  | "jayanagar"
  | "koramangala"
  | "indiranagar"
  | "bannerghatta"
  | "hSRLayout"
  | "electronicCity"
  | "whitefield"
  | "rajajinagar"
  | "malleshwaram"
  | "basavanagudi"
  | "frazerTown"
  | "richmondTown"
  | "marathahalli"
  | "bellandur"
  | "sarjapurRoad"
  | "yelahanka"
  | "hebbal"
  | "rtNagar"
  | "vijayanagar"
  | "kengeri"
  | "rrNagar"
  | "bommanahalli"
  | "domlur"
  | "cvRamanNagar"
  | "krPuram"
  | "hosurRoad"
  | "magadiRoad"
  | "mysoreRoad"
  | "tumkurRoad"
  | "airportRoad"
  | "devanahalli"
  | "chickpet"
  | "shivajinagar"
  | "vittalMallyaRoad"
  | "lavelleRoad"
  | "mgRoad"
  | "brigadeRoad"
  | "commercialStreet"
  | "churchStreet"
  | "kasturiNagar"
  | "banaswadi"
  | "kalyanNagar"
  | "hrbrLayout"
  | "ramamurthyNagar"
  | "nagarbhavi"
  | "vijayanagar"
  | "bsk"
  | "btmLayout"
  | "arekere"
  | "konanakunte";

interface Shop {
  id: number;
  name: string;
  label: string; // e.g., "JP Nagar"
  area: DeliveryArea;
}

// Mock shop data - In a real app, this would come from an API
const SHOPS: Shop[] = [
  { id: 1, name: "Burger Bliss", label: "JP Nagar", area: "jpNagar" },
  { id: 2, name: "Pizza Palace", label: "Koramangala", area: "koramangala" },
  { id: 3, name: "Spice Route", label: "Bannerghatta Road", area: "bannerghatta" },
  { id: 4, name: "Healthy Bites", label: "Indiranagar", area: "indiranagar" },
  { id: 5, name: "Dosa Delight", label: "Jayanagar", area: "jayanagar" },
  { id: 6, name: "Biryani House", label: "HSR Layout", area: "hSRLayout" },
  { id: 7, name: "Waffle Wonderland", label: "Electronic City", area: "electronicCity" },
  { id: 8, name: "Chaat Corner", label: "Whitefield", area: "whitefield" },
  { id: 9, name: "Rolls & More", label: "Rajajinagar", area: "rajajinagar" },
  { id: 10, name: "Sweet Surrender", label: "Malleshwaram", area: "malleshwaram" },
];

type MenuSearch = {
  success?: boolean;
  canceled?: boolean;
};

type StoredCartItem = {
  name?: unknown;
  quantity?: unknown;
};

type StoredVoucher = {
  code?: unknown;
  applied?: unknown;
};

type ReactLeafletModule = typeof import("react-leaflet");

type LeafletClickEvent = {
  latlng: {
    lat: number;
    lng: number;
  };
};

type NominatimLocationSuggestion = {
  place_id: number | string;
  name?: string;
  display_name: string;
};

const parseSavedCart = (saved: string | null) => {
  if (!saved) return {} as Cart;

  try {
    const parsed = JSON.parse(saved);

    if (Array.isArray(parsed)) {
      return parsed.reduce<Cart>((acc, item) => {
        if (item && typeof item === "object") {
          const { name: savedName, quantity } = item as StoredCartItem;
          const name = String(savedName ?? "");
          const qty = Number(quantity ?? 0);
          const food = FOODS.find((food) => food.name === name);
          if (food && qty > 0) {
            acc[food.id] = Math.max(acc[food.id] || 0, qty);
          }
        }
        return acc;
      }, {} as Cart);
    }

    if (typeof parsed === "object" && parsed !== null) {
      return Object.entries(parsed).reduce<Cart>((acc, [key, value]) => {
        const id = Number(key);
        const qty = Number(value);
        if (!Number.isNaN(id) && qty > 0) {
          acc[id] = qty;
        }
        return acc;
      }, {} as Cart);
    }
  } catch {
    // Ignore malformed saved cart data
  }

  return {} as Cart;
};

const parseSavedVoucher = (saved: string | null) => {
  if (!saved) return { code: "", isApplied: false };

  try {
    const parsed = JSON.parse(saved) as StoredVoucher;
    const code = String(parsed.code ?? "")
      .trim()
      .toUpperCase();
    const isApplied = parsed.applied === true && (code === "TRYNEW" || code === "YUMMY25");

    return {
      code: isApplied ? code : "",
      isApplied,
    };
  } catch {
    return { code: "", isApplied: false };
  }
};

const foodMatchesSearch = (item: Food, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const searchableText = `${item.name} ${item.category} ${item.desc}`.toLowerCase();
  return normalizedQuery.split(/\s+/).every((term) => searchableText.includes(term));
};

export const Route = createFileRoute("/_authenticated/menu")({
  validateSearch: (search: Record<string, unknown>): MenuSearch => ({
    success: search.success === "true" || search.success === true ? true : undefined,
    canceled: search.canceled === "true" || search.canceled === true ? true : undefined,
  }),
  component: MenuPage,
});

const imagePool: Record<string, string[]> = {
  Burgers: [
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1594212202810-b0a18793b584?auto=format&fit=crop&w=500&q=80",
  ],
  Pizza: [
    "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1590947132387-155cc3ddf414?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80",
  ],
  Pasta: [
    "https://images.unsplash.com/photo-1621996311221-3f41aa34e2c0?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1608897013039-887f214b985c?auto=format&fit=crop&w=500&q=80",
  ],
  Mexican: [
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1584345604476-8c8f85f36e84?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=500&q=80",
  ],
  Sushi: [
    "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1583623025817-d180a2221dce?auto=format&fit=crop&w=500&q=80",
  ],
  Chicken: [
    "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=500&q=80",
  ],
  Salads: [
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80",
  ],
  Sides: [
    "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1526230427044-d092040d48dc?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1623238914041-3759714858e6?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1605333396914-232145e54d80?auto=format&fit=crop&w=500&q=80",
  ],
  Desserts: [
    "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=500&q=80",
  ],
  Drinks: [
    "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=500&q=80",
  ],
};

const dishImages: Record<string, string> = {
  "Classic Cheeseburger":
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80",
  "Aloo Tikki Burger":
    "https://images.unsplash.com/photo-1586816001966-79b736744398?auto=format&fit=crop&w=500&q=80",
  "Veggie Burger":
    "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=500&q=80",
  "Double Smash Burger":
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80",
  "Chicken Burger":
    "https://c.ndtvimg.com/2021-12/0okn1nfo_chicken-sandwich_625x300_30_December_21.jpg",
  "Paneer Burger": "https://flatskitchen.com/upload_images/1732947675paneerburger1.png",
  "Hot Dog":
    "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=500&q=80",
  "BBQ Chicken Burger":
    "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=500&q=80",
  "Mushroom Swiss Burger":
    "https://images.unsplash.com/photo-1603064752734-4c48eff53d05?auto=format&fit=crop&w=500&q=80",
  "Mini Slider Duo":
    "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=500&q=80",
  "Margherita Pizza":
    "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=80",
  "Pepperoni Pizza":
    "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80",
  "BBQ Chicken Pizza":
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80",
  "Four Cheese Pizza":
    "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?auto=format&fit=crop&w=500&q=80",
  "Paneer Tikka Pizza":
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80",
  "Corn Cheese Pizza":
    "https://www.midwestliving.com/thmb/oioTJBS7tpmlgnSJ8i4ECNwVaKY=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():focal(1380x0:1382x2):format(webp)/101685028_sweet-corn-pizza-fbe5efe0081548c9b83ed8aa4a2b5887.jpg",
  "Chicken Keema Pizza":
    "https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?auto=format&fit=crop&w=500&q=80",
  "Veggie Supreme Pizza":
    "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=80",
  "Tandoori Mushroom Pizza":
    "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&w=500&q=80",
  "Spaghetti Bolognese":
    "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=500&q=80",
  "Penne Arrabiata":
    "https://images.unsplash.com/photo-1598866594230-a7c12756260f?auto=format&fit=crop&w=500&q=80",
  "Fettuccine Alfredo":
    "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=500&q=80",
  "Mac and Cheese":
    "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=500&q=80",
  "Pesto Pasta":
    "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=500&q=80",
  "Pink Sauce Pasta":
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=500&q=80",
  Lasagna:
    "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=500&q=80",
  "Creamy Mushroom Pasta":
    "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=500&q=80",
  "Chicken Alfredo Pasta":
    "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=500&q=80",
  "Garlic Butter Spaghetti":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Spaghetti_aglio_e_olio.jpg?width=500",
  "Chicken Tacos":
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=500&q=80",
  "Bean Tacos":
    "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=500&q=80",
  "Beef Burrito":
    "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=80",
  "Paneer Burrito":
    "https://images.unsplash.com/photo-1584345604476-8c8f85f36e84?auto=format&fit=crop&w=500&q=80",
  Quesadilla:
    "https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=500&q=80",
  "Nachos Supreme":
    "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=500&q=80",
  "Mexican Rice Bowl":
    "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=500&q=80",
  "Falafel Wrap":
    "https://images.unsplash.com/photo-1547058881-aa0edd92aab3?auto=format&fit=crop&w=500&q=80",
  "Corn Salsa Cup":
    "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=500&q=80",
  "Loaded Taco Fries":
    "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=500&q=80",
  "California Roll":
    "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80",
  "Salmon Nigiri":
    "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=500&q=80",
  "Spicy Tuna Roll":
    "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=500&q=80",
  "Dragon Roll":
    "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=500&q=80",
  "Cucumber Maki":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Maki_Sushi_on_green_leaf_plate.jpg?width=500",
  "Avocado Roll":
    "https://images.unsplash.com/photo-1583623025817-d180a2221dce?auto=format&fit=crop&w=500&q=80",
  "Shrimp Tempura Roll":
    "https://images.unsplash.com/photo-1558985250-27a406d64cb3?auto=format&fit=crop&w=500&q=80",
  "Veg Sushi Platter":
    "https://images.unsplash.com/photo-1562436260-8c9216eeb703?auto=format&fit=crop&w=500&q=80",
  "Chicken Biryani":
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80",
  "Butter Chicken":
    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80",
  "Chicken Tikka":
    "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=500&q=80",
  "Crispy Chicken Wings":
    "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=500&q=80",
  "Chicken Fried Rice":
    "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=500&q=80",
  "Chicken 65":
    "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=500&q=80",
  "Chicken Lollipop":
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=500&q=80",
  "Chicken Shawarma":
    "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=500&q=80",
  "Pepper Chicken":
    "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=500&q=80",
  "Chicken Noodles":
    "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=500&q=80",
  "Tandoori Chicken Half":
    "https://images.unsplash.com/photo-1617692855027-33b14f061079?auto=format&fit=crop&w=500&q=80",
  "Chicken Kathi Roll":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Chicken_Kathi_Roll_(5646735923).jpg?width=500",
  "Caesar Salad":
    "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=500&q=80",
  "Greek Salad":
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80",
  "Cobb Salad":
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=500&q=80",
  "Quinoa Bowl":
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80",
  "Sprout Chaat Salad":
    "https://images.unsplash.com/photo-1631551984968-c7965f8a2e2e?auto=format&fit=crop&w=500&q=80",
  "Watermelon Feta Salad":
    "https://images.unsplash.com/photo-1593018344999-269a233942a4?auto=format&fit=crop&w=500&q=80",
  "Grilled Chicken Salad":
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80",
  "Fruit Salad Cup":
    "https://images.unsplash.com/photo-1490474418585-ba9f522cebee?auto=format&fit=crop&w=500&q=80",
  "French Fries":
    "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=500&q=80",
  "Masala Fries":
    "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=500&q=80",
  "Mozzarella Sticks":
    "https://images.unsplash.com/photo-1531749668029-2db88e4276c7?auto=format&fit=crop&w=500&q=80",
  "Onion Rings":
    "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=500&q=80",
  "Garlic Bread":
    "https://images.unsplash.com/photo-1573140401552-3fab0b24306f?auto=format&fit=crop&w=500&q=80",
  "Cheesy Garlic Bread":
    "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=500&q=80",
  "Loaded Potato Skins":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Loaded_potato_skins_topped_with_cheese_and_bacon_bits_and_served_with_ranch_dressing.jpg/500px-Loaded_potato_skins_topped_with_cheese_and_bacon_bits_and_served_with_ranch_dressing.jpg",
  "Pretzel Bites":
    "https://commons.wikimedia.org/wiki/Special:FilePath/2019-03-10_08_53_47_Serving_of_pretzel_bites_at_the_AMC_Tysons_14_in_Tysons_Corner,_Fairfax_County,_Virginia.jpg?width=500",
  "Corn Cheese Balls":
    "https://www.cubesnjuliennes.com/wp-content/uploads/2020/05/Corn-Cheese-Balls.jpg",
  "Steamed Momos":
    "https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?auto=format&fit=crop&w=500&q=80",
  "Veg Spring Rolls":
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80",
  "Hummus and Pita":
    "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=500&q=80",
  "Chocolate Lava Cake":
    "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80",
  "New York Cheesecake":
    "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=80",
  Tiramisu:
    "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&q=80",
  "Apple Pie":
    "https://images.unsplash.com/photo-1562007908-17c67e878c88?auto=format&fit=crop&w=500&q=80",
  "Ice Cream Sundae":
    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=80",
  "Donut Box (6)":
    "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80",
  "Pancake Stack":
    "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=500&q=80",
  "Gulab Jamun Cup":
    "https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&w=500&q=80",
  "Brownie Bite Box":
    "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=500&q=80",
  "Mango Kulfi":
    "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=500&q=80",
  "Coca-Cola":
    "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80",
  "Fresh Orange Juice":
    "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=500&q=80",
  "Iced Coffee":
    "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80",
  "Strawberry Milkshake":
    "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80",
  "Mango Smoothie":
    "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=500&q=80",
  "Green Tea":
    "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=500&q=80",
  Lemonade:
    "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=500&q=80",
  "Masala Chai":
    "https://images.unsplash.com/photo-1578885146056-db7dd87afad3?auto=format&fit=crop&w=500&q=80",
  "Cold Coffee Frappe":
    "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=500&q=80",
  "Mineral Water":
    "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=500&q=80",
  "Yummy Combo Feast":
    "https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&w=500&q=80",
  "Pizza Party Combo":
    "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=500&q=80",
  "Family Biryani Combo":
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=500&q=80",
  "Snack Attack Combo":
    "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=500&q=80",
  "Dessert Duo Combo":
    "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80",
};

const getCategoryImage = (name: string, category: string) => {
  const match = Object.keys(imagePool).find((k) => k.toLowerCase() === category.toLowerCase());
  const pool = match
    ? imagePool[match]
    : [
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=80",
      ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return pool[Math.abs(hash) % pool.length];
};

const getFoodImage = (name: string, category: string) =>
  dishImages[name] || getCategoryImage(name, category);

const getFoodRating = (id: number) => 4.2 + ((id * 17) % 8) / 10;

const getFoodReviewCount = (id: number) => 80 + ((id * 37) % 420);

const getFoodPrepMinutes = (id: number) => 12 + ((id * 7) % 18);

const getFoodIcon = (food: Food) => {
  if (food.name === "Chicken Burger") return "";
  if (food.emoji) return food.emoji;

  const name = food.name.toLowerCase();

  if (name.includes("brownie")) return "🍫";
  if (name.includes("apple pie")) return "🥧";
  if (name.includes("pretzel")) return "🥨";
  if (name.includes("potato skins")) return "🥔";
  if (name.includes("watermelon")) return "🍉";
  if (name.includes("fruit salad")) return "🍓";
  if (name.includes("grilled chicken salad")) return "🥗";
  if (name.includes("paneer burrito") || name.includes("burrito")) return "🌯";
  if (name.includes("sandwich")) return "🥪";
  if (name.includes("hot dog")) return "🌭";
  if (name.includes("burger") || name.includes("slider")) return "🍔";
  if (name.includes("pizza")) return "🍕";
  if (name.includes("pasta") || name.includes("spaghetti") || name.includes("lasagna")) {
    return "🍝";
  }
  if (name.includes("taco")) return "🌮";
  if (name.includes("quesadilla")) return "🫓";
  if (name.includes("nachos")) return "🧀";
  if (name.includes("rice bowl") || name.includes("fried rice")) return "🍚";
  if (name.includes("sushi") || name.includes("roll") || name.includes("nigiri")) return "🍣";
  if (name.includes("biryani")) return "🍛";
  if (name.includes("butter chicken")) return "🍲";
  if (name.includes("chicken tikka")) return "🍢";
  if (name.includes("chicken") || name.includes("wings")) return "🍗";
  if (name.includes("salad")) return "🥗";
  if (name.includes("fries")) return "🍟";
  if (name.includes("onion rings")) return "🧅";
  if (name.includes("garlic bread")) return "🥖";
  if (name.includes("momos")) return "🥟";
  if (name.includes("hummus")) return "🫓";
  if (name.includes("cake")) return "🍰";
  if (name.includes("cheesecake") || name.includes("tiramisu")) return "🍰";
  if (name.includes("ice cream") || name.includes("kulfi")) return "🍨";
  if (name.includes("donut")) return "🍩";
  if (name.includes("pancake")) return "🥞";
  if (name.includes("gulab jamun")) return "🍮";
  if (name.includes("cola") || name.includes("milkshake") || name.includes("smoothie")) return "🥤";
  if (name.includes("juice")) return "🧃";
  if (name.includes("coffee") || name.includes("chai") || name.includes("tea")) return "☕";
  if (name.includes("lemonade")) return "🍋";
  if (name.includes("water")) return "💧";

  return "🍽️";
};

const getFoodBadge = (food: Food) => ({
  icon: getFoodIcon(food),
  label: food.name,
});

const isVegFood = (food: Food) => {
  const text = `${food.name} ${food.category} ${food.desc}`.toLowerCase();
  return !["bacon", "beef", "chicken", "pepperoni", "salmon", "tuna", "eel", "crab", "wings"].some(
    (keyword) => text.includes(keyword),
  );
};

const quickFilters = [
  {
    id: "veg",
    label: "Pure Veg",
    icon: Salad,
  },
  {
    id: "fast",
    label: "Fast Delivery",
    icon: Clock,
  },
  {
    id: "deal",
    label: "Great Offers",
    icon: Ticket,
  },
  {
    id: "topRated",
    label: "Rating 4.5+",
    icon: Star,
  },
] satisfies Array<{
  id: QuickFilter;
  label: string;
  icon: ComponentType<{ className?: string }>;
}>;


const stripePromise = loadStripe("pk_test_TYooMQauvdEDq54NiTphI7jx");

function StripeCheckoutForm({
  onSuccess,
  onCancel,
  amount,
}: {
  onSuccess: () => void;
  onCancel: () => void;
  amount: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Secure Checkout</h3>
          <ShieldCheck className="h-6 w-6 text-indigo-500" />
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Please enter your card details to pay <strong className="text-slate-900">{amount}</strong>
          .
        </p>
        <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 shadow-inner">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#334155",
                  "::placeholder": { color: "#94a3b8" },
                  fontFamily: "system-ui, sans-serif",
                },
                invalid: { color: "#ef4444" },
              },
            }}
          />
        </div>
        <div className="flex gap-3 pt-6 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-xl h-12"
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 rounded-xl h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
            disabled={!stripe || processing}
          >
            {processing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            {processing ? "Processing..." : `Pay ${amount}`}
          </Button>
        </div>
      </form>
    </div>
  );
}

const categoryIcons: Record<string, ComponentType<{ className?: string }>> = {
  All: Utensils,
  Burgers: Beef,
  Pizza,
  Pasta: Wheat,
  Mexican: Soup,
  Sushi: Soup,
  Chicken: Drumstick,
  Salads: Salad,
  Sides: Utensils,
  Desserts: CakeSlice,
  Drinks: CupSoda,
};

function FoodImage({ food, className }: { food: Food; className: string }) {
  const imageCandidates = useMemo(
    () =>
      Array.from(
        new Set(
          [dishImages[food.name], food.image, getCategoryImage(food.name, food.category)].filter(
            Boolean,
          ) as string[],
        ),
      ),
    [food.category, food.image, food.name],
  );
  const [imageIndex, setImageIndex] = useState(0);
  const failed = imageIndex >= imageCandidates.length;

  useEffect(() => {
    setImageIndex(0);
  }, [food.id, imageCandidates.length]);

  if (failed) {
    return (
      <div className={`${className} bg-secondary/70 flex items-center justify-center text-5xl`}>
        <span aria-label={food.name} role="img">
          {getFoodIcon(food)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageCandidates[imageIndex]}
      alt={food.name}
      className={className}
      loading="lazy"
      onError={() => setImageIndex((current) => current + 1)}
    />
  );
}

function DiscountPrice({ price, category }: { price: number; category?: string }) {
  const discountedPrice = getItemDiscountedPrice(price, category);
  const percent = getItemDiscountPercent(price, category);

  return (
    <span className="flex flex-wrap items-baseline gap-2">
      <span className="font-bold text-primary">{formatItemDiscountedINR(price, category)}</span>
      {discountedPrice < price && (
        <>
          <span className="text-xs text-muted-foreground line-through">{formatINR(price)}</span>
          <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            {percent}% off
          </span>
        </>
      )}
    </span>
  );
}

const paymentMethods = [
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

const defaultSavedLocations: SavedLocation[] = [
  {
    id: "home",
    title: "Home",
    address: "12, JP Nagar 7th Phase, Bangalore South, Bengaluru",
    icon: Home,
  },
  {
    id: "work",
    title: "Work",
    address: "5th Floor, Bannerghatta Road, Bilekahalli, Bengaluru",
    icon: MapPin,
  },
];

export type StoredSavedLocation = Pick<SavedLocation, "id" | "title" | "address">;

const savedLocationIcons: Record<string, ComponentType<{ className?: string }>> = {
  home: Home,
  work: MapPin,
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

        if (!id || !title || !address || id === "current") return null;

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

const deliveryOptions = [
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

const checkoutSteps = [
  { title: "Review your bag", shortTitle: "Bag", icon: ShoppingCart },
  { title: "Choose delivery location", shortTitle: "Location", icon: MapPin },
  { title: "Confirm address and speed", shortTitle: "Delivery", icon: Truck },
  { title: "Choose payment method", shortTitle: "Pay", icon: ShieldCheck },
  { title: "Review order details", shortTitle: "Review", icon: ReceiptText },
  { title: "Place your order", shortTitle: "Done", icon: CheckCircle2 },
] satisfies Array<{
  title: string;
  shortTitle: string;
  icon: ComponentType<{ className?: string }>;
}>;

// Helper to get shop for a food item (mock logic)
const getRecommendedShop = (food: Food): Shop => {
  // Distribute foods across shops for demonstration
  const shopId = (food.id % SHOPS.length) + 1;
  return SHOPS.find((shop) => shop.id === shopId) || SHOPS[0];
};

// Helper to determine delivery area from address (mock logic)
const getDeliveryAreaFromAddress = (address: string): DeliveryArea => {
  const lowerCaseAddress = address.toLowerCase();
  if (lowerCaseAddress.includes("jp nagar")) return "jpNagar";
  if (lowerCaseAddress.includes("jayanagar")) return "jayanagar";
  if (lowerCaseAddress.includes("koramangala")) return "koramangala";
  if (lowerCaseAddress.includes("indiranagar")) return "indiranagar";
  if (lowerCaseAddress.includes("bannerghatta")) return "bannerghatta";
  if (lowerCaseAddress.includes("hsr layout")) return "hSRLayout";
  if (lowerCaseAddress.includes("electronic city")) return "electronicCity";
  if (lowerCaseAddress.includes("whitefield")) return "whitefield";
  if (lowerCaseAddress.includes("rajajinagar")) return "rajajinagar";
  if (lowerCaseAddress.includes("malleshwaram")) return "malleshwaram";
  if (lowerCaseAddress.includes("basavanagudi")) return "basavanagudi";
  // Add more Bangalore areas as needed
  return "jpNagar"; // Default to JP Nagar if no specific area is found
};

function MenuPage() {
  const isClient = typeof window !== "undefined";
  const savedVoucher = isClient
    ? parseSavedVoucher(localStorage.getItem("tastely_applied_voucher"))
    : { code: "", isApplied: false };
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [activeQuickFilters, setActiveQuickFilters] = useState<QuickFilter[]>([]);
  const foodSearchInputRef = useRef<HTMLInputElement>(null);
  const [cart, setCart] = useState<Cart>({} as Cart);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(defaultSavedLocations);
  const [locationId, setLocationId] = useState(defaultSavedLocations[0].id);
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>("standard");
  const [deliveryAddress, setDeliveryAddress] = useState(defaultSavedLocations[0].address);
  const [locationQuery, setLocationQuery] = useState("");
  const [apiLocationSuggestions, setApiLocationSuggestions] = useState<SavedLocation[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>(0);
  const [zoomedFood, setZoomedFood] = useState<Food | null>(null);
  const [voucherCode, setVoucherCode] = useState(savedVoucher.code);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState(savedVoucher.code);
  const [voucherMessage, setVoucherMessage] = useState<VoucherMessage>({ text: "", type: "" });
  const [isCouponApplied, setIsCouponApplied] = useState(savedVoucher.isApplied);
  const [postOrderVoucher, setPostOrderVoucher] = useState<PostOrderVoucher | null>(null);
  const [lastAddedId, setLastAddedId] = useState<number | null>(null);
  const [cartPulse, setCartPulse] = useState(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const { user } = useAuth();
  const currentUserEmail = user?.email?.toLowerCase() ?? null;

  const parseSavedRecentOrders = (): RecentOrder[] => {
    if (!isClient) return [];
    try {
      const saved = localStorage.getItem("tastely_recent_orders");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const filterOrdersForUser = (orders: RecentOrder[], email: string | null) =>
    email ? orders.filter((order) => order.userEmail?.toLowerCase() === email) : [];

  const [favorites, setFavorites] = useState<Record<number, boolean>>(() => {
    if (!isClient) return {};
    try {
      const saved = localStorage.getItem("tastely_favorites");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  // State to track if the first-time user coupon has been *initially* offered/applied
  const [hasOfferedFirstTimeCoupon, setHasOfferedFirstTimeCoupon] = useState<boolean>(() => {
    if (!isClient) return false;
    return localStorage.getItem("tastely_first_time_coupon_offered") === "true";
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [activeOrder, setActiveOrder] = useState<RecentOrder | null>(null);

  const { success, canceled } = Route.useSearch();
  const navigate = Route.useNavigate();

  // Determine if it's a first-time user for the currently signed-in account
  const isFirstTimeUser = useMemo(() => recentOrders.length === 0, [recentOrders]);
  useEffect(() => {
    if (success) {
      setCart({});
      toast.success("Payment successful! Your order has been placed.");
      navigate({
        search: (prev: MenuSearch) => ({ ...prev, success: undefined, canceled: undefined }),
        replace: true,
      });
    } else if (canceled) {
      setCart({});
      setIsCartOpen(false);
      toast.error("Payment was canceled. You can try again when you're ready.");
      navigate({
        search: (prev: MenuSearch) => ({ ...prev, success: undefined, canceled: undefined }),
        replace: true,
      });
    }
  }, [success, canceled, navigate]);

  useEffect(() => {
    if (!isClient) return;
    const locations = normalizeSavedLocations(localStorage.getItem("tastely_saved_locations"));
    setSavedLocations(locations);
    setDeliveryAddress(locations[0].address);
    setLocationId(locations[0].id);
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    if (!currentUserEmail) {
      setRecentOrders([]);
      setActiveOrder(null);
      return;
    }
    const allOrders = parseSavedRecentOrders();
    setRecentOrders(filterOrdersForUser(allOrders, currentUserEmail));
    setActiveOrder(null);
  }, [isClient, currentUserEmail]);

  // State to hold the currently selected delivery area for filtering
  const [selectedDeliveryArea, setSelectedDeliveryArea] = useState<DeliveryArea | null>(null);
  useEffect(() => {
    if (deliveryAddress) {
      setSelectedDeliveryArea(getDeliveryAreaFromAddress(deliveryAddress));
    } else {
      setSelectedDeliveryArea(null);
    }
  }, [deliveryAddress]);
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(
      "tastely_saved_locations",
      JSON.stringify(serializeSavedLocations(savedLocations)),
    );
    if (!savedLocations.some((loc) => loc.id === locationId)) {
      setLocationId(savedLocations[0]?.id ?? defaultSavedLocations[0].id);
    }
  }, [isClient, savedLocations, locationId]);

  useEffect(() => {
    if (!isClient) return;
    // Ensure the cart is empty for every user by clearing any saved cart
    localStorage.removeItem("tastely_cart");
  }, [isClient, cart]);

  useEffect(() => {
    if (Object.keys(cart).length === 0) {
      setCheckoutStep(0);
      setVoucherCode("");
      setAppliedVoucherCode("");
      setIsCouponApplied(false);
      setVoucherMessage({ text: "", type: "" });
    }
  }, [cart]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(
      "tastely_applied_voucher",
      JSON.stringify({ code: appliedVoucherCode, applied: isCouponApplied }),
    );
  }, [isClient, appliedVoucherCode, isCouponApplied]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem("tastely_favorites", JSON.stringify(favorites));
  }, [isClient, favorites]);

  useEffect(() => {
    if (!isClient || !currentUserEmail) return;
    const existing = parseSavedRecentOrders();
    const preserved = existing.filter((order) => order.userEmail?.toLowerCase() !== currentUserEmail);
    localStorage.setItem("tastely_recent_orders", JSON.stringify([...preserved, ...recentOrders]));
  }, [isClient, recentOrders, currentUserEmail]);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const food = FOODS.find((f) => f.id === Number(id));
          return food ? { food, qty } : null;
        })
        .filter((item): item is { food: Food; qty: number } => item !== null),
    [cart],
  );

  // Effect to auto-apply coupon for first-time users
  useEffect(() => {
    if (isClient && isFirstTimeUser && !hasOfferedFirstTimeCoupon && cartItems.length > 0) {
      // Only auto-apply if no other voucher is currently applied
      if (!isCouponApplied) {
        setVoucherCode("TRYNEW");
        setAppliedVoucherCode("TRYNEW");
        setIsCouponApplied(true);
        setVoucherMessage({ text: "Welcome offer applied: TRYNEW (20% off).", type: "success" });
        toast.success("Welcome offer applied: TRYNEW (20% off).");
      }
      setHasOfferedFirstTimeCoupon(true); // Mark as offered to prevent re-application
      localStorage.setItem("tastely_first_time_coupon_offered", "true");
    }
  }, [isClient, isFirstTimeUser, hasOfferedFirstTimeCoupon, isCouponApplied, cartItems.length]);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    recentOrders.forEach((order) => {
      if (order.status === "Preparing") {
        timers.push(
          setTimeout(() => {
            setRecentOrders((prev) =>
              prev.map((o) => (o.id === order.id ? { ...o, status: "Out for Delivery" } : o)),
            );
          }, 10000),
        );
      } else if (order.status === "Out for Delivery") {
        timers.push(
          setTimeout(() => {
            setRecentOrders((prev) =>
              prev.map((o) => (o.id === order.id ? { ...o, status: "Delivered" } : o)),
            );
          }, 15000),
        );
      }
    });

    // Cleanup timers on component unmount
    return () => timers.forEach(clearTimeout);
  }, [recentOrders]);

  useEffect(() => {
    if (!activeOrder) return;

    const updatedOrder = recentOrders.find((order) => order.id === activeOrder.id);
    if (updatedOrder && updatedOrder.status !== activeOrder.status) {
      setActiveOrder(updatedOrder);
    }
  }, [recentOrders, activeOrder]);

  useEffect(() => {
    if (!locationQuery.trim() || locationQuery.length < 3) {
      setApiLocationSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationQuery)}&limit=5`,
        );
        const data = (await response.json()) as unknown;
        if (Array.isArray(data)) {
          const suggestions = data
            .filter((item): item is NominatimLocationSuggestion => {
              if (!item || typeof item !== "object") return false;

              const suggestion = item as Partial<NominatimLocationSuggestion>;
              return (
                (typeof suggestion.place_id === "number" ||
                  typeof suggestion.place_id === "string") &&
                typeof suggestion.display_name === "string"
              );
            })
            .map((item) => ({
              id: `api-${item.place_id}`,
              title: item.name || item.display_name.split(",")[0],
              address: item.display_name,
              icon: MapPin,
            }));
          setApiLocationSuggestions(suggestions);
        }
      } catch (error) {
        console.error("Location autocomplete failed:", error);
      }
    }, 500); // 500ms debounce to avoid spamming the API

    return () => clearTimeout(timer);
  }, [locationQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setZoomedFood(null);
      }
    };
    if (zoomedFood) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomedFood]);

  const filtered = useMemo(() => {
    const result = FOODS.filter(
      (f) =>
        (cat === "All" || (cat === "Favorites" ? favorites[f.id] : f.category === cat)) &&
        foodMatchesSearch(f, q) &&
        (!activeQuickFilters.includes("veg") || isVegFood(f)) &&
        (!activeQuickFilters.includes("fast") || getFoodPrepMinutes(f.id) <= 22) && // Fast delivery filter
        (!activeQuickFilters.includes("deal") || getItemDiscountedPrice(f.price, f.category) <= 175) && // Deal filter
        (!activeQuickFilters.includes("topRated") || getFoodRating(f.id) >= 4.5), // Top rated filter
    );

    if (sortBy === "rating_desc") {
      result.sort((a, b) => getFoodRating(b.id) - getFoodRating(a.id));
    } else if (sortBy === "price_asc") {
      result.sort((a, b) => getItemDiscountedPrice(a.price, a.category) - getItemDiscountedPrice(b.price, b.category));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => getItemDiscountedPrice(b.price, b.category) - getItemDiscountedPrice(a.price, a.category));
    }

    return result; // Added selectedDeliveryArea to dependencies for re-evaluation
  }, [cat, q, favorites, sortBy, activeQuickFilters, selectedDeliveryArea]);

  const submitFoodSearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!searchDraft.trim()) {
      foodSearchInputRef.current?.focus();
      setQ("");
      return;
    }
    setCat("All");
    setQ(searchDraft.trim());
  };

  const updateFoodSearch = (value: string) => {
    setSearchDraft(value);
    const nextQuery = value.trim();
    if (nextQuery) {
      setCat("All");
    }
    setQ(nextQuery);
  };

  const clearFoodSearch = () => {
    setSearchDraft("");
    setQ("");
  };

  const topRatedFoods = useMemo(
    () => [...FOODS].sort((a, b) => getFoodRating(b.id) - getFoodRating(a.id)).slice(0, 4),
    [],
  );

  const toggleQuickFilter = (filter: QuickFilter) => {
    setActiveQuickFilters((current) =>
      current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter],
    );
  };

  const add = (f: Food, showToast = true) => {
    setCart((c) => ({ ...c, [f.id]: (c[f.id] || 0) + 1 }));
    setLastAddedId(f.id);
    setCheckoutStep(0);
    setIsCartOpen(true);
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 300);
    if (showToast) toast.success(`${f.name} added to cart`);

    setTimeout(() => {
      document.getElementById("cart-items-container")?.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };
  const remove = (id: number) => {
    setCart((c) => {
      const n = { ...c };
      if (!n[id]) return n;
      n[id] -= 1;
      if (n[id] <= 0) delete n[id];
      return n;
    });
  };
  const clear = (id: number) =>
    setCart((c) => {
      const n = { ...c };
      delete n[id];
      return n;
    });

  const toggleFavorite = (e: React.MouseEvent, f: Food) => {
    e.stopPropagation(); // Prevents the image zoom from opening
    setFavorites((prev) => {
      const isFav = !prev[f.id];
      if (isFav) toast.success(`${f.name} added to favorites!`);
      else toast.info(`${f.name} removed from favorites`);
      return { ...prev, [f.id]: isFav };
    });
  };

  const subtotal = cartItems.reduce((s, i) => s + getItemDiscountedPrice(i.food.price, i.food.category) * i.qty, 0);
  const selectedDelivery = deliveryOptions.find((option) => option.id === deliveryOption)!;
  const selectedLocation =
    savedLocations.find((location) => location.id === locationId) ?? savedLocations[0];
  const locationSuggestions = [
    ...savedLocations.filter(
      (location) =>
        locationQuery.trim() !== "" &&
        (location.title.toLowerCase().includes(locationQuery.toLowerCase()) ||
          location.address.toLowerCase().includes(locationQuery.toLowerCase())),
    ),
    ...apiLocationSuggestions,
  ];
  const deliveryFee =
    cartItems.length === 0 || (deliveryOption === "standard" && subtotal >= 499) || isFirstTimeUser
      ? 0
      : selectedDelivery.fee;
  const platformFee = cartItems.length === 0 ? 0 : 6;
  const taxes = cartItems.length === 0 ? 0 : subtotal * 0.05; // 5% GST
  const voucherDiscountAmount =
    isCouponApplied && appliedVoucherCode === "YUMMY25" && subtotal >= 299
      ? Math.min(subtotal * 0.25, 125)
      : isCouponApplied && appliedVoucherCode === "TRYNEW"
        ? Math.min(subtotal * 0.2, 100)
        : 0;
  const finalDiscountAmount = voucherDiscountAmount;
  const total = subtotal + deliveryFee + platformFee + taxes - finalDiscountAmount;

  useEffect(() => {
    if (isCouponApplied && appliedVoucherCode === "YUMMY25" && subtotal > 0 && subtotal < 299) {
      setVoucherCode("");
      setAppliedVoucherCode("");
      setIsCouponApplied(false);
      setVoucherMessage({
        text: "YUMMY25 was removed because subtotal is below ₹299.",
        type: "error",
      });
    }
  }, [appliedVoucherCode, isCouponApplied, subtotal]);

  const applyVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    const voucher = getVoucherDefinition(code);

    if (cartItems.length === 0) {
      setVoucherMessage({ text: "Add items before applying a voucher.", type: "error" });
      return;
    }

    if (!voucher) {
      setVoucherMessage({ text: "Enter a valid voucher code.", type: "error" });
      return;
    }

    if (voucher.minSubtotal && subtotal < voucher.minSubtotal) {
      setVoucherMessage({ text: `${voucher.label} requires a minimum subtotal of ₹${voucher.minSubtotal}.`, type: "error" });
      return;
    }

    setVoucherCode(code);
    setAppliedVoucherCode(code);
    setIsCouponApplied(true);
    setVoucherMessage({ text: `${voucher.label} applied. ${voucher.discount} saved.`, type: "success" });
  };

  const removeVoucher = () => {
    setVoucherCode("");
    setAppliedVoucherCode("");
    setIsCouponApplied(false);
    setVoucherMessage({ text: "", type: "" });
    // If the removed voucher was the auto-applied one, allow it to be re-applied if conditions are met
    if (appliedVoucherCode === "TRYNEW" && isFirstTimeUser) {
      setHasOfferedFirstTimeCoupon(false);
      localStorage.removeItem("tastely_first_time_coupon_offered");
    }
  };

  const count = cartItems.reduce((s, i) => s + i.qty, 0);
  const hasValidDeliveryAddress =
    deliveryAddress.trim().length > 0 &&
    !(locationId === "current" && deliveryAddress === "Use live location in Bangalore");
  const selectedPayment = paymentMethods.find((method) => method.id === paymentMethod)!;
  const deliveryAddressText = deliveryAddress.trim() || selectedLocation.address;
  const deliveryLocationTitle =
    deliveryAddressText !== selectedLocation.address ? "Custom address" : selectedLocation.title;

  const validateCheckoutStep = (step: CheckoutStep) => {
    if (step === 0 && cartItems.length === 0) {
      toast.error("Add at least one item before checkout.");
      return false;
    }

    if ((step === 1 || step === 2) && !hasValidDeliveryAddress) {
      setLocationError("Select or enter a complete delivery address.");
      toast.error("Delivery address is required.");
      return false;
    }

    if (step === 3 && !paymentMethod) {
      toast.error("Choose a payment method to continue.");
      return false;
    }

    return true;
  };

  const goToCheckoutStep = (step: CheckoutStep) => {
    const firstBlockedStep = checkoutSteps.findIndex((_, index) => {
      if (index >= step) return false;
      return !validateCheckoutStep(index as CheckoutStep);
    });

    if (firstBlockedStep >= 0) {
      setCheckoutStep(firstBlockedStep as CheckoutStep);
      return;
    }

    setCheckoutStep(step);
  };

  const goToNextCheckoutStep = () => {
    if (!validateCheckoutStep(checkoutStep)) return;
    setCheckoutStep((step) => Math.min(step + 1, checkoutSteps.length - 1) as CheckoutStep);
  };

  const goToPreviousCheckoutStep = () => {
    setCheckoutStep((step) => Math.max(step - 1, 0) as CheckoutStep);
  };

  const processOrder = (paymentTitle: string) => {
    const order: RecentOrder = {
      id: Date.now(),
      userEmail: currentUserEmail,
      items: cartItems,
      total,
      paymentTitle,
      deliveryTitle: selectedDelivery.title,
      eta: selectedDelivery.eta,
      address: deliveryAddress,
      placedAt: new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()),
      status: "Preparing",
    };

    setRecentOrders((orders) => [order, ...orders].slice(0, 5));
    setActiveOrder(order);
    toast.success(
      `${selectedDelivery.title} order placed to ${deliveryAddress} with ${paymentTitle}!`,
    );
    setCart({});
    setIsCartOpen(false);
    // After placing an order, offer a post-order voucher the user can apply to next order
    try {
      const voucher: PostOrderVoucher = {
        code: "THANKS10",
        text: "Thanks for your order — use THANKS10 for 10% off your next order",
        amount: 10,
      };
      setPostOrderVoucher(voucher);
      localStorage.setItem("tastely_post_order_voucher", JSON.stringify(voucher));
    } catch (e) {
      // ignore storage errors
    }
    // Mark that the first-time coupon has been offered/applied flow handled earlier
    localStorage.setItem("tastely_first_time_coupon_offered", "true");
  };

  const placeOrder = async () => {
    if (!hasValidDeliveryAddress) {
      setCheckoutStep(1);
      setLocationError("Select or enter a complete delivery address.");
      toast.error("Delivery address is required.");
      return;
    }

    if (cartItems.length === 0) {
      setCheckoutStep(0);
      toast.error("Your cart is empty.");
      return;
    }

    if (paymentMethod === "cod") {
      processOrder(selectedPayment.title);
      return;
    }

    // For online payments, show Stripe modal simulation
    setIsStripeModalOpen(true);
  };

  const applyPostOrderVoucher = (voucher: PostOrderVoucher) => {
    const code = voucher.code.trim().toUpperCase();
    setVoucherCode(code);
    setAppliedVoucherCode(code);
    setIsCouponApplied(true);
    setVoucherMessage({ text: `${code} applied. ${voucher.text}`, type: "success" });
    try {
      localStorage.setItem("tastely_applied_voucher", JSON.stringify({ code, applied: true }));
    } catch (e) {
      // ignore
    }
    setPostOrderVoucher(null);
    toast.success(`Voucher ${code} applied to your next order.`);
  };

  const copyPostOrderVoucher = async (voucher: PostOrderVoucher) => {
    try {
      await navigator.clipboard.writeText(voucher.code);
      toast.success("Voucher code copied to clipboard.");
    } catch {
      toast.info(`Voucher code: ${voucher.code}`);
    }
  };

  const saveTypedLocation = () => {
    const trimmed = deliveryAddress.trim();
    if (!trimmed) {
      setLocationError("Enter an address before saving.");
      return;
    }

    const existing = savedLocations.find((location) => location.address === trimmed);
    if (existing) {
      setLocationId(existing.id);
      setLocationError(null);
      toast.success("Address already saved.");
      return;
    }

    const newLocation: SavedLocation = {
      id: `saved-${Date.now()}`,
      title: `Saved Address ${savedLocations.length - 2 + 1}`,
      address: trimmed,
      icon: MapPin,
    };

    setSavedLocations((prev) => [newLocation, ...prev]);
    setLocationId(newLocation.id);
    setLocationQuery("");
    setLocationError(null);
    toast.success("Address saved successfully.");
  };

  const reorder = (order: RecentOrder) => {
    setCart((prevCart) => {
      const mergedCart = { ...prevCart };
      order.items.forEach((item) => {
        mergedCart[item.food.id] = (mergedCart[item.food.id] || 0) + item.qty;
      });
      return mergedCart;
    });

    setDeliveryAddress(order.address);
    toast.success("Recent order added back to cart");
    setIsCartOpen(true);
  };

  const billDetailsUI = (
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
          <div className="flex justify-between font-medium text-green-600">
            <span>Coupon discount</span>
            <span>-{formatINR(finalDiscountAmount)}</span>
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
  );

  const checkoutStepContent = (() => {
    if (checkoutStep === 0) {
      return (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="font-semibold">Review Cart Items</p>
                <p className="text-xs text-muted-foreground">
                  {count} item{count > 1 ? "s" : ""} from Yummy Gate
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsCartOpen(false)}>
                Add more
              </Button>
            </div>
            <div className="divide-y">
              {cartItems.map(({ food, qty }) => (
                <div
                  key={food.id}
                  className={`flex gap-3 px-4 py-3 transition-colors ${
                    lastAddedId === food.id ? "bg-primary/10" : ""
                  }`}
                >
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
                        <span className="w-8 text-center text-sm font-bold text-primary">
                          {qty}
                        </span>
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
          </div>

          <div className="rounded-2xl border border-dashed border-primary/50 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Ticket className="h-5 w-5 text-primary" />
              Apply Voucher
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="TRYNEW or YUMMY25"
                value={voucherCode}
                onChange={(e) => {
                  setVoucherCode(e.target.value.toUpperCase());
                  setVoucherMessage({ text: "", type: "" });
                }}
                disabled={isCouponApplied}
                className="h-10 uppercase"
              />
              {isCouponApplied ? (
                <Button type="button" variant="outline" onClick={removeVoucher} className="h-10">
                  Remove
                </Button>
              ) : (
                <Button type="button" onClick={applyVoucher} className="h-10">
                  Apply
                </Button>
              )}
            </div>
            {voucherMessage.text && (
              <p
                className={`mt-2 text-xs font-medium ${
                  voucherMessage.type === "success" ? "text-green-600" : "text-destructive"
                }`}
              >
                {voucherMessage.text}
              </p>
            )}
            {!isCouponApplied && !voucherMessage.text && (
              <p className="mt-2 text-xs text-muted-foreground">
                Available:{" "}
                <strong
                  className="text-primary cursor-pointer hover:underline"
                  onClick={() => setVoucherCode("TRYNEW")}
                >
                  TRYNEW
                </strong>{" "}
                (20% off),{" "}
                <strong
                  className="text-primary cursor-pointer hover:underline"
                  onClick={() => setVoucherCode("YUMMY25")}
                >
                  YUMMY25
                </strong>{" "}
                (25% off on ₹299+)
              </p>
            )}
          </div>

          {billDetailsUI}
        </div>
      );
    }

    if (checkoutStep === 1) {
      return (
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">Select or Add Delivery Location</p>
              <p className="text-xs text-muted-foreground">Choose where the order should arrive</p>
            </div>
            <MapPin className="h-5 w-5 text-primary" />
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
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-medium">{location.title}</span>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {location.address}
                    </p>
                  </div>
                  <RadioGroupItem id={`location-${location.id}`} value={location.id} />
                </Label>
              );
            })}
          </RadioGroup>

          <div className="mt-4 space-y-3">
            <Input
              id="location-search"
              value={locationQuery}
              onChange={(event) => setLocationQuery(event.target.value)}
              placeholder="Search your delivery address"
            />
            {locationSuggestions.length > 0 && locationQuery.trim() !== "" && (
              <div className="rounded-xl border bg-card p-3">
                <p className="mb-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Search results
                </p>
                <div className="space-y-2">
                  {locationSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      type="button"
                      onClick={() => {
                        if (suggestion.id.startsWith("api-")) {
                          setSavedLocations((prev) => {
                            if (!prev.some((loc) => loc.id === suggestion.id)) {
                              return [suggestion, ...prev];
                            }
                            return prev;
                          });
                        }
                        setLocationId(suggestion.id);
                        setDeliveryAddress(suggestion.address);
                        setLocationQuery("");
                        setLocationError(null);
                        toast.success("Delivery location authenticated and saved.");
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
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Search addresses just like Google Maps by typing your location above and selecting a verified result.
            </div>
          </div>
        </div>
      );
    }

    if (checkoutStep === 2) {
      return (
        <div className="space-y-3">
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">Confirm Delivery Address</p>
                <p className="text-xs text-muted-foreground">
                  Add house number, floor, or landmark
                </p>
              </div>
              <Badge variant={hasValidDeliveryAddress ? "secondary" : "outline"}>
                {hasValidDeliveryAddress ? "Ready" : "Required"}
              </Badge>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-xs font-medium text-primary">Delivering to</p>
              <p className="mt-1 text-sm font-semibold">{deliveryLocationTitle}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{deliveryAddressText}</p>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <Label
                  htmlFor="delivery-address"
                  className="text-xs font-medium text-muted-foreground"
                >
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
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={saveTypedLocation}
              >
                Save this address
              </Button>
              {locationError && <p className="text-xs text-destructive">{locationError}</p>}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-semibold">Delivery Speed</p>
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
                const optionFee = option.id === "standard" && subtotal >= 499 ? 0 : option.fee;

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
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
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
        </div>
      );
    }

    if (checkoutStep === 3) {
      return (
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">Choose Payment Method</p>
              <p className="text-xs text-muted-foreground">
                Location details are locked for this step
              </p>
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
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
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
      );
    }

    if (checkoutStep === 4) {
      return (
        <div className="space-y-3">
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">Review Order Summary</p>
              <Badge className="rounded-full">{selectedDelivery.eta}</Badge>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg bg-secondary/40 p-3">
                <p className="text-xs font-semibold text-muted-foreground">Items</p>
                <p className="mt-1 font-medium">
                  {count} item{count > 1 ? "s" : ""} from Yummy Gate
                </p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-3">
                <p className="text-xs font-semibold text-muted-foreground">Delivery address</p>
                <p className="mt-1 font-medium">{deliveryLocationTitle}</p>
                <p className="text-xs text-muted-foreground">{deliveryAddressText}</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-3">
                <p className="text-xs font-semibold text-muted-foreground">Payment</p>
                <p className="mt-1 font-medium">{selectedPayment.title}</p>
              </div>
            </div>
          </div>
          {billDetailsUI}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="rounded-2xl border bg-card p-5 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <p className="text-lg font-bold">Ready to place your order</p>
          <p className="mt-2 text-sm text-muted-foreground">
            We will confirm {count} item{count > 1 ? "s" : ""} for {deliveryLocationTitle} and
            charge {formatINR(total)}.
          </p>
        </div>
        {billDetailsUI}
      </div>
    );
  })();

  const modernCartBodyUI = (
    <div className="flex-1 overflow-y-auto bg-secondary/20 p-3 sm:p-4">
      {cartItems.length === 0 ? (
        <div className="flex h-full min-h-[55vh] flex-col items-center justify-center rounded-2xl border border-dashed bg-card p-8 text-center">
          <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <ShoppingCart className="h-10 w-10 text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-foreground">Your cart is empty</h3>
          <p className="mb-7 max-w-[260px] text-sm text-muted-foreground">
            Add your favorite dishes and checkout steps will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="bg-slate-950 p-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                    Checkout
                  </p>
                  <h2 className="mt-1 text-xl font-black leading-tight">
                    {checkoutSteps[checkoutStep].title}
                  </h2>
                  <p className="mt-1 truncate text-sm text-white/65">
                    {count} item{count > 1 ? "s" : ""} • {deliveryLocationTitle}
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-2 text-right backdrop-blur">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
                    ETA
                  </p>
                  <p className="text-sm font-bold">{selectedDelivery.eta}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-white/55">To pay</p>
                  <p className="mt-1 text-base font-black">{formatINR(total)}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-white/55">Delivery</p>
                  <p className="mt-1 truncate font-bold">{selectedDelivery.title}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-white/55">Payment</p>
                  <p className="mt-1 truncate font-bold">{selectedPayment.title}</p>
                </div>
              </div>
            </div>

            <div className="border-b bg-white px-3 py-4">
              <div className="relative grid grid-cols-6 gap-1">
                <div className="absolute left-[8.5%] right-[8.5%] top-5 h-0.5 bg-slate-200" />
                <div
                  className="absolute left-[8.5%] top-5 h-0.5 bg-primary transition-all"
                  style={{ width: `${(checkoutStep / (checkoutSteps.length - 1)) * 83}%` }}
                />
                {checkoutSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCurrent = checkoutStep === index;
                  const isDone = checkoutStep > index;

                  return (
                    <button
                      key={step.title}
                      type="button"
                      onClick={() => goToCheckoutStep(index as CheckoutStep)}
                      className="relative z-10 flex min-w-0 flex-col items-center gap-1 text-center"
                      aria-label={step.title}
                    >
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs font-black transition ${
                          isCurrent
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : isDone
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-slate-200 bg-white text-muted-foreground"
                        }`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : isCurrent ? (
                          <Icon className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span
                        className={`hidden max-w-[58px] truncate text-[10px] font-bold sm:block ${
                          isCurrent || isDone ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {step.shortTitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {checkoutStepContent}
        </div>
      )}
    </div>
  );

  const isCurrentCheckoutStepComplete =
    checkoutStep === 0
      ? cartItems.length > 0
      : checkoutStep === 1 || checkoutStep === 2
        ? hasValidDeliveryAddress
        : true;
  const checkoutActionLabel =
    checkoutStep === 0
      ? "Choose location"
      : checkoutStep === 1
        ? "Confirm address"
        : checkoutStep === 2
          ? "Choose payment"
          : checkoutStep === 3
            ? "Review order"
            : checkoutStep === 4
              ? "Ready to order"
              : "Place order";
  const checkoutFooterDetail =
    checkoutStep < 2
      ? `${count} item${count > 1 ? "s" : ""} in your bag`
      : checkoutStep < 4
        ? `${selectedDelivery.title} • ${selectedDelivery.eta}`
        : `${selectedPayment.title} • ${deliveryLocationTitle}`;

  const modernCartFooterUI =
    cartItems.length === 0 ? null : (
      <div className="sticky bottom-0 z-20 border-t bg-background/95 p-3 shadow-[0_-12px_24px_-16px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-4">
        <div className="mb-3 rounded-2xl border bg-card p-3">
          <div className="grid grid-cols-[1fr_auto] gap-3 text-sm">
            <div className="min-w-0">
              <span className="block text-xs font-medium text-muted-foreground">
                {checkoutActionLabel}
              </span>
              <span className="mt-0.5 block truncate font-semibold">{checkoutFooterDetail}</span>
            </div>
            <div className="text-right">
              <span className="block text-[11px] text-muted-foreground">To pay</span>
              <span className="text-base font-bold text-primary">{formatINR(total)}</span>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((checkoutStep + 1) / checkoutSteps.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 w-12 shrink-0 rounded-xl"
            disabled={checkoutStep === 0}
            onClick={goToPreviousCheckoutStep}
            aria-label="Previous checkout step"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            className="h-12 flex-1 justify-between rounded-xl px-5 text-base font-bold shadow-lg shadow-primary/30"
            disabled={checkoutStep < 5 && !isCurrentCheckoutStepComplete}
            onClick={checkoutStep === 5 ? placeOrder : goToNextCheckoutStep}
          >
            <span>{checkoutStep === 5 ? "Place Order" : checkoutActionLabel}</span>
            <span className="flex items-center gap-2">
              {formatINR(total)}
              <ChevronRight className="h-5 w-5" />
            </span>
          </Button>
        </div>
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
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {postOrderVoucher && (
        <div className="fixed right-6 bottom-6 z-50 w-[380px] rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-primary/10 p-4 shadow-2xl">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-3xl bg-primary text-white">
                <Ticket className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">Reward unlocked</p>
                <p className="mt-1 text-xs text-muted-foreground">Apply this code on your next order.</p>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">{postOrderVoucher.code}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{postOrderVoucher.text}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {postOrderVoucher.amount ? `${postOrderVoucher.amount}% off` : "Voucher"}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Button size="sm" variant="outline" onClick={() => copyPostOrderVoucher(postOrderVoucher)}>
                Copy
              </Button>
              <Button size="sm" onClick={() => applyPostOrderVoucher(postOrderVoucher)}>
                Apply
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPostOrderVoucher(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
      <main className="container mx-auto px-4 pt-8 pb-28 lg:pb-8 max-w-[1400px]">
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold">Our Menu</h1>
                <p className="text-muted-foreground">{FOODS.length}+ delicious dishes</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setCheckoutStep(0);
                    setIsCartOpen(true);
                  }}
                  className={`rounded-full px-4 shadow-lg shadow-primary/20 transition-all duration-300 ${
                    cartPulse ? "scale-110 bg-primary/90 shadow-primary/50" : ""
                  }`}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {count > 0
                    ? `${count} item${count > 1 ? "s" : ""} • ${formatINR(total)}`
                    : "Cart"}
                </Button>
                {recentOrders.length > 0 && (
                  <Button
                    onClick={() =>
                      document
                        .getElementById("recent-orders")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    variant="outline"
                    className="rounded-full border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm group"
                  >
                    <ReceiptText className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                    Jump to Recent Orders
                  </Button>
                )}
              </div>
            </div>

            {/* Sticky Filters & Search */}
            <div className="sticky top-[60px] lg:top-[72px] z-30 -mx-4 px-4 py-3 sm:mx-0 sm:px-0 sm:py-4 bg-background/80 backdrop-blur-xl mb-6 shadow-sm border-b border-slate-200/50 sm:border-transparent sm:shadow-none transition-all">
              <div className="flex flex-col gap-3">
                <form
                  role="search"
                  className="flex w-full flex-wrap items-center gap-2"
                  onSubmit={submitFoodSearch}
                >
                  <div className="relative min-w-[220px] flex-1">
                    <Input
                      ref={foodSearchInputRef}
                      id="website-food-search"
                      name="food-search"
                      aria-label="Search food"
                      aria-controls="website-food-results"
                      className="pr-9 bg-card border-slate-200/60 shadow-sm focus-visible:ring-primary/20 transition-all"
                      placeholder="Search food..."
                      value={searchDraft}
                      onChange={(e) => updateFoodSearch(e.target.value)}
                    />
                    {(searchDraft || q) && (
                      <button
                        type="button"
                        aria-label="Clear search"
                        onClick={clearFoodSearch}
                        className="absolute right-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Button
                    type="submit"
                    aria-label="Search food"
                    aria-controls="website-food-results"
                    title="Search food"
                    className="h-10 min-w-[92px] shrink-0 rounded-xl border border-orange-300 bg-orange-400 px-4 font-bold text-slate-950 shadow-sm hover:bg-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                  >
                    Search
                  </Button>
                  <select
                    aria-label="Sort food results"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-10 min-w-[190px] shrink-0 rounded-md border border-slate-200/60 bg-card px-3 py-2 text-sm text-slate-700 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                  >
                    <option value="default">Sort by: Relevance</option>
                    <option value="rating_desc">Highest Rated</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </form>
                <div className="flex w-full gap-2 overflow-x-auto pb-2 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {[
                    "All",
                    "Favorites",
                    ...CATEGORIES.filter((c) => c !== "All" && c !== "Favorites"),
                  ].map((c) => {
                    const Icon = c === "Favorites" ? Heart : (categoryIcons[c] ?? Utensils);
                    return (
                      <Badge
                        key={c}
                        variant={cat === c ? "default" : "outline"}
                        className={`cursor-pointer shrink-0 px-3 py-1.5 text-sm gap-1.5 transition-all duration-300 ${
                          cat === c
                            ? "shadow-md shadow-primary/20 scale-105"
                            : "hover:bg-secondary hover:scale-105"
                        } ${
                          c === "Favorites" && cat !== "Favorites"
                            ? "text-red-500 border-red-200 hover:bg-red-50"
                            : ""
                        }`}
                        onClick={() => setCat(c)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setCat(c);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-pressed={cat === c}
                        aria-label={`Show ${c} foods`}
                      >
                        <Icon
                          className={`h-3.5 w-3.5 ${c === "Favorites" && cat === "Favorites" ? "fill-current text-white" : ""}`}
                        />
                        {c}
                      </Badge>
                    );
                  })}
                  {cat === "Favorites" && Object.values(favorites).some(Boolean) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFavorites({});
                        toast.success("All favorites cleared");
                      }}
                      className="shrink-0 h-8 ml-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" />
                      Clear Favorites
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {quickFilters.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = activeQuickFilters.includes(filter.id);

                  return (
                    <Button
                      key={filter.id}
                      type="button"
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className={`h-9 shrink-0 rounded-full px-3 text-xs font-semibold ${
                        filter.id === "veg" && !isActive
                          ? "border-green-200 text-green-700 hover:bg-green-50"
                          : ""
                      }`}
                      onClick={() => toggleQuickFilter(filter.id)}
                    >
                      <Icon
                        className={`mr-1.5 h-3.5 w-3.5 ${filter.id === "topRated" ? "fill-current" : ""}`}
                      />
                      {filter.label}
                    </Button>
                  );
                })}
                {activeQuickFilters.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 shrink-0 rounded-full px-3 text-xs text-muted-foreground"
                    onClick={() => setActiveQuickFilters([])}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {recentOrders.length > 0 && (
              <section id="recent-orders" className="mb-8 scroll-mt-28">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      Your Recent Orders
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Track, reorder, or view details of your meals.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRecentOrders([]);
                      toast.success("Order history cleared");
                    }}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors rounded-full"
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Clear History
                  </Button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-2 xl:grid-cols-3 md:snap-none md:overflow-visible">
                  {recentOrders.map((order, index) => {
                    const summary = order.items
                      .slice(0, 2)
                      .map((item) => `${item.qty} x ${item.food.name}`)
                      .join(", ");
                    const extraCount = order.items.length - 2;
                    const isDelivered = order.status === "Delivered";

                    return (
                      <div
                        key={order.id}
                        className="min-w-[85vw] sm:min-w-[340px] snap-center flex flex-col gap-4 rounded-3xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md md:min-w-0"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-inner">
                              <Utensils className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="truncate font-bold text-slate-900 text-base">
                                  Yummy Gate
                                </h3>
                                {index === 0 && (
                                  <span className="shrink-0 rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-widest animate-pulse shadow-sm">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="truncate text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 shrink-0" />
                                {order.address}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={isDelivered ? "secondary" : "default"}
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${isDelivered ? "bg-slate-100 text-slate-600" : "bg-green-600 hover:bg-green-700"}`}
                          >
                            {!isDelivered && (
                              <Loader2 className="mr-1.5 h-3 w-3 animate-spin inline-block" />
                            )}
                            {order.status}
                          </Badge>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 flex-1 flex flex-col justify-center">
                          <div className="mb-2.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            <span>Order #{String(order.id).slice(-5)}</span>
                            <span>{order.placedAt}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex -space-x-2 shrink-0">
                              {order.items.slice(0, 3).map((item, i) => (
                                <div
                                  key={i}
                                  className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm"
                                >
                                  <FoodImage
                                    food={item.food}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                            <p className="line-clamp-2 text-sm font-medium text-slate-700 flex-1">
                              {summary}
                              {extraCount > 0 && (
                                <span className="text-muted-foreground font-normal">
                                  {" "}
                                  +{extraCount} more
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1 mt-auto">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                              Total
                            </p>
                            <p className="text-lg font-black text-primary leading-none">
                              {formatINR(order.total)}
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 rounded-xl border-slate-200 font-semibold shadow-sm hover:bg-slate-50"
                              onClick={() => setActiveOrder(order)}
                            >
                              {isDelivered ? "View Details" : "Track Order"}
                            </Button>
                            <Button
                              size="sm"
                              className="h-9 rounded-xl font-semibold shadow-sm shadow-primary/20"
                              onClick={() => reorder(order)}
                            >
                              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                              Reorder
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="mb-6 grid gap-3 md:grid-cols-3">
              <button
                type="button"
                className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => {
                  setVoucherCode("TRYNEW");
                  setAppliedVoucherCode("TRYNEW");
                  setIsCouponApplied(true);
                  setIsCartOpen(true);
                }}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Ticket className="h-5 w-5" />
                </div>
                <p className="font-bold text-slate-950">TRYNEW: 20% off</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Save up to {formatINR(100)} on checkout
                </p>
              </button>
              <button
                type="button"
                className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => {
                  setDeliveryOption("priority");
                  toast.success("Priority delivery selected.");
                }}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
                  <Truck className="h-5 w-5" />
                </div>
                <p className="font-bold text-slate-950">Priority in 15-20 mins</p>
                <p className="mt-1 text-sm text-muted-foreground">Get hungry-now dishes faster</p>
              </button>
              <button
                type="button"
                className="rounded-2xl border border-green-200 bg-green-50 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => {
                  setActiveQuickFilters((current) =>
                    current.includes("veg") ? current : [...current, "veg"],
                  );
                }}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white">
                  <Salad className="h-5 w-5" />
                </div>
                <p className="font-bold text-slate-950">Pure veg picks</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Filter clean vegetarian options
                </p>
              </button>
            </section>

            <section className="mb-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Recommended for you</h2>
                  <p className="text-sm text-muted-foreground">Top rated and deal-friendly picks</p>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  {filtered.length} shown
                </Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {topRatedFoods.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    className="flex min-w-0 items-center gap-3 rounded-2xl border bg-card p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                    onClick={() => add(food)}
                  >
                    <FoodImage food={food} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{food.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-semibold text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {getFoodRating(food.id).toFixed(1)}
                        </span>
                        <span>{getFoodPrepMinutes(food.id)} mins</span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-primary">
                        {formatItemDiscountedINR(food.price, food.category)}
                      </p>
                    </div>
                    <Plus className="h-4 w-4 shrink-0 text-primary" />
                  </button>
                ))}
              </div>
            </section>

            <div
              id="website-food-results"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              {filtered.map((f) => {
                const shop = getRecommendedShop(f); // Define shop here
                const foodBadge = getFoodBadge(f);

                return (
                  <div
                    key={f.id}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl"
                  >
                    <div
                      className="relative h-48 w-full cursor-pointer overflow-hidden"
                      onClick={() => setZoomedFood(f)}
                    >
                      <FoodImage
                        food={f}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 flex">
                        <div className="flex max-w-full items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-sm">
                          {foodBadge.icon ? <span className="shrink-0">{foodBadge.icon}</span> : null}
                          <span className="truncate">{foodBadge.label}</span>
                        </div>
                      </div>

                      {f.id % 4 === 0 ? (
                        <div className="pointer-events-none absolute left-0 top-3 z-10 rounded-r-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-black tracking-wider text-white shadow-md">
                          <Star className="mr-1 inline h-3 w-3 fill-current" />
                          BESTSELLER
                        </div>
                      ) : (
                        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
                          {getFoodPrepMinutes(f.id)} mins
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(e, f)}
                        className="absolute right-3 top-3 z-20 rounded-full bg-white/90 p-2 shadow-sm transition-all hover:scale-110 active:scale-95"
                        aria-label={
                          favorites[f.id] ? `Remove ${f.name} from favorites` : `Save ${f.name}`
                        }
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors ${
                            favorites[f.id] ? "fill-red-500 text-red-500" : "text-slate-500"
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-1 text-lg font-semibold">{f.name}</h3>
                        <div className="mt-0.5 flex shrink-0 items-center gap-1 text-xs font-bold text-slate-700">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{getFoodRating(f.id).toFixed(1)}</span>
                          <span className="text-[10px] font-normal text-muted-foreground">
                            ({getFoodReviewCount(f.id)})
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                        {isVegFood(f) && (
                          <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-green-700">
                            Veg
                          </span>
                        )}
                        {getItemDiscountedPrice(f.price, f.category) <= 175 && (
                          <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-primary">
                            Deal
                          </span>
                        )}
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                          {getFoodPrepMinutes(f.id)} mins
                        </span>
                      </div>

                      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-muted-foreground">
                        {f.desc}
                      </p>
                      {/* Display recommended hotel name */}
                      <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                        <span className="font-semibold text-slate-800">Recommended hotel:</span>{" "}
                        {shop.name}, {shop.label}
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                        <DiscountPrice price={f.price} />
                        {cart[f.id] ? (
                          <div className="flex items-center gap-1 rounded-md border bg-secondary/50 p-0.5">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-sm"
                              onClick={() => remove(f.id)}
                              aria-label={`Decrease ${f.name}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-5 text-center text-sm font-medium">
                              {cart[f.id]}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 rounded-sm text-primary"
                              onClick={() => add(f)}
                              aria-label={`Increase ${f.name}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" onClick={() => add(f)}>
                            <Plus className="mr-1 h-4 w-4" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <p className="col-span-full py-12 text-center text-muted-foreground">
                  {cat === "Favorites"
                    ? "No favorite dishes yet. Click the heart icon on a dish to save it here!"
                    : "No dishes found."}
                </p>
              )}
            </div>

            <div className="mb-4 mt-16 flex flex-col items-center justify-between gap-8 rounded-3xl border border-primary/10 bg-primary/5 p-8 sm:p-12 md:flex-row">
              <div className="max-w-lg text-center md:text-left">
                <h2 className="mb-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                  Get the Yummy Gate App
                </h2>
                <p className="mb-6 text-muted-foreground">
                  Order your favorite meals faster, track live deliveries, and get exclusive
                  app-only discounts.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
                  <a
                    href="https://play.google.com/store/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block transition-transform hover:scale-105"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Get it on Google Play"
                      className="h-10 sm:h-12"
                    />
                  </a>
                  <a
                    href="https://www.apple.com/app-store/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block transition-transform hover:scale-105"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                      alt="Download on the App Store"
                      className="h-10 sm:h-12"
                    />
                  </a>
                </div>
              </div>
              <div className="hidden shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white p-8 shadow-xl md:flex">
                <Smartphone className="h-20 w-20 text-primary" />
              </div>
            </div>
          </div>

          <aside className="hidden w-[350px] shrink-0 lg:block xl:w-[400px]">
            <div className="sticky top-6 flex h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-lg shadow-black/5">
              <div className="flex flex-row items-center justify-between border-b bg-card p-4">
                <div>
                  <h2 className="text-lg font-semibold">Cart</h2>
                  <p className="text-xs text-muted-foreground">
                    {count > 0
                      ? `${count} item${count > 1 ? "s" : ""} ready to checkout`
                      : "Start adding food"}
                  </p>
                </div>
                {cartItems.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCart({})}
                    className="h-8 px-2 text-muted-foreground hover:text-destructive"
                  >
                    Empty Cart
                  </Button>
                )}
              </div>
              {modernCartBodyUI}
              {modernCartFooterUI}
            </div>
          </aside>
        </div>
      </main>

      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="flex flex-col p-0 sm:max-w-md">
          <SheetHeader className="flex flex-row items-center justify-between space-y-0 border-b p-4 text-left">
            <SheetTitle>Checkout</SheetTitle>
            {cartItems.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCart({})}
                className="h-8 px-2 text-muted-foreground hover:text-destructive"
              >
                Empty Cart
              </Button>
            )}
          </SheetHeader>
          {modernCartBodyUI}
          {modernCartFooterUI}
        </SheetContent>
      </Sheet>

      {count > 0 && !isCartOpen && (
        <div className="fixed bottom-[68px] left-0 right-0 z-40 p-3 lg:hidden animate-in slide-in-from-bottom-2">
          <Button
            onClick={() => setIsCartOpen(true)}
            className={`relative h-[52px] w-full rounded-xl px-4 shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.02] ${
              cartPulse ? "scale-[1.04] bg-primary/90 shadow-primary/50" : ""
            }`}
            size="lg"
          >
            <ShoppingCart className="h-5 w-5 shrink-0" />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
              <span>
                {count} item{count > 1 ? "s" : ""}
              </span>
              <span className="truncate font-semibold">View Cart • {formatINR(total)}</span>
            </div>
          </Button>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[68px] items-center justify-around border-t bg-white pb-1 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.2)] lg:hidden">
        <a
          href="/"
          className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-500 transition-colors hover:text-primary"
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </a>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex h-full w-full flex-col items-center justify-center gap-1 text-primary transition-colors"
        >
          <Utensils className="h-5 w-5" />
          <span className="text-[10px] font-bold">Menu</span>
        </button>
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex h-full w-full flex-col items-center justify-center gap-1 text-slate-500 transition-colors hover:text-primary"
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm">
                {count}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>
        <a
          href="/profile"
          className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-500 transition-colors hover:text-primary"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </a>
      </nav>

      {zoomedFood && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setZoomedFood(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute -top-12 right-0 p-2 text-white/70 transition-colors hover:text-white"
              onClick={() => setZoomedFood(null)}
              aria-label="Close image preview"
            >
              <X className="h-8 w-8" />
            </button>
            <FoodImage
              food={zoomedFood}
              className="h-auto max-h-[85vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}

      {isStripeModalOpen && (
        <Elements stripe={stripePromise}>
          <StripeCheckoutForm
            amount={formatINR(total)}
            onCancel={() => {
              setIsStripeModalOpen(false);
              setCart({});
              setIsCartOpen(false);
              toast.error("Payment was canceled.");
            }}
            onSuccess={() => {
              setIsStripeModalOpen(false);
              processOrder(selectedPayment.title);
            }}
          />
        </Elements>
      )}

      {activeOrder && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b bg-white p-5">
              <div>
                <Badge className="mb-2 rounded-full">
                  Order #{String(activeOrder.id).slice(-5)}
                </Badge>
                <h3 className="text-xl font-bold text-slate-950">Order placed successfully</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeOrder.deliveryTitle} delivery arriving in {activeOrder.eta}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setActiveOrder(null)}
                aria-label="Close order tracking"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-2xl border bg-primary/5 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{activeOrder.status}</p>
                    <p className="text-xs text-muted-foreground">Live order status</p>
                  </div>
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                  {["Preparing", "Out for Delivery", "Delivered"].map((status) => {
                    const statuses = ["Preparing", "Out for Delivery", "Delivered"];
                    const isDone = statuses.indexOf(activeOrder.status) >= statuses.indexOf(status);

                    return (
                      <div
                        key={status}
                        className={`rounded-xl px-2 py-3 ${
                          isDone
                            ? "bg-primary text-primary-foreground"
                            : "bg-white text-muted-foreground"
                        }`}
                      >
                        {status}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="h-4 w-4 text-primary" />
                    Delivery address
                  </div>
                  <p className="text-sm text-muted-foreground">{activeOrder.address}</p>
                </div>
                <div className="rounded-2xl border p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Payment
                  </div>
                  <p className="text-sm text-muted-foreground">{activeOrder.paymentTitle}</p>
                </div>
              </div>

              <div className="rounded-2xl border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-semibold">Items</p>
                  <span className="text-sm font-bold text-primary">
                    {formatINR(activeOrder.total)}
                  </span>
                </div>
                <div className="space-y-2">
                  {activeOrder.items.map(({ food, qty }) => (
                    <div key={food.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate">
                        {qty} x {food.name}
                      </span>
                      <span className="shrink-0 font-medium">
                        {formatINR(getItemDiscountedPrice(food.price, food.category) * qty)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                {activeOrder.status === "Preparing" && (
                  <Button
                    type="button"
                    variant="destructive"
                    className="h-11 flex-1"
                    onClick={() => {
                      setRecentOrders((prev) =>
                        prev.map((o) =>
                          o.id === activeOrder.id ? { ...o, status: "Cancelled" } : o,
                        ),
                      );
                      toast.success("Order cancelled successfully");
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1"
                  onClick={() => {
                    reorder(activeOrder);
                    setActiveOrder(null);
                  }}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reorder
                </Button>
                <Button
                  type="button"
                  className="h-11 flex-1"
                  onClick={() => {
                    setActiveOrder(null);
                    setTimeout(() => {
                      document
                        .getElementById("recent-orders")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }, 150);
                  }}
                >
                  View All Orders
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
