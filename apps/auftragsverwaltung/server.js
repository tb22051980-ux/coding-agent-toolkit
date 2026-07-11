#!/usr/bin/env node
/*
 * Auftragsverwaltung für Handwerk, Transport & Umzug — PC-Programm (Heimnetz-Server)
 *
 * Start:   node server.js        (Doppelklick auf start-windows.bat geht auch)
 * Danach:  am PC     http://localhost:8722
 *          am Handy  http://<PC-Adresse>:8722   (wird beim Start angezeigt)
 *
 * Speichert alle Daten und Fotos im Ordner ./daten neben dieser Datei.
 * Braucht nur Node.js — keine weiteren Pakete, kein Internet.
 */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

// Läuft dieses Programm als fertige Exe (Node Single Executable Application)?
let seaModul = null;
try {
  const sea = require("node:sea");
  if (sea.isSea()) seaModul = sea;
} catch { /* normaler node-Start */ }

function assetLaden(name) {
  if (seaModul) return Buffer.from(seaModul.getAsset(name));
  return fs.readFileSync(path.join(__dirname, name));
}

// Web-App-Manifest: macht die Seite auf Android („App installieren“)
// und iPhone („Zum Home-Bildschirm“) zu einer Vollbild-App mit Icon.
const MANIFEST = JSON.stringify({
  name: "Auftragsverwaltung",
  short_name: "Aufträge",
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: "#f4f6f8",
  theme_color: "#1d5c8f",
  icons: [
    { src: "/icon-180.png", sizes: "180x180", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
  ],
});

// Datenablage: neben dem Programm, wenn dort geschrieben werden darf
// (z. B. C:\MeinBetrieb); sonst im Benutzerprofil (z. B. bei
// Installation unter C:\Programme).
function datenBasisWaehlen() {
  const kandidaten = [seaModul ? path.dirname(process.execPath) : __dirname];
  const profil = process.env.LOCALAPPDATA || path.join(os.homedir(), ".auftragsverwaltung");
  kandidaten.push(path.join(profil, "Auftragsverwaltung"));
  for (const basis of kandidaten) {
    try {
      const ordner = path.join(basis, "daten");
      fs.mkdirSync(path.join(ordner, "fotos"), { recursive: true });
      fs.writeFileSync(path.join(ordner, ".schreibtest"), "ok");
      fs.unlinkSync(path.join(ordner, ".schreibtest"));
      return ordner;
    } catch { /* nächsten Kandidaten versuchen */ }
  }
  throw new Error("Kein beschreibbarer Datenordner gefunden");
}

const PORT = Number(process.env.PORT) || 8722;
const DATEN_ORDNER = datenBasisWaehlen();
const FOTO_ORDNER = path.join(DATEN_ORDNER, "fotos");
const DATEN_DATEI = path.join(DATEN_ORDNER, "daten.json");
const MAX_KOERPER = 25 * 1024 * 1024; // 25 MB (Fotos kommen als Base64)

function antwortJson(res, code, objekt) {
  const text = JSON.stringify(objekt);
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(text);
}

function koerperLesen(req) {
  return new Promise((aufloesen, ablehnen) => {
    const teile = [];
    let groesse = 0;
    req.on("data", (stueck) => {
      groesse += stueck.length;
      if (groesse > MAX_KOERPER) { ablehnen(new Error("Anfrage zu groß")); req.destroy(); return; }
      teile.push(stueck);
    });
    req.on("end", () => aufloesen(Buffer.concat(teile)));
    req.on("error", ablehnen);
  });
}

// Nur unsere eigenen IDs zulassen (Buchstaben/Ziffern) — kein Pfad-Ausbruch möglich
function gueltigeFotoId(id) {
  return typeof id === "string" && /^[a-z0-9]{6,40}$/i.test(id);
}

function datenSchreiben(puffer) {
  // Erst in Temp-Datei, dann umbenennen: bei Stromausfall bleibt der alte Stand erhalten
  const tmp = DATEN_DATEI + ".tmp";
  fs.writeFileSync(tmp, puffer);
  fs.renameSync(tmp, DATEN_DATEI);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://x");
    const pfad = url.pathname;

    // CORS: erlaubt der Handy-App (eingebaute Oberfläche, anderer Ursprung)
    // den Zugriff auf die API im Heimnetz
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    // Chrome „Private Network Access“: App-Oberfläche (öffentlicher Ursprung)
    // darf auf diese Heimnetz-Adresse zugreifen
    res.setHeader("Access-Control-Allow-Private-Network", "true");
    if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

    // ---- App ausliefern ----
    if (req.method === "GET" && (pfad === "/" || pfad === "/index.html")) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      res.end(assetLaden("index.html"));
      return;
    }
    if (req.method === "GET" && pfad === "/manifest.webmanifest") {
      res.writeHead(200, { "Content-Type": "application/manifest+json; charset=utf-8", "Cache-Control": "no-store" });
      res.end(MANIFEST);
      return;
    }
    if (req.method === "GET" && (pfad === "/icon-180.png" || pfad === "/icon-512.png")) {
      res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" });
      res.end(assetLaden(pfad.slice(1)));
      return;
    }

    // ---- API ----
    if (pfad === "/api/status" && req.method === "GET") {
      antwortJson(res, 200, { ok: true, zeit: new Date().toISOString() });
      return;
    }

    if (pfad === "/api/daten") {
      if (req.method === "GET") {
        if (!fs.existsSync(DATEN_DATEI)) { antwortJson(res, 200, null); return; }
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
        res.end(fs.readFileSync(DATEN_DATEI));
        return;
      }
      if (req.method === "PUT") {
        const koerper = await koerperLesen(req);
        let geparst;
        try { geparst = JSON.parse(koerper.toString("utf8")); } catch { antwortJson(res, 400, { fehler: "Kein gültiges JSON" }); return; }
        if (!geparst || !Array.isArray(geparst.kunden) || !Array.isArray(geparst.auftraege)) {
          antwortJson(res, 400, { fehler: "Unerwartetes Datenformat" });
          return;
        }
        datenSchreiben(koerper);
        antwortJson(res, 200, { ok: true });
        return;
      }
    }

    if (pfad === "/api/fotos" && req.method === "POST") {
      const koerper = await koerperLesen(req);
      let geparst;
      try { geparst = JSON.parse(koerper.toString("utf8")); } catch { antwortJson(res, 400, { fehler: "Kein gültiges JSON" }); return; }
      const { id, datenUrl } = geparst || {};
      const treffer = typeof datenUrl === "string" && datenUrl.match(/^data:image\/jpeg;base64,(.+)$/s);
      if (!gueltigeFotoId(id) || !treffer) { antwortJson(res, 400, { fehler: "Erwartet: { id, datenUrl (JPEG als data-URL) }" }); return; }
      fs.writeFileSync(path.join(FOTO_ORDNER, id + ".jpg"), Buffer.from(treffer[1], "base64"));
      antwortJson(res, 200, { ok: true, id });
      return;
    }

    const fotoTreffer = pfad.match(/^\/api\/fotos\/([a-z0-9]{6,40})$/i);
    if (fotoTreffer) {
      const datei = path.join(FOTO_ORDNER, fotoTreffer[1] + ".jpg");
      if (req.method === "GET") {
        if (!fs.existsSync(datei)) { antwortJson(res, 404, { fehler: "Foto nicht vorhanden" }); return; }
        res.writeHead(200, { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=86400" });
        res.end(fs.readFileSync(datei));
        return;
      }
      if (req.method === "DELETE") {
        if (fs.existsSync(datei)) fs.unlinkSync(datei);
        antwortJson(res, 200, { ok: true });
        return;
      }
    }

    antwortJson(res, 404, { fehler: "Unbekannter Pfad: " + pfad });
  } catch (fehler) {
    antwortJson(res, 500, { fehler: String(fehler.message || fehler) });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("🛠️ Auftragsverwaltung läuft (Handwerk, Transport & Umzug).");
  console.log("   Daten liegen in: " + DATEN_ORDNER);
  console.log("");
  console.log("   Am PC öffnen:    http://localhost:" + PORT);
  const netze = os.networkInterfaces();
  for (const name of Object.keys(netze)) {
    for (const eintrag of netze[name] || []) {
      if (eintrag.family === "IPv4" && !eintrag.internal) {
        console.log("   Am Handy öffnen: http://" + eintrag.address + ":" + PORT + "   (gleiches WLAN nötig)");
      }
    }
  }
  console.log("");
  console.log("   Fenster offen lassen. Beenden mit Strg+C.");

  // Beim Doppelklick auf die Exe direkt den Browser öffnen
  if (seaModul && process.platform === "win32") {
    spawn("cmd", ["/c", "start", "", "http://localhost:" + PORT], { detached: true, stdio: "ignore" }).unref();
  }
});

server.on("error", (fehler) => {
  if (fehler.code === "EADDRINUSE") {
    console.error("Das Programm läuft offenbar schon (Port " + PORT + " ist belegt).");
    console.error("Einfach im Browser http://localhost:" + PORT + " öffnen.");
    if (process.platform === "win32" && process.stdin.isTTY) {
      console.error("Dieses Fenster kann geschlossen werden.");
      setTimeout(() => process.exit(1), 15000);
      return;
    }
  } else {
    console.error("Start fehlgeschlagen:", fehler.message);
  }
  process.exit(1);
});
