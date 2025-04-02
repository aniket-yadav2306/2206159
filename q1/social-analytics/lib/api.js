import axios from 'axios';

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNjA1MDQ5LCJpYXQiOjE3NDM2MDQ3NDksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImFjZTU0YTczLWU5MWEtNDQzZC05ZWNlLWZjNGI2ZWRjNDYyOSIsInN1YiI6IjIyMDYxNTlAa2lpdC5hYy5pbiJ9LCJlbWFpbCI6IjIyMDYxNTlAa2lpdC5hYy5pbiIsIm5hbWUiOiJhbmlrZXQgeWFkYXYiLCJyb2xsTm8iOiIyMjA2MTU5IiwiYWNjZXNzQ29kZSI6Im53cHdyWiIsImNsaWVudElEIjoiYWNlNTRhNzMtZTkxYS00NDNkLTllY2UtZmM0YjZlZGM0NjI5IiwiY2xpZW50U2VjcmV0IjoiTmhwSnpDd1VZVldDeWFlYyJ9.1vA7ueDVTI1RsWaIS58Bu64z3TMKSiN4WWI8vFmuP3Y';

const api = axios.create({
  baseURL: '/api', // Using the proxied endpoint
  timeout: 10000,
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to log requests
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`, {
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

const logError = (error, context) => {
  console.error(`Error in ${context}:`, {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data,
    endpoint: error.config?.url,
    method: error.config?.method,
    headers: error.config?.headers,
  });
};

const handleError = (error, context) => {
  logError(error, context);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const message = error.response.data?.message || error.response.statusText || 'An error occurred';
    throw new Error(`${context}: ${message} (Status: ${error.response.status})`);
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error(`${context}: No response received from server`);
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(`${context}: ${error.message}`);
  }
};

export const fetchAllUsers = async () => {
  try {
    console.log('Fetching all users...');
    const { data } = await api.get('/users');
    console.log('Users fetched successfully:', Object.keys(data.users).length);
    // Convert the users object to an array with id and name
    return Object.entries(data.users).map(([id, name]) => ({
      id,
      name,
      posts: 0 // Will be updated when fetching posts
    }));
  } catch (error) {
    handleError(error, 'fetchAllUsers');
  }
};

export const fetchUserPosts = async (userId) => {
  try {
    console.log(`Fetching posts for user ${userId}...`);
    const { data } = await api.get(`/users/${userId}/posts`);
    console.log(`Posts fetched successfully for user ${userId}:`, data.posts?.length || 0);
    return data.posts || [];
  } catch (error) {
    handleError(error, `fetchUserPosts(${userId})`);
  }
};

export const fetchPostComments = async (postId) => {
  try {
    console.log(`Fetching comments for post ${postId}...`);
    const { data } = await api.get(`/posts/${postId}/comments`);
    console.log(`Comments fetched successfully for post ${postId}:`, data.comments?.length || 0);
    return data.comments || [];
  } catch (error) {
    handleError(error, `fetchPostComments(${postId})`);
  }
};

// Helper function to get top users with their post counts
export const fetchTopUsers = async () => {
  try {
    console.log('Starting fetchTopUsers...');
    const users = await fetchAllUsers();
    console.log('Fetching post counts for each user...');
    
    const userPostCounts = await Promise.all(
      users.map(async (user) => {
        const posts = await fetchUserPosts(user.id);
        return {
          ...user,
          posts: posts?.length || 0
        };
      })
    );

    // Sort by post count and get top 5
    const topUsers = userPostCounts
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 5);
    
    console.log('Top users fetched successfully:', topUsers);
    return topUsers;
  } catch (error) {
    handleError(error, 'fetchTopUsers');
  }
};

// Helper function to get trending posts (posts with most comments)
export const fetchTrendingPosts = async () => {
  try {
    console.log('Starting fetchTrendingPosts...');
    const users = await fetchAllUsers();
    const allPosts = [];

    console.log('Fetching posts for all users...');
    // Fetch all posts from all users
    for (const user of users) {
      const userPosts = await fetchUserPosts(user.id);
      if (userPosts?.length) {
        allPosts.push(...userPosts.map(post => ({ ...post, userName: user.name })));
      }
    }

    console.log('Total posts fetched:', allPosts.length);
    console.log('Fetching comments for all posts...');

    // Fetch comment counts for all posts
    const postsWithComments = await Promise.all(
      allPosts.map(async (post) => {
        const comments = await fetchPostComments(post.id);
        return {
          ...post,
          commentCount: comments?.length || 0,
          comments: comments || []
        };
      })
    );

    // Sort by comment count and return posts with the highest comment count
    const maxComments = Math.max(...postsWithComments.map(p => p.commentCount));
    const trendingPosts = postsWithComments
      .filter(post => post.commentCount === maxComments)
      .sort((a, b) => b.id - a.id);

    console.log('Trending posts fetched successfully:', {
      maxComments,
      count: trendingPosts.length
    });
    return trendingPosts;
  } catch (error) {
    handleError(error, 'fetchTrendingPosts');
  }
};

// Helper function to get feed (all posts sorted by ID, most recent first)
export const fetchFeed = async () => {
  try {
    console.log('Starting fetchFeed...');
    const users = await fetchAllUsers();
    const allPosts = [];

    console.log('Fetching posts for all users...');
    // Fetch all posts from all users
    for (const user of users) {
      const userPosts = await fetchUserPosts(user.id);
      if (userPosts?.length) {
        allPosts.push(...userPosts.map(post => ({ ...post, userName: user.name })));
      }
    }

    // Sort by post ID (assuming higher ID means more recent)
    const sortedPosts = allPosts.sort((a, b) => b.id - a.id);
    console.log('Feed fetched successfully:', sortedPosts.length);
    return sortedPosts;
  } catch (error) {
    handleError(error, 'fetchFeed');
  }
};

export default api; 