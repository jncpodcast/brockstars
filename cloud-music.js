/* Activated only when backend-config.js has a verified API origin. */
if(window.brockAccount?.origin){
 window.cloudMusic={ready:false,revision:null,busy:false};
 const oldRender=render;
 render=function(){
  if(!cloudMusic.ready){document.querySelector('#app').innerHTML='<section class="page-intro"><h1>YOUR BACKSTAGE PASS.</h1><p id="cloud-status" role="status">Connecting to your saved library…</p><a class="button dark" href="accounts.html">Sign in / manage account ↗</a></section>';return;}
  oldRender();
  const intro=document.createElement('p');intro.className='cloud-save-status';intro.textContent='✓ Saved online';document.querySelector('.stage-top')?.after(intro);
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
  const {member}=await brockAccount.api('/api/me');if(member.role!=='owner'){location.replace('live.html');return;}
  const bank=await brockAccount.api('/api/show/questions');for(const q of bank.questions){const i=triviaPresets.findIndex(x=>x.id===q.id);if(i<0)triviaPresets.push(q);else triviaPresets[i]=q;}const result=await brockAccount.api('/api/music');state.planning=result.planning;cloudMusic.revision=result.revision;cloudMusic.ready=true;ensurePlanner();render();
 }catch(error){const status=document.querySelector('#cloud-status');if(status)status.textContent=error.status===401?'Sign in with your performer account to continue.':error.message;}})();
}
