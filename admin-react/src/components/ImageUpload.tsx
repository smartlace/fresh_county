'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import env from '@/config/env';
import { getProxiedImageUrl } from '@/utils/imageProxy';

interface ImageUploadProps {
  currentImage?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved?: () => void;
  className?: string;
  accept?: string;
  maxSize?: number; // in bytes
  uploadType?: 'product' | 'category' | 'blog'; // New prop to specify upload type
}

export default function ImageUpload({
  currentImage,
  onImageUploaded,
  onImageRemoved,
  className = '',
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  uploadType = 'product' // Default to product for backward compatibility
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  // Update preview when currentImage changes
  React.useEffect(() => {
    console.log('ImageUpload useEffect: currentImage changed to:', currentImage);
    setPreview(currentImage || null);
  }, [currentImage]);

  // Debug log for preview state
  React.useEffect(() => {
    console.log('ImageUpload preview state changed to:', preview);
  }, [preview]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('featured_image', file);

      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      
      // Choose endpoint based on upload type
      let endpoint = `${env.API_URL}/api/upload/product-image`; // default
      if (uploadType === 'category') {
        endpoint = `${env.API_URL}/api/upload/category-image`;
      } else if (uploadType === 'blog') {
        endpoint = `${env.API_URL}/api/upload/blog-image`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('Upload response:', data);
        console.log('Image URL:', data.data.url);
        toast.success('Image uploaded successfully');
        onImageUploaded(data.data.url);
        setPreview(data.data.url);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(errorMessage);
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemoved) {
      onImageRemoved();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        // Handle dropped file directly
        uploadFile(file);
      } else {
        toast.error('Please drop a valid image file');
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="spinner mb-2"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : preview ? (
          <div className="relative">
            <Image
              src={preview.startsWith('data:') ? preview : getProxiedImageUrl(preview)}
              alt="Preview"
              width={200}
              height={200}
              className="max-w-full max-h-48 mx-auto rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-600 mb-2">
              Drop an image here, or click to select
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WebP up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}