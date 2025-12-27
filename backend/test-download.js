// Test script to verify Google Drive download works
const DatasetDownloader = require('./utils/downloadDatasets');
const path = require('path');
const fs = require('fs');

async function testDownload() {
  console.log('=== Testing Google Drive Download ===\n');
  
  // Create a test downloader instance
  const downloader = new DatasetDownloader();
  
  // Override the download URL for testing
  downloader.downloadUrl = 'https://drive.google.com/uc?export=download&id=1ANFYoFQajJm6pmJz_i71E3i7GS-dVZ_Y';
  downloader.zipPath = path.join(__dirname, 'test-download.zip');
  
  console.log('Download URL:', downloader.downloadUrl);
  console.log('Save to:', downloader.zipPath);
  console.log('\nStarting download...\n');
  
  try {
    // Test just the download (not extraction)
    await downloader.downloadFile(downloader.downloadUrl, downloader.zipPath);
    
    // Check if file exists and has content
    if (fs.existsSync(downloader.zipPath)) {
      const stats = fs.statSync(downloader.zipPath);
      console.log(`\n✅ Download successful!`);
      console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`File path: ${downloader.zipPath}`);
      
      // Check if it's a valid ZIP file
      const zipBuffer = Buffer.alloc(4);
      const fd = fs.openSync(downloader.zipPath, 'r');
      fs.readSync(fd, zipBuffer, 0, 4, 0);
      fs.closeSync(fd);
      
      if (zipBuffer[0] === 0x50 && zipBuffer[1] === 0x4B) {
        console.log('✅ File is a valid ZIP (starts with PK)');
        
        // Read first 200 bytes to see what we got
        const previewBuffer = Buffer.alloc(200);
        const previewFd = fs.openSync(downloader.zipPath, 'r');
        fs.readSync(previewFd, previewBuffer, 0, 200, 0);
        fs.closeSync(previewFd);
        const preview = previewBuffer.toString('utf8', 0, 200);
        
        if (preview.includes('<html') || preview.includes('<!DOCTYPE')) {
          console.log('❌ WARNING: File appears to be HTML, not ZIP!');
          console.log('Preview:', preview.substring(0, 100));
        } else {
          console.log('✅ File appears to be a valid ZIP file');
        }
      } else {
        console.log('❌ File is NOT a valid ZIP (does not start with PK)');
        // Read first 200 bytes
        const previewBuffer = Buffer.alloc(200);
        const previewFd = fs.openSync(downloader.zipPath, 'r');
        fs.readSync(previewFd, previewBuffer, 0, 200, 0);
        fs.closeSync(previewFd);
        const preview = previewBuffer.toString('utf8', 0, 200);
        console.log('File preview:', preview);
      }
    } else {
      console.log('❌ Download failed - file does not exist');
    }
  } catch (error) {
    console.error('\n❌ Download failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testDownload().then(() => {
  console.log('\n=== Test Complete ===');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});

