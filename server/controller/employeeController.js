import GoalSheet from "../models/GoalSheet.js";
import Goal from "../models/Goal.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import GoalUpdate from "../models/GoalUpdate.js";

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
    const { goalSheetId, thrustArea, title, description, uomType, targetValue, targetDate, weightage } = req.body;

    // Basic existence checks
    if (!goalSheetId) return res.status(400).json({ message: "goalSheetId is required" });
    if (!title) return res.status(400).json({ message: "title is required" });
    if (!uomType) return res.status(400).json({ message: "uomType is required" });
    if (!weightage) return res.status(400).json({ message: "weightage is required" });

    const sheet = await GoalSheet.findById(goalSheetId);
    if (!sheet) return res.status(404).json({ message: "Goal sheet not found" });

    if (sheet.status !== "DRAFT") {
      return res.status(400).json({ message: "Can only edit draft goal sheets" });
    }

    const goalCount = await Goal.countDocuments({ goalSheetId });
    if (goalCount >= 8) {
      return res.status(400).json({ message: "Maximum 8 goals allowed" });
    }

    const goal = await Goal.create({
  goalSheetId,
  employeeId: sheet.employeeId,
  thrustArea,
  title,
  description: description || "",
  uomType,
  targetValue: targetValue || null,
  targetDate: targetDate || null,
  weightage,
});

// Log goal creation
await AuditLog.create({
  entityType: "GOAL",
  entityId: goal._id.toString(),
  action: "CREATE",
  before: null,
  after: { title, thrustArea, uomType, targetValue, weightage },
  actorUserId: req.user._id,
  timestamp: new Date()
});

res.status(201).json(goal);

    res.status(201).json(goal);
  } catch (err) {
    console.error("Error creating goal:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Update a goal
export const updateGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { thrustArea, title, description, uomType, targetValue, targetDate, weightage } = req.body;

    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const sheet = await GoalSheet.findById(goal.goalSheetId);
    if (sheet.status !== "DRAFT") {
      return res.status(400).json({ message: "Can only edit draft goal sheets" });
    }

    // Capture old values
    const oldValues = {
      title: goal.title,
      thrustArea: goal.thrustArea,
      uomType: goal.uomType,
      targetValue: goal.targetValue,
      weightage: goal.weightage
    };

    if (thrustArea) goal.thrustArea = thrustArea;
    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (uomType) goal.uomType = uomType;
    if (targetValue) goal.targetValue = targetValue;
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (weightage !== undefined) goal.weightage = weightage;

    await goal.save();

    // Log goal update
    await AuditLog.create({
      entityType: "GOAL",
      entityId: goalId,
      action: "UPDATE",
      before: oldValues,
      after: { title: goal.title, thrustArea: goal.thrustArea, uomType: goal.uomType, targetValue: goal.targetValue, weightage: goal.weightage },
      actorUserId: req.user._id,
      timestamp: new Date()
    });

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

    // Log deletion
    await AuditLog.create({
      entityType: "GOAL",
      entityId: goalId,
      action: "DELETE",
      before: { title: goal.title, thrustArea: goal.thrustArea, weightage: goal.weightage },
      after: null,
      actorUserId: req.user._id,
      timestamp: new Date()
    });

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

    if (goals.length === 0) {
      return res.status(400).json({ message: "Add at least 1 goal before submitting" });
    }

    if (goals.length > 8) {
      return res.status(400).json({ message: "Maximum 8 goals allowed" });
    }

    const invalidGoals = goals.filter((g) => g.weightage < 10);
    if (invalidGoals.length > 0) {
      return res.status(400).json({ message: "Each goal must be at least 10%" });
    }

    const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);
    if (totalWeightage !== 100) {
      return res.status(400).json({ message: `Total weightage is ${totalWeightage}%, must be 100%` });
    }

    sheet.status = "SUBMITTED";
sheet.submittedAt = new Date();
await sheet.save();

// Log goal sheet submission
await AuditLog.create({
  entityType: "GOAL_SHEET",
  entityId: sheet._id.toString(),
  action: "UPDATE",
  before: { status: "DRAFT" },
  after: { status: "SUBMITTED" },
  actorUserId: req.user._id,
  timestamp: new Date()
});


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


export const submitGoalUpdate = async (req, res) => {
  try {
    const { goalId, quarter, year, progressPercentage, comments, status } = req.body;
    const employeeId = req.user._id;

    // Validation
    if (!goalId) return res.status(400).json({ message: "goalId is required" });
    if (!quarter || !["Q1", "Q2", "Q3", "Q4"].includes(quarter)) {
      return res.status(400).json({ message: "Invalid quarter (Q1-Q4)" });
    }
    if (!year) return res.status(400).json({ message: "year is required" });
    if (progressPercentage === undefined || progressPercentage < 0 || progressPercentage > 100) {
      return res.status(400).json({ message: "progressPercentage must be 0-100" });
    }
    if (!status || !["ON_TRACK", "AT_RISK", "DELAYED", "COMPLETED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Verify goal exists and belongs to employee
    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    if (goal.employeeId.toString() !== employeeId.toString()) {
      return res.status(403).json({ message: "Unauthorized - goal doesn't belong to you" });
    }

    // Check if update already exists for this quarter
    let update = await GoalUpdate.findOne({
      goalId,
      quarter,
      year,
    });

    if (update) {
      // Update existing
      update.progressPercentage = progressPercentage;
      update.comments = comments || "";
      update.status = status;
      update.submittedAt = new Date();
      update.submittedBy = employeeId;
    } else {
      // Create new
      update = await GoalUpdate.create({
        goalId,
        employeeId,
        quarter,
        year,
        progressPercentage,
        comments: comments || "",
        status,
        submittedAt: new Date(),
        submittedBy: employeeId,
      });
    }

    await update.save();
    res.status(201).json({
      message: "Goal update submitted",
      update,
    });
  } catch (err) {
    console.error("Error submitting goal update:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get all updates for a goal
export const getGoalUpdates = async (req, res) => {
  try {
    const { goalId } = req.params;
    const employeeId = req.user._id;

    // Verify goal exists and belongs to employee
    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    if (goal.employeeId.toString() !== employeeId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updates = await GoalUpdate.find({ goalId })
      .sort({ quarter: 1, year: -1 });

    res.json(updates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get updates for all goals in a quarter
export const getQuarterlyUpdates = async (req, res) => {
  try {
    const { quarter, year } = req.query;
    const employeeId = req.user._id;

    if (!quarter || !year) {
      return res.status(400).json({ message: "quarter and year required" });
    }

    const updates = await GoalUpdate.find({
      employeeId,
      quarter,
      year,
    })
      .populate("goalId", "title thrustArea weightage");

    res.json(updates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get all goals for current employee
export const getEmployeeGoals = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const goalSheet = await GoalSheet.findOne({
      employeeId,
      year: currentYear,
    });

    if (!goalSheet) {
      return res.json([]);
    }

    const goals = await Goal.find({ goalSheetId: goalSheet._id }).sort({ createdAt: 1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};