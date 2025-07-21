const express = require("express")
const cors = require("cors")
const crypto = require("crypto")
const bcrypt = require("bcryptjs")
const path = require("path")
const socketIo = require("socket.io")
const http = require("http")
const bodyParser = require("body-parser")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const randomstring = require("randomstring")
const compression = require("compression")

const pool = require('./server');


const app = express()
const server = http.createServer(app)
const io = socketIo(server)
app.use(cors("*"))
app.use(express.json())
app.use(cookieParser())
app.use(compression({
    threshold: 1024,
    level: 6,
    filter: (req, res) => {
      if (req.headers['x-no-compression']){
        return false;
      }
      return compression.filter(req, res);
    }
}))

app.post('/register', async(req, res) => {
    console.log(req.body);
    const { email, role, password } = req.body;
    res.status(200).json({
        status: true,
        email: email,
        role: role,
        password: password
    })
})

server.listen(5001, () => {
    console.log(`Status: Running with port 5001`);
});
