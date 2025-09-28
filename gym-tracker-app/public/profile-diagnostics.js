/**
 * Profile Completion Issue Diagnostics
 * Run this in Chrome Console to diagnose profile completion problems
 */

window.profileDiagnostics = {
  
  async checkProfile() {
    console.group('🔍 Profile Completion Diagnostics');
    
    try {
      // Check current auth state
      const { data: { user } } = await window.supabase?.auth.getUser();
      console.log('👤 Current user:', user?.id || 'Not authenticated');
      
      if (!user) {
        console.error('❌ User not authenticated');
        console.groupEnd();
        return;
      }

      // Check profile data
      const { data: profile, error } = await window.supabase
        .from('profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('📋 Profile data:', profile);
      console.log('❌ Profile error:', error);

      if (!profile) {
        console.warn('⚠️ No profile found - user needs onboarding');
        return { needsOnboarding: true, profile: null };
      }

      // Check profile completeness
      const requiredFields = ['full_name', 'fitness_goal', 'experience_level', 'workout_frequency'];
      const missingFields = requiredFields.filter(field => !profile[field]);
      
      console.log('✅ Required fields present:', requiredFields.filter(field => profile[field]));
      console.log('❌ Missing fields:', missingFields);
      
      const isComplete = missingFields.length === 0;
      console.log(`📊 Profile ${isComplete ? 'COMPLETE' : 'INCOMPLETE'}`);

      // Check workout plans
      const { data: plans, error: plansError } = await window.supabase
        .from('plans')
        .select('*')
        .eq('user_id', user.id);

      console.log('🏋️ Workout plans:', plans?.length || 0, plans);
      console.log('❌ Plans error:', plansError);

      console.groupEnd();
      return {
        needsOnboarding: !isComplete,
        profile,
        missingFields,
        workoutPlans: plans
      };

    } catch (error) {
      console.error('💥 Profile diagnostics failed:', error);
      console.groupEnd();
    }
  },

  async fixProfileTimeout() {
    console.group('🔧 Fixing Profile Timeout Issues');
    
    try {
      // Clear any cached auth data
      await window.supabase?.auth.refreshSession();
      console.log('✅ Auth session refreshed');
      
      // Test direct profile fetch
      const { data: { user } } = await window.supabase?.auth.getUser();
      if (user) {
        const startTime = performance.now();
        const { data: profile, error } = await window.supabase
          .from('profile')
          .select('*')
          .eq('user_id', user.id)
          .single();
        const duration = performance.now() - startTime;
        
        console.log(`⏱️ Profile fetch took: ${Math.round(duration)}ms`);
        console.log('📋 Profile result:', { profile, error });
        
        if (duration > 5000) {
          console.warn('⚠️ Slow profile fetch detected - potential database issue');
        }
      }
      
    } catch (error) {
      console.error('❌ Fix attempt failed:', error);
    }
    
    console.groupEnd();
  },

  async testOnboardingStatus() {
    console.group('🎯 Testing Onboarding Status Logic');
    
    const result = await this.checkProfile();
    
    if (!result) {
      console.error('❌ Could not check profile');
      console.groupEnd();
      return;
    }

    console.log('🔄 Onboarding logic test:');
    console.table({
      'Needs Onboarding': result.needsOnboarding,
      'Has Profile': !!result.profile,
      'Missing Fields': result.missingFields?.length || 0,
      'Has Workout Plans': result.workoutPlans?.length || 0
    });

    // Test what the app should show
    if (result.needsOnboarding) {
      console.log('🎯 App should show: Onboarding flow');
    } else {
      console.log('🎯 App should show: Dashboard');
    }

    console.groupEnd();
  },

  async simulateProfileCompletion() {
    console.group('🧪 Simulating Profile Completion');
    
    try {
      const { data: { user } } = await window.supabase?.auth.getUser();
      if (!user) {
        console.error('❌ No user to test with');
        console.groupEnd();
        return;
      }

      // Get current profile
      const { data: currentProfile } = await window.supabase
        .from('profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('📋 Current profile:', currentProfile);

      // Simulate completing missing fields
      const updates = {};
      if (!currentProfile?.full_name) updates.full_name = 'Test User';
      if (!currentProfile?.fitness_goal) updates.fitness_goal = 'Weight Loss';
      if (!currentProfile?.experience_level) updates.experience_level = 'Beginner';
      if (!currentProfile?.workout_frequency) updates.workout_frequency = 3;

      console.log('🔄 Simulated updates:', updates);

      if (Object.keys(updates).length > 0) {
        console.log('⚠️ Would update profile with:', updates);
        console.log('💡 Run: profileDiagnostics.actuallyCompleteProfile() to apply');
      } else {
        console.log('✅ Profile already complete!');
      }

    } catch (error) {
      console.error('❌ Simulation failed:', error);
    }

    console.groupEnd();
  },

  async actuallyCompleteProfile() {
    console.group('✅ Actually Completing Profile');
    
    try {
      const { data: { user } } = await window.supabase?.auth.getUser();
      if (!user) {
        console.error('❌ No user authenticated');
        console.groupEnd();
        return;
      }

      const updates = {
        full_name: 'Test User',
        fitness_goal: 'Weight Loss',
        experience_level: 'Beginner',
        workout_frequency: 3,
        units: 'metric'
      };

      const { data, error } = await window.supabase
        .from('profile')
        .upsert({
          user_id: user.id,
          ...updates
        })
        .select()
        .single();

      console.log('✅ Profile update result:', { data, error });

      if (!error) {
        console.log('🎉 Profile completed successfully!');
        console.log('🔄 Refreshing page to see changes...');
        setTimeout(() => window.location.reload(), 2000);
      }

    } catch (error) {
      console.error('❌ Profile completion failed:', error);
    }

    console.groupEnd();
  }
};

// Auto-run diagnostics
console.log('🚀 Profile Diagnostics Loaded');
console.log('📊 Available commands:');
console.log('• profileDiagnostics.checkProfile() - Check current profile status');
console.log('• profileDiagnostics.fixProfileTimeout() - Fix timeout issues');
console.log('• profileDiagnostics.testOnboardingStatus() - Test onboarding logic');
console.log('• profileDiagnostics.simulateProfileCompletion() - Simulate completion');
console.log('• profileDiagnostics.actuallyCompleteProfile() - Actually complete profile');

// Auto-run basic diagnostics
setTimeout(() => {
  console.log('🔄 Running automatic profile diagnostics...');
  window.profileDiagnostics.checkProfile();
}, 1000);