import admin from 'firebase-admin';
import { firebaseApp } from '../firebase/firebase';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

export async function verifyToken(idToken: string) {
  try {
    // Xác minh token sử dụng Firebase Admin SDK
    const decodedIdToken = await firebaseApp.auth().verifyIdToken(idToken);

    // Lấy thông tin người dùng
    const userRecord = await firebaseApp.auth().getUser(decodedIdToken.uid);

    return userRecord;
  } catch (error) {
    // Xử lý lỗi xác minh
    console.error('Xác minh không thành công:', error);
    throw error;
  }
}
