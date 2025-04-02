import { useState, useEffect } from 'react';
import Head from 'next/head';
import useSWR from 'swr';
import { fetchTopUsers } from '../lib/api';
import { UserIcon } from '@heroicons/react/24/solid';

const TopUsers = () => {
  const { data: users, error } = useSWR('topUsers', fetchTopUsers, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  if (error) return <div className="text-red-500">Failed to load top users</div>;
  if (!users) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Top Users - Social Analytics</title>
      </Head>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Top Users by Post Count</h1>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <li key={user.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-gray-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {user.name}
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {user.posts} posts
                          </p>
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        User ID: {user.id} • Rank #{index + 1}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TopUsers; 