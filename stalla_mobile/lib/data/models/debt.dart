class Debt {
  final int totalPaid;
  final int totalDue;
  final int currentDebt;

  const Debt({
    required this.totalPaid,
    required this.totalDue,
    required this.currentDebt,
  });

  bool get hasDebt => currentDebt > 0;

  factory Debt.fromJson(Map<String, dynamic> json) {
    int toInt(dynamic v) => v is num ? v.toInt() : int.tryParse('$v') ?? 0;
    return Debt(
      totalPaid: toInt(json['total_paid']),
      totalDue: toInt(json['total_due']),
      currentDebt: toInt(json['current_debt']),
    );
  }
}
