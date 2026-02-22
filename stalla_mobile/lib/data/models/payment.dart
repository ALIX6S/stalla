class Payment {
  final int id;
  final int amount;
  final String period;
  final String date;
  final String? stallCode;
  final String? zone;

  const Payment({
    required this.id,
    required this.amount,
    required this.period,
    required this.date,
    this.stallCode,
    this.zone,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] as int,
      amount: (json['amount_paid'] as num).toInt(),
      period: (json['period'] as String?) ?? '',
      date: (json['payment_date'] as String?) ?? '',
      stallCode: json['stall_code'] as String?,
      zone: json['zone'] as String?,
    );
  }
}
