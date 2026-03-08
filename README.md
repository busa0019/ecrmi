# 🚀 ECRMI Portal

### Membership & Training Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-UI-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![PM2](https://img.shields.io/badge/PM2-Production-2B037A?logo=pm2)](https://pm2.keymetrics.io/)
[![Nginx](https://img.shields.io/badge/Nginx-Reverse%20Proxy-009639?logo=nginx)](https://nginx.org/)
[![Live](https://img.shields.io/badge/Live-Production-success)](https://ecrmiportal.cloud)

**Live Application:** https://ecrmiportal.cloud

------------------------------------------------------------------------

## 📌 Overview

ECRMI Portal is a full-stack production platform that powers:

-   ✅ Membership onboarding & approval workflows
-   🎓 Training course delivery with CBT assessments
-   📄 Automated PDF certificate & letter generation
-   🔐 QR-based certificate verification
-   🧑‍💼 Full-featured Admin dashboard

Built with **Next.js + MongoDB**, deployed on a VPS using **PM2 +
Nginx**.

------------------------------------------------------------------------

## 🏗 Core Modules

### 👥 Membership Management

-   Application submission (documents + payment receipts)
-   Admin review & approval workflow
-   Requested vs Approved membership type logic
-   Membership number generation by category
-   Membership ID history tracking
-   Automated:
    -   Membership Certificate (PDF)
    -   Membership Letter (PDF)
-   Public QR-based verification system

------------------------------------------------------------------------

### 🎓 Training Platform (Courses + CBT)

#### Course System

-   Course title, description
-   Duration (minutes)
-   Pass mark (%)
-   Learning materials:
    -   Primary PDF
    -   Multiple `materialUrls[]`

#### CBT Engine

-   Timed assessment interface
-   Answer review before submission
-   Automatic scoring
-   Attempt limits (e.g., max 3 attempts)
-   Lockout rules if failed repeatedly

#### Access Control

-   Per-course access codes
-   Single-use enforcement
-   Optional resume support for same email

------------------------------------------------------------------------

### 🏆 Certificates & Verification

#### Membership Certificates

-   Generated using `pdf-lib`
-   Dynamic templates per membership type
-   Embedded QR code verification

#### Training Certificates

-   Issued automatically upon passing
-   Unique certificate ID
-   Downloadable PDF
-   Online QR verification

------------------------------------------------------------------------

### 🧑‍💼 Admin Dashboard

Includes:

-   📊 Dashboard / Analytics
-   📚 Course management
-   ❓ Question bank management
-   📝 Attempt tracking
-   🏅 Training certificate records
-   🔑 Access code generation & tracking
-   👥 Membership approval management

------------------------------------------------------------------------

## 🗃 Data Model (High-Level)

Main collections:

-   `MembershipApplication`
-   `Member`
-   `Course`
-   `Question`
-   `Attempt`
-   `Certificate`
-   `Participant`
-   `TrainingAccessCode`

------------------------------------------------------------------------

## 🔄 System Flows

### Membership Flow

1.  Applicant submits application.
2.  Admin reviews.
3.  On approval:
    -   Certificate ID generated
    -   PDF certificate + letter created
    -   QR code embedded

### Training Flow

1.  Candidate registers identity.
2.  Opens course.
3.  Enters access code.
4.  Takes CBT.
5.  If passed:
    -   Certificate generated
    -   QR verification enabled

------------------------------------------------------------------------

## 🛠 Tech Stack

  Layer             Technology
  ----------------- -----------------------------------
  Frontend          Next.js (App Router) + TypeScript
  Backend           API Routes (Next.js)
  Database          MongoDB Atlas + Mongoose
  Styling           Tailwind CSS
  PDF Engine        pdf-lib
  QR Codes          qrcode
  Hosting           Ubuntu VPS
  Process Manager   PM2
  Reverse Proxy     Nginx

------------------------------------------------------------------------

## ⚙ Environment Variables

Create a `.env` file:

NEXT_PUBLIC_BASE_URL=http://localhost:3000/

NEXT_PUBLIC_APP_URL=http://localhost:3000/

MONGODB_URI=mongodb+srv://

JWT_SECRET=your_secret_here

> ⚠ QR codes are embedded during PDF generation. Changing base URL later
> requires regenerating certificates.

------------------------------------------------------------------------

## 💻 Local Development

npm install\
npm run dev

Visit: http://localhost:3000

------------------------------------------------------------------------

## 🚀 Production Build

npm run build\
npm start

------------------------------------------------------------------------

## 🖥 VPS Deployment (PM2 + Nginx)

git pull\
npm ci\
npm run build\
pm2 restart all --update-env\
pm2 save

------------------------------------------------------------------------

## 📫 Contact

**Faoziyyah Busari**\
📧 busarifaoziyyah@gmail.com\
🔗 https://www.linkedin.com/in/faoziyyahbusari/

------------------------------------------------------------------------

## ⭐ Why This Project Stands Out

-   Real-world production deployment
-   Secure certificate verification system
-   Scalable CBT engine with access control
-   Admin-driven content & approval workflows
-   Clean architecture with separation of concerns
