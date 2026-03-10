import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import HotspotsScreen from './screens/HotspotsScreen';
import UrbanExpansionScreen from './screens/UrbanExpansionScreen';
import PredictionScreen from './screens/PredictionScreen';
import DetailsScreen from './screens/DetailsScreen';
import { AnalysisResponse } from './types';

// Define navigation param list
type RootStackParamList = {
  Home: undefined;
  Hotspots: { data: AnalysisResponse };
  UrbanExpansion: { data: AnalysisResponse };
  Prediction: { data: AnalysisResponse };
  Details: { data: AnalysisResponse };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#22c55e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: '🌲 Forest Watch',
          }}
        />
        <Stack.Screen
          name="Hotspots"
          component={HotspotsScreen}
          options={{
            title: 'Deforestation Hotspots',
          }}
        />
        <Stack.Screen
          name="UrbanExpansion"
          component={UrbanExpansionScreen}
          options={{
            title: 'Urban Expansion',
          }}
        />
        <Stack.Screen
          name="Prediction"
          component={PredictionScreen}
          options={{
            title: 'AI Predictions',
          }}
        />
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{
            title: 'Detailed Metrics',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
