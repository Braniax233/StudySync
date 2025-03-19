const { searchYouTube } = require('../youtubeService');

const searchVideos = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        console.log('Received search request for:', query);
        
        // Add CORS headers
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        
        const videos = await searchYouTube(query);
        console.log('Search completed successfully, returning', videos.length, 'results');
        res.json({ success: true, data: videos });
    } catch (error) {
        console.error('Controller error:', {
            message: error.message,
            stack: error.stack && error.stack.split('\n').slice(0, 3).join('\n'),
            code: error.code
        });
        res.status(500).json({ 
            error: 'Failed to search YouTube videos',
            details: error.message,
            code: error.code
        });
    }
};

module.exports = {
    searchVideos
};
