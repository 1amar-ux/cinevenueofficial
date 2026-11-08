class UserModel {
  final String id;
  final String email;
  final String name;
  final String? mobile;
  final String? avatarUrl;
  final String role;
  final DateTime? createdAt;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.mobile,
    this.avatarUrl,
    required this.role,
    this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? json['userId'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      mobile: json['mobile'],
      avatarUrl: json['avatarUrl'] ?? json['avatar'],
      role: json['role'] ?? 'CUSTOMER',
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'mobile': mobile,
      'avatarUrl': avatarUrl,
      'role': role,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}
