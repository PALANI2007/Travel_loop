/**
 * Traveloop Smart Local Itinerary Generator
 * Generates intelligent trip plans when AI APIs are unavailable
 */

const destinationTemplates = {
  "goa": {
    activities: [
      "Baga & Calangute Beach Water Sports",
      "Old Goa Churches (Basilica of Bom Jesus)",
      "Anjuna Flea Market & Sunset",
      "Dudhsagar Falls Day Trip",
      "Fort Aguada Exploration",
      "Panjim Latin Quarter (Fontainhas) Walk",
      "Mandovi River Cruise"
    ],
    food: ["Fish Thali", "Prawn Balchao", "Goan Bebinca", "Vindaloo at Mum's Kitchen"],
    costs: { Accommodation: 3500, Food: 1200, Transport: 800, Activities: 2000 }
  },
  "ooty": {
    activities: [
      "Nilgiri Mountain Railway (Toy Train)",
      "Ooty Botanical Gardens",
      "Doddabetta Peak Viewpoint",
      "Pykara Lake & Waterfalls Boat Ride",
      "Rose Garden Stroll",
      "Tea Museum & Chocolate Factory",
      "Avalanche Lake Nature Trek"
    ],
    food: ["Homemade Chocolates", "Ooty Varkey", "South Indian Meals", "Masala Chai"],
    costs: { Accommodation: 3000, Food: 800, Transport: 1000, Activities: 1200 }
  },
  "chennai": {
    activities: [
      "Marina Beach Sunrise Walk",
      "Kapaleeshwarar Temple Visit",
      "Santhome Cathedral",
      "Government Museum & Art Gallery",
      "Mylapore Cultural Heritage Walk",
      "DakshinaChitra Heritage Museum",
      "Besant Nagar (Elliot's) Beach"
    ],
    food: ["Filter Coffee", "Murugan Idli Shop", "Saravana Bhavan Dosa", "Sundal at Marina Beach"],
    costs: { Accommodation: 4000, Food: 1000, Transport: 1200, Activities: 1500 }
  },
  "mumbai": {
    activities: [
      "Gateway of India & Taj Mahal Palace",
      "Marine Drive Sunset Walk",
      "Colaba Causeway Shopping",
      "Elephanta Caves Tour",
      "Siddhivinayak Temple Visit",
      "Juhu Beach & Local Street Food",
      "Bandra-Worli Sea Link Drive"
    ],
    food: ["Vada Pav at Ashok", "Pav Bhaji at Sardar", "Irani Chai at Kyani & Co", "Seafood at Gajalee"],
    costs: { Accommodation: 4000, Food: 1500, Transport: 1000, Activities: 2000 }
  },
  "bali": {
    activities: [
      "Uluwatu Temple Sunset",
      "Tegalalang Rice Terrace",
      "Sacred Monkey Forest Sanctuary",
      "Nusa Penida Day Trip",
      "Seminyak Beach Relaxing",
      "Mount Batur Sunrise Trek",
      "Ubud Art Market"
    ],
    food: ["Nasi Campur", "Bebek Bengil", "Local Warung Coffee", "Fresh Seafood BBQ"],
    costs: { Accommodation: 5000, Food: 2000, Transport: 1500, Activities: 3000 }
  },
  "paris": {
    activities: [
      "Eiffel Tower Summit",
      "Louvre Museum Tour",
      "Montmartre & Sacré-Cœur",
      "Seine River Cruise",
      "Champs-Élysées Walk",
      "Palace of Versailles",
      "Notre-Dame Cathedral"
    ],
    food: ["Le Relais de l'Entrecôte", "Laduree Macarons", "Local Patisserie", "Crepes at Le Marais"],
    costs: { Accommodation: 12000, Food: 5000, Transport: 2000, Activities: 6000 }
  }
};

const defaultActivities = [
  "City Center Exploration",
  "Local Market Visit",
  "Museum or Art Gallery",
  "Park or Nature Walk",
  "Famous Landmark Visit",
  "Street Food Tour",
  "Cultural Performance"
];

export const generateLocalItinerary = (tripData) => {
  const { destination, days, budget, memberCount = 1 } = tripData;
  const destKey = destination.toLowerCase().split(',')[0].trim();
  const template = destinationTemplates[destKey] || {
    activities: defaultActivities,
    food: ["Local Signature Dish", "Top-rated Street Food", "Traditional Family Restaurant"],
    costs: { Accommodation: 3000, Food: 1000, Transport: 800, Activities: 1500 }
  };

  const itinerary = [];
  const daysNum = parseInt(days) || 3;

  for (let i = 1; i <= daysNum; i++) {
    const dailyActivities = [];
    const morningIdx = (i * 2) % template.activities.length;
    const afternoonIdx = (i * 2 + 1) % template.activities.length;
    const eveningIdx = (i * 2 + 2) % template.activities.length;

    dailyActivities.push({ time: "09:00 AM", location: template.activities[morningIdx], description: "Morning exploration and sightseeing." });
    dailyActivities.push({ time: "02:00 PM", location: template.activities[afternoonIdx], description: "Afternoon cultural immersion and local spots." });
    dailyActivities.push({ time: "07:00 PM", location: template.activities[eveningIdx], description: "Evening leisure and dinner at a top spot." });

    itinerary.push({ day: i, activities: dailyActivities });
  }

  // Budget Multiplier
  const multiplier = budget === 'Luxury' ? 3 : budget === 'Moderate' ? 1.5 : 0.8;
  const finalCosts = {};
  Object.entries(template.costs).forEach(([key, val]) => {
    finalCosts[key] = Math.round(val * multiplier * daysNum * memberCount);
  });

  return {
    trip_overview: `An exciting ${daysNum}-day journey through ${destination} tailored for a ${budget} experience.`,
    itinerary,
    food_recommendations: template.food,
    packing_list: ["Universal Adapter", "Comfortable Walking Shoes", "Appropriate Attire for Temples/Churches", "Power Bank"],
    travel_tips: [
      "Use local transport apps for better rates.",
      "Carry a reusable water bottle.",
      "Download offline maps of the city.",
      "Keep digital copies of your travel documents."
    ],
    estimated_costs: finalCosts,
    aiGenerated: true,
    isLocalFallback: true
  };
};
