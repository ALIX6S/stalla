import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Lien « Question ? Action » affiché sous les formulaires d'authentification.
class AuthSwitchLink extends StatelessWidget {
  final String prefix;
  final String action;
  final VoidCallback onTap;

  const AuthSwitchLink({
    super.key,
    required this.prefix,
    required this.action,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: TextButton(
        onPressed: onTap,
        child: Text.rich(
          TextSpan(
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            children: [
              TextSpan(
                text: '$prefix ',
                style: const TextStyle(color: Colors.black87),
              ),
              TextSpan(
                text: action,
                style: const TextStyle(color: AppColors.orangePantone),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
