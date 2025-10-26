/**
 * Test Gemini API key validity
 * Run with: node test-gemini-key.js
 */

const fs = require('fs')

// Read .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8')
const apiKey = envFile.match(/GEMINI_API_KEY=(.+)/)?.[1]?.trim()

async function testGeminiKey() {
  
  console.log('🔑 Testing Gemini API Key...\n')
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env.local')
    return
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5))
  console.log('📏 Key length:', apiKey.length, 'characters\n')
  
  // Test API key by making a simple request
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`
  
  const requestBody = {
    contents: [{
      parts: [{
        text: 'Say hello in one word'
      }]
    }]
  }
  
  console.log('📤 Testing API key with Gemini...')
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })
    
    console.log('📊 Response Status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('\n❌ API Key Error:', errorText)
      return
    }
    
    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
    
    console.log('\n✅ API Key is VALID!')
    console.log('🤖 Response from Gemini:', text)
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
  }
}

testGeminiKey()
