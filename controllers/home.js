const moment = require('moment');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const constants = require('../config/constants');

exports.index = async (req, res, next) => {
  if (req.user && req.user.id) {
    try {
      const user = await User.findById(req.user.id);
      const now = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      const clockIn = await Attendance.findOne({
        userId: req.user.id,
        scheduleDate: moment().format(constants.FORMAT_DATE),
        clockType: constants.CLOCK_IN
      });
      const clockOut = await Attendance.findOne({
        userId: req.user.id,
        scheduleDate: moment().format(constants.FORMAT_DATE),
        clockType: constants.CLOCK_OUT
      });
      res.render('home', {
        title: 'Home',
        clock: now.toLocaleTimeString(),
        day: now.toLocaleDateString('id-ID', options),
        user,
        clockIn: clockIn ? moment(clockIn.clockAt).format(constants.FORMAT_TIME) : null,
        clockOut: clockOut ? moment(clockOut.clockAt).format(constants.FORMAT_TIME) : null
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
  const attendance = new Attendance({
    userId: req.user.id,
    scheduleDate: moment().format(constants.FORMAT_DATE),
    clockAt: moment(),
    clockType: constants.CLOCK_IN
  });

  try {
    await attendance.save();
    req.flash('success', { msg: 'Success clock in.' });
    res.redirect('/');
  } catch (error) {
    return next(error);
  }
};

exports.postClockOut = async (req, res, next) => {
  const attendance = new Attendance({
    userId: req.user.id,
    scheduleDate: moment().format(constants.FORMAT_DATE),
    clockAt: moment(),
    clockType: constants.CLOCK_OUT,
  });

  try {
    await attendance.save();
    req.flash('success', { msg: 'Success clock out.' });
    res.redirect('/');
  } catch (error) {
    return next(error);
  }
};
