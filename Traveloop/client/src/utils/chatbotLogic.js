/**
 * Traveloop Smart Fallback AI
 * Provides intelligent travel responses when API is unavailable
 */

const travelData = {
  destinations: {
    "bali": {
      cost: "₹50,000 - ₹1,50,000",
      duration: "5-10 days",
      bestTime: "April to October",
      foods: "Nasi Goreng, Sate Lilit, Babi Guling",
      tips: "Rent a scooter for easy travel, but wear a helmet!"
    },
    "paris": {
      cost: "₹1,50,000 - ₹3,00,000",
      duration: "4-7 days",
      bestTime: "June to August",
      foods: "Croissants, Escargot, Macarons",
      tips: "Book Eiffel Tower tickets weeks in advance."
    },
    "tokyo": {
      cost: "₹1,20,000 - ₹2,50,000",
      duration: "7-12 days",
      bestTime: "March to May (Cherry Blossom)",
      foods: "Sushi, Ramen, Takoyaki",
      tips: "Get a JR Pass if traveling between cities."
    }
  },
  routes: [
    { from: "tamilnadu", to: "mumbai", suggestions: "Flight is fastest (2h), Train (Saurashtra Exp) is scenic (24-30h).", cost: "₹3,000 - ₹8,000", option: "IndiGo or Air India for convenience." },
    { from: "chennai", to: "bangalore", suggestions: "Shatabdi Express (5h) or Bus (6h).", cost: "₹500 - ₹1,500", option: "Train is most comfortable." },
    { from: "delhi", to: "goa", suggestions: "Flight is best (2.5h). Trains take 24h+.", cost: "₹4,000 - ₹12,000", option: "Book flights at least 1 month early." }
  ]
};

export const getSmartFallbackResponse = (input) => {
  const query = input.toLowerCase();

  // Route Planning
  for (const route of travelData.routes) {
    if (query.includes(route.from) && query.includes(route.to)) {
      return `For your trip from ${route.from} to ${route.to}:
- 🚆 Suggested: ${route.suggestions}
- 💰 Estimated Cost: ${route.cost}
- ✈️ Best Option: ${route.option}
How else can I help with this route?`;
    }
  }

  // Destination Info
  for (const [name, info] of Object.entries(travelData.destinations)) {
    if (query.includes(name)) {
      return `Exploring ${name.toUpperCase()}? Here is what I found:
- 📅 Best Time: ${info.bestTime}
- ⏳ Duration: ${info.duration}
- 💸 Budget: ${info.cost}
- 🍱 Local Food: ${info.foods}
- 💡 Pro Tip: ${info.tips}
Would you like me to generate a full itinerary for ${name}?`;
    }
  }

  // General Categories
  if (query.includes("budget") || query.includes("cost") || query.includes("price")) {
    return "Budgeting depends on your destination! Generally, for Southeast Asia, ₹5,000/day is comfortable. For Europe or USA, plan for at least ₹15,000/day. Use our 'Budget Tracker' tool for precise planning!";
  }

  if (query.includes("packing") || query.includes("carry") || query.includes("list")) {
    return "Always pack: 1. Universal Power Adapter, 2. Power Bank, 3. Basic First Aid, 4. Reusable Water Bottle. For specific lists, check out our 'Packing Checklist' page!";
  }

  if (query.includes("weather") || query.includes("rain") || query.includes("hot")) {
    return "Weather varies wildly! Most tropical destinations have monsoon seasons. I recommend checking the forecast 48 hours before departure. Always carry a light windbreaker!";
  }

  if (query.includes("safety") || query.includes("safe")) {
    return "Safety first! 1. Keep digital copies of docs, 2. Don't carry too much cash, 3. Use registered taxis/apps like Uber or Grab, 4. Research local scams before arriving.";
  }

  if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
    return "Hello! I'm your Traveloop AI. I can help with routes, budgets, packing lists, and destination tips. Where are we heading next?";
  }

  // Default intelligent response
  return "That sounds like an interesting travel query! While I'm still learning about every corner of the world, I can tell you that planning ahead is the key to a great trip. Try asking about specific routes (e.g., 'Tamilnadu to Mumbai') or destinations like 'Bali' or 'Tokyo'!";
};
