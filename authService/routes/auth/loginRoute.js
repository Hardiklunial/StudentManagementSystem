const express = require("express");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const {
  generateJWTWithPrivateKey,
  fetchStudents,
  fetchProfessors,
} = require("./util");
const { ROLES } = require("../../../consts");
const { authServiceLogger: logger, authServiceLogger } = require("../../../logging");
const router = express.Router();

dotenv.config();

// Student Login
router.post("/student", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      authServiceLogger.info('Email and password are required');
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    // get list of students
    const students = await fetchStudents();
    const student = students.find((s) => s.email === email);

    if (!student) {
      authServiceLogger.error(`Invalid email - ${email}`);
      return res.status(401).json({ message: "Student Not Found" });
    }
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      logger.error(`Invalid Credentials - ${email}`);
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const payload = { id: student._id, role:ROLES.STUDENT};
    const token = generateJWTWithPrivateKey({payload});
    logger.info(`Student with email: ${email} logged in successfully`);
    return res.status(200).json({accessToken: token})

  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Professor Login
router.post("/professor", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    //get the list of professors
    const professors = await fetchProfessors();
    const professor = professors.find((professor) => professor.email === email);

    if (!professor) {
      authServiceLogger.error(`Professor login failed: Invalid email - ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

   //compare password
    const isMatch = await bcrypt.compare(password, professor.password);
    if (!isMatch) {
      authServiceLogger.error(`Invalid password for professor with email: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    //generate the JWT token
    const payload = {id: professor._id, role: ROLES.PROFESSOR,};
    const token = generateJWTWithPrivateKey({payload});
    logger.info(`Professor with email: ${email} logged in successfully`);

    return res.status(200).json({accessToken: token})
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
