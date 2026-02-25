import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/formatters.dart';
import '../../data/models/stand_zone_overview.dart';
import '../providers/auth_provider.dart';
import '../providers/stands_provider.dart';
import '../router/app_router.dart';
import '../widgets/app_logo.dart';
import '../widgets/auth_switch_link.dart';
import '../widgets/field_label.dart';
import '../widgets/primary_button.dart';

class RegisterScreen extends StatefulWidget {
  final String? initialZone;
  final String? initialCategory;

  const RegisterScreen({super.key, this.initialZone, this.initialCategory});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _personalFormKey = GlobalKey<FormState>();
  final _standFormKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _businessTypeController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();

  int _currentStep = 0;
  late String _selectedZone = widget.initialZone ?? AppConstants.zoneLabels.keys.first;
  late String _selectedCategory =
      widget.initialCategory ?? AppConstants.categoryStandard;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) context.read<StandsProvider>().load();
    });
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _businessTypeController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  CategoryOverview? _category(StandZoneOverview? zone) {
    if (zone == null) return null;
    return _selectedCategory == AppConstants.categoryPremium
        ? zone.premium
        : zone.standard;
  }

  void _goBack() {
    if (context.canPop()) {
      context.pop();
    } else {
      context.go(AppRoutes.landing);
    }
  }

  void _next() {
    if (_personalFormKey.currentState!.validate()) {
      setState(() => _currentStep = 1);
    }
  }

  Future<void> _submit() async {
    final auth = context.read<AuthProvider>();
    final category =
        _category(context.read<StandsProvider>().zoneByCode(_selectedZone));

    final success = await auth.submitVendorApplication(
      fullName: _fullNameController.text.trim(),
      businessType: _businessTypeController.text.trim(),
      phone: _phoneController.text.trim(),
      email: _emailController.text.trim(),
      desiredZone: _selectedZone,
      desiredCategory: _selectedCategory,
      budgetMin: category?.priceMin ?? 0,
      budgetMax: category?.priceMax ?? 0,
    );
    if (!mounted) return;

    if (success) {
      await showDialog<void>(
        context: context,
        barrierDismissible: false,
        builder: (dialogContext) => AlertDialog(
          title: const Text('Demande envoyée !'),
          content: const Text(
            "Votre demande a été envoyée avec succès.\n"
            "L'administration va l'examiner et vous contactera si elle est approuvée.",
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('OK'),
            ),
          ],
        ),
      );
      if (mounted) context.go(AppRoutes.login);
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(auth.errorMessage ?? "Erreur lors de l'envoi"),
        backgroundColor: AppColors.error,
      ),
    );
  }

  String? _required(String? v) =>
      (v == null || v.trim().isEmpty) ? 'Champ requis' : null;

  Widget _buildPersonalStep() {
    return Form(
      key: _personalFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const FieldLabel('Nom complet *'),
          TextFormField(
            controller: _fullNameController,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(hintText: 'Ex: Jonathan Ouedraogo'),
            validator: _required,
          ),
          const SizedBox(height: 16),
          const FieldLabel('Email (optionnel)'),
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            autocorrect: false,
            decoration: const InputDecoration(hintText: 'vendeur@example.com'),
            validator: (v) {
              final value = v?.trim() ?? '';
              if (value.isEmpty) return null;
              return RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(value)
                  ? null
                  : 'Email invalide';
            },
          ),
          const SizedBox(height: 16),
          const FieldLabel('Téléphone *'),
          TextFormField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(hintText: 'Ex: +229 00 00 00 00'),
            validator: _required,
          ),
          const SizedBox(height: 16),
          const FieldLabel('Activité *'),
          TextFormField(
            controller: _businessTypeController,
            decoration: const InputDecoration(hintText: 'Ex: Vente de légumes'),
            validator: _required,
          ),
        ],
      ),
    );
  }

  Widget _buildStandStep() {
    final stands = context.watch<StandsProvider>();
    if (stands.isLoading && stands.zones.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: CircularProgressIndicator(color: AppColors.orangePantone),
        ),
      );
    }

    final category = _category(stands.zoneByCode(_selectedZone));

    return Form(
      key: _standFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const FieldLabel('Zone souhaitée *'),
          DropdownButtonFormField<String>(
            initialValue: _selectedZone,
            decoration: const InputDecoration(hintText: 'Choisir une zone'),
            items: AppConstants.zoneLabels.entries
                .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
                .toList(),
            onChanged: widget.initialZone != null
                ? null
                : (v) => setState(() => _selectedZone = v!),
          ),
          const SizedBox(height: 16),
          const FieldLabel('Catégorie *'),
          DropdownButtonFormField<String>(
            initialValue: _selectedCategory,
            decoration: const InputDecoration(hintText: 'Choisir une catégorie'),
            items: const [
              DropdownMenuItem(
                  value: AppConstants.categoryStandard, child: Text('Standard')),
              DropdownMenuItem(
                  value: AppConstants.categoryPremium, child: Text('Premium')),
            ],
            onChanged: widget.initialCategory != null
                ? null
                : (v) => setState(() => _selectedCategory = v!),
          ),
          if (category != null && category.available > 0) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.orangePantone.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                    color: AppColors.orangePantone.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline,
                      color: AppColors.orangePantone, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Prix du stand : ${formatCurrency(category.priceMax)}',
                      style: const TextStyle(
                        color: AppColors.orangePantone,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLastStep = _currentStep == 1;
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: _goBack,
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Center(child: AppLogo(size: 72)),
              const SizedBox(height: 12),
              Text(
                'Demande de stand',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
              ),
              const SizedBox(height: 4),
              Text(
                "Renseignez vos informations. L'administration validera votre demande.",
                style: TextStyle(color: Colors.grey[600], fontSize: 14),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  _StepIndicator(
                    number: 1,
                    label: 'Infos perso.',
                    isActive: _currentStep == 0,
                    isDone: _currentStep > 0,
                  ),
                  Expanded(
                    child: Container(
                      height: 2,
                      color: _currentStep > 0
                          ? AppColors.orangePantone
                          : Colors.grey[300],
                    ),
                  ),
                  _StepIndicator(
                    number: 2,
                    label: 'Infos stand',
                    isActive: _currentStep == 1,
                    isDone: false,
                  ),
                ],
              ),
              const SizedBox(height: 28),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 250),
                child: isLastStep ? _buildStandStep() : _buildPersonalStep(),
              ),
              const SizedBox(height: 28),
              Consumer<AuthProvider>(
                builder: (context, auth, _) => PrimaryButton(
                  label: isLastStep ? 'Envoyer ma demande' : 'Suivant',
                  height: 54,
                  isLoading: auth.isBusy,
                  onPressed: isLastStep ? _submit : _next,
                ),
              ),
              if (isLastStep)
                Center(
                  child: TextButton(
                    onPressed: () => setState(() => _currentStep = 0),
                    child: const Text('Retour'),
                  ),
                ),
              const SizedBox(height: 8),
              AuthSwitchLink(
                prefix: 'Déjà un compte ?',
                action: 'Se connecter',
                onTap: () => context.go(AppRoutes.login),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StepIndicator extends StatelessWidget {
  final int number;
  final String label;
  final bool isActive;
  final bool isDone;

  const _StepIndicator({
    required this.number,
    required this.label,
    required this.isActive,
    required this.isDone,
  });

  @override
  Widget build(BuildContext context) {
    final highlighted = isActive || isDone;
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: highlighted ? AppColors.orangePantone : Colors.grey[200],
            shape: BoxShape.circle,
          ),
          child: Center(
            child: isDone
                ? const Icon(Icons.check, color: Colors.white, size: 16)
                : Text(
                    '$number',
                    style: TextStyle(
                      color: isActive ? Colors.white : Colors.grey[600],
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: highlighted ? AppColors.orangePantone : Colors.grey[400],
            fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
