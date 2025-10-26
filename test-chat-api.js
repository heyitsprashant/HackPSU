/**
 * Test script for /api/chat endpoint
 * Run with: node test-chat-api.js
 */

async function testChatAPI() {
  const API_URL = 'http://localhost:3000/api/chat'
  
  console.log('🧪 Testing Chat API endpoint...\n')
  
  const testMessage = {
    messages: [
      {
        role: 'user',
        content: 'Explain what binary search is in one sentence.'
      }
    ]
  }
  
  console.log('📤 Sending request to:', API_URL)
  console.log('📝 Request body:', JSON.stringify(testMessage, null, 2))
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    })
    
    console.log('\n📊 Response Status:', response.status, response.statusText)
    console.log('📋 Response Headers:')
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('\n❌ Error Response:', errorText)
      return
    }
    
    console.log('\n✅ Streaming response:\n')
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value, { stream: true })
      fullText += chunk
      process.stdout.write(chunk) // Stream to console
    }
    
    console.log('\n\n✅ Full response received')
    console.log('📏 Total length:', fullText.length, 'characters')
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error('📋 Error details:', error)
  }
}

// Run the test
testChatAPI()
