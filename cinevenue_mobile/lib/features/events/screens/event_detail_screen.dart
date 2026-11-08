import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../models/booking_model.dart';
import '../../../models/event_model.dart';
import '../events_service.dart';

class EventDetailScreen extends StatefulWidget {
  final EventModel event;
  final Function(BookingModel) onBookingComplete;
  final VoidCallback onBack;

  const EventDetailScreen({
    super.key,
    required this.event,
    required this.onBookingComplete,
    required this.onBack,
  });

  @override
  State<EventDetailScreen> createState() => _EventDetailScreenState();
}

class _EventDetailScreenState extends State<EventDetailScreen> {
  final EventsService _eventsService = EventsService();
  late EventTicketTier _selectedTier;
  int _quantity = 1;
  bool _isBooking = false;

  @override
  void initState() {
    super.initState();
    _selectedTier = widget.event.tiers.isNotEmpty
        ? widget.event.tiers.first
        : EventTicketTier(
            id: 'default',
            name: 'General Access',
            price: 0,
            totalCapacity: 100,
            availableCapacity: 100,
          );
  }

  double get _totalPrice => _selectedTier.price * _quantity;

  Future<void> _handleBookPass() async {
    setState(() => _isBooking = true);

    try {
      final booking = await _eventsService.bookEventTicket(
        eventId: widget.event.id,
        tierId: _selectedTier.id,
        quantity: _quantity,
        amount: _totalPrice,
      );

      if (mounted) {
        widget.onBookingComplete(booking);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to book pass: ${e.toString().replaceAll("ApiException: ", "")}'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isBooking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 260,
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
              onPressed: widget.onBack,
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  if (widget.event.bannerUrl != null || widget.event.posterUrl != null)
                    CachedNetworkImage(
                      imageUrl: widget.event.bannerUrl ?? widget.event.posterUrl!,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => Container(color: const Color(0xFF1E293B)),
                    )
                  else
                    Container(color: const Color(0xFF1E293B)),
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, Colors.black.withOpacity(0.8)],
                      ),
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
                  // Title & Organizer
                  Text(
                    widget.event.title,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textMain, letterSpacing: -0.5),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Organized by ${widget.event.organizerName}',
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 20),

                  // Event Metadata Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.calendar_today_rounded, color: AppColors.primaryBlue, size: 20),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(AppFormatters.formatDate(widget.event.eventDate), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                                Text(AppFormatters.formatTime(widget.event.eventDate), style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                              ],
                            ),
                          ],
                        ),
                        const Divider(height: 20, color: AppColors.border),
                        Row(
                          children: [
                            const Icon(Icons.location_on_rounded, color: AppColors.primaryBlue, size: 20),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(widget.event.venueName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                                  Text(widget.event.city, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Select Ticket Tier
                  const Text('Select Ticket Tier', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textMain)),
                  const SizedBox(height: 12),
                  ...widget.event.tiers.map((tier) {
                    final isSelected = _selectedTier.id == tier.id;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedTier = tier),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.purple.withOpacity(0.05) : AppColors.card,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: isSelected ? AppColors.purple : AppColors.border, width: isSelected ? 1.5 : 1),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(tier.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                                const SizedBox(height: 2),
                                Text(
                                  '${tier.availableCapacity} passes remaining',
                                  style: TextStyle(fontSize: 11, color: tier.availableCapacity < 20 ? AppColors.danger : AppColors.textSecondary),
                                ),
                              ],
                            ),
                            Text(
                              tier.isFree ? 'FREE PASS' : AppFormatters.formatCurrency(tier.price),
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                                color: tier.isFree ? AppColors.green : AppColors.textMain,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                  const SizedBox(height: 20),

                  // Quantity Selector
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Quantity', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove_circle_outline),
                            onPressed: _quantity > 1 ? () => setState(() => _quantity--) : null,
                          ),
                          Text('$_quantity', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                          IconButton(
                            icon: const Icon(Icons.add_circle_outline),
                            onPressed: _quantity < 5 ? () => setState(() => _quantity++) : null,
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Description
                  if (widget.event.description != null) ...[
                    const Text('About the Event', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textMain)),
                    const SizedBox(height: 8),
                    Text(
                      widget.event.description!,
                      style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.6),
                    ),
                    const SizedBox(height: 36),
                  ],
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
              onPressed: _isBooking ? null : _handleBookPass,
              child: _isBooking
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white)))
                  : Text(_totalPrice <= 0 ? 'Claim Free Pass' : 'Book Passes (${AppFormatters.formatCurrency(_totalPrice)})'),
            ),
          ),
        ),
      ),
    );
  }
}
