const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define the Student Schema
const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },

});
// pre save hook to hash the password

studentSchema.pre("save",async function(next){
    if (!this.isModified("password")) return next(); //only hash if

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    
    catch (error){
        next(error);
    }    
});

// Create the Student model
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
