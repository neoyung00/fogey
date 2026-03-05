# 행사 참여 확인시스템 - Vercel 배포 가이드

## 📋 배포 순서 (총 4단계)

---

### 1단계: Firebase 설정값 확인

Firebase 콘솔(console.firebase.google.com)에서:
- 프로젝트 설정(⚙️) > 일반 > "내 앱" 섹션
- 웹 앱이 없으면 `</>` 버튼으로 웹 앱 추가
- `firebaseConfig` 값을 복사

그리고 **Authentication** 메뉴에서:
- "시작하기" 클릭
- "익명(Anonymous)" 로그인 제공업체를 **활성화**

### 2단계: firebase.js 파일 수정

`src/firebase.js` 파일을 열고 "여기에_입력" 부분을 
본인의 Firebase 설정값으로 교체하세요.

예시:
```js
const firebaseConfig = {
  apiKey: "AIzaSyB1234567890abcdefg",
  authDomain: "my-project.firebaseapp.com",
  projectId: "my-project",
  storageBucket: "my-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 3단계: GitHub에 업로드

1. github.com에서 "New repository" 클릭
2. 저장소 이름 입력 (예: event-manager)
3. 이 프로젝트 폴더의 **모든 파일**을 업로드
   - "Upload files" 버튼으로 드래그 앤 드롭
   - 또는 git 명령어 사용

### 4단계: Vercel에서 배포

1. vercel.com 접속 → GitHub로 로그인
2. "Add New Project" 클릭
3. 방금 만든 GitHub 저장소 선택
4. Framework Preset: **Vite** 선택
5. "Deploy" 클릭
6. 배포 완료! → `https://프로젝트명.vercel.app` URL 생성

---

## 🔗 Notion에 임베드하기

1. Notion 페이지에서 `/embed` 입력
2. Vercel에서 받은 URL 붙여넣기
3. 완료! 바로 표시됩니다

---

## ⚠️ 주의사항

- Firebase 콘솔에서 **Authentication > 익명 로그인**을 반드시 활성화하세요
- Firestore 규칙이 테스트 모드인지 확인하세요
- `firebase.js`의 설정값은 절대 남에게 공유하지 마세요
