import { Router } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/impact
router.get('/', (req, res) => {
  const store = db.getStore();

  const completedBookings = store.bookings.filter((b) => b.status === 'COMPLETED');
  const confirmedBookings = store.bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED');

  const totalMealsRescued = confirmedBookings.reduce((acc, curr) => acc + curr.mealCount, 0);
  const successfulPickups = completedBookings.length;
  const foodWastePreventedKg = Math.round(totalMealsRescued * 0.5);
  const peopleServed = Math.round(totalMealsRescued * 1.1);

  // Recent activity log
  const recentActivity = store.bookings.map((b) => ({
    id: b.id,
    text: `${b.mealCount} meals from ${b.donorName} were successfully delivered to ${b.ngoName}.`,
    status: b.status,
    time: b.createdAt,
  }));

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  store.donations.forEach((d) => {
    if (d.category) {
      categoryMap[d.category] = (categoryMap[d.category] || 0) + d.mealCount;
    }
  });

  const categoryData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    meals: categoryMap[cat],
  }));

  return res.json({
    totalMealsRescued,
    peopleServed,
    foodWastePreventedKg,
    successfulPickups,
    recentActivity,
    categoryData,
  });
});

export default router;
