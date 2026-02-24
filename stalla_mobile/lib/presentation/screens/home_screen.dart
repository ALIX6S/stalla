import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../data/models/stand.dart';
import '../providers/auth_provider.dart';
import '../providers/vendor_provider.dart';
import '../widgets/async_body.dart';
import '../widgets/gradient_card.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      body: SafeArea(
        child: Consumer<VendorProvider>(
          builder: (context, vendor, _) {
            final profile = vendor.profile;
            final debt = vendor.debt;
            final stand = profile?.stand;
            final name = profile?.fullName ??
                context.read<AuthProvider>().user?.name ??
                'Utilisateur';

            return AsyncBody(
              isLoading: vendor.isLoading,
              hasData: profile != null,
              error: vendor.profileError,
              onRefresh: vendor.load,
              loadingMessage: 'Préparation du tableau de bord...',
              child: RefreshableScroll(
                onRefresh: vendor.load,
                padding:
                    const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
                children: [
                  Text('Bonjour',
                      style: TextStyle(color: Colors.grey[600], fontSize: 16)),
                  Text(name,
                      style: const TextStyle(
                          fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 25),
                  if (stand != null) _StandCard(stand: stand),
                  const SizedBox(height: 20),
                  const Text('Résumé financier',
                      style:
                          TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 15),
                  Row(
                    children: [
                      Expanded(
                        child: _StatCard(
                          title: 'Dette actuelle',
                          value: debt != null
                              ? formatCurrencyShort(debt.currentDebt)
                              : '-',
                          color: (debt?.hasDebt ?? false)
                              ? Colors.redAccent
                              : Colors.green,
                          icon: Icons.account_balance_wallet_rounded,
                        ),
                      ),
                      const SizedBox(width: 15),
                      Expanded(
                        child: _StatCard(
                          title: 'Loyer Mensuel',
                          value: stand != null
                              ? formatCurrencyShort(stand.monthlyRent)
                              : '-',
                          color: AppColors.orangePantone,
                          icon: Icons.storefront_rounded,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  if (debt != null)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Total payé: ${formatCurrencyShort(debt.totalPaid)}',
                              style:
                                  const TextStyle(fontWeight: FontWeight.w600)),
                          Text('Total dû: ${formatCurrencyShort(debt.totalDue)}',
                              style:
                                  const TextStyle(fontWeight: FontWeight.w600)),
                        ],
                      ),
                    )
                  else if (vendor.debtError != null)
                    Text(vendor.debtError!,
                        style: const TextStyle(color: AppColors.error)),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class _StandCard extends StatelessWidget {
  final Stand stand;

  const _StandCard({required this.stand});

  @override
  Widget build(BuildContext context) {
    return GradientCard(
      colors: const [AppColors.orangePantone, AppColors.orangeLight],
      shadowColor: AppColors.orangePantone,
      radius: 28,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('STAND ACTUEL',
              style: TextStyle(
                  color: Colors.white70,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  letterSpacing: 1.2)),
          const SizedBox(height: 8),
          Text(stand.code,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 36,
                  fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Text('Zone: ${stand.zone}',
              style: const TextStyle(color: Colors.white, fontSize: 16)),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final Color color;
  final IconData icon;

  const _StatCard({
    required this.title,
    required this.value,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 10,
              offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(height: 12),
          Text(title, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
          const SizedBox(height: 4),
          Text(value,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        ],
      ),
    );
  }
}
