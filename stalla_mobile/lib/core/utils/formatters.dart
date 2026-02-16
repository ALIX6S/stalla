import 'package:intl/intl.dart';

final NumberFormat _amountFormat = NumberFormat('#,###', 'fr_FR');

/// Ex: 15 000 FCFA
String formatCurrency(num amount) => '${_amountFormat.format(amount)} FCFA';

/// Ex: 15 000 F
String formatCurrencyShort(num amount) => '${_amountFormat.format(amount)} F';

/// Ex: 05 mars 2026 (retourne la valeur brute si non parsable).
String formatDate(String raw) {
  final date = DateTime.tryParse(raw);
  if (date == null) return raw;
  return DateFormat('dd MMMM yyyy', 'fr_FR').format(date);
}
