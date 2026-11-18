import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { zenAudio } from "./utils/zenAudio";

/* ------------------------------------------------------------------ */
/*  Small utilities                                                    */
/* ------------------------------------------------------------------ */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return (s % 100000) / 100000;
  };
}

function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function repeatTex(tex, rx, ry) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(rx, ry);
  return tex;
}

/* ------------------------------------------------------------------ */
/*  Procedural textures                                                */
/* ------------------------------------------------------------------ */
function hexTexture(base, light, edge) {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = edge;
    g.fillRect(0, 0, w, h);
    const r = 17;
    const hw = Math.sqrt(3) * r;
    for (let row = -1; row < h / (1.5 * r) + 1; row++) {
      for (let col = -1; col < w / hw + 1; col++) {
        const cx = col * hw + (row % 2 ? hw / 2 : 0);
        const cy = row * 1.5 * r;
        g.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 3) * k + Math.PI / 6;
          g.lineTo(cx + (r - 2.2) * Math.cos(a), cy + (r - 2.2) * Math.sin(a));
        }
        g.closePath();
        const grd = g.createRadialGradient(cx - 5, cy - 5, 1, cx, cy, r);
        grd.addColorStop(0, light);
        grd.addColorStop(1, base);
        g.fillStyle = grd;
        g.fill();
      }
    }
  });
}

function slatTexture(base, line, horizontal = true) {
  return canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = base;
    g.fillRect(0, 0, w, h);
    g.fillStyle = line;
    for (let i = 0; i < 64; i += 8) {
      if (horizontal) g.fillRect(0, i, w, 3);
      else g.fillRect(i, 0, 3, h);
    }
  });
}

function stripeTexture(a, b, bands = 8) {
  return canvasTex(32, 256, (g, w, h) => {
    for (let i = 0; i < bands; i++) {
      g.fillStyle = i % 2 ? b : a;
      g.fillRect(0, (i * h) / bands, w, h / bands);
    }
  });
}

/* ------------------------------------------------------------------ */
/*  HUD screen painter                                                 */
/* ------------------------------------------------------------------ */
const CY = "#62f0ff";

function ringArc(g, x, y, r, frac, lw) {
  g.lineWidth = 1;
  g.globalAlpha = 0.45;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.stroke();
  g.globalAlpha = 1;
  g.lineWidth = lw;
  g.beginPath();
  g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
  g.stroke();
}


// ------------------------------------------------------------------
// Retro Off-White Desktop Screen (Matched to Reference Image)
// ------------------------------------------------------------------
function playClickSound(freq = 520, duration = 0.05) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
    setTimeout(() => ctx.close(), 150);
  } catch { }
}

// Nav clickable boxes on Home landing screen (generous click padding)
const homeNavBoxes = [
  { id: 'about', label: 'ABOUT', x0: 230, x1: 370, y0: 335, y1: 450 },
  { id: 'experience', label: 'EXPERIENCE', x0: 375, x1: 535, y0: 335, y1: 450 },
  { id: 'projects', label: 'PROJECTS', x0: 540, x1: 665, y0: 335, y1: 450 },
  { id: 'contact', label: 'CONTACT', x0: 670, x1: 810, y0: 335, y1: 450 },
];

// Nav clickable boxes in dedicated section page views
const pageNavBoxes = [
  { id: 'home', label: '◀ HOME', x0: 20, x1: 170, y0: 10, y1: 70 },
  { id: 'about', label: 'ABOUT', x0: 480, x1: 585, y0: 10, y1: 70 },
  { id: 'experience', label: 'EXPERIENCE', x0: 590, x1: 720, y0: 10, y1: 70 },
  { id: 'projects', label: 'PROJECTS', x0: 725, x1: 835, y0: 10, y1: 70 },
  { id: 'contact', label: 'CONTACT', x0: 840, x1: 970, y0: 10, y1: 70 },
  { id: 'home_bottom', label: '◀ RETURN TO HOME', x0: 20, x1: 290, y0: 470, y1: 650 },
];

let maxScrollYAbout = 0;
let maxScrollYExperience = 0;
let maxScrollYProjects = 0;
let ramyHeroImg = null;
let ramy02Img = null;
let ramy03Img = null;

const lovelandPhotos = [
  // Loveland Ski Trip (14 unique photos — all duplicates removed)
  { src: "loveland01.JPG", trip: "Loveland Ski Trip", album: "loveland", title: "Loveland Pass Summit", sub: "Continental Divide • 11,990 FT" },
  { src: "loveland02.JPG", trip: "Loveland Ski Trip", album: "loveland", title: "Alpine Ridge Vista", sub: "Clear Creek County, Colorado" },
  { src: "loveland03.JPG", trip: "Loveland Ski Trip", album: "loveland", title: "Snowbound Peaks", sub: "Loveland Ski Area • Elevation 10,800 FT" },
  { src: "loveland04.jpeg", trip: "Loveland Ski Trip", album: "loveland", title: "Mountain Pass Approach", sub: "Loveland Pass Scenic Byway" },
  { src: "loveland06.jpeg", trip: "Loveland Ski Trip", album: "loveland", title: "Fresh Powder Trails", sub: "Ptarmigan Basin Glades" },
  { src: "loveland07.jpeg", trip: "Loveland Ski Trip", album: "loveland", title: "Overlook Vista", sub: "Looking toward Eisenhower Tunnel" },
  { src: "loveland08.jpeg", trip: "Loveland Ski Trip", album: "loveland", title: "Rocky Mountain Horizon", sub: "Arapaho National Forest" },
  { src: "loveland09.jpeg", trip: "Loveland Ski Trip", album: "loveland", title: "High Alpine Traverse", sub: "Golden Horn Run • Backcountry" },
  { src: "loveland10.jpeg", trip: "Loveland Ski Trip", album: "loveland", title: "Mid-Mountain Cabin", sub: "Warming Hut & Patrol Station" },
  { src: "loveland12.jpg", trip: "Loveland Ski Trip", album: "loveland", title: "Mountain Sunlight", sub: "Chair 9 Summit • 12,700 FT" },
  { src: "loveland1.JPG", trip: "Loveland Ski Trip", album: "loveland", title: "Ski Base Camp", sub: "Loveland Basin Lodge" },
  { src: "loveland2.JPG", trip: "Loveland Ski Trip", album: "loveland", title: "Ski Day Prep", sub: "Gearing up for the first tracks" },
  { src: "loveland9.JPG", trip: "Loveland Ski Trip", album: "loveland", title: "Sunset Glow", sub: "Golden hour over the divide" },
  { src: "loveland10.JPG", trip: "Loveland Ski Trip", album: "loveland", title: "Après-Ski Memories", sub: "Closing out an epic Loveland trip" },
  // Arapahoe Basin Ski Area (8 photos)
  { src: "basin01.JPG", trip: "Arapahoe Basin", album: "basin", title: "Arapahoe Basin Summit", sub: "The Legend • Elevation 13,050 FT" },
  { src: "basin02.jpeg", trip: "Arapahoe Basin", album: "basin", title: "East Wall Panorama", sub: "High Alpine Bowl • Summit County, CO" },
  { src: "basin03.jpeg", trip: "Arapahoe Basin", album: "basin", title: "Pallavicini Ridge", sub: "Steep Chutes & Powder Faces" },
  { src: "basin04.jpeg", trip: "Arapahoe Basin", album: "basin", title: "Lenawee Mountain View", sub: "Above Timberline • White River Forest" },
  { src: "basin05.jpeg", trip: "Arapahoe Basin", album: "basin", title: "Montezuma Bowl", sub: "Backside Wide-Open Corduroy & Powder" },
  { src: "basin06.JPG", trip: "Arapahoe Basin", album: "basin", title: "Zuma Cornice", sub: "Continental Divide High-Altitude Ridge" },
  { src: "basin07.jpg", trip: "Arapahoe Basin", album: "basin", title: "Black Mountain Express", sub: "Mid-Mountain Base & Alpine Slopes" },
  { src: "basin08.JPG", trip: "Arapahoe Basin", album: "basin", title: "A-Basin Golden Hour", sub: "Sunset over the Tenmile Range" },
  // Bear Lake — Rocky Mountain National Park (7 photos)
  { src: "bearlake01.jpg", trip: "Bear Lake", album: "bearlake", title: "Bear Lake Trailhead", sub: "Rocky Mountain National Park, CO" },
  { src: "bearlake02.jpg", trip: "Bear Lake", album: "bearlake", title: "Alpine Lake Reflection", sub: "Hallett Peak & Flattop Mountain" },
  { src: "bearlake03.jpeg", trip: "Bear Lake", album: "bearlake", title: "Subalpine Pine Trail", sub: "Glacier Gorge Corridor" },
  { src: "bearlake04.jpeg", trip: "Bear Lake", album: "bearlake", title: "Emerald Waters", sub: "Elevation 9,475 FT • Estes Park, CO" },
  { src: "bearlake05.jpeg", trip: "Bear Lake", album: "bearlake", title: "Continental Divide Peaks", sub: "Longs Peak & Keyboard of the Winds" },
  { src: "bearlake06.jpeg", trip: "Bear Lake", album: "bearlake", title: "Rocky Mountain Vista", sub: "Bear Lake Loop Trail" },
  { src: "bearlake07.jpeg", trip: "Bear Lake", album: "bearlake", title: "Golden Pines & Granite", sub: "High Country Backcountry Hike" },
];

const lovelandImages = [];
if (typeof window !== "undefined") {
  ramyHeroImg = new Image();
  ramyHeroImg.src = "ramy-hero.jpg";
  ramy02Img = new Image();
  ramy02Img.src = "ramy02.jpg";
  ramy03Img = new Image();
  ramy03Img.src = "ramy03.jpg";

  lovelandPhotos.forEach((item) => {
    const img = new Image();
    img.src = item.src;
    lovelandImages.push(img);
  });
}

const contactForm = {
  name: "",
  email: "",
  company: "",
  message: "",
  activeField: null,
  sent: false,
};

function drawInputBox(g, x, y, w, h, text, placeholder, isActive, t = 0, isMulti = false) {
  g.save();
  // Card background
  g.fillStyle = "#ffffff";
  g.shadowColor = isActive ? "rgba(94, 75, 158, 0.25)" : "rgba(0, 0, 0, 0.05)";
  g.shadowBlur = isActive ? 8 : 4;
  g.shadowOffsetY = 2;
  if (g.roundRect) {
    g.beginPath();
    g.roundRect(x, y, w, h, 4);
    g.fill();
  } else {
    g.fillRect(x, y, w, h);
  }
  g.restore();

  // Border
  g.save();
  g.strokeStyle = isActive ? "#5e4b9e" : "rgba(0, 0, 0, 0.18)";
  g.lineWidth = isActive ? 2 : 1;
  if (g.roundRect) {
    g.beginPath();
    g.roundRect(x, y, w, h, 4);
    g.stroke();
  } else {
    g.strokeRect(x, y, w, h);
  }
  g.restore();

  // Text or Placeholder
  g.save();
  g.font = "14px 'Consolas', monospace";
  if (!text) {
    g.fillStyle = "#888888";
    g.font = "italic 13.5px 'Consolas', monospace";
    g.fillText(placeholder, x + 14, y + (isMulti ? 24 : 24));
  } else {
    g.fillStyle = "#000000";
    if (isMulti) {
      const lines = text.split("\n");
      let lineY = y + 24;
      for (let i = 0; i < lines.length && lineY < y + h - 8; i++) {
        g.fillText(lines[i], x + 14, lineY);
        lineY += 20;
      }
    } else {
      g.fillText(text, x + 14, y + 24);
    }
  }

  // Blinking cursor if active
  if (isActive) {
    let cursorX = x + 14;
    let cursorY = y + 10;
    let cursorH = 18;
    if (text) {
      if (isMulti) {
        const lines = text.split("\n");
        const lastLine = lines[lines.length - 1] || "";
        cursorX += g.measureText(lastLine).width;
        cursorY = y + 8 + (lines.length - 1) * 20;
      } else {
        cursorX += g.measureText(text).width;
      }
    }
    g.fillStyle = "#341f7a";
    g.fillRect(cursorX + 2, cursorY, 2, cursorH);
  }
  g.restore();
}
function drawRetroWebsiteScreen(g, w, h, t, activeTab = 'home', scrollY = 0) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.shadowBlur = 0;

  // 1. Vintage Off-White / Parchment CRT Background
  const bg = g.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, w * 0.72);
  bg.addColorStop(0, "#f4f6f4");
  bg.addColorStop(0.65, "#ebedea");
  bg.addColorStop(1, "#dadfda");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);

  // Subtle paper smudge / cloud texture
  const rngSmudge = rng(42);
  g.save();
  for (let i = 0; i < 10; i++) {
    const sx = w * (0.12 + rngSmudge() * 0.76);
    const sy = h * (0.12 + rngSmudge() * 0.76);
    const sr = 60 + rngSmudge() * 90;
    const sGrad = g.createRadialGradient(sx, sy, 0, sx, sy, sr);
    sGrad.addColorStop(0, rngSmudge() > 0.5 ? "rgba(255,255,255,0.4)" : "rgba(200,210,205,0.18)");
    sGrad.addColorStop(1, "rgba(235,240,237,0)");
    g.fillStyle = sGrad;
    g.beginPath();
    g.arc(sx, sy, sr, 0, Math.PI * 2);
    g.fill();
  }
  g.restore();

  // Fine edge hairline border
  g.strokeStyle = "rgba(0, 0, 0, 0.08)";
  g.lineWidth = 1;
  g.strokeRect(8, 8, w - 16, h - 16);

  // Helper to wrap text cleanly
  const printWrapped = (text, startX, startY, maxW, lineH) => {
    const words = text.split(" ");
    let line = "";
    let currY = startY;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = g.measureText(testLine);
      if (metrics.width > maxW && n > 0) {
        g.fillText(line.trim(), startX, currY);
        line = words[n] + " ";
        currY += lineH;
      } else {
        line = testLine;
      }
    }
    if (line.trim().length > 0) {
      g.fillText(line.trim(), startX, currY);
      currY += lineH;
    }
    return currY;
  };

  // ------------------------------------------------------------------
  // STAGE A: HOME LANDING VIEW (Exact Match to Uploaded Picture)
  // Shows ONLY the title, subtitle, and navigation links. No sections!
  // ------------------------------------------------------------------
  if (activeTab === 'home') {
    const fullName = "Ramy Kassam";
    const fullRole = "Software Engineer";
    const nameChars = t >= 0.85 ? fullName.length : Math.max(0, Math.floor((t / 0.85) * fullName.length));
    const roleChars =
      t < 0.85
        ? 0
        : t >= 1.85
          ? fullRole.length
          : Math.max(0, Math.floor(((t - 0.85) / 1.0) * fullRole.length));
    const shownName = fullName.slice(0, nameChars);
    const shownRole = fullRole.slice(0, roleChars);

    // Main Title: "Ramy Kassam" (Gastromond / Fraunces Display Serif)
    g.save();
    g.fillStyle = "#222222";
    g.font = "900 70px 'gastromond', 'Gastromond', 'Fraunces', Georgia, serif";
    g.textAlign = "center";
    g.fillText(shownName + (t < 0.85 ? "▋" : ""), w / 2, 275);
    g.restore();

    // Subtitle: "Software Engineer" (Typewriter / Monospace)
    if (t >= 0.85) {
      g.save();
      g.fillStyle = "#363636";
      g.font = "bold 24px 'Consolas', 'Courier New', monospace";
      g.textAlign = "center";
      g.fillText(shownRole + (t < 1.85 ? "█" : ""), w / 2, 332);
      g.restore();
    }

    // Navigation Links: ABOUT   EXPERIENCE   PROJECTS   CONTACT
    const navY = 398;
    homeNavBoxes.forEach((link) => {
      const midX = (link.x0 + link.x1) / 2;

      g.save();
      g.textAlign = "center";
      g.font = "bold 17px 'Consolas', 'Courier New', monospace";
      g.fillStyle = "#5e4b9e";
      g.fillText(link.label, midX, navY);

      // Purple underline matching reference image
      const tw = g.measureText(link.label).width;
      g.strokeStyle = "#5e4b9e";
      g.lineWidth = 2.0;
      g.beginPath();
      g.moveTo(midX - tw / 2, navY + 4);
      g.lineTo(midX + tw / 2, navY + 4);
      g.stroke();
      g.restore();
    });

    return; // Don't show any section on the home page!
  }

  // ------------------------------------------------------------------
  // STAGE B: DEDICATED SECTION PAGE VIEWS (Pinned Top Nav)
  // ------------------------------------------------------------------

  // Frosted background to keep top navigation pinned while scrolling
  const topBg = g.createLinearGradient(0, 0, 0, 66);
  topBg.addColorStop(0, "rgba(244, 246, 244, 0.98)");
  topBg.addColorStop(0.85, "rgba(240, 243, 240, 0.96)");
  topBg.addColorStop(1, "rgba(235, 238, 235, 0.94)");
  g.fillStyle = topBg;
  g.fillRect(8, 8, w - 16, 58);

  // Top Navigation Bar
  g.save();
  // Left: [ ◀ HOME ]
  g.fillStyle = "#341f7a";
  g.font = "bold 15px 'Consolas', monospace";
  g.fillText("◀ HOME", 50, 42);
  const homeTw = g.measureText("◀ HOME").width;
  g.strokeStyle = "#341f7a";
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(50, 47);
  g.lineTo(50 + homeTw, 47);
  g.stroke();

  // Right Nav Links
  pageNavBoxes.slice(1, 5).forEach((link) => {
    const isActive = activeTab === link.id;
    const midX = (link.x0 + link.x1) / 2;
    g.textAlign = "center";
    g.font = "bold 14px 'Consolas', monospace";
    g.fillStyle = isActive ? "#221155" : "#5e4b9e";
    g.fillText(link.label, midX, 42);

    const tw = g.measureText(link.label).width;
    g.strokeStyle = isActive ? "#221155" : "#5e4b9e";
    g.lineWidth = isActive ? 2.5 : 1.5;
    g.beginPath();
    g.moveTo(midX - tw / 2, 47);
    g.lineTo(midX + tw / 2, 47);
    g.stroke();
  });
  g.restore();

  // Top Divider Line
  g.strokeStyle = "rgba(0, 0, 0, 0.12)";
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(35, 66);
  g.lineTo(w - 35, 66);
  g.stroke();

  if (activeTab === 'about') {
    // --------------------------------------------------
    // DEDICATED ABOUT SECTION PAGE (Rich Scrollable Story)
    // --------------------------------------------------

    // Clip scrollable content area below the pinned top nav bar
    g.save();
    g.beginPath();
    g.rect(0, 66, w, h - 66);
    g.clip();
    g.translate(0, -scrollY);

    // First Header (Line 1): "Welcome"
    g.save();
    g.fillStyle = "#1e1e1e";
    g.font = "900 46px 'gastromond', 'Gastromond', 'Fraunces', Georgia, serif";
    g.fillText("Welcome", 50, 118);
    g.restore();

    // Second Header (Line 2): "I'm Ramy Kassam"
    g.save();
    g.fillStyle = "#341f7a";
    g.font = "900 32px 'gastromond', 'Gastromond', 'Fraunces', Georgia, serif";
    g.fillText("I'm Ramy Kassam", 50, 160);
    g.restore();

    // Accent line under welcome headers
    g.strokeStyle = "rgba(94, 75, 158, 0.35)";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(50, 178);
    g.lineTo(w - 50, 178);
    g.stroke();

    // Paragraph 1: Role and Expertise
    g.fillStyle = "#000000";
    g.font = "15px 'Consolas', 'Courier New', monospace";
    let curY = 210;
    const p1 = "I'm a software engineer currently working at Vertx Partners, specializing in full stack desktop development, web application development and data analytics. Thank you for checking my portfolio. I really hope you enjoy exploring it as much as I enjoyed building it!";
    curY = printWrapped(p1, 50, curY, w - 100, 24);


    // Section Divider & Header 3: "About Me"
    curY += 34;
    g.save();
    g.fillStyle = "#341f7a";
    g.font = "900 28px 'gastromond', 'Gastromond', 'Fraunces', Georgia, serif";
    g.fillText("About Me", 50, curY);
    const abMeW = g.measureText("About Me").width;
    g.strokeStyle = "rgba(94, 75, 158, 0.3)";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(50 + abMeW + 16, curY - 8);
    g.lineTo(w - 50, curY - 8);
    g.stroke();
    g.restore();

    // Section 1 (Side-by-Side): Paragraphs 1 & 2 on Left, Figure 1 (ramy02.jpg) on Right
    curY += 34;
    const side1StartY = curY;
    const side1Gap = 28;
    const img1W = 280;
    const img1H = Math.round(img1W * (994 / 750)); // 371px (portrait ramy02.jpg)
    const img1X = w - 50 - img1W; // 694px
    const text1W = img1X - 50 - side1Gap; // 616px

    // Story Paragraph 1: San Cristóbal roots (Left column)
    g.fillStyle = "#000000";
    g.font = "14.5px 'Consolas', 'Courier New', monospace";
    const story1 = "I was born in San Cristóbal, a small mountain city in the state of Táchira, Venezuela. From an early age, I was curious about how things worked and why they were designed the way they were. That curiosity naturally evolved into an interest in the intersection of science, technology, and art, where analytical thinking meets creativity.";
    let left1Y = printWrapped(story1, 50, side1StartY, text1W, 23);

    // Story Paragraph 2: Science fair & early passion (Left column)
    left1Y += 16;
    const story2 = "During my second year of high school, I built an ethanol distiller as an alternative fuel source and won that year's science fair. Experiences like this encouraged me to explore how things could be designed, improved, and brought to life. Over time, I began studying programming more seriously while developing a deeper appreciation for the design of everyday objects and the reasoning behind seemingly small details, such as why certain indicators exist and how they communicate information.";
    left1Y = printWrapped(story2, 50, left1Y, text1W, 23);

    // Photo: Figure 1 (ramy02.jpg on Right side alongside Paragraphs 1 & 2)
    const left1Height = left1Y - side1StartY;
    const card1TotalH = img1H + 24;
    const img1Y = side1StartY + Math.max(0, Math.round((left1Height - card1TotalH) / 2));

    if (ramy02Img && ramy02Img.complete && ramy02Img.naturalWidth > 0) {
      g.save();
      g.shadowColor = "rgba(0, 0, 0, 0.12)";
      g.shadowBlur = 14;
      g.shadowOffsetY = 4;
      g.fillStyle = "#ffffff";
      if (g.roundRect) {
        g.beginPath();
        g.roundRect(img1X, img1Y, img1W, img1H, 6);
        g.fill();
      } else {
        g.fillRect(img1X, img1Y, img1W, img1H);
      }
      g.restore();

      g.save();
      if (g.roundRect) {
        g.beginPath();
        g.roundRect(img1X, img1Y, img1W, img1H, 6);
        g.clip();
      }
      g.drawImage(ramy02Img, img1X, img1Y, img1W, img1H);
      g.restore();

      g.save();
      g.strokeStyle = "rgba(0, 0, 0, 0.15)";
      g.lineWidth = 1.5;
      if (g.roundRect) {
        g.beginPath();
        g.roundRect(img1X, img1Y, img1W, img1H, 6);
        g.stroke();
      } else {
        g.strokeRect(img1X, img1Y, img1W, img1H);
      }
      g.restore();
    } else {
      g.save();
      g.fillStyle = "rgba(0, 0, 0, 0.04)";
      g.strokeStyle = "rgba(0, 0, 0, 0.12)";
      g.lineWidth = 1;
      if (g.roundRect) {
        g.beginPath();
        g.roundRect(img1X, img1Y, img1W, img1H, 6);
        g.fill();
        g.stroke();
      } else {
        g.fillRect(img1X, img1Y, img1W, img1H);
        g.strokeRect(img1X, img1Y, img1W, img1H);
      }
      g.fillStyle = "#777777";
      g.font = "italic 13px 'Consolas', monospace";
      g.textAlign = "center";
      g.fillText("Loading ramy02.jpg...", img1X + img1W / 2, img1Y + img1H / 2);
      g.restore();
    }

    // Caption: Figure 1
    g.save();
    g.font = "italic 13px 'Consolas', monospace";
    g.fillStyle = "#555555";
    g.textAlign = "center";
    g.fillText("Figure 1: Me as a kid in San Cristobal", img1X + img1W / 2, img1Y + img1H + 20);
    g.restore();

    curY = Math.max(left1Y, img1Y + card1TotalH) + 24;

    // Story Paragraph 3: University of Colorado Boulder & Vertx Partners (Full width)
    g.fillStyle = "#000000";
    g.font = "14.5px 'Consolas', 'Courier New', monospace";
    const story3 = "This curiosity eventually led me to pursue a degree in Computer Science at the University of Colorado Boulder. During my senior year, I joined Vertx Partners, where I began applying my technical knowledge to real world projects. I continue to work there today, expanding my experience in software development, interface design, and the organization and analysis of complex information.";
    curY = printWrapped(story3, 50, curY, w - 100, 23);

    // Story Paragraph 4: Design philosophy & holistic approach (Full width)
    curY += 16;
    const story4 = "Today, my approach to building things has evolved considerably. When designing user interfaces, I think beyond aesthetics and functionality. I consider geography, culture, accessibility, climate, consistency, contrast, and the different ways people interact with technology. Similarly, when designing databases or identifying relationships between information, I have gathered experience in semantics, word organization, and frequency. I am particularly interested in understanding how individual words and concepts derive their meaning, how they relate to one another, and how those relationships can be preserved to create consistency throughout an analysis.";
    curY = printWrapped(story4, 50, curY, w - 100, 23);

    // Photo: Figure 2 (ramy-hero.jpg centered between Paragraph 4 and Paragraph 5)
    const img2W = Math.min(680, w - 100);
    const img2H = Math.round(img2W * (571 / 1024)); // 379px (landscape ramy-hero.jpg)
    const img2X = (w - img2W) / 2;
    const img2Y = curY + 36;

    if (ramyHeroImg && ramyHeroImg.complete && ramyHeroImg.naturalWidth > 0) {
      g.save();
      g.shadowColor = "rgba(0, 0, 0, 0.12)";
      g.shadowBlur = 14;
      g.shadowOffsetY = 4;
      g.fillStyle = "#ffffff";
      if (g.roundRect) {
        g.beginPath();
        g.roundRect(img2X, img2Y, img2W, img2H, 6);
        g.fill();
      } else {
        g.fillRect(img2X, img2Y, img2W, img2H);
      }
      g.restore();

      g.save();
      if (g.roundRect) {
        g.beginPath();
        g.roundRect(img2X, img2Y, img2W, img2H, 6);
        g.clip();
      }
      g.drawImage(ramyHeroImg, img2X, img2Y, img2W, img2H);
      g.restore();

      g.save();
      g.strokeStyle = "rgba(0, 0, 0, 0.15)";
      g.lineWidth = 1.5;
      if (g.roundRect) {
        g.beginPath();
        g.roundRect(img2X, img2Y, img2W, img2H, 6);
        g.stroke();
      } else {
        g.strokeRect(img2X, img2Y, img2W, img2H);
      }
      g.restore();
    } else {
      g.save();
      g.fillStyle = "rgba(0, 0, 0, 0.04)";
      g.strokeStyle = "rgba(0, 0, 0, 0.12)";
      g.lineWidth = 1;
      if (g.roundRect) {
        g.beginPath();
        g.roundRect(img2X, img2Y, img2W, img2H, 6);
        g.fill();
        g.stroke();
      } else {
        g.fillRect(img2X, img2Y, img2W, img2H);
        g.strokeRect(img2X, img2Y, img2W, img2H);
      }
      g.fillStyle = "#777777";
      g.font = "italic 13px 'Consolas', monospace";
      g.textAlign = "center";
      g.fillText("Loading ramy-hero.jpg...", w / 2, img2Y + img2H / 2);
      g.restore();
    }

    // Caption: Figure 2: Me, in 2023
    g.save();
    g.font = "italic 13px 'Consolas', monospace";
    g.fillStyle = "#555555";
    g.textAlign = "center";
    g.fillText("Figure 2: Me, in 2023", w / 2, img2Y + img2H + 20);
    g.restore();

    curY = img2Y + img2H + 68;

    // Story Paragraph 5: System thinking & cohesive design (Last paragraph, below Figure 2)
    g.fillStyle = "#000000";
    g.font = "14.5px 'Consolas', 'Courier New', monospace";
    const story5 = "Ultimately, I enjoy exploring the underlying logic behind things, whether it is how people interact with an interface or how information is structured and understood. For me, good design and engineering begin with understanding the relationships between individual elements and how they contribute to a larger, cohesive system.";
    curY = printWrapped(story5, 50, curY, w - 100, 23);

    // Section Divider & Header: "My Hobbies"
    curY += 45;
    g.save();
    g.fillStyle = "#341f7a";
    g.font = "900 28px 'gastromond', 'Gastromond', 'Fraunces', Georgia, serif";
    g.fillText("My Hobbies", 50, curY);
    const hobW = g.measureText("My Hobbies").width;
    g.strokeStyle = "rgba(94, 75, 158, 0.3)";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(50 + hobW + 16, curY - 8);
    g.lineTo(w - 50, curY - 8);
    g.stroke();
    g.restore();

    // Section 3 (Side-by-Side): Hobbies Paragraphs on Left, Figure 3 (ramy03.jpg) on Right
    curY += 34;
    const side3StartY = curY;
    const side3Gap = 28;
    const img3W = 280;
    const img3H = Math.round(img3W * (1597 / 1241)); // ~360px (portrait ramy03.jpg)
    const img3X = w - 50 - img3W; // 694px
    const text3W = img3X - 50 - side3Gap; // 616px

    // Hobbies Paragraph 1 (Left column)
    g.fillStyle = "#000000";
    g.font = "14.5px 'Consolas', 'Courier New', monospace";
    const hobP1 = "I have a lot of hobbies that I enjoy doing in my free time. Over the years, I went from practicing karate to playing soccer and competitive tennis. These days, my favorite activities are playing tennis, getting on the court for volleyball, and heading up into the mountains for skiing whenever the winter season hits.";
    let left3Y = printWrapped(hobP1, 50, side3StartY, text3W, 23);

    // Appreciation & Exploration Paragraph 2 (Left column)
    left3Y += 16;
    const hobP2 = "Thanks for reading about me! I hope that you enjoy exploring the rest of my portfolio, the spaceship, and everything it has to offer.";
    left3Y = printWrapped(hobP2, 50, left3Y, text3W, 23);

    // Contact & Questions Paragraph 3 (Left column)
    left3Y += 16;
    const hobP3 = "If you have any questions, I would love to hear them. You can reach through the Contact page or shoot me an email directly at kassamramy27@outlook.com.";
    left3Y = printWrapped(hobP3, 50, left3Y, text3W, 23);

    // Photo: Figure 3 (ramy03.jpg on Right side alongside Hobbies paragraphs)
    const left3Height = left3Y - side3StartY;
    const card3TotalH = img3H + 24;
    const img3Y = side3StartY + Math.max(0, Math.round((left3Height - card3TotalH) / 2));

    if (ramy03Img && ramy03Img.complete && ramy03Img.naturalWidth > 0) {
      g.save();
      g.shadowColor = "rgba(0, 0, 0, 0.12)";
      g.shadowBlur = 14;
      g.shadowOffsetY = 4;
      g.fillStyle = "#ffffff";
      if (g.roundRect) {
        g.beginPath();
        g.roundRect(img3X, img3Y, img3W, img3H, 6);
        g.fill();
      } else {
        g.fillRect(img3X, img3Y, img3W, img3H);
      }
      g.restore();

      g.save();
      if (g.roundRect) {
        g.beginPath();
        g.roundRect(img3X, img3Y, img3W, img3H, 6);
        g.clip();
      }
      g.drawImage(ramy03Img, img3X, img3Y, img3W, img3H);
      g.restore();

      g.save();
      g.strokeStyle = "rgba(0, 0, 0, 0.15)";
      g.lineWidth = 1.5;
      if (g.roundRect) {
        g.beginPath();
        g.roundRect(img3X, img3Y, img3W, img3H, 6);
        g.stroke();
      } else {
        g.strokeRect(img3X, img3Y, img3W, img3H);
      }
      g.restore();
    } else {
      g.save();
      g.fillStyle = "rgba(0, 0, 0, 0.04)";
      g.strokeStyle = "rgba(0, 0, 0, 0.12)";
      g.lineWidth = 1;
      if (g.roundRect) {
        g.beginPath();
        g.roundRect(img3X, img3Y, img3W, img3H, 6);
        g.fill();
        g.stroke();
      } else {
        g.fillRect(img3X, img3Y, img3W, img3H);
        g.strokeRect(img3X, img3Y, img3W, img3H);
      }
      g.fillStyle = "#777777";
      g.font = "italic 13px 'Consolas', monospace";
      g.textAlign = "center";
      g.fillText("Loading ramy03.jpg...", img3X + img3W / 2, img3Y + img3H / 2);
      g.restore();
    }

    // Caption: Figure 3
    g.save();
    g.font = "italic 13px 'Consolas', monospace";
    g.fillStyle = "#555555";
    g.textAlign = "center";
    g.fillText("Figure 3: A photo of me in Karate", img3X + img3W / 2, img3Y + img3H + 20);
    g.restore();

    curY = Math.max(left3Y, img3Y + card3TotalH) + 26;

    // Blinking prompt & Return Link
    curY += 26;
    g.fillStyle = "#5e4b9e";
    g.font = "bold 14px 'Consolas', monospace";
    g.fillText("> READY", 50, curY);
    if (Math.floor(t * 2.5) % 2 === 0) {
      g.fillRect(122, curY - 12, 9, 15);
    }

    // Return to Home button at bottom of story
    curY += 34;
    g.fillStyle = "#341f7a";
    g.font = "bold 14px 'Consolas', monospace";
    g.fillText("◀ RETURN TO HOME", 50, curY);
    const retTw = g.measureText("◀ RETURN TO HOME").width;
    g.strokeStyle = "#341f7a";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(50, curY + 5);
    g.lineTo(50 + retTw, curY + 5);
    g.stroke();

    maxScrollYAbout = Math.max(0, curY + 50 - h);
    g.restore(); // Restore clipping and translation

    // Sleek vintage scrollbar indicator on the right edge
    if (maxScrollYAbout > 0) {
      const trackX = w - 12;
      const trackY = 74;
      const trackH = h - 86;
      g.fillStyle = "rgba(0, 0, 0, 0.06)";
      g.fillRect(trackX, trackY, 4, trackH);

      const thumbH = Math.max(36, (trackH / (trackH + maxScrollYAbout)) * trackH);
      const thumbY = trackY + (Math.min(scrollY, maxScrollYAbout) / maxScrollYAbout) * (trackH - thumbH);
      g.fillStyle = "rgba(94, 75, 158, 0.55)";
      g.beginPath();
      if (g.roundRect) g.roundRect(trackX - 1, thumbY, 6, thumbH, 3);
      else g.fillRect(trackX - 1, thumbY, 6, thumbH);
      g.fill();
    }
  } else if (activeTab === 'experience') {
    // --------------------------------------------------
    // DEDICATED EXPERIENCE SECTION PAGE (Scrollable)
    // --------------------------------------------------

    // Clip scrollable content area below the pinned top nav bar
    g.save();
    g.beginPath();
    g.rect(0, 66, w, h - 66);
    g.clip();
    g.translate(0, -scrollY);

    // --------------------------------------------------
    // TOP RESUME BANNER: "Looking for my resume? Click here to download it."
    // --------------------------------------------------
    g.save();
    g.fillStyle = "rgba(94, 75, 158, 0.08)";
    g.strokeStyle = "rgba(94, 75, 158, 0.28)";
    g.lineWidth = 1.2;
    if (g.roundRect) {
      g.beginPath();
      g.roundRect(50, 82, w - 100, 42, 6);
      g.fill();
      g.stroke();
    } else {
      g.fillRect(50, 82, w - 100, 42);
      g.strokeRect(50, 82, w - 100, 42);
    }

    g.font = "bold 15px 'Consolas', 'Courier New', monospace";
    const prefixTxt = "Looking for my resume? ";
    const linkTxt = "Click here to download it.";
    g.fillStyle = "#1e1e1e";
    g.fillText(prefixTxt, 66, 108);
    const prefixW = g.measureText(prefixTxt).width;

    g.fillStyle = "#341f7a";
    g.fillText(linkTxt, 66 + prefixW, 108);
    const linkW = g.measureText(linkTxt).width;
    g.strokeStyle = "#341f7a";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(66 + prefixW, 112);
    g.lineTo(66 + prefixW + linkW, 112);
    g.stroke();
    g.restore();

    // --------------------------------------------------
    // ENTRY 1: VERTX PARTNERS
    // --------------------------------------------------
    let curY = 166;

    // Header 1: Vertx Partners
    g.save();
    g.fillStyle = "#1e1e1e";
    g.font = "900 32px 'gastromond', 'Gastromond', 'Fraunces', Georgia, serif";
    g.fillText("Vertx Partners", 50, curY);
    g.restore();

    // Below header: Left = Software Developer, Right = Fall 2024 - Current
    curY += 28;
    g.save();
    g.fillStyle = "#341f7a";
    g.font = "bold 17px 'Consolas', monospace";
    g.fillText("Software Developer", 50, curY);

    g.fillStyle = "#555555";
    g.font = "bold 14px 'Consolas', monospace";
    g.textAlign = "right";
    g.fillText("Fall 2024 – Current", w - 50, curY);
    g.restore();

    // Summary Card: Targeted towards department of war data parsing...
    curY += 16;
    const summaryText = "Targeted towards department of war data parsing and finding correlation/relationships, vertx partners is the connecting home of about 500 companies to the budget data.";
    g.save();
    g.fillStyle = "rgba(94, 75, 158, 0.05)";
    g.fillRect(50, curY, w - 100, 52);
    g.strokeStyle = "rgba(94, 75, 158, 0.25)";
    g.lineWidth = 1;
    g.strokeRect(50, curY, w - 100, 52);

    g.fillStyle = "#000000";
    g.font = "italic 13.5px 'Consolas', 'Courier New', monospace";
    printWrapped(summaryText, 64, curY + 22, w - 128, 20);
    g.restore();

    curY += 72;

    // Bullet points from resume
    const vertxBullets = [
      "Cut average API response time from 350ms to 120ms. A 66% reduction, by refactoring caching layers and introducing parallel request handling.",
      "Designed and shipped 20+ new tools and interface features, expanding application capabilities and contributing to a reported 20% increase in customer satisfaction.",
      "Built and maintained web server components and REST APIs supporting reliable, repeatable feature delivery.",
      "Designed and managed CI/CD pipelines that automated the release process, removing roughly 20 hours of manual work per week and improving deployment consistency.",
      "Diagnosed and resolved major production defects across the stack, improving overall application stability and reducing recurring issues."
    ];

    g.font = "14px 'Consolas', 'Courier New', monospace";
    vertxBullets.forEach((bullet) => {
      g.fillStyle = "#5e4b9e";
      g.fillText("•", 52, curY);

      g.fillStyle = "#000000";
      curY = printWrapped(bullet, 70, curY, w - 125, 22);
      curY += 10;
    });

    // Technologies line
    curY += 4;
    g.save();
    g.fillStyle = "#341f7a";
    g.font = "bold 13px 'Consolas', monospace";
    g.fillText("Technologies: ", 70, curY);
    const techL1 = g.measureText("Technologies: ").width;
    g.fillStyle = "#555555";
    g.font = "13px 'Consolas', monospace";
    g.fillText("Python, Django, JavaScript, ElectronJS, HTML & CSS, CI/CD, Docker", 70 + techL1, curY);
    g.restore();

    // --------------------------------------------------
    // ENTRY 2: CU NIGHT RIDE
    // --------------------------------------------------
    curY += 44;
    g.strokeStyle = "rgba(0, 0, 0, 0.08)";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(50, curY);
    g.lineTo(w - 50, curY);
    g.stroke();

    curY += 32;
    g.save();
    g.fillStyle = "#1e1e1e";
    g.font = "900 24px 'gastromond', 'Gastromond', 'Fraunces', Georgia, serif";
    g.fillText("CU Night Ride — University of Colorado Boulder", 50, curY);

    g.fillStyle = "#666666";
    g.font = "bold 13.5px 'Consolas', monospace";
    g.textAlign = "right";
    g.fillText("04/2022 – 03/2024", w - 50, curY - 2);
    g.restore();

    curY += 24;
    g.save();
    g.fillStyle = "#341f7a";
    g.font = "bold 15px 'Consolas', monospace";
    g.fillText("Manager", 50, curY);
    g.restore();

    curY += 18;
    const cuBullets = [
      "Managed nightly student transportation operations, directing a shift team of 10+ within a 30–40 person staff and enforcing safety and operational protocols.",
      "Trained, onboarded, and mentored new employees, establishing performance expectations and promoting a culture of accountability and teamwork.",
      "Served as a primary point of contact for staff and students, resolving concerns and communicating operational updates.",
      "Coordinated resources and staffing levels to accommodate fluctuating service demand and maintain consistent service coverage.",
      "Named Employee of the Semester for leadership and performance; coordinated scheduling across a rotating student roster to maintain uninterrupted nightly service."
    ];
    g.font = "14px 'Consolas', 'Courier New', monospace";
    cuBullets.forEach((bullet) => {
      g.fillStyle = "#5e4b9e";
      g.fillText("•", 52, curY);
      g.fillStyle = "#000000";
      curY = printWrapped(bullet, 70, curY, w - 125, 22);
      curY += 10;
    });

    // --------------------------------------------------
    // ENTRY 3: LAVNER EDUCATION
    // --------------------------------------------------
    curY += 32;
    g.strokeStyle = "rgba(0, 0, 0, 0.08)";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(50, curY);
    g.lineTo(w - 50, curY);
    g.stroke();

    curY += 32;
    g.save();
    g.fillStyle = "#1e1e1e";
    g.font = "900 24px 'gastromond', 'Gastromond', 'Fraunces', Georgia, serif";
    g.fillText("Lavner Education", 50, curY);

    g.fillStyle = "#666666";
    g.font = "bold 13.5px 'Consolas', monospace";
    g.textAlign = "right";
    g.fillText("06/2023 – 08/2023", w - 50, curY - 2);
    g.restore();

    curY += 24;
    g.save();
    g.fillStyle = "#341f7a";
    g.font = "bold 15px 'Consolas', monospace";
    g.fillText("IT Intern", 50, curY);
    g.restore();

    curY += 18;
    const lavnerBullets = [
      "Led students through technical programs in coding, video production, and STEM hardware projects, translating complex concepts for a wide age range.",
      "Maintained and troubleshot lab computers and software installations, resolving hardware and software issues to keep daily camp operations running.",
      "Documented technical issues, troubleshooting procedures, and resolutions to improve IT support efficiency and knowledge sharing.",
      "Assisted with the setup, configuration, deployment, and maintenance of computers, laptops, peripherals, and other IT equipment."
    ];
    g.font = "14px 'Consolas', 'Courier New', monospace";
    lavnerBullets.forEach((bullet) => {
      g.fillStyle = "#5e4b9e";
      g.fillText("•", 52, curY);
      g.fillStyle = "#000000";
      curY = printWrapped(bullet, 70, curY, w - 125, 22);
      curY += 10;
    });

    curY += 4;
    g.save();
    g.fillStyle = "#341f7a";
    g.font = "bold 13px 'Consolas', monospace";
    g.fillText("Technologies: ", 70, curY);
    const techL2 = g.measureText("Technologies: ").width;
    g.fillStyle = "#555555";
    g.font = "13px 'Consolas', monospace";
    g.fillText("Python, C++, Scratch, Roblox Studio", 70 + techL2, curY);
    g.restore();

    // Blinking prompt & Return Link
    curY += 36;
    g.fillStyle = "#5e4b9e";
    g.font = "bold 14px 'Consolas', monospace";
    g.fillText("> READY", 50, curY);
    if (Math.floor(t * 2.5) % 2 === 0) {
      g.fillRect(122, curY - 12, 9, 15);
    }

    curY += 34;
    g.fillStyle = "#341f7a";
    g.font = "bold 14px 'Consolas', monospace";
    g.fillText("◀ RETURN TO HOME", 50, curY);
    const retTw = g.measureText("◀ RETURN TO HOME").width;
    g.strokeStyle = "#341f7a";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(50, curY + 5);
    g.lineTo(50 + retTw, curY + 5);
    g.stroke();

    maxScrollYExperience = Math.max(0, curY + 50 - h);
    g.restore(); // Restore clipping and translation

    // Sleek vintage scrollbar indicator on the right edge
    if (maxScrollYExperience > 0) {
      const trackX = w - 12;
      const trackY = 74;
      const trackH = h - 86;
      g.fillStyle = "rgba(0, 0, 0, 0.06)";
      g.fillRect(trackX, trackY, 4, trackH);

      const thumbH = Math.max(36, (trackH / (trackH + maxScrollYExperience)) * trackH);
      const thumbY = trackY + (Math.min(scrollY, maxScrollYExperience) / maxScrollYExperience) * (trackH - thumbH);
      g.fillStyle = "rgba(94, 75, 158, 0.55)";
      g.beginPath();
      if (g.roundRect) g.roundRect(trackX - 1, thumbY, 6, thumbH, 3);
      else g.fillRect(trackX - 1, thumbY, 6, thumbH);
      g.fill();
    }
  } else if (activeTab === 'projects') {
    // --------------------------------------------------
    // DEDICATED PROJECTS SECTION PAGE (Scrollable)
    // --------------------------------------------------

    // Clip scrollable content area below the pinned top nav bar
    g.save();
    g.beginPath();
    g.rect(0, 66, w, h - 66);
    g.clip();
    g.translate(0, -scrollY);

    let curY = 114;

    // Header: "Projects"
    g.save();
    g.fillStyle = "#1e1e1e";
    g.font = "900 44px 'gastromond', 'Gastromond', 'Fraunces', Georgia, serif";
    g.fillText("Projects", 50, curY);
    g.restore();

    curY += 14;
    g.strokeStyle = "rgba(94, 75, 158, 0.35)";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(50, curY);
    g.lineTo(w - 50, curY);
    g.stroke();

    // --------------------------------------------------
    // PROJECT 1: MARKET ANALYSIS & SALES FORECASTING
    // --------------------------------------------------
    curY += 46;

    g.save();
    g.fillStyle = "#1e1e1e";
    g.font = "900 28px 'gastromond', 'Gastromond', 'Fraunces', Georgia, serif";
    g.fillText("Market Analysis & Sales Forecasting", 50, curY);

    // Right side: Research report PDF link
    g.font = "bold 13.5px 'Consolas', monospace";
    g.fillStyle = "#5e4b9e";
    g.textAlign = "right";
    const reportLink = "Research Report PDF ↗";
    g.fillText(reportLink, w - 50, curY - 5);
    const reportW = g.measureText(reportLink).width;
    g.strokeStyle = "#5e4b9e";
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(w - 50 - reportW, curY - 1);
    g.lineTo(w - 50, curY - 1);
    g.stroke();
    g.restore();

    // Subtitle & Date
    curY += 26;
    g.save();
    g.fillStyle = "#341f7a";
    g.font = "bold 16px 'Consolas', monospace";
    g.fillText("Data Analytics & Machine Learning Project — CU Boulder", 50, curY);

    g.fillStyle = "#555555";
    g.font = "bold 14px 'Consolas', monospace";
    g.textAlign = "right";
    g.fillText("Fall 2023", w - 50, curY);
    g.restore();

    // Summary Card
    curY += 16;
    const marketSummary = "Conducted an extensive market analysis and retail sales forecasting study using the FoodMart supermarket dataset to uncover the key operational, geographical, and expenditure drivers of store profitability.";
    g.save();
    g.fillStyle = "rgba(94, 75, 158, 0.05)";
    g.fillRect(50, curY, w - 100, 52);
    g.strokeStyle = "rgba(94, 75, 158, 0.25)";
    g.lineWidth = 1;
    g.strokeRect(50, curY, w - 100, 52);

    g.fillStyle = "#000000";
    g.font = "italic 13.5px 'Consolas', 'Courier New', monospace";
    printWrapped(marketSummary, 64, curY + 22, w - 128, 20);
    g.restore();

    curY += 72;

    // Bullet points
    const marketBullets = [
      "Engineered multi-variable feature pipelines incorporating wage-per-staff ratios, customer basket metrics, store location types, and advertising budget allocations.",
      "Applied dual z-score and IQR outlier detection alongside MinMax normalization and Variance Inflation Factor (VIF) filtering to eliminate multicollinearity and prevent model overfitting.",
      "Trained and evaluated multiple regression algorithms — Random Forest, XGBoost, Decision Trees, SVR, and Multivariate Linear Regression — using 5-fold cross-validation.",
      "Achieved top model performance with Random Forest (R² = 0.526, MSE = 0.0232), demonstrating that local competitor density and promotional spend are the primary determinants of gross profit ratio."
    ];

    g.font = "14px 'Consolas', 'Courier New', monospace";
    marketBullets.forEach((bullet) => {
      g.fillStyle = "#5e4b9e";
      g.fillText("•", 52, curY);
      g.fillStyle = "#000000";
      curY = printWrapped(bullet, 70, curY, w - 125, 22);
      curY += 10;
    });

    // Technologies
    curY += 4;
    g.save();
    g.fillStyle = "#341f7a";
    g.font = "bold 13px 'Consolas', monospace";
    g.fillText("Technologies: ", 70, curY);
    const techMarketW = g.measureText("Technologies: ").width;
    g.fillStyle = "#555555";
    g.font = "13px 'Consolas', monospace";
    g.fillText("Python, Pandas, NumPy, Scikit-learn, Random Forest, XGBoost, Matplotlib, Seaborn, VIF Regression Analysis", 70 + techMarketW, curY);
    g.restore();

    // --------------------------------------------------
    // PROJECT 2: PARKPAL
    // --------------------------------------------------
    curY += 44;
    g.strokeStyle = "rgba(0, 0, 0, 0.08)";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(50, curY);
    g.lineTo(w - 50, curY);
    g.stroke();

    curY += 32;
    g.save();
    g.fillStyle = "#1e1e1e";
    g.font = "900 26px 'gastromond', 'Gastromond', 'Fraunces', Georgia, serif";
    g.fillText("ParkPal — Human-Computer Interaction Project", 50, curY);

    g.fillStyle = "#555555";
    g.font = "bold 14px 'Consolas', monospace";
    g.textAlign = "right";
    g.fillText("Spring 2022", w - 50, curY - 2);
    g.restore();

    curY += 24;
    g.save();
    g.fillStyle = "#341f7a";
    g.font = "bold 15px 'Consolas', monospace";
    g.fillText("Awarded \"Most Useful Project\" — CU Boulder Course Expo", 50, curY);
    g.restore();

    curY += 18;
    const parkPalBullets = [
      "Designed and prototyped a user-centered application for locating and managing parking, from concept through evaluated interactive prototypes in Figma.",
      "Ran usability testing with 50+ participants and iterated on analyzed feedback; awarded \"Most Useful Project\" at the course expo.",
      "Modeled user personas, task flows, and interactive mockups to optimize accessibility and minimize cognitive load during navigation."
    ];

    g.font = "14px 'Consolas', 'Courier New', monospace";
    parkPalBullets.forEach((bullet) => {
      g.fillStyle = "#5e4b9e";
      g.fillText("•", 52, curY);
      g.fillStyle = "#000000";
      curY = printWrapped(bullet, 70, curY, w - 125, 22);
      curY += 10;
    });

    curY += 4;
    g.save();
    g.fillStyle = "#341f7a";
    g.font = "bold 13px 'Consolas', monospace";
    g.fillText("Technologies: ", 70, curY);
    const techParkW = g.measureText("Technologies: ").width;
    g.fillStyle = "#555555";
    g.font = "13px 'Consolas', monospace";
    g.fillText("Figma, User Research, Usability Testing, Interactive Prototyping, Wireframing", 70 + techParkW, curY);
    g.restore();

    // Blinking prompt & Return Link
    curY += 36;
    g.fillStyle = "#5e4b9e";
    g.font = "bold 14px 'Consolas', monospace";
    g.fillText("> READY", 50, curY);
    if (Math.floor(t * 2.5) % 2 === 0) {
      g.fillRect(122, curY - 12, 9, 15);
    }

    curY += 34;
    g.fillStyle = "#341f7a";
    g.font = "bold 14px 'Consolas', monospace";
    g.fillText("◀ RETURN TO HOME", 50, curY);
    const retTw = g.measureText("◀ RETURN TO HOME").width;
    g.strokeStyle = "#341f7a";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(50, curY + 5);
    g.lineTo(50 + retTw, curY + 5);
    g.stroke();

    g.restore(); // restore clip and translate

    // Sleek vintage scrollbar indicator on the right edge
    maxScrollYProjects = Math.max(0, curY + 50 - h);
    if (maxScrollYProjects > 0) {
      const trackX = w - 12;
      const trackY = 74;
      const trackH = h - 86;
      g.fillStyle = "rgba(0, 0, 0, 0.06)";
      g.fillRect(trackX, trackY, 4, trackH);

      const thumbH = Math.max(36, (trackH / (trackH + maxScrollYProjects)) * trackH);
      const thumbY = trackY + (Math.min(scrollY, maxScrollYProjects) / maxScrollYProjects) * (trackH - thumbH);
      g.fillStyle = "rgba(94, 75, 158, 0.55)";
      g.beginPath();
      if (g.roundRect) g.roundRect(trackX - 1, thumbY, 6, thumbH, 3);
      else g.fillRect(trackX - 1, thumbY, 6, thumbH);
      g.fill();
    }
  } else if (activeTab === 'contact') {
    // --------------------------------------------------
    // DEDICATED CONTACT SECTION PAGE
    // --------------------------------------------------
    let curY = 104;

    // Header: "Contact"
    g.save();
    g.fillStyle = "#1e1e1e";
    g.font = "900 42px 'gastromond', 'Gastromond', 'Fraunces', Georgia, serif";
    g.fillText("Contact", 50, curY);
    g.restore();

    // Accent line under header
    curY += 12;
    g.strokeStyle = "rgba(94, 75, 158, 0.35)";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(50, curY);
    g.lineTo(w - 50, curY);
    g.stroke();

    // Subtitle paragraph
    curY += 24;
    g.fillStyle = "#000000";
    g.font = "14.5px 'Consolas', 'Courier New', monospace";
    const contactIntro = "Feel free to reach out! I'd love to chat, you can reach me at my personal email or fill out the form below!";
    curY = printWrapped(contactIntro, 50, curY, w - 100, 22);

    // Direct email line
    curY += 16;
    g.font = "bold 15px 'Consolas', monospace";
    g.fillStyle = "#000000";
    g.fillText("Email: ", 50, curY);
    const emailPrefixW = g.measureText("Email: ").width;

    g.fillStyle = "#341f7a";
    const emailAddr = "kassamramy27@outlook.com";
    g.fillText(emailAddr, 50 + emailPrefixW, curY);
    const emailAddrW = g.measureText(emailAddr).width;
    g.strokeStyle = "rgba(52, 31, 122, 0.45)";
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(50 + emailPrefixW, curY + 3);
    g.lineTo(50 + emailPrefixW + emailAddrW, curY + 3);
    g.stroke();

    // Form layout - Spacious margins and clean separation between bars
    curY += 24;
    const boxH = 38;
    const colW = 390;
    const colGap = 36;
    const leftX = 50;
    const rightX = leftX + colW + colGap; // 476
    const fullFormW = colW * 2 + colGap; // 816px

    // Field 1: Your name (Left)
    g.fillStyle = "#341f7a";
    g.font = "bold 13.5px 'Consolas', monospace";
    g.fillText("Your name:", leftX, curY);

    const nameBoxY = curY + 8;
    const isNameActive = contactForm.activeField === 'name';
    drawInputBox(g, leftX, nameBoxY, colW, boxH, contactForm.name, "Enter your name...", isNameActive, t);

    // Field 2: Email (Right)
    g.fillStyle = "#341f7a";
    g.font = "bold 13.5px 'Consolas', monospace";
    g.fillText("Email:", rightX, curY);

    const emailBoxY = curY + 8;
    const isEmailActive = contactForm.activeField === 'email';
    drawInputBox(g, rightX, emailBoxY, colW, boxH, contactForm.email, "Enter your email address...", isEmailActive, t);

    // Row 2: Company (optional) - Generous 22px margin below previous boxes
    curY = nameBoxY + boxH + 22;
    g.fillStyle = "#341f7a";
    g.font = "bold 13.5px 'Consolas', monospace";
    g.fillText("Company (optional):", leftX, curY);

    const compBoxY = curY + 8;
    const isCompActive = contactForm.activeField === 'company';
    drawInputBox(g, leftX, compBoxY, fullFormW, boxH, contactForm.company, "Company or organization name...", isCompActive, t);

    // Row 3: Message - Generous 22px margin below previous box
    curY = compBoxY + boxH + 22;
    g.fillStyle = "#341f7a";
    g.font = "bold 13.5px 'Consolas', monospace";
    g.fillText("Message:", leftX, curY);

    const msgBoxY = curY + 8;
    const isMsgActive = contactForm.activeField === 'message';
    drawInputBox(g, leftX, msgBoxY, fullFormW, 86, contactForm.message, "Write your message here...", isMsgActive, t, true);

    // Row 4: Submit Button & Status - Generous 26px margin below message box
    curY = msgBoxY + 86 + 26;
    const btnW = 190;
    const btnH = 38;
    g.save();
    g.fillStyle = "#341f7a";
    if (g.roundRect) {
      g.beginPath();
      g.roundRect(leftX, curY, btnW, btnH, 5);
      g.fill();
    } else {
      g.fillRect(leftX, curY, btnW, btnH);
    }
    g.fillStyle = "#ffffff";
    g.font = "bold 13px 'Consolas', monospace";
    g.textAlign = "center";
    g.fillText("SEND MESSAGE ✉", leftX + btnW / 2, curY + 24);
    g.restore();

    if (contactForm.sent) {
      g.save();
      g.fillStyle = "#1e7e34";
      g.font = "bold 13.5px 'Consolas', monospace";
      g.fillText("✓ Transmission opened in your email client!", leftX + btnW + 20, curY + 24);
      g.restore();
    }

    // Return to Home - Comfortable 54px margin
    curY += 54;
    g.fillStyle = "#341f7a";
    g.font = "bold 14px 'Consolas', monospace";
    g.fillText("◀ RETURN TO HOME", 50, curY);
    const retTw = g.measureText("◀ RETURN TO HOME").width;
    g.strokeStyle = "#341f7a";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(50, curY + 5);
    g.lineTo(50 + retTw, curY + 5);
    g.stroke();
  }
}

function drawHUD(g, w, h, variant, t, activeTab = "home", scrollY = 0) {
  if (variant === 5) {
    drawRetroWebsiteScreen(g, w, h, t, activeTab, scrollY);
    return;
  }

  const R = rng(variant * 7919 + 101);
  const s = Math.min(w, h);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.shadowBlur = 0;

  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#073541");
  bg.addColorStop(1, "#021216");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);

  g.strokeStyle = "rgba(98,240,255,0.07)";
  g.lineWidth = 1;
  for (let x = 0; x < w; x += 18) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (let y = 0; y < h; y += 18) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }

  g.strokeStyle = CY;
  g.fillStyle = CY;
  g.shadowColor = CY;
  g.shadowBlur = 8;
  g.lineWidth = 2;
  g.strokeRect(5, 5, w - 10, h - 10);
  const b = s * 0.09;
  g.lineWidth = 4;
  for (const [x, y, sx, sy] of [[10, 10, 1, 1], [w - 10, 10, -1, 1], [10, h - 10, 1, -1], [w - 10, h - 10, -1, -1]]) {
    g.beginPath();
    g.moveTo(x, y + sy * b);
    g.lineTo(x, y);
    g.lineTo(x + sx * b, y);
    g.stroke();
  }
  const fs = Math.max(10, Math.round(s * 0.075));
  g.font = `bold ${fs}px monospace`;

  const bars = (x, y, n, mw, gap) => {
    for (let i = 0; i < n; i++) {
      g.globalAlpha = 0.85;
      g.fillRect(x, y + i * gap, mw * (0.3 + 0.7 * R()), gap * 0.55);
    }
    g.globalAlpha = 1;
  };
  const lines = (x, y, n, mw, gap) => {
    for (let i = 0; i < n; i++) {
      g.globalAlpha = 0.6;
      g.fillRect(x, y + i * gap, mw * (0.35 + 0.65 * R()), Math.max(2, gap * 0.2));
    }
    g.globalAlpha = 1;
  };
  const wave = (x, y, ww, amp, ph) => {
    g.lineWidth = 2;
    g.beginPath();
    for (let i = 0; i <= ww; i += 3) {
      const v = Math.sin(i * 0.09 + ph) * Math.sin(i * 0.021 + ph * 0.3);
      if (i === 0) g.moveTo(x + i, y + v * amp);
      else g.lineTo(x + i, y + v * amp);
    }
    g.stroke();
  };
  const progress = (x, y, ww, hh, f) => {
    g.lineWidth = 2;
    g.strokeRect(x, y, ww, hh);
    const n = Math.floor(clamp(f, 0, 1) * 14);
    for (let i = 0; i < n; i++) g.fillRect(x + 3 + (i * (ww - 6)) / 14, y + 3, (ww - 6) / 14 - 3, hh - 6);
  };

  if (variant === 0) {
    // radar
    const cx = w * 0.3, cy = h * 0.52, r = h * 0.38;
    for (let k = 1; k <= 4; k++) ringArc(g, cx, cy, (r * k) / 4, 0.55 + 0.45 * R(), k === 4 ? 5 : 2);
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(cx - r, cy); g.lineTo(cx + r, cy);
    g.moveTo(cx, cy - r); g.lineTo(cx, cy + r);
    g.stroke();
    const a = t * 1.4;
    g.globalAlpha = 0.28;
    g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, a - 0.7, a); g.closePath(); g.fill();
    g.globalAlpha = 1;
    g.lineWidth = 2;
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.stroke();
    for (let i = 0; i < 6; i++) {
      const ba = R() * Math.PI * 2, br = R() * r * 0.9;
      g.beginPath(); g.arc(cx + Math.cos(ba) * br, cy + Math.sin(ba) * br, 3, 0, Math.PI * 2); g.fill();
    }
    ringArc(g, w * 0.7, h * 0.32, h * 0.17, 0.72, 4);
    ringArc(g, w * 0.7, h * 0.32, h * 0.1, 0.4 + 0.3 * Math.sin(t), 2);
    bars(w * 0.58, h * 0.58, 5, w * 0.34, h * 0.07);
    g.fillText("NAV-07", w * 0.8, h * 0.18);
  } else if (variant === 1) {
    // wide scanner with hexagon schematic
    const cx = w * 0.62, cy = h * 0.5, r = h * 0.38;
    const hex = (rr) => {
      g.beginPath();
      for (let k = 0; k < 6; k++) {
        const an = (Math.PI / 3) * k - Math.PI / 2;
        const px = cx + Math.cos(an) * rr, py = cy + Math.sin(an) * rr;
        if (k) g.lineTo(px, py); else g.moveTo(px, py);
      }
      g.closePath();
      g.stroke();
    };
    g.lineWidth = 3; hex(r);
    g.lineWidth = 2; hex(r * 0.62);
    g.beginPath();
    for (const an of [-Math.PI / 2, Math.PI / 6, (Math.PI * 5) / 6]) {
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(an) * r * 0.62, cy + Math.sin(an) * r * 0.62);
    }
    g.moveTo(cx - r * 0.87, cy); g.lineTo(cx - r * 1.5, cy);
    g.moveTo(cx + r * 0.87, cy); g.lineTo(cx + r * 1.5, cy);
    g.stroke();
    g.save();
    g.translate(w * 0.37, h * 0.86);
    g.rotate(-Math.PI / 2);
    g.fillText("SCANNING" + ".".repeat(1 + (Math.floor(t * 2) % 3)), 0, 0);
    g.restore();
    bars(w * 0.06, h * 0.18, 8, w * 0.2, h * 0.085);
    ringArc(g, w * 0.45, h * 0.3, h * 0.12, 0.6, 3);
    ringArc(g, w * 0.45, h * 0.68, h * 0.1, 0.5 + 0.4 * Math.abs(Math.sin(t * 0.7)), 3);
    const sy = cy - r + ((t * 30) % (2 * r));
    g.globalAlpha = 0.55;
    g.fillRect(cx - r * 1.3, sy, r * 2.6, 2);
    g.globalAlpha = 1;
    lines(w * 0.83, h * 0.2, 7, w * 0.12, h * 0.09);
  } else if (variant === 2) {
    // gauge cluster
    for (let i = 0; i < 9; i++) {
      const col = i % 3, row = Math.floor(i / 3);
      ringArc(g, w * (0.12 + col * 0.14), h * (0.2 + row * 0.22), h * 0.075, 0.25 + 0.7 * Math.abs(Math.sin(t * 0.4 + i * 1.3)), 3);
    }
    bars(w * 0.5, h * 0.12, 6, w * 0.12, h * 0.05);
    lines(w * 0.7, h * 0.12, 9, w * 0.24, h * 0.065);
    ringArc(g, w * 0.6, h * 0.66, h * 0.13, 0.66 + 0.2 * Math.sin(t * 0.6), 6);
    wave(w * 0.08, h * 0.86, w * 0.42, h * 0.035, t * 2);
    progress(w * 0.72, h * 0.8, w * 0.22, h * 0.09, 0.5 + 0.45 * Math.sin(t * 0.3));
  } else if (variant === 3) {
    // data / telemetry
    bars(w * 0.08, h * 0.1, 4, w * 0.35, h * 0.06);
    for (let i = 0; i < 9; i++) {
      const hh = h * 0.22 * (0.3 + 0.7 * Math.abs(Math.sin(t * 0.8 + i)));
      g.globalAlpha = 0.85;
      g.fillRect(w * 0.55 + i * w * 0.045, h * 0.38 - hh, w * 0.028, hh);
    }
    g.globalAlpha = 1;
    wave(w * 0.08, h * 0.55, w * 0.84, h * 0.1, t * 3);
    lines(w * 0.08, h * 0.72, 3, w * 0.55, h * 0.06);
    progress(w * 0.08, h * 0.88, w * 0.84, h * 0.06, 0.4 + 0.5 * Math.abs(Math.sin(t * 0.25)));
  } else if (variant === 5) {
    // MAIN COMPUTER TERMINAL
    // Header with font-family: gastromond, sans-serif
    // Expansive 3-column dossier sections (About, Experience, Projects) spanning full width
    const pad = 24;

    // ----------------------------------------------------
    // TOP HEADER
    // ----------------------------------------------------
    // Pilot Name in font-family: gastromond, sans-serif
    g.save();
    g.shadowColor = CY;
    g.shadowBlur = 16;
    g.fillStyle = CY;
    g.font = "bold 44px 'gastromond', 'Gastromond', sans-serif";
    g.fillText("RAMY KASSAM", pad + 6, pad + 38);
    g.restore();

    // Subtitle below name
    g.fillStyle = "#ffa030";
    g.font = "bold 13px monospace";
    g.fillText("SOFTWARE ARCHITECT & ENGINEER // FLIGHT TERMINAL", pad + 8, pad + 60);

    // Status Pill in Top Right
    const stText = (Math.floor(t * 2) % 2 === 0) ? "● SYS ONLINE" : "● SYS NOMINAL";
    g.font = "bold 13px monospace";
    const stW = g.measureText(stText).width;
    const stX = w - pad - stW - 24;
    const stY = pad + 14;
    g.fillStyle = "rgba(4, 28, 36, 0.85)";
    g.fillRect(stX, stY, stW + 24, 30);
    g.strokeStyle = (Math.floor(t * 2) % 2 === 0) ? CY : "#ffa030";
    g.lineWidth = 1.5;
    g.strokeRect(stX, stY, stW + 24, 30);
    g.fillStyle = (Math.floor(t * 2) % 2 === 0) ? CY : "#ffa030";
    g.fillText(stText, stX + 12, stY + 20);

    // Full-Width Tech Divider Line
    const divY = pad + 76;
    g.strokeStyle = "rgba(98, 240, 255, 0.35)";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(pad + 6, divY);
    g.lineTo(w - pad - 6, divY);
    g.stroke();
    // Glowing accent end-notches
    g.fillStyle = CY;
    g.fillRect(pad + 6, divY - 2, 45, 4);
    g.fillRect(w - pad - 51, divY - 2, 45, 4);
    g.fillRect(Math.round(w / 2) - 20, divY - 2, 40, 4);

    // ----------------------------------------------------
    // 3 EXPANDED SECTION COLUMNS: ABOUT, EXPERIENCE, PROJECTS
    // ----------------------------------------------------
    const secDefs = [
      {
        num: "01",
        label: "ABOUT",
        tag: "[ BIO-PROFILE // ACTIVE ]",
        sub: "MODULE // SOFTWARE ARCHITECT",
        note: "",
        footer: "SECURITY: CLEARANCE L-4 • ONLINE"
      },
      {
        num: "02",
        label: "EXPERIENCE",
        tag: "[ CAREER LOGS // STANDBY ]",
        sub: "MODULE // FLIGHT & CAREER LOGS",
        note: "AWAITING MISSION LOG ARCHIVES",
        footer: "LOG ENTRIES: UNCOMMITTED • STANDBY"
      },
      {
        num: "03",
        label: "PROJECTS",
        tag: "[ PAYLOADS // STANDBY ]",
        sub: "MODULE // REPO & SYSTEM PAYLOADS",
        note: "AWAITING PAYLOAD MODULES",
        footer: "DEPLOYMENTS: IDLE • STANDBY"
      }
    ];

    const cardsTop = divY + 16;
    const cardsBottom = h - pad - 24;
    const cardH = cardsBottom - cardsTop;
    const totalW = w - (pad + 6) * 2;
    const gap = 18;
    const cardW = Math.floor((totalW - gap * 2) / 3);

    secDefs.forEach((sec, idx) => {
      const cx = pad + 6 + idx * (cardW + gap);
      const cy = cardsTop;

      // Card Background Glass
      g.fillStyle = "rgba(2, 22, 28, 0.72)";
      g.fillRect(cx, cy, cardW, cardH);

      // Card Outer Border
      g.strokeStyle = "rgba(98, 240, 255, 0.35)";
      g.lineWidth = 1.5;
      g.strokeRect(cx, cy, cardW, cardH);

      // Corner Brackets
      const cb = 18;
      g.strokeStyle = CY;
      g.lineWidth = 2.5;
      g.beginPath();
      // top-left
      g.moveTo(cx, cy + cb); g.lineTo(cx, cy); g.lineTo(cx + cb, cy);
      // top-right
      g.moveTo(cx + cardW - cb, cy); g.lineTo(cx + cardW, cy); g.lineTo(cx + cardW, cy + cb);
      // bottom-left
      g.moveTo(cx, cy + cardH - cb); g.lineTo(cx, cy + cardH); g.lineTo(cx + cb, cy + cardH);
      // bottom-right
      g.moveTo(cx + cardW - cb, cy + cardH); g.lineTo(cx + cardW, cy + cardH); g.lineTo(cx + cardW, cy + cardH - cb);
      g.stroke();

      // Card Header Strip
      g.fillStyle = "rgba(98, 240, 255, 0.14)";
      g.fillRect(cx + 2, cy + 2, cardW - 4, 34);
      g.strokeStyle = "rgba(98, 240, 255, 0.28)";
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(cx + 2, cy + 36);
      g.lineTo(cx + cardW - 2, cy + 36);
      g.stroke();

      // Section Number
      g.fillStyle = "#ffa030";
      g.font = "bold 15px monospace";
      g.fillText(sec.num, cx + 12, cy + 24);

      // Section Title
      g.fillStyle = "#ffffff";
      g.font = "bold 17px monospace";
      g.fillText(sec.label, cx + 46, cy + 24);

      // Status Tag (Top-right of card header)
      g.fillStyle = "rgba(158, 246, 255, 0.75)";
      g.font = "11px monospace";
      g.textAlign = "right";
      g.fillText(sec.tag, cx + cardW - 12, cy + 24);
      g.textAlign = "left";

      // Sub-module Bar
      g.fillStyle = "rgba(98, 240, 255, 0.06)";
      g.fillRect(cx + 2, cy + 38, cardW - 4, 20);
      g.fillStyle = "rgba(158, 246, 255, 0.6)";
      g.font = "10px monospace";
      g.fillText(sec.sub, cx + 12, cy + 52);

      // Inner Standby Body
      const bodyX = cx + 12;
      const bodyY = cy + 66;
      const bodyW = cardW - 24;
      const bodyH = cardH - 100;

      // Inner Body Tech Border
      g.strokeStyle = "rgba(98, 240, 255, 0.15)";
      g.lineWidth = 1;
      g.strokeRect(bodyX, bodyY, bodyW, bodyH);

      // Faint tech scanlines / coordinate grid
      g.strokeStyle = "rgba(98, 240, 255, 0.04)";
      for (let gy = bodyY + 16; gy < bodyY + bodyH; gy += 18) {
        g.beginPath(); g.moveTo(bodyX, gy); g.lineTo(bodyX + bodyW, gy); g.stroke();
      }
      for (let gx = bodyX + 24; gx < bodyX + bodyW; gx += 32) {
        g.beginPath(); g.moveTo(gx, bodyY); g.lineTo(gx, bodyY + bodyH); g.stroke();
      }

      // Registration crosshairs in body corners
      const chSize = 7;
      g.strokeStyle = "rgba(98, 240, 255, 0.35)";
      g.lineWidth = 1;
      for (const [px, py] of [
        [bodyX + 10, bodyY + 10],
        [bodyX + bodyW - 10, bodyY + 10],
        [bodyX + 10, bodyY + bodyH - 10],
        [bodyX + bodyW - 10, bodyY + bodyH - 10]
      ]) {
        g.beginPath();
        g.moveTo(px - chSize, py); g.lineTo(px + chSize, py);
        g.moveTo(px, py - chSize); g.lineTo(px, py + chSize);
        g.stroke();
      }

      if (idx === 0) {
        // ----------------------------------------------------
        // CARD 01: ABOUT (Ramy Kassam Dossier)
        // ----------------------------------------------------
        // Role & Org Title Header
        g.fillStyle = "#ffa030";
        g.font = "bold 12px monospace";
        g.fillText("SOFTWARE ENGINEER", bodyX + 12, bodyY + 22);

        g.fillStyle = "rgba(158, 246, 255, 0.85)";
        g.font = "bold 10.5px monospace";
        g.fillText("@ VERTX PARTNERS  •  2+ YRS EXP", bodyX + 12, bodyY + 38);

        // Thin accent line
        g.strokeStyle = "rgba(98, 240, 255, 0.25)";
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(bodyX + 12, bodyY + 48);
        g.lineTo(bodyX + bodyW - 12, bodyY + 48);
        g.stroke();

        // Helper to wrap text cleanly
        const printWrapped = (text, startX, startY, maxW, lineH) => {
          const words = text.split(" ");
          let line = "";
          let currY = startY;
          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " ";
            const metrics = g.measureText(testLine);
            if (metrics.width > maxW && n > 0) {
              g.fillText(line.trim(), startX, currY);
              line = words[n] + " ";
              currY += lineH;
            } else {
              line = testLine;
            }
          }
          if (line.trim().length > 0) {
            g.fillText(line.trim(), startX, currY);
            currY += lineH;
          }
          return currY;
        };

        // Paragraph 1: Experience & Focus
        g.fillStyle = "#e6f8ff";
        g.font = "11px monospace";
        let curY = bodyY + 66;
        const p1 = "Software engineer building desktop and web applications at Vertx Partners, with over 2 years of experience developing robust, user-centered solutions.";
        curY = printWrapped(p1, bodyX + 12, curY, bodyW - 24, 16);

        // Tech Stack Box
        const stackBoxY = curY + 10;
        const stackBoxH = 84;
        g.fillStyle = "rgba(4, 28, 36, 0.75)";
        g.fillRect(bodyX + 12, stackBoxY, bodyW - 24, stackBoxH);
        g.strokeStyle = "rgba(98, 240, 255, 0.35)";
        g.lineWidth = 1;
        g.strokeRect(bodyX + 12, stackBoxY, bodyW - 24, stackBoxH);

        // Stack Header
        g.fillStyle = "#ffa030";
        g.font = "bold 10px monospace";
        g.fillText("CORE TECH STACK //", bodyX + 20, stackBoxY + 18);

        // Backend
        g.fillStyle = CY;
        g.font = "bold 10.5px monospace";
        g.fillText("BACKEND  ▶", bodyX + 20, stackBoxY + 38);
        g.fillStyle = "#ffffff";
        g.font = "10.5px monospace";
        g.fillText("Python  •  FastAPI", bodyX + 96, stackBoxY + 38);

        // Frontend
        g.fillStyle = CY;
        g.font = "bold 10.5px monospace";
        g.fillText("FRONTEND ▶", bodyX + 20, stackBoxY + 62);
        g.fillStyle = "#ffffff";
        g.font = "10.5px monospace";
        g.fillText("JavaScript  •  React", bodyX + 96, stackBoxY + 62);

        // Paragraph 2: Thank you note
        curY = stackBoxY + stackBoxH + 16;
        g.fillStyle = "rgba(158, 246, 255, 0.9)";
        g.font = "11px monospace";
        const p2 = "Thank you for checking out my portfolio. I hope you enjoy exploring this space as much as I enjoyed building it!";
        curY = printWrapped(p2, bodyX + 12, curY, bodyW - 24, 16);

        // Blinking command prompt at bottom of body
        g.fillStyle = "rgba(98, 240, 255, 0.75)";
        g.font = "10.5px monospace";
        g.fillText("> READY FOR COMMANDS", bodyX + 12, curY + 18);
        if (Math.floor(t * 2.5) % 2 === 0) {
          g.fillStyle = CY;
          g.fillRect(bodyX + 162, curY + 8, 7, 12);
        }
      } else {
        // ----------------------------------------------------
        // CARDS 02 & 03: EXPERIENCE & PROJECTS (STANDBY)
        // ----------------------------------------------------
        const midX = cx + cardW / 2;
        const midY = bodyY + bodyH / 2;

        // Concentric circles
        g.strokeStyle = "rgba(98, 240, 255, 0.22)";
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(midX, midY - 14, 38, 0, Math.PI * 2);
        g.stroke();

        g.strokeStyle = "rgba(98, 240, 255, 0.12)";
        g.beginPath();
        g.arc(midX, midY - 14, 52, 0, Math.PI * 2);
        g.stroke();

        // Crosshair lines
        g.strokeStyle = "rgba(98, 240, 255, 0.35)";
        g.beginPath();
        g.moveTo(midX - 30, midY - 14); g.lineTo(midX + 30, midY - 14);
        g.moveTo(midX, midY - 44); g.lineTo(midX, midY + 16);
        g.stroke();

        // Center dot
        g.fillStyle = CY;
        g.beginPath();
        g.arc(midX, midY - 14, 4, 0, Math.PI * 2);
        g.fill();

        // "[ EMPTY // STANDBY ]" label
        g.fillStyle = "rgba(158, 246, 255, 0.85)";
        g.font = "bold 13px monospace";
        g.textAlign = "center";
        g.fillText("[ EMPTY // STANDBY ]", midX, midY + 38);

        // Section-specific standby note
        g.fillStyle = "rgba(255, 160, 48, 0.75)";
        g.font = "11px monospace";
        g.fillText(sec.note, midX, midY + 58);
        g.textAlign = "left";

        // Blinking terminal command prompt in top-left of body
        g.fillStyle = "rgba(98, 240, 255, 0.7)";
        g.font = "12px monospace";
        g.fillText("> READY", bodyX + 12, bodyY + 24);
        if (Math.floor(t * 2.5 + idx) % 2 === 0) {
          g.fillStyle = CY;
          g.fillRect(bodyX + 72, bodyY + 12, 8, 14);
        }
      }

      // Card Bottom Status Strip
      g.fillStyle = "rgba(98, 240, 255, 0.08)";
      g.fillRect(cx + 2, cy + cardH - 26, cardW - 4, 24);
      g.fillStyle = "rgba(158, 246, 255, 0.55)";
      g.font = "10px monospace";
      g.fillText(sec.footer, cx + 10, cy + cardH - 10);
    });

    // ----------------------------------------------------
    // BOTTOM STATUS TELEMETRY BAR
    // ----------------------------------------------------
    const botY = h - pad + 6;
    g.strokeStyle = "rgba(98, 240, 255, 0.25)";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(pad + 6, botY - 16);
    g.lineTo(w - pad - 6, botY - 16);
    g.stroke();

    g.fillStyle = "rgba(158, 246, 255, 0.65)";
    g.font = "bold 11px monospace";
    g.fillText("SYS.CORE // NEURAL BUS: ACTIVE  •  BUFFER: 100%  •  ENCRYPTION: AES-256", pad + 8, botY - 3);
    g.textAlign = "right";
    g.fillText(`COORDS: 44.1° N 121.3° W  •  T+${t.toFixed(1)}s  •  TERMINAL READY`, w - pad - 8, botY - 3);
    g.textAlign = "left";
  } else if (variant === 6) {
    drawGalleryHUD(g, w, h, 0, t);
  } else {
    // targeting reticle
    const cx = w / 2, cy = h / 2, r = s * 0.22;
    ringArc(g, cx, cy, r, 1, 2);
    ringArc(g, cx, cy, r * 0.6, 0.75, 3);
    g.save();
    g.translate(cx, cy);
    g.rotate(t * 0.8);
    g.lineWidth = 2;
    g.strokeRect(-r * 0.25, -r * 0.25, r * 0.5, r * 0.5);
    g.restore();
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(cx - r * 1.8, cy); g.lineTo(cx - r * 0.4, cy);
    g.moveTo(cx + r * 0.4, cy); g.lineTo(cx + r * 1.8, cy);
    g.moveTo(cx, cy - r * 2.4); g.lineTo(cx, cy - r * 0.4);
    g.moveTo(cx, cy + r * 0.4); g.lineTo(cx, cy + r * 2.4);
    g.stroke();
    g.strokeRect(cx - r * 1.5, cy - r * 2.0, r * 3.0, r * 4.0);
    lines(w * 0.15, h * 0.07, 2, w * 0.5, h * 0.035);
    lines(w * 0.15, h * 0.88, 2, w * 0.6, h * 0.035);
  }
  g.shadowBlur = 0;
  g.globalAlpha = 1;
}

function getGalleryAlbumItems(albumId) {
  const items = [];
  lovelandPhotos.forEach((photo, idx) => {
    if (photo.album === albumId) {
      items.push({ photo, img: lovelandImages[idx], globalIdx: idx });
    }
  });
  return items;
}

function drawGalleryHUD(g, w, h, photoIdx = 0, t = 0, albumId = "loveland", viewMode = "grid") {
  const items = getGalleryAlbumItems(albumId);
  const count = Math.max(1, items.length);
  const safeIdx = ((photoIdx % count) + count) % count;
  const activeItem = items[safeIdx] || { photo: lovelandPhotos[0], img: lovelandImages[0] };
  const img = activeItem.img;

  // Rich dark museum gallery background
  g.fillStyle = "#080b11";
  g.fillRect(0, 0, w, h);

  // ------------------------------------------------------------------
  // 1. TOP HEADER BAR WITH "PHOTO GALLERY" TITLE & TRIP TABS
  // ------------------------------------------------------------------
  const topBarH = 92;
  g.fillStyle = "#0c111b";
  g.fillRect(0, 0, w, topBarH);
  g.strokeStyle = "rgba(255, 255, 255, 0.14)";
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(0, topBarH);
  g.lineTo(w, topBarH);
  g.stroke();

  // Top Title: "Photo Gallery"
  g.fillStyle = "#ffffff";
  g.font = "600 22px 'gastromond', 'Fraunces', 'SF Pro Display', Georgia, serif";
  g.textAlign = "left";
  g.fillText("Photo Gallery", 24, 31);

  const tabs = [
    { id: "loveland", label: "Loveland Ski Area", x: 24, w: 215 },
    { id: "basin", label: "Arapahoe Basin", x: 251, w: 195 },
    { id: "bearlake", label: "Bear Lake", x: 458, w: 165 },
  ];

  const ty = 44;
  const th = 36;
  tabs.forEach((tab) => {
    const isActive = albumId === tab.id;
    g.fillStyle = isActive ? "rgba(56, 189, 248, 0.22)" : "rgba(255, 255, 255, 0.05)";
    g.fillRect(tab.x, ty, tab.w, th);
    g.strokeStyle = isActive ? "#38bdf8" : "rgba(255, 255, 255, 0.18)";
    g.lineWidth = isActive ? 1.8 : 1;
    g.strokeRect(tab.x, ty, tab.w, th);

    g.fillStyle = isActive ? "#ffffff" : "rgba(255, 255, 255, 0.65)";
    g.font = isActive
      ? "600 15px 'SF Pro Display', -apple-system, sans-serif"
      : "500 15px 'SF Pro Display', -apple-system, sans-serif";
    g.textAlign = "center";
    g.fillText(tab.label, tab.x + tab.w / 2, ty + 23);
  });

  if (viewMode === "single") {
    // [ All Photos ] button on top right to return to grid view
    const backW = 140;
    const backX = w - backW - 24;
    const backY = 44;
    const backH = 36;
    g.fillStyle = "rgba(255, 255, 255, 0.1)";
    g.fillRect(backX, backY, backW, backH);
    g.strokeStyle = "rgba(255, 255, 255, 0.35)";
    g.lineWidth = 1.2;
    g.strokeRect(backX, backY, backW, backH);
    g.fillStyle = "#ffffff";
    g.font = "600 13.5px 'SF Pro Display', -apple-system, sans-serif";
    g.textAlign = "center";
    g.fillText("⊞ All Photos", backX + backW / 2, backY + 23);
  }
  g.textAlign = "left";

  // ------------------------------------------------------------------
  // 2. GRID VIEW: ALL PHOTOS FOR THE SELECTED TRIP
  // ------------------------------------------------------------------
  if (viewMode === "grid") {
    const isCompact = albumId === "basin" || albumId === "bearlake";
    const cols = isCompact ? 4 : 5;
    const rows = isCompact ? 2 : 3;
    const gap = isCompact ? 14 : 12;
    const gridX = 24;
    const gridY = topBarH + 12;
    const gridW = w - 48;
    const gridH = h - gridY - 14;
    const cellW = Math.floor((gridW - gap * (cols - 1)) / cols);
    const cellH = Math.floor((gridH - gap * (rows - 1)) / rows);

    items.forEach((item, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      if (row >= rows) return;
      const cx = gridX + col * (cellW + gap);
      const cy = gridY + row * (cellH + gap);

      g.fillStyle = "#111622";
      g.fillRect(cx, cy, cellW, cellH);

      const thumb = item.img;
      if (thumb && thumb.complete && thumb.naturalWidth > 0) {
        // Center-crop (cover) inside thumbnail card
        const imgAspect = thumb.naturalWidth / thumb.naturalHeight;
        const cellAspect = cellW / cellH;
        let sx, sy, sw, sh;
        if (imgAspect > cellAspect) {
          sh = thumb.naturalHeight;
          sw = sh * cellAspect;
          sx = (thumb.naturalWidth - sw) / 2;
          sy = 0;
        } else {
          sw = thumb.naturalWidth;
          sh = sw / cellAspect;
          sx = 0;
          sy = (thumb.naturalHeight - sh) / 2;
        }
        g.drawImage(thumb, sx, sy, sw, sh, cx, cy, cellW, cellH);
      }

      g.strokeStyle = "rgba(255, 255, 255, 0.22)";
      g.lineWidth = 1.2;
      g.strokeRect(cx + 0.5, cy + 0.5, cellW - 1, cellH - 1);
    });
    return;
  }

  // ------------------------------------------------------------------
  // 3. SINGLE PHOTO VIEW: FULL PHOTO WITH PREV & NEXT CONTROLS
  // ------------------------------------------------------------------
  if (img && img.complete && img.naturalWidth > 0) {
    // Soft blurred ambient backdrop filling the viewport below the top bar
    g.save();
    g.beginPath();
    g.rect(0, topBarH, w, h - topBarH);
    g.clip();
    try {
      g.filter = "blur(28px) brightness(0.32) saturate(1.15)";
      const bgScale = Math.max(w / img.naturalWidth, (h - topBarH) / img.naturalHeight) * 1.12;
      const bw = img.naturalWidth * bgScale;
      const bh = img.naturalHeight * bgScale;
      g.drawImage(img, (w - bw) / 2, topBarH + (h - topBarH - bh) / 2, bw, bh);
    } catch (_) {
      // Fallback if canvas filter is unsupported
    }
    g.restore();

    // Maximum-size crisp foreground photo
    const padX = 114;
    const padTop = topBarH + 14;
    const padBot = 14;
    const availW = w - padX * 2;
    const availH = h - padTop - padBot;

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const boxAspect = availW / availH;
    let dw, dh, dx, dy;
    if (imgAspect > boxAspect) {
      dw = availW;
      dh = dw / imgAspect;
      dx = padX;
      dy = padTop + (availH - dh) / 2;
    } else {
      dh = availH;
      dw = dh * imgAspect;
      dx = padX + (availW - dw) / 2;
      dy = padTop;
    }

    // Soft gallery drop shadow behind photo
    g.save();
    g.shadowColor = "rgba(0, 0, 0, 0.78)";
    g.shadowBlur = 24;
    g.shadowOffsetY = 6;
    g.fillStyle = "#000000";
    g.fillRect(dx, dy, dw, dh);
    g.restore();

    g.drawImage(img, dx, dy, dw, dh);

    g.strokeStyle = "rgba(255, 255, 255, 0.28)";
    g.lineWidth = 1.5;
    g.strokeRect(dx - 0.5, dy - 0.5, dw + 1, dh + 1);
  } else {
    g.fillStyle = "rgba(255, 255, 255, 0.7)";
    g.font = "500 16px 'SF Pro Display', -apple-system, sans-serif";
    g.textAlign = "center";
    g.fillText("Loading photo...", w / 2, (h + topBarH) / 2);
    g.textAlign = "left";
  }

  // Left [ ◀ PREV ] and Right [ NEXT ▶ ] buttons
  const btnW = 86;
  const btnH = 48;
  const btnY = Math.round((h + topBarH) / 2 - btnH / 2);
  const prevX = 16;
  const nextX = w - btnW - 16;

  // PREV button
  g.fillStyle = "rgba(10, 14, 22, 0.78)";
  g.fillRect(prevX, btnY, btnW, btnH);
  g.strokeStyle = "rgba(255, 255, 255, 0.35)";
  g.lineWidth = 1.2;
  g.strokeRect(prevX, btnY, btnW, btnH);
  g.fillStyle = "#ffffff";
  g.font = "600 13.5px 'SF Pro Display', -apple-system, sans-serif";
  g.textAlign = "center";
  g.fillText("◀ PREV", prevX + btnW / 2, btnY + 29);

  // NEXT button
  g.fillStyle = "rgba(10, 14, 22, 0.78)";
  g.fillRect(nextX, btnY, btnW, btnH);
  g.strokeStyle = "rgba(255, 255, 255, 0.35)";
  g.lineWidth = 1.2;
  g.strokeRect(nextX, btnY, btnW, btnH);
  g.fillStyle = "#ffffff";
  g.font = "600 13.5px 'SF Pro Display', -apple-system, sans-serif";
  g.fillText("NEXT ▶", nextX + btnW / 2, btnY + 29);
  g.textAlign = "left";
}

/* ------------------------------------------------------------------ */
/*  Arcade Space Shooter Game ("STAR DEFENDER") — Variant 7           */
/* ------------------------------------------------------------------ */
const spaceGame = {
  state: "title", // 'title' | 'playing' | 'gameover'
  score: 0,
  highScore: 0,
  wave: 1,
  lives: 3,
  shipX: 400,
  targetShipX: 400,
  usingMouse: false,
  keys: { left: false, right: false, fire: false },
  bullets: [],
  enemyBullets: [],
  enemies: [],
  particles: [],
  stars: [],
  fireTimer: 0,
  spawnTimer: 0,
  invulnTimer: 0,
  shakeTimer: 0,
};

function initGameStars(w, h) {
  if (spaceGame.stars.length > 0) return;
  for (let i = 0; i < 65; i++) {
    spaceGame.stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      speed: 28 + Math.random() * 110,
      size: 1 + Math.random() * 2.2,
      col: i % 5 === 0 ? "#62f0ff" : i % 7 === 0 ? "#ffa030" : "#ffffff",
    });
  }
}

function startSpaceGame(w = 800) {
  spaceGame.state = "playing";
  spaceGame.score = 0;
  spaceGame.wave = 1;
  spaceGame.lives = 3;
  spaceGame.shipX = w / 2;
  spaceGame.targetShipX = w / 2;
  spaceGame.bullets = [];
  spaceGame.enemyBullets = [];
  spaceGame.enemies = [];
  spaceGame.particles = [];
  spaceGame.fireTimer = 0;
  spaceGame.spawnTimer = 0.4;
  spaceGame.invulnTimer = 1.2;
  spaceGame.shakeTimer = 0;
}

function spawnExplosion(x, y, col, count = 16) {
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 40 + Math.random() * 190;
    spaceGame.particles.push({
      x,
      y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      life: 0.35 + Math.random() * 0.35,
      maxLife: 0.7,
      col,
      r: 2 + Math.random() * 3.5,
    });
  }
}

function updateAndDrawGameHUD(g, w, h, dt = 0.016, t = 0, playSound = null) {
  initGameStars(w, h);

  g.save();
  // Screen shake when hit
  if (spaceGame.shakeTimer > 0) {
    spaceGame.shakeTimer = Math.max(0, spaceGame.shakeTimer - dt);
    g.translate((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
  }

  // Deep space background
  g.fillStyle = "#040711";
  g.fillRect(0, 0, w, h);

  // Subtle nebula glow
  const grd = g.createRadialGradient(w * 0.5, h * 0.4, 20, w * 0.5, h * 0.5, w * 0.65);
  grd.addColorStop(0, "rgba(18, 52, 86, 0.32)");
  grd.addColorStop(0.6, "rgba(28, 12, 48, 0.22)");
  grd.addColorStop(1, "rgba(4, 7, 17, 0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);

  // Update & draw scrolling starfield
  const speedMul = spaceGame.state === "playing" ? 1 + spaceGame.wave * 0.12 : 0.6;
  for (const st of spaceGame.stars) {
    st.y += st.speed * speedMul * dt;
    if (st.y > h) {
      st.y = 0;
      st.x = Math.random() * w;
    }
    g.fillStyle = st.col;
    g.globalAlpha = 0.45 + 0.45 * Math.sin(t * 3 + st.x);
    g.fillRect(st.x, st.y, st.size, st.size * (spaceGame.state === "playing" ? 1.8 : 1.2));
  }
  g.globalAlpha = 1;

  const shipY = h - 54;

  // Helper to draw the player starfighter
  const drawPlayerShip = (sx, sy, blink = false) => {
    if (blink && Math.floor(t * 16) % 2 === 0) return;
    g.save();
    g.translate(sx, sy);

    // Thruster flame
    const flameH = 14 + Math.sin(t * 45) * 6;
    g.fillStyle = "#ffa030";
    g.beginPath();
    g.moveTo(-7, 16);
    g.lineTo(0, 16 + flameH);
    g.lineTo(7, 16);
    g.closePath();
    g.fill();

    // Wings
    g.fillStyle = "#164e63";
    g.strokeStyle = "#62f0ff";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, -22);
    g.lineTo(24, 14);
    g.lineTo(10, 10);
    g.lineTo(0, 16);
    g.lineTo(-10, 10);
    g.lineTo(-24, 14);
    g.closePath();
    g.fill();
    g.stroke();

    // Cockpit canopy
    g.fillStyle = "#62f0ff";
    g.beginPath();
    g.moveTo(0, -10);
    g.lineTo(5, 4);
    g.lineTo(0, 8);
    g.lineTo(-5, 4);
    g.closePath();
    g.fill();

    // Twin wing cannons
    g.fillStyle = "#ffa030";
    g.fillRect(-19, -2, 3, 10);
    g.fillRect(16, -2, 3, 10);
    g.restore();
  };

  if (spaceGame.state === "playing") {
    spaceGame.wave = 1 + Math.floor(spaceGame.score / 600);
    if (spaceGame.invulnTimer > 0) spaceGame.invulnTimer = Math.max(0, spaceGame.invulnTimer - dt);

    // Ship steering (keyboard or mouse tracking)
    const moveSpd = 440;
    if (spaceGame.keys.left) {
      spaceGame.shipX -= moveSpd * dt;
      spaceGame.targetShipX = spaceGame.shipX;
      spaceGame.usingMouse = false;
    }
    if (spaceGame.keys.right) {
      spaceGame.shipX += moveSpd * dt;
      spaceGame.targetShipX = spaceGame.shipX;
      spaceGame.usingMouse = false;
    }
    if (spaceGame.usingMouse) {
      spaceGame.shipX += (spaceGame.targetShipX - spaceGame.shipX) * Math.min(1, dt * 16);
    }
    spaceGame.shipX = Math.max(36, Math.min(w - 36, spaceGame.shipX));

    // Auto-fire + rapid fire on Space/Click
    spaceGame.fireTimer -= dt;
    const fireRate = spaceGame.keys.fire ? 0.13 : 0.24;
    if (spaceGame.fireTimer <= 0) {
      spaceGame.fireTimer = fireRate;
      spaceGame.bullets.push(
        { x: spaceGame.shipX - 17, y: shipY - 8, vy: -580 },
        { x: spaceGame.shipX + 17, y: shipY - 8, vy: -580 }
      );
      if (spaceGame.keys.fire && playSound) playSound(740, 0.025);
    }

    // Spawn enemies & asteroids
    spaceGame.spawnTimer -= dt;
    if (spaceGame.spawnTimer <= 0) {
      const interval = Math.max(0.32, 0.95 - spaceGame.wave * 0.07);
      spaceGame.spawnTimer = interval;
      const roll = Math.random();
      const ex = 44 + Math.random() * (w - 88);
      if (roll < 0.48) {
        // Asteroid
        const r = 16 + Math.random() * 14;
        spaceGame.enemies.push({
          x: ex,
          y: -30,
          vx: (Math.random() - 0.5) * 70,
          vy: 105 + Math.random() * 85 + spaceGame.wave * 14,
          r,
          type: "asteroid",
          hp: r > 23 ? 2 : 1,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 3.5,
          pts: 50,
          shootTimer: 99,
        });
      } else if (roll < 0.85) {
        // Alien Drone Fighter
        spaceGame.enemies.push({
          x: ex,
          y: -30,
          vx: (Math.random() < 0.5 ? -1 : 1) * (80 + Math.random() * 60),
          vy: 95 + spaceGame.wave * 12,
          r: 18,
          type: "drone",
          hp: 2,
          angle: 0,
          spin: 0,
          pts: 100,
          shootTimer: 0.9 + Math.random() * 0.9,
        });
      } else {
        // Elite Cruiser
        spaceGame.enemies.push({
          x: ex,
          y: -35,
          vx: (Math.random() - 0.5) * 50,
          vy: 68 + spaceGame.wave * 8,
          r: 25,
          type: "cruiser",
          hp: 4,
          angle: 0,
          spin: 0,
          pts: 250,
          shootTimer: 0.7 + Math.random() * 0.6,
        });
      }
    }

    // Update & draw player bullets
    g.fillStyle = "#62f0ff";
    for (let i = spaceGame.bullets.length - 1; i >= 0; i--) {
      const b = spaceGame.bullets[i];
      b.y += b.vy * dt;
      if (b.y < -20) {
        spaceGame.bullets.splice(i, 1);
        continue;
      }
      g.fillRect(b.x - 2, b.y - 8, 4, 15);
    }

    // Update & draw enemy bullets
    g.fillStyle = "#ff4d6d";
    for (let i = spaceGame.enemyBullets.length - 1; i >= 0; i--) {
      const eb = spaceGame.enemyBullets[i];
      eb.x += (eb.vx || 0) * dt;
      eb.y += eb.vy * dt;
      if (eb.y > h + 20) {
        spaceGame.enemyBullets.splice(i, 1);
        continue;
      }
      g.beginPath();
      g.arc(eb.x, eb.y, 4.5, 0, Math.PI * 2);
      g.fill();

      // Hit player check
      if (spaceGame.invulnTimer <= 0 && Math.hypot(eb.x - spaceGame.shipX, eb.y - shipY) < 19) {
        spaceGame.enemyBullets.splice(i, 1);
        spaceGame.lives -= 1;
        spaceGame.invulnTimer = 1.4;
        spaceGame.shakeTimer = 0.28;
        spawnExplosion(spaceGame.shipX, shipY, "#ff4d6d", 22);
        if (playSound) playSound(190, 0.09);
        if (spaceGame.lives <= 0) {
          spaceGame.state = "gameover";
          if (spaceGame.score > spaceGame.highScore) spaceGame.highScore = spaceGame.score;
        }
      }
    }

    // Update & draw enemies
    for (let i = spaceGame.enemies.length - 1; i >= 0; i--) {
      const e = spaceGame.enemies[i];
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.angle += e.spin * dt;
      if (e.x < 30 || e.x > w - 30) e.vx *= -1;

      // Enemy firing
      if (e.type !== "asteroid") {
        e.shootTimer -= dt;
        if (e.shootTimer <= 0 && e.y > 40 && e.y < h - 140) {
          e.shootTimer = 1.4;
          const dx = spaceGame.shipX - e.x;
          const dy = shipY - e.y;
          const dist = Math.hypot(dx, dy) || 1;
          spaceGame.enemyBullets.push({
            x: e.x,
            y: e.y + 14,
            vx: (dx / dist) * 190,
            vy: (dy / dist) * 190,
          });
        }
      }

      if (e.y > h + 40) {
        spaceGame.enemies.splice(i, 1);
        continue;
      }

      // Draw enemy
      g.save();
      g.translate(e.x, e.y);
      g.rotate(e.angle);
      if (e.type === "asteroid") {
        g.fillStyle = "#3b2f2f";
        g.strokeStyle = "#ffa030";
        g.lineWidth = 2;
        g.beginPath();
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * Math.PI * 2;
          const rad = e.r * (k % 2 === 0 ? 1 : 0.76);
          if (k === 0) g.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else g.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        g.closePath();
        g.fill();
        g.stroke();
      } else if (e.type === "drone") {
        g.fillStyle = "#4c0519";
        g.strokeStyle = "#ff4d6d";
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(0, 18);
        g.lineTo(18, -12);
        g.lineTo(0, -4);
        g.lineTo(-18, -12);
        g.closePath();
        g.fill();
        g.stroke();
      } else {
        g.fillStyle = "#3b0764";
        g.strokeStyle = "#e879f9";
        g.lineWidth = 2.2;
        g.beginPath();
        g.moveTo(0, 22);
        g.lineTo(24, 0);
        g.lineTo(16, -18);
        g.lineTo(-16, -18);
        g.lineTo(-24, 0);
        g.closePath();
        g.fill();
        g.stroke();
      }
      g.restore();

      // Bullet vs enemy collision
      let destroyed = false;
      for (let j = spaceGame.bullets.length - 1; j >= 0; j--) {
        const b = spaceGame.bullets[j];
        if (Math.hypot(b.x - e.x, b.y - e.y) < e.r + 6) {
          spaceGame.bullets.splice(j, 1);
          e.hp -= 1;
          spawnExplosion(b.x, b.y, "#62f0ff", 5);
          if (e.hp <= 0) {
            spaceGame.score += e.pts;
            if (spaceGame.score > spaceGame.highScore) spaceGame.highScore = spaceGame.score;
            spawnExplosion(
              e.x,
              e.y,
              e.type === "asteroid" ? "#ffa030" : e.type === "drone" ? "#ff4d6d" : "#e879f9",
              18
            );
            if (playSound) playSound(340, 0.04);
            spaceGame.enemies.splice(i, 1);
            destroyed = true;
            break;
          }
        }
      }
      if (destroyed) continue;

      // Enemy vs player collision
      if (spaceGame.invulnTimer <= 0 && Math.hypot(e.x - spaceGame.shipX, e.y - shipY) < e.r + 16) {
        spaceGame.enemies.splice(i, 1);
        spaceGame.lives -= 1;
        spaceGame.invulnTimer = 1.4;
        spaceGame.shakeTimer = 0.3;
        spawnExplosion(spaceGame.shipX, shipY, "#ff4d6d", 24);
        if (playSound) playSound(180, 0.09);
        if (spaceGame.lives <= 0) {
          spaceGame.state = "gameover";
        }
      }
    }

    // Draw player ship
    drawPlayerShip(spaceGame.shipX, shipY, spaceGame.invulnTimer > 0);
  } else {
    // Demo ship gently patrolling on title / gameover screen
    drawPlayerShip(w / 2 + Math.sin(t * 1.6) * 140, shipY, false);
  }

  // Update & draw particles
  for (let i = spaceGame.particles.length - 1; i >= 0; i--) {
    const p = spaceGame.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) {
      spaceGame.particles.splice(i, 1);
      continue;
    }
    g.globalAlpha = Math.max(0, p.life / p.maxLife);
    g.fillStyle = p.col;
    g.beginPath();
    g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;

  // Top HUD Bar
  g.fillStyle = "rgba(4, 12, 24, 0.88)";
  g.fillRect(0, 0, w, 42);
  g.strokeStyle = "rgba(98, 240, 255, 0.35)";
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(0, 42);
  g.lineTo(w, 42);
  g.stroke();

  g.font = "bold 14px monospace";
  g.fillStyle = "#62f0ff";
  g.fillText(`SCORE: ${String(spaceGame.score).padStart(6, "0")}`, 18, 26);

  g.fillStyle = "#ffa030";
  g.fillText(`HI: ${String(spaceGame.highScore).padStart(6, "0")}`, 210, 26);

  g.fillStyle = "#34d399";
  g.fillText(`WAVE ${spaceGame.wave}`, 385, 26);

  g.fillStyle = "#ff4d6d";
  g.textAlign = "right";
  g.fillText(`SHIELDS: ${"♥ ".repeat(Math.max(0, spaceGame.lives)).trim() || "CRITICAL"}`, w - 18, 26);
  g.textAlign = "left";

  // Overlay Screens: TITLE or GAME OVER
  if (spaceGame.state === "title" || spaceGame.state === "gameover") {
    g.fillStyle = "rgba(3, 8, 18, 0.72)";
    g.fillRect(w * 0.12, h * 0.18, w * 0.76, h * 0.58);
    g.strokeStyle = spaceGame.state === "gameover" ? "#ff4d6d" : "#62f0ff";
    g.lineWidth = 2;
    g.strokeRect(w * 0.12, h * 0.18, w * 0.76, h * 0.58);

    g.textAlign = "center";
    if (spaceGame.state === "title") {
      g.fillStyle = "#ffa030";
      g.font = "bold 13px monospace";
      g.fillText("◈ COCKPIT ARCADE SYSTEM // SECTOR 07", w / 2, h * 0.28);

      g.fillStyle = "#62f0ff";
      g.font = "bold 40px 'SF Pro Display', -apple-system, monospace";
      g.fillText("STAR DEFENDER", w / 2, h * 0.40);

      g.fillStyle = "#cbd5e1";
      g.font = "13.5px monospace";
      g.fillText("STEER: MOUSE OR ◀ ▶ / A D   •   AUTO-LASER + CLICK / SPACE BOOST", w / 2, h * 0.50);

      // Start button pill
      const btnW = 310;
      const btnH = 46;
      const btnX = w / 2 - btnW / 2;
      const btnY = h * 0.57;
      g.fillStyle = "rgba(98, 240, 255, 0.2)";
      g.fillRect(btnX, btnY, btnW, btnH);
      g.strokeStyle = "#62f0ff";
      g.lineWidth = 1.8;
      g.strokeRect(btnX, btnY, btnW, btnH);
      g.fillStyle = "#ffffff";
      g.font = "bold 15px monospace";
      g.fillText("▶ CLICK OR PRESS SPACE TO LAUNCH", w / 2, btnY + 29);
    } else {
      g.fillStyle = "#ff4d6d";
      g.font = "bold 38px 'SF Pro Display', -apple-system, monospace";
      g.fillText("MISSION OVER", w / 2, h * 0.34);

      g.fillStyle = "#ffffff";
      g.font = "bold 18px monospace";
      g.fillText(
        `FINAL SCORE: ${spaceGame.score}   •   HIGH SCORE: ${spaceGame.highScore}`,
        w / 2,
        h * 0.46
      );

      const btnW = 320;
      const btnH = 46;
      const btnX = w / 2 - btnW / 2;
      const btnY = h * 0.56;
      g.fillStyle = "rgba(255, 77, 109, 0.22)";
      g.fillRect(btnX, btnY, btnW, btnH);
      g.strokeStyle = "#ff4d6d";
      g.lineWidth = 1.8;
      g.strokeRect(btnX, btnY, btnW, btnH);
      g.fillStyle = "#ffffff";
      g.font = "bold 15px monospace";
      g.fillText("↻ CLICK OR SPACE TO PLAY AGAIN", w / 2, btnY + 29);
    }
    g.textAlign = "left";
  }

  // Outer frame border
  g.strokeStyle = "rgba(98, 240, 255, 0.45)";
  g.lineWidth = 2;
  g.strokeRect(4, 4, w - 8, h - 8);
  g.restore();
}

/* ------------------------------------------------------------------ */
/*  Geometry helpers                                                   */
/* ------------------------------------------------------------------ */
function roundedBoxGeo(w, h, d, r) {
  const bw = w / 2 - r, bh = h / 2 - r;
  const cr = Math.min(bw, bh) * 0.5;
  const s = new THREE.Shape();
  s.moveTo(-bw + cr, -bh);
  s.lineTo(bw - cr, -bh); s.quadraticCurveTo(bw, -bh, bw, -bh + cr);
  s.lineTo(bw, bh - cr); s.quadraticCurveTo(bw, bh, bw - cr, bh);
  s.lineTo(-bw + cr, bh); s.quadraticCurveTo(-bw, bh, -bw, bh - cr);
  s.lineTo(-bw, -bh + cr); s.quadraticCurveTo(-bw, -bh, -bw + cr, -bh);
  const depth = Math.max(0.001, d - 2 * r);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 4, curveSegments: 6,
  });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

/* ------------------------------------------------------------------ */
/*  Nebula shaders (baked once into a cubemap, so it is perfectly smooth) */
/* ------------------------------------------------------------------ */
const SKY_VERT = `
varying vec3 vDir;
void main() {
  vDir = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const NEBULA_FRAG = `
varying vec3 vDir;
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}
float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 7; i++) {
    v += a * noise(p);
    p = p * 2.02 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return v;
}
void main() {
  vec3 d = normalize(vDir);
  vec3 q = vec3(fbm(d * 1.6), fbm(d * 1.6 + vec3(5.2, 1.3, 2.8)), fbm(d * 1.6 + vec3(9.1, 4.7, 7.3)));
  float n = fbm(d * 2.2 + q * 2.0);
  float n2 = fbm(d * 5.0 + q * 3.0 + 7.0);
  float bc = dot(d, normalize(vec3(0.45, 1.0, 0.2))) + (q.y - 0.5) * 0.9;
  float band = exp(-bc * bc * 5.0);

  vec3 col = vec3(0.022, 0.008, 0.05);
  float haze = smoothstep(0.35, 0.75, fbm(d * 1.2 + q * 1.5));
  col += vec3(0.20, 0.05, 0.30) * haze;
  float cloud = smoothstep(0.38, 0.8, n) * band;
  col += vec3(0.62, 0.10, 0.30) * cloud;
  float core = smoothstep(0.5, 0.9, n * 0.65 + n2 * 0.45) * band;
  col += vec3(1.0, 0.42, 0.12) * core * 1.1;
  col += vec3(1.0, 0.75, 0.45) * pow(core, 3.0) * 0.5;
  float dust = smoothstep(0.52, 0.78, fbm(d * 3.5 + q * 2.5 + 3.0));
  col *= 1.0 - dust * 0.6 * band;
  col *= 0.75 + 0.5 * n2;

  float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  col += (ign - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;

const SKY_FRAG = `
uniform samplerCube tCube;
varying vec3 vDir;
void main() {
  vec3 c = textureCube(tCube, normalize(vDir)).rgb;
  float ign = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  c += (ign - 0.5) / 255.0;
  gl_FragColor = vec4(c, 1.0);
}`;

/* ------------------------------------------------------------------ */
/*  Cabin floor plan: it narrows toward the nose                       */
/* ------------------------------------------------------------------ */
const TAPER = 1.1 / 6.8;
const hw = (z) => 1.5 + (z + 3.2) * TAPER; // half-width of the walkable floor at depth z
const WALL_ANGLE = Math.atan(TAPER);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function SciFiCockpit({ onExitToTerminal }) {
  const mountRef = useRef(null);
  const autoRef = useRef(false);
  const [auto, setAuto] = useState(false);
  const focusModeRef = useRef('none'); // 'none' | 'medium' | 'close'
  const [focusMode, setFocusMode] = useState('none');
  const activeTabRef = useRef('home'); // 'about' | 'experience' | 'projects' | 'contact'
  const [activeTab, setActiveTab] = useState('home');
  const hoveredRef = useRef(false);
  const [hovered, setHovered] = useState(false);
  const hoveredGalleryRef = useRef(false);
  const [hoveredGallery, setHoveredGallery] = useState(false);
  const hoveredGameRef = useRef(false);
  const [hoveredGame, setHoveredGame] = useState(false);
  const currentGalleryIdxRef = useRef(0);
  const updateScreenTextureRef = useRef(null);
  const cycleCameraViewRef = useRef(null);
  const zoomOutRef = useRef(null);

  // Live ticking time matching HUD format: e.g. "2:43:51 PM"
  const getFormattedTime = () => {
    const d = new Date();
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };
  const [currentTime, setCurrentTime] = useState(getFormattedTime);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Typewriter intro animation for "Ramy Kassam" and "Software Engineer" upon entering
  const [typedName, setTypedName] = useState("");
  const [typedRole, setTypedRole] = useState("");
  const [introTypingPhase, setIntroTypingPhase] = useState(0); // 0: typing name, 1: typing role, 2: finished

  useEffect(() => {
    const fullName = "Ramy Kassam";
    const fullRole = "Software Engineer";
    let nIdx = 0;
    let rIdx = 0;
    let phase = 0;
    const typeInterval = setInterval(() => {
      if (phase === 0) {
        nIdx += 1;
        setTypedName(fullName.slice(0, nIdx));
        if (nIdx >= fullName.length) {
          phase = 1;
          setIntroTypingPhase(1);
        }
      } else if (phase === 1) {
        rIdx += 1;
        setTypedRole(fullRole.slice(0, rIdx));
        if (rIdx >= fullRole.length) {
          phase = 2;
          setIntroTypingPhase(2);
          clearInterval(typeInterval);
        }
      }
    }, 60);
    return () => clearInterval(typeInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getFormattedTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      zenAudio.stop();
    };
  }, []);

  const toggleAudio = () => {
    const playing = zenAudio.toggle();
    setIsPlayingAudio(playing);
    if (playing) {
      playClickSound(620, 0.08);
    } else {
      playClickSound(360, 0.08);
    }
  };

  const navigateToTab = (tabId) => {
    activeTabRef.current = tabId;
    setActiveTab(tabId);
    playClickSound(tabId === 'home' ? 460 : 540, 0.06);
    updateScreenTextureRef.current?.(tabId);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    /* ---------- renderer / scene / camera ---------- */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, mount.clientWidth / mount.clientHeight, 0.05, 200);

    /* ---------- builders ---------- */
    const box = (w, h, d, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, parent = scene) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      parent.add(m);
      return m;
    };
    const cyl = (rt, rb, h, seg, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, parent = scene) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      parent.add(m);
      return m;
    };
    const rbox = (w, h, d, r, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, parent = scene) => {
      const m = new THREE.Mesh(roundedBoxGeo(w, h, d, r), mat);
      m.position.set(x, y, z);
      m.rotation.set(rx, ry, rz);
      parent.add(m);
      return m;
    };
    const grp = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, parent = scene) => {
      const g = new THREE.Group();
      g.position.set(x, y, z);
      g.rotation.set(rx, ry, rz);
      parent.add(g);
      return g;
    };
    const beam = (a, b, t, mat, parent = scene) => {
      const dir = new THREE.Vector3().subVectors(b, a);
      const len = dir.length();
      const m = new THREE.Mesh(new THREE.BoxGeometry(t, len, t), mat);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      parent.add(m);
      return m;
    };
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    // list entries: [x, y, z, rx, ry, rz, color?, scaleX?]
    const inst = (geo, mat, list, parent = scene) => {
      const im = new THREE.InstancedMesh(geo, mat, list.length);
      const d = new THREE.Object3D();
      list.forEach((p, i) => {
        d.position.set(p[0], p[1], p[2]);
        d.rotation.set(p[3] || 0, p[4] || 0, p[5] || 0);
        d.scale.set(p[7] || 1, 1, 1);
        d.updateMatrix();
        im.setMatrixAt(i, d.matrix);
        if (p[6] !== undefined && p[6] !== null) im.setColorAt(i, new THREE.Color(p[6]));
      });
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      parent.add(im);
      return im;
    };

    const glowMat = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
    const haloMat = (c, o) =>
      new THREE.MeshBasicMaterial({
        color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
      });
    const glow = (w, h, d, x, y, z, rx = 0, ry = 0, rz = 0, c = 0xffffff, parent = scene) => {
      box(w, h, d, glowMat(c), x, y, z, rx, ry, rz, parent);
      box(w + 0.05, h + 0.05, d + 0.05, haloMat(c, 0.16), x, y, z, rx, ry, rz, parent);
      box(w + 0.16, h + 0.16, d + 0.16, haloMat(c, 0.05), x, y, z, rx, ry, rz, parent);
    };

    /* ---------- materials ---------- */
    const std = (o) => new THREE.MeshStandardMaterial(o);
    const M = {
      hull: std({ color: 0x1d1618, roughness: 0.55, metalness: 0.55 }),
      maroon: std({ color: 0x4d2229, roughness: 0.48, metalness: 0.35 }),
      black: std({ color: 0x09090b, roughness: 0.6, metalness: 0.4 }),
      slat: std({ color: 0x2c2b30, roughness: 0.32, metalness: 0.85 }),
      metal: std({ color: 0xc4bfc8, roughness: 0.22, metalness: 0.95 }),
      chrome: std({ color: 0xe6e2ea, roughness: 0.15, metalness: 1.0 }),
      gold: std({ color: 0xe3a234, roughness: 0.3, metalness: 0.9, emissive: 0x3a2000, emissiveIntensity: 0.6 }),
      amberDim: std({ color: 0xb8721c, emissive: 0x8a4606, emissiveIntensity: 0.8, roughness: 0.4, metalness: 0.5 }),
      orangeGlow: new THREE.MeshBasicMaterial({ color: 0xff8a1a, toneMapped: false }),
      cream: std({ color: 0xf2ead8, emissive: 0x8a8070, emissiveIntensity: 0.55, roughness: 0.4 }),
      strap: std({ color: 0xe8dcc4, roughness: 0.7, metalness: 0.05 }),
      red: std({ color: 0xc81e1e, roughness: 0.32, metalness: 0.4 }),
      rivet: new THREE.MeshBasicMaterial({ color: 0xd8d8d8 }),
      coil: std({ color: 0xffffff, roughness: 0.4, metalness: 0.65 }),
      glass: std({ color: 0x0a2a33, emissive: 0x1a8aa0, emissiveIntensity: 0.6, roughness: 0.1, metalness: 0.2 }),
    };
    const shelfMat = (len) => std({ map: repeatTex(slatTexture("#8a5c64", "#2a1a1e"), 1, len * 3.4), roughness: 0.4, metalness: 0.6 });
    const dashMat = std({ map: repeatTex(slatTexture("#7a5058", "#1e1214", false), 12, 1), roughness: 0.4, metalness: 0.6 });
    const cushionTex = repeatTex(hexTexture("#5a262e", "#9a525a", "#140809"), 2.6, 2.6);
    const shellTex = repeatTex(hexTexture("#2a2629", "#5a5458", "#0c0a0b"), 2.6, 2.6);
    const cushionMat = std({ map: cushionTex, bumpMap: cushionTex, bumpScale: 0.02, roughness: 0.72, metalness: 0.15 });
    const shellMat = std({ map: shellTex, bumpMap: shellTex, bumpScale: 0.02, roughness: 0.5, metalness: 0.45 });
    const stickStripe = std({ map: stripeTexture("#f2b81e", "#111111", 10), roughness: 0.35, metalness: 0.4 });
    const ringStripe = std({ map: stripeTexture("#e8e8e8", "#151515", 6), roughness: 0.3, metalness: 0.5 });
    const doorMat = std({ map: repeatTex(slatTexture("#3e363a", "#141012"), 1, 7), roughness: 0.35, metalness: 0.75 });
    const hazardTex = canvasTex(128, 32, (g, w, h) => {
      g.fillStyle = "#f2b81e";
      g.fillRect(0, 0, w, h);
      g.fillStyle = "#111";
      for (let x = -h; x < w + h; x += 24) {
        g.beginPath();
        g.moveTo(x, h); g.lineTo(x + 12, h); g.lineTo(x + 12 + h, 0); g.lineTo(x + h, 0);
        g.closePath();
        g.fill();
      }
    });
    const hazardMat = std({ map: repeatTex(hazardTex, 3, 1), roughness: 0.5, metalness: 0.3 });

    let mainScreenMesh = null;
    let mainScreenGroup = null;
    const animScreens = [];

    let targetScrollY = 0;
    let curScrollY = 0;

    updateScreenTextureRef.current = (newTab) => {
      const tabToDraw = newTab || activeTabRef.current;
      targetScrollY = 0;
      curScrollY = 0;
      for (const sc of animScreens) {
        if (sc.v === 5) {
          drawHUD(sc.g, sc.w, sc.h, sc.v, performance.now() * 0.001, tabToDraw, curScrollY);
          sc.tex.needsUpdate = true;
        }
      }
    };

    if (ramyHeroImg && !ramyHeroImg.complete) {
      ramyHeroImg.onload = () => updateScreenTextureRef.current?.();
    }
    if (ramy02Img && !ramy02Img.complete) {
      ramy02Img.onload = () => updateScreenTextureRef.current?.();
    }
    if (ramy03Img && !ramy03Img.complete) {
      ramy03Img.onload = () => updateScreenTextureRef.current?.();
    }
    let galleryScreenMesh = null;
    let galleryScreenGroup = null;
    let galleryCanvas = null;
    let galleryCtx = null;
    let galleryTex = null;
    let galleryPhotoIdx = 0;
    let galleryAlbum = "loveland";
    let galleryViewMode = "grid";
    let gallerySlideTimer = 0;

    let gameScreenMesh = null;
    let gameScreenGroup = null;
    let gameCanvas = null;
    let gameCtx = null;
    let gameTex = null;

    const redrawGallery = () => {
      if (!galleryCtx || !galleryCanvas || !galleryTex) return;
      drawGalleryHUD(
        galleryCtx,
        galleryCanvas.width,
        galleryCanvas.height,
        galleryPhotoIdx,
        performance.now() * 0.001,
        galleryAlbum,
        galleryViewMode
      );
      galleryTex.needsUpdate = true;
    };

    lovelandImages.forEach((img) => {
      if (!img.complete) {
        img.onload = () => redrawGallery();
      }
    });

    const screenUnit = (w, h, variant, animated, parent, x, y, z, rx = 0, ry = 0, rz = 0) => {
      const g0 = grp(x, y, z, rx, ry, rz, parent);
      box(w + 0.06, h + 0.06, 0.04, M.black, 0, 0, -0.01, 0, 0, 0, g0);
      const pw = variant === 5 ? 1024 : variant === 6 ? 1200 : variant === 7 ? 800 : 512;
      const ph = Math.max(128, Math.round((pw * h) / w));
      const c = document.createElement("canvas");
      c.width = pw;
      c.height = ph;
      const g = c.getContext("2d");
      if (variant === 6) {
        drawGalleryHUD(g, pw, ph, galleryPhotoIdx, 0, galleryAlbum, galleryViewMode);
      } else if (variant === 7) {
        updateAndDrawGameHUD(g, pw, ph, 0.016, 0);
      } else {
        drawHUD(g, pw, ph, variant, 0);
      }
      const tex = new THREE.CanvasTexture(c);
      if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
      scr.position.z = 0.012;
      g0.add(scr);
      if (variant === 5) {
        mainScreenMesh = scr;
        mainScreenGroup = g0;
        scr.userData.isMainTerminal = true;
      }
      if (variant === 6) {
        galleryScreenMesh = scr;
        galleryScreenGroup = g0;
        galleryCanvas = c;
        galleryCtx = g;
        galleryTex = tex;
        scr.userData.isGalleryScreen = true;
      }
      if (variant === 7) {
        gameScreenMesh = scr;
        gameScreenGroup = g0;
        gameCanvas = c;
        gameCtx = g;
        gameTex = tex;
        scr.userData.isGameScreen = true;
      }
      if (animated) animScreens.push({ g, w: pw, h: ph, v: variant, tex });
      return g0;
    };

    /* ---------- space: smooth procedural nebula ---------- */
    const genScene = new THREE.Scene();
    const nebMat = new THREE.ShaderMaterial({
      vertexShader: SKY_VERT, fragmentShader: NEBULA_FRAG, side: THREE.BackSide, depthWrite: false,
    });
    nebMat.toneMapped = false;
    genScene.add(new THREE.Mesh(new THREE.SphereGeometry(10, 64, 32), nebMat));
    const cubeRT = new THREE.WebGLCubeRenderTarget(1024, {
      generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter,
    });
    const cubeCam = new THREE.CubeCamera(0.1, 100, cubeRT);
    cubeCam.update(renderer, genScene);

    const space = grp();
    const skyMat = new THREE.ShaderMaterial({
      uniforms: { tCube: { value: cubeRT.texture } },
      vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false,
    });
    skyMat.toneMapped = false;
    space.add(new THREE.Mesh(new THREE.SphereGeometry(80, 64, 32), skyMat));

    const starSprite = canvasTex(64, 64, (g) => {
      const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, "rgba(255,255,255,1)");
      grd.addColorStop(0.18, "rgba(255,240,225,0.85)");
      grd.addColorStop(0.45, "rgba(255,220,200,0.18)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, 64, 64);
    });
    const starLayer = (n, size, seed) => {
      const R = rng(seed);
      const pos = new Float32Array(n * 3);
      const col = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const u = R() * 2 - 1, th = R() * Math.PI * 2, rr = Math.sqrt(1 - u * u), d = 52 + R() * 14;
        pos.set([rr * Math.cos(th) * d, u * d, rr * Math.sin(th) * d], i * 3);
        const k = R(), b = 0.55 + R() * 0.45;
        const c = k < 0.3 ? [1, 0.78, 0.55] : k < 0.55 ? [0.8, 0.85, 1] : [1, 1, 1];
        col.set([c[0] * b, c[1] * b, c[2] * b], i * 3);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      space.add(
        new THREE.Points(
          geo,
          new THREE.PointsMaterial({
            size, map: starSprite, vertexColors: true, transparent: true, depthWrite: false,
            blending: THREE.AdditiveBlending, sizeAttenuation: true, toneMapped: false,
          })
        )
      );
    };
    starLayer(4200, 0.2, 7);
    starLayer(700, 0.42, 11);
    starLayer(60, 1.3, 23);

    /* ---------- floor (tapered) ---------- */
    const zFront = -3.35, zRear = 3.7;
    const floorShape = new THREE.Shape();
    floorShape.moveTo(-(hw(zFront) + 0.3), -zFront);
    floorShape.lineTo(hw(zFront) + 0.3, -zFront);
    floorShape.lineTo(hw(zRear) + 0.3, -zRear);
    floorShape.lineTo(-(hw(zRear) + 0.3), -zRear);
    floorShape.closePath();
    const floorBase = new THREE.Mesh(new THREE.ShapeGeometry(floorShape), M.black);
    floorBase.rotation.x = -Math.PI / 2;
    floorBase.position.y = -0.005;
    scene.add(floorBase);

    const slatList = [];
    for (let z = -3.3; z <= 3.6; z += 0.13) slatList.push([0, 0.018, z, 0, 0, 0, null, 2 * hw(z) + 0.05]);
    inst(new THREE.BoxGeometry(1, 0.035, 0.085), M.slat, slatList);

    const rivets = [];
    for (let z = -3.1; z <= 3.5; z += 0.26) {
      rivets.push([-(hw(z) - 0.12), 0.045, z]);
      rivets.push([hw(z) - 0.12, 0.045, z]);
    }
    inst(new THREE.SphereGeometry(0.02, 8, 6), M.rivet, rivets);

    const ladderTex = canvasTex(64, 256, (g, w, h) => {
      g.fillStyle = "#000";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "#f6d8de";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(4, 0); g.lineTo(4, h);
      g.moveTo(w - 4, 0); g.lineTo(w - 4, h);
      g.stroke();
      for (let y = 0; y < h; y += h / 12) {
        g.strokeRect(11, y + 3, w / 2 - 15, h / 12 - 6);
        g.strokeRect(w / 2 + 4, y + 3, w / 2 - 15, h / 12 - 6);
      }
    });
    for (const s of [-1, 1]) {
      const a = V(s * 0.62, 0, -3.1), b = V(s * 1.2, 0, 3.45);
      const len = a.distanceTo(b);
      const tex = repeatTex(ladderTex.clone(), 1, len / 1.2);
      tex.needsUpdate = true;
      const mat = std({ map: tex, emissiveMap: tex, emissive: 0xffc8d2, emissiveIntensity: 0.45, roughness: 0.4, metalness: 0.5 });
      const lg = grp((a.x + b.x) / 2, 0.042, (a.z + b.z) / 2, 0, Math.atan2(b.x - a.x, b.z - a.z), 0);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.3, len), mat);
      m.rotation.x = -Math.PI / 2;
      lg.add(m);
    }

    /* ---------- side walls (each in its own angled frame) ---------- */
    // In a side group, local z runs along the wall and local x = s * (distance outward from the floor edge).
    const sideLen = 7.0, sideZ = 0.2;
    const side = {};
    for (const s of [-1, 1]) {
      const G = grp(s * hw(0), 0, 0, 0, s * WALL_ANGLE, 0);
      side[s] = G;
      box(0.6, 0.6, sideLen, M.maroon, s * 0.3, 0.3, sideZ, 0, 0, 0, G);
      box(0.3, 0.3, sideLen, M.hull, s * 0.62, 0.95, sideZ, 0, 0, 0, G);
      glow(0.05, 0.05, sideLen, 0, 0.62, sideZ, 0, 0, 0, 0xffffff, G);
      glow(0.06, 0.04, sideLen, -s * 0.04, 0.05, sideZ, 0, 0, 0, 0xffffff, G);

      // canopy pillars leaning inward, top rail
      for (const pz of [-0.4, 2.4]) beam(V(s * 0.62, 1.05, pz), V(s * 0.25, 3.66, pz), 0.2, M.hull, G);
      box(0.14, 0.14, sideLen + 0.1, M.hull, s * 0.25, 3.66, sideZ, 0, 0, 0, G);

      // closed rear section with amber slats
      const rw = grp(s * 0.44, 2.33, 3.05, 0, 0, s * 0.14, G);
      box(0.1, 2.7, 1.3, M.hull, 0, 0, 0, 0, 0, 0, rw);
      const sl = [];
      for (let y = -1.2; y <= 1.2; y += 0.12) sl.push([-s * 0.06, y, 0]);
      inst(new THREE.BoxGeometry(0.04, 0.035, 1.15), M.amberDim, sl, rw);
    }
    // left: long ribbed shelf with amber vent near the nose
    {
      const s = -1, G = side[s], z0 = -3.3, z1 = 2.4;
      box(0.72, 0.08, z1 - z0, shelfMat(z1 - z0), s * 0.3, 0.82, (z0 + z1) / 2, 0, 0, s * 0.45, G);
      const vents = [];
      for (let z = -3.05; z <= -1.9; z += 0.07) vents.push([s * 0.3, 0.885, z, 0, 0, s * 0.45]);
      inst(new THREE.BoxGeometry(0.6, 0.03, 0.035), M.amberDim, vents, G);
      const vb = [];
      for (let z = -2.4; z <= -0.8; z += 0.06) vb.push([s * -0.01, 0.32, z, 0.35, 0, 0]);
      inst(new THREE.BoxGeometry(0.02, 0.42, 0.025), M.gold, vb, G);
    }
    // right: shorter shelf, segmented coil along the sill
    {
      const s = 1, G = side[s], z0 = -3.3, z1 = 1.2;
      box(0.72, 0.08, z1 - z0, shelfMat(z1 - z0), s * 0.3, 0.82, (z0 + z1) / 2, 0, 0, s * 0.45, G);
      const coilList = [];
      const coilCols = [0xe3a234, 0x8a4a20, 0x3a1a14, 0xd06a20, 0xf2c25a];
      const CR = rng(99);
      for (let i = 0; i < 48; i++) {
        const z = -3.0 + i * 0.086;
        for (let k = 0; k < 10; k++) {
          const a = ((k + (i % 2) * 0.5) / 10) * Math.PI * 2;
          coilList.push([s * 0.45 + Math.cos(a) * 0.13, 1.14 + Math.sin(a) * 0.13, z, 0, 0, a, coilCols[Math.floor(CR() * 5)]]);
        }
      }
      inst(new THREE.BoxGeometry(0.045, 0.08, 0.075), M.coil, coilList, G);
    }
    const knobPanel = (s, zc, rows, cols) => {
      const kp = grp(s * 0.18, 0.92, zc, 0, 0, -s * 0.3, side[s]);
      box(0.06, 0.82, cols * 0.17 + 0.12, M.maroon, 0, 0, 0, 0, 0, 0, kp);
      const outer = [], inner = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const y = -0.28 + r * (0.56 / Math.max(1, rows - 1));
          const z = -((cols - 1) * 0.17) / 2 + c * 0.17 + (r % 2 ? 0.04 : -0.04);
          outer.push([-s * 0.05, y, z, 0, 0, Math.PI / 2]);
          inner.push([-s * 0.07, y, z, 0, 0, Math.PI / 2]);
        }
      }
      inst(new THREE.CylinderGeometry(0.065, 0.07, 0.05, 10), M.gold, outer, kp);
      inst(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 12), M.black, inner, kp);
    };
    knobPanel(1, 2.3, 4, 6);
    knobPanel(-1, 3.05, 4, 3);

    // fire extinguisher on the left rear wall
    const ext = grp(-0.36, 1.6, 3.0, Math.PI / 2, 0, 0, side[-1]);
    cyl(0.12, 0.12, 0.62, 24, M.red, 0, 0, 0, 0, 0, 0, ext);
    cyl(0.125, 0.125, 0.07, 24, M.black, 0, 0.12, 0, 0, 0, 0, ext);
    cyl(0.125, 0.125, 0.07, 24, M.black, 0, -0.14, 0, 0, 0, 0, ext);
    cyl(0.04, 0.05, 0.1, 12, M.black, 0, -0.36, 0, 0, 0, 0, ext);

    /* ---------- nose: dash, front pillars, roof ---------- */
    box(4.5, 1.0, 0.45, M.maroon, 0, 0.5, -3.52);
    box(4.4, 0.06, 0.6, dashMat, 0, 1.02, -3.45, -0.25, 0, 0);
    glow(3.0, 0.05, 0.05, 0, 0.62, -3.28);
    for (const s of [-1, 1]) {
      beam(V(s * 2.15, 1.0, -3.58), V(s * 1.75, 3.68, -3.3), 0.2, M.hull);
      beam(V(s * 0.35, 1.05, -3.5), V(s * 1.2, 2.6, -2.56), 0.09, M.hull);
      box(0.1, 0.55, 0.1, M.hull, s * 1.5, 3.45, -2.72);
    }
    box(3.7, 0.16, 0.18, M.hull, 0, 3.68, -3.32);

    const roofShape = new THREE.Shape();
    const rzF = -3.4, rzR = 3.8;
    roofShape.moveTo(-(hw(rzF) + 0.35), rzF);
    roofShape.lineTo(hw(rzF) + 0.35, rzF);
    roofShape.lineTo(hw(rzR) + 0.35, rzR);
    roofShape.lineTo(-(hw(rzR) + 0.35), rzR);
    roofShape.closePath();
    const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(roofShape, { depth: 0.12, bevelEnabled: false }), M.hull);
    roof.rotation.x = Math.PI / 2; // shape y -> world z, extrusion goes downward
    roof.position.y = 3.8;
    scene.add(roof);

    // ceiling fixtures
    for (const z of [1.0, 1.25, 1.5]) glow(1.6, 0.035, 0.1, 0, 3.66, z);
    glow(2.2, 0.02, 0.45, 0, 3.67, -1.4);
    const spkTex = canvasTex(128, 128, (g) => {
      g.fillStyle = "#050505";
      g.fillRect(0, 0, 128, 128);
      for (let r = 60; r > 18; r -= 7) {
        g.strokeStyle = "#c4c4c4";
        g.lineWidth = 3;
        g.beginPath();
        g.arc(64, 64, r, 0, Math.PI * 2);
        g.stroke();
      }
    });
    const spkMat = new THREE.MeshBasicMaterial({ map: spkTex, color: 0x9a9a9a });
    for (const z of [2.25, 2.65]) {
      for (const x of [-0.75, -0.25, 0.25, 0.75]) {
        const m = new THREE.Mesh(new THREE.CircleGeometry(0.17, 32), spkMat);
        m.rotation.x = Math.PI / 2;
        m.position.set(x, 3.675, z);
        scene.add(m);
      }
    }

    /* ---------- overhead console ---------- */
    const oc = grp(0, 3.02, -2.64, 0.4, 0, 0);
    box(3.6, 0.8, 0.45, M.hull, 0, 0.15, 0, 0, 0, 0, oc);
    screenUnit(0.95, 0.62, 0, true, oc, -0.72, 0.2, 0.24);
    screenUnit(1.7, 0.62, 1, true, oc, 0.76, 0.2, 0.24);
    const btns = [], toggles = [];
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 5; c++) {
        const x = -1.7 + c * 0.1, y = 0.46 - r * 0.1;
        if (r === 2 || r === 3) toggles.push([x, y, 0.25, 0.3, 0, 0]);
        else btns.push([x, y, 0.235]);
      }
    }
    inst(new THREE.BoxGeometry(0.07, 0.06, 0.03), M.cream, btns, oc);
    inst(new THREE.BoxGeometry(0.03, 0.07, 0.03), M.gold, toggles, oc);
    box(3.5, 0.3, 0.5, M.black, 0, -0.38, 0.03, 0, 0, 0, oc);
    box(3.5, 0.025, 0.025, M.orangeGlow, 0, -0.53, 0.28, 0, 0, 0, oc);
    const knobs = [];
    for (let i = 0; i < 8; i++) knobs.push([-1.6 + i * 0.13, -0.38, 0.3, Math.PI / 2, 0, 0]);
    inst(new THREE.CylinderGeometry(0.05, 0.055, 0.06, 16), M.metal, knobs, oc);
    inst(new THREE.BoxGeometry(0.02, 0.07, 0.02), M.black, knobs.map((k) => [k[0], k[1], 0.335]), oc);
    box(1.1, 0.12, 0.02, M.orangeGlow, 0.02, -0.38, 0.29, 0, 0, 0, oc);
    box(1.06, 0.085, 0.02, M.black, 0.02, -0.38, 0.295, 0, 0, 0, oc);
    const sq = [];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 7; c++) sq.push([0.75 + c * 0.13, -0.32 - r * 0.12, 0.29]);
    inst(new THREE.BoxGeometry(0.075, 0.075, 0.03), M.cream, sq, oc);

    /* ---------- center console, tucked right up against the seat ---------- */
    const glowBeam = (a, b, t, c, parent = scene) => {
      beam(a, b, t, glowMat(c), parent);
      beam(a, b, t + 0.035, haloMat(c, 0.16), parent);
    };
    // pedestal column with the instrument cluster hanging over the pilot's knees
    box(0.6, 0.5, 0.66, M.maroon, 0, 0.25, -1.05);
    for (let i = 0; i < 5; i++) box(0.7, 0.035, 0.76, M.chrome, 0, 0.07 + i * 0.085, -1.05);
    box(0.4, 0.95, 0.42, M.maroon, 0, 0.95, -1.0);
    for (const s of [-1, 1]) {
      box(0.13, 0.02, 0.3, M.orangeGlow, s * 0.09, 1.435, -0.95);
      const rv = [];
      for (let y = 0.12; y <= 0.5; y += 0.07) rv.push([s * 0.31, y, -0.71]);
      inst(new THREE.SphereGeometry(0.018, 8, 6), M.gold, rv);
    }
    box(0.08, 0.45, 0.08, M.black, 0, 1.62, -1.08);
    // Main pilot terminal on stand (variant 5 - Ramy Kassam HUD & sections)
    screenUnit(0.95, 0.62, 5, true, scene, 0, 1.94, -1.05, -0.15, 0, 0);
    // Invisible hit volume around the entire monitor cluster for easy 1st-click general focus
    const consoleAreaHitMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 1.95, 1.15),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    consoleAreaHitMesh.position.set(0, 1.42, -0.72);
    scene.add(consoleAreaHitMesh);
    box(0.86, 0.5, 0.22, M.black, 0, 1.05, -0.66, -0.35, 0, 0);
    // Arcade Space Game ("STAR DEFENDER") on the upper-center auxiliary monitor (variant 7)
    screenUnit(0.42, 0.29, 7, false, scene, 0, 1.2, -0.52, -0.35, 0, 0);
    // Digital Photo Gallery on the lower center monitor: Loveland Ski Trip (variant 6)
    screenUnit(0.58, 0.30, 6, false, scene, 0, 0.87, -0.37, -0.75, 0, 0);
    screenUnit(0.28, 0.4, 2, false, scene, -0.42, 1.1, -0.48, -0.2214, 0.4404, 0.0957);
    screenUnit(0.28, 0.4, 3, false, scene, 0.42, 1.1, -0.48, -0.2214, -0.4404, -0.0957);
    screenUnit(0.2, 0.32, 4, true, scene, -0.74, 1.14, -0.4, -0.3, 0.7, 0);
    screenUnit(0.2, 0.32, 4, false, scene, 0.74, 1.14, -0.4, -0.3, -0.7, 0);
    for (const s of [-1, 1]) {
      box(0.04, 0.95, 0.04, M.black, s * 0.74, 0.5, -0.46);
      box(0.28, 0.04, 0.04, M.black, s * 0.6, 0.97, -0.5);
    }
    // pedals sit under the cluster
    box(0.62, 0.08, 0.32, M.black, 0, 0.04, -0.2);
    for (const s of [-1, 1]) {
      box(0.14, 0.03, 0.28, M.metal, s * 0.17, 0.16, -0.18, 0.6, 0, 0);
      box(0.12, 0.012, 0.22, M.black, s * 0.17, 0.175, -0.18, 0.6, 0, 0);
    }

    /* ---------- pilot seat ---------- */
    const panelMat = std({ color: 0x342a2f, roughness: 0.3, metalness: 0.75 });
    const gripMat = std({ color: 0x2a1416, roughness: 0.8, metalness: 0.1 });
    const seat = grp(0, 0, 0.6);
    const backZ = (y) => 0.3 + (y - 0.9) * 0.133; // front line of the backrest
    const LEAN = 0.133;

    // swivel base: floor plate with glowing ring, octagonal pedestal, hydraulic struts
    cyl(0.5, 0.52, 0.04, 48, M.black, 0, 0.02, 0.05, 0, 0, 0, seat);
    for (const [r0, r1, mat] of [[0.44, 0.47, glowMat(0x62f0ff)], [0.42, 0.5, haloMat(0x62f0ff, 0.18)]]) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 64), mat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 0.045, 0.05);
      seat.add(ring);
    }
    cyl(0.18, 0.3, 0.32, 8, M.hull, 0, 0.2, 0.05, 0, Math.PI / 8, 0, seat);
    cyl(0.25, 0.25, 0.04, 32, M.chrome, 0, 0.38, 0.05, 0, 0, 0, seat);
    for (const s of [-1, 1]) {
      beam(V(s * 0.22, 0.06, 0.32), V(s * 0.19, 0.27, 0.23), 0.06, M.black, seat);
      beam(V(s * 0.2, 0.2, 0.26), V(s * 0.14, 0.52, 0.1), 0.03, M.chrome, seat);
    }

    // sculpted side shells: one continuous profile from seat bolster to headrest wing
    const prof = new THREE.Shape();
    prof.moveTo(-0.34, 0.42);
    prof.lineTo(-0.36, 0.6);
    prof.quadraticCurveTo(-0.34, 0.7, -0.22, 0.69);
    prof.lineTo(0.12, 0.72);
    prof.quadraticCurveTo(0.26, 0.74, 0.3, 0.9);
    prof.lineTo(0.37, 1.5);
    prof.quadraticCurveTo(0.3, 1.62, 0.34, 1.75);
    prof.lineTo(0.4, 2.0);
    prof.quadraticCurveTo(0.46, 2.07, 0.55, 2.0);
    prof.lineTo(0.57, 1.5);
    prof.quadraticCurveTo(0.5, 0.9, 0.42, 0.55);
    prof.quadraticCurveTo(0.38, 0.4, 0.22, 0.4);
    prof.closePath();
    const cut = new THREE.Path();
    cut.moveTo(0.38, 1.0);
    cut.lineTo(0.45, 1.0);
    cut.lineTo(0.5, 1.4);
    cut.lineTo(0.42, 1.4);
    cut.closePath();
    prof.holes.push(cut);
    const profGeo = new THREE.ExtrudeGeometry(prof, {
      depth: 0.06, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 14,
    });
    for (const s of [-1, 1]) {
      const p = new THREE.Mesh(profGeo, panelMat);
      p.rotation.y = -Math.PI / 2; // profile x -> seat z, extrusion -> -x
      p.position.x = s * 0.34 + 0.03;
      seat.add(p);
      // cyan light lines along the shell's front edge and headrest wing
      glowBeam(V(s * 0.34, 0.93, 0.285), V(s * 0.34, 1.48, 0.358), 0.018, 0x62f0ff, seat);
      glowBeam(V(s * 0.34, 1.78, 0.33), V(s * 0.34, 1.97, 0.385), 0.018, 0x62f0ff, seat);
      // amber vents on the outside of the bolster
      const vv = [];
      for (let y = 0.48; y <= 0.63; y += 0.045) vv.push([s * 0.392, y, -0.02]);
      inst(new THREE.BoxGeometry(0.012, 0.018, 0.36), M.amberDim, vv, seat);
    }

    // cushions: seat pan, thigh roll, quilted back pads, headrest
    rbox(0.6, 0.08, 0.6, 0.02, panelMat, 0, 0.57, 0.01, 0, 0, 0, seat);
    rbox(0.58, 0.12, 0.56, 0.05, cushionMat, 0, 0.66, 0.0, 0, 0, 0, seat);
    rbox(0.56, 0.1, 0.12, 0.04, cushionMat, 0, 0.7, -0.28, 0, 0, 0, seat);
    box(0.6, 1.25, 0.06, panelMat, 0, 1.22, backZ(1.22) + 0.13, LEAN, 0, 0, seat);
    for (let i = 0; i < 5; i++) {
      const y = 0.86 + i * 0.155;
      rbox(0.54, 0.14, 0.1, 0.04, cushionMat, 0, y, backZ(y) + 0.045, LEAN, 0, 0, seat);
    }
    box(0.6, 0.36, 0.06, panelMat, 0, 1.86, backZ(1.86) + 0.08, LEAN, 0, 0, seat);
    rbox(0.4, 0.24, 0.1, 0.04, cushionMat, 0, 1.84, backZ(1.84) + 0.0, LEAN, 0, 0, seat);
    box(0.16, 0.05, 0.2, M.black, 0, 1.92, backZ(1.92) + 0.03, LEAN, 0, 0, seat);
    glow(0.4, 0.015, 0.015, 0, 2.03, backZ(2.03) + 0.06, 0, 0, 0, 0x62f0ff, seat);

    // harness with a glowing quick-release buckle
    for (const s of [-1, 1]) {
      beam(V(s * 0.13, 1.62, backZ(1.62) - 0.01), V(s * 0.09, 0.86, backZ(0.86) - 0.02), 0.05, M.strap, seat);
      beam(V(s * 0.09, 0.86, backZ(0.86) - 0.02), V(s * 0.03, 0.74, -0.06), 0.045, M.strap, seat);
      beam(V(s * 0.28, 0.73, 0.12), V(s * 0.03, 0.75, -0.06), 0.045, M.strap, seat);
      box(0.06, 0.07, 0.012, M.gold, s * 0.12, 1.3, backZ(1.3) - 0.03, LEAN, 0, 0, seat);
    }
    cyl(0.06, 0.06, 0.03, 24, M.gold, 0, 0.76, -0.08, Math.PI / 2, 0, 0, seat);
    const buckleRing = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.007, 8, 24), glowMat(0x62f0ff));
    buckleRing.position.set(0, 0.76, -0.097);
    seat.add(buckleRing);

    // striped ejection handle at the front of the seat
    const eject = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.013, 10, 24, Math.PI), stickStripe);
    eject.position.set(0, 0.6, -0.37);
    eject.rotation.x = -0.35;
    seat.add(eject);

    /* ---------- side control pods built into the seat ---------- */
    for (const s of [-1, 1]) {
      const pod = grp(s * 0.56, 0, -0.05, 0, 0, 0, seat);
      beam(V(-s * 0.2, 0.5, 0.25), V(0, 0.58, 0.15), 0.05, M.chrome, pod);
      beam(V(-s * 0.2, 0.46, -0.1), V(0, 0.56, -0.2), 0.04, M.chrome, pod);
      rbox(0.22, 0.2, 0.66, 0.04, panelMat, 0, 0.63, -0.1, 0, 0, 0, pod);
      rbox(0.21, 0.17, 0.2, 0.04, panelMat, 0, 0.66, -0.46, 0.5, 0, 0, pod);
      rbox(0.26, 0.045, 0.7, 0.02, M.maroon, 0, 0.755, -0.1, 0, 0, 0, pod);
      rbox(0.14, 0.04, 0.28, 0.02, cushionMat, 0, 0.795, 0.1, 0, 0, 0, pod);
      glow(0.015, 0.015, 0.68, -s * 0.125, 0.735, -0.1, 0, 0, 0, 0x62f0ff, pod);
      glow(0.015, 0.015, 0.6, s * 0.116, 0.57, -0.1, 0, 0, 0, 0xffa030, pod);
      box(0.01, 0.05, 0.3, hazardMat, s * 0.113, 0.65, -0.1, 0, 0, 0, pod);
      // small screen facing the pilot
      screenUnit(0.22, 0.13, s > 0 ? 3 : 0, true, pod, -s * 0.114, 0.64, -0.08, 0, -s * Math.PI / 2, 0);
      // key row
      const keys = [], lit = [];
      for (let c = 0; c < 3; c++) {
        keys.push([-0.07 + c * 0.07, 0.785, -0.4]);
        lit.push([-0.07 + c * 0.07, 0.785, -0.34]);
      }
      inst(new THREE.BoxGeometry(0.045, 0.02, 0.04), M.cream, keys, pod);
      inst(new THREE.BoxGeometry(0.045, 0.02, 0.04), M.orangeGlow, lit, pod);
    }

    // right pod: gimballed flight stick with a sculpted grip
    const stick = grp(0.56, 0, -0.05, 0, 0, 0, seat);
    cyl(0.045, 0.075, 0.07, 16, M.black, 0, 0.81, -0.18, 0, 0, 0, stick);
    const gimbal = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.01, 8, 24), M.chrome);
    gimbal.rotation.x = Math.PI / 2;
    gimbal.position.set(0, 0.85, -0.18);
    stick.add(gimbal);
    cyl(0.018, 0.02, 0.1, 12, M.chrome, 0, 0.9, -0.18, 0, 0, 0, stick);
    const gripPts = [
      [0, 0], [0.032, 0], [0.04, 0.03], [0.044, 0.08], [0.037, 0.12],
      [0.045, 0.15], [0.04, 0.18], [0.025, 0.2], [0, 0.205],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const grip = new THREE.Mesh(new THREE.LatheGeometry(gripPts, 28), gripMat);
    grip.position.set(0, 0.94, -0.18);
    grip.rotation.x = -0.18;
    stick.add(grip);
    cyl(0.035, 0.035, 0.03, 20, stickStripe, 0, 0.012, 0, 0, 0, 0, grip);
    box(0.018, 0.045, 0.022, M.gold, 0, 0.085, -0.045, 0, 0, 0, grip);
    cyl(0.012, 0.012, 0.02, 10, M.chrome, 0, 0.205, 0.012, 0, 0, 0, grip);
    cyl(0.014, 0.014, 0.014, 12, M.red, 0.016, 0.2, -0.012, 0, 0, 0, grip);

    // left pod: sliding throttle in a lit track, plus a trackball
    const thr = grp(-0.56, 0, -0.05, 0, 0, 0, seat);
    box(0.05, 0.012, 0.32, M.black, 0, 0.783, -0.16, 0, 0, 0, thr);
    for (const s of [-1, 1]) glow(0.008, 0.008, 0.3, s * 0.035, 0.786, -0.16, 0, 0, 0, 0xffa030, thr);
    box(0.02, 0.11, 0.02, M.chrome, 0, 0.84, -0.22, -0.3, 0, 0, thr);
    rbox(0.12, 0.1, 0.08, 0.03, gripMat, 0, 0.9, -0.25, 0, 0, 0, thr);
    cyl(0.018, 0.018, 0.02, 12, M.gold, -0.06, 0.91, -0.25, 0, 0, Math.PI / 2, thr);
    for (const x of [-0.025, 0.025]) cyl(0.011, 0.011, 0.012, 10, glowMat(0x62f0ff), x, 0.955, -0.25, 0, 0, 0, thr);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.028, 20, 14), M.glass);
    ball.position.set(0, 0.785, -0.06);
    thr.add(ball);

    /* ---------- rear wall with sliding airlock door ---------- */
    const rzW = 3.72, rwHalf = 3.3;
    const segW = rwHalf - 0.9;
    for (const s of [-1, 1]) box(segW, 3.8, 0.12, M.hull, s * (0.9 + segW / 2), 1.9, rzW);
    box(1.8, 1.15, 0.12, M.hull, 0, 3.225, rzW);
    const rs = [];
    for (let y = 0.4; y <= 3.55; y += 0.12) {
      for (const s of [-1, 1]) rs.push([s * (0.95 + (segW - 0.1) / 2), y, rzW - 0.08, 0, 0, 0, null, segW - 0.1]);
      if (y > 2.75) rs.push([0, y, rzW - 0.08, 0, 0, 0, null, 1.6]);
    }
    inst(new THREE.BoxGeometry(1, 0.035, 0.05), M.amberDim, rs);

    for (const s of [-1, 1]) box(0.22, 2.65, 0.34, M.hull, s * 0.81, 1.325, rzW - 0.1);
    box(1.84, 0.22, 0.34, M.hull, 0, 2.54, rzW - 0.1);
    for (const s of [-1, 1]) glow(0.025, 2.38, 0.025, s * 0.69, 1.2, rzW - 0.27, 0, 0, 0, 0xffa030);
    glow(1.38, 0.025, 0.025, 0, 2.42, rzW - 0.27, 0, 0, 0, 0xffa030);
    const doorSeam = new THREE.MeshBasicMaterial({ color: 0xff8a1a, toneMapped: false });
    for (const s of [-1, 1]) {
      box(0.69, 2.42, 0.06, doorMat, s * 0.345, 1.21, rzW - 0.02);
      box(0.1, 0.45, 0.012, M.glass, s * 0.2, 1.65, rzW - 0.056);
      box(0.03, 0.35, 0.04, M.metal, s * 0.08, 1.15, rzW - 0.07);
    }
    box(0.012, 2.36, 0.01, doorSeam, 0, 1.2, rzW - 0.055);
    box(1.38, 0.16, 0.01, hazardMat, 0, 0.12, rzW - 0.056);
    box(1.38, 0.12, 0.01, hazardMat, 0, 2.33, rzW - 0.056);
    for (const s of [-1, 1]) {
      box(0.55, 0.55, 0.08, M.maroon, s * 1.55, 1.75, rzW - 0.1, 0, 0, Math.PI / 4);
      box(0.08, 0.24, 0.02, M.orangeGlow, s * 1.55, 1.75, rzW - 0.15);
    }
    screenUnit(0.2, 0.28, 4, true, scene, 1.12, 1.35, rzW - 0.08, 0, Math.PI, 0);
    const kb = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) kb.push([1.06 + c * 0.06, 1.08 - r * 0.06, rzW - 0.08]);
    inst(new THREE.BoxGeometry(0.04, 0.04, 0.02), M.cream, kb);
    glow(0.9, 0.04, 0.04, 0, 2.78, rzW - 0.12, 0, 0, 0, 0xffa030);

    /* ---------- lighting ---------- */
    scene.add(new THREE.AmbientLight(0x4a3440, 0.9));
    scene.add(new THREE.HemisphereLight(0x9a6ac0, 0x301010, 0.55));
    const dl1 = new THREE.DirectionalLight(0xff8a50, 0.9);
    dl1.position.set(-8, 5, -3);
    scene.add(dl1);
    const dl2 = new THREE.DirectionalLight(0xc070ff, 0.6);
    dl2.position.set(8, 6, -6);
    scene.add(dl2);
    const pCy = new THREE.PointLight(0x5fe8ff, 1.6, 4.5, 2);
    pCy.position.set(0, 1.4, -0.1);
    scene.add(pCy);
    const pWarm = new THREE.PointLight(0xffb070, 1.6, 7, 2);
    pWarm.position.set(0, 3.3, 1.3);
    scene.add(pWarm);
    const pFront = new THREE.PointLight(0xffffff, 1.0, 6, 2);
    pFront.position.set(0, 3.2, -1.4);
    scene.add(pFront);
    const pDoor = new THREE.PointLight(0xffa040, 1.0, 4, 2);
    pDoor.position.set(0, 2.2, 3.1);
    scene.add(pDoor);
    const pFloor = new THREE.PointLight(0xff9a50, 0.6, 5, 2);
    pFloor.position.set(0, 0.7, 2.4);
    scene.add(pFloor);

    /* ---------- camera control & raycasting ---------- */
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const driftSpeed = reduceMotion ? 0.3 : 1;
    const R_MIN = 1.1, R_MAX = 3.6;
    const target = new THREE.Vector3(0, 1.2, -0.15);
    const cur = { theta: 0.35, phi: 1.0, r: 2.9 };
    const des = { ...cur };
    const camPos = new THREE.Vector3();
    const want = new THREE.Vector3();
    let first = true;
    let t = 0;

    // Focused camera targets:
    // Close focus: directly perpendicular, monitor fills ~80% of view (screen at [0, 1.94, -1.05] tilted -0.15 rad)
    const closeCamPos = new THREE.Vector3(0, 2.023, -0.496);
    const focusLookTarget = new THREE.Vector3(0, 1.94, -1.05);
    // Medium focus: general pilot view showing the main monitor AND all lower auxiliary monitors below it
    const mediumCamPos = new THREE.Vector3(0, 2.15, 0.85);
    const mediumLookTarget = new THREE.Vector3(0, 1.48, -0.75);
    // Gallery focus: directly perpendicular close-up on the lower center Digital Gallery monitor
    const galleryCamPos = new THREE.Vector3(0, 1.129, -0.092);
    const galleryLookTarget = new THREE.Vector3(0, 0.87, -0.37);
    // Game focus: directly perpendicular close-up on the upper-center Arcade Space Game monitor
    const gameCamPos = new THREE.Vector3(0, 1.323, -0.182);
    const gameLookTarget = new THREE.Vector3(0, 1.2, -0.52);
    const currentLookAt = new THREE.Vector3().copy(target);

    const pointers = new Map();
    let pinchDist = 0;
    const el = renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downPos = null;
    let downTime = 0;
    let downOnScreen = false;

    const checkScreenHit = (clientX, clientY) => {
      const rect = el.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      if (mainScreenMesh && raycaster.intersectObject(mainScreenMesh).length > 0) return true;
      if (galleryScreenMesh && raycaster.intersectObject(galleryScreenMesh).length > 0) return true;
      if (gameScreenMesh && raycaster.intersectObject(gameScreenMesh).length > 0) return true;
      if (
        focusModeRef.current === 'none' &&
        consoleAreaHitMesh &&
        raycaster.intersectObject(consoleAreaHitMesh).length > 0
      ) {
        return true;
      }
      return false;
    };

    const takeControl = () => {
      if (autoRef.current) {
        autoRef.current = false;
        setAuto(false);
      }
    };

    cycleCameraViewRef.current = () => {
      playClickSound(520, 0.05);
      if (focusModeRef.current === 'none') {
        focusModeRef.current = 'medium';
        setFocusMode('medium');
      } else if (focusModeRef.current === 'medium') {
        focusModeRef.current = 'close';
        setFocusMode('close');
      } else if (focusModeRef.current === 'close') {
        focusModeRef.current = 'game';
        setFocusMode('game');
      } else if (focusModeRef.current === 'game') {
        focusModeRef.current = 'gallery';
        setFocusMode('gallery');
      } else {
        focusModeRef.current = 'none';
        setFocusMode('none');
        des.theta = 0.35;
        des.phi = 1.0;
        des.r = 2.9;
        target.set(0, 1.2, -0.15);
      }
    };

    zoomOutRef.current = () => {
      if (
        focusModeRef.current === 'close' ||
        focusModeRef.current === 'gallery' ||
        focusModeRef.current === 'game'
      ) {
        focusModeRef.current = 'medium';
        setFocusMode('medium');
        playClickSound(420, 0.05);
      } else if (focusModeRef.current === 'medium') {
        focusModeRef.current = 'none';
        setFocusMode('none');
        des.theta = 0.35;
        des.phi = 1.0;
        des.r = 2.9;
        target.set(0, 1.2, -0.15);
        playClickSound(380, 0.06);
      }
    };

    const onDown = (e) => {
      downPos = { x: e.clientX, y: e.clientY };
      downTime = performance.now();
      downOnScreen = checkScreenHit(e.clientX, e.clientY);
      try { el.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      el.style.cursor =
        focusModeRef.current === 'close' ||
        focusModeRef.current === 'gallery' ||
        focusModeRef.current === 'game'
          ? "default"
          : "grabbing";
      if (focusModeRef.current === 'game' && spaceGame.state === 'playing') {
        spaceGame.keys.fire = true;
      }
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };

    const onMove = (e) => {
      // Allow mouse steering inside the Space Game monitor even if mouse button is held down
      if (gameScreenMesh && focusModeRef.current === 'game') {
        const rect = el.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const gameHits = raycaster.intersectObject(gameScreenMesh);
        if (gameHits.length > 0 && gameHits[0].uv) {
          const gw = gameCanvas ? gameCanvas.width : 800;
          spaceGame.targetShipX = gameHits[0].uv.x * gw;
          spaceGame.usingMouse = true;
        }
      }

      if (pointers.size === 0) {
        // In initial wide view ('none'), hovering anywhere around the monitor cluster highlights general focus
        if (focusModeRef.current === 'none') {
          if (hoveredGameRef.current) {
            hoveredGameRef.current = false;
            setHoveredGame(false);
          }
          if (hoveredGalleryRef.current) {
            hoveredGalleryRef.current = false;
            setHoveredGallery(false);
          }
          const isAreaHit = checkScreenHit(e.clientX, e.clientY);
          el.style.cursor = isAreaHit ? "pointer" : "grab";
          if (isAreaHit !== hoveredRef.current) {
            hoveredRef.current = isAreaHit;
            setHovered(isAreaHit);
          }
          return;
        }

        if (mainScreenMesh) {
          const rect = el.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);
          const scrHits = raycaster.intersectObject(mainScreenMesh);
          if (scrHits.length > 0 && scrHits[0].uv) {
            const uv = scrHits[0].uv;
            const cx = uv.x * 1024;
            const cy = (1 - uv.y) * 668;
            let onLink = false;
            if (activeTabRef.current === 'home') {
              onLink = !!homeNavBoxes.find((b) => cx >= b.x0 && cx <= b.x1 && cy >= b.y0 && cy <= b.y1);
            } else {
              onLink = !!pageNavBoxes.find((b) => cx >= b.x0 && cx <= b.x1 && cy >= b.y0 && cy <= b.y1);
            }

            // Check if hovering over Contact form or email
            if (activeTabRef.current === 'contact') {
              if (cx >= 50 && cx <= 400 && cy >= 165 && cy <= 198) {
                el.style.cursor = "pointer";
                if (!hoveredRef.current) { hoveredRef.current = true; setHovered(true); }
                return;
              }
              if (
                (cx >= 50 && cx <= 445 && cy >= 205 && cy <= 252) ||
                (cx >= 470 && cx <= 870 && cy >= 205 && cy <= 252) ||
                (cx >= 50 && cx <= 870 && cy >= 273 && cy <= 321) ||
                (cx >= 50 && cx <= 870 && cy >= 341 && cy <= 437)
              ) {
                el.style.cursor = "text";
                if (!hoveredRef.current) { hoveredRef.current = true; setHovered(true); }
                return;
              }
              if (cx >= 50 && cx <= 245 && cy >= 453 && cy <= 501) {
                el.style.cursor = "pointer";
                if (!hoveredRef.current) { hoveredRef.current = true; setHovered(true); }
                return;
              }
            }

            // Check if hovering over Experience resume link
            if (activeTabRef.current === 'experience') {
              const effectiveY = cy + curScrollY;
              if (cx >= 50 && cx <= 974 && effectiveY >= 82 && effectiveY <= 126) {
                el.style.cursor = "pointer";
                if (!hoveredRef.current) { hoveredRef.current = true; setHovered(true); }
                return;
              }
            }

            // Check if hovering over Projects links
            if (activeTabRef.current === 'projects') {
              const effectiveY = cy + curScrollY;
              if ((cx >= 760 && cx <= 980 && effectiveY >= 140 && effectiveY <= 178) ||
                  (cx >= 40 && cx <= 290 && effectiveY >= 870 && effectiveY <= 930)) {
                el.style.cursor = "pointer";
                if (!hoveredRef.current) { hoveredRef.current = true; setHovered(true); }
                return;
              }
            }

            if (onLink) {
              el.style.cursor = "pointer";
              if (!hoveredRef.current) { hoveredRef.current = true; setHovered(true); }
              return;
            }
          }
        }

        // Check if hovering over the Arcade Space Game monitor
        if (gameScreenMesh) {
          const rect = el.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);
          const gameHits = raycaster.intersectObject(gameScreenMesh);
          if (gameHits.length > 0) {
            el.style.cursor = "pointer";
            if (!hoveredGameRef.current) {
              hoveredGameRef.current = true;
              setHoveredGame(true);
            }
            if (hoveredGalleryRef.current) {
              hoveredGalleryRef.current = false;
              setHoveredGallery(false);
            }
            if (hoveredRef.current) {
              hoveredRef.current = false;
              setHovered(false);
            }
            return;
          }
        }
        if (hoveredGameRef.current) {
          hoveredGameRef.current = false;
          setHoveredGame(false);
        }

        // Check if hovering over the Digital Gallery monitor
        if (galleryScreenMesh) {
          const rect = el.getBoundingClientRect();
          mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);
          const galHits = raycaster.intersectObject(galleryScreenMesh);
          if (galHits.length > 0) {
            el.style.cursor = "pointer";
            if (!hoveredGalleryRef.current) {
              hoveredGalleryRef.current = true;
              setHoveredGallery(true);
            }
            if (hoveredRef.current) {
              hoveredRef.current = false;
              setHovered(false);
            }
            return;
          }
        }
        if (hoveredGalleryRef.current) {
          hoveredGalleryRef.current = false;
          setHoveredGallery(false);
        }

        const isFocused =
          focusModeRef.current === 'close' ||
          focusModeRef.current === 'gallery' ||
          focusModeRef.current === 'game';
        const isHit = !isFocused && checkScreenHit(e.clientX, e.clientY);
        el.style.cursor = isHit ? "pointer" : (isFocused ? "default" : "grab");
        if (isHit !== hoveredRef.current) {
          hoveredRef.current = isHit;
          setHovered(isHit);
        }
        return;
      }

      // In close-up focus on monitor, gallery, or game: allow vertical touch/drag scroll without camera displacement
      if (focusModeRef.current === 'close') {
        if (downOnScreen && (activeTabRef.current === 'about' || activeTabRef.current === 'experience' || activeTabRef.current === 'projects')) {
          const maxScroll = activeTabRef.current === 'about' ? maxScrollYAbout : activeTabRef.current === 'experience' ? maxScrollYExperience : maxScrollYProjects;
          const dyDrag = e.clientY - p.y;
          if (Math.abs(dyDrag) > 0.5) {
            targetScrollY = Math.max(0, Math.min(maxScroll, targetScrollY - dyDrag * 1.5));
          }
          p.y = e.clientY;
          p.x = e.clientX;
        }
        return;
      }
      if (focusModeRef.current === 'gallery' || focusModeRef.current === 'game') {
        return;
      }

      const p = pointers.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX;
      p.y = e.clientY;

      if (focusModeRef.current === 'medium') {
        // Dragging in medium focus smoothly transitions back to wide cockpit look-around at standard distance
        if (downPos && Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 25) {
          focusModeRef.current = 'none';
          setFocusMode('none');
          cur.r = 2.9;
          des.r = 2.9;
          target.set(0, 1.2, -0.15);
          takeControl();
        }
      }

      takeControl();
      if (pointers.size === 1) {
        des.theta -= dx * 0.005;
        des.phi = clamp(des.phi - dy * 0.004, 0.35, 2.4);
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDist > 0 && d > 0) des.r = clamp((des.r * pinchDist) / d, R_MIN, R_MAX);
        pinchDist = d;
      }
    };

    const onUp = (e) => {
      spaceGame.keys.fire = false;
      if (downPos) {
        const d = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
        const dtPress = performance.now() - downTime;
        const hitUp = checkScreenHit(e.clientX, e.clientY);
        const isScreenTarget = downOnScreen || hitUp;

        if (isScreenTarget) {
          // Click was on the monitor screen / bezel / console cluster area
          // Allow generous movement threshold for clicks so small drags still register
          if (d < 45 && dtPress < 950) {
            // In initial wide cockpit view ('none'), clicking anywhere around the monitors does the general focus of all monitors!
            if (focusModeRef.current === 'none') {
              focusModeRef.current = 'medium';
              setFocusMode('medium');
              playClickSound(480, 0.05);
              takeControl();
              pointers.delete(e.pointerId);
              return;
            }

            // Check if clicked on the Arcade Space Game monitor
            if (gameScreenMesh) {
              const rect = el.getBoundingClientRect();
              const checkPosGame = (px, py) => {
                mouse.x = ((px - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((py - rect.top) / rect.height) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const gHits = raycaster.intersectObject(gameScreenMesh);
                if (gHits.length > 0 && gHits[0].uv) {
                  return gHits[0].uv;
                }
                return null;
              };
              const gameUv = checkPosGame(e.clientX, e.clientY) || (downPos && checkPosGame(downPos.x, downPos.y));
              if (gameUv) {
                if (focusModeRef.current !== 'game') {
                  focusModeRef.current = 'game';
                  setFocusMode('game');
                  playClickSound(540, 0.05);
                  takeControl();
                  pointers.delete(e.pointerId);
                  return;
                }
                const gw = gameCanvas ? gameCanvas.width : 800;
                spaceGame.targetShipX = gameUv.x * gw;
                spaceGame.usingMouse = true;
                if (spaceGame.state !== 'playing') {
                  startSpaceGame(gw);
                  playClickSound(620, 0.06);
                } else {
                  // Fire an immediate bonus plasma burst on click
                  const shipY = (gameCanvas ? gameCanvas.height : 552) - 54;
                  spaceGame.bullets.push(
                    { x: spaceGame.shipX - 17, y: shipY - 8, vy: -620 },
                    { x: spaceGame.shipX + 17, y: shipY - 8, vy: -620 }
                  );
                  playClickSound(760, 0.03);
                }
                takeControl();
                pointers.delete(e.pointerId);
                return;
              }
            }

            // Check if clicked on the Digital Photo Gallery monitor
            if (galleryScreenMesh) {
              const rect = el.getBoundingClientRect();
              const checkPosGal = (px, py) => {
                mouse.x = ((px - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((py - rect.top) / rect.height) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const galHits = raycaster.intersectObject(galleryScreenMesh);
                if (galHits.length > 0 && galHits[0].uv) {
                  return galHits[0].uv;
                }
                return null;
              };
              const galUv = checkPosGal(e.clientX, e.clientY) || (downPos && checkPosGal(downPos.x, downPos.y));
              if (galUv) {
                // First click when not focused on the gallery monitor: focus in on the gallery monitor!
                if (focusModeRef.current !== 'gallery') {
                  focusModeRef.current = 'gallery';
                  setFocusMode('gallery');
                  gallerySlideTimer = 0;
                  playClickSound(520, 0.05);
                  takeControl();
                  pointers.delete(e.pointerId);
                  return;
                }

                // Already focused on the gallery monitor: handle trip tabs, grid selection, or prev/next
                const gw = galleryCanvas ? galleryCanvas.width : 1200;
                const gh = galleryCanvas ? galleryCanvas.height : 621;
                const cx = galUv.x * gw;
                const cy = (1 - galUv.y) * gh;

                if (cy <= 92) {
                  // Top Bar: Trip Tabs & [ All Photos ] button
                  if (cx >= 20 && cx <= 242) {
                    galleryAlbum = "loveland";
                    galleryViewMode = "grid";
                    galleryPhotoIdx = 0;
                  } else if (cx >= 246 && cx <= 450) {
                    galleryAlbum = "basin";
                    galleryViewMode = "grid";
                    galleryPhotoIdx = 0;
                  } else if (cx >= 454 && cx <= 630) {
                    galleryAlbum = "bearlake";
                    galleryViewMode = "grid";
                    galleryPhotoIdx = 0;
                  } else if (galleryViewMode === "single" && cx >= gw - 170) {
                    galleryViewMode = "grid";
                  }
                } else if (galleryViewMode === "grid") {
                  // Grid View: click a photo thumbnail to open it full-size
                  const isCompact = galleryAlbum === "basin" || galleryAlbum === "bearlake";
                  const cols = isCompact ? 4 : 5;
                  const rows = isCompact ? 2 : 3;
                  const gap = isCompact ? 14 : 12;
                  const gridX = 24;
                  const gridY = 104;
                  const gridW = gw - 48;
                  const gridH = gh - gridY - 14;
                  const cellW = Math.floor((gridW - gap * (cols - 1)) / cols);
                  const cellH = Math.floor((gridH - gap * (rows - 1)) / rows);
                  const col = Math.floor((cx - gridX) / (cellW + gap));
                  const row = Math.floor((cy - gridY) / (cellH + gap));
                  const items = getGalleryAlbumItems(galleryAlbum);
                  if (col >= 0 && col < cols && row >= 0 && row < rows) {
                    const idx = row * cols + col;
                    if (idx >= 0 && idx < items.length) {
                      galleryPhotoIdx = idx;
                      galleryViewMode = "single";
                    }
                  }
                } else {
                  // Single Photo View: Prev / Next navigation
                  const items = getGalleryAlbumItems(galleryAlbum);
                  const len = Math.max(1, items.length);
                  if (cx < gw * 0.4) {
                    galleryPhotoIdx = (galleryPhotoIdx - 1 + len) % len;
                  } else {
                    galleryPhotoIdx = (galleryPhotoIdx + 1) % len;
                  }
                }
                currentGalleryIdxRef.current = galleryPhotoIdx;
                gallerySlideTimer = 0;
                redrawGallery();
                playClickSound(580, 0.05);
                takeControl();
                pointers.delete(e.pointerId);
                return;
              }
            }

            if (mainScreenMesh) {
              const rect = el.getBoundingClientRect();
              const checkPos = (px, py) => {
                mouse.x = ((px - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((py - rect.top) / rect.height) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const scrHits = raycaster.intersectObject(mainScreenMesh);
                if (scrHits.length > 0 && scrHits[0].uv) {
                  const uv = scrHits[0].uv;
                  const cx = uv.x * 1024;
                  const cy = (1 - uv.y) * 668;
                  if (activeTabRef.current === 'home') {
                    return homeNavBoxes.find((b) => cx >= b.x0 && cx <= b.x1 && cy >= b.y0 && cy <= b.y1);
                  } else {
                    return pageNavBoxes.find((b) => cx >= b.x0 && cx <= b.x1 && cy >= b.y0 && cy <= b.y1);
                  }
                }
                return null;
              };

              const clickedLink = checkPos(e.clientX, e.clientY) || checkPos(downPos.x, downPos.y);
              if (clickedLink) {
                const dest = (clickedLink.id === 'home_bottom' || clickedLink.id === 'home') ? 'home' : clickedLink.id;
                navigateToTab(dest);
                focusModeRef.current = 'close';
                setFocusMode('close');
                takeControl();
                pointers.delete(e.pointerId);
                return;
              }

              // Contact form interactive click handling
              if (activeTabRef.current === 'contact') {
                const rect = el.getBoundingClientRect();
                mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const scrHits = raycaster.intersectObject(mainScreenMesh);
                if (scrHits.length > 0 && scrHits[0].uv) {
                  const uv = scrHits[0].uv;
                  const cx = uv.x * 1024;
                  const cy = (1 - uv.y) * 668;

                  // Direct email click
                  if (cx >= 50 && cx <= 400 && cy >= 165 && cy <= 198) {
                    window.open("mailto:kassamramy27@outlook.com", "_blank");
                    focusModeRef.current = 'close';
                    setFocusMode('close');
                    takeControl();
                    pointers.delete(e.pointerId);
                    return;
                  }
                  // Name input
                  if (cx >= 50 && cx <= 445 && cy >= 205 && cy <= 252) {
                    contactForm.activeField = 'name';
                    updateScreenTextureRef.current?.('contact');
                    focusModeRef.current = 'close';
                    setFocusMode('close');
                    takeControl();
                    pointers.delete(e.pointerId);
                    return;
                  }
                  // Email input
                  if (cx >= 470 && cx <= 870 && cy >= 205 && cy <= 252) {
                    contactForm.activeField = 'email';
                    updateScreenTextureRef.current?.('contact');
                    focusModeRef.current = 'close';
                    setFocusMode('close');
                    takeControl();
                    pointers.delete(e.pointerId);
                    return;
                  }
                  // Company input
                  if (cx >= 50 && cx <= 870 && cy >= 273 && cy <= 321) {
                    contactForm.activeField = 'company';
                    updateScreenTextureRef.current?.('contact');
                    focusModeRef.current = 'close';
                    setFocusMode('close');
                    takeControl();
                    pointers.delete(e.pointerId);
                    return;
                  }
                  // Message input
                  if (cx >= 50 && cx <= 870 && cy >= 341 && cy <= 437) {
                    contactForm.activeField = 'message';
                    updateScreenTextureRef.current?.('contact');
                    focusModeRef.current = 'close';
                    setFocusMode('close');
                    takeControl();
                    pointers.delete(e.pointerId);
                    return;
                  }
                  // Send button
                  if (cx >= 50 && cx <= 245 && cy >= 453 && cy <= 501) {
                    const subj = encodeURIComponent(`Portfolio Message from ${contactForm.name || 'Visitor'}`);
                    const body = encodeURIComponent(
                      `Name: ${contactForm.name || 'N/A'}\n` +
                      `Email: ${contactForm.email || 'N/A'}\n` +
                      `Company: ${contactForm.company || 'N/A'}\n\n` +
                      `Message:\n${contactForm.message || ''}`
                    );
                    window.open(`mailto:kassamramy27@outlook.com?subject=${subj}&body=${body}`, '_blank');
                    contactForm.sent = true;
                    updateScreenTextureRef.current?.('contact');
                    focusModeRef.current = 'close';
                    setFocusMode('close');
                    takeControl();
                    pointers.delete(e.pointerId);
                    return;
                  }
                  // Clicked elsewhere on monitor: blur active field
                  if (contactForm.activeField) {
                    contactForm.activeField = null;
                    updateScreenTextureRef.current?.('contact');
                  }
                }
              }

              // Experience section interactive click handling (Resume PDF link)
              if (activeTabRef.current === 'experience') {
                const rect = el.getBoundingClientRect();
                mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const scrHits = raycaster.intersectObject(mainScreenMesh);
                if (scrHits.length > 0 && scrHits[0].uv) {
                  const uv = scrHits[0].uv;
                  const cx = uv.x * 1024;
                  const cy = (1 - uv.y) * 668;
                  const effectiveY = cy + curScrollY;

                  if (cx >= 50 && cx <= 974 && effectiveY >= 82 && effectiveY <= 126) {
                    window.open("Ramy_Kassam_Resume.pdf", "_blank");
                    playClickSound(520, 0.05);
                    pointers.delete(e.pointerId);
                    return;
                  }
                }
              }

              // Projects section interactive click handling
              if (activeTabRef.current === 'projects') {
                const rect = el.getBoundingClientRect();
                mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                raycaster.setFromCamera(mouse, camera);
                const scrHits = raycaster.intersectObject(mainScreenMesh);
                if (scrHits.length > 0 && scrHits[0].uv) {
                  const uv = scrHits[0].uv;
                  const cx = uv.x * 1024;
                  const cy = (1 - uv.y) * 668;
                  const effectiveY = cy + curScrollY;

                  // Research Report PDF link
                  if (cx >= 760 && cx <= 980 && effectiveY >= 140 && effectiveY <= 178) {
                    window.open("FoodMart_Sales_Forecasting_Report.pdf", "_blank");
                    playClickSound(520, 0.05);
                    pointers.delete(e.pointerId);
                    return;
                  }
                  // Return to Home button at bottom
                  if (cx >= 40 && cx <= 290 && effectiveY >= 870 && effectiveY <= 930) {
                    navigateToTab('home');
                    playClickSound(440, 0.05);
                    pointers.delete(e.pointerId);
                    return;
                  }
                }
              }
            }

            // Clicked monitor screen outside links
            if (focusModeRef.current === 'none') {
              focusModeRef.current = 'medium';
              setFocusMode('medium');
              playClickSound(480, 0.05);
            } else {
              focusModeRef.current = 'close';
              setFocusMode('close');
              playClickSound(520, 0.05);
            }
            takeControl();
          }
        } else {
          // User clicked strictly OUTSIDE the monitor!
          if (d < 30 && dtPress < 650) {
            if (
              focusModeRef.current === 'close' ||
              focusModeRef.current === 'gallery' ||
              focusModeRef.current === 'game'
            ) {
              // From monitor, gallery, or game close-up, exit back to pilot cockpit view
              focusModeRef.current = 'medium';
              setFocusMode('medium');
              playClickSound(420, 0.05);
            } else if (focusModeRef.current === 'medium') {
              // From pilot cockpit view, zoom OUT back to the bigger initiate camera angle!
              focusModeRef.current = 'none';
              setFocusMode('none');
              des.theta = 0.35;
              des.phi = 1.0;
              des.r = 2.9;
              target.set(0, 1.2, -0.15);
              playClickSound(380, 0.06);
            }
            // If already in 'none', clicking outside stays in 'none'
          }
        }
      }
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchDist = 0;
      if (pointers.size === 0) {
        const isFocused =
          focusModeRef.current === 'close' ||
          focusModeRef.current === 'gallery' ||
          focusModeRef.current === 'game';
        const isHit = !isFocused && checkScreenHit(e.clientX, e.clientY);
        el.style.cursor = isHit ? "pointer" : (isFocused ? "default" : "grab");
      }
    };

    const onWheel = (e) => {
      e.preventDefault();
      const hitScreen = checkScreenHit(e.clientX, e.clientY);
      if (focusModeRef.current === 'close') {
        if (hitScreen) {
          // Scroll content inside monitor smoothly!
          const maxScroll = activeTabRef.current === 'about' ? maxScrollYAbout : activeTabRef.current === 'experience' ? maxScrollYExperience : activeTabRef.current === 'projects' ? maxScrollYProjects : 0;
          targetScrollY = Math.max(0, Math.min(maxScroll, targetScrollY + e.deltaY * 0.85));
          return;
        }
        // Only zoom out with wheel if scrolling outside the monitor
        if (!hitScreen && e.deltaY > 0) {
          focusModeRef.current = 'medium';
          setFocusMode('medium');
        }
        return;
      } else if (focusModeRef.current === 'gallery' || focusModeRef.current === 'game') {
        if (!hitScreen && e.deltaY > 0) {
          focusModeRef.current = 'medium';
          setFocusMode('medium');
        }
        return;
      } else if (focusModeRef.current === 'medium') {
        if (hitScreen && e.deltaY < 0) {
          // Zoom into whichever monitor the cursor is over
          if (galleryScreenMesh && raycaster.intersectObject(galleryScreenMesh).length > 0) {
            focusModeRef.current = 'gallery';
            setFocusMode('gallery');
          } else if (gameScreenMesh && raycaster.intersectObject(gameScreenMesh).length > 0) {
            focusModeRef.current = 'game';
            setFocusMode('game');
          } else {
            focusModeRef.current = 'close';
            setFocusMode('close');
          }
          return;
        } else if (!hitScreen && e.deltaY > 0) {
          focusModeRef.current = 'none';
          setFocusMode('none');
          des.theta = 0.35;
          des.phi = 1.0;
          des.r = 2.9;
          target.set(0, 1.2, -0.15);
          return;
        }
      }
      takeControl();
      des.r = clamp(des.r * (1 + e.deltaY * 0.0012), R_MIN, R_MAX);
    };
    const onKeyDown = (e) => {
      if (activeTabRef.current === 'contact' && contactForm.activeField) {
        if (e.key === "Escape") {
          contactForm.activeField = null;
          updateScreenTextureRef.current?.('contact');
          return;
        }
        if (e.key === "Backspace") {
          contactForm[contactForm.activeField] = contactForm[contactForm.activeField].slice(0, -1);
          updateScreenTextureRef.current?.('contact');
          e.preventDefault();
          return;
        }
        if (e.key === "Tab") {
          const fields = ['name', 'email', 'company', 'message'];
          const idx = fields.indexOf(contactForm.activeField);
          contactForm.activeField = fields[(idx + (e.shiftKey ? fields.length - 1 : 1)) % fields.length];
          updateScreenTextureRef.current?.('contact');
          e.preventDefault();
          return;
        }
        if (e.key === "Enter") {
          if (contactForm.activeField === 'message') {
            contactForm.message += "\n";
          } else {
            const fields = ['name', 'email', 'company', 'message'];
            const idx = fields.indexOf(contactForm.activeField);
            contactForm.activeField = fields[(idx + 1) % fields.length];
          }
          updateScreenTextureRef.current?.('contact');
          e.preventDefault();
          return;
        }
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          contactForm[contactForm.activeField] += e.key;
          updateScreenTextureRef.current?.('contact');
          e.preventDefault();
          return;
        }
      }

      if (focusModeRef.current === 'game') {
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
          spaceGame.keys.left = true;
          spaceGame.usingMouse = false;
          e.preventDefault();
          return;
        }
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
          spaceGame.keys.right = true;
          spaceGame.usingMouse = false;
          e.preventDefault();
          return;
        }
        if (e.key === " " || e.key === "Enter" || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          if (spaceGame.state !== "playing") {
            startSpaceGame(gameCanvas ? gameCanvas.width : 800);
            playClickSound(620, 0.06);
          } else {
            spaceGame.keys.fire = true;
          }
          e.preventDefault();
          return;
        }
      }

      if (focusModeRef.current === 'gallery' && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        const items = getGalleryAlbumItems(galleryAlbum);
        const len = Math.max(1, items.length);
        if (galleryViewMode === "grid") {
          galleryViewMode = "single";
          galleryPhotoIdx = 0;
        } else if (e.key === "ArrowLeft") {
          galleryPhotoIdx = (galleryPhotoIdx - 1 + len) % len;
        } else {
          galleryPhotoIdx = (galleryPhotoIdx + 1) % len;
        }
        currentGalleryIdxRef.current = galleryPhotoIdx;
        gallerySlideTimer = 0;
        redrawGallery();
        playClickSound(580, 0.05);
        return;
      }

      if (e.key === "Escape") {
        if (focusModeRef.current === 'gallery' && galleryViewMode === "single") {
          galleryViewMode = "grid";
          redrawGallery();
          playClickSound(440, 0.05);
          return;
        }
        if (focusModeRef.current === 'close' && activeTabRef.current !== 'home') {
          activeTabRef.current = 'home';
          setActiveTab('home');
          playClickSound(440, 0.05);
          return;
        }
        if (
          focusModeRef.current === 'close' ||
          focusModeRef.current === 'gallery' ||
          focusModeRef.current === 'game'
        ) {
          focusModeRef.current = 'medium';
          setFocusMode('medium');
        } else if (focusModeRef.current === 'medium') {
          focusModeRef.current = 'none';
          setFocusMode('none');
          des.theta = 0.35;
          des.phi = 1.0;
          des.r = 2.9;
          target.set(0, 1.2, -0.15);
        }
      }
    };

    const onKeyUp = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") spaceGame.keys.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") spaceGame.keys.right = false;
      if (e.key === " " || e.key === "Enter" || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        spaceGame.keys.fire = false;
      }
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // keep the camera inside the cabin and above the seat / console
    const constrain = (p) => {
      p.z = clamp(p.z, -3.0, 3.3);
      const lim = hw(p.z) - 0.25;
      p.x = clamp(p.x, -lim, lim);
      p.y = clamp(p.y, 0.5, 3.4);
      if (Math.abs(p.x) < 1.0 && p.z > -1.45 && p.z < 1.3) p.y = Math.max(p.y, 2.4);
      return p;
    };

    /* ---------- resize ---------- */
    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    /* ---------- loop ---------- */
    const clock = new THREE.Clock();
    let raf = 0;
    let hudTimer = 0;
    let gameIdleTimer = 0;
    let idleTime = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.033);
      t += dt;

      const isDragging = pointers.size > 0;
      if (focusModeRef.current === 'none') {
        if (isDragging) {
          idleTime = 0;
          cur.theta = des.theta;
          cur.phi = des.phi;
          cur.r = des.r;
        } else {
          idleTime += dt;
          // Smooth continuous orbital rotation when idle (clean constant angular speed)
          if (idleTime > 0.6) {
            des.theta += dt * 0.055;
          }
          const k = 1 - Math.exp(-dt * 18);
          cur.theta += (des.theta - cur.theta) * k;
          cur.phi += (des.phi - cur.phi) * k;
          cur.r += (des.r - cur.r) * k;
        }
        target.y += (1.2 - target.y) * 0.1;

        const sp = Math.sin(cur.phi);
        want.set(
          target.x + cur.r * sp * Math.sin(cur.theta),
          target.y + cur.r * Math.cos(cur.phi),
          target.z + cur.r * sp * Math.cos(cur.theta)
        );
        constrain(want);

        if (first) {
          camPos.copy(want);
          currentLookAt.copy(target);
          first = false;
        } else if (isDragging) {
          camPos.copy(want);
          currentLookAt.copy(target);
        } else {
          const kCam = 1 - Math.exp(-dt * 18);
          camPos.lerp(want, kCam);
          currentLookAt.lerp(target, kCam);
        }
        camera.position.copy(camPos);
        camera.lookAt(currentLookAt);
      } else if (focusModeRef.current === 'close') {
        idleTime = 0;
        // Smoothly glide camera into close-up focus on the main monitor screen
        const kFocus = 1 - Math.exp(-dt * 8.5);
        camPos.lerp(closeCamPos, kFocus);
        currentLookAt.lerp(focusLookTarget, kFocus);
        camera.position.copy(camPos);
        camera.lookAt(currentLookAt);
      } else if (focusModeRef.current === 'gallery') {
        idleTime = 0;
        // Smoothly glide camera into close-up focus on the Digital Gallery monitor
        const kFocus = 1 - Math.exp(-dt * 8.5);
        camPos.lerp(galleryCamPos, kFocus);
        currentLookAt.lerp(galleryLookTarget, kFocus);
        camera.position.copy(camPos);
        camera.lookAt(currentLookAt);
      } else if (focusModeRef.current === 'game') {
        idleTime = 0;
        // Smoothly glide camera into close-up focus on the Arcade Space Game monitor
        const kFocus = 1 - Math.exp(-dt * 8.5);
        camPos.lerp(gameCamPos, kFocus);
        currentLookAt.lerp(gameLookTarget, kFocus);
        camera.position.copy(camPos);
        camera.lookAt(currentLookAt);
      } else if (focusModeRef.current === 'medium') {
        idleTime = 0;
        // General pilot console perspective showing main monitor AND lower auxiliary monitors
        const kMed = 1 - Math.exp(-dt * 8.5);
        camPos.lerp(mediumCamPos, kMed);
        currentLookAt.lerp(mediumLookTarget, kMed);
        camera.position.copy(camPos);
        camera.lookAt(currentLookAt);
      }

      space.rotation.y += dt * 0.006;
      pCy.intensity = 1.6 + Math.sin(t * 3.1) * 0.1;
      const pulse = 0.75 + 0.25 * Math.sin(t * 1.6);
      doorSeam.color.setRGB(1.0 * pulse, 0.54 * pulse, 0.1 * pulse);
      pDoor.intensity = 0.8 + 0.25 * pulse;

      // Smooth scroll interpolation or intro typewriter animation on main terminal
      const scrollDiff = targetScrollY - curScrollY;
      if (Math.abs(scrollDiff) > 0.4 || t < 2.1) {
        curScrollY += scrollDiff * 0.22;
        for (const sc of animScreens) {
          if (sc.v === 5) {
            drawHUD(sc.g, sc.w, sc.h, sc.v, t, activeTabRef.current, curScrollY);
            sc.tex.needsUpdate = true;
          }
        }
      }

      // Update Arcade Space Game monitor (60fps when focused or playing, ~20fps attract mode otherwise)
      if (gameCtx && gameCanvas && gameTex) {
        if (focusModeRef.current === 'game' || spaceGame.state === 'playing') {
          updateAndDrawGameHUD(gameCtx, gameCanvas.width, gameCanvas.height, dt, t, playClickSound);
          gameTex.needsUpdate = true;
        } else {
          gameIdleTimer += dt;
          if (gameIdleTimer >= 0.05) {
            updateAndDrawGameHUD(gameCtx, gameCanvas.width, gameCanvas.height, gameIdleTimer, t, null);
            gameTex.needsUpdate = true;
            gameIdleTimer = 0;
          }
        }
      }

      hudTimer += dt;
      if (hudTimer > 0.8) {
        hudTimer = 0;
        // Staggered auxiliary screen redraws: update 1 screen per cycle to eliminate GPU stalls
        const aux = animScreens.filter((sc) => sc.v !== 5 && sc.v !== 6 && sc.v !== 7);
        if (aux.length > 0) {
          const sc = aux[Math.floor(Math.random() * aux.length)];
          drawHUD(sc.g, sc.w, sc.h, sc.v, t, activeTabRef.current, curScrollY);
          sc.tex.needsUpdate = true;
        }
      }
      renderer.render(scene, camera);
    };
    tick();

    /* ---------- cleanup ---------- */
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      const disposeTree = (root) =>
        root.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach((m) => {
              ["map", "bumpMap", "emissiveMap"].forEach((key) => m[key] && m[key].dispose());
              m.dispose();
            });
          }
        });
      disposeTree(scene);
      disposeTree(genScene);
      cubeRT.dispose();
      renderer.dispose();
      if (el.parentNode) el.parentNode.removeChild(el);
    };
  }, []);

  const exitFocus = () => {
    if (focusModeRef.current === 'close' && activeTabRef.current !== 'home') {
      navigateToTab('home');
      return;
    }
    if (zoomOutRef.current) {
      zoomOutRef.current();
    } else {
      if (
        focusModeRef.current === 'close' ||
        focusModeRef.current === 'gallery' ||
        focusModeRef.current === 'game'
      ) {
        focusModeRef.current = 'medium';
        setFocusMode('medium');
      } else {
        focusModeRef.current = 'none';
        setFocusMode('none');
      }
    }
  };



  return (
    <div className="relative w-full overflow-hidden bg-black select-none" style={{ height: "100vh", minHeight: 480 }}>
      <div ref={mountRef} className="absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)" }}
      />

      {/* Top Left Profile & Control HUD (Custom Portfolio HUD matching reference) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-[4px] font-mono text-white select-none">
        {/* Row 1: Name (Typewriter intro) */}
        <div className="bg-black px-3.5 py-1 text-sm sm:text-base font-normal tracking-wide shadow-md min-h-[28px] flex items-center">
          <span>{typedName}</span>
          {introTypingPhase === 0 && (
            <span className="inline-block w-2 h-4 ml-1 bg-white animate-pulse" />
          )}
        </div>

        {/* Row 2: Title (Typewriter intro) */}
        {introTypingPhase >= 1 && (
          <div className="bg-black px-3.5 py-1 text-sm sm:text-base font-normal tracking-wide shadow-md min-h-[28px] flex items-center">
            <span>{typedRole}</span>
            {introTypingPhase === 1 && (
              <span className="inline-block w-2 h-4 ml-1 bg-white animate-pulse" />
            )}
          </div>
        )}

        {/* Row 3: Live Clock & Action Buttons */}
        <div className="flex items-center gap-[4px]">
          {/* Live Clock Box */}
          <div className="bg-black px-3.5 py-1 text-sm sm:text-base font-normal tracking-wide shadow-md">
            {currentTime}
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleAudio}
            className="bg-black p-1.5 flex items-center justify-center hover:bg-neutral-800 active:scale-95 transition cursor-pointer shadow-md text-white"
            style={{ width: 32, height: 32 }}
            title={isPlayingAudio ? "Mute ambient audio" : "Play ambient audio"}
            aria-label="Toggle ambient audio"
          >
            {isPlayingAudio ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-emerald-400">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-2.5-1.23L6.5 6.5H3c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h3.5l5 4.5c.67.6 1.5.13 1.5-.77V2.77c0-.9-.83-1.37-1.5-.77z"/>
              </svg>
            )}
          </button>

          {/* Camera View Switcher Button */}
          <button
            onClick={() => cycleCameraViewRef.current?.()}
            className="bg-black p-1.5 flex items-center justify-center hover:bg-neutral-800 active:scale-95 transition cursor-pointer shadow-md text-white"
            style={{ width: 32, height: 32 }}
            title={focusMode === 'close' ? "Camera: Main Monitor (Click to switch)" : focusMode === 'game' ? "Camera: Space Arcade (Click to switch)" : focusMode === 'gallery' ? "Camera: Digital Gallery (Click to switch)" : focusMode === 'medium' ? "Camera: Pilot Console (Click to switch)" : "Camera: Cockpit (Click to switch)"}
            aria-label="Switch camera view"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Terminal Intro Return Button */}
      {onExitToTerminal && focusMode !== 'close' && focusMode !== 'gallery' && focusMode !== 'game' && (
        <button
          onClick={onExitToTerminal}
          className="absolute top-4 right-4 rounded-full px-3.5 py-1.5 text-xs font-mono uppercase focus:outline-none focus:ring-2 z-10 cursor-pointer flex items-center gap-1.5 transition-all duration-150 hover:scale-105 active:scale-95"
          style={{
            background: "rgba(10, 10, 10, 0.85)",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(6px)",
          }}
          title="Return to Command Prompt"
        >
          <span className="text-emerald-400 font-bold">&gt;_</span>
          <span>TERMINAL</span>
        </button>
      )}



      {/* Close-Up Focus Mode: Clean zoom-out button only */}
      {(focusMode === 'close' || focusMode === 'gallery' || focusMode === 'game') && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={exitFocus}
            className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-mono tracking-wider uppercase transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: "rgba(10, 15, 20, 0.85)",
              color: "#ffc070",
              border: "1px solid rgba(255, 160, 48, 0.5)",
              boxShadow: "0 0 12px rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(8px)",
            }}
            title="Zoom out to Cockpit view"
          >
            <span>[ ESC // ZOOM OUT ]</span>
          </button>
        </div>
      )}

      {/* Hover tip when hovering over the clickable main computer monitor */}
      {hovered && focusMode !== 'close' && focusMode !== 'gallery' && focusMode !== 'game' && (
        <div
          className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-mono tracking-wider uppercase animate-pulse z-20"
          style={{
            background: "rgba(2, 22, 28, 0.88)",
            color: "#62f0ff",
            border: "1px solid rgba(98, 240, 255, 0.6)",
            boxShadow: "0 0 18px rgba(98, 240, 255, 0.35)",
            backdropFilter: "blur(6px)",
          }}
        >
          <span className="text-amber-400">◆</span>
          <span>CLICK MONITOR TO ZOOM IN // <span style={{ fontFamily: "'gastromond', 'Gastromond', sans-serif" }}>RAMY KASSAM</span></span>
        </div>
      )}

      {/* Hover tip when hovering over the Arcade Space Game monitor */}
      {hoveredGame && !hovered && (
        <div
          className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-mono tracking-wider uppercase animate-pulse z-20"
          style={{
            background: "rgba(2, 22, 28, 0.92)",
            color: "#ffa030",
            border: "1px solid rgba(255, 160, 48, 0.65)",
            boxShadow: "0 0 18px rgba(255, 160, 48, 0.35)",
            backdropFilter: "blur(6px)",
          }}
        >
          <span className="text-cyan-400">🚀</span>
          <span>
            {focusMode === 'game'
              ? "STAR DEFENDER ARCADE // MOVE MOUSE OR ◀ ▶ TO STEER • CLICK OR SPACE TO FIRE"
              : "STAR DEFENDER ARCADE // CLICK MONITOR TO PLAY"}
          </span>
        </div>
      )}

      {/* Hover tip when hovering over the digital photo gallery monitor */}
      {hoveredGallery && !hovered && !hoveredGame && (
        <div
          className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-mono tracking-wider uppercase animate-pulse z-20"
          style={{
            background: "rgba(2, 22, 28, 0.92)",
            color: "#38bdf8",
            border: "1px solid rgba(56, 189, 248, 0.65)",
            boxShadow: "0 0 18px rgba(56, 189, 248, 0.4)",
            backdropFilter: "blur(6px)",
          }}
        >
          <span className="text-cyan-400">◈</span>
          <span>
            {focusMode === 'gallery'
              ? "DIGITAL GALLERY // CLICK TABS OR PHOTOS TO BROWSE"
              : "DIGITAL GALLERY // CLICK MONITOR TO ZOOM IN"}
          </span>
        </div>
      )}

      {/* Bottom Hint */}
      <div
        className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 transform rounded-full px-5 py-2 text-xs font-mono uppercase tracking-wider text-center z-10 transition-all duration-300"
        style={{
          background: focusMode === 'none' ? "rgba(4, 24, 30, 0.82)" : "rgba(0, 0, 0, 0.65)",
          color: focusMode === 'none' ? "#9ff6ff" : "rgba(255, 230, 220, 0.85)",
          border: focusMode === 'none' ? "1px solid rgba(98, 240, 255, 0.45)" : "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: focusMode === 'none' ? "0 0 18px rgba(98, 240, 255, 0.25)" : "none",
          backdropFilter: "blur(6px)"
        }}
      >
        {(focusMode === 'close' || focusMode === 'gallery' || focusMode === 'game') ? (
          <span>Press ESC or click outside to zoom out</span>
        ) : focusMode === 'medium' ? (
          <span>Click any monitor to zoom in • Click outside to zoom out</span>
        ) : (
          <span className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#62f0ff] animate-ping" />
            <span>Click monitor to zoom in • Drag to look around</span>
          </span>
        )}
      </div>
    </div>
  );
}
