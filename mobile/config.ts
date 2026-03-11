// API Configuration
// Change this to your computer's local IP address when testing on physical device
// For iOS Simulator: use 'localhost'
// For Android Emulator: use '10.0.2.2'
// For Physical Device: use your computer's IP (e.g., '192.168.1.100')

const getApiUrl = () => {
  // For Expo Go on physical device, replace with your computer's IP
  // Find your IP with: ipconfig getifaddr en0 (Mac) or ipconfig (Windows)
  const LOCAL_IP = '172.31.99.196'; // Your computer's local IP address
  return `http://${LOCAL_IP}:8000`;
};

export const API_URL = getApiUrl();

export const API_ENDPOINTS = {
  runAnalysis: `${API_URL}/api/analysis`,
};
