import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../providers/vendor_provider.dart';
import '../widgets/async_body.dart';
import '../widgets/detail_row.dart';
import '../widgets/gradient_card.dart';
import '../widgets/page_app_bar.dart';

class DebtsScreen extends StatelessWidget {
  const DebtsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: buildPageAppBar('Ma Situation Financière'),
      body: Consumer<VendorProvider>(
        builder: (context, vendor, _) {
          final debt = vendor.debt;
          final hasDebt = debt?.hasDebt ?? false;

          return AsyncBody(
            isLoading: vendor.isLoading,
            hasData: debt != null,
            error: vendor.debtError,
            onRefresh: vendor.load,
            child: RefreshableScroll(
              onRefresh: vendor.load,
              children: [
                const SizedBox(height: 10),
                GradientCard(
                  colors: hasDebt
                      ? const [AppColors.sandyBrown, AppColors.orangeLight]
                      : const [Color(0xFF0B9A46), Color(0xFF04DD5F)],
                  shadowColor: hasDebt ? AppColors.orangePantone : Colors.green,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('DETTE ACTUELLE',
                          style: TextStyle(
                              color: Colors.white70,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2,
                              fontSize: 12)),
                      const SizedBox(height: 8),
                      Text(formatCurrency(debt?.currentDebt ?? 0),
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 32,
                              fontWeight: FontWeight.w900)),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          hasDebt ? 'Action requise' : 'Compte à jour',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                DetailRow(
                    label: 'Total dû',
                    value: formatCurrency(debt?.totalDue ?? 0)),
                DetailRow(
                    label: 'Total payé',
                    value: formatCurrency(debt?.totalPaid ?? 0)),
                DetailRow(
                    label: 'Dette en cours',
                    value: formatCurrency(debt?.currentDebt ?? 0)),
              ],
            ),
          );
        },
      ),
    );
  }
}
