// Choose the lightweight experience before downloading or initializing WebGL.
const compact=matchMedia('(max-width:780px), (pointer:coarse)');
let flat=false;
function selectScene(){
 if(document.documentElement.dataset.motion!=='on')return;
 if(compact.matches){
  if(!flat){flat=true;document.documentElement.classList.add('flat-ready');import('./flat-scene.js?v=mobile-12').then(()=>document.dispatchEvent(new Event('portfolio-scene-ready')));}
 }else if(!flat)import('./world.js?v=world-7').then(()=>document.dispatchEvent(new Event('portfolio-scene-ready')));
}
selectScene();compact.addEventListener('change',selectScene);

new MutationObserver(selectScene).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
