import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../providers/vendor_provider.dart';
import '../router/app_router.dart';

class _NavItem {
  final IconData icon;
  final String label;

  const _NavItem(this.icon, this.label);
}

/// Coque de l'espace vendeur : barre de navigation flottante + chargement initial.
class MainLayout extends StatefulWidget {
  final Widget child;
  final String currentPath;

  const MainLayout({
    super.key,
    required this.child,
    required this.currentPath,
  });

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  // Même ordre que AppRoutes.tabs.
  static const _items = [
    _NavItem(Icons.home_rounded, 'Accueil'),
    _NavItem(Icons.store_rounded, 'Stand'),
    _NavItem(Icons.warning_amber_rounded, 'Dettes'),
    _NavItem(Icons.receipt_long_rounded, 'Ventes'),
    _NavItem(Icons.person_rounded, 'Profil'),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<VendorProvider>().load();
    });
  }

  int get _currentIndex {
    final index = AppRoutes.tabs.indexOf(widget.currentPath);
    return index < 0 ? 0 : index;
  }

  void _onItemTapped(int index) {
    if (_currentIndex != index) context.go(AppRoutes.tabs[index]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: widget.child,
      bottomNavigationBar: Container(
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 20),
        height: 70,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            for (var i = 0; i < _items.length; i++) _buildNavItem(i),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(int index) {
    final item = _items[index];
    final isSelected = _currentIndex == index;
    final color =
        isSelected ? AppColors.orangePantone : Colors.grey.withValues(alpha: 0.6);

    return InkWell(
      onTap: () => _onItemTapped(index),
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.orangePantone.withValues(alpha: 0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(item.icon, color: color, size: 26),
            const SizedBox(height: 4),
            Text(
              item.label,
              style: TextStyle(
                color: color,
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
