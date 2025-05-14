// src/components/dashboard/CustomizeTab.tsx
import React, { useState, useEffect } from 'react';
import { getBooths, uploadMedia, deleteMedia } from '../../services/media';
import type { Booth, MediaType } from '../../types/media';
import Card from '../ui/Card';
import Button from '../ui/button';
import { BOOTH_MEDIA_BASE_URL, BOOTH_NAME, BOOTHID } from '../../utils/data';

const MEDIA_CONFIGS = [
  { type: 'IMAGE' as const, label: 'Images', maxPositions: 4 },
  { type: 'VIDEO' as const, label: 'Videos', maxPositions: 3 },
  { type: 'AUDIO' as const, label: 'Audio Files', maxPositions: 1 },
  { type: 'PDF' as const, label: 'PDFs', maxPositions: 4 }
];

const CustomizeTab: React.FC = () => {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('IMAGE');
  const [position, setPosition] = useState<string>('1');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooths = async () => {
      try {
        const data = await getBooths();
        console.log('Booths data:', data);
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

  // Reset position when media type changes
  useEffect(() => {
    setPosition('1');
  }, [mediaType]);

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

  // Get max positions for current media type
  const currentMediaConfig = MEDIA_CONFIGS.find(config => config.type === mediaType);
  const maxPositions = currentMediaConfig ? currentMediaConfig.maxPositions : 4;

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
                <option key={BOOTHID} value={BOOTHID}>
                  {BOOTH_NAME}
                </option>
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
                <option value="IMAGE">PDF THUMBNAIL</option>
                <option value="VIDEO">Video</option>
                <option value="AUDIO">Audio</option>
                <option value="PDF">PDF</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Position
              </label>
              <select
                id="position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                required
              >
                {[...Array(maxPositions)].map((_, index) => (
                  <option key={index + 1} value={String(index + 1)}>
                    Position {index + 1}
                  </option>
                ))}
              </select>
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
        <Card title={`Current Media`} className="mt-8">
          <div className="space-y-6">
            {MEDIA_CONFIGS.map(({ type, label, maxPositions }) => (
              <div key={type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{label}</h3>
                  <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full dark:bg-blue-900 dark:text-blue-100">
                    {maxPositions} {maxPositions === 1 ? type.toLowerCase() : type.toLowerCase() + 's'}
                  </span>
                </div>
                
                {selectedBoothData.medias[type]?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedBoothData.medias[type].map((media) => (
                      <div key={media.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow" style={{ width: 'fit-content' }}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Position: {media.mediaPosition}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs" title={media.fileUrl || media.fileName}>
                              {media.fileName || media.fileUrl}
                            </p>
                          </div>
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteMedia(media.id)}
                            className="ml-2"
                            aria-label="Delete media"
                          >
                            Delete
                          </Button>
                        </div>
                        
                        {/* Preview based on media type */}
                        {type === 'IMAGE' && (
                          <div className="mt-2 bg-gray-100 dark:bg-gray-800 rounded">
                            <img 
                              src={BOOTH_MEDIA_BASE_URL + type + "/" + media.fileUrl} 
                              alt={`${media.fileName || `Position ${media.mediaPosition}`}`} 
                              className="w-full h-auto object-contain rounded max-h-32"
                              loading="lazy"
                            />
                          </div>
                        )}
                        
                        {type === 'VIDEO' && (
                          <div className="mt-2">
                            <video 
                              src={BOOTH_MEDIA_BASE_URL + type + "/" + media.fileUrl} 
                              controls 
                              className="w-full h-auto max-h-32 rounded"
                              preload="metadata"
                            >
                              Your browser does not support video playback.
                            </video>
                          </div>
                        )}
                        
                        {type === 'AUDIO' && (
                          <div className="mt-2">
                            <audio 
                              src={BOOTH_MEDIA_BASE_URL + type + "/" + media.fileUrl} 
                              controls 
                              className="w-full"
                              preload="metadata"
                            >
                              Your browser does not support audio playback.
                            </audio>
                          </div>
                        )}
                        
                        {type === 'PDF' && (
                          <div className="mt-2 flex justify-center">
                            <a 
                              href={BOOTH_MEDIA_BASE_URL + type + "/" + media.fileUrl} 
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
                  <p className="text-gray-500 dark:text-gray-400 italic">No {type.toLowerCase()} files uploaded yet.</p>
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