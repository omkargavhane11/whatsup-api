import express from "express";
const router = express.Router();
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";


router.post("/new-message", async (req, res) => {
    try {
        const message = await Message.create(req.body);

        // update latest message on chatId
        const updateChat = await Chat.updateOne({ _id: req.body.chatId }, { $set: { lastMessage: { msg: req.body.message, time: message.createdAt } } });

        res.send({ msg: "message sent" })

    } catch (error) {
        res.send({ msg: "failed to send message" })
    }
})

router.get("/get-chat-message/:chatId", async (req, res) => {
    try {
        const messages = await Message.find({ chatId: req.params.chatId });
        res.send(messages)
    } catch (error) {
        res.send("failed to retrieve message")
    }
})


export default router;