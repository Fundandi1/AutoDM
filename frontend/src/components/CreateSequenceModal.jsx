import React, { useState } from 'react';
import { sequencesAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const CreateSequenceModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    steps: [
      { 
        id: 1, 
        message: '', 
        delay_hours: 0,
        conditions: {}
      }
    ]
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...formData.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value
    };
    setFormData({ ...formData, steps: updatedSteps });
  };

  const addStep = () => {
    const newId = Math.max(...formData.steps.map(step => step.id), 0) + 1;
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        { 
          id: newId, 
          message: '', 
          delay_hours: 24,
          conditions: {}
        }
      ]
    });
  };

  const removeStep = (index) => {
    if (formData.steps.length > 1) {
      const updatedSteps = [...formData.steps];
      updatedSteps.splice(index, 1);
      setFormData({ ...formData, steps: updatedSteps });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Sequence name is required');
      return;
    }
    
    // Validate steps
    const invalidSteps = formData.steps.filter(step => !step.message.trim());
    if (invalidSteps.length > 0) {
      setError('All message steps must have content');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const sequenceData = {
        ...formData,
        user_id: currentUser?.id
      };
      
      // Log sequenceData for debugging
      console.log('Creating sequence with data:', sequenceData);
      
      const response = await sequencesAPI.create(sequenceData);
      console.log('Sequence created successfully:', response.data);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        steps: [
          { 
            id: 1, 
            message: '', 
            delay_hours: 0,
            conditions: {}
          }
        ]
      });
      
      // Notify parent of success
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal
      onClose();
    } catch (err) {
      console.error('Error creating sequence:', err);
      setError(err.response?.data?.message || 'Failed to create message sequence');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Message Sequence</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Sequence Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="My Message Sequence"
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe what this sequence is for..."
              disabled={loading}
            />
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Message Steps
              </label>
              <button
                type="button"
                onClick={addStep}
                className="text-sm text-primary-600 hover:text-primary-700"
                disabled={loading}
              >
                + Add Step
              </button>
            </div>
            
            {formData.steps.map((step, index) => (
              <div key={step.id} className="border rounded-md p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Step {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    disabled={loading || formData.steps.length === 1}
                  >
                    Remove
                  </button>
                </div>
                
                <div className="mb-3">
                  <label htmlFor={`step-${step.id}-message`} className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id={`step-${step.id}-message`}
                    value={step.message}
                    onChange={(e) => handleStepChange(index, 'message', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder={index === 0 ? "Initial message..." : "Follow-up message..."}
                    disabled={loading}
                  />
                </div>
                
                <div className="flex items-center">
                  <label htmlFor={`step-${step.id}-delay`} className="block text-sm font-medium text-gray-700 mr-2">
                    Wait
                  </label>
                  <input
                    type="number"
                    id={`step-${step.id}-delay`}
                    value={step.delay_hours}
                    onChange={(e) => handleStepChange(index, 'delay_hours', parseInt(e.target.value, 10) || 0)}
                    min="0"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    disabled={loading || index === 0}
                  />
                  <span className="ml-2 text-sm text-gray-700">hours before sending</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Sequence'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSequenceModal; 