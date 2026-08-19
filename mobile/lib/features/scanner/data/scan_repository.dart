import 'dart:io';
import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/network/dio_client.dart';

class ScanRepository {
  final Dio _dio = DioClient().dio;

  Future<List<Map<String, dynamic>>> getActiveTemplates() async {
    try {
      final response = await _dio.get(ApiConstants.templatesEndpoint);
      if (response.data is Map && response.data['results'] != null) {
        return List<Map<String, dynamic>>.from(response.data['results']);
      } else if (response.data is List) {
        return List<Map<String, dynamic>>.from(response.data);
      }
      return [];
    } catch (e) {
      // Fallback sample template if server is not yet populated
      return [
        {
          'id': 1,
          'title': 'Examen Parcial I (Matematicas/Calculo)',
          'course_name': 'Calculo Diferencial e Integral',
          'total_max_score': '20.00'
        }
      ];
    }
  }

  Future<Map<String, dynamic>> uploadExamScan({
    required File imageFile,
    required int examTemplateId,
  }) async {
    final fileName = imageFile.path.split('/').last;

    final formData = FormData.fromMap({
      'exam_template_id': examTemplateId,
      'exam_image': await MultipartFile.fromFile(
        imageFile.path,
        filename: fileName,
        contentType: MediaType('image', 'jpeg'),
      ),
    });

    final response = await _dio.post(
      ApiConstants.uploadExamEndpoint,
      data: formData,
    );

    return Map<String, dynamic>.from(response.data);
  }
}
