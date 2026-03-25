'use client';

import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { useSocket } from './useSocket';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export const useCall = () => {
  const { socket } = useSocket();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callerSignal, setCallerSignal] = useState<any>();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState('');
  const [callEnded, setCallEnded] = useState(false);
  
  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    if (!socket) return;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    });

    socket.on('incoming-call', (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerName(data.name);
      setCallerSignal(data.signal);
    });
  }, [socket]);

  const callUser = (id: string) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream!,
    });

    peer.on('signal', (data) => {
      socket?.emit('call-user', {
        userToCall: id,
        signalData: data,
        from: user?.id,
        name: user?.name,
      });
    });

    peer.on('stream', (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    socket?.on('call-accepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream!,
    });

    peer.on('signal', (data) => {
      socket?.emit('answer-call', { signal: data, to: caller });
    });

    peer.on('stream', (stream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = stream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current?.destroy();
    if (socket && caller) {
      socket.emit('end-call', { to: caller });
    }
    window.location.reload(); // Simple way to reset state
  };

  return {
    stream,
    receivingCall,
    caller,
    callerName,
    callAccepted,
    callEnded,
    myVideo,
    userVideo,
    callUser,
    answerCall,
    leaveCall,
  };
};
