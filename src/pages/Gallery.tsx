import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { Image as ImageIcon, Edit as EditIcon, Filter } from 'lucide-react';

type Image = Database['public']['Tables']['images']['Row'];

function Gallery() {
  const { userData } = useUser();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'generated' | 'edited'>('all');

  useEffect(() => {
    async function loadImages() {
      try {
        let query = supabase
          .from('images')
          .select('*')
          .order('created_at', { ascending: false });

        if (filter === 'generated') {
          query = query.eq('is_edited', false);
        } else if (filter === 'edited') {
          query = query.eq('is_edited', true);
        }

        const { data, error } = await query;

        if (error) throw error;
        setImages(data || []);
      } catch (err) {
        console.error('Error loading images:', err);
        setError('Failed to load images');
      } finally {
        setLoading(false);
      }
    }

    loadImages();
  }, [filter]);

  if (loading) {
    return (
      <div className="container-lg">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-medium text-primary-900">Gallery</h1>
        
        <div className="flex items-center space-x-2 bg-white rounded-lg shadow-subtle p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-accent-100 text-accent-700'
                : 'text-primary-700 hover:bg-primary-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('generated')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'generated'
                ? 'bg-accent-100 text-accent-700'
                : 'text-primary-700 hover:bg-primary-50'
            }`}
          >
            Generated
          </button>
          <button
            onClick={() => setFilter('edited')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'edited'
                ? 'bg-accent-100 text-accent-700'
                : 'text-primary-700 hover:bg-primary-50'
            }`}
          >
            Edited
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-6 bg-error-50 text-error-700 p-4 rounded-lg text-sm" role="alert">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <div key={image.id} className="card overflow-hidden animate-fade-in">
            <div className="aspect-square">
              <img
                src={image.url}
                alt={image.prompt || 'Generated image'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {image.is_edited ? (
                    <span className="badge-accent flex items-center space-x-1">
                      <EditIcon className="h-3 w-3" />
                      <span>Edited</span>
                    </span>
                  ) : (
                    <span className="badge-primary flex items-center space-x-1">
                      <ImageIcon className="h-3 w-3" />
                      <span>Generated</span>
                    </span>
                  )}
                </div>
                <span className="text-sm text-primary-500">
                  {new Date(image.created_at).toLocaleDateString()}
                </span>
              </div>
              {image.prompt && (
                <p className="text-sm text-primary-700 line-clamp-2">
                  {image.prompt}
                </p>
              )}
              {image.edit_instructions && (
                <p className="text-sm text-primary-700 line-clamp-2">
                  {image.edit_instructions}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="mt-8 card p-12 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-primary-400" />
          <h3 className="mt-4 text-lg font-medium text-primary-900">No images found</h3>
          <p className="mt-2 text-sm text-primary-600">
            {filter === 'all'
              ? 'Get started by generating or editing some images.'
              : filter === 'generated'
              ? 'No generated images found. Try creating some!'
              : 'No edited images found. Try editing some images!'}
          </p>
        </div>
      )}
    </div>
  );
}

export default Gallery;