const app = express();

// Cấu hình trust proxy an toàn
// Chỉ tin tưởng proxy từ localhost và các IP nội bộ
app.set('trust proxy', (ip: string) => {
  // Danh sách các IP proxy đáng tin cậy
  const trustedProxies = [
    '127.0.0.1',           // localhost
    '::1',                 // IPv6 localhost
    '10.0.0.0/8',         // Private network
    '172.16.0.0/12',      // Private network
    '192.168.0.0/16',     // Private network
    '169.254.0.0/16',     // Link-local
    'fc00::/7',           // Private IPv6 network
  ];

  // Kiểm tra xem IP có nằm trong danh sách đáng tin cậy không
  return trustedProxies.some(proxy => {
    if (proxy.includes('/')) {
      // Xử lý CIDR notation
      const [subnet, bits] = proxy.split('/');
      const ipNum = ipToNumber(ip);
      const subnetNum = ipToNumber(subnet);
      const mask = ~((1 << (32 - parseInt(bits))) - 1);
      return (ipNum & mask) === (subnetNum & mask);
    }
    return ip === proxy;
  });
});

// Helper function để chuyển IP sang số
function ipToNumber(ip: string): number {
  return ip.split('.')
    .reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
}

// ... rest of the app configuration ... 