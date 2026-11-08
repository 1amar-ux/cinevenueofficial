import 'dart:async';
import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../models/movie_model.dart';
import '../../../models/seat_model.dart';
import '../../../models/show_model.dart';
import '../seats_service.dart';

class SeatLayoutScreen extends StatefulWidget {
  final MovieModel movie;
  final ShowtimeModel show;
  final Function(List<SeatModel>) onProceedToCheckout;
  final VoidCallback onBack;

  const SeatLayoutScreen({
    super.key,
    required this.movie,
    required this.show,
    required this.onProceedToCheckout,
    required this.onBack,
  });

  @override
  State<SeatLayoutScreen> createState() => _SeatLayoutScreenState();
}

class _SeatLayoutScreenState extends State<SeatLayoutScreen> {
  final SeatsService _seatsService = SeatsService();
  List<SeatModel> _seats = [];
  final Set<String> _selectedSeatIds = {};

  bool _isLoading = true;
  String? _error;
  bool _isLocking = false;

  // 10-minute hold countdown timer
  Timer? _lockTimer;
  int _remainingSeconds = AppConstants.seatHoldDurationSeconds;

  @override
  void initState() {
    super.initState();
    _loadSeatLayout();
  }

  Future<void> _loadSeatLayout() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final seats = await _seatsService.getSeatLayout(widget.show.id);
      setState(() {
        _seats = seats;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('ApiException: ', '');
        _isLoading = false;
      });
    }
  }

  void _startHoldTimer() {
    _lockTimer?.cancel();
    _remainingSeconds = AppConstants.seatHoldDurationSeconds;
    _lockTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        if (mounted) setState(() => _remainingSeconds--);
      } else {
        timer.cancel();
        _handleLockExpired();
      }
    });
  }

  void _handleLockExpired() {
    if (_selectedSeatIds.isNotEmpty) {
      _seatsService.releaseSeats(
        showId: widget.show.id,
        seatIds: _selectedSeatIds.toList(),
      );
      setState(() {
        _selectedSeatIds.clear();
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Seat hold expired (10 minutes). Seats have been released.'),
          backgroundColor: AppColors.danger,
        ),
      );
    }
  }

  void _toggleSeat(SeatModel seat) {
    if (seat.status == SeatStatus.booked || seat.status == SeatStatus.locked) {
      return;
    }

    setState(() {
      if (_selectedSeatIds.contains(seat.id)) {
        _selectedSeatIds.remove(seat.id);
        if (_selectedSeatIds.isEmpty) {
          _lockTimer?.cancel();
        }
      } else {
        if (_selectedSeatIds.length >= 10) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Maximum 10 seats allowed per booking.')),
          );
          return;
        }
        if (_selectedSeatIds.isEmpty) {
          _startHoldTimer();
        }
        _selectedSeatIds.add(seat.id);
      }
    });
  }

  List<SeatModel> get _selectedSeats {
    return _seats.where((s) => _selectedSeatIds.contains(s.id)).toList();
  }

  double get _subtotal {
    return _selectedSeats.fold(0.0, (sum, s) => sum + s.price);
  }

  Future<void> _handleProceed() async {
    if (_selectedSeats.isEmpty) return;

    setState(() => _isLocking = true);
    try {
      // Authoritative seat lock on backend
      await _seatsService.lockSeats(
        showId: widget.show.id,
        seatIds: _selectedSeatIds.toList(),
      );

      if (mounted) {
        widget.onProceedToCheckout(_selectedSeats);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not lock seats: ${e.toString().replaceAll("ApiException: ", "")}'),
          backgroundColor: AppColors.danger,
        ),
      );
    } finally {
      if (mounted) setState(() => _isLocking = false);
    }
  }

  @override
  void dispose() {
    _lockTimer?.cancel();
    if (_selectedSeatIds.isNotEmpty) {
      _seatsService.releaseSeats(
        showId: widget.show.id,
        seatIds: _selectedSeatIds.toList(),
      );
    }
    super.dispose();
  }

  // Group seats by Row
  Map<String, List<SeatModel>> get _groupedRows {
    final Map<String, List<SeatModel>> map = {};
    for (final s in _seats) {
      map.putIfAbsent(s.row, () => []).add(s);
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
              '${widget.show.theatreName} • ${AppFormatters.formatTime(widget.show.startTime)}',
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.normal),
            ),
          ],
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: widget.onBack,
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: AppColors.danger),
                      const SizedBox(height: 12),
                      Text(_error!, style: const TextStyle(color: AppColors.textSecondary)),
                      const SizedBox(height: 16),
                      ElevatedButton(onPressed: _loadSeatLayout, child: const Text('Retry')),
                    ],
                  ),
                )
              : Column(
                  children: [
                    // Hold Timer Ribbon
                    if (_selectedSeatIds.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        color: AppColors.cineCoinGold.withOpacity(0.2),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.timer_outlined, size: 18, color: AppColors.cineCoinDarkGold),
                            const SizedBox(width: 8),
                            Text(
                              'Seats held for: ${_remainingSeconds ~/ 60}:${(_remainingSeconds % 60).toString().padLeft(2, '0')}',
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF78350F),
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    // Screen Arch Indicator
                    const SizedBox(height: 16),
                    Column(
                      children: [
                        Container(
                          width: 220,
                          height: 4,
                          decoration: BoxDecoration(
                            color: AppColors.primaryBlue.withOpacity(0.5),
                            borderRadius: BorderRadius.circular(2),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primaryBlue.withOpacity(0.2),
                                blurRadius: 8,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'SCREEN THIS WAY',
                          style: TextStyle(
                            fontSize: 10,
                            letterSpacing: 1.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Legend
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildLegendItem('Available', AppColors.seatAvailable, false),
                          _buildLegendItem('Selected', AppColors.seatSelected, false),
                          _buildLegendItem('Booked', AppColors.seatBooked, false),
                          _buildLegendItem('VIP', AppColors.seatVip, false),
                        ],
                      ),
                    ),
                    const Divider(height: 24, color: AppColors.border),

                    // Interactive Seat Grid (Pinch-to-zoom & Scroll)
                    Expanded(
                      child: InteractiveViewer(
                        boundaryMargin: const EdgeInsets.all(40),
                        minScale: 0.6,
                        maxScale: 2.5,
                        child: SingleChildScrollView(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          child: Column(
                            children: _groupedRows.entries.map((entry) {
                              final rowName = entry.key;
                              final rowSeats = entry.value;

                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 4),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    // Row Label
                                    SizedBox(
                                      width: 20,
                                      child: Text(
                                        rowName,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 12,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    // Seats in Row
                                    ...rowSeats.map((seat) {
                                      final isSelected = _selectedSeatIds.contains(seat.id);
                                      Color color = AppColors.seatAvailable;
                                      if (isSelected) {
                                        color = AppColors.seatSelected;
                                      } else if (seat.status == SeatStatus.booked || seat.status == SeatStatus.locked) {
                                        color = AppColors.seatBooked;
                                      } else if (seat.status == SeatStatus.vip || seat.category.contains('VIP')) {
                                        color = AppColors.seatVip;
                                      }

                                      return GestureDetector(
                                        onTap: () => _toggleSeat(seat),
                                        child: Container(
                                          width: 24,
                                          height: 24,
                                          margin: const EdgeInsets.symmetric(horizontal: 3),
                                          decoration: BoxDecoration(
                                            color: color,
                                            borderRadius: BorderRadius.circular(6),
                                            border: Border.all(
                                              color: isSelected ? AppColors.primaryBlue : Colors.transparent,
                                              width: 1.5,
                                            ),
                                          ),
                                          child: Center(
                                            child: Text(
                                              '${seat.number}',
                                              style: TextStyle(
                                                fontSize: 9,
                                                fontWeight: FontWeight.w700,
                                                color: isSelected ? Colors.white : AppColors.textMain,
                                              ),
                                            ),
                                          ),
                                        ),
                                      );
                                    }).toList(),
                                    const SizedBox(width: 8),
                                    SizedBox(
                                      width: 20,
                                      child: Text(
                                        rowName,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w700,
                                          fontSize: 12,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                    ),

                    // Bottom Bar
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: const BoxDecoration(
                        color: AppColors.card,
                        border: Border(top: BorderSide(color: AppColors.border)),
                      ),
                      child: SafeArea(
                        top: false,
                        child: Row(
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  _selectedSeats.isNotEmpty
                                      ? '${_selectedSeats.length} Seat${_selectedSeats.length > 1 ? "s" : ""}: ${_selectedSeats.map((s) => s.label).join(", ")}'
                                      : 'Select your seats',
                                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  AppFormatters.formatCurrency(_subtotal),
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.textMain,
                                  ),
                                ),
                              ],
                            ),
                            const Spacer(),
                            ElevatedButton(
                              onPressed: (_selectedSeats.isEmpty || _isLocking) ? null : _handleProceed,
                              child: _isLocking
                                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white)))
                                  : const Text('Continue'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildLegendItem(String label, Color color, bool isBorderOnly) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
      ],
    );
  }
}
