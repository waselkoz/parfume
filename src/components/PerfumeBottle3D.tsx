"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/* ── Build a fake studio HDR environment so glass actually reflects ── */
function buildEnvMap(renderer: THREE.WebGLRenderer): THREE.Texture {
  /* Four-zone gradient: top white → warm grey → dark → floor warm */
  const canvas = document.createElement("canvas");
  canvas.width = 2048; canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0,    "#ffffff");
  grad.addColorStop(0.25, "#d8d0c8");
  grad.addColorStop(0.55, "#1a1a1a");
  grad.addColorStop(0.75, "#0d0d0d");
  grad.addColorStop(1,    "#3a2a10");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 1024);

  /* Soft key-light blob */
  const blob = ctx.createRadialGradient(512, 200, 0, 512, 200, 600);
  blob.addColorStop(0, "rgba(255,245,220,0.95)");
  blob.addColorStop(1, "rgba(255,245,220,0)");
  ctx.fillStyle = blob; ctx.fillRect(0, 0, 2048, 1024);

  /* Rim-light blob */
  const rim = ctx.createRadialGradient(1700, 300, 0, 1700, 300, 500);
  rim.addColorStop(0, "rgba(180,220,255,0.7)");
  rim.addColorStop(1, "rgba(180,220,255,0)");
  ctx.fillStyle = rim; ctx.fillRect(0, 0, 2048, 1024);

  /* Studio Softbox reflections (professional product lighting) */
  // Left vertical softbox
  const leftGlow = ctx.createLinearGradient(150, 0, 350, 0);
  leftGlow.addColorStop(0, "rgba(255,255,255,0)");
  leftGlow.addColorStop(0.5, "rgba(255,255,255,0.95)");
  leftGlow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = leftGlow;
  ctx.fillRect(150, 50, 200, 924);

  // Right vertical softbox
  const rightGlow = ctx.createLinearGradient(1698, 0, 1898, 0);
  rightGlow.addColorStop(0, "rgba(255,255,255,0)");
  rightGlow.addColorStop(0.5, "rgba(255,255,255,0.95)");
  rightGlow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = rightGlow;
  ctx.fillRect(1698, 50, 200, 924);

  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envTex = pmrem.fromEquirectangular(tex).texture;
  pmrem.dispose();
  tex.dispose();
  return envTex;
}

/* ── Canvas label texture ── */
function buildLabelTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512; c.height = 512;
  const ctx = c.getContext("2d")!;

  /* Ivory cream linen-like background */
  ctx.fillStyle = "#faf8f5";
  ctx.fillRect(0, 0, 512, 512);

  /* Double gold borders */
  ctx.strokeStyle = "#c5a85c"; // luxury champagne gold
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 472, 472);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(28, 28, 456, 456);

  /* Typography */
  ctx.fillStyle = "#111111";
  ctx.textAlign = "center";
  
  // Brand name (wide letter spacing)
  ctx.font = "bold 32px 'Times New Roman', serif";
  ctx.fillText("P E R F U M   G U Y", 256, 120);

  // Thin gold rule
  ctx.fillStyle = "#c5a85c";
  ctx.fillRect(180, 160, 152, 2);

  // Fragrance name (elegant serif script)
  ctx.fillStyle = "#111111";
  ctx.font = "italic 38px 'Times New Roman', serif";
  ctx.fillText("Élixir Suprême", 256, 230);

  ctx.font = "bold 16px 'Helvetica Neue', Arial, sans-serif";
  ctx.fillStyle = "#666666";
  ctx.fillText("EXTRAIT DE PARFUM", 256, 280);

  // Decorative diamond logo
  ctx.fillStyle = "#c5a85c";
  ctx.beginPath();
  ctx.moveTo(256, 320);
  ctx.lineTo(266, 335);
  ctx.lineTo(256, 350);
  ctx.lineTo(246, 335);
  ctx.closePath();
  ctx.fill();

  // Volume / concentration
  ctx.font = "14px 'Helvetica Neue', Arial, sans-serif";
  ctx.fillStyle = "#888888";
  ctx.fillText("50 ML  ·  1.7 FL. OZ.", 256, 400);

  // Origin info
  ctx.font = "bold 14px 'Helvetica Neue', Arial, sans-serif";
  ctx.fillStyle = "#444444";
  ctx.fillText("ALGER  —  PARIS", 256, 440);

  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

export function PerfumeBottle3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let W = mount.clientWidth || 500;
    let H = mount.clientHeight || 500;

    /* ── RENDERER ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.setClearColor(0x0a0a0a, 1);
    mount.appendChild(renderer.domElement);

    /* ── SCENE ── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 5, 11);
    const envMap = buildEnvMap(renderer);
    scene.environment = envMap;

    /* ── CAMERA ── */
    const camera = new THREE.PerspectiveCamera(35, W / H, 0.1, 100);
    camera.position.set(0, 0.8, 7.5);

    /* ── CONTROLS ── */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 4;
    controls.maxDistance = 12;
    controls.maxPolarAngle = Math.PI / 2 + 0.15;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.addEventListener("start", () => { controls.autoRotate = false; });

    /* ── PREMIUM LIGHTING ── */
    // Warm key light
    const key = new THREE.DirectionalLight(0xfff5e6, 3.0);
    key.position.set(4, 6, 5);
    key.castShadow = true;
    key.shadow.mapSize.setScalar(2048);
    key.shadow.bias = -0.0005;
    scene.add(key);

    // Cool rim light (back highlight on glass edges)
    const rim = new THREE.DirectionalLight(0xccf0ff, 4.5);
    rim.position.set(-4, 3, -6);
    scene.add(rim);

    // Soft fill from opposite front
    const fill = new THREE.DirectionalLight(0xffe6cc, 1.5);
    fill.position.set(-4, 1, 3);
    scene.add(fill);

    // Top spotlight to hit the gold cap crown
    const spot = new THREE.SpotLight(0xffffff, 4, 15, Math.PI / 6, 0.5, 1);
    spot.position.set(0, 8, 2);
    spot.castShadow = true;
    scene.add(spot);

    // Floor reflection booster
    const bounce = new THREE.PointLight(0xffbb44, 2.0, 6);
    bounce.position.set(0, -2.2, 0);
    scene.add(bounce);

    // Ambient fill
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    /* ── LUXURY MATERIALS ── */
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
      roughness: 0.01,
      metalness: 0.0,
      transmission: 0.96,
      ior: 1.52, // real glass IOR
      thickness: 0.35, // thick luxury feel
      clearcoat: 1.0,
      clearcoatRoughness: 0.0,
      envMapIntensity: 2.2,
      side: THREE.DoubleSide,
    });

    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0xd98218, // glowing gold-amber
      transparent: true,
      opacity: 0.9,
      roughness: 0.01,
      metalness: 0.0,
      transmission: 0.85,
      ior: 1.33, // liquid IOR
      thickness: 0.8,
      envMapIntensity: 1.6,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xe5c158, // luxury champagne gold
      roughness: 0.1,
      metalness: 1.0,
      envMapIntensity: 3.5,
    });

    const capMat = new THREE.MeshPhysicalMaterial({
      color: 0x0c0c0c, // deep black glossy lacquer
      roughness: 0.03,
      metalness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      envMapIntensity: 2.5,
    });

    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      roughness: 0.2,
      transmission: 0.9,
      thickness: 0.05,
    });

    const labelTex = buildLabelTexture();
    const labelMat = new THREE.MeshStandardMaterial({
      map: labelTex,
      roughness: 0.6,
      metalness: 0.05,
    });

    /* ── BOTTLE ASSEMBLY ── */
    const bottle = new THREE.Group();

    // ① Heavy Outer Glass Flacon
    const bodyGeo = new RoundedBoxGeometry(2.2, 3.2, 1.4, 6, 0.15);
    const bodyMesh = new THREE.Mesh(bodyGeo, glassMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    bottle.add(bodyMesh);

    // ② Amber Liquid (Sized to leave a heavy glass bottom wall)
    const liquidGeo = new RoundedBoxGeometry(1.8, 2.2, 1.0, 6, 0.1);
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.set(0, -0.2, 0);
    bottle.add(liquidMesh);

    // ③ Semi-Transparent Dip Tube (Stem)
    const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.4, 8);
    const stemMesh = new THREE.Mesh(stemGeo, tubeMat);
    stemMesh.position.set(0, -0.2, 0);
    bottle.add(stemMesh);

    // ④ Front Embossed Square Label
    const labelGeo = new THREE.PlaneGeometry(1.4, 1.4);
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.set(0, -0.1, 0.705);
    bottle.add(labelMesh);

    // ⑤ Metallic Gold Neck Collar
    const collarGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.4, 32);
    const collarMesh = new THREE.Mesh(collarGeo, goldMat);
    collarMesh.position.set(0, 1.7, 0);
    bottle.add(collarMesh);

    // ⑥ Snug Cap Band (Base of Cap)
    const capBandGeo = new THREE.CylinderGeometry(0.66, 0.66, 0.15, 32);
    const capBandMesh = new THREE.Mesh(capBandGeo, goldMat);
    capBandMesh.position.set(0, 1.9, 0);
    bottle.add(capBandMesh);

    // ⑦ Glossy Black Cap Body
    const capGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.1, 32);
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.position.set(0, 2.4, 0);
    capMesh.castShadow = true;
    bottle.add(capMesh);

    // ⑧ Gold Cap Crown (Top Plate)
    const capCrownGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.04, 32);
    const capCrownMesh = new THREE.Mesh(capCrownGeo, goldMat);
    capCrownMesh.position.set(0, 2.97, 0);
    bottle.add(capCrownMesh);

    scene.add(bottle);
    bottle.position.set(0, 0.3, 0);

    /* ── PEDESTAL ── */
    const pedestalGroup = new THREE.Group();
    const pedMat = new THREE.MeshStandardMaterial({ color: 0x090909, roughness: 0.08, metalness: 0.8, envMapIntensity: 1.8 });

    // Main base cylinder
    const pedGeo = new THREE.CylinderGeometry(1.8, 1.9, 0.32, 64);
    pedestalGroup.add(new THREE.Mesh(pedGeo, pedMat));

    // Top rim ring
    const rimGeo = new THREE.TorusGeometry(1.8, 0.035, 8, 64);
    const rimMesh = new THREE.Mesh(rimGeo, goldMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 0.16;
    pedestalGroup.add(rimMesh);

    pedestalGroup.position.set(0, -2.0, 0);
    scene.add(pedestalGroup);

    /* ── REFLECTIVE FLOOR ── */
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      roughness: 0.06,
      metalness: 0.8,
      envMapIntensity: 1.0,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.16;
    floor.receiveShadow = true;
    scene.add(floor);

    /* ── GLOW HALO (Atmosphere) ── */
    const haloGeo = new THREE.PlaneGeometry(5, 7);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xd98218,
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 1.2, -1.8);
    scene.add(halo);

    /* ── PARTICLES ── */
    const particleCount = 150;
    const pPositions = new Float32Array(particleCount * 3);
    const pSpeeds = new Float32Array(particleCount);
    const pOffsets = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3]     = (Math.random() - 0.5) * 6;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      pSpeeds[i]  = 0.12 + Math.random() * 0.25;
      pOffsets[i] = Math.random() * Math.PI * 2;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions.slice(), 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xe5c158,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    /* ── ANIMATION LOOP ── */
    const clock = new THREE.Clock();
    let animId: number;

    function animate() {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Fluid floating motion
      bottle.position.y = 0.3 + Math.sin(t * 0.5) * 0.06;

      // Gentle rotational sway
      bottle.rotation.z = Math.sin(t * 0.35) * 0.01;

      // Update particles
      const pos = pGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        const phase = pOffsets[i];
        pos.setX(i, pPositions[i * 3]     + Math.sin(t * pSpeeds[i] + phase) * 0.25);
        pos.setY(i, pPositions[i * 3 + 1] + Math.cos(t * pSpeeds[i] * 0.65 + phase) * 0.35);
        pos.setZ(i, pPositions[i * 3 + 2] + Math.sin(t * pSpeeds[i] * 0.45 + phase) * 0.15);
      }
      pos.needsUpdate = true;

      // Pulse halo brightness
      haloMat.opacity = 0.04 + Math.sin(t * 0.7) * 0.015;

      // Pedestal counter-rotate
      pedestalGroup.rotation.y = -t * 0.05;

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    /* ── RESIZE ── */
    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth, h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
      envMap.dispose();
      labelTex.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full"
      style={{ cursor: "grab" }}
      onMouseDown={e => (e.currentTarget.style.cursor = "grabbing")}
      onMouseUp={e => (e.currentTarget.style.cursor = "grab")}
    />
  );
}
