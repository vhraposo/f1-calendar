import type { ReactNode } from 'react';
import type { ColorValue } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { colors } from '@/design-system/tokens';

export type IconName =
  | 'bell'
  | 'bellOff'
  | 'alarm'
  | 'calendarPlus'
  | 'calendarCheck'
  | 'chevronRight'
  | 'chevronLeft'
  | 'chevronDown'
  | 'settings'
  | 'globe'
  | 'check'
  | 'close'
  | 'flag'
  | 'timer'
  | 'mapPin'
  | 'info'
  | 'refresh'
  | 'wifiOff'
  | 'externalLink'
  | 'tv'
  | 'radio'
  | 'car'
  | 'plus'
  | 'trash'
  | 'alert'
  | 'share';

export interface AppIconProps {
  name: IconName;
  size?: number;
  color?: ColorValue;
  strokeWidth?: number;
}

function renderIcon(name: IconName): ReactNode {
  switch (name) {
    case 'bell':
      return (
        <>
          <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </>
      );
    case 'bellOff':
      return (
        <>
          <Path d="M13.7 21a2 2 0 0 1-3.4 0" />
          <Path d="M18.6 13.5A16 16 0 0 1 21 17H8" />
          <Path d="M6.3 6.3A6 6 0 0 0 6 8c0 7-3 9-3 9h11" />
          <Line x1="3" y1="3" x2="21" y2="21" />
        </>
      );
    case 'alarm':
      return (
        <>
          <Circle cx="12" cy="13" r="8" />
          <Path d="M12 9v4l2.5 2.5" />
          <Path d="M5 3 2.5 5.5" />
          <Path d="M19 3l2.5 2.5" />
        </>
      );
    case 'calendarPlus':
      return (
        <>
          <Rect x="3" y="4" width="18" height="18" rx="2" />
          <Line x1="16" y1="2" x2="16" y2="6" />
          <Line x1="8" y1="2" x2="8" y2="6" />
          <Line x1="3" y1="10" x2="21" y2="10" />
          <Line x1="12" y1="14" x2="12" y2="18" />
          <Line x1="10" y1="16" x2="14" y2="16" />
        </>
      );
    case 'calendarCheck':
      return (
        <>
          <Rect x="3" y="4" width="18" height="18" rx="2" />
          <Line x1="16" y1="2" x2="16" y2="6" />
          <Line x1="8" y1="2" x2="8" y2="6" />
          <Line x1="3" y1="10" x2="21" y2="10" />
          <Polyline points="9 16 11 18 15 14" />
        </>
      );
    case 'chevronRight':
      return <Polyline points="9 18 15 12 9 6" />;
    case 'chevronLeft':
      return <Polyline points="15 18 9 12 15 6" />;
    case 'chevronDown':
      return <Polyline points="6 9 12 15 18 9" />;
    case 'settings':
      return (
        <>
          <Circle cx="12" cy="12" r="3" />
          <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </>
      );
    case 'globe':
      return (
        <>
          <Circle cx="12" cy="12" r="9" />
          <Line x1="3" y1="12" x2="21" y2="12" />
          <Path d="M12 3a14.5 14.5 0 0 1 0 18 14.5 14.5 0 0 1 0-18z" />
        </>
      );
    case 'check':
      return <Polyline points="20 6 9 17 4 12" />;
    case 'close':
      return (
        <>
          <Line x1="18" y1="6" x2="6" y2="18" />
          <Line x1="6" y1="6" x2="18" y2="18" />
        </>
      );
    case 'flag':
      return (
        <>
          <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <Line x1="4" y1="22" x2="4" y2="15" />
        </>
      );
    case 'timer':
      return (
        <>
          <Circle cx="12" cy="13" r="8" />
          <Line x1="12" y1="9" x2="12" y2="13" />
          <Line x1="12" y1="13" x2="15" y2="15" />
          <Line x1="9" y1="2" x2="15" y2="2" />
        </>
      );
    case 'mapPin':
      return (
        <>
          <Path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
          <Circle cx="12" cy="10" r="3" />
        </>
      );
    case 'info':
      return (
        <>
          <Circle cx="12" cy="12" r="9" />
          <Line x1="12" y1="16" x2="12" y2="12" />
          <Line x1="12" y1="8" x2="12.01" y2="8" />
        </>
      );
    case 'refresh':
      return (
        <>
          <Polyline points="23 4 23 10 17 10" />
          <Polyline points="1 20 1 14 7 14" />
          <Path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15" />
        </>
      );
    case 'wifiOff':
      return (
        <>
          <Line x1="1" y1="1" x2="23" y2="23" />
          <Path d="M16.7 13.3A11 11 0 0 1 20 15.5" />
          <Path d="M5 12.5a11 11 0 0 1 4-2.5" />
          <Path d="M8.5 16a6 6 0 0 1 7 0" />
          <Line x1="12" y1="20" x2="12.01" y2="20" />
        </>
      );
    case 'externalLink':
      return (
        <>
          <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <Polyline points="15 3 21 3 21 9" />
          <Line x1="10" y1="14" x2="21" y2="3" />
        </>
      );
    case 'tv':
      return (
        <>
          <Rect x="2" y="7" width="20" height="14" rx="2" />
          <Polyline points="17 2 12 7 7 2" />
        </>
      );
    case 'radio':
      return (
        <>
          <Circle cx="12" cy="12" r="2" />
          <Path d="M16.2 7.8a6 6 0 0 1 0 8.4" />
          <Path d="M7.8 16.2a6 6 0 0 1 0-8.4" />
          <Path d="M19 5a10 10 0 0 1 0 14" />
          <Path d="M5 19a10 10 0 0 1 0-14" />
        </>
      );
    case 'car':
      return (
        <>
          <Path d="M5 17H3v-4l2-5h10l3 5h3v4h-2" />
          <Circle cx="7.5" cy="17.5" r="2" />
          <Circle cx="16.5" cy="17.5" r="2" />
        </>
      );
    case 'plus':
      return (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" />
          <Line x1="5" y1="12" x2="19" y2="12" />
        </>
      );
    case 'trash':
      return (
        <>
          <Polyline points="3 6 5 6 21 6" />
          <Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <Path d="M10 11v6M14 11v6" />
          <Path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </>
      );
    case 'alert':
      return (
        <>
          <Circle cx="12" cy="12" r="9" />
          <Line x1="12" y1="8" x2="12" y2="13" />
          <Line x1="12" y1="16" x2="12.01" y2="16" />
        </>
      );
    case 'share':
      return (
        <>
          <Circle cx="18" cy="5" r="3" />
          <Circle cx="6" cy="12" r="3" />
          <Circle cx="18" cy="19" r="3" />
          <Line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
          <Line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
        </>
      );
    default:
      return <Circle cx="12" cy="12" r="9" />;
  }
}

export function AppIcon({ name, size = 20, color = colors.textPrimary, strokeWidth = 1.8 }: AppIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {renderIcon(name)}
    </Svg>
  );
}
