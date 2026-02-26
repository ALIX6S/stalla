import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../../../shared/components/Alert";
import { AuthShell } from "../../../shared/components/AuthShell";
import { FormField } from "../../../shared/components/FormField";
import { useFeedback } from "../../../shared/hooks/useFeedback";
import { forgotPassword } from "../services/authService";

export function ForgotPasswordPage() {
  const { feedback, success, error, clear } = useFeedback();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    clear();
    const response = await forgotPassword({ email: email.trim() });
    setLoading(false);
    if (response.success) success(response.message);
    else error(response.message);
  };

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Entrez votre email admin pour recevoir un lien de réinitialisation."
      footer={<Link to="/login">Retour à la connexion</Link>}
    >
      {feedback && <Alert type={feedback.type}>{feedback.text}</Alert>}

      <form onSubmit={handleSubmit} className="form-stack">
        <FormField label="Email admin" htmlFor="email">
          <input
            id="email"
            type="email"
            placeholder="admin@stalla.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </FormField>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Envoi..." : "Envoyer le lien"}
        </button>
      </form>
    </AuthShell>
  );
}
