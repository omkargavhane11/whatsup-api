import mongoose from 'mongoose';

// connecting to mongoDB
export const connectToMondoDB = () => {
    mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, () => console.log("mongodb connected ✅"));
}


export default connectToMondoDB;