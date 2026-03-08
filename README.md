# 모바일 청첩장 (실사용 배포용)

React + Vite 기반 모바일 청첩장입니다.

## 포함 기능
- 하객용 청첩장 페이지
- RSVP(참석여부 회신) 폼 + Google Apps Script 연동
- 스냅 업로드 페이지(`/snap.html`) + Google Drive 저장 연동
- 관리자 화면(`#/admin`) RSVP/업로드/방문 통계 확인

## 로컬 실행
```bash
npm install
npm run dev
```

## 배포용 빌드 파일 생성
```bash
npm run release
```

실행 후 루트에 아래 파일이 생성됩니다.
- `wedding-invitation-release.zip`

## 가장 빠른 배포 (Netlify Drag & Drop)
1. [Netlify](https://app.netlify.com/drop) 접속
2. `wedding-invitation-release.zip` 업로드
3. 발급된 URL을 공유

## 공유할 URL 규칙
배포 도메인이 `https://your-domain.netlify.app`라면:
- 하객 청첩장: `https://your-domain.netlify.app/`
- 스냅 업로드: `https://your-domain.netlify.app/snap.html`
- 관리자 화면: `https://your-domain.netlify.app/#/admin`

## 실사용 전 최종 체크
1. RSVP 제출 테스트 1회
2. 스냅 사진 업로드 테스트 1회
3. 관리자 화면에서 RSVP/업로드/방문 통계 반영 확인
4. 모바일(아이폰/안드로이드)에서 링크 오픈 및 버튼 동작 확인

## Apps Script 체크
- Web App이 `Anyone` 또는 `Anyone with the link`로 배포되어 있어야 합니다.
- `doPost`, `doGet`이 최신 코드로 반영되어 있어야 합니다.
- 연결 시트/드라이브 권한이 웹앱 실행 계정과 일치해야 합니다.

## Apps Script 복붙 배포
- 파일:
  - [Code.gs](/Users/joyeongseo/Desktop/청첩장/apps-script/Code.gs)
  - [Index.html](/Users/joyeongseo/Desktop/청첩장/apps-script/Index.html)
- 단계별 가이드:
  - [SETUP_COPY_PASTE.md](/Users/joyeongseo/Desktop/청첩장/apps-script/SETUP_COPY_PASTE.md)

## GitHub 업로드(웹에서 100개 제한 우회)
GitHub 웹 업로더 대신 터미널 푸시 권장:

```bash
cd "/Users/joyeongseo/Desktop/청첩장"
git init
git add .
git commit -m "Initial commit: wedding invitation"
git branch -M main
git remote add origin https://github.com/<your-id>/<repo>.git
git push -u origin main
```
