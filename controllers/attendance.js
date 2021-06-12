const _ = require('lodash');
const currency = require('currency.js');
const moment = require('moment');
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const constants = require('../config/constants');

class AttendanceController {
  async calculateTotalAttendance(params) {
    const { userId, monthYear } = params;
    const daysInMonth = moment(monthYear, constants.FORMAT_YEARMONTH).daysInMonth();
    const attendances = await this.getAttendances(userId, monthYear, daysInMonth);
    const totalPresence = (_.map(attendances, 'scheduleDate')).length;
    const workingDays = this.calculateWorkingDays(daysInMonth);
    const totalAttendance = ((totalPresence / workingDays) * 100).toFixed(2);
    return totalAttendance;
  }

  async calculateSalaryByTotalAttendance(params) {
    const { userId, monthYear, salary } = params;
    const daysInMonth = moment(monthYear, constants.FORMAT_YEARMONTH).daysInMonth();
    const attendances = await this.getAttendances(userId, monthYear, daysInMonth);
    const totalPresence = (_.map(attendances, 'scheduleDate')).length;
    const workingDays = this.calculateWorkingDays(daysInMonth);
    const totalSalary = ((totalPresence / workingDays) * salary);
    return currency(totalSalary, constants.LOCALE_CURRENCY).format();
  }

  async getAttendances(userId, monthYear, daysInMonth) {
    return Attendance.find({
      userId: mongoose.Types.ObjectId(userId),
      scheduleDate: {
        $gte: moment(`${monthYear}-01`).format(constants.FORMAT_DATE),
        $lt: moment(`${monthYear}-${daysInMonth}`).format(constants.FORMAT_DATE)
      }
    });
  }

  calculateWorkingDays(daysInMonth) {
    const weekdays = this.formatAmountOfWeekDaysInMonth();
    const workingDays = daysInMonth - weekdays.Saturday - weekdays.Sunday;
    return workingDays;
  }

  formatAmountOfWeekDaysInMonth() {
    const result = {};
    for (let i = 0; i < 7; i++) {
      result[moment().weekday(i).format('dddd')] = this.getAmountOfWeekDaysInMonth(moment(), i);
    }
    return result;
  }

  getAmountOfWeekDaysInMonth(date, weekday) {
    date.date(1);
    const diff = ((7 + (weekday - date.weekday())) % 7) + 1;
    return Math.floor((date.daysInMonth() - diff) / 7) + 1;
  }
}

module.exports = new AttendanceController();
