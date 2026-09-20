// Choose the lightweight experience before downloading or initializing WebGL.
const compact=matchMedia('(max-width:780px), (pointer:coarse)');
let flat=false;
function selectScene(){
 if(compact.matches){
  if(!flat){flat=true;document.documentElement.classList.add('flat-ready');import('./flat-scene.js?v=7');}
 }else if(!flat)import('./world.js?v=world-7');
}
selectScene();compact.addEventListener('change',selectScene);
