const _ = require('lodash');
const validator = require('validator');
const User = require('../models/User');

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

    if (!validator.isEmail(req.body.email)) {
      validationErrors.push({ msg: 'Please enter a valid email address.' });
    }

    if (validationErrors.length) {
      req.flash('errors', validationErrors);
      return res.redirect(redirectUrl);
    }

    let { email } = req.body;
    const {
      name, gender, address, department, position, salary, isAdmin, isActive
    } = req.body;
    email = validator.normalizeEmail(email, { gmail_remove_dots: false });
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

    try {
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

    req.flash('success', { msg: 'Profile information has been updated.' });
    res.redirect('/employees');
  }

  async editEmployeePasswordById(req, res, next) {}

  async deleteEmployeeById(req, res, next) {
    try {
      const { params, query } = req;
      await User.deleteOne({ _id: params.id });
      req.flash('info', { msg: `${query.empName}'s account has been deleted.` });
      res.redirect('/employees');
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new EmployeeController();
