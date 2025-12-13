import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every Sunday at midnight (UTC)
crons.weekly(
  "capture weekly progress",
  {
    dayOfWeek: "sunday",
    hourUTC: 0,
    minuteUTC: 0,
  },
  internal.weeklyProgress.captureWeeklySnapshot
);

export default crons;
