import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { Upload, Paintbrush } from 'lucide-react';
import { editImage } from '../services/imageApi';

// Predefined edit options with their corresponding prompts
const EDIT_OPTIONS = {
  enhance: {
    label: 'Quick Enhance',
    isCustom: false,
    options: [
      { value: 'teeth-whiten', label: 'Whiten Teeth', prompt: 'Transform this image by naturally whitening and brightening the teeth while maintaining a realistic appearance' },
      { value: 'skin-smooth', label: 'Smooth Skin', prompt: 'Transform this image by smoothing and evening out skin texture while preserving natural features' },
      { value: 'remove-blemishes', label: 'Remove Blemishes', prompt: 'Transform this image by removing skin blemishes and imperfections while maintaining natural skin texture' },
      { value: 'brighten-eyes', label: 'Brighten Eyes', prompt: 'Transform this image by enhancing and brightening eyes while maintaining natural appearance' },
      { value: 'reduce-wrinkles', label: 'Reduce Wrinkles', prompt: 'Transform this image by subtly reducing the appearance of wrinkles while maintaining natural skin texture' }
    ]
  },
  background: {
    label: 'Change Background',
    isCustom: true,
    placeholder: 'Describe the new background (e.g., "a sunset beach with palm trees")',
    promptPrefix: 'Transform this image by changing the background to'
  },
  lighting: {
    label: 'Adjust Lighting',
    isCustom: true,
    placeholder: 'Describe the lighting effect (e.g., "soft natural daylight from the left")',
    promptPrefix: 'Transform this image by adjusting the lighting to create'
  },
  color: {
    label: 'Color Adjustment',
    isCustom: true,
    placeholder: 'Describe the color changes (e.g., "warmer tones with enhanced blues")',
    promptPrefix: 'Transform this image by adjusting the colors to have'
  },
  style: {
    label: 'Apply Style',
    isCustom: false,
    options: [
      { value: 'watercolor', label: 'Watercolor', prompt: 'Transform this image into a watercolor painting style while preserving the main subject' },
      { value: 'oil-painting', label: 'Oil Painting', prompt: 'Transform this image into an oil painting style with rich textures' },
      { value: 'pencil-sketch', label: 'Pencil Sketch', prompt: 'Transform this image into a detailed pencil sketch' },
      { value: 'pop-art', label: 'Pop Art', prompt: 'Transform this image into pop art style with bold colors' },
      { value: 'anime', label: 'Anime', prompt: 'Transform this image into anime style artwork' }
    ]
  },
  retouch: {
    label: 'Portrait Retouch',
    isCustom: false,
    options: [
      { value: 'professional', label: 'Professional Headshot', prompt: 'Transform this image into a professional headshot with perfect lighting and subtle retouching' },
      { value: 'glamour', label: 'Glamour', prompt: 'Transform this image by applying glamour retouching while maintaining natural features' },
      { value: 'natural', label: 'Natural Enhancement', prompt: 'Transform this image with subtle enhancement while maintaining a very natural look' }
    ]
  },
  remove: {
    label: 'Remove Elements',
    isCustom: true,
    placeholder: 'Describe what to remove (e.g., "the person in the background")',
    promptPrefix: 'Transform this image by carefully removing'
  },
  adjust: {
    label: 'Adjust Features',
    isCustom: true,
    placeholder: 'Describe the adjustment (e.g., "make smile slightly wider")',
    promptPrefix: 'Transform this image by subtly adjusting'
  }
};

function Edit() {
  const { user } = useAuth();
  const { updateUsage } = useUser();
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [editType, setEditType] = useState<keyof typeof EDIT_OPTIONS>('enhance');
  const [selectedOption, setSelectedOption] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSourceImage(file);
      setSourceImageUrl(URL.createObjectURL(file));
      setEditedImage(null);
    }
  };

  const getPrompt = () => {
    const editOption = EDIT_OPTIONS[editType];
    if (editOption.isCustom) {
      return `${editOption.promptPrefix} ${customPrompt}`;
    } else {
      const option = editOption.options.find(opt => opt.value === selectedOption);
      return option?.prompt || '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceImageUrl) {
      setError('Please upload an image to edit');
      return;
    }
    if (!user) {
      setError('Please log in to edit images');
      return;
    }

    const prompt = getPrompt();
    if (!prompt) {
      setError('Please provide editing instructions');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const imageUrl = await editImage({
        imageUrl: sourceImageUrl,
        instructions: prompt,
        userId: user.id
      });

      setEditedImage(imageUrl);
      await updateUsage('edit');
    } catch (err) {
      setError('Failed to edit image. Please try again.');
      console.error('Edit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as keyof typeof EDIT_OPTIONS;
    setEditType(newType);
    setSelectedOption('');
    setCustomPrompt('');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-medium text-primary-900">Edit Image</h1>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="label">
                Upload Image to Edit
              </label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-primary-300 border-dashed rounded-lg">
                <div className="space-y-2 text-center">
                  <Upload className="mx-auto h-12 w-12 text-primary-400" />
                  <div className="flex text-sm">
                    <label
                      htmlFor="source-image"
                      className="relative cursor-pointer font-medium text-accent-600 hover:text-accent-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="source-image"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="pl-1 text-primary-500">or drag and drop</p>
                  </div>
                  <p className="text-xs text-primary-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="edit-type" className="label">
                  Edit Type
                </label>
                <select
                  id="edit-type"
                  value={editType}
                  onChange={handleEditTypeChange}
                  className="input mt-2"
                >
                  {Object.entries(EDIT_OPTIONS).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {EDIT_OPTIONS[editType].isCustom ? (
                <div>
                  <label htmlFor="custom-prompt" className="label">
                    {EDIT_OPTIONS[editType].label} Instructions
                  </label>
                  <textarea
                    id="custom-prompt"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={EDIT_OPTIONS[editType].placeholder}
                    rows={3}
                    className="input mt-2"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="edit-option" className="label">
                    Select Option
                  </label>
                  <select
                    id="edit-option"
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="input mt-2"
                  >
                    <option value="">Select an option</option>
                    {EDIT_OPTIONS[editType].options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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
              disabled={loading || !sourceImageUrl || (!selectedOption && !customPrompt)}
              className="btn-accent w-full flex justify-center items-center"
            >
              {loading ? (
                'Editing...'
              ) : (
                <>
                  <Paintbrush className="w-4 h-4 mr-2" />
                  Edit Image
                </>
              )}
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="card p-8">
          <h2 className="text-xl font-medium text-primary-900 mb-6">Preview</h2>
          
          {sourceImageUrl && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-primary-700 mb-4">Original Image</h3>
              <img
                src={sourceImageUrl}
                alt="Original"
                className="w-full aspect-square object-cover rounded-lg"
              />
            </div>
          )}

          {editedImage ? (
            <div>
              <h3 className="text-sm font-medium text-primary-700 mb-4">Edited Image</h3>
              <img
                src={editedImage}
                alt="Edited"
                className="w-full aspect-square object-cover rounded-lg"
              />
            </div>
          ) : (
            <div className="aspect-square flex items-center justify-center bg-primary-100 rounded-lg">
              <p className="text-primary-500">Edited image will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Edit;