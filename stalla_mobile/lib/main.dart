import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';
import 'app.dart';
import 'data/repositories/auth_repository.dart';
import 'data/repositories/payment_repository.dart';
import 'data/repositories/stand_repository.dart';
import 'data/repositories/vendor_repository.dart';
import 'data/services/api_client.dart';
import 'data/services/session_storage.dart';
import 'presentation/providers/auth_provider.dart';
import 'presentation/providers/payment_provider.dart';
import 'presentation/providers/stands_provider.dart';
import 'presentation/providers/vendor_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initializeDateFormatting('fr_FR');

  const session = SessionStorage();
  final api = ApiClient(session);

  final auth = AuthProvider(AuthRepository(api, session));
  api.onUnauthorized = auth.handleSessionExpired;
  await auth.restoreSession();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: auth),
        ChangeNotifierProvider(
          create: (_) => VendorProvider(VendorRepository(api)),
        ),
        ChangeNotifierProvider(
          create: (_) => PaymentProvider(PaymentRepository(api)),
        ),
        ChangeNotifierProvider(
          create: (_) => StandsProvider(StandRepository(api)),
        ),
      ],
      child: const StallaApp(),
    ),
  );
}
