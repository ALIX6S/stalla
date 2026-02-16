class CategoryOverview {
  final int available;
  final int priceMin;
  final int priceMax;

  const CategoryOverview({
    required this.available,
    required this.priceMin,
    required this.priceMax,
  });

  factory CategoryOverview.fromJson(Map<String, dynamic>? json) {
    return CategoryOverview(
      available: (json?['available'] as num?)?.toInt() ?? 0,
      priceMin: (json?['price_min'] as num?)?.toInt() ?? 0,
      priceMax: (json?['price_max'] as num?)?.toInt() ?? 0,
    );
  }
}

class StandZoneOverview {
  final String zone;
  final CategoryOverview standard;
  final CategoryOverview premium;

  const StandZoneOverview({
    required this.zone,
    required this.standard,
    required this.premium,
  });

  int get totalAvailable => standard.available + premium.available;

  factory StandZoneOverview.fromJson(Map<String, dynamic> json) {
    return StandZoneOverview(
      zone: json['zone'] as String,
      standard: CategoryOverview.fromJson(
          json['standard'] as Map<String, dynamic>?),
      premium:
          CategoryOverview.fromJson(json['premium'] as Map<String, dynamic>?),
    );
  }
}
