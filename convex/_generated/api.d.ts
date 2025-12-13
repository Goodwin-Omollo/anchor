/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as achievements from "../achievements.js";
import type * as activityFeed from "../activityFeed.js";
import type * as communities from "../communities.js";
import type * as crons from "../crons.js";
import type * as goalWithHabits from "../goalWithHabits.js";
import type * as goals from "../goals.js";
import type * as habitLogs from "../habitLogs.js";
import type * as habits from "../habits.js";
import type * as leaderboard from "../leaderboard.js";
import type * as progressLogs from "../progressLogs.js";
import type * as progressTracking from "../progressTracking.js";
import type * as streakShields from "../streakShields.js";
import type * as weeklyProgress from "../weeklyProgress.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  activityFeed: typeof activityFeed;
  communities: typeof communities;
  crons: typeof crons;
  goalWithHabits: typeof goalWithHabits;
  goals: typeof goals;
  habitLogs: typeof habitLogs;
  habits: typeof habits;
  leaderboard: typeof leaderboard;
  progressLogs: typeof progressLogs;
  progressTracking: typeof progressTracking;
  streakShields: typeof streakShields;
  weeklyProgress: typeof weeklyProgress;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
