import GoalSheet from "../models/GoalSheet.js";
import Goal from "../models/Goal.js";
import GoalUpdate from "../models/GoalUpdate.js";
import Checkin from "../models/Checkin.js";
import User from "../models/User.js";

import AuditLog from "../models/AuditLog.js";

// Get admin dashboard metrics
export const getAdminDashboard = async (req, res) => {
  try {
    // Total stats
    const totalUsers = await User.countDocuments();
    const totalEmployees = await User.countDocuments({ role: "EMPLOYEE" });
    const totalManagers = await User.countDocuments({ role: "MANAGER" });

    const totalGoalSheets = await GoalSheet.countDocuments();
    const approvedSheets = await GoalSheet.countDocuments({ status: "APPROVED" });
    const submittedSheets = await GoalSheet.countDocuments({ status: "SUBMITTED" });
    const draftSheets = await GoalSheet.countDocuments({ status: "DRAFT" });
    const rejectedSheets = await GoalSheet.countDocuments({ status: "REJECTED" });

    const totalGoals = await Goal.countDocuments();
    const goalsWithUpdates = await GoalUpdate.distinct("goalId").then(ids => ids.length);

    // Status distribution
    const statusDistribution = await GoalSheet.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Approval rate
    const totalSubmitted = await GoalSheet.countDocuments({ status: { $in: ["SUBMITTED", "APPROVED", "REJECTED"] } });
    const approvalRate = totalSubmitted > 0 
      ? ((approvedSheets / totalSubmitted) * 100).toFixed(1) 
      : 0;

    // Manager check-in completion
    const allGoals = await Goal.countDocuments();
    const checkedInGoals = await Checkin.distinct("goalId").then(ids => ids.length);
    const checkinRate = allGoals > 0 
      ? ((checkedInGoals / allGoals) * 100).toFixed(1)
      : 0;

    // Employee submission rate
    const employeeSubmissionRate = totalEmployees > 0
      ? ((submittedSheets + approvedSheets) / totalEmployees * 100).toFixed(1)
      : 0;

    res.json({
      users: {
        total: totalUsers,
        employees: totalEmployees,
        managers: totalManagers,
      },
      goals: {
        total: totalGoals,
        withUpdates: goalsWithUpdates,
      },
      sheets: {
        total: totalGoalSheets,
        approved: approvedSheets,
        submitted: submittedSheets,
        draft: draftSheets,
        rejected: rejectedSheets,
      },
      completion: {
        employeeSubmissionRate: parseFloat(employeeSubmissionRate),
        checkinCompletionRate: parseFloat(checkinRate),
        approvalRate: parseFloat(approvalRate),
      },
      statusDistribution,
      approvalRate: parseFloat(approvalRate),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get manager team metrics
export const getManagerDashboard = async (req, res) => {
  try {
    const managerId = req.user._id;

    // Get manager's employees
    const employees = await User.find({ managerId }).select("_id name email");
    const employeeIds = employees.map(e => e._id);

    // Team stats
    const teamSize = employees.length;
    const goalsSubmitted = await GoalSheet.countDocuments({
      employeeId: { $in: employeeIds },
      status: { $in: ["SUBMITTED", "APPROVED"] }
    });

    const goalsApproved = await GoalSheet.countDocuments({
      employeeId: { $in: employeeIds },
      status: "APPROVED"
    });

    // Check-in stats
    const checkinsDone = await Checkin.countDocuments({
      managerId,
    });

    const totalCheckinsNeeded = await Goal.countDocuments({
      employeeId: { $in: employeeIds }
    });

    const checkinRate = totalCheckinsNeeded > 0 
      ? ((checkinsDone / totalCheckinsNeeded) * 100).toFixed(1) 
      : 0;

    // Employee performance (average feedback)
    const feedbackStats = await Checkin.aggregate([
      {
        $match: { managerId: managerId }
      },
      {
        $group: {
          _id: "$feedback",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      teamSize,
      goalsSubmitted,
      goalsApproved,
      checkinsDone,
      checkinRate: parseFloat(checkinRate),
      employeeCount: employees.length,
      feedbackStats,
      topEmployees: employees.slice(0, 5).map(e => ({ name: e.name, email: e.email }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get employee personal metrics
export const getEmployeeDashboard = async (req, res) => {
  try {
    const employeeId = req.user._id;

    // Current year sheet
    const currentYear = new Date().getFullYear();
    const sheet = await GoalSheet.findOne({ employeeId, year: currentYear });

    if (!sheet) {
      return res.json({
        goalsCount: 0,
        sheetStatus: "NOT_STARTED",
        updatesCount: 0,
        checkinsCount: 0,
      });
    }

    // Goals in sheet
    const goalsCount = await Goal.countDocuments({ goalSheetId: sheet._id });

    // Updates submitted
    const updatesCount = await GoalUpdate.countDocuments({ employeeId });

    // Check-ins received
    const checkinsCount = await Checkin.countDocuments({ employeeId });

    // Goal progress by status
    const goalStatuses = await GoalUpdate.aggregate([
      {
        $match: { employeeId: employeeId }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      goalsCount,
      sheetStatus: sheet.status,
      updatesCount,
      checkinsCount,
      goalStatuses,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export goals as CSV
// Export goals with achievement report as CSV
// Export goals with achievement report as CSV
export const exportGoalsCSV = async (req, res) => {
  try {
    const { year } = req.query;
    
    const goalSheets = await GoalSheet.find({ year: parseInt(year) })
      .populate("employeeId", "name email department")
      .populate("approvedBy", "name");

    let csv = "Employee,Email,Department,Goal Title,Thrust Area,UoM Type,Target Value,Actual Achievement,Achievement %,Status,Weightage,Sheet Status,Approved By\n";

    // For each goal sheet, fetch its goals
    for (const sheet of goalSheets) {
      const goals = await Goal.find({ goalSheetId: sheet._id });
      
      goals.forEach(goal => {
        const achievementPercent = goal.targetValue && goal.actualAchievement 
          ? ((goal.actualAchievement / goal.targetValue) * 100).toFixed(1)
          : "N/A";

        csv += `"${sheet.employeeId.name}","${sheet.employeeId.email}","${sheet.employeeId.department || 'N/A'}","${goal.title}","${goal.thrustArea}","${goal.uomType}","${goal.targetValue || 'N/A'}","${goal.actualAchievement || 'N/A'}","${achievementPercent}","${goal.achievementStatus || 'NOT_STARTED'}",${goal.weightage},"${sheet.status}","${sheet.approvedBy?.name || 'N/A'}"\n`;
      });
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="achievement-report-${year}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Export check-ins as CSV
export const exportCheckinsCSV = async (req, res) => {
  try {
    const { quarter, year } = req.query;
    const managerId = req.user._id;

    // Get all checkins for manager
    const checkins = await Checkin.find({
      managerId,
      ...(quarter && { quarter }),
      ...(year && { year: parseInt(year) })
    })
      .populate("goalId", "title thrustArea")
      .populate("employeeId", "name email");

    let csv = "Employee,Email,Goal Title,Thrust Area,Quarter,Year,Feedback,Manager Notes,Action Items,Check-in Date\n";

    for (const checkin of checkins) {
      csv += `"${checkin.employeeId.name}","${checkin.employeeId.email}","${checkin.goalId.title}","${checkin.goalId.thrustArea}","${checkin.quarter}",${checkin.year},"${checkin.feedback}","${checkin.managerNotes?.replace(/"/g, '""') || ''}","${checkin.actionItems?.replace(/"/g, '""') || ''}","${checkin.checkinDate?.toISOString().split('T')[0] || ''}"\n`;
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="checkins-${quarter}-${year}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const updateGoalAchievement = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { actualAchievement, achievementStatus } = req.body;

    if (actualAchievement === undefined || achievementStatus === undefined) {
      return res.status(400).json({ message: "actualAchievement and achievementStatus required" });
    }

    const goal = await Goal.findById(goalId);
    
    // Capture old values
    const oldValues = {
      actualAchievement: goal.actualAchievement,
      achievementStatus: goal.achievementStatus
    };

    const updatedGoal = await Goal.findByIdAndUpdate(
      goalId,
      {
        actualAchievement,
        achievementStatus,
        achievementDate: new Date()
      },
      { new: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Log achievement update
    await AuditLog.create({
      entityType: "GOAL",
      entityId: goalId,
      action: "UPDATE",
      before: oldValues,
      after: { actualAchievement, achievementStatus },
      actorUserId: req.user._id,
      timestamp: new Date()
    });

    res.json({ message: "Goal achievement updated", goal: updatedGoal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};