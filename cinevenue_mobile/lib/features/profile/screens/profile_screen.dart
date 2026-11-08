import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../../models/user_model.dart';
import '../../auth/auth_service.dart';

class ProfileScreen extends StatelessWidget {
  final UserModel? user;
  final VoidCallback onEditProfile;
  final VoidCallback onViewTickets;
  final VoidCallback onViewCineCoins;
  final VoidCallback onOpenScanner;
  final VoidCallback onLogout;
  final VoidCallback onSignIn;

  const ProfileScreen({
    super.key,
    required this.user,
    required this.onEditProfile,
    required this.onViewTickets,
    required this.onViewCineCoins,
    required this.onOpenScanner,
    required this.onLogout,
    required this.onSignIn,
  });

  bool get _isStaffOrAdmin => user != null && (user!.role == 'ADMIN' || user!.role == 'ORGANIZER' || user!.role == 'THEATRE_MANAGER');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // User Header Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4)),
                ],
              ),
              child: user == null
                  ? Column(
                      children: [
                        const Icon(Icons.account_circle, size: 64, color: AppColors.textMuted),
                        const SizedBox(height: 12),
                        const Text('Guest Browsing', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textMain)),
                        const SizedBox(height: 4),
                        const Text('Sign in to manage your tickets and CineCoins vault.', textAlign: TextAlign.center, style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                        const SizedBox(height: 16),
                        ElevatedButton(onPressed: onSignIn, child: const Text('Sign In / Register')),
                      ],
                    )
                  : Row(
                      children: [
                        CircleAvatar(
                          radius: 32,
                          backgroundColor: AppColors.primaryBlue.withOpacity(0.12),
                          child: Text(
                            user!.name.isNotEmpty ? user!.name[0].toUpperCase() : 'U',
                            style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: AppColors.primaryBlue),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(user!.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textMain)),
                              const SizedBox(height: 2),
                              Text(user!.email, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                              if (user!.mobile != null) ...[
                                const SizedBox(height: 2),
                                Text(user!.mobile!, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                              ],
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryBlue.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  user!.role,
                                  style: const TextStyle(color: AppColors.primaryBlue, fontSize: 10, fontWeight: FontWeight.w700),
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.edit_outlined, color: AppColors.primaryBlue),
                          onPressed: onEditProfile,
                        ),
                      ],
                    ),
            ),
            const SizedBox(height: 24),

            // Navigation Options
            Container(
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  _buildListTile(Icons.confirmation_number_outlined, 'My Bookings & Passes', onViewTickets),
                  _buildDivider(),
                  _buildListTile(Icons.stars_outlined, 'CineCoins Rewards', onViewCineCoins),
                  if (_isStaffOrAdmin) ...[
                    _buildDivider(),
                    _buildListTile(Icons.qr_code_scanner_rounded, 'Staff Gate QR Scanner', onOpenScanner, isHighlight: true),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),

            // App Settings & Policies
            Container(
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: [
                  _buildListTile(Icons.notifications_none_rounded, 'Push Notifications', () {}),
                  _buildDivider(),
                  _buildListTile(Icons.security_rounded, 'Privacy Policy & Terms', () {}),
                  _buildDivider(),
                  _buildListTile(Icons.help_outline_rounded, 'Help & Customer Support', () {}),
                  _buildDivider(),
                  ListTile(
                    leading: const Icon(Icons.info_outline, color: AppColors.textSecondary),
                    title: const Text('App Version', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                    trailing: Text(
                      'v${AppConstants.appVersion} (${AppConstants.buildNumber})',
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Logout Button
            if (user != null) ...[
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: onLogout,
                  icon: const Icon(Icons.logout, color: AppColors.danger, size: 18),
                  label: const Text('Sign Out', style: TextStyle(color: AppColors.danger)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.danger),
                  ),
                ),
              ),
              const SizedBox(height: 30),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildListTile(IconData icon, String title, VoidCallback onTap, {bool isHighlight = false}) {
    return ListTile(
      leading: Icon(icon, color: isHighlight ? AppColors.purple : AppColors.primaryBlue),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: isHighlight ? FontWeight.w700 : FontWeight.w600,
          color: isHighlight ? AppColors.purple : AppColors.textMain,
        ),
      ),
      trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textSecondary),
      onTap: onTap,
    );
  }

  Widget _buildDivider() {
    return const Divider(height: 1, color: AppColors.border);
  }
}
