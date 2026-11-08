import 'package:flutter_test/flutter_test.dart';
import 'package:cinevenue/main.dart';
import 'package:cinevenue/services/api_service.dart';

void main() {
  testWidgets('CineVenue app initializes and renders home screen correctly', (WidgetTester tester) async {
    final apiService = ApiService();

    // Pump CineVenueApp widget
    await tester.pumpWidget(CineVenueApp(apiService: apiService));
    await tester.pumpAndSettle();

    // Verify CineVenue brand mark is present
    expect(find.text('CINEVENUE'), findsOneWidget);

    // Verify Section header is present
    expect(find.text('Now Showing'), findsOneWidget);

    // Verify city selector chip is present
    expect(find.text('Guntur'), findsOneWidget);
  });
}

