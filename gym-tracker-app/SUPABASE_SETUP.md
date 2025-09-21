# Supabase Database Setup Guide

This guide will walk you through setting up the Supabase database for the Gym Tracker application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- The Gym Tracker project cloned and dependencies installed

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `gym-tracker` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
5. Click "Create new project"
6. Wait for the project to be fully provisioned (this can take a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)
   - **service_role** key (also starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9` but is different)

## Step 3: Configure Environment Variables

1. In the `gym-tracker-app` directory, copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. Save the file

## Step 4: Set Up Database Schema

### Option A: Manual Setup (Recommended)

1. In your Supabase project dashboard, go to **SQL Editor**
2. Open the file `gym-tracker-app/supabase/schema.sql` in your code editor
3. Copy the entire contents of the file
4. Paste it into the SQL Editor in Supabase
5. Click **Run** to execute the SQL
6. Verify that all tables were created by going to **Table Editor**

You should see these tables:
- `profile`
- `weight_logs` 
- `plans`
- `workouts`
- `exercises`
- `exercise_sets`

### Option B: Automated Setup (Advanced)

If you prefer to use the automated setup script:

```bash
npm run setup:database
```

Note: This requires the service role key to be configured in your environment.

## Step 5: Verify Setup

Run the database test to ensure everything is working correctly:

```bash
npm run test:database
```

You should see output like:
```
📊 Database Setup Status
========================
Status: ✅ Success
Message: Database setup is complete and working correctly

Details:
- Tables exist: ✅
- RLS enabled: ✅
- Indexes created: ✅
```

## Step 6: Test the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The application should now be able to connect to your Supabase database

## Troubleshooting

### Common Issues

**"Missing Supabase environment variables" error:**
- Make sure your `.env.local` file exists and has the correct variable names
- Restart your development server after adding environment variables

**"Database connection failed" error:**
- Verify your project URL and anon key are correct
- Make sure your Supabase project is fully provisioned
- Check that you're using the correct region URL

**"Table does not exist" errors:**
- Make sure you ran the complete schema.sql file
- Check the Table Editor in Supabase to verify tables were created
- Ensure there were no SQL errors during schema execution

**RLS (Row Level Security) errors:**
- This is expected behavior when not authenticated
- RLS policies ensure users can only access their own data
- The application will handle authentication properly

### Manual Verification Steps

1. **Check Tables**: Go to Supabase Dashboard > Table Editor
   - All 6 tables should be visible
   - Each table should show "RLS enabled"

2. **Check Policies**: Go to Authentication > Policies
   - Each table should have multiple policies (SELECT, INSERT, UPDATE, DELETE)
   - Policies should be named like "Users can view own [table]"

3. **Check Indexes**: Go to Database > Indexes
   - You should see multiple indexes for performance optimization

## Security Notes

- **Never commit your `.env.local` file** - it contains sensitive credentials
- The **service role key** has admin access - only use it for setup
- The **anon key** is safe to use in client-side code
- All user data is protected by Row Level Security (RLS)

## Next Steps

Once your database is set up and tested:

1. ✅ Database schema created
2. ✅ Environment variables configured  
3. ✅ Connection tested
4. 🔄 Ready to implement authentication (Task 4)
5. 🔄 Ready to build UI components (Task 3)

Your Supabase database is now ready for the Gym Tracker application! 🎉