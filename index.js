const io = require("socket.io")(8900, {
    cors: {
        origin: ["http://localhost:3000", "https://pro-man-4cb6f.web.app"],
    },
});

let users = [];
let conversations = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};

const activeConversation = (conversationId, socketId, userId) => {
    // console.log(conversations, 16, conversationId, socketId);
    conversations = conversations.filter(function (obj) {
        return obj.userId !== userId;
    })
    // console.log(conversations, 19,);
    !conversations.some((c) => c.conversationId === conversationId && c.socketId === socketId) &&
        conversations.push({ conversationId, socketId, userId });
    // console.log(conversations, 21);

};
// console.log(conversations, 21);
const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const removeConversation = (socketId) => {
    conversations = conversations.filter((conversation) => conversation.socketId !== socketId);
};

// console.log(conversations, 24);

const getUser = (userId) => {
    // console.log(users, 33);
    if (userId) {
        return users.filter((user) => userId?.indexOf(user?.userId) !== -1);
    }
};

const getConversation = (conversationId, userId) => {
    // console.log(conversations, 46);
    if (conversationId) {
        return conversations.filter((conversation) => conversationId?.indexOf(conversation?.conversationId) !== -1 && conversation.userId !== userId);
    }
};

io.on("connection", (socket) => {
    //when ceonnect
    // console.log("a user connected.");

    //take userId and socketId from user
    socket.on("addUser", (userId) => {
        // console.log('addUser socket on', userId);
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });

    socket.on("activeConversation", ({ currentChatId, userId }) => {
        // console.log(currentChatId, 64);
        activeConversation(currentChatId, socket.id, userId)
        io.emit('getActiveConversations', conversations)
    })

    //send and get message
    socket.on("sendMessage", ({ senderId, text, conversationId }) => {
        // console.log(conversationId);
        const conversation = getConversation(conversationId, senderId);
        // console.log(conversation, 72);
        conversation.map(({ socketId }) => {
            io.to(socketId).emit("getMessage", {
                senderId,
                text,
                conversationId
            });
        })

    });

    //when disconnect
    socket.on("disconnect", () => {
        // console.log("a user disconnected!");
        removeUser(socket.id);
        removeConversation(socket.id);
        io.emit("getUsers", users);
    });
});