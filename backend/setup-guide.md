# Backend Setup Guide

## MongoDB Atlas Configuration

### Step 1: IP Whitelist Configuration

1. Go to your MongoDB Atlas dashboard
2. Navigate to "Network Access" in the left sidebar
3. Click "ADD IP ADDRESS"
4. Choose one of these options:
   - **Recommended for development**: Click "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)
   - **More secure**: Add your current IP address specifically

### Step 2: Database User Setup

1. Go to "Database Access" in the left sidebar
2. Ensure you have a database user created
3. Note down the username and password for your `.env` file

### Step 3: Connection String

1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual database password

### Step 4: Environment Configuration

Make sure your `.env` file has:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movie-reviews?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

## Testing the Setup

### 1. Start the server:

```powershell
npm run dev
```

### 2. Test database connection:

```powershell
# Using curl (if available)
curl http://localhost:5000/health

# Or open in browser:
# http://localhost:5000/health
```

### 3. Test database operations:

```powershell
curl http://localhost:5000/api/db-test
```

## API Testing with Postman

### 1. Health Check

- **Method**: GET
- **URL**: `http://localhost:5000/health`
- **Expected Response**: Status 200 with database status

### 2. Database Test

- **Method**: GET
- **URL**: `http://localhost:5000/api/db-test`
- **Expected Response**: Status 200 with collections list

### 3. User Registration

- **Method**: POST
- **URL**: `http://localhost:5000/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body**:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

### 4. User Login

- **Method**: POST
- **URL**: `http://localhost:5000/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

## Common Issues and Solutions

### 1. "Database not connected" Error

- Check if your IP is whitelisted in MongoDB Atlas
- Verify your connection string in `.env`
- Ensure your database user has proper permissions

### 2. "Cannot call users.findOne() before initial connection is complete"

- This has been fixed with the updated connection configuration
- Restart the server if you still see this error

### 3. Connection Timeout

- Usually caused by IP whitelisting issues
- Check Network Access settings in MongoDB Atlas
- Try allowing access from anywhere (0.0.0.0/0) for testing

### 4. Authentication Failed

- Verify database username and password in connection string
- Check if the database user exists in MongoDB Atlas

## Next Steps After Successful Connection

1. **Seed the database**:

   ```powershell
   npm run seed
   ```

2. **Test all endpoints** using the Postman collection

3. **Connect frontend** by updating frontend API base URL if needed

## Environment Variables Explanation

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT token signing (use a strong, random string)
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS configuration
