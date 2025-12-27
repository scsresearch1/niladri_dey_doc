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

        // Check content type - Google Drive might return HTML instead of file
        const contentType = response.headers['content-type'] || '';
        if (contentType.includes('text/html')) {
          file.close();
          if (fs.existsSync(destination)) {
            fs.unlinkSync(destination);
          }
          reject(new Error('Google Drive returned HTML instead of file. File might be too large or sharing settings incorrect.'));
          return;
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

    // Fallback: Use Node.js zip library (adm-zip)
    try {
      const AdmZip = require('adm-zip');
      const zip = new AdmZip(zipPath);
      
      console.log('Extracting using adm-zip...');
      zip.extractAllTo(extractDir, true);
      console.log('Extraction complete using adm-zip');
      return;
    } catch (error) {
      console.error('ERROR: Cannot extract ZIP file automatically.');
      console.error('Error:', error.message);
      throw new Error(`ZIP extraction failed: ${error.message}`);
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

      // Verify ZIP file exists and has content
      const zipStats = fs.statSync(this.zipPath);
      if (zipStats.size === 0) {
        throw new Error('Downloaded ZIP file is empty. Check Google Drive sharing settings.');
      }
      console.log(`ZIP file size: ${(zipStats.size / 1024 / 1024).toFixed(2)} MB`);

      // Check if file is actually a ZIP (check magic bytes)
      const zipBuffer = Buffer.alloc(4);
      const fd = fs.openSync(this.zipPath, 'r');
      fs.readSync(fd, zipBuffer, 0, 4, 0);
      fs.closeSync(fd);
      
      // ZIP files start with PK (0x50 0x4B)
      if (zipBuffer[0] !== 0x50 || zipBuffer[1] !== 0x4B) {
        throw new Error('Downloaded file is not a valid ZIP file. Google Drive may have returned an error page.');
      }

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

