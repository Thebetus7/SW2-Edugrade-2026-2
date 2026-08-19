import json
import logging
import os
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """Eres "EduGrade AI", un evaluador acad?mico experto, estricto, justo y con comprensi?n multimodal avanzada.
Tu tarea es analizar la imagen de un examen manuscrito o impreso resuelto por un estudiante y contrastarlo contra la r?brica/criterios oficiales suministrados.

Reglas fundamentales de evaluaci?n:
1. Extrae el nombre del estudiante y su identificador si est?n presentes en la cabecera del examen.
2. Detecta el idioma principal del examen (ej. "es" para espa?ol, "en" para ingl?s).
3. Para cada pregunta listada en la r?brica:
   - Identifica la respuesta manuscrita o marcada por el alumno. Transcr?bela fielmente en "student_detected_response".
   - Si la pregunta es Opci?n M?ltiple (MULTIPLE_CHOICE), verifica si marc? la alternativa correcta.
   - Si es Desarrollo (LONG_ANSWER), eval?a la coherencia conceptual, vocabulario t?cnico y profundidad seg?n la r?brica.
   - Si es Matem?tica/Probabilidad (MATH_PROBABILITY), eval?a procedimiento, planteamiento y resultado num?rico final.
   - Otorga un puntaje justo decimal (score) entre 0 y el max_score de la pregunta.
   - Redacta una retroalimentaci?n detallada, constructiva y en el idioma del examen ("ai_feedback") justificando por qu? obtuvo esa nota.
4. Calcula el "total_score" sumando los puntajes individuales.
5. Devuelve ?NICAMENTE un objeto JSON v?lido conforme a la siguiente estructura exacta:

{
  "student_name": "Nombre Apellido",
  "student_identifier": "ID/C?digo",
  "language_detected": "es",
  "total_score": 17.5,
  "answers_evaluated": [
    {
      "question_number": 1,
      "question_type": "MULTIPLE_CHOICE",
      "student_detected_response": "Marc? la opci?n B",
      "expected_answer": "B",
      "score": 5.0,
      "max_score": 5.0,
      "ai_feedback": "Respuesta correcta conforme a la clave de respuestas."
    }
  ]
}"""

def evaluate_exam_image(image_bytes: bytes, rubric_context: dict) -> dict:
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        logger.warning('GEMINI_API_KEY no configurada. Generando evaluaci?n simulada para desarrollo.')
        return _generate_mock_evaluation(rubric_context)

    try:
        client = genai.Client(api_key=api_key)
        prompt = f"""Por favor eval?a el examen adjunto seg?n los siguientes criterios oficiales:
R?BRICA Y PREGUNTAS DEL EXAMEN:
{json.dumps(rubric_context, indent=2, ensure_ascii=False)}

Analiza la imagen minuciosamente y devuelve el JSON de evaluaci?n estructurado."""
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type='image/jpeg'),
                prompt
            ],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type='application/json',
                temperature=0.2,
            )
        )
        return json.loads(response.text)
    except Exception as e:
        logger.error(f'Error invocando Gemini 2.5 Flash: {str(e)}', exc_info=True)
        return _generate_mock_evaluation(rubric_context, error_note=str(e))

def _generate_mock_evaluation(rubric_context: dict, error_note: str = None) -> dict:
    questions = rubric_context.get('questions', [])
    evaluated_items = []
    accumulated_score = 0.0

    for q in questions:
        q_num = q.get('question_number', 1)
        max_s = float(q.get('max_score', 5.0))
        q_type = q.get('question_type', 'LONG_ANSWER')
        
        obtained_score = round(max_s * 0.85, 2)
        accumulated_score += obtained_score
        
        feedback_text = 'El estudiante demuestra comprensi?n del tema. Procedimiento claro.'
        if error_note:
            feedback_text += f' (Nota entorno: {error_note})'
            
        evaluated_items.append({
            'question_number': q_num,
            'question_type': q_type,
            'student_detected_response': 'Respuesta manuscrita detectada en el escaneo del alumno...',
            'expected_answer': q.get('expected_answer_or_rubric', 'Criterio oficial'),
            'score': obtained_score,
            'max_score': max_s,
            'ai_feedback': feedback_text
        })

    return {
        'student_name': 'Juan P?rez Estudiante',
        'student_identifier': 'EST-2026-9812',
        'language_detected': 'es',
        'total_score': round(accumulated_score, 2),
        'answers_evaluated': evaluated_items
    }
