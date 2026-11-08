import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../models/booking_model.dart';
import '../../../models/movie_model.dart';
import '../../../models/seat_model.dart';
import '../../../models/show_model.dart';
import '../checkout_service.dart';

class CheckoutScreen extends StatefulWidget {
  final MovieModel movie;
  final ShowtimeModel show;
  final List<SeatModel> seats;
  final Function(BookingModel) onBookingConfirmed;
  final VoidCallback onBack;

  const CheckoutScreen({
    super.key,
    required this.movie,
    required this.show,
    required this.seats,
    required this.onBookingConfirmed,
    required this.onBack,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final CheckoutService _checkoutService = CheckoutService();
  final TextEditingController _couponController = TextEditingController();

  PricingBreakdown? _pricing;
  bool _isLoadingPricing = true;
  bool _isProcessingPayment = false;
  String? _error;
  String? _appliedCoupon;

  String _selectedPaymentMethod = 'UPI'; // UPI, CARD, NETBANKING

  @override
  void initState() {
    super.initState();
    _fetchAuthoritativePricing();
  }

  double get _baseTotal {
    return widget.seats.fold(0.0, (sum, s) => sum + s.price);
  }

  Future<void> _fetchAuthoritativePricing({String? coupon}) async {
    setState(() {
      _isLoadingPricing = true;
      _error = null;
    });

    try {
      final pricing = await _checkoutService.calculateAuthoritativePricing(
        baseAmount: _baseTotal,
        seatCount: widget.seats.length,
        couponCode: coupon,
      );
      setState(() {
        _pricing = pricing;
        _appliedCoupon = coupon;
        _isLoadingPricing = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('ApiException: ', '');
        _isLoadingPricing = false;
      });
    }
  }

  Future<void> _handlePayment() async {
    if (_pricing == null) return;

    setState(() => _isProcessingPayment = true);

    try {
      // 1. Create Payment Order on Backend
      final orderData = await _checkoutService.createPaymentOrder(
        showId: widget.show.id,
        seatIds: widget.seats.map((s) => s.id).toList(),
        amount: _pricing!.totalAmount,
        gateway: 'RAZORPAY',
      );

      final orderId = orderData['orderId'] ?? orderData['id'] ?? 'order_${DateTime.now().millisecondsSinceEpoch}';

      // 2. Simulate native Razorpay SDK invocation in mobile sandbox
      // In production, Razorpay.open(options) triggers UPI/Cards sheet
      final paymentId = 'pay_${DateTime.now().millisecondsSinceEpoch}';
      final signature = 'sig_${DateTime.now().millisecondsSinceEpoch}';

      // 3. Authoritative verification on Backend (never trust frontend)
      final booking = await _checkoutService.verifyPayment(
        orderId: orderId,
        paymentId: paymentId,
        signature: signature,
        showId: widget.show.id,
        seatIds: widget.seats.map((s) => s.id).toList(),
      );

      if (mounted) {
        widget.onBookingConfirmed(booking);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Payment verification failed: ${e.toString().replaceAll("ApiException: ", "")}'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isProcessingPayment = false);
    }
  }

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Review & Confirm'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: widget.onBack,
        ),
      ),
      body: _isLoadingPricing
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Booking Summary Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.movie.title,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textMain),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${widget.show.theatreName} • ${widget.show.screenName}',
                          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${AppFormatters.formatDate(widget.show.startTime)} at ${AppFormatters.formatTime(widget.show.startTime)}',
                          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                        ),
                        const Divider(height: 24, color: AppColors.border),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Selected Seats', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                            Text(
                              widget.seats.map((s) => s.label).join(', '),
                              style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primaryBlue),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Coupon Section
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Promo Code / Gift Voucher', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _couponController,
                                textCapitalization: TextCapitalization.characters,
                                decoration: const InputDecoration(
                                  hintText: 'Enter promo code (e.g. CINE10)',
                                  contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            ElevatedButton(
                              onPressed: () {
                                if (_couponController.text.trim().isNotEmpty) {
                                  _fetchAuthoritativePricing(coupon: _couponController.text.trim());
                                }
                              },
                              child: const Text('Apply'),
                            ),
                          ],
                        ),
                        if (_appliedCoupon != null) ...[
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.check_circle, size: 16, color: AppColors.green),
                              const SizedBox(width: 4),
                              Text(
                                'Coupon "$_appliedCoupon" applied!',
                                style: const TextStyle(color: AppColors.green, fontSize: 12, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Price Breakdown Card
                  if (_pricing != null) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.card,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Price Breakdown', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                          const SizedBox(height: 12),
                          _buildPriceRow('Ticket Base Amount', _pricing!.baseAmount),
                          _buildPriceRow('Convenience Fee', _pricing!.convenienceFee),
                          _buildPriceRow('Integrated GST (18%)', _pricing!.gst),
                          if (_pricing!.discount > 0)
                            _buildPriceRow('Discount', -_pricing!.discount, isDiscount: true),
                          const Divider(height: 20, color: AppColors.border),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total Payable', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textMain)),
                              Text(
                                AppFormatters.formatCurrency(_pricing!.totalAmount),
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primaryBlue),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Payment Method
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Payment Mode', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                        const SizedBox(height: 12),
                        _buildPaymentRadio('UPI / QR Code', 'Google Pay, PhonePe, Paytm, BHIM', 'UPI', Icons.qr_code_rounded),
                        _buildPaymentRadio('Credit / Debit Card', 'Visa, MasterCard, RuPay', 'CARD', Icons.credit_card_rounded),
                        _buildPaymentRadio('Net Banking', 'All major Indian banks supported', 'NETBANKING', Icons.account_balance_rounded),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          decoration: const BoxDecoration(
            color: AppColors.card,
            border: Border(top: BorderSide(color: AppColors.border)),
          ),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: (_isProcessingPayment || _pricing == null) ? null : _handlePayment,
              child: _isProcessingPayment
                  ? const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white))),
                        SizedBox(width: 12),
                        Text('Authorizing Payment...'),
                      ],
                    )
                  : Text('Pay ${AppFormatters.formatCurrency(_pricing?.totalAmount ?? _baseTotal)}'),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPriceRow(String label, double amount, {bool isDiscount = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          Text(
            isDiscount ? '- ${AppFormatters.formatCurrency(amount.abs())}' : AppFormatters.formatCurrency(amount),
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isDiscount ? AppColors.green : AppColors.textMain,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentRadio(String title, String subtitle, String value, IconData icon) {
    final isSelected = _selectedPaymentMethod == value;
    return GestureDetector(
      onTap: () => setState(() => _selectedPaymentMethod = value),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isSelected ? AppColors.primaryBlue : AppColors.border, width: isSelected ? 1.5 : 1),
          color: isSelected ? AppColors.primaryBlue.withOpacity(0.04) : Colors.transparent,
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? AppColors.primaryBlue : AppColors.textSecondary, size: 24),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                  Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                ],
              ),
            ),
            Radio<String>(
              value: value,
              groupValue: _selectedPaymentMethod,
              activeColor: AppColors.primaryBlue,
              onChanged: (val) {
                if (val != null) setState(() => _selectedPaymentMethod = val);
              },
            ),
          ],
        ),
      ),
    );
  }
}
