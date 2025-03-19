/**
 * Data Service for StudySync
 * Handles data persistence using the backend API
 * Maintains compatibility with the existing interface
 */

import { 
  notesAPI, 
  eventsAPI, 
  resourcesAPI, 
  bookmarksAPI, 
  authAPI 
} from './apiService';

// Constants for localStorage keys (kept for fallback)
const STORAGE_KEYS = {
  NOTES: 'studysync_notes',
  EVENTS: 'studysync_events',
  RESOURCES: 'studysync_resources',
  BOOKMARKS: 'studysync_bookmarks',
  USER_PREFERENCES: 'studysync_user_preferences'
};

// Sample data for initial setup or fallback
const SAMPLE_DATA = {
  notes: [
    {
      id: '1',
      title: 'Machine Learning Fundamentals',
      content: '# Machine Learning Fundamentals\n\n## Supervised Learning\n- Classification\n- Regression\n\n## Unsupervised Learning\n- Clustering\n- Dimensionality Reduction\n\n## Key Algorithms\n- Linear Regression\n- Decision Trees\n- Neural Networks',
      tags: ['ML', 'AI', 'Computer Science'],
      isShared: true,
      dateCreated: new Date(2025, 2, 1).toISOString(),
      dateModified: new Date(2025, 2, 3).toISOString()
    },
    {
      id: '2',
      title: 'React Hooks Cheatsheet',
      content: '# React Hooks Cheatsheet\n\n## useState\n```jsx\nconst [state, setState] = useState(initialValue);\n```\n\n## useEffect\n```jsx\nuseEffect(() => {\n  // Side effects here\n  return () => {\n    // Cleanup function\n  };\n}, [dependencies]);\n```\n\n## useContext\n```jsx\nconst value = useContext(MyContext);\n```',
      tags: ['React', 'JavaScript', 'Web Development'],
      isShared: false,
      dateCreated: new Date(2025, 1, 15).toISOString(),
      dateModified: new Date(2025, 1, 20).toISOString()
    },
    {
      id: '3',
      title: 'Study Plan for Final Exams',
      content: '# Study Plan for Final Exams\n\n## Week 1\n- Review lecture notes\n- Complete practice problems\n\n## Week 2\n- Focus on difficult topics\n- Form study group\n\n## Week 3\n- Mock exams\n- Final review',
      tags: ['Study', 'Planning'],
      isShared: false,
      dateCreated: new Date(2025, 2, 2).toISOString(),
      dateModified: new Date(2025, 2, 2).toISOString()
    }
  ],
  events: [
    { 
      id: '1',
      title: 'Study Session: Machine Learning',
      date: new Date(2025, 2, 5).toISOString(),
      startTime: '14:00',
      endTime: '16:00',
      location: 'Library - Room 204',
      description: 'Group study session focusing on neural networks and deep learning concepts.'
    },
    { 
      id: '2',
      title: 'Project Meeting',
      date: new Date(2025, 2, 7).toISOString(),
      startTime: '10:00',
      endTime: '11:30',
      location: 'Online - Zoom',
      description: 'Weekly team meeting to discuss project progress and next steps.'
    },
    { 
      id: '3',
      title: 'Database Exam',
      date: new Date(2025, 2, 10).toISOString(),
      startTime: '09:00',
      endTime: '11:00',
      location: 'Main Hall',
      description: 'Final exam covering SQL, NoSQL, and database design principles.'
    }
  ],
  resources: [
    {
      id: '1',
      title: 'Introduction to Machine Learning',
      type: 'course',
      url: 'https://www.coursera.org/learn/machine-learning',
      description: 'Comprehensive course covering machine learning fundamentals',
      tags: ['ML', 'AI', 'Beginner']
    },
    {
      id: '2',
      title: 'React Documentation',
      type: 'documentation',
      url: 'https://reactjs.org/docs/getting-started.html',
      description: 'Official React documentation',
      tags: ['React', 'JavaScript', 'Web Development']
    },
    {
      id: '3',
      title: 'Effective Study Techniques',
      type: 'article',
      url: 'https://www.example.com/study-techniques',
      description: 'Research-based study methods for better retention',
      tags: ['Study', 'Learning', 'Productivity']
    }
  ],
  bookmarks: [
    {
      id: '1',
      title: 'Advanced Machine Learning Algorithms',
      url: 'https://www.example.com/advanced-ml',
      category: 'Article',
      dateAdded: new Date(2025, 2, 1).toISOString()
    },
    {
      id: '2',
      title: 'React Performance Optimization',
      url: 'https://www.example.com/react-performance',
      category: 'Video',
      dateAdded: new Date(2025, 1, 28).toISOString()
    },
    {
      id: '3',
      title: 'Database Design Patterns',
      url: 'https://www.example.com/db-patterns',
      category: 'Book',
      dateAdded: new Date(2025, 1, 20).toISOString()
    }
  ]
};

// Helper function to initialize data if API fails
const initializeData = (key, sampleData) => {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(sampleData));
  }
};

// Notes Service
export const notesService = {
  getNotes: async () => {
    try {
      const response = await notesAPI.getNotes();
      return response.data;
    } catch (error) {
      console.error('Error fetching notes from API:', error);
      // Fallback to localStorage only if we're not authenticated
      if (error.response && error.response.status === 401) {
        initializeData(STORAGE_KEYS.NOTES, SAMPLE_DATA.notes);
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES));
      }
      return [];
    }
  },
  
  getNote: async (id) => {
    try {
      const response = await notesAPI.getNote(id);
      return response.data;
    } catch (error) {
      console.error(`Error fetching note ${id} from API:`, error);
      // Fallback to localStorage only if we're not authenticated
      if (error.response && error.response.status === 401) {
        const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES)) || [];
        return notes.find(note => note.id === id);
      }
      return null;
    }
  },
  
  createNote: async (note) => {
    try {
      console.log('Sending note to API:', note);
      const token = localStorage.getItem('studysync_token');
      console.log('Authentication token available:', !!token);
      
      if (!token) {
        console.error('No authentication token found');
        throw new Error('Authentication required. Please log in.');
      }
      
      const response = await notesAPI.createNote(note);
      console.log('API response:', response);
      
      if (!response || !response.data) {
        throw new Error('Invalid response from API');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating note via API:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      // Fallback to localStorage only if we're not authenticated
      if (error.response && error.response.status === 401) {
        console.log('Authentication error, falling back to localStorage');
        const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES)) || [];
        const newNote = {
          ...note,
          _id: Date.now().toString(),
          dateCreated: new Date().toISOString(),
          dateModified: new Date().toISOString()
        };
        
        const updatedNotes = [...notes, newNote];
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes));
        
        return {
          success: true,
          data: newNote
        };
      }
      
      // Re-throw the error to be handled by the caller
      throw error;
    }
  },
  
  updateNote: async (updatedNote) => {
    try {
      const response = await notesAPI.updateNote(updatedNote._id, updatedNote);
      return response.data;
    } catch (error) {
      console.error(`Error updating note ${updatedNote._id} via API:`, error);
      // Fallback to localStorage only if we're not authenticated
      if (error.response && error.response.status === 401) {
        const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES)) || [];
        const updatedNotes = notes.map(note => 
          note._id === updatedNote._id 
            ? { ...updatedNote, dateModified: new Date().toISOString() } 
            : note
        );
        
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes));
        
        return { 
          success: true,
          data: { ...updatedNote, dateModified: new Date().toISOString() }
        };
      }
      throw error;
    }
  },
  
  deleteNote: async (id) => {
    try {
      const response = await notesAPI.deleteNote(id);
      return response.data;
    } catch (error) {
      console.error(`Error deleting note ${id} via API:`, error);
      // Fallback to localStorage only if we're not authenticated
      if (error.response && error.response.status === 401) {
        const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES)) || [];
        const updatedNotes = notes.filter(note => note._id !== id);
        
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes));
        
        return {
          success: true,
          data: {}
        };
      }
      throw error;
    }
  },
  
  shareNote: async (id) => {
    try {
      const response = await notesAPI.shareNote(id);
      return response.data;
    } catch (error) {
      console.error(`Error sharing note ${id} via API:`, error);
      // Fallback to localStorage only if we're not authenticated
      if (error.response && error.response.status === 401) {
        const notes = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES)) || [];
        const noteToUpdate = notes.find(note => note._id === id);
        
        if (!noteToUpdate) {
          throw new Error('Note not found');
        }
        
        const updatedNote = { ...noteToUpdate, isShared: !noteToUpdate.isShared };
        const updatedNotes = notes.map(note => note._id === id ? updatedNote : note);
        
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes));
        
        return {
          success: true,
          data: updatedNote
        };
      }
      throw error;
    }
  }
};

// Events Service
export const eventsService = {
  getEvents: async () => {
    try {
      const response = await eventsAPI.getEvents();
      return response.data;
    } catch (error) {
      console.error('Error fetching events from API:', error);
      // Fallback to localStorage
      initializeData(STORAGE_KEYS.EVENTS, SAMPLE_DATA.events);
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS));
    }
  },
  
  getEvent: async (id) => {
    try {
      const response = await eventsAPI.getEvent(id);
      return response.data;
    } catch (error) {
      console.error(`Error fetching event ${id} from API:`, error);
      // Fallback to localStorage
      const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];
      return events.find(event => event.id === id);
    }
  },
  
  getEventsByDate: async (date) => {
    try {
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const response = await eventsAPI.getEventsByDate(formattedDate);
      return response.data;
    } catch (error) {
      console.error(`Error fetching events for date ${date} from API:`, error);
      // Fallback to localStorage
      const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];
      const targetDate = new Date(date);
      
      // Compare only the date part (year, month, day)
      return events.filter(event => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getFullYear() === targetDate.getFullYear() &&
          eventDate.getMonth() === targetDate.getMonth() &&
          eventDate.getDate() === targetDate.getDate()
        );
      });
    }
  },
  
  createEvent: async (event) => {
    try {
      const response = await eventsAPI.createEvent(event);
      return response.data;
    } catch (error) {
      console.error('Error creating event via API:', error);
      // Fallback to localStorage
      const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];
      const newEvent = {
        ...event,
        id: Date.now().toString()
      };
      
      const updatedEvents = [...events, newEvent];
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
      
      return newEvent;
    }
  },
  
  updateEvent: async (updatedEvent) => {
    try {
      const response = await eventsAPI.updateEvent(updatedEvent.id, updatedEvent);
      return response.data;
    } catch (error) {
      console.error(`Error updating event ${updatedEvent.id} via API:`, error);
      // Fallback to localStorage
      const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];
      const updatedEvents = events.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      );
      
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
      return updatedEvent;
    }
  },
  
  deleteEvent: async (id) => {
    try {
      await eventsAPI.deleteEvent(id);
      return true;
    } catch (error) {
      console.error(`Error deleting event ${id} via API:`, error);
      // Fallback to localStorage
      const events = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];
      const updatedEvents = events.filter(event => event.id !== id);
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
      return true;
    }
  }
};

// Resources Service
export const resourcesService = {
  getResources: async () => {
    try {
      const response = await resourcesAPI.getResources();
      return response.data;
    } catch (error) {
      console.error('Error fetching resources from API:', error);
      // Fallback to localStorage
      initializeData(STORAGE_KEYS.RESOURCES, SAMPLE_DATA.resources);
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESOURCES));
    }
  },
  
  addResource: async (resource) => {
    try {
      const response = await resourcesAPI.createResource(resource);
      return response.data;
    } catch (error) {
      console.error('Error creating resource via API:', error);
      // Fallback to localStorage
      const resources = JSON.parse(localStorage.getItem(STORAGE_KEYS.RESOURCES)) || [];
      const newResource = {
        ...resource,
        id: Date.now().toString(),
        dateAdded: new Date().toISOString()
      };
      
      const updatedResources = [...resources, newResource];
      localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(updatedResources));
      
      return newResource;
    }
  }
};

// Bookmarks Service
export const bookmarksService = {
  getBookmarks: async () => {
    try {
      const response = await bookmarksAPI.getBookmarks();
      return response.data;
    } catch (error) {
      console.error('Error fetching bookmarks from API:', error);
      // Fallback to localStorage
      initializeData(STORAGE_KEYS.BOOKMARKS, SAMPLE_DATA.bookmarks);
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS));
    }
  },
  
  addBookmark: async (bookmark) => {
    try {
      const response = await bookmarksAPI.createBookmark(bookmark);
      return response.data;
    } catch (error) {
      console.error('Error creating bookmark via API:', error);
      // Fallback to localStorage
      const bookmarks = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS)) || [];
      const newBookmark = {
        ...bookmark,
        id: Date.now().toString(),
        dateAdded: new Date().toISOString()
      };
      
      const updatedBookmarks = [...bookmarks, newBookmark];
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updatedBookmarks));
      
      return newBookmark;
    }
  },
  
  deleteBookmark: async (id) => {
    try {
      await bookmarksAPI.deleteBookmark(id);
      return true;
    } catch (error) {
      console.error(`Error deleting bookmark ${id} via API:`, error);
      // Fallback to localStorage
      const bookmarks = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKMARKS)) || [];
      const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== id);
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updatedBookmarks));
      return true;
    }
  }
};

// User Preferences Service
export const userPreferencesService = {
  getPreferences: async () => {
    try {
      const user = authAPI.getCurrentUser();
      if (user && user.preferences) {
        return user.preferences;
      }
      
      // If no user or no preferences, use default
      const defaultPreferences = {
        theme: 'dark',
        notifications: true,
        language: 'en',
        fontSize: 'medium',
        dashboardLayout: 'grid'
      };
      
      return defaultPreferences;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      // Fallback to localStorage
      const defaultPreferences = {
        theme: 'dark',
        notifications: true,
        language: 'en',
        fontSize: 'medium',
        dashboardLayout: 'grid'
      };
      
      if (!localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)) {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(defaultPreferences));
      }
      
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES));
    }
  },
  
  updatePreferences: async (preferences) => {
    try {
      const user = authAPI.getCurrentUser();
      if (user) {
        const updatedUser = await authAPI.updateProfile({ preferences });
        return updatedUser.preferences;
      }
      
      // If no user, use localStorage
      const currentPreferences = await userPreferencesService.getPreferences();
      const updatedPreferences = { ...currentPreferences, ...preferences };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPreferences));
      return updatedPreferences;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      // Fallback to localStorage
      const currentPreferences = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)) || {};
      const updatedPreferences = { ...currentPreferences, ...preferences };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPreferences));
      return updatedPreferences;
    }
  }
};
