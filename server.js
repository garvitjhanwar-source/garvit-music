const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors'); // Added for safety
const app = express();

app.use(express.static('public'));
app.use(cors());

// THE "STEALTH" ID CARD (Makes us look like Chrome on Windows)
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Origin': 'https://www.youtube.com',
    'Referer': 'https://www.youtube.com/'
};

// MASSIVE LIST OF SERVERS (If one blocks us, we try the next)
const API_LIST = [
    "https://pipedapi.kavin.rocks",
    "https://api-piped.mha.fi",
    "https://pipedapi.tokhmi.xyz",
    "https://piped-api.garudalinux.org",
    "https://api.piped.spot.im",
    "https://pipedapi.drgns.space",
    "https://pa.il.ax",
    "https://p.euten.eu",
    "https://piped-api.lunar.icu"
];

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "No query provided" });

    console.log(`[Server] Searching for: "${query}"`);

    // Try every server in the list until one works
    for (const api of API_LIST) {
        try {
            const url = `${api}/search?q=${encodeURIComponent(query)}&filter=music_songs`;
            
            // Send the "Stealth" headers
            const response = await axios.get(url, { 
                headers: HEADERS,
                timeout: 4000 // If a server takes >4 seconds, skip it
            });
            
            if (response.data && response.data.items && response.data.items.length > 0) {
                console.log(`✅ Success with ${api}`);
                return res.json(response.data);
            }
        } catch (error) {
            console.log(`❌ Failed ${api} - ${error.message}`);
            // Loop continues to next server automatically
        }
    }

    console.log("⚠️ All servers failed.");
    res.status(503).json({ error: "All music servers are busy. Please try again in 10 seconds." });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Garvit Music Server running on port ${PORT}`));