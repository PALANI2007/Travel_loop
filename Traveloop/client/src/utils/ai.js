import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateLocalItinerary } from "./localItinerary";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI = null;
if (GEMINI_KEY && GEMINI_KEY !== 'undefined') {
  genAI = new GoogleGenerativeAI(GEMINI_KEY);
}

export const generateTripAI = async (tripData) => {
  // If no API key, immediately use fallback
  if (!genAI) {
    console.warn("Gemini API key missing. Using local fallback.");
    return generateLocalItinerary(tripData);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Generate a highly personalized, detailed day-wise travel itinerary for a ${tripData.days}-day trip.
  Source City: ${tripData.source}
  Destination City: ${tripData.destination}
  Travelers: ${tripData.memberCount} (${tripData.travelType})
  Interests: ${tripData.interests.join(", ")}
  Budget Category: ${tripData.budget}
  
  Requirements:
  1. Day-wise activities with specific timings (Morning, Afternoon, Evening).
  2. Include authentic local food recommendations (famous cafes/street food) for each day.
  3. Include realistic hidden gems based on interests: ${tripData.interests.join(", ")}.
  4. Provide a realistic budget breakdown in INR for ${tripData.memberCount} people.
  5. Tailor activities for ${tripData.travelType} travel.
  
  Return the response in this EXACT JSON format:
  {
    "trip_overview": "Creative summary mentioning source to destination journey",
    "itinerary": [
      {
        "day": 1,
        "activities": [
          { "time": "09:00 AM", "location": "Place Name", "description": "Specific activity details" },
          { "time": "02:00 PM", "location": "Place Name", "description": "Specific activity details" },
          { "time": "07:00 PM", "location": "Place Name", "description": "Dinner/Night activity" }
        ],
        "food": "Specific local dish or restaurant suggestion for this day"
      }
    ],
    "packing_list": ["item1", "item2", ...],
    "travel_tips": ["tip1", "tip2", ...],
    "estimated_costs": {
      "Accommodation": 0,
      "Food": 0,
      "Transport": 0,
      "Activities": 0
    }
  }
  
  IMPORTANT: Return ONLY the raw JSON object. Do not include markdown code blocks or any other text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const data = JSON.parse(text);
      return { ...data, aiGenerated: true };
    } catch {
      console.error("Failed to parse AI response, falling back to local:", text);
      return generateLocalItinerary(tripData);
    }
  } catch (error) {
    console.error("Error generating trip with Gemini, using fallback:", error);
    // Graceful fallback for API errors (invalid key, quota, etc)
    return generateLocalItinerary(tripData);
  }
};
