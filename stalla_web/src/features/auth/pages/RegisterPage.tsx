import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../../../shared/components/Alert";
import { AuthShell } from "../../../shared/components/AuthShell";
import { FormField } from "../../../shared/components/FormField";
import { IconInput } from "../../../shared/components/IconInput";
import { PasswordInput } from "../../../shared/components/PasswordInput";
import { useFeedback } from "../../../shared/hooks/useFeedback";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const { registerAdmin } = useAuth();
  const navigate = useNavigate();
  const { feedback, error, clear } = useFeedback();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    clear();
    const result = await registerAdmin(name.trim(), email.trim(), password);
    setLoading(false);
    if (!result.ok) {
      error(result.message);
      setPassword("");
      return;
    }
    navigate("/login", {
      replace: true,
      state: { message: "Compte créé. Connectez-vous avec vos identifiants." },
    });
  };

  return (
    <AuthShell
      title="Créer un admin"
      subtitle="Accédez au panneau de gestion de votre marché."
      footer={
        <>
          Déjà un compte ?<Link to="/login">Se connecter</Link>
        </>
      }
    >
      {feedback && <Alert icon>{feedback.text}</Alert>}

      <form onSubmit={handleSubmit} className="form-stack">
        <FormField label="Nom complet" htmlFor="name">
          <IconInput
            icon="user"
            id="name"
            type="text"
            placeholder="Ex: Jean Dupont"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </FormField>

        <FormField label="Email" htmlFor="email">
          <IconInput
            icon="mail"
            id="email"
            type="email"
            placeholder="admin@stalla.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </FormField>

        <FormField label="Mot de passe" htmlFor="password">
          <PasswordInput
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </FormField>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? <div className="loader"></div> : "Créer le compte"}
        </button>
      </form>
    </AuthShell>
  );
}
