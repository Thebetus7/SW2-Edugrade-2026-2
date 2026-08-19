import 'dart:io';

class ApiConstants {
  // IP local de tu PC en la red Wi-Fi (para celular físico)
  // Usar 10.0.2.2 solo si usas el emulador de Android Studio.
  static const String _hostIp = '192.168.1.100';

  static String get baseUrl => 'http://$_hostIp:8000/api';

  static String get wsUrl => 'ws://$_hostIp:8000/ws/exams/live/';

  static const String uploadExamEndpoint = '/evaluations/submissions/upload/';
  static const String templatesEndpoint = '/exams/templates/';
}
