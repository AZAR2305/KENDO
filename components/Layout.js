// Main layout component for StudySphere with navigation
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();

  const navigationItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/upload', label: 'Upload', icon: '📁' },
    { path: '/summary', label: 'Summary', icon: '📝' },
    { path: '/quiz', label: 'Quiz', icon: '🧠' },
    { path: '/question', label: 'Q&A', icon: '❓' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">📚 StudySphere</span>
            </Link>
            
            <nav className="flex space-x-4">
              {navigationItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <button
                    className={`flex items-center space-x-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      router.pathname === item.path
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; 2025 StudySphere - AI-Powered Learning Platform</p>
        </div>
      </footer>
    </div>
  );
}