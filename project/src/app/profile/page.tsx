"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, toErrorMessage } from "@/lib/client-api";

interface MeResponse {
  user: {
    id: string;
    email: string | null;
    role: "ADMIN" | "STUDENT";
    studentId?: string;
    mustChangePassword: boolean;
  };
}

export default function ProfilePage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest<MeResponse>("/api/auth/me");
      setMe(data);
      setError(null);
    } catch (profileError) {
      setError(toErrorMessage(profileError, "Impossible de charger le profil"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChangePassword = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setError(null);

    try {
      await apiRequest("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: currentPassword || undefined,
          newPassword,
        }),
      });

      setStatus("Mot de passe mis à jour.");
      setCurrentPassword("");
      setNewPassword("");
      await loadProfile();
    } catch (changeError) {
      setError(toErrorMessage(changeError, "Impossible de changer le mot de passe"));
    }
  };

  if (loading) {
    return (
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Profil</h1>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Profil</h1>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>Email:</strong> {me?.user.email ?? "Non renseigné"}
          </p>
          <p>
            <strong>Role:</strong> {me?.user.role}
          </p>
          <p>
            <strong>Changement mot de passe requis:</strong> {me?.user.mustChangePassword ? "Oui" : "Non"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Changer le mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4 max-w-md" onSubmit={handleChangePassword}>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                required
                minLength={10}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>

            {status ? <p className="text-sm text-green-700">{status}</p> : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit">Mettre à jour</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
