class Stand {
  final String code;
  final String zone;
  final int monthlyRent;
  final String? endDate;
  final int? daysRemaining;

  const Stand({
    required this.code,
    required this.zone,
    required this.monthlyRent,
    this.endDate,
    this.daysRemaining,
  });

  /// Réponse de `GET /vendor/my-stall`.
  factory Stand.fromJson(Map<String, dynamic> json) {
    return Stand(
      code: (json['stall_code'] as String?) ?? '',
      zone: (json['zone'] as String?) ?? '',
      monthlyRent: (json['monthly_price'] as num?)?.toInt() ?? 0,
      endDate: json['end_date'] as String?,
      daysRemaining: (json['days_remaining'] as num?)?.toInt(),
    );
  }
}
