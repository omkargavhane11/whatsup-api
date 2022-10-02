import mongoose from "mongoose";
const { Schema } = mongoose;

const messageSchema = new mongoose.Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    chatId: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    }
},
    { timestamps: true }
);



export default mongoose.model("Message", messageSchema);