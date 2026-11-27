import 'package:flutter/material.dart';
import '../widgets/cinecoins_modal.dart';

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
      children: [
        // Member Card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF222234), Color(0xFF14141E)],
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
                color: const Color(0xFFE5A93C).withValues(alpha: 0.4)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.4),
                blurRadius: 15,
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 50,
                        height: 50,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                              color: const Color(0xFFE5A93C), width: 2),
                          color: const Color(0xFF2B2B3E),
                        ),
                        child: const Center(
                          child: Icon(Icons.person,
                              color: Color(0xFFE5A93C), size: 30),
                        ),
                      ),
                      const SizedBox(width: 14),
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Harsha Vardhan',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            'harsha@cinevenue.vip',
                            style: TextStyle(
                              color: Color(0xFF8E8EA0),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE5A93C).withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFE5A93C)),
                    ),
                    child: const Text(
                      'OBSIDIAN',
                      style: TextStyle(
                        color: Color(0xFFFFDF70),
                        fontWeight: FontWeight.w900,
                        fontSize: 10,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              const Divider(color: Colors.white10),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'CINECOINS BALANCE',
                        style: TextStyle(
                            color: Color(0xFF8E8EA0),
                            fontSize: 9,
                            fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 2),
                      Text(
                        '4,850 Coins',
                        style: TextStyle(
                          color: Color(0xFFFFDF70),
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                  ElevatedButton(
                    onPressed: () => CineCoinsModal.show(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE5A93C),
                      foregroundColor: const Color(0xFF0B0B0F),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                    child: const Text('Manage Coins',
                        style: TextStyle(fontWeight: FontWeight.w800)),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),

        const Text(
          'Account & Preferences',
          style: TextStyle(
              color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),

        _buildSettingTile(Icons.confirmation_number_outlined,
            'My VIP Bookings & Passes', '1 Active Ticket'),
        _buildSettingTile(Icons.local_cafe_outlined,
            'Gourmet Dine-In Pre-orders', 'No pending orders'),
        _buildSettingTile(Icons.credit_card_outlined,
            'Payment Methods & Concierge Pay', 'Obsidian Card linked'),
        _buildSettingTile(Icons.notifications_outlined,
            'Premiere & Festival Alerts', 'Enabled'),
        _buildSettingTile(
            Icons.security_outlined, 'Security & Biometrics', 'FaceID Enabled'),

        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          height: 48,
          child: OutlinedButton.icon(
            onPressed: () {
              Navigator.of(context)
                  .pushNamedAndRemoveUntil('/auth', (route) => false);
            },
            icon: const Icon(Icons.logout, color: Color(0xFFCF6679), size: 18),
            label: const Text(
              'Sign Out from CineVenue',
              style: TextStyle(
                color: Color(0xFFCF6679),
                fontWeight: FontWeight.w600,
                fontSize: 13,
              ),
            ),
            style: OutlinedButton.styleFrom(
              side: BorderSide(
                  color: const Color(0xFFCF6679).withValues(alpha: 0.4)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSettingTile(IconData icon, String title, String subtitle) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF14141E),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFFE5A93C).withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: const Color(0xFFE5A93C), size: 20),
        ),
        title: Text(
          title,
          style: const TextStyle(
              color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(color: Color(0xFF8E8EA0), fontSize: 11),
        ),
        trailing: const Icon(Icons.chevron_right, color: Colors.white38),
      ),
    );
  }
}
