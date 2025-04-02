import Head from 'next/head';
import useSWR from 'swr';
import { fetchTrendingPosts } from '../lib/api';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const TrendingPosts = () => {
  const { data: posts, error } = useSWR('trendingPosts', fetchTrendingPosts, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  if (error) return <div className="text-red-500">Failed to load trending posts</div>;
  if (!posts) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Trending Posts - Social Analytics</title>
      </Head>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Most Commented Posts</h1>

          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={`https://api.dicebear.com/7.x/avatars/svg?seed=${post.userid}`}
                        alt="User avatar"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {post.userName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Post ID: {post.id}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-lg text-gray-900">{post.content}</p>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-gray-500">
                      <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                      <span>{post.commentCount} comments</span>
                    </div>
                    <div className="mt-2 space-y-2">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="pl-8 text-sm text-gray-600">
                          {comment.content}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrendingPosts; 