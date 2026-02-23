import '../../core/constants/app_constants.dart';
import '../models/api_response.dart';
import '../models/stand_zone_overview.dart';
import '../services/api_client.dart';

class StandRepository {
  final ApiClient _api;

  const StandRepository(this._api);

  Future<ApiResponse<List<StandZoneOverview>>> getPublicOverview() {
    return _api.get<List<StandZoneOverview>>(
      ApiEndpoints.publicStandsOverview,
      parse: (json) => (json as List)
          .map((e) => StandZoneOverview.fromJson(e as Map<String, dynamic>))
          .toList(),
      errorMessage: 'Erreur lors de la récupération des stands',
    );
  }
}
