import "dotenv/config";

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  webBaseUrl: process.env.WEB_BASE_URL || "http://localhost:5173",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    database: process.env.DB_NAME || "stalla",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  },
  jwtSecret: process.env.JWT_SECRET || "CHANGE_ME_IN_PRODUCTION",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  // Si false, /api/auth/register-admin n'est possible que tant qu'aucun admin n'existe.
  allowAdminSelfRegistration: process.env.ALLOW_ADMIN_SELF_REGISTRATION !== "false",
  brevo: {
    apiKey: process.env.BREVO_API_KEY || null,
    senderEmail: process.env.BREVO_SENDER_EMAIL || null,
    senderName: process.env.BREVO_SENDER_NAME || "STALLA",
  },
};

export const isProduction = config.env === "production";
