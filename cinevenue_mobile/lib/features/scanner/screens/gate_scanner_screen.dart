import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_theme.dart';

class GateScannerScreen extends StatefulWidget {
  final VoidCallback onBack;

  const GateScannerScreen({super.key, required this.onBack});

  @override
  State<GateScannerScreen> createState() => _GateScannerScreenState();
}

class _GateScannerScreenState extends State<GateScannerScreen> {
  final ApiClient _apiClient = ApiClient();
  final MobileScannerController _scannerController = MobileScannerController();

  bool _isProcessing = false;
  Map<String, dynamic>? _scanResult;
  bool? _isValid;

  void _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;

    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final String? qrPayload = barcodes.first.rawValue;
    if (qrPayload == null || qrPayload.isEmpty) return;

    setState(() {
      _isProcessing = true;
      _scanResult = null;
    });

    try {
      final response = await _apiClient.post(
        ApiEndpoints.verifyTicket,
        data: {'qrPayload': qrPayload},
      );

      final data = response.data;
      final isValid = data['success'] == true && (data['data']?['isValid'] == true || data['isValid'] == true);

      setState(() {
        _isValid = isValid;
        _scanResult = data['data'] ?? data;
      });
    } catch (e) {
      setState(() {
        _isValid = false;
        _scanResult = {'message': e.toString().replaceAll('ApiException: ', '')};
      });
    } finally {
      // Allow re-scanning after 3 seconds
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) setState(() => _isProcessing = false);
      });
    }
  }

  @override
  void dispose() {
    _scannerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: const Text('Staff Gate QR Scanner', style: TextStyle(color: Colors.white)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: widget.onBack,
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on),
            onPressed: () => _scannerController.toggleTorch(),
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _scannerController,
            onDetect: _onDetect,
          ),

          // Reticle Viewfinder Overlay
          Center(
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                border: Border.all(
                  color: _isValid == null
                      ? AppColors.primaryBlue
                      : (_isValid! ? AppColors.green : AppColors.danger),
                  width: 3,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),

          // Scan Result Sheet
          if (_scanResult != null)
            Positioned(
              left: 20,
              right: 20,
              bottom: 40,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _isValid == true ? AppColors.green : AppColors.danger,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 4)),
                  ],
                ),
                child: Row(
                  children: [
                    Icon(
                      _isValid == true ? Icons.check_circle_rounded : Icons.cancel_rounded,
                      color: Colors.white,
                      size: 36,
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _isValid == true ? 'VALID TICKET — ADMIT GUEST' : 'INVALID OR USED TICKET',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _scanResult!['movieTitle'] ?? _scanResult!['message'] ?? 'Ticket verification complete',
                            style: const TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
