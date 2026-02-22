class User {
  final int id;
  final String name;
  final String? email;
  final String phone;
  final String role;

  const User({
    required this.id,
    required this.name,
    this.email,
    required this.phone,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      name: (json['name'] as String?) ?? 'Utilisateur',
      email: json['email'] as String?,
      phone: (json['phone'] as String?) ?? '',
      role: (json['role'] as String?) ?? 'VENDOR',
    );
  }
}
