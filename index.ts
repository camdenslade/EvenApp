// index.ts
// ============================================================================
// index.js — App Entry Point (Expo + React Native Gesture Handler)
// ============================================================================
//
// PURPOSE:
//   This is the true entry file for the Even Dating mobile app.
//   Expo loads this file first, which then registers the main App component.
//
// RESPONSIBILITIES:
//   • Ensure `react-native-gesture-handler` is initialized before anything else
//   • Register the root component using Expo's `registerRootComponent`
//   • Hand control to App.tsx for navigation + providers
//
// WHY GESTURE HANDLER IS IMPORTED FIRST:
//   react-native-gesture-handler must be loaded before any navigation logic.
//   Failing to do so can cause:
//     - Crashes
//     - Swipe/gesture components not responding
//     - Navigation gesture issues
//
// ============================================================================

import 'react-native-gesture-handler';

import { registerRootComponent } from 'expo';
import App from './App';

// ============================================================================
// Register the main App component with Expo
// ============================================================================
registerRootComponent(App);
