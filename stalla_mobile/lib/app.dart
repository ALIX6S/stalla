import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'core/constants/app_constants.dart';
import 'core/theme/app_theme.dart';
import 'presentation/providers/auth_provider.dart';
import 'presentation/providers/payment_provider.dart';
import 'presentation/providers/vendor_provider.dart';
import 'presentation/router/app_router.dart';

class StallaApp extends StatefulWidget {
  const StallaApp({super.key});

  @override
  State<StallaApp> createState() => _StallaAppState();
}

class _StallaAppState extends State<StallaApp> {
  late final AuthProvider _auth = context.read<AuthProvider>();
  late final GoRouter _router = buildRouter(_auth);

  @override
  void initState() {
    super.initState();
    _auth.addListener(_clearDataOnLogout);
  }

  /// Évite d'afficher les données d'un vendeur à la session suivante.
  void _clearDataOnLogout() {
    if (_auth.isAuthenticated) return;
    context.read<VendorProvider>().clear();
    context.read<PaymentProvider>().clear();
  }

  @override
  void dispose() {
    _auth.removeListener(_clearDataOnLogout);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: _router,
    );
  }
}
