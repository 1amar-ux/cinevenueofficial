import 'dart:async';
import 'dart:math' as math;
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_theme.dart';
import '../auth_service.dart';

enum OtpPhase { input, verifying, orbiting, converging, burst, verified }

class GlassyOtpVerification extends StatefulWidget {
  final String identifier;
  final Function(Map<String, dynamic> result) onSuccess;
  final VoidCallback? onCancel;
  final String? initialDevCode;
  final String type;
  final String title;
  final String? subtitle;

  const GlassyOtpVerification({
    super.key,
    required this.identifier,
    required this.onSuccess,
    this.onCancel,
    this.initialDevCode,
    this.type = 'LOGIN',
    this.title = 'Verification Code',
    this.subtitle,
  });

  @override
  State<GlassyOtpVerification> createState() => _GlassyOtpVerificationState();
}

class _GlassyOtpVerificationState extends State<GlassyOtpVerification>
    with TickerProviderStateMixin {
  final AuthService _authService = AuthService();

  final List<TextEditingController> _controllers =
      List.generate(4, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(4, (_) => FocusNode());

  OtpPhase _phase = OtpPhase.input;
  String? _errorMessage;
  int _resendCooldown = 30;
  Timer? _cooldownTimer;
  bool _isResending = false;
  String? _devCode;

  // Animation Controllers
  late AnimationController _orbitController;
  late AnimationController _convergenceController;
  late AnimationController _burstController;
  late AnimationController _checkmarkController;

  late Animation<double> _orbitAngle;
  late Animation<double> _radiusAnim;
  late Animation<double> _boxScaleAnim;
  late Animation<double> _sphereScaleAnim;
  late Animation<double> _checkmarkScaleAnim;

  @override
  void initState() {
    super.initState();
    _devCode = widget.initialDevCode;

    if (_devCode != null && _devCode!.length == 4) {
      for (int i = 0; i < 4; i++) {
        _controllers[i].text = _devCode![i];
      }
    }

    // Cooldown timer
    _startCooldownTimer();

    // 1. Orbit controller (1100ms circular revolution)
    _orbitController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1100),
    );
    _orbitAngle = Tween<double>(begin: 0.0, end: 4 * math.pi).animate(
      CurvedAnimation(parent: _orbitController, curve: Curves.linear),
    );

    // 2. Convergence controller (radius 55 -> 0, scale 1 -> 0.2)
    _convergenceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 650),
    );
    _radiusAnim = Tween<double>(begin: 55.0, end: 0.0).animate(
      CurvedAnimation(parent: _convergenceController, curve: Curves.easeInOutCubic),
    );
    _boxScaleAnim = Tween<double>(begin: 1.0, end: 0.2).animate(
      CurvedAnimation(parent: _convergenceController, curve: Curves.easeInCubic),
    );

    // 3. Burst controller for verification core
    _burstController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _sphereScaleAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _burstController, curve: Curves.elasticOut),
    );

    // 4. Checkmark reveal controller
    _checkmarkController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _checkmarkScaleAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _checkmarkController, curve: Curves.elasticOut),
    );
  }

  void _startCooldownTimer() {
    _cooldownTimer?.cancel();
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_resendCooldown > 0) {
        setState(() => _resendCooldown--);
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _cooldownTimer?.cancel();
    _orbitController.dispose();
    _convergenceController.dispose();
    _burstController.dispose();
    _checkmarkController.dispose();
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  void _onDigitChanged(int index, String value) {
    setState(() => _errorMessage = null);

    if (value.length > 1) {
      // Pasted full code
      final digits = value.replaceAll(RegExp(r'\D'), '');
      if (digits.isNotEmpty) {
        for (int i = 0; i < math.min(4, digits.length); i++) {
          _controllers[i].text = digits[i];
        }
        if (digits.length >= 4) {
          _focusNodes[3].unfocus();
          _executeVerification(digits.substring(0, 4));
        } else {
          _focusNodes[digits.length].requestFocus();
        }
      }
      return;
    }

    if (value.isNotEmpty && index < 3) {
      _focusNodes[index + 1].requestFocus();
    }

    // Auto submit if all 4 entered
    final fullCode = _controllers.map((c) => c.text).join();
    if (fullCode.length == 4) {
      _executeVerification(fullCode);
    }
  }

  Future<void> _handleResend() async {
    if (_resendCooldown > 0 || _isResending) return;
    setState(() {
      _isResending = true;
      _errorMessage = null;
    });

    try {
      final res = await _authService.sendOtp(
        identifier: widget.identifier,
        type: widget.type,
      );
      final code = res['code'] ?? res['devCode'];
      setState(() {
        if (code != null) _devCode = code.toString();
        _resendCooldown = 30;
      });
      for (final c in _controllers) {
        c.clear();
      }
      _focusNodes[0].requestFocus();
      _startCooldownTimer();
      HapticFeedback.lightImpact();
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('ApiException: ', '');
      });
    } finally {
      setState(() => _isResending = false);
    }
  }

  void _startCelebrationSequence(Map<String, dynamic> result) {
    setState(() => _phase = OtpPhase.orbiting);
    HapticFeedback.mediumImpact();

    // 1. Orbit starts
    _orbitController.forward(from: 0.0);

    // 2. Converge into center
    Timer(const Duration(milliseconds: 1000), () {
      if (!mounted) return;
      setState(() => _phase = OtpPhase.converging);
      _convergenceController.forward(from: 0.0);
    });

    // 3. Sphere Burst
    Timer(const Duration(milliseconds: 1650), () {
      if (!mounted) return;
      setState(() => _phase = OtpPhase.burst);
      _burstController.forward(from: 0.0);
      HapticFeedback.heavyImpact();
    });

    // 4. Reveal Checkmark & Success
    Timer(const Duration(milliseconds: 2000), () {
      if (!mounted) return;
      setState(() => _phase = OtpPhase.verified);
      _checkmarkController.forward(from: 0.0);
    });

    // 5. Notify parent after celebration
    Timer(const Duration(milliseconds: 3400), () {
      if (!mounted) return;
      widget.onSuccess(result);
    });
  }

  Future<void> _executeVerification([String? codeOverride]) async {
    final code = codeOverride ?? _controllers.map((c) => c.text).join();
    if (code.length != 4) {
      setState(() {
        _errorMessage = 'Please enter all 4 digits of your OTP code.';
      });
      return;
    }

    setState(() {
      _phase = OtpPhase.verifying;
      _errorMessage = null;
    });

    try {
      final res = await _authService.verifyOtp(
        identifier: widget.identifier,
        otp: code,
      );
      if (res['verified'] == true || res['success'] == true) {
        _startCelebrationSequence(res);
      } else {
        throw Exception(res['message'] ?? 'Verification could not be confirmed.');
      }
    } catch (e) {
      setState(() {
        _phase = OtpPhase.input;
        _errorMessage = e.toString().replaceAll('ApiException: ', '');
      });
      HapticFeedback.vibrate();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isAnimating = _phase == OtpPhase.orbiting ||
        _phase == OtpPhase.converging ||
        _phase == OtpPhase.burst ||
        _phase == OtpPhase.verified;

    return Center(
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
          child: Container(
            width: double.infinity,
            constraints: const BoxConstraints(maxWidth: 380),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xE61C1917), // Rich warm dark bronze
                  Color(0xF50C0A09), // Deep cinematic black
                ],
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: const Color(0x4DD4AF37), // Luxury gold border glow
                width: 1.2,
              ),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x33D4AF37),
                  blurRadius: 28,
                  offset: Offset(0, 10),
                ),
                BoxShadow(
                  color: Color(0x80000000),
                  blurRadius: 16,
                  offset: Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Top Icon Badge
                Container(
                  width: 54,
                  height: 54,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: _phase == OtpPhase.verified
                          ? [const Color(0xFF059669), const Color(0xFF10B981)]
                          : [const Color(0xFFD4AF37), const Color(0xFF997D22)],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: _phase == OtpPhase.verified
                            ? const Color(0x6610B981)
                            : const Color(0x66D4AF37),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Icon(
                    _phase == OtpPhase.verified
                        ? Icons.verified_user_rounded
                        : Icons.lock_outline_rounded,
                    color: Colors.black,
                    size: 26,
                  ),
                ),
                const SizedBox(height: 16),

                // Title & Subtitle
                Text(
                  widget.title,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  widget.subtitle ?? 'Sent to ${widget.identifier}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFFA0A0AB),
                  ),
                ),
                const SizedBox(height: 16),

                // Dev Code Auto-Fill Pill
                if (_devCode != null && _devCode!.isNotEmpty) ...[
                  InkWell(
                    onTap: () {
                      if (_devCode!.length == 4) {
                        for (int i = 0; i < 4; i++) {
                          _controllers[i].text = _devCode![i];
                        }
                        _executeVerification(_devCode);
                      }
                    },
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0x26D4AF37),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0x66D4AF37)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.auto_awesome, color: Color(0xFFD4AF37), size: 14),
                          const SizedBox(width: 6),
                          Text(
                            'Dev OTP: $_devCode',
                            style: const TextStyle(
                              color: Color(0xFFF3E5AB),
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // Error Message
                if (_errorMessage != null) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0x26EF4444),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0x66EF4444)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: Color(0xFFEF4444), size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: const TextStyle(color: Color(0xFFEF4444), fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // STAGE: 4 Digit Inputs OR Orbiting Choreography
                SizedBox(
                  height: 130,
                  width: double.infinity,
                  child: Center(
                    child: !isAnimating
                        ? _buildStaticInputStage()
                        : _buildChoreographyStage(),
                  ),
                ),

                // Success Message Banner
                if (_phase == OtpPhase.verified) ...[
                  const Text(
                    'Verified Successfully',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF34D399),
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Your account has been securely verified.',
                    style: TextStyle(fontSize: 12, color: Color(0xFFA0A0AB)),
                  ),
                  const SizedBox(height: 16),
                ],

                // Action Button
                if (_phase != OtpPhase.verified) ...[
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: (_phase == OtpPhase.verifying || isAnimating)
                          ? null
                          : () => _executeVerification(),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFD4AF37),
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 4,
                        shadowColor: const Color(0x66D4AF37),
                      ),
                      child: _phase == OtpPhase.verifying
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.black),
                              ),
                            )
                          : const Text(
                              'VERIFY & PROCEED',
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.5,
                                fontSize: 13,
                              ),
                            ),
                    ),
                  ),
                ] else ...[
                  Container(
                    width: double.infinity,
                    height: 48,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF10B981), Color(0xFF059669)],
                      ),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x6610B981),
                          blurRadius: 14,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.shield, color: Colors.white, size: 18),
                        SizedBox(width: 8),
                        Text(
                          'VERIFIED & SECURED',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.5,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // Footer (Resend & Cancel)
                if (_phase == OtpPhase.input) ...[
                  const SizedBox(height: 18),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      if (widget.onCancel != null)
                        TextButton(
                          onPressed: widget.onCancel,
                          child: const Text(
                            'Cancel',
                            style: TextStyle(color: Color(0xFF718096), fontSize: 12),
                          ),
                        )
                      else
                        const SizedBox(),
                      TextButton(
                        onPressed: _resendCooldown > 0 || _isResending ? null : _handleResend,
                        child: Text(
                          _resendCooldown > 0
                              ? 'Resend OTP in ${_resendCooldown}s'
                              : 'Resend Verification OTP',
                          style: TextStyle(
                            color: _resendCooldown > 0
                                ? const Color(0xFF718096)
                                : const Color(0xFFD4AF37),
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Static 4-Box Input Stage
  Widget _buildStaticInputStage() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(4, (index) {
        final hasVal = _controllers[index].text.isNotEmpty;
        return Container(
          width: 58,
          height: 64,
          margin: const EdgeInsets.symmetric(horizontal: 6),
          decoration: BoxDecoration(
            color: hasVal ? const Color(0x33D4AF37) : const Color(0x1AFFFFFF),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: hasVal ? const Color(0xFFD4AF37) : const Color(0x33FFFFFF),
              width: 1.5,
            ),
            boxShadow: hasVal
                ? const [
                    BoxShadow(
                      color: Color(0x40D4AF37),
                      blurRadius: 8,
                      offset: Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Center(
            child: TextField(
              controller: _controllers[index],
              focusNode: _focusNodes[index],
              keyboardType: TextInputType.number,
              textAlign: TextAlign.center,
              maxLength: 1,
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
              decoration: const InputDecoration(
                counterText: '',
                border: InputBorder.none,
                hintText: '•',
                hintStyle: TextStyle(color: Color(0x33FFFFFF)),
              ),
              onChanged: (val) => _onDigitChanged(index, val),
            ),
          ),
        );
      }),
    );
  }

  // Dynamic Choreography Stage (Orbit -> Converge -> Sphere -> Checkmark)
  Widget _buildChoreographyStage() {
    return SizedBox(
      width: 140,
      height: 140,
      child: AnimatedBuilder(
        animation: Listenable.merge([
          _orbitController,
          _convergenceController,
          _burstController,
          _checkmarkController,
        ]),
        builder: (context, child) {
          final angle = _orbitAngle.value;
          final radius = _radiusAnim.value;
          final boxScale = _boxScaleAnim.value;

          return Stack(
            alignment: Alignment.center,
            children: [
              // 4 Orbiting/Converging Boxes
              if (_phase == OtpPhase.orbiting || _phase == OtpPhase.converging) ...[
                for (int i = 0; i < 4; i++) ...[
                  Transform.translate(
                    offset: Offset(
                      radius * math.cos(angle + (i * math.pi / 2)),
                      radius * math.sin(angle + (i * math.pi / 2)),
                    ),
                    child: Transform.scale(
                      scale: boxScale,
                      child: Container(
                        width: 44,
                        height: 48,
                        decoration: BoxDecoration(
                          color: const Color(0x40D4AF37),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFD4AF37), width: 1.5),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x80D4AF37),
                              blurRadius: 10,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            _controllers[i].text.isNotEmpty ? _controllers[i].text : '•',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFFF3E5AB),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ],

              // Glowing Verification Sphere Core & Checkmark
              if (_phase == OtpPhase.burst || _phase == OtpPhase.verified) ...[
                Transform.scale(
                  scale: _sphereScaleAnim.value,
                  child: Container(
                    width: 76,
                    height: 76,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const RadialGradient(
                        colors: [
                          Color(0xFF34D399),
                          Color(0xFF10B981),
                          Color(0xFF047857),
                        ],
                      ),
                      border: Border.all(color: const Color(0xFF6EE7B7), width: 2),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x9910B981),
                          blurRadius: 20,
                          spreadRadius: 4,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Transform.scale(
                        scale: _checkmarkScaleAnim.value,
                        child: const Icon(
                          Icons.check_rounded,
                          color: Colors.white,
                          size: 42,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ],
          );
        },
      ),
    );
  }
}

