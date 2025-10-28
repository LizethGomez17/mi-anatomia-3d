// app.js - Generador de cuerpo humano estilizado y educativo
let scene, camera, renderer, controls, raycaster, mouse;
const parts = { skeleton:[], muscles:[], organs:[], head:[] };

init();
animate();

function init(){
  // renderer
  renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setSize(window.innerWidth * 0.72, window.innerHeight * 0.82);
  renderer.setPixelRatio(window.devicePixelRatio);
  const mount = document.getElementById('canvas-wrap');
  mount.appendChild(renderer.domElement);

  // scene + camera
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf8fafc);
  camera = new THREE.PerspectiveCamera(45, (window.innerWidth * 0.72) / (window.innerHeight * 0.82), 0.1, 1000);
  camera.position.set(0, 1.6, 4);

  // luzes
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
  hemi.position.set(0, 1, 0);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(3, 10, 10);
  scene.add(dir);

  // controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0,1,0);
  controls.update();

  // Raycaster para selección
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  // Crear cuerpo (simplificado, pero por partes)
  buildSkeleton();
  buildMuscles();
  buildOrgans();
  buildHead();

  // Eventos UI
  document.getElementById('toggle-skeleton').addEventListener('change', (e)=>{
    parts.skeleton.forEach(m=> m.visible = e.target.checked);
  });
  document.getElementById('toggle-muscles').addEventListener('change', (e)=>{
    parts.muscles.forEach(m=> m.visible = e.target.checked);
  });
  document.getElementById('toggle-organs').addEventListener('change', (e)=>{
    parts.organs.forEach(m=> m.visible = e.target.checked);
  });
  document.getElementById('toggle-head').addEventListener('change', (e)=>{
    parts.head.forEach(m=> m.visible = e.target.checked);
  });
  document.getElementById('opacity').addEventListener('input', (e)=>{
    const v = parseFloat(e.target.value);
    document.getElementById('op-val').textContent = v;
    [...parts.skeleton, ...parts.muscles, ...parts.organs, ...parts.head].forEach(m=>{
      if(m.material){
        m.material.transparent = v < 1;
        m.material.opacity = v;
        m.material.needsUpdate = true;
      }
    });
  });

  // Click selección
  renderer.domElement.addEventListener('pointerdown', onPointerDown);

  window.addEventListener('resize', onWindowResize);
}

// --- Construcción de partes (geometrías simples estilizadas) ---
function buildSkeleton(){
  const mat = new THREE.MeshStandardMaterial({ color:0xf2e8cf, metalness:0.1, roughness:0.8 });

  // columna (varias cajas pequeñas)
  for(let i=0;i<10;i++){
    const geom = new THREE.BoxGeometry(0.15, 0.22, 0.12);
    const m = new THREE.Mesh(geom, mat.clone());
    m.position.set(0, 0.9 - i*0.18, 0);
    m.name = `Vertebra ${i+1}`;
    scene.add(m);
    parts.skeleton.push(m);
  }

  // pelvis
  const pel = new THREE.BoxGeometry(0.6,0.18,0.35);
  const pelvis = new THREE.Mesh(pel, mat.clone());
  pelvis.position.set(0, -0.1, 0);
  pelvis.name = "Pelvis";
  scene.add(pelvis); parts.skeleton.push(pelvis);

  // cráneo (como una esfera)
  const skull = new THREE.SphereGeometry(0.28, 16, 16);
  const skullM = new THREE.Mesh(skull, mat.clone());
  skullM.position.set(0, 1.9, 0);
  skullM.name = "Cráneo (hueso)";
  scene.add(skullM); parts.skeleton.push(skullM);

  // huesos de brazos (barras)
  const upperArmL = new THREE.CylinderGeometry(0.06,0.06,0.8,10);
  const b1 = new THREE.Mesh(upperArmL, mat.clone());
  b1.position.set(-0.6, 1.0, 0); b1.rotation.z = 0.4; b1.name="Húmero izquierdo";
  scene.add(b1); parts.skeleton.push(b1);

  const b2 = b1.clone(); b2.position.set(0.6,1.0,0); b2.name="Húmero derecho";
  scene.add(b2); parts.skeleton.push(b2);
}

function buildMuscles(){
  // Simple "chaqueta" muscular con cubo deformado
  const mat = new THREE.MeshStandardMaterial({ color:0xff6b6b, metalness:0.1, roughness:0.7 });
  const torso = new THREE.CapsuleGeometry(0.5, 1.0, 4, 8);
  const torsoMesh = new THREE.Mesh(torso, mat.clone());
  torsoMesh.position.set(0,0.8,0); torsoMesh.name="Músculos (torso)";
  scene.add(torsoMesh); parts.muscles.push(torsoMesh);

  // piernas (cilindros)
  const legGeom = new THREE.CylinderGeometry(0.18,0.22,1.0,12);
  const legL = new THREE.Mesh(legGeom, mat.clone()); legL.position.set(-0.26,-0.8,0); legL.name="Músculo pierna izquierda";
  const legR = legL.clone(); legR.position.set(0.26,-0.8,0); legR.name="Músculo pierna derecha";
  scene.add(legL); scene.add(legR); parts.muscles.push(legL, legR);

  // brazos (músculo)
  const armGeom = new THREE.CylinderGeometry(0.1,0.12,0.9,12);
  const armL = new THREE.Mesh(armGeom, mat.clone()); armL.position.set(-0.9,1.0,0); armL.rotation.z=0.4; armL.name="Músculo brazo izquierdo";
  const armR = armL.clone(); armR.position.set(0.9,1.0,0); armR.name="Músculo brazo derecho";
  scene.add(armL); scene.add(armR); parts.muscles.push(armL, armR);
}

function buildOrgans(){
  // Corazón (rombo / esfera)
  const heartGeom = new THREE.SphereGeometry(0.12, 16,16);
  const heartM = new THREE.Mesh(heartGeom, new THREE.MeshStandardMaterial({ color:0xcc0000, metalness:0.1 }));
  heartM.position.set(0.1,0.9,0.18); heartM.name="Corazón";
  scene.add(heartM); parts.organs.push(heartM);

  // Pulmones (dos esferas gemelas)
  const lungMat = new THREE.MeshStandardMaterial({ color:0x88c0ff, metalness:0.05, roughness:0.7, opacity:0.95 });
  const pl = new THREE.SphereGeometry(0.18, 16, 16);
  const lungL = new THREE.Mesh(pl, lungMat.clone()); lungL.position.set(-0.18,1.02,0.08); lungL.name="Pulmón izquierdo";
  const lungR = lungL.clone(); lungR.position.set(0.38,1.02,0.08); lungR.name="Pulmón derecho";
  scene.add(lungL); scene.add(lungR); parts.organs.push(lungL, lungR);

  // Hígado (sencillo)
  const liverGeom = new THREE.BoxGeometry(0.34,0.16,0.16);
  const liver = new THREE.Mesh(liverGeom, new THREE.MeshStandardMaterial({ color:0xffa94d }));
  liver.position.set(0.35,0.68,0.12); liver.name="Hígado";
  scene.add(liver); parts.organs.push(liver);
}

function buildHead(){
  // cabeza exterior (piel)
  const skin = new THREE.MeshStandardMaterial({ color:0xffe0bd, metalness:0.05 });
  const headGeom = new THREE.SphereGeometry(0.3, 24, 20);
  const head = new THREE.Mesh(headGeom, skin.clone()); head.position.set(0,1.9,0); head.name="Cabeza (piel)";
  scene.add(head); parts.head.push(head);

  // cerebro interior (dentro de la cabeza)
  const brainGeom = new THREE.SphereGeometry(0.18, 18, 16);
  const brain = new THREE.Mesh(brainGeom, new THREE.MeshStandardMaterial({ color:0xffc0cb, metalness:0.05 }));
  brain.position.set(0,1.9,0); brain.name="Cerebro";
  scene.add(brain); parts.head.push(brain);

  // ojos (pequeñas esferas)
  const eyeGeom = new THREE.SphereGeometry(0.03,8,8);
  const eyeL = new THREE.Mesh(eyeGeom, new THREE.MeshStandardMaterial({ color:0x222222 })); eyeL.position.set(-0.08,1.92,0.27); eyeL.name="Ojo izquierdo";
  const eyeR = eyeL.clone(); eyeR.position.set(0.08,1.92,0.27); eyeR.name="Ojo derecho";
  scene.add(eyeL); scene.add(eyeR); parts.head.push(eyeL, eyeR);
}

// --- Interacción y selección ---
function onPointerDown(event){
  const rect = renderer.domElement.getBoundingClientRect();
  const x = ( (event.clientX - rect.left) / rect.width ) * 2 - 1;
  const y = - ( (event.clientY - rect.top) / rect.height ) * 2 + 1;
  mouse.set(x,y);
  raycaster.setFromCamera(mouse, camera);

  const all = [...parts.skeleton, ...parts.muscles, ...parts.organs, ...parts.head];
  const intersects = raycaster.intersectObjects(all, true);
  if(intersects.length>0){
    const picked = intersects[0].object;
    showInfo(picked);
    highlight(picked);
  }
}

let lastHighlight = null;
function highlight(obj){
  if(lastHighlight){
    lastHighlight.material.emissive && (lastHighlight.material.emissive.setHex(0x000000));
    lastHighlight = null;
  }
  if(obj && obj.material && obj.material.emissive){
    obj.material.emissive.setHex(0x222222);
    lastHighlight = obj;
  } else if(obj && obj.material){
    // si material no tiene emissive, añadir uno (simple)
    obj.material.emissive = new THREE.Color(0x222222);
    lastHighlight = obj;
  }
}

function showInfo(obj){
  const name = obj.name || 'Parte';
  const infoBox = document.getElementById('selected-info');
  let desc = getDescription(name);
  infoBox.innerHTML = `<strong>${name}</strong><p style="margin:6px 0 0 0;">${desc}</p>`;
}

function getDescription(name){
  // textos breves educativos (puedes expandirlos luego)
  const map = {
    "Corazón":"Órgano que bombea la sangre por todo el cuerpo. Explica latidos, oxigenación y función básica.",
    "Pulmón izquierdo":"Órgano encargado del intercambio de gases (oxígeno y dióxido de carbono).",
    "Pulmón derecho":"Órgano encargado del intercambio de gases (oxígeno y dióxido de carbono).",
    "Hígado":"Órgano que procesa nutrientes, desintoxica y produce bilis.",
    "Cráneo (hueso)":"Estructura ósea que protege el cerebro.",
    "Cerebro":"Centro del sistema nervioso; controla funciones, pensamiento y movimiento.",
    "Pelvis":"Estructura ósea que soporta la columna y conecta las piernas al torso.",
    "Músculos (torso)":"Conjunto de músculos que permiten el movimiento y protegen órganos internos.",
  };
  return map[name] || "Descripción educativa breve. Puedes editar este texto para agregar más información.";
}

// --- Resize y animación ---
function onWindowResize(){
  const w = window.innerWidth * 0.72;
  const h = window.innerHeight * 0.82;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}

function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
