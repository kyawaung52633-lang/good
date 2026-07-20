// ============================================================
// VLESS VIP BOT LOGIC
// ============================================================

import { 
    SNI_LIST, IP_LIST, WS_HOST_LIST, FRUITS, ICONS, 
    SUPPORT_GROUP_LINK, ADMIN_USERNAME 
} from './constants.js';
import { 
    sendMessage, editMessageText, answerCallbackQuery 
} from './telegramApiHelpers.js';

// User data storage (in-memory)
const userData = {};

// ==================== HELPERS ====================
function extractUUID(key) {
    const match = key.match(/vless:\/\/([^@]+)@/);
    return match ? match[1] : null;
}

function extractPath(key) {
    const match = key.match(/path=([^&]+)/);
    return match ? match[1] : '%2FLINCHANNEL';
}

function extractName(key) {
    const match = key.match(/#(.+)$/);
    return match ? match[1] : 'VLESS-VIP';
}

function generateVLESSKey(data) {
    const { uuid, ip, sni, wsHost, path, name } = data;
    return `vless://${uuid}@${ip}:443?path=${path}&security=tls&alpn=http%2F1.1&encryption=none&host=${wsHost}&fp=chrome&type=ws&sni=${sni}#${name}`;
}

function getFruit(index) {
    return FRUITS[index % FRUITS.length];
}

function formatDate(date) {
    return date.toISOString().replace('T', ' ').substring(0, 16);
}

// ==================== SHOW SNI LIST ====================
export async function showSNIList(token, chatId, messageId = null, botKey = null) {
    const markup = { inline_keyboard: [] };
    
    let fruitIndex = 0;
    let row = [];
    for (const sni of SNI_LIST) {
        if (sni) {
            row.push({ text: `${getFruit(fruitIndex)} ${sni}`, callback_data: `sni_${sni}` });
            fruitIndex++;
            if (row.length === 2) {
                markup.inline_keyboard.push([...row]);
                row = [];
            }
        }
    }
    if (row.length > 0) markup.inline_keyboard.push([...row]);
    
    markup.inline_keyboard.push([
        { text: '✏️ ကိုယ်တိုင်ထည့်', callback_data: 'sni_custom' },
        { text: '🔄 ပြန်စမယ်', callback_data: 'reset' }
    ]);
    
    const text = `${ICONS.info} **SNI ကိုရွေးပါ**\n${ICONS.arrow} အောက်ပါစာရင်းထဲမှ တစ်ခုကိုရွေးပါ\n\n━━━━━━━━━━━━━━━━━━━`;
    
    if (messageId) {
        await editMessageText(token, chatId, messageId, text, 'HTML', markup, botKey);
    } else {
        await sendMessage(token, chatId, text, 'HTML', markup, botKey);
    }
}

// ==================== SHOW IP LIST ====================
export async function showIPList(token, chatId, messageId, sni, botKey = null) {
    const markup = { inline_keyboard: [] };
    
    let fruitIndex = 4;
    let row = [];
    for (const ip of IP_LIST) {
        if (ip) {
            row.push({ text: `${getFruit(fruitIndex)} ${ip}`, callback_data: `ip_${ip}` });
            fruitIndex++;
            if (row.length === 2) {
                markup.inline_keyboard.push([...row]);
                row = [];
            }
        }
    }
    if (row.length > 0) markup.inline_keyboard.push([...row]);
    
    markup.inline_keyboard.push([
        { text: '✏️ ကိုယ်တိုင်ထည့်', callback_data: 'ip_custom' },
        { text: '🔙 နောက်ပြန်', callback_data: 'back_sni' }
    ]);
    
    const text = `${ICONS.check} **SNI:** \`${sni}\`\n\n${ICONS.info} **IP ကိုရွေးပါ**\n${ICONS.arrow} အောက်ပါစာရင်းထဲမှ တစ်ခုကိုရွေးပါ\n\n━━━━━━━━━━━━━━━━━━━`;
    
    await editMessageText(token, chatId, messageId, text, 'HTML', markup, botKey);
}

// ==================== SHOW WS HOST LIST ====================
export async function showWSList(token, chatId, messageId, sni, ip, botKey = null) {
    const markup = { inline_keyboard: [] };
    
    let fruitIndex = 8;
    let row = [];
    for (const ws of WS_HOST_LIST) {
        if (ws) {
            row.push({ text: `${getFruit(fruitIndex)} ${ws}`, callback_data: `ws_${ws}` });
            fruitIndex++;
            if (row.length === 2) {
                markup.inline_keyboard.push([...row]);
                row = [];
            }
        }
    }
    if (row.length > 0) markup.inline_keyboard.push([...row]);
    
    markup.inline_keyboard.push([
        { text: '✏️ ကိုယ်တိုင်ထည့်', callback_data: 'ws_custom' },
        { text: '🔙 နောက်ပြန်', callback_data: 'back_ip' }
    ]);
    
    const text = `${ICONS.check} **SNI:** \`${sni}\`\n${ICONS.check} **IP:** \`${ip}\`\n\n${ICONS.info} **WS Host ကိုရွေးပါ**\n${ICONS.arrow} အောက်ပါစာရင်းထဲမှ တစ်ခုကိုရွေးပါ\n\n━━━━━━━━━━━━━━━━━━━`;
    
    await editMessageText(token, chatId, messageId, text, 'HTML', markup, botKey);
}

// ==================== GENERATE FINAL KEY (COPY BUTTON PUSH) ====================
export async function generateKey(token, chatId, messageId, data, botKey = null) {
    const { uuid, ip, sni, wsHost, path, name } = data;
    
    const createdDate = new Date();
    const expireDate = new Date(createdDate);
    expireDate.setDate(expireDate.getDate() + 30);
    
    const newKey = generateVLESSKey({ uuid, ip, sni, wsHost, path, name });
    
    // 🔑 Copy Button with Key
    const markup = {
        inline_keyboard: [
            [
                { 
                    text: "📋 ဒီမှာနှိပ်ပြီး Key Copy ယူပါ", 
                    callback_data: `copy_${newKey}`
                }
            ],
            [
                { text: "🔄 ပြန်စမယ် /reset", callback_data: "reset" }
            ]
        ]
    };
    
    const resultText = `
${ICONS.crown} **━━━━━━━ VIP VLESS KEY ━━━━━━━** ${ICONS.crown}

${ICONS.key} **KEY:-**
\`${newKey}\`

━━━━━━━━━━━━━━━━━━━━━━━

${ICONS.calendar} **📅 ထုတ်သည့်ရက်:-**
\`${formatDate(createdDate)}\`

${ICONS.calendar} **⏳ သက်တမ်းကုန်မည့်ရက်:-**
\`${formatDate(expireDate)}\` (၃၀ ရက်)

━━━━━━━━━━━━━━━━━━━━━━━

${ICONS.diamond} **👑 VIP USER**

━━━━━━━━━━━━━━━━━━━━━━━
`;
    
    await editMessageText(token, chatId, messageId, resultText, 'HTML', markup, botKey);
    delete userData[chatId];
}

// ==================== HANDLE COPY CALLBACK ====================
export async function handleCopyCallback(token, callbackQuery, botKey = null) {
    const callbackId = callbackQuery.id;
    const data = callbackQuery.data;
    
    // Extract key from callback data
    const key = data.replace('copy_', '');
    
    // Show alert with key for copy
    await answerCallbackQuery(token, callbackId, `✅ Key copied to clipboard!\n\n${key.substring(0, 60)}...`, true, botKey);
    
    // Also send the key as plain text message for easy copy
    await sendMessage(token, callbackQuery.message.chat.id, 
        `📋 **အောက်ပါ Key ကို Copy ယူပါ**\n\n\`${key}\`\n\n━━━━━━━━━━━━━━━━━━━\n${ICONS.info} Telegram မှာ နှိပ်ပြီး Copy လုပ်လို့ရပါပြီ။`,
        'HTML', null, botKey
    );
}

// ==================== HANDLE VLESS KEY ====================
export async function handleVLESSKey(token, message, botKey = null) {
    const chatId = message.chat.id;
    const key = message.text.trim();
    
    const uuid = extractUUID(key);
    if (!uuid) {
        await sendMessage(token, chatId, 
            `${ICONS.error} **VLESS Key မှားယွင်းနေပါတယ်။**\n${ICONS.arrow} Port 8080 Key ကိုပြန်ပို့ပါ။`,
            'HTML', null, botKey
        );
        return;
    }
    
    const path = extractPath(key);
    const name = extractName(key);
    
    userData[chatId] = {
        uuid: uuid,
        path: path,
        name: name,
        originalKey: key
    };
    
    await showSNIList(token, chatId, null, botKey);
}

// ==================== HANDLE CALLBACK ====================
export async function handleCallback(token, callbackQuery, botKey = null) {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const data = callbackQuery.data;
    const callbackId = callbackQuery.id;
    
    // Handle Copy
    if (data.startsWith('copy_')) {
        await handleCopyCallback(token, callbackQuery, botKey);
        return;
    }
    
    await answerCallbackQuery(token, callbackId, '✅ ရွေးချယ်ပြီးပါပြီ', false, botKey);
    
    if (data === 'reset') {
        delete userData[chatId];
        await sendMessage(token, chatId, 
            `${ICONS.reset} **ပြန်လည်စတင်ပြီးပါပြီ။**\n${ICONS.arrow} /start နှိပ်ပြီး ပြန်လုပ်ပါ။`,
            'HTML', null, botKey
        );
        return;
    }
    
    if (data === 'back_sni') {
        await showSNIList(token, chatId, messageId, botKey);
        return;
    }
    
    if (data === 'back_ip') {
        const user = userData[chatId];
        if (user && user.sni) {
            await showIPList(token, chatId, messageId, user.sni, botKey);
        }
        return;
    }
    
    if (data === 'sni_custom') {
        await editMessageText(token, chatId, messageId, 
            `${ICONS.settings} **SNI ကိုရိုက်ထည့်ပါ**\n${ICONS.arrow} သင့် SNI ကိုအောက်တွင်ရေးပါ-`,
            'HTML', null, botKey
        );
        userData[chatId].awaiting = 'sni';
        return;
    }
    
    if (data === 'ip_custom') {
        await editMessageText(token, chatId, messageId, 
            `${ICONS.settings} **IP ကိုရိုက်ထည့်ပါ**\n${ICONS.arrow} သင့် IP ကိုအောက်တွင်ရေးပါ-`,
            'HTML', null, botKey
        );
        userData[chatId].awaiting = 'ip';
        return;
    }
    
    if (data === 'ws_custom') {
        await editMessageText(token, chatId, messageId, 
            `${ICONS.settings} **WS Host ကိုရိုက်ထည့်ပါ**\n${ICONS.arrow} သင့် WS Host ကိုအောက်တွင်ရေးပါ-`,
            'HTML', null, botKey
        );
        userData[chatId].awaiting = 'ws';
        return;
    }
    
    // Handle SNI selection
    if (data.startsWith('sni_')) {
        const sni = data.replace('sni_', '');
        userData[chatId].sni = sni;
        await showIPList(token, chatId, messageId, sni, botKey);
        return;
    }
    
    // Handle IP selection
    if (data.startsWith('ip_')) {
        const ip = data.replace('ip_', '');
        userData[chatId].ip = ip;
        await showWSList(token, chatId, messageId, userData[chatId].sni, ip, botKey);
        return;
    }
    
    // Handle WS selection
    if (data.startsWith('ws_')) {
        const wsHost = data.replace('ws_', '');
        const user = userData[chatId];
        
        await generateKey(token, chatId, messageId, {
            uuid: user.uuid,
            ip: user.ip,
            sni: user.sni,
            wsHost: wsHost,
            path: user.path || '%2FLINCHANNEL',
            name: user.name || 'VLESS-VIP'
        }, botKey);
        return;
    }
}

// ==================== HANDLE CUSTOM INPUT ====================
export async function handleCustomInput(token, message, botKey = null) {
    const chatId = message.chat.id;
    const text = message.text.trim();
    const user = userData[chatId];
    
    if (!user || !user.awaiting) {
        await sendMessage(token, chatId, 
            `${ICONS.warning} **မသိသော Command ဖြစ်ပါသည်။**\n${ICONS.arrow} /help နှိပ်ပြီး ကြည့်ပါ။`,
            'HTML', null, botKey
        );
        return;
    }
    
    if (user.awaiting === 'sni') {
        user.sni = text;
        user.awaiting = null;
        await showIPList(token, chatId, null, text, botKey);
        return;
    }
    
    if (user.awaiting === 'ip') {
        user.ip = text;
        user.awaiting = null;
        await showWSList(token, chatId, null, user.sni, text, botKey);
        return;
    }
    
    if (user.awaiting === 'ws') {
        user.wsHost = text;
        user.awaiting = null;
        
        await generateKey(token, chatId, null, {
            uuid: user.uuid,
            ip: user.ip,
            sni: user.sni,
            wsHost: text,
            path: user.path || '%2FLINCHANNEL',
            name: user.name || 'VLESS-VIP'
        }, botKey);
        return;
    }
}

// ==================== SEND WELCOME ====================
export async function sendWelcome(token, chatId, firstName, botKey = null) {
    const text = `
${ICONS.rocket} **VLESS VIP GENERATOR BOT** ${ICONS.rocket}

${ICONS.star} **မင်္ဂလာပါ ${firstName} !**

${ICONS.info} **ဘော့ကိုအသုံးပြုနည်း:-**

1️⃣ ${ICONS.key} Port 8080 Key ကိုပို့ပါ
2️⃣ ${ICONS.settings} SNI, IP, WS Host ကိုရွေးပါ
3️⃣ ${ICONS.diamond} VIP VLESS Key ရရှိမှာဖြစ်ပါတယ်

━━━━━━━━━━━━━━━━━━━━━━━
${ICONS.link} **Support Group:** ${SUPPORT_GROUP_LINK}
${ICONS.shield} **Admin:** ${ADMIN_USERNAME}
━━━━━━━━━━━━━━━━━━━━━━━
${ICONS.info} **အထူးအချက်:-** Key ကို Copy ယူဖို့ Button ပါပါတယ်။
`;
    await sendMessage(token, chatId, text, 'HTML', null, botKey);
}

// ==================== SEND HELP ====================
export async function sendHelp(token, chatId, botKey = null) {
    const text = `
${ICONS.help} **အကူအညီ** ${ICONS.help}

${ICONS.arrow} **Commands:-**

/start - စတင်ရန်
/help - အကူအညီ
/reset - ပြန်လည်စတင်ရန်

${ICONS.info} **ဘယ်လိုသုံးမလဲ:-**

1. Port 8080 VLESS Key ကိုပို့ပါ
2. SNI ကိုရွေးပါ
3. IP ကိုရွေးပါ
4. WS Host ကိုရွေးပါ
5. VIP VLESS Key ရရှိပါမည်

${ICONS.calendar} **သက်တမ်း:-** ၃၀ ရက်
${ICONS.key} **Copy ယူနည်း:-** Key အောက်က Button ကိုနှိပ်ပါ။
`;
    await sendMessage(token, chatId, text, 'HTML', null, botKey);
}