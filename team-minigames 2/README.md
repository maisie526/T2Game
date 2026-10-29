# 🎮 팀 미니게임

팀원들과 함께 하는 미니게임 사이트 (반응속도 · 실시간 퀴즈 · 그림 맞추기)

- 프론트: Vite + React
- 백엔드: Supabase (Auth, Postgres, Realtime)
- 배포: Vercel

## 로컬 실행
```
npm install
npm run dev
```

## 환경 변수 (.env)
```
VITE_SUPABASE_URL=https://cxysgaemxdenpxrvktks.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```
publishable 키는 브라우저에 노출돼도 되는 공개 키예요. 데이터 보호는 RLS 정책이 담당합니다.

## Vercel 배포
```
npx vercel --prod
```
