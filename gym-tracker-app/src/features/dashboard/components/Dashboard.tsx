import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui';
import { Button } from '../../../components/ui/Button/Button';
import { useAuth } from '../../auth';
import styles from './Dashboard.module.css';

// Simple components without React Query for now
const QuickStats: React.FC = () => {
  return (
    <div className={styles['quickStats']}>
      <h2 className={styles['title']}>This Week</h2>
      
      <div className={styles['statsGrid']}>
        <Card className={styles['statCard']}>
          <div className={styles['statValue']}>0</div>
          <div className={styles['statLabel']}>Workouts Completed</div>
        </Card>
        
        <Card className={styles['statCard']}>
          <div className={styles['statValue']}>0%</div>
          <div className={styles['statLabel']}>Weekly Goal</div>
        </Card>
        
        <Card className={styles['statCard']}>
          <div className={styles['statValue']}>○</div>
          <div className={styles['statLabel']}>Today's Workout</div>
        </Card>
        
        <Card className={styles['statCard']}>
          <div className={styles['statValue']}>0</div>
          <div className={styles['statLabel']}>Total Volume (lbs)</div>
        </Card>
      </div>
    </div>
  );
};

const WelcomeMessage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const displayName = user?.profile?.display_name || user?.email?.split('@')[0] || 'there';
  const isProfileIncomplete = !user?.profile?.display_name || user?.profile?.display_name.trim() === '';
  
  return (
    <Card className={styles['welcomeCard']}>
      <div className={styles['welcomeContent']}>
        <h2>Welcome to Gym Tracker, {displayName}! 🎯</h2>
        {isProfileIncomplete ? (
          <p>Let's complete your setup to personalize your fitness journey. You can start using the app right away or complete your profile first.</p>
        ) : (
          <p>You're all set up and ready to start your fitness journey. Here's how to get started:</p>
        )}
        
        <div className={styles['gettingStarted']}>
          {isProfileIncomplete && (
            <div className={styles['step']}>
              <span className={styles['stepNumber']}>0</span>
              <div className={styles['stepContent']}>
                <h4>Complete Your Profile</h4>
                <p>Set up your preferences and goals</p>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => navigate('/onboarding')}
                >
                  Complete Setup
                </Button>
              </div>
            </div>
          )}
          
          <div className={styles['step']}>
            <span className={styles['stepNumber']}>1</span>
            <div className={styles['stepContent']}>
              <h4>Plan Your Workouts</h4>
              <p>Set up your weekly workout schedule</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/planning')}
              >
                Go to Planning
              </Button>
            </div>
          </div>
          
          <div className={styles['step']}>
            <span className={styles['stepNumber']}>2</span>
            <div className={styles['stepContent']}>
              <h4>Log Your Weight</h4>
              <p>Track your progress over time</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/progress')}
              >
                Log Weight
              </Button>
            </div>
          </div>
          
          <div className={styles['step']}>
            <span className={styles['stepNumber']}>3</span>
            <div className={styles['stepContent']}>
              <h4>Start Your First Workout</h4>
              <p>Begin tracking your exercises</p>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => navigate('/workouts')}
              >
                Start Workout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const TodayWorkout: React.FC = () => {
  return (
    <Card className={styles['todayWorkout']}>
      <div className={styles['restDay']}>
        <h3>Today's Workout</h3>
        <p>No workout scheduled for today. Start by planning your weekly routine!</p>
      </div>
    </Card>
  );
};

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className={styles['quickActions']}>
      <h2 className={styles['title']}>Quick Actions</h2>
      
      <div className={styles['actionsGrid']}>
        <Card className={styles['actionCard']} hoverable>
          <Button 
            variant="ghost" 
            fullWidth
            onClick={() => navigate('/progress')}
          >
            📊 Log Weight
          </Button>
        </Card>
        
        <Card className={styles['actionCard']} hoverable>
          <Button 
            variant="ghost" 
            fullWidth
            onClick={() => navigate('/planning')}
          >
            📅 View Calendar
          </Button>
        </Card>
        
        <Card className={styles['actionCard']} hoverable>
          <Button 
            variant="ghost" 
            fullWidth
            onClick={() => navigate('/progress')}
          >
            📈 View Progress
          </Button>
        </Card>
        
        <Card className={styles['actionCard']} hoverable>
          <Button 
            variant="ghost" 
            fullWidth
            onClick={() => navigate('/settings')}
          >
            ⚙️ Settings
          </Button>
        </Card>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <div className={styles['dashboard']}>
      <div className={styles['welcomeSection']}>
        <WelcomeMessage />
      </div>
      
      <div className={styles['quickStats']}>
        <QuickStats />
      </div>
      
      <div className={styles['todaySection']}>
        <TodayWorkout />
      </div>
      
      <div className={styles['quickActions']}>
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;