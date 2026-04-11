import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import type { TTSStatus } from '@/types';

interface UseTTSOptions {
  text: string;
  rate?: number;
  pitch?: number;
}

interface UseTTSReturn {
  status: TTSStatus;
  loopCount: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  toggle: () => void;
  canPause: boolean; // false on Android — shows stop instead
}

export function useTTS({ text, rate = 1.0, pitch = 1.0 }: UseTTSOptions): UseTTSReturn {
  const [status, setStatus] = useState<TTSStatus>('idle');
  const [loopCount, setLoopCount] = useState(0);

  // useRef so the onDone closure always reads the latest value without stale capture
  const shouldLoopRef = useRef(false);
  const statusRef = useRef<TTSStatus>('idle');

  const canPause = Platform.OS === 'ios';

  // Keep statusRef in sync
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      shouldLoopRef.current = false;
      Speech.stop();
    };
  }, []);

  // Restart if text/rate/pitch changes while playing
  useEffect(() => {
    if (statusRef.current === 'playing') {
      shouldLoopRef.current = false;
      Speech.stop();
      // Brief delay to let stop settle before re-speaking
      const timeout = setTimeout(() => {
        shouldLoopRef.current = true;
        setStatus('playing');
        speakOnce();
      }, 100);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, rate, pitch]);

  const speakOnce = useCallback(() => {
    Speech.speak(text, {
      rate,
      pitch,
      onDone: () => {
        if (shouldLoopRef.current) {
          setLoopCount(n => n + 1);
          speakOnce();
        }
      },
      onStopped: () => {
        setStatus('stopped');
      },
      onError: () => {
        shouldLoopRef.current = false;
        setStatus('stopped');
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, rate, pitch]);

  const play = useCallback(() => {
    shouldLoopRef.current = true;
    setStatus('playing');
    setLoopCount(0);
    speakOnce();
  }, [speakOnce]);

  const pause = useCallback(() => {
    if (!canPause) return;
    Speech.pause();
    setStatus('paused');
  }, [canPause]);

  const stop = useCallback(() => {
    shouldLoopRef.current = false;
    Speech.stop();
    setStatus('stopped');
  }, []);

  const toggle = useCallback(() => {
    if (statusRef.current === 'playing') {
      if (canPause) {
        pause();
      } else {
        stop();
      }
    } else if (statusRef.current === 'paused') {
      Speech.resume();
      setStatus('playing');
    } else {
      play();
    }
  }, [canPause, pause, play, stop]);

  return { status, loopCount, play, pause, stop, toggle, canPause };
}
