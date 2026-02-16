/** Enveloppe un handler async pour acheminer les erreurs vers errorHandler. */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
