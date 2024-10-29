import mongoose from "mongoose";

// connecting to mongoDB
export const connectToMondoDB = async () => {
  try {
    mongoose.connect(
      process.env.MONGO_URL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      () => console.log("mongodb connected ✅")
    );
  } catch (error) {
    console.log("mongodb failed to connected ❌");
  }
};

export default connectToMondoDB;
