// Source-reviewed head circles on the 270x480 image plane; manual guides, not mocap.
export type CrowdLook = 'white-vest'|'bald-vest'|'orange'|'cap'|'hardhat'|'raincoat'|'suit'|'backpack';
export type CrowdTarget = {x:number;y:number;r:number;n:number;look?:CrowdLook;human?:boolean;facing?:number;bodyRatio?:number;notice?:number;lowArms?:boolean};
const t=(n:number,x:number,y:number,r:number,look:CrowdLook,human=false,facing=1,extra:Partial<CrowdTarget>={}):CrowdTarget=>({n,x,y,r,look,human,facing,...extra});
const guides:Record<number,[number,CrowdTarget[]][]>={
 // Boundary guides under the focus/flash transition interpolate toward source-reviewed clear poses.
 18:[
 [1421,[t(0,170,326,21,'white-vest',false,-1,{bodyRatio:6.0}),t(11,34,299,12,'white-vest'),t(1,130,287,10,'orange'),t(3,176,308,17,'hardhat'),t(2,237,294,12,'cap'),t(6,-4,267,10,'backpack')]],
 [1448,[t(0,175,319,22,'white-vest',false,-1,{bodyRatio:5.95}),t(11,32,291,13,'white-vest'),t(1,130,278,11.5,'orange'),t(3,171,300,18.5,'hardhat'),t(2,246,287,13.5,'cap'),t(6,-7,263,10,'backpack')]],
 [1478,[t(0,184,314,25,'white-vest',false,-1,{bodyRatio:5.44}),t(11,8,281,14,'white-vest'),t(1,134,267,12.5,'orange'),t(3,153,293,19,'hardhat'),t(2,269,274,15,'cap'),t(6,-23,260,10,'backpack')]]
 ],
 20:[
 [1526,[t(0,208,216,15,'white-vest',false,1,{bodyRatio:6.5,notice:0,lowArms:true}),t(1,66,163,11.5,'orange',false,1,{bodyRatio:6.4,notice:1}),t(6,155,97,8,'backpack',false,1,{bodyRatio:7.0,notice:0}),t(3,270,138,10.5,'hardhat',false,1,{bodyRatio:6.0})]],
 [1545,[t(0,214,217,15.3,'white-vest',false,1,{bodyRatio:6.4,notice:0,lowArms:true}),t(1,66,163,11.5,'orange',false,1,{bodyRatio:6.4,notice:1}),t(6,155,97,8,'backpack',false,1,{bodyRatio:7.0,notice:0}),t(3,270,138,10.5,'hardhat',false,1,{bodyRatio:6.0})]],
 [1554,[t(0,215,218,15.5,'white-vest',false,1,{bodyRatio:6.3,notice:1,lowArms:true}),t(1,66,163,11.5,'orange',false,1,{bodyRatio:6.4,notice:1}),t(6,155,97,8,'backpack',false,1,{bodyRatio:7.0,notice:1}),t(3,272,137,10.5,'hardhat',false,1,{bodyRatio:6.0})]],
 [1564,[t(0,215,218,15.5,'white-vest',false,1,{bodyRatio:6.3,notice:1,lowArms:true}),t(1,66,163,11.5,'orange',false,1,{bodyRatio:6.4,notice:1}),t(6,155,97,8,'backpack',false,1,{bodyRatio:7.0,notice:1}),t(3,273,137,10.5,'hardhat',false,1,{bodyRatio:6.0})]]
 ],
 11:[
 [596,[t(0,114,272,9,'white-vest'),t(2,182,255,9,'cap'),t(3,155,216,7,'hardhat'),t(4,28,229,9,'raincoat',true),t(6,82,197,6,'backpack'),t(7,335,260,9,'cap',true,-1),t(8,-44,271,9,'orange',true),t(9,80,184,5,'suit',true),t(10,300,218,6,'backpack',true,-1)]],
 [603,[t(0,111,272,9,'white-vest'),t(2,177,257,9,'cap'),t(3,155,217,7,'hardhat'),t(4,46,235,10,'raincoat',true),t(6,85,197,6,'backpack'),t(7,300,258,9,'cap',true,-1),t(8,-10,269,9,'orange',true),t(9,92,184,5,'suit',true),t(10,290,211,6,'backpack',true,-1)]],
 [625,[t(0,94,269,9.5,'white-vest'),t(2,166,255,9,'cap'),t(3,161,216,8,'hardhat'),t(4,101,225,9,'raincoat',true),t(6,88,194,6,'backpack'),t(7,225,252,9,'cap',true,-1),t(8,85,274,9,'orange',true),t(9,120,184,6,'suit',true),t(10,230,202,7,'backpack',true,-1)]],
 [648,[t(0,66,264,10,'white-vest'),t(2,128,246,9,'cap'),t(3,147,207,8,'hardhat'),t(4,145,217,10,'raincoat',true),t(6,75,193,6,'backpack'),t(7,113,242,9,'cap',true,-1),t(8,163,269,9,'orange',true),t(9,139,175,6,'suit',true),t(10,162,195,7,'backpack',true,-1)]],
 [673,[t(0,51,264,10,'white-vest'),t(2,119,246,9,'cap'),t(3,155,208,8,'hardhat'),t(4,206,218,9,'raincoat',true),t(6,80,185,6,'backpack'),t(7,17,246,9,'cap',true,-1),t(8,273,270,9,'orange',true),t(9,176,173,6,'suit',true),t(10,103,194,7,'backpack',true,-1)]]
 ],
 12:[
 [674,[t(0,201,209,13.5,'white-vest'),t(1,67,156,9.7,'orange'),t(2,312,185,12,'cap'),t(3,264,131,9,'hardhat'),t(6,156,102,6,'backpack'),t(11,-25,127,9,'bald-vest')]],
 [681,[t(0,197,209,14,'white-vest'),t(1,60,156,10,'orange'),t(2,308,185,12,'cap'),t(3,263,132,9,'hardhat'),t(6,159,102,6,'backpack'),t(11,-14,129,10,'bald-vest')]],
 [708,[t(0,188,208,14.5,'white-vest'),t(1,44,153,10.4,'orange'),t(2,294,180,12,'cap'),t(3,310,128,9,'hardhat'),t(6,177,97,6,'backpack'),t(11,5,123,10,'bald-vest')]],
 [735,[t(0,170,207,15,'white-vest'),t(1,22,150,11,'orange'),t(2,278,176,12,'cap'),t(3,350,125,9,'hardhat'),t(6,194,90,6,'backpack'),t(11,16,118,11,'bald-vest')]],
 [745,[t(0,164,207,15.2,'white-vest'),t(1,12,148,11,'orange'),t(2,279,177,12,'cap'),t(3,365,125,9,'hardhat'),t(6,203,88,6,'backpack'),t(11,21,110,11,'bald-vest')]]
 ]
};
export function crowdAt(shot:number,frame:number):CrowdTarget[]|undefined {
 const keys=guides[shot];if(!keys)return;
 const before=[...keys].reverse().find(k=>k[0]<=frame)??keys[0];
 const after=keys.find(k=>k[0]>=frame)??keys[keys.length-1];
 const p=after[0]===before[0]?0:Math.max(0,Math.min(1,(frame-before[0])/(after[0]-before[0])));
 return before[1].map(a=>{const b=after[1].find(k=>k.n===a.n)??a;return {...a,x:a.x+(b.x-a.x)*p,y:a.y+(b.y-a.y)*p,r:a.r+(b.r-a.r)*p,bodyRatio:a.bodyRatio!==undefined? a.bodyRatio+((b.bodyRatio??a.bodyRatio)-a.bodyRatio)*p:undefined,notice:a.notice!==undefined? a.notice+((b.notice??a.notice)-a.notice)*p:undefined};});
}
