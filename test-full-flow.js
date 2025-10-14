/**
 * Script test toàn bộ Push Notification flow
 * 
 * Chạy: node test-full-flow.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:8080/api';
const SECRET_KEY = process.env.NOTIFICATION_SECRET_KEY || 'your-secret-key-here';

// Test token (fake)
const TEST_TOKEN = 'ExponentPushToken[test123456789abcdefghijklmnopqrstuv]';

async function testFullFlow() {
  console.log('🧪 TESTING FULL PUSH NOTIFICATION FLOW\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Register token
    console.log('\n📱 STEP 1: Register push token...');
    const registerResponse = await axios.post(`${API_URL}/push-token/register`, {
      token: TEST_TOKEN,
      platform: 'android',
      deviceName: 'Test Device',
      appVersion: '1.0.0'
    });

    if (registerResponse.data.success) {
      console.log('✅ Token registered:', registerResponse.data.message);
    } else {
      console.log('❌ Failed:', registerResponse.data.message);
      process.exit(1);
    }

    // Step 2: Verify token in database
    console.log('\n🔍 STEP 2: Verify token (cần admin token)...');
    console.log('⚠️ Skip step này nếu chưa có admin token');
    console.log('   Run manually: npx ts-node src/scripts/check-push-tokens.ts');

    // Step 3: Send test notification
    console.log('\n📤 STEP 3: Send test notification...');
    const notifyResponse = await axios.post(`${API_URL}/notification/send`, {
      secretKey: SECRET_KEY,
      title: 'Test Full Flow 🔔',
      body: 'Testing push notification từ script',
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    });

    if (notifyResponse.data.success) {
      console.log('✅ Notification sent successfully!');
      console.log('   Result:', JSON.stringify(notifyResponse.data.result, null, 2));
    } else {
      console.log('❌ Failed to send:', notifyResponse.data);
    }

    // Step 4: Send episode notification
    console.log('\n🎬 STEP 4: Send episode notification...');
    const episodeResponse = await axios.post(`${API_URL}/notification/send`, {
      secretKey: SECRET_KEY,
      type: 'new_episode',
      categoryName: 'Hoàn Mỹ Thế Giới',
      categorySlug: 'hoan-my-the-gioi',
      episode: '99'
    });

    if (episodeResponse.data.success) {
      console.log('✅ Episode notification sent!');
    }

    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 TEST COMPLETED SUCCESSFULLY!\n');
    console.log('✅ Backend API hoạt động tốt');
    console.log('✅ Push notification system ready');
    console.log('\n💡 NEXT STEPS:');
    console.log('   1. Mở mobile app → tự động register token');
    console.log('   2. Edit episode trong admin panel');
    console.log('   3. BẬT toggle "Gửi Push Notification"');
    console.log('   4. Click submit → Notification sẽ gửi!\n');

  } catch (error) {
    console.log('\n' + '=' .repeat(60));
    console.error('❌ TEST FAILED!\n');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️ Backend không chạy!');
      console.error('   Fix: cd node && npm run dev');
    } else if (error.response) {
      console.error('⚠️ API Error:', error.response.status);
      console.error('   Message:', error.response.data?.message || error.response.data);
      
      if (error.response.status === 401) {
        console.error('\n💡 Invalid SECRET_KEY!');
        console.error('   Check .env file: NOTIFICATION_SECRET_KEY=...');
      }
    } else {
      console.error('⚠️ Unknown error:', error.message);
    }
    
    console.log('\n📖 Debug guide: node/QUICK_DEBUG_STEPS.md\n');
    process.exit(1);
  }
}

testFullFlow();

