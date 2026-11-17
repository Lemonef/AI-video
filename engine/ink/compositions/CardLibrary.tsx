import React from 'react';
import {InkParts} from './InkParts';
import type {Part} from '../parts/schema';
import demo from '../parts/cardlib/demo.json';

const part = demo as unknown as Part;
export const CARD_LIBRARY_FRAMES = part.f1;
export const CardLibrary: React.FC = () => <InkParts parts={[part]}/>;
