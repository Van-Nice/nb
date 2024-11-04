export const config = {
  apiUrl: process.env.REACT_APP_API_URL,
  wsUrl: process.env.REACT_APP_WS_URL
};

// Validate required environment variables
if (!process.env.REACT_APP_API_URL || !process.env.REACT_APP_WS_URL) {
  throw new Error(
    'Missing required environment variables. Please check your .env file'
  );
}
