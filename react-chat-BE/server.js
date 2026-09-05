const express = require('express');
const http = require('http');
const cors = require('cors');
const app = express();
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
         origin: "http://localhost:5173",
         methods: ["GET", "POST"]
    }
});
io.on("connection",(socket)=>{
      console.log("User connected:", socket.id);
      socket.on("join_chat",(username)=>{
            console.log(`${username} joined the chat`);
     socket.broadcast.emit(
      "receive_message",
      {
        username: "System",
        message: `${username} joined the chat`
      }
    );
      });
      socket.on("send_message",(data)=>{
        console.log("Message:", data);
        io.emit("receive_message",data);
});
socket.on("disconnect",()=>{
    console.log("User disconnected:", socket.id);
})
});
app.get("/", (req, res) => {
  res.send("Chat server is running");
});
server.listen(5000, () => {
  console.log("Server running on port 5000");
});