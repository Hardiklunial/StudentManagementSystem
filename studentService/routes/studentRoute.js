const express = require("express");

const Student = require("../models/student");

const { verifyRole, restrictStudentToOwnData, jwtRateLimiter } = require("./auth/util");
const { ROLES } = require("../../consts");
const { studentServiceLogger: logger } = require("../../logging");
const router = express.Router();
const { getCorrelationId } = require("../../correlationId");


//POST a new student
router.post("/", async(req,res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res
            .status(400)
            .json({ message: "Provide name, email and password"});
    }
    try {
        //check if student exists
        const existingStudent = await Student.findOne({ email});
        if (existingStudent) {
            return res
                .status(400)
                .json({ message: "Student already exists"});
        }
        const newStudent =new Student({ name, email, password });
        const savedStudent = await newStudent.save();
        return res.status(201).json(savedStudent);

    }catch (error) {
        return res
                .status(500)
                .json({ message: "Unable to create student",
                    error: error.message,
                    correlationId: getCorrelationId()
                });

    }
});

router.get("/",verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.AUTH_SERVICE, ROLES.ENROLLMENT_SERVICE]), jwtRateLimiter, async(req,res) => {
    try{
    const allStudents = await Student.find()
    if (!allStudents){
        return res.status(404).json({message: "No Students Enrolled"});
    }
    logger.info("All Students Fetched")
        return res.status(200).json(allStudents)
    }
    catch (error){
        console.log(error)
        return res.status(500).json({message: "Internal server Error.",
            error: error.message,
            correlationId: getCorrelationId()
        });
    }
});

router.get("/readOneStudent",verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.STUDENT]),restrictStudentToOwnData, async(req,res) => {
    try{
        const {email} = req.body;
        const ReadoneStudent = await Student.findOne({email})
    if (!ReadoneStudent){
        return res.status(404).json({message: "No Students Found",
            error: error.message,
            correlationId: getCorrelationId()
        });
    }

        return res.status(200).json(ReadoneStudent)
    }
    catch (error){
        console.log(error.message)
        return res.status(500).json({message: "Internal server Error.",
            error: error.message,
            correlationId: getCorrelationId()
        });
    }
});

router.put("/updateStudent/:email", verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.STUDENT]),restrictStudentToOwnData, async(req,res) => {
    try{
        const {email} = req.params;
        const {name,password} = req.body;
        const updatedStudent = await Student.findOneAndUpdate(
            {
                email
            },
            {
                name, password
            },
            {
                new: true
            }
        )
    if (!updatedStudent){
        return res.status(404).json({message: "No Students Enrolled"});
    }

        return res.status(200).json({message:"Updated Student Succesfully"});
    }
    catch (error){
        return res.status(500).json({message: "Internal server Error.",
            error: error.message,
            correlationId: getCorrelationId()
        });
    }
});

router.delete("/deleteStudent/:email", verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.STUDENT]), restrictStudentToOwnData ,async(req,res) => {
    try{
        const {email} = req.params;
        const deleteStudent = await Student.findOneAndDelete({email})
    if (!deleteStudent){
        return res.status(404).json({message: "No Students found"});
    }

        return res.status(200).json({message:"Student Deleted Successfully"})
    }
    catch (error){
        return res.status(500).json({message: "Internal server Error.",
            error: error.message,
            correlationId: getCorrelationId()
        });
    }
})



module.exports = router;
