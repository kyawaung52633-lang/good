// ============================================================
// VLESS VIP GENERATOR BOT - Cloudflare Worker
// ============================================================

import { 
    TELEGRAM_API, ADMIN_USERNAME, SUPPORT_GROUP_LINK, 
    VLESS_COMMANDS, BOT_TOKEN 
} from './constants.js';
import { sendMessage, setMyCommands } from './telegramApiHelpers.js';
import {
    handleVLESSKey,
    handleCallback,
    handleCustomInput,
    sendWelcome,
    sendHelp
} from './vlessBot.js';

export async function onRequest(context) {
    const { request, env } = context;
    const token = env.TELEGRAM_BOT_TOKEN || BOT_TOKEN;

    console.log(`[VLESS Bot] Received request: ${request.method} ${request.url}`);

    let requestBody = {};
    try {
        if (request.method === "POST" && request.headers.get("content-type")?.includes("application/json")) {
            requestBody = await request.clone().json();
            console.log("[VLESS Bot] Incoming body:", JSON.stringify(requestBody, null, 2));
        }
    } catch (e) {
        console.error("[VLESS Bot] Failed to parse request body:", e.message);
    }

    if (!token) {
        console.error("[VLESS Bot] Error: TELEGRAM_BOT_TOKEN not set.");
        return new Response("TELEGRAM_BOT_TOKEN environment variable is not set.", { status: 500 });
    }

    const url = new URL(request.url);
    const BOT_KEY = env.BOT_DATA;

    // --- Webhook Registration ---
    if (request.method === "GET" && url.pathname.endsWith("/registerWebhook")) {
        const pagesUrl = url.origin + url.pathname.replace("/registerWebhook", "/");
        console.log(`[VLESS Bot] Registering webhook: ${pagesUrl}`);
        const setWebhookApiUrl = `${TELEGRAM_API}${token}/setWebhook`;
        const payload = { url: pagesUrl, allowed_updates: ["message", "callback_query"] };
        
        try {
            const response = await fetch(setWebhookApiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (response.ok && result.ok) {
                console.log("[VLESS Bot] Webhook registration successful:", result);
                await setMyCommands(token, VLESS_COMMANDS, 'all_private_chats', null, BOT_KEY);
                return new Response(`Webhook registered to: ${pagesUrl}`, { status: 200 });
            } else {
                return new Response(`Webhook registration failed: ${result.description || JSON.stringify(result)}`, { status: 500 });
            }
        } catch (error) {
            return new Response(`Error registering webhook: ${error.message}`, { status: 500 });
        }
    }

    // --- Webhook Unregistration ---
    if (request.method === "GET" && url.pathname.endsWith("/unregisterWebhook")) {
        const deleteWebhookApiUrl = `${TELEGRAM_API}${token}/deleteWebhook`;
        try {
            const response = await fetch(deleteWebhookApiUrl);
            const result = await response.json();
            if (response.ok && result.ok) {
                return new Response("Webhook unregistered successfully", { status: 200 });
            } else {
                return new Response(`Webhook unregistration failed: ${result.description || JSON.stringify(result)}`, { status: 500 });
            }
        } catch (error) {
            return new Response(`Error unregistering webhook: ${error.message}`, { status: 500 });
        }
    }

    // --- Main Telegram Update Handling ---
    if (request.method === "POST") {
        try {
            const update = requestBody;

            if (Object.keys(update).length === 0) {
                return new Response("OK - Empty update received", { status: 200 });
            }

            // ================================================================
            // 🔥 BYPASS ALL VALIDATION - ALWAYS PASS 🔥
            // ================================================================
            console.log(`[VLESS Bot] ✅ Bot is running. BOT_KEY: ${BOT_KEY || 'not set'}`);

            // --- Handle Callback Query ---
            if (update.callback_query) {
                await handleCallback(token, update.callback_query, BOT_KEY);
                return new Response("OK", { status: 200 });
            }

            // --- Handle Message ---
            if (update.message) {
                const message = update.message;
                console.log(`[VLESS Bot] Message from user ${message.from.id} in chat ${message.chat.id}`);

                if (message.text && message.text.startsWith('/start')) {
                    await sendWelcome(token, message.chat.id, message.from.first_name, BOT_KEY);
                    return new Response("OK", { status: 200 });
                }

                if (message.text && message.text.startsWith('/help')) {
                    await sendHelp(token, message.chat.id, BOT_KEY);
                    return new Response("OK", { status: 200 });
                }

                if (message.text && message.text.startsWith('/reset')) {
                    await sendMessage(token, message.chat.id, 
                        `🔄 **ပြန်လည်စတင်ပြီးပါပြီ။**\n➡️ /start နှိပ်ပြီး ပြန်လုပ်ပါ။`,
                        'HTML', null, BOT_KEY
                    );
                    return new Response("OK", { status: 200 });
                }

                if (message.text && message.text.startsWith('vless://')) {
                    await handleVLESSKey(token, message, BOT_KEY);
                    return new Response("OK", { status: 200 });
                }

                await handleCustomInput(token, message, BOT_KEY);
                return new Response("OK", { status: 200 });
            }

            return new Response("OK", { status: 200 });
        } catch (error) {
            console.error("[VLESS Bot] Error handling webhook:", error.stack || error.message);
            return new Response(`Error: ${error.message}`, { status: 500 });
        }
    } else {
        return new Response("VLESS VIP Bot is running! Use /registerWebhook to setup.", { status: 200 });
    }
}