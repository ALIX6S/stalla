import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../data/models/stand_zone_overview.dart';
import '../providers/stands_provider.dart';
import '../router/app_router.dart';
import '../widgets/async_body.dart';

class StandListScreen extends StatefulWidget {
  const StandListScreen({super.key});

  @override
  State<StandListScreen> createState() => _StandListScreenState();
}

class _StandListScreenState extends State<StandListScreen> {
  String? _expandedZone;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<StandsProvider>().load();
    });
  }

  void _requestStand(String zone, String category) {
    context.push(
      AppRoutes.register,
      extra: RegisterArgs(zone: zone, category: category),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F8F8),
      appBar: AppBar(
        title: Text('Stands Disponibles',
            style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0,
      ),
      body: Consumer<StandsProvider>(
        builder: (context, provider, _) {
          final zones = provider.zones;
          return AsyncBody(
            isLoading: provider.isLoading,
            hasData: zones.isNotEmpty,
            error: provider.errorMessage,
            onRefresh: provider.load,
            child: zones.isEmpty
                ? Center(
                    child: Text('Aucun stand disponible pour le moment.',
                        style: GoogleFonts.poppins(color: Colors.grey)),
                  )
                : RefreshIndicator(
                    onRefresh: provider.load,
                    color: AppColors.orangePantone,
                    child: ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      itemCount: zones.length,
                      itemBuilder: (context, index) {
                        final zone = zones[index];
                        final isExpanded = _expandedZone == zone.zone;
                        return _ZoneCard(
                          zone: zone,
                          isExpanded: isExpanded,
                          onTap: () => setState(
                              () => _expandedZone = isExpanded ? null : zone.zone),
                          onRequest: _requestStand,
                        );
                      },
                    ),
                  ),
          );
        },
      ),
    );
  }
}

class _ZoneCard extends StatelessWidget {
  final StandZoneOverview zone;
  final bool isExpanded;
  final VoidCallback onTap;
  final void Function(String zone, String category) onRequest;

  const _ZoneCard({
    required this.zone,
    required this.isExpanded,
    required this.onTap,
    required this.onRequest,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.orangePantone.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(
                        zone.zone.substring(0, 1).toUpperCase(),
                        style: GoogleFonts.poppins(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: AppColors.orangePantone,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          AppConstants.zoneLabel(zone.zone),
                          style: GoogleFonts.poppins(
                              fontWeight: FontWeight.w600, fontSize: 16),
                        ),
                        Text(
                          '${zone.totalAvailable} stand(s) disponible(s)',
                          style: GoogleFonts.poppins(
                              color: Colors.grey[600], fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                  Icon(isExpanded ? Icons.expand_less : Icons.expand_more,
                      color: Colors.grey),
                ],
              ),
            ),
          ),
          if (isExpanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Column(
                children: [
                  const Divider(),
                  const SizedBox(height: 8),
                  _CategoryRow(
                    label: 'Standard',
                    overview: zone.standard,
                    color: const Color(0xFF4CAF50),
                    onRequest: () =>
                        onRequest(zone.zone, AppConstants.categoryStandard),
                  ),
                  const SizedBox(height: 10),
                  _CategoryRow(
                    label: 'Premium',
                    overview: zone.premium,
                    color: AppColors.orangePantone,
                    onRequest: () =>
                        onRequest(zone.zone, AppConstants.categoryPremium),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _CategoryRow extends StatelessWidget {
  final String label;
  final CategoryOverview overview;
  final Color color;
  final VoidCallback onRequest;

  const _CategoryRow({
    required this.label,
    required this.overview,
    required this.color,
    required this.onRequest,
  });

  @override
  Widget build(BuildContext context) {
    final isAvailable = overview.available > 0;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
                color: color, borderRadius: BorderRadius.circular(20)),
            child: Text(
              label,
              style: GoogleFonts.poppins(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.w600),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${overview.available} disponible(s)',
                    style: GoogleFonts.poppins(
                        fontWeight: FontWeight.w600, fontSize: 13)),
                if (isAvailable)
                  Text(formatCurrency(overview.priceMax),
                      style: GoogleFonts.poppins(
                          color: Colors.grey[600], fontSize: 12)),
              ],
            ),
          ),
          if (isAvailable)
            TextButton(
              onPressed: onRequest,
              style: TextButton.styleFrom(
                foregroundColor: color,
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              ),
              child: Text('Demander',
                  style: GoogleFonts.poppins(
                      fontWeight: FontWeight.w600, fontSize: 13)),
            )
          else
            Text('Complet',
                style: GoogleFonts.poppins(color: Colors.grey, fontSize: 12)),
        ],
      ),
    );
  }
}
