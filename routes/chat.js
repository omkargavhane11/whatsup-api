import express, { application } from "express";
const router = express.Router();
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import mongoose from "mongoose";

// create new chat
router.post("/create-chat", async (req, res) => {
    try {
        const findMobileNumber = await User.findOne({ contact: req.body.contact });

        if (findMobileNumber) {

            const friendId = findMobileNumber._id.toString();

            const findChat = await Chat.findOne({ members: { $in: [req.body.userId, friendId] } });
            if (findChat) {
                const updateUserId = await User.updateOne({ _id: req.body.userId }, { $push: { chats: findChat._id.toString() } });
                res.send({ msg: `Chat created with ${req.body.name}`, data: newChat });
            } else {
                const newChat = await Chat.create({
                    members: [req.body.userId, friendId],
                    latestMessage: null
                });
                const updateUserId = await User.updateOne({ _id: req.body.userId }, { $push: { chats: newChat._id.toString() } });
                // res.send({ msg: `Chat created with ${req.body.name}` });
                // res.send(newChat);
                res.send({ msg: `Chat created with ${req.body.name}`, data: newChat });
            }
            // console.log(findMobileNumber._id.toString());
        } else {
            res.send({ msg: "User not registered with provided mobile number" })
        }
    } catch (error) {
        res.send({ msg: "failed to create chat", error: error.message })
    }
})

//  all chats
router.get("/get-chat", async (req, res) => {
    try {
        const chats = await Chat.find({}).populate("members", { password: 0, contactList: 0 });
        res.send(chats)
    } catch (error) {
        res.send("failed to retrieve chat")
    }
})

// user's chat
router.get("/get-chat/:userId", async (req, res) => {
    try {
        const chats = await Chat.find({ members: { $in: [req.params.userId] } }).populate("members", { password: 0, contactList: 0 });
        res.send(chats)
    } catch (error) {
        res.send("failed to retrieve chat")
    }
})



export default router;