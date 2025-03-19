import React from 'react';
import './Notes.css';

const NotesList = ({ notes, activeNoteId, onSelectNote, onDeleteNote, onToggleShare }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 100) => {
    // Remove markdown formatting for preview
    const plainText = content.replace(/#{1,6}\s?/g, '').replace(/\*\*/g, '').replace(/\*/g, '');
    
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  return (
    <div className="notes-list">
      {notes.length === 0 ? (
        <div className="empty-notes">
          <p>No notes found</p>
        </div>
      ) : (
        notes.map(note => (
          <div 
            key={note._id} 
            className={`note-item ${activeNoteId === note._id ? 'active' : ''}`}
            onClick={() => onSelectNote(note)}
          >
            <div className="note-item-content">
              <h3 className="note-title">{note.title}</h3>
              <p className="note-preview">{truncateContent(note.content)}</p>
              <div className="note-meta">
                <span className="note-date">{formatDate(note.dateModified)}</span>
                {note.tags.length > 0 && (
                  <div className="note-tags">
                    {note.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="note-tag">{tag}</span>
                    ))}
                    {note.tags.length > 2 && <span className="note-tag-more">+{note.tags.length - 2}</span>}
                  </div>
                )}
              </div>
            </div>
            <div className="note-actions">
              <button 
                className={`note-action-button share-button ${note.isShared ? 'shared' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleShare(note._id);
                }}
                title={note.isShared ? "Shared" : "Private"}
              >
                <i className={`icon ${note.isShared ? 'shared-icon' : 'private-icon'}`}></i>
              </button>
              <button 
                className="note-action-button delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Are you sure you want to delete this note?")) {
                    onDeleteNote(note._id);
                  }
                }}
                title="Delete note"
              >
                <i className="icon delete-icon"></i>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotesList;
