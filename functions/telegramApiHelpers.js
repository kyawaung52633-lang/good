// ============================================================
// TELEGRAM API HELPERS
// ============================================================

import { TELEGRAM_API } from './constants.js';

export async function sendMessage(token, chat_id, text, parse_mode = 'HTML', reply_markup = null, botKeyValue = null) {
    const apiUrl = `${TELEGRAM_API}${token}/sendMessage`;
    const payload = { 
        chat_id, 
        text, 
        parse_mode, 
        disable_web_page_preview: true 
    };
    if (reply_markup) payload.reply_markup = reply_markup;
    
    const headers = { 'Content-Type': 'application/json' };
    if (botKeyValue) headers['X-Bot-Key'] = botKeyValue;
    
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (error) {
        console.error("[sendMessage] Error:", error);
        return { ok: false, description: error.message };
    }
}

export async function editMessageText(token, chat_id, message_id, text, parse_mode = 'HTML', reply_markup = null, botKeyValue = null) {
    const apiUrl = `${TELEGRAM_API}${token}/editMessageText`;
    const payload = { 
        chat_id, 
        message_id, 
        text, 
        parse_mode 
    };
    if (reply_markup) payload.reply_markup = reply_markup;
    
    const headers = { 'Content-Type': 'application/json' };
    if (botKeyValue) headers['X-Bot-Key'] = botKeyValue;
    
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (error) {
        console.error("[editMessageText] Error:", error);
        return { ok: false, description: error.message };
    }
}

export async function answerCallbackQuery(token, callback_query_id, text = '✅ Done!', show_alert = false, botKeyValue = null) {
    const apiUrl = `${TELEGRAM_API}${token}/answerCallbackQuery`;
    const payload = { 
        callback_query_id, 
        text, 
        show_alert 
    };
    
    const headers = { 'Content-Type': 'application/json' };
    if (botKeyValue) headers['X-Bot-Key'] = botKeyValue;
    
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (error) {
        console.error("[answerCallbackQuery] Error:", error);
        return { ok: false, description: error.message };
    }
}

export async function getMe(token, botKeyValue = null) {
    const apiUrl = `${TELEGRAM_API}${token}/getMe`;
    const headers = {};
    if (botKeyValue) headers['X-Bot-Key'] = botKeyValue;
    
    try {
        const response = await fetch(apiUrl, { headers });
        const result = await response.json();
        return result.ok ? result.result : null;
    } catch (error) {
        console.error("[getMe] Error:", error);
        return null;
    }
}

export async function setMyCommands(token, commands, scope = 'all_private_chats', language_code = null, botKeyValue = null) {
    const apiUrl = `${TELEGRAM_API}${token}/setMyCommands`;
    const payload = { commands };
    if (scope) payload.scope = { type: scope };
    if (language_code) payload.language_code = language_code;
    
    const headers = { 'Content-Type': 'application/json' };
    if (botKeyValue) headers['X-Bot-Key'] = botKeyValue;
    
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        return result.ok;
    } catch (error) {
        console.error("[setMyCommands] Error:", error);
        return false;
    }
}