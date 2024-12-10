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

            // check if chat already exists in user's chats array
            const findUserData = await User.findOne({ _id: req.body.userId });
            if (findUserData.chats.includes(findChat?._id)) {
                res.send({ error: true, msg: "Contact already exists", data: findChat });
                return;

            } else {
                if (findChat) {
                    const updateUserId = await User.updateOne({ _id: req.body.userId }, { $push: { chats: findChat._id.toString() } });
                    res.send({ error: false, msg: `Chat created with ${req.body.name}`, data: findChat });
                    return;
                } else {
                    const newChat = await Chat.create({
                        members: [req.body.userId, friendId],
                    });
                    const updateUserId = await User.updateOne({ _id: req.body.userId }, { $push: { chats: newChat._id.toString() } });
                    res.send({ error: false, msg: `New Chat created with ${req.body.name}`, data: newChat });
                    return;
                }
            }


        } else {
            res.send({ error: true, msg: "User not registered" })
        }
    } catch (error) {
        res.send({ msg: error.message, error: true })
    }
})

//  all chats
// router.get("/get-chat", async (req, res) => {
//     try {
//         const chats = await Chat.find({}).populate("members", { _id: 1, name: 1, contact: 1 });
//         if (!chats) {
//             res.send({ error: true, msg: "failed to retrieve chat", data: [] })
//         }
//         res.send({ error: false, chats })
//     } catch (error) {
//         res.send({ error: true, msg: "failed to retrieve chat", data: [] })
//     }
// })

// get chat by id
router.get("/get-chat-by-id/:chatId", async (req, res) => {
    try {
        const chat = await Chat.findOne({ _id: req.params.chatId }).populate("members", { _id: 1, name: 1, contact: 1 });;
        if (!chat) {
            res.send({ error: true, msg: "failed to retrieve chat", data: null })
            return;
        }
        res.send({ error: false, data: chat })
    } catch (error) {
        res.send({ error: true, msg: "failed to retrieve chat", data: null })
    }
})

// get all chats of user
router.get("/get-chat/:userId", async (req, res) => {
    try {
        console.log("req.params.userId :: ", req.params.userId)
        // update last seen
        await User.updateOne({ _id: req.params.userId }, { $set: { lastSeen: new Date() } })
        // get all chats
        const chats = await Chat.find({ members: { $in: [req.params.userId] } }).populate("members", { _id: 1, name: 1, contact: 1, lastSeen: 1 });
        if (!chats) {
            res.send({ error: true, msg: "failed to retrieve chat", data: [] });
            return;
        }
        res.send({error:false, chats})
    } catch (error) {
        res.send({ error: true, msg: error.message, data: [] })
    }
})

router.put("/update-chat/:chatId", async (req, res) => {
    try {
        // update lastMessage of chat to be read
        await Chat.findOneAndUpdate({ _id: req.params.chatId }, { $set: req.body }).sort({ createdAt: -1 });

    } catch (error) {
        res.send({ error: true, msg: error.message })

    }
})




export default router;