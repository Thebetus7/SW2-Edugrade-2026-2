import 'dart:io';

class ApiConstants {
  // Android Emulator uses 10.0.2.2 to access the host PC localhost.
  // iOS Simulator uses localhost or 127.0.0.1.
  // Physical devices use your computer local network IP (e.g., http://192.168.1.50:8000).
  static String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8000/api';
    } else {
      return 'http://localhost:8000/api';
    }
  }

  static String get wsUrl {
    if (Platform.isAndroid) {
      return 'ws://10.0.2.2:8000/ws/exams/live/';
    } else {
      return 'ws://localhost:8000/ws/exams/live/';
    }
  }

  static const String uploadExamEndpoint = '/evaluations/submissions/upload/';
  static const String templatesEndpoint = '/exams/templates/';
}
