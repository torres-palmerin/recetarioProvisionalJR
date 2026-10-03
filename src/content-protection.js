export function setupContentProtection({isProtected,onHide,onShow}) {
 const active=()=>isProtected()
 const hide=()=>{if(active())onHide()}
 const show=()=>{if(active()&&!document.hidden)onShow()}
 const prevent=event=>{if(active())event.preventDefault()}
 const clearClipboard=()=>{try{navigator.clipboard?.writeText('')}catch{}}
 const visibilitychange=()=>document.hidden?hide():show()
 const keydown=event=>{
  if(!active())return
  const key=event.key.toLowerCase(),modifier=event.ctrlKey||event.metaKey
  if(event.key==='PrintScreen'){event.preventDefault();clearClipboard();hide();return}
  if(event.key==='F12'||(modifier&&['c','p','s','u'].includes(key))||(modifier&&event.shiftKey&&['i','j','c'].includes(key)))event.preventDefault()
 }
 document.addEventListener('contextmenu',prevent)
 document.addEventListener('copy',prevent)
 document.addEventListener('cut',prevent)
 document.addEventListener('paste',prevent)
 document.addEventListener('dragstart',prevent)
 document.addEventListener('selectstart',prevent)
 document.addEventListener('keydown',keydown)
 document.addEventListener('visibilitychange',visibilitychange)
 window.addEventListener('blur',hide)
 window.addEventListener('focus',show)
 return()=>{
  document.removeEventListener('contextmenu',prevent)
  document.removeEventListener('copy',prevent)
  document.removeEventListener('cut',prevent)
  document.removeEventListener('paste',prevent)
  document.removeEventListener('dragstart',prevent)
  document.removeEventListener('selectstart',prevent)
  document.removeEventListener('keydown',keydown)
    document.removeEventListener('visibilitychange',visibilitychange)
  window.removeEventListener('blur',hide)
  window.removeEventListener('focus',show)
 }
}
