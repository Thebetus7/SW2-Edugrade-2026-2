import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)

class ExamLiveConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "exams_live"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        logger.info(f"WebSocket client connected to group {self.group_name}")
        await self.send(text_data=json.dumps({
            "type": "connection_established",
            "message": "Conectado al canal en tiempo real de EduGrade AI"
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        logger.info(f"WebSocket client disconnected with code {close_code}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            if data.get("action") == "ping":
                await self.send(text_data=json.dumps({"type": "pong"}))
        except Exception as e:
            logger.error(f"Error parsing incoming WebSocket message: {str(e)}")

    async def exam_event(self, event):
        await self.send(text_data=json.dumps({
            "event": event.get("event"),
            "data": event.get("data")
        }))
