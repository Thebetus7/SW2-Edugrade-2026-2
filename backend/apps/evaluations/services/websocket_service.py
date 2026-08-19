import logging
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

logger = logging.getLogger(__name__)

def broadcast_evaluation_event(event_type: str, submission_data: dict):
    try:
        channel_layer = get_channel_layer()
        if not channel_layer:
            logger.warning('No channel layer configured. Skipping broadcast.')
            return

        payload = {
            'type': 'exam_event',
            'event': event_type,
            'data': submission_data
        }

        async_to_sync(channel_layer.group_send)(
            'exams_live',
            payload
        )
        logger.info(f'WebSocket broadcast sent: {event_type} for submission ID {submission_data.get("id")}')
    except Exception as e:
        logger.error(f'Error broadcasting WebSocket message: {str(e)}', exc_info=True)
