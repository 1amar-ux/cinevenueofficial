import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_theme.dart';
import '../../../models/movie_model.dart';
import '../movies_service.dart';

class MoviesListScreen extends StatefulWidget {
  final Function(MovieModel) onMovieSelected;

  const MoviesListScreen({super.key, required this.onMovieSelected});

  @override
  State<MoviesListScreen> createState() => _MoviesListScreenState();
}

class _MoviesListScreenState extends State<MoviesListScreen> with SingleTickerProviderStateMixin {
  final MoviesService _moviesService = MoviesService();
  late TabController _tabController;

  List<MovieModel> _allMovies = [];
  bool _isLoading = true;
  String? _error;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadMovies();
  }

  Future<void> _loadMovies() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final movies = await _moviesService.getMovies(page: 1, limit: 30);
      setState(() {
        _allMovies = movies;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('ApiException: ', '');
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<MovieModel> get _nowShowing {
    return _allMovies.where((m) {
      final matchesSearch = _searchQuery.isEmpty || m.title.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesSearch && m.isNowShowing;
    }).toList();
  }

  List<MovieModel> get _upcoming {
    return _allMovies.where((m) {
      final matchesSearch = _searchQuery.isEmpty || m.title.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesSearch && m.isUpcoming;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Movies'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(104),
          child: Column(
            children: [
              // Search Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                child: SizedBox(
                  height: 44,
                  child: TextField(
                    onChanged: (val) => setState(() => _searchQuery = val),
                    decoration: InputDecoration(
                      hintText: 'Search movies, languages...',
                      prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textSecondary),
                      contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 18),
                              onPressed: () => setState(() => _searchQuery = ''),
                            )
                          : null,
                    ),
                  ),
                ),
              ),
              TabBar(
                controller: _tabController,
                labelColor: AppColors.primaryBlue,
                unselectedLabelColor: AppColors.textSecondary,
                indicatorColor: AppColors.primaryBlue,
                indicatorWeight: 3,
                tabs: const [
                  Tab(text: 'Now Showing'),
                  Tab(text: 'Upcoming'),
                ],
              ),
            ],
          ),
        ),
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
                        const SizedBox(height: 16),
                        Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondary)),
                        const SizedBox(height: 16),
                        ElevatedButton(onPressed: _loadMovies, child: const Text('Retry')),
                      ],
                    ),
                  ),
                )
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildMovieGrid(_nowShowing),
                    _buildMovieGrid(_upcoming),
                  ],
                ),
    );
  }

  Widget _buildMovieGrid(List<MovieModel> movies) {
    if (movies.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.movie_outlined, size: 48, color: AppColors.textMuted),
            const SizedBox(height: 12),
            Text(
              _searchQuery.isNotEmpty ? 'No movies match "$_searchQuery"' : 'No movies currently listed',
              style: const TextStyle(color: AppColors.textSecondary),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadMovies,
      child: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.62,
          crossAxisSpacing: 14,
          mainAxisSpacing: 16,
        ),
        itemCount: movies.length,
        itemBuilder: (context, index) {
          final movie = movies[index];
          return GestureDetector(
            onTap: () => widget.onMovieSelected(movie),
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.card,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Poster image
                    Expanded(
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          if (movie.posterUrl != null && movie.posterUrl!.isNotEmpty)
                            CachedNetworkImage(
                              imageUrl: movie.posterUrl!,
                              fit: BoxFit.cover,
                              errorWidget: (_, __, ___) => Container(
                                color: const Color(0xFFEDF2F7),
                                child: const Icon(Icons.image_not_supported_outlined, color: AppColors.textMuted),
                              ),
                            )
                          else
                            Container(
                              color: const Color(0xFFEDF2F7),
                              child: const Icon(Icons.theaters, size: 40, color: AppColors.textMuted),
                            ),
                          // Rating Badge
                          Positioned(
                            top: 8,
                            left: 8,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.75),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.star_rounded, color: AppColors.cineCoinGold, size: 14),
                                  const SizedBox(width: 3),
                                  Text(
                                    movie.rating.toStringAsFixed(1),
                                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Details
                    Padding(
                      padding: const EdgeInsets.all(10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            movie.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textMain,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            '${movie.language ?? "Telugu"} • ${movie.certificate ?? "U/A"}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
