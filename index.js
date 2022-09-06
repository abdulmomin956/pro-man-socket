const io = require("socket.io")(8900, {
    cors: {
        origin: ["http://localhost:3000", "https://pro-man-4cb6f.web.app"],
    },
});

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    // console.log(users);
    if (userId) {
        return users.filter((user) => userId?.indexOf(user?.userId) !== -1);
    }
};

io.on("connection", (socket) => {
    //when ceonnect
    // console.log("a user connected.");

    //take userId and socketId from user
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });

    //send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        // console.log(receiverId);
        const user = getUser(receiverId);
        // console.log(user);
        user.map(({ socketId }) => {
            io.to(socketId).emit("getMessage", {
                senderId,
                text,
            });
        })

    });

    //when disconnect
    socket.on("disconnect", () => {
        // console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});