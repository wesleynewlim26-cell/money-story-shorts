import { Composition, CalculateMetadataFunction, HtmlInCanvas, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {};

const calculateMetadata: CalculateMetadataFunction<Props> = () => {
  return {
    durationInFrames: 1800,
    fps: 30,
    width: 720,
    height: 1280,
  };
};

const TAU = Math.PI * 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const mulberry32 = (a: number) => {
  return () => {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

function designFrame(ctx: CanvasRenderingContext2D, w: number, h: number, fn: () => void) {
  ctx.save();
  const scale = Math.min(w / 720, h / 1280);
  ctx.translate((w - 720 * scale) / 2, (h - 1280 * scale) / 2);
  ctx.scale(scale, scale);
  fn();
  ctx.restore();
}

const DURATION = 1800;
const FPS = 30;
const rng = mulberry32(12345);

const COLORS = {
  bg: "#0a0a1a",
  paper: "#1a1a2e",
  paperLight: "#252540",
  outline: "#000000",
  text: "#f0e6d2",
  textDim: "#a09880",
  gold: "#ffd700",
  goldDim: "#ccac00",
  amber: "#ffb700",
  warmLight: "#ffaa44",
  coolLight: "#44aaff",
  red: "#cc3333",
  green: "#33cc77",
  white: "#ffffff",
  shadow: "rgba(0,0,0,0.6)",
};

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCharacter(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, opts: {
  headTilt?: number;
  blink?: boolean;
  mouth?: "neutral" | "smile" | "smirk" | "surprised" | "concerned";
  hat?: boolean;
  suitColor?: string;
} = {}) {
  const { headTilt = 0, blink = false, mouth = "neutral", hat = false, suitColor = "#1a1a2e" } = opts;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  // Body
  ctx.fillStyle = suitColor;
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-30, 10);
  ctx.lineTo(-30, 80);
  ctx.quadraticCurveTo(-30, 95, -15, 95);
  ctx.lineTo(15, 95);
  ctx.quadraticCurveTo(30, 95, 30, 80);
  ctx.lineTo(30, 10);
  ctx.quadraticCurveTo(30, -5, 15, -5);
  ctx.lineTo(-15, -5);
  ctx.quadraticCurveTo(-30, -5, -30, 10);
  ctx.fill();
  ctx.stroke();
  
  // Lapels
  ctx.fillStyle = "#0a0a1a";
  ctx.beginPath();
  ctx.moveTo(-5, -5);
  ctx.lineTo(-20, 30);
  ctx.lineTo(-5, 30);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(5, -5);
  ctx.lineTo(20, 30);
  ctx.lineTo(5, 30);
  ctx.fill();
  
  // Tie
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.moveTo(0, 5);
  ctx.lineTo(-8, 35);
  ctx.lineTo(8, 35);
  ctx.fill();
  ctx.stroke();
  
  // Head
  const headY = -50;
  ctx.save();
  ctx.translate(0, headY);
  ctx.rotate(headTilt);
  
  // Head shadow (hard, one side)
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.beginPath();
  ctx.ellipse(8, 8, 42, 38, 0, 0, TAU);
  ctx.fill();
  
  // Head base
  ctx.fillStyle = "#e8d5b7"; // skin tone
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 36, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  
  // Hat
  if (hat) {
    ctx.fillStyle = "#0a0a1a";
    ctx.beginPath();
    ctx.moveTo(-50, -20);
    ctx.lineTo(50, -20);
    ctx.lineTo(40, -45);
    ctx.lineTo(-40, -45);
    ctx.fill();
    ctx.stroke();
    // Brim
    ctx.beginPath();
    ctx.ellipse(0, -20, 55, 8, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
  
  // Eyes
  if (!blink) {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(-14, -4, 6, 8, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(14, -4, 6, 8, 0, 0, TAU);
    ctx.fill();
    // Highlights
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-16, -6, 2, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(12, -6, 2, 0, TAU);
    ctx.fill();
  } else {
    // Blink - just lines
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-20, -4);
    ctx.lineTo(-8, -4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -4);
    ctx.lineTo(20, -4);
    ctx.stroke();
  }
  
  // Eyebrows
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-22, -16);
  ctx.lineTo(-6, -18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(6, -18);
  ctx.lineTo(22, -16);
  ctx.stroke();
  
  // Mouth
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  if (mouth === "smile") {
    ctx.beginPath();
    ctx.moveTo(-12, 14);
    ctx.quadraticCurveTo(0, 22, 12, 14);
    ctx.stroke();
  } else if (mouth === "smirk") {
    ctx.beginPath();
    ctx.moveTo(-10, 16);
    ctx.quadraticCurveTo(5, 12, 12, 16);
    ctx.stroke();
  } else if (mouth === "surprised") {
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(0, 18, 6, 0, TAU);
    ctx.fill();
  } else if (mouth === "concerned") {
    ctx.beginPath();
    ctx.moveTo(-10, 18);
    ctx.quadraticCurveTo(0, 14, 10, 18);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-8, 16);
    ctx.lineTo(8, 16);
    ctx.stroke();
  }
  
  // Hard shadow on face (one side)
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.moveTo(0, -36);
  ctx.quadraticCurveTo(20, -10, 20, 36);
  ctx.quadraticCurveTo(0, 20, -20, 36);
  ctx.quadraticCurveTo(-20, -10, 0, -36);
  ctx.fill();
  
  ctx.restore(); // head
  ctx.restore(); // character
}

function drawEiffelTower(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, glow: number = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 2;
  
  // Legs
  ctx.beginPath();
  ctx.moveTo(-60, 0);
  ctx.lineTo(-15, -180);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(60, 0);
  ctx.lineTo(15, -180);
  ctx.stroke();
  
  // Cross braces
  for (let i = 0; i < 6; i++) {
    const py = -20 - i * 28;
    const w = 55 - i * 7;
    ctx.beginPath();
    ctx.moveTo(-w, py);
    ctx.lineTo(w, py);
    ctx.stroke();
    // X braces
    ctx.beginPath();
    ctx.moveTo(-w, py);
    ctx.lineTo(0, py - 14);
    ctx.lineTo(w, py);
    ctx.stroke();
  }
  
  // Top platform
  ctx.fillStyle = "#2a2a3a";
  ctx.beginPath();
  ctx.moveTo(-20, -200);
  ctx.lineTo(20, -200);
  ctx.lineTo(15, -210);
  ctx.lineTo(-15, -210);
  ctx.fill();
  ctx.stroke();
  
  // Antenna
  ctx.beginPath();
  ctx.moveTo(0, -210);
  ctx.lineTo(0, -250);
  ctx.stroke();
  
  // Glow windows
  if (glow > 0) {
    ctx.fillStyle = `rgba(255, 187, 0, ${glow * 0.6})`;
    for (let i = 0; i < 5; i++) {
      const py = -40 - i * 30;
      const w = 50 - i * 6;
      ctx.fillRect(-w, py - 5, w * 2, 8);
    }
    ctx.fillRect(-15, -205, 30, 10);
  }
  
  ctx.restore();
}

function drawNewspaper(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, progress: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  const openProg = clamp(progress * 2, 0, 1);
  const w = 160 * openProg;
  
  // Paper shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(4, 4, w, 200);
  
  // Paper
  ctx.fillStyle = "#f5f0e1";
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 2;
  ctx.fillRect(0, 0, w, 200);
  ctx.strokeRect(0, 0, w, 200);
  
  if (openProg > 0.3) {
    // Headline
    ctx.fillStyle = "#000000";
    ctx.font = "bold 18px serif";
    ctx.textAlign = "center";
    ctx.fillText("MENARA EIFFEL", w/2, 50);
    ctx.fillText("BERKARAT", w/2, 75);
    ctx.font = "14px serif";
    ctx.fillText("Biaya Perbaikan Mencapai Rekor", w/2, 105);
    
    // Lines
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(15, 130 + i * 18);
      ctx.lineTo(w - 15, 130 + i * 18);
      ctx.stroke();
    }
  }
  
  ctx.restore();
}

function drawHotelScene(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, dealers: number, highlightDealer: number = -1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  // Room bg
  const grad = ctx.createLinearGradient(0, 0, 0, 200);
  grad.addColorStop(0, "#0a0a1a");
  grad.addColorStop(1, "#1a1a2e");
  ctx.fillStyle = grad;
  ctx.fillRect(-200, -100, 400, 300);
  
  // Chandelier glow
  const chandGrad = ctx.createRadialGradient(0, -80, 0, 0, -80, 120);
  chandGrad.addColorStop(0, "rgba(255,220,150,0.3)");
  chandGrad.addColorStop(1, "rgba(255,187,0,0)");
  ctx.fillStyle = chandGrad;
  ctx.beginPath();
  ctx.arc(0, -80, 120, 0, TAU);
  ctx.fill();
  
  // Table
  ctx.fillStyle = "#1a1a2e";
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  ctx.fillRect(-150, 40, 300, 60);
  ctx.strokeRect(-150, 40, 300, 60);
  
  // Document on table
  ctx.fillStyle = "#f5f0e1";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.fillRect(-40, 50, 80, 40);
  ctx.strokeRect(-40, 50, 80, 40);
  ctx.fillStyle = "#000";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("RAHASIA", 0, 72);
  ctx.fillText("PENJUALAN", 0, 84);
  ctx.fillText("EIFFEL", 0, 96);
  
  // Dealers
  for (let i = 0; i < dealers; i++) {
    const dx = -100 + i * 40;
    const isHighlight = i === highlightDealer;
    drawCharacter(ctx, dx, 10, 0.35, {
      suitColor: isHighlight ? "#2a2a4a" : "#1a1a2e",
      mouth: isHighlight ? "concerned" : "neutral",
      blink: false,
    });
  }
  
  // Lustig at head
  drawCharacter(ctx, 0, 5, 0.4, {
    hat: true,
    suitColor: "#0a0a1a",
    mouth: "smirk",
    headTilt: -0.05,
  });
  
  ctx.restore();
}

function drawBriefcase(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, open: number, moneyFloat: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  // Briefcase base
  ctx.fillStyle = "#1a1a2e";
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 3;
  ctx.fillRect(-60, -40, 120, 80);
  ctx.strokeRect(-60, -40, 120, 80);
  
  // Handle
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-20, -40);
  ctx.quadraticCurveTo(0, -60, 20, -40);
  ctx.stroke();
  
  // Latch
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(-5, -45, 10, 10);
  
  if (open > 0) {
    // Open lid
    ctx.save();
    ctx.translate(0, -40);
    ctx.rotate(-open * 1.2);
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(-60, -40, 120, 20);
    ctx.strokeRect(-60, -40, 120, 20);
    ctx.restore();
    
    // Money floating out
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * TAU + moneyFloat * 2;
      const radius = 50 + Math.sin(moneyFloat * 3 + i) * 20;
      const mx = Math.cos(angle) * radius;
      const my = Math.sin(angle) * radius * 0.5 - 20;
      
      ctx.fillStyle = "#33cc77";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.fillRect(mx - 12, my - 6, 24, 12);
      ctx.strokeRect(mx - 12, my - 6, 24, 12);
      ctx.fillStyle = "#000";
      ctx.font = "8px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("100", mx, my + 3);
    }
  }
  
  ctx.restore();
}

function drawTrain(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, progress: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  const trainX = lerp(-400, 400, progress);
  
  // Tracks
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-500, 50);
  ctx.lineTo(500, 50);
  ctx.moveTo(-500, 70);
  ctx.lineTo(500, 70);
  ctx.stroke();
  
  // Ties
  ctx.fillStyle = "#222";
  for (let i = -10; i < 10; i++) {
    ctx.fillRect(i * 50 - 5 + (progress * 100) % 50, 45, 10, 30);
  }
  
  // Train engine
  ctx.translate(trainX, 0);
  ctx.fillStyle = "#0a0a1a";
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  
  // Engine body
  ctx.fillRect(-80, -80, 160, 100);
  ctx.strokeRect(-80, -80, 160, 100);
  
  // Cab
  ctx.fillRect(-60, -120, 60, 40);
  ctx.strokeRect(-60, -120, 60, 40);
  
  // Window
  ctx.fillStyle = "rgba(255,187,0,0.3)";
  ctx.fillRect(-55, -115, 25, 30);
  ctx.strokeRect(-55, -115, 25, 30);
  
  // Wheels
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(-60 + i * 40, 20, 20, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-60 + i * 40, 20);
    ctx.lineTo(-60 + i * 40, 0);
    ctx.stroke();
  }
  
  // Smoke
  for (let i = 0; i < 5; i++) {
    const sy = -140 - i * 15 - progress * 50;
    const sx = -80 + Math.sin(progress * 10 + i) * 10;
    ctx.fillStyle = `rgba(100,100,100,${0.3 - i * 0.05})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 15 + i * 3, 0, TAU);
    ctx.fill();
  }
  
  // Briefcase on top
  drawBriefcase(ctx, 0, -100, 0.5, 0, progress * 5);
  
  ctx.restore();
}

function drawPoliceStation(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, poissonLeaves: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  // Building
  ctx.fillStyle = "#1a1a2e";
  ctx.strokeStyle = COLORS.outline;
  ctx.lineWidth = 2;
  ctx.fillRect(-120, -150, 240, 250);
  ctx.strokeRect(-120, -150, 240, 250);
  
  // Sign
  ctx.fillStyle = "#0a0a1a";
  ctx.fillRect(-80, -170, 160, 40);
  ctx.strokeRect(-80, -170, 160, 40);
  ctx.fillStyle = COLORS.white;
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("POLISI", 0, -142);
  
  // Poisson character
  const px = lerp(0, 200, poissonLeaves);
  drawCharacter(ctx, px, -20, 0.4, {
    suitColor: "#2a2a3e",
    mouth: "concerned",
    headTilt: poissonLeaves > 0.5 ? 0.1 : 0,
  });
  
  // Thought bubble
  if (poissonLeaves < 0.7) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.strokeStyle = COLORS.outline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + 60, -80);
    ctx.lineTo(px + 140, -80);
    ctx.lineTo(px + 140, -140);
    ctx.lineTo(px + 60, -140);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = "#000";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Malu...", px + 70, -115);
    ctx.fillText("Tidak lapor.", px + 70, -95);
  }
  
  ctx.restore();
}

function drawShip(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, progress: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  // Ocean
  const waveGrad = ctx.createLinearGradient(0, 0, 0, 100);
  waveGrad.addColorStop(0, "#0a1a2e");
  waveGrad.addColorStop(1, "#050a15");
  ctx.fillStyle = waveGrad;
  ctx.fillRect(-300, -50, 600, 200);
  
  // Waves
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    for (let x = -300; x < 300; x += 10) {
      const wy = Math.sin(x * 0.02 + progress * 5 + i) * 8 + i * 25;
      if (x === -300) ctx.moveTo(x, wy);
      else ctx.lineTo(x, wy);
    }
    ctx.stroke();
  }
  
  // Ship
  const shipX = lerp(-200, 200, progress);
  ctx.translate(shipX, 30);
  
  // Hull
  ctx.fillStyle = "#0a0a1a";
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-100, 0);
  ctx.lineTo(-120, 40);
  ctx.lineTo(120, 40);
  ctx.lineTo(100, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Deck
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(-90, -30, 180, 30);
  ctx.strokeRect(-90, -30, 180, 30);
  
  // Superstructure
  ctx.fillRect(-40, -70, 80, 40);
  ctx.strokeRect(-40, -70, 80, 40);
  
  // Windows
  ctx.fillStyle = "rgba(255,187,0,0.4)";
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(-35 + i * 20, -65, 12, 15);
    ctx.strokeRect(-35 + i * 20, -65, 12, 15);
  }
  
  // Smokestack
  ctx.fillStyle = "#0a0a1a";
  ctx.fillRect(-10, -110, 20, 40);
  ctx.strokeRect(-10, -110, 20, 40);
  
  // Smoke
  for (let i = 0; i < 4; i++) {
    const sy = -115 - i * 15 - progress * 30;
    ctx.fillStyle = `rgba(150,150,150,${0.3 - i * 0.07})`;
    ctx.beginPath();
    ctx.arc(0 + Math.sin(progress * 8 + i) * 8, sy, 10 + i * 2, 0, TAU);
    ctx.fill();
  }
  
  // Two briefcases
  drawBriefcase(ctx, -30, -40, 0.4, 0, 0);
  drawBriefcase(ctx, 30, -40, 0.4, 0, 0);
  
  // Wake
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    const wx = 100 + i * 15;
    const wy = 30 + Math.sin(progress * 10 + i) * 5;
    ctx.beginPath();
    ctx.moveTo(wx, wy - 10);
    ctx.quadraticCurveTo(wx + 7, wy, wx + 15, wy - 10);
    ctx.stroke();
  }
  
  ctx.restore();
}

function drawEiffelNight(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, glowPulse: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  // Night sky
  const skyGrad = ctx.createLinearGradient(0, -300, 0, 100);
  skyGrad.addColorStop(0, "#050515");
  skyGrad.addColorStop(0.5, "#0a0a2a");
  skyGrad.addColorStop(1, "#1a1a2e");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(-200, -300, 400, 400);
  
  // Stars
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 50; i++) {
    const sx = (rng() - 0.5) * 400;
    const sy = (rng() - 0.5) * 300 - 150;
    const sr = rng() * 1.5 + 0.5;
    const alpha = 0.3 + 0.7 * Math.sin(glowPulse * 3 + i);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  
  // Tower with glow
  drawEiffelTower(ctx, 0, 50, 1.2, 0.5 + 0.5 * Math.sin(glowPulse * 2));
  
  // Ground
  ctx.fillStyle = "#0a0a1a";
  ctx.fillRect(-200, 100, 400, 50);
  
  // Text
  ctx.fillStyle = COLORS.text;
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("MENARA EIFFEL MASIH BERDIRI", 0, 140);
  ctx.font = "14px sans-serif";
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText("Belum pernah dijual... secara resmi", 0, 165);
  
  ctx.restore();
}

function drawCaption(ctx: CanvasRenderingContext2D, w: number, h: number, text: string, progress: number, yPos: number = 0.85) {
  if (!text) return;
  
  const alpha = clamp(progress * 3, 0, 1) * clamp((1 - progress) * 3, 0, 1) * 1;
  if (alpha <= 0) return;
  
  ctx.save();
  ctx.globalAlpha = alpha;
  
  const lines = text.split("\n");
  const lineHeight = 40;
  const totalHeight = lines.length * lineHeight;
  const startY = h * yPos - totalHeight / 2;
  
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  
  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lineHeight;
    // Outline
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.strokeText(lines[i], w / 2, y);
    // Fill
    ctx.fillStyle = COLORS.gold;
    ctx.fillText(lines[i], w / 2, y);
    // Inner highlight
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText(lines[i], w / 2, y - 2);
  }
  
  ctx.restore();
}

function drawScene1(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  // Newspaper opening
  const paperProg = clamp(p * 600, 0, 1);
  drawNewspaper(ctx, w/2, h/2 - 100, 1.2, paperProg);
  
  drawCaption(ctx, w, h, "MENARA EIFFEL BERKARAT", clamp((p - 0) / 0.05, 0, 1));
}

function drawScene2(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  // Lustig reading newspaper
  const charProg = clamp((p - 3/60) * 30, 0, 1);
  const blink = Math.floor(p * FPS) % 60 < 3;
  drawCharacter(ctx, w/2, h/2 + 50, 0.8 * easeOutBack(charProg), {
    hat: true,
    suitColor: "#0a0a1a",
    mouth: "smirk",
    blink,
    headTilt: Math.sin(p * 2) * 0.05,
  });
  
  // Newspaper in hands
  drawNewspaper(ctx, w/2 - 20, h/2 + 180, 0.6, 1);
  
  drawCaption(ctx, w, h, "VICTOR LUSTIG:\nPENALIP PALING BRILIAN", clamp((p - 0.05) / 0.05, 0, 1));
}

function drawScene3(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp((p - 6/60) * 25, 0, 1);
  drawHotelScene(ctx, w/2, h/2 + 20, charProg, 6);
  
  drawCaption(ctx, w, h, "HOTEL MEWAH • 6 DEALER BESI", clamp((p - 0.1) / 0.05, 0, 1));
}

function drawScene4(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp((p - 10/60) * 25, 0, 1);
  drawHotelScene(ctx, w/2, h/2 + 20, charProg, 6, 2); // highlight Poisson
  
  // Zoom on document
  const docScale = 1 + 0.5 * easeOut(charProg);
  ctx.save();
  ctx.translate(w/2, h/2 + 100);
  ctx.scale(docScale, docScale);
  ctx.translate(-w/2, -h/2);
  drawHotelScene(ctx, w/2, h/2 + 20, 1, 6, 2);
  ctx.restore();
  
  drawCaption(ctx, w, h, "7.000 TON BESI • RAHASIA", clamp((p - 0.167) / 0.05, 0, 1));
}

function drawScene5(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp((p - 13/60) * 25, 0, 1);
  drawHotelScene(ctx, w/2, h/2 + 20, charProg, 6, 2);
  
  // Poisson close up
  drawCharacter(ctx, w/2 - 20, h/2 - 20, 0.6, {
    suitColor: "#2a2a3e",
    mouth: "concerned",
    blink: Math.floor(p * FPS) % 40 < 2,
  });
  
  drawCaption(ctx, w, h, "POISSON: DEALER BARU,\nAMBISIUS TAPI RAGU", clamp((p - 0.217) / 0.05, 0, 1));
}

function drawScene6(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp((p - 17/60) * 25, 0, 1);
  drawHotelScene(ctx, w/2, h/2 + 20, charProg, 6, 2);
  
  // Lustig leaning in
  drawCharacter(ctx, w/2 + 10, h/2 - 10, 0.5, {
    hat: true,
    suitColor: "#0a0a1a",
    mouth: "smirk",
    headTilt: 0.15,
  });
  
  // Whisper lines
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(w/2 + 40, h/2 - 30 + i * 8);
    ctx.lineTo(w/2 + 70, h/2 - 25 + i * 8);
    ctx.stroke();
  }
  
  drawCaption(ctx, w, h, "SUAP = BUKTI KEASLIAN", clamp((p - 0.283) / 0.05, 0, 1));
}

function drawScene7(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp((p - 21/60) * 33, 0, 1);
  const moneyFloat = p * 2;
  
  drawHotelScene(ctx, w/2, h/2 + 20, 1, 6, 2);
  
  // Briefcase getting money
  drawBriefcase(ctx, w/2, h/2 + 120, 0.8, charProg, moneyFloat);
  
  drawCaption(ctx, w, h, "KOPER PENUH UANG • KE VIENNA", clamp((p - 0.35) / 0.05, 0, 1));
}

function drawScene8(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp((p - 24/60) * 33, 0, 1);
  drawPoliceStation(ctx, w/2, h/2 + 50, 1, charProg);
  
  drawCaption(ctx, w, h, "TIDAK LAPOR • MALU", clamp((p - 0.4) / 0.05, 0, 1));
}

function drawScene9(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp((p - 27/60) * 33, 0, 1);
  
  // Match cut - same hotel, new dealers
  drawHotelScene(ctx, w/2, h/2 + 20, charProg, 6, -1);
  
  // "1 BULAN KEMUDIAN" stamp
  if (charProg > 0.3) {
    ctx.save();
    ctx.translate(w/2, h/2 - 150);
    ctx.rotate(-0.15);
    ctx.fillStyle = "rgba(204,51,51,0.9)";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, -120, -30, 240, 60, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("1 BULAN KEMUDIAN", 0, 8);
    ctx.font = "16px sans-serif";
    ctx.fillText("DEALER BARU", 0, 32);
    ctx.restore();
  }
  
  drawCaption(ctx, w, h, "1 BULAN KEMUDIAN • DEALER BARU", clamp((p - 0.45) / 0.05, 0, 1));
}

function drawScene10(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp((p - 30/60) * 25, 0, 1);
  const speed = 1 + charProg;
  
  drawHotelScene(ctx, w/2, h/2 + 20, 1, 6);
  
  // Speed lines
  ctx.strokeStyle = "rgba(255,187,0,0.6)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    const x = -150 + i * 30;
    const offset = (p * speed * 100 + i * 10) % 400 - 200;
    ctx.beginPath();
    ctx.moveTo(x + offset, h/2 - 50);
    ctx.lineTo(x + offset + 50, h/2 - 50);
    ctx.stroke();
  }
  
  // Timer UI
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, w/2 - 60, 40, 120, 40, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = COLORS.gold;
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "center";
  ctx.fillText("2x LEBIH CEPAT", w/2, 68);
  
  drawCaption(ctx, w, h, "2x LEBIH CEPAT • UANG LAGI", clamp((p - 0.5) / 0.05, 0, 1));
}

function drawScene11(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp((p - 34/60) * 33, 0, 1);
  
  // Split screen: dealer -> police
  const splitX = w/2 + lerp(0, w/2, charProg);
  
  // Left: dealer leaving hotel
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, splitX, h);
  ctx.clip();
  drawHotelScene(ctx, w/4, h/2 + 20, 1, 1, 0);
  ctx.restore();
  
  // Right: police station
  ctx.save();
  ctx.beginPath();
  ctx.rect(splitX, 0, w - splitX, h);
  ctx.clip();
  drawPoliceStation(ctx, (w + splitX)/2, h/2 + 50, 1, charProg);
  ctx.restore();
  
  // Divider
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(splitX, 0);
  ctx.lineTo(splitX, h);
  ctx.stroke();
  ctx.setLineDash([]);
  
  drawCaption(ctx, w, h, "KALI INI: LAPOR KE POLISI", clamp((p - 0.567) / 0.05, 0, 1));
}

function drawScene12(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const charProg = clamp((p - 37/60) * 33, 0, 1);
  drawShip(ctx, w/2, h/2 + 100, 1, charProg);
  
  drawCaption(ctx, w, h, "MARK SELANJUTNYA: AL CAPONE", clamp((p - 0.617) / 0.05, 0, 1));
}

function drawScene13(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  const glowPulse = p * 0.5;
  drawEiffelNight(ctx, w/2, h/2, 1, glowPulse);
  
  drawCaption(ctx, w, h, "MENARA EIFFEL MASIH BERDIRI", clamp((p - 0.667) / 0.05, 0, 1));
}

function drawScene14(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
  // End screen
  const endProg = clamp((p - 0.717) * 10, 0, 1);
  
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, w, h);
  
  // Logo area
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  drawRoundedRect(ctx, w/2 - 150, h/2 - 150, 300, 300, 20);
  ctx.fill();
  
  ctx.fillStyle = COLORS.gold;
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("💰", w/2, h/2 - 50);
  
  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = COLORS.text;
  ctx.fillText("FOLLOW UNTUK", w/2, h/2 + 20);
  ctx.fillText("CERITA UANG LAINNYA", w/2, h/2 + 55);
  
  // Social handle
  ctx.font = "18px sans-serif";
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText("@wealthstock.id", w/2, h/2 + 120);
}

function GoldenHourglassCanvas({ frame, progress }: { frame: number; progress: number }) {
  const onPaint = (ctx: CanvasRenderingContext2D) => {
    const w = 720;
    const h = 1280;
    
    designFrame(ctx, w, h, () => {
      // Clear
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, 720, 1280);
      
      // Scene routing based on progress (0-1 over 60 seconds)
      // Each scene ~3-4 seconds = ~0.05-0.067 progress
      
      if (progress < 3/60) {
        drawScene1(ctx, 720, 1280, progress * 60 / 3);
      } else if (progress < 6/60) {
        drawScene2(ctx, 720, 1280, (progress - 3/60) * 60 / 3);
      } else if (progress < 10/60) {
        drawScene3(ctx, 720, 1280, (progress - 6/60) * 60 / 4);
      } else if (progress < 13/60) {
        drawScene4(ctx, 720, 1280, (progress - 10/60) * 60 / 3);
      } else if (progress < 17/60) {
        drawScene5(ctx, 720, 1280, (progress - 13/60) * 60 / 4);
      } else if (progress < 21/60) {
        drawScene6(ctx, 720, 1280, (progress - 17/60) * 60 / 4);
      } else if (progress < 24/60) {
        drawScene7(ctx, 720, 1280, (progress - 21/60) * 60 / 3);
      } else if (progress < 27/60) {
        drawScene8(ctx, 720, 1280, (progress - 24/60) * 60 / 3);
      } else if (progress < 30/60) {
        drawScene9(ctx, 720, 1280, (progress - 27/60) * 60 / 3);
      } else if (progress < 34/60) {
        drawScene10(ctx, 720, 1280, (progress - 30/60) * 60 / 4);
      } else if (progress < 37/60) {
        drawScene11(ctx, 720, 1280, (progress - 34/60) * 60 / 3);
      } else if (progress < 40/60) {
        drawScene12(ctx, 720, 1280, (progress - 37/60) * 60 / 3);
      } else if (progress < 43/60) {
        drawScene13(ctx, 720, 1280, (progress - 40/60) * 60 / 3);
      } else {
        drawScene14(ctx, 720, 1280, (progress - 43/60) * 60 / 17);
      }
      
      // Vignette
      const vigGrad = ctx.createRadialGradient(360, 640, 0, 360, 640, 500);
      vigGrad.addColorStop(0, "rgba(0,0,0,0)");
      vigGrad.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, 720, 1280);
      
      // Film grain
      const imgData = ctx.createImageData(720, 1280);
      const data = imgData.data;
      const grainRng = mulberry32(frame * 9973);
      for (let i = 0; i < data.length; i += 4) {
        const g = (grainRng() - 0.5) * 20;
        data[i] = g;
        data[i + 1] = g * 0.9;
        data[i + 2] = g * 0.7;
        data[i + 3] = 255;
      }
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = 0.08;
      ctx.putImageData(imgData, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    });
  };
  
  return (
    <HtmlInCanvas
      width={720}
      height={1280}
      onPaint={onPaint}
    />
  );
}

export const MoneyStoryShorts = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;
  
  return <GoldenHourglassCanvas frame={frame} progress={progress} />;
};

export const MyComposition = () => {
  return (
    <Composition
      id="MoneyStoryShorts"
      component={MoneyStoryShorts}
      durationInFrames={1800}
      fps={30}
      width={720}
      height={1280}
      calculateMetadata={calculateMetadata}
    />
  );
};

export const MyComponent = () => null;