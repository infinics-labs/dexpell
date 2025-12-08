// Script to upload videos to Vercel Blob Storage
// Run: node scripts/upload-videos.js

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { put } = require('@vercel/blob');

async function uploadVideos() {
  const videosDir = path.join(__dirname, '../public/videos');
  const videoFiles = [
    'Burcu X.mp4',
    'Erkut X.mp4',
    'June X.mp4',
    'Aslı X (3).mp4',
    'Selin (1).mp4'
  ];

  console.log('🚀 Starting video upload to Vercel Blob...\n');

  for (const filename of videoFiles) {
    try {
      const filePath = path.join(videosDir, filename);
      const fileBuffer = fs.readFileSync(filePath);
      
      console.log(`📤 Uploading: ${filename}...`);
      
      const blob = await put(filename, fileBuffer, {
        access: 'public',
        token: process.env.dexpellblob_READ_WRITE_TOKEN,
      });

      console.log(`✅ Uploaded: ${filename}`);
      console.log(`   URL: ${blob.url}\n`);
      
    } catch (error) {
      console.error(`❌ Error uploading ${filename}:`, error.message);
    }
  }

  console.log('🎉 Upload complete!');
}

uploadVideos();

