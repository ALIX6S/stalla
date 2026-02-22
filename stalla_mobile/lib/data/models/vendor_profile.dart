import 'stand.dart';

class VendorProfile {
  final String fullName;
  final String phone;
  final String? email;
  final String? businessType;
  final String? supportPhone;
  final Stand? stand;

  const VendorProfile({
    required this.fullName,
    required this.phone,
    this.email,
    this.businessType,
    this.supportPhone,
    this.stand,
  });

  /// Réponse de `GET /vendor/profile`, enrichie du stand actif (si existant).
  factory VendorProfile.fromJson(Map<String, dynamic> json, {Stand? stand}) {
    String? clean(dynamic v) {
      final s = (v as String?)?.trim();
      return (s == null || s.isEmpty) ? null : s;
    }

    return VendorProfile(
      fullName: clean(json['full_name']) ?? 'Utilisateur',
      phone: clean(json['phone']) ?? '',
      email: clean(json['email']),
      businessType: clean(json['business_type']),
      supportPhone: clean(json['support_phone']),
      stand: stand,
    );
  }
}
