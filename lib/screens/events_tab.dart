import 'package:flutter/material.dart';
import '../data/mock_cinema_data.dart';
import '../models/cinema_models.dart';
import '../widgets/ticket_pass_dialog.dart';

class EventsTab extends StatelessWidget {
  const EventsTab({super.key});

  @override
  Widget build(BuildContext context) {
    const events = MockCinemaData.events;

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      itemCount: events.length,
      itemBuilder: (context, index) {
        final ev = events[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            color: const Color(0xFF14141E),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
                color: const Color(0xFFE5A93C).withValues(alpha: 0.25)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.5),
                blurRadius: 15,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Banner Image
              ClipRRect(
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(19)),
                child: Stack(
                  children: [
                    Image.network(
                      ev.bannerUrl,
                      height: 160,
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                    Container(
                      height: 160,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            const Color(0xFF14141E).withValues(alpha: 0.85),
                            const Color(0xFF14141E),
                          ],
                        ),
                      ),
                    ),
                    Positioned(
                      top: 12,
                      left: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE5A93C),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          ev.dateStr,
                          style: const TextStyle(
                            color: Color(0xFF0B0B0F),
                            fontWeight: FontWeight.w900,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ev.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      ev.subtitle,
                      style: const TextStyle(
                        color: Color(0xFF8E8EA0),
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined,
                            size: 14, color: Color(0xFFE5A93C)),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            ev.locationName,
                            style: const TextStyle(
                                color: Color(0xFFB0B0C0), fontSize: 11),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'VIP ADMISSION',
                              style: TextStyle(
                                color: Color(0xFF8E8EA0),
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              '₹${ev.price}',
                              style: const TextStyle(
                                color: Color(0xFFFFDF70),
                                fontSize: 20,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ],
                        ),
                        ElevatedButton(
                          onPressed: () {
                            TicketPassDialog.show(
                              context,
                              BookingTicketItem(
                                bookingId: 'EV-${ev.id.toUpperCase()}',
                                movieTitle: ev.title,
                                theaterName: ev.locationName,
                                hallName: 'Grand Ballroom & 70mm Dome',
                                format: 'GALA EVENT',
                                dateStr: ev.dateStr,
                                timeStr: ev.timeStr,
                                seats: ['VIP-BOX 1'],
                                totalAmount: ev.price,
                                qrCodeUrl:
                                    'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CINEVENUE-EVENT-${ev.id}',
                                posterUrl: ev.bannerUrl,
                                status: 'CONFIRMED',
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFE5A93C),
                            foregroundColor: const Color(0xFF0B0B0F),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: const Text(
                            'RESERVE GALA PASS',
                            style: TextStyle(
                                fontWeight: FontWeight.w900, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
