import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import '../network/dio_client.dart';

enum UserRole { admin, teacher, student }

class UserModel {
  final int id;
  final String username;
  final String fullName;
  final String email;
  final UserRole role;
  final String title;
  final String badgeLabel;
  final String? studentIdentifier;
  final String? token;

  UserModel({
    required this.id,
    required this.username,
    required this.fullName,
    required this.email,
    required this.role,
    required this.title,
    required this.badgeLabel,
    this.studentIdentifier,
    this.token,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    UserRole roleEnum = UserRole.student;
    final r = (json['role'] ?? '').toString().toUpperCase();
    if (r == 'ADMIN') {
      roleEnum = UserRole.admin;
    } else if (r == 'TEACHER') {
      roleEnum = UserRole.teacher;
    }

    return UserModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 1,
      username: json['username'] ?? '',
      fullName: json['full_name'] ?? json['username'] ?? 'Usuario',
      email: json['email'] ?? '',
      role: roleEnum,
      title: json['title'] ?? '',
      badgeLabel: json['badge_label'] ?? json['role'] ?? 'Usuario',
      studentIdentifier: json['student_identifier'],
      token: json['token'],
    );
  }
}

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  UserModel? _currentUser;
  UserModel? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;

  final Dio _dio = DioClient().dio;

  Future<Map<String, dynamic>> checkHealth() async {
    final startTime = DateTime.now();
    try {
      final response = await _dio.get(
        '${ApiConstants.baseUrl}/core/health/',
        options: Options(receiveTimeout: const Duration(seconds: 4)),
      );
      final latency = DateTime.now().difference(startTime).inMilliseconds;
      return {
        'status': 'healthy',
        'server_url': ApiConstants.baseUrl,
        'latency_ms': latency,
        'data': response.data,
      };
    } catch (e) {
      final latency = DateTime.now().difference(startTime).inMilliseconds;
      return {
        'status': 'error',
        'server_url': ApiConstants.baseUrl,
        'latency_ms': latency,
        'error': e.toString(),
      };
    }
  }

  Future<UserModel> quickLogin(UserRole role) async {
    String roleStr = 'STUDENT';
    if (role == UserRole.admin) roleStr = 'ADMIN';
    if (role == UserRole.teacher) roleStr = 'TEACHER';

    try {
      final response = await _dio.post(
        '${ApiConstants.baseUrl}/core/auth/quick-login/',
        data: {'role': roleStr},
      );
      _currentUser = UserModel.fromJson(response.data['user']);
      return _currentUser!;
    } catch (e) {
      debugPrint('Error en quickLogin de API, usando perfil local fallback: $e');
      if (role == UserRole.admin) {
        _currentUser = UserModel(
          id: 1,
          username: 'admin',
          fullName: 'Administrador del Sistema',
          email: 'admin@edugrade.ai',
          role: UserRole.admin,
          title: 'Administrador TI',
          badgeLabel: 'Administrador',
          token: 'mock-admin-token',
        );
      } else if (role == UserRole.teacher) {
        _currentUser = UserModel(
          id: 2,
          username: 'profesor',
          fullName: 'Prof. Carlos Mendoza',
          email: 'carlos.mendoza@universidad.edu',
          role: UserRole.teacher,
          title: 'Docente Titular',
          badgeLabel: 'Profesor',
          token: 'mock-teacher-token',
        );
      } else {
        _currentUser = UserModel(
          id: 3,
          username: 'estudiante',
          fullName: 'María Rodríguez',
          studentIdentifier: 'EST-2026-8841',
          email: 'mrodriguez@alumno.universidad.edu',
          role: UserRole.student,
          title: 'Estudiante Regular',
          badgeLabel: 'Estudiante',
          token: 'mock-student-token',
        );
      }
      return _currentUser!;
    }
  }

  void logout() {
    _currentUser = null;
  }
}
