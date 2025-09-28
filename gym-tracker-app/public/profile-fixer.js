/**
 * Complete Profile Fix - Run this to solve the "Complete your profile" disappearing issue
 */

window.profileFixer = {
  
  async diagnoseAndFix() {
    console.group('🔧 Profile Issue - Complete Diagnosis & Fix');
    
    try {
      // Step 1: Check authentication
      const { data: { user } } = await window.supabase?.auth.getUser();
      if (!user) {
        console.error('❌ User not authenticated');
        console.groupEnd();
        return;
      }
      
      console.log('✅ User authenticated:', user.id);
      
      // Step 2: Check current profile
      const { data: profile, error: profileError } = await window.supabase
        .from('profile')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      console.log('📋 Current profile:', profile);
      if (profileError) console.log('❌ Profile error:', profileError);
      
      // Step 3: Check what onboarding fields are missing
      const onboardingFields = {
        full_name: profile?.full_name,
        fitness_goal: profile?.fitness_goal,
        experience_level: profile?.experience_level,
        workout_frequency: profile?.workout_frequency
      };
      
      const missingFields = Object.entries(onboardingFields)
        .filter(([_, value]) => !value)
        .map(([key, _]) => key);
      
      console.log('📊 Onboarding fields status:');
      console.table(onboardingFields);
      console.log('❌ Missing fields:', missingFields);
      
      // Step 4: Check if database has onboarding columns
      const { data: columns, error: columnsError } = await window.supabase
        .rpc('check_profile_columns');
      
      if (columnsError) {
        console.warn('⚠️ Could not check database columns:', columnsError);
        console.log('💡 The profile table might be missing onboarding columns');
        console.log('📝 Solution: Run the SQL migration in Supabase dashboard');
        console.log('🔗 SQL file: supabase/add-onboarding-fields.sql');
      }
      
      // Step 5: Provide fix recommendations
      if (missingFields.length > 0) {
        console.log('🎯 ISSUE IDENTIFIED: Profile is missing required onboarding fields');
        console.log('🔧 SOLUTIONS:');
        console.log('');
        console.log('Option 1 - Complete Profile (Recommended):');
        console.log('• Run: profileFixer.completeProfile()');
        console.log('• This will add sample onboarding data');
        console.log('');
        console.log('Option 2 - Add Database Columns:');
        console.log('• Go to Supabase Dashboard → SQL Editor');
        console.log('• Run the SQL from: supabase/add-onboarding-fields.sql');
        console.log('• Then run: profileFixer.completeProfile()');
        console.log('');
        console.log('Option 3 - Manual Navigation:');
        console.log('• Navigate to: window.location.href = "/onboarding"');
        
        return {
          needsFix: true,
          missingFields,
          profile
        };
      } else {
        console.log('✅ Profile appears complete');
        console.log('🤔 If "Complete your profile" is still showing, try:');
        console.log('• Refresh the page: window.location.reload()');
        console.log('• Clear auth cache: profileFixer.clearAuthCache()');
        
        return {
          needsFix: false,
          profile
        };
      }
      
    } catch (error) {
      console.error('💥 Diagnosis failed:', error);
      console.log('🔧 Try basic fix: profileFixer.basicFix()');
    } finally {
      console.groupEnd();
    }
  },

  async completeProfile() {
    console.group('✅ Completing Profile with Sample Data');
    
    try {
      const { data: { user } } = await window.supabase?.auth.getUser();
      if (!user) {
        console.error('❌ No user authenticated');
        console.groupEnd();
        return;
      }

      const profileData = {
        user_id: user.id,
        display_name: user.email?.split('@')[0] || 'User',
        full_name: user.email?.split('@')[0] || 'Test User',
        fitness_goal: 'Weight Loss',
        experience_level: 'Beginner', 
        workout_frequency: 3,
        weight: 70,
        height: 170,
        units: 'metric',
        locale: 'en',
        theme: 'system',
        timezone: 'UTC'
      };

      console.log('🔄 Updating profile with:', profileData);

      const { data, error } = await window.supabase
        .from('profile')
        .upsert(profileData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Profile update failed:', error);
        
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          console.log('💡 Missing database columns detected!');
          console.log('📝 Run this SQL in Supabase Dashboard:');
          console.log(`
ALTER TABLE public.profile 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS fitness_goal TEXT,
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS workout_frequency INTEGER,
ADD COLUMN IF NOT EXISTS weight NUMERIC(6,2),
ADD COLUMN IF NOT EXISTS height NUMERIC(6,2);
          `);
        }
        
        console.groupEnd();
        return;
      }

      console.log('✅ Profile updated successfully:', data);
      console.log('🎉 Profile should now be complete!');
      console.log('🔄 Refreshing page to see changes...');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('❌ Profile completion failed:', error);
    } finally {
      console.groupEnd();
    }
  },

  async clearAuthCache() {
    console.group('🧹 Clearing Auth Cache');
    
    try {
      // Refresh the auth session
      const { data, error } = await window.supabase?.auth.refreshSession();
      console.log('🔄 Auth session refresh:', error || 'Success');
      
      // Clear any stored data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      console.log('✅ Cache cleared');
      console.log('🔄 Refreshing page...');
      
      setTimeout(() => window.location.reload(), 1000);
      
    } catch (error) {
      console.error('❌ Cache clearing failed:', error);
    } finally {
      console.groupEnd();
    }
  },

  async basicFix() {
    console.group('🔧 Basic Fix Attempt');
    
    console.log('🔄 Running basic profile fix...');
    
    // Try to complete profile with minimal data
    await this.completeProfile();
    
    console.groupEnd();
  },

  async navigateToOnboarding() {
    console.log('🧭 Navigating to onboarding flow...');
    window.location.href = '/onboarding';
  }
};

// Auto-run diagnostics
console.log('🚀 Profile Fixer Loaded');
console.log('');
console.log('🎯 Available Commands:');
console.log('• profileFixer.diagnoseAndFix() - Full diagnosis');
console.log('• profileFixer.completeProfile() - Add sample profile data');
console.log('• profileFixer.clearAuthCache() - Clear auth cache');
console.log('• profileFixer.navigateToOnboarding() - Go to onboarding');
console.log('');

// Auto-run diagnosis
setTimeout(() => {
  console.log('🔄 Running automatic diagnosis...');
  window.profileFixer.diagnoseAndFix();
}, 1500);