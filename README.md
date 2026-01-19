# Web Paroki MD - Comprehensive Project Guide

Welcome to the **Web Paroki MD** project documentation. This manual consolidates all project guides into a single comprehensive reference.

---

## 1. Project Overview

A modern, stateless blog CMS built with Next.js 15 (App Router), using GitHub as the single source of truth for content storage and Vercel for serverless hosting. No traditional database required.

### Features

-   ✅ **GitHub as Storage** - All content stored as Markdown files in a GitHub repository
-   ✅ **WebP Image Optimization** - Automatic image conversion and optimization
-   ✅ **GitHub App Authentication** - Secure repository operations
-   ✅ **Password Authentication** - Simple username/password login for admins
-   ✅ **Multi-Admin Support** - Add multiple admin users via environment variables
-   ✅ **Static Generation + ISR** - Fast page loads with on-demand revalidation
-   ✅ **Markdown Editor** - Rich editing experience with preview
-   ✅ **Contact Form** - Submissions stored as GitHub issues
-   ✅ **Free Tier Compliant** - Runs entirely on free tiers (Vercel + GitHub)

### Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Readers   │─────▶│   Next.js    │─────▶│   GitHub    │
│             │      │   (Vercel)   │      │   (Content) │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Editors    │
                     │  (OAuth)     │
                     └──────────────┘
```

### Prerequisites

1.  **GitHub Account** - For content storage and authentication
2.  **Vercel Account** - For deployment (free tier)
3.  **Node.js 18+** - For local development

---

## 2. Setup & Installation

### 2.1. Create Content Repository

Create a new GitHub repository for your blog content (e.g., `blog-content`):

```bash
mkdir blog-content
cd blog-content
git init
mkdir -p posts images/banners images/inline
echo "# Blog Content" > README.md
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/blog-content.git
git push -u origin main
```

### 2.2. Create GitHub App

1.  Go to GitHub Settings → Developer settings → GitHub Apps → New GitHub App
2.  Fill in:
    -   **GitHub App name**: `blog-cms-YOUR_NAME`
    -   **Homepage URL**: `http://localhost:3000`
    -   **Webhook**: Uncheck "Active"
    -   **Repository permissions**:
        -   Contents: Read & Write
        -   Issues: Read & Write (for contact form)
    -   **Where can this GitHub App be installed?**: Only on this account
3.  Click "Create GitHub App"
4.  Generate a private key and download it
5.  Note the **App ID**
6.  Install the app on your content repository
7.  Note the **Installation ID** from the URL

### 2.3. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# GitHub App Configuration
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
Your private key here (paste entire content)
-----END RSA PRIVATE KEY-----"
GITHUB_APP_INSTALLATION_ID=12345678

# Content Repository
CONTENT_REPO_OWNER=your_github_username
CONTENT_REPO_NAME=blog-content

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
ADMIN_NAME=Your Name
ADMIN_EMAIL=your.email@example.com

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_min_32_characters
NEXTAUTH_URL=http://localhost:3000
```

Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 2.4. Run Development Server

```bash
npm install
npm run dev
```

Visit:
-   **Blog**: http://localhost:3000
-   **Admin**: http://localhost:3000/admin

---

## 3. Admin User Management

This guide explains how to add and manage multiple admin users for your blog CMS.

### Method 1: Environment Variables (Recommended)

Simply add numbered environment variables in `.env.local` - **no code changes needed**:

```env
# First admin (default)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password_1
ADMIN_NAME=Admin User
ADMIN_EMAIL=admin@example.com

# Second admin
ADMIN_USERNAME_2=editor
ADMIN_PASSWORD_2=secure_password_2
ADMIN_NAME_2=Editor User
ADMIN_EMAIL_2=editor@example.com

# Third admin
ADMIN_USERNAME_3=author
ADMIN_PASSWORD_3=secure_password_3
ADMIN_NAME_3=Author User
ADMIN_EMAIL_3=author@example.com
```

The system automatically detects and loads all admin users from environment variables. You can add as many as you need by incrementing the number suffix (_2, _3, _4, etc.).

### Removing Admin Access

1.  Delete their environment variables from `.env.local` (or Vercel settings)
2.  Restart the application (or redeploy)

### Troubleshooting Login

-   **"Invalid credentials"**: Check username/password in `.env.local` or Vercel. Ensure no trailing spaces.
-   **Admin Panel 404/Access Denied**: Ensure you are logged in at `/admin/login`.

---

## 4. Security Implementation

### OWASP Top 10 Compliance

#### A01:2021 - Broken Access Control
-   ✅ **NextAuth JWT-based authentication** with 24-hour session timeout
-   ✅ **Middleware protection** for all `/admin/*` routes
-   ✅ **Rate limiting** on login attempts (5 attempts per 15 minutes)

#### A02:2021 - Cryptographic Failures
-   ✅ **Bcrypt password hashing** (cost factor: 10)
-   ✅ **HTTPS enforcement** (via Vercel)
-   ✅ **Secure session storage** (httpOnly cookies via NextAuth)

#### A03:2021 - Injection
-   ✅ **XSS prevention** in markdown rendering
-   ✅ **Script tag removal** from user inputs
-   ✅ **Zod schema validation** for all inputs

#### A05:2021 - Security Misconfiguration
-   ✅ **Security headers** configured (CSP, X-Frame-Options, etc.)
-   ✅ **Default credentials removed** (fallback only for development)

### Password Hashing

For production, you SHOULD NOT store plain text passwords in environment variables.

1.  Generate a hash:
    ```bash
    node scripts/hash-password.js your_secure_password
    ```
2.  Update `.env.local`:
    ```env
    ADMIN_PASSWORD="$2b$10$your_bcrypt_hash_here"
    ```

---

## 5. Deployment Guide

### Vercel Deployment Steps

1.  **Push** your code to GitHub.
2.  **Import** the project in Vercel.
3.  **Environment Variables**: Add all variables from `.env.local` to Vercel Project Settings.
4.  **Update `NEXTAUTH_URL`** to `https://your-domain.vercel.app`.
5.  **Deploy**.

### Common Deployment Error

If you see: `Error: [@octokit/auth-app] installationId option is required...`

**Fix**: You forgot to add the GitHub App environment variables to Vercel.
1.  Go to **Settings** → **Environment Variables**
2.  Add `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_APP_INSTALLATION_ID`, etc.
3.  **Redeploy** (Deployments → Redeploy).

---

## 6. Pre-Deployment Checklist

Complete this before going live:

### ✅ Authentication
-   [ ] All admin passwords are bcrypt hashes
-   [ ] `NEXTAUTH_SECRET` is strong (32+ chars)
-   [ ] Admin usernames are not "admin"

### ✅ Environment Variables
-   [ ] `.env.local` is NOT in Git (`.gitignore` checked)
-   [ ] All variables set in Vercel Dashboard
-   [ ] GitHub App private key verified (includes `\n`)

### ✅ GitHub Configuration
-   [ ] GitHub App installed ONLY on content repo
-   [ ] Limits: Contents (Read & Write), Issues (Read & Write)

### ✅ Code Security
-   [ ] `npm audit` returns 0 high vulnerabilities
-   [ ] Security headers active (CSP, X-Frame-Options)

---

## 7. Security Review

Periodic review items:

-   [ ] **Access Control**: Verify middleware and rate limiting
-   [ ] **Crypto**: Ensure no plaintext passwords
-   [ ] **Logging**: Check failed login logs
-   [ ] **Dependencies**: Update npm packages regularly

---

**Last Updated:** 2026-01-19
**Maintainer:** Paroki Brayut Dev Team
