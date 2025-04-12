import React, { useState } from 'react';

const SequenceBuilder = () => {
  const [sequence, setSequence] = useState({
    name: '',
    description: '',
    messages: [
      { id: 1, content: '', delayDays: 0, delayHours: 0 }
    ]
  });

  const handleSequenceChange = (e) => {
    const { name, value } = e.target;
    setSequence({ ...sequence, [name]: value });
  };

  const handleMessageChange = (id, field, value) => {
    const updatedMessages = sequence.messages.map(message => {
      if (message.id === id) {
        return { ...message, [field]: value };
      }
      return message;
    });
    setSequence({ ...sequence, messages: updatedMessages });
  };

  const addMessage = () => {
    const newId = Math.max(...sequence.messages.map(m => m.id), 0) + 1;
    setSequence({
      ...sequence,
      messages: [
        ...sequence.messages,
        { id: newId, content: '', delayDays: 0, delayHours: 0 }
      ]
    });
  };

  const removeMessage = (id) => {
    if (sequence.messages.length > 1) {
      setSequence({
        ...sequence,
        messages: sequence.messages.filter(message => message.id !== id)
      });
    }
  };

  const saveSequence = () => {
    console.log('Sequence saved:', sequence);
    // Here you would typically send this to your API
    alert('Sequence saved successfully!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Message Sequence Builder</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6 p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sequence Name
          </label>
          <input
            type="text"
            name="name"
            value={sequence.name}
            onChange={handleSequenceChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter sequence name"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={sequence.description}
            onChange={handleSequenceChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Describe the purpose of this sequence"
            rows="2"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        
        {sequence.messages.map((message, index) => (
          <div key={message.id} className="bg-white rounded-lg shadow mb-4 p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Message {index + 1}</h3>
              <button 
                onClick={() => removeMessage(message.id)}
                className="text-red-500 hover:text-red-700"
                disabled={sequence.messages.length === 1}
              >
                Remove
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Content
              </label>
              <textarea
                value={message.content}
                onChange={(e) => handleMessageChange(message.id, 'content', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter your message content here. You can use {{first_name}} as a variable."
                rows="4"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delay (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={message.delayDays}
                  onChange={(e) => handleMessageChange(message.id, 'delayDays', parseInt(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delay (Hours)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={message.delayHours}
                  onChange={(e) => handleMessageChange(message.id, 'delayHours', parseInt(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        ))}
        
        <button 
          onClick={addMessage}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded mb-6"
        >
          Add Message
        </button>
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={saveSequence}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
        >
          Save Sequence
        </button>
      </div>
    </div>
  );
};

export default SequenceBuilder; 