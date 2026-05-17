"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, toErrorMessage } from "@/lib/client-api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        redirectOnUnauthorized: false,
      });

      router.push("/");
      router.refresh();
    } catch (loginError) {
      setError(toErrorMessage(loginError, "Connexion impossible"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
