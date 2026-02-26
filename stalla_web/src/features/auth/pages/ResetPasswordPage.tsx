import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Alert } from "../../../shared/components/Alert";
import { AuthShell } from "../../../shared/components/AuthShell";
import { FormField } from "../../../shared/components/FormField";
import { PasswordInput } from "../../../shared/components/PasswordInput";
import { useFeedback } from "../../../shared/hooks/useFeedback";
import { resetPassword } from "../services/authService";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { feedback, error, clear } = useFeedback();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      error("Lien invalide: token manquant.");
      return;
    }
    if (!newPassword || newPassword !== confirmPassword) {
      error("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    clear();
    const response = await resetPassword({ token, new_password: newPassword });
    setLoading(false);
    if (!response.success) {
      error(response.message);
      return;
    }
    navigate("/login", {
      replace: true,
      state: { message: "Mot de passe réinitialisé. Connectez-vous." },
    });
  };

  return (
    <AuthShell
      title="Nouveau mot de passe"
      subtitle="Définissez un nouveau mot de passe administrateur."
      footer={<Link to="/login">Retour à la connexion</Link>}
    >
      {feedback && <Alert>{feedback.text}</Alert>}

      <form onSubmit={handleSubmit} className="form-stack">
        <FormField label="Nouveau mot de passe" htmlFor="new-password">
          <PasswordInput
            id="new-password"
            withIcon={false}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
        </FormField>
        <FormField label="Confirmer le mot de passe" htmlFor="confirm-password">
          <PasswordInput
            id="confirm-password"
            withIcon={false}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
        </FormField>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Réinitialisation..." : "Réinitialiser"}
        </button>
      </form>
    </AuthShell>
  );
}
