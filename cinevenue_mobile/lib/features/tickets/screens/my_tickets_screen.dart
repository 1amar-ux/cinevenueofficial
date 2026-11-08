import 'package:flutter/material.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../models/booking_model.dart';

class MyTicketsScreen extends StatefulWidget {
  final Function(BookingModel) onSelectBooking;

  const MyTicketsScreen({super.key, required this.onSelectBooking});

  @override
  State<MyTicketsScreen> createState() => _MyTicketsScreenState();
}

class _MyTicketsScreenState extends State<MyTicketsScreen> {
  final ApiClient _apiClient = ApiClient();
  List<BookingModel> _bookings = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await _apiClient.get(ApiEndpoints.myBookings);
      final data = response.data;
      List<dynamic> list = [];
      if (data['data'] is Map && data['data']['bookings'] is List) {
        list = data['data']['bookings'];
      } else if (data['bookings'] is List) {
        list = data['bookings'];
      } else if (data['data'] is List) {
        list = data['data'];
      } else if (data is List) {
        list = data;
      }

      setState(() {
        _bookings = list.map((b) => BookingModel.fromJson(b)).toList();
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
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Bookings & Passes'),
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
                        ElevatedButton(onPressed: _loadBookings, child: const Text('Retry')),
                      ],
                    ),
                  ),
                )
              : _bookings.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: AppColors.primaryBlue.withOpacity(0.08),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.confirmation_number_outlined, size: 48, color: AppColors.primaryBlue),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'No Bookings Yet',
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textMain),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Reserve tickets for trending movies or upcoming live events.',
                            style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadBookings,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _bookings.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 14),
                        itemBuilder: (context, index) {
                          final booking = _bookings[index];
                          final isConfirmed = booking.bookingStatus == 'CONFIRMED';

                          return GestureDetector(
                            onTap: () => widget.onSelectBooking(booking),
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppColors.card,
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: AppColors.border),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.03),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        booking.bookingNumber,
                                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textMuted),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                        decoration: BoxDecoration(
                                          color: isConfirmed ? AppColors.green.withOpacity(0.12) : AppColors.danger.withOpacity(0.12),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          booking.bookingStatus,
                                          style: TextStyle(
                                            color: isConfirmed ? AppColors.green : AppColors.danger,
                                            fontWeight: FontWeight.w700,
                                            fontSize: 11,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    booking.movieTitle,
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textMain),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${booking.theatreName} • ${booking.screenName}',
                                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${AppFormatters.formatDateTime(booking.showTime)} • Seats: ${booking.seatLabels.join(", ")}',
                                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                  ),
                                  const Divider(height: 20, color: AppColors.border),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        AppFormatters.formatCurrency(booking.totalAmount),
                                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primaryBlue),
                                      ),
                                      const Row(
                                        children: [
                                          Text('View Ticket & QR', style: TextStyle(color: AppColors.primaryBlue, fontWeight: FontWeight.w600, fontSize: 13)),
                                          SizedBox(width: 4),
                                          Icon(Icons.arrow_forward_ios, size: 12, color: AppColors.primaryBlue),
                                        ],
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
