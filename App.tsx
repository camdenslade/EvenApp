import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";

import AuthLoadingScreen from "./src/screens/login/AuthLoadingScreen";
import LoginScreen from "./src/screens/login/LoginScreen";
import OnboardingScreen from "./src/screens/login/OnboardingScreen";
import SwipeScreen from "./src/screens/SwipeScreen";
import ProfileScreen from "./src/screens/profile/ProfileScreen";
import EditProfileScreen from "./src/screens/profile/EditProfileScreen";
import PhoneAuthScreen from "./src/screens/login/PhoneAuthScreen";

export type RootStackParamList = {
  AuthLoading: undefined;
  Login: undefined;
  Onboarding: undefined;
  Swipe: undefined;
  Profile: undefined;
  EditProfile: undefined;
  PhoneAuth: { provider: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type NavigationProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

function ScreenWrapper<P extends Record<string, any>, C extends Record<string, any>>({
  Component,
  navProps,
  customProps,
}: {
  Component: React.ComponentType<P & C>;
  navProps: P;
  customProps: C;
}) {
  return <Component {...(navProps as P)} {...(customProps as C)} />;
}

export default function App(): React.ReactElement {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AuthLoading" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />

        <Stack.Screen name="Onboarding">
          {(props) => (
            <ScreenWrapper
              Component={OnboardingScreen}
              navProps={props as NavigationProps<"Onboarding">}
              customProps={{
                onComplete: () => props.navigation.reset({ index: 0, routes: [{ name: "Swipe" }] }),
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Swipe" component={SwipeScreen} />

        <Stack.Screen name="Profile">
          {(props) => (
            <ScreenWrapper
              Component={ProfileScreen}
              navProps={props as NavigationProps<"Profile">}
              customProps={{
                onEdit: () => props.navigation.navigate("EditProfile"),
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="EditProfile">
          {(props) => (
            <ScreenWrapper
              Component={EditProfileScreen}
              navProps={props as NavigationProps<"EditProfile">}
              customProps={{
                onDone: () => props.navigation.goBack(),
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
