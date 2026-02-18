import 'package:flutter_test/flutter_test.dart';
import 'package:stalla_mobile/data/models/debt.dart';
import 'package:stalla_mobile/data/models/stand.dart';
import 'package:stalla_mobile/data/models/vendor_profile.dart';

void main() {
  test('Debt.fromJson parse les montants et expose hasDebt', () {
    final debt = Debt.fromJson(
        {'total_paid': 5000, 'total_due': '15000', 'current_debt': 10000.0});
    expect(debt.totalDue, 15000);
    expect(debt.hasDebt, isTrue);
  });

  test('Stand.fromJson lit la réponse /vendor/my-stall', () {
    final stand = Stand.fromJson({
      'stall_code': 'A-01',
      'zone': 'A',
      'monthly_price': 20000,
      'days_remaining': null,
    });
    expect(stand.code, 'A-01');
    expect(stand.monthlyRent, 20000);
    expect(stand.daysRemaining, isNull);
  });

  test('VendorProfile masque le support quand il est null ou vide', () {
    final profile = VendorProfile.fromJson(
        {'full_name': 'Awa', 'phone': '+22900000001', 'support_phone': ' '});
    expect(profile.supportPhone, isNull);
    expect(profile.email, isNull);
  });
}
