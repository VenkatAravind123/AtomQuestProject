import GoalSheet from "../models/GoalSheet.js";
import Goal from "../models/Goal.js";
import User from "../models/User.js";
import Checkin from "../models/Checkin.js";

// Get pending approvals for manager
// export const getPendingApprovals = async (req, res) => {
//   try {
//     const managerId = req.user._id;

//     // Find all employees who report to this manager
//     const employees = await User.find({ managerId }).select("_id");
//     const employeeIds = employees.map(e => e._id);

//     // Get their SUBMITTED goal sheets
//     const sheets = await GoalSheet.find({
//       employeeId: { $in: employeeIds },
//       status: "SUBMITTED"
//     })
//       .populate("employeeId", "name email role")
//       .sort({ submittedAt: -1 });

//     // For each sheet, also get the goals
//     const approvals = await Promise.all(
//       sheets.map(async (sheet) => {
//         const goals = await Goal.find({ goalSheetId: sheet._id });
//         return {
//           sheet,
//           goals,
//           totalWeightage: goals.reduce((sum, g) => sum + g.weightage, 0)
//         };
//       })
//     );

//     res.json(approvals);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


export const getPendingApprovals = async (req, res) => {
  try {
    const managerId = req.user._id;
    console.log("1. Manager ID:", managerId);
    console.log("2. Manager role:", req.user.role);

    // Find all employees who report to this manager
    const employees = await User.find({ managerId }).select("_id name email");
    console.log("3. Employees found:", employees);

    const employeeIds = employees.map(e => e._id);
    console.log("4. Employee IDs:", employeeIds);

    // Get their SUBMITTED goal sheets
    const sheets = await GoalSheet.find({
      employeeId: { $in: employeeIds },
      status: "SUBMITTED"
    })
      .populate("employeeId", "name email role")
      .sort({ submittedAt: -1 });

    console.log("5. Goal sheets found:", sheets.length);
    console.log("6. Sheets:", sheets);

    // For each sheet, also get the goals
    const approvals = await Promise.all(
      sheets.map(async (sheet) => {
        const goals = await Goal.find({ goalSheetId: sheet._id });
        return {
          sheet,
          goals,
          totalWeightage: goals.reduce((sum, g) => sum + g.weightage, 0)
        };
      })
    );

    console.log("7. Final approvals:", approvals);
    res.json(approvals);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
// Approve goal sheet
export const approveGoalSheet = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const managerId = req.user._id;

    const sheet = await GoalSheet.findById(sheetId).populate("employeeId");
    if (!sheet) return res.status(404).json({ message: "Goal sheet not found" });

    // Verify manager is authorized (employee reports to them)
    if (sheet.employeeId.managerId.toString() !== managerId.toString()) {
      return res.status(403).json({ message: "Unauthorized - employee doesn't report to you" });
    }

    if (sheet.status !== "SUBMITTED") {
      return res.status(400).json({ message: "Can only approve SUBMITTED sheets" });
    }

    // Get goals and verify total weightage = 100%
    const goals = await Goal.find({ goalSheetId: sheetId });
    const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);

    if (totalWeightage !== 100) {
      return res.status(400).json({ message: `Total weightage must be 100%, got ${totalWeightage}%` });
    }

    // Approve & lock
    sheet.status = "APPROVED";
    sheet.approvedBy = managerId;
    sheet.approvedAt = new Date();
    await sheet.save();

    res.json({
      message: "Goal sheet approved successfully",
      sheet
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject goal sheet
export const rejectGoalSheet = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { rejectionReason } = req.body;
    const managerId = req.user._id;

    if (!rejectionReason) {
      return res.status(400).json({ message: "rejectionReason is required" });
    }

    const sheet = await GoalSheet.findById(sheetId).populate("employeeId");
    if (!sheet) return res.status(404).json({ message: "Goal sheet not found" });

    // Verify manager is authorized
    if (sheet.employeeId.managerId.toString() !== managerId.toString()) {
      return res.status(403).json({ message: "Unauthorized - employee doesn't report to you" });
    }

    if (sheet.status !== "SUBMITTED") {
      return res.status(400).json({ message: "Can only reject SUBMITTED sheets" });
    }

    // Reject and reset to DRAFT
    sheet.status = "REJECTED";
    sheet.rejectionReason = rejectionReason;
    await sheet.save();

    res.json({
      message: "Goal sheet rejected",
      sheet
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const createCheckin = async (req, res) => {
  try {
    const { goalId, quarter, year, managerNotes, feedback, actionItems } = req.body;
    const managerId = req.user._id;

    // Validation
    if (!goalId) return res.status(400).json({ message: "goalId is required" });
    if (!quarter || !["Q1", "Q2", "Q3", "Q4"].includes(quarter)) {
      return res.status(400).json({ message: "Invalid quarter (Q1-Q4)" });
    }
    if (!year) return res.status(400).json({ message: "year is required" });
    if (!feedback || !["EXCELLENT", "GOOD", "NEEDS_IMPROVEMENT", "OFF_TRACK"].includes(feedback)) {
      return res.status(400).json({ message: "Invalid feedback status" });
    }

    // Get goal and verify authorization
    const goal = await Goal.findById(goalId).populate("goalSheetId");
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const employee = await User.findById(goal.employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Verify manager has authorization
    if (employee.managerId.toString() !== managerId.toString()) {
      return res.status(403).json({ message: "Unauthorized - employee doesn't report to you" });
    }

    // Check if checkin already exists
    let checkin = await Checkin.findOne({
      goalId,
      quarter,
      year,
    });

    if (checkin) {
      // Update existing
      checkin.managerNotes = managerNotes || "";
      checkin.feedback = feedback;
      checkin.actionItems = actionItems || "";
      checkin.checkinDate = new Date();
    } else {
      // Create new
      checkin = await Checkin.create({
        goalId,
        employeeId: goal.employeeId,
        managerId,
        quarter,
        year,
        managerNotes: managerNotes || "",
        feedback,
        actionItems: actionItems || "",
        checkinDate: new Date(),
      });
    }

    await checkin.save();
    res.status(201).json({
      message: "Check-in recorded",
      checkin,
    });
  } catch (err) {
    console.error("Error creating checkin:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// Get team check-ins
// Get team check-ins (FIXED - returns ALL approved goals)
export const getTeamCheckins = async (req, res) => {
  try {
    const { quarter, year } = req.query;
    const managerId = req.user._id;

    // Find all employees who report to this manager
    const employees = await User.find({ managerId }).select("_id");
    const employeeIds = employees.map(e => e._id);

    // Get all APPROVED goal sheets for these employees
    const sheets = await GoalSheet.find({
      employeeId: { $in: employeeIds },
      status: "APPROVED"
    }).select("_id employeeId year");

    const sheetIds = sheets.map(s => s._id);

    // Get all goals in those sheets
    const goals = await Goal.find({ goalSheetId: { $in: sheetIds } })
      .populate("goalSheetId", "employeeId year")
      .populate("employeeId", "name email");

    // For each goal, check if check-in exists for quarter/year
    const result = await Promise.all(
      goals.map(async (goal) => {
        let checkin = await Checkin.findOne({
          goalId: goal._id,
          quarter: quarter || "Q1",
          year: year ? parseInt(year) : new Date().getFullYear(),
        });

        // If no check-in exists, create a placeholder object
        if (!checkin) {
          checkin = {
            _id: null,
            goalId: goal,
            employeeId: goal.employeeId,
            feedback: null,
            managerNotes: "",
            actionItems: "",
            quarter: quarter || "Q1",
            year: year ? parseInt(year) : new Date().getFullYear(),
            checkinDate: null,
          };
        } else {
          // Populate goalId if not already populated
          if (!checkin.goalId.title) {
            checkin = await checkin.populate("goalId", "title thrustArea");
          }
        }

        return checkin;
      })
    );

    res.json(result);
  } catch (err) {
    console.error("Error in getTeamCheckins:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get check-in history for a goal
export const getGoalCheckins = async (req, res) => {
  try {
    const { goalId } = req.params;
    const managerId = req.user._id;

    // Verify goal exists and manager has access
    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const employee = await User.findById(goal.employeeId);
    if (employee.managerId.toString() !== managerId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const checkins = await Checkin.find({ goalId })
      .sort({ checkinDate: -1 });

    res.json(checkins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};