import React, { useState, useEffect, useMemo } from 'react';
import AgoraRTC, { IAgoraRTCRemoteUser, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
// FIX: Replace deprecated `createMicrophoneAndCameraTracks` with modern hooks.
import { useLocalMicrophoneTrack, useLocalCameraTrack } from 'agora-rtc-react';
import VideoPlayer from './VideoPlayer';
import Controls from './Controls';
import type { Livestream, AgoraConfig } from '../types';
import { AGORA_APP_ID } from '../constants';
import { getViewerToken, startStream } from '../services/apiService';


// The createClient factory is not available in the CDN module, so we replicate its behavior.
// This creates a hook that provides a stable, memoized Agora client instance.
const useClient = () => useMemo(() => AgoraRTC.createClient({ codec: 'vp8', mode: 'live' }), []);

interface VideoSessionProps {
  isHost: boolean;
  onLeave: () => void;
  stream?: Livestream;
  config?: AgoraConfig;
}

const VideoSession: React.FC<VideoSessionProps> = ({ isHost, onLeave, stream, config }) => {
  const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [start, setStart] = useState(false);
  const [sessionConfig, setSessionConfig] = useState<AgoraConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const client = useClient();
  
  // FIX: Use individual hooks for tracks, and only enable them if the user is a host.
  const { localMicrophoneTrack, error: micError } = useLocalMicrophoneTrack(isHost);
  const { localCameraTrack, error: camError } = useLocalCameraTrack(isHost);

  // Combine tracks into a tuple for easier handling, similar to the old `tracks` variable.
  const tracks = useMemo(() => {
      if (localMicrophoneTrack && localCameraTrack) {
          // FIX: The types from `agora-rtc-react` hooks are not directly assignable to `agora-rtc-sdk-ng` types.
          // Cast through `unknown` to assert compatibility, as suggested by the TypeScript error.
          return [localMicrophoneTrack, localCameraTrack] as unknown as [IMicrophoneAudioTrack, ICameraVideoTrack];
      }
      return null;
  }, [localMicrophoneTrack, localCameraTrack]);

  // Handle media device errors
  useEffect(() => {
    if (micError || camError) {
      console.error("Microphone or Camera error:", micError, camError);
      setError(`Could not access your ${micError ? 'microphone' : ''}${micError && camError ? ' and ' : ''}${camError ? 'camera' : ''}. Please check permissions and try again.`);
      if(isHost) {
          setIsLoading(false);
      }
    }
  }, [micError, camError, isHost]);


  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (config) { // This is a 1:1 video call
          setSessionConfig(config);
        } else if (stream) { // This is a livestream
          let token: string, channel: string;
          if (isHost) {
            const data = await startStream(stream.id);
            token = data.agoraToken;
            channel = data.channelName;
          } else {
            const data = await getViewerToken(stream.id);
            token = data.agoraToken;
            channel = data.channelName;
          }
          setSessionConfig({ appId: AGORA_APP_ID, channel, token });
        } else {
           throw new Error("No stream or config provided for video session.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to get session credentials. Cannot join the call.");
      } 
      // For non-hosts, we can stop loading. For hosts, we wait for media tracks.
      if (!isHost) {
          setIsLoading(false);
      }
    };
    init();
  }, [stream, config, isHost]);


  useEffect(() => {
    // We only want to join the channel when we have a session config, and if we are a host, when media tracks are ready.
    // The media tracks are ready when the `tracks` variable is not null.
    if (!sessionConfig || !client || (isHost && !tracks)) return;

    // If we have tracks as a host, we can stop the main loading indicator.
    if (isHost) setIsLoading(false);

    const initSession = async () => {
      try {
        if (isHost) {
          client.setClientRole('host');
          // Join, then publish tracks
          await client.join(sessionConfig.appId, sessionConfig.channel, sessionConfig.token, null);
          // The tracks check above ensures `tracks` is not null here.
          await client.publish(tracks!);
        } else {
          client.setClientRole('audience');
          await client.join(sessionConfig.appId, sessionConfig.channel, sessionConfig.token, null);
        }

        setStart(true);
      } catch (error) {
        console.error('Failed to join channel', error);
        setError('Could not connect to the Agora channel.');
      }
    };

    initSession();
    
  }, [sessionConfig, client, tracks, isHost]);

   useEffect(() => {
    if (!client) return;
    
    const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
      await client.subscribe(user, mediaType);
      // After subscribing, add user to state to render them
      setUsers((prevUsers) => {
        // Prevent adding duplicates
        if (prevUsers.find(u => u.uid === user.uid)) {
          return prevUsers.map(u => u.uid === user.uid ? user : u); // Update user object
        }
        return [...prevUsers, user]
      });
    };

    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
        setUsers((prevUsers) => prevUsers.map(u => u.uid === user.uid ? user : u));
    };

    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
        setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-left', handleUserLeft);

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-left', handleUserLeft);
    };
  }, [client]);


  const leaveChannel = async () => {
    await client.leave();
    client.removeAllListeners();
    // Close local tracks to release camera and microphone
    localMicrophoneTrack?.close();
    localCameraTrack?.close();
    setStart(false);
    onLeave();
  };
  
  const videoGridClass = () => {
    const totalUsers = users.length + (isHost && start ? 1 : 0);
    if (totalUsers <= 1) return "grid-cols-1 grid-rows-1";
    if (totalUsers === 2) return "grid-cols-2 grid-rows-1";
    if (totalUsers <= 4) return "grid-cols-2 grid-rows-2";
    if (totalUsers <= 6) return "grid-cols-3 grid-rows-2";
    return "grid-cols-3 grid-rows-3";
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-xl animate-pulse">Preparing Session...</p></div>;
  }
  if (error) {
     return (
        <div className="flex flex-col justify-center items-center h-screen text-center p-4">
            <p className="text-xl text-red-400 mb-4">{error}</p>
            <button onClick={onLeave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Return Home</button>
        </div>
      );
  }

  return (
    <div className="h-screen w-full flex flex-col p-4 pb-20 box-border">
       <h2 className="text-2xl font-bold mb-4 text-white truncate">{stream?.title || `Video Call: ${sessionConfig?.channel}`}</h2>
      <div className={`flex-1 grid gap-4 ${videoGridClass()}`}>
        {start && isHost && tracks && (
          <div className="w-full h-full min-h-0">
            <VideoPlayer user={{ uid: 'local' }} videoTrack={tracks[1]} audioTrack={tracks[0]} />
          </div>
        )}
        {users.map((user) => (
          <div className="w-full h-full min-h-0" key={user.uid}>
            <VideoPlayer user={user} videoTrack={user.videoTrack} audioTrack={user.audioTrack}/>
          </div>
        ))}
      </div>
      <Controls tracks={isHost && tracks ? tracks : null} onLeave={leaveChannel} isHost={isHost} />
    </div>
  );
};

export default VideoSession;
