const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const AttendanceController = require('./attendance');
const constants = require('../config/constants');

exports.index = async (req, res, next) => {
  const { query } = req;
  const selectedMonthYear = query && query.year && query.month
    ? `${query.year}-${query.month}`
    : moment().format(constants.FORMAT_YEARMONTH);

  try {
    const user = await User.findById(req.user.id);
    const daysInMonth = moment(selectedMonthYear, constants.FORMAT_YEARMONTH).daysInMonth();
    const attendances = await Attendance.find({
      userId: mongoose.Types.ObjectId(user.id),
      scheduleDate: {
        $gte: moment(`${selectedMonthYear}-01`).format(constants.FORMAT_DATE),
        $lt: moment(`${selectedMonthYear}-${daysInMonth}`).format(constants.FORMAT_DATE)
      }
    });
    const logs = [];

    for (let index = 0; index < daysInMonth; index++) {
      const day = index + 1;
      const element = new Date(`${selectedMonthYear}-${day}`);
      logs.push({
        day: moment(element)
          .format(constants.FORMAT_DAY_NUM),
        attendance_day: moment(element)
          .locale(constants.LOCALE_ID)
          .format(constants.FORMAT_DAY_NAME),
        attendance_date: moment(element)
          .format(constants.FORMAT_DATE)
      });
    }

    _.reduce(logs, (result, value) => {
      const temp = _.find(attendances, (attendance) =>
        moment(attendance.scheduleDate).format(constants.FORMAT_DATE) === value.attendance_date);
      value.clock_in = temp ? moment(temp.clockInAt).format(constants.FORMAT_TIME) : null;
      value.clock_out = temp ? moment(temp.clockOutAt).format(constants.FORMAT_TIME) : null;
      value.remarks = temp || temp ? 'Hadir' : 'Tanpa keterangan';

      if (moment().isBefore(value.attendance_date)) {
        value.remarks = null;
      }

      if (_.includes(['6', '7'], value.day)) {
        value.remarks = 'Libur';
      }

      return result;
    }, {});

    const totalAttendance = await AttendanceController.calculateTotalAttendance({
      userId: user.id,
      monthYear: moment(`${selectedMonthYear}-01`).format(constants.FORMAT_YEARMONTH)
    });

    res.render('history', {
      title: 'History',
      schedule: {
        year: query && query.year ? query.year : moment().format(constants.FORMAT_YEAR),
        month: moment().locale(constants.LOCALE_ID).format(constants.FORMAT_MONTH),
        monthNum: query && query.month ? query.month : moment().format(constants.FORMAT_MONTH_PAD)
      },
      user,
      logs,
      totalAttendance
    });
  } catch (error) {
    return next(error);
  }
};
