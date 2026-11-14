import React from 'react';
import layout from './private-caption-layout.json';

// Source-specific analytical lettering for the PRIVATE benchmark only.
// The five-frame timing uncertainty and OCR proof are preserved in the manifest.
export const SourceCaptions:React.FC<{frame:number;font:string}>=({frame,font})=>{
 const c=layout.chunks.find(k=>frame>=k.start&&frame<k.end);
 if(!c)return null;
 const red=c.emphasis==='red',emphasis=c.emphasis.split(' '),age=frame-c.start;
 const alpha=Math.min(1,(age+1)/3,(c.end-frame)/3);
 const tokens=c.text.split(' ');
 return <text x={c.x} y={c.baseline} textAnchor="middle" fontFamily={font} fontSize={c.height/.74}
  textLength={c.width} lengthAdjust="spacingAndGlyphs" opacity={alpha} fill={red?'#cb4334':'#efeee5'}
  style={{filter:'drop-shadow(0 3px 2px #101a1a99)'}}>
  {tokens.map((word,i)=><tspan key={i} fill={!red&&emphasis.includes(word)?(/SCREAMING|JAMMED|NOTICED|GRABS|COME|TEN|WHISPERS/.test(word)?'#cb4334':'#d9b33b'):undefined}>{word}{i<tokens.length-1?' ':''}</tspan>)}
 </text>;
};
