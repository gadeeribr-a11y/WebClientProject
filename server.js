const express = require("express");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const USERS_FILE = "./server/users.json";

// ---------- helpers ----------
function readUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ---------- REGISTER ----------
app.post("/api/register", (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: "User already exists" });
    }

    const newUser = {
        id: Date.now(),
        username,
        password
    };

    users.push(newUser);
    saveUsers(users);

    res.json(newUser);
});

// ---------- LOGIN ----------
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();

    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json(user);
});

// ---------- PLAYLISTS ----------
app.get("/api/playlists/:userId", (req, res) => {
    const file = `./server/playlists/${req.params.userId}.json`;
    if (!fs.existsSync(file)) return res.json({});
    res.json(JSON.parse(fs.readFileSync(file)));
});

app.post("/api/playlists/:userId", (req, res) => {
    const file = `./server/playlists/${req.params.userId}.json`;
    fs.writeFileSync(file, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
});

// ---------- MP3 UPLOAD ----------
const upload = multer({ dest: "server/uploads/" });

app.post("/api/upload/:userId", upload.single("mp3"), (req, res) => {
    res.json({
        file: req.file.filename,
        name: req.file.originalname
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
