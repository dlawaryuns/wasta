import Link from 'next/link';
import { FaTools, FaSearch, FaUserTie } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Find Help for Any Task
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Connect with skilled taskers who can help you get things done
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/post-task"
            className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition"
          >
            Post a Task
          </Link>
          <Link
            href="/tasks"
            className="bg-transparent border-2 border-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition"
          >
            Browse Tasks
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTools className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Post a Task</h3>
            <p className="text-gray-600">
              Describe what you need done and set your budget
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Review Bids</h3>
            <p className="text-gray-600">
              Compare taskers and choose the best fit for your needs
            </p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserTie className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Get It Done</h3>
            <p className="text-gray-600">
              Your tasker completes the job and you pay securely
            </p>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Popular Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'Cleaning',
            'Moving',
            'Furniture Assembly',
            'Handyman',
            'Delivery',
            'Gardening',
            'Painting',
            'Pet Care',
          ].map((category) => (
            <Link
              key={category}
              href={`/tasks?category=${category.toLowerCase()}`}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
