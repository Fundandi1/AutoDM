import React, { useState, useEffect } from 'react';
import { sequencesAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import CreateSequenceModal from '../components/CreateSequenceModal';

const MessagesList = () => {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useAuth();

  const fetchSequences = async () => {
    setLoading(true);
    try {
      const response = await sequencesAPI.getAll(currentUser.id);
      setSequences(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching sequences:', err);
      if (err.response?.status >= 500) {
        setError('Failed to load message sequences. Please try again.');
      } else {
        setSequences([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchSequences();
    }
  }, [currentUser]);

  const handleCreateSequenceClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSequenceCreated = () => {
    fetchSequences();
  };

  const handleDeleteSequence = async (sequenceId) => {
    if (!window.confirm('Are you sure you want to delete this sequence?')) {
      return;
    }

    try {
      await sequencesAPI.delete(sequenceId);
      fetchSequences();
    } catch (err) {
      console.error('Error deleting sequence:', err);
      setError('Failed to delete sequence. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Message Sequences</h1>
        <button 
          onClick={handleCreateSequenceClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
        >
          Create Message Sequence
        </button>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Loading sequences...</p>
          </div>
        ) : sequences.length === 0 ? (
          <div className="p-6 border-b">
            <p className="text-gray-500">No message sequences found. Create a sequence to organize your follow-up messages.</p>
          </div>
        ) : (
          <div className="divide-y">
            {sequences.map(sequence => (
              <div key={sequence._id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">{sequence.name}</h2>
                    <p className="text-sm text-gray-500">{sequence.steps?.length || 0} steps</p>
                    {sequence.description && (
                      <p className="text-sm text-gray-500 mt-1">{sequence.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => {/* TODO: Implement edit functionality */}}
                    >
                      Edit
                    </button>
                    <span className="text-gray-300">|</span>
                    <button 
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteSequence(sequence._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <CreateSequenceModal 
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSequenceCreated}
      />
    </div>
  );
};

export default MessagesList; 