import React from "react";
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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
