import express from "express";
import cors from "cors";
import fast2sms from "fast-two-sms";
import otpGenerator from "otp-generator";
import http from "http";
import dotenv from "dotenv";

// Importing routes
import userRoute from "./routes/user.js";
import chatRoute from "./routes/chat.js";
import messageRoute from "./routes/message.js";
import connectToMongoDB from "./config/db.config.js";
import initializeSocket from "./config/socket.config.js"; // Import the socket initialization function

dotenv.config();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 8080; // Default port if not set

// Middlewares
app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");

// Connecting to MongoDB
connectToMongoDB();

// Health check
app.get("/", (req, res) => {
  res.status(200).send({ message: "Whatsup server API" });
});

// Routes
app.use("/user", userRoute);
app.use("/chat", chatRoute);
app.use("/message", messageRoute);

// Initialize HTTP server
const socketServer = server.listen(PORT, () =>
  console.log("Whatsup server started on " + PORT)
);

// Initialize Socket.IO 
initializeSocket(socketServer); // Pass the server to the socket initialization function

export { app };


//NOTE - use when need fat2sms otp

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
//

