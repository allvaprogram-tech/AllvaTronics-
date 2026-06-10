import React from 'react';
import { useBuzzerAudio } from './useBuzzerAudio';

export function BuzzerAudio({ isAlive }: { isAlive: boolean }) {
  useBuzzerAudio(isAlive);
  return null;
}
