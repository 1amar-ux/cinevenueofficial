import '../../core/constants/api_endpoints.dart';
import '../../core/network/api_client.dart';
import '../../models/cinecoins_model.dart';

class CineCoinsService {
  final ApiClient _apiClient = ApiClient();

  Future<CineCoinsWalletModel> getWallet() async {
    final response = await _apiClient.get(ApiEndpoints.cineCoinsWallet);
    final data = response.data;
    final walletJson = data['data'] ?? data;
    return CineCoinsWalletModel.fromJson(walletJson);
  }

  Future<int> claimDailyReward() async {
    final response = await _apiClient.post(ApiEndpoints.cineCoinsClaimDaily);
    final data = response.data;
    return data['data']?['newBalance'] ?? data['newBalance'] ?? 0;
  }

  Future<Map<String, dynamic>> spinWheel(int rewardCoins, String rewardName) async {
    final response = await _apiClient.post(
      ApiEndpoints.cineCoinsSpin,
      data: {
        'rewardCoins': rewardCoins,
        'rewardName': rewardName,
      },
    );
    return response.data;
  }

  Future<void> sendCoins({
    required String recipientEmail,
    required int amount,
    String? note,
  }) async {
    await _apiClient.post(
      ApiEndpoints.cineCoinsSend,
      data: {
        'recipientEmail': recipientEmail.trim().toLowerCase(),
        'amount': amount,
        if (note != null) 'note': note,
      },
    );
  }
}
