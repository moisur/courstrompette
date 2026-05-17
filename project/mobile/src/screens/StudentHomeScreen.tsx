import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StudentSummary } from "../lib/api";

interface StudentHomeScreenProps {
  email: string | null;
  summary: StudentSummary | null;
  onRefresh: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export function StudentHomeScreen({ email, summary, onRefresh, onLogout }: StudentHomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Espace eleve</Text>
        <Text style={styles.subtitle}>{email ?? "Compte eleve"}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.secondaryButton} onPress={onRefresh}>
          <Text style={styles.secondaryText}>Rafraichir</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onLogout}>
          <Text style={styles.secondaryText}>Deconnexion</Text>
        </Pressable>
      </View>

      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cours total</Text>
          <Text style={styles.cardValue}>{summary?.totalLessons ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cours payes</Text>
          <Text style={styles.cardValue}>{summary?.paidLessons ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cours non payes</Text>
          <Text style={styles.cardValue}>{summary?.unpaidLessons ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Montant restant</Text>
          <Text style={styles.cardValue}>{summary?.unpaidAmount ?? 0}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
    gap: 12,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: "#4b5563",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  cards: {
    gap: 10,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
  },
  cardTitle: {
    color: "#6b7280",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 6,
  },
});
