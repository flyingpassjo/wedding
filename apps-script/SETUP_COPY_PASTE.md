# Apps Script 복붙 배포 가이드

## 1) Apps Script 파일 만들기
1. [script.new](https://script.new) 열기
2. 기본 `Code.gs` 전체 삭제
3. 이 폴더의 [Code.gs](/Users/joyeongseo/Desktop/청첩장/apps-script/Code.gs) 전체 복붙
4. 저장

선택 사항:
- 루트 URL 접속 시 안내 페이지가 필요하면 `HTML` 파일 `Index`를 추가하고 [Index.html](/Users/joyeongseo/Desktop/청첩장/apps-script/Index.html) 내용을 붙여넣어도 됩니다.

## 2) 웹앱 배포
1. 우측 상단 `배포` > `새 배포`
2. 유형 `웹 앱` 선택
3. 설정
   - 실행 사용자: `나`
   - 액세스 권한: `모든 사용자`
4. `배포` 클릭 후 발급 URL 복사

## 3) 정상 동작 확인
- 아래 URL이 JSON을 반환하면 정상
  - `웹앱URL?action=health`
  - `웹앱URL?action=visit_stats`
- 아래 에러가 나오면 구버전 URL 사용 중
  - `다음 스크립트 함수(doGet)를 찾을 수 없습니다.`
  - `다음 스크립트 함수(doPost)를 찾을 수 없습니다.`

## 4) 프론트 연결
루트 `.env.local`의 `VITE_GAS_WEB_APP_URL`을 방금 배포 URL로 변경

```env
VITE_GAS_WEB_APP_URL=https://script.google.com/macros/s/배포ID/exec
```

변경 후 개발 서버 재시작

```bash
npm run dev
```

## 5) 카카오 알림(선택)
Apps Script `프로젝트 설정` > `스크립트 속성`에 추가

- 키: `KAKAO_ALERT_WEBHOOK_URL`
- 값: 카카오워크 인커밍 웹훅 URL
