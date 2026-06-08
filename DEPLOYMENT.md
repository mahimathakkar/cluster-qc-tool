# Deployment Guide — Cluster QC Tool

A step-by-step guide for deploying to production. No prior experience required.

---

## Prerequisites

- A GitHub account
- A Supabase account (free at supabase.com)
- A Vercel account (free at vercel.com)

---

## Step 1 — Set up Supabase

### 1.1 Create a project

1. Go to [supabase.com](https://supabase.com) → New project
2. Choose a name (e.g. `cluster-qc-tool`) and a strong database password
3. Select the region closest to your users
4. Wait ~2 minutes for the project to spin up

### 1.2 Run the database migration

1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **+ New query**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL editor and click **Run**
5. You should see "Success. No rows returned."

### 1.3 Create the Storage bucket

1. Click **Storage** (left sidebar)
2. Click **New bucket**
3. Name it exactly: `cluster-images`
4. Toggle **Private bucket** ON (do not make it public)
5. Click **Save**

### 1.4 Set Storage RLS policies

In the SQL editor, run:

```sql
-- Allow authenticated users to upload to their own path
create policy "Users upload own images"
on storage.objects for insert
with check (
  bucket_id = 'cluster-images'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to read/list their own images; admins read all
create policy "Users read own images"
on storage.objects for select
using (
  bucket_id = 'cluster-images'
  and (
    auth.uid()::text = (storage.foldername(name))[1]
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  )
);
```

### 1.5 Configure Auth settings

1. Go to **Authentication** → **Providers** → ensure **Email** is enabled
2. Go to **Authentication** → **URL Configuration**:
   - **Site URL**: set to your Vercel URL once deployed (e.g. `https://cluster-qc-tool.vercel.app`)
   - **Redirect URLs**: add the same URL + `/auth/login`
3. **Email confirmation**: 
   - If you want users to verify their email first, leave it on
   - For instant access (recommended for internal tool), go to **Authentication → Settings** and disable "Confirm email"

### 1.6 Get your API keys

1. Go to **Settings** (gear icon, bottom left) → **API**
2. Copy:
   - **Project URL** (starts with `https://`)
   - **anon public** key
   - **service_role** key (keep this secret!)

---

## Step 2 — Push to GitHub

```bash
cd cluster-qc-tool
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cluster-qc-tool.git
git push -u origin main
```

---

## Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Framework will auto-detect as **Next.js**
4. **Before clicking Deploy**, add environment variables:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key |

5. Click **Deploy**
6. Wait ~2 minutes for the first build

---

## Step 4 — Update Supabase Auth URLs

Once you have your Vercel URL (e.g. `https://cluster-qc-tool.vercel.app`):

1. Go to Supabase → **Authentication** → **URL Configuration**
2. Set **Site URL** to your Vercel URL
3. Add `https://cluster-qc-tool.vercel.app/**` to **Redirect URLs**

---

## Step 5 — Set up admin account

1. Go to your deployed app → **Sign up** with `mahima.t@aftershoot.com`
2. In Supabase SQL editor, run:
   ```sql
   update public.profiles set role = 'admin' where email = 'mahima.t@aftershoot.com';
   ```
3. Refresh the app — the **Admin** link will now appear in the nav

Alternatively, use the script:
```bash
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/set-admin.ts mahima.t@aftershoot.com
```

---

## Step 6 — Verify everything works

1. Visit your Vercel URL
2. Sign up with a test account
3. Create a new project with a small test folder (a few images, 2-3 subfolders)
4. Walk through all 4 steps
5. Verify the CSV export downloads correctly
6. Sign in as admin and verify the admin panel shows the test user

---

## Ongoing maintenance

### Custom domain
In Vercel → your project → **Settings → Domains**, add your domain. Then update the Supabase Auth URLs.

### Monitoring usage
Use the admin panel at `/admin` to see registered users and project activity.

### Updating the app
Push changes to the `main` branch on GitHub. Vercel will auto-redeploy within ~2 minutes.

### Backups
Supabase provides daily backups on paid plans. For the free tier, export your data periodically from Supabase → **Database** → **Backups**.

---

## Troubleshooting

**Images not loading**: Check that the `cluster-images` bucket is private and storage RLS policies are set.

**Login loop**: Ensure Supabase Site URL matches your deployment URL exactly.

**Upload fails for large folders**: Supabase free tier has 1GB storage. Upgrade if needed.

**Admin panel shows 403**: Make sure the profile row exists and role is set to `'admin'`.
