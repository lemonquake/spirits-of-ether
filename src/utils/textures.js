import * as THREE from 'three';

// Create a procedurally generated bark canvas texture
export function createBarkTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Base brown wood colors
  ctx.fillStyle = '#3a2518';
  ctx.fillRect(0, 0, 256, 256);
  
  // Draw vertical bark ridges
  for (let x = 0; x < 256; x += 4) {
    const width = 2 + Math.random() * 3;
    // Alternate dark and light ridges
    ctx.fillStyle = (x % 8 === 0) ? '#28170d' : '#4a3325';
    ctx.fillRect(x + Math.sin(x * 0.05) * 2, 0, width, 256);
    
    // Add vertical noise details
    for (let y = 0; y < 256; y += 4) {
      if (Math.random() > 0.7) {
        ctx.fillStyle = '#1c0f08';
        ctx.fillRect(x + Math.floor(Math.random() * 3) - 1, y, 2, 2);
      }
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 3);
  return texture;
}

// Create a procedurally generated leaf texture
export function createLeafTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Base green foliage colors
  ctx.fillStyle = '#2f5212';
  ctx.fillRect(0, 0, 256, 256);
  
  // Draw leaf veins
  ctx.strokeStyle = '#4d7c0f';
  ctx.lineWidth = 3;
  
  // Main stem/vein
  ctx.beginPath();
  ctx.moveTo(128, 0);
  ctx.lineTo(128, 256);
  ctx.stroke();
  
  // Side leaf veins
  ctx.lineWidth = 1.5;
  for (let y = 32; y < 256; y += 32) {
    // Left diagonal veins
    ctx.beginPath();
    ctx.moveTo(128, y);
    ctx.lineTo(40, y - 24);
    ctx.stroke();
    // Right diagonal veins
    ctx.beginPath();
    ctx.moveTo(128, y);
    ctx.lineTo(216, y - 24);
    ctx.stroke();
  }
  
  // Overlay leaf noise grain
  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
    data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise)); // G
    data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise)); // B
  }
  ctx.putImageData(imgData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// Create a procedurally generated stone texture
export function createStoneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Base dark grey stone colors
  ctx.fillStyle = '#4b5563';
  ctx.fillRect(0, 0, 256, 256);
  
  // Draw random cracks
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    let x = Math.random() * 256;
    let y = Math.random() * 256;
    ctx.moveTo(x, y);
    for (let j = 0; j < 6; j++) {
      x += (Math.random() - 0.5) * 50;
      y += (Math.random() - 0.5) * 50;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  
  // Add noise grain
  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 22;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
    data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise)); // G
    data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise)); // B
  }
  ctx.putImageData(imgData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}
