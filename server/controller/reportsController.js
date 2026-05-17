import GoalSheet from "../models/GoalSheet.js";
import Goal from "../models/Goal.js";
import GoalUpdate from "../models/GoalUpdate.js";
import Checkin from "../models/Checkin.js";
import User from "../models/User.js";

// Get admin dashboard metrics
export const getAdminDashboard = async (req, res) => {
  try {
    // Total stats
    const totalUsers = await User.countDocuments();
    const totalEmployees = await User.countDocuments({ role: "EMPLOYEE" });
    const totalManagers = await User.countDocuments({ role: "MANAGER" });

    const totalGoalSheets = await GoalSheet.countDocuments();
    const approvedSheets = await GoalSheet.countDocuments({ status: "APPROVED" });
    const pendingSheets = await GoalSheet.countDocuments({ status: "SUBMITTED" });

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
        pending: pendingSheets,
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
export const exportGoalsCSV = async (req, res) => {
  try {
    const { year } = req.query;
    const adminId = req.user._id;

    // Get all goal sheets for year
    const sheets = await GoalSheet.find({ year: parseInt(year) })
      .populate("employeeId", "name email department")
      .populate("approvedBy", "name");

    let csv = "Employee,Email,Department,Goal Title,Thrust Area,UoM Type,Target Value,Target Date,Weightage,Sheet Status,Approved By,Approved At\n";

    for (const sheet of sheets) {
      const goals = await Goal.find({ goalSheetId: sheet._id });

      for (const goal of goals) {
        csv += `"${sheet.employeeId.name}","${sheet.employeeId.email}","${sheet.employeeId.department || 'N/A'}","${goal.title}","${goal.thrustArea}","${goal.uomType}","${goal.targetValue}","${goal.targetDate?.toISOString().split('T')[0] || 'N/A'}",${goal.weightage},"${sheet.status}","${sheet.approvedBy?.name || 'N/A'}","${sheet.approvedAt?.toISOString().split('T')[0] || 'N/A'}"\n`;
      }
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="goals-${year}.csv"`);
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