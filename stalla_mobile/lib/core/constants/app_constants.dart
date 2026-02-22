class AppConstants {
  AppConstants._();

  static const String appName = 'STALLA';

  /// Surchargeable : `--dart-define=API_BASE_URL=https://.../api`
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:4000/api',
  );

  static const String roleVendor = 'VENDOR';

  static const String categoryStandard = 'STANDARD';
  static const String categoryPremium = 'PREMIUM';

  /// Zones fixes du marché.
  static const Map<String, String> zoneLabels = {
    'A': 'Zone A - Entrée',
    'B': 'Zone B - Produits frais',
    'C': 'Zone C - Textile',
    'D': 'Zone D - Divers',
  };

  static String zoneLabel(String zone) => zoneLabels[zone] ?? 'Zone $zone';
}

class ApiEndpoints {
  ApiEndpoints._();

  static const String login = '/auth/login';
  static const String vendorApplication = '/auth/vendor-application';
  static const String vendorProfile = '/vendor/profile';
  static const String vendorMyStall = '/vendor/my-stall';
  static const String vendorBalance = '/vendor/balance';
  static const String vendorPayments = '/vendor/payments';
  static const String vendorResetPassword = '/vendor/reset-password';
  static const String publicStandsOverview = '/public/stands/overview';
}
