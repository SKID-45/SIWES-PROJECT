const express = require("express");
const Report = require("../models/Report");
const { check, admin } = require("../check");
const reportRouter = express.Router();
const mongoose = require("mongoose");

//CREATES REPORTS
reportRouter.post("/", check, async (req, res) => {
  const { department, problem } = req.body;
  if (typeof department !== "string" || typeof problem !== "string" || !department.trim() || !problem.trim()) {
    return res.status(400).json({
      message: "DEPARTMENT AND PROBLEM ARE REQUIRED",
    });
  }
  try {
    const report = new Report({
      userId: req.user.userId,
      department: department,
      problem: problem,
    });
    await report.save();
    res.status(201).json({
      message: "REPORT HAS BEEN SUBMITTED!",
      report: report,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "COULD NOT BE SUBMITTED!",
    });
  }
});

// VIEWS REPORTS
reportRouter.get("/", check, async (req, res) => {
  try {
    let reports;
    if (req.user.role === "admin" || req.user.role === "superadmin") {
      reports = await Report.find()
        .populate("userId", "name email")
        .sort({ submittedAt: -1 });
    } else {
      reports = await Report.find({
        userId: req.user.userId,
      })
        .populate("userId", "name email")
        .sort({ submittedAt: -1 });
    }
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "COULD NOT GET REPORTS",
    });
  }
});

//ADMINS UPDATES REPORTS
reportRouter.put("/:id", check, admin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "INVALID REPORT ID" });
  }
  const { status } = req.body;
  if (!["Pending", "Resolved", "Unresolved"].includes(status)) {
    return res.status(400).json({
      message: "INVALID STATUS",
    });
  }
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        message: "NOT FOUND",
      });
    }
    report.status = status;
    await report.save();
    res.json({
      message: "UPDATED",
      report: report,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "COULD NOT UPDATE",
    });
  }
});

//DELETE REPORT
reportRouter.delete("/:id", check, admin, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "INVALID REPORT ID" });
  }
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        message: "NOT FOUND",
      });
    }
    await Report.findByIdAndDelete(req.params.id);
    res.json({
      message: "REPORT DELETED",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "COULD NOT DELETE REPORT",
    });
  }
});
module.exports = reportRouter;