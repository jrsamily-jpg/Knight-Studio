import {Chess} from './chess.js';
const V={p:100,n:320,b:335,r:500,q:900,k:0};
// White-positive positional score, in hundredths of a pawn.
export function evaluate(g){
  if(g.isCheckmate())return g.turn()==='w'?-100000:100000;
  if(g.isDraw())return 0;
  let score=0;const all=g.board().flat().filter(Boolean),pawns={w:Array(8).fill(0),b:Array(8).fill(0)},bishops={w:0,b:0};
  const material=all.reduce((n,p)=>n+('pnk'.includes(p.type)?0:V[p.type]),0),endgame=material<2400;
  for(const p of all)if(p.type==='p')pawns[p.color][p.square.charCodeAt(0)-97]++;
  for(const p of all){const f=p.square.charCodeAt(0)-97,r=+p.square[1]-1,advance=p.color==='w'?r:7-r,center=3.5-(Math.abs(f-3.5)+Math.abs(r-3.5))/2;let v=V[p.type];
    if(p.type==='p'){v+=advance*(endgame?14:7)+center*4;if(pawns[p.color][f]>1)v-=14;if(!(pawns[p.color][f-1]||pawns[p.color][f+1]))v-=12;const blocked=all.some(q=>q.type==='p'&&q.color!==p.color&&Math.abs(q.square.charCodeAt(0)-p.square.charCodeAt(0))<=1&&(p.color==='w'?+q.square[1]>r+1:+q.square[1]<r+1));if(!blocked)v+=advance*advance*(endgame?5:2);}
    if('nb'.includes(p.type))v+=center*20;
    if(p.type==='b')bishops[p.color]++;
    if(p.type==='r'){if(!pawns[p.color][f])v+=15;if(!pawns.w[f]&&!pawns.b[f])v+=12;if(advance===6)v+=20;}
    if(p.type==='k'){if(endgame)v+=center*24;else{v-=center*12;if(advance===0&&(f===6||f===2))v+=38;for(const q of all)if(q.type==='p'&&q.color===p.color&&Math.abs(q.square.charCodeAt(0)-p.square.charCodeAt(0))<=1&&+q.square[1]===(p.color==='w'?r+2:r))v+=13;}}
    score+=(p.color==='w'?1:-1)*v;
  }return score+(bishops.w>=2?30:0)-(bishops.b>=2?30:0);
}
export function search(fen,depth=2,budget=1500){
  const g=new Chess(fen),end=Date.now()+Math.max(1,budget);let nodes=0;
  const order=m=>(m.san.includes('#')?100000:0)+(m.captured?10*V[m.captured]-V[m.piece]:0)+(m.promotion?V[m.promotion]:0)+(m.san.includes('+')?35:0);
  function tick(){if((++nodes&31)===0&&Date.now()>=end)throw Error('timeout')}
  function terminal(ply){if(g.isCheckmate())return -100000+ply;if(g.isDraw())return 0;return null}
  function quiet(alpha,beta,ply,left=5){tick();const t=terminal(ply);if(t!==null)return t;const check=g.isCheck(),stand=evaluate(g)*(g.turn()==='w'?1:-1);if(left<=0)return stand;if(!check){if(stand>=beta)return stand;alpha=Math.max(alpha,stand)}const moves=g.moves({verbose:true}).filter(m=>check||m.captured||m.promotion).sort((a,b)=>order(b)-order(a));for(const m of moves){g.move(m);let value;try{value=-quiet(-beta,-alpha,ply+1,left-1)}finally{g.undo()}if(value>=beta)return value;alpha=Math.max(alpha,value)}return alpha}
  function neg(d,alpha,beta,ply){tick();const t=terminal(ply);if(t!==null)return t;if(d<=0)return quiet(alpha,beta,ply);let best=-Infinity;for(const m of g.moves({verbose:true}).sort((a,b)=>order(b)-order(a))){g.move(m);let value;try{value=-neg(d-1,-beta,-alpha,ply+1)}finally{g.undo()}best=Math.max(best,value);alpha=Math.max(alpha,value);if(alpha>=beta)break}return best}
  const root=g.moves({verbose:true});
  // Always return legal options, even on a very slow device or a tiny time budget.
  let result=root.map(m=>{g.move(m);const score=evaluate(g)*(m.color==='w'?1:-1);g.undo();return {from:m.from,to:m.to,promotion:m.promotion,san:m.san,score,depth:0}}).sort((a,b)=>b.score-a.score);
  for(let d=1;d<=depth;d++){const list=[];try{for(const m of result){if(Date.now()>=end)throw Error('timeout');g.move(m);let score;try{score=-neg(d-1,-Infinity,Infinity,1)}finally{g.undo()}list.push({...m,score,depth:d})}result=list.sort((a,b)=>b.score-a.score)}catch{break}}
  return result;
}
if(typeof WorkerGlobalScope!=='undefined'&&self instanceof WorkerGlobalScope)self.onmessage=e=>{const {id,fen,depth,budget}=e.data;self.postMessage({id,moves:search(fen,depth,budget)})};
