import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-white border-t border-primary-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-accent-600" />
              <span className="text-xl font-medium text-primary-900">StyleAI</span>
            </Link>
            <p className="mt-4 text-sm text-primary-600">
              Create amazing images and transform your photos with the power of AI.
            </p>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-primary-900 uppercase tracking-wider">
              Product
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/pricing" className="text-base text-primary-600 hover:text-primary-900">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-primary-900 uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/about" className="text-base text-primary-600 hover:text-primary-900">
                  About
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-base text-primary-600 hover:text-primary-900">
                  Blog
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-primary-600 hover:text-primary-900 flex items-center space-x-1"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-primary-900 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/privacy" className="text-base text-primary-600 hover:text-primary-900">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-primary-600 hover:text-primary-900">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-primary-200 pt-8">
          <p className="text-base text-primary-500 text-center">
            &copy; {new Date().getFullYear()} StyleAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;