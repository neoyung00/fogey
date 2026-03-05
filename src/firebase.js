// ============================================
//  ★★★ 여기에 본인의 Firebase 설정값을 입력하세요 ★★★
// ============================================
// Firebase 콘솔 > 프로젝트 설정 > 일반 > 웹 앱(</>) 에서 확인
//
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "여기에_입력",
  authDomain: "여기에_입력",
  projectId: "여기에_입력",
  storageBucket: "여기에_입력",
  messagingSenderId: "여기에_입력",
  appId: "여기에_입력"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// appId: Firestore 컬렉션 경로에 사용됩니다
export const appId = 'school-event-manager-v2';
