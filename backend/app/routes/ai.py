from flask import Blueprint, request, jsonify, session, current_app, Response, stream_with_context
import json
import uuid
from app.models import db, ChatHistory, Conversation, ChatMessage
from app.services.ai_manager import AIManager
from app.services.grok_service import GrokService
from app.services.ollama_service import OllamaService

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

@ai_bp.route('/status', methods=['GET'])
def ai_status():
    """Return live status of Grok API and Ollama local server."""
    catalog = AIManager.get_models_catalog()
    return jsonify({
        'xai_grok': {
            'configured': catalog['grok_configured'],
            'model': current_app.config.get('XAI_MODEL', 'grok-3-mini'),
            'provider': 'Official xAI Grok API'
        },
        'ollama': {
            'online': catalog['ollama_online'],
            'base_url': catalog['ollama_base_url'],
            'installed_count': catalog['installed_count']
        },
        'active_primary_engine': 'xAI Grok' if catalog['grok_configured'] else ('Ollama Local' if catalog['ollama_online'] else 'Offline Smart Engine')
    }), 200

@ai_bp.route('/models', methods=['GET'])
def get_models():
    """Get all available models across Grok, Ollama, and Auto mode."""
    catalog = AIManager.get_models_catalog()
    return jsonify(catalog), 200

@ai_bp.route('/pull', methods=['POST'])
def pull_model():
    """Trigger Ollama model download."""
    data = request.get_json() or {}
    model_name = data.get('model_name', '').strip()
    if not model_name:
        return jsonify({'error': 'Model name is required (e.g., llama3.2:3b)'}), 400

    result = OllamaService.pull_model(model_name)
    return jsonify(result), 200 if result.get('success') else 500

# ==========================================
# CONVERSATIONS MANAGEMENT (ChatGPT Style)
# ==========================================

@ai_bp.route('/conversations', methods=['GET'])
def get_conversations():
    """Get conversation sessions for current user or session."""
    user_id = session.get('user_id') or request.args.get('user_id')
    module_context = request.args.get('module')

    query = Conversation.query
    if user_id:
        query = query.filter_by(user_id=user_id)
    if module_context and module_context != 'general':
        query = query.filter_by(module_context=module_context)

    conversations = query.order_by(Conversation.updated_at.desc()).limit(50).all()
    return jsonify({
        'conversations': [c.to_dict(include_messages=False) for c in conversations]
    }), 200

@ai_bp.route('/conversations', methods=['POST'])
def create_conversation():
    """Create a new chat conversation thread."""
    data = request.get_json() or {}
    user_id = session.get('user_id') or data.get('user_id')
    title = data.get('title', 'New Chat').strip()
    module_context = data.get('module_context', 'general')
    model = data.get('model', 'auto')
    provider = data.get('provider', 'auto')

    conv = Conversation(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=title,
        module_context=module_context,
        model=model,
        provider=provider
    )
    db.session.add(conv)
    db.session.commit()

    return jsonify({'conversation': conv.to_dict(include_messages=True)}), 201

@ai_bp.route('/conversations/<string:conv_id>', methods=['GET'])
def get_conversation(conv_id):
    """Retrieve full conversation and its message history."""
    conv = Conversation.query.get(conv_id)
    if not conv:
        return jsonify({'error': 'Conversation not found'}), 404
    return jsonify({'conversation': conv.to_dict(include_messages=True)}), 200

@ai_bp.route('/conversations/<string:conv_id>', methods=['DELETE'])
def delete_conversation(conv_id):
    """Delete a conversation thread and all its messages."""
    conv = Conversation.query.get(conv_id)
    if not conv:
        return jsonify({'error': 'Conversation not found'}), 404
    db.session.delete(conv)
    db.session.commit()
    return jsonify({'message': 'Conversation deleted successfully.'}), 200

@ai_bp.route('/conversations/<string:conv_id>/clear', methods=['POST'])
def clear_conversation(conv_id):
    """Clear all messages inside a conversation thread."""
    conv = Conversation.query.get(conv_id)
    if not conv:
        return jsonify({'error': 'Conversation not found'}), 404
    ChatMessage.query.filter_by(conversation_id=conv_id).delete()
    db.session.commit()
    return jsonify({'message': 'Conversation cleared successfully.'}), 200

# ==========================================
# CHAT ENDPOINTS (Synchronous & Streaming)
# ==========================================

@ai_bp.route('/chat', methods=['POST'])
def chat():
    """Non-streaming chat endpoint."""
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    module_context = data.get('module_context', 'general')
    history = data.get('history', [])
    user_id = session.get('user_id') or data.get('user_id')
    selected_model = data.get('selected_model') or data.get('model', 'auto')
    conversation_id = data.get('conversation_id')

    if not message:
        return jsonify({'error': 'Message content cannot be empty.'}), 400

    result = AIManager.chat_sync(
        user_message=message,
        model_id=selected_model,
        history=history,
        module_context=module_context
    )

    ai_text = result.get('response', '')

    # Save to Conversation if conversation_id is provided
    try:
        if conversation_id:
            conv = Conversation.query.get(conversation_id)
            if conv:
                # Add user message
                db.session.add(ChatMessage(
                    conversation_id=conversation_id,
                    role='user',
                    content=message
                ))
                # Add assistant message
                db.session.add(ChatMessage(
                    conversation_id=conversation_id,
                    role='assistant',
                    content=ai_text,
                    model=result.get('model'),
                    provider=result.get('provider')
                ))
                # Set title if it is the first exchange
                if conv.title == 'New Chat' or not conv.title:
                    first_line = message.split('\n')[0][:40]
                    conv.title = first_line if first_line else 'Chat'
                db.session.commit()

        # Also save to legacy ChatHistory table
        chat_record = ChatHistory(
            user_id=user_id,
            module_context=module_context,
            user_message=message,
            ai_response=ai_text
        )
        db.session.add(chat_record)
        db.session.commit()
    except Exception as e:
        db.session.rollback()

    return jsonify({
        'success': True,
        'response': ai_text,
        'model': result.get('model', 'AI Assistant'),
        'provider': result.get('provider', 'Intelligent Assistant'),
        'context': module_context,
        'conversation_id': conversation_id,
        'fallback': result.get('fallback', False)
    }), 200

@ai_bp.route('/chat/stream', methods=['POST'])
def chat_stream():
    """
    Streaming SSE chat completion.
    Yields events: `data: {"chunk": "...", "done": false, "model": "...", "provider": "..."}\n\n`
    """
    data = request.get_json() or {}
    message = data.get('message', '').strip()
    module_context = data.get('module_context', 'general')
    history = data.get('history', [])
    user_id = session.get('user_id') or data.get('user_id')
    selected_model = data.get('selected_model') or data.get('model', 'auto')
    conversation_id = data.get('conversation_id')

    if not message:
        return jsonify({'error': 'Message content cannot be empty.'}), 400

    def generate():
        collected_response = []
        final_model = selected_model
        final_provider = 'System'

        try:
            generator = AIManager.chat_stream(
                user_message=message,
                model_id=selected_model,
                history=history,
                module_context=module_context
            )

            for item in generator:
                chunk = item.get('chunk', '')
                done = item.get('done', False)
                if chunk:
                    collected_response.append(chunk)
                if item.get('model'):
                    final_model = item.get('model')
                if item.get('provider'):
                    final_provider = item.get('provider')

                payload = {
                    'chunk': chunk,
                    'done': done,
                    'model': final_model,
                    'provider': final_provider,
                    'conversation_id': conversation_id
                }
                yield f"data: {json.dumps(payload)}\n\n"

            # Finalize and persist full assistant response
            full_text = "".join(collected_response).strip()
            if conversation_id and full_text:
                try:
                    conv = Conversation.query.get(conversation_id)
                    if conv:
                        db.session.add(ChatMessage(
                            conversation_id=conversation_id,
                            role='user',
                            content=message
                        ))
                        db.session.add(ChatMessage(
                            conversation_id=conversation_id,
                            role='assistant',
                            content=full_text,
                            model=final_model,
                            provider=final_provider
                        ))
                        if conv.title == 'New Chat' or not conv.title:
                            conv.title = message.split('\n')[0][:40]
                        db.session.commit()
                except Exception:
                    db.session.rollback()

            # Record in ChatHistory
            if full_text:
                try:
                    db.session.add(ChatHistory(
                        user_id=user_id,
                        module_context=module_context,
                        user_message=message,
                        ai_response=full_text
                    ))
                    db.session.commit()
                except Exception:
                    db.session.rollback()

        except Exception as e:
            err_payload = {
                'error': True,
                'message': str(e),
                'done': True
            }
            yield f"data: {json.dumps(err_payload)}\n\n"

    return Response(stream_with_context(generate()), mimetype='text/event-stream')

# ==========================================
# LEGACY HISTORY ENDPOINTS (Backward Compatibility)
# ==========================================

@ai_bp.route('/history', methods=['GET'])
def get_history():
    user_id = request.args.get('user_id')
    module_context = request.args.get('module')

    query = ChatHistory.query
    if user_id:
        query = query.filter_by(user_id=user_id)
    if module_context and module_context != 'general':
        query = query.filter_by(module_context=module_context)

    records = query.order_by(ChatHistory.created_at.asc()).limit(30).all()
    return jsonify({
        'messages': [r.to_dict() for r in records]
    }), 200

@ai_bp.route('/clear', methods=['POST'])
def clear_history():
    data = request.get_json() or {}
    user_id = data.get('user_id')
    module_context = data.get('module_context')

    query = ChatHistory.query
    if user_id:
        query = query.filter_by(user_id=user_id)
    if module_context and module_context != 'general':
        query = query.filter_by(module_context=module_context)

    query.delete()
    db.session.commit()
    return jsonify({'message': 'Conversation history cleared.'}), 200
