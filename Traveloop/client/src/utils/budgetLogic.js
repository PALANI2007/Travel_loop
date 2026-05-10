/**
 * Traveloop Financial Calculation System
 * Calculates detailed trip budgets based on duration, members, and tier
 */

export const calculateTripBudget = (startDate, endDate, memberCount, budgetLevel) => {
  if (!startDate || !endDate) {
    return {
      totalBudget: 0,
      hotelCost: 0,
      foodCost: 0,
      transportCost: 0,
      activityCost: 0,
      perMemberCost: 0,
      tripDays: 0
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const tripDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (tripDays <= 0 || isNaN(tripDays)) {
    return {
      totalBudget: 0,
      hotelCost: 0,
      foodCost: 0,
      transportCost: 0,
      activityCost: 0,
      perMemberCost: 0,
      tripDays: 0
    };
  }

  const rates = {
    'Budget': 2500,
    'Moderate': 7500,
    'Luxury': 15000
  };

  const perMemberDayCost = rates[budgetLevel] || 7500;
  const totalBudget = perMemberDayCost * memberCount * tripDays;

  return {
    totalBudget,
    perMemberCost: perMemberDayCost * tripDays,
    perMemberPerDay: perMemberDayCost,
    tripDays,
    hotelCost: Math.round(totalBudget * 0.4),
    transportCost: Math.round(totalBudget * 0.2),
    foodCost: Math.round(totalBudget * 0.2),
    activityCost: Math.round(totalBudget * 0.2)
  };
};
