// ============================================
//  ★★★ 여기에 본인의 Firebase 설정값을 입력하세요 ★★★
// ============================================
// Firebase 콘솔 > 프로젝트 설정 > 일반 > 웹 앱(</>) 에서 확인
//
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBVPnfyKiLEzXGC5ovm3H8eXALtne7yCrw",
  authDomain: "project-9096563110778400253.firebaseapp.com",
  projectId: "project-9096563110778400253",
  storageBucket: "project-9096563110778400253.firebasestorage.app",
  messagingSenderId: "769311374003",
  appId: "1:769311374003:web:47cf55515bd5ae9d598ec6",
  measurementId: "G-9ZCR91S3QC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// appId: Firestore 컬렉션 경로에 사용됩니다
export const appId = 'school-event-manager-v2';
