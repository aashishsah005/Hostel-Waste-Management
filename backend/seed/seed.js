/**
 * Seeds the database with demo users, a weekly menu, and 30 days of
 * historical food entries so the dashboards, charts and predictions
 * have real-looking data to display immediately after setup.
 *
 * Run with: npm run seed  (from the backend folder, after setting MONGO_URI)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const FoodEntry = require('../models/FoodEntry');
const Booking = require('../models/Booking');
const Feedback = require('../models/Feedback');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

const menuBank = {
  Breakfast: [['Poha', 'Tea', 'Banana'], ['Idli', 'Sambar', 'Chutney'], ['Bread Omelette', 'Milk'], ['Upma', 'Coffee']],
  Lunch: [['Dal', 'Rice', 'Roti', 'Mixed Veg'], ['Rajma', 'Rice', 'Salad'], ['Chole', 'Roti', 'Curd'], ['Sambar Rice', 'Papad']],
  Snacks: [['Samosa', 'Tea'], ['Sandwich', 'Juice'], ['Pakora', 'Tea'], ['Fruit Chaat']],
  Dinner: [['Paneer Curry', 'Roti', 'Rice'], ['Veg Biryani', 'Raita'], ['Dal Fry', 'Rice', 'Roti'], ['Khichdi', 'Papad']],
};

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seed() {
  await connectDB();
  console.log('Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    MenuItem.deleteMany({}),
    FoodEntry.deleteMany({}),
    Booking.deleteMany({}),
    Feedback.deleteMany({}),
  ]);

  console.log('Creating users...');
  const admin = await User.create({ name: 'Admin User', email: 'admin@hostel.edu', password: 'admin123', role: 'admin' });
  const manager = await User.create({ name: 'Mess Manager', email: 'manager@hostel.edu', password: 'manager123', role: 'mess_manager' });
  const student = await User.create({ name: 'Student User', email: 'abc@gmail.com', password: '123', role: 'student', hostelBlock: 'A', roomNumber: '101', phone: '9876543210' });

  console.log('Creating weekly menu...');
  for (const day of DAYS) {
    for (const meal of MEALS) {
      const options = menuBank[meal];
      const items = options[randomBetween(0, options.length - 1)];
      await MenuItem.create({ dayOfWeek: day, mealType: meal, items, price: meal === 'Snacks' ? 20 : 40 });
    }
  }

  console.log('Creating 30 days of food entries...');
  const reasons = ['none', 'exam_period', 'holiday', 'unpopular_menu', 'over_preparation'];
  const today = new Date();
  for (let d = 29; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    date.setHours(0, 0, 0, 0);

    for (const meal of MEALS) {
      const booked = randomBetween(60, 120);
      const prepared = booked + randomBetween(5, 20);
      const wasteFraction = Math.random() * 0.15; // up to 15% waste
      const consumed = Math.round(prepared * (1 - wasteFraction));
      const wastedKg = Math.round((prepared - consumed) * 0.35 * 100) / 100; // ~0.35kg per uneaten meal

      await FoodEntry.create({
        date,
        mealType: meal,
        mealsBooked: booked,
        mealsPrepared: prepared,
        mealsConsumed: consumed,
        foodWastedKg: wastedKg,
        wasteReason: wastedKg > 3 ? reasons[randomBetween(1, reasons.length - 1)] : 'none',
        recordedBy: manager._id,
      });
    }
  }

  console.log('Seed complete.');
  console.log('Login credentials:');
  console.log('  Admin        -> admin@hostel.edu / admin123');
  console.log('  Mess Manager -> manager@hostel.edu / manager123');
  console.log('  Student      -> abc@gmail.com / 123');

  await mongoose.connection.close();
  process.exit(0);

}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
