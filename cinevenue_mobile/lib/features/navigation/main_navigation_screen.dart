import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../models/booking_model.dart';
import '../../models/event_model.dart';
import '../../models/movie_model.dart';
import '../../models/seat_model.dart';
import '../../models/show_model.dart';
import '../../models/user_model.dart';
import '../auth/auth_service.dart';
import '../auth/screens/login_screen.dart';
import '../auth/screens/register_screen.dart';
import '../cinecoins/screens/cinecoins_screen.dart';
import '../checkout/screens/checkout_screen.dart';
import '../events/screens/event_detail_screen.dart';
import '../events/screens/events_list_screen.dart';
import '../movies/screens/movie_detail_screen.dart';
import '../movies/screens/movies_list_screen.dart';
import '../profile/screens/edit_profile_screen.dart';
import '../profile/screens/profile_screen.dart';
import '../scanner/screens/gate_scanner_screen.dart';
import '../seats/screens/seat_layout_screen.dart';
import '../shows/screens/showtime_selection_screen.dart';
import '../tickets/screens/my_tickets_screen.dart';
import '../tickets/screens/ticket_view_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  final UserModel? initialUser;

  const MainNavigationScreen({super.key, this.initialUser});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  UserModel? _currentUser;
  final AuthService _authService = AuthService();

  // Booking Flow State
  MovieModel? _activeMovie;
  ShowtimeModel? _activeShow;
  List<SeatModel>? _activeSeats;
  BookingModel? _activeBooking;
  EventModel? _activeEvent;

  // Modals & Navigation Overlays
  bool _isAuthModalOpen = false;
  bool _isRegistering = false;
  bool _isEditingProfile = false;
  bool _isScannerOpen = false;

  @override
  void initState() {
    super.initState();
    _currentUser = widget.initialUser;
    if (_currentUser == null) {
      _refreshProfile();
    }
  }

  Future<void> _refreshProfile() async {
    final profile = await _authService.getProfile();
    if (mounted && profile != null) {
      setState(() => _currentUser = profile);
    }
  }

  void _clearBookingFlow() {
    setState(() {
      _activeMovie = null;
      _activeShow = null;
      _activeSeats = null;
      _activeBooking = null;
      _activeEvent = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    // 1. Scanner Full-screen Overlay
    if (_isScannerOpen) {
      return GateScannerScreen(
        onBack: () => setState(() => _isScannerOpen = false),
      );
    }

    // 2. Active Ticket View Overlay
    if (_activeBooking != null) {
      return TicketViewScreen(
        booking: _activeBooking!,
        onDone: _clearBookingFlow,
      );
    }

    // 3. Checkout Screen Overlay
    if (_activeMovie != null && _activeShow != null && _activeSeats != null) {
      return CheckoutScreen(
        movie: _activeMovie!,
        show: _activeShow!,
        seats: _activeSeats!,
        onBookingConfirmed: (booking) {
          setState(() {
            _activeBooking = booking;
          });
        },
        onBack: () => setState(() => _activeSeats = null),
      );
    }

    // 4. Seat Layout Screen Overlay
    if (_activeMovie != null && _activeShow != null) {
      return SeatLayoutScreen(
        movie: _activeMovie!,
        show: _activeShow!,
        onProceedToCheckout: (seats) {
          setState(() => _activeSeats = seats);
        },
        onBack: () => setState(() => _activeShow = null),
      );
    }

    // 5. Showtime Selection Overlay
    if (_activeMovie != null) {
      return ShowtimeSelectionScreen(
        movie: _activeMovie!,
        onShowtimeSelected: (show) {
          setState(() => _activeShow = show);
        },
        onBack: () => setState(() => _activeMovie = null),
      );
    }

    // 6. Event Detail Overlay
    if (_activeEvent != null) {
      return EventDetailScreen(
        event: _activeEvent!,
        onBookingComplete: (booking) {
          setState(() {
            _activeEvent = null;
            _activeBooking = booking;
          });
        },
        onBack: () => setState(() => _activeEvent = null),
      );
    }

    // 7. Auth Modal Overlay
    if (_isAuthModalOpen) {
      if (_isRegistering) {
        return RegisterScreen(
          onRegisterSuccess: () {
            setState(() {
              _isAuthModalOpen = false;
              _isRegistering = false;
            });
            _refreshProfile();
          },
          onNavigateToLogin: () => setState(() => _isRegistering = false),
        );
      }
      return LoginScreen(
        onLoginSuccess: () {
          setState(() => _isAuthModalOpen = false);
          _refreshProfile();
        },
        onNavigateToRegister: () => setState(() => _isRegistering = true),
        onContinueAsGuest: () => setState(() => _isAuthModalOpen = false),
      );
    }

    // 8. Edit Profile Screen Overlay
    if (_isEditingProfile && _currentUser != null) {
      return EditProfileScreen(
        user: _currentUser!,
        onProfileUpdated: (updated) {
          setState(() {
            _currentUser = updated;
            _isEditingProfile = false;
          });
        },
      );
    }

    // Root Tabs
    final List<Widget> tabs = [
      MoviesListScreen(
        onMovieSelected: (movie) => setState(() => _activeMovie = movie),
      ),
      EventsListScreen(
        onEventSelected: (event) => setState(() => _activeEvent = event),
      ),
      MyTicketsScreen(
        onSelectBooking: (booking) => setState(() => _activeBooking = booking),
      ),
      const CineCoinsScreen(),
      ProfileScreen(
        user: _currentUser,
        onEditProfile: () => setState(() => _isEditingProfile = true),
        onViewTickets: () => setState(() => _currentIndex = 2),
        onViewCineCoins: () => setState(() => _currentIndex = 3),
        onOpenScanner: () => setState(() => _isScannerOpen = true),
        onSignIn: () => setState(() => _isAuthModalOpen = true),
        onLogout: () async {
          await _authService.logout();
          setState(() {
            _currentUser = null;
            _currentIndex = 0;
          });
        },
      ),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: tabs,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.movie_outlined),
            activeIcon: Icon(Icons.movie_rounded),
            label: 'Movies',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.festival_outlined),
            activeIcon: Icon(Icons.festival_rounded),
            label: 'Events',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.confirmation_number_outlined),
            activeIcon: Icon(Icons.confirmation_number_rounded),
            label: 'My Tickets',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.stars_outlined),
            activeIcon: Icon(Icons.stars_rounded),
            label: 'CineCoins',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline_rounded),
            activeIcon: Icon(Icons.person_rounded),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
