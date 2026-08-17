// ==========================================
// 💬 CHAT MODULE (js/chat.js)
// Handles sending and reading messages for flyer conversations.
// ==========================================

import { currentUser } from './auth.js';
import { showNotice, safeOn, formatTime } from './utils.js';
import { chatSection, chatList, chatInput, chatSend, chatClose, chatFlyerTitle, feedSection, flyerSection, searchSection, hostelSection, navGuest, navUser } from './dom.js';
import { supabase } from './supabase-config.js';

/**
 * Sends a new message for a flyer conversation.
 *
 * @param {string|number} flyerId - Flyer identifier associated with the conversation
 * @param {string} receiverPhone - Recipient phone number
 * @param {string} text - Message content to send
 * @returns {Promise<Object|null>} Inserted message row or null if failed
 */
export async function sendMessage(flyerId, receiverPhone, text) {
  if (!currentUser?.phone) {
    showNotice('Please log in to send a message', { type: 'warn' });
    return null;
  }

  const trimmedText = (text || '').trim();
  if (!trimmedText) {
    showNotice('Message text cannot be empty', { type: 'warn' });
    return null;
  }

  const payload = {
    flyer_id: flyerId,
    sender_phone: currentUser.phone,
    receiver_phone: receiverPhone,
    text: trimmedText,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('messages')
    .insert([payload])
    .select('*')
    .single();

  if (error) {
    console.error('Error sending message:', error);
    showNotice('Unable to send message right now', { type: 'error' });
    return null;
  }

  return data;
}

/**
 * Fetches existing messages between the current user and another phone number for a flyer.
 *
 * @param {string|number} flyerId - Flyer identifier associated with the conversation
 * @param {string} otherPhone - Other participant phone number
 * @returns {Promise<Array>} Array of matching message rows ordered by creation time
 */
export async function getMessages(flyerId, otherPhone) {
  if (!currentUser?.phone) {
    return [];
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('flyer_id', flyerId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading messages:', error);
    showNotice('Unable to load messages right now', { type: 'error' });
    return [];
  }

  return (data || []).filter(message => {
    const isFromMe = message.sender_phone === currentUser.phone && message.receiver_phone === otherPhone;
    const isToMe = message.sender_phone === otherPhone && message.receiver_phone === currentUser.phone;
    return isFromMe || isToMe;
  });
}

/**
 * Subscribes to realtime message updates for a flyer conversation.
 *
 * @param {string|number} flyerId - Flyer identifier associated with the conversation
 * @param {string} otherPhone - Other participant phone number
 * @param {Function} callback - Function called with each new relevant message
 * @returns {Object} Supabase realtime channel subscription object
 */
export function listenToMessages(flyerId, otherPhone, callback) {
  const channel = supabase.channel(`messages:${flyerId}:${currentUser?.phone || 'guest'}`);

  channel.on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `flyer_id=eq.${flyerId}`
    },
    payload => {
      const message = payload.new;
      const isRelevant =
        (message.sender_phone === currentUser?.phone && message.receiver_phone === otherPhone) ||
        (message.sender_phone === otherPhone && message.receiver_phone === currentUser?.phone);

      if (isRelevant && typeof callback === 'function') {
        callback(message);
      }
    }
  );

  // Subscribe after attaching handlers
  const subscription = channel.subscribe();
  return channel; // return channel so callers can unsubscribe when needed
}

// ---- Chat UI wiring ----
let activeChannel = null;
let _sendHandler = null;
let _inputHandler = null;
let _closeHandler = null;

function buildMessageEl(message) {
  const el = document.createElement('div');
  const isMe = message.sender_phone === currentUser?.phone;
  el.className = 'chat-item ' + (isMe ? 'right' : 'left');
  const ts = typeof message.created_at === 'number' ? message.created_at : Date.parse(message.created_at || '') || Date.now();
  el.innerHTML = `
    <div class="chat-text">${(message.text || '')}</div>
    <div class="chat-meta">${isMe ? 'You' : (message.sender_name || message.sender_phone)} • ${formatTime(ts)}</div>
  `;
  return el;
}

function appendMessageToList(message) {
  if (!chatList) return;
  const el = buildMessageEl(message);
  chatList.appendChild(el);
  chatList.scrollTop = chatList.scrollHeight;
}

export async function openChat(flyerId, otherPhone, flyerTitle) {
  if (!chatSection) return;
  // Hide other main sections to match navigation patterns
  if (feedSection) feedSection.classList.add('hidden');
  if (flyerSection) flyerSection.classList.add('hidden');
  if (searchSection) searchSection.classList.add('hidden');
  if (hostelSection) hostelSection.classList.add('hidden');
  if (navGuest) navGuest.classList.add('hidden');
  if (navUser) navUser.classList.remove('hidden');
  chatSection.classList.remove('hidden');
  if (chatFlyerTitle) chatFlyerTitle.textContent = flyerTitle || '';

  // Load history
  const history = await getMessages(flyerId, otherPhone);
  if (chatList) {
    chatList.innerHTML = '';
    history.forEach(m => appendMessageToList(m));
  }

  // Ensure previous subscription stopped
  if (activeChannel && typeof activeChannel.unsubscribe === 'function') {
    try { activeChannel.unsubscribe(); } catch (e) { /* ignore */ }
  }

  // Start realtime listener
  activeChannel = listenToMessages(flyerId, otherPhone, (msg) => {
    appendMessageToList(msg);
  });

  // Attach UI handlers (store references to remove later)
  _sendHandler = async () => {
    if (!chatInput) return;
    const text = (chatInput.value || '').trim();
    if (!text) return;
    try {
      await sendMessage(flyerId, otherPhone, text);
      chatInput.value = '';
    } catch (err) {
      console.error('send error', err);
      showNotice('Unable to send message', { type: 'error' });
    }
  };

  _inputHandler = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await _sendHandler();
    }
  };

  _closeHandler = () => { closeChat(); };

  if (chatSend) chatSend.addEventListener('click', _sendHandler);
  if (chatInput) chatInput.addEventListener('keydown', _inputHandler);
  if (chatClose) { chatClose.classList.remove('hidden'); chatClose.addEventListener('click', _closeHandler); }
}

export function closeChat() {
  if (activeChannel) {
    try { activeChannel.unsubscribe(); } catch (e) { /* ignore */ }
    activeChannel = null;
  }

  if (chatSend && _sendHandler) chatSend.removeEventListener('click', _sendHandler);
  if (chatInput && _inputHandler) chatInput.removeEventListener('keydown', _inputHandler);
  if (chatClose && _closeHandler) { chatClose.removeEventListener('click', _closeHandler); chatClose.classList.add('hidden'); }

  if (chatSection) chatSection.classList.add('hidden');
  if (chatList) chatList.innerHTML = '';
}
