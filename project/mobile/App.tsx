import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from "react-native";
import {
  AuthTokens,
  AuthUser,
  StudentItem,
  StudentSummary,
  fetchStudentSummary,
  fetchStudents,
  login,
  logout,
  me,
  refresh,
} from "./src/lib/api";
import { LoginScreen } from "./src/screens/LoginScreen";
import { AdminHomeScreen } from "./src/screens/AdminHomeScreen";
import { StudentHomeScreen } from "./src/screens/StudentHomeScreen";

const STORAGE_KEY = "trumpeeeet_auth";

interface StoredAuthState {
  user: AuthUser;
  tokens: AuthTokens;
}

export default function App() {
  const [session, setSession] = useState<StoredAuthState | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persistSession = async (nextSession: StoredAuthState | null) => {
    if (!nextSession) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  };

  const loadRoleData = async (currentSession: StoredAuthState) => {
    if (currentSession.user.role === "ADMIN") {
      const studentList = await fetchStudents(currentSession.tokens.accessToken);
      setStudents(studentList);
      setSummary(null);
      return;
    }

    const summaryPayload = await fetchStudentSummary(currentSession.tokens.accessToken);
    setSummary(summaryPayload);
    setStudents([]);
  };

  const refreshSession = async (currentSession: StoredAuthState) => {
    try {
      const mePayload = await me(currentSession.tokens.accessToken);
      const nextSession = {
        user: mePayload.user,
        tokens: currentSession.tokens,
      };
      setSession(nextSession);
      await loadRoleData(nextSession);
      return;
    } catch {
      const refreshed = await refresh(currentSession.tokens.refreshToken);
      const nextSession = {
        user: refreshed.user,
        tokens: refreshed.tokens,
      };
      setSession(nextSession);
      await persistSession(nextSession);
      await loadRoleData(nextSession);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!saved) {
          return;
        }
        const parsed = JSON.parse(saved) as StoredAuthState;
        await refreshSession(parsed);
      } catch (bootstrapError) {
        const message = bootstrapError instanceof Error ? bootstrapError.message : "Erreur de session";
        setError(message);
      } finally {
        setBooting(false);
      }
    };

    bootstrap();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const payload = await login(email, password);
    const nextSession = {
      user: payload.user,
      tokens: payload.tokens,
    };
    setSession(nextSession);
    await persistSession(nextSession);
    await loadRoleData(nextSession);
  };

  const handleLogout = async () => {
    if (session?.tokens.refreshToken) {
      try {
        await logout(session.tokens.refreshToken);
      } catch {
        // Ignore logout network errors and still clear local state.
      }
    }

    setSession(null);
    setStudents([]);
    setSummary(null);
    await persistSession(null);
  };

  const handleRefresh = async () => {
    if (!session) {
      return;
    }
    setError(null);
    try {
      await refreshSession(session);
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : "Impossible de rafraichir";
      setError(message);
    }
  };

  if (booting) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.app}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!session ? <LoginScreen onLogin={handleLogin} /> : null}
      {session?.user.role === "ADMIN" ? (
        <AdminHomeScreen
          email={session.user.email}
          students={students}
          onRefresh={handleRefresh}
          onLogout={handleLogout}
        />
      ) : null}
      {session?.user.role === "STUDENT" ? (
        <StudentHomeScreen
          email={session.user.email}
          summary={summary}
          onRefresh={handleRefresh}
          onLogout={handleLogout}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  error: {
    color: "#b91c1c",
    textAlign: "center",
    marginTop: 8,
  },
});
