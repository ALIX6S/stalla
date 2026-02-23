import '../../core/constants/app_constants.dart';
import '../models/api_response.dart';
import '../models/payment.dart';
import '../services/api_client.dart';

class PaymentRepository {
  final ApiClient _api;

  const PaymentRepository(this._api);

  Future<ApiResponse<List<Payment>>> getPayments() {
    return _api.get<List<Payment>>(
      ApiEndpoints.vendorPayments,
      parse: (json) => (json as List)
          .map((e) => Payment.fromJson(e as Map<String, dynamic>))
          .toList(),
      errorMessage: 'Erreur lors de la récupération des paiements',
    );
  }
}
