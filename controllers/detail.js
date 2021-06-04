const User = require('../models/User');

/**
 * GET /
 * Home page.
 */
exports.index = (req, res, next) => {
  User.findById(req.user.id, (err, user) => {
    if (err) {
      return next(err);
    }
    res.render('detail', {
      title: 'Detail',
      user,
      logs: [
        {
          day: 1,
          attendance_day: 'Senin',
          attendance_date: '2021-06-01',
          clock_in: '09:00',
          clock_out: '18:00',
          remarks: 'Hadir'
        },
        {
          day: 2,
          attendance_day: 'Selasa',
          attendance_date: '2021-06-02',
          clock_in: '09:01',
          clock_out: '18:01',
          remarks: 'Hadir'
        },
        {
          day: 3,
          attendance_day: 'Rabu',
          attendance_date: '2021-06-03',
          clock_in: '09:02',
          clock_out: '18:02',
          remarks: 'Hadir'
        },
        {
          day: 4,
          attendance_day: 'Kamis',
          attendance_date: '2021-06-04',
          clock_in: null,
          clock_out: null,
          remarks: 'Cuti'
        },
        {
          day: 5,
          attendance_day: 'Jumat',
          attendance_date: '2021-06-05',
          clock_in: null,
          clock_out: null,
          remarks: null
        },
        {
          day: 6,
          attendance_day: 'Sabtu',
          attendance_date: '2021-06-06',
          clock_in: null,
          clock_out: null,
          remarks: 'Libur'
        },
        {
          day: 7,
          attendance_day: 'Minggu',
          attendance_date: '2021-06-07',
          clock_in: null,
          clock_out: null,
          remarks: 'Libur'
        },
        {
          day: 1,
          attendance_day: 'Senin',
          attendance_date: '2021-06-08',
          clock_in: '09:00',
          clock_out: '18:00',
          remarks: 'Hadir'
        },
        {
          day: 2,
          attendance_day: 'Selasa',
          attendance_date: '2021-06-09',
          clock_in: '09:01',
          clock_out: '18:01',
          remarks: 'Hadir'
        }
      ]
    });
  });
};
