/* One-tap live controls beside the performer's saved songs. */
if(window.brockAccount?.origin){
 let showData=null,busy=false,loading=false,error='',filter='',offset=0,pending=null;
 try{pending=JSON.parse(localStorage.getItem('brock-performer-action')||'null');}catch{}
 const html=escapeHTML;
 function paint(){
  let root=document.querySelector('#performer-live-controls');
  if(!root){const cue=document.querySelector('.now-playing');if(!cue)return;root=document.createElement('section');root.id='performer-live-controls';cue.after(root);}
  const show=showData?.show,open=show?.status==='open',round=show?.round;
  const song=state.planning?.songs.find(s=>s.id===state.planning.nowPlaying);
  const priorityBank=triviaPresets.some(q=>q.priority==='quick-set');
  const prepared=priorityBank?triviaPresets.filter(q=>q.priority==='quick-set'||(state.planning?.questions||[]).some(saved=>saved.id===q.id)):triviaPresets;
  const questions=prepared.filter(q=>song?.triviaIds?.includes(q.id));
  const disabled=!open||busy||!!pending;
  const launch=q=>`<button data-perform="launch-trivia" data-id="${html(q.id)}" ${disabled||round?.status==='live'?'disabled':''}>▶ ${html(q.label)}</button>`;
  const focus=document.activeElement?.id,start=document.activeElement?.selectionStart;
  root.innerHTML=`<div class="perform-live-heading"><h2>LIVE SHOW CONTROLS</h2><strong role="status">${busy?'SENDING…':error?html(error):open?html(show.title):'No open show'}</strong></div>${open?'<div class="perform-requests">'+show.requests.filter(r=>['queued','accepted'].includes(r.status)).map(r=>`<article class="perform-round"><strong>★ ${r.type==='priority'?'SONG REQUEST':'SHOUTOUT'} · ${html(r.fan)}</strong><p>${html(r.detail)}${r.note?'<br>'+html(r.note):''}</p><button data-perform="request-status" data-id="${html(r.id)}" data-status="${r.status==='queued'?'accepted':'done'}" ${disabled?'disabled':''}>${r.status==='queued'?'ACCEPT ✓':'DONE →'}</button><button data-perform="request-status" data-id="${html(r.id)}" data-status="declined" ${disabled?'disabled':''}>DECLINE & REFUND</button></article>`).join('')+'</div>':''}${!open?'<p>Open a show in the live dashboard to enable these buttons.</p>':''}${pending?'<p>Action awaiting confirmation. <button data-perform="retry">Retry safely</button></p>':''}${round?.status==='live'?`<div class="perform-round"><strong>LIVE: ${html(round.question)}</strong><span data-perform-countdown></span><button data-perform="reveal-trivia" ${disabled?'disabled':''}>REVEAL ANSWER</button></div>`:''}<h3>TRIVIA FOR ${html(song?.title||'YOUR NEXT SONG')}</h3><div class="perform-buttons">${questions.map(launch).join('')||'<p>No prepared questions for this song yet. Use the saved bank below.</p>'}</div><details id="perform-bank"><summary>Quick Set trivia · ${prepared.length} questions</summary><label for="perform-search">Find a prepared question</label><input id="perform-search" type="search" value="${html(filter)}" placeholder="Song or question"><div class="perform-buttons">${prepared.filter(q=>(q.label+' '+q.question).toLowerCase().includes(filter.toLowerCase())).map(launch).join('')}</div></details><h3>BINGO · TAP WHAT JUST HAPPENED</h3><div class="perform-buttons">${(showData?.moments||[]).map(m=>`<button data-perform="call-bingo" data-id="${html(m.id)}" ${disabled||show?.bingo.called.includes(m.id)?'disabled':''}>${show?.bingo.called.includes(m.id)?'✓':'+'} ${html(m.label)}</button>`).join('')}</div>${show?.bingo.winners.length?'<p class="perform-round">★ BINGO: '+show.bingo.winners.map(html).join(', ')+'</p>':''}`;
  if(paint.bankOpen)root.querySelector('details').open=true;
  if(focus==='perform-search'){const input=root.querySelector('#perform-search');input.focus();input.setSelectionRange(start,start);}
 }
 const previousRender=render;render=function(){previousRender();if(cloudMusic.ready)paint();};
 async function refresh(){if(loading||busy||document.hidden||!cloudMusic.ready)return;loading=true;try{const next=await brockAccount.api('/api/show');if(!showData||next.revision>=showData.revision){showData=next;offset=next.serverTime-Date.now();error='';paint();}}catch(e){error='Connection lost · reconnecting';paint();}finally{loading=false;}}
 async function send(action,id,retry=false,extra={}){
  if(busy)return;if(pending&&!retry)return toast('Retry the pending action first.');
  if(!retry){if(showData?.show?.status!=='open')return toast('Open a show first.');pending={actionId:crypto.randomUUID(),action,data:{showId:showData.show.id,...(action==='launch-trivia'?{questionId:id}:action==='call-bingo'?{moment:id}:action==='request-status'?{requestId:id,status:extra.status}:{roundId:showData.show.round?.id})},memberId:showData.memberId};}
  if(pending.memberId!==showData?.memberId){pending=null;localStorage.removeItem('brock-performer-action');return toast('Account changed. Check show status before continuing.');}
  // Persist the action ID and member ID for safe retries after a timeout.
  const request={actionId:pending.actionId,action:pending.action,data:pending.data};
  localStorage.setItem('brock-performer-action',JSON.stringify({...request,memberId:pending.memberId}));busy=true;paint();
  try{const next=await brockAccount.api('/api/show/action',request);showData=next;offset=next.serverTime-Date.now();pending=null;localStorage.removeItem('brock-performer-action');error='';toast(action==='call-bingo'?'Bingo moment called.':'Live show updated.');}
  catch(e){if(e.status){pending=null;localStorage.removeItem('brock-performer-action');}error=e.message;toast(e.name==='AbortError'?'Awaiting confirmation. Retry safely.':e.message);}
  finally{busy=false;paint();}
 }
 launchTrivia=id=>send('launch-trivia',id);
 document.addEventListener('click',e=>{const b=e.target.closest('[data-perform]');if(b&&!b.disabled)send(b.dataset.perform,b.dataset.id,b.dataset.perform==='retry',{status:b.dataset.status});});
 document.addEventListener('input',e=>{if(e.target.id==='perform-search'){filter=e.target.value;paint.bankOpen=true;paint();}});
 document.addEventListener('toggle',e=>{if(e.target.id==='perform-bank')paint.bankOpen=e.target.open;},true);
 setInterval(refresh,3000);window.addEventListener('online',refresh);document.addEventListener('visibilitychange',refresh);
 setInterval(()=>{const el=document.querySelector('[data-perform-countdown]');if(el&&showData)el.textContent=Math.max(0,Math.ceil((showData.show.round.endsAt-Date.now()-offset)/1000))+'s';},250);
 refresh();
}
