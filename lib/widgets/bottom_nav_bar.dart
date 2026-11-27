import 'package:flutter/material.dart';

class CineVenueBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTabSelected;
  final VoidCallback onCineCoinsPressed;

  const CineVenueBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTabSelected,
    required this.onCineCoinsPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0D0D14),
        border: Border(
          top: BorderSide(
            color: Colors.white.withValues(alpha: 0.08),
            width: 1,
          ),
        ),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                index: 0,
                icon: Icons.home_filled,
                label: 'Home',
              ),
              _buildNavItem(
                index: 1,
                icon: Icons.movie_outlined,
                label: 'Movies',
              ),

              // Center Floating CineCoins Gold Crest
              GestureDetector(
                onTap: onCineCoinsPressed,
                child: Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Color(0xFFFFDF70),
                        Color(0xFFD4AF37),
                        Color(0xFF996515)
                      ],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFE5A93C).withValues(alpha: 0.45),
                        blurRadius: 16,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.auto_awesome,
                      color: Color(0xFF0B0B0F),
                      size: 26,
                    ),
                  ),
                ),
              ),

              _buildNavItem(
                index: 2,
                icon: Icons.confirmation_num_outlined,
                label: 'Events',
              ),
              _buildNavItem(
                index: 3,
                icon: Icons.person_outline,
                label: 'Profile',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required IconData icon,
    required String label,
  }) {
    final isSelected = currentIndex == index;
    final color =
        isSelected ? const Color(0xFFE5A93C) : const Color(0xFF717182);

    return InkWell(
      onTap: () => onTabSelected(index),
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                color: color,
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                letterSpacing: 0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
