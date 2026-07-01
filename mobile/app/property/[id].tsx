import { useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../src/store";
import { fetchProperty } from "../../src/store/slices/propertiesSlice";

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { selected: property, loading } = useAppSelector((s) => s.properties);

  useEffect(() => {
    if (id) dispatch(fetchProperty(id));
  }, [id, dispatch]);

  if (loading || !property) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c6fff" />
      </View>
    );
  }

  const yieldPct = (property.rentalYieldBps / 100).toFixed(1);
  const annualReturn = (property.totalValue * property.rentalYieldBps) / 10000;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>🏙️</Text>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.name}>{property.name}</Text>
        <Text style={styles.location}>{property.location}</Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{yieldPct}%</Text>
            <Text style={styles.metricLabel}>Annual Yield</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              AED {(property.totalValue / 1_000_000).toFixed(1)}M
            </Text>
            <Text style={styles.metricLabel}>Total Value</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              AED {(annualReturn / 1_000).toFixed(0)}K
            </Text>
            <Text style={styles.metricLabel}>Est. Annual Return</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{property.description}</Text>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Token Price</Text>
            <Text style={styles.detailValue}>0.001 ETH</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Supply</Text>
            <Text style={styles.detailValue}>{property.totalValue.toLocaleString()} tokens</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Network</Text>
            <Text style={styles.detailValue}>Ethereum Sepolia</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>On-chain ID</Text>
            <Text style={styles.detailValue}>#{property.onChainId}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.investBtn}
          onPress={() => Alert.alert("Open in Browser", "Use the web app at propchain-two.vercel.app to connect MetaMask and invest.")}
        >
          <Text style={styles.investBtnText}>Invest Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1a" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f0f1a" },
  imagePlaceholder: {
    height: 220, backgroundColor: "#1a1a2e",
    justifyContent: "center", alignItems: "center",
  },
  imagePlaceholderText: { fontSize: 80 },
  backBtn: { position: "absolute", top: 52, left: 16, padding: 8 },
  backText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  content: { padding: 24 },
  name: { color: "#fff", fontSize: 24, fontWeight: "800", marginBottom: 6 },
  location: { color: "#888", fontSize: 14, marginBottom: 24 },
  metricsRow: {
    flexDirection: "row", justifyContent: "space-between", marginBottom: 24,
  },
  metricCard: {
    flex: 1, backgroundColor: "#1a1a2e", borderRadius: 12,
    padding: 14, alignItems: "center", marginHorizontal: 4,
    borderWidth: 1, borderColor: "#2a2a4a",
  },
  metricValue: { color: "#7c6fff", fontSize: 16, fontWeight: "800" },
  metricLabel: { color: "#666", fontSize: 10, marginTop: 4, textAlign: "center" },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 10 },
  description: { color: "#aaa", fontSize: 14, lineHeight: 22, marginBottom: 24 },
  detailsCard: {
    backgroundColor: "#1a1a2e", borderRadius: 14,
    padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: "#2a2a4a",
  },
  detailRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#2a2a4a",
  },
  detailLabel: { color: "#666", fontSize: 14 },
  detailValue: { color: "#fff", fontSize: 14, fontWeight: "600" },
  investBtn: {
    backgroundColor: "#7c6fff", borderRadius: 14,
    padding: 18, alignItems: "center",
  },
  investBtnText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});
