import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../models/movie_model.dart';

class MovieDetailScreen extends StatelessWidget {
  final MovieModel movie;
  final VoidCallback onBookTickets;
  final VoidCallback onBack;

  const MovieDetailScreen({
    super.key,
    required this.movie,
    required this.onBookTickets,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 320,
            pinned: true,
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.5),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
              ),
              onPressed: onBack,
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  if (movie.bannerUrl != null || movie.posterUrl != null)
                    CachedNetworkImage(
                      imageUrl: movie.bannerUrl ?? movie.posterUrl!,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => Container(color: const Color(0xFF1E293B)),
                    )
                  else
                    Container(color: const Color(0xFF1E293B)),
                  // Gradient overlay
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.8),
                        ],
                      ),
                    ),
                  ),
                  // Bottom Info
                  Positioned(
                    left: 20,
                    right: 20,
                    bottom: 20,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          movie.title,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                            letterSpacing: -0.5,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.cineCoinGold,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                '★ ${movie.rating.toStringAsFixed(1)}/10',
                                style: const TextStyle(
                                  color: Color(0xFF78350F),
                                  fontWeight: FontWeight.w800,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              '${movie.language ?? "Telugu"} • ${AppFormatters.formatDuration(movie.durationMinutes)}',
                              style: const TextStyle(color: Colors.white70, fontSize: 13),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Genre Tags
                  if (movie.genres.isNotEmpty) ...[
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: movie.genres.map((g) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: AppColors.card,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: Text(
                            g,
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textMain),
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Synopsis
                  const Text(
                    'About the Movie',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textMain),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    movie.description ?? 'A thrilling cinematic spectacle that takes you on an unforgettable journey. Experience state-of-the-art visuals and surround sound in CineVenue luxury theatres.',
                    style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.6),
                  ),
                  const SizedBox(height: 24),

                  // Movie Metadata Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildMetaItem('Certificate', movie.certificate ?? 'U/A'),
                        _buildDivider(),
                        _buildMetaItem('Format', '2D, 3D, IMAX'),
                        _buildDivider(),
                        _buildMetaItem('Release Date', movie.releaseDate != null ? AppFormatters.formatDate(movie.releaseDate!) : 'Now Playing'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 36),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          decoration: const BoxDecoration(
            color: AppColors.card,
            border: Border(top: BorderSide(color: AppColors.border)),
          ),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: onBookTickets,
              child: const Text('Select Showtime & Book Tickets'),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMetaItem(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontSize: 13, color: AppColors.textMain, fontWeight: FontWeight.w700)),
      ],
    );
  }

  Widget _buildDivider() {
    return Container(height: 28, width: 1, color: AppColors.border);
  }
}
