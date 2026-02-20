import { useCallback, useState } from "react";

export interface Feedback {
  type: "success" | "error";
  text: string;
}

export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const success = useCallback((text: string) => setFeedback({ type: "success", text }), []);
  const error = useCallback((text: string) => setFeedback({ type: "error", text }), []);
  const clear = useCallback(() => setFeedback(null), []);
  return { feedback, success, error, clear };
}
