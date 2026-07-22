'use strict';
var _useState=React.useState,_useEffect=React.useEffect,_useRef=React.useRef,
    _useCallback=React.useCallback,_useMemo=React.useMemo;

/* ── helpers ────────────────────────────────────────────────────── */
function useState(v){return _useState(v);}
function useEffect(f,d){return _useEffect(f,d);}
function useRef(v){return _useRef(v);}
function useCallback(f,d){return _useCallback(f,d);}
function useMemo(f,d){return _useMemo(f,d);}

/* ── persistent storage helpers ─────────────────────────────────── */
function decodeStored(value,fallback){
  if(value===undefined||value===null) return fallback;
  if(typeof value!=='string') return value;
  try{return JSON.parse(value);}catch(e){return value;}
}
function storageRead(key,fallback,onOk,onErr){
  try{
    var db=window.storage||window.localStorage;
    if(!db) throw new Error('storage unavailable');
    if(!db.getItem&&!db.get) throw new Error('storage read unavailable');
    var result=db.getItem?db.getItem(key):db.get(key);
    Promise.resolve(result).then(function(value){
      onOk(decodeStored(value,fallback));
    }).catch(function(err){if(onErr)onErr(err);});
  }catch(err){if(onErr)onErr(err);}
}
function storageWrite(key,value,onOk,onErr){
  try{
    var db=window.storage||window.localStorage;
    if(!db) throw new Error('storage unavailable');
    var encoded=JSON.stringify(value);
    if(!db.setItem&&!db.set) throw new Error('storage write unavailable');
    var result=db.setItem?db.setItem(key,encoded):db.set(key,encoded);
    Promise.resolve(result).then(function(){if(onOk)onOk();}).catch(function(err){if(onErr)onErr(err);});
  }catch(err){if(onErr)onErr(err);}
}
function storageRemove(key,onOk,onErr){
  try{
    var db=window.storage||window.localStorage;
    if(!db) throw new Error('storage unavailable');
    if(!db.removeItem&&!db.remove&&!db.set) throw new Error('storage remove unavailable');
    var result=db.removeItem?db.removeItem(key):(db.remove?db.remove(key):db.set(key,null));
    Promise.resolve(result).then(function(){if(onOk)onOk();}).catch(function(err){if(onErr)onErr(err);});
  }catch(err){if(onErr)onErr(err);}
}
function storageReadSync(key,fallback){
  try{
    var db=window.storage||window.localStorage;
    if(!db||!db.getItem) return fallback;
    return decodeStored(db.getItem(key),fallback);
  }catch(e){return fallback;}
}
function storageReadPromise(key,fallback){
  return new Promise(function(resolve){
    storageRead(key,fallback,resolve,function(){resolve(fallback);});
  });
}
function lessonWordsFromBlocks(blocks){
  var text=[];
  function collect(v){
    if(typeof v==='string') text.push(v);
    else if(Array.isArray(v)) v.forEach(collect);
    else if(v&&typeof v==='object') Object.keys(v).forEach(function(k){collect(v[k]);});
  }
  collect(blocks||[]);
  return text.join(' ').replace(/[^\w\s]/g,' ').trim().split(/\s+/).filter(Boolean).length;
}
function shortLabel(label){
  return label&&label.length>25?label.slice(0,24)+'…':label;
}
function isFilename(s){
  return /\.(py|js|jsx|ts|tsx|yaml|yml|toml|txt|json|sh|css|html|md|csv|dockerfile)$/i.test(String(s||''));
}

/* ── UI Primitives ──────────────────────────────────────────────── */
function CB({filename,code}){
  var [cp,setCp]=useState(false);
  var cpTimer=useRef(null);
  useEffect(function(){return function(){if(cpTimer.current)clearTimeout(cpTimer.current);};},[]);
  var fileLike=isFilename(filename);
  return(
    <div style={{borderRadius:12,overflow:'hidden',margin:'20px 0',border:'1px solid #334155',fontSize:17}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#1e293b',padding:'7px 18px'}}>
        <span style={{color:fileLike?'#94a3b8':'#fbbf24',fontStyle:fileLike?'normal':'italic',fontFamily:'monospace',fontSize:16,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:'calc(100% - 80px)'}}>{filename||'code'}</span>
        <button type="button" aria-label="Copy code" onClick={function(){
          if(navigator.clipboard)navigator.clipboard.writeText(code);
          setCp(true);if(cpTimer.current)clearTimeout(cpTimer.current);cpTimer.current=setTimeout(function(){setCp(false);cpTimer.current=null;},2000);
        }} style={{fontSize:16,color:cp?'#4ade80':'#94a3b8',background:'none',border:'1px solid rgba(255,255,255,.15)',padding:'3px 12px',borderRadius:5,cursor:'pointer'}}>
          {cp?'✓ Copied':'Copy'}
        </button>
      </div>
      <pre style={{background:'#0f172a',padding:'20px 22px',overflow:'auto',margin:0,lineHeight:1.75,maxHeight:480}}>
        <code style={{color:'#e2e8f0',whiteSpace:'pre',fontFamily:"'Menlo','Monaco','Courier New',monospace",fontSize:17}}>{code}</code>
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
    <div className="callout-box" style={{background:s.bg,borderLeft:'5px solid '+s.brd,padding:'14px 20px',margin:'18px 0',borderRadius:'0 10px 10px 0'}}>
      <div style={{fontWeight:700,color:s.tc,marginBottom:6,fontSize:19}}>{s.ic} {title}</div>
      <div style={{color:s.tc,fontSize:18,lineHeight:1.7,opacity:.9}}>{children}</div>
    </div>
  );
}

function formulaPreset(formula){
  var f=String(formula||'');
  function preset(title,a,b,amin,amax,astep,bmin,bmax,bstep,calc,sub,axis){
    return {title:title,a:a,b:b,amin:amin,amax:amax,astep:astep,bmin:bmin,bmax:bmax,bstep:bstep,calc:calc,sub:sub,axis:axis||'result'};
  }
  if(f.indexOf('z = (x')!==-1) return preset('Standardization explorer','raw x','mean μ',0,60000,500,5000,40000,500,function(x,m){return (x-m)/12000;},function(x,m,y){return '('+x.toFixed(0)+' − '+m.toFixed(0)+') / 12000 = '+y.toFixed(2);},'z-score');
  if(f.indexOf('σ(z)')!==-1) return preset('Sigmoid probability','score z','bias',-8,8,.1,-3,3,.1,function(z,b){return 1/(1+Math.exp(-(z+b)));},function(z,b,y){return 'σ('+z.toFixed(1)+' + '+b.toFixed(1)+') = '+y.toFixed(3);},'probability');
  if(f.indexOf('P(class k)')!==-1) return preset('Softmax competition','selected score','rival score',-4,8,.1,-4,8,.1,function(a,b){return Math.exp(a)/(Math.exp(a)+Math.exp(b)+1);},function(a,b,y){return 'e^'+a.toFixed(1)+' / (e^'+a.toFixed(1)+' + e^'+b.toFixed(1)+' + 1) = '+y.toFixed(3);},'class probability');
  if(f.indexOf('Cross-entropy')!==-1) return preset('Cross-entropy penalty','correct-class probability','example weight',.01,.999,.01,.1,3,.1,function(p,w){return -w*Math.log(p);},function(p,w,y){return '−'+w.toFixed(1)+' × log('+p.toFixed(3)+') = '+y.toFixed(3);},'weighted loss');
  if(f.indexOf('weight_i')!==-1) return preset('Distance-weighted attention','distance','bandwidth w',0,8,.1,.3,8,.1,function(d,w){return Math.exp(-d/w);},function(d,w,y){return 'exp(−'+d.toFixed(1)+' / '+w.toFixed(1)+') = '+y.toFixed(3);},'unnormalized vote');
  if(f.indexOf('h₁')!==-1||f.indexOf('tanh(W')!==-1) return preset('Non-linear neuron','weighted input','bias',-5,5,.1,-3,3,.1,function(x,b){return Math.tanh(x+b);},function(x,b,y){return 'tanh('+x.toFixed(1)+' + '+b.toFixed(1)+') = '+y.toFixed(3);},'activation');
  if(f.indexOf('5-fold CV')!==-1) return preset('Cross-validation stability','fold score','score spread',.4,.95,.01,0,.2,.01,function(s,d){return Math.max(0,Math.min(1,s-d/2));},function(s,d,y){return 'mean '+s.toFixed(2)+' ± '+d.toFixed(2)+'; lower bound '+y.toFixed(2);},'lower expected score');
  if(f.indexOf('Precision_k')!==-1) return preset('Precision and recall trade-off','true positives','false positives',0,100,1,0,100,1,function(tp,fp){return tp/(tp+fp||1);},function(tp,fp,y){return tp.toFixed(0)+' / ('+tp.toFixed(0)+' + '+fp.toFixed(0)+') = '+y.toFixed(3);},'precision');
  if(f.indexOf('new_weight')!==-1||f.indexOf('W\\leftarrow')!==-1) return preset('Gradient update','learning rate','gradient',0,1,.01,-6,6,.1,function(lr,g){return 3-lr*g;},function(lr,g,y){return '3.00 − '+lr.toFixed(2)+' × '+g.toFixed(2)+' = '+y.toFixed(3);},'updated weight');
  if(f.indexOf('L_{ridge}')!==-1) return preset('Regularization path','weight w','penalty α',-5,5,.1,0,2,.05,function(w,a){return Math.pow(w-2,2)+a*w*w;},function(w,a,y){return '('+w.toFixed(1)+'−2)² + '+a.toFixed(2)+'×'+w.toFixed(1)+'² = '+y.toFixed(2);},'penalized loss');
  if(f.indexOf('max(0,1-y_i')!==-1) return preset('SVM hinge loss','signed margin y·score','C',-2,3,.05,.1,4,.1,function(m,c){return .5*m*m+c*Math.max(0,1-m);},function(m,c,y){return '½('+m.toFixed(2)+')² + '+c.toFixed(1)+' max(0,1−'+m.toFixed(2)+') = '+y.toFixed(2);},'objective');
  if(f.indexOf('Gini(S)')!==-1) return preset('Node impurity','class-1 share','class-2 share',0,1,.01,0,1,.01,function(a,b){var t=a+b+1;return 1-(a*a+b*b+1)/(t*t);},function(a,b,y){return 'Gini for shares '+a.toFixed(2)+', '+b.toFixed(2)+', baseline 1 = '+y.toFixed(3);},'Gini impurity');
  if(f.indexOf('d_2(x,z)')!==-1) return preset('Distance geometry','horizontal gap Δx','vertical gap Δy',0,10,.1,0,10,.1,function(x,y){return Math.sqrt(x*x+y*y);},function(x,y,d){return '√('+x.toFixed(1)+'² + '+y.toFixed(1)+'²) = '+d.toFixed(2);},'Euclidean distance');
  if(f.indexOf('P(C|x)')!==-1) return preset('Bayesian update','likelihood P(x|C)','prior P(C)',0,1,.01,0,1,.01,function(l,p){var n=l*p,other=(1-l)*(1-p);return n/(n+other||1);},function(l,p,y){return 'normalized '+l.toFixed(2)+' × '+p.toFixed(2)+' = '+y.toFixed(3);},'posterior');
  if(f.indexOf('KMeans:')!==-1) return preset('Cluster compactness','point distance','number of similar points',0,10,.1,1,30,1,function(d,n){return n*d*d;},function(d,n,y){return n.toFixed(0)+' × '+d.toFixed(1)+'² = '+y.toFixed(1);},'within-cluster SSE');
  if(f.indexOf('PCA:')!==-1) return preset('Explained variance','component eigenvalue','remaining variance',0,10,.1,.1,15,.1,function(l,r){return l/(l+r);},function(l,r,y){return l.toFixed(1)+' / ('+l.toFixed(1)+' + '+r.toFixed(1)+') = '+(100*y).toFixed(1)+'%';},'variance fraction');
  if(f.indexOf('CrossEntropyLoss')!==-1) return preset('Cross-entropy confidence','correct-class probability','learning rate',.01,.999,.01,.001,.3,.005,function(p){return -Math.log(p);},function(p,lr,y){return '−log('+p.toFixed(3)+') = '+y.toFixed(3)+'; update scale '+lr.toFixed(3);},'loss');
  if(f.indexOf('encoder(x)')!==-1) return preset('Reconstruction error','original feature x','reconstruction x̂',-3,3,.1,-3,3,.1,function(x,r){return Math.pow(x-r,2);},function(x,r,y){return '('+x.toFixed(1)+' − '+r.toFixed(1)+')² = '+y.toFixed(2);},'reconstruction loss');
  if(f.indexOf('feature(i,j)')!==-1) return preset('Convolution response','patch intensity','filter weight',-3,3,.1,-3,3,.1,function(x,w){return Math.max(0,x*w+.3);},function(x,w,y){return 'ReLU('+x.toFixed(1)+' × '+w.toFixed(1)+' + 0.3) = '+y.toFixed(2);},'feature response');
  if(f.indexOf('f_t=')!==-1) return preset('LSTM memory gate','previous memory cₜ₋₁','forget gate fₜ',-3,3,.1,0,1,.01,function(c,g){return c*g+.5;},function(c,g,y){return g.toFixed(2)+' × '+c.toFixed(1)+' + input 0.5 = '+y.toFixed(2);},'new cell state');
  if(f.indexOf('phi_j')!==-1||f.indexOf('\\phi_j')!==-1) return preset('SHAP additive explanation','feature contribution φ','base value',-2,2,.05,-2,2,.05,function(p,b){return p+b;},function(p,b,y){return b.toFixed(2)+' + '+p.toFixed(2)+' = '+y.toFixed(2);},'explained output');
  if(f.indexOf('D_{KS}')!==-1) return preset('Distribution drift','new cumulative share','reference share',0,1,.01,0,1,.01,function(a,b){return Math.abs(a-b);},function(a,b,y){return '|'+a.toFixed(2)+' − '+b.toFixed(2)+'| = '+y.toFixed(2);},'KS gap');
  if(f.indexOf('trustworthy report')!==-1) return preset('Model-card completeness','evidence coverage','limitation coverage',0,1,.01,0,1,.01,function(e,l){return Math.sqrt(e*l);},function(e,l,y){return '√('+e.toFixed(2)+' × '+l.toFixed(2)+') = '+y.toFixed(2);},'balanced completeness');
  if(f.indexOf('route(question')!==-1) return preset('Grounded-answer readiness','fact coverage','history relevance',0,1,.01,0,1,.01,function(e,l){return .7*e+.3*l;},function(e,l,y){return '0.7 × '+e.toFixed(2)+' + 0.3 × '+l.toFixed(2)+' = '+y.toFixed(2);},'context readiness');
  if(f.indexOf('feature }j\\text{ shuffled')!==-1) return preset('Permutation-importance drop','baseline accuracy','shuffled-feature accuracy',.3,1,.01,.3,1,.01,function(base,shuffled){return base-shuffled;},function(base,shuffled,y){return base.toFixed(2)+' − '+shuffled.toFixed(2)+' = '+y.toFixed(2);},'accuracy drop');
  if(f.indexOf('GridSearch:')!==-1) return preset('Hyperparameter search curve','log₁₀(C)','solver adjustment',-2,1,.1,-.03,.03,.005,function(logc,adj){return .69-.035*Math.pow(logc,2)+adj;},function(logc,adj,y){return 'C = 10^'+logc.toFixed(1)+'; illustrative CV score = '+y.toFixed(3);},'CV score');
  if(f.indexOf('\\hat{p}(y=c\\mid x)')!==-1) return preset('Bagging probability average','one tree probability','other trees average',0,1,.01,0,1,.01,function(p,q){return (p+9*q)/10;},function(p,q,y){return '('+p.toFixed(2)+' + 9 × '+q.toFixed(2)+') / 10 = '+y.toFixed(3);},'10-tree average probability');
  if(f.indexOf('\\alpha_t=\\eta')!==-1) return preset('AdaBoost learner weight','estimator error eₜ','learning rate η',.01,.65,.01,.05,1,.05,function(err,lr){return lr*(Math.log((1-err)/err)+Math.log(2));},function(err,lr,y){return lr.toFixed(2)+' × [ln((1−'+err.toFixed(2)+')/'+err.toFixed(2)+') + ln(2)] = '+y.toFixed(3);},'SAMME learner weight');
  return null;
}

function FormulaExplorer({formula}){
  var spec=useMemo(function(){return formulaPreset(formula);},[formula]);
  var [a,setA]=useState((spec.amin+spec.amax)/2);
  var [b,setB]=useState((spec.bmin+spec.bmax)/2);
  useEffect(function(){setA((spec.amin+spec.amax)/2);setB((spec.bmin+spec.bmax)/2);},[spec.title]);
  var result=spec.calc(a,b);
  var W=520,H=150,pad=28,points=[],values=[];
  for(var i=0;i<=50;i++){var x=spec.amin+(spec.amax-spec.amin)*i/50;var y=spec.calc(x,b);if(Number.isFinite(y)){points.push({x:x,y:y});values.push(y);}}
  var ymin=Math.min.apply(null,values),ymax=Math.max.apply(null,values);if(ymin===ymax){ymin-=1;ymax+=1;}
  function sx(x){return pad+(x-spec.amin)/(spec.amax-spec.amin||1)*(W-pad*2);}
  function sy(y){return H-pad-(y-ymin)/(ymax-ymin||1)*(H-pad*2);}
  var path=points.map(function(p,j){return (j?'L':'M')+sx(p.x).toFixed(1)+' '+sy(p.y).toFixed(1);}).join(' ');
  return(
    <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid #cbd5e1',textAlign:'left',fontFamily:'system-ui, sans-serif'}}>
      <div style={{fontWeight:800,color:'#1e293b',marginBottom:10}}>Interactive: {spec.title}</div>
      <div className="responsive-grid" style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:14}}>
        <label style={{fontSize:16,color:'#475569'}}>{spec.a}: <strong>{a.toFixed(2)}</strong><input aria-label={spec.a} type="range" min={spec.amin} max={spec.amax} step={spec.astep} value={a} onChange={function(e){setA(+e.target.value);}}/></label>
        <label style={{fontSize:16,color:'#475569'}}>{spec.b}: <strong>{b.toFixed(2)}</strong><input aria-label={spec.b} type="range" min={spec.bmin} max={spec.bmax} step={spec.bstep} value={b} onChange={function(e){setB(+e.target.value);}}/></label>
      </div>
      <svg viewBox={'0 0 '+W+' '+H} role="img" aria-label={spec.title+' chart; current '+spec.axis+' '+result.toFixed(3)} style={{display:'block',width:'100%',height:'auto',marginTop:10,background:'white',border:'1px solid #cbd5e1',borderRadius:8}}>
        <line x1={pad} y1={H-pad} x2={W-pad} y2={H-pad} stroke="#94a3b8"/><line x1={pad} y1={pad} x2={pad} y2={H-pad} stroke="#94a3b8"/>
        <path d={path} fill="none" stroke="#2563eb" strokeWidth="3"/>
        <circle cx={sx(a)} cy={sy(result)} r="6" fill="#f59e0b" stroke="white" strokeWidth="2"/>
        <text x={pad} y={16} fill="#64748b" fontSize="11">{spec.axis}: {result.toFixed(3)}</text>
        <text x={W-pad} y={H-8} textAnchor="end" fill="#64748b" fontSize="10">{spec.a}</text>
      </svg>
      <div aria-live="polite" style={{marginTop:8,padding:'8px 10px',background:'white',border:'1px solid #cbd5e1',borderRadius:7,color:'#334155',fontFamily:'monospace',fontSize:16,overflowWrap:'anywhere'}}>{spec.sub(a,b,result)}</div>
    </div>
  );
}

function LessonConceptMap({blocks}){
  var concepts=[];
  (blocks||[]).forEach(function(block,index){
    if(block[0]!=='h2')return;
    var summary='';
    for(var j=index+1;j<blocks.length;j++){
      if(blocks[j][0]==='h2')break;
      if(blocks[j][0]==='p'){summary=blocks[j][1];break;}
    }
    concepts.push({title:block[1],summary:summary});
  });
  var [selected,setSelected]=useState(0);
  useEffect(function(){setSelected(0);},[blocks]);
  if(concepts.length<2)return null;
  var active=concepts[Math.min(selected,concepts.length-1)];
  return(
    <div style={{margin:'18px 0 26px',padding:'14px 16px',background:'white',border:'1px solid #e2e8f0',borderRadius:10}}>
      <div style={{fontWeight:800,color:'#1e293b',marginBottom:10}}>Lesson concept map</div>
      <div style={{display:'flex',alignItems:'stretch',gap:8,overflowX:'auto',paddingBottom:6,WebkitOverflowScrolling:'touch'}}>
        {concepts.map(function(concept,index){return <React.Fragment key={concept.title+'-'+index}><button onClick={function(){setSelected(index);}} aria-pressed={selected===index} style={{minWidth:150,maxWidth:220,padding:'9px 11px',borderRadius:8,border:'1px solid '+(selected===index?'#2563eb':'#cbd5e1'),background:selected===index?'#eff6ff':'#f8fafc',color:selected===index?'#1d4ed8':'#475569',fontWeight:700,textAlign:'left',wordBreak:'break-word'}}>{index+1}. {concept.title}</button>{index<concepts.length-1&&<span aria-hidden="true" style={{alignSelf:'center',color:'#94a3b8',fontWeight:800}}>→</span>}</React.Fragment>;})}
      </div>
      <div aria-live="polite" style={{marginTop:9,color:'#475569',fontSize:17,lineHeight:1.65}}><strong style={{color:'#1e293b'}}>{active.title}:</strong> {active.summary||'Explore this section to connect the concept with its code and examples.'}</div>
    </div>
  );
}

function MathB({children}){
  var formulaRef=useRef(null);
  var formula=String(children||'');
  var isLatex=/\\[a-zA-Z]+|[_^{}]/.test(formula);
  var hasExplorer=!!formulaPreset(formula);
  useEffect(function(){
    if(!formulaRef.current||!isLatex||!window.katex)return;
    try{
      window.katex.render(formula,formulaRef.current,{
        displayMode:true,
        throwOnError:false,
        strict:'ignore',
      });
    }catch(err){
      formulaRef.current.textContent=formula;
    }
  },[formula,isLatex]);
  return(
    <div className="math-block" role="math" aria-label={formula} style={{background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:10,padding:'14px 20px',margin:'16px 0',textAlign:'center',fontFamily:isLatex?'serif':'monospace',fontSize:19,overflowX:'auto',overflowY:'hidden',WebkitOverflowScrolling:'touch'}}>
      <div ref={formulaRef} style={{minWidth:'max-content'}}>{formula}</div>
      {hasExplorer&&<FormulaExplorer formula={formula}/>}
    </div>
  );
}

function StreamlitTip({page,children}){
  return(
    <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:10,padding:'16px 20px',margin:'20px 0'}}>
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
        <span style={{fontSize:23}}>🎯</span>
        <span style={{fontWeight:700,fontSize:19,color:'#14532d'}}>Try it on Streamlit</span>
        <span style={{background:'#dcfce7',color:'#166534',fontSize:16,padding:'2px 10px',borderRadius:20,fontWeight:600,border:'1px solid #86efac'}}>{page}</span>
      </div>
      <pre style={{margin:0,fontFamily:'inherit',fontSize:17.5,color:'#15803d',lineHeight:1.75,whiteSpace:'pre-wrap'}}>{children}</pre>
    </div>
  );
}

function PromptBlock({title,prompt}){
  var [cp,setCp]=useState(false);
  var cpTimer=useRef(null);
  useEffect(function(){return function(){if(cpTimer.current)clearTimeout(cpTimer.current);};},[]);
  return(
    <div style={{background:'#1e1b4b',border:'1px solid #4338ca',borderRadius:12,padding:'18px 22px',margin:'24px 0'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:23}}>🤖</span>
          <span style={{fontWeight:700,color:'#c7d2fe',fontSize:18}}>Ask Claude or ChatGPT</span>
          {title&&<span style={{background:'#312e81',color:'#a5b4fc',fontSize:16,padding:'2px 10px',borderRadius:20,fontWeight:600,border:'1px solid #4338ca'}}>{title}</span>}
        </div>
        <button onClick={function(){
          if(navigator.clipboard)navigator.clipboard.writeText(prompt);
          setCp(true);if(cpTimer.current)clearTimeout(cpTimer.current);cpTimer.current=setTimeout(function(){setCp(false);cpTimer.current=null;},2000);
        }} style={{fontSize:16,color:cp?'#4ade80':'#a5b4fc',background:'rgba(67,56,202,0.3)',border:'1px solid #4338ca',padding:'4px 14px',borderRadius:6,cursor:'pointer',fontFamily:'inherit'}}>
          {cp?'✓ Copied!':'Copy prompt'}
        </button>
      </div>
      <pre style={{margin:0,fontFamily:'inherit',fontSize:17,color:'#e0e7ff',lineHeight:1.8,whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{prompt}</pre>
    </div>
  );
}

function QuizBlock({qs}){
  var [ans,setAns]=useState({});
  return(
    <div style={{marginTop:32,borderTop:'1px solid #e2e8f0',paddingTop:24}}>
      <div style={{fontWeight:700,fontSize:23,marginBottom:16,color:'#1e293b'}}>🧠 Quiz</div>
      {qs.map(function(q,qi){
        return(
          <div key={qi} style={{marginBottom:18,background:'#f8fafc',borderRadius:12,padding:'16px 20px',border:'1px solid '+(ans[qi]!==undefined?'#94a3b8':'#e2e8f0')}}>
            <p style={{fontWeight:600,fontSize:19,marginBottom:12,color:'#1e293b'}}>{qi+1}. {q.q}</p>
            {q.opts.map(function(opt,oi){
              var chosen=ans[qi]===oi,correct=oi===q.a,rev=ans[qi]!==undefined;
              var bg='white',brd='#e2e8f0',col='#475569';
              if(chosen&&correct){bg='#f0fdf4';brd='#22c55e';col='#14532d';}
              else if(chosen&&!correct){bg='#fef2f2';brd='#ef4444';col='#7f1d1d';}
              else if(rev&&correct){bg='#f0fdf4';brd='#86efac';col='#166634';}
              return(
                <div key={oi}>
                  <button type="button" onClick={function(){if(!rev)setAns(function(a){var n=Object.assign({},a);n[qi]=oi;return n;});}}
                    style={{width:'100%',textAlign:'left',padding:'10px 14px',borderRadius:8,border:'1px solid '+brd,background:bg,color:col,fontSize:18,cursor:rev?'default':'pointer',marginBottom:4,fontFamily:'inherit',wordBreak:'break-word'}}>
                    <span style={{fontFamily:'monospace',fontWeight:700,marginRight:8}}>{String.fromCharCode(65+oi)}.</span>{opt.t}
                  </button>
                  {chosen&&<div style={{fontSize:16.5,padding:'6px 14px',borderRadius:6,background:correct?'#dcfce7':'#fee2e2',color:correct?'#14532d':'#7f1d1d',marginBottom:5}}>{correct?'✓ Correct — ':'✗ Incorrect — '}{opt.e}</div>}
                  {!chosen&&rev&&correct&&<div style={{fontSize:16.5,padding:'6px 14px',borderRadius:6,background:'#dcfce7',color:'#14532d',marginBottom:5}}>✓ Correct answer — {opt.e}</div>}
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
  return <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,padding:'10px 12px',minWidth:0}}><div style={{fontSize:11,color:'#64748b',fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em'}}>{label}</div><div style={{fontSize:20,fontWeight:800,color:color||'#0f172a',marginTop:2,overflowWrap:'anywhere'}}>{value}</div></div>;
}
function FormulaLive({label,formula}){
  return <div style={{background:'#1e293b',borderRadius:8,padding:'10px 16px',margin:'12px 0',fontFamily:'monospace',fontSize:13,color:'#e2e8f0',lineHeight:1.8,overflowX:'auto',WebkitOverflowScrolling:'touch'}}>{label&&<div style={{color:'#94a3b8',fontSize:11,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{label}</div>}<div style={{whiteSpace:'pre-wrap',minWidth:'max-content'}}>{formula}</div></div>;
}
function VizSlider({label,value,min,max,step,onChange}){
  return <label style={{display:'block',minWidth:0}}><div style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap',fontSize:13,fontWeight:700,color:'#334155'}}><span>{label}</span><strong>{typeof value==='number'?value.toFixed(step<1?2:0):value}</strong></div><input aria-label={label} style={{width:'100%',minHeight:44}} type="range" min={min} max={max} step={step} value={value} onChange={function(e){onChange(+e.target.value);}}/></label>;
}
var VIZ_GRID={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12};

function PerceptronViz(){
  var pts=useMemo(function(){return [[-2,-1,0],[-1.8,-.2,0],[-1.4,-1.5,0],[-1,-.5,0],[-.6,-1.2,0],[-.3,.2,0],[.1,-.7,0],[.3,.1,0],[-.8,.5,0],[.5,-.2,0],[-.2,.4,1],[.2,.8,1],[.5,.3,1],[.8,1.2,1],[1,.4,1],[1.3,1.5,1],[1.6,.7,1],[1.8,1.8,1],[.7,-.1,1],[1.4,.1,1]];},[]);
  var [eta,setEta]=useState(.3),[state,setState]=useState({w:[.2,-.1],b:.05,step:0,index:0});
  function pred(p,s){return s.w[0]*p[0]+s.w[1]*p[1]+s.b>=0?1:0;}
  function advance(s,n){var z={w:s.w.slice(),b:s.b,step:s.step,index:s.index};for(var k=0;k<n;k++){var p=pts[z.index%pts.length],err=p[2]-pred(p,z);z.w[0]+=eta*err*p[0];z.w[1]+=eta*err*p[1];z.b+=eta*err;z.index++;z.step++;}return z;}
  var mistakes=pts.filter(function(p){return pred(p,state)!==p[2];}).length,W=240,H=200,sx=function(x){return 20+(x+2.5)/5*200;},sy=function(y){return 180-(y+2)/4*160;};
  var line=null;if(Math.abs(state.w[1])>.001){var ya=-(state.w[0]*-2.5+state.b)/state.w[1],yb=-(state.w[0]*2.5+state.b)/state.w[1];line=<line x1={sx(-2.5)} y1={sy(ya)} x2={sx(2.5)} y2={sy(yb)} stroke="#0f172a" strokeWidth="2"/>;}else{var xv=-state.b/(state.w[0]||.001);line=<line x1={sx(xv)} y1="10" x2={sx(xv)} y2="190" stroke="#0f172a" strokeWidth="2"/>;}
  return <VizFrame><h3 style={{margin:'0 0 12px'}}>Perceptron boundary, one update at a time</h3><div style={VIZ_GRID}><svg viewBox={'0 0 '+W+' '+H} style={{width:'100%',height:'auto',background:'#f8fafc',borderRadius:8}} role="img" aria-label={'Scatter plot with '+mistakes+' mistakes'}>{line}{pts.map(function(p,i){return <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r="5" fill={COLORS[p[2]]} stroke="white"/>;})}</svg><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:8}}><TinyStat label="Step" value={state.step}/><TinyStat label="Mistakes" value={mistakes} color={mistakes?'#b45309':'#166534'}/><TinyStat label="w₁" value={state.w[0].toFixed(3)}/><TinyStat label="w₂ / bias" value={state.w[1].toFixed(3)+' / '+state.b.toFixed(3)}/></div></div><VizSlider label="Learning rate η" value={eta} min={.1} max={1} step={.1} onChange={setEta}/><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button onClick={function(){setState(advance(state,1));}}>Step</button><button onClick={function(){setState(advance(state,20));}}>Run 20 steps</button><button onClick={function(){setState({w:[.2,-.1],b:.05,step:0,index:0});}}>Reset</button></div><FormulaLive label="Live update" formula={'net = '+state.w[0].toFixed(3)+' × x₁ + '+state.w[1].toFixed(3)+' × x₂ + '+state.b.toFixed(3)+'\nupdate: w += '+eta.toFixed(1)+' × (y_true - y_pred) × x'}/>{mistakes===0?<Callout type="info" title="Converged">Every synthetic point is classified correctly.</Callout>:state.step>=50?<Callout type="warning" title="Data is not linearly separable">The Perceptron still has mistakes after 50 updates, so it keeps oscillating.</Callout>:null}</VizFrame>;
}

function RegularizationViz(){
  var [alpha,setAlpha]=useState(.4),[w1,setW1]=useState(1.5),[w2,setW2]=useState(1);
  var loss=useMemo(function(){var data=Math.pow(w1-1.5,2)+Math.pow(w2-1,2),reg=alpha*(w1*w1+w2*w2);return {data:data,reg:reg,total:data+reg,der:2*(w1-1.5)+2*alpha*w1,opt:[1.5/(1+alpha),1/(1+alpha)]};},[w1,w2,alpha]);
  var data=loss.data,reg=loss.reg,total=loss.total,der=loss.der,opt=loss.opt,sx=function(x){return 110+x/3*85;},sy=function(y){return 110-y/3*85;};
  return <VizFrame><h3 style={{margin:'0 0 12px'}}>L2 regularization shrinks the best weights</h3><div style={VIZ_GRID}><svg viewBox="0 0 220 220" style={{width:'100%',height:'auto',background:'radial-gradient(circle,#dbeafe,#fee2e2)'}} role="img" aria-label="Regularized two-weight loss landscape"><circle cx="110" cy="110" r={Math.max(15,85/(1+alpha))} fill="none" stroke="#2563eb" strokeWidth="2"/><line x1="15" y1="110" x2="205" y2="110" stroke="#94a3b8"/><line x1="110" y1="15" x2="110" y2="205" stroke="#94a3b8"/><circle cx={sx(w1)} cy={sy(w2)} r="7" fill="#f59e0b"/><circle cx={sx(opt[0])} cy={sy(opt[1])} r="5" fill="#166534"/><text x={sx(opt[0])+7} y={sy(opt[1])-7} fontSize="10">minimum</text></svg><div style={{display:'grid',gap:8}}><TinyStat label="Data loss" value={data.toFixed(3)}/><TinyStat label="Reg penalty" value={reg.toFixed(3)}/><TinyStat label="Total loss" value={total.toFixed(3)}/></div></div><div style={VIZ_GRID}><VizSlider label="alpha" value={alpha} min={0} max={2} step={.1} onChange={setAlpha}/><VizSlider label="w₁" value={w1} min={-3} max={3} step={.1} onChange={setW1}/><VizSlider label="w₂" value={w2} min={-3} max={3} step={.1} onChange={setW2}/></div><FormulaLive label="Penalized objective" formula={'L = ('+w1.toFixed(1)+' - 1.5)² + ('+w2.toFixed(1)+' - 1.0)² + '+alpha.toFixed(1)+' × ('+w1.toFixed(1)+'² + '+w2.toFixed(1)+'²)\ndL/dw₁ = 2('+w1.toFixed(1)+' - 1.5) + 2×'+alpha.toFixed(1)+'×'+w1.toFixed(1)+' = '+der.toFixed(3)}/><Callout type="analogy" title="Watch the green minimum">As alpha increases, the minimum moves toward the origin, producing smaller weights.</Callout></VizFrame>;
}

function DecisionTreeViz(){
  var pts=useMemo(function(){var a=[];for(var c=0;c<3;c++)for(var i=0;i<10;i++)a.push({e:1800+c*2600+i*230,s:900+c*5200+(i%5)*650,c:c});return a;},[]);
  var [depth,setDepth]=useState(1),[feature,setFeature]=useState('Energy'),[threshold,setThreshold]=useState(5000);var max=feature==='Energy'?8000:20000,min=feature==='Energy'?3000:500;
  if(threshold>max||threshold<min)threshold=(min+max)/2;
  function side(p){return (feature==='Energy'?p.e:p.s)<threshold;}function stats(flag){var rows=pts.filter(function(p){return side(p)===flag;}),counts=[0,0,0];rows.forEach(function(p){counts[p.c]++;});var n=rows.length,g=1-counts.reduce(function(a,x){var q=x/(n||1);return a+q*q;},0),win=counts.indexOf(Math.max.apply(null,counts));return {n:n,g:g,win:win,counts:counts};}var l=stats(true),r=stats(false),wg=(l.n*l.g+r.n*r.g)/pts.length;
  function x(e){return 15+(e-1000)/8000*210;}function y(s){return 185-(s-500)/19000*170;}var split=feature==='Energy'?x(threshold):y(threshold);
  return <VizFrame><h3 style={{margin:'0 0 12px'}}>Build a decision-tree split</h3><div style={VIZ_GRID}><svg viewBox="0 0 240 200" style={{width:'100%',height:'auto',background:'#f8fafc'}} role="img" aria-label="Building scatter with adjustable tree split">{feature==='Energy'?<line x1={split} y1="10" x2={split} y2="190" stroke="#0f172a" strokeWidth="2"/>:<line x1="10" y1={split} x2="230" y2={split} stroke="#0f172a" strokeWidth="2"/>}{pts.map(function(p,i){return <circle key={i} cx={x(p.e)} cy={y(p.s)} r="4" fill={COLORS[p.c]}/>;})}</svg><pre style={{whiteSpace:'pre-wrap',fontSize:13,margin:0,background:'#f8fafc',padding:12}}>{'Root: '+feature+' < '+Math.round(threshold)+'?\n├── YES: '+CLASSES[l.win]+' ('+l.counts[l.win]+' / '+l.n+')\n└── NO:  '+CLASSES[r.win]+' ('+r.counts[r.win]+' / '+r.n+')'+(depth===2?'\n    └── depth 2: each region may split once more':'')}</pre></div><div style={VIZ_GRID}><label style={{fontSize:13,fontWeight:700}}>Root feature<select value={feature} onChange={function(e){var f=e.target.value;setFeature(f);setThreshold(f==='Energy'?5000:10000);}} style={{display:'block',width:'100%',minHeight:44}}><option>Energy</option><option>Sqft</option></select></label><div><span style={{fontSize:13,fontWeight:700}}>max_depth</span><div>{[1,2].map(function(d){return <label key={d} style={{marginRight:14}}><input type="radio" checked={depth===d} onChange={function(){setDepth(d);}}/> {d}</label>;})}</div></div><VizSlider label="Root threshold" value={threshold} min={min} max={max} step={feature==='Energy'?100:250} onChange={setThreshold}/></div><FormulaLive label="Split impurity" formula={'Gini = 1 - Σ pₖ²\nLeft = '+l.g.toFixed(3)+', Right = '+r.g.toFixed(3)+'\nWeighted = '+l.n+'/'+pts.length+'×'+l.g.toFixed(3)+' + '+r.n+'/'+pts.length+'×'+r.g.toFixed(3)+' = '+wg.toFixed(3)}/></VizFrame>;
}

function NaiveBayesViz(){
  var [pr,setPr]=useState(35),[pc,setPc]=useState(35),[energy,setEnergy]=useState(4000);var bayes=useMemo(function(){var pi=Math.max(5,100-pr-pc),sumPrior=pr+pc+pi,pri=[pr/sumPrior,pc/sumPrior,pi/sumPrior],means=[2500,4000,5200],like=means.map(function(m){return Math.exp(-.5*Math.pow((energy-m)/800,2))/(800*Math.sqrt(2*Math.PI));}),raw=like.map(function(v,i){return v*pri[i];}),z=raw.reduce(function(a,b){return a+b;},0);return {pi:pi,pri:pri,like:like,raw:raw,post:raw.map(function(v){return v/z;})};},[energy,pr,pc]);var pi=bayes.pi,pri=bayes.pri,like=bayes.like,raw=bayes.raw,post=bayes.post;function setR(v){setPr(Math.min(v,95-pc));}function setC(v){setPc(Math.min(v,95-pr));}
  return <VizFrame><h3 style={{margin:'0 0 12px'}}>Bayes update: prior × likelihood</h3><div style={VIZ_GRID}><VizSlider label="P(Residential) %" value={pr} min={10} max={80} step={1} onChange={setR}/><VizSlider label="P(Commercial) %" value={pc} min={10} max={80} step={1} onChange={setC}/><TinyStat label="P(Industrial)" value={pi.toFixed(0)+'%'}/><VizSlider label="Energy consumption" value={energy} min={1000} max={6000} step={50} onChange={setEnergy}/></div>{CLASSES.map(function(c,i){return <div key={c} style={{margin:'12px 0'}}><strong>{c}: {(post[i]*100).toFixed(1)}%</strong><div style={{display:'grid',gap:3}}><div style={{height:8,width:(pri[i]*100)+'%',background:'#2563eb'}}/><div style={{height:8,width:(like[i]/Math.max.apply(null,like)*100)+'%',background:'#16a34a'}}/><div style={{height:10,width:(post[i]*100)+'%',background:'#f59e0b'}}/></div></div>;})}<div style={{fontSize:12,color:'#64748b'}}>Blue prior · Green likelihood (relative scale) · Orange normalized posterior</div><FormulaLive label="Residential posterior" formula={'P(Residential | energy='+energy+') ∝ P(energy | Res) × P(Res)\n= '+like[0].toFixed(6)+' × '+pri[0].toFixed(3)+' = '+raw[0].toFixed(6)+'\nNormalized posterior = '+post[0].toFixed(4)}/></VizFrame>;
}

function BiasVarianceViz(){
  var [complexity,setComplexity]=useState(4),[noise,setNoise]=useState(.4),dataSeed=7,W=260,H=190;var curve=useMemo(function(){function truth(x){return 95-48*Math.sin(x/38);}function fit(x){return truth(x)+(10-complexity)*1.8*Math.sin(x/80)+Math.pow(complexity/10,3)*noise*45*Math.sin(x/9);}var truePts=[],fitPts=[],points=[];for(var x=0;x<=W;x+=4){truePts.push(x+','+truth(x));fitPts.push(x+','+fit(x));}for(var i=0;i<18;i++){var px=8+i*14,py=truth(px)+noise*22*Math.sin(i*dataSeed+.3);points.push([px,py]);}var bias=Math.pow((11-complexity)/10,2),variance=Math.pow(complexity/10,3)*.7,noiseSq=noise*noise;return {truePts:truePts,fitPts:fitPts,points:points,bias:bias,variance:variance,noiseSq:noiseSq,total:bias+variance+noiseSq};},[complexity,noise,dataSeed]);var truePts=curve.truePts,fitPts=curve.fitPts,points=curve.points,bias=curve.bias,variance=curve.variance,noiseSq=curve.noiseSq,total=curve.total,sweet=complexity>=4&&complexity<=6;
  return <VizFrame><h3 style={{margin:'0 0 12px'}}>Bias–variance trade-off</h3><div style={VIZ_GRID}><svg viewBox={'0 0 '+W+' '+H} style={{width:'100%',height:'auto',background:'#f8fafc'}} role="img" aria-label="True function, noisy observations, and model fit"><polyline points={truePts.join(' ')} fill="none" stroke="#0f172a" strokeWidth="2"/><polyline points={fitPts.join(' ')} fill="none" stroke="#2563eb" strokeWidth="3"/>{points.map(function(p,i){return <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#f59e0b"/>;})}</svg><div style={{display:'grid',gap:8}}><TinyStat label="Bias²" value={bias.toFixed(3)}/><TinyStat label="Variance" value={variance.toFixed(3)}/><TinyStat label="Total error" value={total.toFixed(3)} color={sweet?'#166534':'#b45309'}/></div></div><div style={VIZ_GRID}><VizSlider label="Model complexity" value={complexity} min={1} max={10} step={1} onChange={setComplexity}/><VizSlider label="Noise σ" value={noise} min={.1} max={1} step={.1} onChange={setNoise}/></div><FormulaLive label="Expected error" formula={'E[(y - ŷ)²] = Bias² + Variance + σ²\n= '+bias.toFixed(3)+' + '+variance.toFixed(3)+' + '+noiseSq.toFixed(3)+' = '+total.toFixed(3)}/>{sweet&&<Callout type="info" title="Sweet spot">This middle complexity balances underfitting against sensitivity to noise.</Callout>}</VizFrame>;
}

function EnsembleVoteViz(){
  var [mode,setMode]=useState('soft'),[lrR,setLrR]=useState(55),[lrC,setLrC]=useState(30),[mlpR,setMlpR]=useState(25),[mlpC,setMlpC]=useState(55),[xgbR,setXgbR]=useState(35),[xgbC,setXgbC]=useState(25);
  var vote=useMemo(function(){function probs(r,c){var rr=Math.min(r,100-c),cc=Math.min(c,100-rr);return [rr/100,cc/100,Math.max(0,100-rr-cc)/100];}var ps=[probs(lrR,lrC),probs(mlpR,mlpC),probs(xgbR,xgbC)],avg=[0,1,2].map(function(k){return ps.reduce(function(s,p){return s+p[k];},0)/3;}),votes=ps.map(function(p){return p.indexOf(Math.max.apply(null,p));}),counts=[0,1,2].map(function(k){return votes.filter(function(v){return v===k;}).length;}),winner=mode==='soft'?avg.indexOf(Math.max.apply(null,avg)):counts.indexOf(Math.max.apply(null,counts));return {ps:ps,avg:avg,votes:votes,counts:counts,winner:winner,tie:mode==='hard'&&counts.filter(function(x){return x===Math.max.apply(null,counts);}).length>1};},[lrR,lrC,mlpR,mlpC,xgbR,xgbC,mode]);var models=[{n:'LR',p:vote.ps[0],sr:setLrR,sc:setLrC},{n:'MLP',p:vote.ps[1],sr:setMlpR,sc:setMlpC},{n:'XGB',p:vote.ps[2],sr:setXgbR,sc:setXgbC}],avg=vote.avg,votes=vote.votes,counts=vote.counts,winner=vote.winner,tie=vote.tie;
  function bars(p){return <div>{p.map(function(v,i){return <div key={i} style={{marginBottom:8,fontSize:12}}><span>{CLASSES[i].slice(0,3)} {(v*100).toFixed(0)}%</span><div style={{height:9,background:'#e2e8f0'}}><div style={{width:(v*100)+'%',height:'100%',background:COLORS[i]}}/></div></div>;})}</div>;}
  return <VizFrame><h3 style={{margin:'0 0 12px'}}>Combine model votes</h3><div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}><button aria-pressed={mode==='soft'} onClick={function(){setMode('soft');}}>Soft (average probability)</button><button aria-pressed={mode==='hard'} onClick={function(){setMode('hard');}}>Hard (majority vote)</button></div><div style={VIZ_GRID}>{models.map(function(m){return <div key={m.n}><strong>{m.n} · top: {CLASSES[m.p.indexOf(Math.max.apply(null,m.p))]}</strong><VizSlider label="P(Residential)" value={m.p[0]*100} min={0} max={100-m.p[1]*100} step={5} onChange={m.sr}/><VizSlider label="P(Commercial)" value={m.p[1]*100} min={0} max={100-m.p[0]*100} step={5} onChange={m.sc}/>{bars(m.p)}</div>;} )}<div><strong>Ensemble · {tie?'Tie':CLASSES[winner]}</strong>{bars(mode==='soft'?avg:counts.map(function(x){return x/3;}))}</div></div><FormulaLive label={mode==='soft'?'Soft vote':'Hard vote'} formula={mode==='soft'?'P̂(k) = (P_LR(k) + P_MLP(k) + P_XGB(k)) / 3\nP̂(Residential) = ('+models.map(function(m){return m.p[0].toFixed(2);}).join(' + ')+') / 3 = '+avg[0].toFixed(3)+'\nP̂(Commercial) = '+avg[1].toFixed(3)+'; P̂(Industrial) = '+avg[2].toFixed(3):'Top-class votes: '+votes.map(function(v,i){return models[i].n+'→'+CLASSES[v];}).join(', ')+'\nCounts = ['+counts.join(', ')+'] → '+(tie?'tie':CLASSES[winner])}/></VizFrame>;
}

function PCAViz(){
  var [rho,setRho]=useState(.7),[show,setShow]=useState(true);var pts=useMemo(function(){var a=[];for(var i=0;i<40;i++){var u=Math.sin(i*12.9898)*1.7,v=Math.cos(i*7.233)*1.5;a.push([u,v]);}return a;},[]),draw=pts.map(function(p){return [p[0],rho*p[0]+Math.sqrt(1-rho*rho)*p[1]];}),ratio=(1+rho)/2,ang=Math.PI/4*(rho/.95),sx=function(x){return 120+x*42;},sy=function(y){return 100-y*42;};
  return <VizFrame><h3 style={{margin:'0 0 12px'}}>PCA compression and correlation</h3><div style={VIZ_GRID}><svg viewBox="0 0 240 200" style={{width:'100%',height:'auto',background:'#f8fafc'}} role="img" aria-label={'Correlated scatter; PC1 explains '+(ratio*100).toFixed(1)+' percent'}><line x1="10" y1="100" x2="230" y2="100" stroke="#cbd5e1"/><line x1="120" y1="10" x2="120" y2="190" stroke="#cbd5e1"/>{draw.map(function(p,i){return <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r="3" fill="#2563eb" opacity=".65"/>;})}{show&&<React.Fragment><line x1={120-80*Math.cos(ang)} y1={100+80*Math.sin(ang)} x2={120+80*Math.cos(ang)} y2={100-80*Math.sin(ang)} stroke="#dc2626" strokeWidth="3"/><line x1={120-45*Math.cos(ang+Math.PI/2)} y1={100+45*Math.sin(ang+Math.PI/2)} x2={120+45*Math.cos(ang+Math.PI/2)} y2={100-45*Math.sin(ang+Math.PI/2)} stroke="#16a34a" strokeDasharray="5 4"/></React.Fragment>}</svg><div style={{display:'grid',gap:8}}><TinyStat label="PC1 explains" value={(ratio*100).toFixed(1)+'%'}/><TinyStat label="PC2 explains" value={((1-ratio)*100).toFixed(1)+'%'}/><TinyStat label="Correlation" value={rho.toFixed(2)}/></div></div><div style={VIZ_GRID}><VizSlider label="Correlation" value={rho} min={0} max={.95} step={.05} onChange={setRho}/><label style={{display:'flex',alignItems:'center',gap:8,minHeight:44}}><input type="checkbox" checked={show} onChange={function(e){setShow(e.target.checked);}}/> Show PC directions</label></div><FormulaLive label="Principal direction" formula={'maximize Var(Xw) subject to ||w|| = 1\nPC1 direction = ['+Math.cos(ang).toFixed(3)+', '+Math.sin(ang).toFixed(3)+']\nExplained variance ratio = '+ratio.toFixed(3)}/></VizFrame>;
}

function SHAPWaterfallViz(){
  var configs=[['Energy',1000,60000,500,28500,17300,.15],['Square footage',500,30000,250,10600,6400,.08],['Occupants',1,100,1,48,28,.02],['Appliances',1,50,1,25,14,.03],['Temperature',10,35,.5,21,5,.01]],valuesState=useState([28500,10600,48,25,21]),values=valuesState[0],setValues=valuesState[1],base=.33,phi=useMemo(function(){return configs.map(function(c,i){return c[6]*(values[i]-c[4])/c[5];});},[values[0],values[1],values[2],values[3],values[4]]),final=base+phi.reduce(function(a,b){return a+b;},0),prob=Math.max(0,Math.min(1,final)),pred=prob<.4?0:(prob<.67?1:2);function setAt(i,v){var n=values.slice();n[i]=v;setValues(n);}var scale=180;
  return <VizFrame><h3 style={{margin:'0 0 12px'}}>Simplified SHAP waterfall</h3><div style={VIZ_GRID}>{configs.map(function(c,i){return <VizSlider key={c[0]} label={c[0]} value={values[i]} min={c[1]} max={c[2]} step={c[3]} onChange={function(v){setAt(i,v);}}/>;})}</div><svg viewBox="0 0 560 230" style={{width:'100%',height:'auto',background:'#f8fafc'}} role="img" aria-label={'SHAP waterfall ending at '+prob.toFixed(3)}>{configs.map(function(c,i){var v=phi[i],x=280+(v<0?v*scale:0),w=Math.max(2,Math.abs(v)*scale);return <React.Fragment key={c[0]}><text x="8" y={30+i*36} fontSize="12">{c[0]}</text><line x1="280" y1={25+i*36} x2="280" y2={42+i*36} stroke="#94a3b8"/><rect x={x} y={22+i*36} width={w} height="18" fill={v>=0?'#16a34a':'#dc2626'}/><text x={v>=0?x+w+5:x-5} y={36+i*36} textAnchor={v>=0?'start':'end'} fontSize="11">{v>=0?'+':''}{v.toFixed(3)}</text></React.Fragment>;})}<text x="8" y="218" fontSize="12">base {base.toFixed(2)} → final {prob.toFixed(3)} → {CLASSES[pred]}</text></svg><FormulaLive label="Additive explanation" formula={'f(x) ≈ base + Σ φⱼ\n= '+base.toFixed(3)+' '+phi.map(function(v){return (v>=0?'+ ':'- ')+Math.abs(v).toFixed(3);}).join(' ')+'\n= '+final.toFixed(3)+' (displayed probability '+prob.toFixed(3)+')'}/><div style={{fontSize:13,color:'#64748b'}}>Educational linear approximation—not the production model's computed SHAP values.</div></VizFrame>;
}

function LSTMGateViz(){
  var [x,setX]=useState(.5),[h,setH]=useState(.2),[c,setC]=useState(.4),[show,setShow]=useState(true),gates=useMemo(function(){function sig(v){return 1/(1+Math.exp(-v));}var f=sig(.5*h+.4*x+.1),i=sig(-.3*h+.6*x),g=Math.tanh(.7*h+.5*x-.1),o=sig(.4*h-.2*x+.2),cn=f*c+i*g;return {f:f,i:i,g:g,o:o,cn:cn,hn:o*Math.tanh(cn)};},[x,h,c]),f=gates.f,i=gates.i,g=gates.g,o=gates.o,cn=gates.cn,hn=gates.hn,boxes=[['Forget f',f],['Input i',i],['Update g',g],['Output o',o]];
  return <VizFrame><h3 style={{margin:'0 0 12px'}}>One LSTM timestep</h3><div style={VIZ_GRID}><VizSlider label="Input x" value={x} min={-2} max={2} step={.1} onChange={setX}/><VizSlider label="Previous hidden h" value={h} min={-1} max={1} step={.1} onChange={setH}/><VizSlider label="Previous cell c" value={c} min={-2} max={2} step={.1} onChange={setC}/><label style={{display:'flex',alignItems:'center',gap:8,minHeight:44}}><input type="checkbox" checked={show} onChange={function(e){setShow(e.target.checked);}}/> Show gate calculations</label></div><svg viewBox="0 0 560 155" style={{width:'100%',height:'auto',background:'#f8fafc'}} role="img" aria-label="LSTM gate flow"><defs><marker id="lstm-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>{boxes.map(function(b,j){var bx=18+j*135;return <React.Fragment key={b[0]}><rect x={bx} y="45" width="105" height="55" rx="8" fill={COLORS[j%3]} opacity=".2" stroke={COLORS[j%3]}/><text x={bx+52} y="68" textAnchor="middle" fontSize="12">{b[0]}</text><text x={bx+52} y="88" textAnchor="middle" fontSize="14" fontWeight="bold">{b[1].toFixed(3)}</text>{j<3&&<line x1={bx+106} y1="72" x2={bx+132} y2="72" stroke="#64748b" markerEnd="url(#lstm-arrow)"/>}</React.Fragment>;})}<text x="18" y="125" fontSize="12">c_new = {cn.toFixed(3)}</text><text x="190" y="125" fontSize="12">h_new = {hn.toFixed(3)}</text></svg><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(100px,1fr))',gap:8}}><TinyStat label="forget" value={(f*100).toFixed(1)+'%'}/><TinyStat label="input" value={(i*100).toFixed(1)+'%'}/><TinyStat label="output" value={(o*100).toFixed(1)+'%'}/><TinyStat label="c_new" value={cn.toFixed(3)}/><TinyStat label="h_new" value={hn.toFixed(3)}/></div>{show&&<FormulaLive label="State update" formula={'c_new = f × c + i × g\n= '+f.toFixed(3)+' × '+c.toFixed(3)+' + '+i.toFixed(3)+' × '+g.toFixed(3)+' = '+cn.toFixed(3)+'\nh_new = o × tanh(c_new)\n= '+o.toFixed(3)+' × tanh('+cn.toFixed(3)+') = '+hn.toFixed(3)}/>}</VizFrame>;
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
  return <VizFrame><div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start',marginBottom:14}}><div><h3 style={{margin:0,fontSize:20,color:'#0f172a'}}>Trained weights — what each feature pushes toward each class</h3><p style={{margin:'6px 0 0',color:'#64748b',fontSize:14}}>Positive = this feature pushes toward this class. Negative = pushes away.</p></div><button onClick={function(){setAbs(!abs);}} style={{border:'1px solid #cbd5e1',background:abs?'#eff6ff':'white',color:abs?'#1d4ed8':'#334155',borderRadius:7,padding:'8px 12px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Show absolute values</button></div><div className="grid-auto">{rows.map(function(col,ci){return <div key={col.cls} style={{border:'1px solid #e2e8f0',borderRadius:10,padding:12,background:'#f8fafc'}}><div style={{fontWeight:800,color:COLORS[ci],marginBottom:12}}>{col.cls}</div>{col.weights.map(function(w){var mag=Math.min(Math.abs(w.v)/max,1);var left=!abs&&w.v<0;var color=abs?'#2563eb':(left?'#ef4444':'#2563eb');return <div key={w.name} style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',fontSize:12,fontWeight:700,color:'#475569',marginBottom:5}}><span>{w.name}</span><span>{w.v>0?'+':''}{w.v.toFixed(2)}</span></div><div style={{height:18,background:'#e2e8f0',borderRadius:9,position:'relative',overflow:'hidden'}}><div style={{position:'absolute',left:'50%',top:0,bottom:0,width:1,background:'#94a3b8'}}/><div style={{position:'absolute',top:3,bottom:3,left:left?((50-mag*50)+'%'):'50%',width:(mag*50)+'%',background:color,borderRadius:7,transition:'all .2s'}}/></div></div>;})}</div>;})}</div></VizFrame>;
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
  var dataset=useMemo(function(){var d=window._cachedData||window.generateData();var sc=new window.Scaler().fit(d.X);return {X:d.X.slice(0,30),y:d.y.slice(0,30),sc:sc,Xsc:sc.transform(d.X.slice(0,30))};},[]);
  useEffect(function(){var t=setInterval(function(){if(!frozen&&window.__livePredictorQuery&&window.__livePredictorQuery.raw)setQuery(window.__livePredictorQuery.raw);},300);return function(){clearInterval(t);};},[frozen]);
  var qi=useMemo(function(){return dataset.sc.transformOne(query);},[dataset,query]);
  var weights=useMemo(function(){return window.attnWeights(dataset.Xsc,qi,parseFloat(bw));},[dataset,qi,bw]);
  var probs=useMemo(function(){return window.attnProba(dataset.Xsc,dataset.y,qi,parseFloat(bw));},[dataset,qi,bw]);
  var ranked=weights.map(function(w,i){return {i:i,w:w,d:Math.sqrt(Math.pow(dataset.Xsc[i][0]-qi[0],2)+Math.pow(dataset.Xsc[i][1]-qi[1],2))};}).sort(function(a,b){return b.w-a.w;}).slice(0,8);
  var W=360,H=240,xs=dataset.X.map(function(x){return x[0];}),ys=dataset.X.map(function(x){return x[1];});
  xs=xs.concat([query[0]]);ys=ys.concat([query[1]]);
  var xmin=Math.min.apply(null,xs),xmax=Math.max.apply(null,xs),ymin=Math.min.apply(null,ys),ymax=Math.max.apply(null,ys);
  function sx(v){return 18+(v-xmin)/(xmax-xmin||1)*(W-36);} function sy(v){return H-18-(v-ymin)/(ymax-ymin||1)*(H-36);}
  return <VizFrame><div style={{display:'flex',justifyContent:'space-between',gap:12,marginBottom:12}}><div><h3 style={{margin:0,fontSize:20,color:'#0f172a'}}>Attention neighbours</h3><p style={{margin:'6px 0 0',color:'#64748b',fontSize:14}}>Circle radius shows how loudly each training building votes for the current query.</p></div><button onClick={function(){setFrozen(!frozen);}} style={{border:'1px solid #cbd5e1',background:frozen?'#0f172a':'white',color:frozen?'white':'#334155',borderRadius:7,padding:'8px 12px',fontWeight:800,cursor:'pointer',fontFamily:'inherit'}}>{frozen?'Query frozen':'Freeze query'}</button></div><div style={{display:'grid',gridTemplateColumns:'1.1fr .9fr',gap:16}}><div><svg viewBox={'0 0 '+W+' '+H} style={{width:'100%',height:'auto',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:10}}>{dataset.X.map(function(x,i){var r=3+Math.sqrt(weights[i])*45;return <circle key={i} cx={sx(x[0])} cy={sy(x[1])} r={r} fill={COLORS[dataset.y[i]]} opacity={0.25+Math.min(weights[i]*10,.55)} stroke="white"/>;})}<circle cx={sx(query[0])} cy={sy(query[1])} r={10} fill="none" stroke="#0f172a" strokeWidth="3"/><text x="12" y={H-8} fill="#64748b" fontSize="10">Energy →</text></svg><label style={{display:'block',marginTop:12,fontSize:13,fontWeight:800}}>Bandwidth w = {parseFloat(bw).toFixed(1)}<input style={{width:'100%'}} type="range" min="0.3" max="8" step="0.1" value={bw} onChange={function(e){setBw(e.target.value);}}/></label><div style={{fontSize:12,color:'#64748b'}}>Query: energy {Math.round(query[0]).toLocaleString()}, sqft {Math.round(query[1]).toLocaleString()}</div></div><div><table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}><thead><tr><th style={{textAlign:'left',padding:6}}>Rank</th><th style={{textAlign:'left',padding:6}}>Class</th><th style={{textAlign:'right',padding:6}}>Distance</th><th style={{textAlign:'right',padding:6}}>Weight%</th></tr></thead><tbody>{ranked.map(function(r,idx){return <tr key={r.i}><td style={{padding:6,borderTop:'1px solid #e2e8f0'}}>{idx+1}</td><td style={{padding:6,borderTop:'1px solid #e2e8f0',color:COLORS[dataset.y[r.i]],fontWeight:800}}>{CLASSES[dataset.y[r.i]]}</td><td style={{padding:6,borderTop:'1px solid #e2e8f0',textAlign:'right'}}>{r.d.toFixed(2)}</td><td style={{padding:6,borderTop:'1px solid #e2e8f0',textAlign:'right'}}>{(r.w*100).toFixed(1)}</td></tr>;})}</tbody></table><div style={{marginTop:12}}><ProbBar probs={probs}/></div></div></div></VizFrame>;
}
function GradientStepTrace(){
  var [lr,setLr]=useState(.25),[w,setW]=useState(0),[rows,setRows]=useState([]),[flash,setFlash]=useState(false),[running,setRunning]=useState(false);
  var runRef=useRef(null);
  var flashTimer=useRef(null);
  useEffect(function(){return function(){if(runRef.current)clearInterval(runRef.current);if(flashTimer.current)clearTimeout(flashTimer.current);};},[]);
  var loss=function(x){return Math.pow(x-3,2);}; var grad=function(x){return 2*(x-3);};
  function oneStep(){var g=grad(w), stepSize=lr*g, nw=w-stepSize, prev=loss(w), next=loss(nw);setRows(function(r){return r.concat([{it:r.length+1,w:w,loss:prev,grad:g,step:stepSize}]).slice(-8);});setW(nw);setFlash(next>prev);if(flashTimer.current)clearTimeout(flashTimer.current);flashTimer.current=setTimeout(function(){setFlash(false);flashTimer.current=null;},220);}
  function run10(){if(running)return;setRunning(true);var count=0;runRef.current=setInterval(function(){oneStep();count++;if(count>=10){clearInterval(runRef.current);runRef.current=null;setRunning(false);}},200);}
  var W=360,H=220; function sx(x){return (x+1)/8*W;} function sy(y){return H-(y/16*H);} var pts=[]; for(var x=-1;x<=7.001;x+=.08)pts.push(sx(x)+','+sy(loss(x))); var gx=grad(w), dir=gx>0?-1:1;
  return <VizFrame><h3 style={{margin:'0 0 12px',fontSize:20,color:'#0f172a'}}>Gradient step trace</h3><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}><svg viewBox={'0 0 '+W+' '+H} style={{width:'100%',height:'auto',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:10}}><polyline points={pts.join(' ')} fill="none" stroke="#2563eb" strokeWidth="3"/><line x1={sx(w)} y1={sy(loss(w))} x2={sx(w+dir*.7)} y2={sy(loss(w))+20} stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrow)"/><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#dc2626"/></marker></defs><circle cx={sx(w)} cy={sy(loss(w))} r="7" fill={flash?'#dc2626':'#f59e0b'} stroke="white" strokeWidth="2"/><text x="8" y="16" fontSize="11" fill="#64748b">L = (w - 3)^2</text><text x={W-56} y={H-8} fontSize="11" fill="#64748b">weight</text></svg><div><table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}><thead><tr>{['iteration','weight','loss','gradient','step_size'].map(function(h){return <th key={h} style={{textAlign:'right',padding:5,borderBottom:'1px solid #e2e8f0'}}>{h}</th>;})}</tr></thead><tbody>{rows.map(function(r){return <tr key={r.it}><td style={{padding:5,textAlign:'right'}}>{r.it}</td><td style={{padding:5,textAlign:'right'}}>{r.w.toFixed(3)}</td><td style={{padding:5,textAlign:'right'}}>{r.loss.toFixed(3)}</td><td style={{padding:5,textAlign:'right'}}>{r.grad.toFixed(3)}</td><td style={{padding:5,textAlign:'right'}}>{r.step.toFixed(3)}</td></tr>;})}</tbody></table></div></div><div style={{marginTop:14,display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}><label style={{fontSize:13,fontWeight:800}}>Learning rate {lr.toFixed(2)} <input type="range" min="0.01" max="1.5" step="0.01" value={lr} onChange={function(e){setLr(+e.target.value);}}/></label><button onClick={oneStep} style={{padding:'8px 12px',borderRadius:7,border:'1px solid #cbd5e1',background:'white'}}>Step</button><button onClick={run10} style={{padding:'8px 12px',borderRadius:7,border:'1px solid #cbd5e1',background:'white'}}>Run 10 steps</button><button onClick={function(){setW(0);setRows([]);}} style={{padding:'8px 12px',borderRadius:7,border:'1px solid #cbd5e1',background:'white'}}>Reset</button>{lr>1&&<span style={{color:'#dc2626',fontWeight:800}}>⚠ Learning rate too large — may diverge</span>}</div></VizFrame>;
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
  var map={WeightVectorViz:WeightVectorViz,ScalingExplorer:ScalingExplorer,AttentionNeighbours:AttentionNeighbours,GradientStepTrace:GradientStepTrace,ConfusionMatrixExplorer:ConfusionMatrixExplorer,PerceptronViz:PerceptronViz,RegularizationViz:RegularizationViz,DecisionTreeViz:DecisionTreeViz,NaiveBayesViz:NaiveBayesViz,BiasVarianceViz:BiasVarianceViz,EnsembleVoteViz:EnsembleVoteViz,PCAViz:PCAViz,SHAPWaterfallViz:SHAPWaterfallViz,LSTMGateViz:LSTMGateViz};
  var C=map[name];
  if(!C)return <Callout type="warning" title="Missing visualization">Unknown visualization: {name}</Callout>;
  return <C {...(props||{})}/>;
}
function LessonNotes({lessonId,noteId,title,onNoteSaved,onStorageError}){
  var [open,setOpen]=useState(false);
  var [note,setNote]=useState('');
  var [loaded,setLoaded]=useState(false);
  var [saved,setSaved]=useState(false);
  var [undoValue,setUndoValue]=useState(null);
  var saveTimer=useRef(null);
  var dirty=useRef(false);
  var persisted=useRef('');
  var key='note:'+noteId;
  function markSaved(){
    setSaved(true);
    setTimeout(function(){setSaved(false);},2000);
  }
  function updateNoteIndex(text){
    storageRead('notes:index',[],function(list){
      if(!Array.isArray(list)) list=[];
      var has=list.indexOf(lessonId)!==-1;
      var next=list.slice();
      if(text.trim()&&!has) next.push(lessonId);
      if(text.trim()){
        storageWrite('notes:index',next,function(){if(onNoteSaved)onNoteSaved(next);},onStorageError);
        return;
      }
      storageRead('notes:keys',[],function(keys){
        if(!Array.isArray(keys)) keys=[];
        var prefix='note:'+lessonId+':';
        var related=keys.filter(function(k){return k.indexOf(prefix)===0&&k!==key;});
        Promise.all(related.map(function(k){return storageReadPromise(k,'');})).then(function(values){
          var stillHasNote=values.some(function(v){return typeof v==='string'&&v.trim();});
          if(!stillHasNote&&has) next=next.filter(function(id){return id!==lessonId;});
          storageWrite('notes:index',next,function(){if(onNoteSaved)onNoteSaved(next);},onStorageError);
        });
      },onStorageError);
    },onStorageError);
  }
  function rememberNoteKey(){
    storageRead('notes:keys',[],function(keys){
      if(!Array.isArray(keys)) keys=[];
      if(keys.indexOf(key)===-1) keys=keys.concat([key]);
      storageWrite('notes:keys',keys,null,onStorageError);
    },onStorageError);
  }
  function saveNow(text){
    var previous=persisted.current;
    storageWrite(key,text,function(){
      dirty.current=false;
      if(text!==previous) setUndoValue(previous);
      persisted.current=text;
      if(text.trim()) rememberNoteKey();
      updateNoteIndex(text);
      markSaved();
    },onStorageError);
  }
  function clearNote(){
    var previous=persisted.current;
    storageWrite(key,'',function(){
      setNote('');
      persisted.current='';
      dirty.current=false;
      if(previous!=='') setUndoValue(previous);
      updateNoteIndex('');
      markSaved();
    },onStorageError);
  }
  function undoSave(){
    if(undoValue===null) return;
    var restored=undoValue;
    storageWrite(key,restored,function(){
      setNote(restored);
      persisted.current=restored;
      dirty.current=false;
      updateNoteIndex(restored);
      setUndoValue(null);
      markSaved();
    },onStorageError);
  }
  useEffect(function(){
    setLoaded(false);
    storageRead(key,'',function(value){
      var text=typeof value==='string'?value:'';
      setNote(text);
      setOpen(!!text.trim());
      persisted.current=text;
      setUndoValue(null);
      dirty.current=false;
      setLoaded(true);
    },function(err){setLoaded(true);onStorageError(err);});
    return function(){if(saveTimer.current)clearTimeout(saveTimer.current);};
  },[key]);
  useEffect(function(){
    if(!loaded||!dirty.current) return;
    if(saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current=setTimeout(function(){saveNow(note);},2000);
    return function(){if(saveTimer.current)clearTimeout(saveTimer.current);};
  },[note,loaded]);
  return(
    <section style={{marginTop:42,border:'1px solid #e2e8f0',borderRadius:8,background:'white',overflow:'hidden'}}>
      <button onClick={function(){setOpen(!open);}}
        style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'13px 16px',border:'none',background:'#f8fafc',cursor:'pointer',fontFamily:'inherit'}}>
        <span style={{fontWeight:800,color:'#1e293b'}}>{title||'My Notes'}</span>
        <span style={{fontSize:13,color:'#64748b'}}>{saved?'📝 note saved':(open?'Hide':'Show')}</span>
      </button>
      {open&&(
        <div style={{padding:16}}>
          <textarea value={note} onChange={function(e){dirty.current=true;setNote(e.target.value);}}
            placeholder="Write your own explanation, questions, or reminders for this lesson..."
            style={{width:'100%',minHeight:150,boxSizing:'border-box',resize:'vertical',border:'1px solid #cbd5e1',borderRadius:8,padding:12,fontSize:15,lineHeight:1.6,fontFamily:'inherit'}}/>
          <div style={{display:'flex',alignItems:'center',gap:10,marginTop:10}}>
            <button onClick={function(){saveNow(note);}}
              style={{background:'#2563eb',color:'white',border:'none',borderRadius:7,padding:'9px 14px',fontWeight:800,cursor:'pointer',fontFamily:'inherit'}}>
              Save note
            </button>
            {undoValue!==null&&(
              <button onClick={undoSave}
                style={{background:'white',color:'#b45309',border:'1px solid #f59e0b',borderRadius:7,padding:'9px 14px',fontWeight:800,cursor:'pointer',fontFamily:'inherit'}}>
                Undo save
              </button>
            )}
            <button onClick={clearNote}
              style={{background:'white',color:'#7f1d1d',border:'1px solid #fca5a5',borderRadius:7,padding:'9px 14px',fontWeight:800,cursor:'pointer',fontFamily:'inherit'}}>
              Clear note
            </button>
            {saved&&<span style={{fontSize:13,color:'#166534',fontWeight:700}}>📝 note saved</span>}
          </div>
        </div>
      )}
    </section>
  );
}

/* ── Lesson page renderer ───────────────────────────────────────── */
function LessonPage({idx,lessonId,isBookmarked,onToggleBookmark,onNoteSaved,onStorageError,storageWarning}){
  var blocks=(window.BLOCKS&&window.BLOCKS[idx])||[];
  var lessonTitle=(window.LESSON_TITLES&&window.LESSON_TITLES[idx])||'Lesson '+idx;
  var navItem=NAV.find(function(item){return item.id===lessonId;});
  var displayTitle=navItem&&/^\d+ ·/.test(navItem.label)?navItem.label:lessonTitle;
  var readMins=Math.max(1,Math.ceil(lessonWordsFromBlocks(blocks)/200));
  var conceptNotesShown=0;
  if(!blocks.length){
    return(
      <div>
        <h1 style={{fontSize:32,fontWeight:800,color:'#0f172a',margin:'0 0 12px'}}>{displayTitle}</h1>
        <div style={{background:'white',border:'1px solid #e2e8f0',borderRadius:10,padding:'24px 26px',color:'#475569',lineHeight:1.8}}>
          <div style={{fontSize:22,fontWeight:800,color:'#1e293b',marginBottom:6}}>Coming soon</div>
          This lesson is coming soon. In the meantime, explore the existing lessons from the sidebar.
        </div>
      </div>
    );
  }
  return(
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:18,marginBottom:18}}>
        <div>
          <h1 style={{fontSize:32,fontWeight:800,color:'#0f172a',margin:'0 0 8px'}}>{displayTitle}</h1>
          <div style={{fontSize:14,color:'#64748b'}}>📖 ~{readMins} min read</div>
        </div>
        <button onClick={onToggleBookmark} title={isBookmarked?'Remove bookmark':'Bookmark this lesson'}
          style={{border:'1px solid '+(isBookmarked?'#f59e0b':'#cbd5e1'),background:isBookmarked?'#fffbeb':'white',color:isBookmarked?'#b45309':'#334155',borderRadius:8,padding:'9px 12px',fontSize:18,fontWeight:800,cursor:'pointer'}}>
          {isBookmarked?'🔖✓':'🔖'}
        </button>
      </div>
      <LessonConceptMap blocks={blocks}/>
      {storageWarning&&<Callout type="warning" title="Storage unavailable">Notes and bookmarks cannot be saved right now.</Callout>}
      {blocks.map(function(b,i){
        var rendered=null;
        if(b[0]==='p') return <p key={i} style={{color:'#475569',lineHeight:1.85,fontSize:16,marginBottom:14}}>{b[1]}</p>;
        if(b[0]==='h2'){
          conceptNotesShown++;
          rendered=<h2 key={i} style={{fontSize:22,fontWeight:700,color:'#1e293b',marginTop:36,marginBottom:14,paddingBottom:8,borderBottom:'1px solid #e2e8f0'}}>{b[1]}</h2>;
          if(conceptNotesShown===2||conceptNotesShown===5){
            return <React.Fragment key={i}>{rendered}<LessonNotes lessonId={lessonId} noteId={lessonId+':concept:'+conceptNotesShown} title="My Notes for this concept" onNoteSaved={onNoteSaved} onStorageError={onStorageError}/></React.Fragment>;
          }
          return rendered;
        }
        if(b[0]==='code') return <CB key={i} filename={b[1]} code={b[2]}/>;
        if(b[0]==='math') return <MathB key={i}>{b[1]}</MathB>;
        if(b[0]==='callout') return <Callout key={i} type={b[1]} title={b[2]}>{b[3]}</Callout>;
        if(b[0]==='streamlit') return <StreamlitTip key={i} page={b[1]}>{b[2]}</StreamlitTip>;
        if(b[0]==='quiz') return <QuizBlock key={i} qs={b[1]}/>;
        if(b[0]==='prompt') return <PromptBlock key={i} title={b[1]} prompt={b[2]}/>;
        if(b[0]==='viz') return <VizBlock key={i} name={b[1]} props={b[2]}/>;
        return null;
      })}
      <LessonNotes lessonId={lessonId} noteId={lessonId+':summary'} title="My Notes" onNoteSaved={onNoteSaved} onStorageError={onStorageError}/>
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
    var d=window._cachedData||window.generateData();
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
        <div className="responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
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
              <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Model (src/models/linear.py)</div>
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
              <svg viewBox={'0 0 '+W+' '+H} style={{width:'100%',height:'auto',flexShrink:0,border:'1px solid #e2e8f0',borderRadius:6,background:'#fff'}}>
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
    <svg viewBox={'0 0 '+W+' '+H} style={{display:'block',border:'1px solid #e2e8f0',borderRadius:8,background:'#f8fafc',width:'100%',height:'auto'}}>
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
    var d=window._cachedData||window.generateData();
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
      <div className="responsive-grid" style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:16,marginBottom:14}}>
        <div>
          <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>Loss landscape: Residential vs rest (b=0 slice)</div>
          <canvas ref={canvasRef} width={270} height={270} style={{width:270,height:270,maxWidth:'100%',borderRadius:10,border:'1px solid #e2e8f0',display:'block'}}/>
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
        <div className="responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:12}}>
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
    var d=window._cachedData||window.generateData();
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
      <div className="responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr 200px',gap:14,marginBottom:14}}>
        <div style={{background:'#f8fafc',borderRadius:10,padding:12,border:'1px solid #e2e8f0'}}>
          <div style={{fontSize:11,color:'#64748b',marginBottom:6}}>Scaled feature space — circle area ∝ attention weight</div>
          <svg viewBox={'0 0 '+W+' '+H} style={{display:'block',width:'100%',height:'auto',maxWidth:W}}>
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
        <div className="grid-auto">
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
    var d=window._cachedData||window.generateData();
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
      <div className="responsive-grid" style={{display:'grid',gridTemplateColumns:'1fr 220px',gap:14}}>
        <div style={{position:'relative'}}>
          <canvas ref={canvasRef} width={500} height={320} style={{width:'100%',height:'auto',maxWidth:'100%',borderRadius:10,border:'1px solid #e2e8f0',display:'block'}}/>
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
function FinalExam({onExamScore,onStorageError}){
  var [answers,setAnswers]=useState({});
  var [submitted,setSubmitted]=useState(false);
  var [shareCopied,setShareCopied]=useState(false);
  var shareTimer=useRef(null);
  useEffect(function(){return function(){if(shareTimer.current)clearTimeout(shareTimer.current);};},[]);
  var n=window.FQ.length;
  var answered=Object.keys(answers).length;
  var score=window.FQ.reduce(function(s,q,i){return s+(answers[i]===q.a?1:0);},0);
  var pct=Math.round(score/n*100);
  var pass=pct>=70;
  useEffect(function(){
    if(submitted){
      var main=document.querySelector('main');
      if(main&&main.scrollTo) main.scrollTo({top:0,behavior:'smooth'});
      else window.scrollTo({top:0,behavior:'smooth'});
    }
  },[submitted]);
  function shareResults(){
    var text='I scored '+score+'/'+n+' on the EnergyTypeNet ML exam';
    try{
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){
          setShareCopied(true);
          if(shareTimer.current)clearTimeout(shareTimer.current);
          shareTimer.current=setTimeout(function(){setShareCopied(false);shareTimer.current=null;},2000);
        });
      }
    }catch(e){}
  }

  if(submitted){
    return(
      <div>
        <h1 style={{fontSize:32,fontWeight:800,marginBottom:12}}>🎓 Results</h1>
        <div style={{textAlign:'center',padding:'24px 16px',background:pass?'#f0fdf4':'#fef2f2',borderRadius:14,border:'2px solid '+(pass?'#22c55e':'#ef4444'),marginBottom:20}}>
          <div style={{fontSize:44,marginBottom:8}}>{pass?'🏆':'📚'}</div>
          <div style={{fontSize:34,fontWeight:800,color:pass?'#14532d':'#7f1d1d'}}>{score}/{n}</div>
          <div style={{fontSize:22,fontWeight:700,color:pass?'#166534':'#991b1b',marginBottom:6}}>{pct}% — {pass?'PASS ✓':'Keep studying'}</div>
          <div style={{fontSize:18,color:pass?'#14532d':'#7f1d1d'}}>{pass?'You understand GradCurve end to end.':'Review the highlighted lessons and try again.'}</div>
        </div>
        <h2 style={{fontSize:24,fontWeight:700,marginBottom:12}}>Review</h2>
        {window.FQ.map(function(q,qi){
          var c=answers[qi]===q.a;
          return(
            <div key={qi} style={{marginBottom:8,padding:'10px 12px',borderRadius:8,background:c?'#f0fdf4':'#fef2f2',border:'1px solid '+(c?'#86efac':'#fca5a5')}}>
              <div style={{fontSize:18,fontWeight:600,marginBottom:6,lineHeight:1.55}}>
                <span style={{color:c?'#14532d':'#7f1d1d'}}>{c?'✓':'✗'}</span>
                {' '}[{q.t}] {q.q}
              </div>
              {!c&&<div style={{fontSize:16,color:'#475569',lineHeight:1.5}}>Your answer: {(q.opts[answers[qi]]||{t:'—'}).t}</div>}
              <div style={{fontSize:16,color:'#14532d',lineHeight:1.5}}>Correct: {q.opts[q.a].t}</div>
              <div style={{fontSize:16,color:'#64748b',lineHeight:1.5,marginTop:3}}>{q.opts[q.a].e}</div>
            </div>
          );
        })}
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:12}}>
          <button onClick={function(){setAnswers({});setSubmitted(false);}} style={{padding:'11px 24px',borderRadius:9,background:'#2563eb',color:'white',border:'none',fontSize:17,fontWeight:700,fontFamily:'inherit',cursor:'pointer'}}>
            ↺ Retake
          </button>
          <button onClick={shareResults} style={{padding:'11px 24px',borderRadius:9,background:'white',color:'#2563eb',border:'1px solid #2563eb',fontSize:17,fontWeight:700,fontFamily:'inherit',cursor:'pointer'}}>
            {shareCopied?'✓ Copied!':'Share results'}
          </button>
        </div>
      </div>
    );
  }

  return(
    <div>
      <h1 style={{fontSize:32,fontWeight:800,marginBottom:6}}>🎓 Final Exam</h1>
      <p style={{color:'#64748b',fontSize:18,lineHeight:1.6,marginBottom:10}}>{n} questions across all lessons. Pass mark: 70% ({Math.round(n*0.7)}/{n}). Answered: {answered}/{n}</p>
      <div style={{height:5,background:'#e2e8f0',borderRadius:3,marginBottom:16,overflow:'hidden'}}>
        <div style={{height:'100%',width:(answered/n*100)+'%',background:'#3b82f6',borderRadius:3,transition:'width .3s'}}/>
      </div>
      {window.FQ.map(function(q,qi){
        return(
          <div key={qi} style={{marginBottom:12,background:'#f8fafc',borderRadius:10,padding:'12px 14px',border:'1px solid '+(answers[qi]!==undefined?'#94a3b8':'#e2e8f0')}}>
            <p style={{fontWeight:600,fontSize:18,lineHeight:1.55,marginBottom:10,color:'#1e293b'}}>
              <span style={{fontSize:16,color:'#64748b',marginRight:7}}>[{q.t}]</span>
              {qi+1}. {q.q}
            </p>
            {q.opts.map(function(opt,oi){
              var chosen=answers[qi]===oi;
              return(
                  <button type="button" key={oi} onClick={function(){setAnswers(function(a){var n=Object.assign({},a);n[qi]=oi;return n;});}}
                    style={{display:'block',width:'100%',textAlign:'left',padding:'10px 12px',borderRadius:7,border:'1px solid '+(chosen?'#3b82f6':'#e2e8f0'),background:chosen?'#eff6ff':'white',color:chosen?'#1d4ed8':'#475569',fontSize:17,lineHeight:1.5,cursor:'pointer',marginBottom:6,fontFamily:'inherit',wordBreak:'break-word'}}>
                  <span style={{fontFamily:'monospace',fontWeight:700,marginRight:6}}>{String.fromCharCode(65+oi)}.</span>{opt.t}
                </button>
              );
            })}
          </div>
        );
      })}
      <div style={{marginTop:14,marginBottom:10,padding:'12px 14px',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:8,color:'#1e40af',fontSize:17,fontWeight:700}}>
        You have answered {answered} of {n} questions. {n-answered} more to go.
      </div>
      <button onClick={function(){
        if(answered===n){
          var result={score:score,total:n,pct:pct,passed:pass,taken_at:new Date().toISOString()};
          storageWrite('exam_score',result,function(){if(onExamScore)onExamScore(result);},onStorageError);
          setSubmitted(true);
        }
      }} disabled={answered<n}
        style={{padding:'12px 26px',borderRadius:9,background:answered===n?'#2563eb':'#cbd5e1',color:answered===n?'white':'#94a3b8',border:'none',fontSize:17,fontWeight:700,cursor:answered===n?'pointer':'not-allowed',fontFamily:'inherit',marginTop:8}}>
        {answered<n?('Answer '+(n-answered)+' more to submit'):('Submit ('+answered+'/'+n+' answered)')}
      </button>
    </div>
  );
}

/* ── Glossary ───────────────────────────────────────────────────── */
function GlossaryPage({lessonId,isBookmarked,onToggleBookmark,onNoteSaved,onStorageError,storageWarning}){
  var [q,setQ]=useState('');
  var readMins=Math.max(1,Math.ceil(lessonWordsFromBlocks(window.BLOCKS[33]||[])/200));
  var entries=useMemo(function(){
    var blocks=window.BLOCKS[33]||[];
    var out=[];
    for(var i=0;i<blocks.length;i++){
      if(blocks[i][0]==='h2'){
        out.push({
          term:blocks[i][1],
          definition:(blocks[i+1]&&blocks[i+1][0]==='p')?blocks[i+1][1]:'',
          where:(blocks[i+2]&&blocks[i+2][0]==='p')?blocks[i+2][1]:'',
          analogy:(blocks[i+3]&&blocks[i+3][0]==='callout')?blocks[i+3][3]:'',
        });
      }
    }
    return out;
  },[]);
  var query=q.trim().toLowerCase();
  var shown=entries.filter(function(e){
    if(!query) return true;
    return (e.term+' '+e.definition+' '+e.where+' '+e.analogy).toLowerCase().indexOf(query)!==-1;
  });
  return(
    <div>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:18,marginBottom:18}}>
        <div>
          <h1 style={{fontSize:34,fontWeight:800,color:'#0f172a',margin:'0 0 8px'}}>Glossary</h1>
          <div style={{fontSize:14,color:'#64748b'}}>📖 ~{readMins} min read</div>
        </div>
        <button onClick={onToggleBookmark} title={isBookmarked?'Remove bookmark':'Bookmark this lesson'}
          style={{border:'1px solid '+(isBookmarked?'#f59e0b':'#cbd5e1'),background:isBookmarked?'#fffbeb':'white',color:isBookmarked?'#b45309':'#334155',borderRadius:8,padding:'9px 12px',fontSize:18,fontWeight:800,cursor:'pointer'}}>
          {isBookmarked?'🔖✓':'🔖'}
        </button>
      </div>
      {storageWarning&&<Callout type="warning" title="Storage unavailable">Notes and bookmarks cannot be saved right now.</Callout>}
      <p style={{fontSize:16,color:'#64748b',lineHeight:1.8,marginBottom:18}}>
        Search every technical term used across the GradCurve lessons.
      </p>
      <input
        value={q}
        onChange={function(e){setQ(e.target.value);}}
        placeholder="Search terms, lessons, or analogies..."
        style={{width:'100%',boxSizing:'border-box',padding:'14px 16px',border:'1px solid #cbd5e1',borderRadius:8,fontSize:16,fontFamily:'inherit',marginBottom:10,background:'white'}}
      />
      <div style={{fontSize:13,color:'#64748b',marginBottom:22}}>
        Showing {shown.length} of {entries.length} terms
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
        {shown.map(function(e){
          return(
            <section key={e.term} style={{background:'white',border:'1px solid #e2e8f0',borderRadius:8,padding:'18px 18px 16px'}}>
              <h2 style={{fontSize:20,fontWeight:800,color:'#0f172a',margin:'0 0 8px'}}>{e.term}</h2>
              <p style={{fontSize:15,color:'#334155',lineHeight:1.7,margin:'0 0 8px'}}>{e.definition}</p>
              <p style={{fontSize:14,color:'#64748b',lineHeight:1.65,margin:'0 0 12px'}}>{e.where}</p>
              <Callout type="analogy" title="Simple analogy">{e.analogy}</Callout>
            </section>
          );
        })}
      </div>
      {!shown.length&&(
        <div style={{background:'#fff7ed',border:'1px solid #fed7aa',borderRadius:8,padding:18,color:'#9a3412'}}>
          No terms matched that search.
        </div>
      )}
      <LessonNotes lessonId={lessonId} noteId={lessonId+':summary'} title="My Notes" onNoteSaved={onNoteSaved} onStorageError={onStorageError}/>
    </div>
  );
}

/* ── Navigation ─────────────────────────────────────────────────── */
var NAV=[
  {id:'home',     label:'Home',                              g:'overview'},
  {id:'story',    label:'How I Built This Project',          g:'overview'},
  {id:'glossary', label:'📖 Glossary',                       g:'overview'},

  {id:'tour',     label:'1 · Codebase Tour',                 g:'start'},

  {id:'dataset',  label:'2 · Dataset',                       g:'data'},
  {id:'eda',      label:'3 · Notebook 01 · EDA',             g:'data'},
  {id:'knn',      label:'4 · kNN & Distances',               g:'data'},

  {id:'feateng',  label:'5 · Feature Engineering',           g:'features'},
  {id:'featimportance', label:'6 · Notebook 03 · Feature Importance', g:'features'},
  {id:'scaling',  label:'7 · Feature Scaling',               g:'features'},

  {id:'perceptron', label:'8 · Perceptron & Linear Sep.',    g:'models'},
  {id:'gdlesson', label:'9 · Gradient Descent',              g:'models'},
  {id:'ovr',      label:'10 · LogReg OvR',                   g:'models'},
  {id:'softmax',  label:'11 · Softmax',                      g:'models'},
  {id:'attn',     label:'12 · Attention',                    g:'models'},
  {id:'xgb',      label:'13 · XGBoost',                      g:'models'},
  {id:'mlp',      label:'14 · MLP',                          g:'models'},
  {id:'regularization', label:'15 · Regularization',         g:'models'},
  {id:'svm',      label:'16 · SVM',                          g:'models'},
  {id:'dtree',    label:'17 · Decision Trees',               g:'models'},

  {id:'naivebayes', label:'18 · Naive Bayes',                g:'classical'},
  {id:'clustering', label:'19 · Clustering',                  g:'classical'},
  {id:'dimreduce', label:'20 · Dim Reduction',                g:'classical'},

  {id:'pytorch',  label:'21 · PyTorch Intro',                g:'deeplearning'},
  {id:'autoencoder', label:'22 · Autoencoders',              g:'deeplearning'},
  {id:'cnn',      label:'23 · CNNs',                         g:'deeplearning'},
  {id:'rnn',      label:'24 · RNNs',                         g:'deeplearning'},

  {id:'cv',       label:'25 · Cross-Validation',             g:'training'},
  {id:'hyperparams', label:'26 · Hyperparameter Tuning',     g:'training'},

  {id:'metrics',  label:'27 · Metrics',                      g:'eval'},
  {id:'interpretability', label:'28 · Notebook 04 · Interpretability', g:'eval'},
  {id:'db',       label:'29 · Decision Bounds',              g:'eval'},

  {id:'shap',     label:'30 · SHAP & LIME',                  g:'xai'},
  {id:'dataval',  label:'31 · Data Validation',              g:'xai'},
  {id:'modelcard', label:'32 · Model Cards',                 g:'xai'},
  {id:'llmassistant', label:'33 · LLM Assistant',            g:'xai'},

  {id:'ensemble', label:'34 · Ensemble',                     g:'ensembles'},
  {id:'ensemble2', label:'35 · Notebook 05 · Ensembles',     g:'ensembles'},
  {id:'ensemble19', label:'36 · Notebook 19 · Ensemble Extensions', g:'ensembles'},

  {id:'overfit',  label:'37 · Overfitting',                  g:'reliability'},
  {id:'results',  label:'38 · Reading Results',              g:'reliability'},
  {id:'ceiling',  label:'39 · Notebook 06 · Accuracy Ceiling', g:'reliability'},

  {id:'mlflow',   label:'40 · MLflow',                       g:'prod'},
  {id:'fastapi',  label:'41 · FastAPI',                      g:'prod'},
  {id:'docker',   label:'42 · Docker',                       g:'prod'},
  {id:'streamlit', label:'43 · Streamlit',                   g:'prod'},
  {id:'ci',       label:'44 · GitHub Actions',               g:'prod'},
  {id:'automl',   label:'45 · AutoML',                       g:'prod'},
  {id:'testing',  label:'46 · Testing',                      g:'prod'},
  {id:'deployment', label:'47 · Deployment',                 g:'prod'},

  {id:'predictor', label:'Live Predictor',                   g:'demos'},
  {id:'gd',       label:'Gradient Descent Demo',             g:'demos'},
  {id:'heatmap',  label:'Attention Heatmap',                 g:'demos'},
  {id:'boundary', label:'Decision Boundary Demo',            g:'demos'},
  {id:'exam',     label:'Final Exam ('+window.FQ.length+'q)', g:'demos'},
];
var LESSON_NAV=NAV.filter(function(l){return l.g!=='demos'&&l.id!=='home';});
var GINFO={
  overview:   {l:'Overview',              c:'#94a3b8'},
  start:      {l:'Start Here',            c:'#38bdf8'},
  data:       {l:'Data Foundations',      c:'#60a5fa'},
  features:   {l:'Feature Understanding', c:'#2563eb'},
  models:     {l:'Model Fundamentals',    c:'#a78bfa'},
  classical:  {l:'Classical Algorithms',  c:'#f472b6'},
  deeplearning:{l:'Deep Learning',        c:'#a78bfa'},
  training:   {l:'Training Workflow',     c:'#fbbf24'},
  eval:       {l:'Evaluation',            c:'#34d399'},
  xai:        {l:'Explainability & Validation', c:'#34d399'},
  ensembles:  {l:'Model Combining',       c:'#818cf8'},
  reliability:{l:'Reliability',           c:'#22c55e'},
  prod:       {l:'Production',            c:'#f87171'},
  demos:      {l:'Interactive Demos',     c:'#fb923c'},
};/* maps NAV id → LESSON_TITLES index */
var LESSON_IDX={
  dataset:1,feateng:2,scaling:3,ovr:4,softmax:5,attn:6,
  xgb:7,mlp:8,ensemble:9,cv:10,metrics:11,db:12,mlflow:13,
  fastapi:14,docker:15,streamlit:16,ci:17,automl:18,tour:19,
  gdlesson:20,overfit:21,results:22,eda:23,featimportance:24,
  interpretability:25,ensemble2:26,ceiling:27,hyperparams:28,story:30,
  testing:31,deployment:32,glossary:33,
  regularization:34,svm:35,dtree:36,knn:37,naivebayes:38,
  clustering:39,dimreduce:40,pytorch:41,autoencoder:42,cnn:43,rnn:44,
  shap:45,dataval:46,modelcard:47,llmassistant:48,perceptron:49,
  ensemble19:50
};

function Sidebar({cur,onSelect,visited,bookmarks,noteIds,onUndoBookmark,canUndoBookmark,onResetNotes,onExport,exportCopied,storageWarning}){
  var grouped={};
  NAV.forEach(function(l){if(!grouped[l.g])grouped[l.g]=[];grouped[l.g].push(l);});
  var lessonIds=LESSON_NAV.map(function(l){return l.id;});
  var lessonCount=lessonIds.length;
  var demoCount=NAV.filter(function(l){return l.g==='demos';}).length;
  var isMobile=window.innerWidth<768;
  var [desktopW,setDesktopW]=useState(function(){var saved=storageReadSync('gradcurve:sidebar-width',360),n=Number(saved);return Number.isFinite(n)?Math.max(280,Math.min(520,n)):360;});
  var resizeCleanup=useRef(null);
  useEffect(function(){return function(){if(resizeCleanup.current)resizeCleanup.current();};},[]);
  var sidebarW=isMobile?(window.innerWidth<400?window.innerWidth:320):desktopW;
  function saveSidebarWidth(next){var width=Math.max(280,Math.min(520,next));setDesktopW(width);storageWrite('gradcurve:sidebar-width',width);}
  function startSidebarResize(e){
    if(isMobile)return;
    e.preventDefault();
    var startX=e.clientX,startW=desktopW,dragW=desktopW;
    function move(ev){dragW=Math.max(280,Math.min(520,startW+ev.clientX-startX));setDesktopW(dragW);}
    function stop(){window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',stop);storageWrite('gradcurve:sidebar-width',dragW);resizeCleanup.current=null;}
    resizeCleanup.current=stop;
    window.addEventListener('pointermove',move);
    window.addEventListener('pointerup',stop);
  }
  var done=lessonIds.filter(function(id){return visited[id];}).length;
  var total=lessonIds.length;
  var bookmarkItems=(bookmarks||[]).map(function(id){return NAV.find(function(l){return l.id===id;});}).filter(Boolean);
  return(
    <div style={{width:sidebarW,minWidth:sidebarW,background:'#0f172a',color:'#cbd5e1',display:'flex',flexDirection:'column',height:'100%',overflowY:'auto',flexShrink:0,position:isMobile?'fixed':'relative',inset:isMobile?0:'auto',zIndex:isMobile?21:'auto',fontSize:21}}>
      {!isMobile&&<div role="separator" aria-orientation="vertical" aria-label="Resize navigation panel" tabIndex="0" title="Drag to resize sidebar"
        onPointerDown={startSidebarResize}
        onKeyDown={function(e){if(e.key==='ArrowLeft'){e.preventDefault();saveSidebarWidth(desktopW-16);}if(e.key==='ArrowRight'){e.preventDefault();saveSidebarWidth(desktopW+16);}}}
        style={{position:'absolute',top:0,right:0,bottom:0,width:10,cursor:'col-resize',zIndex:24,touchAction:'none'}}>
        <div style={{position:'absolute',top:0,bottom:0,right:0,width:2,background:'#475569'}}/>
      </div>}
      <div style={{padding:'24px 20px 18px',borderBottom:'1px solid #1e293b'}}>
        <div style={{fontWeight:800,color:'white',fontSize:28,letterSpacing:'-0.02em'}}>GradCurve</div>
        <div style={{fontSize:18,color:'#64748b',marginTop:2}}>Powered by EnergyTypeNet</div>
        <div style={{fontSize:20,color:'#64748b',marginTop:4}}>{lessonCount} lessons · {demoCount} demos</div>
        {!isMobile&&<label style={{display:'block',fontSize:18,color:'#94a3b8',marginTop:12}}>
          <span style={{display:'flex',justifyContent:'space-between',gap:8}}><span>Panel width</span><strong>{desktopW}px</strong></span>
          <input type="range" aria-label="Sidebar width" min="280" max="520" step="8" value={desktopW} onChange={function(e){saveSidebarWidth(Number(e.target.value));}} style={{width:'100%',marginTop:5}}/>
        </label>}
        <div style={{marginTop:12,height:6,background:'#1e293b',borderRadius:3,overflow:'hidden'}}>
          <div style={{height:'100%',width:(done/total*100)+'%',background:'#3b82f6',borderRadius:3,transition:'width .4s'}}/>
        </div>
        <div style={{fontSize:19,color:'#64748b',marginTop:5}}>{done}/{total} lessons visited</div>
      </div>
      <div style={{padding:'12px 14px',borderBottom:'1px solid #1e293b'}}>
        <div style={{fontSize:18,fontWeight:800,color:'#fbbf24',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>Bookmarks</div>
        {bookmarkItems.length?bookmarkItems.map(function(l){
          return(
            <button key={l.id} onClick={function(){onSelect(l.id);}}
              style={{display:'block',width:'100%',textAlign:'left',border:'none',background:cur===l.id?'#1e3a8a':'transparent',color:cur===l.id?'white':'#bfdbfe',borderRadius:6,padding:'8px',fontSize:20,cursor:'pointer',fontFamily:'inherit',marginBottom:2}}>
              🔖 {l.label}
            </button>
          );
        }):(
          <div style={{fontSize:17,color:'#64748b',lineHeight:1.5}}>No bookmarks yet. Click 🔖 on any lesson.</div>
        )}
        {canUndoBookmark&&(
          <button onClick={onUndoBookmark}
            style={{marginTop:8,width:'100%',textAlign:'left',border:'1px solid #f59e0b',background:'#fffbeb',color:'#92400e',borderRadius:6,padding:'7px 8px',fontSize:17,fontWeight:800,cursor:'pointer',fontFamily:'inherit'}}>
            Undo bookmark change
          </button>
        )}
      </div>
      <nav style={{flex:1,padding:'12px 8px',display:'flex',flexDirection:'column',gap:12,overflowY:'auto'}}>
        {Object.entries(GINFO).map(function(entry){
          var gid=entry[0],gi=entry[1];
          var ls=grouped[gid]||[];
          if(!ls.length) return null;
          return(
            <div key={gid}>
              <div style={{fontSize:18,fontWeight:700,color:gi.c,padding:'0 10px 5px',textTransform:'uppercase',letterSpacing:'0.08em'}}>{gi.l}</div>
              {ls.map(function(l){
                var active=cur===l.id;
                var isDone=visited[l.id]&&!active;
                var hasNote=noteIds&&noteIds.indexOf(l.id)!==-1;
                return(
                  <button key={l.id} onClick={function(){onSelect(l.id);}}
                    style={{width:'100%',textAlign:'left',padding:'11px 12px',borderRadius:7,fontSize:21,border:'none',cursor:'pointer',marginBottom:2,background:active?'#2563eb':'transparent',color:active?'white':'#cbd5e1',fontWeight:active?700:400,fontFamily:'inherit',display:'flex',alignItems:'center',gap:8}}>
                    {isDone&&<span style={{fontSize:15,color:'#4ade80',flexShrink:0}}>●</span>}
                    {hasNote&&<span title="Saved note" style={{fontSize:18,flexShrink:0}}>📝</span>}
                    <span style={{flex:1}}>{l.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>
      <div style={{padding:'14px 20px',borderTop:'1px solid #1e293b',fontSize:18,color:'#64748b',lineHeight:1.6}}>
        {storageWarning&&<div style={{color:'#fbbf24',fontWeight:800,marginBottom:8}}>⚠ Storage unavailable</div>}
        <button onClick={onExport}
          style={{width:'100%',border:'1px solid #334155',background:'#1e293b',color:exportCopied?'#4ade80':'#cbd5e1',borderRadius:7,padding:'8px 10px',fontSize:17,fontWeight:800,cursor:'pointer',fontFamily:'inherit',marginBottom:10}}>
          {exportCopied?'✓ Copied!':'Export progress'}
        </button>
        <button onClick={onResetNotes}
          style={{width:'100%',border:'1px solid #7f1d1d',background:'#2b1111',color:'#fecaca',borderRadius:7,padding:'8px 10px',fontSize:17,fontWeight:800,cursor:'pointer',fontFamily:'inherit',marginBottom:10}}>
          Reset all notes
        </button>
        Built by Bartosz Bryg · Python 3.12 · scikit-learn · XGBoost · FastAPI · Streamlit · MLflow
        <a href="https://github.com/bartoszbryg/EnergyTypeNet" target="_blank" rel="noreferrer" title="GitHub repository"
          style={{display:'inline-flex',alignItems:'center',gap:5,color:'#93c5fd',fontWeight:700,marginLeft:6,textDecoration:'none'}}>
          <span aria-hidden="true">↗</span> GitHub
        </a>
      </div>
    </div>
  );
}

/* ── Home page ──────────────────────────────────────────────────── */
function HomePage({onSelect}){
  var gbg={overview:'#f1f5f9',start:'#ecfeff',data:'#eff6ff',features:'#eef2ff',models:'#f5f3ff',classical:'#fdf2f8',deeplearning:'#f5f3ff',training:'#fffbeb',eval:'#f0fdf4',xai:'#ecfdf5',ensembles:'#eef2ff',reliability:'#f0fdf4',prod:'#fff1f2',demos:'#fff7ed'};
  var gtc={overview:'#475569',start:'#155e75',data:'#1e40af',features:'#1d4ed8',models:'#5b21b6',classical:'#9d174d',deeplearning:'#6d28d9',training:'#92400e',eval:'#14532d',xai:'#047857',ensembles:'#3730a3',reliability:'#166534',prod:'#9f1239',demos:'#9a3412'};
  var stats=[
    ['30 Custom Models','From scratch in NumPy and PyTorch'],
    ['19 Notebooks','EDA through deep learning'],
    ['63-67%','Honest 2-feature accuracy ceiling'],
    ['Full Stack','API · Docker · MLflow · SHAP · CI'],
  ];
  var lessonCount=LESSON_NAV.length;
  return(
    <div>
      <h1 style={{fontSize:41,fontWeight:800,color:'#0f172a',marginBottom:12}}>GradCurve — ML Explained</h1>
      <div style={{background:'#fffbeb',border:'1px solid #fcd34d',borderLeft:'5px solid #f59e0b',borderRadius:8,padding:'18px 22px',marginBottom:22}}>
        <div style={{fontWeight:800,color:'#92400e',fontSize:20,marginBottom:8}}>🔬 What this project discovered</div>
        <ul style={{margin:'0 0 0 20px',padding:0,color:'#78350f',lineHeight:1.8,fontSize:18}}>
          <li>The accuracy ceiling is caused by class overlap, not sample size. More data won't help.</li>
          <li>The extended feature set produced near-perfect CV scores — a red flag, not a win. Those features encode the label.</li>
          <li>The custom AttentionClassifier, written entirely in NumPy, matches sklearn's LogisticRegression CV score.</li>
        </ul>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,margin:'22px 0 16px'}}>
        {stats.map(function(s){
          return(
            <div key={s[0]} style={{background:'white',border:'1px solid #e2e8f0',borderRadius:8,padding:'16px 18px'}}>
              <div style={{fontSize:27,fontWeight:800,color:'#0f172a',lineHeight:1.1}}>{s[0]}</div>
              <div style={{fontSize:16,color:'#64748b',marginTop:5}}>{s[1]}</div>
            </div>
          );
        })}
      </div>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:28}}>
        <button onClick={function(){onSelect('dataset');}}
          style={{background:'#2563eb',color:'white',border:'1px solid #2563eb',borderRadius:8,padding:'11px 16px',fontSize:18,fontWeight:800,cursor:'pointer',fontFamily:'inherit'}}>
          Start from scratch → Dataset
        </button>
        <button onClick={function(){onSelect('predictor');}}
          style={{background:'white',color:'#2563eb',border:'1px solid #2563eb',borderRadius:8,padding:'11px 16px',fontSize:18,fontWeight:800,cursor:'pointer',fontFamily:'inherit'}}>
          Jump to demos → Live Predictor
        </button>
      </div>
      <p style={{fontSize:20,color:'#64748b',marginBottom:10,lineHeight:1.8}}>
        Follow the core EnergyTypeNet classifier journey from CSV ingestion through custom NumPy models, sklearn comparisons, cross-validation, and honest evaluation.
      </p>
      <p style={{fontSize:20,color:'#64748b',marginBottom:10,lineHeight:1.8}}>
        Then follow the production story: FastAPI, Docker, MLflow, Streamlit, SHAP/LIME explainability, data validation, model cards, AutoML, and multi-provider LLM streaming.
      </p>
      <p style={{fontSize:19,color:'#64748b',marginBottom:28,lineHeight:1.8}}>
        Each lesson includes a <span style={{background:'#f0fdf4',color:'#14532d',padding:'2px 8px',borderRadius:5,fontWeight:600}}>🎯 Try it on Streamlit</span> box telling you exactly what to click on the dashboard.
        Run <code style={{background:'#f1f5f9',padding:'1px 6px',borderRadius:4,fontSize:18}}>streamlit run dashboard.py</code> in your terminal to follow along, or open the live app at <a href="https://energytypenet-ml.streamlit.app/" target="_blank" rel="noreferrer" style={{color:'#2563eb',fontWeight:700}}>energytypenet-ml.streamlit.app</a>.
      </p>
      <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:12,padding:'18px 22px',marginBottom:28,fontSize:18,color:'#475569'}}>
        <strong style={{color:'#1e293b'}}>Example datasets to upload in the dashboard:</strong>
        <ul style={{margin:'10px 0 0 20px',lineHeight:2.1}}>
          <li><code style={{background:'#f1f5f9',padding:'1px 6px',borderRadius:4}}>data/train_energy_data.csv</code> — 1 000 buildings, 7 columns (use in all three modes)</li>
          <li><code style={{background:'#f1f5f9',padding:'1px 6px',borderRadius:4}}>data/test_energy_data.csv</code> — 100 buildings (upload as Custom Dataset to see test-set metrics)</li>
          <li><code style={{background:'#f1f5f9',padding:'1px 6px',borderRadius:4}}>data/sample_building_operations.csv</code> — small sample, great for the AutoML assistant</li>
        </ul>
      </div>
      <h2 style={{fontSize:25,fontWeight:700,marginBottom:16,color:'#1e293b',borderBottom:'1px solid #e2e8f0',paddingBottom:8}}>{lessonCount} lessons · 5 interactive demos</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:12}}>
        {NAV.filter(function(l){return l.id!=='home';}).map(function(l){
          return(
            <button key={l.id} onClick={function(){onSelect(l.id);}}
              style={{textAlign:'left',padding:'16px 18px',borderRadius:12,border:'1px solid transparent',background:gbg[l.g]||'#f8fafc',cursor:'pointer',transition:'opacity .15s'}}
              onMouseEnter={function(e){e.currentTarget.style.opacity='.75';}}
              onMouseLeave={function(e){e.currentTarget.style.opacity='1';}}>
              <div style={{fontWeight:700,fontSize:18,color:gtc[l.g]||'#475569'}}>{l.label}</div>
              <div style={{fontSize:16,color:'#94a3b8',marginTop:3}}>{(GINFO[l.g]||{l:''}).l}</div>
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
  var [bookmarks,setBookmarks]=useState([]);
  var [noteIds,setNoteIds]=useState([]);
  var [examScore,setExamScore]=useState(null);
  var [storageWarning,setStorageWarning]=useState(false);
  var [exportCopied,setExportCopied]=useState(false);
  var [sidebarVisible,setSidebarVisible]=useState(function(){return !(window.innerWidth<768);});
  var [bookmarkUndo,setBookmarkUndo]=useState(null);
  var exportTimer=useRef(null);
  useEffect(function(){return function(){if(exportTimer.current)clearTimeout(exportTimer.current);};},[]);

  function handleStorageError(){
    setStorageWarning(true);
  }

  /* Derive accessible names for legacy sliders from their visible labels. */
  useEffect(function(){
    var ranges=document.querySelectorAll('input[type="range"]');
    ranges.forEach(function(input){
      if(input.getAttribute('aria-label')) return;
      var label=input.closest('label');
      var text=label?label.textContent.replace(/\s+/g,' ').trim():'Interactive value';
      input.setAttribute('aria-label',text||'Interactive value');
    });
    document.querySelectorAll('svg').forEach(function(svg){
      if(!svg.getAttribute('viewBox')){
        var width=parseFloat(svg.getAttribute('width'))||300;
        var height=parseFloat(svg.getAttribute('height'))||200;
        svg.setAttribute('viewBox','0 0 '+width+' '+height);
      }
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      svg.style.width='100%';
      svg.style.height='auto';
    });
  },[cur]);

  function saveVisited(next){
    var list=Object.keys(next).filter(function(id){return next[id];});
    storageWrite('lessons_visited',list,null,handleStorageError);
  }

  function markVisited(id){
    if(id==='home') return;
    setVisited(function(v){
      var next=Object.assign({},v);
      next[id]=true;
      saveVisited(next);
      return next;
    });
  }

  useEffect(function(){
    storageRead('bookmarks',[],function(value){setBookmarks(Array.isArray(value)?value:[]);},handleStorageError);
    storageRead('notes:index',[],function(value){setNoteIds(Array.isArray(value)?value:[]);},handleStorageError);
    storageRead('exam_score',null,function(value){setExamScore(value||null);},handleStorageError);
    storageRead('lessons_visited',[],function(value){
      var next={};
      if(Array.isArray(value)) value.forEach(function(id){next[id]=true;});
      var currentId=hashToId();
      if(currentId!=='home') next[currentId]=true;
      setVisited(next);
      saveVisited(next);
    },handleStorageError);
  },[]);

  /* sync hash → state when user hits back/forward */
  useEffect(function(){
    function onHashChange(){
      var id=hashToId();
      setCur(id);
      markVisited(id);
    }
    window.addEventListener('hashchange', onHashChange);
    return function(){ window.removeEventListener('hashchange', onHashChange); };
  },[]);

  var handleSelect=useCallback(function(id){
    window.location.hash = id === 'home' ? '' : '/' + id;
    setCur(id);
    markVisited(id);
    if(window.innerWidth<768) setSidebarVisible(false);
  },[]);

  function toggleBookmark(id){
    setBookmarks(function(current){
      var previous=current.slice();
      var next=current.indexOf(id)===-1?current.concat([id]):current.filter(function(x){return x!==id;});
      storageWrite('bookmarks',next,function(){setBookmarkUndo(previous);},handleStorageError);
      return next;
    });
  }

  function undoBookmarkChange(){
    if(!bookmarkUndo) return;
    var restored=bookmarkUndo.slice();
    storageWrite('bookmarks',restored,function(){
      setBookmarks(restored);
      setBookmarkUndo(null);
    },handleStorageError);
  }

  function resetAllNotes(){
    storageRead('notes:keys',[],function(keys){
      if(!Array.isArray(keys)) keys=[];
      var known=keys.slice();
      try{
        if(window.localStorage){
          for(var i=0;i<window.localStorage.length;i++){
            var k=window.localStorage.key(i);
            if(k&&k.indexOf('note:')===0&&known.indexOf(k)===-1) known.push(k);
          }
        }
      }catch(e){handleStorageError();}
      known.forEach(function(k){storageRemove(k,null,handleStorageError);});
      storageWrite('notes:index',[],function(){setNoteIds([]);},handleStorageError);
      storageWrite('notes:keys',[],null,handleStorageError);
    },handleStorageError);
  }

  function exportProgress(){
    var lessonIds=LESSON_NAV.map(function(l){return l.id;});
    var visitedList=lessonIds.filter(function(id){return visited[id];});
    var data={
      exported_at:new Date().toISOString(),
      lessons_visited:visitedList,
      lessons_with_notes:noteIds.slice(),
      bookmarks:bookmarks.slice(),
      exam_score:examScore||null,
      completion_pct:Math.round(visitedList.length/lessonIds.length*100)
    };
    try{
      var text=JSON.stringify(data,null,2);
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){
          setExportCopied(true);
          if(exportTimer.current)clearTimeout(exportTimer.current);
          exportTimer.current=setTimeout(function(){setExportCopied(false);exportTimer.current=null;},2000);
        }).catch(function(){
          setExportCopied(false);
        });
      }
    }catch(e){
      setExportCopied(false);
    }
  }

  var navIdx=NAV.findIndex(function(l){return l.id===cur;});
  var isLessonPage=cur!=='home'&&cur!=='predictor'&&cur!=='gd'&&cur!=='heatmap'&&cur!=='boundary'&&cur!=='exam';

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
  else if(cur==='exam')    content=<FinalExam onExamScore={setExamScore} onStorageError={handleStorageError}/>;
  else if(cur==='glossary')content=(
    <GlossaryPage
      lessonId={cur}
      isBookmarked={bookmarks.indexOf(cur)!==-1}
      onToggleBookmark={function(){toggleBookmark(cur);}}
      onNoteSaved={setNoteIds}
      onStorageError={handleStorageError}
      storageWarning={storageWarning}
    />
  );
  else {
    var idx=LESSON_IDX[cur];
    content=idx!==undefined?(
      <LessonPage
        idx={idx}
        lessonId={cur}
        isBookmarked={bookmarks.indexOf(cur)!==-1}
        onToggleBookmark={function(){toggleBookmark(cur);}}
        onNoteSaved={setNoteIds}
        onStorageError={handleStorageError}
        storageWarning={storageWarning}
      />
    ):(
      <div style={{background:'white',border:'1px solid #e2e8f0',borderRadius:10,padding:'24px 26px',color:'#475569',lineHeight:1.8}}>
        <div style={{fontSize:25,fontWeight:800,color:'#1e293b',marginBottom:6}}>Coming soon</div>
        This lesson is coming soon. In the meantime, explore the existing lessons from the sidebar.
      </div>
    );
  }

  return(
    <div style={{display:'flex',height:'100%',width:'100%',overflow:'hidden'}}>
      {sidebarVisible&&window.innerWidth<768&&(
        <div onClick={function(){setSidebarVisible(false);}} aria-hidden="true"
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:19}}/>
      )}
      {sidebarVisible&&(
        <Sidebar
          cur={cur}
          onSelect={handleSelect}
          visited={visited}
          bookmarks={bookmarks}
          noteIds={noteIds}
          onUndoBookmark={undoBookmarkChange}
          canUndoBookmark={!!bookmarkUndo}
          onResetNotes={resetAllNotes}
          onExport={exportProgress}
          exportCopied={exportCopied}
          storageWarning={storageWarning}
        />
      )}
      <main style={{flex:1,overflowY:'auto',background:'#f8fafc'}}>
        <button type="button" title="Toggle sidebar" aria-label="Toggle sidebar" onClick={function(){setSidebarVisible(!sidebarVisible);}}
          style={{position:'sticky',top:12,left:12,zIndex:30,margin:12,border:'1px solid #cbd5e1',background:'white',color:'#0f172a',borderRadius:8,padding:'8px 11px',fontSize:21,fontWeight:800,cursor:'pointer',boxShadow:'0 1px 4px rgba(15,23,42,.12)'}}>
          ☰
        </button>
        <div style={{padding:window.innerWidth<768?'24px 18px 70px':'48px 64px 80px',minHeight:'calc(100dvh - 64px)',display:'flex',flexDirection:'column'}}>
          {content}
          <div style={{marginTop:'auto',paddingTop:20,borderTop:'1px solid #e2e8f0',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:18,fontSize:17,color:'#94a3b8',flexWrap:'wrap'}}>
            <div>
              <span>GradCurve · ML Education Platform · <a href="https://github.com/bartoszbryg/EnergyTypeNet" target="_blank" rel="noreferrer" style={{color:'#2563eb',fontWeight:700}}>bartoszbryg/EnergyTypeNet</a></span>
              {isLessonPage&&(
                <button onClick={function(){handleSelect('home');}} style={{display:'block',marginTop:8,color:'#3b82f6',background:'none',border:'none',cursor:'pointer',fontSize:17,fontFamily:'inherit',padding:0}}>
                  Back to Home
                </button>
              )}
            </div>
            <div>
              <div style={{display:'flex',flexDirection:window.innerWidth<600?'column':'row',alignItems:window.innerWidth<600?'flex-start':'flex-end',gap:8,justifyContent:'flex-end',flexWrap:'wrap'}}>
              {navIdx>0&&(
                <button onClick={function(){handleSelect(NAV[navIdx-1].id);}}
                  style={{color:'#3b82f6',background:'none',border:'none',cursor:'pointer',fontSize:17,fontFamily:'inherit'}}>
                  ← {shortLabel(NAV[navIdx-1].label)}
                </button>
              )}
              {navIdx<NAV.length-1&&(
                <button onClick={function(){handleSelect(NAV[navIdx+1].id);}}
                  style={{color:'#3b82f6',background:'none',border:'none',cursor:'pointer',fontSize:17,fontFamily:'inherit'}}>
                  {shortLabel(NAV[navIdx+1].label)} →
                </button>
              )}
              </div>
              <div style={{fontSize:15,color:'#94a3b8',textAlign:'right',marginTop:6}}>← → arrow keys to navigate</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

ReactDOM.render(React.createElement(App), document.getElementById('root'));
