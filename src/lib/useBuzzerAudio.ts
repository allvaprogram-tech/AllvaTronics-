import { useEffect, useRef } from 'react';

export function useBuzzerAudio(isActive: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (isActive) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (!oscillatorRef.current) {
        oscillatorRef.current = audioCtxRef.current.createOscillator();
        oscillatorRef.current.type = 'square';
        oscillatorRef.current.frequency.value = 500; // 500Hz typical buzzer
        
        const gainNode = audioCtxRef.current.createGain();
        gainNode.gain.value = 0.1; // low volume
        
        oscillatorRef.current.connect(gainNode);
        gainNode.connect(audioCtxRef.current.destination);
        oscillatorRef.current.start();
      }
    } else {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
    }
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch(e) {}
        oscillatorRef.current.disconnect();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(console.error);
      }
    };
  }, []);
}
