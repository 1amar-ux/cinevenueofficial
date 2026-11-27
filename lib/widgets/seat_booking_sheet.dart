import 'package:flutter/material.dart';
import '../models/cinema_models.dart';
import 'ticket_pass_dialog.dart';

class SeatBookingSheet extends StatefulWidget {
  final Movie movie;

  const SeatBookingSheet({super.key, required this.movie});

  static void show(BuildContext context, Movie movie) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => SeatBookingSheet(movie: movie),
    );
  }

  @override
  State<SeatBookingSheet> createState() => _SeatBookingSheetState();
}

class _SeatBookingSheetState extends State<SeatBookingSheet> {
  final Set<String> _selectedSeats = {'A4', 'A5'};
  final Set<String> _bookedSeats = {'A1', 'B5', 'C3', 'D7', 'E2'};
  bool _useCineCoins = false;

  int _calculateSeatPrice(String seat) {
    final row = seat[0];
    if (row == 'A' || row == 'B') return 480; // Balcony Recliner
    if (row == 'C' || row == 'D') return 350; // Ultra VIP
    return 220; // Executive Gold
  }

  int get _subtotal {
    return _selectedSeats.fold(
        0, (sum, seat) => sum + _calculateSeatPrice(seat));
  }

  int get _discount {
    if (_useCineCoins && _selectedSeats.isNotEmpty) {
      return 200;
    }
    return 0;
  }

  int get _finalTotal {
    final total = _subtotal - _discount;
    return total > 0 ? total : 0;
  }

  void _toggleSeat(String seat) {
    if (_bookedSeats.contains(seat)) return;
    setState(() {
      if (_selectedSeats.contains(seat)) {
        _selectedSeats.remove(seat);
      } else {
        _selectedSeats.add(seat);
      }
    });
  }

  void _onConfirmBooking() {
    if (_selectedSeats.isEmpty) return;

    final bookingTicket = BookingTicketItem(
      bookingId: 'CV-${10000 + _selectedSeats.length * 37}',
      movieTitle: widget.movie.title,
      theaterName: 'Grand Palais CineVenue',
      hallName: 'Auditorium 1 - IMAX Grand Laser',
      format: widget.movie.formats.isNotEmpty
          ? widget.movie.formats[0]
          : 'IMAX 70mm',
      dateStr: 'TODAY, NOV 9',
      timeStr: '08:30 PM',
      seats: _selectedSeats.toList()..sort(),
      totalAmount: _finalTotal,
      qrCodeUrl:
          'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CINEVENUE-PASS-CV-${widget.movie.id}',
      posterUrl: widget.movie.posterUrl,
      status: 'CONFIRMED',
    );

    Navigator.pop(context);
    TicketPassDialog.show(context, bookingTicket);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: const BoxDecoration(
        color: Color(0xFF0F0F16),
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        border: Border(
          top: BorderSide(color: Color(0xFFE5A93C), width: 1.5),
        ),
      ),
      child: Column(
        children: [
          // Drag handle
          Padding(
            padding: const EdgeInsets.only(top: 12),
            child: Container(
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.movie.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFE5A93C)
                                  .withValues(alpha: 0.18),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              widget.movie.formats.isNotEmpty
                                  ? widget.movie.formats[0]
                                  : 'IMAX',
                              style: const TextStyle(
                                color: Color(0xFFFFDF70),
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'Grand Palais • Today 8:30 PM',
                            style: TextStyle(
                                color: Color(0xFF9E9EAF), fontSize: 11),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, color: Colors.white70),
                ),
              ],
            ),
          ),

          const Divider(color: Colors.white12, height: 1),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                children: [
                  // Curved Screen Graphic
                  Container(
                    margin: const EdgeInsets.symmetric(vertical: 16),
                    child: Column(
                      children: [
                        CustomPaint(
                          size: const Size(280, 24),
                          painter: _CurvedScreenPainter(),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          'THE SCREEN - 70mm IMAX CURVE',
                          style: TextStyle(
                            color: Color(0xFFE5A93C),
                            fontSize: 10,
                            letterSpacing: 2,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Seat Grid
                  _buildTierHeader('ROYAL BALCONY RECLINERS', '₹480',
                      const Color(0xFFFFDF70)),
                  const SizedBox(height: 8),
                  _buildRow('A', 8),
                  const SizedBox(height: 6),
                  _buildRow('B', 8),

                  const SizedBox(height: 16),
                  _buildTierHeader(
                      'ULTRA VIP RECLINERS', '₹350', const Color(0xFFE5A93C)),
                  const SizedBox(height: 8),
                  _buildRow('C', 8),
                  const SizedBox(height: 6),
                  _buildRow('D', 8),

                  const SizedBox(height: 16),
                  _buildTierHeader('EXECUTIVE GOLD SEATING', '₹220',
                      const Color(0xFF9E9EAF)),
                  const SizedBox(height: 8),
                  _buildRow('E', 8),
                  const SizedBox(height: 6),
                  _buildRow('F', 8),

                  const SizedBox(height: 20),

                  // Seat Legend
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildLegend(const Color(0xFF1C1C28), 'Available'),
                      const SizedBox(width: 16),
                      _buildLegend(const Color(0xFFE5A93C), 'Selected'),
                      const SizedBox(width: 16),
                      _buildLegend(const Color(0xFF333344), 'Booked'),
                    ],
                  ),

                  const SizedBox(height: 18),

                  // CineCoins Discount Switch Card
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF161622),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: _useCineCoins
                            ? const Color(0xFFE5A93C)
                            : Colors.white12,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.stars,
                                color: Color(0xFFE5A93C), size: 20),
                            SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Redeem 500 CineCoins',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  'Get ₹200 instant discount on this booking',
                                  style: TextStyle(
                                    color: Color(0xFF10B981),
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Switch(
                          value: _useCineCoins,
                          activeThumbColor: const Color(0xFFE5A93C),
                          onChanged: (val) {
                            setState(() {
                              _useCineCoins = val;
                            });
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Bar with Tally & Checkout
          Container(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
            decoration: const BoxDecoration(
              color: Color(0xFF14141E),
              border: Border(top: BorderSide(color: Colors.white12)),
            ),
            child: Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '${_selectedSeats.length} SEAT${_selectedSeats.length > 1 ? 'S' : ''} SELECTED',
                      style: const TextStyle(
                        color: Color(0xFF8E8EA0),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Row(
                      children: [
                        Text(
                          '₹$_finalTotal',
                          style: const TextStyle(
                            color: Color(0xFFFFDF70),
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        if (_discount > 0) ...[
                          const SizedBox(width: 8),
                          Text(
                            '₹$_subtotal',
                            style: const TextStyle(
                              color: Colors.white38,
                              fontSize: 14,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed:
                        _selectedSeats.isEmpty ? null : _onConfirmBooking,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE5A93C),
                      foregroundColor: const Color(0xFF0B0B0F),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 4,
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.confirmation_num, size: 18),
                        SizedBox(width: 8),
                        Text(
                          'MINT VIP PASS',
                          style: TextStyle(
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTierHeader(String title, String price, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: TextStyle(
            color: color,
            fontSize: 11,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.8,
          ),
        ),
        Text(
          price,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildRow(String rowLetter, int count) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SizedBox(
          width: 20,
          child: Text(
            rowLetter,
            style: const TextStyle(
              color: Colors.white38,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(width: 4),
        ...List.generate(count, (i) {
          final seatNum = '$rowLetter${i + 1}';
          final isSelected = _selectedSeats.contains(seatNum);
          final isBooked = _bookedSeats.contains(seatNum);

          Color bgColor = const Color(0xFF1E1E2C);
          Color textColor = Colors.white70;

          if (isBooked) {
            bgColor = const Color(0xFF2C2C36);
            textColor = Colors.white24;
          } else if (isSelected) {
            bgColor = const Color(0xFFE5A93C);
            textColor = const Color(0xFF0B0B0F);
          }

          return GestureDetector(
            onTap: () => _toggleSeat(seatNum),
            child: Container(
              width: 32,
              height: 30,
              margin: EdgeInsets.symmetric(
                horizontal: (i == 3) ? 10 : 3,
              ),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color: isSelected
                      ? const Color(0xFFFFDF70)
                      : (isBooked ? Colors.transparent : Colors.white12),
                  width: 1,
                ),
              ),
              child: Center(
                child: Text(
                  '${i + 1}',
                  style: TextStyle(
                    color: textColor,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildLegend(Color color, String label) {
    return Row(
      children: [
        Container(
          width: 14,
          height: 14,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(color: Color(0xFF8E8EA0), fontSize: 11),
        ),
      ],
    );
  }
}

class _CurvedScreenPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFE5A93C)
      ..strokeWidth = 3.5
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path();
    path.moveTo(0, size.height);
    path.quadraticBezierTo(
      size.width / 2,
      0,
      size.width,
      size.height,
    );

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
