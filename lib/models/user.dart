class User {
  final String id;
  final String name;
  final String email;
  final String role;
  final String token;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.token = '',
  });

  factory User.fromJson(Map<String, dynamic> json, {String token = ''}) {
    return User(
      id: json['id']?.toString() ?? json['userId']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Valued Patron',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? 'CUSTOMER',
      token: token.isNotEmpty ? token : (json['token']?.toString() ?? json['accessToken']?.toString() ?? ''),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'token': token,
    };
  }

  bool get isAdmin => role == 'ADMIN' || role == 'SUPER_ADMIN';
}

