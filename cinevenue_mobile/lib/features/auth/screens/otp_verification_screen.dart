import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../widgets/glassy_otp_verification.dart';

class OtpVerificationScreen extends StatelessWidget {
  final String identifier;
  final String? initialDevCode;
  final String type;
  final VoidCallback onVerificationSuccess;

  const OtpVerificationScreen({
    super.key,
    required this.identifier,
    this.initialDevCode,
    this.type = 'LOGIN',
    required this.onVerificationSuccess,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight - 32,
                ),
                child: Center(
                  child: GlassyOtpVerification(
                    identifier: identifier,
                    initialDevCode: initialDevCode,
                    type: type,
                    title: 'Secure Verification',
                    subtitle: 'We sent a 4-digit code to $identifier',
                    onCancel: () => Navigator.of(context).pop(),
                    onSuccess: (result) {
                      onVerificationSuccess();
                    },
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

