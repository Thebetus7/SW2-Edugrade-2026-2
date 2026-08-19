import 'package:flutter/material.dart';

class ScannerReticle extends StatefulWidget {
  const ScannerReticle({super.key});

  @override
  State<ScannerReticle> createState() => _ScannerReticleState();
}

class _ScannerReticleState extends State<ScannerReticle>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth * 0.85;
        final height = constraints.maxHeight * 0.72;

        return Stack(
          alignment: Alignment.center,
          children: [
            // Darkened background cutout
            ColorFiltered(
              colorFilter: ColorFilter.mode(
                Colors.black.withOpacity(0.55),
                BlendMode.srcOut,
              ),
              child: Stack(
                children: [
                  Container(
                    decoration: const BoxDecoration(
                      color: Colors.transparent,
                    ),
                    child: Container(
                      color: Colors.black,
                    ),
                  ),
                  Align(
                    alignment: Alignment.center,
                    child: Container(
                      width: width,
                      height: height,
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Visual bounding corners & scanner reticle
            Container(
              width: width,
              height: height,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: Colors.white.withOpacity(0.2),
                  width: 1.5,
                ),
              ),
              child: Stack(
                children: [
                  // Corner brackets
                  _buildCorner(Alignment.topLeft, true, true),
                  _buildCorner(Alignment.topRight, true, false),
                  _buildCorner(Alignment.bottomLeft, false, true),
                  _buildCorner(Alignment.bottomRight, false, false),

                  // Center pulsating scan laser
                  AnimatedBuilder(
                    animation: _animController,
                    builder: (context, child) {
                      return Positioned(
                        top: height * _animController.value,
                        left: 12,
                        right: 12,
                        child: Container(
                          height: 2.5,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [
                                Colors.transparent,
                                Color(0xFF6366F1),
                                Color(0xFF10B981),
                                Color(0xFF6366F1),
                                Colors.transparent,
                              ],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF6366F1).withOpacity(0.8),
                                blurRadius: 8,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),

            // Animated Status Badge Hook
            Positioned(
              top: (constraints.maxHeight - height) / 2 - 45,
              child: AnimatedBuilder(
                animation: _pulseAnimation,
                builder: (context, child) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withOpacity(0.9),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: const Color(0xFF6366F1).withOpacity(_pulseAnimation.value),
                        width: 1.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF6366F1).withOpacity(0.3 * _pulseAnimation.value),
                          blurRadius: 12,
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.auto_awesome, color: Color(0xFF818CF8), size: 16),
                        SizedBox(width: 8),
                        Text(
                          '[ IA: Detectando Examen y Texto ]',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildCorner(Alignment alignment, bool isTop, bool isLeft) {
    const size = 26.0;
    const thickness = 3.5;
    const color = Color(0xFF6366F1);

    return Align(
      alignment: alignment,
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          border: Border(
            top: isTop ? const BorderSide(color: color, width: thickness) : BorderSide.none,
            bottom: !isTop ? const BorderSide(color: color, width: thickness) : BorderSide.none,
            left: isLeft ? const BorderSide(color: color, width: thickness) : BorderSide.none,
            right: !isLeft ? const BorderSide(color: color, width: thickness) : BorderSide.none,
          ),
        ),
      ),
    );
  }
}
