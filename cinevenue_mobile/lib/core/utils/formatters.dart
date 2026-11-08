import 'package:intl/intl.dart';

class AppFormatters {
  static final NumberFormat currencyFormatter = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 2,
  );

  static final NumberFormat currencyNoDecimals = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 0,
  );

  static String formatCurrency(num amount) {
    return currencyFormatter.format(amount);
  }

  static String formatCurrencyCompact(num amount) {
    return currencyNoDecimals.format(amount);
  }

  static String formatDate(dynamic date) {
    if (date == null) return '';
    final DateTime dt = date is DateTime ? date : DateTime.tryParse(date.toString()) ?? DateTime.now();
    return DateFormat('EEE, dd MMM yyyy').format(dt);
  }

  static String formatTime(dynamic date) {
    if (date == null) return '';
    final DateTime dt = date is DateTime ? date : DateTime.tryParse(date.toString()) ?? DateTime.now();
    return DateFormat('hh:mm a').format(dt);
  }

  static String formatDateTime(dynamic date) {
    if (date == null) return '';
    final DateTime dt = date is DateTime ? date : DateTime.tryParse(date.toString()) ?? DateTime.now();
    return DateFormat('dd MMM yyyy, hh:mm a').format(dt);
  }

  static String formatDuration(int minutes) {
    final int hours = minutes ~/ 60;
    final int mins = minutes % 60;
    if (hours > 0) {
      return '${hours}h ${mins}m';
    }
    return '${mins}m';
  }
}
