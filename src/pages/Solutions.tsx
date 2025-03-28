import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ImagePlus, Edit, Sparkles, Palette, Wand2, Layout } from 'lucide-react';

function Solutions() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to section if hash is present
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        // Add a small delay to ensure smooth scrolling after page load
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-gray-900">
          AI-Powered Image Solutions
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Discover our powerful AI tools for generating and editing images. Create stunning visuals 
          and transform your photos with just a few clicks.
        </p>
      </div>

      {/* Generate Section */}
      <div id="generate" className="mb-20 scroll-mt-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 lg:px-16">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <div className="flex items-center">
                  <ImagePlus className="h-8 w-8 text-indigo-600" />
                  <h2 className="ml-3 text-3xl font-bold text-gray-900">AI Image Generation</h2>
                </div>
                <p className="mt-6 text-lg text-gray-600">
                  Create unique images from text descriptions using our advanced AI. Choose from multiple 
                  artistic styles and get high-quality results in seconds.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Sparkles className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">Multiple Style Options</h3>
                      <p className="mt-2 text-gray-600">
                        Choose from various styles including watercolor, oil painting, anime, digital art, 
                        and more to match your creative vision.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Palette className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">Reference Images</h3>
                      <p className="mt-2 text-gray-600">
                        Upload reference images to guide the AI and get results closer to your desired outcome.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-10">
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Try Image Generation
                  </Link>
                </div>
              </div>
              <div className="mt-10 lg:mt-0">
                <div className="bg-gray-100 rounded-lg p-8">
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop"
                    alt="AI Generated Art Example"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Section */}
      <div id="edit" className="mb-20 scroll-mt-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 lg:px-16">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-gray-100 rounded-lg p-8">
                  <img
                    src="https://images.unsplash.com/photo-1635002962487-2c1d4d2f63c3?q=80&w=2000&auto=format&fit=crop"
                    alt="Image Editing Example"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center">
                  <Edit className="h-8 w-8 text-indigo-600" />
                  <h2 className="ml-3 text-3xl font-bold text-gray-900">Smart Image Editing</h2>
                </div>
                <p className="mt-6 text-lg text-gray-600">
                  Transform your existing photos with our AI-powered editing tools. Make complex edits 
                  with simple text instructions.
                </p>
                <div className="mt-8 space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Wand2 className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">Natural Language Editing</h3>
                      <p className="mt-2 text-gray-600">
                        Describe the changes you want in plain English, and our AI will understand and 
                        apply them to your image.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Layout className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900">Smart Adjustments</h3>
                      <p className="mt-2 text-gray-600">
                        Change backgrounds, adjust lighting, remove objects, and more with our 
                        intelligent editing features.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-10">
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Try Image Editing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Solutions;