import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { StudentItem } from "../lib/api";

interface AdminHomeScreenProps {
  email: string | null;
  students: StudentItem[];
  onRefresh: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export function AdminHomeScreen({ email, students, onRefresh, onLogout }: AdminHomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin</Text>
        <Text style={styles.subtitle}>{email ?? "Compte admin"}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.secondaryButton} onPress={onRefresh}>
          <Text style={styles.secondaryText}>Rafraichir</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onLogout}>
          <Text style={styles.secondaryText}>Deconnexion</Text>
        </Pressable>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ gap: 10, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.studentCard}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentMeta}>Tarif: {item.rate}</Text>
            <Text style={styles.studentMeta}>Statut: {item.archived ? "Archive" : "Actif"}</Text>
          </View>
        )}
      />
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
  studentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  studentName: {
    fontWeight: "700",
    fontSize: 16,
  },
  studentMeta: {
    color: "#4b5563",
  },
});
