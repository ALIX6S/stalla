/** Erreur applicative portant un statut HTTP et un détail `errors` (rendue par errorHandler). */
export class AppError extends Error {
  constructor(status, message, errors = null) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export const badRequest = (message, errors) => new AppError(400, message, errors);
export const unauthorized = (message, errors) => new AppError(401, message, errors);
export const forbidden = (message, errors) => new AppError(403, message, errors);
export const notFound = (message, errors) => new AppError(404, message, errors);
