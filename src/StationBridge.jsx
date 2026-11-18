import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Minus,
  Square,
  X,
  RotateCcw,
  BookOpen,
  Monitor,
  Wifi,
  Volume2,
  Zap,
  Minimize2
} from 'lucide-react';

// Classic Internet Explorer 'e' Logo SVG
function IELogo({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ieBlue" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4fc3f7" />
          <stop offset="50%" stopColor="#0288d1" />
          <stop offset="100%" stopColor="#01579b" />
        </linearGradient>
        <linearGradient id="ieOrbit" x1="4" y1="48" x2="60" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffd54f" />
          <stop offset="50%" stopColor="#ffb300" />
          <stop offset="100%" stopColor="#ff8f00" />
        </linearGradient>
      </defs>
      <ellipse
        cx="32"
        cy="32"
        rx="28"
        ry="11"
        transform="rotate(-28 32 32)"
        stroke="url(#ieOrbit)"
        strokeWidth="4.5"
        fill="none"
      />
      <path
        d="M32 12C20.4 12 11 21.2 11 32.5C11 43.8 20.4 53 32 53C40.3 53 47.4 48.3 50.8 41.3H39.5C37.4 43.7 34.9 45 31.8 45C25.5 45 20.8 40.6 20.2 35H52.5C52.8 33.8 53 32.5 53 31.2C53 20.3 43.8 12 32 12ZM20.5 28.5C21.4 23.4 25.9 19.5 31.8 19.5C37.7 19.5 42.1 23.4 43 28.5H20.5Z"
        fill="url(#ieBlue)"
      />
    </svg>
  );
}

const BOOKS_DATA = [
  {
    id: 'open',
    title: 'Open',
    author: 'Andre Agassi',
    color: '#1e3a5f',
    accent: '#93c5fd',
    w: 0.42,
    h: 0.06,
    d: 0.30,
    rotY: 0.12
  },
  {
    id: 'gene',
    title: 'The Gene',
    author: 'Siddhartha Mukherjee',
    color: '#7f1d1d',
    accent: '#fca5a5',
    w: 0.40,
    h: 0.065,
    d: 0.29,
    rotY: -0.05
  },
  {
    id: 'glass-castle',
    title: 'The Glass Castle',
    author: 'Jeannette Walls',
    color: '#14532d',
    accent: '#86efac',
    w: 0.39,
    h: 0.058,
    d: 0.28,
    rotY: 0.14
  },
  {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    color: '#b45309',
    accent: '#fde68a',
    w: 0.37,
    h: 0.058,
    d: 0.27,
    rotY: -0.08
  },
  {
    id: 'emperors-new-clothes',
    title: "The Emperor's New Clothes",
    author: 'Hans Christian Andersen',
    color: '#4c1d95',
    accent: '#ddd6fe',
    w: 0.36,
    h: 0.052,
    d: 0.26,
    rotY: 0.06
  }
];

const ADVENTURE_ALBUMS = [
  {
    id: 'basin',
    title: 'Loveland Basin Ski Trip, CO',
    subtitle: 'Loveland Basin Summit & Continental Divide • 13,010 ft Elevation • Colorado Rockies',
    badge: '⛷️ Basin Ski Trip',
    photos: [
      { src: '/loveland1.JPG', caption: 'Loveland Basin — Summit Ridge Run', rotate: '-1.5deg' },
      { src: '/loveland2.JPG', caption: 'High Alpine Powder Day at the Basin', rotate: '1.2deg' },
      { src: '/loveland3.jpg', caption: 'Continental Divide Views — Basin Bowl', rotate: '-1.0deg' },
      { src: '/loveland4.JPG', caption: 'Chairlift Ascent to Basin Summit', rotate: '1.6deg' },
      { src: '/loveland5.jpg', caption: 'Loveland Basin Ski Trails & Glades', rotate: '-1.1deg' },
      { src: '/loveland6.JPG', caption: 'Above Timberline — Loveland Basin', rotate: '-1.4deg' },
      { src: '/loveland7.JPG', caption: 'Fresh Tracks in Clear Creek County', rotate: '1.1deg' },
      { src: '/loveland8.JPG', caption: 'Bluebird Sky Across the Basin', rotate: '-1.8deg' },
      { src: '/loveland9.JPG', caption: 'Basin Mountain Peak Panorama', rotate: '1.3deg' },
      { src: '/loveland10.JPG', caption: 'Apres-Ski & Golden Hour in Colorado', rotate: '-0.8deg' },
      { src: '/loveland11.jpg', caption: 'Carving the Basin Headwall Powder', rotate: '1.4deg' },
      { src: '/loveland12.jpg', caption: 'Continental Divide Rocky Mountain Sunset', rotate: '-1.2deg' }
    ]
  },
  {
    id: 'camping',
    title: 'Camping & Backcountry',
    subtitle: 'Alpine Trails • Starlit Campsites • Wilderness Expeditions',
    badge: '⛺ Camping',
    photos: [
      { src: '/blog-camping.jpg', caption: 'Night Camp Under the Stars', rotate: '-1.2deg' },
      { src: '/blog-hiking.jpg', caption: 'Backcountry Ridge Trail', rotate: '1.4deg' },
      { src: '/mountain-1.jpg', caption: 'Colorado Alpine 14er Ridge', rotate: '-1.0deg' },
      { src: '/mountain-2.jpg', caption: 'Wilderness Summit Overlook', rotate: '1.3deg' }
    ]
  }
];

function drawWin95Box(ctx, x, y, w, h, sunken = false, fill = '#c0c0c0') {
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }
  const tlOuter = sunken ? '#808080' : '#ffffff';
  const tlInner = sunken ? '#000000' : '#dfdfdf';
  const brOuter = sunken ? '#ffffff' : '#000000';
  const brInner = sunken ? '#dfdfdf' : '#808080';

  // Top & Left outer (2px)
  ctx.fillStyle = tlOuter;
  ctx.fillRect(x, y, w - 2, 2);
  ctx.fillRect(x, y, 2, h - 2);

  // Bottom & Right outer (2px)
  ctx.fillStyle = brOuter;
  ctx.fillRect(x, y + h - 2, w, 2);
  ctx.fillRect(x + w - 2, y, 2, h);

  // Top & Left inner (2px)
  ctx.fillStyle = tlInner;
  ctx.fillRect(x + 2, y + 2, w - 6, 2);
  ctx.fillRect(x + 2, y + 2, 2, h - 6);

  // Bottom & Right inner (2px)
  ctx.fillStyle = brInner;
  ctx.fillRect(x + 2, y + h - 4, w - 4, 2);
  ctx.fillRect(x + w - 4, y + 2, 2, h - 4);
}

// Draw the classic blue Internet Explorer 'e' logo with golden orbital ring
function drawIELogo(ctx, cx, cy, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Golden orbital ring back-arc
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 5.2, -0.55, 0, Math.PI * 2);
  ctx.stroke();

  // Blue circle base for the 'e'
  const grad = ctx.createRadialGradient(-3, -3, 1, 0, 0, 10);
  grad.addColorStop(0, '#38bdf8');
  grad.addColorStop(0.55, '#0284c7');
  grad.addColorStop(1, '#004499');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 9.2, 0, Math.PI * 2);
  ctx.fill();

  // Crisp bold 'e' cutout / letter
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 19px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('e', 0, -0.5);

  // Golden orbital swoosh front highlight
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 5.2, -0.55, -0.3, Math.PI + 0.3);
  ctx.stroke();

  ctx.restore();
}

// Preload photos for the About page on the monitor & Windows 95 Start button logo
let monitorAboutPhotoImg = null;
let monitorHobbyPhotoImg = null;
let win95LogoImg = null;
let win95LogoProcessedCanvas = null;
let onAboutPhotoLoaded = null;
if (typeof window !== 'undefined') {
  monitorAboutPhotoImg = new Image();
  monitorAboutPhotoImg.crossOrigin = 'anonymous';
  monitorAboutPhotoImg.src = '/ramy-hero-landscape.jpg';
  monitorAboutPhotoImg.onload = () => {
    if (onAboutPhotoLoaded) onAboutPhotoLoaded();
  };

  monitorHobbyPhotoImg = new Image();
  monitorHobbyPhotoImg.crossOrigin = 'anonymous';
  monitorHobbyPhotoImg.src = '/ramy-hero.jpg';
  monitorHobbyPhotoImg.onload = () => {
    if (onAboutPhotoLoaded) onAboutPhotoLoaded();
  };

  // Windows 95 waving logo with trailing pixel blocks (uploaded by user)
  win95LogoImg = new Image();
  win95LogoImg.crossOrigin = 'anonymous';
  win95LogoImg.src = '/win95-start-logo.jpg';
  win95LogoImg.onload = () => {
    try {
      const oc = document.createElement('canvas');
      oc.width = win95LogoImg.naturalWidth || 500;
      oc.height = win95LogoImg.naturalHeight || 420;
      const octx = oc.getContext('2d');
      octx.drawImage(win95LogoImg, 0, 0);
      const idata = octx.getImageData(0, 0, oc.width, oc.height);
      const d = idata.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
        // Checkerboard pseudo-transparency in the image has neutral grey/white values
        if (diff < 24 && r > 185) {
          d[i + 3] = 0; // Transparent
        }
      }
      octx.putImageData(idata, 0, 0);
      win95LogoProcessedCanvas = oc;
    } catch {
      win95LogoProcessedCanvas = win95LogoImg;
    }
    if (onAboutPhotoLoaded) onAboutPhotoLoaded();
  };
}

function getWinBounds(winState) {
  if (winState === 'maximized') {
    return { x: 0, y: 0, w: 1024, h: 724 };
  }
  // Centered browser page on the monitor screen (72px equal margins, w: 880, h: 686)
  return { x: 72, y: 20, w: 880, h: 686 };
}

function getContentHeight(activePage) {
  if (activePage === 'about') return 1320;
  if (activePage === 'experience') return 880;
  if (activePage === 'projects') return 840;
  if (activePage === 'contact') return 650;
  return 600;
}

function getMonitorHitRegions(winState, activePage = 'home', scrollY = 0) {
  const regions = [
    // Desktop "My Showcase" Icon on the top-left of the Windows 95 desktop
    { id: 'desktop_showcase', x: 14, y: 20, w: 108, h: 104 },
    // Windows 95 Start Button on the bottom-left taskbar
    { id: 'start_button', x: 6, y: 730, w: 108, h: 32 }
  ];

  if (winState === 'normal' || winState === 'maximized') {
    const wb = getWinBounds(winState);
    const btnY = wb.y + 10;
    const closeX = wb.x + wb.w - 38;
    const maxX = closeX - 30;
    const minX = maxX - 30;

    regions.push(
      { id: 'win_minimize', x: minX, y: btnY, w: 26, h: 24 },
      { id: 'win_maximize', x: maxX, y: btnY, w: 26, h: 24 },
      { id: 'win_close', x: closeX, y: btnY, w: 26, h: 24 }
    );

    const viewX = wb.x + 6;
    const viewW = wb.w - 12;
    const viewY = wb.y + 38;
    const viewH = wb.h - 66;

    const sbW = 18;
    const sbX = viewX + viewW - sbW - 2;
    const sbY = viewY + 2;
    const sbH = viewH - 4;

    const totalH = getContentHeight(activePage);
    const maxScrollY = Math.max(0, totalH - (viewH - 10));

    if (activePage === 'home') {
      const centerX = viewX + viewW / 2;
      const linksY = viewY + viewH * 0.56;

      regions.push(
        { id: 'about', label: 'About', x: centerX - 250, y: linksY - 24, w: 90, h: 36 },
        { id: 'experience', label: 'Experience', x: centerX - 130, y: linksY - 24, w: 130, h: 36 },
        { id: 'projects', label: 'Projects', x: centerX + 30, y: linksY - 24, w: 100, h: 36 },
        { id: 'contact', label: 'Contact', x: centerX + 160, y: linksY - 24, w: 90, h: 36 }
      );
    } else {
      // Scrollbar buttons & track hit regions
      if (maxScrollY > 0) {
        const trackH = sbH - 36;
        const thumbH = Math.min(120, Math.max(45, Math.round((viewH / totalH) * trackH)));
        const thumbY = sbY + 18 + (scrollY / maxScrollY) * (trackH - thumbH);

        regions.push(
          { id: 'sb_up', x: sbX, y: sbY, w: sbW, h: 18 },
          { id: 'sb_down', x: sbX, y: sbY + sbH - 18, w: sbW, h: 18 },
          { id: 'sb_track_up', x: sbX, y: sbY + 18, w: sbW, h: Math.max(0, thumbY - (sbY + 18)) },
          { id: 'sb_thumb', x: sbX, y: thumbY, w: sbW, h: thumbH },
          { id: 'sb_track_down', x: sbX, y: thumbY + thumbH, w: sbW, h: Math.max(0, (sbY + sbH - 18) - (thumbY + thumbH)) }
        );
      }

      // Left Sidebar Navigation Links (fixed, unaffected by scroll)
      const navX = viewX + 26;
      const navStartY = viewY + 172;
      const navSpacing = 36;
      const navItems = [
        { id: 'home', label: 'HOME' },
        { id: 'about', label: 'ABOUT' },
        { id: 'experience', label: 'EXPERIENCE' },
        { id: 'projects', label: 'PROJECTS' },
        { id: 'contact', label: 'CONTACT' }
      ];
      navItems.forEach((item, idx) => {
        regions.push({
          id: item.id,
          navLabel: item.label,
          x: navX - 4,
          y: navStartY + idx * navSpacing - 18,
          w: 150,
          h: 26
        });
      });

      const contentX = viewX + 215;
      if (activePage === 'about') {
        // Inline links inside the scrollable About page (adjusted for scrollY!)
        regions.push(
          { id: 'contact', x: contentX + 325, y: viewY + 188 - scrollY, w: 76, h: 22 },
          { id: 'email_link', x: contentX, y: viewY + 206 - scrollY, w: 220, h: 22 },
          { id: 'download_resume', x: contentX + 54, y: viewY + 270 - scrollY, w: 230, h: 26 },
          { id: 'open_album', x: contentX, y: viewY + 946 - scrollY, w: 260, h: 24 },
          { id: 'contact', x: contentX + 122, y: viewY + 1182 - scrollY, w: 100, h: 22 },
          { id: 'email_link', x: contentX + 422, y: viewY + 1182 - scrollY, w: 200, h: 22 }
        );
      } else if (activePage === 'contact') {
        regions.push(
          { id: 'email_link', x: contentX, y: viewY + 188 - scrollY, w: 280, h: 26 },
          { id: 'github_link', x: contentX, y: viewY + 226 - scrollY, w: 280, h: 26 },
          { id: 'download_resume', x: contentX + 54, y: viewY + 296 - scrollY, w: 240, h: 28 }
        );
      }
    }
  }

  return regions;
}

// Draw the classic Windows 95 waving flag logo with pixel trailing blocks (matching user image)
function drawWin95Logo(ctx, x, y, w = 24, h = 22) {
  if (win95LogoProcessedCanvas) {
    ctx.drawImage(win95LogoProcessedCanvas, x, y, w, h);
    return;
  }
  // High-fidelity fallback waving flag with flying blocks
  ctx.save();
  ctx.translate(x, y);
  const s = w / 24;
  ctx.scale(s, s);

  // Black trailing flight blocks
  ctx.fillStyle = '#000000';
  [
    [0, 2], [2, 0], [4, 4], [2, 8], [0, 12], [3, 11], [5, 7], [7, 3],
    [5, 15], [7, 12], [9, 8], [7, 18], [9, 15], [11, 11]
  ].forEach(([px, py]) => {
    ctx.fillRect(px, py, 1.8, 1.8);
  });
  // Colored trailing blocks
  ctx.fillStyle = '#e85c27';
  [[4, 1], [6, 3], [8, 5]].forEach(([px, py]) => ctx.fillRect(px, py, 2, 2));
  ctx.fillStyle = '#2a7cd8';
  [[3, 9], [5, 11], [7, 13]].forEach(([px, py]) => ctx.fillRect(px, py, 2, 2));

  // Black waving curved window outline
  ctx.fillStyle = '#000000';
  ctx.fillRect(10, 3, 14, 16);

  // 4 Panes: Red-Orange, Green, Blue, Yellow
  ctx.fillStyle = '#e85c27';
  ctx.fillRect(11, 4, 6, 6);
  ctx.fillStyle = '#74b743';
  ctx.fillRect(18, 4, 5, 6);
  ctx.fillStyle = '#2a7cd8';
  ctx.fillRect(11, 11, 6, 7);
  ctx.fillStyle = '#fbb917';
  ctx.fillRect(18, 11, 5, 7);

  ctx.restore();
}

// Retro computer-to-document icon for "Looking for my resume?" box
function drawResumeComputerIcon(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1.6;
  ctx.fillStyle = '#e4e4e7';

  // Left isometric retro monitor + base
  ctx.fillRect(2, 12, 18, 14);
  ctx.strokeRect(2, 12, 18, 14);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(5, 15, 12, 8);
  ctx.strokeRect(5, 15, 12, 8);
  ctx.fillStyle = '#a1a1aa';
  ctx.fillRect(0, 26, 22, 5);
  ctx.strokeRect(0, 26, 22, 5);

  // Connecting cable arc
  ctx.beginPath();
  ctx.moveTo(20, 18);
  ctx.lineTo(27, 12);
  ctx.stroke();

  // Right document / printer sheet icon
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(25, 4, 18, 22);
  ctx.strokeRect(25, 4, 18, 22);
  // Lines of text on the resume icon
  ctx.beginPath();
  ctx.moveTo(28, 9);
  ctx.lineTo(40, 9);
  ctx.moveTo(28, 13);
  ctx.lineTo(40, 13);
  ctx.moveTo(28, 17);
  ctx.lineTo(37, 17);
  ctx.moveTo(28, 21);
  ctx.lineTo(39, 21);
  ctx.stroke();
  ctx.restore();
}

// 1. Hero Wall Monitor CRT Texture (Windows 95 Desktop + Internet Explorer with Ramy Kassam - Portfolio 2026)
function drawMainMonitorCanvas(
  canvas,
  activePage = 'home',
  hoveredId = null,
  winState = 'normal',
  visitedLinks = new Set(),
  scrollY = 0
) {
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.setTransform(2, 0, 0, 2, 0, 0);

  // Classic Windows 95 Teal Desktop Background (#008080)
  ctx.fillStyle = '#008080';
  ctx.fillRect(0, 0, 1024, 768);

  // ─────────────────────────────────────────────────────────────
  // DESKTOP ICON: "My Showcase" (Top-left on the #008080 desktop)
  // Clicking this opens the window back up when minimized or closed!
  // ─────────────────────────────────────────────────────────────
  const isShowcaseHovered = hoveredId === 'desktop_showcase';
  const iconCenterX = 52;
  const iconTopY = 28;

  // Little Retro CRT / IE Showcase icon on the desktop
  drawWin95Box(ctx, iconCenterX - 24, iconTopY, 48, 38, false, '#dfdfdf');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(iconCenterX - 19, iconTopY + 5, 38, 28);
  drawIELogo(ctx, iconCenterX, iconTopY + 19, 1.05);
  // Monitor stand base
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(iconCenterX - 10, iconTopY + 38, 20, 4);
  ctx.fillRect(iconCenterX - 16, iconTopY + 42, 32, 4);

  // Desktop Icon Label: "My Showcase"
  if (isShowcaseHovered) {
    ctx.fillStyle = '#000080';
    ctx.fillRect(4, iconTopY + 50, 96, 22);
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.strokeRect(4, iconTopY + 50, 96, 22);
    ctx.setLineDash([]);
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px "Tahoma", "MS Sans Serif", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('My Showcase', iconCenterX, iconTopY + 66);

  // ─────────────────────────────────────────────────────────────
  // WINDOWS 95 BROWSER WINDOW (if 'normal' or 'maximized')
  // ─────────────────────────────────────────────────────────────
  if (winState === 'normal' || winState === 'maximized') {
    const wb = getWinBounds(winState);

    // Outer Windows 95 Raised Frame
    drawWin95Box(ctx, wb.x, wb.y, wb.w, wb.h, false, '#c0c0c0');

    // Windows 95 Navy Blue Title Bar (#000080)
    ctx.fillStyle = '#000080';
    ctx.fillRect(wb.x + 6, wb.y + 6, wb.w - 12, 30);

    // Classic 'e' Internet Explorer Logo + "Ramy Kassam - Showcase 2026"
    drawIELogo(ctx, wb.x + 22, wb.y + 21, 0.9);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px "Tahoma", "MS Sans Serif", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Ramy Kassam - Showcase 2026', wb.x + 40, wb.y + 27);

    // Win95 Title Bar Control Buttons: [ _ ] [ □ ] [ X ]
    const btnY = wb.y + 9;
    const closeX = wb.x + wb.w - 36;
    const maxX = closeX - 28;
    const minX = maxX - 28;

    const ctrlBtns = [
      { id: 'win_minimize', label: '_', x: minX },
      { id: 'win_maximize', label: '□', x: maxX },
      { id: 'win_close', label: 'X', x: closeX }
    ];
    ctrlBtns.forEach((btn) => {
      const isBtnHovered = hoveredId === btn.id;
      drawWin95Box(
        ctx,
        btn.x,
        btnY,
        24,
        22,
        false,
        isBtnHovered ? '#dfdfdf' : '#c0c0c0'
      );
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px "Tahoma", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(btn.label, btn.x + 12, btnY + 16);
    });

    // Clean Sunken White Webpage Viewport (Directly below Title Bar)
    const viewX = wb.x + 6;
    const viewY = wb.y + 38;
    const viewW = wb.w - 12;
    const viewH = wb.h - 66;
    drawWin95Box(ctx, viewX, viewY, viewW, viewH, true, '#ffffff');

    // Right-side classic Windows 95 vertical scrollbar inside the browser viewport
    const sbW = 18;
    const sbX = viewX + viewW - sbW - 2;
    const sbY = viewY + 2;
    const sbH = viewH - 4;
    ctx.fillStyle = '#dfdfdf';
    ctx.fillRect(sbX, sbY, sbW, sbH);

    const totalH = getContentHeight(activePage);
    const maxScrollY = Math.max(0, totalH - (viewH - 10));
    const trackH = sbH - 36;
    const thumbH = maxScrollY > 0 ? Math.min(120, Math.max(45, Math.round((viewH / totalH) * trackH))) : trackH;
    const thumbY = maxScrollY > 0 ? sbY + 18 + (scrollY / maxScrollY) * (trackH - thumbH) : sbY + 18;

    // Up arrow button
    const isUpHov = hoveredId === 'sb_up';
    drawWin95Box(ctx, sbX, sbY, sbW, 18, isUpHov, '#c0c0c0');
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(sbX + sbW / 2, sbY + 5);
    ctx.lineTo(sbX + sbW / 2 - 4.5, sbY + 12);
    ctx.lineTo(sbX + sbW / 2 + 4.5, sbY + 12);
    ctx.fill();

    // Down arrow button
    const isDownHov = hoveredId === 'sb_down';
    drawWin95Box(ctx, sbX, sbY + sbH - 18, sbW, 18, isDownHov, '#c0c0c0');
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(sbX + sbW / 2, sbY + sbH - 5);
    ctx.lineTo(sbX + sbW / 2 - 4.5, sbY + sbH - 12);
    ctx.lineTo(sbX + sbW / 2 + 4.5, sbY + sbH - 12);
    ctx.fill();

    // Scrollbar Thumb
    drawWin95Box(ctx, sbX, thumbY, sbW, thumbH, false, '#c0c0c0');
    // 3 subtle grip lines in center of thumb
    if (thumbH >= 30) {
      const gripY = thumbY + thumbH / 2;
      ctx.strokeStyle = '#808080';
      ctx.lineWidth = 1;
      [-4, 0, 4].forEach((off) => {
        ctx.beginPath();
        ctx.moveTo(sbX + 4, gripY + off);
        ctx.lineTo(sbX + sbW - 4, gripY + off);
        ctx.stroke();
      });
    }

    if (activePage === 'home') {
      const centerX = viewX + (viewW - sbW) / 2;
      const nameY = viewY + viewH * 0.34;
      const roleY = viewY + viewH * 0.45;
      const linksY = viewY + viewH * 0.57;

      // Main Heading: Ramy Kassam (Bold Cartoonish Font)
      ctx.textAlign = 'center';
      ctx.font = '900 64px "Comic Sans MS", "Chalkboard SE", "Marker Felt", cursive, sans-serif';
      ctx.fillStyle = '#d4d4d8';
      ctx.fillText('Ramy Kassam', centerX + 3, nameY + 3);
      ctx.fillStyle = '#000000';
      ctx.fillText('Ramy Kassam', centerX, nameY);

      // Subtitle: Software Engineer (Bold Cartoonish Font)
      ctx.font = 'bold 32px "Comic Sans MS", "Chalkboard SE", "Marker Felt", cursive, sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Software Engineer', centerX, roleY);

      // 4 Inline Hyperlink Text Links (Strictly NO Boxes — plain inline text + underline)
      const hitRegions = getMonitorHitRegions(winState, 'home');
      const linkRegions = hitRegions.filter((r) => r.label);

      linkRegions.forEach((link) => {
        const isHovered = hoveredId === link.id;
        const isVisitedOrActive = activePage === link.id || visitedLinks.has(link.id);

        // Classic purple (#800080) when clicked/visited, classic blue (#0000EE) when unvisited
        const linkColor = isVisitedOrActive ? '#800080' : isHovered ? '#551a8b' : '#0000ee';
        ctx.fillStyle = linkColor;
        ctx.font = 'bold 22px "Comic Sans MS", "Chalkboard SE", cursive, sans-serif';
        ctx.textAlign = 'center';

        const textX = link.x + link.w / 2;
        const textY = linksY;
        ctx.fillText(link.label, textX, textY);

        // Plain inline underline only
        const textWidth = ctx.measureText(link.label).width;
        ctx.fillStyle = linkColor;
        ctx.fillRect(textX - textWidth / 2, textY + 4, textWidth, 2.5);
      });
    } else {
      // ─────────────────────────────────────────────────────────────────────────
      // TWO-COLUMN SHOWCASE LAYOUT (Matching User's Reference Screenshot 1-for-1!)
      // Left Sidebar: Ramy / Kassam / Showcase '26 + Vertical Monospaced Navigation Links
      // Right Column: Typewriter Monospaced Content based on Ramy's Resume (490px width!)
      // ─────────────────────────────────────────────────────────────────────────
      ctx.save();
      ctx.beginPath();
      ctx.rect(viewX + 4, viewY + 4, viewW - sbW - 8, viewH - 8);
      ctx.clip();

      const navX = viewX + 26;

      // Left Sidebar Top Branding: "Ramy / Kassam / Showcase '26" (matching reference!)
      ctx.textAlign = 'left';
      ctx.fillStyle = '#27272a';
      ctx.font = '900 32px Georgia, "Times New Roman", serif';
      ctx.fillText('Ramy', navX, viewY + 54);
      ctx.fillText('Kassam', navX, viewY + 88);

      ctx.font = 'bold 14px "Courier New", Courier, monospace';
      ctx.fillStyle = '#3f3f46';
      ctx.fillText("Showcase '26", navX, viewY + 118);

      // Left Sidebar Vertical Links: HOME, ABOUT, EXPERIENCE, PROJECTS, CONTACT (Monospaced!)
      const hitRegions = getMonitorHitRegions(winState, activePage);
      const navRegions = hitRegions.filter((r) => r.navLabel);

      navRegions.forEach((nav) => {
        const isCurrent = activePage === nav.id;
        const isHovered = hoveredId === nav.id;
        const isVisited = visitedLinks.has(nav.id) || nav.id === 'home';

        const linkColor = isCurrent || isVisited ? '#551a8b' : isHovered ? '#800080' : '#0000ee';
        ctx.fillStyle = linkColor;
        ctx.font = 'bold 14.5px "Courier New", Courier, monospace';
        ctx.textAlign = 'left';

        const labelY = nav.y + 19;
        const displayLabel = isCurrent ? `• ${nav.navLabel}` : nav.navLabel;

        ctx.fillText(displayLabel, navX, labelY);
        const tw = ctx.measureText(displayLabel).width;
        ctx.fillRect(navX, labelY + 3, tw, 1.4);
      });

      // Right Content Area (comfortably proportioned 490px column matching reference layout!)
      ctx.save();
      ctx.beginPath();
      ctx.rect(viewX + 205, viewY + 4, viewW - sbW - 209, viewH - 8);
      ctx.clip();
      ctx.translate(0, -scrollY);

      const contentX = viewX + 215;
      const contentW = 490;

      if (activePage === 'about') {
        // Big Bold Italic Display Heading: "Welcome"
        ctx.fillStyle = '#18181b';
        ctx.font = 'italic 900 46px Georgia, "Times New Roman", serif';
        ctx.fillText('Welcome', contentX, viewY + 54);

        // Subtitle: "I'm Ramy Kassam" (Monospace Courier New)
        ctx.font = 'bold 17.5px "Courier New", Courier, monospace';
        ctx.fillStyle = '#18181b';
        ctx.fillText("I'm Ramy Kassam", contentX, viewY + 88);

        // Paragraph 1 (Typewriter Monospace Courier New)
        ctx.font = '13.5px "Courier New", Courier, monospace';
        ctx.fillStyle = '#27272a';
        ctx.fillText(
          "I'm a software engineer currently working at Vertx Partners! In May of 2024 I graduated",
          contentX,
          viewY + 118
        );
        ctx.fillText(
          'from University of Colorado Boulder with my BS in Computer Science.',
          contentX,
          viewY + 136
        );

        // Paragraph 2 ("Thank you for taking the time..." + inline links)
        ctx.fillText(
          'Thank you for taking the time to check out my portfolio. I really hope you enjoy',
          contentX,
          viewY + 164
        );
        ctx.fillText(
          'exploring it as much as I enjoyed building it. If you have any questions or',
          contentX,
          viewY + 182
        );

        const p2Prefix = 'comments, feel free to contact me using ';
        ctx.fillText(p2Prefix, contentX, viewY + 200);
        const prefixW = ctx.measureText(p2Prefix).width;

        const formLinkText = 'this form';
        ctx.fillStyle = hoveredId === 'contact' ? '#800080' : '#551a8b';
        ctx.fillText(formLinkText, contentX + prefixW, viewY + 200);
        const formW = ctx.measureText(formLinkText).width;
        ctx.fillRect(contentX + prefixW, viewY + 202, formW, 1.2);

        ctx.fillStyle = '#27272a';
        ctx.fillText(' or shoot me an email at', contentX + prefixW + formW, viewY + 200);

        const emailText = 'kassamramy27@outlook.com';
        ctx.fillStyle = hoveredId === 'email_link' ? '#800080' : '#0000ee';
        ctx.fillText(emailText, contentX, viewY + 218);
        const emailW = ctx.measureText(emailText).width;
        ctx.fillRect(contentX, viewY + 220, emailW, 1.2);

        // ── Horizontal Rule Box: "Looking for my resume?" ──
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(contentX, viewY + 236);
        ctx.lineTo(contentX + contentW, viewY + 236);
        ctx.stroke();

        drawResumeComputerIcon(ctx, contentX + 2, viewY + 246);

        ctx.fillStyle = '#18181b';
        ctx.font = 'bold 16.5px "Courier New", Courier, monospace';
        ctx.fillText('Looking for my resume?', contentX + 54, viewY + 262);

        const dlText = 'Click here to download it!';
        ctx.fillStyle = hoveredId === 'download_resume' ? '#800080' : '#0000ee';
        ctx.font = '13.5px "Courier New", Courier, monospace';
        ctx.fillText(dlText, contentX + 54, viewY + 282);
        const dlW = ctx.measureText(dlText).width;
        ctx.fillRect(contentX + 54, viewY + 284, dlW, 1.2);

        ctx.strokeStyle = '#3f3f46';
        ctx.beginPath();
        ctx.moveTo(contentX, viewY + 298);
        ctx.lineTo(contentX + contentW, viewY + 298);
        ctx.stroke();

        // ── "About Me" Section (Typewriter Monospace Courier New) ──
        ctx.fillStyle = '#18181b';
        ctx.font = 'bold 18px "Courier New", Courier, monospace';
        ctx.fillText('About Me', contentX, viewY + 330);

        ctx.font = '13.5px "Courier New", Courier, monospace';
        ctx.fillStyle = '#27272a';
        const aboutLines = [
          'From a young age, I have had a curiosity about how things worked. This',
          'naturally led me to become obsessed with technology and I fell in love with',
          'building things from the ground up. In middle school, I started coding and',
          'exploring systems, which was my first real exposure to programming. Originally',
          'from Miami, Florida, I moved across the country to Boulder, Colorado to attend',
          'the University of Colorado Boulder, where I earned my BS in Computer Science.'
        ];
        aboutLines.forEach((line, idx) => {
          ctx.fillText(line, contentX, viewY + 354 + idx * 18);
        });

        // Framed Photo Banner (Loveland / Colorado Rockies Landscape)
        const photoY = viewY + 468;
        const photoH = 215;
        if (
          monitorAboutPhotoImg &&
          monitorAboutPhotoImg.complete &&
          monitorAboutPhotoImg.naturalWidth > 0
        ) {
          const imgW = monitorAboutPhotoImg.naturalWidth;
          const imgH = monitorAboutPhotoImg.naturalHeight;
          const targetAspect = contentW / photoH;
          const srcH = Math.min(imgH, imgW / targetAspect);
          const sy = (imgH - srcH) * 0.28;
          ctx.drawImage(
            monitorAboutPhotoImg,
            0,
            sy,
            imgW,
            srcH,
            contentX,
            photoY,
            contentW,
            photoH
          );
        } else {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(contentX, photoY, contentW, photoH);
        }

        // Photo Border & Caption
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 1;
        ctx.strokeRect(contentX, photoY, contentW, photoH);

        ctx.fillStyle = '#52525b';
        ctx.font = 'italic 12px "Courier New", Courier, monospace';
        ctx.fillText('Figure 1: Colorado Rockies, Winter 2024', contentX, photoY + photoH + 18);

        // Continuation Paragraph (College & Early Career)
        ctx.font = '13.5px "Courier New", Courier, monospace';
        ctx.fillStyle = '#27272a';
        const collegeLines = [
          'In college, I attended the University of Colorado Boulder to study Computer',
          'Science and Mathematics. I was ecstatic to learn and collaborate with talented',
          'peers. During my time there, I managed night transit operations for a team',
          'of 35+ at CU Night Ride, taught STEM and coding at Lavner Education, and later',
          'joined Vertx Partners to build fast, scalable backend software and tooling.'
        ];
        collegeLines.forEach((line, idx) => {
          ctx.fillText(line, contentX, viewY + 730 + idx * 18);
        });

        // ── "My Hobbies" Section (2-Column Format matching reference screenshot 2!) ──
        ctx.fillStyle = '#18181b';
        ctx.font = 'bold 18px "Courier New", Courier, monospace';
        ctx.fillText('My Hobbies', contentX, viewY + 842);

        // Left Column (Text: 295px width)
        ctx.font = '13.5px "Courier New", Courier, monospace';
        ctx.fillStyle = '#27272a';
        const hobbyTextLines = [
          'Beyond software, I have a lot of hobbies',
          'that I enjoy doing in my free time. The',
          'more tangible hobbies I have are skiing in',
          'the Colorado Rockies and photography. You',
          'can view full photos from my ski trips in'
        ];
        hobbyTextLines.forEach((line, idx) => {
          ctx.fillText(line, contentX, viewY + 868 + idx * 18);
        });

        const albumLinkText = 'the photo album on the desk!';
        ctx.fillStyle = hoveredId === 'open_album' ? '#800080' : '#0000ee';
        ctx.fillText(albumLinkText, contentX, viewY + 958);
        ctx.fillRect(contentX, viewY + 960, ctx.measureText(albumLinkText).width, 1.2);

        ctx.fillStyle = '#27272a';
        ctx.fillText('Other hobbies I enjoy are hiking,', contentX, viewY + 978);
        ctx.fillText('working out, and playing video games.', contentX, viewY + 996);

        const collegeHobbyLines = [
          'In college, I was active across campus',
          'student groups and held shift management',
          'positions at CU Night Ride. I met a lot',
          'of amazing people through the community.'
        ];
        collegeHobbyLines.forEach((line, idx) => {
          ctx.fillText(line, contentX, viewY + 1024 + idx * 18);
        });

        // Right Column (Framed Portrait Photo matching reference Figure 2!)
        const photo2X = contentX + 315;
        const photo2Y = viewY + 868;
        const photo2W = 175;
        const photo2H = 215;

        if (
          monitorHobbyPhotoImg &&
          monitorHobbyPhotoImg.complete &&
          monitorHobbyPhotoImg.naturalWidth > 0
        ) {
          const imgW = monitorHobbyPhotoImg.naturalWidth;
          const imgH = monitorHobbyPhotoImg.naturalHeight;
          const targetAspect = photo2W / photo2H;
          const srcH = Math.min(imgH, imgW / targetAspect);
          const sy = (imgH - srcH) * 0.15;
          ctx.drawImage(
            monitorHobbyPhotoImg,
            0,
            sy,
            imgW,
            srcH,
            photo2X,
            photo2Y,
            photo2W,
            photo2H
          );
        } else {
          ctx.fillStyle = '#334155';
          ctx.fillRect(photo2X, photo2Y, photo2W, photo2H);
        }

        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 1;
        ctx.strokeRect(photo2X, photo2Y, photo2W, photo2H);

        ctx.fillStyle = '#52525b';
        ctx.font = 'italic 12px "Courier New", Courier, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Figure 2: Me, 2024', photo2X + photo2W / 2, photo2Y + photo2H + 18);
        ctx.textAlign = 'left';

        // ── Closing Section (Spanning full width under 2-column split) ──
        ctx.font = '13.5px "Courier New", Courier, monospace';
        ctx.fillStyle = '#27272a';
        ctx.fillText(
          'Thanks for reading about me! I hope that you enjoy exploring the rest of my',
          contentX,
          viewY + 1130
        );
        ctx.fillText(
          'portfolio website and everything it has to offer. Good luck and have fun!',
          contentX,
          viewY + 1148
        );

        ctx.fillText(
          'If you have any questions or comments I would love to hear them. You can reach',
          contentX,
          viewY + 1176
        );

        const closeP2Prefix = 'me through the ';
        ctx.fillText(closeP2Prefix, contentX, viewY + 1194);
        const cpW = ctx.measureText(closeP2Prefix).width;

        const closeContactText = 'contact page';
        ctx.fillStyle = hoveredId === 'contact' ? '#800080' : '#551a8b';
        ctx.fillText(closeContactText, contentX + cpW, viewY + 1194);
        const ccW = ctx.measureText(closeContactText).width;
        ctx.fillRect(contentX + cpW, viewY + 1196, ccW, 1.2);

        ctx.fillStyle = '#27272a';
        ctx.fillText(' or shoot me an email at ', contentX + cpW + ccW, viewY + 1194);
        const midW = ctx.measureText(' or shoot me an email at ').width;

        ctx.fillStyle = hoveredId === 'email_link' ? '#800080' : '#0000ee';
        ctx.fillText(emailText, contentX + cpW + ccW + midW, viewY + 1194);
        ctx.fillRect(contentX + cpW + ccW + midW, viewY + 1196, emailW, 1.2);

        // Bottom retro footer divider & copyright
        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(contentX, viewY + 1224);
        ctx.lineTo(contentX + contentW, viewY + 1224);
        ctx.stroke();

        ctx.fillStyle = '#71717a';
        ctx.font = '12px "Courier New", Courier, monospace';
        ctx.fillText('© Copyright 2026 Ramy Kassam', contentX, viewY + 1244);
      } else if (activePage === 'experience') {
        ctx.fillStyle = '#27272a';
        ctx.font = '900 38px Georgia, "Times New Roman", serif';
        ctx.fillText('Experience', contentX, viewY + 52);

        const jobs = [
          {
            role: 'Software Developer — Vertx Partners',
            date: '10/2024 – Present | Boulder, CO',
            bullets: [
              '• Cut average API response time by 66% (350ms to 120ms)',
              '  via caching, connection pooling & database parallelism.',
              '• Designed & shipped 20+ new tools and UI features (+20%',
              '  customer satisfaction score).',
              '• Built automated CI/CD pipelines removing ~20 hours of',
              '  manual deployment work per week.'
            ]
          },
          {
            role: 'Manager — CU Night Ride (UC Boulder)',
            date: '04/2022 – 03/2024 | Boulder, CO',
            bullets: [
              '• Directed nightly student transit shift teams of 10+ within',
              '  a 30–40 person campus operations staff.',
              '• Named Employee of the Semester for leadership and',
              '  operational excellence.'
            ]
          },
          {
            role: 'IT Intern — Lavner Education',
            date: '06/2023 – 08/2023 | Denver, CO',
            bullets: [
              '• Led student technical programs in Python, C++, Scratch,',
              '  and STEM hardware.',
              '• Maintained and troubleshot lab systems and software.'
            ]
          }
        ];

        let curY = viewY + 88;
        jobs.forEach((job) => {
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 15.5px "Courier New", Courier, monospace';
          ctx.fillText(job.role, contentX, curY);

          ctx.fillStyle = '#52525b';
          ctx.font = 'italic 12.5px "Courier New", Courier, monospace';
          ctx.fillText(job.date, contentX, curY + 16);
          curY += 34;

          ctx.fillStyle = '#27272a';
          ctx.font = '13.5px "Courier New", Courier, monospace';
          job.bullets.forEach((b) => {
            ctx.fillText(b, contentX, curY);
            curY += 18;
          });
          curY += 12;
        });
      } else if (activePage === 'projects') {
        ctx.fillStyle = '#27272a';
        ctx.font = '900 38px Georgia, "Times New Roman", serif';
        ctx.fillText('Projects & Skills', contentX, viewY + 52);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 15.5px "Courier New", Courier, monospace';
        ctx.fillText('ParkPal — HCI & Transit Project', contentX, viewY + 92);

        ctx.fillStyle = '#52525b';
        ctx.font = 'italic 12.5px "Courier New", Courier, monospace';
        ctx.fillText('Awarded "Most Useful Project" at CU Boulder Course Expo', contentX, viewY + 110);

        ctx.fillStyle = '#27272a';
        ctx.font = '13.5px "Courier New", Courier, monospace';
        const pLines = [
          '• Designed and prototyped a user-centered application for',
          '  locating and managing parking, from concept through',
          '  evaluated interactive prototypes in Figma.',
          '• Ran usability testing with 50+ participants and iterated on',
          '  analyzed feedback.'
        ];
        pLines.forEach((l, idx) => {
          ctx.fillText(l, contentX, viewY + 132 + idx * 18);
        });

        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(contentX, viewY + 234);
        ctx.lineTo(contentX + contentW, viewY + 234);
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 15.5px "Courier New", Courier, monospace';
        ctx.fillText('Technical Skills & Education', contentX, viewY + 262);

        const skillLines = [
          '• Languages: Python, Java, C++, JavaScript, SQL, HTML/CSS',
          '• Frontend: ReactJS, ElectronJS, Three.js, Figma',
          '• Backend & Data: Django, REST APIs, MongoDB, SQL, Pandas',
          '• DevOps & Tools: Docker, Git, CI/CD, Jupyter, VS Code',
          '• Education: B.S. in Computer Science, Math Minor (CU Boulder)'
        ];
        ctx.font = '13.5px "Courier New", Courier, monospace';
        skillLines.forEach((s, idx) => {
          ctx.fillText(s, contentX, viewY + 288 + idx * 22);
        });
      } else if (activePage === 'contact') {
        ctx.fillStyle = '#27272a';
        ctx.font = '900 38px Georgia, "Times New Roman", serif';
        ctx.fillText('Contact', contentX, viewY + 52);

        ctx.font = '13.5px "Courier New", Courier, monospace';
        ctx.fillText("I'm always open to discussing software engineering roles,", contentX, viewY + 92);
        ctx.fillText('backend & full-stack projects, or anything tech and', contentX, viewY + 112);
        ctx.fillText('outdoors. Feel free to reach out directly:', contentX, viewY + 132);

        ctx.font = 'bold 14.5px "Courier New", Courier, monospace';
        ctx.fillStyle = '#0f172a';
        ctx.fillText('Location: Boulder, CO  |  (305) 333-6473', contentX, viewY + 162);

        const em = 'Email: kassamramy27@outlook.com';
        ctx.fillStyle = hoveredId === 'email_link' ? '#800080' : '#0000ee';
        ctx.fillText(em, contentX, viewY + 192);
        ctx.fillRect(contentX, viewY + 195, ctx.measureText(em).width, 1.4);

        const gh = 'GitHub: github.com/Ram096';
        ctx.fillStyle = hoveredId === 'github_link' ? '#800080' : '#0000ee';
        ctx.fillText(gh, contentX, viewY + 228);
        ctx.fillRect(contentX, viewY + 231, ctx.measureText(gh).width, 1.4);

        ctx.strokeStyle = '#3f3f46';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(contentX, viewY + 262);
        ctx.lineTo(contentX + contentW, viewY + 262);
        ctx.stroke();

        drawResumeComputerIcon(ctx, contentX + 2, viewY + 276);
        const dl = 'Download Full Resume (PDF)';
        ctx.fillStyle = hoveredId === 'download_resume' ? '#800080' : '#0000ee';
        ctx.font = 'bold 14.5px "Courier New", Courier, monospace';
        ctx.fillText(dl, contentX + 46, viewY + 298);
        ctx.fillRect(contentX + 46, viewY + 301, ctx.measureText(dl).width, 1.4);
      }

      ctx.restore(); // restores right column translation and clip
      ctx.restore(); // restores outer showcase view clip
    }

    // Bottom Windows 95 Browser Status Bar with "© Copyright 2026 Ramy Kassam" (matching screenshot!)
    const statusY = wb.y + wb.h - 26;
    drawWin95Box(ctx, wb.x + 6, statusY, wb.w - 12, 22, true, '#c0c0c0');
    ctx.fillStyle = '#27272a';
    ctx.font = '12px "Tahoma", "MS Sans Serif", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('© Copyright 2026 Ramy Kassam', wb.x + 14, statusY + 15);
  }

  // ─────────────────────────────────────────────────────────────
  // CLASSIC WINDOWS 95 BOTTOM TASKBAR
  // (Only Windows 95 Logo + Start button on the left, and Time on the right)
  // ─────────────────────────────────────────────────────────────
  drawWin95Box(ctx, 0, 724, 1024, 44, false, '#c0c0c0');

  // Raised [ Start ] Button with Windows 95 Flag Logo
  drawWin95Box(ctx, 6, 728, 114, 34, false, '#c0c0c0');
  drawWin95Logo(ctx, 12, 733, 26, 24);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 18.5px "Tahoma", "MS Sans Serif", sans-serif';
  ctx.fillText('Start', 44, 751);

  // Sunken Time Box on the right side of the taskbar
  drawWin95Box(ctx, 908, 730, 108, 32, true, '#c0c0c0');
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 15px "Tahoma", "MS Sans Serif", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(timeStr, 962, 751);

  ctx.restore();
}

function createMainMonitorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1536;
  drawMainMonitorCanvas(canvas, 'home', null, 'normal', new Set());

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return { texture, canvas };
}

// 2. Wall CRT Telemetry Screen Textures (for the 2x2 Wall CRT Grid + Side CRTs)
function createCRTTelemetryTexture(variant = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');

  // Retro bluish-slate phosphor CRT background matching sketch aesthetic
  const bgGrad = ctx.createRadialGradient(256, 192, 30, 256, 192, 260);
  bgGrad.addColorStop(0, '#1e293b');
  bgGrad.addColorStop(1, '#090d16');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 384);

  // Subtle scanlines & grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 384);
    ctx.stroke();
  }
  for (let y = 0; y <= 384; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Header bar
  ctx.fillStyle = '#334155';
  ctx.fillRect(16, 14, 480, 28);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 14px "Courier New", monospace';
  const titles = [
    'NAV // ORBITAL VECTOR GRID',
    'SYS // REACTOR FLUX TELEMETRY',
    'RADAR // PROXIMITY SECTOR 04',
    'COMMS // DEEP SPACE BEACON',
    'AUX // HULL PRESSURE MATRIX'
  ];
  ctx.fillText(titles[variant % titles.length], 26, 33);

  if (variant === 0) {
    // Radar & trajectory rings
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    [45, 85, 125].forEach((r) => {
      ctx.beginPath();
      ctx.arc(170, 210, r, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(170, 210);
    ctx.lineTo(265, 145);
    ctx.stroke();

    // Right column metrics
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px "Courier New", monospace';
    ctx.fillText('APOAPSIS: 412.8 KM', 325, 95);
    ctx.fillText('PERIAPSIS: 408.2 KM', 325, 125);
    ctx.fillText('INCLIN: 51.64 DEG', 325, 155);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(325, 185, 140, 14);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(325, 215, 110, 14);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(325, 245, 155, 14);
  } else if (variant === 1) {
    // Sine waveforms & bar graphs
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 28; x < 480; x += 6) {
      const y = 145 + Math.sin(x * 0.05) * 36 * Math.cos(x * 0.015);
      if (x === 28) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 28; x < 480; x += 6) {
      const y = 265 + Math.cos(x * 0.04) * 28;
      if (x === 28) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  } else if (variant === 2) {
    // Wireframe ship attitude indicator
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 75, 220, 220);
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(150, 185, 75, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(60, 185);
    ctx.lineTo(240, 185);
    ctx.moveTo(150, 95);
    ctx.lineTo(150, 275);
    ctx.stroke();

    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#cbd5e1';
      ctx.fillRect(290, 82 + i * 36, 175, 20);
    }
  } else {
    // System matrix blocks
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 8; c++) {
        ctx.fillStyle = (r + c) % 3 === 0 ? '#38bdf8' : (r + c) % 5 === 0 ? '#f59e0b' : '#334155';
        ctx.fillRect(32 + c * 56, 75 + r * 54, 44, 38);
      }
    }
  }

  // Vignette border
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 506, 378);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 3. Industrial Switchboard / Control Panel Texture (Sketch-inspired technical panels)
function createIndustrialPanelTexture(variant = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, 512, 512);

  // Industrial dark panel border
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 496);

  if (variant === 0) {
    // Gridded wall panel behind the captain's chair (matching sketch's cross-hatched light/vent wall)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(24, 24, 464, 464);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    const cols = 6;
    const rows = 10;
    const cellW = 464 / cols;
    const cellH = 464 / rows;
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(24 + c * cellW, 24);
      ctx.lineTo(24 + c * cellW, 488);
      ctx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      ctx.beginPath();
      ctx.moveTo(24, 24 + r * cellH);
      ctx.lineTo(488, 24 + r * cellH);
      ctx.stroke();
    }
  } else if (variant === 1) {
    // Toggle switch matrix panel (right of the 2x2 monitors)
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(20, 20, 472, 472);
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 6; c++) {
        const x = 44 + c * 74;
        const y = 42 + r * 56;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y, 42, 34);
        ctx.fillStyle = (r + c) % 4 === 0 ? '#f59e0b' : '#e2e8f0';
        ctx.fillRect(x + 12, y + 6, 18, 14);
      }
    }
  } else {
    // Sloped console switchboard texture under the space window
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(16, 16, 480, 480);

    // Top row of rectangular key-switches
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 3 === 0 ? '#fef3c7' : '#e2e8f0';
      ctx.fillRect(28 + i * 45, 36, 36, 65);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.strokeRect(28 + i * 45, 36, 36, 65);
    }

    // Middle diagnostic strip
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(28, 125, 456, 70);
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#f59e0b';
      ctx.fillRect(40 + i * 31, 142, 20, 36);
    }

    // Bottom button banks & rotary dials
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 8; c++) {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(32 + c * 42, 225 + r * 55, 32, 38);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.strokeRect(32 + c * 42, 225 + r * 55, 32, 38);
      }
    }

    // Two circular dials on bottom-right
    [415, 465].forEach((cx, idx) => {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx, 310 + idx * 80, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.stroke();
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 4. Warm Overhead Ceiling Light Bank Texture (Matching the amber-yellow ribbed ceiling lights in the sketch)
function createCeilingLightTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0, '#fef3c7');
  grad.addColorStop(0.5, '#fde68a');
  grad.addColorStop(1, '#f59e0b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Ribbed diffuser louvers matching the hand-drawn sketch
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 504, 248);

  // Center longitudinal bar
  ctx.fillStyle = '#78350f';
  ctx.fillRect(0, 120, 512, 16);

  // Cross ribs
  ctx.lineWidth = 4;
  for (let x = 24; x < 512; x += 28) {
    ctx.beginPath();
    ctx.moveTo(x, 6);
    ctx.lineTo(x, 250);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 5. Planet Earth Surface & Cloud Textures (Visible outside the spacecraft viewport window)
function createPlanetTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep Earth ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, '#0c4a6e');
  oceanGrad.addColorStop(0.2, '#0369a1');
  oceanGrad.addColorStop(0.5, '#0284c7');
  oceanGrad.addColorStop(0.8, '#0369a1');
  oceanGrad.addColorStop(1, '#0c4a6e');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Subtle shallower coastal shelf waters
  const drawBlob = (cx, cy, rx, ry, rot, color) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Continental landmasses (Americas, Africa, Eurasia, Australia)
  const continents = [
    // North America
    [210, 145, 78, 52, -0.3, '#15803d'],
    [175, 115, 55, 36, 0.2, '#166534'],
    [235, 175, 42, 28, -0.4, '#ca8a04'],
    [255, 210, 22, 34, -0.5, '#15803d'],
    // South America
    [305, 310, 48, 76, -0.2, '#15803d'],
    [320, 285, 38, 42, 0.1, '#16a34a'],
    [298, 355, 26, 45, -0.15, '#166534'],
    // Greenland
    [355, 68, 42, 22, -0.2, '#f8fafc'],
    // Africa
    [545, 255, 64, 82, -0.1, '#15803d'],
    [535, 205, 68, 38, 0.05, '#d97706'], // Sahara
    [568, 315, 38, 48, -0.2, '#16a34a'],
    // Europe
    [525, 130, 56, 34, -0.15, '#15803d'],
    [560, 110, 48, 28, 0.1, '#166534'],
    // Asia
    [685, 145, 115, 62, 0.08, '#15803d'],
    [640, 185, 65, 35, -0.1, '#ca8a04'], // Middle East / Central Asia
    [735, 195, 62, 44, 0.2, '#16a34a'],
    [780, 130, 72, 42, -0.15, '#166534'],
    // Australia
    [825, 345, 48, 34, -0.1, '#d97706'],
    [840, 355, 32, 24, 0.2, '#15803d']
  ];

  // Coastal turquoise glow around continents
  continents.forEach(([x, y, rx, ry, rot]) => {
    drawBlob(x, y, rx * 1.16, ry * 1.16, rot, 'rgba(14, 165, 233, 0.35)');
  });

  // Main continent terrain
  continents.forEach(([x, y, rx, ry, rot, col]) => {
    drawBlob(x, y, rx, ry, rot, col);
  });

  // Polar ice caps (Arctic & Antarctica)
  ctx.fillStyle = 'rgba(248, 250, 252, 0.92)';
  ctx.fillRect(0, 0, 1024, 26);
  ctx.fillRect(0, 478, 1024, 34);

  // Swirling white atmospheric clouds across Earth
  for (let i = 0; i < 75; i++) {
    const x = (i * 173) % 1024;
    const y = 30 + ((i * 89) % 450);
    const rx = 45 + ((i * 41) % 110);
    const ry = 8 + ((i * 19) % 20);
    const rot = ((i % 7) - 3) * 0.12;
    drawBlob(x, y, rx, ry, rot, 'rgba(255, 255, 255, 0.42)');
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 6. Book Cover Texture
function createBookCoverTexture(book) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = book.color;
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = book.accent;
  ctx.lineWidth = 10;
  ctx.strokeRect(24, 24, 464, 464);

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 34px Georgia, serif';
  ctx.fillText(book.title.slice(0, 22), 256, 225);

  ctx.fillStyle = book.accent;
  ctx.font = 'italic 22px Georgia, serif';
  ctx.fillText(book.author, 256, 295);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 7. Physical Adventure Photo Album Cover Texture (Sitting on the Console Desk)
function createAlbumCoverTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Rich warm saddle-leather cover background
  const bgGrad = ctx.createLinearGradient(0, 0, 512, 512);
  bgGrad.addColorStop(0, '#7c2d12');
  bgGrad.addColorStop(0.5, '#9a3412');
  bgGrad.addColorStop(1, '#5c1f0b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Left stitched spine binding
  ctx.fillStyle = '#431407';
  ctx.fillRect(0, 0, 56, 512);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(56, 16);
  ctx.lineTo(56, 496);
  ctx.stroke();
  ctx.setLineDash([]);

  // Gold foil embossed border frame
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 6;
  ctx.strokeRect(80, 28, 404, 456);

  // Brass corner protectors
  ctx.fillStyle = '#f59e0b';
  [
    [450, 24],
    [450, 454]
  ].forEach(([cx, cy]) => {
    ctx.fillRect(cx, cy, 38, 34);
  });

  // Gold foil embossed inner decorative border frame
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(94, 42, 376, 428);

  // Embossed gold compass / mountain crest in the center of the leather cover (no white paper!)
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(170, 240);
  ctx.lineTo(245, 135);
  ctx.lineTo(315, 240);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(255, 240);
  ctx.lineTo(330, 120);
  ctx.lineTo(405, 240);
  ctx.stroke();

  // Horizontal gold divider line under mountain crest
  ctx.beginPath();
  ctx.moveTo(145, 256);
  ctx.lineTo(418, 256);
  ctx.stroke();

  // Gold foil Album Title
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 34px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('ADVENTURE ALBUM', 282, 332);

  ctx.fillStyle = '#fed7aa';
  ctx.font = 'bold 20px "Tahoma", sans-serif';
  ctx.fillText('SKI TRIPS • CAMPING • PHOTOS', 282, 378);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'italic 18px Georgia, serif';
  ctx.fillText('Ramy Kassam — 2026', 282, 424);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// 8. Artificial Gravity Switch Faceplate Texture (hazard-striped control plate on the console)
function createGravitySwitchPlateTexture(isZeroG = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 498, 498);

  // Hazard stripes top & bottom
  ctx.save();
  ctx.beginPath();
  ctx.rect(20, 20, 472, 56);
  ctx.rect(20, 436, 472, 56);
  ctx.clip();
  ctx.fillStyle = '#eab308';
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = '#0f172a';
  for (let i = -200; i < 760; i += 46) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 24, 0);
    ctx.lineTo(i - 488, 512);
    ctx.lineTo(i - 512, 512);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 40px "Courier New", monospace';
  ctx.fillText('GRAVITY', 256, 132);

  // Status box
  ctx.fillStyle = isZeroG ? '#450a0a' : '#022c22';
  ctx.fillRect(56, 160, 400, 90);
  ctx.strokeStyle = isZeroG ? '#ef4444' : '#10b981';
  ctx.lineWidth = 5;
  ctx.strokeRect(56, 160, 400, 90);
  ctx.fillStyle = isZeroG ? '#ef4444' : '#10b981';
  ctx.beginPath();
  ctx.arc(108, 205, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = isZeroG ? '#fca5a5' : '#6ee7b7';
  ctx.font = 'bold 34px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(isZeroG ? '0.0G  OFF' : '1.0G  ON', 150, 217);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 26px "Courier New", monospace';
  ctx.fillText(isZeroG ? 'FLIP TO RESTORE' : 'FLIP TO DISABLE', 256, 395);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Small synthesized "clunk + hum" when the gravity switch is flipped (Web Audio, no assets needed)
function playGravitySwitchSound(toZeroG) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const snap = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snap.type = 'triangle';
    snap.frequency.setValueAtTime(toZeroG ? 380 : 240, now);
    snap.frequency.exponentialRampToValueAtTime(toZeroG ? 90 : 130, now + 0.08);
    snapGain.gain.setValueAtTime(0.3, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    snap.connect(snapGain).connect(ctx.destination);
    snap.start(now);
    snap.stop(now + 0.1);

    const hum = ctx.createOscillator();
    const humGain = ctx.createGain();
    hum.type = 'sine';
    hum.frequency.setValueAtTime(toZeroG ? 260 : 70, now + 0.03);
    hum.frequency.exponentialRampToValueAtTime(toZeroG ? 60 : 320, now + 0.7);
    humGain.gain.setValueAtTime(0.001, now);
    humGain.gain.linearRampToValueAtTime(0.2, now + 0.12);
    humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    hum.connect(humGain).connect(ctx.destination);
    hum.start(now + 0.03);
    hum.stop(now + 0.8);
    setTimeout(() => ctx.close(), 1200);
  } catch {
    // Audio is optional
  }
}

export default function App() {
  const [stage, setStage] = useState('cmd'); // 'cmd' | 'booting' | 'station'
  const [typedTitle, setTypedTitle] = useState('');
  const [showSubPrompt, setShowSubPrompt] = useState(false);
  const [activeBook, setActiveBook] = useState(null);
  const [hoveringAlbum, setHoveringAlbum] = useState(false);
  const [isAlbumOpen, setIsAlbumOpen] = useState(false);
  const [activeAdventureId, setActiveAdventureId] = useState('basin');
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(null);
  const [hoveringScreen, setHoveringScreen] = useState(false);
  const [isScreenFullDisplay, setIsScreenFullDisplay] = useState(false);
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Intro "click anywhere to begin" slow-rotation mode + Zero-Gravity switch state
  const [isIntroActive, setIsIntroActive] = useState(false);
  const [isZeroG, setIsZeroG] = useState(false);
  const [gravityBanner, setGravityBanner] = useState(null);
  const [hoveringGravitySwitch, setHoveringGravitySwitch] = useState(false);

  const mountRef = useRef(null);
  const cameraTargetModeRef = useRef('overview'); // 'overview' | 'zoomIn'
  const zoomTimeoutRef = useRef(null);
  const lastUserActionRef = useRef(0);
  const isIntroActiveRef = useRef(false);
  const isZeroGRef = useRef(false);
  const toggleZeroGRef = useRef(null);
  const bannerTimeoutRef = useRef(null);

  const toggleGravity = () => {
    if (toggleZeroGRef.current) toggleZeroGRef.current();
  };

  const fullTitle = 'Ramy Kassam Portfolio showcase 2026';

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Stage 1 Command Prompt Typewriter
  useEffect(() => {
    if (stage !== 'cmd') return;
    setTypedTitle('');
    setShowSubPrompt(false);

    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setTypedTitle(fullTitle.slice(0, index));
      if (index >= fullTitle.length) {
        clearInterval(interval);
        setTimeout(() => setShowSubPrompt(true), 350);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [stage]);

  // Escape key exits full-screen monitor display or closes 3D photo album
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isAlbumOpen || isScreenFullDisplay) {
          handleExitFullDisplay();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScreenFullDisplay, isAlbumOpen]);

  const handleStart = () => {
    setStage('booting');
    setTimeout(() => {
      setStage('station');
      cameraTargetModeRef.current = 'overview';
      setIsScreenFullDisplay(false);
      setIsAlbumOpen(false);
      // Start in the slow-floating "Click anywhere to begin" intro
      isIntroActiveRef.current = true;
      setIsIntroActive(true);
    }, 700);
  };

  const handleReplay = () => {
    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
    setActiveBook(null);
    setIsScreenFullDisplay(false);
    setIsAlbumOpen(false);
    cameraTargetModeRef.current = 'overview';
    isIntroActiveRef.current = false;
    setIsIntroActive(false);
    isZeroGRef.current = false;
    setIsZeroG(false);
    setGravityBanner(null);
    setStage('cmd');
  };

  const handleFocusScreen = () => {
    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
    setIsAlbumOpen(false);
    cameraTargetModeRef.current = 'zoomIn';
    setIsScreenFullDisplay(true);
  };

  const handleFocusAlbum = () => {
    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
    setIsScreenFullDisplay(false);
    cameraTargetModeRef.current = 'zoomAlbum';
    setIsAlbumOpen(true);
  };

  const handleExitFullDisplay = () => {
    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
    setIsScreenFullDisplay(false);
    setIsAlbumOpen(false);
    cameraTargetModeRef.current = 'overview';
  };

  // ─────────────────────────────────────────────────────────────
  // THREE.JS WEBGL ENCLOSED INDUSTRIAL SPACECRAFT BRIDGE SCENE
  // Modeled directly after the user's reference concept sketch:
  // - Cool slate-grey/blue industrial panels + warm amber overhead light banks
  // - Left-front wide rounded-rectangle viewport window showing deep space, stars & planet
  // - L-shaped wrap-around console with sloped switchboards & foreground comms handset
  // - Center-desk angled wedge terminal ("Joulomb Inc") with side buttons & IE screen
  // - 2x2 wall CRT monitor bank on back wall + gridded panel + server racks
  // - 4 angled overhead diagnostic pods along the upper ceiling beam
  // - High-back segmented padded spacecraft captain's chair on the right
  // - 100% enclosed cabin interior (never shows exterior of the station)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== 'station' || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03060d);

    // Camera positioned inside the sealed bridge at an elevated 3/4 view framing the desk, chair,
    // Left-Front Wall Monitor + Keyboard, and Back Space Glass Window (100% inside the walls!)
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 120);
    const baseCamPos = new THREE.Vector3(0.32, 2.32, 3.25);
    const defaultLookAtPos = new THREE.Vector3(-0.12, 1.35, -0.78);
    camera.position.copy(baseCamPos);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // OrbitControls: Full 360-degree rotation & smooth zoom while staying 100% inside the sealed room!
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(defaultLookAtPos);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 0.85;
    controls.maxDistance = 4.35;
    controls.minPolarAngle = Math.PI * 0.24;
    controls.maxPolarAngle = Math.PI * 0.56;
    // Unrestricted 360-degree horizontal rotation!
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;

    const markUserInteraction = () => {
      lastUserActionRef.current = Date.now();
    };
    controls.addEventListener('start', markUserInteraction);

    // =========================================================
    // A. LIGHTING (Cool Slate Industrial Ambient + Warm Amber Ceiling Banks)
    // =========================================================
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.85);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xfef3c7, 0x1e293b, 0.95);
    hemiLight.position.set(0, 4.0, 0);
    scene.add(hemiLight);

    // Main Warm Overhead Ceiling Light Bank Illumination (casts soft shadows across the console)
    const ceilingKeyLight = new THREE.DirectionalLight(0xfffbeb, 2.3);
    ceilingKeyLight.position.set(-1.1, 3.6, 0.6);
    ceilingKeyLight.castShadow = true;
    ceilingKeyLight.shadow.mapSize.width = 2048;
    ceilingKeyLight.shadow.mapSize.height = 2048;
    ceilingKeyLight.shadow.camera.near = 0.5;
    ceilingKeyLight.shadow.camera.far = 12;
    const d = 4.2;
    ceilingKeyLight.shadow.camera.left = -d;
    ceilingKeyLight.shadow.camera.right = d;
    ceilingKeyLight.shadow.camera.top = d;
    ceilingKeyLight.shadow.camera.bottom = -d;
    ceilingKeyLight.shadow.bias = -0.0005;
    scene.add(ceilingKeyLight);

    // Warm Amber Point Light from the sloped overhead ribbed light panels
    const warmCeilingGlow = new THREE.PointLight(0xfbbf24, 1.8, 7.5);
    warmCeilingGlow.position.set(-1.2, 2.95, -0.75);
    scene.add(warmCeilingGlow);

    // Cool Slate-Blue CRT Fill Light near the 2x2 wall monitors & hero console
    const crtFillLight = new THREE.PointLight(0x7dd3fc, 1.15, 6.0);
    crtFillLight.position.set(0.1, 1.85, -1.5);
    scene.add(crtFillLight);

    // =========================================================
    // B. MATERIALS PALETTE (Nostromo / Ron Cobb Industrial Slate & Steel)
    // =========================================================
    const hullLightSlateMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1, // Light cool grey-blue bulkhead armor
      roughness: 0.48,
      metalness: 0.22
    });
    const hullMidSlateMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Medium industrial steel-slate
      roughness: 0.52,
      metalness: 0.28
    });
    const hullDarkSlateMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Dark structural rib & bezel steel
      roughness: 0.55,
      metalness: 0.38
    });
    const charcoalMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Deep charcoal under-console & recessed seams
      roughness: 0.62,
      metalness: 0.42
    });
    const abyssalBlackMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Dark floor & heavy shadows
      roughness: 0.75,
      metalness: 0.25
    });
    const counterCreamMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Bright desk counter top catching warm ceiling light
      roughness: 0.38,
      metalness: 0.12
    });
    const chairCushionMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Padded slate-grey spacecraft seat upholstery
      roughness: 0.65,
      metalness: 0.10
    });
    const chairBolsterMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Darker side bolsters
      roughness: 0.60,
      metalness: 0.15
    });
    const warmLightPanelMat = new THREE.MeshStandardMaterial({
      map: createCeilingLightTexture(),
      emissive: new THREE.Color(0xf59e0b),
      emissiveMap: createCeilingLightTexture(),
      emissiveIntensity: 0.95,
      roughness: 0.25
    });

    // =========================================================
    // C. ENCLOSED BRIDGE ARCHITECTURE (Floor, Back Wall, Right Wall, Ceiling)
    // =========================================================
    const bridgeGroup = new THREE.Group();
    scene.add(bridgeGroup);

    // 1. Enclosed Dark Industrial Deck Floor (y = 0)
    const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(14, 0.2, 14), abyssalBlackMat);
    floorMesh.position.set(0, -0.1, 1.2);
    floorMesh.receiveShadow = true;
    bridgeGroup.add(floorMesh);

    // Floor anti-slip deck plates
    for (let z = -2.6; z <= 4.8; z += 0.68) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.015, 0.48), charcoalMetalMat);
      strip.position.set(0, 0.01, z);
      strip.receiveShadow = true;
      bridgeGroup.add(strip);
    }

    // 2. Right Side Wall, Rear Enclosure & Solid Ceiling (100% sealed corner-to-corner & floor-to-ceiling)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.28, 4.8, 9.2), hullMidSlateMat);
    rightWall.position.set(3.45, 2.35, 1.4);
    rightWall.receiveShadow = true;
    bridgeGroup.add(rightWall);

    const rearWall = new THREE.Mesh(new THREE.BoxGeometry(9.2, 4.8, 0.28), charcoalMetalMat);
    rearWall.position.set(0, 2.35, 5.2);
    bridgeGroup.add(rearWall);

    const topRoofCap = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.30, 12.0), hullDarkSlateMat);
    topRoofCap.position.set(0, 4.55, 1.2);
    bridgeGroup.add(topRoofCap);

    // Overhead structural ceiling beams across the bridge roof
    for (let z = -2.0; z <= 4.6; z += 1.1) {
      const roofBeam = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.14, 0.22), hullMidSlateMat);
      roofBeam.position.set(0, 4.35, z);
      bridgeGroup.add(roofBeam);
    }

    // =========================================================
    // D. LEFT-FRONT MAIN WORKSTATION WALL WITH LARGE WALL MONITOR ("JOULOMB INC")
    //    (Mounted directly on the left-front wall where the window used to be,
    //     right above the sloped console & keyboard! Zero overlap with the window!)
    // =========================================================
    const screenClickMeshes = [];

    const leftWorkstationWallGroup = new THREE.Group();
    leftWorkstationWallGroup.position.set(-1.58, 0, -1.28);
    leftWorkstationWallGroup.rotation.y = 0.46; // Faces the captain's chair & camera!
    bridgeGroup.add(leftWorkstationWallGroup);

    // Solid armored left-front bulkhead wall (extends full height to ceiling y = 4.65 and meets left wall!)
    const leftMainBulkhead = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 4.75, 0.24),
      hullLightSlateMat
    );
    leftMainBulkhead.position.set(-0.62, 2.35, 0);
    leftMainBulkhead.receiveShadow = true;
    leftWorkstationWallGroup.add(leftMainBulkhead);

    // Angled corner bulkhead seamlessly joining the right edge of the left-front wall to the back wall
    const cornerBulkhead = new THREE.Mesh(new THREE.BoxGeometry(0.55, 4.75, 0.82), hullMidSlateMat);
    cornerBulkhead.position.set(-0.42, 2.35, -2.14);
    cornerBulkhead.rotation.y = 0.22;
    cornerBulkhead.receiveShadow = true;
    bridgeGroup.add(cornerBulkhead);

    // Horizontal vent slot at top of the left-front wall (from sketch!)
    const upperVentFrame = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.14, 0.06), hullDarkSlateMat);
    upperVentFrame.position.set(-0.05, 2.78, 0.12);
    leftWorkstationWallGroup.add(upperVentFrame);
    for (let i = 0; i < 10; i++) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.07), counterCreamMat);
      fin.position.set(-0.53 + i * 0.11, 2.78, 0.12);
      leftWorkstationWallGroup.add(fin);
    }

    // Two round gauges on the left pillar of the left-front wall (exact detail from sketch!)
    [2.32, 2.08].forEach((gy) => {
      const gaugeRim = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.05, 20), hullDarkSlateMat);
      gaugeRim.rotation.x = Math.PI / 2;
      gaugeRim.position.set(-1.15, gy, 0.12);
      leftWorkstationWallGroup.add(gaugeRim);

      const gaugeFace = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.055, 20), counterCreamMat);
      gaugeFace.rotation.x = Math.PI / 2;
      gaugeFace.position.set(-1.15, gy, 0.12);
      leftWorkstationWallGroup.add(gaugeFace);
    });

    // LARGE WALL-MOUNTED WEBSITE MONITOR ("JOULOMB INC") ON THE LEFT-FRONT WALL
    const mainMonitorGroup = new THREE.Group();
    mainMonitorGroup.position.set(0.02, 2.04, 0.12);
    leftWorkstationWallGroup.add(mainMonitorGroup);

    // Heavy beveled industrial steel wall monitor frame
    const wallMonitorOuterBezel = new THREE.Mesh(
      new RoundedBoxGeometry(1.78, 1.08, 0.14, 4, 0.04),
      hullDarkSlateMat
    );
    wallMonitorOuterBezel.castShadow = true;
    wallMonitorOuterBezel.receiveShadow = true;
    mainMonitorGroup.add(wallMonitorOuterBezel);

    // Inner light-slate monitor housing trim
    const wallMonitorInnerBezel = new THREE.Mesh(
      new RoundedBoxGeometry(1.66, 0.96, 0.15, 4, 0.03),
      hullLightSlateMat
    );
    wallMonitorInnerBezel.position.set(0, 0, 0.01);
    mainMonitorGroup.add(wallMonitorInnerBezel);

    // Recessed charcoal screen surround
    const wallMonitorRecess = new THREE.Mesh(
      new RoundedBoxGeometry(1.42, 0.84, 0.04, 3, 0.02),
      charcoalMetalMat
    );
    wallMonitorRecess.position.set(0, 0, 0.075);
    mainMonitorGroup.add(wallMonitorRecess);

    // Tactile illuminated push-buttons along the left & right bezel of the Wall Monitor
    [-0.76, 0.76].forEach((bx) => {
      for (let i = 0; i < 6; i++) {
        const btn = new THREE.Mesh(
          new THREE.BoxGeometry(0.055, 0.06, 0.03),
          i === 1 ? warmLightPanelMat : counterCreamMat
        );
        btn.position.set(bx, 0.28 - i * 0.11, 0.09);
        mainMonitorGroup.add(btn);
      }
    });

    // Interactive Wall Monitor Screen Mesh (Displays Microsoft Internet Explorer)
    const { texture: mainScreenTexture, canvas: mainScreenCanvas } = createMainMonitorTexture();
    const mainScreenMat = new THREE.MeshBasicMaterial({
      map: mainScreenTexture
    });
    const mainScreenMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.34, 0.78), mainScreenMat);
    mainScreenMesh.position.set(0, 0, 0.098);
    mainMonitorGroup.add(mainScreenMesh);
    screenClickMeshes.push(mainScreenMesh);

    // =========================================================
    // E. BACK BULKHEAD WALL WITH PANORAMIC SPACE GLASS WINDOW
    //    (Placed cleanly on the back wall behind the right console & chair
    //     so it NEVER overlaps with the Left-Front Monitor or Keyboard!)
    // =========================================================
    const backWindowWallGroup = new THREE.Group();
    backWindowWallGroup.position.set(0.62, 0, -2.32);
    bridgeGroup.add(backWindowWallGroup);

    // Panoramic Space Window Opening Dimensions (centered at local x = 0, y = 2.02)
    const winW = 1.86;
    const winH = 1.08;
    const winY = 2.02;

    // Lower back wall below the space window (extends all the way from corner to right wall)
    const backWallBelow = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.48, 0.24), hullLightSlateMat);
    backWallBelow.position.set(0.85, 0.74, 0);
    backWallBelow.receiveShadow = true;
    backWindowWallGroup.add(backWallBelow);

    // Upper back wall header above the space window (extends all the way up to the ceiling y = 4.65)
    const backWallAbove = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.15, 0.24), hullLightSlateMat);
    backWallAbove.position.set(0.85, 3.63, 0);
    backWallAbove.receiveShadow = true;
    backWindowWallGroup.add(backWallAbove);

    // Left back wall section (between corner bulkhead and space window)
    const backWallLeft = new THREE.Mesh(new THREE.BoxGeometry(0.85, winH + 0.14, 0.24), hullLightSlateMat);
    backWallLeft.position.set(-1.35, winY, 0);
    backWallLeft.receiveShadow = true;
    backWindowWallGroup.add(backWallLeft);

    // Right back wall section (from right edge of space window all the way to the right wall)
    const backWallRight = new THREE.Mesh(new THREE.BoxGeometry(2.45, winH + 0.14, 0.24), hullLightSlateMat);
    backWallRight.position.set(2.15, winY, 0);
    backWallRight.receiveShadow = true;
    backWindowWallGroup.add(backWallRight);

    // Structural vertical pilasters along the back wall
    [-1.02, 1.02, 2.05].forEach((px) => {
      const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.11, 4.65, 0.16), hullMidSlateMat);
      pilaster.position.set(px, 2.32, 0.08);
      pilaster.castShadow = true;
      pilaster.receiveShadow = true;
      backWindowWallGroup.add(pilaster);
    });

    // Heavy Beveled Industrial Space Window Frame on the Back Wall
    const frameTop = new THREE.Mesh(new RoundedBoxGeometry(winW + 0.24, 0.11, 0.30, 3, 0.03), hullDarkSlateMat);
    frameTop.position.set(0, winY + winH / 2 + 0.03, 0.04);
    backWindowWallGroup.add(frameTop);

    const frameBot = new THREE.Mesh(new RoundedBoxGeometry(winW + 0.24, 0.11, 0.30, 3, 0.03), hullDarkSlateMat);
    frameBot.position.set(0, winY - winH / 2 - 0.03, 0.04);
    backWindowWallGroup.add(frameBot);

    const frameLeft = new THREE.Mesh(new RoundedBoxGeometry(0.11, winH + 0.18, 0.30, 3, 0.03), hullDarkSlateMat);
    frameLeft.position.set(-winW / 2 - 0.03, winY, 0.04);
    backWindowWallGroup.add(frameLeft);

    const frameRight = new THREE.Mesh(new RoundedBoxGeometry(0.11, winH + 0.18, 0.30, 3, 0.03), hullDarkSlateMat);
    frameRight.position.set(winW / 2 + 0.03, winY, 0.04);
    backWindowWallGroup.add(frameRight);

    // Inner light-slate window bevel trim
    const innerTrimTop = new THREE.Mesh(new THREE.BoxGeometry(winW, 0.04, 0.26), counterCreamMat);
    innerTrimTop.position.set(0, winY + winH / 2 - 0.01, 0.05);
    backWindowWallGroup.add(innerTrimTop);

    const innerTrimBot = new THREE.Mesh(new THREE.BoxGeometry(winW, 0.04, 0.26), counterCreamMat);
    innerTrimBot.position.set(0, winY - winH / 2 + 0.01, 0.05);
    backWindowWallGroup.add(innerTrimBot);

    // Spacecraft Armored Glass Pane with diagonal glass reflections
    const glassCanvas = document.createElement('canvas');
    glassCanvas.width = 512;
    glassCanvas.height = 256;
    const gCtx = glassCanvas.getContext('2d');
    gCtx.clearRect(0, 0, 512, 256);

    const sheenGrad = gCtx.createLinearGradient(0, 0, 512, 256);
    sheenGrad.addColorStop(0, 'rgba(186, 230, 253, 0.10)');
    sheenGrad.addColorStop(0.28, 'rgba(255, 255, 255, 0.16)');
    sheenGrad.addColorStop(0.34, 'rgba(186, 230, 253, 0.02)');
    sheenGrad.addColorStop(0.72, 'rgba(56, 189, 248, 0.08)');
    sheenGrad.addColorStop(1, 'rgba(186, 230, 253, 0.03)');
    gCtx.fillStyle = sheenGrad;
    gCtx.fillRect(0, 0, 512, 256);

    gCtx.strokeStyle = 'rgba(186, 230, 253, 0.32)';
    gCtx.lineWidth = 2;
    gCtx.strokeRect(14, 14, 484, 228);

    const glassTex = new THREE.CanvasTexture(glassCanvas);
    glassTex.colorSpace = THREE.SRGBColorSpace;

    const viewportGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(winW, winH),
      new THREE.MeshBasicMaterial({
        map: glassTex,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      })
    );
    viewportGlass.position.set(0, winY, 0.08);
    backWindowWallGroup.add(viewportGlass);

    // DEEP SPACE HEMISPHERE DOME STRICTLY BEHIND THE BACK WINDOW WALL
    // Uses a true spherical hemisphere (phiStart = Math.PI, phiLength = Math.PI => local z <= 0)
    // flush behind the back wall (world z <= -2.36) so there are ZERO box corners/edges and ZERO room clipping!
    const spaceBoxGroup = new THREE.Group();
    spaceBoxGroup.position.set(0, winY, -0.08);
    backWindowWallGroup.add(spaceBoxGroup);

    const nebulaCanvas = document.createElement('canvas');
    nebulaCanvas.width = 2048;
    nebulaCanvas.height = 1024;
    const nCtx = nebulaCanvas.getContext('2d');

    // Deep pitch-black cosmic void gradient
    const voidGrad = nCtx.createLinearGradient(0, 0, 0, 1024);
    voidGrad.addColorStop(0, '#000103');
    voidGrad.addColorStop(0.5, '#010308');
    voidGrad.addColorStop(1, '#000103');
    nCtx.fillStyle = voidGrad;
    nCtx.fillRect(0, 0, 2048, 1024);

    // Subtle Milky Way / cosmic dust glow across deep space
    const neb1 = nCtx.createRadialGradient(880, 480, 40, 880, 480, 680);
    neb1.addColorStop(0, 'rgba(14, 165, 233, 0.14)');
    neb1.addColorStop(0.45, 'rgba(30, 58, 138, 0.08)');
    neb1.addColorStop(1, 'rgba(0, 1, 3, 0)');
    nCtx.fillStyle = neb1;
    nCtx.fillRect(0, 0, 2048, 1024);

    const neb2 = nCtx.createRadialGradient(1320, 440, 30, 1320, 440, 540);
    neb2.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
    neb2.addColorStop(0.55, 'rgba(56, 189, 248, 0.05)');
    neb2.addColorStop(1, 'rgba(0, 1, 3, 0)');
    nCtx.fillStyle = neb2;
    nCtx.fillRect(0, 0, 2048, 1024);

    // 2,000 pinpoint background stars across the seamless spherical sky dome
    for (let i = 0; i < 2000; i++) {
      const sx = (i * 397) % 2048;
      const sy = (i * 223) % 1024;
      const r = i % 19 === 0 ? 1.8 : i % 7 === 0 ? 1.2 : 0.75;
      nCtx.fillStyle =
        i % 11 === 0
          ? '#fde68a'
          : i % 5 === 0
            ? '#bae6fd'
            : i % 9 === 0
              ? '#e0e7ff'
              : 'rgba(255,255,255,0.85)';
      nCtx.beginPath();
      nCtx.arc(sx, sy, r, 0, Math.PI * 2);
      nCtx.fill();
    }

    const nebulaTex = new THREE.CanvasTexture(nebulaCanvas);
    nebulaTex.colorSpace = THREE.SRGBColorSpace;

    // Seamless spherical hemisphere dome strictly behind the back wall (local z <= 0, zero corners!)
    const spaceBackdrop = new THREE.Mesh(
      new THREE.SphereGeometry(3.8, 64, 48, Math.PI, Math.PI, 0, Math.PI),
      new THREE.MeshBasicMaterial({ map: nebulaTex, side: THREE.BackSide })
    );
    spaceBoxGroup.add(spaceBackdrop);

    const starsGroup = new THREE.Group();
    spaceBoxGroup.add(starsGroup);

    // 1,800 3D depth stars distributed inside the hemisphere strictly behind the window wall (z <= -0.25)
    const starCount = 1800;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2;
      const phi = Math.acos(2 * v - 1);
      const rad = 1.05 + Math.random() * 2.45;
      const sx = rad * Math.sin(phi) * Math.cos(theta);
      const sy = rad * Math.sin(phi) * Math.sin(theta);
      // Force z strictly negative (-0.25 to -3.5) so rotating starsGroup.rotation.z NEVER crosses z = 0!
      const sz = -0.25 - Math.abs(rad * Math.cos(phi));

      starPositions[i * 3] = sx;
      starPositions[i * 3 + 1] = sy;
      starPositions[i * 3 + 2] = sz;

      const palette = [
        new THREE.Color(0xffffff),
        new THREE.Color(0xbae6fd),
        new THREE.Color(0xfde68a),
        new THREE.Color(0xe0e7ff)
      ];
      const c = palette[i % palette.length];
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.016,
      vertexColors: true,
      transparent: true,
      opacity: 0.95
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    starsGroup.add(starPoints);

    // Rotating 3D Planet Earth & Companion Moon framed outside the spacecraft window
    const planetGroup = new THREE.Group();
    planetGroup.position.set(-0.08, 0.02, -1.08);
    planetGroup.rotation.z = 0.41; // Earth's 23.5° axial tilt!
    spaceBoxGroup.add(planetGroup);

    const planetMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 64, 64),
      new THREE.MeshStandardMaterial({
        map: createPlanetTexture(),
        roughness: 0.42,
        metalness: 0.08
      })
    );
    planetGroup.add(planetMesh);

    // Earth's glowing blue atmospheric limb halo
    const planetHalo = new THREE.Mesh(
      new THREE.SphereGeometry(0.408, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.24,
        side: THREE.BackSide
      })
    );
    planetGroup.add(planetHalo);

    const moonMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.82 })
    );
    moonMesh.position.set(0.54, 0.20, -1.05);
    spaceBoxGroup.add(moonMesh);

    const planetSunLight = new THREE.DirectionalLight(0xfffbeb, 2.6);
    planetSunLight.position.set(2.8, 2.5, 1.2);
    spaceBoxGroup.add(planetSunLight);

    // =========================================================
    // F. SLOPED OVERHEAD CEILING BULKHEADS, WARM RIBBED LIGHT PANELS,
    //    AND 4 ANGLED OVERHEAD DIAGNOSTIC PODS (Matching the Sketch!)
    // =========================================================
    // 1. Sloped Ceiling Bank above the Left-Front Workstation Wall
    const leftSlopedCeiling = new THREE.Group();
    leftSlopedCeiling.position.set(-1.32, 3.25, -1.05);
    leftSlopedCeiling.rotation.y = 0.46;
    leftSlopedCeiling.rotation.x = 0.62;
    bridgeGroup.add(leftSlopedCeiling);

    const ceilingBacking = new THREE.Mesh(new THREE.BoxGeometry(2.9, 1.15, 0.12), hullDarkSlateMat);
    leftSlopedCeiling.add(ceilingBacking);

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const panelX = -0.32 + col * 0.68;
        const panelY = -0.25 + row * 0.48;
        const lightFrame = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.38, 0.06), charcoalMetalMat);
        lightFrame.position.set(panelX, panelY, 0.06);
        leftSlopedCeiling.add(lightFrame);

        const lightFace = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.32), warmLightPanelMat);
        lightFace.position.set(panelX, panelY, 0.095);
        leftSlopedCeiling.add(lightFace);
      }
    }

    [-1.08, -0.98].forEach((cx, idx) => {
      const ohMon = new THREE.Mesh(
        new RoundedBoxGeometry(0.38, 0.30, 0.24, 3, 0.03),
        hullLightSlateMat
      );
      ohMon.position.set(cx, -0.24 + idx * 0.44, 0.14);
      ohMon.rotation.y = 0.22;
      leftSlopedCeiling.add(ohMon);

      const ohScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.30, 0.22),
        new THREE.MeshBasicMaterial({ map: createCRTTelemetryTexture(idx + 2) })
      );
      ohScreen.position.set(cx, -0.24 + idx * 0.44, 0.265);
      ohScreen.rotation.y = 0.22;
      leftSlopedCeiling.add(ohScreen);
    });

    // 2. Row of 4 Angled Overhead Instrument Pods above the Back Space Window!
    const overheadPodsGroup = new THREE.Group();
    overheadPodsGroup.position.set(0.38, 2.84, -2.06);
    overheadPodsGroup.rotation.z = 0.08;
    overheadPodsGroup.rotation.x = 0.38;
    bridgeGroup.add(overheadPodsGroup);

    const podBeam = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.16, 0.28), hullDarkSlateMat);
    overheadPodsGroup.add(podBeam);

    for (let i = 0; i < 4; i++) {
      const px = -0.48 + i * 0.32;
      const podBox = new THREE.Mesh(
        new RoundedBoxGeometry(0.28, 0.32, 0.24, 3, 0.025),
        counterCreamMat
      );
      podBox.position.set(px, 0, 0.12);
      podBox.castShadow = true;
      overheadPodsGroup.add(podBox);

      const podSlot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.02), charcoalMetalMat);
      podSlot.position.set(px, 0.06, 0.24);
      overheadPodsGroup.add(podSlot);

      for (let b = 0; b < 3; b++) {
        const dot = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.02), hullDarkSlateMat);
        dot.position.set(px - 0.05 + b * 0.05, -0.05, 0.24);
        overheadPodsGroup.add(dot);
      }
    }

    // 3. Upper-Right Sloped Ceiling Bulkhead & Overhead Radio/Scope Unit
    const rightSlopedCeiling = new THREE.Group();
    rightSlopedCeiling.position.set(1.62, 3.18, -2.05);
    rightSlopedCeiling.rotation.x = 0.52;
    bridgeGroup.add(rightSlopedCeiling);

    const rightCeilingPlate = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.95, 0.14), hullMidSlateMat);
    rightSlopedCeiling.add(rightCeilingPlate);

    const radioBox = new THREE.Mesh(
      new RoundedBoxGeometry(0.76, 0.32, 0.26, 3, 0.025),
      hullLightSlateMat
    );
    radioBox.position.set(0.08, -0.05, 0.14);
    rightSlopedCeiling.add(radioBox);

    const radioScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.28, 0.20),
      new THREE.MeshBasicMaterial({ map: createCRTTelemetryTexture(1) })
    );
    radioScreen.position.set(-0.12, -0.05, 0.275);
    rightSlopedCeiling.add(radioScreen);

    const radioGrille = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.02), charcoalMetalMat);
    radioGrille.position.set(0.24, 0.0, 0.27);
    rightSlopedCeiling.add(radioGrille);

    for (let k = 0; k < 5; k++) {
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 12), hullDarkSlateMat);
      knob.rotation.x = Math.PI / 2;
      knob.position.set(0.10 + k * 0.065, -0.10, 0.275);
      rightSlopedCeiling.add(knob);
    }

    // =========================================================
    // G. FAR-RIGHT BACK WALL EQUIPMENT RACKS, DUAL SPEAKERS & SIDE CRT
    // =========================================================
    const rightWallRackGroup = new THREE.Group();
    rightWallRackGroup.position.set(2.24, 1.92, -2.18);
    bridgeGroup.add(rightWallRackGroup);

    for (let i = 0; i < 3; i++) {
      const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.08), counterCreamMat);
      drawer.position.set(0.08, 0.46 - i * 0.15, 0.02);
      rightWallRackGroup.add(drawer);

      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.03, 0.09), charcoalMetalMat);
      slot.position.set(0.08, 0.46 - i * 0.15, 0.02);
      rightWallRackGroup.add(slot);
    }

    const speakerBox = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.38, 0.08), counterCreamMat);
    speakerBox.position.set(-0.28, -0.02, 0.02);
    rightWallRackGroup.add(speakerBox);
    [0.08, -0.10].forEach((sy) => {
      const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.09, 20), charcoalMetalMat);
      cone.rotation.x = Math.PI / 2;
      cone.position.set(-0.28, sy, 0.02);
      rightWallRackGroup.add(cone);
    });

    const rightCRTBezel = new THREE.Mesh(
      new RoundedBoxGeometry(0.46, 0.36, 0.10, 4, 0.03),
      hullLightSlateMat
    );
    rightCRTBezel.position.set(0.10, -0.05, 0.03);
    rightWallRackGroup.add(rightCRTBezel);

    const rightCRTScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.38, 0.28),
      new THREE.MeshBasicMaterial({ map: createCRTTelemetryTexture(4) })
    );
    rightCRTScreen.position.set(0.10, -0.05, 0.082);
    rightWallRackGroup.add(rightCRTScreen);

    // =========================================================
    // H. LEFT SIDE WALL, RIGHT SIDE WALL & REAR AIRLOCK BULKHEAD
    //    (Positioned cleanly along the outer perimeter so they NEVER block
    //     the Left-Front Wall Monitor, while making 360° room rotation rich!)
    // =========================================================
    const farLeftWallGroup = new THREE.Group();
    farLeftWallGroup.position.set(-3.32, 0, 2.0);
    farLeftWallGroup.rotation.y = Math.PI / 2; // Sealed flush with left edge of Left-Front Wall & Rear Wall!
    bridgeGroup.add(farLeftWallGroup);

    const farLeftWallPanel = new THREE.Mesh(new THREE.BoxGeometry(7.2, 4.75, 0.24), hullMidSlateMat);
    farLeftWallPanel.position.set(0, 2.35, 0);
    farLeftWallGroup.add(farLeftWallPanel);

    const leftWallCRT = new THREE.Mesh(
      new RoundedBoxGeometry(0.52, 0.40, 0.12, 4, 0.03),
      counterCreamMat
    );
    leftWallCRT.position.set(0.15, 2.02, 0.12);
    farLeftWallGroup.add(leftWallCRT);

    const leftWallScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.30),
      new THREE.MeshBasicMaterial({ map: createCRTTelemetryTexture(3) })
    );
    leftWallScreen.position.set(0.15, 2.02, 0.185);
    farLeftWallGroup.add(leftWallScreen);

    for (let i = 0; i < 12; i++) {
      const cassette = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.26, 0.08), counterCreamMat);
      cassette.position.set(-0.65 + i * 0.065, 1.65, 0.12);
      farLeftWallGroup.add(cassette);
    }

    for (let tier = 0; tier < 3; tier++) {
      const tierBar = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.14, 0.22), hullLightSlateMat);
      tierBar.position.set(-0.25, 1.18 - tier * 0.22, 0.20 + tier * 0.12);
      tierBar.rotation.x = -0.45;
      farLeftWallGroup.add(tierBar);

      for (let b = 0; b < 8; b++) {
        const keyCap = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.05), counterCreamMat);
        keyCap.position.set(-0.58 + b * 0.095, 1.22 - tier * 0.22, 0.28 + tier * 0.12);
        keyCap.rotation.x = -0.45;
        farLeftWallGroup.add(keyCap);
      }
    }

    // Rear Bulkhead Airlock Door & Crew Lockers (Visible when rotating 180° behind you!)
    const rearBulkheadGroup = new THREE.Group();
    rearBulkheadGroup.position.set(0, 0, 4.95);
    rearBulkheadGroup.rotation.y = Math.PI;
    bridgeGroup.add(rearBulkheadGroup);

    const rearMainWall = new THREE.Mesh(new THREE.BoxGeometry(7.2, 4.75, 0.24), hullMidSlateMat);
    rearMainWall.position.set(0, 2.35, 0);
    rearMainWall.receiveShadow = true;
    rearBulkheadGroup.add(rearMainWall);

    // Octagonal Industrial Spacecraft Airlock Door in center of Rear Wall
    const airlockFrame = new THREE.Mesh(
      new RoundedBoxGeometry(1.45, 2.35, 0.18, 4, 0.05),
      hullDarkSlateMat
    );
    airlockFrame.position.set(0, 1.22, 0.08);
    rearBulkheadGroup.add(airlockFrame);

    const airlockDoor = new THREE.Mesh(
      new RoundedBoxGeometry(1.22, 2.15, 0.14, 4, 0.04),
      hullLightSlateMat
    );
    airlockDoor.position.set(0, 1.22, 0.11);
    rearBulkheadGroup.add(airlockDoor);

    const airlockWindow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 0.28),
      new THREE.MeshBasicMaterial({ map: createCRTTelemetryTexture(0) })
    );
    airlockWindow.position.set(0, 1.68, 0.185);
    rearBulkheadGroup.add(airlockWindow);

    // Crew Storage Lockers flanking the Airlock Door
    [-1.55, 1.55].forEach((lx) => {
      const lockerBank = new THREE.Mesh(
        new RoundedBoxGeometry(1.10, 2.10, 0.22, 3, 0.03),
        counterCreamMat
      );
      lockerBank.position.set(lx, 1.18, 0.12);
      rearBulkheadGroup.add(lockerBank);

      const lockerGrid = new THREE.Mesh(
        new THREE.PlaneGeometry(0.92, 1.85),
        new THREE.MeshStandardMaterial({ map: createIndustrialPanelTexture(0), roughness: 0.45 })
      );
      lockerGrid.position.set(lx, 1.18, 0.235);
      rearBulkheadGroup.add(lockerGrid);
    });

    // Right Wall Industrial Gridded Panels & Telemetry Screen (Visible when rotating right!)
    const rightSideDetailGroup = new THREE.Group();
    rightSideDetailGroup.position.set(3.28, 0, 0.25);
    rightSideDetailGroup.rotation.y = -Math.PI / 2;
    bridgeGroup.add(rightSideDetailGroup);

    const rightGriddedPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(1.45, 1.25),
      new THREE.MeshStandardMaterial({ map: createIndustrialPanelTexture(0), roughness: 0.42 })
    );
    rightGriddedPanel.position.set(0, 1.92, 0.02);
    rightSideDetailGroup.add(rightGriddedPanel);

    const rightSideSwitchPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(0.65, 1.25),
      new THREE.MeshStandardMaterial({ map: createIndustrialPanelTexture(1), roughness: 0.45 })
    );
    rightSideSwitchPanel.position.set(1.18, 1.92, 0.02);
    rightSideDetailGroup.add(rightSideSwitchPanel);

    // =========================================================
    // I. WRAP-AROUND L-SHAPED COCKPIT CONSOLE DESK WITH KEYBOARD & MOUSE
    //    (Left Wing sits directly below the Left-Front Wall Monitor!)
    // =========================================================
    const consoleDeskGroup = new THREE.Group();
    bridgeGroup.add(consoleDeskGroup);

    // 1. Left-Front Main Workstation Wing (Directly beneath the Wall Monitor!)
    const leftWingGroup = new THREE.Group();
    leftWingGroup.position.set(-1.18, 0, -0.78);
    leftWingGroup.rotation.y = 0.46;
    consoleDeskGroup.add(leftWingGroup);

    const leftBaseCab = new THREE.Mesh(new THREE.BoxGeometry(2.35, 1.04, 0.92), abyssalBlackMat);
    leftBaseCab.position.set(0, 0.52, -0.10);
    leftBaseCab.castShadow = true;
    leftBaseCab.receiveShadow = true;
    leftWingGroup.add(leftBaseCab);

    const leftCounterTop = new THREE.Mesh(
      new RoundedBoxGeometry(2.45, 0.11, 1.18, 3, 0.02),
      counterCreamMat
    );
    leftCounterTop.position.set(0, 1.08, 0);
    leftCounterTop.castShadow = true;
    leftCounterTop.receiveShadow = true;
    leftWingGroup.add(leftCounterTop);

    // Sloped Industrial Switchboard Console directly below the Wall Monitor
    const slopedSwitchHousing = new THREE.Mesh(
      new RoundedBoxGeometry(1.92, 0.34, 0.42, 3, 0.025),
      hullLightSlateMat
    );
    slopedSwitchHousing.position.set(0.02, 1.26, -0.36);
    slopedSwitchHousing.rotation.x = 0.48;
    slopedSwitchHousing.castShadow = true;
    leftWingGroup.add(slopedSwitchHousing);

    const slopedSwitchFace = new THREE.Mesh(
      new THREE.PlaneGeometry(1.82, 0.30),
      new THREE.MeshStandardMaterial({ map: createIndustrialPanelTexture(2), roughness: 0.42 })
    );
    slopedSwitchFace.position.set(0.02, 1.28, -0.15);
    slopedSwitchFace.rotation.x = -1.08;
    leftWingGroup.add(slopedSwitchFace);

    for (let i = 0; i < 12; i++) {
      const sw = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.04, 0.05),
        i % 3 === 0 ? charcoalMetalMat : counterCreamMat
      );
      sw.position.set(-0.76 + i * 0.14, 1.35, -0.25);
      sw.rotation.x = 0.48;
      leftWingGroup.add(sw);
    }

    // TACTILE MECHANICAL KEYBOARD & MOUSE ON THE LEFT-FRONT DESK (Directly below the Wall Monitor!)
    const keyboardGroup = new THREE.Group();
    keyboardGroup.position.set(0.06, 1.15, 0.16);
    leftWingGroup.add(keyboardGroup);

    const kbBody = new THREE.Mesh(
      new RoundedBoxGeometry(0.64, 0.04, 0.24, 3, 0.01),
      hullDarkSlateMat
    );
    kbBody.castShadow = true;
    keyboardGroup.add(kbBody);

    // 4 rows of sculpted mechanical keycaps
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 13; c++) {
        const keyCap = new THREE.Mesh(
          new THREE.BoxGeometry(0.036, 0.018, 0.036),
          (r === 0 && c === 0) || (r === 2 && c === 12) ? warmLightPanelMat : counterCreamMat
        );
        keyCap.position.set(-0.27 + c * 0.045, 0.024, -0.075 + r * 0.048);
        keyboardGroup.add(keyCap);
      }
    }

    // Spacebar
    const spacebar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.018, 0.036), counterCreamMat);
    spacebar.position.set(0.0, 0.024, 0.095);
    keyboardGroup.add(spacebar);

    // Industrial Mouse & Mousepad next to the Keyboard
    const mousePad = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.008, 0.24), charcoalMetalMat);
    mousePad.position.set(0.48, 0.004, 0.0);
    keyboardGroup.add(mousePad);

    const mouseMesh = new THREE.Mesh(
      new RoundedBoxGeometry(0.085, 0.036, 0.13, 3, 0.015),
      counterCreamMat
    );
    mouseMesh.position.set(0.48, 0.022, 0.0);
    mouseMesh.castShadow = true;
    keyboardGroup.add(mouseMesh);

    // Small Beveled Hexagonal Module on the far-left of the counter (from sketch!)
    const hexDeskModule = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.15, 0.19, 6),
      hullMidSlateMat
    );
    hexDeskModule.position.set(-0.68, 1.22, 0.22);
    hexDeskModule.rotation.y = 0.4;
    hexDeskModule.castShadow = true;
    leftWingGroup.add(hexDeskModule);

    // 2. Back-Right Wing of the L-Shaped Console Desk (Directly below the Back Space Window!)
    const backCounterBase = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.04, 0.90), abyssalBlackMat);
    backCounterBase.position.set(0.75, 0.52, -1.85);
    backCounterBase.receiveShadow = true;
    consoleDeskGroup.add(backCounterBase);

    const backCounterTop = new THREE.Mesh(
      new RoundedBoxGeometry(3.65, 0.11, 1.12, 3, 0.02),
      counterCreamMat
    );
    backCounterTop.position.set(0.72, 1.08, -1.72);
    backCounterTop.castShadow = true;
    backCounterTop.receiveShadow = true;
    consoleDeskGroup.add(backCounterTop);

    // 3. Foreground Bottom-Left Desk Return with Retro Corded Comms Handset
    const fgLedgeTop = new THREE.Mesh(
      new RoundedBoxGeometry(1.55, 0.10, 0.72, 3, 0.02),
      counterCreamMat
    );
    fgLedgeTop.position.set(-0.82, 0.92, 0.68);
    fgLedgeTop.rotation.y = -0.18;
    fgLedgeTop.receiveShadow = true;
    consoleDeskGroup.add(fgLedgeTop);

    const phoneCradle = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.14), charcoalMetalMat);
    phoneCradle.position.set(-0.68, 0.99, 0.62);
    phoneCradle.rotation.y = -0.12;
    consoleDeskGroup.add(phoneCradle);

    const phoneHandset = new THREE.Mesh(
      new RoundedBoxGeometry(0.30, 0.055, 0.08, 3, 0.02),
      abyssalBlackMat
    );
    phoneHandset.position.set(-0.68, 1.04, 0.62);
    phoneHandset.rotation.y = -0.12;
    consoleDeskGroup.add(phoneHandset);

    // =========================================================
    // ARTIFICIAL GRAVITY SWITCH (on the back console, left of the photo album)
    // Click to flip — everything loose in the cabin starts floating!
    // =========================================================
    const gravitySwitchClickMeshes = [];
    const gravitySwitchGroup = new THREE.Group();
    gravitySwitchGroup.position.set(-0.3, 1.135, -1.5);
    gravitySwitchGroup.rotation.y = 0.3;
    consoleDeskGroup.add(gravitySwitchGroup);

    const switchBox = new THREE.Mesh(
      new RoundedBoxGeometry(0.3, 0.06, 0.28, 3, 0.012),
      charcoalMetalMat
    );
    switchBox.position.set(0, 0.03, 0);
    switchBox.castShadow = true;
    gravitySwitchGroup.add(switchBox);
    gravitySwitchClickMeshes.push(switchBox);

    const gravitySwitchPlateMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.28, 0.26),
      new THREE.MeshStandardMaterial({
        map: createGravitySwitchPlateTexture(false),
        roughness: 0.4,
        metalness: 0.2
      })
    );
    gravitySwitchPlateMesh.rotation.x = -Math.PI / 2;
    gravitySwitchPlateMesh.position.set(0, 0.061, 0);
    gravitySwitchGroup.add(gravitySwitchPlateMesh);
    gravitySwitchClickMeshes.push(gravitySwitchPlateMesh);

    const switchCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.042, 0.02, 18),
      hullLightSlateMat
    );
    switchCollar.position.set(0, 0.07, 0.01);
    gravitySwitchGroup.add(switchCollar);

    // Lever pivots forward (gravity ON) / backward (gravity OFF)
    const switchLeverPivot = new THREE.Group();
    switchLeverPivot.position.set(0, 0.075, 0.01);
    switchLeverPivot.rotation.x = 0.55;
    gravitySwitchGroup.add(switchLeverPivot);

    const switchShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.009, 0.012, 0.12, 14),
      counterCreamMat
    );
    switchShaft.position.set(0, 0.06, 0);
    switchLeverPivot.add(switchShaft);
    gravitySwitchClickMeshes.push(switchShaft);

    const switchKnob = new THREE.Mesh(
      new THREE.SphereGeometry(0.024, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: new THREE.Color(0x7f1d1d),
        emissiveIntensity: 0.6,
        roughness: 0.25,
        metalness: 0.4
      })
    );
    switchKnob.position.set(0, 0.12, 0);
    switchKnob.castShadow = true;
    switchLeverPivot.add(switchKnob);
    gravitySwitchClickMeshes.push(switchKnob);

    const switchStatusLight = new THREE.PointLight(0x10b981, 1.0, 1.2);
    switchStatusLight.position.set(0, 0.18, 0);
    gravitySwitchGroup.add(switchStatusLight);

    // =========================================================
    // LOOSE DESK PROPS (they float when gravity is turned off)
    // =========================================================
    // Coffee mug + droplets that appear in zero-G
    const coffeeMugGroup = new THREE.Group();
    coffeeMugGroup.position.set(0.95, 1.135, -1.3);
    consoleDeskGroup.add(coffeeMugGroup);

    const mugBody = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.046, 0.11, 20), counterCreamMat);
    mugBody.position.set(0, 0.055, 0);
    mugBody.castShadow = true;
    coffeeMugGroup.add(mugBody);

    const coffeeLiquid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.044, 0.044, 0.01, 16),
      new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.15 })
    );
    coffeeLiquid.position.set(0, 0.1, 0);
    coffeeMugGroup.add(coffeeLiquid);

    const mugHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.03, 0.01, 10, 16, Math.PI),
      counterCreamMat
    );
    mugHandle.position.set(0.05, 0.055, 0);
    mugHandle.rotation.z = -Math.PI / 2;
    coffeeMugGroup.add(mugHandle);

    const coffeeDropMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.1, metalness: 0.2 });
    const coffeeDrops = [
      { r: 0.014, offX: 0.02, offY: 0.17, offZ: 0.03 },
      { r: 0.019, offX: -0.03, offY: 0.25, offZ: -0.02 },
      { r: 0.012, offX: 0.04, offY: 0.33, offZ: -0.03 },
      { r: 0.016, offX: -0.02, offY: 0.42, offZ: 0.02 }
    ].map((d, idx) => {
      const drop = new THREE.Mesh(new THREE.SphereGeometry(d.r, 12, 12), coffeeDropMat);
      drop.position.set(d.offX, d.offY, d.offZ);
      drop.scale.setScalar(0.001);
      drop.userData = { ...d, seed: idx * 1.7 };
      coffeeMugGroup.add(drop);
      return drop;
    });

    // Space pen
    const penGroup = new THREE.Group();
    penGroup.position.set(-0.62, 1.145, -1.42);
    consoleDeskGroup.add(penGroup);
    const penShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.007, 0.007, 0.17, 12),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 })
    );
    penShaft.rotation.z = Math.PI / 2;
    penShaft.castShadow = true;
    penGroup.add(penShaft);
    penGroup.rotation.y = 0.45;

    // Flight clipboard
    const clipboardGroup = new THREE.Group();
    clipboardGroup.position.set(1.95, 1.14, -1.6);
    clipboardGroup.rotation.y = -0.35;
    consoleDeskGroup.add(clipboardGroup);
    const clipBoard = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.012, 0.32, 2, 0.005), charcoalMetalMat);
    clipBoard.castShadow = true;
    clipboardGroup.add(clipBoard);
    const clipPaper = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 0.27),
      new THREE.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.75 })
    );
    clipPaper.rotation.x = -Math.PI / 2;
    clipPaper.position.y = 0.007;
    clipboardGroup.add(clipPaper);

    // Drifting dust motes (only visible in zero-G)
    const dustCount = 60;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 5.0;
      dustPositions[i * 3 + 1] = 0.6 + Math.random() * 3.2;
      dustPositions[i * 3 + 2] = (Math.random() - 0.3) * 5.0;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.022,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    bridgeGroup.add(dustParticles);

    // INTERACTIVE PHYSICAL ADVENTURE PHOTO ALBUM SITTING ON THE DESK COUNTER
    // (Under the Space Window — Click to hinge open the 3D album & glide camera to the open pages!)
    const albumClickMeshes = [];
    const photoAlbumBaseX = 0.32;
    const photoAlbumOpenX = 0.48;
    const photoAlbumBaseY = 1.165;
    const photoAlbumGroup = new THREE.Group();
    photoAlbumGroup.position.set(photoAlbumBaseX, photoAlbumBaseY, -1.46);
    photoAlbumGroup.rotation.y = 0.24;
    consoleDeskGroup.add(photoAlbumGroup);

    const albumLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x7c2d12,
      roughness: 0.42,
      metalness: 0.12
    });
    const albumTopCoverMat = new THREE.MeshStandardMaterial({
      map: createAlbumCoverTexture(),
      roughness: 0.35,
      metalness: 0.08
    });
    const albumPagesMat = new THREE.MeshStandardMaterial({
      color: 0xfefce8,
      roughness: 0.7
    });

    // Lower leather & page block of the Adventure Album (resting on the desk)
    const albumBody = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.042, 0.36), [
      albumPagesMat,
      albumLeatherMat,
      albumPagesMat,
      albumLeatherMat,
      albumPagesMat,
      albumPagesMat
    ]);
    albumBody.position.set(0, 0.002, 0);
    albumBody.castShadow = true;
    albumBody.receiveShadow = true;
    photoAlbumGroup.add(albumBody);
    albumClickMeshes.push(albumBody);

    // Hinged Front Leather Cover Pivot along the left spine (x = -0.23, y = 0.023)
    // Smoothly swings open ~178 degrees to the left when the album is clicked!
    const albumCoverPivot = new THREE.Group();
    albumCoverPivot.position.set(-0.23, 0.023, 0);
    photoAlbumGroup.add(albumCoverPivot);

    const albumFrontCoverMesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.014, 0.36), [
      albumLeatherMat,
      albumLeatherMat,
      albumTopCoverMat,
      albumLeatherMat,
      albumLeatherMat,
      albumLeatherMat
    ]);
    albumFrontCoverMesh.position.set(0.23, 0.007, 0);
    albumFrontCoverMesh.castShadow = true;
    albumFrontCoverMesh.receiveShadow = true;
    albumCoverPivot.add(albumFrontCoverMesh);
    albumClickMeshes.push(albumFrontCoverMesh);

    // Gold binder rings along the left spine of the Photo Album
    const brassRingMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.28,
      metalness: 0.75
    });
    for (let s = 0; s < 7; s++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.0045, 8, 14), brassRingMat);
      ring.position.set(-0.23, 0.023, -0.12 + s * 0.04);
      photoAlbumGroup.add(ring);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INTERACTIVE 3D OPEN SCRAPBOOK PAGES (Left Page inside hinged cover + Right Page on base)
    // ─────────────────────────────────────────────────────────────────────────
    const leftPageCanvas = document.createElement('canvas');
    leftPageCanvas.width = 1024;
    leftPageCanvas.height = 800;
    const leftPageTexture = new THREE.CanvasTexture(leftPageCanvas);
    leftPageTexture.colorSpace = THREE.SRGBColorSpace;
    leftPageTexture.anisotropy = 8;

    const rightPageCanvas = document.createElement('canvas');
    rightPageCanvas.width = 1024;
    rightPageCanvas.height = 800;
    const rightPageTexture = new THREE.CanvasTexture(rightPageCanvas);
    rightPageTexture.colorSpace = THREE.SRGBColorSpace;
    rightPageTexture.anisotropy = 8;

    // Left Page Holder inside albumCoverPivot:
    // Because leftPageHolder has rotation.z = Math.PI, when albumCoverPivot opens to rotation.z = Math.PI,
    // the combined Z rotation is 2*Math.PI = 0, so leftPageMesh faces straight +Y up with upright UVs!
    const leftPageHolder = new THREE.Group();
    leftPageHolder.position.set(0.23, -0.001, 0);
    leftPageHolder.rotation.z = Math.PI;
    albumCoverPivot.add(leftPageHolder);

    const leftPageMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.436, 0.34),
      new THREE.MeshBasicMaterial({ map: leftPageTexture })
    );
    leftPageMesh.rotation.x = -Math.PI / 2;
    leftPageMesh.userData = { pageSide: 'left' };
    leftPageHolder.add(leftPageMesh);
    albumClickMeshes.push(leftPageMesh);

    const rightPageMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.436, 0.34),
      new THREE.MeshBasicMaterial({ map: rightPageTexture })
    );
    rightPageMesh.position.set(0.004, 0.024, 0);
    rightPageMesh.rotation.x = -Math.PI / 2;
    rightPageMesh.userData = { pageSide: 'right' };
    photoAlbumGroup.add(rightPageMesh);
    albumClickMeshes.push(rightPageMesh);

    // State for the interactive 3D Open Album pages
    let currentAlbumCategoryId = 'basin';
    let currentAlbumSpreadIdx = 0;
    let currentFeaturedPhotoIdx = 0;
    let hoveredAlbumControl = null;
    const loadedAlbumImages = {};

    const getActiveAlbumData = () =>
      ADVENTURE_ALBUMS.find((a) => a.id === currentAlbumCategoryId) ||
      ADVENTURE_ALBUMS.find((a) => (currentAlbumCategoryId === 'loveland' && a.id === 'basin')) ||
      ADVENTURE_ALBUMS[0];

    const getAlbumControlHitRegions = (side) => {
      const album = getActiveAlbumData();
      const totalSpreads = Math.max(1, Math.ceil(album.photos.length / 4));
      if (side === 'left') {
        return [
          { id: 'tab_basin', x: 48, y: 120, w: 440, h: 64 },
          { id: 'tab_camping', x: 506, y: 120, w: 470, h: 64 },
          { id: 'close_album', x: 780, y: 28, w: 196, h: 52 },
          { id: 'prev_photo', x: 110, y: 710, w: 220, h: 56 },
          { id: 'next_photo', x: 694, y: 710, w: 220, h: 56 }
        ];
      }
      // Right page: 2x2 Polaroid grid + Prev/Next Page spread buttons
      const regions = [
        { id: 'photo_slot_0', x: 56, y: 108, w: 432, h: 274 },
        { id: 'photo_slot_1', x: 536, y: 108, w: 432, h: 274 },
        { id: 'photo_slot_2', x: 56, y: 404, w: 432, h: 274 },
        { id: 'photo_slot_3', x: 536, y: 404, w: 432, h: 274 }
      ];
      if (totalSpreads > 1) {
        regions.push(
          { id: 'prev_spread', x: 56, y: 710, w: 250, h: 56 },
          { id: 'next_spread', x: 718, y: 710, w: 250, h: 56 }
        );
      }
      return regions;
    };

    const drawPolaroidImageCover = (ctx, img, x, y, w, h) => {
      if (!img || !img.complete || !img.naturalWidth) {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 20px "Tahoma", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Loading photo...', x + w / 2, y + h / 2);
        return;
      }
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const boxAspect = w / h;
      let sx = 0;
      let sy = 0;
      let sw = img.naturalWidth;
      let sh = img.naturalHeight;
      if (imgAspect > boxAspect) {
        sw = img.naturalHeight * boxAspect;
        sx = (img.naturalWidth - sw) / 2;
      } else {
        sh = img.naturalWidth / boxAspect;
        sy = (img.naturalHeight - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    };

    const redrawAlbumPages = () => {
      const album = getActiveAlbumData();
      const totalPhotos = album.photos.length;
      const totalSpreads = Math.max(1, Math.ceil(totalPhotos / 4));
      if (currentAlbumSpreadIdx >= totalSpreads) currentAlbumSpreadIdx = 0;
      if (currentFeaturedPhotoIdx >= totalPhotos) currentFeaturedPhotoIdx = 0;

      // ── 1. DRAW LEFT PAGE (Header, Tabs, Featured Polaroid Closeup, Photo Prev/Next) ──
      const lctx = leftPageCanvas.getContext('2d');
      lctx.fillStyle = '#fefce8';
      lctx.fillRect(0, 0, 1024, 800);

      // Subtle right-edge spine shadow on left page
      const leftSpineGrad = lctx.createLinearGradient(960, 0, 1024, 0);
      leftSpineGrad.addColorStop(0, 'rgba(120, 53, 15, 0)');
      leftSpineGrad.addColorStop(1, 'rgba(67, 20, 7, 0.28)');
      lctx.fillStyle = leftSpineGrad;
      lctx.fillRect(960, 0, 64, 800);

      // Stitched scrapbook border
      lctx.strokeStyle = 'rgba(146, 64, 14, 0.35)';
      lctx.lineWidth = 3;
      lctx.setLineDash([10, 8]);
      lctx.strokeRect(24, 20, 972, 760);
      lctx.setLineDash([]);

      // Album Header Title
      lctx.fillStyle = '#78350f';
      lctx.font = 'bold 20px "Courier New", monospace';
      lctx.textAlign = 'left';
      lctx.fillText('RAMY KASSAM // ADVENTURE PHOTO ALBUM', 48, 56);

      lctx.fillStyle = '#0f172a';
      lctx.font = 'bold 34px Georgia, serif';
      lctx.fillText(album.title, 48, 98);

      // Close Album button (top-right of left page)
      lctx.fillStyle = hoveredAlbumControl === 'close_album' ? '#991b1b' : '#1e293b';
      lctx.fillRect(780, 28, 196, 52);
      lctx.fillStyle = '#ffffff';
      lctx.font = 'bold 20px "Tahoma", sans-serif';
      lctx.textAlign = 'center';
      lctx.fillText('✕ Close Album', 878, 61);

      // Adventure Category Tabs
      const tabs = [
        { id: 'tab_basin', catId: 'basin', label: '⛷️ Basin Ski Trip (12)', x: 48, w: 440 },
        { id: 'tab_camping', catId: 'camping', label: '⛺ Backcountry Camping (4)', x: 506, w: 470 }
      ];
      tabs.forEach((t) => {
        const isCurrent = currentAlbumCategoryId === t.catId;
        const isHov = hoveredAlbumControl === t.id;
        lctx.fillStyle = isCurrent ? '#9a3412' : isHov ? '#fde68a' : '#fef3c7';
        lctx.fillRect(t.x, 120, t.w, 64);
        lctx.strokeStyle = isCurrent ? '#431407' : '#b45309';
        lctx.lineWidth = 3;
        lctx.strokeRect(t.x, 120, t.w, 64);
        lctx.fillStyle = isCurrent ? '#ffffff' : '#451a03';
        lctx.font = 'bold 23px "Tahoma", sans-serif';
        lctx.textAlign = 'center';
        lctx.fillText(t.label, t.x + t.w / 2, 160);
      });

      // Featured Polaroid Photo Card on Left Page
      const featuredPhoto = album.photos[currentFeaturedPhotoIdx] || album.photos[0];
      lctx.save();
      lctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
      lctx.fillRect(118, 212, 804, 482);
      lctx.fillStyle = '#ffffff';
      lctx.fillRect(110, 204, 804, 482);
      lctx.strokeStyle = '#cbd5e1';
      lctx.lineWidth = 2;
      lctx.strokeRect(110, 204, 804, 482);

      if (featuredPhoto) {
        drawPolaroidImageCover(
          lctx,
          loadedAlbumImages[featuredPhoto.src],
          134,
          224,
          756,
          392
        );
        // Vintage black photo corners
        lctx.fillStyle = '#1e293b';
        [
          [130, 220],
          [872, 220],
          [130, 598],
          [872, 598]
        ].forEach(([cx, cy]) => lctx.fillRect(cx, cy, 22, 22));

        lctx.fillStyle = '#0f172a';
        lctx.font = 'bold 25px Georgia, serif';
        lctx.textAlign = 'center';
        lctx.fillText(featuredPhoto.caption, 512, 658);
      }
      lctx.restore();

      // Bottom Photo Navigation Controls on Left Page
      lctx.fillStyle = hoveredAlbumControl === 'prev_photo' ? '#9a3412' : '#78350f';
      lctx.fillRect(110, 710, 220, 56);
      lctx.fillStyle = '#ffffff';
      lctx.font = 'bold 21px "Tahoma", sans-serif';
      lctx.textAlign = 'center';
      lctx.fillText('◀ Prev Photo', 220, 745);

      lctx.fillStyle = '#451a03';
      lctx.font = 'bold 22px Georgia, serif';
      lctx.fillText(`Photo ${currentFeaturedPhotoIdx + 1} of ${totalPhotos}`, 512, 745);

      lctx.fillStyle = hoveredAlbumControl === 'next_photo' ? '#9a3412' : '#78350f';
      lctx.fillRect(694, 710, 220, 56);
      lctx.fillStyle = '#ffffff';
      lctx.font = 'bold 21px "Tahoma", sans-serif';
      lctx.fillText('Next Photo ▶', 804, 745);

      leftPageTexture.needsUpdate = true;

      // ── 2. DRAW RIGHT PAGE (2x2 Polaroid Scrapbook Grid + Page Flip Controls) ──
      const rctx = rightPageCanvas.getContext('2d');
      rctx.fillStyle = '#fefce8';
      rctx.fillRect(0, 0, 1024, 800);

      // Subtle left-edge spine shadow on right page
      const rightSpineGrad = rctx.createLinearGradient(0, 0, 64, 0);
      rightSpineGrad.addColorStop(0, 'rgba(67, 20, 7, 0.28)');
      rightSpineGrad.addColorStop(1, 'rgba(120, 53, 15, 0)');
      rctx.fillStyle = rightSpineGrad;
      rctx.fillRect(0, 0, 64, 800);

      // Stitched scrapbook border
      rctx.strokeStyle = 'rgba(146, 64, 14, 0.35)';
      rctx.lineWidth = 3;
      rctx.setLineDash([10, 8]);
      rctx.strokeRect(28, 20, 972, 760);
      rctx.setLineDash([]);

      // Right Page Header
      rctx.fillStyle = '#78350f';
      rctx.font = 'bold 22px Georgia, serif';
      rctx.textAlign = 'left';
      rctx.fillText(album.subtitle, 56, 64);

      rctx.fillStyle = '#9a3412';
      rctx.font = 'bold 20px "Tahoma", sans-serif';
      rctx.textAlign = 'right';
      rctx.fillText('Click any Polaroid to enlarge on Left Page', 968, 64);

      // Draw 2x2 Polaroid Slots on Right Page
      const slots = [
        { idx: 0, x: 56, y: 108, w: 432, h: 274 },
        { idx: 1, x: 536, y: 108, w: 432, h: 274 },
        { idx: 2, x: 56, y: 404, w: 432, h: 274 },
        { idx: 3, x: 536, y: 404, w: 432, h: 274 }
      ];

      slots.forEach((slot) => {
        const photoIndex = currentAlbumSpreadIdx * 4 + slot.idx;
        const photo = album.photos[photoIndex];
        if (!photo) return;

        const isSelected = photoIndex === currentFeaturedPhotoIdx;
        const isHov = hoveredAlbumControl === `photo_slot_${slot.idx}`;

        rctx.save();
        // Drop shadow
        rctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
        rctx.fillRect(slot.x + 6, slot.y + 6, slot.w, slot.h);

        // White Polaroid frame
        rctx.fillStyle = '#ffffff';
        rctx.fillRect(slot.x, slot.y, slot.w, slot.h);

        rctx.strokeStyle = isSelected ? '#d97706' : isHov ? '#b45309' : '#cbd5e1';
        rctx.lineWidth = isSelected ? 5 : 2;
        rctx.strokeRect(slot.x, slot.y, slot.w, slot.h);

        drawPolaroidImageCover(
          rctx,
          loadedAlbumImages[photo.src],
          slot.x + 16,
          slot.y + 14,
          slot.w - 32,
          slot.h - 66
        );

        // Vintage black photo corners
        rctx.fillStyle = '#1e293b';
        rctx.fillRect(slot.x + 12, slot.y + 10, 16, 16);
        rctx.fillRect(slot.x + slot.w - 28, slot.y + 10, 16, 16);

        // Handwritten-style Polaroid caption
        rctx.fillStyle = '#0f172a';
        rctx.font = 'bold 17px Georgia, serif';
        rctx.textAlign = 'center';
        const shortCaption =
          photo.caption.length > 42 ? photo.caption.slice(0, 40) + '...' : photo.caption;
        rctx.fillText(shortCaption, slot.x + slot.w / 2, slot.y + slot.h - 20);
        rctx.restore();
      });

      // Bottom Page Spread Flip Controls on Right Page
      if (totalSpreads > 1) {
        rctx.fillStyle = hoveredAlbumControl === 'prev_spread' ? '#9a3412' : '#78350f';
        rctx.fillRect(56, 710, 250, 56);
        rctx.fillStyle = '#ffffff';
        rctx.font = 'bold 21px "Tahoma", sans-serif';
        rctx.textAlign = 'center';
        rctx.fillText('◀ Prev Page', 181, 745);

        rctx.fillStyle = '#451a03';
        rctx.font = 'bold 22px Georgia, serif';
        rctx.fillText(`Album Page ${currentAlbumSpreadIdx + 1} / ${totalSpreads}`, 512, 745);

        rctx.fillStyle = hoveredAlbumControl === 'next_spread' ? '#9a3412' : '#78350f';
        rctx.fillRect(718, 710, 250, 56);
        rctx.fillStyle = '#ffffff';
        rctx.font = 'bold 21px "Tahoma", sans-serif';
        rctx.fillText('Next Page ▶', 843, 745);
      } else {
        rctx.fillStyle = '#78350f';
        rctx.font = 'italic 21px Georgia, serif';
        rctx.textAlign = 'center';
        rctx.fillText('Click outside the album on the desk to close & return to room', 512, 745);
      }

      rightPageTexture.needsUpdate = true;
    };

    // Preload all Loveland Ski Resort & Camping images into the 3D Album canvases
    ADVENTURE_ALBUMS.forEach((album) => {
      album.photos.forEach((photo) => {
        if (!loadedAlbumImages[photo.src]) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            redrawAlbumPages();
          };
          img.src = photo.src;
          loadedAlbumImages[photo.src] = img;
        }
      });
    });
    redrawAlbumPages();

    // =========================================================
    // K. HIGH-BACK SEGMENTED PADDED SPACECRAFT CAPTAIN'S CHAIR
    //    (Positioned on the right side of the bridge facing the console & window,
    //     sculpted with thick industrial bolsters and tall headrest like the sketch!)
    // =========================================================
    const chairGroup = new THREE.Group();
    chairGroup.position.set(0.58, 0, -0.45);
    chairGroup.rotation.y = -0.68; // Faces the angled hero terminal and left-front window!
    bridgeGroup.add(chairGroup);

    // Heavy dark steel pedestal base
    const chairPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.32, 0.42, 24),
      charcoalMetalMat
    );
    chairPedestal.position.set(0, 0.21, 0);
    chairPedestal.castShadow = true;
    chairGroup.add(chairPedestal);

    // Thick segmented seat cushion
    const seatBottomFrame = new THREE.Mesh(
      new RoundedBoxGeometry(0.66, 0.12, 0.64, 3, 0.03),
      hullDarkSlateMat
    );
    seatBottomFrame.position.set(0, 0.46, 0);
    seatBottomFrame.castShadow = true;
    chairGroup.add(seatBottomFrame);

    const seatCushionMain = new THREE.Mesh(
      new RoundedBoxGeometry(0.62, 0.14, 0.58, 4, 0.04),
      chairCushionMat
    );
    seatCushionMain.position.set(0, 0.56, -0.02);
    seatCushionMain.castShadow = true;
    chairGroup.add(seatCushionMain);

    // Seat side thigh bolsters
    [-0.28, 0.28].forEach((bx) => {
      const thighBolster = new THREE.Mesh(
        new RoundedBoxGeometry(0.12, 0.16, 0.56, 3, 0.03),
        chairBolsterMat
      );
      thighBolster.position.set(bx, 0.59, -0.02);
      thighBolster.castShadow = true;
      chairGroup.add(thighBolster);
    });

    // High-Back Reclined Spine Assembly (tilted back ~15 degrees)
    const backrestGroup = new THREE.Group();
    backrestGroup.position.set(0, 0.62, -0.24);
    backrestGroup.rotation.x = -0.22;
    chairGroup.add(backrestGroup);

    // Rear armored steel shell of the chair back
    const backSteelShell = new THREE.Mesh(
      new RoundedBoxGeometry(0.60, 0.92, 0.10, 4, 0.03),
      hullMidSlateMat
    );
    backSteelShell.position.set(0, 0.46, -0.06);
    backSteelShell.castShadow = true;
    backrestGroup.add(backSteelShell);

    // Lower lumbar cushion
    const lumbarPad = new THREE.Mesh(
      new RoundedBoxGeometry(0.54, 0.38, 0.14, 4, 0.04),
      chairCushionMat
    );
    lumbarPad.position.set(0, 0.24, 0.02);
    lumbarPad.castShadow = true;
    backrestGroup.add(lumbarPad);

    // Upper thoracic cushion
    const upperBackPad = new THREE.Mesh(
      new RoundedBoxGeometry(0.56, 0.46, 0.15, 4, 0.04),
      chairCushionMat
    );
    upperBackPad.position.set(0, 0.68, 0.02);
    upperBackPad.castShadow = true;
    backrestGroup.add(upperBackPad);

    // Deep side wing bolsters on the backrest (visible in 3/4 rear view in sketch!)
    [-0.27, 0.27].forEach((wx) => {
      const wingBolster = new THREE.Mesh(
        new RoundedBoxGeometry(0.12, 0.84, 0.20, 4, 0.04),
        chairBolsterMat
      );
      wingBolster.position.set(wx, 0.46, 0.03);
      wingBolster.castShadow = true;
      backrestGroup.add(wingBolster);
    });

    // Twin chrome headrest posts & Tall Padded Headrest
    [-0.12, 0.12].forEach((px) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.20, 12), charcoalMetalMat);
      post.position.set(px, 0.98, 0.0);
      backrestGroup.add(post);
    });

    const headrestPad = new THREE.Mesh(
      new RoundedBoxGeometry(0.38, 0.30, 0.15, 4, 0.045),
      chairCushionMat
    );
    headrestPad.position.set(0, 1.14, 0.02);
    headrestPad.castShadow = true;
    backrestGroup.add(headrestPad);

    // =========================================================
    // L. STACK OF 5 INTERACTIVE BOOKS ON THE RIGHT CONSOLE WING
    //    (Open, The Gene, The Glass Castle, Atomic Habits, The Emperor's New Clothes)
    // =========================================================
    const booksStackGroup = new THREE.Group();
    booksStackGroup.position.set(1.38, 1.14, -1.42);
    consoleDeskGroup.add(booksStackGroup);

    const bookMeshes = [];
    const bookInteractionMeshes = [];
    let currentBookY = 0;

    BOOKS_DATA.forEach((book) => {
      const singleBookGroup = new THREE.Group();
      const centerY = currentBookY + book.h / 2;
      singleBookGroup.position.set(0, centerY, 0);
      singleBookGroup.rotation.y = book.rotY;

      const coverMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(book.color),
        roughness: 0.45
      });
      const topCoverMat = new THREE.MeshStandardMaterial({
        map: createBookCoverTexture(book),
        roughness: 0.4
      });
      const pagesMat = new THREE.MeshStandardMaterial({
        color: 0xfefce8,
        roughness: 0.75
      });

      const bookMesh = new THREE.Mesh(new THREE.BoxGeometry(book.w, book.h, book.d), [
        pagesMat,
        coverMat,
        topCoverMat,
        coverMat,
        pagesMat,
        pagesMat
      ]);
      bookMesh.castShadow = true;
      bookMesh.receiveShadow = true;
      bookMesh.userData = { book };
      singleBookGroup.add(bookMesh);

      booksStackGroup.add(singleBookGroup);
      bookMeshes.push({ group: singleBookGroup, baseY: centerY, rotY: book.rotY, hovered: false, book });
      bookInteractionMeshes.push(bookMesh);

      currentBookY += book.h + 0.003;
    });

    // Flip the artificial gravity switch (shared by the 3D lever and the HUD button)
    const toggleZeroG = () => {
      const next = !isZeroGRef.current;
      isZeroGRef.current = next;
      setIsZeroG(next);
      playGravitySwitchSound(next);

      const oldMap = gravitySwitchPlateMesh.material.map;
      gravitySwitchPlateMesh.material.map = createGravitySwitchPlateTexture(next);
      gravitySwitchPlateMesh.material.needsUpdate = true;
      if (oldMap) oldMap.dispose();
      switchStatusLight.color.set(next ? 0xef4444 : 0x10b981);

      setGravityBanner(next ? 'ARTIFICIAL GRAVITY OFFLINE — 0.0G' : 'ARTIFICIAL GRAVITY RESTORED — 1.0G');
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
      bannerTimeoutRef.current = setTimeout(() => setGravityBanner(null), 3200);
    };
    toggleZeroGRef.current = toggleZeroG;

    // Ends the slow-rotating intro and glides the camera to the normal overview
    let introJustEnded = false;
    const endIntro = () => {
      if (!isIntroActiveRef.current) return;
      isIntroActiveRef.current = false;
      setIsIntroActive(false);
      introJustEnded = true;
      savedCamPos.copy(baseCamPos);
      wasZoomedIn = true; // reuse the smooth "return to overview" glide
    };

    // =========================================================
    // M. RAYCASTER INTERACTION (Click Hero Monitor Screen / Hover Books)
    // =========================================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const updateMouseNDC = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      markUserInteraction();

      updateMouseNDC(e);
      raycaster.setFromCamera(mouse, camera);
      const screenHits = raycaster.intersectObjects(screenClickMeshes, false);

      if (screenHits.length > 0 && cameraTargetModeRef.current !== 'zoomAlbum') {
        const hit = screenHits[0];
        if (hit.uv) {
          const cx = hit.uv.x * 1024;
          const cy = (1 - hit.uv.y) * 768;
          const hitId = getHitMonitorLink(hit);
          const wb = getWinBounds(currentWinState);
          const viewH = wb.h - 66;
          const totalH = getContentHeight(currentMonitorPage);
          const maxScroll = Math.max(0, totalH - (viewH - 10));

          if (hitId === 'sb_thumb') {
            isDraggingThumb = true;
            thumbDragStartCy = cy;
            thumbDragStartScrollY = currentMonitorScrollY;
            return;
          } else if (hitId === 'sb_up') {
            currentMonitorScrollY = Math.max(0, currentMonitorScrollY - 60);
            redrawMonitor();
            return;
          } else if (hitId === 'sb_down') {
            currentMonitorScrollY = Math.min(maxScroll, currentMonitorScrollY + 60);
            redrawMonitor();
            return;
          } else if (hitId === 'sb_track_up') {
            currentMonitorScrollY = Math.max(0, currentMonitorScrollY - 220);
            redrawMonitor();
            return;
          } else if (hitId === 'sb_track_down') {
            currentMonitorScrollY = Math.min(maxScroll, currentMonitorScrollY + 220);
            redrawMonitor();
            return;
          }

          // Content drag scrolling: if clicked inside the right content pane
          const contentX = wb.x + 6 + 215;
          const contentW = 540;
          const viewY = wb.y + 38;
          if (cx >= contentX && cx <= contentX + contentW && cy >= viewY + 4 && cy <= viewY + viewH - 4) {
            isDraggingContent = true;
            contentDragStartCy = cy;
            contentDragStartScrollY = currentMonitorScrollY;
            hasDraggedDistance = false;
          }
        }
      }
    };

    let currentMonitorPage = 'home';
    let currentHoveredLink = null;
    let currentWinState = 'normal';
    let currentMonitorScrollY = 0;
    const visitedMonitorLinks = new Set();
    const VALID_PAGES = new Set(['home', 'about', 'experience', 'projects', 'contact']);

    let isDraggingThumb = false;
    let thumbDragStartCy = 0;
    let thumbDragStartScrollY = 0;

    let isDraggingContent = false;
    let contentDragStartCy = 0;
    let contentDragStartScrollY = 0;
    let hasDraggedDistance = false;

    onAboutPhotoLoaded = () => {
      redrawMonitor();
    };

    const getHitMonitorLink = (hit) => {
      if (!hit || !hit.uv) return null;
      const cx = hit.uv.x * 1024;
      const cy = (1 - hit.uv.y) * 768;
      const regions = getMonitorHitRegions(currentWinState, currentMonitorPage, currentMonitorScrollY);
      for (let i = regions.length - 1; i >= 0; i--) {
        const reg = regions[i];
        if (cx >= reg.x && cx <= reg.x + reg.w && cy >= reg.y && cy <= reg.y + reg.h) {
          return reg.id;
        }
      }
      return null;
    };

    const redrawMonitor = () => {
      drawMainMonitorCanvas(
        mainScreenCanvas,
        currentMonitorPage,
        currentHoveredLink,
        currentWinState,
        visitedMonitorLinks,
        currentMonitorScrollY
      );
      mainScreenTexture.needsUpdate = true;
    };

    const getHitAlbumControl = (hit) => {
      if (!hit || !hit.uv || !hit.object?.userData?.pageSide) return null;
      const side = hit.object.userData.pageSide;
      const cx = hit.uv.x * 1024;
      const cy = (1 - hit.uv.y) * 800;
      const regions = getAlbumControlHitRegions(side);
      for (let i = regions.length - 1; i >= 0; i--) {
        const reg = regions[i];
        if (cx >= reg.x && cx <= reg.x + reg.w && cy >= reg.y && cy <= reg.y + reg.h) {
          return reg.id;
        }
      }
      return null;
    };

    const onPointerMove = (e) => {
      updateMouseNDC(e);
      raycaster.setFromCamera(mouse, camera);

      // 1. Dragging the scrollbar thumb
      if (isDraggingThumb) {
        const hits = raycaster.intersectObjects(screenClickMeshes, false);
        if (hits.length > 0 && hits[0].uv) {
          const curCy = (1 - hits[0].uv.y) * 768;
          const deltaCy = curCy - thumbDragStartCy;
          const wb = getWinBounds(currentWinState);
          const viewH = wb.h - 66;
          const totalH = getContentHeight(currentMonitorPage);
          const maxScrollY = Math.max(0, totalH - (viewH - 10));
          const sbH = viewH - 4;
          const trackH = sbH - 36;
          const thumbH = Math.min(120, Math.max(45, Math.round((viewH / totalH) * trackH)));
          const travelTrack = trackH - thumbH;
          if (travelTrack > 0 && maxScrollY > 0) {
            const scrollDelta = (deltaCy / travelTrack) * maxScrollY;
            const targetScroll = Math.max(0, Math.min(maxScrollY, Math.round(thumbDragStartScrollY + scrollDelta)));
            if (targetScroll !== currentMonitorScrollY) {
              currentMonitorScrollY = targetScroll;
              redrawMonitor();
            }
          }
        }
        return;
      }

      // 2. Dragging content directly
      if (isDraggingContent) {
        const hits = raycaster.intersectObjects(screenClickMeshes, false);
        if (hits.length > 0 && hits[0].uv) {
          const curCy = (1 - hits[0].uv.y) * 768;
          const deltaCy = curCy - contentDragStartCy;
          if (Math.abs(deltaCy) > 4) {
            hasDraggedDistance = true;
          }
          const wb = getWinBounds(currentWinState);
          const viewH = wb.h - 66;
          const totalH = getContentHeight(currentMonitorPage);
          const maxScrollY = Math.max(0, totalH - (viewH - 10));
          if (maxScrollY > 0) {
            const targetScroll = Math.max(0, Math.min(maxScrollY, Math.round(contentDragStartScrollY - deltaCy * 1.3)));
            if (targetScroll !== currentMonitorScrollY) {
              currentMonitorScrollY = targetScroll;
              redrawMonitor();
            }
          }
        }
        return;
      }

      const screenHits = raycaster.intersectObjects(screenClickMeshes, false);
      const albumHits = raycaster.intersectObjects(albumClickMeshes, false);
      const bookHits = raycaster.intersectObjects(bookInteractionMeshes, false);

      const hitLink = screenHits.length > 0 ? getHitMonitorLink(screenHits[0]) : null;
      if (hitLink !== currentHoveredLink) {
        currentHoveredLink = hitLink;
        redrawMonitor();
      }

      const isOverAlbum = albumHits.length > 0;
      setHoveringAlbum(isOverAlbum);

      const isOverSwitch =
        cameraTargetModeRef.current === 'overview' &&
        raycaster.intersectObjects(gravitySwitchClickMeshes, false).length > 0;
      setHoveringGravitySwitch(isOverSwitch);

      const hitAlbumCtrl =
        cameraTargetModeRef.current === 'zoomAlbum' && isOverAlbum
          ? getHitAlbumControl(albumHits[0])
          : null;
      if (hitAlbumCtrl !== hoveredAlbumControl) {
        hoveredAlbumControl = hitAlbumCtrl;
        redrawAlbumPages();
      }

      setHoveringScreen(screenHits.length > 0 || isOverAlbum || bookHits.length > 0 || isOverSwitch);

      if (bookHits.length > 0 && cameraTargetModeRef.current === 'overview') {
        const hitBook = bookHits[0].object.userData.book;
        setActiveBook(hitBook);
        bookMeshes.forEach((bm) => {
          bm.hovered = bm.book.id === hitBook.id;
        });
      } else {
        setActiveBook(null);
        bookMeshes.forEach((bm) => {
          bm.hovered = false;
        });
      }
    };

    // Calculate World Position & Normal of the Wall Monitor Screen for smooth zoom-in
    const screenWorldPos = new THREE.Vector3();
    const screenWorldQuat = new THREE.Quaternion();
    mainScreenMesh.getWorldPosition(screenWorldPos);
    mainScreenMesh.getWorldQuaternion(screenWorldQuat);
    const screenNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(screenWorldQuat).normalize();
    // Position the camera right in front of the 3D Wall Monitor so you see the screen + bezel + room around it!
    const zoomTargetPos = screenWorldPos.clone().addScaledVector(screenNormal, 1.16);
    const zoomLookAtPos = screenWorldPos.clone();

    // Calculate World Position & Camera Target for the Open 3D Photo Album on the Desk!
    // When open, photoAlbumGroup slides to x = photoAlbumOpenX (0.48) and rotates to rotation.y = 0
    // so the open two-page spread is 100% straight and viewed at a 90-degree top-down angle!
    const albumLookAtPos = new THREE.Vector3(photoAlbumOpenX - 0.23, photoAlbumBaseY + 0.024, -1.46);
    const albumZoomTargetPos = new THREE.Vector3(
      photoAlbumOpenX - 0.23,
      photoAlbumBaseY + 0.68,
      -1.46 + 0.002
    );

    const savedCamPos = baseCamPos.clone();

    const onPointerUp = (e) => {
      if (isDraggingThumb) {
        isDraggingThumb = false;
        return;
      }
      if (isDraggingContent) {
        const wasDragged = hasDraggedDistance;
        isDraggingContent = false;
        hasDraggedDistance = false;
        if (wasDragged) return;
      }

      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (introJustEnded) {
        // The click that ended the intro shouldn't also click on objects
        introJustEnded = false;
        return;
      }
      if (dist > 6) return;

      updateMouseNDC(e);
      raycaster.setFromCamera(mouse, camera);

      // Flip the gravity switch on the console
      if (
        cameraTargetModeRef.current === 'overview' &&
        raycaster.intersectObjects(gravitySwitchClickMeshes, false).length > 0
      ) {
        toggleZeroG();
        return;
      }

      const screenHits = raycaster.intersectObjects(screenClickMeshes, false);

      if (screenHits.length > 0 && cameraTargetModeRef.current !== 'zoomAlbum') {
        const clickedId = getHitMonitorLink(screenHits[0]);
        if (clickedId === 'win_minimize') {
          currentWinState = 'minimized';
          currentHoveredLink = null;
          redrawMonitor();
        } else if (clickedId === 'win_maximize') {
          currentWinState = currentWinState === 'maximized' ? 'normal' : 'maximized';
          currentHoveredLink = null;
          redrawMonitor();
        } else if (clickedId === 'win_close') {
          currentWinState = 'closed';
          currentHoveredLink = null;
          redrawMonitor();
        } else if (clickedId === 'desktop_showcase' || clickedId === 'start_button') {
          currentWinState = 'normal';
          redrawMonitor();
        } else if (clickedId === 'sb_up') {
          currentMonitorScrollY = Math.max(0, currentMonitorScrollY - 60);
          redrawMonitor();
          return;
        } else if (clickedId === 'sb_down') {
          const wb = getWinBounds(currentWinState);
          const maxScroll = Math.max(0, getContentHeight(currentMonitorPage) - (wb.h - 76));
          currentMonitorScrollY = Math.min(maxScroll, currentMonitorScrollY + 60);
          redrawMonitor();
          return;
        } else if (clickedId === 'sb_track_up') {
          currentMonitorScrollY = Math.max(0, currentMonitorScrollY - 220);
          redrawMonitor();
          return;
        } else if (clickedId === 'sb_track_down') {
          const wb = getWinBounds(currentWinState);
          const maxScroll = Math.max(0, getContentHeight(currentMonitorPage) - (wb.h - 76));
          currentMonitorScrollY = Math.min(maxScroll, currentMonitorScrollY + 220);
          redrawMonitor();
          return;
        } else if (clickedId === 'download_resume') {
          window.open('/Ramy_Kassam_Resume.pdf', '_blank');
        } else if (clickedId === 'open_album') {
          savedCamPos.copy(camera.position);
          handleFocusAlbum();
        } else if (clickedId === 'email_link') {
          window.location.href = 'mailto:kassamramy27@outlook.com';
        } else if (clickedId === 'github_link') {
          window.open('https://github.com/Ram096', '_blank');
        } else if (clickedId && VALID_PAGES.has(clickedId)) {
          visitedMonitorLinks.add(clickedId);
          currentMonitorPage = clickedId;
          currentMonitorScrollY = 0;
          redrawMonitor();
        }
        if (cameraTargetModeRef.current !== 'zoomIn') {
          savedCamPos.copy(camera.position);
          handleFocusScreen();
        }
        return;
      }

      // Click on the Physical Adventure Photo Album on the Desk!
      const albumHits = raycaster.intersectObjects(albumClickMeshes, false);
      if (albumHits.length > 0) {
        if (cameraTargetModeRef.current !== 'zoomAlbum') {
          savedCamPos.copy(camera.position);
          handleFocusAlbum();
          return;
        }

        // Already zoomed into the open 3D album — handle interactive clicks on the pages!
        const ctrlId = getHitAlbumControl(albumHits[0]);
        const album = getActiveAlbumData();
        const totalPhotos = album.photos.length;
        const totalSpreads = Math.max(1, Math.ceil(totalPhotos / 4));

        if (ctrlId === 'close_album') {
          handleExitFullDisplay();
        } else if (ctrlId === 'tab_basin' || ctrlId === 'tab_loveland') {
          currentAlbumCategoryId = 'basin';
          currentAlbumSpreadIdx = 0;
          currentFeaturedPhotoIdx = 0;
          redrawAlbumPages();
        } else if (ctrlId === 'tab_camping') {
          currentAlbumCategoryId = 'camping';
          currentAlbumSpreadIdx = 0;
          currentFeaturedPhotoIdx = 0;
          redrawAlbumPages();
        } else if (ctrlId === 'prev_photo') {
          currentFeaturedPhotoIdx = (currentFeaturedPhotoIdx - 1 + totalPhotos) % totalPhotos;
          currentAlbumSpreadIdx = Math.floor(currentFeaturedPhotoIdx / 4);
          redrawAlbumPages();
        } else if (ctrlId === 'next_photo') {
          currentFeaturedPhotoIdx = (currentFeaturedPhotoIdx + 1) % totalPhotos;
          currentAlbumSpreadIdx = Math.floor(currentFeaturedPhotoIdx / 4);
          redrawAlbumPages();
        } else if (ctrlId === 'prev_spread') {
          currentAlbumSpreadIdx = (currentAlbumSpreadIdx - 1 + totalSpreads) % totalSpreads;
          currentFeaturedPhotoIdx = currentAlbumSpreadIdx * 4;
          redrawAlbumPages();
        } else if (ctrlId === 'next_spread') {
          currentAlbumSpreadIdx = (currentAlbumSpreadIdx + 1) % totalSpreads;
          currentFeaturedPhotoIdx = currentAlbumSpreadIdx * 4;
          redrawAlbumPages();
        } else if (ctrlId && ctrlId.startsWith('photo_slot_')) {
          const slotOffset = parseInt(ctrlId.replace('photo_slot_', ''), 10);
          const candidateIdx = currentAlbumSpreadIdx * 4 + slotOffset;
          if (candidateIdx < totalPhotos) {
            currentFeaturedPhotoIdx = candidateIdx;
            redrawAlbumPages();
          }
        }
        return;
      }

      // If currently zoomed into the monitor OR open 3D album, clicking anywhere OUTSIDE smoothly zooms back to the room!
      if (cameraTargetModeRef.current === 'zoomIn' || cameraTargetModeRef.current === 'zoomAlbum') {
        handleExitFullDisplay();
        return;
      }

      const bookHits = raycaster.intersectObjects(bookInteractionMeshes, false);
      if (bookHits.length > 0) {
        setActiveBook(bookHits[0].object.userData.book);
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    domElem.addEventListener('pointermove', onPointerMove);
    domElem.addEventListener('pointerup', onPointerUp);

    const onWheel = (e) => {
      updateMouseNDC(e);
      raycaster.setFromCamera(mouse, camera);
      const screenHits = raycaster.intersectObjects(screenClickMeshes, false);
      const isOverMonitor = screenHits.length > 0;
      const isZoomed = cameraTargetModeRef.current === 'zoomIn';

      if (isZoomed || isOverMonitor) {
        e.preventDefault();
        e.stopPropagation();

        const wb = getWinBounds(currentWinState);
        const viewH = wb.h - 66;
        const totalH = getContentHeight(currentMonitorPage);
        const maxScroll = Math.max(0, totalH - (viewH - 10));
        if (maxScroll > 0) {
          const rawDelta = e.deltaY;
          const sign = Math.sign(rawDelta) || 1;
          const absDelta = Math.abs(rawDelta);
          const step = sign * (absDelta < 25 ? 36 : Math.min(95, Math.max(45, absDelta)));
          const nextScroll = Math.max(0, Math.min(maxScroll, currentMonitorScrollY + step));
          if (nextScroll !== currentMonitorScrollY) {
            currentMonitorScrollY = nextScroll;
            redrawMonitor();
          }
        }
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });

    const onKeyDown = (e) => {
      if (cameraTargetModeRef.current === 'zoomIn') {
        const wb = getWinBounds(currentWinState);
        const viewH = wb.h - 66;
        const totalH = getContentHeight(currentMonitorPage);
        const maxScroll = Math.max(0, totalH - (viewH - 10));
        if (maxScroll > 0) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentMonitorScrollY = Math.min(maxScroll, currentMonitorScrollY + 60);
            redrawMonitor();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentMonitorScrollY = Math.max(0, currentMonitorScrollY - 60);
            redrawMonitor();
          } else if (e.key === 'PageDown' || e.key === ' ') {
            e.preventDefault();
            currentMonitorScrollY = Math.min(maxScroll, currentMonitorScrollY + 280);
            redrawMonitor();
          } else if (e.key === 'PageUp') {
            e.preventDefault();
            currentMonitorScrollY = Math.max(0, currentMonitorScrollY - 280);
            redrawMonitor();
          } else if (e.key === 'Home') {
            e.preventDefault();
            currentMonitorScrollY = 0;
            redrawMonitor();
          } else if (e.key === 'End') {
            e.preventDefault();
            currentMonitorScrollY = maxScroll;
            redrawMonitor();
          }
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);

    const onWindowPointerUp = () => {
      isDraggingThumb = false;
      isDraggingContent = false;
    };
    window.addEventListener('pointerup', onWindowPointerUp);

    // Clicking ANYWHERE (canvas or HUD) during the intro begins the experience
    const onGlobalPointerDown = (e) => {
      if (isIntroActiveRef.current) {
        endIntro();
        // Only swallow the follow-up click if it landed on the 3D canvas
        introJustEnded = e.target === renderer.domElement;
      }
    };
    window.addEventListener('pointerdown', onGlobalPointerDown, true);

    // =========================================================
    // N. ANIMATION LOOP (Planet Rotation + Intro Orbit + Monitor/Album Zoom + Zero-G Float)
    // =========================================================
    let reqId;
    const clock = new THREE.Clock();

    let wasZoomedIn = false;
    let zeroG = 0; // 0 = normal gravity, 1 = fully floating (smoothed)
    let introAngle = 0;
    const introCenter = new THREE.Vector3(0.1, 0, 1.25);
    const introLookAt = new THREE.Vector3(0.1, 1.45, 1.25);

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotate the 3D Planet & Stars outside the back spacecraft window
      planetMesh.rotation.y = elapsed * 0.14;
      starsGroup.rotation.z = elapsed * 0.012;
      moonMesh.position.y = 0.24 + Math.sin(elapsed * 0.7) * 0.04;

      // ── ZERO-GRAVITY: ease in/out so objects lift off and settle back down ──
      zeroG = THREE.MathUtils.lerp(zeroG, isZeroGRef.current ? 1 : 0, 0.025);
      const g = zeroG;
      const isAlbumZoomed = cameraTargetModeRef.current === 'zoomAlbum';

      switchLeverPivot.rotation.x = THREE.MathUtils.lerp(
        switchLeverPivot.rotation.x,
        isZeroGRef.current ? -0.55 : 0.55,
        0.18
      );

      // Captain's chair lifts off its pedestal and drifts
      chairGroup.position.y = g * (0.32 + Math.sin(elapsed * 0.8) * 0.05);
      chairGroup.rotation.x = g * Math.sin(elapsed * 0.55) * 0.08;
      chairGroup.rotation.z = g * Math.cos(elapsed * 0.65) * 0.07;
      chairGroup.rotation.y =
        -0.68 + Math.sin(elapsed * 0.45) * 0.04 + g * Math.sin(elapsed * 0.3) * 0.3;

      // Photo album (stays put while you're reading it)
      const albumG = isAlbumZoomed ? 0 : g;
      photoAlbumGroup.position.y =
        photoAlbumBaseY + albumG * (0.26 + Math.sin(elapsed * 1.05 + 1) * 0.04);
      photoAlbumGroup.rotation.x = albumG * Math.sin(elapsed * 0.7 + 0.5) * 0.12;
      photoAlbumGroup.rotation.z = albumG * Math.cos(elapsed * 0.6 + 1.2) * 0.1;

      // Book stack separates and tumbles slowly
      bookMeshes.forEach((bm, idx) => {
        const hoverLift = bm.hovered ? 0.035 : 0;
        bm.group.position.y =
          bm.baseY + hoverLift + g * (0.22 + idx * 0.14 + Math.sin(elapsed * (0.9 + idx * 0.15) + idx) * 0.04);
        bm.group.position.x = g * Math.sin(elapsed * 0.4 + idx * 1.3) * 0.1;
        bm.group.position.z = g * Math.cos(elapsed * 0.35 + idx) * 0.1;
        bm.group.rotation.x = g * Math.sin(elapsed * 0.5 + idx) * 0.5;
        bm.group.rotation.z = g * Math.cos(elapsed * 0.45 + idx) * 0.4;
        bm.group.rotation.y = (bm.rotY || 0) + g * elapsed * 0.15 * (idx % 2 ? 1 : -1);
      });

      // Phone handset lifts out of its cradle
      phoneHandset.position.y = 1.04 + g * (0.22 + Math.sin(elapsed * 1.2) * 0.03);
      phoneHandset.rotation.x = g * Math.cos(elapsed * 0.7) * 0.25;
      phoneHandset.rotation.z = g * Math.sin(elapsed * 0.8) * 0.3;

      // Mouse hovers above the pad
      mouseMesh.position.y = 0.022 + g * (0.14 + Math.sin(elapsed * 1.4) * 0.025);
      mouseMesh.rotation.y = g * Math.sin(elapsed * 0.9) * 0.4;

      // Coffee mug + escaping coffee droplets
      coffeeMugGroup.position.y = 1.135 + g * (0.3 + Math.sin(elapsed + 2) * 0.04);
      coffeeMugGroup.rotation.x = g * Math.cos(elapsed * 0.6) * 0.2;
      coffeeMugGroup.rotation.z = g * Math.sin(elapsed * 0.7) * 0.3;
      coffeeDrops.forEach((drop) => {
        const { offX, offY, offZ, seed } = drop.userData;
        drop.position.set(
          offX + Math.cos(elapsed * 0.9 + seed) * 0.03,
          offY + Math.sin(elapsed * 1.3 + seed) * 0.04,
          offZ
        );
        drop.scale.setScalar(Math.max(0.001, g));
      });

      // Pen spins end over end
      penGroup.position.y = 1.145 + g * (0.45 + Math.sin(elapsed * 1.1 + 3) * 0.05);
      penGroup.rotation.x = g * elapsed * 0.6;
      penGroup.rotation.z = g * elapsed * 0.8;

      // Clipboard drifts
      clipboardGroup.position.y = 1.14 + g * (0.24 + Math.sin(elapsed * 0.85 + 4) * 0.04);
      clipboardGroup.rotation.x = g * Math.sin(elapsed * 0.5) * 0.3;
      clipboardGroup.rotation.z = g * Math.cos(elapsed * 0.6) * 0.25;

      // Dust motes
      dustMat.opacity = g * 0.75;
      if (g > 0.02) {
        const arr = dustGeo.attributes.position.array;
        for (let i = 0; i < dustCount; i++) {
          arr[i * 3] += Math.sin(elapsed * 0.3 + i) * 0.0008;
          arr[i * 3 + 1] += 0.0015 + (i % 3) * 0.0005;
          if (arr[i * 3 + 1] > 4.0) arr[i * 3 + 1] = 0.5;
        }
        dustGeo.attributes.position.needsUpdate = true;
      }

      // Smoothly hinge the 3D Photo Album front cover open/closed on the desk!
      const targetCoverRotZ = isAlbumZoomed ? Math.PI * 0.995 : 0;
      albumCoverPivot.rotation.z = THREE.MathUtils.lerp(
        albumCoverPivot.rotation.z,
        targetCoverRotZ,
        0.09
      );
      const targetAlbumX = isAlbumZoomed ? photoAlbumOpenX : photoAlbumBaseX;
      photoAlbumGroup.position.x = THREE.MathUtils.lerp(
        photoAlbumGroup.position.x,
        targetAlbumX,
        0.09
      );
      const targetAlbumRotY = isAlbumZoomed ? 0 : 0.24;
      photoAlbumGroup.rotation.y = THREE.MathUtils.lerp(
        photoAlbumGroup.rotation.y,
        targetAlbumRotY,
        0.09
      );

      if (isIntroActiveRef.current) {
        // Calm in-and-out floating zoom with slow, graceful easing rotation
        controls.enabled = false;
        const zoomPhase = Math.sin(elapsed * 0.25); // smooth ease-in / ease-out breath cycle (~25s)
        const dist = 3.75 + zoomPhase * 0.55; // floats between 3.20m and 4.30m
        const slowRot = Math.sin(elapsed * 0.14) * 0.32; // slow gentle rotational sway (~±18°)
        const floatY = 2.18 + Math.sin(elapsed * 0.32) * 0.12; // calm weightless vertical float
        const camX = defaultLookAtPos.x + Math.sin(0.12 + slowRot) * (dist * 0.38) + Math.cos(elapsed * 0.2) * 0.08;
        const camZ = defaultLookAtPos.z + Math.cos(0.12 + slowRot) * dist;
        camera.position.set(camX, floatY, camZ);

        // Gentle target tracking with subtle float drift
        const targetX = defaultLookAtPos.x + Math.sin(elapsed * 0.18) * 0.06;
        const targetY = defaultLookAtPos.y + Math.sin(elapsed * 0.28) * 0.04;
        controls.target.set(targetX, targetY, defaultLookAtPos.z);
        camera.lookAt(controls.target);
        camera.rotation.z = Math.sin(elapsed * 0.2) * 0.012;
      } else if (cameraTargetModeRef.current === 'zoomIn') {
        wasZoomedIn = true;
        controls.enabled = false;
        camera.position.lerp(zoomTargetPos, 0.08);
        controls.target.lerp(zoomLookAtPos, 0.08);
        camera.lookAt(controls.target);
      } else if (cameraTargetModeRef.current === 'zoomAlbum') {
        wasZoomedIn = true;
        controls.enabled = false;
        camera.position.lerp(albumZoomTargetPos, 0.08);
        controls.target.lerp(albumLookAtPos, 0.08);
        camera.lookAt(controls.target);
      } else {
        controls.enabled = true;
        controls.target.lerp(defaultLookAtPos, 0.07);
        camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0, 0.1);
        if (wasZoomedIn) {
          camera.position.lerp(savedCamPos, 0.08);
          camera.lookAt(controls.target);
          if (camera.position.distanceTo(savedCamPos) < 0.06) {
            wasZoomedIn = false;
          }
        } else {
          controls.update();
        }
      }

      // Keep the camera 100% inside the enclosed spacecraft cabin walls at all times
      if (
        !isIntroActiveRef.current &&
        cameraTargetModeRef.current !== 'zoomIn' &&
        cameraTargetModeRef.current !== 'zoomAlbum'
      ) {
        camera.position.x = THREE.MathUtils.clamp(camera.position.x, -2.95, 3.10);
        camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.35, 4.18);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -1.95, 4.55);

        // Also keep camera in front of the angled Left-Front Workstation Wall
        const nx = Math.sin(0.46);
        const nz = Math.cos(0.46);
        const distFromLeftFrontWall =
          (camera.position.x - -1.58) * nx + (camera.position.z - -1.28) * nz;
        if (distFromLeftFrontWall < 0.38) {
          const push = 0.38 - distFromLeftFrontWall;
          camera.position.x += nx * push;
          camera.position.z += nz * push;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerup', onWindowPointerUp);
      window.removeEventListener('pointerdown', onGlobalPointerDown, true);
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
      toggleZeroGRef.current = null;
      domElem.removeEventListener('pointerdown', onPointerDown);
      domElem.removeEventListener('pointermove', onPointerMove);
      domElem.removeEventListener('pointerup', onPointerUp);
      onAboutPhotoLoaded = null;
      controls.dispose();
      renderer.dispose();
    };
  }, [stage, drawMainMonitorCanvas]);

  // ─────────────────────────────────────────────────────────────
  // STAGE 1: ALL-DARK COMMAND PROMPT SCREEN
  // ─────────────────────────────────────────────────────────────
  if (stage === 'cmd' || stage === 'booting') {
    return (
      <div className="relative h-screen w-screen bg-black text-[#e5e5e5] font-cmd flex flex-col justify-between p-5 sm:p-10 select-none overflow-hidden">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)] z-10" />

        <div className="w-full max-w-4xl mx-auto z-20 my-auto">
          <div className="border border-neutral-800 bg-[#0a0a0a] shadow-2xl rounded-xs overflow-hidden">
            {/* CMD Title Bar */}
            <div className="bg-[#1a1a1a] border-b border-neutral-800 px-3 py-1.5 flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <div className="bg-black border border-neutral-600 px-1 py-0.5 text-[10px] font-bold text-white leading-none">
                  C:\_
                </div>
                <span>Administrator: Command Prompt</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-500">
                <Minus className="w-3.5 h-3.5" />
                <Square className="w-3 h-3" />
                <X className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* CMD Body */}
            <div className="p-6 sm:p-10 min-h-[400px] sm:min-h-[450px] flex flex-col justify-between bg-black text-sm sm:text-base">
              <div className="space-y-2 text-neutral-400">
                <p>Joulomb Orbital OS [Version 10.0.2026.1]</p>
                <p>(c) Joulomb Inc. All rights reserved.</p>

                <div className="pt-6 text-neutral-200">
                  <span className="text-neutral-500">C:\Users\Ramy\Portfolio&gt;</span>{' '}
                  <span className="text-emerald-400 font-semibold tracking-wide text-lg sm:text-2xl">
                    {typedTitle}
                  </span>
                  {!showSubPrompt && (
                    <span className="inline-block w-2.5 h-5 bg-emerald-400 ml-1 align-middle animate-blink" />
                  )}
                </div>

                {showSubPrompt && (
                  <div className="pt-8 space-y-6">
                    <p className="text-neutral-300 text-base sm:text-xl flex items-center gap-2">
                      <span className="text-neutral-500">&gt;</span>
                      <span>Click start to begin</span>
                      <span className="inline-block w-2.5 h-5 bg-neutral-300 animate-blink" />
                    </p>

                    {stage === 'cmd' ? (
                      <div className="pt-2">
                        <button
                          onClick={handleStart}
                          className="group relative inline-flex items-center gap-3 px-7 py-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/60 font-bold tracking-widest uppercase text-sm sm:text-base transition-all duration-200 cursor-pointer shadow-[0_0_25px_rgba(16,185,129,0.2)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)] active:scale-95"
                        >
                          <span>[ START ]</span>
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 space-y-1.5 text-emerald-400/90 text-sm">
                        <p>C:\Users\Ramy\Portfolio&gt; start orbital_bridge.exe --workstation "Joulomb Inc"</p>
                        <p className="text-neutral-400">Initializing Joulomb-1 Spacecraft Bridge Deck...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-neutral-900 flex items-center justify-between text-xs text-neutral-600">
                <span>STATUS: READY</span>
                <span>JOULOMB INC // 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STAGE 2: INSIDE THE INDUSTRIAL SPACECRAFT BRIDGE DECK
  // ─────────────────────────────────────────────────────────────
  return (
    <div
      className={`relative h-screen w-screen overflow-hidden select-none bg-[#03060d] text-white ${
        hoveringScreen || isScreenFullDisplay || isAlbumOpen
          ? 'cursor-pointer'
          : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {/* ───────────────────────────────────────────────────────────
          UPPER-LEFT HEADER: RAMY KASSAM / SOFTWARE ENGINEER / TIME
      ──────────────────────────────────────────────────────────── */}
      <div className="fixed top-6 left-6 sm:top-8 sm:left-8 z-40 pointer-events-none flex flex-col bg-slate-950/75 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-400/30 shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
          Ramy Kassam
        </h1>
        <p className="text-sm sm:text-base font-medium text-slate-300 mt-0.5">
          Software Engineer
        </p>
        <p className="text-xs sm:text-sm font-cmd font-semibold text-amber-300 mt-1 tracking-wider">
          {currentTime}
        </p>
      </div>

      {/* ───────────────────────────────────────────────────────────
          UPPER-RIGHT QUICK ACTIONS (Focus Monitor / Return to Room / CMD)
      ──────────────────────────────────────────────────────────── */}
      <div className="fixed top-6 right-6 z-40 flex items-center gap-2">
        <button
          onClick={toggleGravity}
          className={`px-3.5 py-2 bg-slate-950/85 hover:bg-slate-900 text-white font-cmd text-xs tracking-wide flex items-center gap-2 shadow-md border transition-all cursor-pointer ${
            isZeroG ? 'border-red-400/70' : 'border-emerald-400/50'
          }`}
          title="Toggle artificial gravity"
        >
          <span
            className={`inline-block w-2 h-2 rounded-full ${isZeroG ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`}
          />
          <span>{isZeroG ? 'Gravity: OFF' : 'Gravity: ON'}</span>
        </button>

        {isScreenFullDisplay || isAlbumOpen ? (
          <button
            onClick={handleExitFullDisplay}
            className="px-3.5 py-2 bg-slate-950/85 hover:bg-slate-900 text-white font-cmd text-xs tracking-wide flex items-center gap-2 shadow-md border border-amber-400/60 transition-all cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Back to Room</span>
          </button>
        ) : (
          <button
            onClick={handleFocusScreen}
            className="px-3.5 py-2 bg-slate-950/85 hover:bg-slate-900 text-white font-cmd text-xs tracking-wide flex items-center gap-2 shadow-md border border-slate-400/40 transition-all cursor-pointer"
          >
            <Monitor className="w-3.5 h-3.5 text-amber-300" />
            <span>Focus Screen</span>
          </button>
        )}

        <button
          onClick={handleReplay}
          className="px-3 py-2 bg-slate-950/85 hover:bg-slate-900 text-white font-cmd text-xs tracking-wide flex items-center gap-1.5 shadow-md border border-slate-400/40 transition-all cursor-pointer"
          title="Back to Command Prompt"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>CMD</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────
          THREE.JS 3D CANVAS CONTAINER
      ──────────────────────────────────────────────────────────── */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Gravity status banner (shown briefly after flipping the switch) */}
      {gravityBanner && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div
            className={`font-cmd text-xs sm:text-sm tracking-[0.2em] px-5 py-2.5 bg-slate-950/90 border shadow-xl ${
              isZeroG ? 'border-red-400/70 text-red-300' : 'border-emerald-400/60 text-emerald-300'
            }`}
          >
            {gravityBanner}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          BOTTOM RETRO BLACK PROMPT BAR
      ──────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        {isIntroActive ? (
          <div className="pointer-events-none bg-slate-950/80 backdrop-blur-sm text-white font-cmd px-6 py-3 text-sm sm:text-base tracking-[0.25em] uppercase shadow-xl flex items-center gap-2 border border-amber-400/60 animate-pulse">
            <span>Click anywhere to begin</span>
            <span className="inline-block w-2 h-4 bg-amber-300 animate-blink" />
          </div>
        ) : isAlbumOpen ? (
          <button
            onClick={handleExitFullDisplay}
            className="bg-slate-950 hover:bg-slate-900 text-white font-cmd px-5 py-2 text-xs sm:text-sm tracking-wide shadow-xl cursor-pointer flex items-center gap-1.5 border border-amber-400/60"
          >
            <span>Click Polaroids or pages to browse • Click outside album to close</span>
            <span className="inline-block w-2 h-3.5 bg-amber-300 animate-blink" />
          </button>
        ) : hoveringGravitySwitch ? (
          <button
            onClick={toggleGravity}
            className="bg-slate-950 text-white font-cmd px-5 py-2.5 shadow-xl flex items-center gap-3 border border-red-400/70 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-xs sm:text-sm">
              Artificial Gravity Switch —{' '}
              <span className="text-red-300">
                {isZeroG ? 'Click to restore gravity' : 'Click to turn off gravity'}
              </span>
            </span>
          </button>
        ) : hoveringAlbum ? (
          <button
            onClick={handleFocusAlbum}
            className="bg-slate-950 text-white font-cmd px-5 py-2.5 shadow-xl flex items-center gap-3 border border-amber-400/70 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="text-xs sm:text-sm">
              Adventure Photo Album — <span className="text-amber-300">Click to open Basin Ski Trip &amp; Camping</span>
            </span>
          </button>
        ) : activeBook ? (
          <div className="bg-slate-950 text-white font-cmd px-5 py-2.5 shadow-xl flex items-center gap-3 border border-slate-400/50">
            <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="text-xs sm:text-sm">
              {activeBook.title} — <span className="text-slate-400">{activeBook.author}</span>
            </span>
          </div>
        ) : isScreenFullDisplay ? (
          <button
            onClick={handleExitFullDisplay}
            className="bg-slate-950 hover:bg-slate-900 text-white font-cmd px-5 py-2 text-xs sm:text-sm tracking-wide shadow-xl cursor-pointer flex items-center gap-1.5 border border-amber-400/60"
          >
            <span>Click outside the monitor to return to room</span>
            <span className="inline-block w-2 h-3.5 bg-amber-300 animate-blink" />
          </button>
        ) : (
          <button
            onClick={handleFocusScreen}
            className="bg-slate-950 hover:bg-slate-900 text-white font-cmd px-5 py-2 text-xs sm:text-sm tracking-wide shadow-xl cursor-pointer flex items-center gap-1.5 border border-slate-400/50"
          >
            <span>Click wall monitor, photo album, or the red gravity switch to explore</span>
            <span className="inline-block w-2 h-3.5 bg-amber-300 animate-blink" />
          </button>
        )}
      </div>
    </div>
  );
}
