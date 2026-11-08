import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../models/movie_model.dart';
import '../../../models/show_model.dart';
import '../shows_service.dart';

class ShowtimeSelectionScreen extends StatefulWidget {
  final MovieModel movie;
  final Function(ShowtimeModel) onShowtimeSelected;
  final VoidCallback onBack;

  const ShowtimeSelectionScreen({
    super.key,
    required this.movie,
    required this.onShowtimeSelected,
    required this.onBack,
  });

  @override
  State<ShowtimeSelectionScreen> createState() => _ShowtimeSelectionScreenState();
}

class _ShowtimeSelectionScreenState extends State<ShowtimeSelectionScreen> {
  final ShowsService _showsService = ShowsService();
  String _selectedCity = 'Hyderabad';
  DateTime _selectedDate = DateTime.now();

  List<ShowtimeModel> _shows = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadShows();
  }

  Future<void> _loadShows() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final shows = await _showsService.getShowsForMovie(
        movieId: widget.movie.id,
        city: _selectedCity,
        date: _selectedDate,
      );
      setState(() {
        _shows = shows;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('ApiException: ', '');
        _isLoading = false;
      });
    }
  }

  // Group shows by Theatre
  Map<String, List<ShowtimeModel>> get _groupedShows {
    final Map<String, List<ShowtimeModel>> map = {};
    for (final show in _shows) {
      map.putIfAbsent(show.theatreName, () => []).add(show);
    }
    return map;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.movie.title, maxLines: 1, overflow: TextOverflow.ellipsis),
            Text(
              '${widget.movie.language ?? "Telugu"} • ${widget.movie.certificate ?? "U/A"}',
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.normal),
            ),
          ],
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: widget.onBack,
        ),
        actions: [
          // City Selector Chip
          PopupMenuButton<String>(
            initialValue: _selectedCity,
            onSelected: (city) {
              setState(() => _selectedCity = city);
              _loadShows();
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  const Icon(Icons.location_on_outlined, color: AppColors.primaryBlue, size: 18),
                  const SizedBox(width: 4),
                  Text(_selectedCity, style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textMain, fontSize: 13)),
                  const Icon(Icons.keyboard_arrow_down, size: 18, color: AppColors.textSecondary),
                ],
              ),
            ),
            itemBuilder: (context) => AppConstants.supportedCities.map((city) {
              return PopupMenuItem(value: city, child: Text(city));
            }).toList(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Date Selector Strip
          Container(
            height: 80,
            color: AppColors.card,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: 7,
              itemBuilder: (context, index) {
                final date = DateTime.now().add(Duration(days: index));
                final isSelected = date.day == _selectedDate.day && date.month == _selectedDate.month;
                final isToday = index == 0;

                return GestureDetector(
                  onTap: () {
                    setState(() => _selectedDate = date);
                    _loadShows();
                  },
                  child: Container(
                    width: 58,
                    margin: const EdgeInsets.only(right: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primaryBlue : AppColors.background,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: isSelected ? AppColors.primaryBlue : AppColors.border),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          isToday ? 'TODAY' : AppFormatters.formatDate(date).split(',')[0].toUpperCase(),
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: isSelected ? Colors.white70 : AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${date.day}',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: isSelected ? Colors.white : AppColors.textMain,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const Divider(height: 1, color: AppColors.border),

          // Shows List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.sentiment_dissatisfied_outlined, size: 48, color: AppColors.textMuted),
                              const SizedBox(height: 12),
                              Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondary)),
                              const SizedBox(height: 16),
                              ElevatedButton(onPressed: _loadShows, child: const Text('Retry')),
                            ],
                          ),
                        ),
                      )
                    : _shows.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.event_busy, size: 48, color: AppColors.textMuted),
                                const SizedBox(height: 12),
                                Text(
                                  'No showtimes available in $_selectedCity for this date.',
                                  style: const TextStyle(color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.all(16),
                            itemCount: _groupedShows.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 16),
                            itemBuilder: (context, index) {
                              final theatreName = _groupedShows.keys.elementAt(index);
                              final theatreShows = _groupedShows[theatreName]!;

                              return Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: AppColors.card,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(Icons.theaters, size: 20, color: AppColors.primaryBlue),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            theatreName,
                                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textMain),
                                          ),
                                        ),
                                        const Text('M-Ticket', style: TextStyle(color: AppColors.green, fontSize: 11, fontWeight: FontWeight.w600)),
                                      ],
                                    ),
                                    const SizedBox(height: 14),
                                    Wrap(
                                      spacing: 10,
                                      runSpacing: 10,
                                      children: theatreShows.map((show) {
                                        return InkWell(
                                          onTap: () => widget.onShowtimeSelected(show),
                                          borderRadius: BorderRadius.circular(10),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                            decoration: BoxDecoration(
                                              borderRadius: BorderRadius.circular(10),
                                              border: Border.all(color: AppColors.green, width: 1.2),
                                              color: AppColors.green.withOpacity(0.06),
                                            ),
                                            child: Column(
                                              children: [
                                                Text(
                                                  AppFormatters.formatTime(show.startTime),
                                                  style: const TextStyle(
                                                    color: AppColors.green,
                                                    fontWeight: FontWeight.w700,
                                                    fontSize: 13,
                                                  ),
                                                ),
                                                const SizedBox(height: 2),
                                                Text(
                                                  '${show.format} • ${show.screenName}',
                                                  style: const TextStyle(
                                                    color: AppColors.textSecondary,
                                                    fontSize: 10,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        );
                                      }).toList(),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }
}
