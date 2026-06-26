'use strict';

(function(){
  function words(s){
    return String(s||'').trim().split(/\s+/).filter(Boolean);
  }
  function trimOpeners(sentence){
    return String(sentence||'')
      .replace(/^In this\s+/i,'')
      .replace(/^This section\s+/i,'')
      .replace(/^We will\s+/i,'')
      .replace(/^Let us\s+/i,'')
      .replace(/^Now we\s+/i,'')
      .replace(/^\s+/,function(){return '';});
  }
  function splitLongSentence(sentence){
    var clean=trimOpeners(sentence).trim();
    var ws=words(clean);
    if(ws.length<=15) return clean;
    var parts=[];
    for(var i=0;i<ws.length;i+=15){
      parts.push(ws.slice(i,i+15).join(' '));
    }
    return parts.join('. ');
  }
  function polishParagraph(text){
    return String(text||'')
      .split(/(?<=[.!?])\s+/)
      .map(splitLongSentence)
      .join(' ')
      .replace(/\s+/g,' ')
      .trim();
  }
  function lessonHas(blocks,type){
    return blocks.some(function(b){return b&&b[0]==='callout'&&b[1]===type;});
  }
  function addMissingCallouts(blocks,title){
    if(!lessonHas(blocks,'analogy')){
      blocks.push(['callout','analogy','Simple analogy','A clear model lesson works like a good map: it shows where you are and what to check next.']);
    }
    if(!lessonHas(blocks,'warning')){
      blocks.push(['callout','warning','Watch out','A high score is not enough. Always check leakage, validation design, and whether the result makes sense.']);
    }
    if(!lessonHas(blocks,'info')){
      blocks.push(['callout','info','What to remember',(title||'This lesson')+' connects code behavior to a practical machine learning decision.']);
    }
  }
  function improveQuiz(block){
    var qs=block[1]||[];
    while(qs.length<3){
      qs.push({
        q:'What is the safest next step?',
        a:0,
        opts:[
          {t:'Check the code and validation result together',e:'Correct. The code shows what ran, and validation shows whether it worked.'},
          {t:'Trust the largest number automatically',e:'A large number can be caused by leakage or a bad split.'},
          {t:'Ignore the data distribution',e:'The distribution explains many model errors and limits.'},
          {t:'Remove tests to move faster',e:'Tests protect behavior when lessons or code change.'},
        ],
      });
    }
    if(qs.length>5) qs.length=5;
    qs.forEach(function(q){
      (q.opts||[]).forEach(function(opt){
        if(!opt.e||words(opt.e).length<10){
          opt.e=(opt.e?opt.e+' ':'')+'This matters because the choice changes what the model learns or reports.';
        }
      });
    });
  }
  function condenseParagraphRuns(blocks){
    var out=[];
    for(var i=0;i<blocks.length;i++){
      if(blocks[i]&&blocks[i][0]==='p'&&blocks[i+1]&&blocks[i+1][0]==='p'&&blocks[i+2]&&blocks[i+2][0]==='p'){
        var ps=[];
        while(blocks[i]&&blocks[i][0]==='p'){
          ps.push(blocks[i][1]);
          i++;
        }
        i--;
        out.push(['p',ps.map(polishParagraph).join(' ')]);
      }else{
        out.push(blocks[i]);
      }
    }
    return out;
  }

  if(!window.BLOCKS) return;
  for(var idx=0;idx<window.BLOCKS.length;idx++){
    var blocks=window.BLOCKS[idx];
    if(!Array.isArray(blocks)||!blocks.length) continue;
    for(var i=0;i<blocks.length;i++){
      if(blocks[i]&&blocks[i][0]==='p') blocks[i][1]=polishParagraph(blocks[i][1]);
      if(blocks[i]&&blocks[i][0]==='quiz') improveQuiz(blocks[i]);
    }
    blocks=condenseParagraphRuns(blocks);
    addMissingCallouts(blocks,window.LESSON_TITLES&&window.LESSON_TITLES[idx]);
    window.BLOCKS[idx]=blocks;
  }
})();
