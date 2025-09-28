import React, { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button/Button';
import { Card } from '../../../components/ui/Card/Card';
import { useAuth } from '../../auth';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import styles from './WorkoutPlanStatus.module.css';

interface WorkoutPlanStatus {
  hasActivePlan: boolean;
  planCount: number;
  nextWorkoutDate?: string | undefined;
  isLoading: boolean;
}

export const WorkoutPlanStatus: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<WorkoutPlanStatus>({
    hasActivePlan: false,
    planCount: 0,
    isLoading: true,
  });

  useEffect(() => {
    if (!user?.id) return;

    const checkWorkoutPlanStatus = async () => {
      try {
        // Check for active plans
        const { data: plans, error: plansError } = await supabase
          .from('plans')
          .select('id, start_date, goal_days_per_week, meta')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (plansError) {
          console.error('Error fetching plans:', plansError);
          setStatus(prev => ({ ...prev, isLoading: false }));
          return;
        }

        // Check for upcoming workouts
        const today = new Date().toISOString().split('T')[0];
        const { data: workouts, error: workoutsError } = await supabase
          .from('workouts')
          .select('date, title')
          .eq('user_id', user.id)
          .gte('date', today)
          .eq('is_completed', false)
          .order('date', { ascending: true })
          .limit(1);

        if (workoutsError) {
          console.error('Error fetching workouts:', workoutsError);
        }

        setStatus({
          hasActivePlan: (plans?.length || 0) > 0,
          planCount: plans?.length || 0,
          nextWorkoutDate: workouts?.[0]?.date || undefined,
          isLoading: false,
        });

        if (plans?.length > 0) {
          console.log('✅ User has active workout plans:', plans.length);
          console.log('📊 Plan details:', plans.map(p => ({
            id: p.id,
            daysPerWeek: p.goal_days_per_week,
            startDate: p.start_date,
            fromOnboarding: (p.meta as any)?.created_from_onboarding
          })));
        }
      } catch (error) {
        console.error('Error checking workout plan status:', error);
        setStatus(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkWorkoutPlanStatus();
  }, [user?.id]);

  if (status.isLoading) {
    return (
      <div className={styles['loading']}>
        <span>Checking your workout plan...</span>
      </div>
    );
  }

  if (!status.hasActivePlan) {
    return (
      <Card className={styles['noplanCard']}>
        <div className={styles['noPlanContent']}>
          <h4>🏋️‍♂️ No Workout Plan Found</h4>
          <p>It looks like your workout plan wasn't created during onboarding. Would you like to create one now?</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/onboarding')}
          >
            Create Workout Plan
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={styles['planCard']}>
      <div className={styles['planContent']}>
        <h4>🎯 Workout Plan Active</h4>
        <p>
          You have {status.planCount} active workout plan{status.planCount > 1 ? 's' : ''}. 
          {status.nextWorkoutDate && (
            <span> Next workout: {new Date(status.nextWorkoutDate).toLocaleDateString()}</span>
          )}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/planning')}
        >
          View Calendar
        </Button>
      </div>
    </Card>
  );
};