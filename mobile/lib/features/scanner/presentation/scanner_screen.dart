import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import '../widgets/scanner_reticle.dart';
import '../data/scan_repository.dart';
import '../../websocket/presentation/live_status_widget.dart';
import '../../../core/auth/auth_service.dart';

class ScannerScreen extends StatefulWidget {
  final List<CameraDescription> cameras;

  const ScannerScreen({super.key, required this.cameras});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> with WidgetsBindingObserver {
  CameraController? _cameraController;
  final ScanRepository _scanRepo = ScanRepository();

  bool _isCameraInitialized = false;
  bool _isUploading = false;
  FlashMode _currentFlashMode = FlashMode.off;

  List<Map<String, dynamic>> _templates = [];
  int? _selectedTemplateId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _requestPermissionsAndInitCamera();
    _loadTemplates();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _cameraController?.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_cameraController == null || !_cameraController!.value.isInitialized) return;

    if (state == AppLifecycleState.inactive) {
      _cameraController?.dispose();
    } else if (state == AppLifecycleState.resumed) {
      _initializeCamera();
    }
  }

  Future<void> _requestPermissionsAndInitCamera() async {
    final status = await Permission.camera.request();
    if (status.isGranted) {
      await _initializeCamera();
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Se requiere permiso de c?mara para escanear ex?menes.'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  Future<void> _initializeCamera() async {
    if (widget.cameras.isEmpty) return;

    final controller = CameraController(
      widget.cameras[0],
      ResolutionPreset.high,
      enableAudio: false,
      imageFormatGroup: ImageFormatGroup.jpeg,
    );

    try {
      await controller.initialize();
      await controller.setFlashMode(_currentFlashMode);
      if (mounted) {
        setState(() {
          _cameraController = controller;
          _isCameraInitialized = true;
        });
      }
    } catch (e) {
      debugPrint('Error inicializando c?mara: $e');
    }
  }

  Future<void> _loadTemplates() async {
    final list = await _scanRepo.getActiveTemplates();
    if (mounted) {
      setState(() {
        _templates = list;
        if (list.isNotEmpty) {
          _selectedTemplateId = list[0]['id'];
        }
      });
    }
  }

  Future<void> _toggleFlash() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) return;

    FlashMode newMode;
    if (_currentFlashMode == FlashMode.off) {
      newMode = FlashMode.torch;
    } else {
      newMode = FlashMode.off;
    }

    try {
      await _cameraController!.setFlashMode(newMode);
      setState(() {
        _currentFlashMode = newMode;
      });
    } catch (e) {
      debugPrint('Error al cambiar flash: $e');
    }
  }

  Future<void> _captureAndUpload() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) return;
    if (_isUploading) return;

    if (_selectedTemplateId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor selecciona una plantilla de examen.'),
          backgroundColor: Colors.amber,
        ),
      );
      return;
    }

    setState(() {
      _isUploading = true;
    });

    try {
      final XFile photo = await _cameraController!.takePicture();
      final File imageFile = File(photo.path);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Row(
              children: [
                SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                ),
                SizedBox(width: 12),
                Text('Enviando a Gemini 2.5 Flash para evaluaci?n...'),
              ],
            ),
            duration: Duration(seconds: 4),
            backgroundColor: Color(0xFF4F46E5),
          ),
        );
      }

      final result = await _scanRepo.uploadExamScan(
        imageFile: imageFile,
        examTemplateId: _selectedTemplateId!,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    '?Examen #${result['id']} calificado! Total: ${result['total_score']} pts.',
                  ),
                ),
              ],
            ),
            backgroundColor: const Color(0xFF10B981),
            duration: const Duration(seconds: 5),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error enviando escaneo: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isUploading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_isCameraInitialized || _cameraController == null) {
      return const Scaffold(
        backgroundColor: Color(0xFF0F172A),
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CircularProgressIndicator(color: Color(0xFF6366F1)),
              SizedBox(height: 16),
              Text(
                'Iniciando c?mara y sensor de encuadre...',
                style: TextStyle(color: Colors.white70, fontSize: 13),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Live Camera Preview
          CameraPreview(_cameraController!),

          // 2. Visual AI Bounding Box & Scanner Reticle Overlay
          const ScannerReticle(),

          // 3. Top Controls Bar
          SafeArea(
            child: Align(
              alignment: Alignment.topCenter,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Flash Toggle Button
                    IconButton(
                      onPressed: _toggleFlash,
                      icon: Icon(
                        _currentFlashMode == FlashMode.off
                            ? Icons.flash_off
                            : Icons.flash_on,
                        color: Colors.white,
                      ),
                      style: IconButton.styleFrom(
                        backgroundColor: const Color(0xFF0F172A).withOpacity(0.8),
                      ),
                    ),

                    // WebSocket Connection Live Status
                    const LiveStatusWidget(isConnected: true),

                    // Logout / User Role Button
                    IconButton(
                      onPressed: () {
                        AuthService().logout();
                        Navigator.of(context).pop();
                      },
                      icon: const Icon(Icons.logout, color: Colors.redAccent),
                      tooltip: 'Cerrar sesión',
                      style: IconButton.styleFrom(
                        backgroundColor: const Color(0xFF0F172A).withOpacity(0.8),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 4. Bottom Controls: Template Selector & Capture Button
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 36),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withOpacity(0.85),
                    Colors.black,
                  ],
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Exam Template Dropdown Picker
                  if (_templates.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      margin: const EdgeInsets.only(bottom: 20),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B).withOpacity(0.9),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF475569)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<int>(
                          value: _selectedTemplateId,
                          dropdownColor: const Color(0xFF1E293B),
                          isExpanded: true,
                          icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFF818CF8)),
                          style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                          items: _templates.map((tpl) {
                            return DropdownMenuItem<int>(
                              value: tpl['id'] as int,
                              child: Text(
                                '${tpl['title']} (${tpl['course_name'] ?? 'General'})',
                                overflow: TextOverflow.ellipsis,
                              ),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              setState(() {
                                _selectedTemplateId = val;
                              });
                            }
                          },
                        ),
                      ),
                    ),

                  // Floating Capture Action Button ("Capturar y Enviar")
                  GestureDetector(
                    onTap: _isUploading ? null : _captureAndUpload,
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF6366F1),
                        border: Border.all(color: Colors.white, width: 4),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF6366F1).withOpacity(0.5),
                            blurRadius: 20,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Center(
                        child: _isUploading
                            ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 3)
                            : const Icon(Icons.camera_alt, color: Colors.white, size: 36),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    _isUploading ? 'Evaluando con IA...' : 'Tocar para Capturar y Enviar',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
