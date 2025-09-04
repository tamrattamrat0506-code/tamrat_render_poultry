document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', function() {
            window.location.href = this.querySelector('a').href;
        });
    });

    {% if user.is_authenticated %}
    initializeWebSocket({{ user.id }});
    {% endif %}

    markConversationsAsRead();
});

let socket;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

function initializeWebSocket(userId) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//${window.location.host}/ws/user/${userId}/notifications/`;
    
    socket = new WebSocket(socketUrl);

    socket.onopen = function() {
        reconnectAttempts = 0;
        console.log('WebSocket connected');
    };

    socket.onmessage = function(e) {
        try {
            const data = JSON.parse(e.data);
            if (data.type === 'unread_update') {
                updateUnreadBadge(data.conversation_id, data.count);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    };

    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
    };

    socket.onclose = function(e) {
        console.log(`WebSocket closed: ${e.code} - ${e.reason}`);
        if (reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            console.log(`Reconnecting in ${delay}ms...`);
            setTimeout(() => {
                reconnectAttempts++;
                initializeWebSocket(userId);
            }, delay);
        }
    };
}

function updateUnreadBadge(conversationId, count) {
    const badge = document.getElementById(`unread-${conversationId}`);
    const card = badge?.closest('.conversation-card');
    
    if (!badge || !card) return;

    badge.textContent = count;
    if (count > 0) {
        badge.style.display = 'inline-flex';
        card.classList.add('unread');
    } else {
        badge.style.display = 'none';
        card.classList.remove('unread');
    }
}

function markConversationsAsRead() {
    fetch("{% url 'conversation:mark_all_read' %}", {
        method: 'POST',
        headers: {
            'X-CSRFToken': '{{ csrf_token }}',
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }).catch(error => console.error('Error marking as read:', error));
}