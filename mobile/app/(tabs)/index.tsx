import { useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../src/store";
import { fetchProperties } from "../../src/store/slices/propertiesSlice";

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: properties, loading } = useAppSelector((s) => s.properties);

  useEffect(() => {
    dispatch(fetchProperties());
  }, [dispatch]);

  const totalValue = properties.reduce((sum, p) => sum + p.totalValue, 0);
  const avgYield = properties.length
    ? (properties.reduce((sum, p) => sum + p.rentalYieldBps, 0) / properties.length / 100).toFixed(1)
    : "0.0";

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.badge}>UAE Real Estate on Blockchain</Text>
        <Text style={styles.title}>Invest in Dubai{"\n"}Properties</Text>
        <Text style={styles.subtitle}>
          Fractional ownership of premium UAE real estate.{"\n"}
          Earn rental yield, trade tokens, all on-chain.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push("/(tabs)/properties")}>
          <Text style={styles.btnText}>Browse Properties</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          {loading ? (
            <ActivityIndicator color="#7c6fff" />
          ) : (
            <Text style={styles.statValue}>
              AED {(totalValue / 1_000_000).toFixed(1)}M+
            </Text>
          )}
          <Text style={styles.statLabel}>TOTAL VALUE LOCKED</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{properties.length}</Text>
          <Text style={styles.statLabel}>PROPERTIES LISTED</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{avgYield}%</Text>
          <Text style={styles.statLabel}>AVG. ANNUAL YIELD</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Properties</Text>
        {properties.slice(0, 3).map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.propertyCard}
            onPress={() => router.push(`/property/${p.onChainId}`)}
          >
            <Text style={styles.propertyName}>{p.name}</Text>
            <Text style={styles.propertyLocation}>{p.location}</Text>
            <View style={styles.propertyMeta}>
              <Text style={styles.propertyYield}>
                {(p.rentalYieldBps / 100).toFixed(1)}% APY
              </Text>
              <Text style={styles.propertyValue}>
                AED {p.totalValue.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1a" },
  hero: { padding: 24, paddingTop: 60, alignItems: "center" },
  badge: {
    color: "#7c6fff", fontSize: 12, borderWidth: 1,
    borderColor: "#7c6fff", paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 20, marginBottom: 16,
  },
  title: {
    fontSize: 36, fontWeight: "800", color: "#fff",
    textAlign: "center", marginBottom: 12,
  },
  subtitle: {
    fontSize: 14, color: "#999", textAlign: "center",
    lineHeight: 22, marginBottom: 24,
  },
  btn: {
    backgroundColor: "#7c6fff", paddingHorizontal: 32,
    paddingVertical: 14, borderRadius: 12,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  statsRow: {
    flexDirection: "row", justifyContent: "space-around",
    paddingHorizontal: 16, paddingVertical: 24,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#2a2a4a",
  },
  statCard: { alignItems: "center" },
  statValue: { color: "#fff", fontSize: 18, fontWeight: "800" },
  statLabel: { color: "#666", fontSize: 10, marginTop: 4 },
  section: { padding: 24 },
  sectionTitle: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 16 },
  propertyCard: {
    backgroundColor: "#1a1a2e", borderRadius: 12,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "#2a2a4a",
  },
  propertyName: { color: "#fff", fontSize: 16, fontWeight: "700" },
  propertyLocation: { color: "#999", fontSize: 13, marginTop: 4 },
  propertyMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  propertyYield: { color: "#7c6fff", fontWeight: "700" },
  propertyValue: { color: "#aaa", fontSize: 13 },
});
