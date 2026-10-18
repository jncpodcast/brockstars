const account=window.brockAccount,content=document.querySelector('#account-content'),status=document.querySelector('#account-status');
const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function loginForm(){content.innerHTML='<form id="account-login"><label for="account-email">Your invited email address</label><input id="account-email" type="email" autocomplete="email" required maxlength="254"><button class="button dark">Email me a sign-in link</button></form><p>Invite-only while we test with friends and family. No password to remember.</p>';}
async function showAccount(){
 const {member}=await account.api('/api/me');status.textContent='Signed in as '+member.email;
 content.innerHTML=`<form id="account-profile"><label for="account-name">Display name</label><input id="account-name" value="${safe(member.name)}" maxlength="60" required><label class="email-optin"><input id="account-updates" type="checkbox" ${member.emailUpdates?'checked':''}><span>Email me show news and updates</span></label><button class="button dark">Save profile</button></form>${member.role==='owner'?'<p><a class="button dark" href="live.html">Open live show dashboard ↗</a></p><p><a class="button outline" href="./#setlists">Open your songs & Quick Sets ↗</a></p><h2>INVITE YOUR CREW.</h2><form id="account-invite"><label for="invite-email">Friend or family email</label><input id="invite-email" type="email" required><button class="button dark">Allow beta access</button></form><p>This adds them to the invitation list. They can then request a sign-in link here.</p>':'<p>Your beta account is ready. Scan the venue check-in QR, or open the current show below.</p><p><a class="button dark" href="live.html">Open the live show ↗</a></p>'}<p><button class="button outline" id="account-logout">Sign out</button></p>`;
}
document.addEventListener('submit',async e=>{
 const f=e.target;if(!['account-login','account-profile','account-invite'].includes(f.id))return;e.preventDefault();const b=f.querySelector('button');b.disabled=true;
 try{
  if(f.id==='account-login'){const r=await account.api('/api/auth/start',{email:document.querySelector('#account-email').value});status.textContent=r.message;}
  if(f.id==='account-profile'){await account.api('/api/me',{name:document.querySelector('#account-name').value,emailUpdates:document.querySelector('#account-updates').checked},'PATCH');status.textContent='Profile saved online.';}
  if(f.id==='account-invite'){await account.api('/api/invites',{email:document.querySelector('#invite-email').value});status.textContent='Invitation saved. They can request a sign-in link on this page.';f.reset();}
 }catch(error){status.textContent=error.name==='AbortError'?'Connection timed out. Please try again.':error.message;}finally{b.disabled=false;}
});
document.addEventListener('click',async e=>{if(e.target.id!=='account-logout')return;try{await account.api('/api/auth/logout',{});account.token='';loginForm();status.textContent='Signed out.';}catch(error){status.textContent=error.message;}});
(async()=>{
 const token=location.hash.match(/^#login=([a-f0-9]{64})$/)?.[1];if(token)history.replaceState(null,'',location.pathname+location.search);
 if(!account.origin){status.textContent='Online accounts are being connected. Your existing songs and sets have not been changed.';return;}
 try{
  if(token){const r=await account.api('/api/auth/verify',{token});account.token=r.token;}
  if(account.token)await showAccount();else{loginForm();status.textContent='Sign in to your beta account.';}
 }catch(error){status.textContent=error.message;loginForm();}
})();
