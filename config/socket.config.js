import { Server } from "socket.io";

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

const initializeSocket = (server) => {
  console.log("socket started !");
  const io = new Server(server, {
    connectionStateRecovery: {
      // the backup duration of the sessions and the packets
      maxDisconnectionDuration: 2 * 60 * 1000,
      // whether to skip middlewares upon successful recovery
      skipMiddlewares: true,
    },
    cors: {
      origin: "http://localhost:3000",
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected with ${socket.id}`);
    console.log("users :: ", users);

    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      io.emit("getUsers", users);
      console.log("users :: ", users);
    });

    socket.on("disconnect", () => {
      console.log(`${socket.id} disconnected`);
      removeUser(socket.id);
      io.emit("getUsers", users);
      console.log("users :: ", users);
    });

    socket.on("sendMessage", ({ senderId, receiverId, message, chatId }) => {
      console.log("new message :: ", { senderId, receiverId, message, chatId });
      const user = getUser(receiverId);

      // console.log(
      //   "sending to :: ",
      //   { user },
      //   {
      //     senderId,
      //     message,
      //     chatId,
      //   }
      // );

      if (user) {
        io.to(user.socketId).emit("getMessage", {
          senderId,
          message,
          chatId,
        });
      }
    });
  });
};

export default initializeSocket;
