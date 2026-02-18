import 'package:flutter/material.dart';

typedef PasswordChange = ({String current, String next});

/// Dialogue de changement de mot de passe ; retourne les valeurs saisies et validées.
class ResetPasswordDialog extends StatefulWidget {
  const ResetPasswordDialog({super.key});

  static Future<PasswordChange?> show(BuildContext context) {
    return showDialog<PasswordChange>(
      context: context,
      builder: (_) => const ResetPasswordDialog(),
    );
  }

  @override
  State<ResetPasswordDialog> createState() => _ResetPasswordDialogState();
}

class _ResetPasswordDialogState extends State<ResetPasswordDialog> {
  static const _minLength = 6;

  final _formKey = GlobalKey<FormState>();
  final _current = TextEditingController();
  final _next = TextEditingController();
  final _confirm = TextEditingController();

  @override
  void dispose() {
    _current.dispose();
    _next.dispose();
    _confirm.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    Navigator.pop(context, (current: _current.text, next: _next.text));
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Réinitialiser le mot de passe'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _current,
                obscureText: true,
                decoration:
                    const InputDecoration(labelText: 'Mot de passe actuel'),
                validator: (v) =>
                    (v == null || v.isEmpty) ? 'Champ requis' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _next,
                obscureText: true,
                decoration:
                    const InputDecoration(labelText: 'Nouveau mot de passe'),
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Champ requis';
                  if (v.length < _minLength) {
                    return 'Au moins $_minLength caractères';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _confirm,
                obscureText: true,
                decoration:
                    const InputDecoration(labelText: 'Confirmer le mot de passe'),
                validator: (v) =>
                    v != _next.text ? 'La confirmation ne correspond pas' : null,
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Annuler'),
        ),
        ElevatedButton(onPressed: _submit, child: const Text('Valider')),
      ],
    );
  }
}
