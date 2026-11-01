import React from 'react';

// Private source-derived manual performance study, 270x480 screen plane.
// These are inspected drawing landmarks, not inferred motion capture. Screen
// space is deliberate: it separates acting from the separately fitted set camera.
type P=[number,number];
type Key={f:number;h:P;r:number;hip:P;lk:P;la:P;rk:P;ra:P;le:P;lw:P;re:P;rw:P};
const walk:Key[]=[
 {f:537,h:[47,281],r:28,hip:[49,390],lk:[42,415],la:[34,435],rk:[58,414],ra:[65,438],le:[38,335],lw:[43,361],re:[61,338],rw:[68,359]},
 {f:546,h:[60,279],r:28,hip:[58,389],lk:[50,414],la:[43,432],rk:[67,413],ra:[77,435],le:[48,334],lw:[47,357],re:[67,337],rw:[76,359]},
 {f:555,h:[74,278],r:28,hip:[71,388],lk:[62,414],la:[60,431],rk:[80,414],ra:[90,435],le:[62,335],lw:[61,357],re:[79,337],rw:[87,360]},
 {f:565,h:[87.5,277],r:28,hip:[85,388],lk:[77,411],la:[69,429],rk:[95,412],ra:[102,435],le:[76,332],lw:[72,354],re:[94,336],rw:[101,358]},
 {f:575,h:[99,276],r:28,hip:[99,388],lk:[93,412],la:[85,431],rk:[109,412],ra:[114,435],le:[88,334],lw:[87,357],re:[106,336],rw:[114,358]},
 {f:589,h:[122,277],r:28,hip:[121,390],lk:[116,413],la:[111,437],rk:[130,412],ra:[131,433],le:[112,335],lw:[109,360],re:[130,337],rw:[136,357]},
 {f:595,h:[130,277],r:28,hip:[129,390],lk:[124,413],la:[119,437],rk:[138,412],ra:[139,433],le:[120,335],lw:[117,360],re:[138,337],rw:[144,357]},
];
const pull:Key[]=[
 {f:1799,h:[50,265],r:32,hip:[53,381],lk:[55,405],la:[46,438],rk:[63,405],ra:[60,438],le:[67,304],lw:[72,326],re:[57,304],rw:[72,303]},
 {f:1810,h:[49.5,265],r:32,hip:[53,382],lk:[56,405],la:[46,439],rk:[64,405],ra:[60,439],le:[69,302],lw:[65,326],re:[60,302],rw:[72,300]},
 {f:1823,h:[47,256],r:32,hip:[51,378],lk:[54,403],la:[45,438],rk:[62,403],ra:[59,438],le:[66,292],lw:[61,320],re:[58,292],rw:[69,282]},
 {f:1842,h:[39,240],r:34,hip:[47,381],lk:[51,391],la:[40,432],rk:[61,391],ra:[57,432],le:[57,290],lw:[56,315],re:[46,291],rw:[61,274]},
 {f:1860,h:[38,238],r:34,hip:[46,379],lk:[50,391],la:[39,432],rk:[59,391],ra:[56,432],le:[61,285],lw:[62,301],re:[46,285],rw:[62,275]},
 {f:1885,h:[38,238],r:34,hip:[46,379],lk:[50,391],la:[39,432],rk:[59,391],ra:[56,432],le:[61,285],lw:[62,301],re:[46,285],rw:[62,275]},
];
const lastPull:Key[]=[
 {f:1962,h:[49.5,260],r:32,hip:[53,382],lk:[56,405],la:[46,438],rk:[64,405],ra:[60,438],le:[66,302],lw:[61,326],re:[57,298],rw:[69,282]},
 {f:1970,h:[49.5,260],r:32,hip:[53,382],lk:[56,405],la:[46,438],rk:[64,405],ra:[60,438],le:[68,302],lw:[62,326],re:[59,301],rw:[72,298]},
 {f:1981,h:[48.5,260],r:32,hip:[52,381],lk:[55,405],la:[46,438],rk:[63,405],ra:[60,438],le:[67,304],lw:[61,325],re:[59,302],rw:[73,302]},
 {f:1992,h:[43.5,252],r:33,hip:[49,379],lk:[52,403],la:[44,438],rk:[62,403],ra:[59,438],le:[63,299],lw:[65,312],re:[52,291],rw:[65,282]},
 {f:2001,h:[40,245],r:34,hip:[48,381],lk:[51,401],la:[40,439],rk:[61,401],ra:[57,439],le:[60,296],lw:[62,309],re:[48,295],rw:[65,294]},
];
const hesitate:Key[]=[
 {f:746,h:[154,282],r:28,hip:[153,389],lk:[146,414],la:[143,439],rk:[159,415],ra:[157,439],le:[134,336],lw:[137,363],re:[168,329],rw:[170,344]},
 {f:767,h:[151,280],r:28,hip:[150,387],lk:[143,413],la:[140,438],rk:[156,414],ra:[154,438],le:[131,334],lw:[134,361],re:[165,327],rw:[167,342]},
 {f:788,h:[140,278],r:29,hip:[139,388],lk:[132,413],la:[128,439],rk:[145,414],ra:[143,439],le:[120,333],lw:[123,360],re:[154,326],rw:[156,341]},
];
const keysWalk:Key[]=[
 {f:789,h:[130,284],r:28,hip:[128,391],lk:[124,415],la:[117,439],rk:[138,416],ra:[140,441],le:[113,338],lw:[112,364],re:[144,330],rw:[148,345]},
 {f:795,h:[130,284],r:28,hip:[128,391],lk:[124,415],la:[117,439],rk:[138,416],ra:[140,441],le:[113,338],lw:[112,364],re:[144,330],rw:[148,345]},
 {f:820,h:[148,280],r:29,hip:[145,389],lk:[143,414],la:[139,439],rk:[153,413],ra:[156,440],le:[130,335],lw:[130,361],re:[163,327],rw:[165,342]},
 {f:844,h:[163,278],r:29,hip:[160,388],lk:[156,413],la:[146,438],rk:[169,412],ra:[174,439],le:[145,333],lw:[145,359],re:[178,325],rw:[180,340]},
 {f:851,h:[164,278],r:29,hip:[161,388],lk:[157,413],la:[147,438],rk:[170,412],ra:[175,439],le:[146,333],lw:[146,359],re:[179,325],rw:[181,340]},
];
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const at=(keys:Key[],f:number):Key=>{
 const a=[...keys].reverse().find(k=>k.f<=f)??keys[0],b=keys.find(k=>k.f>=f)??keys[keys.length-1];
 const t=a.f===b.f?0:(f-a.f)/(b.f-a.f),out={f,r:lerp(a.r,b.r,t)} as Key;
 for(const name of ['h','hip','lk','la','rk','ra','le','lw','re','rw'] as const)out[name]=[lerp(a[name][0],b[name][0],t),lerp(a[name][1],b[name][1],t)];
 return out;
};
export const hasMeasuredLead=(id:number)=>[10,13,14,24,26].includes(id);
export const LeadPerformance:React.FC<{frame:number;shot:number}>=({frame,shot})=>{
 if(!hasMeasuredLead(shot))return null;
 const k=at(shot===10?walk:shot===13?hesitate:shot===14?keysWalk:shot===26?lastPull:pull,frame),[x,y]=k.h,s=k.r/30,walking=shot===10,holdingKeys=shot===13||shot===14;
 const shoulder:P=[x-4*s,y+40*s];
 const path=(a:P,b:P,c:P)=>`M${a} L${b} L${c}`;
 const leg=(knee:P,ankle:P,color:string,side:number)=><g><path d={path([k.hip[0]+side*3*s,k.hip[1]],knee,ankle)} fill="none" stroke={color} strokeWidth={9*s} strokeLinecap="round" strokeLinejoin="round"/><ellipse cx={ankle[0]+2*s} cy={ankle[1]+1*s} rx={8*s} ry={3.4*s} fill="#303a36"/></g>;
 const arm=(elbow:P,wrist:P,near:boolean)=><path d={path([shoulder[0]+(near?2:-3)*s,shoulder[1]],elbow,wrist)} fill="none" stroke={near?'#3e8055':'#2e6645'} strokeWidth={8*s} strokeLinecap="round" strokeLinejoin="round"/>;
 return <g transform="scale(4)">
  <defs><radialGradient id="measured-face"><stop offset=".4" stopColor="#eeece1"/><stop offset="1" stopColor="#dfddcf"/></radialGradient></defs>
  <ellipse cx={(k.la[0]+k.ra[0])/2} cy={Math.max(k.la[1],k.ra[1])+5*s} rx={32*s} ry={5*s} fill="#2e3028" opacity=".25"/>
  {leg(k.lk,k.la,'#99936a',-1)}{leg(k.rk,k.ra,'#aaa277',1)}
  {arm(k.le,k.lw,false)}
  <path d={`M${shoulder[0]-4*s},${shoulder[1]-2*s} Q${shoulder[0]-6*s},${shoulder[1]-5*s} ${shoulder[0]-5.5*s},${shoulder[1]+7*s} L${k.hip[0]-9*s},${k.hip[1]-13*s} L${k.hip[0]+6*s},${k.hip[1]-13*s} L${shoulder[0]+5*s},${shoulder[1]+2*s}Z`} fill="#3a7951"/>
  <path d={`M${shoulder[0]+3*s},${shoulder[1]+10*s} L${k.hip[0]+7*s},${k.hip[1]+3*s} L${k.hip[0]-4*s},${k.hip[1]+3*s} L${shoulder[0]-3*s},${shoulder[1]+12*s}Z`} fill="#1c343a"/>
  {arm(k.re,k.rw,true)}
  {walking?<g transform={`translate(${k.lw[0]} ${k.lw[1]}) rotate(-3)`}><rect x={-5*s} y={-3*s} width={10*s} height={18*s} rx={1.4*s} fill="#283835"/><rect x={-2.5*s} width={5*s} height={12*s} fill="#dc4939"/></g>:null}
  {holdingKeys?<g transform={`translate(${k.rw[0]} ${k.rw[1]}) rotate(40) scale(${s})`}><rect x="-5" y="-4" width="10" height="10" rx="4" fill="#242d29"/><circle cy="-1" r="1.7" fill="#bd392d"/><path d="M-1,5 H2 V18 L0,20 L-3,18 V15 H-1 V12 H-3 V9 H-1Z" fill="#bfc5be"/></g>:null}
  <g transform={`translate(${x} ${y}) scale(${s})`}>
   <circle r="30" fill="url(#measured-face)"/>
   <path d="M-30,-5 Q-29,-33 0,-35 Q25,-35 30,-7 L31,-4 Q1,-3 -30,-5Z" fill="#2f7048"/>
   <path d="M13,-6 L44,-2 L43,1 L12,-1Z" fill="#285e3f"/>
   <circle cy="-35" r="2.1" fill="#2d593d"/>
   <ellipse cx={shot===13?-9:8} cy="5" rx="3" ry="4.2" fill="#181e18"/><ellipse cx={shot===13?9:19} cy="5" rx="3" ry="4.2" fill="#181e18"/>
   <path d={walking?'M3,-2 L9,-5 M15,-5 L21,-2':'M0,-4 L10,0 M17,0 L24,-3'} fill="none" stroke="#22271d" strokeWidth="2" strokeLinecap="round"/>
   <path d={walking||shot===13?'M9,18 Q12,14 15,18 Q18,21 21,17':'M9,21 L18,20'} fill="none" stroke="#23291f" strokeWidth="2" strokeLinecap="round"/>
  </g>
 </g>;
};
