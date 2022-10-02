import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
    },
    email: {
        type: String,
        required: true
    },
    contact: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    contactList: {
        type: [Schema.Types.ObjectId],
        ref: 'User',
        default: null
    },
    chats: {
        type: [Schema.Types.ObjectId],
        ref: "Chat",
        default: []
    },
    dp: {
        type: String,
        default: null
    }
}
    ,
    { timestamps: true }
);



export default mongoose.model("User", userSchema);