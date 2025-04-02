import { useState } from 'react';
import Head from 'next/head';
import useSWR from 'swr';
import { fetchFeed } from '../lib/api';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

const Feed = () => {
  const { data: posts, error, mutate } = useSWR('feed', fetchFeed, {
    refreshInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  if (error) return <div className="text-red-500">Failed to load feed</div>;
  if (!posts) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Feed - Social Analytics</title>
      </Head>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Live Feed</h1>
            <button
              onClick={() => mutate()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Refresh
            </button>
          </div>

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
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feed; 