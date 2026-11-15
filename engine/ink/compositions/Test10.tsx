import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
const CUTS = [0, 135, 210, 270, 330] as const;
const WIDE_ZOOM = [1, 1.10] as const;
const RETURN_ZOOM = [1.12, 1.16] as const;
const CLOSE_BG_ZOOM = 1.4;
const CLOSE_ZOOM = [1, 1.06] as const;
const SHAKE_MARK = {start:210, duration:6, size:15};
const SHAKE_REALLY = {start:285, duration:8, size:19};
const ENTRY_FRAMES = 20;
const FLASH_FRAMES = 3;
const FULL_HEIGHT = 730;
const MARK_HEIGHT = 650;
const GROUND = 937;
const CAPTION_START = 9;
const CAPTION_END = CUTS[CUTS.length - 1];
const CAPTION_BOTTOM = 90; // Clear the close-up chin while staying above the bottom edge.
const GROUPS = ['PARIS, 1925.', 'ONE CON MAN', 'WALKED UP TO', 'A SCRAP DEALER,', 'AND SOLD HIM', 'THE EIFFEL TOWER.', 'YES.', 'REALLY.'];
// Approximate timings: proportional to character count, not forced-aligned to narration.
const totalChars = GROUPS.reduce((n,s)=>n+s.length,0);
const captions = GROUPS.map((text,i) => ({text, start: CAPTION_START + Math.round(GROUPS.slice(0,i).join('').length / totalChars * (CAPTION_END-CAPTION_START)), end: CAPTION_START + Math.round(GROUPS.slice(0,i+1).join('').length / totalChars * (CAPTION_END-CAPTION_START))}));
const range = (f:number,a:number,b:number,x:number,y:number) => interpolate(f,[a,b],[x,y],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const asset = (name:string) => staticFile(`test10/${name}`);
const shake = (frame:number, cue:typeof SHAKE_MARK) => {const t=frame-cue.start; return t>=0 && t<cue.duration ? Math.sin(t*2.7+1)*cue.size*(1-t/cue.duration):0;};
const Character:React.FC<{name:string; x:number; frame:number; dealer?:boolean; returning:boolean}> = ({name,x,frame,dealer=false,returning}) => {
 const entry=returning?1:1-Math.pow(1-Math.min(frame/ENTRY_FRAMES,1),3);
 const slide=(dealer?1:-1)*(1-entry)*1050;
 const enterHop=Math.sin(entry*Math.PI)*44;
 const hopTime=(frame-285)/18;
 const hop=returning&&dealer&&hopTime>=0&&hopTime<1?Math.sin(hopTime*Math.PI)*65:0;
 const squash=returning&&dealer&&frame>=282&&frame<305?Math.sin((frame-282)/23*Math.PI*2)*0.08:0;
 const bob=Math.sin(frame*0.13+(dealer?1:0))*2.4;
 const rotate=dealer?Math.sin(frame*0.22)*2:Math.sin(frame*0.08)*0.5;
 // Measured from the replacement sprites alpha bounds.
 const height=dealer?MARK_HEIGHT:FULL_HEIGHT;
 const sole=dealer?1497/1536:1520/1536;
 return <><div style={{position:'absolute',left:x-115+slide,top:GROUND-12,width:230,height:27,borderRadius:'50%',background:'#182522',opacity:0.35*(1-hop/120),filter:'blur(12px)',transform:`scale(${1-hop/200})`}}/>
 <Img src={asset(name)} style={{position:'absolute',left:x-height/3+slide,top:GROUND-height*sole-bob-enterHop-hop,height,transformOrigin:`50% ${sole*100}%`,transform:`rotate(${rotate}deg) scale(${1-squash},${1+squash})`}}/></>;
};
export const Test10:React.FC = () => {
 const frame=useCurrentFrame();
 const shot=frame<CUTS[1]?0:frame<CUTS[2]?1:frame<CUTS[3]?2:3;
 const start=CUTS[shot], end=CUTS[shot+1], local=frame-start;
 const wide=shot===0||shot===3;
 const zoom=wide?range(frame,start,end,(shot===0?WIDE_ZOOM:RETURN_ZOOM)[0],(shot===0?WIDE_ZOOM:RETURN_ZOOM)[1]):range(frame,start,end,...CLOSE_ZOOM);
 const dx=shake(frame,SHAKE_MARK)+shake(frame,SHAKE_REALLY);
 const caption=captions.find(c=>frame>=c.start&&frame<c.end);
 return <AbsoluteFill style={{background:'#223137',overflow:'hidden'}}>
 <Audio src={asset('vo.wav')}/>
 <AbsoluteFill style={{transform:`translate(${dx}px,${dx*0.45}px)`}}>
 <AbsoluteFill style={{transform:`scale(${wide?zoom:CLOSE_BG_ZOOM*zoom}) translateX(${range(frame,start,end,0,-12)}px)`,transformOrigin:'54% 60%',filter:undefined}}><Img src={asset('plate_street.png')} style={{width:'100%',height:'100%',objectFit:'cover'}}/></AbsoluteFill>
 {wide?<AbsoluteFill style={{transform:`scale(${range(frame,start,end,1,1.025)})`,transformOrigin:'50% 87%'}}><Character name="con_full_cut.png" x={595} frame={frame} returning={shot===3}/><Character name="mark_full_cut.png" x={1325} frame={frame} dealer returning={shot===3}/></AbsoluteFill>:<Img src={asset(shot===1?'con_close_cut.png':'mark_close_cut.png')} style={{position:'absolute',height:810,bottom:0,left:'50%',transformOrigin:'50% 100%',transform:`translateX(-50%) scale(${zoom})`}}/>}
 
 </AbsoluteFill>
 
 {caption&&<div style={{position:'absolute',bottom:CAPTION_BOTTOM,width:'100%',textAlign:'center',fontFamily:'Arial Black, Arial, sans-serif',fontSize:96,fontWeight:900,color:'white',WebkitTextStroke:'9px #101718',paintOrder:'stroke fill',textShadow:'0 7px 0 #101718',transform:`scale(${range(frame,caption.start,caption.start+4,1.15,1)})`,letterSpacing:-2}}>{caption.text}</div>}
 {shot>0&&local<FLASH_FRAMES&&<AbsoluteFill style={{background:'white',opacity:0.12*(1-local/FLASH_FRAMES)}}/>}
 </AbsoluteFill>;
};

