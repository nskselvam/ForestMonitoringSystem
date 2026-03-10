# Quick Start Guide 🚀

## Get Forest Watch Mobile Running in 3 Steps

### Step 1️⃣: Start Backend Server
In the root directory (Forest-Watch):
```bash
npm run dev
```
✅ Backend should show: "Server listening on http://0.0.0.0:8000"

### Step 2️⃣: For Physical Device - Update IP Address
If using a phone (not simulator), edit `mobile/config.ts`:

**Find your IP address:**
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

**Update config.ts:**
```typescript
// Change this line:
const API_BASE_URL = 'http://localhost:8000/api';

// To (example):
const API_BASE_URL = 'http://192.168.1.5:8000/api';
```

### Step 3️⃣: Start Mobile App
In the mobile directory:
```bash
cd mobile
npm start
```

**Then on your phone:**
1. Open **Expo Go** app
2. Scan the QR code shown in terminal
3. App loads automatically!

---

## First Time Usage

1. Tap **"Run Analysis"** button
2. Select years (default: 2020 → 2024)
3. Wait 2-3 seconds for analysis
4. View results in 4 sections:
   - 🔥 Deforestation Hotspots
   - 🏙️ Urban Expansion
   - 🤖 AI Predictions
   - 📊 Detailed Metrics

---

## Troubleshooting

**"Network request failed"**
- ✅ Backend running? Check terminal
- ✅ Using correct IP? (not localhost on physical device)
- ✅ Same Wi-Fi? Phone and computer must be on same network

**"Metro bundler not found"**
```bash
npx expo start -c
```

**App not loading**
- Close Expo Go completely
- Restart with: `npm start`
- Scan QR code again

---

## Testing Without Mobile Device

Run in web browser:
```bash
npm run web
```

Or iOS Simulator (macOS only):
```bash
npm run ios
```

---

## Need Help?

1. Check `mobile/README.md` for detailed documentation
2. Verify backend logs for API errors
3. Look at Expo terminal for React Native errors

Happy Monitoring! 🌲
