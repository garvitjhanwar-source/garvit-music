/* REPLACE ALL CODE IN server.js WITH THIS */
const express = require('express');
const play = require('play-dl'); 
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json([]); // Return empty if no query

    try {
        console.log(`Searching for: ${query}`);
        
        // 1. Search YouTube
        const results = await play.search(query, { 
            limit: 10,
            source: { youtube: "video" } 
        });

        // 2. Map data safely (Prevents crashes if data is missing)
        const songs = results.map(video => {
            // Check if thumbnails exist
            let coverImage = "https://via.placeholder.com/150"; // Default image
            if (video.thumbnails && video.thumbnails.length > 0) {
                coverImage = video.thumbnails[0].url;
            }

            return {
                id: video.id, // YouTube Video ID
                title: video.title || "Unknown Title",
                artist: video.channel ? video.channel.name : "Unknown Artist",
                cover: coverImage,
                duration: video.durationRaw || ""
            };
        });

        res.json(songs);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Search failed" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});