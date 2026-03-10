# Forest Watch Mobile App 🌲📱

React Native mobile application for monitoring environmental changes in Tamil Nadu using the same Node.js backend as the web application.

## Features

- **Real-time Analysis**: Connect to backend API to run environmental analysis
- **Deforestation Monitoring**: View 12 critical hotspots across Tamil Nadu
- **Urban Expansion Tracking**: Monitor 8 urban growth zones
- **AI Predictions**: Machine learning forecasts for next year
- **Detailed Metrics**: Satellite indices (NDVI, NDBI) and land cover analysis
- **Offline-Ready UI**: Displays analysis results with intuitive visualization

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack)
- **HTTP Client**: Axios
- **UI**: React Native components with custom styling

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Expo Go app** on your mobile device:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
3. **Backend Server** running on http://localhost:8000

## Installation

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies (if not already installed):
```bash
npm install
```

## Running the App

### Step 1: Start the Backend Server

In the root directory of Forest Watch:
```bash
npm run dev
```

Backend should be running on http://localhost:8000

### Step 2: Configure for Physical Device

If testing on a physical device (not emulator), update the API URL in `config.ts`:

```typescript
// Replace localhost with your computer's local IP
const API_BASE_URL = 'http://192.168.1.X:8000/api';
```

To find your local IP:
- **macOS/Linux**: Run `ifconfig | grep "inet "` in terminal
- **Windows**: Run `ipconfig` in command prompt

### Step 3: Start Expo Development Server

In the mobile directory:
```bash
npm start
```

Or use specific platforms:
```bash
npm run ios      # For iOS simulator
npm run android  # For Android emulator
npm run web      # For web browser
```

### Step 4: Open in Expo Go

1. A QR code will appear in the terminal
2. Open **Expo Go** app on your mobile device
3. Scan the QR code:
   - **iOS**: Use Camera app, then tap notification
   - **Android**: Use "Scan QR Code" button in Expo Go app
4. App will load and connect to your backend

## App Structure

```
mobile/
├── App.tsx                 # Navigation setup
├── config.ts              # API configuration
├── types.ts               # TypeScript interfaces
├── api.ts                 # Backend API service
└── screens/
    ├── HomeScreen.tsx              # Main dashboard
    ├── HotspotsScreen.tsx          # Deforestation hotspots
    ├── UrbanExpansionScreen.tsx    # Urban growth zones
    ├── PredictionScreen.tsx        # AI predictions
    └── DetailsScreen.tsx           # Satellite metrics
```

## Screens Overview

### 1. Home Screen
- Run analysis button
- Quick stats: Forest Loss %, Urban Growth %, Risk Score
- Navigation to detail screens

### 2. Hotspots Screen
- List of 12 deforestation hotspots
- Location names (Chennai, Coimbatore, Salem, etc.)
- Affected area in square meters
- Severity rankings (Critical, High, Moderate)

### 3. Urban Expansion Screen
- 8 urban growth zones
- Development area and growth rates
- Environmental impact information
- Heat island and water runoff analysis

### 4. AI Prediction Screen
- 2027 forecasts for vegetation loss and urban growth
- Model confidence score
- Risk predictions
- AI recommendation
- Explanation of prediction methodology

### 5. Details Screen
- NDVI (Vegetation Index) comparison
- NDBI (Built-up Index) comparison
- Land cover breakdown (forest, urban, agriculture, water, barren)
- Year-over-year change percentages

## API Endpoints Used

- `POST /api/analysis/run` - Run environmental analysis
  - Body: `{ year1: number, year2: number }`
  - Returns: Complete analysis with hotspots, zones, predictions

## Testing on Devices

### iOS Simulator (macOS only)
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Physical Device
1. Ensure mobile device and computer are on same Wi-Fi network
2. Update `config.ts` with your computer's local IP
3. Start Expo server: `npm start`
4. Scan QR code with Expo Go app

## Troubleshooting

### "Network request failed"
- Check backend is running on port 8000
- Verify API_BASE_URL in `config.ts`
- For physical devices, use local IP (not localhost)
- Ensure device and computer are on same network

### "Unable to resolve module"
- Run `npm install` again
- Clear Expo cache: `npx expo start -c`

### QR Code not scanning
- Open Expo Go app first
- Use in-app QR scanner (Android)
- For iOS, ensure camera permissions are enabled

### Slow loading
- Check network connection
- Backend might be generating random data (takes a few seconds)
- API timeout is set to 30 seconds

## Development

### Adding New Features
1. Create component in `screens/` directory
2. Add route to `App.tsx` Stack.Navigator
3. Update TypeScript types in `types.ts` if needed

### Styling
- Uses inline StyleSheet for React Native
- Colors match web application theme
- Responsive design with flexbox

## Backend Integration

The mobile app connects to the same Node.js backend as the web application:
- **Endpoint**: `http://localhost:8000/api/analysis/run`
- **Timeout**: 30 seconds
- **Error Handling**: User-friendly error messages

No authentication required - monitoring only application.

## Data Flow

1. User taps "Run Analysis" on HomeScreen
2. App sends POST request to backend with year1 and year2
3. Backend generates analysis data with Tamil Nadu locations
4. App receives response with 12 hotspots, 8 zones, predictions
5. User can navigate to detail screens with analysis data
6. Each screen displays specific aspects of the analysis

## Location Data

All data uses realistic Tamil Nadu coordinates:
- Chennai (13.08°N, 80.27°E)
- Coimbatore (11.00°N, 76.96°E)
- Salem (11.65°N, 78.14°E)
- Madurai (9.92°N, 78.11°E)
- Tiruppur (11.10°N, 77.34°E)
- And 7 more locations...

## Future Enhancements

- Offline data caching
- Push notifications for critical changes
- Map visualization with markers
- Export reports as PDF
- Historical trend charts
- User authentication

## Support

For issues or questions:
1. Check backend is running correctly
2. Verify network connectivity
3. Review Expo error messages in terminal
4. Check logs in Expo Go app

## License

Part of the Forest Watch environmental monitoring platform.
