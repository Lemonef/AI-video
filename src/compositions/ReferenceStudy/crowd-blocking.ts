// Manually measured head circles in source review pixels; approximate, not motion capture.
export type CrowdTarget={x:number;y:number;r:number;n:number};
const guides:Record<number,[number,CrowdTarget[]][]>={
 11:[
 [603,[{n:0,x:111,y:272,r:9},{n:1,x:-10,y:269,r:9},{n:2,x:177,y:257,r:9},{n:3,x:155,y:217,r:7},{n:4,x:46,y:235,r:10},{n:5,x:88,y:194,r:5},{n:6,x:85,y:197,r:6}]],
 [648,[{n:0,x:66,y:264,r:10},{n:1,x:163,y:269,r:9},{n:2,x:119,y:249,r:10},{n:3,x:145,y:218,r:9},{n:4,x:145,y:217,r:10},{n:5,x:137,y:174,r:6},{n:6,x:75,y:193,r:6}]]
 ],
 12:[
 [681,[{n:0,x:197,y:209,r:14},{n:1,x:60,y:160,r:10},{n:2,x:290,y:160,r:12},{n:3,x:262,y:115,r:8},{n:4,x:260,y:110,r:8},{n:5,x:288,y:100,r:8},{n:6,x:159,y:102,r:6}]],
 [735,[{n:0,x:170,y:207,r:15},{n:1,x:22,y:155,r:11},{n:2,x:290,y:155,r:12},{n:3,x:-4,y:137,r:9},{n:4,x:-22,y:130,r:9},{n:5,x:8,y:109,r:10},{n:6,x:171,y:89,r:6}]]
 ]
};
export function crowdAt(shot:number,frame:number):CrowdTarget[]|undefined{
 const g=guides[shot];if(!g)return;
 const t=Math.max(0,Math.min(1,(frame-g[0][0])/(g[1][0]-g[0][0])));
 return g[0][1].map((a,i)=>{const b=g[1][1][i];return {n:a.n,x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,r:a.r+(b.r-a.r)*t};});
}
