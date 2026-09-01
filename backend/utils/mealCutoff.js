/**
 * Helper to compute IST cutoff timestamp for a meal on a given date.
 * 
 * Cutoff rules:
 * Breakfast (7:00 AM - 8:00 AM)  -> Skip closes at 4:00 AM IST
 * Lunch (11:00 AM - 1:00 PM)     -> Skip closes at 8:00 AM IST
 * Snacks (4:00 PM - 5:00 PM)     -> Skip closes at 1:00 PM IST (13:00)
 * Dinner (7:00 PM - 8:00 PM)     -> Skip closes at 4:00 PM IST (16:00)
 */

const MEAL_CUTOFF_HOURS = {
  Breakfast: 4,  // 4:00 AM IST
  Lunch: 8,      // 8:00 AM IST
  Snacks: 13,    // 1:00 PM IST
  Dinner: 16,    // 4:00 PM IST
};

const MEAL_TIMINGS = {
  Breakfast: '7:00 AM – 8:00 AM',
  Lunch: '11:00 AM – 1:00 PM',
  Snacks: '4:00 PM – 5:00 PM',
  Dinner: '7:00 PM – 8:00 PM',
};

const getMealCutoffInfo = (dateInput, mealType) => {
  const cutoffHour = MEAL_CUTOFF_HOURS[mealType] !== undefined ? MEAL_CUTOFF_HOURS[mealType] : 4;

  let dateStr = '';
  if (typeof dateInput === 'string') {
    dateStr = dateInput.slice(0, 10);
  } else if (dateInput instanceof Date) {
    dateStr = dateInput.toISOString().slice(0, 10);
  } else {
    dateStr = new Date().toISOString().slice(0, 10);
  }

  const [year, month, day] = dateStr.split('-').map(Number);

  // IST is UTC + 5 hours 30 minutes.
  // To construct timestamp for cutoffHour:00:00 IST:
  // Cutoff in UTC ms = Date.UTC(year, month - 1, day, cutoffHour, 0, 0) - (5.5 * 3600 * 1000)
  const cutoffMs = Date.UTC(year, month - 1, day, cutoffHour, 0, 0) - (5.5 * 3600 * 1000);
  const cutoffDate = new Date(cutoffMs);

  const nowMs = Date.now();
  const isPastCutoff = nowMs >= cutoffMs;

  const displayTime =
    cutoffHour === 12
      ? '12:00 PM'
      : cutoffHour > 12
      ? `${cutoffHour - 12}:00 PM`
      : `${cutoffHour}:00 AM`;

  return {
    cutoffDate,
    cutoffMs,
    isPastCutoff,
    formattedCutoff: displayTime,
    mealTiming: MEAL_TIMINGS[mealType] || 'Standard Time',
  };
};

module.exports = { getMealCutoffInfo, MEAL_CUTOFF_HOURS, MEAL_TIMINGS };
