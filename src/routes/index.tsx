import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  ShoppingBag,
  Clock,
  Sparkles,
  Search,
  CreditCard,
  Truck,
  Star,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import heroFood from "@/assets/hero-food.jpg";
import { CONTACT_INFO, CONTACT_METHODS } from "@/data/contact";
import { FOODS, CATEGORIES } from "@/data/foods";
import { formatItemDiscountedINR, formatINR } from "@/lib/currency";
import { SITE_PREFERENCES } from "@/data/site";

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
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=500&q=80",
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
    "https://images.unsplash.com/photo-1601314002592-b8734bca6604?auto=format&fit=crop&w=500&q=80",
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
    "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=500&q=80",
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tastely — Order Food Online | 100+ Dishes Delivered Hot" },
      {
        name: "description",
        content:
          "Tastely is an online food ordering platform. Browse 100+ dishes across burgers, pizza, sushi, pasta and more. Fast delivery in 30 minutes.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { user } = useAuth();
  const comboOffers = FOODS.filter((food) => food.category === "Combos");
  const popular = FOODS.filter((food) => food.category !== "Combos").slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* HERO */}
        <section className="container mx-auto grid md:grid-cols-2 gap-10 items-center px-4 py-16">
          <div>
            <span className="inline-block text-xs font-semibold tracking-wider uppercase text-primary bg-primary/10 px-3 py-1 rounded-full">
              #1 Food Delivery
            </span>
            <h1 className="mt-4 text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
              Cravings? <span className="text-primary">We deliver.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-md">
              Order from 100+ delicious dishes — burgers, pizza, sushi, desserts and more — delivered
              hot to your door.
            </p>
            <div className="mt-8 flex gap-3 flex-wrap">
              {user ? (
                <>
                  <Link to="/menu">
                    <Button size="lg">Browse Menu</Button>
                  </Link>
                  {SITE_PREFERENCES.showCareers && (
                    <Link to="/careers">
                      <Button size="lg" variant="outline">
                        Careers
                      </Button>
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/signup">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline">
                      Login
                    </Button>
                  </Link>
                  {SITE_PREFERENCES.showCareers && (
                    <Link to="/careers">
                      <Button size="lg" variant="ghost">
                        Careers
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
            <div className="mt-10 flex gap-8">
              {[
                { n: "100+", l: "Dishes" },
                { n: "30 min", l: "Avg Delivery" },
                { n: "10k+", l: "Happy Customers" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-2xl font-bold text-primary">{s.n}</p>
                  <p className="text-xs text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-[var(--shadow-warm)]">
            <img
              src={heroFood}
              alt="Delicious food spread"
              width={1536}
              height={1024}
              className="w-full h-auto object-cover"
            />
          </div>
        </section>

        {comboOffers.length > 0 && (
          <section className="container mx-auto px-4 pb-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  Combo Offers
                </span>
                <h2 className="mt-3 text-3xl font-bold text-foreground">More value in every bite</h2>
                <p className="mt-2 text-muted-foreground">Pick a ready-made combo for solo cravings, family meals, or dessert runs.</p>
              </div>
              <Link to={user ? "/menu" : "/login"}>
                <Button variant="outline">View Combos</Button>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {comboOffers.slice(0, 4).map((combo) => (
                <Link
                  key={combo.id}
                  to={user ? "/menu" : "/login"}
                  className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-warm)]"
                >
                  <div className="h-40 overflow-hidden">
                    <img
                      src={getFoodImage(combo.name, combo.category)}
                      alt={combo.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      Save 30%
                    </span>
                    <h3 className="mt-3 font-bold text-foreground">{combo.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{combo.desc}</p>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="font-bold text-primary">{formatItemDiscountedINR(combo.price, combo.category)}</span>
                      <span className="text-xs text-muted-foreground line-through">
                        {formatINR(combo.price)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FEATURES */}
        <section id="features" className="container mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold">Why choose Tastely?</h2>
            <p className="text-muted-foreground mt-2">
              Everything you'd expect from a modern food app.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: "Fresh & Tasty",
                desc: "Quality ingredients prepared by top chefs.",
              },
              {
                icon: Clock,
                title: "Fast Delivery",
                desc: "Hot food delivered in 30 minutes or less.",
              },
              {
                icon: ShoppingBag,
                title: "Easy Ordering",
                desc: "Browse, add to cart, and checkout in seconds.",
              },
              {
                icon: CreditCard,
                title: "Secure Payments",
                desc: "Multiple secure payment options at checkout.",
              },
              {
                icon: Truck,
                title: "Live Tracking",
                desc: "Know exactly when your food is arriving.",
              },
              { icon: Star, title: "Top Rated", desc: "Rated 4.8/5 by thousands of foodies." },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border bg-card p-6 hover:shadow-[var(--shadow-warm)] transition-shadow"
              >
                <f.icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="bg-secondary/40 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold">Explore by category</h2>
              <p className="text-muted-foreground mt-2">From quick bites to full meals.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <span key={c} className="px-4 py-2 rounded-full bg-card border font-medium text-sm">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* POPULAR DISHES */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Popular dishes</h2>
              <p className="text-muted-foreground mt-2">A taste of what's on the menu.</p>
            </div>
            <Link to={user ? "/menu" : "/login"} className="hidden md:inline">
              <Button variant="outline">View all</Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popular.map((f) => (
              <Link
                key={f.id}
                to={user ? "/menu" : "/login"}
                className="rounded-xl border bg-card p-5 block transition-shadow hover:shadow-[var(--shadow-warm)]"
              >
                <div className="mb-4 h-32 w-full overflow-hidden rounded-lg">
                  <img
                    src={getFoodImage(f.name, f.category)}
                    alt={f.name}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <h3 className="font-semibold">{f.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                  <p className="mt-3 flex items-baseline gap-2">
                  <span className="font-bold text-primary">{formatItemDiscountedINR(f.price, f.category)}</span>
                  <span className="text-xs text-muted-foreground line-through">
                    {formatINR(f.price)}
                  </span>
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-secondary/40 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
              <p className="text-muted-foreground mt-2">Three simple steps to a happy stomach.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Search,
                  step: "01",
                  title: "Browse menu",
                  desc: "Pick from 100+ dishes across multiple categories.",
                },
                {
                  icon: ShoppingBag,
                  step: "02",
                  title: "Add to cart",
                  desc: "Customize quantities and review your order.",
                },
                {
                  icon: Truck,
                  step: "03",
                  title: "Get it delivered",
                  desc: "Track your order until it reaches your door.",
                },
              ].map((s) => (
                <div key={s.step} className="rounded-xl bg-card border p-6 relative">
                  <span className="absolute top-4 right-4 text-3xl font-extrabold text-primary/15">
                    {s.step}
                  </span>
                  <s.icon className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold">What our customers say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Aarav S.",
                text: "Best food delivery app I've used. Fast and the burgers are amazing!",
              },
              {
                name: "Priya M.",
                text: "Love the variety. The sushi rolls arrive fresh every single time.",
              },
              {
                name: "Rohit K.",
                text: "Smooth ordering and on-time delivery. Highly recommend Tastely.",
              },
            ].map((t) => (
              <div key={t.name} className="rounded-xl border bg-card p-6">
                <div className="flex gap-0.5 text-primary mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-foreground">"{t.text}"</p>
                <p className="mt-4 font-semibold text-sm">— {t.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-16">
          <div className="rounded-2xl p-10 md:p-14 text-center bg-[image:var(--gradient-warm)] text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold">Hungry? Order in seconds.</h2>
            <p className="mt-3 opacity-90">Sign up free and explore 100+ dishes ready to deliver.</p>
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
              {user ? (
                <Link to="/menu">
                  <Button size="lg" variant="secondary">
                    Open Menu
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <Button size="lg" variant="secondary">
                      Create Account
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
                    >
                      Login
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {(SITE_PREFERENCES.showAbout || SITE_PREFERENCES.showCareers) && (
          <section className="bg-secondary/40 py-16">
            <div className="container mx-auto px-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Link
                  to={user ? "/menu" : "/login"}
                  className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-[var(--shadow-warm)]"
                >
                  <h2 className="text-xl font-semibold">Menu</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Browse dishes, add items to cart, and complete checkout with delivery options.
                  </p>
                  <Button className="mt-5" variant="outline">
                    Open Menu
                  </Button>
                </Link>
                {SITE_PREFERENCES.showAbout && (
                  <Link
                    to="/about"
                    className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-[var(--shadow-warm)]"
                  >
                    <h2 className="text-xl font-semibold">About Us</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Learn how Tastely makes ordering fresh food simple, fast, and reliable.
                    </p>
                    <Button className="mt-5" variant="outline">
                      Open About Us
                    </Button>
                  </Link>
                )}
                {SITE_PREFERENCES.showCareers && (
                  <Link
                    to="/careers"
                    className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-[var(--shadow-warm)]"
                  >
                    <h2 className="text-xl font-semibold">Careers</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Explore open roles and help build a better online food ordering experience.
                    </p>
                    <Button className="mt-5" variant="outline">
                      Open Careers
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}

        {/* CONTACT */}
        {SITE_PREFERENCES.showContact && (
          <section id="contact" className="container mx-auto px-4 py-16">
            <div className="grid md:grid-cols-3 gap-6">
              {CONTACT_METHODS.map((method) => {
                const Icon =
                  method.icon === "phone" ? Phone : method.icon === "email" ? Mail : MapPin;
                return (
                  <div
                    key={method.title}
                    className="rounded-xl border bg-card p-6 flex items-start gap-4"
                  >
                    <Icon className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold">{method.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{method.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t bg-secondary/30">
        <div className="container mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg">Tastely</h3>
            <p className="text-sm text-muted-foreground mt-2">Delicious food, delivered fast.</p>
            <div className="flex gap-3 mt-4">
              <Facebook className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
              <Instagram className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
              <Twitter className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to={user ? "/menu" : "/login"} className="hover:text-primary">
                  Menu
                </Link>
              </li>
              {SITE_PREFERENCES.showAbout && (
                <li>
                  <Link to="/about" className="hover:text-primary">
                    About Us
                  </Link>
                </li>
              )}
              {SITE_PREFERENCES.showCareers && (
                <li>
                  <Link to="/careers" className="hover:text-primary">
                    Careers
                  </Link>
                </li>
              )}
              {SITE_PREFERENCES.showHelp && (
                <li>
                  <Link to="/help" className="hover:text-primary">
                    Help Center
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Privacy policy</li>
              <li>Terms of service</li>
              <li>Cookies</li>
            </ul>
          </div>
        </div>
        <div className="border-t py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Tastely. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
