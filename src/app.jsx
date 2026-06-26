'use strict';
var _useState=React.useState,_useEffect=React.useEffect,_useRef=React.useRef,
    _useCallback=React.useCallback,_useMemo=React.useMemo;

/* ── helpers ────────────────────────────────────────────────────── */
function useState(v){return _useState(v);}
function useEffect(f,d){return _useEffect(f,d);}
function useRef(v){return _useRef(v);}
function useCallback(f,d){return _useCallback(f,d);}
function useMemo(f,d){return _useMemo(f,d);}

/* ── UI Primitives ──────────────────────────────────────────────── */
function CB({filename,code}){
  var [cp,setCp]=useState(false);
  return(
    <div style={{borderRadius:12,overflow:'hidden',margin:'20px 0',border:'1px solid #334155',fontSize:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#1e293b',padding:'7px 18px'}}>
        <span style={{color:'#94a3b8',fontFamily:'monospace',fontSize:13}}>{filename||'code'}</span>
        <button onClick={function(){
          if(navigator.clipboard)navigator.clipboard.writeText(code);
          setCp(true);setTimeout(function(){setCp(false);},2000);
        }} style={{fontSize:13,color:cp?'#4ade80':'#94a3b8',background:'none',border:'1px solid rgba(255,255,255,.15)',padding:'3px 12px',borderRadius:5,cursor:'pointer'}}>
          {cp?'✓ Copied':'Copy'}
        </button>
      </div>
      <pre style={{background:'#0f172a',padding:'20px 22px',overflow:'auto',margin:0,lineHeight:1.75,maxHeight:480}}>
        <code style={{color:'#e2e8f0',whiteSpace:'pre',fontFamily:"'Menlo','Monaco','Courier New',monospace",fontSize:14}}>{code}</code>
      </pre>
    </div>
  );
}

function Callout({type,title,children}){
  var s={
    analogy:{bg:'#eff6ff',brd:'#3b82f6',ic:'💡',tc:'#1e40af'},
    warning:{bg:'#fffbeb',brd:'#f59e0b',ic:'⚠️',tc:'#92400e'},
    info:   {bg:'#f0fdf4',brd:'#22c55e',ic:'✅',tc:'#14532d'},
    danger: {bg:'#fef2f2',brd:'#ef4444',ic:'🚨',tc:'#7f1d1d'},
  }[type]||{bg:'#f8fafc',brd:'#94a3b8',ic:'ℹ️',tc:'#1e293b'};
  return(
    <div style={{background:s.bg,borderLeft:'5px solid '+s.brd,padding:'14px 20px',margin:'18px 0',borderRadius:'0 10px 10px 0'}}>
      <div style={{fontWeight:700,color:s.tc,marginBottom:6,fontSize:16}}>{s.ic} {title}</div>
      <div style={{color:s.tc,fontSize:15,lineHeight:1.7,opacity:.9}}>{children}</div>
    </div>
  );
}

function MathB({children}){
  return(
    <div style={{background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:10,padding:'14px 20px',margin:'16px 0',textAlign:'center',fontFamily:'monospace',fontSize:16,overflowX:'auto',letterSpacing:'0.03em'}}>
      {children}
    </div>
  );
}

function StreamlitTip({page,children}){
  return(
    <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:10,padding:'16px 20px',margin:'20px 0'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
        <span style={{fontSize:20}}>🎯</span>
        <span style={{fontWeight:700,fontSize:16,color:'#14532d'}}>Try it on Streamlit</span>
        <span style={{background:'#dcfce7',color:'#166534',fontSize:13,padding:'2px 10px',borderRadius:20,fontWeight:600,border:'1px solid #86efac'}}>{page}</span>
      </div>
      <pre style={{margin:0,fontFamily:'inherit',fontSize:14.5,color:'#15803d',lineHeight:1.75,whiteSpace:'pre-wrap'}}>{children}</pre>
    </div>
  );
}

function PromptBlock({title,prompt}){
  var [cp,setCp]=useState(false);
  return(
    <div style={{background:'#1e1b4b',border:'1px solid #4338ca',borderRadius:12,padding:'18px 22px',margin:'24px 0'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:20}}>🤖</span>
          <span style={{fontWeight:700,color:'#c7d2fe',fontSize:15}}>Ask Claude or ChatGPT</span>
          {title&&<span style={{background:'#312e81',color:'#a5b4fc',fontSize:13,padding:'2px 10px',borderRadius:20,fontWeight:600,border:'1px solid #4338ca'}}>{title}</span>}
        </div>
        <button onClick={function(){
          if(navigator.clipboard)navigator.clipboard.writeText(prompt);
          setCp(true);setTimeout(function(){setCp(false);},2000);
        }} style={{fontSize:13,color:cp?'#4ade80':'#a5b4fc',background:'rgba(67,56,202,0.3)',border:'1px solid #4338ca',padding:'4px 14px',borderRadius:6,cursor:'pointer',fontFamily:'inherit'}}>
          {cp?'✓ Copied!':'Copy prompt'}
        </button>
      </div>
      <pre style={{margin:0,fontFamily:'inherit',fontSize:14,color:'#e0e7ff',lineHeight:1.8,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{prompt}</pre>
    </div>
  );
}

function QuizBlock({qs}){
  var [ans,setAns]=useState({});
  return(
    <div style={{marginTop:32,borderTop:'1px solid #e2e8f0',paddingTop:24}}>
      <div style={{fontWeight:700,fontSize:20,marginBottom:16,color:'#1e293b'}}>🧠 Quiz</div>
      {qs.map(function(q,qi){
        return(
          <div key={qi} style={{marginBottom:18,background:'#f8fafc',borderRadius:12,padding:'16px 20px',border:'1px solid '+(ans[qi]!==undefined?'#94a3b8':'#e2e8f0')}}>
            <p style={{fontWeight:600,fontSize:16,marginBottom:12,color:'#1e293b'}}>{qi+1}. {q.q}</p>
            {q.opts.map(function(opt,oi){
              var chosen=ans[qi]===oi,correct=oi===q.a,rev=ans[qi]!==undefined;
              var bg='white',brd='#e2e8f0',col='#475569';
              if(chosen&&correct){bg='#f0fdf4';brd='#22c55e';col='#14532d';}
              else if(chosen&&!correct){bg='#fef2f2';brd='#ef4444';col='#7f1d1d';}
              else if(rev&&correct){bg='#f0fdf4';brd='#86efac';col='#166634';}
              return(
                <div key={oi}>
                  <button onClick={function(){if(!rev)setAns(function(a){var n=Object.assign({},a);n[qi]=oi;return n;});}}
                    style={{width:'100%',textAlign:'left',padding:'10px 14px',borderRadius:8,border:'1px solid '+brd,background:bg,color:col,fontSize:15,cursor:rev?'default':'pointer',marginBottom:4,fontFamily:'inherit'}}>
                    <span style={{fontFamily:'monospace',fontWeight:700,marginRight:8}}>{String.fromCharCode(65+oi)}.</span>{opt.t}
                  </button>
                  {chosen&&<div style={{fontSize:13.5,padding:'6px 14px',borderRadius:6,background:correct?'#dcfce7':'#fee2e2',color:correct?'#14532d':'#7f1d1d',marginBottom:5}}>{correct?'✓ Correct — ':'✗ Incorrect — '}{opt.e}</div>}
                  {!chosen&&rev&&correct&&<div style={{fontSize:13.5,padding:'6px 14px',borderRadius:6,background:'#dcfce7',color:'#14532d',marginBottom:5}}>✓ Correct answer — {opt.e}</div>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}


/* ── Lesson visualizations ──────────────────────────────────────── */
function VizFrame({children}){
  return <div style={{margin:'24px 0',background:'white',border:'1px solid #e2e8f0',borderRadius:12,padding:18,boxShadow:'0 1px 2px rgba(15,23,42,.04)'}}>{children}</div>;
}
function TinyStat({label,value,color}){
  return <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'10px 12px'}}><div style={{fontSize:11,color:'#64748b',fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em'}}>{label}</div><div style={{fontSize:20,fontWeight:800,color:color||'#0f172a',marginTop:2}}>{value}</div></div>;
}
function WeightVectorViz(){
  var [abs,setAbs]=useState(false);
  var data=[
    {cls:'Residential',weights:[{name:'energy',v:-0.82},{name:'sqft',v:-0.31}]},
    {cls:'Commercial',weights:[{name:'energy',v:0.19},{name:'sqft',v:0.08}]},
    {cls:'Industrial',weights:[{name:'energy',v:1.24},{name:'sqft',v:0.54}]},
  ];
  var max=1.5;
  var rows=data.map(function(d){
    var weights=abs?d.weights.slice().sort(function(a,b){return Math.abs(b.v)-Math.abs(a.v);}):d.weights;
    return Object.assign({},d,{weights:weights});
  });
  return <VizFrame><div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',marginBottom:14}}><div><h3 style={{margin:0,fontSize:20,color:'#0f172a'}}>Trained weights — what each feature pushes toward each class</h3><p style={{margin:'6px 0 0',color:'#64748b',fontSize:14}}>Positive = this feature pushes toward this class. Negative = pushes away.</p></div><button onClick={function(){setAbs(!abs);}} style={{border:'1px solid #cbd5e1',background:abs?'#eff6ff':'white',color:abs?'#1d4ed8':'#334155',borderRadius:7,padding:'8px 12px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Show absolute values</button></div><div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:14}}>{rows.map(function(col,ci){return <div key={col.cls} style={{border:'1px solid #e2e8f0',borderRadius:10,padding:12,background:'#f8fafc'}}><div style={{fontWeight:800,color:COLORS[ci],marginBottom:12}}>{col.cls}</div>{col.weights.map(function(w){var mag=Math.min(Math.abs(w.v)/max,1);var left=!abs&&w.v<0;var color=abs?'#2563eb':(left?'#ef4444':'#2563eb');return <div key={w.name} style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',fontSize:12,fontWeight:700,color:'#475569',marginBottom:5}}><span>{w.name}</span><span>{w.v>0?'+':''}{w.v.toFixed(2)}</span></div><div style={{height:18,background:'#e2e8f0',borderRadius:9,position:'relative',overflow:'hidden'}}><div style={{position:'absolute',left:'50%',top:0,bottom:0,width:1,background:'#94a3b8'}}/><div style={{position:'absolute',top:3,bottom:3,left:left?((50-mag*50)+'%'):'50%',width:(mag*50)+'%',background:color,borderRadius:7,transition:'all .2s'}}/></div></div>;})}</div>;})}</div></VizFrame>;
}
function ScalingNumberLine({value}){
  var clamped=Math.max(-3,Math.min(3,value));
  var pct=(clamped+3)/6*100;
  var color=Math.abs(value)<=0.5?'#16a34a':(value<0?'#2563eb':'#dc2626');
  return <div><div style={{height:8,background:'linear-gradient(90deg,#2563eb,#e2e8f0,#dc2626)',borderRadius:4,position:'relative',margin:'8px 0 4px'}}><div style={{position:'absolute',left:pct+'%',top:-5,width:18,height:18,marginLeft:-9,borderRadius:'50%',background:color,border:'2px solid white',boxShadow:'0 1px 4px rgba(0,0,0,.2)'}}/></div><div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#94a3b8'}}><span>-3</span><span>0</span><span>+3</span></div></div>;
}
function ScalingExplorer(){
  var [energy,setEnergy]=useState(28463);
  var [sqft,setSqft]=useState(10587);
  var cfg={energy:{mean:28463,std:17291},sqft:{mean:10587,std:6382}};
  var es=(energy-cfg.energy.mean)/cfg.energy.std;
  var ss=(sqft-cfg.sqft.mean)/cfg.sqft.std;
  function color(v){return Math.abs(v)<=0.5?'#16a34a':(v<0?'#2563eb':'#dc2626');}
  return <VizFrame><h3 style={{margin:'0 0 6px',fontSize:20,color:'#0f172a'}}>Scaling explorer</h3><p style={{margin:'0 0 16px',color:'#64748b'}}>Scaled value = (raw - mean) / std. Drag the sliders and watch raw numbers become comparable.</p><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}><label style={{display:'block'}}><div style={{fontWeight:800,color:'#334155'}}>Energy Consumption</div><input style={{width:'100%'}} type="range" min="1000" max="60000" step="100" value={energy} onChange={function(e){setEnergy(+e.target.value);}}/><div style={{display:'flex',justifyContent:'space-between',fontSize:13}}><span>Raw: {energy.toLocaleString()}</span><span style={{color:color(es),fontWeight:800}}>Scaled: {es.toFixed(2)}</span></div><ScalingNumberLine value={es}/></label><label style={{display:'block'}}><div style={{fontWeight:800,color:'#334155'}}>Square Footage</div><input style={{width:'100%'}} type="range" min="500" max="30000" step="100" value={sqft} onChange={function(e){setSqft(+e.target.value);}}/><div style={{display:'flex',justifyContent:'space-between',fontSize:13}}><span>Raw: {sqft.toLocaleString()}</span><span style={{color:color(ss),fontWeight:800}}>Scaled: {ss.toFixed(2)}</span></div><ScalingNumberLine value={ss}/></label></div><table style={{width:'100%',borderCollapse:'collapse',marginTop:18,fontSize:14}}><thead><tr><th style={{textAlign:'left',padding:8,borderBottom:'1px solid #e2e8f0'}}>Building</th><th style={{textAlign:'right',padding:8,borderBottom:'1px solid #e2e8f0'}}>Energy scaled</th><th style={{textAlign:'right',padding:8,borderBottom:'1px solid #e2e8f0'}}>Sqft scaled</th></tr></thead><tbody><tr><td style={{padding:8}}>Current building</td><td style={{padding:8,textAlign:'right',color:color(es),fontWeight:800}}>{es.toFixed(2)}</td><td style={{padding:8,textAlign:'right',color:color(ss),fontWeight:800}}>{ss.toFixed(2)}</td></tr><tr><td style={{padding:8}}>Average building</td><td style={{padding:8,textAlign:'right'}}>0.00</td><td style={{padding:8,textAlign:'right'}}>0.00</td></tr></tbody></table><div style={{marginTop:12,padding:12,background:'#fffbeb',border:'1px solid #f59e0b',borderRadius:8,color:'#92400e',fontSize:14}}>Values beyond ±2 are unusual. Values beyond ±3 are rare outliers.</div></VizFrame>;
}
function AttentionNeighbours(){
  var [bw,setBw]=useState(2);
  var [frozen,setFrozen]=useState(false);
  var [query,setQuery]=useState(function(){return (window.__livePredictorQuery&&window.__livePredictorQuery.raw)||[6000,1200];});
  var dataset=useMemo(function(){var d=window.generateData();var sc=new window.Scaler().fit(d.X);return {X:d.X.slice(0,30),y:d.y.slice(0,30),sc:sc,Xsc:sc.transform(d.X.slice(0,30))};},[]);
  useEffect(function(){var t=setInterval(function(){if(!frozen&&window.__livePredictorQuery&&window.__livePredictorQuery.raw)setQuery(window.__livePredictorQuery.raw);},300);return function(){clearInterval(t);};},[frozen]);
  var qi=useMemo(function(){return dataset.sc.transformOne(query);},[dataset,query]);
  var weights=useMemo(function(){return window.attnWeights(dataset.Xsc,qi,parseFloat(bw));},[dataset,qi,bw]);
  var probs=useMemo(function(){return window.attnProba(dataset.Xsc,dataset.y,qi,parseFloat(bw));},[dataset,qi,bw]);
  var ranked=weights.map(function(w,i){return {i:i,w:w,d:Math.sqrt(Math.pow(dataset.Xsc[i][0]-qi[0],2)+Math.pow(dataset.Xsc[i][1]-qi[1],2))};}).sort(function(a,b){return b.w-a.w;}).slice(0,8);
  var W=360,H=240,xs=dataset.X.map(function(x){return x[0];}),ys=dataset.X.map(function(x){return x[1];});
  xs=xs.concat([query[0]]);ys=ys.concat([query[1]]);
  var xmin=Math.min.apply(null,xs),xmax=Math.max.apply(null,xs),ymin=Math.min.apply(null,ys),ymax=Math.max.apply(null,ys);
  function sx(v){return 18+(v-xmin)/(xmax-xmin||1)*(W-36);} function sy(v){return H-18-(v-ymin)/(ymax-ymin||1)*(H-36);}
  return <VizFrame><div style={{display:'flex',justifyContent:'space-between',gap:12,marginBottom:12}}><div><h3 style={{margin:0,fontSize:20,color:'#0f172a'}}>Attention neighbours</h3><p style={{margin:'6px 0 0',color:'#64748b',fontSize:14}}>Circle radius shows how loudly each training building votes for the current query.</p></div><button onClick={function(){setFrozen(!frozen);}} style={{border:'1px solid #cbd5e1',background:frozen?'#0f172a':'white',color:frozen?'white':'#334155',borderRadius:7,padding:'8px 12px',fontWeight:800,cursor:'pointer',fontFamily:'inherit'}}>{frozen?'Query frozen':'Freeze query'}</button></div><div style={{display:'grid',gridTemplateColumns:'1.1fr .9fr',gap:16}}><div><svg width={W} height={H} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:10}}>{dataset.X.map(function(x,i){var r=3+Math.sqrt(weights[i])*45;return <circle key={i} cx={sx(x[0])} cy={sy(x[1])} r={r} fill={COLORS[dataset.y[i]]} opacity={0.25+Math.min(weights[i]*10,.55)} stroke="white"/>;})}<circle cx={sx(query[0])} cy={sy(query[1])} r={10} fill="none" stroke="#0f172a" strokeWidth="3"/><text x="12" y={H-8} fill="#64748b" fontSize="10">Energy →</text></svg><label style={{display:'block',marginTop:12,fontSize:13,fontWeight:800}}>Bandwidth w = {parseFloat(bw).toFixed(1)}<input style={{width:'100%'}} type="range" min="0.3" max="8" step="0.1" value={bw} onChange={function(e){setBw(e.target.value);}}/></label><div style={{fontSize:12,color:'#64748b'}}>Query: energy {Math.round(query[0]).toLocaleString()}, sqft {Math.round(query[1]).toLocaleString()}</div></div><div><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead><tr><th style={{textAlign:'left',padding:6}}>Rank</th><th style={{textAlign:'left',padding:6}}>Class</th><th style={{textAlign:'right',padding:6}}>Distance</th><th style={{textAlign:'right',padding:6}}>Weight%</th></tr></thead><tbody>{ranked.map(function(r,idx){return <tr key={r.i}><td style={{padding:6,borderTop:'1px solid #e2e8f0'}}>{idx+1}</td><td style={{padding:6,borderTop:'1px solid #e2e8f0',color:COLORS[dataset.y[r.i]],fontWeight:800}}>{CLASSES[dataset.y[r.i]]}</td><td style={{padding:6,borderTop:'1px solid #e2e8f0',textAlign:'right'}}>{r.d.toFixed(2)}</td><td style={{padding:6,borderTop:'1px solid #e2e8f0',textAlign:'right'}}>{(r.w*100).toFixed(1)}</td></tr>;})}</tbody></table><div style={{marginTop:12}}><ProbBar probs={probs}/></div></div></div></VizFrame>;
}
function GradientStepTrace(){
  var [lr,setLr]=useState(.25),[w,setW]=useState(0),[rows,setRows]=useState([]),[flash,setFlash]=useState(false),[running,setRunning]=useState(false);
  var loss=function(x){return Math.pow(x-3,2);}; var grad=function(x){return 2*(x-3);};
  function oneStep(){var g=grad(w), stepSize=lr*g, nw=w-stepSize, prev=loss(w), next=loss(nw);setRows(function(r){return r.concat([{it:r.length+1,w:w,loss:prev,grad:g,step:stepSize}]).slice(-8);});setW(nw);setFlash(next>prev);setTimeout(function(){setFlash(false);},220);}
  function run10(){if(running)return;setRunning(true);var count=0;var id=setInterval(function(){oneStep();count++;if(count>=10){clearInterval(id);setRunning(false);}},200);}
  var W=360,H=220; function sx(x){return (x+1)/8*W;} function sy(y){return H-(y/16*H);} var pts=[]; for(var x=-1;x<=7.001;x+=.08)pts.push(sx(x)+','+sy(loss(x))); var gx=grad(w), dir=gx>0?-1:1;
  return <VizFrame><h3 style={{margin:'0 0 12px',fontSize:20,color:'#0f172a'}}>Gradient step trace</h3><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}><svg width={W} height={H} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:10}}><polyline points={pts.join(' ')} fill="none" stroke="#2563eb" strokeWidth="3"/><line x1={sx(w)} y1={sy(loss(w))} x2={sx(w+dir*.7)} y2={sy(loss(w))+20} stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrow)"/><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#dc2626"/></marker></defs><circle cx={sx(w)} cy={sy(loss(w))} r="7" fill={flash?'#dc2626':'#f59e0b'} stroke="white" strokeWidth="2"/><text x="8" y="16" fontSize="11" fill="#64748b">L = (w - 3)^2</text><text x={W-56} y={H-8} fontSize="11" fill="#64748b">weight</text></svg><div><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}><thead><tr>{['iteration','weight','loss','gradient','step_size'].map(function(h){return <th key={h} style={{textAlign:'right',padding:5,borderBottom:'1px solid #e2e8f0'}}>{h}</th>;})}</tr></thead><tbody>{rows.map(function(r){return <tr key={r.it}><td style={{padding:5,textAlign:'right'}}>{r.it}</td><td style={{padding:5,textAlign:'right'}}>{r.w.toFixed(3)}</td><td style={{padding:5,textAlign:'right'}}>{r.loss.toFixed(3)}</td><td style={{padding:5,textAlign:'right'}}>{r.grad.toFixed(3)}</td><td style={{padding:5,textAlign:'right'}}>{r.step.toFixed(3)}</td></tr>;})}</tbody></table></div></div><div style={{marginTop:14,display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}><label style={{fontSize:13,fontWeight:800}}>Learning rate {lr.toFixed(2)} <input type="range" min="0.01" max="1.5" step="0.01" value={lr} onChange={function(e){setLr(+e.target.value);}}/></label><button onClick={oneStep} style={{padding:'8px 12px',borderRadius:7,border:'1px solid #cbd5e1',background:'white'}}>Step</button><button onClick={run10} style={{padding:'8px 12px',borderRadius:7,border:'1px solid #cbd5e1',background:'white'}}>Run 10 steps</button><button onClick={function(){setW(0);setRows([]);}} style={{padding:'8px 12px',borderRadius:7,border:'1px solid #cbd5e1',background:'white'}}>Reset</button>{lr>1&&<span style={{color:'#dc2626',fontWeight:800}}>⚠ Learning rate too large — may diverge</span>}</div></VizFrame>;
}
function ConfusionMatrixExplorer(){
  var [mode,setMode]=useState('counts'),[sel,setSel]=useState(null);
  var M=[[72,21,7],[18,69,13],[5,11,84]], total=300, correct=225;
  var rowS=M.map(function(r){return r.reduce(function(a,b){return a+b;},0);});
  var colS=[0,1,2].map(function(j){return M[0][j]+M[1][j]+M[2][j];});
  var prec=[0,1,2].map(function(i){return M[i][i]/colS[i];}), rec=[0,1,2].map(function(i){return M[i][i]/rowS[i];});
  var f1=[0,1,2].map(function(i){return 2*prec[i]*rec[i]/(prec[i]+rec[i]);});
  var macro=f1.reduce(function(a,b){return a+b;},0)/3, weighted=f1.reduce(function(a,b,i){return a+b*rowS[i]/total;},0);
  function val(i,j){if(mode==='row')return (M[i][j]/rowS[i]*100).toFixed(1)+'%'; if(mode==='col')return (M[i][j]/colS[j]*100).toFixed(1)+'%'; return M[i][j];}
  var messages={ '1-0':'18 Commercial buildings were predicted as Residential — these are likely small offices with low energy use, similar to large houses.' };
  function msg(c){if(!c)return 'Click a cell to inspect what that mistake or correct prediction means.';var i=c[0],j=c[1],n=M[i][j];if(messages[i+'-'+j])return messages[i+'-'+j];if(i===j)return n+' '+CLASSES[i]+' buildings were correctly predicted as '+CLASSES[j]+'.';return n+' '+CLASSES[i]+' buildings were predicted as '+CLASSES[j]+' — this usually means their feature values look closer to '+CLASSES[j]+' than their true class.';}
  return <VizFrame><h3 style={{margin:'0 0 12px',fontSize:20,color:'#0f172a'}}>Confusion matrix explorer</h3><div style={{display:'flex',gap:8,marginBottom:12}}>{[['counts','Show counts'],['row','Show row % (Recall)'],['col','Show col % (Precision)']].map(function(m){return <button key={m[0]} onClick={function(){setMode(m[0]);}} style={{padding:'7px 11px',borderRadius:7,border:'1px solid '+(mode===m[0]?'#2563eb':'#cbd5e1'),background:mode===m[0]?'#eff6ff':'white',color:mode===m[0]?'#1d4ed8':'#334155',fontWeight:800}}>{m[1]}</button>;})}</div><div style={{display:'grid',gridTemplateColumns:'120px repeat(3,1fr)',maxWidth:620}}><div></div>{CLASSES.map(function(c){return <div key={c} style={{padding:8,textAlign:'center',fontWeight:800}}>Pred {c.slice(0,3)}</div>;})}{M.map(function(row,i){return [<div key={'a'+i} style={{padding:8,fontWeight:800}}>Actual {CLASSES[i].slice(0,3)}</div>].concat(row.map(function(n,j){var good=i===j,opacity=.18+n/100*.65;return <button key={i+'-'+j} onClick={function(){setSel([i,j]);}} style={{height:70,border:'1px solid white',background:(good?'rgba(22,163,74,'+opacity+')':'rgba(220,38,38,'+opacity+')'),color:'#0f172a',fontSize:20,fontWeight:900,cursor:'pointer'}}>{val(i,j)}</button>;}));})}</div><div style={{marginTop:12,padding:12,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#334155'}}>{msg(sel)}</div><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:12}}><TinyStat label="Accuracy" value={(correct/total*100).toFixed(1)+'%'} color="#166534"/><TinyStat label="Macro F1" value={macro.toFixed(3)} color="#1d4ed8"/><TinyStat label="Weighted F1" value={weighted.toFixed(3)} color="#7c3aed"/></div><div style={{marginTop:12,padding:12,background:'#eff6ff',border:'1px solid #93c5fd',borderRadius:8,color:'#1e40af',lineHeight:1.6}}><strong>What does this mean?</strong> The model is strongest on Industrial recall ({(rec[2]*100).toFixed(1)}%) and weakest where Residential and Commercial overlap. Most mistakes are between neighboring-looking classes, not random failures.</div></VizFrame>;
}
function VizBlock({name,props}){
  var map={WeightVectorViz:WeightVectorViz,ScalingExplorer:ScalingExplorer,AttentionNeighbours:AttentionNeighbours,GradientStepTrace:GradientStepTrace,ConfusionMatrixExplorer:ConfusionMatrixExplorer};
  var C=map[name];
  if(!C)return <Callout type="warning" title="Missing visualization">Unknown visualization: {name}</Callout>;
  return <C {...(props||{})}/>;
}
/* ── Lesson page renderer ───────────────────────────────────────── */
function LessonPage({idx}){
  var blocks=(window.BLOCKS&&window.BLOCKS[idx])||[];
  return(
    <div>
      <h1 style={{fontSize:32,fontWeight:800,color:'#0f172a',marginBottom:18}}>{(window.LESSON_TITLES&&window.LESSON_TITLES[idx])||'Lesson '+idx}</h1>
      {blocks.map(function(b,i){
        if(b[0]==='p') return <p key={i} style={{color:'#475569',lineHeight:1.85,fontSize:16,marginBottom:14}}>{b[1]}</p>;
        if(b[0]==='h2') return <h2 key={i} style={{fontSize:22,fontWeight:700,color:'#1e293b',marginTop:36,marginBottom:14,paddingBottom:8,borderBottom:'1px solid #e2e8f0'}}>{b[1]}</h2>;
        if(b[0]==='code') return <CB key={i} filename={b[1]} code={b[2]}/>;
        if(b[0]==='math') return <MathB key={i}>{b[1]}</MathB>;
        if(b[0]==='callout') return <Callout key={i} type={b[1]} title={b[2]}>{b[3]}</Callout>;
        if(b[0]==='streamlit') return <StreamlitTip key={i} page={b[1]}>{b[2]}</StreamlitTip>;
        if(b[0]==='quiz') return <QuizBlock key={i} qs={b[1]}/>;
        if(b[0]==='prompt') return <PromptBlock key={i} title={b[1]} prompt={b[2]}/>;
        if(b[0]==='viz') return <VizBlock key={i} name={b[1]} props={b[2]}/>;
        return null;
      })}
    </div>
  );
}

/* ── Demo 1 — Live Predictor ────────────────────────────────────── */
function ProbBar({probs}){
  return(
    <div style={{marginTop:8}}>
      {['Residential','Commercial','Industrial'].map(function(cls,i){
        return(
          <div key={i} style={{marginBottom:7}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:2}}>
              <span style={{color:COLORS[i],fontWeight:600}}>{cls}</span>
              <span style={{fontFamily:'monospace',color:'#64748b'}}>{(probs[i]*100).toFixed(1)}%</span>
            </div>
            <div style={{height:9,background:'#e2e8f0',borderRadius:5,overflow:'hidden'}}>
              <div style={{height:'100%',width:(probs[i]*100)+'%',background:COLORS[i],borderRadius:5,transition:'width .3s ease'}}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LivePredictor(){
  var [energy,setEnergy]=useState(6000);
  var [sqft,setSqft]=useState(1200);
  var [sel,setSel]=useState('OvR');
  var [models,setModels]=useState(null);

  var dataset=useMemo(function(){
    var d=window.generateData();
    var sc=new window.Scaler().fit(d.X);
    return {X:d.X,y:d.y,sc:sc,Xsc:sc.transform(d.X)};
  },[]);

  useEffect(function(){
    var ovr=window.trainOvR(dataset.Xsc,dataset.y);
    var sm=window.trainSoftmax(dataset.Xsc,dataset.y);
    setModels({OvR:ovr,Softmax:sm,Attention:{
      proba:function(Xt){return Xt.map(function(xi){return window.attnProba(dataset.Xsc,dataset.y,xi,2.0);});}
    }});
  },[dataset]);

  var qi=useMemo(function(){return dataset.sc.transformOne([energy,sqft]);}, [dataset,energy,sqft]);
  var probs=useMemo(function(){
    if(!models) return [1/3,1/3,1/3];
    return models[sel].proba([qi])[0];
  },[models,qi,sel]);
  var pred=probs.indexOf(Math.max.apply(null,probs));
  useEffect(function(){window.__livePredictorQuery={raw:[energy,sqft],scaled:qi,probs:probs,pred:pred};},[energy,sqft,qi,probs,pred]);

  var W=260,H=160;
  var x0vals=dataset.X.map(function(x){return x[0];});
  var x1vals=dataset.X.map(function(x){return x[1];});
  var x0mn=Math.min.apply(null,x0vals),x0mx=Math.max.apply(null,x0vals);
  var x1mn=Math.min.apply(null,x1vals),x1mx=Math.max.apply(null,x1vals);
  var px=function(v){return 10+(v-x0mn)/(x0mx-x0mn)*(W-20);};
  var py=function(v){return H-10-(v-x1mn)/(x1mx-x1mn)*(H-20);};
  var qx=px(energy),qy=py(sqft);

  return(
    <div>
      <h1 style={{fontSize:24,fontWeight:800,marginBottom:4}}>🎯 Live Predictor</h1>
      <p style={{color:'#64748b',fontSize:13,marginBottom:14}}>
        All three models trained in-browser on 80 synthetic buildings. No Python server needed.
        Use the sliders to move through the feature space and watch the probabilities update.
      </p>
      {!models&&<div style={{padding:24,textAlign:'center',background:'#f1f5f9',borderRadius:10,color:'#94a3b8'}}>⚙️ Training models…</div>}
      {models&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div style={{background:'#f8fafc',borderRadius:10,padding:14,border:'1px solid #e2e8f0'}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:'#1e293b'}}>Building features (core set)</div>
            <label style={{display:'block',marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:600,marginBottom:3}}>
                Energy Consumption: <span style={{color:'#3b82f6'}}>{energy.toLocaleString()} kWh</span>
              </div>
              <input type="range" min="1000" max="60000" step="500" value={energy} onChange={function(e){setEnergy(+e.target.value);}}/>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#94a3b8',marginTop:1}}><span>1 000 (residential)</span><span>60 000 (industrial)</span></div>
            </label>
            <label style={{display:'block',marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:600,marginBottom:3}}>
                Square Footage: <span style={{color:'#3b82f6'}}>{sqft.toLocaleString()} sqft</span>
              </div>
              <input type="range" min="500" max="30000" step="200" value={sqft} onChange={function(e){setSqft(+e.target.value);}}/>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#94a3b8',marginTop:1}}><span>500 (apartment)</span><span>30 000 (factory)</span></div>
            </label>
            <div>
              <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Model (src/models.py)</div>
              <div style={{display:'flex',gap:6}}>
                {['OvR','Softmax','Attention'].map(function(m){
                  return(
                    <button key={m} onClick={function(){setSel(m);}}
                      style={{padding:'4px 12px',borderRadius:6,border:'1px solid '+(sel===m?'#3b82f6':'#e2e8f0'),background:sel===m?'#eff6ff':'white',color:sel===m?'#1d4ed8':'#64748b',fontSize:12,fontWeight:sel===m?700:400,fontFamily:'inherit'}}>
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{background:'#f8fafc',borderRadius:10,padding:14,border:'1px solid #e2e8f0'}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:6}}>Prediction — {sel}</div>
            <div style={{textAlign:'center',padding:'10px 0',borderBottom:'1px solid #e2e8f0',marginBottom:10}}>
              <div style={{fontSize:22,fontWeight:800,color:COLORS[pred]}}>{CLASSES[pred]}</div>
              <div style={{fontSize:11.5,color:'#64748b',marginTop:2}}>confidence: {(Math.max.apply(null,probs)*100).toFixed(1)}%</div>
            </div>
            <ProbBar probs={probs}/>
          </div>

          <div style={{gridColumn:'1/-1',background:'#f8fafc',borderRadius:10,padding:14,border:'1px solid #e2e8f0'}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>Feature space — Energy (kWh) vs Square Footage (sqft)</div>
            <div style={{display:'flex',gap:20,alignItems:'flex-start'}}>
              <svg width={W} height={H} style={{flexShrink:0,border:'1px solid #e2e8f0',borderRadius:6,background:'#fff'}}>
                {dataset.X.map(function(xi,i){
                  return <circle key={i} cx={px(xi[0])} cy={py(xi[1])} r={3.5} fill={COLORS[dataset.y[i]]} opacity={0.6}/>;
                })}
                <circle cx={qx} cy={qy} r={8} fill="none" stroke="#0f172a" strokeWidth={2}/>
                <circle cx={qx} cy={qy} r={4.5} fill={COLORS[pred]} opacity={0.9}/>
                <text x={8} y={H-3} fontSize={9} fill="#94a3b8">Energy →</text>
                <text x={3} y={14} fontSize={9} fill="#94a3b8">↑ Sqft</text>
              </svg>
              <div style={{flex:1,fontSize:12,color:'#475569',lineHeight:1.7}}>
                <p><strong>⬤ circle with ring</strong> = your query building</p>
                <p style={{color:COLORS[0]}}>⬤ Blue = Residential</p>
                <p style={{color:COLORS[1]}}>⬤ Amber = Commercial</p>
                <p style={{color:COLORS[2]}}>⬤ Red = Industrial</p>
                <p style={{marginTop:8,color:'#94a3b8'}}>Notice the overlap in the centre — this is why the model reaches only ~63% accuracy on 2 features.</p>
              </div>
            </div>
            <div style={{marginTop:10,display:'flex',gap:16,fontSize:11,color:'#64748b'}}>
              {CLASSES.map(function(c,i){return <span key={i}><span style={{color:COLORS[i]}}>●</span> {c}</span>;})}
              <span><span style={{color:'#1e293b'}}>◎</span> Query</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Demo 2 — Gradient Descent ──────────────────────────────────── */
function LossCurveChart({losses}){
  if(!losses||!losses.length) return(
    <div style={{height:100,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#94a3b8',background:'#f8fafc',borderRadius:8,border:'1px dashed #e2e8f0'}}>
      Loss curve appears after first step
    </div>
  );
  var W=300,H=100,n=losses.length;
  var mn=Math.min.apply(null,losses),mx=Math.max.apply(null,losses);
  var rng=mx-mn+1e-10;
  var pts=losses.map(function(l,i){return (10+i/(n-1||1)*(W-20))+','+(H-10-(l-mn)/rng*(H-20));}).join(' ');
  return(
    <svg width={W} height={H} style={{display:'block',border:'1px solid #e2e8f0',borderRadius:8,background:'#f8fafc',width:'100%'}}>
      <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth={1.8}/>
      <text x={8} y={14} fontSize={9} fill="#94a3b8">{mx.toFixed(3)}</text>
      <text x={8} y={H-3} fontSize={9} fill="#94a3b8">{mn.toFixed(3)}</text>
      <text x={W-40} y={H-3} fontSize={9} fill="#94a3b8">iter {n}</text>
    </svg>
  );
}

function GradientDescentViz(){
  var canvasRef=useRef(null);
  var [lr,setLr]=useState(0.1);
  var [alpha,setAlpha]=useState(0.01);
  var [running,setRunning]=useState(false);
  var [step,setStep]=useState(0);
  var wRef=useRef([0.2,-0.2]);
  var bRef=useRef(0);
  var pathRef=useRef([[0.2,-0.2]]);
  var lossRef=useRef([]);
  var timerRef=useRef(null);

  var dataset=useMemo(function(){
    var d=window.generateData();
    var sc=new window.Scaler().fit(d.X);
    var Xsc=sc.transform(d.X);
    var yb=d.y.map(function(yi){return yi===0?1:0;}); /* Residential vs rest */
    return {Xsc:Xsc,yb:yb};
  },[]);

  var redraw=useCallback(function(){
    window.renderLandscape(canvasRef.current,dataset.Xsc,dataset.yb,pathRef.current,parseFloat(alpha));
  },[dataset,alpha]);

  useEffect(function(){redraw();},[redraw]);
  useEffect(function(){redraw();},[step]);

  var doStep=useCallback(function(){
    var res=window.gdStep(dataset.Xsc,dataset.yb,wRef.current,bRef.current,parseFloat(lr),parseFloat(alpha));
    wRef.current=res.w; bRef.current=res.b;
    pathRef.current=pathRef.current.concat([[res.w[0],res.w[1]]]).slice(-600);
    lossRef.current=lossRef.current.concat([window.binaryLoss(dataset.Xsc,dataset.yb,res.w,res.b,parseFloat(alpha))]);
    setStep(function(s){return s+1;});
  },[dataset,lr,alpha]);

  useEffect(function(){
    if(running){timerRef.current=setInterval(doStep,60);}
    else{clearInterval(timerRef.current);}
    return function(){clearInterval(timerRef.current);};
  },[running,doStep]);

  var reset=function(){
    clearInterval(timerRef.current);
    wRef.current=[0.2,-0.2]; bRef.current=0;
    pathRef.current=[[0.2,-0.2]]; lossRef.current=[];
    setRunning(false); setStep(0);
  };

  var lastLoss=lossRef.current.length?lossRef.current[lossRef.current.length-1]:null;

  return(
    <div>
      <h1 style={{fontSize:24,fontWeight:800,marginBottom:4}}>📉 Gradient Descent Visualizer</h1>
      <p style={{color:'#64748b',fontSize:13,marginBottom:14}}>
        The heatmap shows binary cross-entropy loss at every (w₁, w₂) coordinate — dark blue = low loss.
        The yellow path is gradient descent finding the minimum. This is exactly what <code style={{background:'#f1f5f9',padding:'0 3px',borderRadius:3}}>_fit_binary()</code> does inside LogisticRegressionOvR.
      </p>
      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:16,marginBottom:14}}>
        <div>
          <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>Loss landscape: Residential vs rest (b=0 slice)</div>
          <canvas ref={canvasRef} width={270} height={270} style={{width:270,height:270,borderRadius:10,border:'1px solid #e2e8f0',display:'block'}}/>
          <div style={{fontSize:10,marginTop:4,display:'flex',gap:10,flexWrap:'wrap',color:'#64748b'}}>
            <span style={{color:'#1e3a8a'}}>■ low loss</span>
            <span style={{color:'#dc2626'}}>■ high loss</span>
            <span style={{color:'#ca8a04'}}>— path</span>
            <span style={{color:'#16a34a'}}>● start</span>
            <span style={{color:'#d97706'}}>● current</span>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div>
            <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>Cross-entropy loss over iterations</div>
            <LossCurveChart losses={lossRef.current}/>
          </div>
          <div style={{background:'#0f172a',borderRadius:8,padding:'10px 14px',fontSize:12,fontFamily:'monospace',color:'#94a3b8',lineHeight:1.8}}>
            <div><span style={{color:'#64748b'}}>step =</span> <span style={{color:'#e2e8f0'}}>{step}</span></div>
            <div><span style={{color:'#64748b'}}>w₁ =</span> <span style={{color:'#82aaff'}}>{wRef.current[0].toFixed(4)}</span>{'  '}<span style={{color:'#64748b'}}>w₂ =</span> <span style={{color:'#82aaff'}}>{wRef.current[1].toFixed(4)}</span></div>
            <div><span style={{color:'#64748b'}}>loss =</span> <span style={{color:lastLoss!==null?'#4ade80':'#64748b'}}>{lastLoss!==null?lastLoss.toFixed(5):'—'}</span></div>
          </div>
          <div style={{background:'#fffbeb',border:'1px solid #f59e0b',borderRadius:8,padding:'10px 12px',fontSize:12.5,color:'#92400e',lineHeight:1.65}}>
            <strong>What to try:</strong><br/>
            η = 0.05 → smooth descent. η = 0.45 → zigzag (too large, oscillates). η = 0.01 → very slow. Increase L2 α → the minimum shifts toward (0,0) as regularisation pulls weights small.
          </div>
        </div>
      </div>
      <div style={{background:'#f8fafc',borderRadius:10,padding:14,border:'1px solid #e2e8f0'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:12}}>
          <label>
            <div style={{fontSize:12,fontWeight:600,marginBottom:3}}>η (learning rate) = {parseFloat(lr).toFixed(3)}</div>
            <input type="range" min="0.01" max="0.5" step="0.01" value={lr} onChange={function(e){setLr(e.target.value);reset();}}/>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#94a3b8'}}><span>0.01 slow</span><span>0.5 may diverge</span></div>
          </label>
          <label>
            <div style={{fontSize:12,fontWeight:600,marginBottom:3}}>L2 α = {parseFloat(alpha).toFixed(3)}</div>
            <input type="range" min="0" max="0.3" step="0.01" value={alpha} onChange={function(e){setAlpha(e.target.value);reset();}}/>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#94a3b8'}}><span>0 none</span><span>0.3 strong</span></div>
          </label>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={function(){setRunning(function(r){return !r;});}}
            style={{padding:'7px 18px',borderRadius:7,border:'none',background:running?'#dc2626':'#2563eb',color:'white',fontSize:13,fontWeight:700,fontFamily:'inherit'}}>
            {running?'⏸ Pause':'▶ Run'}
          </button>
          <button onClick={doStep} style={{padding:'7px 14px',borderRadius:7,border:'1px solid #e2e8f0',background:'white',color:'#475569',fontSize:13,fontFamily:'inherit'}}>→ Step</button>
          <button onClick={reset} style={{padding:'7px 14px',borderRadius:7,border:'1px solid #e2e8f0',background:'white',color:'#475569',fontSize:13,fontFamily:'inherit'}}>↺ Reset</button>
        </div>
      </div>
    </div>
  );
}

/* ── Demo 3 — Attention Heatmap ─────────────────────────────────── */
function AttentionHeatmapViz(){
  var [bw,setBw]=useState(2.0);
  var [qEnergy,setQEnergy]=useState(6000);
  var [qSqft,setQSqft]=useState(1500);

  var dataset=useMemo(function(){
    var d=window.generateData();
    var sc=new window.Scaler().fit(d.X);
    return {X:d.X,y:d.y,sc:sc,Xsc:sc.transform(d.X)};
  },[]);

  var qi=useMemo(function(){return dataset.sc.transformOne([qEnergy,qSqft]);}, [dataset,qEnergy,qSqft]);
  var wts=useMemo(function(){return window.attnWeights(dataset.Xsc,qi,parseFloat(bw));}, [dataset,qi,bw]);
  var probs=useMemo(function(){return window.attnProba(dataset.Xsc,dataset.y,qi,parseFloat(bw));}, [dataset,qi,bw]);
  var pred=probs.indexOf(Math.max.apply(null,probs));

  var top5=useMemo(function(){
    return wts.map(function(w,i){return {w:w,i:i};}).sort(function(a,b){return b.w-a.w;}).slice(0,5);
  },[wts]);

  var W=300,H=200;
  var x0vals=dataset.Xsc.map(function(x){return x[0];});
  var x1vals=dataset.Xsc.map(function(x){return x[1];});
  var x0mn=Math.min.apply(null,x0vals)-.4,x0mx=Math.max.apply(null,x0vals)+.4;
  var x1mn=Math.min.apply(null,x1vals)-.4,x1mx=Math.max.apply(null,x1vals)+.4;
  var sx=function(v){return 10+(v-x0mn)/(x0mx-x0mn)*(W-20);};
  var sy=function(v){return H-10-(v-x1mn)/(x1mx-x1mn)*(H-20);};

  return(
    <div>
      <h1 style={{fontSize:24,fontWeight:800,marginBottom:4}}>🔥 Attention Heatmap</h1>
      <p style={{color:'#64748b',fontSize:13,marginBottom:14}}>
        Circle size = attention weight for the query building. Larger circles vote more strongly.
        This visualises exactly what <code style={{background:'#f1f5f9',padding:'0 3px',borderRadius:3}}>predict_proba()</code> computes inside AttentionClassifier: <em>exp(−dist / w)</em>, normalised.
      </p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 200px',gap:14,marginBottom:14}}>
        <div style={{background:'#f8fafc',borderRadius:10,padding:12,border:'1px solid #e2e8f0'}}>
          <div style={{fontSize:11,color:'#64748b',marginBottom:6}}>Scaled feature space — circle area ∝ attention weight</div>
          <svg width={W} height={H} style={{display:'block',width:'100%',maxWidth:W}}>
            {dataset.Xsc.map(function(xi,i){
              var r=Math.max(2.5,Math.sqrt(wts[i])*40);
              var op=Math.max(0.12,wts[i]*8);
              return <circle key={i} cx={sx(xi[0])} cy={sy(xi[1])} r={r} fill={COLORS[dataset.y[i]]} opacity={op} style={{transition:'r .2s,opacity .2s'}}/>;
            })}
            <circle cx={sx(qi[0])} cy={sy(qi[1])} r={9} fill="none" stroke="#0f172a" strokeWidth={2}/>
            <circle cx={sx(qi[0])} cy={sy(qi[1])} r={5} fill={COLORS[pred]}/>
            <text x={sx(qi[0])+11} y={sy(qi[1])-5} fontSize={10} fill="#0f172a" fontWeight="bold">Query</text>
            <text x={8} y={H-3} fontSize={9} fill="#94a3b8">w₁ (Energy scaled) →</text>
          </svg>
          <div style={{display:'flex',gap:12,marginTop:6,fontSize:11,justifyContent:'center'}}>
            {CLASSES.map(function(c,i){return <span key={i}><span style={{color:COLORS[i]}}>●</span> {c}</span>;})}
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{background:'#f8fafc',borderRadius:10,padding:12,border:'1px solid #e2e8f0',textAlign:'center'}}>
            <div style={{fontSize:11,fontWeight:600,color:'#64748b',marginBottom:4}}>Prediction</div>
            <div style={{fontSize:20,fontWeight:800,color:COLORS[pred]}}>{CLASSES[pred]}</div>
            <ProbBar probs={probs}/>
          </div>
          <div style={{background:'#f8fafc',borderRadius:10,padding:12,border:'1px solid #e2e8f0'}}>
            <div style={{fontWeight:700,fontSize:12,marginBottom:8}}>Top 5 influencers</div>
            {top5.map(function(item){
              return(
                <div key={item.i} style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:COLORS[dataset.y[item.i]],flexShrink:0}}/>
                  <div style={{flex:1,height:5,background:'#e2e8f0',borderRadius:3,overflow:'hidden'}}>
                    <div style={{height:'100%',width:Math.min(item.w*800,100)+'%',background:COLORS[dataset.y[item.i]]}}/>
                  </div>
                  <span style={{fontSize:11,fontFamily:'monospace',color:'#64748b',minWidth:36}}>{(item.w*100).toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{background:'#f8fafc',borderRadius:10,padding:14,border:'1px solid #e2e8f0'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
          <label>
            <div style={{fontSize:12,fontWeight:600,marginBottom:3}}>Energy: {qEnergy.toLocaleString()} kWh</div>
            <input type="range" min="1000" max="60000" step="500" value={qEnergy} onChange={function(e){setQEnergy(+e.target.value);}}/>
          </label>
          <label>
            <div style={{fontSize:12,fontWeight:600,marginBottom:3}}>Sqft: {qSqft.toLocaleString()}</div>
            <input type="range" min="500" max="30000" step="200" value={qSqft} onChange={function(e){setQSqft(+e.target.value);}}/>
          </label>
          <label>
            <div style={{fontSize:12,fontWeight:600,marginBottom:3}}>Bandwidth w = {parseFloat(bw).toFixed(1)}</div>
            <input type="range" min="0.3" max="8" step="0.1" value={bw} onChange={function(e){setBw(e.target.value);}}/>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#94a3b8'}}><span>0.3 (1-NN)</span><span>8 (uniform)</span></div>
          </label>
        </div>
        <div style={{marginTop:10,fontSize:12,color:'#475569',lineHeight:1.65}}>
          <strong>Try:</strong> w = 0.3 → only the nearest neighbour dominates (single large circle).
          w = 8 → all circles equal size (majority class always wins — Industrial has 25 buildings here, same as Residential).
          Sweet spot: w ≈ 2–3 gives smooth, generalising predictions.
        </div>
      </div>
    </div>
  );
}

/* ── Demo 4 — Decision Boundary ─────────────────────────────────── */
function DecisionBoundaryViz(){
  var canvasRef=useRef(null);
  var [sel,setSel]=useState('OvR');
  var [bw,setBw]=useState(2.0);
  var [models,setModels]=useState(null);
  var [acc,setAcc]=useState(null);
  var [busy,setBusy]=useState(false);

  var dataset=useMemo(function(){
    var d=window.generateData();
    var sc=new window.Scaler().fit(d.X);
    return {X:d.X,y:d.y,sc:sc,Xsc:sc.transform(d.X)};
  },[]);

  useEffect(function(){
    var ovr=window.trainOvR(dataset.Xsc,dataset.y);
    var sm=window.trainSoftmax(dataset.Xsc,dataset.y);
    setModels({OvR:ovr,Softmax:sm});
  },[dataset]);

  var redraw=useCallback(function(){
    if(!models&&sel!=='Attention') return;
    setBusy(true);
    setTimeout(function(){
      var fn,preds;
      var bwV=parseFloat(bw);
      if(sel==='OvR'){
        fn=function(g){return models.OvR.proba(g);};
        preds=models.OvR.predict(dataset.Xsc);
      } else if(sel==='Softmax'){
        fn=function(g){return models.Softmax.proba(g);};
        preds=models.Softmax.predict(dataset.Xsc);
      } else {
        fn=function(g){return g.map(function(xi){return window.attnProba(dataset.Xsc,dataset.y,xi,bwV);});};
        preds=dataset.Xsc.map(function(xi){
          var p=window.attnProba(dataset.Xsc,dataset.y,xi,bwV);
          return p.indexOf(Math.max.apply(null,p));
        });
      }
      var correct=preds.filter(function(p,i){return p===dataset.y[i];}).length;
      setAcc((correct/dataset.y.length*100).toFixed(1));
      window.renderBoundary(canvasRef.current,fn,dataset.Xsc,dataset.y,sel==='Attention'?55:70);
      setBusy(false);
    },0);
  },[models,sel,dataset,bw]);

  useEffect(function(){if(models)redraw();},[models,sel,bw]);

  var descriptions={
    OvR:'Three independent sigmoid classifiers. Decision boundary = straight line (hyperplane). Linear classifier.',
    Softmax:'One joint weight matrix W_ (3×2). Decision boundary = straight line. Same linear family as OvR.',
    Attention:'Kernel-weighted vote from all training points. Decision boundary = smooth curve adapting to local data density.'
  };

  return(
    <div>
      <h1 style={{fontSize:24,fontWeight:800,marginBottom:4}}>🗺️ Decision Boundary Visualizer</h1>
      <p style={{color:'#64748b',fontSize:13,marginBottom:14}}>
        Background colour = model's predicted class at that (Energy, Sqft) coordinate.
        Dots = training buildings. Compare how OvR, Softmax, and Attention draw fundamentally different boundaries.
      </p>
      <div style={{display:'flex',gap:8,marginBottom:10,flexWrap:'wrap'}}>
        {['OvR','Softmax','Attention'].map(function(m){
          return(
            <button key={m} onClick={function(){setSel(m);}}
              style={{padding:'5px 16px',borderRadius:7,border:'1px solid '+(sel===m?'#3b82f6':'#e2e8f0'),background:sel===m?'#eff6ff':'white',color:sel===m?'#1d4ed8':'#64748b',fontSize:13,fontWeight:sel===m?700:400,fontFamily:'inherit'}}>
              {m}
            </button>
          );
        })}
        {sel==='Attention'&&(
          <label style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:'#475569'}}>
            <span>w =</span>
            <input type="range" min="0.5" max="6" step="0.5" value={bw} onChange={function(e){setBw(e.target.value);}} style={{width:90}}/>
            <span>{parseFloat(bw).toFixed(1)}</span>
          </label>
        )}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 220px',gap:14}}>
        <div style={{position:'relative'}}>
          <canvas ref={canvasRef} width={500} height={320} style={{width:'100%',height:'auto',borderRadius:10,border:'1px solid #e2e8f0',display:'block'}}/>
          {busy&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(248,250,252,.85)',borderRadius:10,fontSize:13,color:'#64748b'}}>Computing boundary…</div>}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {acc&&(
            <div style={{background:'#f0fdf4',borderRadius:10,padding:12,border:'1px solid #86efac',textAlign:'center'}}>
              <div style={{fontSize:11,color:'#166534',fontWeight:600,marginBottom:2}}>Training accuracy</div>
              <div style={{fontSize:28,fontWeight:800,color:'#14532d'}}>{acc}%</div>
              <div style={{fontSize:10,color:'#16a34a'}}>{sel} on 80 buildings</div>
            </div>
          )}
          <div style={{background:'#f8fafc',borderRadius:10,padding:12,border:'1px solid #e2e8f0',fontSize:12.5,color:'#475569',lineHeight:1.65}}>
            <strong style={{display:'block',marginBottom:4}}>{sel}</strong>
            {descriptions[sel]}
          </div>
          <div style={{background:'#fffbeb',border:'1px solid #f59e0b',borderRadius:8,padding:10,fontSize:12,color:'#92400e',lineHeight:1.65}}>
            <strong>Key observation:</strong> Industrial (top-right) is always clean. Residential/Commercial overlap (bottom-left) is where all models make errors — this is class overlap, not a model weakness.
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:4,fontSize:11}}>
            {CLASSES.map(function(c,i){return(
              <div key={i} style={{display:'flex',alignItems:'center',gap:6}}>
                <div style={{width:12,height:12,borderRadius:2,background:COLORS[i],opacity:.4}}/>
                <div style={{width:8,height:8,borderRadius:'50%',background:COLORS[i]}}/>
                <span style={{color:'#64748b'}}>{c} region + samples</span>
              </div>
            );})}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Final Exam ─────────────────────────────────────────────────── */
function FinalExam(){
  var [answers,setAnswers]=useState({});
  var [submitted,setSubmitted]=useState(false);
  var n=window.FQ.length;
  var answered=Object.keys(answers).length;
  var score=window.FQ.reduce(function(s,q,i){return s+(answers[i]===q.a?1:0);},0);
  var pct=Math.round(score/n*100);
  var pass=pct>=70;

  if(submitted){
    return(
      <div>
        <h1 style={{fontSize:24,fontWeight:800,marginBottom:12}}>🎓 Results</h1>
        <div style={{textAlign:'center',padding:'24px 16px',background:pass?'#f0fdf4':'#fef2f2',borderRadius:14,border:'2px solid '+(pass?'#22c55e':'#ef4444'),marginBottom:20}}>
          <div style={{fontSize:44,marginBottom:8}}>{pass?'🏆':'📚'}</div>
          <div style={{fontSize:34,fontWeight:800,color:pass?'#14532d':'#7f1d1d'}}>{score}/{n}</div>
          <div style={{fontSize:18,fontWeight:700,color:pass?'#166534':'#991b1b',marginBottom:6}}>{pct}% — {pass?'PASS ✓':'Keep studying'}</div>
          <div style={{fontSize:13,color:pass?'#14532d':'#7f1d1d'}}>{pass?'You understand GradCurve end to end.':'Review the highlighted lessons and try again.'}</div>
        </div>
        <h2 style={{fontSize:17,fontWeight:700,marginBottom:12}}>Review</h2>
        {window.FQ.map(function(q,qi){
          var c=answers[qi]===q.a;
          return(
            <div key={qi} style={{marginBottom:8,padding:'10px 12px',borderRadius:8,background:c?'#f0fdf4':'#fef2f2',border:'1px solid '+(c?'#86efac':'#fca5a5')}}>
              <div style={{fontSize:12,fontWeight:600,marginBottom:3}}>
                <span style={{color:c?'#14532d':'#7f1d1d'}}>{c?'✓':'✗'}</span>
                {' '}[{q.t}] {q.q}
              </div>
              {!c&&<div style={{fontSize:11.5,color:'#475569'}}>Your answer: {(q.opts[answers[qi]]||{t:'—'}).t}</div>}
              <div style={{fontSize:11.5,color:'#14532d'}}>Correct: {q.opts[q.a].t}</div>
              <div style={{fontSize:11,color:'#64748b',marginTop:1}}>{q.opts[q.a].e}</div>
            </div>
          );
        })}
        <button onClick={function(){setAnswers({});setSubmitted(false);}} style={{marginTop:12,padding:'9px 22px',borderRadius:9,background:'#2563eb',color:'white',border:'none',fontSize:13,fontWeight:700,fontFamily:'inherit',cursor:'pointer'}}>
          ↺ Retake
        </button>
      </div>
    );
  }

  return(
    <div>
      <h1 style={{fontSize:24,fontWeight:800,marginBottom:6}}>🎓 Final Exam</h1>
      <p style={{color:'#64748b',fontSize:13,marginBottom:8}}>25 questions across all lessons. Pass mark: 70% (18/25). Answered: {answered}/{n}</p>
      <div style={{height:5,background:'#e2e8f0',borderRadius:3,marginBottom:16,overflow:'hidden'}}>
        <div style={{height:'100%',width:(answered/n*100)+'%',background:'#3b82f6',borderRadius:3,transition:'width .3s'}}/>
      </div>
      {window.FQ.map(function(q,qi){
        return(
          <div key={qi} style={{marginBottom:12,background:'#f8fafc',borderRadius:10,padding:'12px 14px',border:'1px solid '+(answers[qi]!==undefined?'#94a3b8':'#e2e8f0')}}>
            <p style={{fontWeight:600,fontSize:13,marginBottom:6,color:'#1e293b'}}>
              <span style={{fontSize:11,color:'#94a3b8',marginRight:6}}>[{q.t}]</span>
              {qi+1}. {q.q}
            </p>
            {q.opts.map(function(opt,oi){
              var chosen=answers[qi]===oi;
              return(
                <button key={oi} onClick={function(){setAnswers(function(a){var n=Object.assign({},a);n[qi]=oi;return n;});}}
                  style={{display:'block',width:'100%',textAlign:'left',padding:'6px 10px',borderRadius:6,border:'1px solid '+(chosen?'#3b82f6':'#e2e8f0'),background:chosen?'#eff6ff':'white',color:chosen?'#1d4ed8':'#475569',fontSize:12.5,cursor:'pointer',marginBottom:3,fontFamily:'inherit'}}>
                  <span style={{fontFamily:'monospace',fontWeight:700,marginRight:6}}>{String.fromCharCode(65+oi)}.</span>{opt.t}
                </button>
              );
            })}
          </div>
        );
      })}
      <button onClick={function(){if(answered===n)setSubmitted(true);}} disabled={answered<n}
        style={{padding:'10px 24px',borderRadius:9,background:answered===n?'#2563eb':'#cbd5e1',color:answered===n?'white':'#94a3b8',border:'none',fontSize:14,fontWeight:700,cursor:answered===n?'pointer':'not-allowed',fontFamily:'inherit',marginTop:8}}>
        {answered<n?('Answer '+(n-answered)+' more to submit'):('Submit ('+answered+'/'+n+' answered)')}
      </button>
    </div>
  );
}

/* ── Navigation ─────────────────────────────────────────────────── */
var NAV=[
  {id:'home',     label:'Home',                              g:'overview'},
  {id:'story',    label:'How I Built This Project',          g:'overview'},

  {id:'tour',     label:'1 · Codebase Tour',                 g:'start'},

  {id:'dataset',  label:'2 · Dataset',                       g:'data'},
  {id:'eda',      label:'3 · Notebook 01 · EDA',             g:'data'},

  {id:'feateng',  label:'4 · Feature Engineering',           g:'features'},
  {id:'featimportance', label:'5 · Notebook 03 · Feature Importance', g:'features'},
  {id:'scaling',  label:'6 · Feature Scaling',               g:'features'},

  {id:'gdlesson', label:'7 · Gradient Descent',               g:'models'},
  {id:'ovr',      label:'8 · LogReg OvR',                    g:'models'},
  {id:'softmax',  label:'9 · Softmax',                       g:'models'},
  {id:'attn',     label:'10 · Attention',                    g:'models'},
  {id:'xgb',      label:'11 · XGBoost',                      g:'models'},
  {id:'mlp',      label:'12 · MLP',                          g:'models'},

  {id:'cv',       label:'13 · Cross-Validation',             g:'training'},
  {id:'hyperparams', label:'14 · Hyperparameter Tuning',      g:'training'},

  {id:'metrics',  label:'15 · Metrics',                      g:'eval'},
  {id:'interpretability', label:'16 · Notebook 04 · Interpretability', g:'eval'},
  {id:'db',       label:'17 · Decision Bounds',              g:'eval'},

  {id:'ensemble', label:'18 · Ensemble',                     g:'ensembles'},
  {id:'ensemble2', label:'19 · Notebook 05 · Ensembles',      g:'ensembles'},

  {id:'overfit',  label:'20 · Overfitting',                  g:'reliability'},
  {id:'results',  label:'21 · Reading Results',              g:'reliability'},
  {id:'ceiling',  label:'22 · Notebook 06 · Accuracy Ceiling', g:'reliability'},

  {id:'mlflow',   label:'23 · MLflow',                       g:'prod'},
  {id:'fastapi',  label:'24 · FastAPI',                      g:'prod'},
  {id:'docker',   label:'25 · Docker',                       g:'prod'},
  {id:'streamlit', label:'26 · Streamlit',                   g:'prod'},
  {id:'ci',       label:'27 · GitHub Actions',               g:'prod'},
  {id:'automl',   label:'28 · AutoML',                       g:'prod'},

  {id:'predictor', label:'Live Predictor',                   g:'demos'},
  {id:'gd',       label:'Gradient Descent Demo',             g:'demos'},
  {id:'heatmap',  label:'Attention Heatmap',                 g:'demos'},
  {id:'boundary', label:'Decision Boundary Demo',            g:'demos'},
  {id:'exam',     label:'Final Exam (25q)',                  g:'demos'},
];
var GINFO={
  overview:   {l:'Overview',              c:'#94a3b8'},
  start:      {l:'Start Here',            c:'#38bdf8'},
  data:       {l:'Data Foundations',      c:'#60a5fa'},
  features:   {l:'Feature Understanding', c:'#2563eb'},
  models:     {l:'Model Fundamentals',    c:'#a78bfa'},
  training:   {l:'Training Workflow',     c:'#fbbf24'},
  eval:       {l:'Evaluation',            c:'#34d399'},
  ensembles:  {l:'Model Combining',       c:'#818cf8'},
  reliability:{l:'Reliability',           c:'#22c55e'},
  prod:       {l:'Production',            c:'#f87171'},
  demos:      {l:'Interactive Demos',     c:'#fb923c'},
};/* maps NAV id → LESSON_TITLES index */
var LESSON_IDX={
  home:0,dataset:1,feateng:2,scaling:3,ovr:4,softmax:5,attn:6,
  xgb:7,mlp:8,ensemble:9,cv:10,metrics:11,db:12,mlflow:13,
  fastapi:14,docker:15,streamlit:16,ci:17,automl:18,tour:19,
  gdlesson:20,overfit:21,results:22,eda:23,featimportance:24,
  interpretability:25,ensemble2:26,ceiling:27,hyperparams:28,story:30
};

function Sidebar({cur,onSelect,visited}){
  var grouped={};
  NAV.forEach(function(l){if(!grouped[l.g])grouped[l.g]=[];grouped[l.g].push(l);});
  var lessonIds=Object.keys(LESSON_IDX).filter(function(id){return id!=='home';});
  var done=lessonIds.filter(function(id){return visited[id];}).length;
  var total=lessonIds.length;
  return(
    <div style={{width:320,minWidth:320,background:'#0f172a',color:'#cbd5e1',display:'flex',flexDirection:'column',height:'100%',overflowY:'auto',flexShrink:0}}>
      <div style={{padding:'24px 20px 18px',borderBottom:'1px solid #1e293b'}}>
        <div style={{fontWeight:800,color:'white',fontSize:20,letterSpacing:'-0.02em'}}>GradCurve</div>
        <div style={{fontSize:12,color:'#64748b',marginTop:2}}>Powered by EnergyTypeNet</div>
        <div style={{fontSize:14,color:'#475569',marginTop:4}}>29 lessons · 5 demos</div>
        <div style={{marginTop:12,height:6,background:'#1e293b',borderRadius:3,overflow:'hidden'}}>
          <div style={{height:'100%',width:(done/total*100)+'%',background:'#3b82f6',borderRadius:3,transition:'width .4s'}}/>
        </div>
        <div style={{fontSize:13,color:'#475569',marginTop:5}}>{done}/{total} lessons visited</div>
      </div>
      <nav style={{flex:1,padding:'12px 8px',display:'flex',flexDirection:'column',gap:12,overflowY:'auto'}}>
        {Object.entries(GINFO).map(function(entry){
          var gid=entry[0],gi=entry[1];
          var ls=grouped[gid]||[];
          if(!ls.length) return null;
          return(
            <div key={gid}>
              <div style={{fontSize:12,fontWeight:700,color:gi.c,padding:'0 10px 5px',textTransform:'uppercase',letterSpacing:'0.08em'}}>{gi.l}</div>
              {ls.map(function(l){
                var active=cur===l.id;
                var isDone=visited[l.id]&&!active;
                return(
                  <button key={l.id} onClick={function(){onSelect(l.id);}}
                    style={{width:'100%',textAlign:'left',padding:'10px 12px',borderRadius:7,fontSize:15,border:'none',cursor:'pointer',marginBottom:2,background:active?'#2563eb':'transparent',color:active?'white':'#94a3b8',fontWeight:active?700:400,fontFamily:'inherit',display:'flex',alignItems:'center',gap:8}}>
                    {isDone&&<span style={{fontSize:10,color:'#4ade80',flexShrink:0}}>●</span>}
                    {l.label}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div style={{padding:'14px 20px',borderTop:'1px solid #1e293b',fontSize:13,color:'#334155'}}>Python 3.12 · scikit-learn</div>
    </div>
  );
}

/* ── Home page ──────────────────────────────────────────────────── */
function HomePage({onSelect}){
  var gbg={overview:'#f1f5f9',start:'#ecfeff',data:'#eff6ff',features:'#eef2ff',models:'#f5f3ff',training:'#fffbeb',eval:'#f0fdf4',ensembles:'#eef2ff',reliability:'#f0fdf4',prod:'#fff1f2',demos:'#fff7ed'};
  var gtc={overview:'#475569',start:'#155e75',data:'#1e40af',features:'#1d4ed8',models:'#5b21b6',training:'#92400e',eval:'#14532d',ensembles:'#3730a3',reliability:'#166534',prod:'#9f1239',demos:'#9a3412'};
  return(
    <div>
      <h1 style={{fontSize:38,fontWeight:800,color:'#0f172a',marginBottom:12}}>GradCurve — ML Explained</h1>
      <p style={{fontSize:17,color:'#64748b',marginBottom:10,lineHeight:1.8}}>
        A full-stack building-type classifier that teaches every ML concept through real source code —
        from datasets and feature engineering to model training, evaluation, dashboards, and deployment. Every code block is pulled directly from <code style={{background:'#f1f5f9',padding:'1px 5px',borderRadius:4}}>src/</code>. GradCurve is powered by EnergyTypeNet.
      </p>
      <p style={{fontSize:16,color:'#64748b',marginBottom:28,lineHeight:1.8}}>
        Each lesson includes a <span style={{background:'#f0fdf4',color:'#14532d',padding:'2px 8px',borderRadius:5,fontWeight:600}}>🎯 Try it on Streamlit</span> box telling you exactly what to click on the dashboard.
        Run <code style={{background:'#f1f5f9',padding:'1px 6px',borderRadius:4,fontSize:15}}>streamlit run dashboard.py</code> in your terminal to follow along, or open the live app at <a href="https://energytypenet.streamlit.app/" target="_blank" rel="noreferrer" style={{color:'#2563eb',fontWeight:700}}>energytypenet.streamlit.app</a>.
      </p>
      <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:12,padding:'18px 22px',marginBottom:28,fontSize:15,color:'#475569'}}>
        <strong style={{color:'#1e293b'}}>Example datasets to upload in the dashboard:</strong>
        <ul style={{margin:'10px 0 0 20px',lineHeight:2.1}}>
          <li><code style={{background:'#f1f5f9',padding:'1px 6px',borderRadius:4}}>data/train_energy_data.csv</code> — 1 000 buildings, 7 columns (use in all three modes)</li>
          <li><code style={{background:'#f1f5f9',padding:'1px 6px',borderRadius:4}}>data/test_energy_data.csv</code> — 100 buildings (upload as Custom Dataset to see test-set metrics)</li>
          <li><code style={{background:'#f1f5f9',padding:'1px 6px',borderRadius:4}}>data/sample_building_operations.csv</code> — small sample, great for the AutoML assistant</li>
        </ul>
      </div>
      <h2 style={{fontSize:22,fontWeight:700,marginBottom:16,color:'#1e293b',borderBottom:'1px solid #e2e8f0',paddingBottom:8}}>29 lessons · 5 interactive demos</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:12}}>
        {NAV.filter(function(l){return l.id!=='home';}).map(function(l){
          return(
            <button key={l.id} onClick={function(){onSelect(l.id);}}
              style={{textAlign:'left',padding:'16px 18px',borderRadius:12,border:'1px solid transparent',background:gbg[l.g]||'#f8fafc',cursor:'pointer',transition:'opacity .15s'}}
              onMouseEnter={function(e){e.currentTarget.style.opacity='.75';}}
              onMouseLeave={function(e){e.currentTarget.style.opacity='1';}}>
              <div style={{fontWeight:700,fontSize:15,color:gtc[l.g]||'#475569'}}>{l.label}</div>
              <div style={{fontSize:13,color:'#94a3b8',marginTop:3}}>{(GINFO[l.g]||{l:''}).l}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── URL hash helpers ───────────────────────────────────────────── */
var VALID_IDS = NAV.reduce(function(m,l){m[l.id]=true;return m;},{});

function hashToId(){
  /* location.hash is like "#/dataset" or "" */
  var h = window.location.hash.replace(/^#\/?/, '');
  return (h && VALID_IDS[h]) ? h : 'home';
}

/* ── App ────────────────────────────────────────────────────────── */
function App(){
  var [cur,setCur]=useState(hashToId);
  var [visited,setVisited]=useState({});

  /* sync hash → state when user hits back/forward */
  useEffect(function(){
    function onHashChange(){
      var id=hashToId();
      setCur(id);
      if(id!=='home'){setVisited(function(v){var n=Object.assign({},v);n[id]=true;return n;});}
    }
    window.addEventListener('hashchange', onHashChange);
    return function(){ window.removeEventListener('hashchange', onHashChange); };
  },[]);

  var handleSelect=useCallback(function(id){
    window.location.hash = id === 'home' ? '' : '/' + id;
    setCur(id);
    if(id!=='home'){setVisited(function(v){var n=Object.assign({},v);n[id]=true;return n;});}
  },[]);

  var navIdx=NAV.findIndex(function(l){return l.id===cur;});

  /* keyboard navigation: ← prev / → next (skip if focus is inside an input) */
  useEffect(function(){
    var idx=navIdx;
    function onKey(e){
      if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT') return;
      if((e.key==='ArrowLeft'||e.key==='Left')&&idx>0) handleSelect(NAV[idx-1].id);
      if((e.key==='ArrowRight'||e.key==='Right')&&idx<NAV.length-1) handleSelect(NAV[idx+1].id);
    }
    window.addEventListener('keydown',onKey);
    return function(){window.removeEventListener('keydown',onKey);};
  },[navIdx,handleSelect]);

  var content;
  if(cur==='home')         content=<HomePage onSelect={handleSelect}/>;
  else if(cur==='predictor') content=<LivePredictor/>;
  else if(cur==='gd')      content=<GradientDescentViz/>;
  else if(cur==='heatmap') content=<AttentionHeatmapViz/>;
  else if(cur==='boundary')content=<DecisionBoundaryViz/>;
  else if(cur==='exam')    content=<FinalExam/>;
  else {
    var idx=LESSON_IDX[cur];
    content=idx!==undefined?<LessonPage idx={idx}/>:<div>Coming soon</div>;
  }

  return(
    <div style={{display:'flex',height:'100%',width:'100%',overflow:'hidden'}}>
      <Sidebar cur={cur} onSelect={handleSelect} visited={visited}/>
      <main style={{flex:1,overflowY:'auto',background:'#f8fafc'}}>
        <div style={{padding:'48px 64px 80px'}}>
          {content}
          <div style={{marginTop:60,paddingTop:20,borderTop:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:14,color:'#94a3b8'}}>
            <span>GradCurve · ML Education Platform · <a href="https://github.com/bartoszbryg/EnergyTypeNet" target="_blank" rel="noreferrer" style={{color:'#2563eb',fontWeight:700}}>bartoszbryg/EnergyTypeNet</a></span>
            <div style={{display:'flex',gap:20}}>
              {navIdx>0&&(
                <button onClick={function(){handleSelect(NAV[navIdx-1].id);}}
                  style={{color:'#3b82f6',background:'none',border:'none',cursor:'pointer',fontSize:14,fontFamily:'inherit'}}>
                  ← {NAV[navIdx-1].label}
                </button>
              )}
              {navIdx<NAV.length-1&&(
                <button onClick={function(){handleSelect(NAV[navIdx+1].id);}}
                  style={{color:'#3b82f6',background:'none',border:'none',cursor:'pointer',fontSize:14,fontFamily:'inherit'}}>
                  {NAV[navIdx+1].label} →
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));
