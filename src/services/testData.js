import { youtubeSearchCache, booksSearchCache } from './cacheService';

const TEST_VIDEOS = [
  {
    id: 'v1',
    title: 'JavaScript Fundamentals',
    url: 'https://youtube.com/watch?v=js-fundamentals',
    thumbnail: '/assets/video.jpg',
    description: 'Learn the basics of JavaScript programming',
    category: 'programming',
    tags: ['javascript', 'web development', 'programming'],
    type: 'youtube',
    timestamp: Date.now() - 1000 * 60 * 60 * 2 // 2 hours ago
  },
  {
    id: 'v2',
    title: 'Python for Data Science',
    url: 'https://youtube.com/watch?v=python-data-science',
    thumbnail: '/assets/video.jpg',
    description: 'Introduction to Python for Data Science',
    category: 'programming',
    tags: ['python', 'data science', 'programming'],
    type: 'youtube',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 // 24 hours ago
  },
  {
    id: 'v3',
    title: 'Web Development Course',
    url: 'https://youtube.com/watch?v=web-dev-course',
    thumbnail: '/assets/video.jpg',
    description: 'Complete web development course',
    category: 'programming',
    tags: ['web development', 'javascript', 'html', 'css'],
    type: 'youtube',
    timestamp: Date.now() - 1000 * 60 * 60 * 48 // 48 hours ago
  }
];

const TEST_BOOKS = [
  {
    id: 'b1',
    title: 'Learning Python',
    authors: ['Mark Lutz'],
    infoLink: 'https://books.google.com/learning-python',
    thumbnail: '/assets/book.jpg',
    category: 'programming',
    tags: ['python', 'programming', 'learning'],
    type: 'book',
    timestamp: Date.now() - 1000 * 60 * 60 * 12 // 12 hours ago
  },
  {
    id: 'b2',
    title: 'JavaScript - The Good Parts',
    authors: ['Douglas Crockford'],
    infoLink: 'https://books.google.com/javascript-good-parts',
    thumbnail: '/assets/book.jpg',
    category: 'programming',
    tags: ['javascript', 'programming', 'web development'],
    type: 'book',
    timestamp: Date.now() - 1000 * 60 * 60 * 36 // 36 hours ago
  }
];

const TEST_ARTICLES = [
  {
    id: 'a1',
    title: 'Modern JavaScript Features',
    url: 'https://example.com/js-features',
    thumbnail: '/assets/article.jpg',
    description: 'Overview of modern JavaScript features',
    category: 'programming',
    tags: ['javascript', 'web development', 'es6'],
    type: 'article',
    timestamp: Date.now() - 1000 * 60 * 60 * 6 // 6 hours ago
  }
];

const TEST_DOCUMENTATION = [
  {
    id: 'd1',
    title: 'React Documentation',
    url: 'https://reactjs.org/docs',
    thumbnail: '/assets/documentation.jpg',
    description: 'Official React documentation',
    category: 'programming',
    tags: ['react', 'javascript', 'web development'],
    type: 'documentation',
    timestamp: Date.now() - 1000 * 60 * 60 * 18 // 18 hours ago
  }
];

export const populateTestData = () => {
  const allContent = [
    ...TEST_VIDEOS,
    ...TEST_BOOKS,
    ...TEST_ARTICLES,
    ...TEST_DOCUMENTATION
  ].sort((a, b) => b.timestamp - a.timestamp);

  // Add all content to recent activity in chronological order
  allContent.forEach((item, index) => {
    setTimeout(() => {
      if (item.type === 'youtube') {
        youtubeSearchCache.addToRecent({
          ...item,
          type: 'youtube'
        });
      } else if (item.type === 'book') {
        booksSearchCache.addToRecent({
          ...item,
          type: 'book'
        });
      } else {
        // Add other types directly to recent activity
        const activity = {
          id: item.id,
          title: item.title,
          type: item.type,
          url: item.url,
          thumbnail: item.thumbnail,
          description: item.description,
          category: item.category,
          tags: item.tags,
          timestamp: item.timestamp
        };
        localStorage.setItem(`studysync_activity_${item.id}`, JSON.stringify(activity));
      }
    }, index * 100); // Small delay between each to ensure order
  });

  // Add some items as bookmarks
  const bookmarkedItems = [TEST_VIDEOS[0], TEST_BOOKS[0], TEST_DOCUMENTATION[0]];
  bookmarkedItems.forEach(item => {
    const bookmark = {
      id: item.id,
      title: item.title,
      url: item.url,
      thumbnail: item.thumbnail,
      description: item.description,
      type: item.type,
      category: item.category,
      tags: item.tags,
      dateAdded: new Date(item.timestamp).toISOString()
    };
    localStorage.setItem(`studysync_bookmark_${item.id}`, JSON.stringify(bookmark));
  });

  console.log('Test data populated successfully');
};

export const clearTestData = () => {
  localStorage.clear();
  console.log('Test data cleared successfully');
}; 