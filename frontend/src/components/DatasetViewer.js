import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DatasetViewer.css';

const DatasetViewer = ({ date, onClose }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);

  useEffect(() => {
    if (date) {
      fetchFiles();
    }
  }, [date]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/datasets/${date}/files`);
      setFiles(response.data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (filename) => {
    try {
      setLoadingFile(true);
      const response = await axios.get(`/api/datasets/${date}/files/${filename}`);
      setFileContent(response.data);
      setSelectedFile(filename);
    } catch (error) {
      console.error('Error fetching file content:', error);
      setFileContent(null);
    } finally {
      setLoadingFile(false);
    }
  };

  const formatDate = (dateString) => {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (!date) return null;

  return (
    <div className="dataset-viewer-overlay" onClick={onClose}>
      <div className="dataset-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <button className="dataset-viewer-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="dataset-viewer-header">
          <h2 className="dataset-viewer-title">Dataset Files</h2>
          <p className="dataset-viewer-subtitle">Date: {formatDate(date)}</p>
        </div>

        <div className="dataset-viewer-content">
          {loading ? (
            <div className="dataset-viewer-loading">
              <div className="loading-spinner"></div>
              <p>Loading dataset files...</p>
            </div>
          ) : (
            <div className="dataset-viewer-grid">
              <div className="dataset-files-list">
                <h3 className="files-list-title">Files ({files.length})</h3>
                <div className="files-container">
                  {files.length === 0 ? (
                    <p className="no-files">No files found</p>
                  ) : (
                    files.map((file, idx) => (
                      <div
                        key={idx}
                        className={`file-item ${selectedFile === file.name ? 'active' : ''}`}
                        onClick={() => fetchFileContent(file.name)}
                      >
                        <div className="file-name">{file.name}</div>
                        <div className="file-size">{formatFileSize(file.size)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="dataset-file-preview">
                {loadingFile ? (
                  <div className="file-preview-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading file content...</p>
                  </div>
                ) : fileContent ? (
                  <div className="file-preview-content">
                    <div className="file-preview-header">
                      <h3 className="file-preview-title">{fileContent.filename}</h3>
                      <div className="file-preview-meta">
                        <span>Size: {formatFileSize(fileContent.size)}</span>
                        <span>Total Lines: {fileContent.totalLines}</span>
                      </div>
                    </div>
                    <div className="file-preview-text">
                      <pre>{fileContent.preview.join('\n')}</pre>
                      {fileContent.totalLines > 50 && (
                        <div className="file-preview-note">
                          Showing first 50 lines of {fileContent.totalLines} total lines
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="file-preview-empty">
                    <p>Select a file to view its content</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetViewer;

