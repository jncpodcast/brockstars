const account=window.brockAccount,content=document.querySelector('#account-content'),status=document.querySelector('#account-status');
const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hashParams=new URLSearchParams(location.hash.slice(1)),queryParams=new URLSearchParams(location.search);
function validCheckin(c){return c&&/^[a-f0-9-]{36}$/.test(c.showId)&&/^[a-f0-9-]{36}$/.test(c.code)?c:null;}
let savedCheckin;try{savedCheckin=JSON.parse(localStorage.getItem('brock-show-checkin')||'null');}catch{}
const checkin=validCheckin({showId:hashParams.get('show')||queryParams.get('show'),code:hashParams.get('code')||queryParams.get('code')})||validCheckin(savedCheckin);
function resumeShow(){if(!checkin)return;const url=new URL('live.html',location.href);url.hash='checkin?show='+encodeURIComponent(checkin.showId)+'&code='+encodeURIComponent(checkin.code);location.replace(url.href);}
function loginForm(){content.innerHTML='<form id="account-login"><label for="account-email">Your email address</label><input id="account-email" type="email" autocomplete="email" required maxlength="254"><button class="button dark">Email me a sign-in link</button></form><p>Join or sign in with your email. No password to remember.</p>';}
async function showAccount(){
 const {member}=await account.api('/api/me');status.textContent='Signed in as '+member.email;
 content.innerHTML=`<form id="account-profile"><label for="account-name">Display name</label><input id="account-name" value="${safe(member.name)}" maxlength="60" required><label class="email-optin"><input id="account-updates" type="checkbox" ${member.emailUpdates?'checked':''}><span>Email me show news and updates</span></label><button class="button dark">Save profile</button></form>${member.role==='owner'?'<p><a class="button dark" href="live.html">Open live show dashboard ↗</a></p><p><a class="button outline" href="performer.html">Open Performer ↗</a></p><p><a class="button dark" href="news-admin.html">Write / manage news ↗</a></p><p><a class="button dark" href="perks-admin.html">Manage venue perks ↗</a></p><p><a class="button dark" href="quests-admin.html">Manage Side Quests ↗</a></p><h2>MEMBER ACCESS.</h2><form id="account-invite"><label for="invite-email">Member email</label><input id="invite-email" type="email" required><button class="button dark">Allow access</button></form><p>Signup is open to everyone. Use this to restore access for a member you previously blocked.</p>':'<p>Joining includes a one-time 250-point bonus. Scan the show QR to enter and earn another 100 points. Your browser remembers your sign-in.</p><p><a class="button dark" href="live.html">Open the live show ↗</a></p>'}<p><a class="button outline" href="perks.html">Venue perks →</a></p><p><a class="button outline" href="quests.html">Side Quests →</a></p><p><button class="button outline" id="account-logout">Sign out</button></p>`;
}
document.addEventListener('submit',async e=>{
 const f=e.target;if(!['account-login','account-profile','account-invite'].includes(f.id))return;e.preventDefault();const b=f.querySelector('button');b.disabled=true;
 try{
  if(f.id==='account-login'){const r=await account.api('/api/auth/start',{email:document.querySelector('#account-email').value,...(checkin?{checkin}:{})});status.textContent=r.message;}
  if(f.id==='account-profile'){await account.api('/api/me',{name:document.querySelector('#account-name').value,emailUpdates:document.querySelector('#account-updates').checked},'PATCH');status.textContent='Profile saved online.';}
  if(f.id==='account-invite'){await account.api('/api/invites',{email:document.querySelector('#invite-email').value});status.textContent='Member access saved. They can sign in with their email.';f.reset();}
 }catch(error){status.textContent=error.name==='AbortError'?'Connection timed out. Please try again.':error.message;}finally{b.disabled=false;}
});
document.addEventListener('click',async e=>{const b=e.target.closest('[data-member-email]');if(b){b.disabled=true;try{await account.api('/api/invites',{email:b.dataset.memberEmail,revoked:b.dataset.block==='true'});await showAccount();}catch(error){status.textContent=error.message;b.disabled=false;}return;}if(e.target.id!=='account-logout')return;try{await account.api('/api/auth/logout',{});account.token='';loginForm();status.textContent='Signed out.';}catch(error){status.textContent=error.message;}});
(async()=>{
 const candidate=hashParams.get('login'),token=/^[a-f0-9]{64}$/.test(candidate||'')?candidate:null;if(token||queryParams.has('code'))history.replaceState(null,'',location.pathname);
 if(!account.origin){status.textContent='Online accounts are being connected. Your existing songs and sets have not been changed.';return;}
 try{
  if(token){const r=await account.api('/api/auth/verify',{token});account.token=r.token;}
  if(account.token){await showAccount();resumeShow();}else{loginForm();status.textContent='Join or sign in to The Brock Stars.';}
 }catch(error){if(token&&account.token){try{await showAccount();resumeShow();return;}catch{}}status.textContent=error.message;loginForm();}
})();
