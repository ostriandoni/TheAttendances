const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  scheduleDate: Date,
  clockType: String,
  clockAt: Date,
}, { timestamps: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
