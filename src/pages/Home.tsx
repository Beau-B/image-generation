import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ImagePlus, Edit, Shield, ArrowRight, Star, Zap } from 'lucide-react';

function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative isolate">
        <div className="mx-auto max-w-4xl py-24">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-primary-600 ring-1 ring-primary-200 hover:ring-primary-300">
                New features available.{' '}
                <Link to="/solutions" className="font-semibold text-accent-600">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Learn more <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
            <h1 className="text-4xl font-medium tracking-tight text-primary-900 sm:text-6xl">
              Transform Your Ideas Into{' '}
              <span className="relative whitespace-nowrap">
                <span className="relative bg-gradient-to-r from-accent-600 to-accent-400 bg-clip-text text-transparent">
                  Stunning Visuals
                </span>
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-primary-600 max-w-2xl mx-auto">
              Harness the power of AI to create and edit images that perfectly capture your vision.
              From concept to masterpiece in seconds.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/signup"
                className="btn-accent text-base px-6 py-3"
              >
                Start Creating
              </Link>
              <Link
                to="/pricing"
                className="group text-base font-medium text-primary-900 hover:text-primary-700"
              >
                See Pricing
                <ArrowRight className="inline-block ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="border-y border-primary-200 bg-white mt-16">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-lg font-semibold leading-8 text-accent-600">
              Trusted by creators worldwide
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center gap-2">
                <p className="text-4xl font-semibold tracking-tight text-primary-900">1M+</p>
                <p className="text-base leading-7 text-primary-600">Images Created</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-4xl font-semibold tracking-tight text-primary-900">100k+</p>
                <p className="text-base leading-7 text-primary-600">Active Users</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-4xl font-semibold tracking-tight text-primary-900">50+</p>
                <p className="text-base leading-7 text-primary-600">AI Models</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-4xl font-semibold tracking-tight text-primary-900">4.9</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-medium tracking-tight text-primary-900 sm:text-4xl">
              Everything you need to create amazing images
            </h2>
            <p className="mt-6 text-lg leading-8 text-primary-600">
              Powerful tools that make image creation and editing effortless
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-8 lg:max-w-none lg:grid-cols-3">
              <div className="card p-8 hover:scale-105 transition-transform duration-300">
                <div className="mb-6">
                  <div className="rounded-lg bg-accent-100 p-2 w-fit">
                    <ImagePlus className="h-6 w-6 text-accent-600" />
                  </div>
                </div>
                <dt className="text-xl font-medium text-primary-900">AI Image Generation</dt>
                <dd className="mt-4 text-base leading-7 text-primary-600">
                  Turn your ideas into stunning visuals with our advanced AI. Choose from various
                  styles and get professional results in seconds.
                </dd>
              </div>
              <div className="card p-8 hover:scale-105 transition-transform duration-300">
                <div className="mb-6">
                  <div className="rounded-lg bg-accent-100 p-2 w-fit">
                    <Edit className="h-6 w-6 text-accent-600" />
                  </div>
                </div>
                <dt className="text-xl font-medium text-primary-900">Smart Editing</dt>
                <dd className="mt-4 text-base leading-7 text-primary-600">
                  Transform your photos with AI-powered editing tools. Perfect for retouching,
                  style transfer, and creative enhancements.
                </dd>
              </div>
              <div className="card p-8 hover:scale-105 transition-transform duration-300">
                <div className="mb-6">
                  <div className="rounded-lg bg-accent-100 p-2 w-fit">
                    <Zap className="h-6 w-6 text-accent-600" />
                  </div>
                </div>
                <dt className="text-xl font-medium text-primary-900">Lightning Fast</dt>
                <dd className="mt-4 text-base leading-7 text-primary-600">
                  Get results in seconds, not minutes. Our optimized AI models deliver
                  high-quality images with minimal wait time.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative isolate px-6 pb-32">
        <div className="card mx-auto max-w-2xl text-center p-12">
          <h2 className="text-3xl font-medium tracking-tight text-primary-900">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-600">
            Join thousands of creators who use StyleAI to bring their ideas to life.
            Start with our free tier and upgrade when you're ready.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/signup"
              className="btn-accent text-base px-6 py-3"
            >
              Get Started Free
            </Link>
            <Link
              to="/pricing"
              className="text-base font-medium text-primary-900 hover:text-primary-700"
            >
              View Pricing <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;