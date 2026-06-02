"use client"; // Required if you are using Next.js App Router to allow React State
import React, { useState, useEffect } from "react";
import MenuDisplay from "./MenuDisplay";
import Cart, { CartItem } from "./Cart";

export default function HomePage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from local storage when the component mounts
  useEffect(() => {
    // Clear any previously saved cart so every user starts with an empty cart
    try {
      localStorage.removeItem("tastely_cart");
    } catch {}
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    // Do not persist cart; ensure it remains empty across sessions
    try {
      localStorage.removeItem("tastely_cart");
    } catch {}
  }, [cartItems]);

  // Checks if item exists. If it does, increments quantity, else adds a new one.
  const addToCart = (item: { name: string; price: number }) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.name === item.name);
      if (existingItem) {
        return prev.map((i) => (i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (name: string) => {
    setCartItems((prev) => prev.filter((i) => i.name !== name));
  };

  // Safely updates the quantity of an item. If it drops to 0, it removes it entirely.
  const updateQuantity = (name: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.name === name) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    ); // Filter out any items that hit 0 quantity
  };

  const clearCart = () => setCartItems([]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <header style={{ padding: "20px", textAlign: "center", backgroundColor: "#f8f9fa" }}>
        <h1>Welcome to Yummy Gate Hub!</h1>
        <p style={{ color: "#555", marginTop: "10px" }}>Explore our delicious menu below</p>
      </header>

      <main
        style={{
          display: "flex",
          flexWrap: "wrap-reverse",
          gap: "30px",
          padding: "30px",
          maxWidth: "1400px",
          margin: "0 auto",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: "1 1 65%", minWidth: "320px" }}>
          <MenuDisplay addToCart={addToCart} />
        </div>
        <div style={{ flex: "1 1 30%", minWidth: "300px" }}>
          <Cart
            cartItems={cartItems}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            clearCart={clearCart}
          />
        </div>
      </main>

      <footer style={{ padding: "20px", textAlign: "center", marginTop: "40px" }}>
        <p>&copy; 2026 Yummy Gate Hub</p>
      </footer>
    </div>
  );
}
