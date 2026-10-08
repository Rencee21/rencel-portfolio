/* =====================================================================
   script.js  –  all of the site's behavior

   TIP FOR BEGINNERS
   Section 1 is the only part you normally need to edit. Everything below
   it reads those settings and does the work.

   SECURITY NOTE
   Never paste a private API key, password, or Google service-account file
   into this file. Anyone who opens your website can read everything in it.
   The Google Apps Script URL below is safe to put here: it is only the
   public address of your script, and the script itself holds the secrets.
   ===================================================================== */

"use strict";


/* =====================================================================
   1. SETTINGS  (EDIT HERE)
   ===================================================================== */

// Address of your Google Apps Script web app. It ends with /exec.
// Steps to get it are in SETUP-GUIDE.md, part 3.
const GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/AKfycbxU_t-01Pw-LkUNeVG2l76T1GZCWickPaZ1elm7kk3jqPPAd6uWV3uhDr6TCXUr0KDS/exec";

// Optional. Your GoHighLevel calendar link, for example:
//   https://api.leadconnectorhq.com/widget/booking/XXXXXXXXXXXX
// Leave it as "" if you paste the full embed code into index.html instead.
const GHL_CALENDAR_URL = "";

// Optional. A link to your profile picture (for example "images/profile.jpg").
const PROFILE_IMAGE_URL = "rencel.jpg";

// Written into the "Source" column of your Google Sheet for this form.
const FORM_SOURCE = "Portfolio Opt-In Form";

// Written into the "Booking Status" column for people who only used this form.
const FORM_BOOKING_STATUS = "Opt-in only";


/* =====================================================================
   2. SMALL HELPERS
   ===================================================================== */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

// True when a setting still has its placeholder text or is empty.
function isPlaceholder(value) {
  return !value || value.indexOf("YOUR_") === 0;
}


/* =====================================================================
   3. NAVIGATION (mobile menu button)
   Smooth scrolling itself is done in style.css.
   ===================================================================== */

(function setupNavigation() {
  const nav = $("#nav");
  const button = $("#navToggle");

  function closeMenu() {
    nav.setAttribute("data-open", "false");
    button.setAttribute("aria-expanded", "false");
    button.textContent = "Menu";
  }

  button.addEventListener("click", function () {
    const isOpen = nav.getAttribute("data-open") === "true";
    nav.setAttribute("data-open", isOpen ? "false" : "true");
    button.setAttribute("aria-expanded", isOpen ? "false" : "true");
    button.textContent = isOpen ? "Menu" : "Close";
  });

  // Close the menu after tapping a link
  $$("#navLinks a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });
})();


/* =====================================================================
   4. PROFILE PICTURE
   ===================================================================== */

(function setupProfileImage() {
  if (!PROFILE_IMAGE_URL) return;
  const image = $("#profileImage");
  image.onload = function () {
    image.hidden = false;
    $("#photoPlaceholder").hidden = true;
  };
  image.src = PROFILE_IMAGE_URL;
})();


/* =====================================================================
   5. PROJECT LINKS
   Buttons that still point to "#" are switched off so they do nothing
   confusing. Put a real link in index.html and the button starts working.
   ===================================================================== */

(function setupProjectLinks() {
  $$(".js-project-link").forEach(function (link) {
    const href = link.getAttribute("href");
    if (!href || href === "#") {
      link.setAttribute("aria-disabled", "true");
      link.title = "Add this project's link in index.html";
      link.addEventListener("click", function (event) { event.preventDefault(); });
    } else {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  });
})();


/* =====================================================================
   6. TERMIGUARD ILLUSTRATION
   Draws the little spectrum picture in the featured project card.
   It is decoration only. To use a real photo instead, replace the <svg>
   in index.html with an <img> (see the comment there).
   ===================================================================== */

(function drawSpectrum() {
  const svg = $("#spectrumSvg");
  if (!svg) return;

  const NS = "http://www.w3.org/2000/svg";
  const LEFT = 34, RIGHT = 546, BASE = 184, TOP = 24, BARS = 64;
  const barWidth = (RIGHT - LEFT) / BARS;

  // Convert a frequency in kHz (0 to 8) into a horizontal position
  const xFor = (khz) => LEFT + (khz / 8) * (RIGHT - LEFT);

  function add(tag, attrs, text) {
    const node = document.createElementNS(NS, tag);
    for (const name in attrs) node.setAttribute(name, attrs[name]);
    if (text) node.textContent = text;
    svg.appendChild(node);
  }

  svg.setAttribute("viewBox", "0 0 560 230");

  // Highlighted 3-5 kHz band
  add("rect", { x: xFor(3), y: TOP - 10, width: xFor(5) - xFor(3), height: BASE - TOP + 10, fill: "rgba(226,162,79,0.12)" });
  add("line", { x1: xFor(3), y1: TOP - 10, x2: xFor(3), y2: BASE, stroke: "rgba(226,162,79,0.5)", "stroke-dasharray": "3 4" });
  add("line", { x1: xFor(5), y1: TOP - 10, x2: xFor(5), y2: BASE, stroke: "rgba(226,162,79,0.5)", "stroke-dasharray": "3 4" });

  // Bars (fixed pattern, not real data)
  for (let i = 0; i < BARS; i++) {
    const khz = ((i + 0.5) / BARS) * 8;
    let noise = Math.abs(Math.sin(i * 12.9898 + 4.1) * 43758.5453);
    noise = noise - Math.floor(noise);
    const bump = Math.exp(-Math.pow((khz - 4) / 0.62, 2));
    const base = 0.09 + 0.2 * Math.exp(-khz / 2.2) + 0.07 * noise;
    const height = Math.min(0.97, base + bump * (0.5 + 0.28 * noise)) * (BASE - TOP);
    const inBand = khz >= 3 && khz <= 5;
    add("rect", { x: LEFT + i * barWidth + 1.5, y: BASE - height, width: barWidth - 3, height: height, rx: 1.5, fill: inBand ? "#e2a24f" : "#5d554a" });
  }

  // Axis
  add("line", { x1: LEFT, y1: BASE, x2: RIGHT, y2: BASE, stroke: "#3b352e" });
  [0, 2, 4, 6, 8].forEach(function (khz) {
    add("line", { x1: xFor(khz), y1: BASE, x2: xFor(khz), y2: BASE + 5, stroke: "#6f675c" });
    add("text", { x: xFor(khz), y: BASE + 22, "text-anchor": "middle", fill: "#a8a095", "font-size": 12, "font-family": "JetBrains Mono, monospace" }, khz + " kHz");
  });
  add("text", { x: (xFor(3) + xFor(5)) / 2, y: TOP - 14, "text-anchor": "middle", fill: "#e2a24f", "font-size": 12, "font-family": "JetBrains Mono, monospace" }, "3–5 kHz band");
})();

(function drawProjectIllustrations() {
  const NS = "http://www.w3.org/2000/svg";
 
  // One shared canvas size for every project picture
  const CANVAS = 260;
 
  // Adds one shape to a parent (an <svg> or a <g> group)
  function add(parent, tag, attrs, text) {
    const node = document.createElementNS(NS, tag);
    for (const name in attrs) node.setAttribute(name, attrs[name]);
    if (text) node.textContent = text;
    parent.appendChild(node);
    return node;
  }
 
  // Finds the svg and gives it the shared size rules
  function setup(id) {
    const svg = document.getElementById(id);
    if (!svg) return null;
    svg.setAttribute("viewBox", "0 0 " + CANVAS + " " + CANVAS);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.display = "block";
    svg.style.width = "100%";
    svg.style.height = "auto";
    svg.style.aspectRatio = "1 / 1";
    return svg;
  }
 
  /* -------------------------------------------------------------------
     A. CALAMSAYSAYAN - a friendly 2D cartoon character
     ------------------------------------------------------------------- */
  (function drawCharacter() {
    const svg = setup("calamsaysayanSvg");
    if (!svg) return;
 
    const SKIN = "#e8b98a", HAIR = "#2a2320", SHIRT = "#e2a24f";
    const SHIRT_DARK = "#c2873a", INK = "#1d1815";
 
    // The character was drawn on a 280 x 300 grid; this group shrinks it
    // to fit the shared square canvas and centers it.
    // ---- Round badge (same style as BINICON and Null Coffee) ----
    const DARKBAND = "#2b2118", AMBER = "#e2a24f", CREAM = "#f6e6d0";
 
    // Curved paths that the words will follow
    const defs = add(svg, "defs", {});
    add(defs, "path", { id: "calTopArc", d: "M 30 130 A 100 100 0 0 1 230 130" });
    add(defs, "path", { id: "calBottomArc", d: "M 10 130 A 120 120 0 0 0 250 130" });
    // Keeps the character and scenery inside the center circle
    const clip = add(defs, "clipPath", { id: "calClip" });
    add(clip, "circle", { cx: 130, cy: 130, r: 91 });
 
    // Rings: white edge, dark band, amber line, cream center
    add(svg, "circle", { cx: 130, cy: 130, r: 128, fill: "#fff" });
    add(svg, "circle", { cx: 130, cy: 130, r: 125, fill: DARKBAND });
    add(svg, "circle", { cx: 130, cy: 130, r: 119.5, fill: "none", stroke: AMBER, "stroke-width": 1.8 });
    add(svg, "circle", { cx: 130, cy: 130, r: 94, fill: AMBER });
    add(svg, "circle", { cx: 130, cy: 130, r: 91, fill: CREAM });
 
    // Scenery inside the center circle: sun, hills, ground
    const scene = add(svg, "g", { "clip-path": "url(#calClip)" });
    add(scene, "circle", { cx: 196, cy: 76, r: 16, fill: "#f4c978" });
    add(scene, "path", { d: "M30 196 L84 128 L108 154 L150 100 L186 152 L208 132 L232 196 Z", fill: "#8fae7a" });
    add(scene, "path", { d: "M150 100 L134 124 L146 120 L152 130 L160 118 L170 124 Z", fill: "#a9c493" });
    add(scene, "rect", { x: 30, y: 192, width: 200, height: 44, fill: "#b88a4a" });
 
    // The character (drawn on its own grid, then shrunk to fit the circle)
    const g = add(scene, "g", { transform: "translate(50 49) scale(0.52)" });
 
    // Soft ground shadow
    add(g, "ellipse", { cx: 140, cy: 280, rx: 78, ry: 10, fill: "rgba(0,0,0,0.25)" });
 
    // Legs and shoes
    add(g, "rect", { x: 106, y: 232, width: 24, height: 44, rx: 8, fill: "#3b352e" });
    add(g, "rect", { x: 150, y: 232, width: 24, height: 44, rx: 8, fill: "#3b352e" });
    add(g, "ellipse", { cx: 114, cy: 277, rx: 20, ry: 8, fill: INK });
    add(g, "ellipse", { cx: 166, cy: 277, rx: 20, ry: 8, fill: INK });
 
    // Left arm (resting)
    add(g, "rect", { x: 66, y: 156, width: 22, height: 70, rx: 11, fill: SHIRT_DARK, transform: "rotate(8 77 160)" });
    add(g, "circle", { cx: 70, cy: 228, r: 12, fill: SKIN });
 
    // Right arm (waving)
    add(g, "rect", { x: 192, y: 118, width: 22, height: 66, rx: 11, fill: SHIRT_DARK, transform: "rotate(-35 203 170)" });
    add(g, "circle", { cx: 230, cy: 112, r: 13, fill: SKIN });
 
    // Body / shirt
    add(g, "rect", { x: 92, y: 148, width: 96, height: 98, rx: 30, fill: SHIRT });
    add(g, "path", { d: "M118 148 Q140 172 162 148", fill: "none", stroke: SHIRT_DARK, "stroke-width": 5, "stroke-linecap": "round" });
 
    // Neck, ears, head
    add(g, "rect", { x: 128, y: 130, width: 24, height: 24, rx: 8, fill: SKIN });
    add(g, "circle", { cx: 88, cy: 98, r: 11, fill: SKIN });
    add(g, "circle", { cx: 192, cy: 98, r: 11, fill: SKIN });
    add(g, "ellipse", { cx: 140, cy: 92, rx: 54, ry: 56, fill: SKIN });
 
    // Hair
    add(g, "path", { d: "M86 90 Q84 36 140 34 Q198 36 194 90 Q176 62 140 64 Q104 62 86 90 Z", fill: HAIR });
    add(g, "path", { d: "M104 52 Q118 28 146 38 Q132 40 126 56 Z", fill: HAIR });
 
    // Eyes
    add(g, "ellipse", { cx: 120, cy: 96, rx: 6.5, ry: 8, fill: INK });
    add(g, "ellipse", { cx: 160, cy: 96, rx: 6.5, ry: 8, fill: INK });
    add(g, "circle", { cx: 122, cy: 93, r: 2.2, fill: "#fff" });
    add(g, "circle", { cx: 162, cy: 93, r: 2.2, fill: "#fff" });
 
    // Eyebrows
    add(g, "path", { d: "M110 80 Q120 74 130 79", fill: "none", stroke: HAIR, "stroke-width": 3.5, "stroke-linecap": "round" });
    add(g, "path", { d: "M150 79 Q160 74 170 80", fill: "none", stroke: HAIR, "stroke-width": 3.5, "stroke-linecap": "round" });
 
    // Cheeks, smile, nose
    add(g, "circle", { cx: 108, cy: 114, r: 8, fill: "rgba(226,100,90,0.35)" });
    add(g, "circle", { cx: 172, cy: 114, r: 8, fill: "rgba(226,100,90,0.35)" });
    add(g, "path", { d: "M122 116 Q140 134 158 116", fill: "#7a2e2a", stroke: INK, "stroke-width": 2.5, "stroke-linejoin": "round" });
    add(g, "path", { d: "M128 119 Q140 124 152 119 Q140 128 128 119 Z", fill: "#fff" });
    add(g, "path", { d: "M138 104 Q141 110 144 106", fill: "none", stroke: "#b98458", "stroke-width": 2.5, "stroke-linecap": "round" });
 
    // Curved words around the badge
    const word = {
      "text-anchor": "middle",
      "font-family": "'Alfa Slab One', 'Rockwell Extra Bold', Rockwell, Georgia, serif",
      "font-weight": 900,
      fill: CREAM,
      stroke: "#140e09",
      "stroke-width": 1.2,
      "paint-order": "stroke"
    };
    const top = add(svg, "text", Object.assign({ "font-size": 19, "letter-spacing": 1.5 }, word));
    const topPath = add(top, "textPath", { href: "#calTopArc", startOffset: "50%" }, "CALAMSAYSAYAN");
    topPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#calTopArc");
 
    const bottom = add(svg, "text", Object.assign({ "font-size": 17, "letter-spacing": 2.5 }, word));
    const bottomPath = add(bottom, "textPath", { href: "#calBottomArc", startOffset: "50%" }, "MYSTERY GAME");
    bottomPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#calBottomArc");
 
    // Small amber diamonds on the left and right of the badge
    add(svg, "path", { d: "M20 130 L26 124 L32 130 L26 136 Z", fill: AMBER });
    add(svg, "path", { d: "M228 130 L234 124 L240 130 L234 136 Z", fill: AMBER });
  })();
 
  /* -------------------------------------------------------------------
     B. BINICON - recreated from the logo
        (black badge, pink ring, coral retro lettering, cream sparkles)
     ------------------------------------------------------------------- */
  (function drawBinicon() {
    const svg = setup("biniconSvg");
    if (!svg) return;
 
    const PINK = "#ff5fc1", CORAL = "#ff5a64", CREAM = "#f6e6d0";
 
    // 4-point sparkle star centered on (cx, cy) with radius r
    function sparkle(cx, cy, r) {
      const d =
        "M" + cx + " " + (cy - r) +
        " Q" + cx + " " + cy + " " + (cx + r) + " " + cy +
        " Q" + cx + " " + cy + " " + cx + " " + (cy + r) +
        " Q" + cx + " " + cy + " " + (cx - r) + " " + cy +
        " Q" + cx + " " + cy + " " + cx + " " + (cy - r) + " Z";
      add(svg, "path", { d: d, fill: CREAM });
    }
 
    // Badge: pink ring, thin dark ring, black center
    add(svg, "circle", { cx: 130, cy: 130, r: 128, fill: PINK });
    add(svg, "circle", { cx: 130, cy: 130, r: 114, fill: "#2c2c2c" });
    add(svg, "circle", { cx: 130, cy: 130, r: 109, fill: "#000" });
 
    // Sparkles
    sparkle(120, 42, 15);
    sparkle(142, 30, 4.5);
    sparkle(136, 224, 19);
    sparkle(165, 236, 9);
    sparkle(154, 210, 4.5);
 
    // Lettering: coral fill, thick pink outline, tilted up to the right
    const font = "Chewy, 'Cooper Black', 'Arial Rounded MT Bold', 'Arial Black', sans-serif";
    const letters = {
      "text-anchor": "middle",
      "font-family": font,
      "font-weight": 900,
      "font-style": "italic",
      fill: CORAL,
      stroke: PINK,
      "stroke-width": 8,
      "stroke-linejoin": "round",
      "paint-order": "stroke"
    };
    add(svg, "text", Object.assign({ x: 130, y: 112, "font-size": 64, transform: "rotate(-9 130 130)" }, letters), "BINI");
    add(svg, "text", Object.assign({ x: 142, y: 178, "font-size": 72, transform: "rotate(-9 130 130)" }, letters), "CON");
  })();
 
  /* -------------------------------------------------------------------
     C. NULL COFFEE - recreated from the logo
        (green round badge, curved NULL / COFFEE text, cup, two beans)
     ------------------------------------------------------------------- */
  (function drawNullCoffee() {
    const svg = setup("nullCoffeeSvg");
    if (!svg) return;
 
    const GREEN = "#5b7a48", DARK = "#3a2314", BROWN = "#8a4a22", ORANGE = "#d98a45";
 
    // Curved paths that the words will follow
    const defs = add(svg, "defs", {});
    // Top arc: left to right over the top (letters point outward)
    add(defs, "path", { id: "nullTopArc", d: "M 30 130 A 100 100 0 0 1 230 130" });
    // Bottom arc: left to right under the bottom (letters point toward the center)
    add(defs, "path", { id: "nullBottomArc", d: "M 10 130 A 120 120 0 0 0 250 130" });
 
    // Badge: white edge, green band, white inner ring, light center
    add(svg, "circle", { cx: 130, cy: 130, r: 128, fill: "#fff" });
    add(svg, "circle", { cx: 130, cy: 130, r: 125, fill: GREEN });
    add(svg, "circle", { cx: 130, cy: 130, r: 119.5, fill: "none", stroke: "#fff", "stroke-width": 1.8 });
    add(svg, "circle", { cx: 130, cy: 130, r: 94, fill: "#fff" });
    add(svg, "circle", { cx: 130, cy: 130, r: 91, fill: "#e9e9e9" });
    add(svg, "ellipse", { cx: 112, cy: 92, rx: 56, ry: 36, fill: "rgba(255,255,255,0.55)" });
 
    // Curved words
    const word = {
      "text-anchor": "middle",
      "font-family": "'Alfa Slab One', 'Rockwell Extra Bold', Rockwell, Georgia, serif",
      "font-weight": 900,
      "font-size": 27,
      "letter-spacing": 2,
      fill: "#fff",
      stroke: "#2f3f23",
      "stroke-width": 1.4,
      "paint-order": "stroke"
    };
    const top = add(svg, "text", word);
    const topPath = add(top, "textPath", { href: "#nullTopArc", startOffset: "50%" }, "NULL");
    topPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#nullTopArc");
 
    const bottom = add(svg, "text", word);
    const bottomPath = add(bottom, "textPath", { href: "#nullBottomArc", startOffset: "50%" }, "COFFEE");
    bottomPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#nullBottomArc");
 
    // Coffee beans on the left and right of the badge
    function bean(cx, cy, angle) {
      const rot = "rotate(" + angle + " " + cx + " " + cy + ")";
      add(svg, "ellipse", { cx: cx, cy: cy, rx: 10, ry: 6.5, fill: "#5a3a22", transform: rot });
      add(svg, "path", { d: "M" + (cx - 8) + " " + cy + " Q" + cx + " " + (cy - 4) + " " + (cx + 8) + " " + cy, fill: "none", stroke: "#e8d3b0", "stroke-width": 1.4, transform: rot });
    }
    bean(26, 118, -12);
    bean(32, 136, 10);
    bean(234, 118, 12);
    bean(228, 136, -10);
 
    // ---- The cup (drawn inside the light center circle) ----
    // Saucer
    add(svg, "ellipse", { cx: 124, cy: 178, rx: 50, ry: 9, fill: ORANGE });
 
    // Cup bowl
    add(svg, "path", { d: "M76 108 Q78 168 128 172 Q178 168 180 108 Z", fill: BROWN });
    add(svg, "path", { d: "M138 112 Q178 120 168 150 Q156 168 128 172 Q150 150 138 112 Z", fill: "#6d3718", opacity: 0.55 });
 
    // Rim and coffee surface
    add(svg, "ellipse", { cx: 128, cy: 108, rx: 52, ry: 14, fill: DARK });
    add(svg, "ellipse", { cx: 128, cy: 108, rx: 45, ry: 10.5, fill: ORANGE });
    add(svg, "ellipse", { cx: 128, cy: 107, rx: 28, ry: 5.5, fill: "#ecaa66" });
 
    // Dark swirl (handle that flows into the saucer)
    add(svg, "path", { d: "M178 118 Q214 112 206 140 Q198 162 160 170", fill: "none", stroke: DARK, "stroke-width": 8, "stroke-linecap": "round" });
    add(svg, "path", { d: "M70 172 Q128 196 192 178", fill: "none", stroke: DARK, "stroke-width": 6, "stroke-linecap": "round" });
 
    // Splash above the cup
    add(svg, "path", { d: "M104 100 Q94 78 112 68 Q116 56 128 60 Q134 50 148 58 Q162 56 156 74 Q170 82 150 96 Q130 88 104 100 Z", fill: "#4a2a17" });
    add(svg, "path", { d: "M118 84 Q130 72 146 80", fill: "none", stroke: "#8a5a38", "stroke-width": 2, "stroke-linecap": "round" });
    add(svg, "circle", { cx: 166, cy: 66, r: 3, fill: "#4a2a17" });
    add(svg, "circle", { cx: 174, cy: 78, r: 2, fill: "#4a2a17" });
    add(svg, "circle", { cx: 96, cy: 86, r: 2.5, fill: "#4a2a17" });
  })();
})();
/* =====================================================================
   7. GOHIGHLEVEL (GHL) BOOKING CALENDAR
   Two ways to connect your calendar:
     A) Paste GHL's embed code into index.html (look for
        "GHL BOOKING CALENDAR EMBED HERE").
     B) Put your calendar link in GHL_CALENDAR_URL above.
   If neither is done, a placeholder box is shown.
   ===================================================================== */

(function setupGhlCalendar() {
  const body = $("#ghlBody");
  const placeholder = $("#ghlPlaceholder");
  if (!body || !placeholder) return;

  // Option A: embed code was pasted into the page
  if (body.querySelector("iframe")) {
    placeholder.hidden = true;
    return;
  }

  // Option B: build the calendar from the link
  if (!GHL_CALENDAR_URL) return;

  const frame = document.createElement("iframe");
  frame.src = GHL_CALENDAR_URL;
  frame.id = "ghl-calendar-frame";
  frame.title = "Book a consultation with Rencel";
  frame.scrolling = "no";
  frame.loading = "lazy";
  body.appendChild(frame);
  placeholder.hidden = true;

  // GoHighLevel's own helper script, which resizes the calendar to fit
  const helper = document.createElement("script");
  helper.src = "https://link.msgsndr.com/js/form_embed.js";
  helper.async = true;
  document.body.appendChild(helper);
})();


/* =====================================================================
   8. OPT-IN / CONTACT FORM  →  GOOGLE SHEETS
   What happens when someone presses Submit:
     1. The form is checked for mistakes.
     2. The details are sent to your Google Apps Script web app.
     3. The script adds a row to your Google Sheet.
     4. The visitor sees a success message.
   ===================================================================== */

(function setupOptInForm() {
  const form = $("#optinForm");
  if (!form) return;

  const statusLine = $("#formStatus");
  const submitButton = $("#submitBtn");
  const successBox = $("#formSuccess");

  function showStatus(message, isError) {
    statusLine.textContent = message;
    if (isError) statusLine.setAttribute("data-tone", "error");
    else statusLine.removeAttribute("data-tone");
  }

  // Returns an error message, or "" when everything looks fine
  function validate(values) {
    $$("#optinForm .invalid").forEach(function (el) { el.classList.remove("invalid"); });

    function fail(id, message) {
      const field = document.getElementById(id);
      if (field) { field.classList.add("invalid"); field.focus(); }
      return message;
    }

    if (values.fullName.length < 2) return fail("fullName", "Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) return fail("email", "Please enter a valid email address.");
    if (values.phone.replace(/\D/g, "").length < 7) return fail("phone", "Please enter a valid phone number.");
    if (values.message.length < 5) return fail("message", "Please write a short message.");
    if (!$("#consent").checked) return fail("consent", "Please tick the box to agree to be contacted.");
    return "";
  }

  // Sends the data to Google Apps Script. Throws an error if it fails.
  async function sendToGoogleSheets(values) {
    const payload = new URLSearchParams({
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      message: values.message,
      consent: "Yes",
      source: FORM_SOURCE,
      bookingStatus: FORM_BOOKING_STATUS
    });

    const response = await fetch(GOOGLE_SHEETS_API_URL, { method: "POST", body: payload });
    const result = await response.json();
    if (result.result !== "success") {
      throw new Error(result.message || "The form could not be saved.");
    }
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    showStatus("", false);

    const values = {
      fullName: $("#fullName").value.trim(),
      email: $("#email").value.trim(),
      phone: $("#phone").value.trim(),
      message: $("#message").value.trim()
    };

    // Spam trap: bots fill the hidden field, people never see it.
    // We act as if it worked so bots get no clue, but nothing is sent.
    if ($("#website").value) {
      form.hidden = true;
      successBox.hidden = false;
      return;
    }

    const problem = validate(values);
    if (problem) { showStatus(problem, true); return; }

    if (isPlaceholder(GOOGLE_SHEETS_API_URL)) {
      showStatus("This form isn't connected to Google Sheets yet. Add your Apps Script URL to script.js (see SETUP-GUIDE.md).", true);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    try {
      await sendToGoogleSheets(values);
      const firstName = values.fullName.split(" ")[0];
      $("#successName").textContent = firstName ? ", " + firstName : "";
      form.hidden = true;
      successBox.hidden = false;
      form.reset();
    } catch (error) {
      console.error("Form error:", error);
      showStatus("Sorry, something went wrong and your message wasn't saved. Please try again, or contact me using the details below.", true);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Submit";
    }
  });

  // "Send another message" button on the success card
  $("#sendAnother").addEventListener("click", function () {
    successBox.hidden = true;
    form.hidden = false;
    showStatus("", false);
  });
})();
