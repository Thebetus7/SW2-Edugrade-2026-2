import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/presentation/login_screen.dart';

List<CameraDescription> cameras = [];

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock orientation to Portrait for scanner precision
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  try {
    cameras = await availableCameras();
  } on CameraException catch (e) {
    debugPrint('Error obteniendo camaras del dispositivo: ${e.description}');
  }

  runApp(const EduGradeApp());
}

class EduGradeApp extends StatelessWidget {
  const EduGradeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EduGrade AI Scanner',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: LoginScreen(cameras: cameras),
    );
  }
}

