import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_colors.dart';
import '../providers/auth_provider.dart';
import '../router/app_router.dart';
import '../widgets/app_logo.dart';
import '../widgets/auth_switch_link.dart';
import '../widgets/field_label.dart';
import '../widgets/primary_button.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isPasswordVisible = false;
  bool _isEmailLogin = true;

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _selectMode({required bool email}) {
    if (_isEmailLogin == email) return;
    setState(() {
      _isEmailLogin = email;
      _identifierController.clear();
    });
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    var identifier = _identifierController.text.trim();
    if (!_isEmailLogin) identifier = identifier.replaceAll(RegExp(r'\s+'), '');

    final auth = context.read<AuthProvider>();
    final success = await auth.login(identifier, _passwordController.text);

    // En cas de succès, le routeur redirige vers l'accueil.
    if (!mounted || success) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(auth.errorMessage ?? 'Erreur de connexion'),
        backgroundColor: AppColors.error,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.only(bottom: 24),
                      child: AppLogo(size: 100),
                    ),
                  ),
                  Text(
                    'Connexion',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Accédez à votre espace vendeur',
                    style: TextStyle(color: Colors.grey[600], fontSize: 16),
                  ),
                  const SizedBox(height: 32),
                  _ModeToggle(
                    isEmail: _isEmailLogin,
                    onChanged: (email) => _selectMode(email: email),
                  ),
                  const SizedBox(height: 32),
                  FieldLabel(
                      _isEmailLogin ? 'Adresse email' : 'Numéro de téléphone'),
                  TextFormField(
                    controller: _identifierController,
                    keyboardType: _isEmailLogin
                        ? TextInputType.emailAddress
                        : TextInputType.phone,
                    autocorrect: false,
                    decoration: InputDecoration(
                      hintText:
                          _isEmailLogin ? 'vendeur@example.com' : '+229 00 00 00 00',
                      prefixIcon: Icon(
                        _isEmailLogin
                            ? Icons.email_outlined
                            : Icons.phone_android_outlined,
                        size: 20,
                      ),
                    ),
                    validator: (value) => (value == null || value.trim().isEmpty)
                        ? 'Ce champ est requis'
                        : null,
                  ),
                  const SizedBox(height: 20),
                  const FieldLabel('Mot de passe'),
                  TextFormField(
                    controller: _passwordController,
                    obscureText: !_isPasswordVisible,
                    decoration: InputDecoration(
                      hintText: '••••••••',
                      prefixIcon: const Icon(Icons.lock_outline, size: 20),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _isPasswordVisible
                              ? Icons.visibility_off
                              : Icons.visibility,
                          color: Colors.grey,
                        ),
                        onPressed: () => setState(
                            () => _isPasswordVisible = !_isPasswordVisible),
                      ),
                    ),
                    validator: (value) => (value == null || value.isEmpty)
                        ? 'Entrez votre mot de passe'
                        : null,
                  ),
                  const SizedBox(height: 40),
                  Consumer<AuthProvider>(
                    builder: (context, auth, _) => PrimaryButton(
                      label: 'Se connecter',
                      isLoading: auth.isBusy,
                      onPressed: _handleLogin,
                    ),
                  ),
                  const SizedBox(height: 12),
                  AuthSwitchLink(
                    prefix: 'Pas de compte ?',
                    action: 'Demander un stand',
                    onTap: () => context.go(AppRoutes.register),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ModeToggle extends StatelessWidget {
  final bool isEmail;
  final ValueChanged<bool> onChanged;

  const _ModeToggle({required this.isEmail, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 55,
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          _tab('Email', isActive: isEmail, onTap: () => onChanged(true)),
          _tab('Téléphone', isActive: !isEmail, onTap: () => onChanged(false)),
        ],
      ),
    );
  }

  Widget _tab(String title,
      {required bool isActive, required VoidCallback onTap}) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          decoration: BoxDecoration(
            color: isActive ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    )
                  ]
                : [],
          ),
          alignment: Alignment.center,
          child: Text(
            title,
            style: TextStyle(
              color: isActive ? AppColors.orangePantone : Colors.grey[500],
              fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
              fontSize: 15,
            ),
          ),
        ),
      ),
    );
  }
}
