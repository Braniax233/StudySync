# StudySync Backend Deployment Guide

This guide provides instructions for deploying the StudySync backend to various environments.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Production Deployment Options](#production-deployment-options)
   - [Heroku](#heroku)
   - [MongoDB Atlas](#mongodb-atlas)
   - [Docker](#docker)
   - [AWS](#aws)
4. [Environment Variables](#environment-variables)
5. [Security Considerations](#security-considerations)

## Prerequisites

- Node.js (v14.x or later)
- npm or yarn
- MongoDB (local or Atlas)
- Git

## Local Development

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd studysync/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/studysync
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Production Deployment Options

### Heroku

1. Create a Heroku account and install the Heroku CLI:
   ```bash
   npm install -g heroku
   ```

2. Login to Heroku:
   ```bash
   heroku login
   ```

3. Create a new Heroku app:
   ```bash
   heroku create studysync-api
   ```

4. Add MongoDB addon or configure external MongoDB URI:
   ```bash
   heroku addons:create mongodb:sandbox
   ```
   Or set the MongoDB URI environment variable:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri
   ```

5. Set other environment variables:
   ```bash
   heroku config:set JWT_SECRET=your_production_jwt_secret
   heroku config:set NODE_ENV=production
   ```

6. Deploy to Heroku:
   ```bash
   git subtree push --prefix server heroku main
   ```

7. Open the app:
   ```bash
   heroku open
   ```

### MongoDB Atlas

1. Create a MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. Create a new cluster (the free tier is sufficient for development)

3. Set up database access:
   - Create a database user with appropriate permissions
   - Add your IP address to the IP whitelist or allow access from anywhere (0.0.0.0/0)

4. Get your connection string:
   - Click "Connect" on your cluster
   - Select "Connect your application"
   - Copy the connection string and replace `<password>` with your database user's password

5. Use this connection string as your `MONGODB_URI` environment variable

### Docker

1. Create a `Dockerfile` in the server directory:
   ```dockerfile
   FROM node:16-alpine

   WORKDIR /usr/src/app

   COPY package*.json ./

   RUN npm install

   COPY . .

   EXPOSE 5000

   CMD ["npm", "start"]
   ```

2. Create a `.dockerignore` file:
   ```
   node_modules
   npm-debug.log
   .env
   .git
   ```

3. Build the Docker image:
   ```bash
   docker build -t studysync-api .
   ```

4. Run the Docker container:
   ```bash
   docker run -p 5000:5000 \
     -e PORT=5000 \
     -e MONGODB_URI=your_mongodb_uri \
     -e JWT_SECRET=your_jwt_secret \
     -e NODE_ENV=production \
     studysync-api
   ```

5. For Docker Compose, create a `docker-compose.yml` file:
   ```yaml
   version: '3'
   services:
     api:
       build: .
       ports:
         - "5000:5000"
       environment:
         - PORT=5000
         - MONGODB_URI=mongodb://mongo:27017/studysync
         - JWT_SECRET=your_jwt_secret
         - NODE_ENV=production
       depends_on:
         - mongo
     mongo:
       image: mongo
       ports:
         - "27017:27017"
       volumes:
         - mongo-data:/data/db
   volumes:
     mongo-data:
   ```

6. Run with Docker Compose:
   ```bash
   docker-compose up
   ```

### AWS

#### Elastic Beanstalk

1. Install the AWS CLI and EB CLI:
   ```bash
   pip install awscli
   pip install awsebcli
   ```

2. Initialize EB application:
   ```bash
   eb init
   ```

3. Create an environment:
   ```bash
   eb create studysync-api-env
   ```

4. Set environment variables:
   ```bash
   eb setenv MONGODB_URI=your_mongodb_uri JWT_SECRET=your_jwt_secret NODE_ENV=production
   ```

5. Deploy:
   ```bash
   eb deploy
   ```

#### EC2

1. Launch an EC2 instance with Ubuntu

2. SSH into your instance:
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. Install Node.js and npm:
   ```bash
   curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. Clone your repository:
   ```bash
   git clone <repository-url>
   cd studysync/server
   ```

5. Install dependencies:
   ```bash
   npm install
   ```

6. Set up environment variables:
   ```bash
   echo "PORT=5000" >> .env
   echo "MONGODB_URI=your_mongodb_uri" >> .env
   echo "JWT_SECRET=your_jwt_secret" >> .env
   echo "NODE_ENV=production" >> .env
   ```

7. Install PM2 for process management:
   ```bash
   sudo npm install -g pm2
   ```

8. Start the application with PM2:
   ```bash
   pm2 start index.js --name studysync-api
   ```

9. Set up PM2 to start on boot:
   ```bash
   pm2 startup
   pm2 save
   ```

10. Set up Nginx as a reverse proxy:
    ```bash
    sudo apt-get install nginx
    ```

11. Configure Nginx:
    ```bash
    sudo nano /etc/nginx/sites-available/studysync
    ```
    Add the following configuration:
    ```
    server {
        listen 80;
        server_name your_domain.com;

        location / {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

12. Enable the site and restart Nginx:
    ```bash
    sudo ln -s /etc/nginx/sites-available/studysync /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

13. Set up SSL with Let's Encrypt:
    ```bash
    sudo apt-get install certbot python3-certbot-nginx
    sudo certbot --nginx -d your_domain.com
    ```

## Environment Variables

The following environment variables should be configured for deployment:

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Port on which the server will run | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/studysync |
| JWT_SECRET | Secret key for JWT token generation | your_jwt_secret_key |
| NODE_ENV | Environment (development, production) | production |

## Security Considerations

1. **JWT Secret**: Use a strong, unique JWT secret in production. You can generate one with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **HTTPS**: Always use HTTPS in production. Set up SSL certificates using services like Let's Encrypt.

3. **MongoDB Security**:
   - Use strong passwords for database users
   - Restrict IP access to your database
   - Enable authentication
   - Use encrypted connections (SSL/TLS)

4. **Rate Limiting**: Consider implementing rate limiting for API endpoints to prevent abuse.

5. **Input Validation**: Ensure all user inputs are properly validated.

6. **Regular Updates**: Keep all dependencies updated to patch security vulnerabilities:
   ```bash
   npm audit
   npm audit fix
   ```

7. **Logging**: Implement proper logging for monitoring and debugging:
   ```bash
   npm install winston
   ```

8. **Environment Variables**: Never commit sensitive environment variables to version control.

9. **CORS Configuration**: Configure CORS to only allow requests from trusted domains.

10. **Security Headers**: Implement security headers using Helmet:
    ```bash
    npm install helmet
    ```
    And in your code:
    ```javascript
    const helmet = require('helmet');
    app.use(helmet());
    ```
