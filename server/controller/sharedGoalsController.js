import SharedGoalGroup from "../models/SharedGoalGroup.js";
import Goal from "../models/Goal.js";
import User from "../models/User.js";
import GoalSheet from "../models/GoalSheet.js";

// Get all shared goal groups
export const getSharedGoalGroups = async (req, res) => {
  try {
    const groups = await SharedGoalGroup.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a shared goal group
export const createSharedGoalGroup = async (req, res) => {
  try {
    const { name, description, applicableRole, goals } = req.body;
    const adminId = req.user._id;

    // Validation
    if (!name) return res.status(400).json({ message: "name is required" });
    if (!applicableRole || !["EMPLOYEE", "MANAGER", "ADMIN"].includes(applicableRole)) {
      return res.status(400).json({ message: "applicableRole must be EMPLOYEE, MANAGER, or ADMIN" });
    }
    if (!goals || !Array.isArray(goals) || goals.length === 0) {
      return res.status(400).json({ message: "goals array is required and must have at least 1 goal" });
    }

    // Validate goals weightage
    const totalWeightage = goals.reduce((sum, g) => sum + (g.weightage || 0), 0);
    if (totalWeightage !== 100) {
      return res.status(400).json({ message: `Total weightage must be 100%, got ${totalWeightage}%` });
    }

    // Create group
    // Create group
const group = await SharedGoalGroup.create({
  name,
  description: description || "",
  applicableRole,
  goals: goals.map(g => ({
    title: g.title,
    description: g.description || "",
    thrustArea: g.thrustArea,
    uomType: g.uomType,
    targetValue: g.targetValue,
    targetDate: g.targetDate || null,
    weightage: g.weightage,
  })),
  primaryOwnerId: adminId,  // Add this line
  createdBy: adminId,
});

    res.status(201).json({
      message: "Shared goal group created successfully",
      group,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign shared goals to an employee
export const assignSharedGoals = async (req, res) => {
  try {
    const { groupId, employeeId, year } = req.body;

    // Validation
    if (!groupId) return res.status(400).json({ message: "groupId is required" });
    if (!employeeId) return res.status(400).json({ message: "employeeId is required" });
    if (!year) return res.status(400).json({ message: "year is required" });

    // Get group
    const group = await SharedGoalGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Shared goal group not found" });

    // Get employee
    const employee = await User.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Verify employee has matching role
    if (employee.role !== group.applicableRole && group.applicableRole !== "ADMIN") {
      return res.status(400).json({ message: `This goal group is for ${group.applicableRole} only` });
    }

    // Get or create goal sheet
    let sheet = await GoalSheet.findOne({ employeeId, year: parseInt(year) });
    if (!sheet) {
      sheet = await GoalSheet.create({
        employeeId,
        year: parseInt(year),
        status: "DRAFT",
      });
    }

    // Create goals from group
    const createdGoals = [];
    for (const groupGoal of group.goals) {
      const goal = await Goal.create({
        goalSheetId: sheet._id,
        employeeId,
        thrustArea: groupGoal.thrustArea,
        title: groupGoal.title,
        description: groupGoal.description,
        uomType: groupGoal.uomType,
        targetValue: groupGoal.targetValue,
        targetDate: groupGoal.targetDate,
        weightage: groupGoal.weightage,
        sharedGroupId: groupId,
        sharedRole: "RECIPIENT",
      });
      createdGoals.push(goal);
    }

    res.status(201).json({
      message: `${createdGoals.length} shared goals assigned to employee`,
      goals: createdGoals,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get users by role (for bulk assignment)
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;

    if (!role || !["EMPLOYEE", "MANAGER", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Valid role (EMPLOYEE, MANAGER, ADMIN) is required" });
    }

    const users = await User.find({ role }).select("_id name email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk assign shared goals to multiple employees
export const bulkAssignSharedGoals = async (req, res) => {
  try {
    const { groupId, employeeIds, year } = req.body;

    if (!groupId) return res.status(400).json({ message: "groupId is required" });
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({ message: "employeeIds array is required" });
    }
    if (!year) return res.status(400).json({ message: "year is required" });

    const group = await SharedGoalGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Shared goal group not found" });

    let successCount = 0;
    const results = [];

    for (const empId of employeeIds) {
      try {
        const employee = await User.findById(empId);
        if (!employee) {
          results.push({ employeeId: empId, success: false, message: "Employee not found" });
          continue;
        }

        // Get or create sheet
        let sheet = await GoalSheet.findOne({ employeeId: empId, year: parseInt(year) });
        if (!sheet) {
          sheet = await GoalSheet.create({
            employeeId: empId,
            year: parseInt(year),
            status: "DRAFT",
          });
        }

        // Create goals
        for (const groupGoal of group.goals) {
          await Goal.create({
            goalSheetId: sheet._id,
            employeeId: empId,
            thrustArea: groupGoal.thrustArea,
            title: groupGoal.title,
            description: groupGoal.description,
            uomType: groupGoal.uomType,
            targetValue: groupGoal.targetValue,
            targetDate: groupGoal.targetDate,
            weightage: groupGoal.weightage,
            sharedGroupId: groupId,
            sharedRole: "RECIPIENT",
          });
        }

        results.push({ employeeId: empId, success: true, message: "Goals assigned" });
        successCount++;
      } catch (err) {
        results.push({ employeeId: empId, success: false, message: err.message });
      }
    }

    res.json({
      message: `Successfully assigned to ${successCount}/${employeeIds.length} employees`,
      results,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update shared goal group
export const updateSharedGoalGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;

    const group = await SharedGoalGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Shared goal group not found" });

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    await group.save();

    res.json({
      message: "Shared goal group updated",
      group,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete shared goal group
export const deleteSharedGoalGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await SharedGoalGroup.findByIdAndDelete(groupId);
    if (!group) return res.status(404).json({ message: "Shared goal group not found" });

    res.json({
      message: "Shared goal group deleted",
      group,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update shared goal achievement by primary owner
export const updateSharedGoalAchievement = async (req, res) => {
  try {
    const { groupId, goalIndex, achievement } = req.body;

    if (!groupId) return res.status(400).json({ message: "groupId is required" });
    if (goalIndex === undefined) return res.status(400).json({ message: "goalIndex is required" });
    if (achievement === undefined) return res.status(400).json({ message: "achievement value is required" });

    const group = await SharedGoalGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Shared goal group not found" });

    // Update achievement in group
    group.goals[goalIndex].achievement = achievement;
    group.goals[goalIndex].achievementDate = new Date();
    await group.save();

    // Sync to all employee goals with this shared group
    const recipientGoals = await Goal.find({ 
      sharedGroupId: groupId, 
      sharedRole: "RECIPIENT" 
    });

    for (const goal of recipientGoals) {
      goal.syncedAchievement = achievement;
      goal.isSyncedFromPrimary = true;
      await goal.save();
    }

    res.json({
      message: `Achievement synced to ${recipientGoals.length} employees`,
      synced: recipientGoals.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Adjust shared goal weightage by recipient employee
export const adjustSharedGoalWeightage = async (req, res) => {
  try {
    const { goalId, adjustedWeightage } = req.body;
    const employeeId = req.user._id;

    if (!goalId) return res.status(400).json({ message: "goalId is required" });
    if (adjustedWeightage === undefined) return res.status(400).json({ message: "adjustedWeightage is required" });

    const goal = await Goal.findById(goalId).populate("goalSheetId");
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    // Verify employee owns this goal
    if (goal.employeeId.toString() !== employeeId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Only recipients can adjust
    if (goal.sharedRole !== "RECIPIENT") {
      return res.status(400).json({ message: "Only recipient goals can have adjusted weightage" });
    }

    // Get all goals in this sheet
    const sheetGoals = await Goal.find({ goalSheetId: goal.goalSheetId._id });

    // Calculate total with new adjustment
    const totalWithAdjustment = sheetGoals.reduce((sum, g) => {
      if (g._id.toString() === goalId) {
        return sum + adjustedWeightage;
      }
      return sum + (g.adjustedWeightage || g.weightage);
    }, 0);

    if (totalWithAdjustment !== 100) {
      return res.status(400).json({ 
        message: `Total weightage would be ${totalWithAdjustment}%, must be 100%` 
      });
    }

    goal.adjustedWeightage = adjustedWeightage;
    // Update the main weightage field too for consistency
    goal.weightage = adjustedWeightage;
    await goal.save();

    res.json({
      message: "Weightage adjusted successfully",
      goal,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};