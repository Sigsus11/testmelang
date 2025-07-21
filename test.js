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

app.post('/register', async (req, res) => {
    try {
        const { name, email, role, password } = req.body;

        // Basic validations
        if (!name || !email || !role || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        if (role !== "Teacher" && role !== "Student") {
            return res.status(400).json({ message: "Student or Teacher!" });
        }

        const emailCheck = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const nameCheck = /^[A-Za-z][A-Za-z' -]{1,49}$/;

        if (!emailCheck.test(email)) {
            return res.status(400).json({ message: "Invalid email address." });
        }

        if (!nameCheck.test(name) || name.length < 3) {
            return res.status(400).json({ message: "Enter a valid name" });
        }

        // Check if name or email already exists
        const { rows } = await pool.query("SELECT name, email FROM user_signup WHERE name = $1 OR email = $2", [name, email]);
        const nameExists = rows.some(user => user.name === name);
        const emailExists = rows.some(user => user.email === email);

        if (nameExists || emailExists) {
            return res.status(409).json({ message: "Account already exists." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into user_signup
        await pool.query(
            `INSERT INTO user_signup (name, email, password, role, joined) VALUES ($1, $2, $3, $4, filename, filedata, mime, size, NOW())`,
            [name, email, hashedPassword, role, 6, 0, 0, 0]
        );

        // Get inserted user id
        const { rows: userRows } = await pool.query(
            `SELECT id, role FROM user_signup WHERE email = $1`,
            [email]
        );

        const userId = userRows[0].id;

        // Generate token
        const token = jwt.sign({ id: userId }, '3062bbb9e93bd5d98730960abf351353e3bf6cb374339a037d5f55fb04f353175be51fbfc3593e4b38adb4d748a5040a4eb27c16a1cd6641e570eb4a01832c36', { expiresIn: '7d' });

        // Set cookie
        res.cookie("access_token", token, {
            httpOnly: true,
            secure: false, // set to true if using HTTPS
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ status: true, role: role, token: token });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Error!" });
    }
});


server.listen(5001, () => {
    console.log(`Status: Running with port 5001`);
});
