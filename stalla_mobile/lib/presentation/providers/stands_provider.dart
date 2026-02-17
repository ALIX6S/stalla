import 'package:flutter/foundation.dart';
import '../../data/models/stand_zone_overview.dart';
import '../../data/repositories/stand_repository.dart';

/// Stands disponibles (données publiques, sans authentification).
class StandsProvider extends ChangeNotifier {
  final StandRepository _repository;

  StandsProvider(this._repository);

  List<StandZoneOverview> _zones = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<StandZoneOverview> get zones => _zones;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  StandZoneOverview? zoneByCode(String? code) {
    for (final zone in _zones) {
      if (zone.zone == code) return zone;
    }
    return null;
  }

  Future<void> load() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final response = await _repository.getPublicOverview();
    if (response.hasData) {
      _zones = response.data!;
    } else {
      _errorMessage = response.message;
    }

    _isLoading = false;
    notifyListeners();
  }
}
