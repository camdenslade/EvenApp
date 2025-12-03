# Even Dating

Even Dating is a modern cross-platform (iOS coming soon + Android) mobile application built with React Native, Expo, Firebase Authentication, and a secure NestJS backend. It provides a fast, safe, and intuitive experience for users to meet new people through a clean swipe interface, rich profiles, and smart onboarding flow.

# Features
## Secure Authentication
- Phone number login via Firebase Authentication
- Invisible reCAPTCHA verification
- Google Sign-In (optional provider support ready)
- JWT Access + Refresh token system via NestJS
- Automatic session refresh
- Persistent login with encrypted local storage

## Full Profile Setup
- A Tinder-style, step-by-step onboarding experience:
= First name & last name
- Birthday (month/day/year wheel picker)
- Sex selection
- Interest selection (multi-select chips)
- Photo gallery upload (up to 6 photos)
- Automatic S3 signed URL uploads
- Profile completion guard (backend-enforced)

## Swipe Experience
- Swipe left/right UI (coming next in your project)
- Real-time card rendering
- Backend-ready match + queue architecture

## Photo Upload System
- Expo Image Picker
- Automatic compression & resize (1080px width)
- Uploads to S3 via signed PUT URLs
- Displays dynamic image grid on profile & onboarding

## Backend Infrastructure
- Powered by NestJS + Firebase Admin + AWS S3:
- Complete auth flow with JWT refresh
- Secure profile API routes
- S3 upload URL generation
- ProfileGuard enforcement
- Postgres user database schema
- Analytics-safe & scalable

# Tech Stack
## Frontend
- React Native (Expo SDK 54+)
- TypeScript
- Firebase Authentication (modular v9)

## Backend
- NestJS
- Firebase Admin SDK
- Postgres
- AWS S3 (Signed URLs)
- JWT Access/Refresh Tokens
