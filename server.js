const express = require('express');
const path = require('path');
const app = express();

// 1. Serve the frontend files
app.use(express.static('public'));

// 2. The List of Music Servers (The "Engines")
const API_LIST = [
    "https://pipedapi.kavin.rocks",
    "https://api-piped.mha.fi",
    "https://pipedapi.tokhmi.xyz",
    "https://kavin.rocks",
    "https://pipedapi.drgns.space"
];

// 3. The New Search Endpoint
app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query required" });

    console.log(`[Server] Searching for: ${query}`);

    // Try servers one by one until one works
    for (const api of API_LIST) {
        try {
            console.log(`Trying ${api}...`);
            const url = `${api}/search?q=${encodeURIComponent(query)}&filter=music_songs`;
            
            // Native Node.js fetch (Requires Node v18+)
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`Success with ${api}`);
                return res.json(data); // Send data back to your website
            }
        } catch (error) {
            console.error(`Failed ${api}: ${error.message}`);
            // If it fails, the loop just continues to the next server
        }
    }

    // If all fail
    res.status(500).json({ error: "All music servers are busy. Try again." });
});

// 4. Handle all other requests (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Garvit Music Server running on port ${PORT}`));