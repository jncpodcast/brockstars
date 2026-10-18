/* Shared email-login client. Only the public API origin is configured in the frontend. */
window.brockAccount={
 get origin(){return (window.BROCK_BACKEND?.apiOrigin||'').replace(/\/$/,'');},
 get token(){try{return localStorage.getItem('brock-account-token')||'';}catch{return '';}},
 set token(value){try{if(value)localStorage.setItem('brock-account-token',value);else localStorage.removeItem('brock-account-token');}catch{throw new Error('Enable site storage to stay signed in.');}},
 async api(path,body,method){
  if(!this.origin)throw new Error('Online accounts are being connected. Please check back shortly.');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
  try{
   const response=await fetch(this.origin+path,{method:method||(body?'POST':'GET'),headers:{...(body?{'Content-Type':'application/json'}:{}),...(this.token?{Authorization:'Bearer '+this.token}:{})},body:body?JSON.stringify(body):undefined,signal:controller.signal,cache:'no-store'});
   const data=await response.json();if(!response.ok){const error=new Error(data.error||'The service is unavailable.');error.status=response.status;throw error;}return data;
  }finally{clearTimeout(timer);}
 }
};
