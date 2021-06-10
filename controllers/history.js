const _ = require('lodash');
const moment = require('moment');
const mongoose = require('mongoose');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

const CLOCK_IN = 'clock in';
const CLOCK_OUT = 'clock out';
const FORMAT_DATE = 'YYYY-MM-DD';
const FORMAT_TIME = 'hh:mm:ss a';

exports.index = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const attendances = await Attendance.find({
      userId: mongoose.Types.ObjectId(user.id),
      scheduleDate: {
        $gte: moment('2021-06-01').format(FORMAT_DATE),
        $lt: moment('2021-06-30').format(FORMAT_DATE)
      }
    });
    const logs = [];
    const selectedMonthYear = '2021-06';

    for (let index = 0; index < moment(selectedMonthYear, 'YYYY-MM').daysInMonth(); index++) {
      const day = index + 1;
      const element = new Date(`${selectedMonthYear}-${day}`);
      logs.push({
        day: moment(element).format('E'),
        attendance_day: moment(element).locale('id').format('dddd'),
        attendance_date: moment(element).format(FORMAT_DATE)
      });
    }

    _.reduce(logs, (result, value) => {
      const temp1 = _.find(attendances, (attendance) =>
        moment(attendance.scheduleDate).format(FORMAT_DATE) === value.attendance_date
        && attendance.clockType === CLOCK_IN);
      const temp2 = _.find(attendances, (attendance) =>
        moment(attendance.scheduleDate).format(FORMAT_DATE) === value.attendance_date
        && attendance.clockType === CLOCK_OUT);
      value.clock_in = temp1 ? moment(temp1.clockAt).format(FORMAT_TIME) : null;
      value.clock_out = temp2 ? moment(temp2.clockAt).format(FORMAT_TIME) : null;
      value.remarks = temp1 || temp2 ? 'Hadir' : 'Tanpa keterangan';

      if (moment().isBefore(value.attendance_date)) {
        value.remarks = null;
      }

      if (_.includes(['6', '7'], value.day)) {
        value.remarks = 'Libur';
      }

      return result;
    }, {});

    res.render('history', {
      title: 'History',
      schedule: {
        year: moment().format('YYYY'),
        month: moment().locale('id').format('MMMM'),
        monthNum: moment().format('M')
      },
      user,
      logs
    });
  } catch (error) {
    return next(error);
  }
};
