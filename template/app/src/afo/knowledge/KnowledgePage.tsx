import { useState } from 'react';
import apiClient from '../lib/api-client';

export default function KnowledgePage({ user }: any) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      // TODO: Get agent ID from context or props
      await apiClient.uploadDocument('agent-id', file);
      alert('Document uploaded successfully!');
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Knowledge Base</h1>

      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Upload Documents</h3>
          <p className="mt-2 text-gray-500">Add PDFs, DOCX, or TXT files to your agent's knowledge base</p>
          
          <label className="mt-6 inline-block">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt"
              className="hidden"
              disabled={uploading}
            />
            <span className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block">
              {uploading ? 'Uploading...' : 'Choose File'}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}