const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");

// Registration Controler

const registerController = async (req, res) => {
  try {
    // check the existance of user

    const userExist = await userModel.findOne({ email: req.body.email });

    if (userExist) {
      return res.status(200).send({
        success: false,
        message: "User is Already exists",
      });
    }

    //Hashing of password

    const salt = await bcrypt.genSalt(10);
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    const user = new userModel(req.body);

    await user.save();

    res.status(201).send({
      success: true,
      message: "Registration is successFull",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Error in Register controler ${error}`,
    });
  }
};

// Login controler

const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });

    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Exist" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ success: false, message: "Invalid  Cradential" });
    }

    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).send({
      success: true,
      message: "Login SuccessFull",
      token,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `Error in Login controler ${error}`,
    });
  }
};

const authController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.password = undefined;

    if (!user) {
      return res.status(200).send({
        success: false,
        message: "user not found",
      });
    }
    return res.status(200).send({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Auth Error",
    });
  }
};

// Apply Doctor Controler

const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = await doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();
    const adminUser = await userModel.findOne({ isAdmin: true });
    const notifcation = adminUser.notification;
    notifcation.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For A Doctor Account`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
        onClickPath: "/admin/docotrs",
      },
    });
    await userModel.findByIdAndUpdate(adminUser._id, {notification: notifcation });
    res.status(201).send({
      success: true,
      message: "Doctor Account Applied SUccessfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Applying For Doctotr",
    });
  }
};

//notification ctrl
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notification = user.notification;
    seennotification.push(...notification);
    user.notification = [];
    user.seennotification = notification;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "all notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};


module.exports = {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController
};
