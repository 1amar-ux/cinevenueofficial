import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../models/event_model.dart';
import '../events_service.dart';

class EventsListScreen extends StatefulWidget {
  final Function(EventModel) onEventSelected;

  const EventsListScreen({super.key, required this.onEventSelected});

  @override
  State<EventsListScreen> createState() => _EventsListScreenState();
}

class _EventsListScreenState extends State<EventsListScreen> {
  final EventsService _eventsService = EventsService();
  List<EventModel> _events = [];
  bool _isLoading = true;
  String? _error;
  String _selectedCategory = 'All';

  final List<String> _categories = ['All', 'Concert', 'Celebrity', 'Comedy', 'Workshop', 'Audio Launch'];

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final events = await _eventsService.getEvents(page: 1, limit: 30);
      setState(() {
        _events = events;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('ApiException: ', '');
        _isLoading = false;
      });
    }
  }

  List<EventModel> get _filteredEvents {
    if (_selectedCategory == 'All') return _events;
    return _events.where((e) => e.category.toLowerCase().contains(_selectedCategory.toLowerCase())).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Live Events & Passes'),
      ),
      body: Column(
        children: [
          // Category Filter Chips
          Container(
            height: 52,
            color: AppColors.card,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final category = _categories[index];
                final isSelected = _selectedCategory == category;

                return GestureDetector(
                  onTap: () => setState(() => _selectedCategory = category),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.purple : AppColors.background,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: isSelected ? AppColors.purple : AppColors.border),
                    ),
                    child: Text(
                      category,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: isSelected ? Colors.white : AppColors.textMain,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          const Divider(height: 1, color: AppColors.border),

          // Events Feed
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
                              const Icon(Icons.cloud_off_rounded, size: 48, color: AppColors.textMuted),
                              const SizedBox(height: 12),
                              Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.textSecondary)),
                              const SizedBox(height: 16),
                              ElevatedButton(onPressed: _loadEvents, child: const Text('Retry')),
                            ],
                          ),
                        ),
                      )
                    : _filteredEvents.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.festival_outlined, size: 48, color: AppColors.textMuted),
                                const SizedBox(height: 12),
                                Text(
                                  'No events found in "$_selectedCategory"',
                                  style: const TextStyle(color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: _loadEvents,
                            child: ListView.separated(
                              padding: const EdgeInsets.all(16),
                              itemCount: _filteredEvents.length,
                              separatorBuilder: (_, __) => const SizedBox(height: 16),
                              itemBuilder: (context, index) {
                                final event = _filteredEvents[index];

                                return GestureDetector(
                                  onTap: () => widget.onEventSelected(event),
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: AppColors.card,
                                      borderRadius: BorderRadius.circular(16),
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
                                      borderRadius: BorderRadius.circular(16),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          // Event Banner
                                          SizedBox(
                                            height: 160,
                                            width: double.infinity,
                                            child: Stack(
                                              fit: StackFit.expand,
                                              children: [
                                                if (event.bannerUrl != null || event.posterUrl != null)
                                                  CachedNetworkImage(
                                                    imageUrl: event.bannerUrl ?? event.posterUrl!,
                                                    fit: BoxFit.cover,
                                                    errorWidget: (_, __, ___) => Container(color: const Color(0xFFE2E8F0)),
                                                  )
                                                else
                                                  Container(color: const Color(0xFFE2E8F0)),
                                                // Category Tag
                                                Positioned(
                                                  top: 12,
                                                  left: 12,
                                                  child: Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                                    decoration: BoxDecoration(
                                                      color: Colors.black.withOpacity(0.7),
                                                      borderRadius: BorderRadius.circular(6),
                                                    ),
                                                    child: Text(
                                                      event.category.toUpperCase(),
                                                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
                                                    ),
                                                  ),
                                                ),
                                                // Free Pass Tag if available
                                                if (event.isFreePassAvailable)
                                                  Positioned(
                                                    top: 12,
                                                    right: 12,
                                                    child: Container(
                                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                                      decoration: BoxDecoration(
                                                        color: AppColors.green,
                                                        borderRadius: BorderRadius.circular(6),
                                                      ),
                                                      child: const Text(
                                                        'FREE PASS',
                                                        style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
                                                      ),
                                                    ),
                                                  ),
                                              ],
                                            ),
                                          ),
                                          // Event Details
                                          Padding(
                                            padding: const EdgeInsets.all(16),
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  event.title,
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                  style: const TextStyle(
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.w800,
                                                    color: AppColors.textMain,
                                                  ),
                                                ),
                                                const SizedBox(height: 6),
                                                Row(
                                                  children: [
                                                    const Icon(Icons.calendar_today_outlined, size: 14, color: AppColors.primaryBlue),
                                                    const SizedBox(width: 6),
                                                    Text(
                                                      AppFormatters.formatDate(event.eventDate),
                                                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                                    ),
                                                    const SizedBox(width: 12),
                                                    const Icon(Icons.location_on_outlined, size: 14, color: AppColors.primaryBlue),
                                                    const SizedBox(width: 4),
                                                    Expanded(
                                                      child: Text(
                                                        '${event.venueName}, ${event.city}',
                                                        maxLines: 1,
                                                        overflow: TextOverflow.ellipsis,
                                                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                const Divider(height: 20, color: AppColors.border),
                                                Row(
                                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                  children: [
                                                    Column(
                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                      children: [
                                                        const Text('Starting from', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                                                        Text(
                                                          event.startingPrice <= 0 ? 'FREE ENTRY' : AppFormatters.formatCurrency(event.startingPrice),
                                                          style: TextStyle(
                                                            fontSize: 14,
                                                            fontWeight: FontWeight.w800,
                                                            color: event.startingPrice <= 0 ? AppColors.green : AppColors.textMain,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                    const Row(
                                                      children: [
                                                        Text('Get Tickets', style: TextStyle(color: AppColors.primaryBlue, fontWeight: FontWeight.w700, fontSize: 13)),
                                                        SizedBox(width: 4),
                                                        Icon(Icons.arrow_forward_rounded, size: 14, color: AppColors.primaryBlue),
                                                      ],
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
                                );
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}
