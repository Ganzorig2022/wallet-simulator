import * as SecureStore from "expo-secure-store";

export async function saveValue(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function getValue(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}