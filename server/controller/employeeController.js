import GoalSheet from "../models/GoalSheet.js";
import Goal from "../models/Goal.js";
import User from "../models/User.js";
import { z } from "zod";

const goalSchema = z.object({
  goalSheetId: z.string().min(1),
  thrustArea: z.string().min(2),
  title: z.string().min(3),
  description: z.string().optional(),
  uomType: z.enum(["MIN", "MAX", "TIMELINE", "ZERO"]),
  targetValue: z.number().positive(),
  targetDate: z.string().optional(),
  weightage: z.number().min(1).max(100),
});

const updateGoalSchema = z.object({
  thrustArea: z.string().min(2).optional(),
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  uomType: z.enum(["MIN", "MAX", "TIMELINE", "ZERO"]).optional(),
  targetValue: z.number().positive().optional(),
  targetDate: z.string().optional(),
  weightage: z.number().min(1).max(100).optional(),
});

// Get or create goal sheet for current year
export const getGoalSheet = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const employeeId = req.user._id;

    let sheet = await GoalSheet.findOne({
      employeeId,
      year: currentYear,
    });

    if (!sheet) {
      sheet = await GoalSheet.create({
        employeeId,
        year: currentYear,
        status: "DRAFT",
      });
    }

    const goals = await Goal.find({ goalSheetId: sheet._id }).sort({ createdAt: 1 });

    res.json({ sheet, goals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new goal
export const createGoal = async (req, res) => {
  try {
    const parsed = goalSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", details: parsed.error.flatten() });
    }

    const { goalSheetId, thrustArea, title, description, uomType, targetValue, targetDate, weightage } = parsed.data;

    const sheet = await GoalSheet.findById(goalSheetId);
    if (!sheet) return res.status(404).json({ message: "Goal sheet not found" });

    // Check if sheet is DRAFT (can only add to draft)
    if (sheet.status !== "DRAFT") {
      return res.status(400).json({ message: "Can only edit draft goal sheets" });
    }

    // Check if adding this goal would exceed 8 goals
    const goalCount = await Goal.countDocuments({ goalSheetId });
    if (goalCount >= 8) {
      return res.status(400).json({ message: "Maximum 8 goals allowed" });
    }

    const goal = await Goal.create({
      goalSheetId,
      employeeId: sheet.employeeId,
      thrustArea,
      title,
      description: description || null,
      uomType,
      targetValue,
      targetDate: targetDate || null,
      weightage,
    });

    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a goal
export const updateGoal = async (req, res) => {
  try {
    const { goalId } = req.params;

    const parsed = updateGoalSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input", details: parsed.error.flatten() });
    }

    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const sheet = await GoalSheet.findById(goal.goalSheetId);
    if (sheet.status !== "DRAFT") {
      return res.status(400).json({ message: "Can only edit draft goal sheets" });
    }

    // Update fields
    if (parsed.data.thrustArea) goal.thrustArea = parsed.data.thrustArea;
    if (parsed.data.title) goal.title = parsed.data.title;
    if (parsed.data.description !== undefined) goal.description = parsed.data.description;
    if (parsed.data.uomType) goal.uomType = parsed.data.uomType;
    if (parsed.data.targetValue) goal.targetValue = parsed.data.targetValue;
    if (parsed.data.targetDate !== undefined) goal.targetDate = parsed.data.targetDate;
    if (parsed.data.weightage !== undefined) goal.weightage = parsed.data.weightage;

    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
  try {
    const { goalId } = req.params;

    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const sheet = await GoalSheet.findById(goal.goalSheetId);
    if (sheet.status !== "DRAFT") {
      return res.status(400).json({ message: "Can only edit draft goal sheets" });
    }

    await Goal.deleteOne({ _id: goalId });
    res.json({ message: "Goal deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Submit goal sheet - enforces BRD validations
export const submitGoalSheet = async (req, res) => {
  try {
    const { goalSheetId } = req.body;

    if (!goalSheetId) {
      return res.status(400).json({ message: "goalSheetId required" });
    }

    const sheet = await GoalSheet.findById(goalSheetId);
    if (!sheet) return res.status(404).json({ message: "Goal sheet not found" });

    if (sheet.status !== "DRAFT") {
      return res.status(400).json({ message: "Only draft sheets can be submitted" });
    }

    const goals = await Goal.find({ goalSheetId });

    // Validation 1: at least 1 goal
    if (goals.length === 0) {
      return res.status(400).json({ message: "Add at least 1 goal before submitting" });
    }

    // Validation 2: max 8 goals
    if (goals.length > 8) {
      return res.status(400).json({ message: "Maximum 8 goals allowed" });
    }

    // Validation 3: each goal >= 10%
    const invalidGoals = goals.filter((g) => g.weightage < 10);
    if (invalidGoals.length > 0) {
      return res.status(400).json({ message: "Each goal must be at least 10%" });
    }

    // Validation 4: total = 100%
    const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);
    if (totalWeightage !== 100) {
      return res.status(400).json({ message: `Total weightage is ${totalWeightage}%, must be 100%` });
    }

    sheet.status = "SUBMITTED";
    sheet.submittedAt = new Date();
    await sheet.save();

    res.json({ message: "Goal sheet submitted successfully", sheet, goals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get employee's manager
export const getManager = async (req, res) => {
  try {
    const manager = await User.findById(req.user.managerId).select("-passwordHash");
    if (!manager) return res.status(404).json({ message: "Manager not assigned" });
    res.json(manager);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};