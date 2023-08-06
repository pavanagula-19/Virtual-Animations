const express = require('express');
const app = express();
const http = require('http');
const socket = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const liveUserModel = require('./liveUserModel');

app.use(express.urlencoded({ extended: true }));
app.use(cors());

const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.get('/liveusers', async function (req, res) {
  try {
    const data = await liveUserModel.find();
    res.json({ status: true, data: data });
  } catch (err) {
    res.status(500).json({ status: false, error: 'Internal Server Error' });
  }
});

mongoose.connect("mongodb+srv://pavanagulla19:Pavan123@cluster0.fk8o0si.mongodb.net/chatHistory1", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(function () {
    console.log("mongodb connected");

    io.on('connection', function (socket) {
      let name2;

      socket.on('message', function (msg) {
        socket.broadcast.emit('message', msg);

        const dateTime = new Date();
        const formattedDate = dateTime.toLocaleDateString('en-IN');
        const formattedTime = dateTime.toLocaleTimeString('en-IN');

        const data = {
          name: msg.user,
          message: msg.message,
          dateTime: formattedDate + " " + formattedTime,
        };
        console.log(data);
      });

      socket.on('info', async function (info) {
        console.log('new connection....');
        await liveUserModel.create(info);
        name2 = info.name;
        socket.broadcast.emit('info', info);
      });

      socket.on('disconnect', async () => {
        console.log('Disconnected from Socket.IO server');
        console.log(name2);

        await liveUserModel.deleteMany({ name: name2 });
        socket.broadcast.emit('disName', name2);
      });
    });
  })
  .catch(function (err) {
    console.error("Error connecting to MongoDB:", err);
  });

const PORT = 8080;
server.listen(PORT, function () {
  console.log("Server is running on port", PORT);
});
