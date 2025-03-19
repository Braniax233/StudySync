const { searchBooks } = require('../googleBooksService');

const searchGoogleBooks = async (req, res) => {
    try {
        const { query, maxResults = 10 } = req.query;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        console.log('Received Google Books search request for:', query);
        
        // Add CORS headers
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        
        const books = await searchBooks(query, parseInt(maxResults, 10));
        console.log('Search completed successfully, returning', books.length, 'results');
        res.json({ success: true, data: books });
    } catch (error) {
        console.error('Controller error:', {
            message: error.message,
            stack: error.stack && error.stack.split('\n').slice(0, 3).join('\n'),
            code: error.code
        });
        res.status(500).json({ 
            error: 'Failed to search Google Books',
            details: error.message,
            code: error.code
        });
    }
};

module.exports = {
    searchGoogleBooks
};
