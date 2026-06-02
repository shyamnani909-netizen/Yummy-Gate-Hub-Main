"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Minus, Plus, ReceiptText, ShoppingBag, Ticket, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatItemDiscountedINR, formatINR, getItemDiscountedPrice } from "@/lib/currency";

export type CartItem = {
  name: string;
  price: number;
  quantity: number;
};

type CartProps = {
  cartItems: CartItem[];
  removeFromCart: (name: string) => void;
  updateQuantity: (name: string, delta: number) => void;
  clearCart: () => void;
};

const NEXT_ORDER_VOUCHER = {
  code: "YUMMY25",
  discount: "25% OFF",
  description: "Use this on your next order above Rs. 299.",
};

export default function Cart({
  cartItems,
  removeFromCart,
  updateQuantity,
  clearCart,
}: CartProps) {
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountMessage, setDiscountMessage] = useState({ text: "", type: "" });
  const [showVoucher, setShowVoucher] = useState(false);

  const normalizedCartItems = Array.isArray(cartItems) ? cartItems : [];
  const itemCount = normalizedCartItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0),
    0,
  );
  const subtotal = normalizedCartItems.reduce(
    (sum, item) => sum + getItemDiscountedPrice(Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  );
  const deliveryFee = itemCount === 0 || subtotal >= 499 ? 0 : 29;
  const platformFee = itemCount === 0 ? 0 : 6;
  const taxes = itemCount === 0 ? 0 : subtotal * 0.05;
  const discountAmount = subtotal * (discountPercent / 100);
  const total = subtotal + deliveryFee + platformFee + taxes - discountAmount;

  const hasItems = normalizedCartItems.length > 0;
  const itemCountLabel = itemCount > 0 ? `${itemCount} item${itemCount > 1 ? "s" : ""} selected` : "Add food to start";

  const [deliveryAddress, setDeliveryAddress] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tastely_saved_locations");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].address) {
          setDeliveryAddress(parsed[0].address);
          return;
        }
      }
    } catch {
      // ignore parse errors
    }
    setDeliveryAddress("");
  }, []);

  const handleApplyDiscount = () => {
    if (discountCode.trim().toUpperCase() === "TASTELY10") {
      setDiscountPercent(10);
      setDiscountMessage({ text: "10% discount applied", type: "success" });
    } else {
      setDiscountPercent(0);
      setDiscountMessage({ text: "Invalid discount code", type: "error" });
    }
  };

  const confirmOrder = () => {
    clearCart();
    setDiscountPercent(0);
    setDiscountCode("");
    setDiscountMessage({ text: "", type: "" });
    setIsCheckoutModalOpen(false);
    setShowVoucher(true);
  };

  return (
    <aside className="sticky top-5 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
      <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Order summary</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Your cart</h2>
            <p className="mt-1 text-sm text-muted-foreground">{itemCountLabel}</p>
          </div>
          {hasItems && (
            <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground">
              Clear cart
            </Button>
          )}
        </div>
      </div>

      {hasItems ? (
        <div className="space-y-5 p-5">
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 shadow-sm">
            {normalizedCartItems.map((item, index) => {
              const quantity = Number(item.quantity) || 0;
              const lineTotal = getItemDiscountedPrice(Number(item.price) || 0) * quantity;

              return (
                <div
                  key={item.name}
                  className={`flex flex-col gap-4 border-b border-slate-200 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatItemDiscountedINR(Number(item.price) || 0)} each</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:w-[230px]">
                    <div className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-destructive"
                        onClick={() => updateQuantity(item.name, -1)}
                        aria-label={`Decrease ${item.name}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="min-w-[32px] text-center text-sm font-semibold text-primary">{quantity}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full text-primary"
                        onClick={() => updateQuantity(item.name, 1)}
                        aria-label={`Increase ${item.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{formatINR(lineTotal)}</p>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.name)}
                        className="mt-1 text-xs font-medium text-destructive hover:text-destructive/80"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Coupon code</p>
                  <p className="mt-1 text-xs text-muted-foreground">Apply your discount before checkout</p>
                </div>
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  SAVE10
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="TASTELY10"
                  value={discountCode}
                  onChange={(event) => setDiscountCode(event.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
                <Button type="button" size="sm" onClick={handleApplyDiscount} className="min-w-[120px]">
                  Apply
                </Button>
              </div>
              {discountMessage.text && (
                <p className={`mt-3 text-sm ${discountMessage.type === "success" ? "text-green-600" : "text-destructive"}`}>
                  {discountMessage.text}
                </p>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">Bill details</p>
                <ReceiptText className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery fee</span>
                  <span>{deliveryFee === 0 ? "Free" : formatINR(deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform fee</span>
                  <span>{formatINR(platformFee)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Taxes</span>
                  <span>{formatINR(taxes)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm font-semibold text-green-600">
                    <span>Discount</span>
                    <span>-{formatINR(discountAmount)}</span>
                  </div>
                )}
                <div className="rounded-3xl border-t border-slate-200 pt-3 text-base font-bold">
                  <div className="flex justify-between">
                    <span>To pay</span>
                    <span>{formatINR(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <Button
              onClick={() => setIsCheckoutModalOpen(true)}
              className="h-14 w-full rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"
            >
              <div className="flex w-full items-center justify-between px-2 text-base font-semibold">
                <span>{formatINR(total)}</span>
                <span>Checkout</span>
              </div>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 p-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <ShoppingBag className="h-9 w-9 text-primary" />
          </div>
          <div>
            <p className="text-xl font-semibold text-slate-900">Your cart is empty</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add dishes from the menu and checkout details will appear here.
            </p>
          </div>
        </div>
      )}

      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Checkout Summary</h2>
                <p className="text-sm text-muted-foreground">{itemCount} item{itemCount > 1 ? "s" : ""}</p>
              </div>
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>

            <div className="space-y-3 rounded-xl border bg-secondary/20 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatINR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-3 text-base font-bold">
                <span>Final Price</span>
                <span>{formatINR(total)}</span>
              </div>
            </div>

            <input
              type="text"
              placeholder="Delivery address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="mt-4 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
            />

            <div className="mt-5 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1"
                onClick={() => setIsCheckoutModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" className="h-11 flex-1" onClick={confirmOrder}>
                Confirm Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {showVoucher && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-primary">Order placed successfully</p>
                <h2 className="mt-1 text-xl font-bold">Your food is on the way.</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  You unlocked a discount voucher for your next order.
                </p>
              </div>
              <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Ticket className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-emerald-950">
                    {NEXT_ORDER_VOUCHER.discount} unlocked
                  </p>
                  <p className="mt-1 text-xs text-emerald-800">
                    {NEXT_ORDER_VOUCHER.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-dashed border-emerald-300 bg-white px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Voucher code
                </span>
                <span className="text-base font-black text-emerald-950">
                  {NEXT_ORDER_VOUCHER.code}
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 flex-1"
                onClick={() => {
                  navigator.clipboard.writeText(NEXT_ORDER_VOUCHER.code);
                }}
              >
                Copy code
              </Button>
              <Button type="button" className="h-11 flex-1" onClick={() => setShowVoucher(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
