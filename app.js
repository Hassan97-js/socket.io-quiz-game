// express
const express = require("express");
const app = express();
// node
const http = require("http");
const server = http.createServer(app);
const path = require("path");
// Socket.io
const { Server } = require("socket.io");
const io = new Server(server);

// middlewares
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "index.html"), err => {
    if (err) {
      console.error(err.message);
      res.status(404).send("<h1>404: Page not found</h1>");
    } else {
      console.log("Sent the index.html file");
    }
  });
});

io.on("connection", socket => {
  console.log(`${socket.id} connected`);
  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
  });
});

app.all("*", (req, res) => {
  res.status(404).send("<h1>404: Page not found</h1>");
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
