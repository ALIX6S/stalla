import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../../data/models/vendor_profile.dart';
import '../providers/auth_provider.dart';
import '../providers/vendor_provider.dart';
import '../widgets/async_body.dart';
import '../widgets/page_app_bar.dart';
import '../widgets/reset_password_dialog.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> _logout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Déconnexion'),
        content: const Text('Êtes-vous sûr de vouloir vous déconnecter ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Déconnexion'),
          ),
        ],
      ),
    );

    // Le routeur redirige vers l'écran public quand la session disparaît.
    if (confirmed == true && context.mounted) {
      await context.read<AuthProvider>().logout();
    }
  }

  Future<void> _resetPassword(BuildContext context) async {
    final change = await ResetPasswordDialog.show(context);
    if (change == null || !context.mounted) return;

    final error = await context.read<VendorProvider>().resetPassword(
          currentPassword: change.current,
          newPassword: change.next,
        );
    if (!context.mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(error ?? 'Mot de passe mis à jour avec succès'),
        backgroundColor: error == null ? Colors.green : AppColors.error,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.pageBackground,
      appBar: buildPageAppBar('Mon Profil'),
      body: Consumer<VendorProvider>(
        builder: (context, vendor, _) {
          final profile = vendor.profile;

          return AsyncBody(
            isLoading: vendor.isLoading,
            hasData: profile != null,
            error: vendor.profileError,
            onRefresh: vendor.load,
            child: profile == null
                ? const SizedBox.shrink()
                : RefreshableScroll(
                    onRefresh: vendor.load,
                    children: [
                      const SizedBox(height: 20),
                      _Header(name: profile.fullName),
                      const SizedBox(height: 35),
                      ..._sections(profile),
                      const SizedBox(height: 40),
                      ElevatedButton.icon(
                        onPressed: () => _resetPassword(context),
                        icon: const Icon(Icons.lock_reset_rounded),
                        label: const Text('Réinitialiser le mot de passe'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.orangePantone,
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 55),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16)),
                        ),
                      ),
                      const SizedBox(height: 14),
                      ElevatedButton.icon(
                        onPressed: () => _logout(context),
                        icon: const Icon(Icons.logout_rounded),
                        label: const Text('Se déconnecter'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.redAccent,
                          minimumSize: const Size(double.infinity, 55),
                          side: const BorderSide(
                              color: Colors.redAccent, width: 1.5),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16)),
                        ),
                      ),
                    ],
                  ),
          );
        },
      ),
    );
  }

  List<Widget> _sections(VendorProfile profile) {
    final stand = profile.stand;
    return [
      const _SectionTitle('Informations Personnelles'),
      const SizedBox(height: 12),
      _ProfileCard(children: [
        _ProfileTile(Icons.person_outline, 'Nom complet', profile.fullName),
        _ProfileTile(Icons.email_outlined, 'Email',
            profile.email ?? 'Non renseigné'),
        _ProfileTile(Icons.phone_iphone_rounded, 'Téléphone',
            profile.phone.isEmpty ? 'Non renseigné' : profile.phone),
      ]),
      const SizedBox(height: 25),
      const _SectionTitle('Mon Établissement'),
      const SizedBox(height: 12),
      _ProfileCard(children: [
        _ProfileTile(Icons.storefront_outlined, 'Stand',
            stand != null ? 'Stand ${stand.code}' : 'Aucun stand assigné'),
        _ProfileTile(Icons.work_outline, 'Activité',
            profile.businessType ?? 'Non renseignée'),
        if (profile.supportPhone != null)
          _ProfileTile(
              Icons.support_agent, 'Support', profile.supportPhone!),
      ]),
    ];
  }
}

class _Header extends StatelessWidget {
  final String name;

  const _Header({required this.name});

  @override
  Widget build(BuildContext context) {
    final initial = name.isNotEmpty ? name[0].toUpperCase() : 'U';
    return Center(
      child: Column(
        children: [
          Container(
            width: 110,
            height: 110,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
              border: Border.all(color: AppColors.orangePantone, width: 3),
              boxShadow: [
                BoxShadow(
                  color: AppColors.orangePantone.withValues(alpha: 0.2),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                )
              ],
            ),
            child: Center(
              child: Text(
                initial,
                style: const TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                  color: AppColors.orangePantone,
                ),
              ),
            ),
          ),
          const SizedBox(height: 15),
          Text(name,
              style:
                  const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const Text('Vendeur', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;

  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        title,
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.bold,
          color: Colors.grey[600],
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class _ProfileCard extends StatelessWidget {
  final List<Widget> children;

  const _ProfileCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(children: children),
    );
  }
}

class _ProfileTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _ProfileTile(this.icon, this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.orangePantone.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.orangePantone, size: 20),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(fontSize: 12, color: Colors.grey)),
                Text(value,
                    style: const TextStyle(
                        fontSize: 15, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
