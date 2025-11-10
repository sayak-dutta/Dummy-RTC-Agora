
import type { IAgoraRTCRemoteUser, ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";

export interface Livestream {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  streamer: {
    id: string;
    username: string;
    avatarUrl: string;
  };
  currentViewerCount: number;
  isLive: boolean;
  createdAt: string;
}

export interface AgoraConfig {
  appId: string;
  channel: string;
  token: string;
}

export type View =
  | { name: 'home' }
  | { name: 'livestream'; stream: Livestream; isHost: boolean }
  | { name: 'videocall'; config: AgoraConfig };

export interface ControlsProps {
  tracks: [IMicrophoneAudioTrack, ICameraVideoTrack] | null;
  onLeave: () => void;
  isHost: boolean;
}

export interface VideosProps {
  users: IAgoraRTCRemoteUser[];
  localTracks: [IMicrophoneAudioTrack, ICameraVideoTrack] | null;
}
