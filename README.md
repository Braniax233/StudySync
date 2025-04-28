## Reinstalling Node.js Modules

To reinstall the necessary Node.js modules for this project, use the following command:

```bash
npm install
```

after navigate to the server directory and reinstall the necessary Node.js modules for the server:

```bash
cd server
npm install
```

This will install all the dependencies listed in the `package.json` file.

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Running the Application

To run the application, follow these steps:

1. Open two terminal windows.

2. In the first terminal, navigate to the server directory and start the server:

   ```bash
   cd server
   npm start
   ```

3. In the second terminal, navigate to the root directory and start the frontend:
   ```bash
   npm start
   ```

## Project Structure

```
StudySync/
├── .git/                 # Git version control directory
├── .gitignore            # Files and directories to ignore in Git
├── README.md             # Project documentation
├── package-lock.json     # Lock file for npm dependencies
├── package.json          # Project metadata and dependencies
├── public/               # Public assets
│   ├── (contains 3 files)
├── server/               # Server-side code
│   ├── (contains 39 files)
├── src/                  # Source files
│   ├── (contains 62 files)
└── vercel.json           # Configuration for Vercel deployment
```
