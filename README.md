# Cluster QC Tool

A web-based quality control tool for cleaning and verifying AI-generated face cluster datasets. Built to turn raw face recognition model output into a clean, verified golden dataset ready for training.

## What it does

For a specific use-case of face recognition, in terms of kind of data we need to optimise the model for, we would need to fine tune model and tet on a golden datset representative of all our use cases.
For creating GD, we can use open source models direct "cluster output" and correct the inaccuracies, giving us a clean set (This is if the open source model doesn't have good accuracy on our dataset)

This tool provides a structured 3-step workflow to manually verify and correct that output:

1. **Remove** — Review each cluster and flag faces that don't belong
2. **Merge** — Combine clusters that belong to the same person
3. **Reassign** — Send each removed face to the correct cluster, create a new one, or discard it

At the end, export a CSV summary of every change made — or send it directly to an admin with one click.

## Features

- Email + Google OAuth authentication
- Project dashboard — create multiple projects, resume from where you left off
- Auto-save — state is saved to the database after every action
- Lazy-loaded thumbnails for performance with large datasets (5000+ images)
- Image size toggle (S / M / L) for comfortable review
- Admin panel — read-only view of all users and their projects
- CSV export with full change log (merged, reassigned, discarded)
- Email delivery of completed CSV to admin via Resend

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Auth:** Supabase Auth (email + Google OAuth)
- **Database:** Supabase PostgreSQL with Row Level Security
- **Storage:** Supabase Storage (private bucket, signed URLs)
- **Styling:** Tailwind CSS
- **Email:** Resend
- **Deployment:** Vercel

## Input Format

Upload a folder where each subfolder is one cluster ID containing face crop images:
