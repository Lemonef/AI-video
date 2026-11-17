import React from 'react';
import {InkParts} from './InkParts';
import type {Part} from '../parts/schema';
import demo from '../parts/cardlib/demo2.json';

const part = demo as unknown as Part;
export const CARD_LIBRARY2_FRAMES = part.f1;
export const CardLibrary2: React.FC = () => <InkParts parts={[part]}/>;