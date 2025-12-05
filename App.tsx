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

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LocationProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="AuthLoading"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />

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

            <Stack.Screen name="Swipe" component={SwipeScreen} />

            <Stack.Screen name="Matches" component={MatchesScreen} />
            <Stack.Screen name="Messages" component={MessagesScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />

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

            <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />

            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="ReviewsList" component={ReviewsListScreen} />
            <Stack.Screen name="ReviewWrite" component={ReviewWriteScreen} />
            <Stack.Screen name="ReviewDetail" component={ReviewDetailScreen} />

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
