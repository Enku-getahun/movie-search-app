// Load environment variables immediately at the very top
require('dotenv').config();

const express = require('express');
const path = require('path');

// Dynamically use node-fetch depending on your version.
//const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OMDB_API_KEY;

// Check to make sure the key is present on startup
if (!API_KEY) {
    console.error("CRITICAL ERROR: OMDB_API_KEY is missing in your environment!");
    process.exit(1);
}

// Serve static front-end assets cleanly
app.use(express.static(path.join(__dirname, 'public')));

// Secure server-side routing bridge for movie lookups
app.get('/api/movie', async (req, res) => {
    try {
        const movieTitle = req.query.title;
        if (!movieTitle) {
            return res.status(400).json({ Response: "False", Error: "No movie title provided." });
        }

        const omdbUrl = `http://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(movieTitle)}`;
        const apiResponse = await globalThis.fetch(omdbUrl);
        
        if (!apiResponse.ok) {
            return res.status(apiResponse.status).json({ Response: "False", Error: "API connection failed." });
        }

        const data = await apiResponse.json();
        res.json(data);
    } catch (error) {
        console.error("Backend Routing Error:", error);
        res.status(500).json({ Response: "False", Error: "Internal server error." });
    }
});

// Fallback path handler to redirect users smoothly back to your main UI page
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Production server running smoothly on port ${PORT}`);
});
