import mongoose from "mongoose";
const { Schema } = mongoose;

const chatSchema = new mongoose.Schema({
    members: {
        type: [Schema.Types.ObjectId],
        ref: 'User'
    },
    lastMessage: {
        type: Object,
        default: null
    },

},
    { timestamps: true }
);



export default mongoose.model("Chat", chatSchema);