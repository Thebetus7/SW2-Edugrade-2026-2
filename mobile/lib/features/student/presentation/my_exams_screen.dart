import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../core/auth/auth_service.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/theme/app_theme.dart';
import '../../scanner/presentation/scanner_screen.dart';

class MyExamsScreen extends StatefulWidget {
  final List<CameraDescription> cameras;
  const MyExamsScreen({super.key, required this.cameras});

  @override
  State<MyExamsScreen> createState() => _MyExamsScreenState();
}

class _MyExamsScreenState extends State<MyExamsScreen> {
  final AuthService _authService = AuthService();
  final Dio _dio = DioClient().dio;
  bool _isLoading = true;
  List<dynamic> _submissions = [];

  @override
  void initState() {
    super.initState();
    _loadMyExams();
  }

  Future<void> _loadMyExams() async {
    setState(() => _isLoading = true);
    try {
      final user = _authService.currentUser;
      final queryParams = <String, dynamic>{};
      if (user?.role == UserRole.student && user?.studentIdentifier != null) {
        queryParams['student_identifier'] = user!.studentIdentifier;
      }
      final response = await _dio.get(
        '${ApiConstants.baseUrl}/evaluations/submissions/',
        queryParameters: queryParams,
      );
      final results = response.data is List
          ? response.data
          : (response.data['results'] ?? []);
      setState(() {
        _submissions = results;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error cargando examenes del alumno: $e');
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = _authService.currentUser;

    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Mis Exámenes',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            Text(
              user?.fullName ?? 'Estudiante',
              style: const TextStyle(fontSize: 12, color: Colors.white70),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppTheme.primaryColor),
            onPressed: _loadMyExams,
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.redAccent),
            onPressed: () {
              _authService.logout();
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppTheme.primaryColor,
        icon: const Icon(Icons.camera_alt, color: Colors.white),
        label: const Text('Escanear Hoja', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => ScannerScreen(cameras: widget.cameras),
            ),
          );
        },
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppTheme.primaryColor),
            )
          : _submissions.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.assignment_outlined, size: 64, color: Colors.white30),
                        const SizedBox(height: 16),
                        const Text(
                          'No hay evaluaciones registradas aún',
                          style: TextStyle(color: Colors.white70, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Usa el botón de abajo para capturar y enviar tu hoja de examen para corrección con Gemini IA.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white38, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _submissions.length,
                  itemBuilder: (context, index) {
                    final sub = _submissions[index];
                    final score = double.tryParse(sub['total_score']?.toString() ?? '0') ?? 0;
                    final maxScore = double.tryParse(sub['total_max_score']?.toString() ?? '20') ?? 20;
                    final status = sub['status'] ?? 'PENDING';
                    final isPassed = (score / (maxScore == 0 ? 1 : maxScore)) >= 0.55;

                    return Card(
                      color: AppTheme.cardColor,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: BorderSide(
                          color: isPassed
                              ? Colors.greenAccent.withOpacity(0.3)
                              : Colors.redAccent.withOpacity(0.3),
                        ),
                      ),
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ExpansionTile(
                        leading: CircleAvatar(
                          backgroundColor: isPassed
                              ? Colors.green.withOpacity(0.2)
                              : Colors.red.withOpacity(0.2),
                          child: Text(
                            score.toStringAsFixed(1),
                            style: TextStyle(
                              color: isPassed ? Colors.greenAccent : Colors.redAccent,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        title: Text(
                          sub['exam_title'] ?? 'Examen',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        subtitle: Text(
                          '${sub['course_name'] ?? 'Curso'} • Máx: ${maxScore.toStringAsFixed(0)} pts',
                          style: const TextStyle(fontSize: 12, color: Colors.white60),
                        ),
                        trailing: Chip(
                          label: Text(
                            status == 'REVIEWED'
                                ? 'Revisado'
                                : status == 'GRADED'
                                ? 'Evaluado IA'
                                : 'Pendiente',
                            style: const TextStyle(fontSize: 10, color: Colors.white),
                          ),
                          backgroundColor: status == 'GRADED'
                              ? Colors.purple.withOpacity(0.6)
                              : Colors.indigo.withOpacity(0.6),
                        ),
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Desglose por Preguntas (Gemini 2.5 Flash):',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                    color: AppTheme.accentColor,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                ...((sub['graded_items'] as List<dynamic>? ?? []).map((item) {
                                  return Container(
                                    margin: const EdgeInsets.only(bottom: 8),
                                    padding: const EdgeInsets.all(10),
                                    decoration: BoxDecoration(
                                      color: Colors.black26,
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(color: Colors.white.withOpacity(0.08)),
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              'Pregunta #${item['question_number']}',
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                color: Colors.white,
                                                fontSize: 12,
                                              ),
                                            ),
                                            Text(
                                              '${item['score']} / ${item['max_score']} pts',
                                              style: const TextStyle(
                                                color: Colors.greenAccent,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12,
                                              ),
                                            ),
                                          ],
                                        ),
                                        if (item['ai_feedback'] != null &&
                                            item['ai_feedback'].toString().isNotEmpty) ...[
                                          const SizedBox(height: 4),
                                          Text(
                                            item['ai_feedback'].toString(),
                                            style: const TextStyle(
                                              color: Colors.white70,
                                              fontSize: 11,
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                  );
                                })),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}
