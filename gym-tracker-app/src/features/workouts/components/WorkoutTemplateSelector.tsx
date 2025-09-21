import React, { useState } from 'react';
import { useTemplateRecommendations } from '../../../hooks/useWorkoutTemplates';
import type { TemplateSelectionCriteria, Equipment, WorkoutGoal } from '../../../types/workout';

interface WorkoutTemplateSelectorProps {
  onTemplateSelected: (templateId: string) => void;
}

export function WorkoutTemplateSelector({ onTemplateSelected }: WorkoutTemplateSelectorProps) {
  const [criteria, setCriteria] = useState<TemplateSelectionCriteria>({
    frequency: 3,
    experience_level: 'beginner',
    available_equipment: ['machine', 'bodyweight'],
    time_per_session: 60,
    goals: ['general-fitness'],
  });

  const { recommendations, bestRecommendation, hasRecommendations } = useTemplateRecommendations(criteria);

  const handleFrequencyChange = (frequency: number) => {
    setCriteria(prev => ({ ...prev, frequency }));
  };

  const handleExperienceChange = (experience_level: 'beginner' | 'intermediate' | 'advanced') => {
    setCriteria(prev => ({ ...prev, experience_level }));
  };

  const handleEquipmentChange = (equipment: Equipment, checked: boolean) => {
    setCriteria(prev => ({
      ...prev,
      available_equipment: checked
        ? [...prev.available_equipment, equipment]
        : prev.available_equipment.filter(e => e !== equipment),
    }));
  };

  const handleGoalChange = (goal: WorkoutGoal, checked: boolean) => {
    setCriteria(prev => ({
      ...prev,
      goals: checked
        ? [...prev.goals, goal]
        : prev.goals.filter(g => g !== goal),
    }));
  };

  return (
    <div className="workout-template-selector">
      <h2>Find Your Perfect Workout Template</h2>
      
      <div className="criteria-form">
        <div className="form-group">
          <label>How many days per week do you want to train?</label>
          <select 
            value={criteria.frequency} 
            onChange={(e) => handleFrequencyChange(Number(e.target.value))}
          >
            <option value={3}>3 days</option>
            <option value={4}>4 days</option>
            <option value={5}>5 days</option>
            <option value={6}>6 days</option>
          </select>
        </div>

        <div className="form-group">
          <label>What's your experience level?</label>
          <select 
            value={criteria.experience_level} 
            onChange={(e) => handleExperienceChange(e.target.value as any)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="form-group">
          <label>How much time do you have per session?</label>
          <input
            type="range"
            min="30"
            max="120"
            step="15"
            value={criteria.time_per_session}
            onChange={(e) => setCriteria(prev => ({ 
              ...prev, 
              time_per_session: Number(e.target.value) 
            }))}
          />
          <span>{criteria.time_per_session} minutes</span>
        </div>

        <div className="form-group">
          <label>Available Equipment:</label>
          <div className="checkbox-group">
            {(['machine', 'dumbbell', 'barbell', 'bodyweight', 'cable'] as Equipment[]).map(equipment => (
              <label key={equipment}>
                <input
                  type="checkbox"
                  checked={criteria.available_equipment.includes(equipment)}
                  onChange={(e) => handleEquipmentChange(equipment, e.target.checked)}
                />
                {equipment.charAt(0).toUpperCase() + equipment.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Fitness Goals:</label>
          <div className="checkbox-group">
            {(['strength', 'muscle-building', 'endurance', 'weight-loss', 'general-fitness'] as WorkoutGoal[]).map(goal => (
              <label key={goal}>
                <input
                  type="checkbox"
                  checked={criteria.goals.includes(goal)}
                  onChange={(e) => handleGoalChange(goal, e.target.checked)}
                />
                {goal.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="recommendations">
        {hasRecommendations ? (
          <>
            <h3>Recommended Templates</h3>
            {bestRecommendation && (
              <div className="best-recommendation">
                <h4>🏆 Best Match: {bestRecommendation.template.name}</h4>
                <p>{bestRecommendation.template.description}</p>
                <div className="score">Match Score: {bestRecommendation.score}/100</div>
                
                <div className="reasons">
                  <h5>Why this template is great for you:</h5>
                  <ul>
                    {bestRecommendation.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>

                {bestRecommendation.adaptations.length > 0 && (
                  <div className="adaptations">
                    <h5>Adaptations needed:</h5>
                    <ul>
                      {bestRecommendation.adaptations.map((adaptation, index) => (
                        <li key={index}>{adaptation}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button 
                  onClick={() => onTemplateSelected(bestRecommendation.template.id)}
                  className="select-template-btn"
                >
                  Select This Template
                </button>
              </div>
            )}

            {recommendations.length > 1 && (
              <div className="other-recommendations">
                <h4>Other Options:</h4>
                {recommendations.slice(1, 4).map((rec, index) => (
                  <div key={index} className="recommendation-card">
                    <h5>{rec.template.name}</h5>
                    <p>{rec.template.description}</p>
                    <div className="score">Score: {rec.score}/100</div>
                    <button 
                      onClick={() => onTemplateSelected(rec.template.id)}
                      className="select-template-btn secondary"
                    >
                      Select
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="no-recommendations">
            <p>No templates match your current criteria. Try adjusting your preferences.</p>
          </div>
        )}
      </div>
    </div>
  );
}