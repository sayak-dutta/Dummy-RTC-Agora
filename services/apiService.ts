
import { API_BASE_URL, JWT_TOKEN } from '../constants';
import type { Livestream } from '../types';

// MOCK DATA - In a real app, the backend would provide this.
const MOCK_STREAMS: Livestream[] = [
    { id: '1', title: 'Live Coding Session', description: 'Building a React app from scratch.', thumbnailUrl: 'https://picsum.photos/seed/coding/400/225', category: 'education', streamer: { id: 'u1', username: 'DevGuru', avatarUrl: 'https://i.pravatar.cc/150?u=devguru' }, currentViewerCount: 1250, isLive: true, createdAt: new Date().toISOString() },
    { id: '2', title: 'Dating Advice & Q&A', description: 'Answering your questions about modern dating.', thumbnailUrl: 'https://picsum.photos/seed/dating/400/225', category: 'dating', streamer: { id: 'u2', username: 'LoveDoctor', avatarUrl: 'https://i.pravatar.cc/150?u=lovedoctor' }, currentViewerCount: 840, isLive: true, createdAt: new Date().toISOString() },
    { id: '3', title: 'Chill Lo-fi Beats', description: '24/7 stream of relaxing music for study/work.', thumbnailUrl: 'https://picsum.photos/seed/music/400/225', category: 'entertainment', streamer: { id: 'u3', username: 'MusicFlow', avatarUrl: 'https://i.pravatar.cc/150?u=musicflow' }, currentViewerCount: 5200, isLive: true, createdAt: new Date().toISOString() },
    { id: '4', title: 'My First Stream!', description: 'Just testing things out!', thumbnailUrl: 'https://picsum.photos/seed/new/400/225', category: 'other', streamer: { id: 'u4', username: 'NewbieStreamer', avatarUrl: 'https://i.pravatar.cc/150?u=newbie' }, currentViewerCount: 15, isLive: true, createdAt: new Date().toISOString() },
];


// This is a mock API layer. In a real app, it would use fetch to call your backend.
// We will simulate the API calls with delays to mimic network latency.

const apiRequest = async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    // In a real app:
    // const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    //   ...options,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${JWT_TOKEN}`,
    //     ...options.headers,
    //   },
    // });
    // if (!response.ok) {
    //   throw new Error(`API call failed: ${response.statusText}`);
    // }
    // return response.json();

    // For this demo, we mock the responses.
    console.log(`Mock API Request: ${options.method || 'GET'} ${endpoint}`, options.body);
    await new Promise(res => setTimeout(res, 500)); // Simulate latency

    if (endpoint === '/livestreams' && options.method === 'GET') {
        return MOCK_STREAMS as T;
    }
    if (endpoint === '/livestreams' && options.method === 'POST') {
        const body = JSON.parse(options.body as string);
        const newStream: Livestream = {
            id: `stream-${Date.now()}`,
            title: body.title,
            description: body.description,
            thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/400/225`,
            category: 'other',
            streamer: { id: 'currentUser', username: 'Me', avatarUrl: 'https://i.pravatar.cc/150?u=me' },
            currentViewerCount: 0,
            isLive: false,
            createdAt: new Date().toISOString(),
        };
        MOCK_STREAMS.push(newStream);
        return newStream as T;
    }
    if (endpoint.match(/\/livestreams\/.+\/start/)) {
        const streamId = endpoint.split('/')[2];
        return { agoraToken: `mock_token_for_${streamId}`, channelName: `stream_${streamId}` } as T;
    }
    if (endpoint === '/livestreams/token') {
        const body = JSON.parse(options.body as string);
        if (body.streamId) { // For livestream viewers
            return { agoraToken: `mock_viewer_token_for_${body.streamId}`, channelName: `stream_${body.streamId}` } as T;
        }
        if (body.channelName) { // For 1:1 video calls
             return { agoraToken: `mock_videocall_token_for_${body.channelName}` } as T;
        }
    }

    throw new Error(`Mock API endpoint not found: ${endpoint}`);
};


export const getLivestreams = (): Promise<Livestream[]> => {
    return apiRequest<Livestream[]>('/livestreams', { method: 'GET' });
};

export const createLivestream = (title: string, description: string): Promise<Livestream> => {
    return apiRequest<Livestream>('/livestreams', {
        method: 'POST',
        body: JSON.stringify({ title, description, category: 'other' }),
    });
};

export const startStream = (streamId: string): Promise<{ agoraToken: string; channelName: string; }> => {
    return apiRequest<{ agoraToken: string; channelName:string; }>(`/livestreams/${streamId}/start`, { method: 'POST' });
};

export const getViewerToken = (streamId: string): Promise<{ agoraToken: string; channelName: string; }> => {
    return apiRequest<{ agoraToken: string, channelName: string }>(`/livestreams/token`, {
        method: 'POST',
        body: JSON.stringify({ streamId, role: 'audience' }),
    });
};

export const generateVideoCallToken = async (channelName: string): Promise<string> => {
    const response = await apiRequest<{ agoraToken: string }>(`/livestreams/token`, {
        method: 'POST',
        // In a real app, your backend would know how to handle this for non-livestream channels
        body: JSON.stringify({ channelName, role: 'publisher' }),
    });
    return response.agoraToken;
};
