import json
from django.contrib.auth.models import User
from .nlp import parse_message
from ..models import Transaction

def handle_webhook(payload):
    """
    Processes the WhatsApp webhook payload.
    """
    try:
        print(f"DEBUG PAYLOAD: {payload}")
        # Basic Meta API structure extraction
        entry = payload.get('entry', [])[0]
        changes = entry.get('changes', [])[0]
        value = changes.get('value', {})
        messages = value.get('messages', [])
        
        if not messages:
            return "No messages found"

        message = messages[0]
        if message.get('type') != 'text':
            return "Not a text message"

        text = message.get('text', {}).get('body', '')
        if not text:
            return "Empty text"

        # Parse content
        data = parse_message(text)
        if not data:
            return "Could not parse transaction"

        # Create Transaction
        # TODO: Identify user by phone number (using default for now)
        user = User.objects.first() 
        if not user:
            return "No user found"

        Transaction.objects.create(
            user=user,
            amount=data['amount'],
            description=data['description'],
            type=data['type'],
            source='WHATSAPP'
        )
        
        return "Transaction created"

    except Exception as e:
        print(f"Error processing webhook: {e}")
        return f"Error: {e}"
