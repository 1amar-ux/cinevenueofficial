import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../models/user_model.dart';
import '../../auth/auth_service.dart';

class EditProfileScreen extends StatefulWidget {
  final UserModel user;
  final Function(UserModel) onProfileUpdated;

  const EditProfileScreen({
    super.key,
    required this.user,
    required this.onProfileUpdated,
  });

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _mobileController;
  final AuthService _authService = AuthService();

  bool _isSaving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.user.name);
    _mobileController = TextEditingController(text: widget.user.mobile ?? '');
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSaving = true;
      _error = null;
    });

    try {
      final updatedUser = await _authService.updateProfile(
        name: _nameController.text.trim(),
        mobile: _mobileController.text.trim().isNotEmpty ? _mobileController.text.trim() : null,
      );

      if (mounted) {
        widget.onProfileUpdated(updatedUser);
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated successfully!'), backgroundColor: AppColors.green),
        );
      }
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('ApiException: ', '');
      });
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _mobileController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Edit Profile'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (_error != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.danger.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.parse('1px solid ${AppColors.danger}'),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: AppColors.danger, size: 20),
                      const SizedBox(width: 8),
                      Expanded(child: Text(_error!, style: const TextStyle(color: AppColors.danger, fontSize: 13))),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // Full Name
              const Text('Full Name', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textMain, fontSize: 13)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _nameController,
                textCapitalization: TextCapitalization.words,
                decoration: const InputDecoration(
                  hintText: 'John Doe',
                  prefixIcon: Icon(Icons.person_outline_rounded, color: AppColors.textSecondary, size: 20),
                ),
                validator: (val) => (val == null || val.trim().length < 2) ? 'Name must be at least 2 characters' : null,
              ),
              const SizedBox(height: 18),

              // Email (Read-only)
              const Text('Email Address (Immutable)', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textMuted, fontSize: 13)),
              const SizedBox(height: 6),
              TextFormField(
                initialValue: widget.user.email,
                readOnly: true,
                decoration: const InputDecoration(
                  filled: true,
                  fillColor: Color(0xFFF1F5F9),
                  prefixIcon: Icon(Icons.mail_outline_rounded, color: AppColors.textMuted, size: 20),
                ),
              ),
              const SizedBox(height: 18),

              // Mobile
              const Text('Mobile Number', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textMain, fontSize: 13)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _mobileController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  hintText: '+91 9876543210',
                  prefixIcon: Icon(Icons.phone_outlined, color: AppColors.textSecondary, size: 20),
                ),
              ),
              const SizedBox(height: 32),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSaving ? null : _handleSave,
                  child: _isSaving
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white)))
                      : const Text('Save Changes'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
