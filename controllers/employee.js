const _ = require('lodash');
const moment = require('moment');
const validator = require('validator');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const AttendanceController = require('./attendance');
const constants = require('../config/constants');

class EmployeeController {
  async getAllEmployees(req, res, next) {
    let users = [];

    try {
      users = await User.find({});
      let i = 1;
      _.map(users, (user) => {
        _.assign(user, { idx: i });
        i++;
      });
    } catch (error) {
      return next(error);
    }

    res.render('employees', {
      title: 'All Employees',
      users
    });
  }

  async getEmployeeById(req, res, next) {
    let user;

    try {
      user = await User.findById(req.params.id);
    } catch (error) {
      return next(error);
    }

    res.render('account/employee', {
      title: 'Edit Employee',
      employee: user
    });
  }

  async editEmployeeById(req, res, next) {
    const userId = req.params.id;
    const redirectUrl = `/employees/${userId}`;
    const validationErrors = [];
    let { email } = req.body;
    email = validator.normalizeEmail(email, { gmail_remove_dots: false });

    if (!validator.isEmail(email)) {
      validationErrors.push({ msg: 'Please enter a valid email address.' });
    }

    if (validationErrors.length) {
      req.flash('errors', validationErrors);
      return res.redirect(redirectUrl);
    }

    const {
      name, gender, address, department, position, salary, isAdmin, isActive
    } = req.body;

    try {
      const user = await User.findById(userId);
      user.email = email || '';
      user.profile.name = name || '';
      user.profile.gender = gender || '';
      user.profile.address = address || '';
      user.profile.department = department || '';
      user.profile.position = position || '';
      user.profile.salary = salary || 0;
      user.isAdmin = isAdmin === 'on' || isAdmin === '';
      user.isActive = isActive === 'on' || isActive === '';
      await user.save();
    } catch (error) {
      if (error.code === 11000) {
        req.flash('errors', {
          msg: 'The email address you have entered is already associated with an account.',
        });
        return res.redirect(redirectUrl);
      }
      return next(error);
    }

    req.flash('success', { msg: `${name}'s profile information has been updated.` });
    res.redirect('/employees');
  }

  async editEmployeePasswordById(req, res, next) {
    const userId = req.params.id;
    const { password, confirmPassword } = req.body;
    const validationErrors = [];

    if (!validator.isLength(password, { min: 8 })) {
      validationErrors.push({ msg: 'Password must be at least 8 characters long' });
    }

    if (password !== confirmPassword) {
      validationErrors.push({ msg: 'Passwords do not match' });
    }

    if (validationErrors.length) {
      req.flash('errors', validationErrors);
      return res.redirect(`/employees/${userId}`);
    }

    try {
      const user = await User.findById(userId);
      user.password = password;
      await user.save();
    } catch (error) {
      return next(error);
    }

    req.flash('success', { msg: 'Password has been changed.' });
    res.redirect('/employees');
  }

  async deleteEmployeeById(req, res, next) {
    const { params, query } = req;

    try {
      await User.deleteOne({ _id: params.id });
    } catch (error) {
      return next(error);
    }

    req.flash('info', { msg: `${query.empName}'s account has been deleted.` });
    res.redirect('/employees');
  }

  async clockIn(req, res, next) {
    const userId = req.params.id;
    const searchCriteria = {
      userId,
      scheduleDate: moment().format(constants.FORMAT_DATE)
    };

    try {
      let attendance = await Attendance.findOne(searchCriteria);

      if (attendance) {
        await Attendance.updateOne(searchCriteria, { clockInAt: moment() });
      } else {
        attendance = new Attendance({
          userId,
          scheduleDate: moment().format(constants.FORMAT_DATE),
          clockInAt: moment()
        });
        await attendance.save();
      }
    } catch (error) {
      return next(error);
    }

    req.flash('success', { msg: 'Success clock in.' });
    res.redirect('/');
  }

  async clockOut(req, res, next) {
    const userId = req.params.id;
    const searchCriteria = {
      userId,
      scheduleDate: moment().format(constants.FORMAT_DATE)
    };

    try {
      let attendance = await Attendance.findOne(searchCriteria);

      if (attendance) {
        await Attendance.updateOne(searchCriteria, { clockOutAt: moment() });
      } else {
        attendance = new Attendance({
          userId,
          scheduleDate: moment().format(constants.FORMAT_DATE),
          clockOutAt: moment()
        });
        await attendance.save();
      }
    } catch (error) {
      return next(error);
    }

    req.flash('success', { msg: 'Success clock out.' });
    res.redirect('/');
  }

  async getEmployeeAttendance(req, res, next) {
    const { query } = req;
    const userId = req.params.id;
    const selectedMonthYear = query && query.year && query.month
      ? `${query.year}-${query.month}`
      : moment().format(constants.FORMAT_YEARMONTH);

    try {
      const user = await User.findById(userId);
      const daysInMonth = moment(selectedMonthYear, constants.FORMAT_YEARMONTH).daysInMonth();
      const attendances = await Attendance.find({
        userId,
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
        userId,
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
  }
}

module.exports = new EmployeeController();
