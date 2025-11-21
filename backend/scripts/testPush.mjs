import dotenv from 'dotenv';
dotenv.config();
import { sendPushNotification } from '../src/utils/sendPush.js';

const userId = '6917248f89aa0d9001eba365'; // volunteer id

(async () => {
  try {
    console.log('Running testPush for user', userId);
    await sendPushNotification(userId, 'registration_approved', 'Test push: your registration has been approved', '/');
    console.log('sendPushNotification finished');
  } catch (err) {
    console.error('Error in testPush script:', err);
    process.exit(1);
  }
})();
