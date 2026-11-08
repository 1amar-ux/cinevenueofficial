import 'dart:math';
import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../models/cinecoins_model.dart';
import '../cinecoins_service.dart';

class CineCoinsScreen extends StatefulWidget {
  const CineCoinsScreen({super.key});

  @override
  State<CineCoinsScreen> createState() => _CineCoinsScreenState();
}

class _CineCoinsScreenState extends State<CineCoinsScreen> with SingleTickerProviderStateMixin {
  final CineCoinsService _cineCoinsService = CineCoinsService();

  CineCoinsWalletModel? _wallet;
  bool _isLoading = true;
  String? _error;
  bool _isClaimingDaily = false;
  bool _isSpinning = false;

  late AnimationController _spinController;
  double _spinAngle = 0;

  @override
  void initState() {
    super.initState();
    _spinController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    );
    _loadWallet();
  }

  Future<void> _loadWallet() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final wallet = await _cineCoinsService.getWallet();
      setState(() {
        _wallet = wallet;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('ApiException: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _handleDailyClaim() async {
    setState(() => _isClaimingDaily = true);
    try {
      final newBalance = await _cineCoinsService.claimDailyReward();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Claimed +25 CineCoins daily streak bonus!'),
          backgroundColor: AppColors.green,
        ),
      );
      _loadWallet();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceAll('ApiException: ', '')),
          backgroundColor: AppColors.danger,
        ),
      );
    } finally {
      if (mounted) setState(() => _isClaimingDaily = false);
    }
  }

  Future<void> _handleSpin() async {
    if (_isSpinning) return;

    setState(() => _isSpinning = true);

    // Random prize from authorized table [5, 10, 15, 20, 25, 50]
    final prizes = [5, 10, 15, 20, 25, 50];
    final selectedPrize = prizes[Random().nextInt(prizes.length)];

    final randomRotations = 4 + Random().nextInt(4);
    final targetAngle = _spinAngle + (randomRotations * 2 * pi) + (Random().nextDouble() * pi);

    final animation = Tween<double>(begin: _spinAngle, end: targetAngle).animate(
      CurvedAnimation(parent: _spinController, curve: Curves.easeOutCubic),
    );

    animation.addListener(() {
      setState(() => _spinAngle = animation.value);
    });

    _spinController.forward(from: 0).then((_) async {
      try {
        await _cineCoinsService.spinWheel(selectedPrize, 'Lucky Spin Reward');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Congratulations! Won +$selectedPrize CineCoins!'),
            backgroundColor: AppColors.green,
          ),
        );
        _loadWallet();
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('ApiException: ', '')),
            backgroundColor: AppColors.danger,
          ),
        );
      } finally {
        if (mounted) setState(() => _isSpinning = false);
      }
    });
  }

  @override
  void dispose() {
    _spinController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('CineCoins Rewards'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.cloud_off_rounded, size: 48, color: AppColors.textMuted),
                        const SizedBox(height: 12),
                        Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondary)),
                        const SizedBox(height: 16),
                        ElevatedButton(onPressed: _loadWallet, child: const Text('Retry')),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadWallet,
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Gold Balance Card
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFFFFD966), Color(0xFFF59E0B)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFFF59E0B).withOpacity(0.35),
                                blurRadius: 18,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text(
                                    'VAULT BALANCE',
                                    style: TextStyle(
                                      color: Color(0xFF78350F),
                                      fontWeight: FontWeight.w800,
                                      fontSize: 12,
                                      letterSpacing: 1,
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.3),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Row(
                                      children: [
                                        Icon(Icons.shield_rounded, size: 14, color: Color(0xFF78350F)),
                                        SizedBox(width: 4),
                                        Text('100% Verified', style: TextStyle(color: Color(0xFF78350F), fontSize: 11, fontWeight: FontWeight.w700)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 14),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  const Icon(Icons.stars_rounded, size: 40, color: Color(0xFF78350F)),
                                  const SizedBox(width: 10),
                                  Text(
                                    '${_wallet?.balance ?? 0}',
                                    style: const TextStyle(
                                      fontSize: 36,
                                      fontWeight: FontWeight.w900,
                                      color: Color(0xFF78350F),
                                      letterSpacing: -1,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  const Text('Coins', style: TextStyle(color: Color(0xFF78350F), fontSize: 16, fontWeight: FontWeight.w600)),
                                ],
                              ),
                              const Divider(height: 24, color: Color(0xFFD97706)),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Lifetime Earned: ${_wallet?.lifetimeEarned ?? 0}',
                                    style: const TextStyle(color: Color(0xFF78350F), fontSize: 12, fontWeight: FontWeight.w600),
                                  ),
                                  Text(
                                    'Redeemed: ${_wallet?.totalRedeemed ?? 0}',
                                    style: const TextStyle(color: Color(0xFF78350F), fontSize: 12, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Daily Streak & Claim Card
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.card,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: AppColors.primaryBlue.withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.local_fire_department_rounded, color: AppColors.primaryBlue, size: 24),
                              ),
                              const SizedBox(width: 14),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Daily Check-in', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                                    SizedBox(height: 2),
                                    Text('Claim +25 coins every 24 hours', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                  ],
                                ),
                              ),
                              ElevatedButton(
                                onPressed: (_isClaimingDaily) ? null : _handleDailyClaim,
                                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10)),
                                child: _isClaimingDaily
                                    ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white)))
                                    : const Text('Claim +25'),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Lucky Wheel Section
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: AppColors.card,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Column(
                            children: [
                              const Text('Lucky Spin Wheel', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textMain)),
                              const SizedBox(height: 4),
                              const Text('Spin to win up to 50 CineCoins daily', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                              const SizedBox(height: 20),
                              Transform.rotate(
                                angle: _spinAngle,
                                child: Container(
                                  width: 120,
                                  height: 120,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    gradient: const SweepGradient(
                                      colors: [
                                        AppColors.primaryBlue,
                                        AppColors.purple,
                                        AppColors.cineCoinGold,
                                        AppColors.green,
                                        AppColors.orange,
                                        AppColors.primaryBlue,
                                      ],
                                    ),
                                    border: Border.all(color: Colors.white, width: 3),
                                    boxShadow: [
                                      BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4)),
                                    ],
                                  ),
                                  child: const Center(
                                    child: Icon(Icons.star, size: 36, color: Colors.white),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 20),
                              SizedBox(
                                width: double.infinity,
                                child: OutlinedButton(
                                  onPressed: _isSpinning ? null : _handleSpin,
                                  child: _isSpinning ? const Text('Spinning...') : const Text('Spin the Wheel'),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Ledger / Transactions History
                        const Text('Transaction Ledger', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textMain)),
                        const SizedBox(height: 12),
                        if (_wallet?.recentTransactions.isEmpty ?? true) ...[
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: AppColors.card,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: const Center(
                              child: Text('No coin activity recorded yet.', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                            ),
                          ),
                        ] else ...[
                          Container(
                            decoration: BoxDecoration(
                              color: AppColors.card,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: ListView.separated(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: _wallet!.recentTransactions.length,
                              separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.border),
                              itemBuilder: (context, index) {
                                final tx = _wallet!.recentTransactions[index];
                                final isEarned = tx.amount > 0;

                                return ListTile(
                                  leading: Container(
                                    width: 36,
                                    height: 36,
                                    decoration: BoxDecoration(
                                      color: isEarned ? AppColors.green.withOpacity(0.12) : AppColors.danger.withOpacity(0.12),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      isEarned ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                                      color: isEarned ? AppColors.green : AppColors.danger,
                                      size: 18,
                                    ),
                                  ),
                                  title: Text(tx.description, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                                  subtitle: Text(AppFormatters.formatDateTime(tx.createdAt), style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                                  trailing: Text(
                                    '${isEarned ? "+" : ""}${tx.amount} CC',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 14,
                                      color: isEarned ? AppColors.green : AppColors.danger,
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
    );
  }
}
