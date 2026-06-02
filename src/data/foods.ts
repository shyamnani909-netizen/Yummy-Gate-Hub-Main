export interface Food {
  id: number;
  name: string;
  category: string;
  price: number;
  emoji: string;
  desc: string;
  image?: string;
}

export const FOODS: Food[] = [
  { id: 101, name: "Yummy Combo Feast", category: "Combos", price: 399, emoji: "COMBO", desc: "Cheeseburger, regular fries, chocolate lava cake, and a chilled cola" },
  { id: 102, name: "Pizza Party Combo", category: "Combos", price: 549, emoji: "COMBO", desc: "Margherita pizza, garlic bread, two brownies, and two chilled drinks" },
  { id: 103, name: "Family Biryani Combo", category: "Combos", price: 699, emoji: "COMBO", desc: "Chicken biryani, chicken 65, steamed momos, gulab jamun, and two lemonades" },
  { id: 104, name: "Snack Attack Combo", category: "Combos", price: 299, emoji: "COMBO", desc: "Mini slider duo, masala fries, corn cheese balls, and iced coffee" },
  { id: 105, name: "Dessert Duo Combo", category: "Combos", price: 249, emoji: "COMBO", desc: "Chocolate lava cake, mango kulfi, donut box, and strawberry milkshake" },
  { id: 1, name: "Classic Cheeseburger", category: "Burgers", price: 119, emoji: "🍔", desc: "Juicy patty with cheddar and house sauce" },
  { id: 2, name: "Aloo Tikki Burger", category: "Burgers", price: 79, emoji: "🍔", desc: "Crispy potato patty with mint mayo" },
  { id: 3, name: "Veggie Burger", category: "Burgers", price: 99, emoji: "🍔", desc: "Vegetable patty with fresh greens", image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=500&q=80" },
  { id: 4, name: "Double Smash Burger", category: "Burgers", price: 169, emoji: "🍔", desc: "Two smashed patties with melted cheese" },
  { id: 5, name: "Chicken Sandwich", category: "Burgers", price: 129, emoji: "🥪", desc: "Crispy chicken fillet with slaw", image: "https://c.ndtvimg.com/2021-07/vckh316o_grilled-chicken-sandwich_625x300_28_July_21.jpg" },
  { id: 6, name: "Paneer Burger", category: "Burgers", price: 109, emoji: "🍔", desc: "Spiced paneer patty with tangy chutney" },
  { id: 7, name: "Hot Dog", category: "Burgers", price: 89, emoji: "🌭", desc: "Grilled sausage with mustard and onions" },
  { id: 8, name: "BBQ Chicken Burger", category: "Burgers", price: 149, emoji: "🍔", desc: "Smoky chicken, BBQ glaze, crunchy lettuce" },
  { id: 9, name: "Mushroom Swiss Burger", category: "Burgers", price: 139, emoji: "🍔", desc: "Mushrooms, Swiss cheese, garlic mayo" },
  { id: 10, name: "Mini Slider Duo", category: "Burgers", price: 99, emoji: "🍔", desc: "Two small burgers for quick cravings" },

  { id: 11, name: "Margherita Pizza", category: "Pizza", price: 129, emoji: "🍕", desc: "Tomato, mozzarella, basil" },
  { id: 12, name: "Pepperoni Pizza", category: "Pizza", price: 179, emoji: "🍕", desc: "Classic pizza with spicy pepperoni" },
  { id: 14, name: "BBQ Chicken Pizza", category: "Pizza", price: 199, emoji: "🍕", desc: "Smoky BBQ chicken and red onion" },
  { id: 15, name: "Four Cheese Pizza", category: "Pizza", price: 189, emoji: "🍕", desc: "Mozzarella, cheddar, parmesan, cream cheese" },
  { id: 16, name: "Paneer Tikka Pizza", category: "Pizza", price: 169, emoji: "🍕", desc: "Paneer tikka, onions, masala sauce" },
  { id: 17, name: "Corn Cheese Pizza", category: "Pizza", price: 139, emoji: "🍕", desc: "Sweet corn and extra cheese" },
  { id: 18, name: "Chicken Keema Pizza", category: "Pizza", price: 209, emoji: "🍕", desc: "Spiced minced chicken and mozzarella" },
  { id: 19, name: "Veggie Supreme Pizza", category: "Pizza", price: 169, emoji: "🍕", desc: "Loaded with garden vegetables" },
  { id: 20, name: "Tandoori Mushroom Pizza", category: "Pizza", price: 159, emoji: "🍕", desc: "Tandoori mushrooms with herbed cheese" },

  { id: 21, name: "Spaghetti Bolognese", category: "Pasta", price: 159, emoji: "🍝", desc: "Slow-cooked tomato meat sauce" },
  { id: 22, name: "Penne Arrabiata", category: "Pasta", price: 129, emoji: "🍝", desc: "Spicy tomato and garlic sauce" },
  { id: 23, name: "Fettuccine Alfredo", category: "Pasta", price: 149, emoji: "🍝", desc: "Creamy parmesan white sauce" },
  { id: 24, name: "Mac and Cheese", category: "Pasta", price: 119, emoji: "🍝", desc: "Creamy macaroni with cheddar" },
  { id: 25, name: "Pesto Pasta", category: "Pasta", price: 149, emoji: "🍝", desc: "Basil pesto, garlic, and parmesan" },
  { id: 26, name: "Pink Sauce Pasta", category: "Pasta", price: 139, emoji: "🍝", desc: "Tomato cream sauce with herbs" },
  { id: 27, name: "Lasagna", category: "Pasta", price: 189, emoji: "🍝", desc: "Layered pasta with cheese and sauce" },
  { id: 28, name: "Creamy Mushroom Pasta", category: "Pasta", price: 149, emoji: "🍝", desc: "Mushrooms in a rich cream sauce" },
  { id: 29, name: "Chicken Alfredo Pasta", category: "Pasta", price: 179, emoji: "🍝", desc: "Grilled chicken with creamy pasta" },
  { id: 30, name: "Garlic Butter Spaghetti", category: "Pasta", price: 109, emoji: "🍝", desc: "Simple pasta tossed in garlic butter" },

  { id: 31, name: "Chicken Tacos", category: "Mexican", price: 119, emoji: "🌮", desc: "Three soft tacos with salsa" },
  { id: 32, name: "Bean Tacos", category: "Mexican", price: 89, emoji: "🌮", desc: "Beans, lettuce, cheese, fresh salsa" },
  { id: 33, name: "Beef Burrito", category: "Mexican", price: 149, emoji: "🌯", desc: "Stuffed with beans, rice, and beef" },
  { id: 34, name: "Paneer Burrito", category: "Mexican", price: 129, emoji: "🌯", desc: "Paneer, rice, beans, chipotle sauce", image: "https://ichef.bbci.co.uk/food/ic/food_16x9_1600/recipes/ultimate_paneer_burritos_11903_16x9.jpg" },
  { id: 35, name: "Quesadilla", category: "Mexican", price: 109, emoji: "🫓", desc: "Grilled tortilla with melted cheese" },
  { id: 36, name: "Nachos Supreme", category: "Mexican", price: 129, emoji: "🧀", desc: "Loaded chips with cheese and jalapenos" },
  { id: 37, name: "Mexican Rice Bowl", category: "Mexican", price: 119, emoji: "🍚", desc: "Rice, beans, salsa, sour cream" },
  { id: 38, name: "Falafel Wrap", category: "Mexican", price: 99, emoji: "🥙", desc: "Crispy falafel with tahini" },
  { id: 39, name: "Corn Salsa Cup", category: "Mexican", price: 69, emoji: "🥣", desc: "Sweet corn with lime and spices" },
  { id: 40, name: "Loaded Taco Fries", category: "Mexican", price: 119, emoji: "🍟", desc: "Fries topped with taco sauce and cheese" },

  { id: 41, name: "California Roll", category: "Sushi", price: 169, emoji: "🍣", desc: "Crab, avocado, cucumber" },
  { id: 42, name: "Salmon Nigiri", category: "Sushi", price: 219, emoji: "🍣", desc: "Fresh salmon over seasoned rice" },
  { id: 43, name: "Spicy Tuna Roll", category: "Sushi", price: 199, emoji: "🍣", desc: "Spicy minced tuna roll" },
  { id: 44, name: "Dragon Roll", category: "Sushi", price: 239, emoji: "🍣", desc: "Eel, avocado, signature glaze" },
  { id: 45, name: "Cucumber Maki", category: "Sushi", price: 99, emoji: "🍣", desc: "Fresh cucumber wrapped in rice", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Maki_Sushi_on_green_leaf_plate.jpg?width=500" },
  {
    id: 46,
    name: "Avocado Roll",
    category: "Sushi",
    price: 119,
    emoji: "🍣",
    desc: "Creamy avocado and sesame",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Avocado_maki.jpg",
  },
  { id: 47, name: "Shrimp Tempura Roll", category: "Sushi", price: 219, emoji: "🍣", desc: "Crispy shrimp tempura roll" },
  { id: 48, name: "Veg Sushi Platter", category: "Sushi", price: 199, emoji: "🍣", desc: "Assorted vegetarian sushi bites" },

  { id: 49, name: "Chicken Biryani", category: "Chicken", price: 149, emoji: "🍛", desc: "Fragrant rice with spiced chicken" },
  { id: 50, name: "Butter Chicken", category: "Chicken", price: 179, emoji: "🍲", desc: "Creamy tomato gravy with chicken" },
  { id: 51, name: "Chicken Tikka", category: "Chicken", price: 159, emoji: "🍢", desc: "Char-grilled marinated chicken" },
  { id: 52, name: "Crispy Chicken Wings", category: "Chicken", price: 149, emoji: "🍗", desc: "Crunchy wings with house spice" },
  { id: 53, name: "Chicken Fried Rice", category: "Chicken", price: 129, emoji: "🍚", desc: "Wok-tossed rice with chicken" },
  { id: 54, name: "Chicken 65", category: "Chicken", price: 139, emoji: "🍗", desc: "Crispy spicy chicken bites" },
  { id: 55, name: "Chicken Lollipop", category: "Chicken", price: 149, emoji: "🍗", desc: "Saucy Indo-Chinese chicken drumettes" },
  { id: 56, name: "Chicken Shawarma", category: "Chicken", price: 109, emoji: "🌯", desc: "Spiced chicken wrap with garlic sauce" },
  { id: 57, name: "Pepper Chicken", category: "Chicken", price: 169, emoji: "🍗", desc: "Chicken tossed with black pepper masala" },
  { id: 58, name: "Chicken Noodles", category: "Chicken", price: 129, emoji: "🍜", desc: "Stir-fried noodles with chicken" },
  { id: 59, name: "Tandoori Chicken Half", category: "Chicken", price: 199, emoji: "🍗", desc: "Smoky bone-in tandoori chicken" },
  { id: 60, name: "Chicken Kathi Roll", category: "Chicken", price: 99, emoji: "🌯", desc: "Chicken wrapped in flaky paratha", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chicken_Kathi_Roll_(5646735923).jpg?width=500" },

  { id: 61, name: "Caesar Salad", category: "Salads", price: 99, emoji: "🥗", desc: "Romaine, parmesan, croutons" },
  { id: 62, name: "Greek Salad", category: "Salads", price: 119, emoji: "🥗", desc: "Feta, olives, cucumber, tomato" },
  { id: 63, name: "Cobb Salad", category: "Salads", price: 149, emoji: "🥗", desc: "Chicken, egg, bacon, avocado" },
  { id: 64, name: "Quinoa Bowl", category: "Salads", price: 129, emoji: "🥙", desc: "Healthy grain bowl with vegetables" },
  { id: 65, name: "Sprout Chaat Salad", category: "Salads", price: 79, emoji: "🥗", desc: "Sprouts, onion, tomato, lemon masala" },
  { id: 66, name: "Watermelon Feta Salad", category: "Salads", price: 109, emoji: "🥗", desc: "Watermelon, feta, mint, black pepper", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Watermelon_salad.jpg" },
  { id: 67, name: "Grilled Chicken Salad", category: "Salads", price: 159, emoji: "🥗", desc: "Greens with grilled chicken and dressing" },
  { id: 68, name: "Fruit Salad Cup", category: "Salads", price: 89, emoji: "🥗", desc: "Seasonal fruit with honey lime", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Fruit_salad.jpg" },

  { id: 69, name: "French Fries", category: "Sides", price: 59, emoji: "🍟", desc: "Classic salted fries" },
  { id: 70, name: "Masala Fries", category: "Sides", price: 69, emoji: "🍟", desc: "Fries tossed in chatpata masala" },
  { id: 71, name: "Mozzarella Sticks", category: "Sides", price: 109, emoji: "🧀", desc: "Crispy breaded mozzarella" },
  { id: 72, name: "Onion Rings", category: "Sides", price: 89, emoji: "🧅", desc: "Golden crispy rings" },
  { id: 73, name: "Garlic Bread", category: "Sides", price: 79, emoji: "🥖", desc: "Toasted with garlic butter" },
  { id: 74, name: "Cheesy Garlic Bread", category: "Sides", price: 99, emoji: "🥖", desc: "Garlic bread loaded with cheese" },
  { id: 75, name: "Loaded Potato Skins", category: "Sides", price: 109, emoji: "🥔", desc: "Cheese, herbs, and sour cream", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Potato_skins.jpg" },
  { id: 76, name: "Pretzel Bites", category: "Sides", price: 89, emoji: "🥨", desc: "Soft pretzels with cheese dip", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Pretzel_bites.jpg" },
  { id: 77, name: "Corn Cheese Balls", category: "Sides", price: 99, emoji: "🧆", desc: "Crispy corn and cheese bites", image: "https://www.cubesnjuliennes.com/wp-content/uploads/2020/05/Corn-Cheese-Balls.jpg" },
  { id: 78, name: "Steamed Momos", category: "Sides", price: 89, emoji: "🥟", desc: "Soft dumplings with spicy dip" },
  { id: 79, name: "Veg Spring Rolls", category: "Sides", price: 99, emoji: "🌯", desc: "Crispy rolls with vegetables" },
  { id: 80, name: "Hummus and Pita", category: "Sides", price: 109, emoji: "🫓", desc: "Creamy hummus with warm pita" },

  { id: 81, name: "Chocolate Lava Cake", category: "Desserts", price: 99, emoji: "🍫", desc: "Molten chocolate center" },
  { id: 82, name: "New York Cheesecake", category: "Desserts", price: 119, emoji: "🍰", desc: "Classic creamy cheesecake" },
  { id: 83, name: "Tiramisu", category: "Desserts", price: 129, emoji: "🍰", desc: "Coffee-soaked Italian classic" },
  { id: 84, name: "Apple Pie", category: "Desserts", price: 89, emoji: "🥧", desc: "Warm pie with cinnamon" },
  { id: 85, name: "Ice Cream Sundae", category: "Desserts", price: 79, emoji: "🍨", desc: "Scoops with chocolate topping" },
  { id: 86, name: "Donut Box (6)", category: "Desserts", price: 149, emoji: "🍩", desc: "Six glazed assorted donuts" },
  { id: 87, name: "Pancake Stack", category: "Desserts", price: 109, emoji: "🥞", desc: "Fluffy pancakes with syrup" },
  { id: 88, name: "Gulab Jamun Cup", category: "Desserts", price: 69, emoji: "🍮", desc: "Soft jamuns in warm syrup" },
  { id: 89, name: "Brownie Bite Box", category: "Desserts", price: 99, emoji: "🍫", desc: "Fudgy bite-sized brownies", image: "https://commons.wikimedia.org/wiki/Special:FilePath/Brownie_bites.jpg" },
  { id: 90, name: "Mango Kulfi", category: "Desserts", price: 79, emoji: "🍨", desc: "Creamy frozen mango dessert" },

  { id: 91, name: "Coca-Cola", category: "Drinks", price: 49, emoji: "🥤", desc: "Chilled classic cola" },
  { id: 92, name: "Fresh Orange Juice", category: "Drinks", price: 69, emoji: "🧃", desc: "Freshly squeezed orange juice" },
  { id: 93, name: "Iced Coffee", category: "Drinks", price: 89, emoji: "☕", desc: "Cold coffee with milk" },
  { id: 94, name: "Strawberry Milkshake", category: "Drinks", price: 99, emoji: "🥤", desc: "Thick and creamy shake" },
  { id: 95, name: "Mango Smoothie", category: "Drinks", price: 99, emoji: "🥤", desc: "Tropical mango fruit blend" },
  { id: 96, name: "Green Tea", category: "Drinks", price: 49, emoji: "🍵", desc: "Soothing hot green tea" },
  { id: 97, name: "Lemonade", category: "Drinks", price: 49, emoji: "🍋", desc: "Refreshing sweet-tangy lemonade" },
  { id: 98, name: "Masala Chai", category: "Drinks", price: 39, emoji: "☕", desc: "Hot spiced tea with milk" },
  { id: 99, name: "Cold Coffee Frappe", category: "Drinks", price: 109, emoji: "🧋", desc: "Blended coffee with foam" },
  { id: 100, name: "Mineral Water", category: "Drinks", price: 29, emoji: "💧", desc: "Chilled bottled water" },
];

export const CATEGORIES = ["All", ...Array.from(new Set(FOODS.map((f) => f.category)))];

const normalizeSearchText = (value: string) => value.trim().toLowerCase();

export const foodMatchesSearch = (food: Food, query: string): boolean => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const searchableText = normalizeSearchText(`${food.name} ${food.category} ${food.desc}`);
  return normalizedQuery
    .split(/\s+/)
    .every((term) => searchableText.includes(term));
};

export const searchFoods = (query: string): Food[] => {
  return FOODS.filter((food) => foodMatchesSearch(food, query));
};
