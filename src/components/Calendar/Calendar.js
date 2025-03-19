import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { eventsService } from '../../services/dataService';
import './Calendar.css';

const StudySyncCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: ''
  });
  
  // Load events from the data service
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const loadedEvents = await eventsService.getEvents();
        if (Array.isArray(loadedEvents)) {
          setEvents(loadedEvents.map(event => ({
            ...event,
            date: new Date(event.date)
          })));
        } else {
          console.error('Events data is not an array:', loadedEvents);
          setEvents([]);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      }
    };
    
    fetchEvents();
  }, []);

  // Function to check if a date has events
  const hasEvent = (date) => {
    return events.some(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  // Function to get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  // Custom tile content to show event indicators
  const tileContent = ({ date, view }) => {
    if (view === 'month' && hasEvent(date)) {
      return <div className="event-indicator"></div>;
    }
    return null;
  };

  // Custom tile class to style dates with events
  const tileClassName = ({ date, view }) => {
    if (view === 'month' && hasEvent(date)) {
      return 'has-event';
    }
    return null;
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setDate(newDate);
    setNewEvent(prev => ({ ...prev, date: newDate }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const eventToSave = {
      ...newEvent,
      date: newEvent.date.toISOString()
    };
    
    const savedEvent = eventsService.createEvent(eventToSave);
    
    // Update the local state with the new event
    setEvents(prev => [...prev, { ...savedEvent, date: new Date(savedEvent.date) }]);
    
    // Reset form and hide it
    setNewEvent({
      title: '',
      date: date,
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      location: ''
    });
    setShowEventForm(false);
  };

  // Handle event deletion
  const handleDeleteEvent = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      eventsService.deleteEvent(id);
      setEvents(prev => prev.filter(event => event.id !== id));
    }
  };

  return (
    <div className="studysync-calendar-container">
      <div className="calendar-wrapper">
        <Calendar 
          onChange={handleDateChange} 
          value={date}
          tileContent={tileContent}
          tileClassName={tileClassName}
          className="dark-theme-calendar"
        />
      </div>
      
      <div className="events-panel">
        <div className="events-header">
          <h3 className="events-title">Events for {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
          <button 
            className="add-event-button"
            onClick={() => setShowEventForm(!showEventForm)}
          >
            {showEventForm ? 'Cancel' : 'Add Event'}
          </button>
        </div>

        {showEventForm && (
          <form className="event-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Event Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newEvent.title}
                onChange={handleInputChange}
                required
                placeholder="Enter event title"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">Start Time</label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={newEvent.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endTime">End Time</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={newEvent.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={newEvent.location}
                onChange={handleInputChange}
                placeholder="Enter location"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newEvent.description}
                onChange={handleInputChange}
                placeholder="Enter event description"
                rows="3"
              ></textarea>
            </div>
            
            <button type="submit" className="submit-event-button">Save Event</button>
          </form>
        )}
        
        <div className="events-list">
          {getEventsForDate(date).length > 0 ? (
            getEventsForDate(date).map((event, index) => (
              <div key={event.id || index} className="event-item">
                <div className="event-item-header">
                  <div className="event-time">
                    {event.startTime} - {event.endTime}
                  </div>
                  <div className="event-actions">
                    <button 
                      className="delete-event-button"
                      onClick={() => handleDeleteEvent(event.id)}
                      title="Delete event"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="event-title">{event.title}</div>
                {event.location && <div className="event-location">{event.location}</div>}
                {event.description && <div className="event-description">{event.description}</div>}
              </div>
            ))
          ) : (
            <div className="no-events">No events scheduled for this day</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudySyncCalendar;
