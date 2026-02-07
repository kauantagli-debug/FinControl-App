const wppconnect = require('@wppconnect-team/wppconnect');
const axios = require('axios');

// Next.js API URL
const API_URL = 'http://localhost:3000/api/whatsapp';

wppconnect
    .create({
        session: 'finance-bot',
        catchQR: (base64Qr, asciiQR) => {
            console.log(asciiQR); // Print QR Code to console for scanning
        },
        statusFind: (statusSession, session) => {
            console.log('Status Session: ', statusSession);
            console.log('Session name: ', session);
        },
        headless: true, // Headless browser
        devtools: false,
        useChrome: true,
        debug: false,
        logQR: true,
        autoClose: 0, // Disable auto close
        tokenStore: 'file', // Store session in file
        folderNameToken: './tokens', // Folder to save tokens
    })
    .then((client) => start(client))
    .catch((error) => console.log(error));

function start(client) {
    client.onMessage(async (message) => {
        // Only parse messages from ME (Saved Messages) or specific numbers?
        // For now, parse properly formatted messages from ANYONE (Security Warning!)
        // TODO: Filter by sender.id, but for personal use, it's okay.

        if (message.body && message.isGroupMsg === false) {
            console.log('Received: ', message.body);

            // Check if message looks like a transaction
            // Simple heuristic: contains a number?
            if (/\d/.test(message.body)) {
                try {
                    // We need to send the User Email so Django knows who to assign it to.
                    // Since this is a Personal Bot, we hardcode YOUR email here.
                    // UPDATE THIS:
                    const user_email = 'kauantagli@gmail.com'; // Or 'kauan...' 

                    const response = await axios.post(API_URL, {
                        text: message.body,
                        user_email: user_email
                    });

                    if (response.data.status === 'success') {
                        await client.sendText(message.from, `✅ *Anotado!* \n${response.data.description}: R$ ${response.data.amount}`);
                    } else {
                        // Fail silently or reply error?
                        // await client.sendText(message.from, '❓ Não entendi.');
                    }
                } catch (error) {
                    console.error('API Error:', error.message);
                    await client.sendText(message.from, '❌ Erro ao salvar.');
                }
            }
        }
    });
}
