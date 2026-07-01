import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../src/store";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </Provider>
  );
}
