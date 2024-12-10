import mongoose from "mongoose";
const { Schema } = mongoose;

const chatSchema = new mongoose.Schema({
    members: {
        type: [Schema.Types.ObjectId],
        ref: 'User'
    },
    lastMessage: {
        type: {
            message: { type: String },
            date: { type: Date },
            senderId: { type: Schema.Types.ObjectId },
            isRead: { type: Boolean, default: false }
        },
        default: {}
    },
    unreadMsgCount: {
        type: {

        },
        default: {}
    }

},
    { timestamps: true }
);



export default mongoose.model("Chat", chatSchema);