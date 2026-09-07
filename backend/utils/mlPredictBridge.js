/**
 * ML Prediction Bridge for Hostel Waste Food Management
 * Integrates trained scikit-learn models (predict.py) into Express backend.
 */

const { spawn } = require('child_process');
const path = require('path');
const Booking = require('../models/Booking');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const FoodEntry = require('../models/FoodEntry');

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Executes predict.py via child process
 */
function callPythonInference(payload) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, '../../predict.py');
    const pythonExe = process.platform === 'win32' ? 'py' : 'python3';
    
    const py = spawn(pythonExe, [scriptPath, JSON.stringify(payload)], {
      cwd: path.resolve(__dirname, '../../'),
    });

    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (d) => { stdout += d.toString(); });
    py.stderr.on('data', (d) => { stderr += d.toString(); });

    py.on('error', (err) => {
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });

    py.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`ML script exited with code ${code}: ${stderr}`));
      }
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (e) {
        reject(new Error(`Failed to parse ML JSON output: ${stdout}`));
      }
    });
  });
}

/**
 * Gathers database counts (students, skips, visitor bookings, menu)
 * and runs full Food Requirement + Waste ML prediction.
 */
async function getMealPrediction({ dateStr, mealType, overrides = {} }) {
  const dateInput = dateStr ? dateStr.slice(0, 10) : new Date().toISOString().slice(0, 10);
  const [year, month, day] = dateInput.split('-').map(Number);

  // IST date boundaries (UTC+5:30)
  const startMs = Date.UTC(year, month - 1, day, 0, 0, 0) - (5.5 * 3600 * 1000);
  const endMs = startMs + (24 * 3600 * 1000) - 1;
  const start = new Date(startMs);
  const end = new Date(endMs);

  const dateObj = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = DAYS[dateObj.getUTCDay()];

  // 1. Total Enrolled Students (Default 500 per specification)
  let totalStudents = overrides.total_students;
  if (totalStudents === undefined || totalStudents === null) {
    const dbActiveStudents = await User.countDocuments({ role: 'student', isActive: true });
    totalStudents = dbActiveStudents > 0 ? dbActiveStudents : 500;
  }

  // 2. Count Valid Student Skips for this date & mealType
  let studentSkips = overrides.student_skips;
  if (studentSkips === undefined || studentSkips === null) {
    studentSkips = await Booking.countDocuments({
      date: { $gte: start, $lte: end },
      mealType,
      status: 'skipped',
      isVisitorPass: { $ne: true },
    });
  }

  const expectedStudentAttendance = overrides.expected_student_attendance !== undefined
    ? Number(overrides.expected_student_attendance)
    : Math.max(0, totalStudents - studentSkips);

  // 3. Count Confirmed Paid Visitor Bookings for this meal (sum of tokens/guests)
  let visitorBookings = overrides.visitor_bookings;
  if (visitorBookings === undefined || visitorBookings === null) {
    const visitorAgg = await Booking.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end },
          mealType,
          isVisitorPass: true,
          paymentStatus: 'paid',
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $ifNull: ['$quantity', 1] } },
        },
      },
    ]);
    visitorBookings = visitorAgg[0]?.total || 0;
  }

  const visitorAttendanceRate = overrides.visitor_attendance_rate || 0.90;
  const expectedVisitorAttendance = overrides.expected_visitor_attendance !== undefined
    ? Number(overrides.expected_visitor_attendance)
    : Math.round(visitorBookings * visitorAttendanceRate);

  const expectedTotalAttendance = expectedStudentAttendance + expectedVisitorAttendance;

  // 4. Fetch Active Menu Item
  let menuName = overrides.menu;
  if (!menuName) {
    const menuItem = await MenuItem.findOne({ dayOfWeek, mealType, isActive: true });
    if (menuItem && menuItem.items && menuItem.items.length > 0) {
      menuName = menuItem.items.join(', ');
    }
  }

  // 5. Look up previous FoodEntry for historical context if available
  const MEAL_BENCHMARKS = {
    Breakfast: { prevPrepared: 118.0, prevConsumed: 112.0, prevWaste: 6.0, prevAtt: 440 },
    Lunch: { prevPrepared: 215.0, prevConsumed: 205.0, prevWaste: 10.0, prevAtt: 475 },
    Snacks: { prevPrepared: 68.0, prevConsumed: 63.0, prevWaste: 5.0, prevAtt: 445 },
    Dinner: { prevPrepared: 220.0, prevConsumed: 210.0, prevWaste: 10.0, prevAtt: 475 },
  };
  const b = MEAL_BENCHMARKS[mealType] || MEAL_BENCHMARKS.Lunch;
  let prevPrepared = overrides.previous_day_prepared_kg !== undefined ? Number(overrides.previous_day_prepared_kg) : b.prevPrepared;
  let prevConsumed = overrides.previous_day_consumed_kg !== undefined ? Number(overrides.previous_day_consumed_kg) : b.prevConsumed;
  let prevWaste = overrides.previous_day_waste_kg !== undefined ? Number(overrides.previous_day_waste_kg) : b.prevWaste;
  let prevAtt = overrides.previous_day_attendance !== undefined ? Number(overrides.previous_day_attendance) : b.prevAtt;

  // 6. Build Payload for ML Model
  const payload = {
    day_of_week: dayOfWeek,
    meal_type: mealType,
    menu: menuName,
    total_students: totalStudents,
    visitor_bookings: visitorBookings,
    visitor_attendance_rate: visitorAttendanceRate,
    expected_visitor_attendance: expectedVisitorAttendance,
    expected_student_attendance: expectedStudentAttendance,
    expected_attendance: expectedTotalAttendance,
    previous_day_attendance: prevAtt,
    previous_day_prepared_kg: prevPrepared,
    previous_day_consumed_kg: prevConsumed,
    previous_day_waste_kg: prevWaste,
    holiday: overrides.holiday || 0,
    exam_period: overrides.exam_period || 0,
    temperature_c: overrides.temperature_c || 28.0,
  };

  const mlResult = await callPythonInference(payload);
  return {
    ...mlResult,
    date: dateInput,
    day_of_week: dayOfWeek,
  };
}

module.exports = { getMealPrediction, callPythonInference };
