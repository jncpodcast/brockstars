/* Activated only when backend-config.js has a verified API origin. */
if(window.brockAccount?.origin){
 window.cloudMusic={ready:false,revision:null,busy:false};
 const oldRender=render;
 render=function(){
  if(!cloudMusic.ready){document.querySelector('#app').innerHTML='<section class="page-intro"><h1>YOUR BACKSTAGE PASS.</h1><p id="cloud-status" role="status">Connecting to your saved library…</p><a class="button dark" href="accounts.html">Sign in / manage account ↗</a></section>';return;}
  if(location.hash!=='#setlists')location.hash='setlists';oldRender();
  document.querySelectorAll('[data-show-qr],#reset,.demo-banner,.admin-link,.performer-game-nav,header nav').forEach(el=>el.hidden=true);
  const top=document.querySelector('.stage-top');if(top){top.querySelector('.eyebrow').textContent='YOUR SAVED MUSIC';top.querySelector('h1').textContent='SONGS & QUICK SETS.';}
  const notices=document.querySelectorAll('.planner > .notice');for(const el of notices)el.hidden=true;
  const now=document.querySelector('.now-playing > span');if(now)now.textContent='NEXT SONG';
  const intro=document.createElement('div');intro.className='notice';intro.textContent='Saved online · Revision '+cloudMusic.revision+'. Open the live show dashboard for requests and games.';const link=document.createElement('a');link.href='live.html';link.className='button dark';link.textContent='Open live show dashboard ↗';intro.append(' ',link);document.querySelector('.planner-layout')?.before(intro);
 };
 plannerChange=async function(action,data={}){
  if(!cloudMusic.ready||cloudMusic.busy)return false;cloudMusic.busy=true;
  const previous=JSON.parse(JSON.stringify(state.planning));
  try{
   applyLocalPlan(state.planning,action,data);
   const result=await brockAccount.api('/api/music',{revision:cloudMusic.revision,planning:state.planning},'PUT');cloudMusic.revision=result.revision;save();render();toast('Saved online.');return true;
  }catch(error){state.planning=previous;render();toast(error.message);return false;}finally{cloudMusic.busy=false;}
 };
 launchTrivia=async id=>{try{const show=await brockAccount.api('/api/show');if(!show.show||show.show.status!=='open')return toast('Create an open show from the live dashboard first.');await brockAccount.api('/api/show/action',{actionId:crypto.randomUUID(),action:'launch-trivia',data:{showId:show.show.id,questionId:id}});location.href='live.html';}catch(error){toast(error.message);}};

 render();
 (async()=>{try{
  const {member}=await brockAccount.api('/api/me');if(member.role!=='owner'){location.href='accounts.html';return;}
  const bank=await brockAccount.api('/api/show/questions');for(const q of bank.questions){const i=triviaPresets.findIndex(x=>x.id===q.id);if(i<0)triviaPresets.push(q);else triviaPresets[i]=q;}const result=await brockAccount.api('/api/music');state.planning=result.planning;cloudMusic.revision=result.revision;cloudMusic.ready=true;ensurePlanner();render();
 }catch(error){document.querySelector('#cloud-status').textContent=error.message;}})();
}
