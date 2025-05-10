// src/components/dashboard/CustomizeTab.tsx
import React, { useState, useEffect } from 'react';
import { getBooths, uploadMedia, deleteMedia } from '../../services/media';
import type { Booth, MediaType } from '../../types/media';
import Card from '../ui/Card';
import Button from '../ui/button';

const CustomizeTab: React.FC = () => {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [position, setPosition] = useState<string>('1');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooths = async () => {
      try {
        const data = await getBooths();
        setBooths(data);
        if (data.length > 0) {
          setSelectedBooth(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching booths:', err);
        setError('Failed to load booth data');
      } finally {
        setLoading(false);
      }
    };

    fetchBooths();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !selectedBooth || !position) {
      setError('Please select a file, booth, and position');
      return;
    }
    
    setUploadLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await uploadMedia(mediaType, selectedBooth, position, selectedFile);
      
      // Refresh booth data
      const updatedBooths = await getBooths();
      setBooths(updatedBooths);
      
      // Reset form
      setSelectedFile(null);
      setSuccessMessage('Media uploaded successfully!');
      
      // Reset file input
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload media');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!window.confirm('Are you sure you want to delete this media?')) {
      return;
    }
    
    try {
      await deleteMedia(mediaId);
      
      // Refresh booth data
      const updatedBooths = await getBooths();
      setBooths(updatedBooths);
      
      setSuccessMessage('Media deleted successfully!');
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete media');
    }
  };

  const selectedBoothData = booths.find(booth => booth.id === selectedBooth);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Customize Booth Media</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success:</strong>
          <span className="block sm:inline"> {successMessage}</span>
        </div>
      )}
      
      {/* Upload Form */}
      <Card title="Upload Media">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="boothSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Booth
              </label>
              <select
                id="boothSelect"
                value={selectedBooth}
                onChange={(e) => setSelectedBooth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="">Select a booth</option>
                {booths.map((booth) => (
                  <option key={booth.id} value={booth.id}>
                    {booth.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="mediaType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Media Type
              </label>
              <select
                id="mediaType"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as MediaType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Position
              </label>
              <input
                type="text"
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Position (e.g. 1, 2, etc.)"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="fileInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Upload File
            </label>
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={uploadLoading || !selectedFile}
            className="w-full md:w-auto"
          >
            {uploadLoading ? 'Uploading...' : 'Upload Media'}
          </Button>
        </form>
      </Card>
      
      {/* Current Media Display */}
      {selectedBoothData && (
        <Card title={`Current Media for ${selectedBoothData.name}`} className="mt-8">
          <div className="space-y-6">
            {['image', 'video', 'audio', 'pdf'].map((type) => (
              <div key={type} className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white capitalize">{type}s</h3>
                
                {selectedBoothData.medias[type as MediaType]?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedBoothData.medias[type as MediaType].map((media) => (
                      <div key={media.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Position: {media.position}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{media.url}</p>
                          </div>
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteMedia(media.id)}
                            className="ml-2"
                          >
                            Delete
                          </Button>
                        </div>
                        
                        {/* Preview based on media type */}
                        {type === 'image' && (
                          <div className="mt-2 bg-gray-100 dark:bg-gray-800 rounded">
                            <img 
                              src={media.url} 
                              alt={`Position ${media.position}`} 
                              className="w-full h-auto object-contain rounded max-h-32"
                            />
                          </div>
                        )}
                        
                        {type === 'video' && (
                          <div className="mt-2">
                            <video 
                              src={media.url} 
                              controls 
                              className="w-full h-auto max-h-32 rounded"
                            >
                              Your browser does not support video playback.
                            </video>
                          </div>
                        )}
                        
                        {type === 'audio' && (
                          <div className="mt-2">
                            <audio 
                              src={media.url} 
                              controls 
                              className="w-full"
                            >
                              Your browser does not support audio playback.
                            </audio>
                          </div>
                        )}
                        
                        {type === 'pdf' && (
                          <div className="mt-2 flex justify-center">
                            <a 
                              href={media.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded"
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5 mr-2" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                                />
                              </svg>
                              View PDF
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No {type}s uploaded yet.</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* No booths message */}
      {booths.length === 0 && (
        <div className="mt-8 text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-300">No booths available. Please create a booth first.</p>
        </div>
      )}
    </div>
  );
};

export default CustomizeTab;