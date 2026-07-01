import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0f0f1a",
          borderTopColor: "#2a2a4a",
        },
        tabBarActiveTintColor: "#7c6fff",
        tabBarInactiveTintColor: "#666",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarLabel: "Home" }} />
      <Tabs.Screen name="properties" options={{ title: "Marketplace", tabBarLabel: "Market" }} />
      <Tabs.Screen name="portfolio" options={{ title: "Portfolio", tabBarLabel: "Portfolio" }} />
    </Tabs>
  );
}
