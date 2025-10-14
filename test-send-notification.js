/**
 * Script test gửi push notification KHÔNG CẦN LOGIN
 * 
 * Chạy: node test-send-notification.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:8080/api/notification/send';
const SECRET_KEY = process.env.NOTIFICATION_SECRET_KEY || 'your-secret-key-here';

async function testNotifications() {
  console.log('🔔 Testing Push Notification - No Login Required\n');

  try {
    // Test 1: Custom notification to all
    console.log('📤 Test 1: Gửi custom notification đến tất cả devices...');
    const test1 = await axios.post(API_URL, {
      secretKey: SECRET_KEY,
      title: 'Test Notification 🎬',
      body: 'Đây là test từ Node.js script!',
      data: {
        type: 'announcement',
        timestamp: new Date().toISOString()
      }
    });
    console.log('✅ Result:', test1.data);
    console.log('');

    // Test 2: New episode notification
    console.log('📤 Test 2: Gửi notification "Tập mới"...');
    const test2 = await axios.post(API_URL, {
      secretKey: SECRET_KEY,
      type: 'new_episode',
      categoryName: 'Hoàn Mỹ Thế Giới',
      categorySlug: 'hoan-my-the-gioi',
      episode: '99'
    });
    console.log('✅ Result:', test2.data);
    console.log('');

    // Test 3: New category notification
    console.log('📤 Test 3: Gửi notification "Phim mới"...');
    const test3 = await axios.post(API_URL, {
      secretKey: SECRET_KEY,
      type: 'new_category',
      categoryName: 'Thần Ấn Vương Tọa',
      categorySlug: 'than-an-vuong-toa'
    });
    console.log('✅ Result:', test3.data);
    console.log('');

    console.log('✅ All tests completed!');
    console.log('💡 Check mobile app to see notifications');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testNotifications();

