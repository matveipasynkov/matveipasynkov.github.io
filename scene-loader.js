// Touch devices use the original SVG cinema from before the 3D scene.
const root=document.documentElement,compact=matchMedia('(max-width:780px), (pointer:coarse)');
let desktopScene;
function selectScene(){
 root.classList.toggle('legacy-mobile',compact.matches);
 if(compact.matches){root.classList.remove('webgl-ready');return;}
 if(root.dataset.motion!=='on')return;
 desktopScene ||= import('./world.js?v=legacy-14');
 desktopScene.then(()=>{
  if(!compact.matches)root.classList.add('webgl-ready');
  document.dispatchEvent(new Event('portfolio-scene-ready'));
 });
}
selectScene();compact.addEventListener('change',selectScene);
new MutationObserver(selectScene).observe(root,{attributes:true,attributeFilter:['data-motion']});
