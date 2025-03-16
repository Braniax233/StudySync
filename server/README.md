# StudySync Backend API

This is the backend API for the StudySync application, built with Node.js, Express, and MongoDB.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Navigate to the server directory:
   ```
   cd studysync/server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```
5. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- **Register User**: `POST /api/users/register`
  - Request Body: `{ username, email, password, firstName, lastName }`
  - Returns: User object with token

- **Login User**: `POST /api/users/login`
  - Request Body: `{ email, password }`
  - Returns: User object with token

- **Get User Profile**: `GET /api/users/profile`
  - Authorization: Bearer Token
  - Returns: User profile information

- **Update User Profile**: `PUT /api/users/profile`
  - Authorization: Bearer Token
  - Request Body: `{ username, email, password, firstName, lastName, profilePicture, preferences }`
  - Returns: Updated user object with token

### Notes

- **Get All Notes**: `GET /api/notes`
  - Authorization: Bearer Token
  - Returns: Array of user's notes

- **Get Single Note**: `GET /api/notes/:id`
  - Authorization: Bearer Token
  - Returns: Note object

- **Create Note**: `POST /api/notes`
  - Authorization: Bearer Token
  - Request Body: `{ title, content, tags, isShared }`
  - Returns: Created note object

- **Update Note**: `PUT /api/notes/:id`
  - Authorization: Bearer Token
  - Request Body: `{ title, content, tags, isShared }`
  - Returns: Updated note object

- **Delete Note**: `DELETE /api/notes/:id`
  - Authorization: Bearer Token
  - Returns: Success message

- **Toggle Note Sharing**: `PUT /api/notes/:id/share`
  - Authorization: Bearer Token
  - Returns: Updated note object

- **Search Notes**: `GET /api/notes/search?query=searchterm`
  - Authorization: Bearer Token
  - Returns: Array of matching notes

### Events

- **Get All Events**: `GET /api/events`
  - Authorization: Bearer Token
  - Returns: Array of user's events

- **Get Events by Date**: `GET /api/events/date/:date`
  - Authorization: Bearer Token
  - Returns: Array of events for the specified date

- **Get Single Event**: `GET /api/events/:id`
  - Authorization: Bearer Token
  - Returns: Event object

- **Create Event**: `POST /api/events`
  - Authorization: Bearer Token
  - Request Body: `{ title, date, startTime, endTime, description, location, isRecurring, recurrencePattern, reminderTime }`
  - Returns: Created event object

- **Update Event**: `PUT /api/events/:id`
  - Authorization: Bearer Token
  - Request Body: `{ title, date, startTime, endTime, description, location, isRecurring, recurrencePattern, reminderTime }`
  - Returns: Updated event object

- **Delete Event**: `DELETE /api/events/:id`
  - Authorization: Bearer Token
  - Returns: Success message

## Authentication

All protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Handling

The API returns appropriate HTTP status codes and error messages in the following format:

```json
{
  "success": false,
  "message": "Error message"
}
```

## Data Models

### User

- `username`: String (required, unique)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `firstName`: String
- `lastName`: String
- `profilePicture`: String
- `preferences`: Object
  - `theme`: String (light/dark)
  - `notifications`: Boolean
- `createdAt`: Date

### Note

- `title`: String (required)
- `content`: String (required)
- `tags`: Array of Strings
- `isShared`: Boolean
- `user`: ObjectId (reference to User)
- `dateCreated`: Date
- `dateModified`: Date

### Event

- `title`: String (required)
- `date`: Date (required)
- `startTime`: String (required)
- `endTime`: String (required)
- `description`: String
- `location`: String
- `isRecurring`: Boolean
- `recurrencePattern`: String (daily/weekly/monthly/yearly)
- `reminderTime`: Number (minutes before event)
- `user`: ObjectId (reference to User)
- `createdAt`: Date
