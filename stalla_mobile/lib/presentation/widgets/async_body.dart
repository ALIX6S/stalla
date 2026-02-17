import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import 'error_widget.dart';
import 'loading_widget.dart';

/// Affiche chargement / erreur / contenu selon l'état d'une source de données.
class AsyncBody extends StatelessWidget {
  final bool isLoading;
  final bool hasData;
  final String? error;
  final Future<void> Function() onRefresh;
  final Widget child;
  final String loadingMessage;

  const AsyncBody({
    super.key,
    required this.isLoading,
    required this.hasData,
    required this.error,
    required this.onRefresh,
    required this.child,
    this.loadingMessage = 'Chargement...',
  });

  @override
  Widget build(BuildContext context) {
    if (!hasData && isLoading) return LoadingWidget(message: loadingMessage);
    if (!hasData && error != null) {
      return ErrorDisplay(message: error!, onRetry: onRefresh);
    }
    return child;
  }
}

/// Contenu défilant avec « pull to refresh ».
class RefreshableScroll extends StatelessWidget {
  final Future<void> Function() onRefresh;
  final List<Widget> children;
  final EdgeInsets padding;

  const RefreshableScroll({
    super.key,
    required this.onRefresh,
    required this.children,
    this.padding = const EdgeInsets.symmetric(horizontal: 20),
  });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      color: AppColors.orangePantone,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: padding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ...children,
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }
}
