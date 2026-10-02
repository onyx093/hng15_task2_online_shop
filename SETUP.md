# AURA Home & Living — Integration & Setup Guide

This guide walks you through setting up live credentials for **Neon PostgreSQL**, **Google Cloud Console OAuth**, and **Mailgun Confirmation Emails**.

---

## 1. Neon PostgreSQL Database Setup

1. Sign up or log in at **[neon.tech](https://neon.tech)** (free tier available).
2. Create a new project (e.g., `aura-shop`).
3. From the dashboard, copy your **Connection String** (Pooled connection recommended).
4. Add it to `.env.local`:
   ```bash
   DATABASE_URL="postgresql://user:password@ep-xyz-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
5. **Automatic Schema Migration & Seeding**:
   The app will automatically detect if tables exist on first launch and create all tables (`users`, `categories`, `products`, `orders`, `order_items`) and seed the curated minimalist home & living catalog!
   You can also manually trigger an initialization at any time by visiting:
   `http://localhost:3000/api/db/init`

---

## 2. Google Cloud Console OAuth 2.0 Setup

1. Go to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Create a new project (or select an existing one).
3. Navigate to **APIs & Services** > **OAuth consent screen**:
   - User Type: **External**
   - App Name: `AURA Home & Living`
   - User support email: Select your email
   - Developer contact email: Enter your email
   - Scopes: Add `.../auth/userinfo.email` and `.../auth/userinfo.profile`
   - Test Users: Add the Google email accounts you will test with (while the app is in Testing mode).
4. Navigate to **APIs & Services** > **Credentials**:
   - Click **+ Create Credentials** > **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `AURA Web App`.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
5. Copy your **Client ID** and **Client Secret** into `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID="1234567890-abcdefgh.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxx"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

*(Note: In local development, you can also use the built-in "Sign in as Demo Customer" button if you haven't set up Google Cloud Console credentials yet).*

---

## 3. Mailgun Email Delivery Setup

1. Sign up or log in at **[mailgun.com](https://www.mailgun.com/)**.
2. In the dashboard, go to **Sending** > **Domains**:
   - For rapid testing, you can use your default **Sandbox Domain** (e.g., `sandbox-xxxx.mailgun.org`).
   - If using a sandbox domain, remember to add your personal email to **Authorized Recipients** in the Mailgun dashboard so it can receive messages.
3. Under **API Keys**, create or copy a **Sending API Key**.
4. Add them to `.env.local`:
   ```bash
   MAILGUN_API_KEY="key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   MAILGUN_DOMAIN="sandbox-xxxxxxxxxxxxxxxx.mailgun.org"
   MAILGUN_HOST="api.mailgun.net"
   EMAIL_FROM="AURA Home & Living <orders@sandbox-xxxxxxxxxxxxxxxx.mailgun.org>"
   ```

*(Note: If Mailgun credentials are not yet configured, the app automatically runs in Mock Preview mode: checkout will succeed, and you can click the **"View Email Preview"** button on the order confirmation screen to inspect the exact rendered HTML confirmation invoice).*

---

## 4. Running the Application

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.
