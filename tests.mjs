import assert from 'node:assert/strict';
import {Chess} from './dist/chess.js';
import {search} from './dist/engine.js';
const g=new Chess();assert.equal(g.moves().length,20);const fen=g.fen();const ranked=search(fen,2,1200);assert.equal(ranked.length,20);assert.ok(g.move(ranked[0]));assert.equal(new Chess(g.fen()).turn(),'b');
const puzzles=['6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1','7k/8/5KQ1/8/8/8/8/8 w - - 0 1','7k/5K2/6R1/8/8/8/8/8 w - - 0 1'];for(const fen of puzzles){const g=new Chess(fen);const m=search(fen,2,1400)[0];g.move(m);assert.ok(g.isCheckmate(),m.san)}
const castle=new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');assert.ok(castle.move('O-O'));assert.equal(castle.get('f1').type,'r');
const ep=new Chess();['e4','a6','e5','d5','exd6'].forEach(m=>ep.move(m));assert.equal(ep.get('d5'),undefined);assert.equal(ep.get('d6').type,'p');
const promo=new Chess('7k/P7/8/8/8/8/8/7K w - - 0 1');promo.move({from:'a7',to:'a8',promotion:'n'});assert.equal(promo.get('a8').type,'n');
const mate=new Chess();['f3','e5','g4','Qh4#'].forEach(m=>mate.move(m));assert.ok(mate.isCheckmate());const restored=new Chess();restored.loadPgn(mate.pgn());assert.equal(restored.fen(),mate.fen());
assert.ok(new Chess('7k/5K2/6Q1/8/8/8/8/8 b - - 0 1').isStalemate());console.log('Passed: legal moves, engine choices, 3 mating puzzles, castling, en passant, underpromotion, checkmate, stalemate, PGN round trip.');
const {evaluate}=await import('./dist/engine.js');
const {addIncrement,putArchive,captureSummary}=await import('./dist/session.js');
const fast=search(new Chess().fen(),6,1);assert.equal(fast.length,20);assert.ok(new Chess().move(fast[0]));
const extraPuzzles=['6rk/6pp/7N/8/8/8/8/K7 w - - 0 1','7k/R7/1R6/8/8/8/8/6K1 w - - 0 1'];for(const fen of extraPuzzles){const g=new Chess(fen);g.move(search(fen,3,1800)[0]);assert.ok(g.isCheckmate())}
const tactical=new Chess('4k3/8/8/3q4/8/8/3R4/4K3 w - - 0 1');assert.equal(search(tactical.fen(),3,1200)[0].san,'Rxd5');
assert.equal(evaluate(new Chess('7k/5K2/6Q1/8/8/8/8/8 b - - 0 1')),0);
assert.equal(search(mate.fen(),3,100).length,0);
const c={w:100,b:90};assert.deepEqual(addIncrement(c,'w',5,true),{w:105,b:90});assert.deepEqual(c,{w:100,b:90});assert.deepEqual(addIncrement(c,'w',5,false),c);
let archive=[];for(let n=0;n<35;n++)archive=putArchive(archive,{id:String(n),fen:new Chess().fen()});assert.equal(archive.length,30);archive=putArchive(archive,{id:'34',fen:new Chess().fen(),ended:'Draw'});assert.equal(archive.length,30);assert.equal(archive[0].ended,'Draw');
const captures=new Chess();['e4','d5','exd5'].forEach(m=>captures.move(m));assert.deepEqual(captureSummary(captures),{captured:{w:['p'],b:[]},balance:1});
console.log('Passed: bounded search fallback, tactical capture, two additional mates, drawn evaluation, terminal search, increments, archive deduplication/limit, captured-piece accounting.');
const poison=new Chess('4k3/8/4p3/3p4/8/8/3R4/4K3 w - - 0 1');assert.notEqual(search(poison.fen(),2,1000)[0].san,'Rxd5');console.log('Passed: engine avoids a pawn capture that loses its rook to recapture.');
