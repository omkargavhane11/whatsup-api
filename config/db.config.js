import mongoose from "mongoose";

// connecting to mongoDB
export const connectToMongoDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URL, () => console.log("mongodb connected ✅"));
  } catch (error) {
    console.error("mongodb failed to connect ❌", error);
  }
};

export default connectToMongoDB;
