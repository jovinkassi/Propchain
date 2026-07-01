import { useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../src/store";
import { fetchPortfolio } from "../../src/store/slices/portfolioSlice";

export default function PortfolioScreen() {
  const dispatch = useAppDispatch();
  const { holdings, totalValueAed, loading } = useAppSelector((s) => s.portfolio);

  useEffect(() => {
    dispatch(fetchPortfolio());
  }, [dispatch]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c6fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Portfolio</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>TOTAL PORTFOLIO VALUE</Text>
        <Text style={styles.summaryValue}>
          AED {totalValueAed?.toLocaleString() ?? "0"}
        </Text>
      </View>

      {holdings.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No holdings yet</Text>
          <Text style={styles.emptySubtitle}>
            Connect your wallet and invest in properties to see your portfolio here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={holdings}
          keyExtractor={(item) => item.propertyId}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.holdingCard}>
              <View style={styles.holdingHeader}>
                <Text style={styles.holdingName}>{item.name}</Text>
                <Text style={styles.holdingTokens}>{item.tokenAmount} tokens</Text>
              </View>
              <View style={styles.holdingRow}>
                <View>
                  <Text style={styles.holdingLabel}>Value</Text>
                  <Text style={styles.holdingValue}>
                    AED {item.valueAed?.toLocaleString() ?? "—"}
                  </Text>
                </View>
                <View>
                  <Text style={styles.holdingLabel}>Annual Yield</Text>
                  <Text style={styles.holdingYield}>
                    {item.rentalYieldBps ? (item.rentalYieldBps / 100).toFixed(1) : "—"}%
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f1a" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f0f1a" },
  header: {
    color: "#fff", fontSize: 28, fontWeight: "800",
    padding: 24, paddingTop: 60, paddingBottom: 16,
  },
  summaryCard: {
    backgroundColor: "#7c6fff", marginHorizontal: 16,
    borderRadius: 16, padding: 24, marginBottom: 8,
  },
  summaryLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600" },
  summaryValue: { color: "#fff", fontSize: 32, fontWeight: "800", marginTop: 8 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  emptySubtitle: { color: "#666", fontSize: 14, textAlign: "center", lineHeight: 22 },
  holdingCard: {
    backgroundColor: "#1a1a2e", borderRadius: 14,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "#2a2a4a",
  },
  holdingHeader: {
    flexDirection: "row", justifyContent: "space-between", marginBottom: 12,
  },
  holdingName: { color: "#fff", fontSize: 16, fontWeight: "700", flex: 1 },
  holdingTokens: { color: "#7c6fff", fontWeight: "700" },
  holdingRow: { flexDirection: "row", justifyContent: "space-between" },
  holdingLabel: { color: "#666", fontSize: 11 },
  holdingValue: { color: "#fff", fontWeight: "700", marginTop: 2 },
  holdingYield: { color: "#4ade80", fontWeight: "700", marginTop: 2 },
});
