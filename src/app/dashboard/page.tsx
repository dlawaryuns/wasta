'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaTasks, FaHandshake, FaUser, FaCheck, FaTimes } from 'react-icons/fa';

interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  bids: {
    id: string;
    amount: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    user: {
      name: string;
    };
  }[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/dashboard/tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        setError('Failed to load tasks');
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleBidAction = async (taskId: string, bidId: string, action: 'accept' | 'reject') => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/bids/${bidId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bid status');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      setError('Failed to update bid status');
      console.error('Error updating bid:', error);
    }
  };

  const handleTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      setError('Failed to update task status');
      console.error('Error updating task:', error);
    }
  };

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in to view your dashboard
          </h2>
        </div>
      </div>
    );
  }

  const postedTasks = tasks.filter((task) => task.status !== 'COMPLETED');
  const completedTasks = tasks.filter((task) => task.status === 'COMPLETED');
  const acceptedBids = tasks.flatMap((task) =>
    task.bids.filter((bid) => bid.status === 'ACCEPTED')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {session.user.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          {session.user.role === 'CLIENT'
            ? 'Manage your posted tasks and review bids'
            : 'Track your accepted tasks and bids'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaTasks className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {session.user.role === 'CLIENT' ? 'Posted Tasks' : 'Active Tasks'}
              </h3>
              <p className="text-2xl font-semibold text-gray-900">
                {postedTasks.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaHandshake className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {session.user.role === 'CLIENT'
                  ? 'Accepted Bids'
                  : 'Completed Tasks'}
              </h3>
              <p className="text-2xl font-semibold text-gray-900">
                {session.user.role === 'CLIENT'
                  ? acceptedBids.length
                  : completedTasks.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaUser className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Role</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {session.user.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {session.user.role === 'CLIENT' ? 'Your Posted Tasks' : 'Your Tasks'}
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : postedTasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No tasks found. {session.user.role === 'CLIENT' ? 'Post a task' : 'Browse tasks'} to get
            started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {postedTasks.map((task) => (
              <div key={task.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {task.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {task.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-semibold text-blue-600">
                      ${task.budget}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      task.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      task.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>

                {task.bids.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Bids
                    </h4>
                    <div className="space-y-2">
                      {task.bids.map((bid) => (
                        <div
                          key={bid.id}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-600">{bid.user.name}</span>
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-900">${bid.amount}</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                bid.status === 'ACCEPTED'
                                  ? 'bg-green-100 text-green-800'
                                  : bid.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {bid.status}
                            </span>
                            {session.user.role === 'CLIENT' && task.status === 'PENDING' && bid.status === 'PENDING' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleBidAction(task.id, bid.id, 'accept')}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  onClick={() => handleBidAction(task.id, bid.id, 'reject')}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {session.user.role === 'TASKER' && task.status === 'ACCEPTED' && (
                  <div className="mt-4">
                    <button
                      onClick={() => handleTaskStatus(task.id, 'IN_PROGRESS')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Start Task
                    </button>
                  </div>
                )}

                {session.user.role === 'TASKER' && task.status === 'IN_PROGRESS' && (
                  <div className="mt-4">
                    <button
                      onClick={() => handleTaskStatus(task.id, 'COMPLETED')}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Mark as Completed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 