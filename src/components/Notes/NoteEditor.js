import React, { useState, useEffect } from 'react';
import './Notes.css';

const NoteEditor = ({ note, onUpdateNote, onToggleShare }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState(note.tags.join(', '));
  const [isEditing, setIsEditing] = useState(false);
  
  // Update local state when the note prop changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags.join(', '));
  }, [note]);

  // Save changes to the note
  const saveChanges = () => {
    const processedTags = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    onUpdateNote({
      ...note,
      title,
      content,
      tags: processedTags
    });
    
    setIsEditing(false);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Save on Ctrl+S
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveChanges();
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="note-editor" onKeyDown={handleKeyDown}>
      <div className="note-editor-header">
        <div className="note-editor-actions">
          {isEditing ? (
            <>
              <button className="editor-button save-button" onClick={saveChanges}>
                <i className="icon save-icon"></i>
                Save
              </button>
              <button className="editor-button cancel-button" onClick={() => setIsEditing(false)}>
                <i className="icon cancel-icon"></i>
                Cancel
              </button>
            </>
          ) : (
            <button className="editor-button edit-button" onClick={() => setIsEditing(true)}>
              <i className="icon edit-icon"></i>
              Edit
            </button>
          )}
          
          <button 
            className={`editor-button share-button ${note.isShared ? 'shared' : ''}`}
            onClick={onToggleShare}
          >
            <i className={`icon ${note.isShared ? 'shared-icon' : 'private-icon'}`}></i>
            {note.isShared ? 'Shared' : 'Private'}
          </button>
        </div>
        
        <div className="note-info">
          <span className="note-date">
            Last modified: {formatDate(note.dateModified)}
          </span>
        </div>
      </div>
      
      <div className="note-editor-content">
        {isEditing ? (
          <>
            <input
              type="text"
              className="note-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
            />
            
            <textarea
              className="note-content-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here... (Markdown supported)"
            />
            
            <div className="note-tags-input-container">
              <label htmlFor="tags-input">Tags (comma separated):</label>
              <input
                id="tags-input"
                type="text"
                className="note-tags-input"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add tags separated by commas"
              />
            </div>
          </>
        ) : (
          <>
            <h1 className="note-title-display">{title}</h1>
            
            {note.tags.length > 0 && (
              <div className="note-tags-display">
                {note.tags.map((tag, index) => (
                  <span key={index} className="note-tag">{tag}</span>
                ))}
              </div>
            )}
            
            <div className="note-content-display markdown-preview">
              {/* Simple markdown rendering for preview */}
              {content.split('\n').map((line, index) => {
                // Handle headers
                if (line.startsWith('# ')) {
                  return <h1 key={index}>{line.substring(2)}</h1>;
                } else if (line.startsWith('## ')) {
                  return <h2 key={index}>{line.substring(3)}</h2>;
                } else if (line.startsWith('### ')) {
                  return <h3 key={index}>{line.substring(4)}</h3>;
                } else if (line.startsWith('- ')) {
                  return <li key={index}>{line.substring(2)}</li>;
                } else if (line.startsWith('```')) {
                  return <pre key={index} className="code-block">{line.substring(3)}</pre>;
                } else if (line === '') {
                  return <br key={index} />;
                } else {
                  return <p key={index}>{line}</p>;
                }
              })}
            </div>
          </>
        )}
      </div>
      
      {note.isShared && (
        <div className="note-sharing-info">
          <h3>Sharing Options</h3>
          <div className="sharing-link-container">
            <input 
              type="text" 
              readOnly 
              value={`https://studysync.app/shared/notes/${note.id}`} 
              className="sharing-link"
            />
            <button 
              className="copy-link-button"
              onClick={() => {
                navigator.clipboard.writeText(`https://studysync.app/shared/notes/${note.id}`);
                alert('Link copied to clipboard!');
              }}
            >
              Copy Link
            </button>
          </div>
          <div className="sharing-permissions">
            <label>
              <input type="checkbox" checked={true} readOnly />
              Allow comments
            </label>
            <label>
              <input type="checkbox" checked={false} readOnly />
              Allow editing
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
