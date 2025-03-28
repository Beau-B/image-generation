import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { Wand2 } from 'lucide-react';
import { generateImage } from '../services/imageApi';
import { STYLE_OPTIONS } from '../constants/styles';

function Generate() {
  const { user } = useAuth();
  const { updateUsage } = useUser();
  const [prompt, setPrompt] = useState('');
  const [styleCategory, setStyleCategory] = useState('artistic');
  const [style, setStyle] = useState('watercolor');
  const [customStyle, setCustomStyle] = useState('');
  const [referenceTitle, setReferenceTitle] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEnhancedPrompt = () => {
    let enhancedPrompt = prompt;
    
    if (styleCategory === 'custom') {
      enhancedPrompt = `${enhancedPrompt}, ${customStyle}`;
    } else {
      const selectedStyle = STYLE_OPTIONS[styleCategory as keyof typeof STYLE_OPTIONS]
        .find(s => s.value === style);
      
      if (styleCategory === 'entertainment' && referenceTitle) {
        enhancedPrompt = `${enhancedPrompt}, ${selectedStyle?.prompt} ${referenceTitle}`;
      } else {
        enhancedPrompt = `${enhancedPrompt}, ${selectedStyle?.prompt}`;
      }
    }

    return enhancedPrompt;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) {
      setError('Please enter a prompt');
      return;
    }
    if (!user) {
      setError('Please log in to generate images');
      return;
    }

    if (styleCategory === 'custom' && !customStyle) {
      setError('Please enter a custom style description');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const imageUrl = await generateImage({
        prompt: getEnhancedPrompt(),
        style: styleCategory === 'custom' ? 'custom' : style,
        referenceImageUrl: null,
        userId: user.id
      });

      setGeneratedImage(imageUrl);
      await updateUsage('generate');
    } catch (err) {
      setError('Failed to generate image. Please try again.');
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-medium text-primary-900">Generate Image</h1>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="prompt" className="label">
                Describe your image
              </label>
              <textarea
                id="prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="input mt-2"
                placeholder="A serene lake at sunset with mountains in the background..."
              />
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="style-category" className="label">
                  Style Category
                </label>
                <select
                  id="style-category"
                  value={styleCategory}
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    setStyleCategory(newCategory);
                    if (newCategory === 'custom') {
                      setStyle('custom');
                    } else {
                      setStyle(STYLE_OPTIONS[newCategory as keyof typeof STYLE_OPTIONS][0].value);
                    }
                    setCustomStyle('');
                    setReferenceTitle('');
                  }}
                  className="input mt-2"
                >
                  <option value="custom">Custom Style</option>
                  {Object.keys(STYLE_OPTIONS).filter(cat => cat !== 'custom').map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {styleCategory === 'custom' ? (
                <div>
                  <label htmlFor="custom-style" className="label">
                    Custom Style Description
                  </label>
                  <textarea
                    id="custom-style"
                    value={customStyle}
                    onChange={(e) => setCustomStyle(e.target.value)}
                    placeholder="Describe your custom style (e.g., 'stained glass with vibrant colors and bold outlines')"
                    rows={3}
                    className="input mt-2"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="style" className="label">
                    Style
                  </label>
                  <select
                    id="style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="input mt-2"
                  >
                    {STYLE_OPTIONS[styleCategory as keyof typeof STYLE_OPTIONS].map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {styleCategory === 'entertainment' && (
                <div>
                  <label htmlFor="reference-title" className="label">
                    Reference Title
                  </label>
                  <input
                    type="text"
                    id="reference-title"
                    value={referenceTitle}
                    onChange={(e) => setReferenceTitle(e.target.value)}
                    placeholder="Enter movie, TV show, or game title..."
                    className="input mt-2"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="bg-error-50 text-error-700 p-4 rounded-lg text-sm" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !prompt || (styleCategory === 'custom' && !customStyle)}
              className="btn-accent w-full flex justify-center items-center"
            >
              {loading ? (
                'Generating...'
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Image
                </>
              )}
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="card p-8">
          <h2 className="text-xl font-medium text-primary-900 mb-6">Preview</h2>
          
          {generatedImage ? (
            <div>
              <h3 className="text-sm font-medium text-primary-700 mb-4">Generated Image</h3>
              <img
                src={generatedImage}
                alt="Generated"
                className="w-full aspect-square object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="aspect-square flex items-center justify-center bg-primary-100 rounded-lg">
              <p className="text-primary-500">Generated image will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Generate;