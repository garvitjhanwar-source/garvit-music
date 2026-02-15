const express = require('express');
const mongoose = require('mongoose');
const YouTube = require('youtube-sr').default;
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json()); // Allow server to read JSON data
app.use(cors());
app.use(express.static('public'));

// --- DATABASE CONNECTION ---
// If no env variable, it crashes (We will set this in Render)
const MONGO_URI = process.env.MONGO_URI; 

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// --- USER SCHEMA (How we store data) ---
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: String,
    picture: String,
    playlists: { type: Object, default: {} } // Stores playlists like { "Favorites": [songs...] }
});
const User = mongoose.model('User', UserSchema);

// --- API ROUTES ---

// 1. LOGIN / SYNC USER
app.post('/api/login', async (req, res) => {
    const { email, name, picture } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            // Create new user if not found
            user = new User({ email, name, picture, playlists: {} });
            await user.save();
            console.log(`🆕 New user created: ${name}`);
        } else {
            console.log(`👋 Welcome back: ${name}`);
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. SAVE PLAYLISTS
app.post('/api/playlists', async (req, res) => {
    const { email, playlists } = req.body;
    try {
        await User.findOneAndUpdate({ email }, { playlists });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to save" });
    }
});

// 3. SEARCH (YouTube)
app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "No query" });
    try {
        const videos = await YouTube.search(query, { limit: 12, type: 'video', safeSearch: false });
        const formatted = videos.map(v => ({
            id: v.id,
            title: v.title,
            artist: v.channel ? v.channel.name : "Unknown",
            cover: v.thumbnail ? v.thumbnail.url : ""
        }));
        res.json({ items: formatted });
    } catch (err) {
        res.status(500).json({ error: "Search failed" });
    }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));