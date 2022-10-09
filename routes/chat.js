import express, { application } from "express";
const router = express.Router();
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import mongoose from "mongoose";

// create new chat
router.post("/create-chat", async (req, res) => {
    try {
        // find contact is registered or not
        const findMobileNumber = await User.findOne({ contact: req.body.contact });

        if (findMobileNumber) {
            const friendId = findMobileNumber._id.toString();

            //  find chat of user with friend
            const findChat = await Chat.findOne({ members: { $all: [req.body.userId, friendId] } }).populate("members", { _id: 1, name: 1, contact: 1 });

            // // check if chat already exists in user's chats array
            const findUserData = await User.findOne({ _id: req.body.userId });
            if (findUserData.chats.includes(findChat?._id)) {
                res.send({ msg: "Contact already exists", data: findChat });

            } else {
                if (findChat) {
                    const updateUserId = await User.updateOne({ _id: req.body.userId }, { $push: { chats: findChat._id.toString() } });
                    res.send({ msg: `Chat created with ${req.body.name}`, data: findChat });
                } else {
                    const newChat = await Chat.create({
                        members: [req.body.userId, friendId],
                    });
                    const updateUserId = await User.updateOne({ _id: req.body.userId }, { $push: { chats: newChat._id.toString() } });
                    res.send({ msg: `New Chat created with ${req.body.name}`, data: newChat });
                }
            }


        } else {
            res.send({ msg: "User not registered" })
        }
    } catch (error) {
        res.send({ msg: "failed to create chat", error: error.message })
    }
})

//  all chats
router.get("/get-chat", async (req, res) => {
    try {
        const chats = await Chat.find({}).populate("members", { _id: 1, name: 1, contact: 1 });
        res.send(chats)
    } catch (error) {
        res.send("failed to retrieve chat")
    }
})

// user's chat
router.get("/get-chat/:userId", async (req, res) => {
    try {
        const chats = await Chat.find({ members: { $in: [req.params.userId] } }).populate("members", { _id: 1, name: 1, contact: 1 });
        // const chats = [];
        res.send(chats)
    } catch (error) {
        res.send("failed to retrieve chat")
    }
})



export default router;