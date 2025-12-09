"use client";

import type React from "react";
import { useState } from "react";
import { useHabits, type GoalType } from "@/lib/habits-context";
import { goalTemplates, type HabitTemplate } from "@/lib/goal-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "type" | "details" | "habits";

export function AddGoalDialog({ open, onOpenChange }: AddGoalDialogProps) {
  const { addGoalWithHabits } = useHabits();
  const [step, setStep] = useState<Step>("type");
  const [selectedType, setSelectedType] = useState<GoalType | null>(null);

  // Weight Loss fields
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");

  // Reading fields
  const [booksRead, setBooksRead] = useState("");
  const [targetBooks, setTargetBooks] = useState("");

  // Common fields
  const [deadline, setDeadline] = useState("");
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);

  // Validation errors
  const [weightError, setWeightError] = useState("");
  const [deadlineError, setDeadlineError] = useState("");

  const resetForm = () => {
    setStep("type");
    setSelectedType(null);
    setCurrentWeight("");
    setTargetWeight("");
    setBooksRead("");
    setTargetBooks("");
    setDeadline("");
    setSelectedHabits([]);
    setWeightError("");
    setDeadlineError("");
  };

  const handleTypeSelect = (type: GoalType) => {
    setSelectedType(type);
    setStep("details");
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setWeightError("");
    setDeadlineError("");

    // Validate deadline is in the future
    const selectedDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison

    if (selectedDate < today) {
      setDeadlineError("Target date must be in the future");
      return;
    }

    // Validate weight loss goal
    if (selectedType === "weight-loss") {
      const currentWeightNum = parseFloat(currentWeight);
      const targetWeightNum = parseFloat(targetWeight);

      if (targetWeightNum >= currentWeightNum) {
        setWeightError("Target weight must be less than current weight");
        return;
      }
    }

    setStep("habits");
  };

  const toggleHabit = (templateId: string) => {
    setSelectedHabits((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleFinalSubmit = () => {
    if (!selectedType) return;

    const templateConfig = goalTemplates[selectedType];
    const selectedHabitTemplates = selectedHabits
      .map((id) => templateConfig.habitTemplates.find((t) => t.id === id))
      .filter((t): t is HabitTemplate => t !== undefined);

    let goalData: any = {
      type: selectedType,
      deadline,
    };

    if (selectedType === "weight-loss") {
      const currentWeightNum = parseFloat(currentWeight);
      const targetWeightNum = parseFloat(targetWeight);
      const weightLossNum = currentWeightNum - targetWeightNum;
      goalData = {
        ...goalData,
        title: `Lose ${weightLossNum.toFixed(1)}kg`,
        currentWeight: currentWeightNum,
        targetWeightLoss: weightLossNum,
        targetValue: weightLossNum,
        unit: "kg",
      };
    } else if (selectedType === "reading") {
      const targetBooksNum = parseInt(targetBooks);
      const booksReadNum = parseInt(booksRead) || 0;
      goalData = {
        ...goalData,
        title: `Read ${targetBooksNum} books`,
        targetBooks: targetBooksNum,
        booksRead: booksReadNum,
        targetValue: targetBooksNum,
        unit: "books",
      };
    }

    // Create goal with habits in one transaction
    addGoalWithHabits({
      goal: goalData,
      habits: selectedHabitTemplates.map((template) => ({
        name: template.name,
        description: template.description,
        frequency: template.frequency,
        templateId: template.id,
        color: template.color,
      })),
    });

    resetForm();
    onOpenChange(false);
  };

  const renderTypeSelection = () => (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Choose Your Goal Type</DialogTitle>
        <DialogDescription>
          Select the type of goal you want to achieve
        </DialogDescription>
      </DialogHeader>

      <div className="grid md:grid-cols-2 gap-4">
        {(Object.keys(goalTemplates) as GoalType[]).map((type) => {
          const config = goalTemplates[type];
          return (
            <Card
              key={type}
              className="cursor-pointer transition-all hover:border-primary"
              onClick={() => handleTypeSelect(type)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-lg">{config.icon}</span>
                  {config.title}
                </CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderDetailsForm = () => {
    if (!selectedType) return null;
    const config = goalTemplates[selectedType];

    return (
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle>
            <span className="mr-2">{config.icon}</span>
            {config.title} Details
          </DialogTitle>
          <DialogDescription>
            Fill in the details for your goal
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleDetailsSubmit} className="space-y-4">
          {selectedType === "weight-loss" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-weight">Current Weight (kg)</Label>
                  <Input
                    id="current-weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 80"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-weight">Target Weight (kg)</Label>
                  <Input
                    id="target-weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 70"
                    value={targetWeight}
                    onChange={(e) => {
                      setTargetWeight(e.target.value);
                      setWeightError(""); // Clear error on change
                    }}
                    required
                    className={weightError ? "border-destructive" : ""}
                  />
                  {weightError && (
                    <p className="text-sm text-destructive">{weightError}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {selectedType === "reading" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="books-read">Books Already Read</Label>
                  <Input
                    id="books-read"
                    type="number"
                    placeholder="e.g., 5"
                    value={booksRead}
                    onChange={(e) => setBooksRead(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-books">Target Books</Label>
                  <Input
                    id="target-books"
                    type="number"
                    placeholder="e.g., 12"
                    value={targetBooks}
                    onChange={(e) => setTargetBooks(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="deadline">Target Date</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => {
                setDeadline(e.target.value);
                setDeadlineError(""); // Clear error on change
              }}
              required
              className={deadlineError ? "border-destructive" : ""}
            />
            {deadlineError && (
              <p className="text-sm text-destructive">{deadlineError}</p>
            )}
          </div>

          <div className="flex justify-between gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep("type");
                setSelectedType(null);
              }}
            >
              Back
            </Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      </div>
    );
  };

  const renderHabitSelection = () => {
    if (!selectedType) return null;
    const config = goalTemplates[selectedType];

    return (
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle>Choose Your Habits</DialogTitle>
          <DialogDescription>
            Select the habits you want to track for this goal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {config.habitTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedHabits.includes(template.id)
                  ? "border-primary bg-primary/5"
                  : "hover:border-primary/50"
              }`}
              onClick={() => toggleHabit(template.id)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <Checkbox
                  checked={selectedHabits.includes(template.id)}
                  className="pointer-events-none"
                />
                <div
                  className="h-4 w-4 rounded-full shrink-0"
                  style={{ backgroundColor: template.color }}
                />
                <div className="flex-1">
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("details")}
          >
            Back
          </Button>
          <Button
            onClick={handleFinalSubmit}
            disabled={selectedHabits.length === 0}
          >
            Create Goal{" "}
            {selectedHabits.length > 0 &&
              `with ${selectedHabits.length} habit${selectedHabits.length > 1 ? "s" : ""}`}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className="max-w-2xl">
        {step === "type" && renderTypeSelection()}
        {step === "details" && renderDetailsForm()}
        {step === "habits" && renderHabitSelection()}
      </DialogContent>
    </Dialog>
  );
}
