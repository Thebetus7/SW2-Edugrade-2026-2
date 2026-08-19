import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import '../../../core/auth/auth_service.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/theme/app_theme.dart';
import '../../scanner/presentation/scanner_screen.dart';
import '../../student/presentation/my_exams_screen.dart';

class LoginScreen extends StatefulWidget {
  final List<CameraDescription> cameras;
  const LoginScreen({super.key, required this.cameras});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final AuthService _authService = AuthService();
  bool _isCheckingServer = true;
  bool _isServerOnline = false;
  int? _latencyMs;
  bool _isLoggingIn = false;

  @override
  void initState() {
    super.initState();
    _checkServer();
  }

  Future<void> _checkServer() async {
    setState(() => _isCheckingServer = true);
    final res = await _authService.checkHealth();
    if (mounted) {
      setState(() {
        _isServerOnline = res['status'] == 'healthy';
        _latencyMs = res['latency_ms'];
        _isCheckingServer = false;
      });
    }
  }

  Future<void> _handleQuickLogin(UserRole role) async {
    setState(() => _isLoggingIn = true);
    try {
      await _authService.quickLogin(role);
      if (!mounted) return;

      if (role == UserRole.student) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => MyExamsScreen(cameras: widget.cameras),
          ),
        );
      } else {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => ScannerScreen(cameras: widget.cameras),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al iniciar sesión: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoggingIn = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Logo & Header
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withOpacity(0.15),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppTheme.primaryColor.withOpacity(0.4)),
                    ),
                    child: const Icon(
                      Icons.auto_awesome,
                      size: 48,
                      color: AppTheme.primaryColor,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                const Text(
                  'EduGrade AI',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Scanner & Corrección Multimodal (Gemini 2.5 Flash)',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white60,
                  ),
                ),
                const SizedBox(height: 28),

                // Real-time Server Connection Status Card
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: _isServerOnline
                        ? Colors.green.withOpacity(0.12)
                        : Colors.red.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: _isServerOnline
                          ? Colors.greenAccent.withOpacity(0.4)
                          : Colors.redAccent.withOpacity(0.4),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 10,
                                height: 10,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: _isServerOnline
                                      ? Colors.greenAccent
                                      : (_isCheckingServer ? Colors.amber : Colors.redAccent),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                _isCheckingServer
                                    ? 'Verificando servidor...'
                                    : _isServerOnline
                                    ? 'Servidor Conectado'
                                    : 'Servidor Desconectado',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                  color: _isServerOnline ? Colors.greenAccent : Colors.redAccent,
                                ),
                              ),
                              if (_latencyMs != null && _isServerOnline) ...[
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.black38,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    '${_latencyMs}ms',
                                    style: const TextStyle(fontSize: 10, color: Colors.greenAccent),
                                  ),
                                ),
                              ],
                            ],
                          ),
                          IconButton(
                            icon: const Icon(Icons.refresh, size: 18, color: Colors.white70),
                            onPressed: _checkServer,
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'URL: ${ApiConstants.baseUrl}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontFamily: 'monospace',
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 28),
                const Text(
                  'ACCESO RÁPIDO POR ROL',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                    color: Colors.white54,
                  ),
                ),
                const SizedBox(height: 12),

                // 1. Boton Administrador
                _buildRoleCard(
                  title: 'Administrador',
                  subtitle: 'Acceso total y configuración',
                  icon: Icons.admin_panel_settings,
                  role: UserRole.admin,
                  accentColor: Colors.indigoAccent,
                ),
                const SizedBox(height: 10),

                // 2. Boton Profesor
                _buildRoleCard(
                  title: 'Profesor Titular',
                  subtitle: 'Escaneo y evaluación de exámenes',
                  icon: Icons.school,
                  role: UserRole.teacher,
                  accentColor: Colors.tealAccent,
                ),
                const SizedBox(height: 10),

                // 3. Boton Estudiante
                _buildRoleCard(
                  title: 'Estudiante',
                  subtitle: 'Consulta de notas y rúbricas',
                  icon: Icons.person,
                  role: UserRole.student,
                  accentColor: Colors.purpleAccent,
                ),

                if (_isLoggingIn) ...[
                  const SizedBox(height: 20),
                  const Center(
                    child: CircularProgressIndicator(color: AppTheme.primaryColor),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRoleCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required UserRole role,
    required Color accentColor,
  }) {
    return InkWell(
      onTap: _isLoggingIn ? null : () => _handleQuickLogin(role),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppTheme.cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: accentColor.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: accentColor, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Colors.white60,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 14, color: Colors.white.withOpacity(0.3)),
          ],
        ),
      ),
    );
  }
}
