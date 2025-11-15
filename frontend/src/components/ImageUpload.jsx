import { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';

/**
 * ImageUpload Component - Prepared for Supabase Integration
 * 
 * This component provides a UI for image uploads and is ready
 * to integrate with Supabase storage when needed.
 * 
 * Future Supabase Integration:
 * 1. Install: npm install @supabase/supabase-js
 * 2. Initialize Supabase client
 * 3. Upload to bucket and get public URL
 * 4. Store URL in blockchain metadata
 */
function ImageUpload({ 
  label = "Upload Image", 
  onImageSelect, 
  currentImage = null,
  accept = "image/*",
  maxSizeMB = 5 
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(currentImage);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
    if (onImageSelect) {
      onImageSelect(file);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    if (onImageSelect) {
      onImageSelect(null);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="relative">
        {preview ? (
          <div className="relative group">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs rounded-b-lg">
              {selectedFile?.name || 'Current image'}
            </div>
          </div>
        ) : (
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer">
            <ImagePlus className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to {maxSizeMB}MB
            </p>
            <p className="text-xs text-orange-600 mt-2 font-medium">
              📦 Supabase integration ready!
            </p>
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Instructions for Supabase Integration */}
      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
        <p className="font-semibold text-blue-700 mb-1">🚀 Ready for Supabase</p>
        <p>
          This component is prepared for Supabase storage integration.
          Images will be stored on Supabase and URLs saved to blockchain.
        </p>
      </div>
    </div>
  );
}

export default ImageUpload;

/* 
  FUTURE SUPABASE INTEGRATION EXAMPLE:
  
  import { createClient } from '@supabase/supabase-js'
  
  const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_KEY
  )
  
  async function uploadToSupabase(file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
    const filePath = `restaurants/${fileName}`
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file)
    
    if (error) throw error
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)
    
    return publicUrl
  }
*/

