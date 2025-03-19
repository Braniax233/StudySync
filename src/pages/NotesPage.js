import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navigation/Navbar';
import NoteEditor from '../components/Notes/NoteEditor';
import NotesList from '../components/Notes/NotesList';
import { notesService } from '../services/dataService';
import '../styles/NotesPage.css';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load notes from the data service
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await notesService.getNotes();
        
        if (response && response.success) {
          const loadedNotes = response.data;
          if (Array.isArray(loadedNotes)) {
            setNotes(loadedNotes);
            
            // Set the first note as active by default
            if (loadedNotes.length > 0 && !activeNote) {
              setActiveNote(loadedNotes[0]);
            }
          } else {
            console.error('Notes data is not an array:', loadedNotes);
            setNotes([]);
          }
        } else {
          console.error('Error loading notes:', response);
          setNotes([]);
        }
      } catch (error) {
        console.error('Error loading notes:', error);
        setError('Failed to load notes. Please try again later.');
        setNotes([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotes();
  }, []);

  const createNewNote = async () => {
    try {
      setError(null);
      const newNote = {
        title: 'Untitled Note',
        content: '', // Ensure content is at least an empty string
        tags: [],
        isShared: false
      };
      
      console.log('Creating new note:', newNote);
      const response = await notesService.createNote(newNote);
      console.log('Create note response:', response);
      
      if (response && response.success) {
        const createdNote = response.data;
        console.log('Created note:', createdNote);
        setNotes(prevNotes => [createdNote, ...prevNotes]);
        setActiveNote(createdNote);
      } else {
        console.error('Error creating note - unexpected response format:', response);
        setError(`Failed to create note: ${response?.message || 'Please try again later.'}`);
      }
    } catch (error) {
      console.error('Error creating note:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      let errorMessage = 'Failed to create note. Please try again later.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (error.response?.data?.message) {
        errorMessage = `Failed to create note: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `Failed to create note: ${error.message}`;
      }
      
      setError(errorMessage);
    }
  };

  const updateNote = async (updatedNote) => {
    try {
      const response = await notesService.updateNote(updatedNote);
      
      if (response && response.success) {
        const savedNote = response.data;
        
        const updatedNotes = notes.map(note => 
          note._id === savedNote._id ? savedNote : note
        );
        
        setNotes(updatedNotes);
        setActiveNote(savedNote);
      } else {
        console.error('Error updating note:', response);
      }
    } catch (error) {
      console.error('Error updating note:', error);
      setError('Failed to update note. Please try again later.');
    }
  };

  const deleteNote = async (noteId) => {
    try {
      console.log('Attempting to delete note with ID:', noteId);
      const response = await notesService.deleteNote(noteId);
      
      if (response && response.success) {
        console.log('Note deleted successfully:', noteId);
        const updatedNotes = notes.filter(note => note._id !== noteId);
        setNotes(updatedNotes);
        
        if (activeNote && activeNote._id === noteId) {
          setActiveNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
        }
      } else {
        console.error('Error deleting note - unexpected response format:', response);
        setError(`Failed to delete note: ${response?.message || 'Please try again later.'}`);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      let errorMessage = 'Failed to delete note. Please try again later.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (error.response?.data?.message) {
        errorMessage = `Failed to delete note: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `Failed to delete note: ${error.message}`;
      }
      
      setError(errorMessage);
    }
  };

  const toggleShareNote = async (noteId) => {
    try {
      const response = await notesService.shareNote(noteId);
      
      if (response && response.success) {
        const updatedNote = response.data;
        
        const updatedNotes = notes.map(note => 
          note._id === noteId ? updatedNote : note
        );
        
        setNotes(updatedNotes);
        
        if (activeNote && activeNote._id === noteId) {
          setActiveNote(updatedNote);
        }
      } else {
        console.error('Error sharing note:', response);
      }
    } catch (error) {
      console.error('Error sharing note:', error);
      setError('Failed to share note. Please try again later.');
    }
  };

  const filteredNotes = notes.filter(note => {
    // Apply search filter
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply category filter
    const matchesFilter = filter === 'all' || 
                         (filter === 'shared' && note.isShared) ||
                         (filter === 'private' && !note.isShared);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="notes-page">
      <Navbar />
      
      <div className="notes-content">
        <div className="notes-header">
          <h1>My Notes</h1>
          <button className="new-note-button" onClick={createNewNote}>
            <i className="icon add-icon"></i>
            New Note
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="notes-container">
          <div className="notes-sidebar">
            <div className="notes-search">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="notes-filter">
              <button 
                className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Notes
              </button>
              <button 
                className={`filter-button ${filter === 'shared' ? 'active' : ''}`}
                onClick={() => setFilter('shared')}
              >
                Shared
              </button>
              <button 
                className={`filter-button ${filter === 'private' ? 'active' : ''}`}
                onClick={() => setFilter('private')}
              >
                Private
              </button>
            </div>
            
            {loading ? (
              <div className="loading-indicator">Loading notes...</div>
            ) : (
              <NotesList 
                notes={filteredNotes} 
                activeNoteId={activeNote ? activeNote._id : null}
                onSelectNote={(note) => setActiveNote(note)}
                onDeleteNote={deleteNote}
                onToggleShare={toggleShareNote}
              />
            )}
          </div>
          
          <div className="notes-editor-container">
            {loading ? (
              <div className="loading-indicator">Loading...</div>
            ) : activeNote ? (
              <NoteEditor 
                note={activeNote} 
                onUpdateNote={updateNote}
                onToggleShare={() => toggleShareNote(activeNote._id)}
              />
            ) : (
              <div className="empty-editor">
                <p>Select a note or create a new one to get started</p>
                <button className="new-note-button" onClick={createNewNote}>
                  <i className="icon add-icon"></i>
                  New Note
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
