# Supabase Database Setup

This directory contains the database schema and setup scripts for the Gym Tracker application.

## Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Go to Settings > API to get your project URL and API keys

### 2. Configure Environment Variables

Copy the example environment file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Set Up Database Schema

#### Option A: Manual Setup (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL Editor and run it
5. Verify all tables are created in the Table Editor

#### Option B: Automated Setup (Advanced)

```bash
npm run setup:database
```

### 4. Verify Setup

Run the database test to ensure everything is working:

```bash
npm run test:database
```

## Database Schema

The database includes the following tables:

### Core Tables

- **profile** - User profile information and preferences
- **weight_logs** - Body weight tracking data
- **plans** - Workout plan configurations
- **workouts** - Individual workout sessions
- **exercises** - Exercises within workouts
- **exercise_sets** - Individual sets with weight, reps, RPE

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Automatic profile creation on user signup
- Secure authentication with Supabase Auth

### Performance Optimizations

- Indexes on frequently queried columns
- Optimized for user-specific data access
- Efficient date-based queries for workouts and weight logs

## Database Relationships

```
auth.users (Supabase Auth)
    ↓
profile (1:1)
    ↓
├── weight_logs (1:many)
├── plans (1:many)
│   └── workouts (1:many)
│       └── exercises (1:many)
│           └── exercise_sets (1:many)
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (for setup only) | Setup only |

## Troubleshooting

### Common Issues

1. **Tables not created**: Ensure you have the correct service role key and permissions
2. **RLS errors**: Make sure Row Level Security policies are properly created
3. **Connection errors**: Verify your project URL and API keys are correct

### Testing Connection

Use the built-in test utilities:

```typescript
import { testDatabaseSetup } from '../src/lib/database-test'

const result = await testDatabaseSetup()
console.log(result)
```

### Manual Verification

Check these items in your Supabase dashboard:

1. **Tables**: All 6 tables should exist in the Table Editor
2. **RLS**: Each table should show "RLS enabled" 
3. **Policies**: Each table should have appropriate RLS policies
4. **Indexes**: Check the Database > Indexes section

## Security Notes

- Never commit your `.env.local` file
- The service role key should only be used for initial setup
- All user data is protected by Row Level Security
- Authentication is handled by Supabase Auth

## Next Steps

After database setup is complete:

1. Test the connection using the test utilities
2. Proceed to implement the authentication system
3. Build the UI components that interact with the database
4. Test the complete user flow from signup to data entry