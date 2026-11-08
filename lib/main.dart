import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/home_screen.dart';
import 'services/api_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Enforce edge-to-edge transparent system overlay for modern Android & iOS status bars
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      statusBarBrightness: Brightness.dark,
      systemNavigationBarColor: Color(0xFF0B0B0F),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  final apiService = ApiService();

  runApp(CineVenueApp(apiService: apiService));
}

class CineVenueApp extends StatelessWidget {
  final ApiService apiService;

  const CineVenueApp({
    super.key,
    required this.apiService,
  });

  @override
  Widget build(BuildContext context) {
    const primaryGold = Color(0xFFE5A93C);
    const deepBlack = Color(0xFF0B0B0F);
    const surfaceDark = Color(0xFF14141E);
    const surfaceElevated = Color(0xFF1E1E2C);

    return MaterialApp(
      title: 'CineVenue',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: deepBlack,
        colorScheme: const ColorScheme.dark(
          primary: primaryGold,
          onPrimary: Colors.black,
          secondary: Color(0xFFF5C451),
          onSecondary: Colors.black,
          surface: surfaceDark,
          onSurface: Colors.white,
          error: Color(0xFFCF6679),
          onError: Colors.black,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: deepBlack,
          foregroundColor: Colors.white,
          elevation: 0,
          scrolledUnderElevation: 0,
          systemOverlayStyle: SystemUiOverlayStyle.light,
        ),
        cardTheme: CardThemeData(
          color: surfaceDark,
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: const BorderSide(color: Color(0x14FFFFFF)),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: primaryGold,
            foregroundColor: Colors.black,
            elevation: 0,
            textStyle: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
        snackBarTheme: SnackBarThemeData(
          backgroundColor: surfaceElevated,
          contentTextStyle: const TextStyle(color: Colors.white),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
            side: const BorderSide(color: Color(0xFFE5A93C), width: 0.8),
          ),
          behavior: SnackBarBehavior.floating,
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => HomeScreen(apiService: apiService),
        '/home': (context) => HomeScreen(apiService: apiService),
      },
      onGenerateRoute: (settings) {
        return MaterialPageRoute(
          builder: (context) => HomeScreen(apiService: apiService),
        );
      },
    );
  }
}
