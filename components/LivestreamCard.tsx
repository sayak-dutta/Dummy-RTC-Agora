
import React from 'react';
import type { Livestream } from '../types';

interface LivestreamCardProps {
  stream: Livestream;
  onJoin: (stream: Livestream) => void;
}

const LivestreamCard: React.FC<LivestreamCardProps> = ({ stream, onJoin }) => {
  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 cursor-pointer group"
      onClick={() => onJoin(stream)}
    >
      <div className="relative">
        <img className="w-full h-48 object-cover" src={stream.thumbnailUrl} alt={stream.title} />
        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">LIVE</div>
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 text-xs font-bold rounded flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            {stream.currentViewerCount.toLocaleString()}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent"></div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg truncate group-hover:text-purple-400 transition-colors">{stream.title}</h3>
        <div className="flex items-center mt-2">
            <img className="w-8 h-8 rounded-full object-cover mr-3" src={stream.streamer.avatarUrl} alt={stream.streamer.username}/>
            <p className="text-sm text-gray-400">{stream.streamer.username}</p>
        </div>
      </div>
    </div>
  );
};

export default LivestreamCard;
