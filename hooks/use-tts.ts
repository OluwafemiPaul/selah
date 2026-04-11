import * as Speech from 'expo-speech';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import type { TTSStatus } from '@/types';

const PUNCTUATION_PAUSE_MS = 500; // pause after commas and full stops
const INTER_LOOP_PAUSE_MS = 1000; // silence between each loop repetition

/** Split text into speakable segments at punctuation boundaries. */
function splitIntoSegments(text: string): string[] {
  return text
    .split(/(?<=[.,;?!:])\s*/)
    .map(s => s.trim())
    .filter(Boolean);
}

/** How long to pause after a segment before speaking the next one. */
function getPostSegmentDelay(segment: string, isLastSegment: boolean): number {
  if (isLastSegment) return INTER_LOOP_PAUSE_MS;
  if (/[.,;?!:]\s*$/.test(segment)) return PUNCTUATION_PAUSE_MS;
  return 0;
}

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

  const shouldLoopRef = useRef(false);
  const statusRef = useRef<TTSStatus>('idle');
  const segmentsRef = useRef<string[]>([]);
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When pause() is called during an inter-segment or inter-loop delay, we capture
  // what was about to be played so resume can pick up without repeating the wait.
  // null = was paused mid-utterance (Speech.resume() applies).
  // non-null = was paused during a timeout delay (speak this segment directly on resume).
  const pendingResumeRef = useRef<{ index: number; isNewLoop: boolean } | null>(null);

  // Mirrors the info stored in the active loopTimeout so pause() can capture it.
  const activeTimeoutInfoRef = useRef<{ index: number; isNewLoop: boolean } | null>(null);

  const canPause = Platform.OS === 'ios';

  // Keep statusRef in sync
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldLoopRef.current = false;
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
      Speech.stop();
    };
  }, []);

  const clearLoopTimeout = useCallback(() => {
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
    activeTimeoutInfoRef.current = null;
  }, []);

  // Forward ref so the recursive speakSegment call always uses the latest closure
  const speakSegmentRef = useRef<(index: number) => void>(() => {});

  const speakSegment = useCallback(
    (index: number) => {
      const segments = segmentsRef.current;
      if (!shouldLoopRef.current || index >= segments.length) return;

      const segment = segments[index];
      const isLast = index === segments.length - 1;
      const delay = getPostSegmentDelay(segment, isLast);

      Speech.speak(segment, {
        rate,
        pitch,
        onDone: () => {
          if (!shouldLoopRef.current) return;

          // Paused mid-utterance: onDone fires after the last word is spoken but
          // before the next segment starts. Store the next step for resume.
          if (statusRef.current === 'paused') {
            pendingResumeRef.current = { index: isLast ? 0 : index + 1, isNewLoop: isLast };
            return;
          }

          if (delay > 0) {
            const info = { index: isLast ? 0 : index + 1, isNewLoop: isLast };
            activeTimeoutInfoRef.current = info;
            loopTimeoutRef.current = setTimeout(() => {
              activeTimeoutInfoRef.current = null;
              loopTimeoutRef.current = null;
              if (!shouldLoopRef.current) return;
              // Pause was called while this timeout was running
              if (statusRef.current === 'paused') {
                pendingResumeRef.current = info;
                return;
              }
              if (info.isNewLoop) setLoopCount(n => n + 1);
              speakSegmentRef.current(info.index);
            }, delay);
          } else {
            speakSegmentRef.current(index + 1);
          }
        },
        onStopped: () => {
          // Fired by Speech.stop() — not by Speech.pause() — so guard against
          // the pause case where we stop an individual segment's utterance.
          if (statusRef.current !== 'paused') {
            setStatus('stopped');
          }
        },
        onError: () => {
          shouldLoopRef.current = false;
          setStatus('stopped');
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rate, pitch]
  );

  // Keep forward ref current whenever speakSegment changes (rate/pitch change)
  useEffect(() => {
    speakSegmentRef.current = speakSegment;
  }, [speakSegment]);

  // Restart from the beginning if text/rate/pitch changes while already playing
  useEffect(() => {
    if (statusRef.current === 'playing') {
      clearLoopTimeout();
      shouldLoopRef.current = false;
      Speech.stop();
      const timeout = setTimeout(() => {
        shouldLoopRef.current = true;
        setStatus('playing');
        segmentsRef.current = splitIntoSegments(text);
        speakSegment(0);
      }, 100);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, rate, pitch]);

  const play = useCallback(() => {
    clearLoopTimeout();
    shouldLoopRef.current = true;
    pendingResumeRef.current = null;
    setStatus('playing');
    setLoopCount(0);
    segmentsRef.current = splitIntoSegments(text);
    speakSegment(0);
  }, [clearLoopTimeout, speakSegment, text]);

  const pause = useCallback(() => {
    if (!canPause) return;
    // Capture and cancel any active inter-segment or inter-loop timeout
    const pending = activeTimeoutInfoRef.current;
    clearLoopTimeout();
    if (pending) {
      // Was waiting in a silence gap — store it so resume can skip the delay
      pendingResumeRef.current = pending;
    }
    Speech.pause();
    setStatus('paused');
  }, [canPause, clearLoopTimeout]);

  const stop = useCallback(() => {
    clearLoopTimeout();
    shouldLoopRef.current = false;
    pendingResumeRef.current = null;
    Speech.stop();
    setStatus('stopped');
  }, [clearLoopTimeout]);

  const toggle = useCallback(() => {
    if (statusRef.current === 'playing') {
      if (canPause) {
        pause();
      } else {
        stop();
      }
    } else if (statusRef.current === 'paused') {
      const pending = pendingResumeRef.current;
      pendingResumeRef.current = null;
      setStatus('playing');
      if (pending) {
        // Was paused during a silence gap — speak the next segment immediately
        if (pending.isNewLoop) setLoopCount(n => n + 1);
        speakSegmentRef.current(pending.index);
      } else {
        // Was paused mid-utterance — let the TTS engine resume where it left off
        Speech.resume();
      }
    } else {
      play();
    }
  }, [canPause, pause, play, stop]);

  return { status, loopCount, play, pause, stop, toggle, canPause };
}
