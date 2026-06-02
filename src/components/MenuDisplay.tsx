"use client";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";

import { menuData } from "@/data/menu";
import { formatItemDiscountedINR, formatINR, getItemDiscountPercent } from "@/lib/currency";

// A pool of unique image URLs assigned deterministically to foods
const imagePool: Record<string, string[]> = {
  Combos: [
    "https://images.unsplash.com/photo-1610614819513-58e34989848b?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=500&q=80",
  ],
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
  "Paneer Burger":
    "https://flatskitchen.com/upload_images/1732947675paneerburger1.png",
  "Hot Dog":
    "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=500&q=80",
  "BBQ Chicken Burger":
    "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=500&q=80",
  "Mushroom Swiss Burger":
    "https://images.unsplash.com/photo-1603064752734-4c48eff53d05?auto=format&fit=crop&w=500&q=80",
  "Mini Slider Duo":
    "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=500&q=80",
  "Margherita Pizza":
    "https://images.unsplash.com/photo-1574071318508-1c/*  */dbab80d002?auto=format&fit=crop&w=500&q=80",
  "Pepperoni Pizza":
    "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=80",
  "BBQ Chicken Pizza":
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38? auto=format&fit=crop&w=500&q=80",
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
  "Lasagna":
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
  "Quesadilla":
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
    "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=500&q=80",
  "Watermelon Feta Salad":
    "https://images.unsplash.com/photo-1580013759032-1d65856f52a7?auto=format&fit=crop&w=500&q=80",
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
    "https://images.unsplash.com/photo-1605333396914-232145e54d80?auto=format&fit=crop&w=500&q=80",
  "Pretzel Bites":
    "https://images.unsplash.com/photo-1567022879122-5f0d4f9b64f9?auto=format&fit=crop&w=500&q=80",
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
  "Tiramisu":
    "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&q=80",
  "Apple Pie":
    "https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?auto=format&fit=crop&w=500&q=80",
  "Ice Cream Sundae":
    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=500&q=80",
  "Donut Box (6)":
    "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80",
  "Pancake Stack":
    "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=500&q=80",
  "Gulab Jamun Cup":
    "https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&w=500&q=80",
  "Brownie Bite Box":
    "https://images.unsplash.com/photo-1589301760014-d929f39ce9b0?auto=format&fit=crop&w=500&q=80",
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
  "Lemonade":
    "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=500&q=80",
  "Masala Chai":
    "https://images.unsplash.com/photo-1578885146056-db7dd87afad3?auto=format&fit=crop&w=500&q=80",
  "Cold Coffee Frappe":
    "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=500&q=80",
  "Mineral Water":
    "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=500&q=80",
};

const getFoodImage = (name: string, category: string) => {
  if (dishImages[name]) return dishImages[name];
  const normalizedName = name.toLowerCase();
  if (normalizedName.includes("chicken") && normalizedName.includes("burger")) {
    return "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=500&q=80";
  }
  if (normalizedName.includes("sandwich")) {
    return "https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&w=500&q=80";
  }
  if (normalizedName.includes("slider")) {
    return "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=500&q=80";
  }
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

type MenuItemType = { name: string; price: number; description: string };

const categories = Object.keys(menuData);

const itemMatchesSearch = (category: string, item: MenuItemType, query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const searchableText = `${item.name} ${category} ${item.description}`.toLowerCase();
  return normalizedQuery
    .split(/\s+/)
    .every((term) => searchableText.includes(term));
};

export default function MenuDisplay({ addToCart }: { addToCart: (item: MenuItemType) => void }) {
  const [activeTab, setActiveTab] = useState(categories[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Scroll spy effect to highlight the active tab while scrolling
  useEffect(() => {
    const handleScroll = () => {
      const categoryElements = categories.map((cat) => {
        const el = document.getElementById(`category-${cat}`);
        return { cat, top: el ? el.getBoundingClientRect().top : Infinity };
      });

      // Find the last category that has scrolled up past the viewing threshold
      const visibleElements = categoryElements.filter((el) => el.top <= 250);
      if (visibleElements.length > 0) {
        setActiveTab(visibleElements[visibleElements.length - 1].cat);
      } else {
        setActiveTab(categories[0]);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on mount to establish the correct active tab
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToCategory = (cat: string) => {
    setActiveTab(cat);
    const element = document.getElementById(`category-${cat}`);
    if (element) {
      // Smooth scroll to the category, offsetting for the sticky headers
      const y = element.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const executeSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      searchInputRef.current?.focus();
      setSubmittedQuery("");
      return;
    }
    setActiveTab(categories[0]);
    setSubmittedQuery(searchQuery.trim());
  };

  const updateSearchQuery = (value: string) => {
    setSearchQuery(value);
    const nextQuery = value.trim();
    if (nextQuery) {
      setActiveTab(categories[0]);
    }
    setSubmittedQuery(nextQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSubmittedQuery("");
  };

  const hasResults = Object.entries(menuData).some(([category, items]) => {
    const query = submittedQuery.toLowerCase();
    if (!query) return true;
    if (category.toLowerCase().includes(query)) return true;
    return items.some((item) => itemMatchesSearch(category, item, query));
  });

  return (
    <div className="menu-container">
      {/* Injecting CSS classes for the hover effects */}
      <style>
        {`
          .menu-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 12px;
            border-radius: 8px;
            transition: all 0.2s ease-in-out;
          }
          .menu-item:hover {
            background-color: #fdf2f2; /* A soft reddish background */
            transform: scale(1.02);
            box-shadow: 0 4px 8px rgba(0,0,0,0.05);
            cursor: pointer;
          }
          .add-to-cart-btn {
            opacity: 0;
            pointer-events: none;
            background-color: #e63946;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: bold;
            transition: all 0.2s ease-in-out;
          }
          .menu-item:hover .add-to-cart-btn {
            opacity: 1;
            pointer-events: auto;
          }
          .add-to-cart-btn:hover {
            background-color: #d62828;
            transform: scale(1.05);
          }
        `}
      </style>

      <form role="search" onSubmit={executeSearch} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap", width: "100%" }}>
        <div style={{ flex: "1 1 300px", minWidth: "220px", maxWidth: "600px", display: "flex", gap: "8px" }}>
          <div style={{ position: "relative", width: "100%", minWidth: "0" }}>
            <input
              ref={searchInputRef}
              id="menu-search"
              type="text"
              accessKey="s"
              name="menu-search"
              aria-label="Search menu items"
              aria-controls="menu-results"
              placeholder="Search for food or ingredients..."
              value={searchQuery}
              onChange={(e) => updateSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 40px 14px 14px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                boxSizing: "border-box",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "#888", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                aria-label="Clear search"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <button
            type="submit"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: "92px", height: "44px", padding: "0 18px", backgroundColor: "#ff9800", color: "#111", border: "1px solid #f4b24d", borderRadius: "12px", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.12)", flexShrink: 0, fontWeight: 700, fontSize: "1rem", userSelect: "none" }}
            aria-label="Search food"
            aria-controls="menu-results"
            title="Search food"
          >
            Search
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          <strong style={{ color: "#333" }}>Sort By:</strong>
          <select
            aria-label="Sort menu items"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ minWidth: "170px", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", outline: "none", cursor: "pointer", fontSize: "1rem" }}
          >
            <option value="default">Relevance</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>
      </form>

      <div aria-live="polite" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)" }}>
        {submittedQuery ? (hasResults ? `Showing results for ${submittedQuery}` : `No results for ${submittedQuery}`) : "Showing all menu items"}
      </div>

      {/* Category Tabs */}
      <div
        id="menu-results"
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          paddingBottom: "15px",
          paddingTop: "15px",
          marginBottom: "20px",
          scrollbarWidth: "none",
          position: "sticky",
          top: "60px",
          zIndex: 40,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => scrollToCategory(cat)}
            aria-pressed={activeTab === cat}
            aria-label={`Show ${cat} menu items`}
            style={{
              padding: "8px 18px",
              borderRadius: "20px",
              border: "none",
              whiteSpace: "nowrap",
              fontWeight: "bold",
              cursor: "pointer",
              backgroundColor: activeTab === cat ? "#2a9d8f" : "#f1f1f1",
              color: activeTab === cat ? "white" : "#333",
              transition: "all 0.2s",
              boxShadow: activeTab === cat ? "0 4px 8px rgba(42, 157, 143, 0.3)" : "none",
            }}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {!hasResults && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#777",
            backgroundColor: "#f9f9f9",
            borderRadius: "12px",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>No items found</h3>
          <p>We couldn't find anything matching "{submittedQuery}". Try a different search term!</p>
        </div>
      )}

      {/* CSS Grid for a two-column responsive layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "40px",
        }}
      >
        {Object.entries(menuData).map(([category, items]) => {
          const query = submittedQuery.toLowerCase();
          const matchesCategory = category.toLowerCase().includes(query);
          const filteredItems = items.filter(
            (item) =>
              !query ||
              matchesCategory ||
              itemMatchesSearch(category, item, query),
          );

          // Apply sorting
          const sortedItems = [...filteredItems].sort((a, b) => {
            if (sortBy === "priceAsc") return a.price - b.price;
            if (sortBy === "priceDesc") return b.price - a.price;
            return 0;
          });

          if (sortedItems.length === 0) return null;

          return (
            <div key={category} id={`category-${category}`} className="menu-category">
              <h2
                style={{
                  textTransform: "capitalize",
                  borderBottom: "2px solid #ccc",
                  paddingBottom: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <img
                  src={getFoodImage(category, category)}
                  alt={`${category} category`}
                  style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                />
                {category}
              </h2>

              <ul style={{ listStyleType: "none", paddingLeft: "0" }}>
                {sortedItems.map((item, index) => (
                  <li key={index} className="menu-item" style={{ marginBottom: "10px" }}>
                    <img
                      src={getFoodImage(item.name, category)}
                      alt={item.name}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginRight: "15px",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        marginRight: "15px",
                      }}
                    >
                      <span style={{ fontWeight: "bold", color: "#333" }}>{item.name}</span>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "#777",
                          marginTop: "4px",
                          lineHeight: "1.4",
                        }}
                      >
                        {item.description}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ fontWeight: "bold", color: "#e63946" }}>
                          {formatItemDiscountedINR(item.price, category)}
                        </span>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#999",
                            textDecoration: "line-through",
                          }}
                        >
                          {formatINR(item.price)}
                        </span>
                        <span style={{ marginLeft: 6, fontSize: "0.75rem", color: "#2b8a3e", fontWeight: 600 }}>
                          {getItemDiscountPercent(item.price, category)}% off
                        </span>
                      </span>
                      <button
                        className="add-to-cart-btn"
                        onClick={() => {
                          addToCart(item);
                          toast.success(`Added ${item.name} to cart!`);
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
