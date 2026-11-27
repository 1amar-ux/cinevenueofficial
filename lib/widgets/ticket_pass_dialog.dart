import 'package:flutter/material.dart';
import '../models/cinema_models.dart';

class TicketPassDialog extends StatelessWidget {
  final BookingTicket ticket;

  const TicketPassDialog({super.key, required this.ticket});

  static void show(BuildContext context, BookingTicket ticket) {
    showDialog(
      context: context,
      builder: (ctx) => TicketPassDialog(ticket: ticket),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0F0F16),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: const Color(0xFFE5A93C), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFFE5A93C).withValues(alpha: 0.25),
              blurRadius: 30,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Top Header: Gold Crest
            Container(
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFFE5A93C), Color(0xFFB8860B)],
                ),
                borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.stars, color: Color(0xFF0B0B0F), size: 18),
                      SizedBox(width: 8),
                      Text(
                        'VIP GOLD BOARDING PASS',
                        style: TextStyle(
                          color: Color(0xFF0B0B0F),
                          fontWeight: FontWeight.w900,
                          fontSize: 12,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    '#${ticket.bookingId}',
                    style: const TextStyle(
                      color: Color(0xFF0B0B0F),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
            ),

            // Pass Details
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Movie Title
                  Text(
                    ticket.movieTitle,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.2,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color:
                              const Color(0xFFE5A93C).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: const Color(0xFFE5A93C),
                            width: 0.8,
                          ),
                        ),
                        child: Text(
                          ticket.format,
                          style: const TextStyle(
                            color: Color(0xFFFFDF70),
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        ticket.hallName,
                        style: const TextStyle(
                          color: Color(0xFF9E9EAF),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Theater, Date & Time Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildInfoCol('THEATER', ticket.theaterName),
                      _buildInfoCol('DATE', ticket.dateStr),
                      _buildInfoCol('TIME', ticket.timeStr),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Seats Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'RESERVED RECLINERS',
                            style: TextStyle(
                              color: Color(0xFF8E8EA0),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Wrap(
                            spacing: 6,
                            children: ticket.seats.map((seat) {
                              return Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFE5A93C),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  seat,
                                  style: const TextStyle(
                                    color: Color(0xFF0B0B0F),
                                    fontWeight: FontWeight.w900,
                                    fontSize: 12,
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text(
                            'TOTAL PAID',
                            style: TextStyle(
                              color: Color(0xFF8E8EA0),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '₹${ticket.totalAmount}',
                            style: const TextStyle(
                              color: Color(0xFFFFDF70),
                              fontWeight: FontWeight.w900,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // Perforated Line Divider
                  Row(
                    children: List.generate(
                      24,
                      (i) => Expanded(
                        child: Container(
                          height: 1.5,
                          color: i.isEven
                              ? const Color(0xFFE5A93C).withValues(alpha: 0.4)
                              : Colors.transparent,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // QR Code
                  Center(
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.5),
                                blurRadius: 10,
                              ),
                            ],
                          ),
                          child: Image.network(
                            ticket.qrCodeUrl,
                            width: 140,
                            height: 140,
                            errorBuilder: (ctx, err, stack) => Container(
                              width: 140,
                              height: 140,
                              color: Colors.white,
                              child: const Icon(
                                Icons.qr_code_2,
                                size: 100,
                                color: Color(0xFF0B0B0F),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Scan at IMAX Concierge Turnstile',
                          style: TextStyle(
                            color: Color(0xFF9E9EAF),
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Bottom Action
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.wallet, size: 18),
                      label: const Text('Add to Wallet'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE5A93C),
                        foregroundColor: const Color(0xFF0B0B0F),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text(
                      'Done',
                      style: TextStyle(color: Color(0xFF9E9EAF)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  static Widget _buildInfoCol(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF8E8EA0),
            fontSize: 9,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
