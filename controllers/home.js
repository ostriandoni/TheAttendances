const moment = require('moment');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const AttendanceController = require('./attendance');
const constants = require('../config/constants');

exports.index = async (req, res, next) => {
  if (req.user && req.user.id) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      const now = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      const clockIn = await Attendance.findOne({
        userId,
        scheduleDate: moment().format(constants.FORMAT_DATE),
        clockInAt: { $ne: null }
      });
      const clockOut = await Attendance.findOne({
        userId,
        scheduleDate: moment().format(constants.FORMAT_DATE),
        clockOutAt: { $ne: null }
      });
      const totalAttendance = await AttendanceController.calculateTotalAttendance({
        userId,
        monthYear: moment().format(constants.FORMAT_YEARMONTH)
      });
      res.render('home', {
        title: 'Home',
        clock: now.toLocaleTimeString(),
        day: now.toLocaleDateString('id-ID', options),
        user,
        clockIn: clockIn ? moment(clockIn.clockInAt).format(constants.FORMAT_TIME) : null,
        clockOut: clockOut ? moment(clockOut.clockOutAt).format(constants.FORMAT_TIME) : null,
        totalAttendance
      });
    } catch (error) {
      return next(error);
    }
  } else {
    res.render('home', {
      title: 'Home'
    });
  }
};

exports.postClockIn = async (req, res, next) => {
  const searchCriteria = {
    userId: req.user.id,
    scheduleDate: moment().format(constants.FORMAT_DATE)
  };
  let attendance = await Attendance.findOne(searchCriteria);

  try {
    if (attendance) {
      await Attendance.updateOne(searchCriteria, {
        clockInAt: moment()
      });
    } else {
      attendance = new Attendance({
        userId: req.user.id,
        scheduleDate: moment().format(constants.FORMAT_DATE),
        clockInAt: moment()
      });
      await attendance.save();
    }

    req.flash('success', { msg: 'Success clock in.' });
    res.redirect('/');
  } catch (error) {
    return next(error);
  }
};

exports.postClockOut = async (req, res, next) => {
  const searchCriteria = {
    userId: req.user.id,
    scheduleDate: moment().format(constants.FORMAT_DATE)
  };
  let attendance = await Attendance.findOne(searchCriteria);

  try {
    if (attendance) {
      await Attendance.updateOne(searchCriteria, {
        clockOutAt: moment()
      });
    } else {
      attendance = new Attendance({
        userId: req.user.id,
        scheduleDate: moment().format(constants.FORMAT_DATE),
        clockOutAt: moment()
      });
      await attendance.save();
    }

    req.flash('success', { msg: 'Success clock out.' });
    res.redirect('/');
  } catch (error) {
    return next(error);
  }
};
