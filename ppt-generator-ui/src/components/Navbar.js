import { Link, useLocation } from 'react-router-dom';
import { DocumentIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/', label: 'Upload', icon: DocumentIcon },
    { path: '/audience', label: 'Audience' },
    { path: '/preview', label: 'Preview' },
    { path: '/export', label: 'Export' }
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
              <PresentationChartLineIcon className="h-8 w-8 relative text-blue-600" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PPT Generator
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
