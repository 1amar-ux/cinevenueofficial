import 'dart:async';
import 'package:flutter/material.dart';
import '../data/mock_venue_repository.dart';
import '../models/venue_models.dart';
import '../services/api_service.dart';
import '../widgets/bottom_nav_bar.dart';
import '../widgets/cinecoins_modal.dart';
import '../widgets/movie_detail_sheet.dart';
import '../widgets/seat_booking_sheet.dart';
import '../widgets/ticket_pass_dialog.dart';
import 'events_tab.dart';
import 'profile_tab.dart';

/// Primary screen of CineVenue adapted from Stitch UI design.
///
/// Fully decoupled from data sources: accepts any [VenueRepository] implementation
/// ([MockVenueRepository] or [ApiService]). Swapping repositories requires zero UI changes.
class HomeScreen extends StatefulWidget {
  final ApiService? apiService;
  final VenueRepository? repository;

  const HomeScreen({
    super.key,
    this.apiService,
    this.repository,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentTabIndex = 0;
  String _selectedCity = 'Guntur';
  String _searchQuery = '';
  String _selectedFilter = 'all';

  late final VenueRepository _repo;
  List<Movie> _allMovies = [];
  List<EventItem> _allEvents = [];
  List<Theatre> _allTheatres = [];
  bool _isLoading = false;

  int _heroCurrentIndex = 0;
  final PageController _heroPageController = PageController();
  int _eventCurrentIndex = 0;
  final PageController _eventPageController = PageController();

  Timer? _heroTimer;

  @override
  void initState() {
    super.initState();
    // Resolve repository: explicit repository parameter takes precedence,
    // followed by apiService (which implements VenueRepository), defaulting to MockVenueRepository.
    _repo = widget.repository ?? widget.apiService ?? MockVenueRepository();
    _loadVenueData();
    _startHeroAutoScroll();
  }

  @override
  void dispose() {
    _heroTimer?.cancel();
    _heroPageController.dispose();
    _eventPageController.dispose();
    super.dispose();
  }

  void _startHeroAutoScroll() {
    _heroTimer?.cancel();
    _heroTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (!mounted) return;
      final heroList = _heroMovies;
      if (heroList.length <= 1) return;
      final nextIndex = (_heroCurrentIndex + 1) % heroList.length;
      if (_heroPageController.hasClients) {
        _heroPageController.animateToPage(
          nextIndex,
          duration: const Duration(milliseconds: 600),
          curve: Curves.easeInOutCubic,
        );
      }
    });
  }

  Future<void> _loadVenueData() async {
    setState(() => _isLoading = true);
    try {
      final movies = await _repo.getMovies(city: _selectedCity);
      final events = await _repo.getEvents(city: _selectedCity);
      final theatres = await _repo.getTheatres(city: _selectedCity);

      if (mounted) {
        setState(() {
          _allMovies = movies;
          _allEvents = events;
          _allTheatres = theatres;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  List<Movie> get _heroMovies {
    final list = _allMovies.where((m) => m.isPremiere || m.isNowShowing).toList();
    return list.isNotEmpty ? list.take(5).toList() : _allMovies.take(5).toList();
  }

  List<Movie> get _filteredMovies {
    return _allMovies.where((m) {
      final q = _searchQuery.toLowerCase().trim();
      final matchesQuery = q.isEmpty ||
          m.title.toLowerCase().contains(q) ||
          m.director.toLowerCase().contains(q) ||
          m.genres.any((g) => g.toLowerCase().contains(q)) ||
          m.theatreName.toLowerCase().contains(q);

      if (!matchesQuery) return false;

      if (_selectedFilter == 'now-showing') return m.isNowShowing;
      if (_selectedFilter == 'imax') {
        return m.formats.any((f) => f.toLowerCase().contains('imax')) ||
            m.formatBadge.toLowerCase().contains('imax');
      }
      if (_selectedFilter == 'dolby') {
        return m.formats.any((f) => f.toLowerCase().contains('dolby')) ||
            m.formatBadge.toLowerCase().contains('dolby');
      }
      if (_selectedFilter == 'coming-soon') return m.isComingSoon;

      return true;
    }).toList();
  }

  void _showCitySelector() {
    final availableCities = _repo.getAvailableCities();

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        decoration: const BoxDecoration(
          color: Color(0xFF14141E),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          border: Border(top: BorderSide(color: Color(0xFFE5A93C), width: 1.5)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Select Cinema City',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE5A93C).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    'Obsidian Network',
                    style: TextStyle(
                      color: Color(0xFFFFDF70),
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ...availableCities.map((cityName) {
              final isSelected = cityName.toLowerCase() == _selectedCity.toLowerCase();
              return ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(
                  Icons.location_city,
                  color: isSelected ? const Color(0xFFE5A93C) : Colors.white38,
                ),
                title: Text(
                  cityName,
                  style: TextStyle(
                    color: isSelected ? const Color(0xFFE5A93C) : Colors.white,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
                subtitle: Text(
                  cityName == 'Guntur'
                      ? 'Cinemax, Miraj, CineLuxe Platinum'
                      : 'Obsidian IMAX & Dolby Luxe Theatres',
                  style: const TextStyle(color: Color(0xFF8E8EA0), fontSize: 12),
                ),
                trailing: isSelected
                    ? const Icon(Icons.check_circle, color: Color(0xFFE5A93C))
                    : null,
                onTap: () {
                  setState(() => _selectedCity = cityName);
                  Navigator.pop(ctx);
                  _loadVenueData();
                },
              );
            }),
          ],
        ),
      ),
    );
  }

  void _showSampleTicket() {
    final ticket = BookingTicket(
      bookingId: 'CV-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
      movieTitle: _allMovies.isNotEmpty ? _allMovies.first.title : 'Dune: Part Two',
      theaterName: _allMovies.isNotEmpty && _allMovies.first.theatreName.isNotEmpty
          ? _allMovies.first.theatreName
          : 'Cinemax Screen 1, $_selectedCity',
      hallName: 'Auditorium 1 - IMAX Grand Laser',
      format: _allMovies.isNotEmpty ? _allMovies.first.formatBadge : 'IMAX 70MM',
      dateStr: 'TODAY, NOV 23',
      timeStr: '08:30 PM',
      seats: const ['A4', 'A5'],
      totalAmount: 960,
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CINEVENUE-PASS-CV-ACTIVE',
      posterUrl: _allMovies.isNotEmpty ? _allMovies.first.posterUrl : null,
      status: 'CONFIRMED',
    );
    TicketPassDialog.show(context, ticket);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0B0F),
      appBar: _buildTopAppBar(),
      body: IndexedStack(
        index: _currentTabIndex,
        children: [
          _buildHomeFeed(),
          _buildMoviesFeed(),
          const EventsTab(),
          const ProfileTab(),
        ],
      ),
      bottomNavigationBar: CineVenueBottomNav(
        currentIndex: _currentTabIndex,
        onTabSelected: (index) {
          setState(() => _currentTabIndex = index);
        },
        onCineCoinsPressed: () => CineCoinsModal.show(context),
      ),
    );
  }

  // ===========================================================================
  // TOP APP BAR (Stitch header with crest, city selector, CineCoins & tickets)
  // ===========================================================================
  PreferredSizeWidget _buildTopAppBar() {
    return AppBar(
      backgroundColor: const Color(0xFF0D0D14),
      elevation: 0,
      titleSpacing: 10,
      title: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // CineVenue Logo Crest
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFFE5A93C), Color(0xFFB8860B)],
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.movie, color: Color(0xFF0B0B0F), size: 16),
                SizedBox(width: 6),
                Text(
                  'CINEVENUE',
                  style: TextStyle(
                    color: Color(0xFF0B0B0F),
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.2,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),

          // City Selector Pill
          Flexible(
            child: GestureDetector(
              onTap: _showCitySelector,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E1E2C),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: const Color(0xFFE5A93C).withValues(alpha: 0.4),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.location_on, color: Color(0xFFE5A93C), size: 14),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        _selectedCity,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(width: 2),
                    const Icon(Icons.arrow_drop_down, color: Color(0xFFE5A93C), size: 16),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      actions: [
        // CineCoins Balance Pill
        GestureDetector(
          onTap: () => CineCoinsModal.show(context),
          child: Container(
            margin: const EdgeInsets.symmetric(vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFE5A93C).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE5A93C), width: 0.8),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.auto_awesome, color: Color(0xFFFFDF70), size: 14),
                SizedBox(width: 4),
                Text(
                  '4,850',
                  style: TextStyle(
                    color: Color(0xFFFFDF70),
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 4),

        // Your Tickets Shortcut Icon
        IconButton(
          onPressed: _showSampleTicket,
          icon: const Icon(Icons.calendar_today, color: Colors.white70, size: 20),
          tooltip: 'Your Tickets',
        ),
        const SizedBox(width: 4),
      ],
    );
  }

  // ===========================================================================
  // HOME TAB FEED
  // ===========================================================================
  Widget _buildHomeFeed() {
    return RefreshIndicator(
      color: const Color(0xFFE5A93C),
      backgroundColor: const Color(0xFF14141E),
      onRefresh: _loadVenueData,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 40),
        children: [
          // Search Bar
          _buildSearchBar(),
          const SizedBox(height: 18),

          // 1. Now Showing in Theatres Carousel (Stitch H=250px Carousel)
          if (_heroMovies.isNotEmpty) _buildNowShowingCarousel(_heroMovies),
          const SizedBox(height: 22),

          // 2. Current Events Carousel (Stitch H=180px Carousel)
          if (_allEvents.isNotEmpty) _buildCurrentEventsCarousel(_allEvents),
          const SizedBox(height: 24),

          // 3. Obsidian VIP Club Banner (Stitch 2x CineCoins Promo)
          _buildObsidianVipClubBanner(),
          const SizedBox(height: 24),

          // 4. Category Filter Pills
          _buildFilterPills(),
          const SizedBox(height: 22),

          // 5. Obsidian Concierge Services
          _buildServicePrivileges(),
          const SizedBox(height: 26),

          // 6. Section Header: All Movies in Active City
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      width: 4,
                      height: 20,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE5A93C),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Theatres in $_selectedCity',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.3,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              TextButton(
                onPressed: () => setState(() => _currentTabIndex = 1),
                child: const Row(
                  children: [
                    Text(
                      'View All',
                      style: TextStyle(color: Color(0xFFE5A93C), fontSize: 12),
                    ),
                    SizedBox(width: 4),
                    Icon(Icons.arrow_forward_ios, color: Color(0xFFE5A93C), size: 10),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Movie Cards Grid
          _buildMovieGrid(_filteredMovies),
          const SizedBox(height: 32),

          // Red Carpet Events Showcase
          _buildRedCarpetBanner(),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  // ===========================================================================
  // MOVIES FEED (Dedicated Movies Tab)
  // ===========================================================================
  Widget _buildMoviesFeed() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildSearchBar(),
        const SizedBox(height: 16),
        _buildFilterPills(),
        const SizedBox(height: 20),
        _buildMovieGrid(_filteredMovies),
        const SizedBox(height: 60),
      ],
    );
  }

  // ===========================================================================
  // SEARCH BAR
  // ===========================================================================
  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF14141E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: TextField(
        style: const TextStyle(color: Colors.white, fontSize: 13),
        onChanged: (val) => setState(() => _searchQuery = val),
        decoration: InputDecoration(
          hintText: 'Search IMAX 70mm, directors, theatres in $_selectedCity...',
          hintStyle: const TextStyle(color: Color(0xFF6C6C80), fontSize: 12),
          prefixIcon: const Icon(Icons.search, color: Color(0xFFE5A93C), size: 20),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 14),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, color: Colors.white38, size: 18),
                  onPressed: () => setState(() => _searchQuery = ''),
                )
              : null,
        ),
      ),
    );
  }

  // ===========================================================================
  // 1. NOW SHOWING IN THEATRES CAROUSEL (Adapted from Stitch code.html H=260px)
  // ===========================================================================
  Widget _buildNowShowingCarousel(List<Movie> movies) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Now Showing in Theatres',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.3,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFFE5A93C).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE5A93C), width: 0.6),
                ),
                child: Text(
                  '${_allTheatres.isNotEmpty ? _allTheatres.length : movies.length} THEATRES',
                  style: const TextStyle(
                    color: Color(0xFFFFDF70),
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 260,
          child: PageView.builder(
            controller: _heroPageController,
            onPageChanged: (i) => setState(() => _heroCurrentIndex = i),
            itemCount: movies.length,
            itemBuilder: (context, index) {
              final movie = movies[index];
              final durationText = '${movie.durationMinutes ~/ 60}h ${movie.durationMinutes % 60}m';

              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(22),
                  border: Border.all(
                    color: const Color(0xFFE5A93C).withValues(alpha: 0.35),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFE5A93C).withValues(alpha: 0.15),
                      blurRadius: 18,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(21),
                  child: Stack(
                    children: [
                      // Backdrop Image
                      Image.network(
                        movie.backdropUrl.isNotEmpty ? movie.backdropUrl : movie.posterUrl,
                        height: 260,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (ctx, err, stack) => Container(
                          color: const Color(0xFF181824),
                          child: const Icon(Icons.movie, color: Colors.white24, size: 60),
                        ),
                      ),

                      // Obsidian Gradient Overlay
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              const Color(0xFF0B0B0F).withValues(alpha: 0.6),
                              const Color(0xFF0B0B0F).withValues(alpha: 0.96),
                            ],
                          ),
                        ),
                      ),

                      // Top Format Badges
                      Positioned(
                        top: 12,
                        left: 12,
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [Color(0xFFFFDF70), Color(0xFFD4AF37)],
                                ),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                movie.formatBadge.toUpperCase(),
                                style: const TextStyle(
                                  color: Color(0xFF0B0B0F),
                                  fontWeight: FontWeight.w900,
                                  fontSize: 9,
                                  letterSpacing: 0.8,
                                ),
                              ),
                            ),
                            if (movie.badgeText.isNotEmpty) ...[
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0B0B0F).withValues(alpha: 0.8),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: const Color(0xFFE5A93C), width: 0.8),
                                ),
                                child: Text(
                                  movie.badgeText,
                                  style: const TextStyle(
                                    color: Color(0xFFFFDF70),
                                    fontSize: 9,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),

                      // CineCoins Reward Tag (Stitch "+150 CineCoins")
                      Positioned(
                        top: 12,
                        right: 12,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0B0B0F).withValues(alpha: 0.85),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFFE5A93C).withValues(alpha: 0.6)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.toll, color: Color(0xFFFFDF70), size: 12),
                              const SizedBox(width: 4),
                              Text(
                                '+${movie.cineCoinsReward} Coins',
                                style: const TextStyle(
                                  color: Color(0xFFFFDF70),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Content & Actions
                      Positioned(
                        bottom: 12,
                        left: 14,
                        right: 14,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.star, color: Color(0xFFFFDF70), size: 13),
                                const SizedBox(width: 3),
                                Text(
                                  '${movie.rating} Acclaim • $durationText',
                                  style: const TextStyle(
                                    color: Color(0xFFFFDF70),
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              movie.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 17,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            if (movie.theatreName.isNotEmpty) ...[
                              const SizedBox(height: 2),
                              Text(
                                movie.theatreName,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: Color(0xFF8E8EA0),
                                  fontSize: 11,
                                ),
                              ),
                            ],
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                Expanded(
                                  child: ElevatedButton(
                                    onPressed: () => SeatBookingSheet.show(context, movie),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFFE5A93C),
                                      foregroundColor: const Color(0xFF0B0B0F),
                                      padding: const EdgeInsets.symmetric(vertical: 9),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                    ),
                                    child: const Text(
                                      'BOOK SEATS',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w900,
                                        fontSize: 11,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                OutlinedButton(
                                  onPressed: () => MovieDetailSheet.show(context, movie),
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: Colors.white,
                                    side: const BorderSide(color: Colors.white30),
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                  child: const Text('DETAILS', style: TextStyle(fontSize: 11)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 8),

        // Carousel Dots Indicator
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(movies.length, (i) {
            final isActive = i == _heroCurrentIndex;
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: isActive ? 16 : 6,
              height: 5,
              decoration: BoxDecoration(
                color: isActive ? const Color(0xFFE5A93C) : Colors.white24,
                borderRadius: BorderRadius.circular(3),
              ),
            );
          }),
        ),
      ],
    );
  }

  // ===========================================================================
  // 2. CURRENT EVENTS CAROUSEL (Adapted from Stitch code.html H=180px)
  // ===========================================================================
  Widget _buildCurrentEventsCarousel(List<EventItem> events) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Current Events',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.3,
                ),
              ),
              GestureDetector(
                onTap: () => setState(() => _currentTabIndex = 2),
                child: const Text(
                  'Explore All >',
                  style: TextStyle(
                    color: Color(0xFFE5A93C),
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
        SizedBox(
          height: 185,
          child: PageView.builder(
            controller: _eventPageController,
            onPageChanged: (i) => setState(() => _eventCurrentIndex = i),
            itemCount: events.length,
            itemBuilder: (context, index) {
              final ev = events[index];
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 4),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: const Color(0xFFE5A93C).withValues(alpha: 0.3),
                  ),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(19),
                  child: Stack(
                    children: [
                      // Event Banner Image
                      Image.network(
                        ev.bannerUrl,
                        height: 185,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (ctx, err, stack) => Container(
                          color: const Color(0xFF1B1B25),
                          child: const Icon(Icons.event, color: Colors.white24, size: 50),
                        ),
                      ),

                      // Overlay
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.transparent,
                              const Color(0xFF0B0B0F).withValues(alpha: 0.5),
                              const Color(0xFF0B0B0F).withValues(alpha: 0.95),
                            ],
                          ),
                        ),
                      ),

                      // Top Badge
                      Positioned(
                        top: 10,
                        left: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0B0B0F).withValues(alpha: 0.85),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFE5A93C), width: 0.7),
                          ),
                          child: Text(
                            ev.badge,
                            style: const TextStyle(
                              color: Color(0xFFFFDF70),
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),

                      // Event Info & Book Action
                      Positioned(
                        bottom: 12,
                        left: 12,
                        right: 12,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    ev.title,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${ev.dateStr} • ${ev.venue}',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      color: Color(0xFF8E8EA0),
                                      fontSize: 10,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'From ₹${ev.price}',
                                    style: const TextStyle(
                                      color: Color(0xFFFFDF70),
                                      fontSize: 12,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            ElevatedButton(
                              onPressed: () {
                                final ticket = BookingTicket(
                                  bookingId: 'EV-${ev.id.toUpperCase()}',
                                  movieTitle: ev.title,
                                  theaterName: ev.venue,
                                  hallName: 'Grand Ballroom & 70mm Dome',
                                  format: 'GALA EVENT',
                                  dateStr: ev.dateStr,
                                  timeStr: ev.timeStr,
                                  seats: const ['VIP-BOX 1'],
                                  totalAmount: ev.price,
                                  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CINEVENUE-EVENT-${ev.id}',
                                  posterUrl: ev.bannerUrl,
                                  status: 'CONFIRMED',
                                );
                                TicketPassDialog.show(context, ticket);
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFE5A93C),
                                foregroundColor: const Color(0xFF0B0B0F),
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              child: const Text(
                                'BOOK',
                                style: TextStyle(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 8),

        // Event Carousel Dots
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(events.length, (i) {
            final isActive = i == _eventCurrentIndex;
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: isActive ? 16 : 6,
              height: 5,
              decoration: BoxDecoration(
                color: isActive ? const Color(0xFFE5A93C) : Colors.white24,
                borderRadius: BorderRadius.circular(3),
              ),
            );
          }),
        ),
      ],
    );
  }

  // ===========================================================================
  // 3. OBSIDIAN VIP CLUB BANNER (Adapted from Stitch 2x CineCoins Promo)
  // ===========================================================================
  Widget _buildObsidianVipClubBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1E1E2C), Color(0xFF12121A)],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFFE5A93C).withValues(alpha: 0.4),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFE5A93C).withValues(alpha: 0.1),
            blurRadius: 15,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFFE5A93C).withValues(alpha: 0.18),
            ),
            child: const Icon(Icons.stars_rounded, color: Color(0xFFFFDF70), size: 28),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text(
                      'OBSIDIAN VIP CLUB',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFFFDF70), Color(0xFFD4AF37)],
                        ),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        '2X COINS',
                        style: TextStyle(
                          color: Color(0xFF0B0B0F),
                          fontSize: 8,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                const Text(
                  'Earn 2x CineCoins today! Members enjoy zero convenience fees & free gourmet upgrades.',
                  style: TextStyle(
                    color: Color(0xFF8E8EA0),
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: () => CineCoinsModal.show(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE5A93C),
              foregroundColor: const Color(0xFF0B0B0F),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            ),
            child: const Text(
              'PERKS',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 10),
            ),
          ),
        ],
      ),
    );
  }

  // ===========================================================================
  // 4. FILTER PILLS
  // ===========================================================================
  Widget _buildFilterPills() {
    final filters = [
      {'id': 'all', 'label': 'All Experiences'},
      {'id': 'now-showing', 'label': 'Now Showing'},
      {'id': 'imax', 'label': 'IMAX 70mm'},
      {'id': 'dolby', 'label': 'Dolby Atmos'},
      {'id': 'coming-soon', 'label': 'Coming Soon'},
    ];

    return SizedBox(
      height: 34,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: filters.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final f = filters[index];
          final isSelected = _selectedFilter == f['id'];

          return GestureDetector(
            onTap: () => setState(() => _selectedFilter = f['id']!),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFFE5A93C) : const Color(0xFF14141E),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected ? const Color(0xFFE5A93C) : Colors.white12,
                ),
              ),
              child: Text(
                f['label']!,
                style: TextStyle(
                  color: isSelected ? const Color(0xFF0B0B0F) : Colors.white70,
                  fontSize: 11,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  // ===========================================================================
  // 5. OBSIDIAN CONCIERGE SERVICES
  // ===========================================================================
  Widget _buildServicePrivileges() {
    final services = [
      {
        'title': 'IMAX Laser',
        'subtitle': 'Dual 4K crystal laser in $_selectedCity',
        'icon': Icons.hd_outlined,
      },
      {
        'title': 'VIP Lounge',
        'subtitle': 'Complimentary caviar & barista',
        'icon': Icons.local_bar_outlined,
      },
      {
        'title': 'Gourmet Dine-In',
        'subtitle': 'Silent seat butler service',
        'icon': Icons.room_service_outlined,
      },
      {
        'title': 'Red Carpet',
        'subtitle': 'Director premieres & gala passes',
        'icon': Icons.stars_outlined,
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Obsidian Concierge Services',
          style: TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 2.2,
          ),
          itemCount: services.length,
          itemBuilder: (context, i) {
            final s = services[i];
            return Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF14141E),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE5A93C).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(s['icon'] as IconData,
                        color: const Color(0xFFE5A93C), size: 18),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          s['title'] as String,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          s['subtitle'] as String,
                          style: const TextStyle(
                            color: Color(0xFF8E8EA0),
                            fontSize: 9,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  // ===========================================================================
  // 6. MOVIE GRID
  // ===========================================================================
  Widget _buildMovieGrid(List<Movie> movies) {
    if (_isLoading) {
      return Container(
        height: 120,
        alignment: Alignment.center,
        child: const CircularProgressIndicator(color: Color(0xFFE5A93C)),
      );
    }

    if (movies.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(40),
        alignment: Alignment.center,
        child: Text(
          'No movies found matching your selection in $_selectedCity.',
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.white54, fontSize: 13),
        ),
      );
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: movies.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 16,
        childAspectRatio: 0.58,
      ),
      itemBuilder: (context, index) {
        final movie = movies[index];
        return GestureDetector(
          onTap: () => MovieDetailSheet.show(context, movie),
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFF14141E),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.4),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Poster
                Expanded(
                  child: ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
                    child: Stack(
                      children: [
                        Image.network(
                          movie.posterUrl,
                          width: double.infinity,
                          height: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (ctx, err, stack) => Container(
                            color: const Color(0xFF1E1E2C),
                            child: const Icon(Icons.movie, color: Colors.white24, size: 40),
                          ),
                        ),
                        // Age rating badge
                        Positioned(
                          top: 8,
                          right: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.black87,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: Colors.white24, width: 0.5),
                            ),
                            child: Text(
                              movie.certification,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                        // Rating star badge
                        Positioned(
                          bottom: 8,
                          left: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0B0B0F).withValues(alpha: 0.85),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.star, color: Color(0xFFFFDF70), size: 12),
                                const SizedBox(width: 3),
                                Text(
                                  movie.rating.toStringAsFixed(1),
                                  style: const TextStyle(
                                    color: Color(0xFFFFDF70),
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
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
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        movie.theatreName.isNotEmpty ? movie.theatreName : movie.genres.join(' • '),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Color(0xFF8E8EA0),
                          fontSize: 10,
                        ),
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () => SeatBookingSheet.show(context, movie),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFE5A93C),
                            foregroundColor: const Color(0xFF0B0B0F),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: const Text(
                            'Book Tickets',
                            style: TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // ===========================================================================
  // RED CARPET SHOWCASE BANNER
  // ===========================================================================
  Widget _buildRedCarpetBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1E1E2C), Color(0xFF12121A)],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFFE5A93C).withValues(alpha: 0.35),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFFE5A93C).withValues(alpha: 0.15),
            ),
            child: const Icon(Icons.stars, color: Color(0xFFFFDF70), size: 28),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Exclusive Red Carpet Passes',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Experience Christopher Nolan & Dune 70mm special screenings with gourmet dinners.',
                  style: TextStyle(
                    color: Color(0xFF8E8EA0),
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () => setState(() => _currentTabIndex = 2),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFE5A93C),
              foregroundColor: const Color(0xFF0B0B0F),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            child: const Text(
              'VIEW',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 11),
            ),
          ),
        ],
      ),
    );
  }
}
