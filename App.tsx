// App.tsx
// ============================================================================
// App.tsx — Root Navigation + Global Providers
// ============================================================================
//
// PURPOSE:
//   Defines the entire navigation structure of the Even Dating mobile app.
//   Wraps the UI in global providers (gesture handler + location provider)
//   and registers every screen in the navigation stack.
//
// MAIN RESPONSIBILITIES:
//   • Initialize NavigationContainer + Stack Navigator
//   • Register all screens and their route params
//   • Provide global context (LocationProvider)
//   • Redirect onboarding completion → Swipe
//
// SCREEN OVERVIEW:
//   AuthLoading     → Decides: Login / Onboarding / Swipe
//   Login           → Entry screen (Google / Phone login)
//   PhoneAuth       → SMS flow + Google OAuth
//   Onboarding      → 6-step profile setup
//   Swipe           → Main swipe interface
//   Matches         → Unmessaged matches
//   Messages        → All threads
//   Chat            → One-on-one conversation
//   Profile         → My profile
//   EditProfile     → Profile editor
//   Search          → Search users by name
//   Settings        → Account settings (pause, delete, email)
//   ReviewsList     → All received reviews
//   ReviewWrite     → Submit a new review
//   ReviewDetail    → Full detail of one review
//   UserProfileView → Viewing another user's profile
//
// NOTES:
//   • All headers are hidden using `headerShown: false`.
//   • Onboarding embeds a custom `onComplete` handler that resets navigation.
//   • LocationProvider initializes geolocation for swipe queue filtering.
//
// ============================================================================

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthLoadingScreen from "./src/screens/login/AuthLoadingScreen";
import LoginScreen from "./src/screens/login/LoginScreen";
import OnboardingScreen from "./src/screens/login/OnboardingScreen";
import SwipeScreen from "./src/screens/SwipeScreen";
import ProfileScreen from "./src/screens/profile/ProfileScreen";
import EditProfileScreen from "./src/screens/profile/EditProfileScreen";
import PhoneAuthScreen from "./src/screens/login/PhoneAuthScreen";

import MatchesScreen from "./src/screens/matches/MatchesScreen";
import MessagesScreen from "./src/screens/messages/MessagesScreen";
import ChatScreen from "./src/screens/messages/ChatScreen";
import SearchScreen from "./src/screens/profile/SearchScreen";

import { LocationProvider } from "./src/context/LocationProvider";
import SettingsScreen from "./src/screens/SettingsScreen";

import ReviewsListScreen from "./src/screens/reviews/ReviewsListScreen";
import ReviewWriteScreen from "./src/screens/reviews/ReviewWriteScreen";
import ReviewDetailScreen from "./src/screens/reviews/ReviewDetailScreen";

import UserProfileViewScreen from "./src/screens/profile/UserProfileViewScreen";

// ============================================================================
// TYPE DEFINITIONS — Navigation Params
// ============================================================================
export type RootStackParamList = {
  AuthLoading: undefined;
  Login: undefined;

  Onboarding: undefined;

  Swipe: undefined;

  Profile: undefined;
  EditProfile: undefined;

  PhoneAuth: { provider: string };

  Matches: undefined;
  Messages: undefined;

  Chat: { threadId: string; targetId?: string };

  Search: undefined;
  Settings: undefined;

  ReviewsList: undefined;
  ReviewWrite: { targetId: string };
  ReviewDetail: { reviewId: string };

  UserProfileView: { userId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ============================================================================
// APP ENTRY POINT — Root Component
// ============================================================================
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Provides geolocation state to all components */}
      <LocationProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="AuthLoading"
            screenOptions={{ headerShown: false }}
          >
            {/* -------------------------------------------------------------- */}
            {/* AUTH + ENTRY FLOW */}
            {/* -------------------------------------------------------------- */}
            <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />

            {/* -------------------------------------------------------------- */}
            {/* ONBOARDING — wraps local callback */}
            {/* -------------------------------------------------------------- */}
            <Stack.Screen name="Onboarding">
              {(props) => (
                <OnboardingScreen
                  {...props}
                  onComplete={() =>
                    props.navigation.reset({
                      index: 0,
                      routes: [{ name: "Swipe" }],
                    })
                  }
                />
              )}
            </Stack.Screen>

            {/* -------------------------------------------------------------- */}
            {/* MAIN APP SCREENS */}
            {/* -------------------------------------------------------------- */}
            <Stack.Screen name="Swipe" component={SwipeScreen} />

            <Stack.Screen name="Matches" component={MatchesScreen} />
            <Stack.Screen name="Messages" component={MessagesScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />

            {/* Profile View + Editor */}
            <Stack.Screen name="Profile">
              {(props) => (
                <ProfileScreen
                  {...props}
                  onEdit={() => props.navigation.navigate("EditProfile")}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="EditProfile">
              {(props) => (
                <EditProfileScreen
                  {...props}
                  onDone={() => props.navigation.goBack()}
                />
              )}
            </Stack.Screen>

            {/* Login Providers */}
            <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />

            {/* Utility Screens */}
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />

            {/* Reviews */}
            <Stack.Screen name="ReviewsList" component={ReviewsListScreen} />
            <Stack.Screen name="ReviewWrite" component={ReviewWriteScreen} />
            <Stack.Screen name="ReviewDetail" component={ReviewDetailScreen} />

            {/* Viewing another user */}
            <Stack.Screen
              name="UserProfileView"
              component={UserProfileViewScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </LocationProvider>
    </GestureHandlerRootView>
  );
}
