import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Alert } from "../../../shared/components/Alert";
import { FormField } from "../../../shared/components/FormField";
import { Panel } from "../../../shared/components/Panel";
import { useApiData } from "../../../shared/hooks/useApiData";
import { useFeedback } from "../../../shared/hooks/useFeedback";
import { getSupportSettings, updateSupportSettings } from "../services/supportService";
import type { SupportSettings } from "../services/supportService";

const EMPTY_SETTINGS: SupportSettings = { support_phone: null };

export function SupportSettingsPage() {
  const { data, loading, error: loadError } = useApiData(getSupportSettings, EMPTY_SETTINGS);
  const { feedback, success, error, clear } = useFeedback();
  const [supportPhone, setSupportPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSupportPhone(data.support_phone ?? "");
  }, [data]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    clear();
    const response = await updateSupportSettings({ support_phone: supportPhone.trim() });
    setSaving(false);
    if (response.success) success("Numéro support mis à jour.");
    else error(response.message);
  };

  return (
    <section className="admin-page-space">
      {loadError && <Alert>{loadError}</Alert>}
      {feedback && <Alert type={feedback.type}>{feedback.text}</Alert>}

      <Panel
        variant="form"
        title="Support client"
        description="Ce numéro s'affiche dans l'app mobile pour contacter l'admin."
        className="form-panel support-panel"
      >
        {loading ? (
          <p className="helper-text">Chargement...</p>
        ) : (
          <form className="form-stack" onSubmit={handleSubmit}>
            <FormField label="Numéro support" htmlFor="support-phone">
              <input
                id="support-phone"
                type="tel"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="Ex: +243xxxxxxxxx"
                required
              />
            </FormField>
            <button className="btn-primary accent" type="submit" disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        )}
      </Panel>
    </section>
  );
}
