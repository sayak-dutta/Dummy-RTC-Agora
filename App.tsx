import React, { useState, useEffect, useCallback } from 'react';
import type { View, Livestream, AgoraConfig } from './types';
import { getLivestreams, createLivestream as apiCreateLivestream, generateVideoCallToken } from './services/apiService';
import { AGORA_APP_ID } from './constants';
import LivestreamCard from './components/LivestreamCard';
import VideoSession from './components/VideoSession';
import CreateSessionModal from './components/CreateSessionModal';

// Helper component for Home Screen
const HomeScreen = ({ 
  livestreams, 
  onJoinStream, 
  onStartStream, 
  onStartVideoCall 
}: { 
  livestreams: Livestream[]; 
  onJoinStream: (stream: Livestream) => void;
  onStartStream: () => void;
  onStartVideoCall: () => void;
}) => (
  <div className="p-4 md:p-8">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-bold text-white">Live Now</h1>
      <div className="flex space-x-4">
        <button onClick={onStartVideoCall} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Start 1:1 Call</button>
        <button onClick={onStartStream} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Go Live</button>
      </div>
    </div>
    {livestreams.length === 0 ? (
       <div className="text-center text-gray-400 py-20">
            <p className="text-2xl">No active streams right now.</p>
            <p>Why not be the first to go live?</p>
        </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {livestreams.map(stream => (
          <LivestreamCard key={stream.id} stream={stream} onJoin={onJoinStream} />
        ))}
      </div>
    )}
  </div>
);

export default function App() {
  const [view, setView] = useState<View>({ name: 'home' });
  const [livestreams, setLivestreams] = useState<Livestream[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<'none' | 'livestream' | 'videocall'>('none');

  const fetchStreams = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const streams = await getLivestreams();
      setLivestreams(streams);
    } catch (err) {
      setError('Failed to fetch livestreams. The API might be down.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view.name === 'home') {
      fetchStreams();
    }
  }, [view, fetchStreams]);

  const handleStartStream = () => setModal('livestream');
  const handleStartVideoCall = () => setModal('videocall');
  
  const submitLivestream = async (title: string) => {
    setModal('none');
    setIsLoading(true);
    setError(null);
    try {
      const newStream = await apiCreateLivestream(title, "My new stream!");
      setView({ name: 'livestream', stream: newStream, isHost: true });
    } catch (err) {
      setError('Could not start stream. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitVideoCall = async (channelName: string) => {
    setModal('none');
    setIsLoading(true);
    setError(null);
    try {
      const token = await generateVideoCallToken(channelName);
      const config: AgoraConfig = { appId: AGORA_APP_ID, channel: channelName, token };
      setView({ name: 'videocall', config });
    } catch (err) {
       setError('Could not start video call.');
       console.error(err);
    } finally {
      setIsLoading(false);
    }
  };


  const handleJoinStream = (stream: Livestream) => {
    setView({ name: 'livestream', stream, isHost: false });
  };

  const returnToHome = () => {
    setView({ name: 'home' });
  };

  const renderContent = () => {
    if (isLoading && view.name === 'home') {
      return <div className="flex justify-center items-center h-screen"><p className="text-xl">Loading Streams...</p></div>;
    }

    if (error) {
       return (
        <div className="flex flex-col justify-center items-center h-screen text-center">
            <p className="text-xl text-red-400 mb-4">{error}</p>
            <button onClick={returnToHome} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Return Home</button>
        </div>
      );
    }

    switch (view.name) {
      case 'livestream':
        return <VideoSession isHost={view.isHost} stream={view.stream} onLeave={returnToHome} />;
      case 'videocall':
        return <VideoSession isHost={true} config={view.config} onLeave={returnToHome} />;
      case 'home':
      default:
        return <HomeScreen 
          livestreams={livestreams} 
          onJoinStream={handleJoinStream} 
          onStartStream={handleStartStream}
          onStartVideoCall={handleStartVideoCall}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <header className="bg-gray-800 p-4 shadow-lg flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 001.553.832l3-2a1 1 0 000-1.664l-3-2z" />
        </svg>
        <h1 className="text-2xl font-bold cursor-pointer" onClick={returnToHome}>Agora Stream</h1>
      </header>
      <main>
        {renderContent()}
      </main>
      {modal !== 'none' && (
        <CreateSessionModal
          mode={modal}
          onSubmit={modal === 'livestream' ? submitLivestream : submitVideoCall}
          onCancel={() => setModal('none')}
        />
      )}
    </div>
  );
}