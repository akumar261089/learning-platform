import React, { useState, useEffect } from 'react';
import { Target, Plus, Calendar, CheckCircle, Trash2, Edit3 } from 'lucide-react';
import { storageService } from '../services/storage';
import { LearningGoal } from '../types';

interface LearningGoalsProps {
  courseId?: string;
}

export const LearningGoals: React.FC<LearningGoalsProps> = ({ courseId }) => {
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LearningGoal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: ''
  });

  useEffect(() => {
    loadGoals();
  }, [courseId]);

  const loadGoals = () => {
    const allGoals = storageService.getLearningGoals();
    const filteredGoals = courseId 
      ? allGoals.filter(g => g.courseId === courseId)
      : allGoals;
    setGoals(filteredGoals);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const goal: LearningGoal = {
      id: editingGoal?.id || `goal_${Date.now()}`,
      courseId: courseId || 'general',
      title: formData.title,
      description: formData.description,
      targetDate: formData.targetDate,
      completed: editingGoal?.completed || false,
      createdAt: editingGoal?.createdAt || Date.now()
    };

    storageService.saveLearningGoal(goal);
    loadGoals();
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', targetDate: '' });
    setShowAddForm(false);
    setEditingGoal(null);
  };

  const handleEdit = (goal: LearningGoal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      targetDate: goal.targetDate
    });
    setShowAddForm(true);
  };

  const handleDelete = (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      storageService.deleteLearningGoal(goalId);
      loadGoals();
    }
  };

  const toggleComplete = (goal: LearningGoal) => {
    const updatedGoal = { ...goal, completed: !goal.completed };
    storageService.saveLearningGoal(updatedGoal);
    loadGoals();
  };

  const isOverdue = (targetDate: string) => {
    return new Date(targetDate) < new Date() && targetDate !== '';
  };

  const getDaysUntilTarget = (targetDate: string) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Target className="h-5 w-5 mr-2 text-blue-600" />
          Learning Goals
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Goal
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">
            {editingGoal ? 'Edit Goal' : 'Add New Goal'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Goal title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <textarea
              placeholder="Goal description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                {editingGoal ? 'Update' : 'Add'} Goal
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No learning goals set yet</p>
            <p className="text-sm">Add goals to track your learning progress</p>
          </div>
        ) : (
          goals.map((goal) => {
            const daysUntilTarget = getDaysUntilTarget(goal.targetDate);
            const overdue = isOverdue(goal.targetDate);
            
            return (
              <div
                key={goal.id}
                className={`p-4 border rounded-lg transition-all duration-200 ${
                  goal.completed
                    ? 'bg-green-50 border-green-200'
                    : overdue
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <button
                        onClick={() => toggleComplete(goal)}
                        className={`mr-3 transition-colors duration-200 ${
                          goal.completed ? 'text-green-500' : 'text-gray-400 hover:text-green-500'
                        }`}
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <h4 className={`font-medium ${
                        goal.completed ? 'text-green-700 line-through' : 'text-gray-900'
                      }`}>
                        {goal.title}
                      </h4>
                    </div>
                    
                    {goal.description && (
                      <p className="text-gray-600 text-sm mb-2 ml-8">
                        {goal.description}
                      </p>
                    )}
                    
                    {goal.targetDate && (
                      <div className="flex items-center text-sm ml-8">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className={
                          overdue && !goal.completed
                            ? 'text-red-600 font-medium'
                            : goal.completed
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }>
                          {new Date(goal.targetDate).toLocaleDateString()}
                          {daysUntilTarget !== null && !goal.completed && (
                            <span className="ml-2">
                              ({daysUntilTarget > 0 ? `${daysUntilTarget} days left` : 
                                daysUntilTarget === 0 ? 'Due today' : 
                                `${Math.abs(daysUntilTarget)} days overdue`})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="text-gray-400 hover:text-blue-500 transition-colors duration-200"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};