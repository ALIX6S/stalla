import 'package:flutter/material.dart';

/// Grande carte à fond dégradé avec ombre colorée.
class GradientCard extends StatelessWidget {
  final List<Color> colors;
  final Color shadowColor;
  final double radius;
  final Widget child;

  const GradientCard({
    super.key,
    required this.colors,
    required this.shadowColor,
    required this.child,
    this.radius = 24,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: colors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(radius),
        boxShadow: [
          BoxShadow(
            color: shadowColor.withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: child,
    );
  }
}
