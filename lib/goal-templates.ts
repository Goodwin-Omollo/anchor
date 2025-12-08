export type GoalType = "weight-loss" | "reading";

export interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  color: string;
  frequency: "daily" | "weekly" | "flexible";
}

export interface GoalTypeConfig {
  id: GoalType;
  title: string;
  icon: string;
  description: string;
  habitTemplates: HabitTemplate[];
}

export const goalTemplates: Record<GoalType, GoalTypeConfig> = {
  "weight-loss": {
    id: "weight-loss",
    title: "Weight Loss",
    icon: "⚖️",
    description: "Track your weight loss journey",
    habitTemplates: [
      {
        id: "gym",
        name: "Gym Sessions",
        description: "Regular gym workouts",
        color: "#ef4444",
        frequency: "daily",
      },
      {
        id: "bodyweight",
        name: "Bodyweight Training",
        description: "E.g., 100 pushups, planks",
        color: "#f59e0b",
        frequency: "daily",
      },
      {
        id: "omad",
        name: "OMAD",
        description: "One meal a day",
        color: "#8b5cf6",
        frequency: "daily",
      },
      {
        id: "autophagy",
        name: "Autophagy Marathon",
        description: "Extended fasting periods",
        color: "#06b6d4",
        frequency: "flexible",
      },
      {
        id: "moran",
        name: "Moran Marathon",
        description: "Zero carbs diet",
        color: "#10b981",
        frequency: "daily",
      },
      {
        id: "jogging",
        name: "Jogging",
        description: "Regular jogging sessions",
        color: "#3b82f6",
        frequency: "daily",
      },
      {
        id: "walking",
        name: "Walking",
        description: "Daily walks",
        color: "#6366f1",
        frequency: "daily",
      },
    ],
  },
  reading: {
    id: "reading",
    title: "Reading More Books",
    icon: "📚",
    description: "Build a consistent reading habit",
    habitTemplates: [
      {
        id: "daily-reading",
        name: "Daily Reading",
        description: "30 minutes daily",
        color: "#ec4899",
        frequency: "daily",
      },
      {
        id: "morning-reading",
        name: "Morning Reading",
        description: "Read before work",
        color: "#f43f5e",
        frequency: "daily",
      },
      {
        id: "bedtime-reading",
        name: "Bedtime Reading",
        description: "Read before sleep",
        color: "#a855f7",
        frequency: "daily",
      },
      {
        id: "weekend-reading",
        name: "Weekend Reading",
        description: "Longer reading sessions",
        color: "#14b8a6",
        frequency: "weekly",
      },
    ],
  },
};

// Helper to get habit template by ID
export function getHabitTemplate(
  goalType: GoalType,
  templateId: string
): HabitTemplate | undefined {
  return goalTemplates[goalType].habitTemplates.find(
    (t) => t.id === templateId
  );
}

// Helper to get all habit templates for a goal type
export function getHabitTemplatesForGoal(goalType: GoalType): HabitTemplate[] {
  return goalTemplates[goalType].habitTemplates;
}
