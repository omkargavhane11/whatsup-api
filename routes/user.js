import express from "express";
const router = express.Router();
import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import otpGenerator from "otp-generator";

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

const optSet = {};

router.post("/login", async (req, res) => {
  try {
    const userFromDB = await User.findOne({ contact: req.body.contact });

    if (!userFromDB) {
      res.send({ error: true, msg: "User not found" });
      return;
    }

    // verify password match
    const isMatch = await userFromDB.comparePassword(req.body.password, userFromDB.password);

    if (!isMatch) {
      res.send({ error: true, msg: "Invalid credentials" });
      return;
    }

    const jwtToken = jwt.sign(
      { userId: userFromDB._id, name: userFromDB.name }, // Payload
      JWT_SECRET, // Secret key
      { expiresIn: '8h' } // Expiration time (e.g., 1 hour)
    );

    const { name, contact, lastSeen, dp, _id } = userFromDB;
    res.send({ msg: "success", user: { _id, name, contact, lastSeen, dp }, token: jwtToken });

  } catch (error) {
    res.send({ error: error.message });
  }
});

// user
router.post("/register", async (req, res) => {
  try {
    // find if user exists
    const findUser = await User.findOne({ contact: req.body.contact });
    // if not found, return error
    if (findUser) {
      res.send({ error: true, msg: "User already registered with the same contact number" });
      return;
    }
    // verify OTP is correct
    if (optSet[req.body.contact] !== req.body.otp) {
      res.send({ error: true, msg: "Invalid OTP" });
      return;
    }

    // save user to db
    const newUser = await User.create({...req.body, otp: null});
    // reset otp
    optSet[req.params.number] = null;

    if (!newUser) {
      res.send({ error: true, msg: "Failed to signup" });
      return;
    }

    res.status(201).json({ error: false, msg: "Registration successfull" });

  } catch (error) {
    res.send({ error: true, msg: error.message });
  }
});

// get all users
router.get("/sendOTP/:number", async (req, res) => {
  console.log("sending OTP...")
  try {
    // create otp
    const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    // save to OTP store
    optSet[req.params.number] = Number(otp);
    console.log(optSet);
    // send sms

    res.send({ error: false, msg: "OTP sent" });
  } catch (error) {
    res.send({ error: true, msg: error });
  }
});


// get all users
router.get("/", async (req, res) => {
  console.log("getting users...")
  try {
    const getAll = await User.find({}, { password: 0 });
    res.send(getAll);
  } catch (error) {
    res.send({ msg: error });
  }
});

// get user by ID
router.get("/:id", async (req, res) => {
  try {
    const getUser = await User.findOne({ _id: req.params.id }, { password: 0 }).populate("contacts", "name contact dp");
    console.log("user found :: ", getUser);
    res.send({ data: getUser, error: false, msg: "ok" });
  } catch (error) {
    res.send({ error: true, data: [], msg: "not ok" });
  }
});

// edit user details by ID
router.put("/:id", async (req, res) => {
  try {
    let { type, ...others } = req.body;
    let getUser;

    if (type === "plain_update") {
      getUser = await User.updateOne(
        { _id: req.params.id },
        { $set: others }
      );
    }

    if (type === "add_to_contact") {
      getUser = await User.updateOne(
        { _id: req.params.id },
        { $addToSet: { contacts: others.newContact } }
      )
    }

    if (getUser.modifiedCount === 1) {
      let updatedContacts = await User.findOne({ _id: req.params.id }, { password: 0 }).populate("contacts", "name contact dp")
      console.log("updatedContacts :: ", updatedContacts.contacts)
      res.send({ msg: "Updated successfully", contacts: updatedContacts.contacts, error: false });
    } else {
      res.send({ msg: "Failed to updated user details", error: true });
    }
  } catch (error) {
    res.send({ msg: error, error: true });
  }
});

router.get("/find-user/:number", async (req, res) => {
  try {
    let user = await User.find({ $and: [{ contact: Number(req.params.number) }] }, { password: 0 })
    if (user) {
      res.send({ data: user, error: false })
      return;
    }

    res.send({ data: [], error: true })

  } catch (error) {

  }
})

export default router;
