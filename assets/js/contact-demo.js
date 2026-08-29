/* contact-demo.js — handler para formulario demo en contact.html (externo para CSP) */
document.addEventListener('DOMContentLoaded', function(){
  var form=document.getElementById('contactDemoForm');
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var s=document.getElementById('cMsg');
    if(s){ s.textContent='Gracias — este formulario es demo. Por ahora usa GitHub o email arriba.'; s.style.color='var(--color-blue-electric)'; }
    form.reset();
  });
});
