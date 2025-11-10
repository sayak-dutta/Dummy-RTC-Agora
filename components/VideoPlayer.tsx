
import React, { useRef, useEffect } from 'react';
// FIX: Import remote track types to support remote users' video and audio streams.
import type { IAgoraRTCRemoteUser, ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteVideoTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';

interface VideoPlayerProps {
  user: IAgoraRTCRemoteUser | { uid: string | number, hasVideo?: boolean, hasAudio?: boolean };
  // FIX: Broaden track types to accept both local camera/microphone tracks and remote tracks.
  videoTrack: ICameraVideoTrack | IRemoteVideoTrack | undefined;
  audioTrack: IMicrophoneAudioTrack | IRemoteAudioTrack | undefined;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ user, videoTrack, audioTrack }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    videoTrack?.play(container.current);
    return () => {
      videoTrack?.stop();
    };
  }, [container, videoTrack]);

  useEffect(() => {
    if(audioTrack){
      audioTrack?.play();
    }
    return () => {
      audioTrack?.stop();
    };
  }, [audioTrack]);

  return (
    <div ref={container} className="relative w-full h-full bg-black rounded-lg overflow-hidden">
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
            User {user.uid}
        </div>
    </div>
  );
};

export default VideoPlayer;