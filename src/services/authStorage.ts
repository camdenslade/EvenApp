// app/services/authStorage.ts
import * as SecureStore from 'expo-secure-store';

export async function saveTokens(access: string, refresh: string) {
    await SecureStore.setItemAsync('accessToken', access);
    await SecureStore.setItemAsync('refreshToken', refresh);
}

export async function getAccessToken() {
    return await SecureStore.getItemAsync('accessToken');
}

export async function getRefreshToken() {
    return await SecureStore.getItemAsync('refreshToken');
}

export async function clearTokens() {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
}