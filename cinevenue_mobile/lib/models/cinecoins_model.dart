class CineCoinsTransactionModel {
  final String id;
  final int amount; // positive = earned, negative = redeemed/spent
  final String type; // EARNED, REDEEMED, TRANSFER_SENT, TRANSFER_RECEIVED
  final String? activityKey;
  final String description;
  final DateTime createdAt;

  CineCoinsTransactionModel({
    required this.id,
    required this.amount,
    required this.type,
    this.activityKey,
    required this.description,
    required this.createdAt,
  });

  bool get isEarned => amount > 0;

  factory CineCoinsTransactionModel.fromJson(Map<String, dynamic> json) {
    return CineCoinsTransactionModel(
      id: json['id'] ?? '',
      amount: json['amount'] ?? 0,
      type: json['type'] ?? (json['amount'] > 0 ? 'EARNED' : 'REDEEMED'),
      activityKey: json['activityKey'],
      description: json['description'] ?? 'CineCoins activity',
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
    );
  }
}

class CineCoinsWalletModel {
  final int balance;
  final int lifetimeEarned;
  final int totalRedeemed;
  final int dailyStreak;
  final bool isDailyClaimAvailable;
  final List<CineCoinsTransactionModel> recentTransactions;

  CineCoinsWalletModel({
    required this.balance,
    required this.lifetimeEarned,
    required this.totalRedeemed,
    this.dailyStreak = 1,
    this.isDailyClaimAvailable = true,
    this.recentTransactions = const [],
  });

  factory CineCoinsWalletModel.fromJson(Map<String, dynamic> json) {
    List<CineCoinsTransactionModel> txs = [];
    if (json['transactions'] is List) {
      txs = (json['transactions'] as List).map((t) => CineCoinsTransactionModel.fromJson(t)).toList();
    }

    return CineCoinsWalletModel(
      balance: json['balance'] ?? 0,
      lifetimeEarned: json['lifetimeEarned'] ?? 0,
      totalRedeemed: json['totalRedeemed'] ?? 0,
      dailyStreak: json['dailyStreak'] ?? 1,
      isDailyClaimAvailable: json['isDailyClaimAvailable'] ?? true,
      recentTransactions: txs,
    );
  }
}
