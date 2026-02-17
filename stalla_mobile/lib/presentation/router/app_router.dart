import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../screens/debts_screen.dart';
import '../screens/home_screen.dart';
import '../screens/landing_page.dart';
import '../screens/login_screen.dart';
import '../screens/payments_screen.dart';
import '../screens/profile_screen.dart';
import '../screens/register_screen.dart';
import '../screens/stand_list_screen.dart';
import '../screens/stand_screen.dart';
import '../widgets/main_layout.dart';

class AppRoutes {
  AppRoutes._();

  static const landing = '/landing';
  static const stands = '/stands';
  static const login = '/login';
  static const register = '/register';
  static const home = '/home';
  static const stand = '/stand';
  static const debts = '/debts';
  static const payments = '/payments';
  static const profile = '/profile';

  /// Onglets de la barre de navigation, dans l'ordre d'affichage.
  static const tabs = [home, stand, debts, payments, profile];

  static const _guestOnly = {landing, login, register};
  static const _public = {landing, login, register, stands};
}

/// Paramètres optionnels passés à l'écran de demande de stand.
class RegisterArgs {
  final String zone;
  final String category;

  const RegisterArgs({required this.zone, required this.category});
}

GoRouter buildRouter(AuthProvider auth) {
  return GoRouter(
    initialLocation: AppRoutes.landing,
    refreshListenable: auth,
    redirect: (context, state) {
      final location = state.matchedLocation;
      if (auth.isAuthenticated) {
        return AppRoutes._guestOnly.contains(location) ? AppRoutes.home : null;
      }
      return AppRoutes._public.contains(location) ? null : AppRoutes.landing;
    },
    routes: [
      GoRoute(
        path: AppRoutes.landing,
        builder: (context, state) => const LandingPage(),
      ),
      GoRoute(
        path: AppRoutes.stands,
        builder: (context, state) => const StandListScreen(),
      ),
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.register,
        builder: (context, state) {
          final args = state.extra as RegisterArgs?;
          return RegisterScreen(
            initialZone: args?.zone,
            initialCategory: args?.category,
          );
        },
      ),
      ShellRoute(
        builder: (context, state, child) =>
            MainLayout(currentPath: state.matchedLocation, child: child),
        routes: [
          GoRoute(
            path: AppRoutes.home,
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: AppRoutes.stand,
            builder: (context, state) => const StandScreen(),
          ),
          GoRoute(
            path: AppRoutes.debts,
            builder: (context, state) => const DebtsScreen(),
          ),
          GoRoute(
            path: AppRoutes.payments,
            builder: (context, state) => const PaymentsScreen(),
          ),
          GoRoute(
            path: AppRoutes.profile,
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
    ],
  );
}
