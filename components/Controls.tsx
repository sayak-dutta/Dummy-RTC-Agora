
import React, { useState } from 'react';
import type { ControlsProps } from '../types';

const Controls: React.FC<ControlsProps> = ({ tracks, onLeave, isHost }) => {
  const [trackState, setTrackState] = useState({ video: true, audio: true });

  const mute = async (type: 'audio' | 'video') => {
    if (!tracks) return;
    
    if (type === 'audio') {
      await tracks[0].setEnabled(!trackState.audio);
      setTrackState(ps => ({ ...ps, audio: !ps.audio }));
    } else if (type === 'video') {
      await tracks[1].setEnabled(!trackState.video);
      setTrackState(ps => ({ ...ps, video: !ps.video }));
    }
  };

  const MicIcon = ({ enabled }: { enabled: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {enabled ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3zM15 12a5 5 0 00-10 0" />
      )}
    </svg>
  );

  const CameraIcon = ({ enabled }: { enabled: boolean }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {enabled ? (
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        ) : (
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        )}
     </svg>
  );


  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-70 p-4 flex justify-center items-center">
      <div className="flex space-x-4">
        {isHost && tracks && (
          <>
            <button onClick={() => mute('audio')} className={`p-3 rounded-full ${trackState.audio ? 'bg-blue-600' : 'bg-gray-600'} text-white`}>
              <MicIcon enabled={trackState.audio} />
            </button>
            <button onClick={() => mute('video')} className={`p-3 rounded-full ${trackState.video ? 'bg-blue-600' : 'bg-gray-600'} text-white`}>
              <CameraIcon enabled={trackState.video} />
            </button>
          </>
        )}
        <button onClick={onLeave} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition duration-300">
          Leave
        </button>
      </div>
    </div>
  );
};

export default Controls;
