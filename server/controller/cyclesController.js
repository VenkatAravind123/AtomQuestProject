import Cycle from "../models/Cycle.js";
import GoalSheet from "../models/GoalSheet.js";

// Get all cycles
export const getCycles = async (req, res) => {
  try {
    const cycles = await Cycle.find().sort({ year: -1, createdAt: -1 });
    res.json(cycles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get cycles for a specific year
export const getCyclesByYear = async (req, res) => {
  try {
    const { year } = req.params;
    const cycles = await Cycle.find({ year: parseInt(year) }).sort({ createdAt: 1 });
    res.json(cycles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create new cycle (for a phase/quarter)
export const createCycle = async (req, res) => {
  try {
    const { year, phase, windowStart, windowEnd } = req.body;

    // Validation
    if (!year) return res.status(400).json({ message: "year is required" });
    if (!phase) return res.status(400).json({ message: "phase is required" });
    if (!["GOAL_SETTING", "Q1", "Q2", "Q3", "Q4"].includes(phase)) {
      return res.status(400).json({ message: "Invalid phase (GOAL_SETTING, Q1-Q4)" });
    }
    if (!windowStart || !windowEnd) {
      return res.status(400).json({ message: "windowStart and windowEnd are required" });
    }

    const start = new Date(windowStart);
    const end = new Date(windowEnd);

    if (start >= end) {
      return res.status(400).json({ message: "windowStart must be before windowEnd" });
    }

    // Check if cycle already exists for this year+phase
    const existing = await Cycle.findOne({ year: parseInt(year), phase });
    if (existing) {
      return res.status(409).json({ message: `Cycle already exists for ${year} ${phase}` });
    }

    const cycle = await Cycle.create({
      year: parseInt(year),
      phase,
      windowStart: start,
      windowEnd: end,
      active: false,
    });

    res.status(201).json({
      message: "Cycle created successfully",
      cycle,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Activate a cycle (deactivate others for that phase)
export const activateCycle = async (req, res) => {
  try {
    const { cycleId } = req.params;

    const cycle = await Cycle.findById(cycleId);
    if (!cycle) return res.status(404).json({ message: "Cycle not found" });

    // Deactivate other cycles for same phase+year
    await Cycle.updateMany(
      { year: cycle.year, phase: cycle.phase, _id: { $ne: cycleId } },
      { active: false }
    );

    // Activate this cycle
    cycle.active = true;
    await cycle.save();

    res.json({
      message: "Cycle activated",
      cycle,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Close a cycle (no more edits)
export const closeCycle = async (req, res) => {
  try {
    const { cycleId } = req.params;

    const cycle = await Cycle.findById(cycleId);
    if (!cycle) return res.status(404).json({ message: "Cycle not found" });

    cycle.active = false;
    await cycle.save();

    res.json({
      message: "Cycle closed",
      cycle,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a cycle
export const deleteCycle = async (req, res) => {
  try {
    const { cycleId } = req.params;

    const cycle = await Cycle.findByIdAndDelete(cycleId);
    if (!cycle) return res.status(404).json({ message: "Cycle not found" });

    res.json({
      message: "Cycle deleted",
      cycle,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current active cycle
export const getActiveCycle = async (req, res) => {
  try {
    const cycle = await Cycle.findOne({ active: true }).sort({ createdAt: -1 });
    res.json(cycle || { message: "No active cycle" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};