const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);

/**
 * Download datasets from Google Drive if they don't exist locally
 * This runs automatically on backend startup
 */
class DatasetDownloader {
  constructor() {
    this.datasetPath = path.join(__dirname, '..', 'dataset', 'planetlab');
    this.zipPath = path.join(__dirname, '..', 'dataset', 'planetlab.zip');
    this.downloadUrl = process.env.DATASET_DOWNLOAD_URL || '';
  }

  /**
   * Check if datasets already exist
   */
  datasetsExist() {
    if (!fs.existsSync(this.datasetPath)) {
      return false;
    }

    // Check if at least one date folder exists
    try {
      const items = fs.readdirSync(this.datasetPath);
      const dateFolders = items.filter(item => {
        const itemPath = path.join(this.datasetPath, item);
        return fs.statSync(itemPath).isDirectory();
      });
      
      // Expect at least 10 date folders
      return dateFolders.length >= 10;
    } catch (error) {
      return false;
    }
  }

  /**
   * Download file from URL
   */
  async downloadFile(url, destination, redirectCount = 0) {
    // Prevent infinite redirect loops
    if (redirectCount > 10) {
      throw new Error('Too many redirects (max 10)');
    }

    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      
      console.log(`Downloading from: ${url}`);
      console.log(`Saving to: ${destination}`);

      const file = fs.createWriteStream(destination);
      let downloadedBytes = 0;
      let totalBytes = 0;

      // Add User-Agent header to help with Google Drive redirects
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      };

      const req = protocol.get(url, options, (response) => {
        // Handle redirects (Google Drive uses 301, 302, 303, 307, 308)
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          file.close();
          if (fs.existsSync(destination)) {
            fs.unlinkSync(destination);
          }
          const redirectUrl = response.headers.location;
          console.log(`Redirecting (${response.statusCode}) to: ${redirectUrl}`);
          // Handle relative redirects
          const fullRedirectUrl = redirectUrl.startsWith('http') 
            ? redirectUrl 
            : new URL(redirectUrl, url).href;
          return this.downloadFile(fullRedirectUrl, destination, redirectCount + 1).then(resolve).catch(reject);
        }

        if (response.statusCode !== 200) {
          file.close();
          if (fs.existsSync(destination)) {
            fs.unlinkSync(destination);
          }
          reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
          return;
        }

        totalBytes = parseInt(response.headers['content-length'] || '0', 10);
        console.log(`File size: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);

        response.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          if (totalBytes > 0) {
            const percent = ((downloadedBytes / totalBytes) * 100).toFixed(1);
            process.stdout.write(`\rDownloaded: ${percent}% (${(downloadedBytes / 1024 / 1024).toFixed(2)} MB)`);
          }
        });

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log('\nDownload complete!');
          resolve();
        });
      });

      req.on('error', (error) => {
        file.close();
        if (fs.existsSync(destination)) {
          fs.unlinkSync(destination);
        }
        reject(error);
      });

      req.end();
    });
  }

  /**
   * Extract ZIP file
   */
  async extractZip(zipPath, extractTo) {
    console.log(`Extracting ${zipPath} to ${extractTo}...`);

    // Ensure extract directory exists
    const extractDir = path.dirname(extractTo);
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }

    // Use unzip command (available on most systems)
    // For Windows, we'll use a Node.js zip library fallback
    try {
      // Try using unzip command (Linux/Mac/Render)
      await execAsync(`unzip -q -o "${zipPath}" -d "${extractDir}"`);
      console.log('Extraction complete using unzip command');
      return;
    } catch (error) {
      console.log('unzip command not available, trying Node.js solution...');
    }

    // Fallback: Use Node.js zip library if available
    try {
      // Try yauzl (if installed)
      const yauzl = require('yauzl');
      const yauzlPromisify = promisify(yauzl.open);
      
      return new Promise((resolve, reject) => {
        yauzlPromisify(zipPath, { lazyEntries: true })
          .then((zipfile) => {
            zipfile.readEntry();
            
            zipfile.on('entry', (entry) => {
              if (/\/$/.test(entry.fileName)) {
                // Directory entry
                const dirPath = path.join(extractDir, entry.fileName);
                if (!fs.existsSync(dirPath)) {
                  fs.mkdirSync(dirPath, { recursive: true });
                }
                zipfile.readEntry();
              } else {
                // File entry
                zipfile.openReadStream(entry, (err, readStream) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  
                  const filePath = path.join(extractDir, entry.fileName);
                  const fileDir = path.dirname(filePath);
                  if (!fs.existsSync(fileDir)) {
                    fs.mkdirSync(fileDir, { recursive: true });
                  }
                  
                  const writeStream = fs.createWriteStream(filePath);
                  readStream.pipe(writeStream);
                  
                  writeStream.on('close', () => {
                    zipfile.readEntry();
                  });
                });
              }
            });
            
            zipfile.on('end', () => {
              console.log('Extraction complete using yauzl');
              resolve();
            });
            
            zipfile.on('error', reject);
          })
          .catch((err) => {
            // If yauzl not available, provide instructions
            console.error('ERROR: Cannot extract ZIP file automatically.');
            console.error('Please install unzip or yauzl package.');
            console.error('Or extract manually and upload to Render.');
            reject(new Error('ZIP extraction failed. Install unzip or extract manually.'));
          });
      });
    } catch (error) {
      throw new Error('ZIP extraction failed. Please ensure unzip is available or extract manually.');
    }
  }

  /**
   * Clean up ZIP file after extraction
   */
  cleanupZip() {
    if (fs.existsSync(this.zipPath)) {
      try {
        fs.unlinkSync(this.zipPath);
        console.log('Cleaned up ZIP file');
      } catch (error) {
        console.warn('Could not delete ZIP file:', error.message);
      }
    }
  }

  /**
   * Main method: Check and download if needed
   */
  async ensureDatasetsExist() {
    console.log('\n=== Dataset Check ===');
    console.log(`Dataset path: ${this.datasetPath}`);

    // Check if datasets already exist
    if (this.datasetsExist()) {
      console.log('✅ Datasets already exist. Skipping download.');
      return true;
    }

    // Check if download URL is configured
    if (!this.downloadUrl) {
      console.warn('⚠️  DATASET_DOWNLOAD_URL not set in environment variables.');
      console.warn('⚠️  Datasets will not be downloaded automatically.');
      console.warn('⚠️  Please set DATASET_DOWNLOAD_URL in Render environment variables.');
      return false;
    }

    console.log('❌ Datasets not found. Starting download...');
    console.log(`Download URL: ${this.downloadUrl}`);

    try {
      // Ensure dataset directory exists
      const datasetDir = path.dirname(this.datasetPath);
      if (!fs.existsSync(datasetDir)) {
        fs.mkdirSync(datasetDir, { recursive: true });
      }

      // Download ZIP file
      await this.downloadFile(this.downloadUrl, this.zipPath);

      // Extract ZIP file
      await this.extractZip(this.zipPath, this.datasetPath);

      // Verify extraction
      if (this.datasetsExist()) {
        console.log('✅ Datasets downloaded and extracted successfully!');
        this.cleanupZip();
        return true;
      } else {
        throw new Error('Extraction completed but datasets not found. Check ZIP structure.');
      }
    } catch (error) {
      console.error('❌ Error downloading datasets:', error.message);
      console.error('Stack:', error.stack);
      
      // Clean up on error
      if (fs.existsSync(this.zipPath)) {
        this.cleanupZip();
      }
      
      return false;
    }
  }
}

module.exports = DatasetDownloader;

