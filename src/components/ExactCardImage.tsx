import React from 'react';
import { CachedCardImage, CachedCardImageProps } from './CachedCardImage';

export interface ExactCardImageProps extends CachedCardImageProps {}

/**
 * EXACT eFootball Card Image Component (Backed by CachedCardImage)
 */
export const ExactCardImage: React.FC<ExactCardImageProps> = (props) => {
  return <CachedCardImage {...props} />;
};

