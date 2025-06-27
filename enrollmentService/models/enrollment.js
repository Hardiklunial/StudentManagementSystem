const mongoose = require("mongoose");

// Define the Enrollment Schema
const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    enrollmentDate: {
        type: Date,
        default: Date.now,
    },
});

enrollmentSchema.index({ student: 1, course: 1}, { unique: true }) // Avoid duplicate enrollment
const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

module.exports = Enrollment;
