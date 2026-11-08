import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/constants/app_constants.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/auth_service.dart';
import 'features/auth/screens/onboarding_screen.dart';
import 'features/auth/screens/splash_screen.dart';
import 'features/navigation/main_navigation_screen.dart';
import 'models/user_model.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set system UI overlay colors matching luxury design
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: AppColors.card,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const CineVenueApp());
}

class CineVenueApp extends StatefulWidget {
  const CineVenueApp({super.key});

  @override
  State<CineVenueApp> createState() => _CineVenueAppState();
}

class _CineVenueAppState extends State<CineVenueApp> {
  final AuthService _authService = AuthService();
  bool _isSplashVisible = true;
  bool _isOnboardingRequired = false;
  UserModel? _initialUser;

  @override
  void initState() {
    super.initState();
    _checkInitialState();
  }

  Future<void> _checkInitialState() async {
    try {
      final user = await _authService.getProfile();
      if (mounted) {
        setState(() {
          _initialUser = user;
        });
      }
    } catch (_) {
      // Offline fallback
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: _isSplashVisible
          ? SplashScreen(
              onInitialized: () {
                setState(() => _isSplashVisible = false);
              },
            )
          : _isOnboardingRequired
              ? OnboardingScreen(
                  onFinish: () {
                    setState(() => _isOnboardingRequired = false);
                  },
                )
              : MainNavigationScreen(
                  initialUser: _initialUser,
                ),
    );
  }
}
