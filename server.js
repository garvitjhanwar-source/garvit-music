const express = require('express');
const YouTube = require('youtube-sr').default;
const path = require('path');
const cors = require('cors');
const app = express();

// Enable security and static files
app.use(cors());
app.use(express.static('public'));

// --- SEARCH ENDPOINT ---
app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "No query provided" });

    console.log(`[Server] Searching for: "${query}"`);

    try {
        // Search using the library (Bypasses API blocks)
        const videos = await YouTube.search(query, { 
            limit: 12, 
            type: 'video',
            safeSearch: false 
        });

        if (!videos || videos.length === 0) {
             return res.status(404).json({ error: "No results found" });
        }

        // Format data for the frontend
        const formattedResults = videos.map(video => ({
            id: video.id,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            title: video.title,
            uploaderName: video.channel ? video.channel.name : "Unknown Artist",
            thumbnail: video.thumbnail ? video.thumbnail.url : ""
        }));

        console.log(`✅ Found ${formattedResults.length} songs`);
        res.json({ items: formattedResults });

    } catch (error) {
        console.error(`❌ Search failed: ${error.message}`);
        res.status(500).json({ error: "Search failed. Please try again." });
    }
});

// Serve the frontend for all other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Garvit Music Server running on port ${PORT}`));