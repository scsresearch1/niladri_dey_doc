const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');

/**
 * Download datasets directly from Google Drive folder
 * This bypasses the ZIP download issue by downloading files individually
 */
class GoogleDriveDownloader {
  constructor() {
    this.datasetPath = path.join(__dirname, '..', 'dataset', 'planetlab');
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
    this.apiKey = process.env.GOOGLE_DRIVE_API_KEY || '';
  }

  /**
   * Download a single file from Google Drive
   */
  async downloadFile(fileId, destination) {
    return new Promise((resolve, reject) => {
      // Use direct download URL for individual files
      const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
      
      const file = fs.createWriteStream(destination);
      
      https.get(url, (response) => {
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          file.close();
          if (fs.existsSync(destination)) {
            fs.unlinkSync(destination);
          }
          return this.downloadFile(response.headers.location.split('id=')[1]?.split('&')[0] || fileId, destination)
            .then(resolve).catch(reject);
        }

        if (response.statusCode !== 200) {
          file.close();
          if (fs.existsSync(destination)) {
            fs.unlinkSync(destination);
          }
          reject(new Error(`Failed to download file: HTTP ${response.statusCode}`));
          return;
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (error) => {
        file.close();
        if (fs.existsSync(destination)) {
          fs.unlinkSync(destination);
        }
        reject(error);
      });
    });
  }

  /**
   * Check if datasets already exist
   */
  datasetsExist() {
    if (!fs.existsSync(this.datasetPath)) {
      return false;
    }

    try {
      const items = fs.readdirSync(this.datasetPath);
      const dateFolders = items.filter(item => {
        const itemPath = path.join(this.datasetPath, item);
        return fs.statSync(itemPath).isDirectory();
      });
      
      return dateFolders.length >= 10;
    } catch (error) {
      return false;
    }
  }

  /**
   * Download datasets from a shared Google Drive folder
   * This requires the folder to be shared publicly and a list of file IDs
   */
  async downloadFromFileList(fileList) {
    console.log(`Downloading ${fileList.length} files from Google Drive...`);
    
    // Ensure dataset directory exists
    const datasetDir = path.dirname(this.datasetPath);
    if (!fs.existsSync(datasetDir)) {
      fs.mkdirSync(datasetDir, { recursive: true });
    }
    if (!fs.existsSync(this.datasetPath)) {
      fs.mkdirSync(this.datasetPath, { recursive: true });
    }

    let successCount = 0;
    let failCount = 0;

    for (const fileInfo of fileList) {
      const { fileId, date, filename } = fileInfo;
      const datePath = path.join(this.datasetPath, date);
      
      if (!fs.existsSync(datePath)) {
        fs.mkdirSync(datePath, { recursive: true });
      }

      const filePath = path.join(datePath, filename);

      try {
        await this.downloadFile(fileId, filePath);
        successCount++;
        if (successCount % 100 === 0) {
          console.log(`Downloaded ${successCount}/${fileList.length} files...`);
        }
      } catch (error) {
        failCount++;
        console.warn(`Failed to download ${filename}:`, error.message);
      }
    }

    console.log(`\nDownload complete: ${successCount} succeeded, ${failCount} failed`);
    return successCount > 0;
  }
}

module.exports = GoogleDriveDownloader;

