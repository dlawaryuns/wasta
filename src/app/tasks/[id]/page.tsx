'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaUser, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  location: string;
  createdAt: string;
  status: string;
  client: {
    name: string;
  };
  bids: {
    id: string;
    amount: number;
    message: string;
    status: string;
    user: {
      name: string;
    };
  }[];
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${params.id}`);
        if (!response.ok) {
          throw new Error('Task not found');
        }
        const data = await response.json();
        setTask(data);
      } catch {
        setError('Failed to load task');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [params.id]);

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${params.id}/bids`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(bidAmount),
          message: bidMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit bid');
      }

      // Refresh task data to show new bid
      const updatedTask = await response.json();
      setTask(updatedTask);
      setBidAmount('');
      setBidMessage('');
    } catch {
      setError('Failed to submit bid');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error || !task) {
    return (
      <div className="text-center py-8 text-red-600">
        {error || 'Task not found'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{task.title}</h1>
          
          <div className="flex items-center text-gray-600 mb-4">
            <FaUser className="mr-2" />
            <span>Posted by {task.client.name}</span>
          </div>
          
          <div className="flex items-center text-gray-600 mb-4">
            <FaMapMarkerAlt className="mr-2" />
            <span>{task.location}</span>
          </div>
          
          <div className="flex items-center text-gray-600 mb-6">
            <FaCalendarAlt className="mr-2" />
            <span>
              Posted on {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{task.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Budget</h2>
            <p className="text-2xl font-bold text-blue-600">${task.budget}</p>
          </div>

          {session?.user.role === 'TASKER' && task.status === 'PENDING' && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Place a Bid</h2>
              <form onSubmit={handleSubmitBid} className="space-y-4">
                <div>
                  <label
                    htmlFor="bidAmount"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Your Bid Amount ($)
                  </label>
                  <input
                    type="number"
                    id="bidAmount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="bidMessage"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Message to Client
                  </label>
                  <textarea
                    id="bidMessage"
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    rows={3}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Submit Bid
                </button>
              </form>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-4">Bids</h2>
            {task.bids.length === 0 ? (
              <p className="text-gray-500">No bids yet</p>
            ) : (
              <div className="space-y-4">
                {task.bids.map((bid) => (
                  <div
                    key={bid.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold">{bid.user.name}</span>
                      <span className="text-blue-600 font-bold">
                        ${bid.amount}
                      </span>
                    </div>
                    <p className="text-gray-600">{bid.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 