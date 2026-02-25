import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../data/models/stand.dart';
import '../providers/vendor_provider.dart';
import '../widgets/async_body.dart';
import '../widgets/detail_row.dart';
import '../widgets/empty_state.dart';
import '../widgets/page_app_bar.dart';

class StandScreen extends StatelessWidget {
  const StandScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: buildPageAppBar('Mon Stand'),
      body: Consumer<VendorProvider>(
        builder: (context, vendor, _) {
          final stand = vendor.profile?.stand;

          return AsyncBody(
            isLoading: vendor.isLoading,
            hasData: vendor.profile != null,
            error: vendor.profileError,
            onRefresh: vendor.load,
            child: stand == null
                ? const EmptyState(
                    icon: Icons.store_outlined,
                    title: 'Aucun stand assigné',
                    subtitle: "Veuillez contacter l'administration.",
                  )
                : RefreshableScroll(
                    onRefresh: vendor.load,
                    children: [
                      const SizedBox(height: 10),
                      _MainStandCard(stand: stand),
                      const SizedBox(height: 25),
                      const Text("Détails de l'emplacement",
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      DetailRow(
                        icon: Icons.map_outlined,
                        label: 'Zone géographique',
                        value: stand.zone,
                      ),
                      DetailRow(
                        icon: Icons.attach_money_rounded,
                        label: 'Loyer mensuel',
                        value: formatCurrency(stand.monthlyRent),
                      ),
                      if (stand.endDate != null)
                        DetailRow(
                          icon: Icons.event_outlined,
                          label: 'Fin du contrat',
                          value: formatDate(stand.endDate!),
                        ),
                      if (stand.daysRemaining != null)
                        DetailRow(
                          icon: Icons.hourglass_bottom_rounded,
                          label: 'Jours restants',
                          value: '${stand.daysRemaining}',
                        ),
                      const SizedBox(height: 18),
                      const _RentNotice(),
                    ],
                  ),
          );
        },
      ),
    );
  }
}

class _MainStandCard extends StatelessWidget {
  final Stand stand;

  const _MainStandCard({required this.stand});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 20,
            offset: const Offset(0, 10),
          )
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.orangePantone.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.storefront_rounded,
                color: AppColors.orangePantone, size: 40),
          ),
          const SizedBox(height: 16),
          Text('Stand ${stand.code}',
              style:
                  const TextStyle(fontSize: 24, fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Text('Contrat Actif',
              style: TextStyle(
                  color: Colors.green[600], fontWeight: FontWeight.bold)),
          const SizedBox(height: 24),
          const Divider(),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _QuickStat(label: 'Zone', value: stand.zone),
              _QuickStat(label: 'Loyer', value: formatCurrency(stand.monthlyRent)),
            ],
          ),
        ],
      ),
    );
  }
}

class _QuickStat extends StatelessWidget {
  final String label;
  final String value;

  const _QuickStat({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
        const SizedBox(height: 4),
        Text(value,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }
}

class _RentNotice extends StatelessWidget {
  const _RentNotice();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.orangePantone.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(20),
        border:
            Border.all(color: AppColors.orangePantone.withValues(alpha: 0.2)),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.info_rounded, color: AppColors.orangePantone),
          SizedBox(width: 15),
          Expanded(
            child: Text(
              "Le loyer est dû mensuellement. En cas de retard, veuillez contacter l'administration.",
              style: TextStyle(fontSize: 13, color: Colors.black87, height: 1.5),
            ),
          ),
        ],
      ),
    );
  }
}
