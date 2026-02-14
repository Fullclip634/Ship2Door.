const { Expo } = require('expo-server-sdk');
const pool = require('../config/db');

const expo = new Expo();

/**
 * Send a push notification to a list of tokens
 * @param {string[]} tokens - Array of push tokens
 * @param {string} title - Title of the notification
 * @param {string} body - Body content
 * @param {object} data - Optional data payload
 */
const sendPushNotifications = async (tokens, title, body, data = {}) => {
    let messages = [];
    for (let pushToken of tokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        }

        messages.push({
            to: pushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data,
        });
    }

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    for (let chunk of chunks) {
        try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        } catch (error) {
            console.error('Error sending push notification chunk:', error);
        }
    }

    return tickets;
};

/**
 * Send notification to a specific user ID
 * @param {number} userId - The ID of the user
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data
 */
const sendToUser = async (userId, title, body, data = {}) => {
    try {
        const [users] = await pool.query('SELECT push_token FROM users WHERE id = ?', [userId]);
        if (users.length > 0 && users[0].push_token) {
            return await sendPushNotifications([users[0].push_token], title, body, data);
        }
    } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
    }
    return null;
};

module.exports = {
    sendPushNotifications,
    sendToUser
};
