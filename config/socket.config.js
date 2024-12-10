import { Server } from "socket.io";
import User from "../models/User.js";

let users = {};
let usersWatchingMe = {};

let socketUsers = {};

const initializeSocket = (server) => {
  const io = new Server(server, {
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,
    },
    cors: {
      origin: "http://localhost:3000",
    },
  });

  io.on("connection", async (socket) => {

    // when users connects to server
    const { userId, userName } = socket.handshake.query;

    // join socket room with self user id
    await socket.join(userId);

    // add to users obj
    users[userId] = users[userId] ?? [];

    if (usersWatchingMe[userId]?.length > 0) {
      usersWatchingMe[userId]?.forEach((u) => {
        io.in(u).emit("consume-subscribe-online-status", { isOnline: true })
      })
    }

    // add to socketids
    socketUsers[socket.id] = userId;

    console.log(`${userId} :: ${userName} connected with ID: ${socket.id}`);
    console.log({ users: users }, " :: ", { usersWatchingMe })

    socket.on("disconnect", async () => {
      console.log("disconnect data :: ", socket.id);

      // get user id from socket users using socketid
      let userId = socketUsers[socket.id];

      usersWatchingMe[userId]?.forEach((u) => {
        io.in(u).emit("consume-subscribe-online-status", { isOnline: false })
      })

      users[userId]?.forEach((u) => {
        let temp = {
          ...usersWatchingMe, [usersWatchingMe[u]]: usersWatchingMe[u]?.filter((uw) => uw !== u)
        }
        usersWatchingMe = temp;
      })

      delete users[userId];


      // leave socket room
      socket.leave(userId);

      // send users went offline flag to all subcribers of that user
      // let subcriberIds = users[userId] ?? [];
      // subcriberIds.forEach((id) => {
      //   io.in(id).emit("consume-subscribe-online-status", { isOnline: false });
      // });
      let userIdOfSocketClient = socketUsers[socket.id];

      // remove user from users list since its disconnected now
      delete users[userId];

      // delete socketId from socketUsers object
      delete socketUsers[userId];

      // console.log("when dis-connected: ", users)

      // update last seen in db
      await User.updateOne({ _id: userId }, { $set: { lastSeen: new Date() } })
    });

    socket.on("send-last-read-msg", ({ chatId, receiverId }) => {
      // console.log("slrm recived :: ", { chatId, receiverId })
      io.in(receiverId).emit("update-last-read-msg", { chatId })
      // console.log("ulrm :: ", { chatId })
    })

    socket.on("read-unread-msgs", ({ chatId, messageIds, receiverId }) => {
      // console.log("rum recived :: ", { chatId, messageIds })
      io.in(receiverId).emit("consume-read-unread-msgs", { chatId, messageIds })
      // console.log("rum sent")
    })

    socket.on("subscribe-online-status", ({ requesterId, targetUserId }) => {
      // console.log("1 :: ", users);
      let isOnline = () => {
        // console.log("users[targetUserId] :: ", users[targetUserId], " ::: ", { requesterId, targetUserId })
        // add targetd in values arr of userId
        users[requesterId] = users[requesterId] ? [...users[requesterId], targetUserId] : [targetUserId];

        console.log(users)

        // add in friend key in obj 2
        usersWatchingMe[targetUserId] = usersWatchingMe[targetUserId] ? !usersWatchingMe[targetUserId].includes(requesterId) ? [...usersWatchingMe[targetUserId], requesterId] : [...usersWatchingMe[targetUserId]] : [requesterId];

        console.log(usersWatchingMe)
        return Boolean(users[targetUserId] ? true : false);
      };
      // console.log("when subcribed to friend online status: ", users, { isOnline: isOnline() })

      io.in(requesterId).emit("consume-subscribe-online-status", { isOnline: isOnline() })
    });

    socket.on("unsubscribe-online-status", ({ requesterId, targetUserId }) => {

      // remove ids of friend from my list of array of ids
      let temp = { ...users, [requesterId]: users[requesterId].filter((userId) => userId !== targetUserId) }
      users = temp;

      // remove my id from friends array if ids
      let temp1 = { ...usersWatchingMe, [targetUserId]: usersWatchingMe[targetUserId]?.filter((userId) => userId !== requesterId) ?? [] }
      usersWatchingMe = temp1;

      // console.log("2 :: ", users);
      // let isOnline = () => {
      //   if (users[targetUserId]) {
      //     let temp = users[targetUserId].filter((id) => id !== requesterId)
      //     users[targetUserId] = temp;
      //   }
      //   return false;
      // };
      // console.log("when UN-subcribed to friend online status: ", users, { isOnline: isOnline() })
    });

    socket.on("sendMessage", ({ senderId, receiverId, message, chatId, isRead }) => {
      // console.log("message recieved :: ", { senderId, receiverId, message, chatId })
      io.in(receiverId).emit("getMessage", {
        senderId,
        message,
        chatId,
        isRead
      });
    });

    socket?.on("show-not-read-count", ({ unreadMsgCount, receiverId, chatId }) => {
console.log("show-not-read-count :: ", { unreadMsgCount, receiverId, chatId })
      io.in(receiverId).emit("consume-show-not-read-count", { unreadMsgCount, receiverId, chatId })
    })

  });
};

export default initializeSocket;



// {
//   "omkar":["ashish"],
// }