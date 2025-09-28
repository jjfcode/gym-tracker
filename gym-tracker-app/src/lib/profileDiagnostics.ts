import { supabase } from '../lib/supabase';

/**
 * Debug utility to diagnose profile completion issues
 */
export class ProfileDiagnostics {
  
  /**
   * Check the current user's profile status
   */
  static async diagnoseProfile(userId: string) {
    console.group('🔍 Profile Diagnostics');
    
    try {
      // 1. Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('1. Auth Status:', {
        authenticated: !!user,
        userId: user?.id,
        email: user?.email,
        error: authError?.message
      });

      if (!user) {
        console.error('❌ User not authenticated');
        return false;
      }

      // 2. Check if profile table exists and user has access
      console.log('2. Checking profile table access...');
      const { error: profileError } = await supabase
        .from('profile')
        .select('*')
        .limit(1);
      
      if (profileError) {
        console.error('❌ Profile table access error:', profileError);
        return false;
      }
      console.log('✅ Profile table accessible');

      // 3. Check current user's profile
      console.log('3. Fetching current profile...');
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profile')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          console.warn('⚠️ Profile not found for user');
          
          // 4. Try to create profile
          console.log('4. Attempting to create profile...');
          const { data: newProfile, error: createError } = await supabase
            .from('profile')
            .insert({
              user_id: userId,
              display_name: user.email?.split('@')[0] || 'User',
              locale: 'en',
              units: 'imperial',
              theme: 'system',
            })
            .select()
            .single();

          if (createError) {
            console.error('❌ Failed to create profile:', createError);
            return false;
          }
          
          console.log('✅ Profile created:', newProfile);
          return true;
        } else {
          console.error('❌ Profile fetch error:', fetchError);
          return false;
        }
      }

      console.log('✅ Current profile:', currentProfile);
      
      // 5. Check profile completeness
      const isComplete = !!(currentProfile.display_name && currentProfile.display_name.trim());
      console.log('5. Profile completeness:', {
        hasDisplayName: !!currentProfile.display_name,
        displayNameValue: currentProfile.display_name,
        isComplete
      });

      return isComplete;

    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
      return false;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Test profile update functionality
   */
  static async testProfileUpdate(userId: string, displayName: string) {
    console.group('🧪 Testing Profile Update');
    
    try {
      console.log('Attempting to update profile...');
      const { data, error } = await supabase
        .from('profile')
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Update failed:', error);
        return false;
      }

      console.log('✅ Update successful:', data);
      return true;

    } catch (error) {
      console.error('❌ Update test failed:', error);
      return false;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Complete diagnostic and repair sequence
   */
  static async runFullDiagnostic(userId: string) {
    console.log('🚀 Starting full profile diagnostic...');
    
    const isProfileComplete = await this.diagnoseProfile(userId);
    
    if (!isProfileComplete) {
      console.log('🔧 Profile incomplete, testing update functionality...');
      const updateWorks = await this.testProfileUpdate(userId, 'Test User');
      
      if (updateWorks) {
        console.log('✅ Profile update functionality works - the issue may be in the onboarding flow');
      } else {
        console.log('❌ Profile update functionality broken - database or permissions issue');
      }
    } else {
      console.log('✅ Profile is complete');
    }
    
    return isProfileComplete;
  }
}

// Helper function to run diagnostics from console
(window as any).diagnoseProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    return ProfileDiagnostics.runFullDiagnostic(user.id);
  } else {
    console.error('No authenticated user found');
    return false;
  }
};

console.log('💡 Profile diagnostics loaded. Run diagnoseProfile() in console to test.');