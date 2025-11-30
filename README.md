This is going to be called Even Dating. The way the swiping system works is for users who are either gay, straight, etc or only interested in one sex, swiping left or right on the card stack simply skips the user. To send a like I want a round button in the bottom middle of the screen that when held down for 1.5 seconds it sends the like then moves to the next user. I want the card stack to visually be like a deck of cards with just like Name, Age, Distance Away, etc showing on the profile card but if they click on the actual card it will open the profile up into their full profile, 5 picture maximum and 3 picture minimum. That is all for the card stack, I want the logo to be like and E mirrored on the spine from either side so like back to back. As for functions, I want the user to be able to pay $10 to search for a user with a specific name within a 25 mile radius of their choosing. I also want to implement a rating system from 1-10. A user can only get rated a 1-3 if the user is also reported and the report matches a list of keywords we will generate, otherwise the user must be rated between 3-10. Each user will get 3 reviews per week where each one must be used to unlock the next one, the first one is as I just described, the second one the lowest they can rate is a 5, then the last one is same as the first. They will also recieve an emergency review once in their lifetime and we'll track that with phone number/email. This emergency review can rate them anything and will automatically prompt the user to report them. For each sex, men and women, their scaled will be curved so that the average for the entire population of them is 5 that way the ratings are relative within the sex and not between sexes. Additionally, in order to write a review to begin with, each user must send two messages in the chat each. Matches will automatically disappear after 5 days and it will put them in an expiring section within 12 hours. We will have all the usual filters of the usual apps just without the paywalls, also i want the rating to show up on their profile in like a circular bar that gets filled by their (rating/10)% and then their rating in decimal rounded to the nearest tenth in the middle. Finally, as for comments on reviews, the only people who need to be able to see the comments are administrators, the user who left the review, and the user who recieved the review, these reviews should not be public. How much do we need to refactor for that.



⭐ EVEN DATING — Complete Development Roadmap (Backend, Frontend, Infra)
🔵 PHASE 1 — Core Foundation (You Already Started This)

Goal: Fully working swipe → match → profile system.

Milestone 1 — Project Setup (DONE 90%)

NestJS backend

Firebase Admin & Firestore

Firebase Auth

JWT Access/Refresh

Rate limiting

/profiles/queue

/swipe

/matches basic structure

Expo app with auth + swipe screen

Deliverables

Working login

Profiles load

Swiping works

Matches create

Firestore collections:

users/uid

profiles/uid

swipes/uid/targets/targetId

matches/matchId

After Phase 1

You have a Tinder-style MVP.

🔵 PHASE 2 — Filters + Full Profile + Photos (High Priority)

Goal: Make the feed useful and accurate.

Milestone 2.1 — Profile Expansion

Backend additions:

Add fields: gender, preferredGender, age, bio, interests, photoUrls

Add /profiles/update

Add /profiles/upload-photo with signed URL

Frontend additions:

Full Profile View Screen (with 3–5 photos)

Edit Profile Screen

Photo upload

Milestone 2.2 — Filters (No paywall)

Backend:

/profiles/queue accepts query params:

age range

distance

gender preference

interests

Frontend:

Filter drawer or modal

Firestore:

Add indexing for multi-field search (distance, age, gender)

🔵 PHASE 3 — Hold-to-Like + Card Stack Visual Update

Goal: Match UX description.

Milestone 3.1 — Long-Press Like Button

Frontend:

Button at bottom → hold 1.5 seconds → sends "LIKE"

Cancel on early lift

Animation feedback

Milestone 3.2 — Card Stack Redesign

Frontend:

3 cards stacked visually

Expand animation when tapped

Show mini profile → full profile

Backend impact:
NONE (just UI).

🔵 PHASE 4 — Ratings & Reviews System (Most Complex Feature)

This introduces the review logic:

3 reviews per week

Review constraints (min 1-or-3, min 5, min 1-or-3)

Emergency one-time review

Reports required for low ratings

Non-public: only admin + reviewer + reviewee

Rating curve per sex (mean = 5)

Milestone 4.1 — Firestore Structure
reviews/{reviewId}
  from: uid
  to: uid
  rating: number
  comment: string
  type: "normal1" | "normal2" | "normal3" | "emergency"
  timestamp: Date
  visibleTo: [uid_from, uid_to, "admin"]

reviewCounts/{uid}/{weekNumber}
  normal1: boolean
  normal2: boolean
  normal3: boolean
  emergencyUsed: boolean

reports/{reportId}
  from: uid
  to: uid
  reason: string
  timestamp: Date

Milestone 4.2 — Backend Modules

Create:

ReviewsModule
ReviewsController
ReviewsService

ReportsModule
ReportsController
ReportsService

Milestone 4.3 — Review Rules Engine

In ReviewsService:

Check if user has enough messages with match

Check if weekly review slot available

Enforce rating minimum rules

If low rating → require matching keyword report

Emergency review allows anything, forces report

Save review

Update rating curve

Save updated profile.ratingCurve

Milestone 4.4 — Rating Curve Engine

RatingsService:

Maintain running averages per sex

Adjust each user's curved rating:

curved = 5 + (raw - sexMean)


Save profile.ratingCurve

Frontend reads this value

Milestone 4.5 — Frontend Integration

Review screen after enough messages

Rating interface (1–10)

Report reason picker

Circular rating SVG/bar component

Show rating on profile

🔵 PHASE 5 — Matches Auto-Expiration System

Matches expire after 5 days:

Milestone 5.1 — Backend Schema Add

Extend match:

expiresAt: timestamp
expiringAt: timestamp

Milestone 5.2 — Cloud Scheduler Job

Every hour:

Move matches <12hrs to expiring state

Delete expired matches

Notify users when match is expiring (optional)

Milestone 5.3 — Frontend

Expiring Matches section

Countdown timer UI

Prevent messaging after expiration

🔵 PHASE 6 — Paid Search ($10 Name Search Within 25 Miles)
Milestone 6.1 — Payment System

Backend:

Stripe or Firebase Extensions

payments/{uid} log

Milestone 6.2 — Search Module
SearchModule
SearchService
SearchController


Endpoint:

POST /search/name
{
  name: string,
  radius: number
}


Backend:

Validate payment

Run search query

Return results

Frontend:

Search screen

Radius picker slider

Stripe or Firebase payment UI

🔵 PHASE 7 — Admin Tools

Needed for:

Reviewing reported users

Reading review comments

Banning/flagging

Global analytics (ratings curve calculations)

Milestone 7.1 — Admin UI (Web)

Make a small web dashboard:

Roles: admin only

View reports

View hidden review comments

View ratings curve

Moderate profiles

Milestone 7.2 — Admin Backend

/admin/reviews

/admin/reports

/admin/users

Security:
AdminGuard → only allow emails flagged as admin in Firestore.

🔵 PHASE 8 — Security & Hardening

Full Firestore security rules

HTTPS everywhere

Rate-limiting review endpoints

Logging with metadata

Suspicious behavior detection

Token rotation

IP/device fingerprinting

Abuse detection (bot protection)

🔵 PHASE 9 — Launch Prep

Full QA

Stress test swipe & match creation

Beta tester feedback

App Store + Google Play requirements

Privacy policy & ToS

Hosting infrastructure finalization

Cloud Run (backend)

Firebase (frontend hosting / push notifications)

🔵 PHASE 10 — Launch

Submit app

Social media

Iterate features

Add boost options

Scaling plan