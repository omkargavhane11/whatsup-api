import express, { application } from "express";
const router = express.Router();
import User from "../models/User.js";

router.post("/login", async (req, res) => {
  try {
    const findContact = await User.findOne({ contact: req.body.contact });

    if (findContact) {
      if (findContact.password === req.body.password) {
        const { password, ...others } = findContact._doc;
        res.send({ msg: "success", user: others });
      } else {
        res.send({ msg: "Invalid credentials" });
      }
    } else {
      res.send({ msg: "User not found" });
    }
  } catch (error) {
    res.send({ error: error.message });
  }
});

// user
router.post("/register", async (req, res) => {
  try {
    const findUser = await User.findOne({ email: req.body.contact });

    if (!findUser) {
      const newUser = await User.create(req.body);
      res.send({ msg: "registration successfull" });
    } else {
      res.send({ msg: "User already registered with the same contact number" });
    }
  } catch (error) {
    res.send({ msg: error.message });
  }
});

// get all users
router.get("/", async (req, res) => {
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
    const getUser = await User.findOne({ _id: req.params.id }, { password: 0 });
    res.send(getUser);
  } catch (error) {
    res.send(error);
  }
});

// edit user details by ID
router.put("/:id", async (req, res) => {
  try {
    const getUser = await User.updateOne(
      { _id: req.params.id },
      { $set: req.body }
    );

    if (getUser.modifiedCount === 1) {
      res.send("Updated successfully");
    } else {
      res.send("Failed to updated user details");
    }
  } catch (error) {
    res.send({ msg: error });
  }
});

export default router;
