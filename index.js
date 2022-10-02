import express from 'express';
const app = express();
import cors from 'cors';
import connectToMondoDB from "./helper.js";
import fast2sms from "fast-two-sms";
import otpGenerator from "otp-generator";
import dotenv from "dotenv";

// importing routes 
import userRoute from "./routes/user.js";
import chatRoute from "./routes/chat.js";
import messageRoute from "./routes/message.js";

dotenv.config();

// middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');



// connecting to mongoDB
connectToMondoDB();


app.get("/", (req, res) => {
    res.send("Whatsup server API")
})


// routes
app.use("/user", userRoute);
app.use("/chat", chatRoute);
app.use("/message", messageRoute);

// app.post("/sendMessage", async (req, res) => {
//     try {
//         const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

//         var options = { authorization: process.env.F_API_KEY, message: otp, numbers: [req.body.contactNo] }
//         const send = await fast2sms.sendMessage(options) //Asynchronous Function.

//         res.send(send);
//         // console.log(send);

//     } catch (error) {
//         // console.log(error)
//         res.send(error);
//     }


// })


app.listen(8080, () => console.log("whatsup server started..."));