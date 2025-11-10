import React, { useState } from 'react';

interface CreateSessionModalProps {
  mode: 'livestream' | 'videocall';
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

const CreateSessionModal: React.FC<CreateSessionModalProps> = ({ mode, onSubmit, onCancel }) => {
  const [value, setValue] = useState('');

  const title = mode === 'livestream' ? 'Start a New Livestream' : 'Start a New Video Call';
  const label = mode === 'livestream' ? 'Stream Title' : 'Room Name';
  const placeholder = mode === 'livestream' ? 'e.g., My Awesome Coding Session' : 'e.g., project-sync-up';
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 hover:scale-100">
        <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="session-name" className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <input 
              type="text" 
              id="session-name"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
              required
            />
          </div>
          <div className="mt-8 flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancel</button>
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">Start</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSessionModal;