import axios from 'axios';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Image = Database['public']['Tables']['images']['Row'];

// Configuration for APIs
const OPENAI_API_URL = 'https://api.openai.com/v1/images/generations';
const OPENAI_EDIT_URL = 'https://api.openai.com/v1/images/edits';
const GOOGLE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/imagegeneration:generateContent';

// Style prompts mapping
const STYLE_PROMPTS: Record<string, string> = {
  'realistic': 'a photorealistic image of',
  'anime': 'an anime style illustration of',
  'studio-ghibli': 'a Studio Ghibli style animation of',
  'watercolor': 'a watercolor painting of',
  'oil-painting': 'an oil painting of',
  'digital-art': 'digital art of',
  'pixel-art': 'pixel art of',
  'sketch': 'a detailed sketch of',
};

// API keys
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;

type Provider = 'openai' | 'google';
let currentProvider: Provider = 'openai';

const trackApiRequest = async (
  userId: string,
  endpoint: string,
  startTime: number,
  status: number,
  userAgent: string
) => {
  try {
    const { error } = await supabase.from('api_requests').insert({
      user_id: userId,
      endpoint,
      status,
      response_time: Date.now() - startTime,
      user_agent: userAgent,
      ip_address: 'client-side', // Actual IP will be logged by Supabase
    });

    if (error) throw error;
  } catch (err) {
    console.error('Error tracking API request:', err);
  }
};

const checkRateLimit = async (userId: string): Promise<boolean> => {
  try {
    const { data: usage, error } = await supabase
      .rpc('check_rate_limit', { user_id: userId });

    if (error) throw error;
    return usage;
  } catch (err) {
    console.error('Error checking rate limit:', err);
    return false;
  }
};

export const setProvider = (provider: Provider): boolean => {
  if (provider === 'openai' || provider === 'google') {
    currentProvider = provider;
    return true;
  }
  return false;
};

interface GenerateImageOptions {
  prompt: string;
  style?: keyof typeof STYLE_PROMPTS;
  referenceImageUrl?: string | null;
  userId: string;
}

export const generateImage = async ({
  prompt,
  style = 'realistic',
  referenceImageUrl = null,
  userId
}: GenerateImageOptions): Promise<string> => {
  const startTime = Date.now();
  
  try {
    // Check rate limit before proceeding
    const isAllowed = await checkRateLimit(userId);
    if (!isAllowed) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const stylePrompt = STYLE_PROMPTS[style] || '';
    let enhancedPrompt = stylePrompt ? `${stylePrompt} ${prompt}` : prompt;
    
    if (referenceImageUrl) {
      enhancedPrompt += ` (reference image provided)`;
    }
    
    let imageUrl: string;
    if (currentProvider === 'openai') {
      imageUrl = await generateWithOpenAI(enhancedPrompt, referenceImageUrl);
    } else {
      imageUrl = await generateWithGoogle(enhancedPrompt, referenceImageUrl);
    }

    // Track successful API request
    await trackApiRequest(
      userId,
      'generate_image',
      startTime,
      200,
      navigator.userAgent
    );

    // Save to Supabase
    if (imageUrl.startsWith('data:')) {
      const fileName = `${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('generated_images')
        .upload(`${userId}/${fileName}`, base64ToBlob(imageUrl), {
          contentType: 'image/png',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('generated_images')
        .getPublicUrl(`${userId}/${fileName}`);
        
      imageUrl = publicUrl;
    }
    
    // Save to database
    const { error } = await supabase
      .from('images')
      .insert([{
        user_id: userId,
        url: imageUrl,
        prompt,
        style,
        is_edited: false,
      }]);
      
    if (error) throw error;
    
    return imageUrl;
  } catch (error) {
    // Track failed API request
    await trackApiRequest(
      userId,
      'generate_image',
      startTime,
      error.status || 500,
      navigator.userAgent
    );
    
    console.error('Image generation error:', error);
    throw error;
  }
};

interface EditImageOptions {
  imageUrl: string;
  instructions: string;
  userId: string;
}

export const editImage = async ({
  imageUrl,
  instructions,
  userId
}: EditImageOptions): Promise<string> => {
  try {
    let editedImageUrl: string;
    if (currentProvider === 'openai') {
      editedImageUrl = await editWithOpenAI(imageUrl, instructions);
    } else {
      editedImageUrl = await editWithGoogle(imageUrl, instructions);
    }
    
    // Get original image ID
    const { data: originalImage } = await supabase
      .from('images')
      .select('id')
      .eq('url', imageUrl)
      .eq('user_id', userId)
      .single();
    
    // Upload edited image if it's a data URL
    if (editedImageUrl.startsWith('data:')) {
      const fileName = `${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('generated_images')
        .upload(`${userId}/${fileName}`, base64ToBlob(editedImageUrl), {
          contentType: 'image/png',
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('generated_images')
        .getPublicUrl(`${userId}/${fileName}`);
        
      editedImageUrl = publicUrl;
    }
    
    // Save to database
    const { error } = await supabase
      .from('images')
      .insert([{
        user_id: userId,
        url: editedImageUrl,
        edit_instructions: instructions,
        is_edited: true,
        original_image_id: originalImage?.id
      }]);
      
    if (error) throw error;
    
    return editedImageUrl;
  } catch (error) {
    console.error('Image editing error:', error);
    throw error;
  }
};

const generateWithOpenAI = async (prompt: string, referenceImageUrl: string | null = null): Promise<string> => {
  const requestBody: Record<string, any> = {
    prompt: referenceImageUrl 
      ? `${prompt} (similar to the reference image)`
      : prompt,
    n: 1,
    size: '1024x1024',
  };

  const response = await axios.post(
    OPENAI_API_URL,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    }
  );
  
  return response.data.data[0].url;
};

const generateWithGoogle = async (prompt: string, referenceImageUrl: string | null = null): Promise<string> => {
  const requestBody: Record<string, any> = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      topK: 32,
      topP: 1,
      maxOutputTokens: 4096,
    },
  };
  
  if (referenceImageUrl) {
    const base64Image = await getBase64FromUrl(referenceImageUrl, true);
    requestBody.contents[0].parts.unshift({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image,
      },
    });
  }
  
  const response = await axios.post(
    `${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}`,
    requestBody,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  return response.data.candidates[0].content.parts[0].text;
};

const editWithOpenAI = async (imageUrl: string, instructions: string): Promise<string> => {
  const imageBase64 = await getBase64FromUrl(imageUrl);
  
  const formData = new FormData();
  formData.append('image', base64ToBlob(imageBase64));
  formData.append('prompt', instructions);
  formData.append('n', '1');
  formData.append('size', '1024x1024');
  
  const response = await axios.post(
    OPENAI_EDIT_URL,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    }
  );
  
  return response.data.data[0].url;
};

const editWithGoogle = async (imageUrl: string, instructions: string): Promise<string> => {
  const base64Image = await getBase64FromUrl(imageUrl, true);
  
  const response = await axios.post(
    `${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}`,
    {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              text: instructions,
            },
          ],
        },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  return response.data.candidates[0].content.parts[0].inlineData.data;
};

const getBase64FromUrl = async (url: string, removePrefix = false): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(removePrefix ? base64String.split(',')[1] : base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const base64ToBlob = (base64: string): Blob => {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'image/png';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
};