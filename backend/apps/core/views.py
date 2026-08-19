from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import uuid

# Perfiles de usuarios preconfigurados para acceso rápido
DEMO_PROFILES = {
    'ADMIN': {
        'id': 1,
        'username': 'admin',
        'full_name': 'Administrador del Sistema',
        'email': 'admin@edugrade.ai',
        'role': 'ADMIN',
        'title': 'Superusuario / Administrador TI',
        'badge_label': 'Administrador',
        'default_route': '/',
        'permissions': ['all', 'view_dashboard', 'manage_exams', 'view_all_submissions'],
    },
    'TEACHER': {
        'id': 2,
        'username': 'profesor',
        'full_name': 'Prof. Carlos Mendoza',
        'email': 'carlos.mendoza@universidad.edu',
        'role': 'TEACHER',
        'title': 'Docente Titular de Ciencias de la Computación',
        'badge_label': 'Profesor',
        'default_route': '/exams',
        'permissions': ['manage_exams', 'grade_submissions', 'view_course_submissions'],
    },
    'STUDENT': {
        'id': 3,
        'username': 'estudiante',
        'full_name': 'María Rodríguez',
        'student_identifier': 'EST-2026-8841',
        'email': 'mrodriguez@alumno.universidad.edu',
        'role': 'STUDENT',
        'title': 'Estudiante Regular',
        'badge_label': 'Estudiante',
        'default_route': '/my-exams',
        'permissions': ['view_my_submissions'],
    }
}

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Comprobación de estado y conectividad del servidor en tiempo real.
    """
    server_base = request.build_absolute_uri('/api')
    return Response({
        'status': 'healthy',
        'service': 'EduGrade AI Backend API',
        'server_url': server_base,
        'timestamp': timezone.now().isoformat(),
        'version': '1.0.0',
        'websocket_url': server_base.replace('http://', 'ws://').replace('https://', 'wss://').replace('/api', '/ws/exams/live/'),
        'environment': 'development',
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_demo_users(request):
    """
    Devuelve los 3 perfiles disponibles para acceso rápido.
    """
    return Response(list(DEMO_PROFILES.values()), status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def quick_login(request):
    """
    Acceso rápido por rol: ADMIN, TEACHER o STUDENT.
    """
    role = request.data.get('role', '').upper()
    if role not in DEMO_PROFILES:
        return Response(
            {'error': f'Rol inválido. Opciones disponibles: {list(DEMO_PROFILES.keys())}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user_info = DEMO_PROFILES[role].copy()
    user_info['token'] = f'mock-token-{role.lower()}-{uuid.uuid4().hex[:12]}'
    user_info['logged_at'] = timezone.now().isoformat()

    return Response({
        'message': f'Sesión iniciada con éxito como {user_info["full_name"]}',
        'user': user_info,
        'token': user_info['token']
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Autenticación tradicional por usuario y contraseña.
    """
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    # Mapeo directo para los usuarios demo o verificación estándar
    matched_role = None
    for r, data in DEMO_PROFILES.items():
        if data['username'].lower() == username.lower() or data['email'].lower() == username.lower():
            matched_role = r
            break

    if matched_role:
        user_info = DEMO_PROFILES[matched_role].copy()
        user_info['token'] = f'mock-token-{matched_role.lower()}-{uuid.uuid4().hex[:12]}'
        user_info['logged_at'] = timezone.now().isoformat()
        return Response({
            'message': f'Bienvenido {user_info["full_name"]}',
            'user': user_info,
            'token': user_info['token']
        }, status=status.HTTP_200_OK)

    # Si se pasa cualquier otro usuario de prueba
    if username:
        user_info = {
            'id': 99,
            'username': username,
            'full_name': username.capitalize(),
            'email': f'{username}@edugrade.ai',
            'role': 'STUDENT',
            'title': 'Usuario Registrado',
            'badge_label': 'Estudiante',
            'default_route': '/my-exams',
            'permissions': ['view_my_submissions'],
            'token': f'mock-token-custom-{uuid.uuid4().hex[:12]}',
            'logged_at': timezone.now().isoformat()
        }
        return Response({
            'message': f'Bienvenido {user_info["full_name"]}',
            'user': user_info,
            'token': user_info['token']
        }, status=status.HTTP_200_OK)

    return Response(
        {'error': 'Credenciales requeridas.'},
        status=status.HTTP_400_BAD_REQUEST
    )
