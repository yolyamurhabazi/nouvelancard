import { CSSProperties } from 'react';

export interface CardState {
  image: string | null;
  year: string;
  date: string;
  message: string;
  backgroundColor: string;
  accentColor: string;
}

export interface DecorationProps {
  className?: string;
  style?: CSSProperties;
}