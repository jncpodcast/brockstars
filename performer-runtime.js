/* Signed-in performer shell. Music is loaded from the owner API. */
let state={planning:null};const triviaPresets=[];
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const gameId=()=>crypto.randomUUID(),modal=document.querySelector('#modal');
function save(){} // The cloud save response is authoritative.
function render(){document.querySelector('#app').innerHTML=plannerPage();}
function openModal(html){document.querySelector('#modal-content').innerHTML=html;if(!modal.open)modal.showModal();}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.style.display='none',5000);}
modal.querySelector('.close').addEventListener('click',()=>modal.close());
let launchTrivia=()=>toast('Connecting to your show…');
if(!window.brockAccount?.origin)document.querySelector('#app').textContent='The online service is unavailable. Please try again later.';
