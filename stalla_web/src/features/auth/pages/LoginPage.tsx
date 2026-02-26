import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../../../shared/components/Alert";
import { AuthShell } from "../../../shared/components/AuthShell";
import { FormField } from "../../../shared/components/FormField";
import { IconInput } from "../../../shared/components/IconInput";
import { PasswordInput } from "../../../shared/components/PasswordInput";
import { useFeedback } from "../../../shared/hooks/useFeedback";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { feedback, error, clear } = useFeedback();
  const flashMessage = (location.state as { message?: string } | null)?.message ?? null;
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    clear();
    const result = await loginAdmin(identifier.trim(), password);
    setLoading(false);
    if (!result.ok) {
      error(result.message);
      setPassword("");
      return;
    }
    navigate("/admin", { replace: true });
  };

  return (
    <AuthShell
      title="Bon retour"
      subtitle="Connectez-vous pour gérer votre marché."
      footer={
        <>
          Pas encore d&apos;accès ?<Link to="/register">Créer un compte</Link>
        </>
      }
    >
      {feedback ? (
        <Alert icon>{feedback.text}</Alert>
      ) : (
        flashMessage && <Alert type="success" icon>{flashMessage}</Alert>
      )}

      <form onSubmit={handleSubmit} className="form-stack">
        <FormField label="Email" htmlFor="identifier">
          <IconInput
            icon="user"
            id="identifier"
            name="identifier"
            type="text"
            placeholder="Email ou téléphone"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            required
          />
        </FormField>

        <FormField label="Mot de passe" htmlFor="password">
          <PasswordInput
            id="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Link to="/forgot-password" className="text-link-btn">
            Mot de passe oublié ?
          </Link>
        </FormField>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? <div className="loader"></div> : "Se connecter"}
        </button>
      </form>
    </AuthShell>
  );
}
