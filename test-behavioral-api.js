// Test script for behavioral analysis API
// Run with: node test-behavioral-api.js

const fs = require('fs');
const path = require('path');

async function testBehavioralAPI() {
  console.log('🧪 Testing Behavioral Analysis API...\n');

  // Create a simple test image (1x1 red pixel)
  const testImage = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
    0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
    0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C,
    0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D,
    0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
    0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
    0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34,
    0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4,
    0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x03, 0xFF, 0xC4, 0x00, 0x14,
    0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01,
    0x00, 0x00, 0x3F, 0x00, 0xFE, 0x8A, 0x28, 0xFF, 0xD9
  ]);

  const FormData = require('form-data');
  const form = new FormData();
  
  form.append('frame', testImage, {
    filename: 'test.jpg',
    contentType: 'image/jpeg'
  });
  form.append('sessionId', 'test-session-123');
  form.append('transcript', 'This is a test transcript');

  try {
    console.log('📤 Sending request to http://localhost:3000/api/behavioral/stream');
    
    const response = await fetch('http://localhost:3000/api/behavioral/stream', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    console.log('📥 Response status:', response.status);
    
    const data = await response.json();
    
    console.log('\n✅ API Response:');
    console.log('================');
    console.log('OK:', data.ok);
    console.log('Session ID:', data.sessionId);
    
    if (data.data && data.data.metrics) {
      console.log('\n📊 Metrics:');
      console.log('  Speech Clarity:', data.data.metrics.speechClarity);
      console.log('  Tone Confidence:', data.data.metrics.toneConfidence);
      console.log('  Emotional Stability:', data.data.metrics.emotionalStability);
      console.log('  Eye Contact:', data.data.metrics.eyeContact);
      console.log('  Expressions:', data.data.metrics.expressions);
      console.log('  Engagement:', data.data.metrics.engagement);
      
      const avgScore = Object.values(data.data.metrics).reduce((a, b) => a + b, 0) / 6;
      console.log('\n  Average Score:', avgScore.toFixed(2));
    }
    
    if (data.data && data.data.observations) {
      console.log('\n💡 Observations:', data.data.observations);
    }
    
    if (data.data && data.data.topStrength) {
      console.log('💪 Strength:', data.data.topStrength);
    }
    
    if (data.data && data.data.topWeakness) {
      console.log('📈 Improvement:', data.data.topWeakness);
    }
    
    if (data.error) {
      console.log('\n❌ Error:', data.error);
    }
    
    console.log('\n================');
    console.log('\nTest complete!');
    
    // Check if it's actually using the LLM
    if (avgScore > 0 && data.data.observations) {
      console.log('\n✅ LLM is working correctly!');
    } else if (avgScore === 0) {
      console.log('\n⚠️  Warning: All metrics are 0. Check server logs.');
    } else {
      console.log('\n⚠️  Warning: No observations from LLM. May be using fallback.');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nMake sure:');
    console.error('1. The app is running on http://localhost:3000');
    console.error('2. GEMINI_API_KEY is configured in .env.local');
    console.error('3. Backend server is running');
  }
}

testBehavioralAPI();
