import mongoose from "mongoose";
const { Schema } = mongoose;
import bcrypt from "bcryptjs"; // Import bcryptjs for password hashing

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 3,
    },
    contact: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    chats: {
        type: [Schema.Types.ObjectId],
        ref: "Chat",
        default: []
    },
    dp: {
        type: String,
        default: null
    },
    lastSeen: {
        type: Date,
        default: null
    },
    verified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: Number,
        default: null
    },
    contacts: {
        type: [Schema.Types.ObjectId],
        ref: "User",
        default: []
    }
}
    ,
    { timestamps: true }
);

// Middleware to hash the password before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next(); // Skip hashing if password has not been modified
    }

    try {
        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10); // 10 rounds of salting
        this.password = await bcrypt.hash(this.password, salt);
        next(); // Proceed with saving the user
    } catch (error) {
        next(error); // Pass any errors to the next middleware
    }
});

// Method to compare the entered password with the hashed password
userSchema.methods.comparePassword = async function (candidatePassword, storedPassword) {
    try {
        // Compare the candidate password with the stored hashed password
        const isMatch = await bcrypt.compare(candidatePassword, storedPassword);
        return isMatch;
    } catch (error) {
        throw new Error(error);
    }
};



export default mongoose.model("User", userSchema);