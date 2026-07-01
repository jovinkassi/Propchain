import { useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../src/store";
import { fetchProperties } from "../../src/store/slices/propertiesSlice";

export default function PropertiesScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.properties);

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c6fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Marketplace</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/property/${item.onChainId}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{item.name}</Text>
              <View style={styles.yieldBadge}>
                <Text style={styles.yieldText}>
                  {(item.rentalYieldBps / 100).toFixed(1)}% APY
                </Text>
              </View>
            </View>
            <Text style={styles.location}>{item.location}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.footer}>
              <View>
                <Text style={styles.footerLabel}>Total Value</Text>
                <Text style={styles.footerValue}>
                  AED {item.totalValue.toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.investBtn}
                onPress={() => router.push(`/property/${item.onChainId}`)}
              >
                <Text style={styles.investBtnText}>Invest →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1a" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f0f1a" },
  header: {
    color: "#fff", fontSize: 28, fontWeight: "800",
    padding: 24, paddingTop: 60, paddingBottom: 8,
  },
  errorText: { color: "#ff6b6b" },
  card: {
    backgroundColor: "#1a1a2e", borderRadius: 14,
    padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: "#2a2a4a",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardName: { color: "#fff", fontSize: 17, fontWeight: "700", flex: 1, marginRight: 8 },
  yieldBadge: {
    backgroundColor: "rgba(124,111,255,0.15)",
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  yieldText: { color: "#7c6fff", fontWeight: "700", fontSize: 13 },
  location: { color: "#888", fontSize: 13, marginTop: 6 },
  description: { color: "#666", fontSize: 13, marginTop: 8, lineHeight: 20 },
  footer: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-end", marginTop: 14,
  },
  footerLabel: { color: "#666", fontSize: 11 },
  footerValue: { color: "#fff", fontWeight: "700", fontSize: 15, marginTop: 2 },
  investBtn: {
    backgroundColor: "#7c6fff",
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
  },
  investBtnText: { color: "#fff", fontWeight: "700" },
});
