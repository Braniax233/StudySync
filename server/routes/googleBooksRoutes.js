const express = require('express');
const router = express.Router();
const { searchGoogleBooks } = require('../controllers/googleBooksController');

router.get('/search', searchGoogleBooks);

module.exports = router;
