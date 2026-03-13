import React, { useState, useEffect, useRef } from 'react';
import { getBooths, uploadMedia, deleteMedia } from '../../services/media';
import type { Booth, MediaType, MediaItem } from '../../types/media';
import Card from '../ui/Card';
import Button from '../ui/button';
import { BOOTH_MEDIA_BASE_URL, BOOTH_NAME, BOOTHID } from '../../utils/data';

const MEDIA_CONFIGS = [
  { type: 'IMAGE' as const, label: 'Images', maxPositions: 4 },
  { type: 'VIDEO' as const, label: 'Videos', maxPositions: 3 },
  { type: 'AUDIO' as const, label: 'Audio Files', maxPositions: 1 },
  { type: 'PDF' as const, label: 'PDFs', maxPositions: 4 }
];

interface MediaSlotProps {
  boothId: string;
  type: MediaType;
  position: string;
  label: string;
  currentMedia?: MediaItem;
  onRefresh: () => void;
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
}

const MediaSlot: React.FC<MediaSlotProps> = ({ boothId, type, position, label, currentMedia, onRefresh, setError, setSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError('');
    setSuccess('');
    try {
      await uploadMedia(type, boothId, position, selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onRefresh();
      setSuccess(`Successfully uploaded ${label}`);
    } catch (err) {
      console.error(err);
      setError(`Failed to upload ${label}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentMedia) return;
    if (!window.confirm(`Are you sure you want to delete ${label}?`)) return;
    setError('');
    setSuccess('');
    try {
      await deleteMedia(currentMedia.id);
      onRefresh();
      setSuccess(`Successfully deleted ${label}`);
    } catch (err) {
      console.error(err);
      setError(`Failed to delete ${label}`);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm flex flex-col h-full">
      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">{label}</h4>
      
      {currentMedia ? (
        <div className="space-y-3 flex-grow flex flex-col justify-between">
           <div>
             <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-2 flex items-center">
               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               Uploaded
             </div>
             
             <div className="bg-gray-50 dark:bg-gray-900 rounded p-2 flex justify-center items-center h-32 overflow-hidden border border-gray-100 dark:border-gray-700">
               {type === 'IMAGE' && <img src={`${BOOTH_MEDIA_BASE_URL}${type}/${currentMedia.fileUrl}`} className="max-w-full max-h-full object-contain" alt={label} />}
               {type === 'VIDEO' && <video src={`${BOOTH_MEDIA_BASE_URL}${type}/${currentMedia.fileUrl}`} controls className="max-w-full max-h-full" />}
               {type === 'AUDIO' && <audio src={`${BOOTH_MEDIA_BASE_URL}${type}/${currentMedia.fileUrl}`} controls className="w-full" />}
               {type === 'PDF' && (
                 <a href={`${BOOTH_MEDIA_BASE_URL}${type}/${currentMedia.fileUrl}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-blue-500 hover:text-blue-600">
                   <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   <span className="text-sm font-medium">View PDF</span>
                 </a>
               )}
             </div>
             <p className="text-xs text-gray-500 mt-2 truncate" title={currentMedia.fileName || currentMedia.fileUrl}>{currentMedia.fileName || currentMedia.fileUrl}</p>
           </div>
           
           {/* Replacement Upload Form overlay */}
           <div className="flex flex-col space-y-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
             <div className="relative text-sm">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="mb-2 block w-full text-xs text-slate-500
                    file:mr-2 file:py-1.5 file:px-3
                    file:rounded-full file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300
                    cursor-pointer" 
                  disabled={isUploading} 
                  accept={type === 'IMAGE' ? 'image/*' : type === 'VIDEO' ? 'video/*' : type === 'AUDIO' ? 'audio/*' : '.pdf'} 
                />
             </div>
             {selectedFile && (
               <Button onClick={handleUpload} disabled={isUploading} className="w-full flex justify-center items-center py-1.5 text-sm bg-blue-600 hover:bg-blue-700">
                  {isUploading ? 'Replacing...' : 'Upload & Replace'}
               </Button>
             )}
             
             <Button variant="danger" onClick={handleDelete} className="w-full flex justify-center items-center py-1.5 text-sm">
               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               Remove media
             </Button>
           </div>
        </div>
      ) : (
        <div className="space-y-3 flex-grow flex flex-col justify-end">
          <div 
            onDrop={handleDrop} 
            onDragOver={handleDragOver}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-4 text-center h-40 flex flex-col justify-center items-center text-sm transition-colors ${selectedFile ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'} ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="mb-3 block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300
                cursor-pointer" 
              disabled={isUploading} 
              accept={type === 'IMAGE' ? 'image/*' : type === 'VIDEO' ? 'video/*' : type === 'AUDIO' ? 'audio/*' : '.pdf'} 
            />
            {selectedFile ? (
              <div className="text-sm text-green-700 dark:text-green-400 font-medium px-2 truncate w-full flex flex-col items-center">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div className="truncate w-full">Selected: {selectedFile.name}</div>
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 flex flex-col items-center mt-2 pointer-events-none">
                <span className="block font-medium">Or drag and drop your {type} file here</span>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading} 
            className="w-full flex justify-center items-center" 
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

const CustomizeTab: React.FC = () => {
  const [booths, setBooths] = useState<Booth[]>([]);
  const [selectedBooth, setSelectedBooth] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  const [activeTab, setActiveTab] = useState<'AUDIO' | 'PDF_IMAGE' | 'VIDEO'>('AUDIO');

  const fetchBooths = async () => {
    try {
      const data = await getBooths();
      setBooths(data);
      if (data.length > 0 && !selectedBooth) {
        setSelectedBooth(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching booths:', err);
      setError('Failed to load booth data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooths();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedBoothData = booths.find(booth => booth.id === selectedBooth);

  const getMedia = (type: MediaType, pos: string) => {
    if (!selectedBoothData || !selectedBoothData.medias[type]) return undefined;
    return selectedBoothData.medias[type].find(m => String(m.mediaPosition) === String(pos));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customize Booth Media</h1>
        
        {/* Booth Selector (Simplified as user wants predefined places, but keeping selection if multiple exist) */}
        <select
          value={selectedBooth}
          onChange={(e) => setSelectedBooth(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="">Select a booth</option>
          <option key={BOOTHID} value={BOOTHID}>{BOOTH_NAME}</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError('')}>&times;</button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success: </strong>
          <span className="block sm:inline">{successMessage}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setSuccessMessage('')}>&times;</button>
        </div>
      )}

      {selectedBoothData ? (
        <Card className="p-0 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4">
            <button
              onClick={() => setActiveTab('AUDIO')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors focus:outline-none ${activeTab === 'AUDIO' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
              Audio
            </button>
            <button
              onClick={() => setActiveTab('PDF_IMAGE')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors focus:outline-none ${activeTab === 'PDF_IMAGE' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
              Images & PDFs
            </button>
            <button
              onClick={() => setActiveTab('VIDEO')}
              className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors focus:outline-none ${activeTab === 'VIDEO' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            >
              Videos
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 bg-white dark:bg-gray-900">
            {activeTab === 'AUDIO' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Background Music / Audio</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MediaSlot 
                    boothId={selectedBooth} 
                    type="AUDIO" 
                    position="1" 
                    label="Audio 1" 
                    currentMedia={getMedia('AUDIO', '1')} 
                    onRefresh={fetchBooths}
                    setError={setError}
                    setSuccess={setSuccessMessage}
                  />
                </div>
              </div>
            )}

            {activeTab === 'VIDEO' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Video Screens</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(pos => (
                    <MediaSlot 
                      key={pos}
                      boothId={selectedBooth} 
                      type="VIDEO" 
                      position={String(pos)} 
                      label={`Video ${pos}`} 
                      currentMedia={getMedia('VIDEO', String(pos))} 
                      onRefresh={fetchBooths}
                      setError={setError}
                      setSuccess={setSuccessMessage}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'PDF_IMAGE' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Documents & Thumbnails</h3>
                <div className="space-y-8">
                  {[1, 2, 3, 4].map(pos => (
                    <div key={pos} className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        Document {pos}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MediaSlot 
                          boothId={selectedBooth} 
                          type="IMAGE" 
                          position={String(pos)} 
                          label={`Thumbnail ${pos}`} 
                          currentMedia={getMedia('IMAGE', String(pos))} 
                          onRefresh={fetchBooths}
                          setError={setError}
                          setSuccess={setSuccessMessage}
                        />
                        <MediaSlot 
                          boothId={selectedBooth} 
                          type="PDF" 
                          position={String(pos)} 
                          label={`PDF File ${pos}`} 
                          currentMedia={getMedia('PDF', String(pos))} 
                          onRefresh={fetchBooths}
                          setError={setError}
                          setSuccess={setSuccessMessage}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="text-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-300">Please select a booth to customize its media.</p>
        </div>
      )}
    </div>
  );
};

export default CustomizeTab;