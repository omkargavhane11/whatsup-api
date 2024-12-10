import express from "express";
const router = express.Router();
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";


router.post("/new-message", async (req, res) => {
    try {
        const message = await Message.create(req.body);

        // update latest message on chatId
        const updateChat = await Chat.updateOne({ _id: req.body.chatId }, { $set: { lastMessage: { message: req.body.message, date: Date.now(), senderId: req.body.senderId, unreadMsgCount: { [req.body.recieverId]: req.body.unreadMsgCount, [req.body.senderId]: 0 } } } });

        res.send({ msg: "message sent" })

    } catch (error) {
        res.send({ msg: "failed to send message" })
    }
})

router.post("/get-chat-message/:chatId", async (req, res) => {
    try {
        const { userId, friendId } = req.body;
        // update last seen
        await User.updateOne({ _id: userId }, { $set: { lastSeen: new Date() } })

        // read all unread messages of chat
        // const readMessages = await Message.updateMany({ chatId: req.params.chatId, senderId: friendId }, { $set: { isRead: true } });

        // get all chat messages
        const messages = await Message.find({ chatId: req.params.chatId });
        if (!messages) {
            res.send({ error: true, msg: "failed to retrieve msgs 1 ", data: [] })
        }
        res.send({ data: messages, error: false })
    } catch (error) {
        res.send({ error: true, msg: error.message, data: [] })
    }
});

router.post("/read-unread-chat-message/:chatId", async (req, res) => {
    try {
        const { userId, friendId } = req.body;
        // read all unread messages of chat
        await Message.updateMany({ chatId: req.params.chatId, senderId: friendId }, { $set: { isRead: true } });
        res.send({ error: false })
    } catch (error) {
        res.send({ error: true, msg: error.message, data: [] })
    }
});




export default router;