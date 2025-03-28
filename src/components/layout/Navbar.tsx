import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { Sparkles, Image, ImagePlus, Edit, LogOut, User, ChevronDown } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const { userData } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSolutions, setShowSolutions] = useState(false);
  let solutionsTimeout: NodeJS.Timeout;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSolutionsEnter = () => {
    clearTimeout(solutionsTimeout);
    setShowSolutions(true);
  };

  const handleSolutionsLeave = () => {
    solutionsTimeout = setTimeout(() => {
      setShowSolutions(false);
    }, 200);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-primary-200 relative z-50">
      <div className="container-lg">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-accent-600" />
            <span className="text-xl font-medium text-primary-900">StyleAI</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Link
                  to="/generate"
                  className={`px-4 py-2 rounded-lg text-sm ${
                    isActive('/generate')
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-primary-700 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <ImagePlus className="h-4 w-4" />
                    <span>Generate</span>
                  </div>
                </Link>
                <Link
                  to="/edit"
                  className={`px-4 py-2 rounded-lg text-sm ${
                    isActive('/edit')
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-primary-700 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </div>
                </Link>
                <Link
                  to="/gallery"
                  className={`px-4 py-2 rounded-lg text-sm ${
                    isActive('/gallery')
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-primary-700 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Image className="h-4 w-4" />
                    <span>Gallery</span>
                  </div>
                </Link>
                <div className="relative group ml-2">
                  <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm text-primary-700 hover:bg-primary-50">
                    {userData?.avatar_url ? (
                      <img
                        src={userData.avatar_url}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                    )}
                    <span>{userData?.display_name || 'Account'}</span>
                  </button>
                  <div className="absolute right-0 w-48 mt-1 py-2 bg-white rounded-lg shadow-surface-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-primary-200">
                    <Link
                      to="/account"
                      className="block px-4 py-3 text-sm text-primary-700 hover:bg-primary-50"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm text-primary-700 hover:bg-primary-50"
                    >
                      <div className="flex items-center space-x-2">
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <button
                    onMouseEnter={handleSolutionsEnter}
                    onMouseLeave={handleSolutionsLeave}
                    className="flex items-center space-x-1 px-4 py-2 rounded-lg text-sm text-primary-700 hover:bg-primary-50"
                  >
                    <span>Solutions</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {showSolutions && (
                    <div
                      onMouseEnter={handleSolutionsEnter}
                      onMouseLeave={handleSolutionsLeave}
                      className="absolute left-0 w-64 mt-1 py-2 bg-white rounded-lg shadow-surface-lg border border-primary-200 z-50"
                    >
                      <Link
                        to="/solutions#generate"
                        className="block px-4 py-3 text-sm text-primary-700 hover:bg-primary-50"
                      >
                        <div className="flex items-center space-x-3">
                          <ImagePlus className="h-5 w-5 text-accent-600" />
                          <div>
                            <div className="font-medium">Image Generation</div>
                            <div className="text-xs text-primary-500">Create unique images with AI</div>
                          </div>
                        </div>
                      </Link>
                      <Link
                        to="/solutions#edit"
                        className="block px-4 py-3 text-sm text-primary-700 hover:bg-primary-50"
                      >
                        <div className="flex items-center space-x-3">
                          <Edit className="h-5 w-5 text-accent-600" />
                          <div>
                            <div className="font-medium">Image Editing</div>
                            <div className="text-xs text-primary-500">Transform your photos with AI</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
                <Link
                  to="/pricing"
                  className="px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 rounded-lg"
                >
                  Pricing
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-primary-700 hover:bg-primary-50 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-accent"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;