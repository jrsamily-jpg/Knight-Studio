// Application-state tests with a minimal DOM fixture; no browser automation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {webcrypto} from 'node:crypto';
import {search} from './dist/engine.js';
class Element{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.value='';this.dataset={};this.style={};this.children=[];this.listeners={};this.classList={toggle(){},add(){},remove(){}};this.open=false;this.textContent='';this.innerHTML=''}
 addEventListener(k,f){(this.listeners[k]||=[]).push(f)}
 setAttribute(k,v){this[k]=v}append(...c){this.children.push(...c)}replaceChildren(...c){this.children=c}
 showModal(){this.open=true}close(){this.open=false;for(const f of this.listeners.close||[])f()}
 click(){return this.onclick?.({target:this})}remove(){}setPointerCapture(){}
}
const html=fs.readFileSync('dist/index.html','utf8'),elements=new Map();for(const m of html.matchAll(/<(\w+)[^>]*\bid="([^"]+)"/g))elements.set(m[2],new Element(m[1]));elements.get('evalfill').parentElement=new Element();
const nav=['play','learn','puzzle','review'].map(mode=>{const e=new Element('button');e.dataset.mode=mode;return e});
globalThis.document={hidden:false,getElementById:id=>elements.get(id),querySelector:s=>s==='dialog[open]'?[...elements.values()].find(e=>e.tagName==='DIALOG'&&e.open):null,querySelectorAll:s=>s==='dialog'?[...elements.values()].filter(e=>e.tagName==='DIALOG'):nav,createElement:tag=>new Element(tag),addEventListener(){},body:new Element('body')};
globalThis.window={addEventListener(){}};const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};globalThis.setInterval=()=>0;
globalThis.Worker=class{postMessage(data){this.timer=setTimeout(()=>this.onmessage?.({data:{id:data.id,moves:search(data.fen,Math.min(data.depth,2),500)}}),5)}terminate(){clearTimeout(this.timer)}};
let source=fs.readFileSync('dist/app.js','utf8').replace(/from '\.\/(.*?)'/g,(_,p)=>`from '${pathToFileURL(process.cwd()+'/dist/'+p).href}'`);
source+='\nexport {doMove,switchMode,hint,navigate,analyze,cancel,showLibrary}; export const state=()=>({fen:game.fen(),history:game.history(),mode,human,clockLimit,clocks:{...clocks},increment,busy,paused,parked,savedGames,ended,view});';
const app=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const $=id=>elements.get(id);
function start(mode='play'){for(const [id,value] of Object.entries({modeInput:mode,difficulty:'2',color:'w',time:'300',increment:'5'}))$(id).value=value;$('start').click()}
start();await app.doMove('e2','e4');assert.equal(app.state().history.length,2);assert.equal(app.state().clocks.w,305);assert.equal(app.state().clocks.b,305);
const active=app.state();app.switchMode('review');assert.equal(app.state().clockLimit,300);app.switchMode('puzzle');app.switchMode('review');app.switchMode('play');assert.equal(app.state().fen,active.fen);assert.deepEqual(app.state().clocks,active.clocks);
await app.hint();const position=app.state().fen;const alternatives=$('alternatives').children.filter(c=>c.tagName==='BUTTON');assert.ok(alternatives.length>0);alternatives[0].click();assert.equal(app.state().fen,position,'Inspecting a candidate must not make a move');
const pending=app.analyze(position,4,1000);app.cancel();assert.equal(await pending,null);assert.equal(app.state().busy,false);
start('learn');const moving=app.doMove('d2','d4');app.switchMode('puzzle');const puzzleFen=app.state().fen;await moving;assert.equal(app.state().fen,puzzleFen,'Canceled coaching must not move puzzle pieces');app.switchMode('play');assert.equal(app.state().history[0],'d4');
// Pause cancels a scheduled AI response; resume can restart it.
$('pause').click();assert.equal(app.state().paused,true);assert.equal(app.state().busy,false);
app.showLibrary();assert.ok(app.state().savedGames.length>0);assert.ok($('savedList').children.length>0);$('libraryDialog').close();
console.log('Passed gameplay state: AI response, increments, review/puzzle round trip, hint non-mutation, cancellation settlement, stale coach protection, pause, saved-game library.');
app.cancel();
