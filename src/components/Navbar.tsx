'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';

const Navbar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-800">
            WASTA
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link
              href="/tasks"
              className={`${
                pathname === '/tasks' ? 'text-blue-600' : 'text-gray-600'
              } hover:text-blue-600`}
            >
              Browse Tasks
            </Link>
            <Link
              href="/post-task"
              className={`${
                pathname === '/post-task' ? 'text-blue-600' : 'text-gray-600'
              } hover:text-blue-600`}
            >
              Post a Task
            </Link>
            {session?.user && (
              <Link
                href="/dashboard"
                className={`${
                  pathname === '/dashboard' ? 'text-blue-600' : 'text-gray-600'
                } hover:text-blue-600`}
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {session?.user ? (
              <>
                <span className="text-gray-600">{session.user.name}</span>
                <button
                  onClick={() => signOut()}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 