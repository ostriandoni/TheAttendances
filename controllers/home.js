const moment = require('moment');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

const CLOCK_IN = 'clock in';
const CLOCK_OUT = 'clock out';
const FORMAT_DATE = 'YYYY-MM-DD';
const FORMAT_TIME = 'hh:mm:ss a';

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
        scheduleDate: moment().format(FORMAT_DATE),
        clockType: CLOCK_IN
      });
      const clockOut = await Attendance.findOne({
        userId: req.user.id,
        scheduleDate: moment().format(FORMAT_DATE),
        clockType: CLOCK_OUT
      });
      res.render('home', {
        title: 'Home',
        clock: now.toLocaleTimeString(),
        day: now.toLocaleDateString('id-ID', options),
        user,
        clockIn: clockIn ? moment(clockIn.clockAt).format(FORMAT_TIME) : null,
        clockOut: clockOut ? moment(clockOut.clockAt).format(FORMAT_TIME) : null
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
    scheduleDate: moment().format(FORMAT_DATE),
    clockAt: moment(),
    clockType: CLOCK_IN
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
    scheduleDate: moment().format(FORMAT_DATE),
    clockAt: moment(),
    clockType: CLOCK_OUT,
  });

  try {
    await attendance.save();
    req.flash('success', { msg: 'Success clock out.' });
    res.redirect('/');
  } catch (error) {
    return next(error);
  }
};
