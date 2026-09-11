import asyncio

class NotificationService:
    @staticmethod
    async def send_token_alert(phone: str, token_number: str, wait_mins: int, channel: str = "SMS"):
        # Simulated SMS / WhatsApp notification dispatcher
        msg = f"SmartCare OPD Alert: Your token {token_number} is estimated in ~{wait_mins} mins. Please be near the waiting room."
        print(f"[{channel} to {phone}] {msg}")
        return {"status": "sent", "channel": channel, "recipient": phone}

    @staticmethod
    async def send_call_alert(phone: str, token_number: str, room: str):
        msg = f"🚨 SmartCare Turn Alert: Token {token_number} - Please proceed to Room {room} now!"
        print(f"[WHATSAPP to {phone}] {msg}")
        return {"status": "sent", "recipient": phone}
