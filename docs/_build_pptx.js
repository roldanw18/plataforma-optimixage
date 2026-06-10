const path = require("path");
const GLOBAL = path.join(process.env.APPDATA || "", "npm", "node_modules");
require("module").globalPaths.push(GLOBAL);
const pptxgen = require(path.join(GLOBAL, "pptxgenjs"));
const React = require(path.join(GLOBAL, "react"));
const ReactDOMServer = require(path.join(GLOBAL, "react-dom/server"));
const sharp = require(path.join(GLOBAL, "sharp"));
const FA = require(path.join(GLOBAL, "react-icons/fa"));

// ---------- Palette (Tech / Ocean executive) ----------
const NAVY = "0B1F3A";      // primary dark
const NAVY2 = "12355B";     // panel dark
const TEAL = "00A896";      // accent
const BLUE = "2E6FB7";      // secondary
const LIGHT = "F4F6FB";     // content bg
const CARD = "FFFFFF";
const INK = "1E2A3A";       // body text on light
const MUTE = "64748B";      // muted
const ICE = "CADCFC";       // light text on dark

const HFONT = "Georgia";
const BFONT = "Calibri";

const W = 13.33, H = 7.5;

async function icon(IconComponent, color = "#FFFFFF", size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

const pres = new pptxgen();
pres.defineLayout({ name: "WIDE", width: W, height: H });
pres.layout = "WIDE";
pres.author = "Wbeimar";
pres.title = "Sustentación Práctica Profesional — Optimixage";

const sh = () => ({ type: "outer", color: "0B1F3A", blur: 9, offset: 3, angle: 135, opacity: 0.18 });

// header band for content slides
function contentHeader(slide, kicker, title) {
  slide.background = { color: LIGHT };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 1.25, fill: { color: NAVY } });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.25, w: W, h: 0.06, fill: { color: TEAL } });
  slide.addText(kicker.toUpperCase(), { x: 0.6, y: 0.2, w: 11, h: 0.3, fontFace: BFONT, fontSize: 11, color: TEAL, bold: true, charSpacing: 3, margin: 0 });
  slide.addText(title, { x: 0.6, y: 0.46, w: 12.1, h: 0.7, fontFace: HFONT, fontSize: 28, color: "FFFFFF", bold: true, margin: 0 });
}

function pageFooter(slide, n) {
  slide.addText("Optimixage · Práctica Profesional de Ingeniería de Software", { x: 0.6, y: 7.05, w: 9, h: 0.3, fontFace: BFONT, fontSize: 9, color: MUTE, margin: 0 });
  slide.addText(String(n), { x: 12.4, y: 7.05, w: 0.5, h: 0.3, fontFace: BFONT, fontSize: 9, color: MUTE, align: "right", margin: 0 });
}

// rounded card
function card(slide, x, y, w, h, fill = CARD) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, rectRadius: 0.08, shadow: sh() });
}

(async () => {
  const I = {
    user: await icon(FA.FaUserTie, "#FFFFFF"),
    build: await icon(FA.FaLayerGroup, "#" + TEAL),
    problem: await icon(FA.FaExclamationTriangle, "#" + TEAL),
    target: await icon(FA.FaBullseye, "#" + TEAL),
    arch: await icon(FA.FaSitemap, "#" + TEAL),
    stack: await icon(FA.FaCubes, "#" + TEAL),
    feat: await icon(FA.FaThList, "#" + TEAL),
    bug: await icon(FA.FaBug, "#" + TEAL),
    star: await icon(FA.FaStar, "#" + TEAL),
    skills: await icon(FA.FaGraduationCap, "#" + TEAL),
    chart: await icon(FA.FaChartLine, "#" + TEAL),
    bulb: await icon(FA.FaLightbulb, "#" + TEAL),
    flag: await icon(FA.FaFlagCheckered, "#" + TEAL),
    chat: await icon(FA.FaRegCommentDots, "#FFFFFF"),
    // small white icons for stack circles
    server: await icon(FA.FaServer, "#FFFFFF"),
    react: await icon(FA.FaReact, "#FFFFFF"),
    db: await icon(FA.FaDatabase, "#FFFFFF"),
    docker: await icon(FA.FaDocker, "#FFFFFF"),
    git: await icon(FA.FaGitAlt, "#FFFFFF"),
    lock: await icon(FA.FaLock, "#FFFFFF"),
    globe: await icon(FA.FaGlobe, "#FFFFFF"),
    cogs: await icon(FA.FaCogs, "#FFFFFF"),
    check: await icon(FA.FaCheckCircle, "#" + TEAL),
    code: await icon(FA.FaCode, "#FFFFFF"),
    shot: await icon(FA.FaRegImage, "#8FA0B6"),
    rocket: await icon(FA.FaRocket, "#FFFFFF"),
    clipboard: await icon(FA.FaClipboardList, "#" + TEAL),
    flow: await icon(FA.FaStream, "#" + TEAL),
    tools: await icon(FA.FaTools, "#FFFFFF"),
    branch: await icon(FA.FaCodeBranch, "#FFFFFF"),
    cloud: await icon(FA.FaCloud, "#FFFFFF"),
    github: await icon(FA.FaGithub, "#FFFFFF"),
    paper: await icon(FA.FaPaperPlane, "#FFFFFF"),
    serverW: await icon(FA.FaServer, "#" + NAVY),
  };

  // ---- screenshot placeholder frame (labeled, swap real image later) ----
  function shotFrame(slide, x, y, w, h, label, caption) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: "E9EEF6" }, line: { color: "BFCBDD", width: 1 }, rectRadius: 0.06, shadow: sh() });
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.05, y: y + 0.05, w: w - 0.1, h: 0.3, fill: { color: "D5DEEB" }, line: { color: "D5DEEB", width: 0 }, rectRadius: 0.04 });
    ["DB6A5B", "E0B24C", "5FB573"].forEach((c, i) => {
      slide.addShape(pres.shapes.OVAL, { x: x + 0.22 + i * 0.2, y: y + 0.14, w: 0.1, h: 0.1, fill: { color: c } });
    });
    slide.addImage({ data: I.shot, x: x + w / 2 - 0.28, y: y + h / 2 - 0.4, w: 0.56, h: 0.56 });
    slide.addText(label, { x: x + 0.2, y: y + h / 2 + 0.22, w: w - 0.4, h: 0.4, align: "center", fontFace: BFONT, fontSize: 12.5, color: "5B6B82", bold: true, margin: 0 });
    if (caption) {
      slide.addText(caption, { x: x + 0.1, y: y + h + 0.05, w: w - 0.2, h: 0.4, align: "center", fontFace: BFONT, fontSize: 11, color: MUTE, margin: 0 });
    }
  }

  // ---- sprint narrative slide (objetivo + qué construí + retos) ----
  function sprintNarrative(slide, num, dates, title, objetivo, hechos, retos, pageNo) {
    contentHeader(slide, "Sprint " + num + " · " + dates, "Sprint " + num + " — " + title);
    card(slide, 0.6, 1.6, 12.13, 0.95, NAVY);
    slide.addShape(pres.shapes.OVAL, { x: 0.85, y: 1.78, w: 0.6, h: 0.6, fill: { color: TEAL } });
    slide.addText(String(num), { x: 0.85, y: 1.78, w: 0.6, h: 0.6, align: "center", valign: "middle", fontFace: HFONT, fontSize: 22, color: "FFFFFF", bold: true, margin: 0 });
    slide.addText([
      { text: "Objetivo:  ", options: { bold: true, color: TEAL } },
      { text: objetivo, options: { color: ICE } },
    ], { x: 1.65, y: 1.6, w: 10.9, h: 0.95, fontFace: BFONT, fontSize: 13.5, valign: "middle", margin: 0 });
    // left: qué construí
    card(slide, 0.6, 2.75, 7.4, 3.75);
    slide.addText("Qué construí", { x: 0.9, y: 2.92, w: 6.8, h: 0.4, fontFace: HFONT, fontSize: 17, color: NAVY, bold: true, margin: 0 });
    let hy = 3.46;
    hechos.forEach((t) => {
      slide.addImage({ data: I.check, x: 0.92, y: hy + 0.02, w: 0.26, h: 0.26 });
      slide.addText(t, { x: 1.3, y: hy - 0.04, w: 6.55, h: 0.56, fontFace: BFONT, fontSize: 12, color: INK, valign: "middle", margin: 0 });
      hy += 0.62;
    });
    // right: retos resueltos
    card(slide, 8.2, 2.75, 4.53, 3.75, NAVY);
    slide.addText("Retos resueltos", { x: 8.5, y: 2.92, w: 4.0, h: 0.4, fontFace: HFONT, fontSize: 17, color: "FFFFFF", bold: true, margin: 0 });
    const rh = (3.75 - 0.85) / retos.length;
    let ry = 3.5;
    retos.forEach((r) => {
      slide.addImage({ data: I.bug, x: 8.5, y: ry + 0.02, w: 0.28, h: 0.28 });
      slide.addText(r[0], { x: 8.86, y: ry - 0.02, w: 3.65, h: 0.35, fontFace: BFONT, fontSize: 12.5, color: TEAL, bold: true, margin: 0 });
      slide.addText(r[1], { x: 8.5, y: ry + 0.38, w: 4.0, h: rh - 0.5, fontFace: BFONT, fontSize: 11, color: ICE, margin: 0 });
      ry += rh;
    });
    pageFooter(slide, pageNo);
  }

  // ---- sprint screenshots slide (2x2 placeholder frames) ----
  function sprintShots(slide, num, intro, shots, pageNo) {
    contentHeader(slide, "Sprint " + num + " · validación", "Sprint " + num + " — validación y capturas");
    slide.addText(intro, { x: 0.6, y: 1.5, w: 12.1, h: 0.5, fontFace: BFONT, fontSize: 14, color: INK, italic: true, margin: 0 });
    const fw = 5.85, fh = 1.78;
    shots.forEach((sc, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 0.6 + col * 6.28, y = 2.1 + row * 2.4;
      shotFrame(slide, x, y, fw, fh, sc[0], sc[1]);
    });
    pageFooter(slide, pageNo);
  }

  // ============ SLIDE 1 — PORTADA ============
  let s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.22, h: H, fill: { color: TEAL } });
  s.addShape(pres.shapes.OVAL, { x: 9.6, y: -2.2, w: 6.5, h: 6.5, fill: { color: NAVY2 } });
  s.addShape(pres.shapes.OVAL, { x: 11.2, y: 3.6, w: 4.2, h: 4.2, fill: { color: NAVY2 } });
  s.addImage({ data: I.code, x: 0.9, y: 0.95, w: 0.62, h: 0.62 });
  s.addText("OPTIMIXAGE S.A.S.", { x: 1.65, y: 1.0, w: 8, h: 0.5, fontFace: BFONT, fontSize: 14, color: ICE, bold: true, charSpacing: 4, valign: "middle", margin: 0 });
  s.addText("Plataforma de Seguimiento de Proyectos", { x: 0.9, y: 2.35, w: 11, h: 0.9, fontFace: HFONT, fontSize: 40, color: "FFFFFF", bold: true, margin: 0 });
  s.addText("Sustentación de Práctica Profesional · Ingeniería de Software", { x: 0.92, y: 3.35, w: 11, h: 0.5, fontFace: BFONT, fontSize: 18, color: TEAL, margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 0.95, y: 4.25, w: 5.2, h: 0, line: { color: "3A5378", width: 1 } });
  s.addText([
    { text: "Practicante:  ", options: { color: ICE } },
    { text: "Wbeimar", options: { color: "FFFFFF", bold: true } },
  ], { x: 0.92, y: 4.45, w: 8, h: 0.4, fontFace: BFONT, fontSize: 16, margin: 0 });
  s.addText("Stack: FastAPI · React 19 · PostgreSQL/Supabase · Docker · GitHub Actions", { x: 0.92, y: 5.0, w: 11, h: 0.4, fontFace: BFONT, fontSize: 13, color: ICE, margin: 0 });
  s.addText("3 sprints · marzo – mayo 2026", { x: 0.92, y: 5.4, w: 11, h: 0.4, fontFace: BFONT, fontSize: 13, color: MUTE, margin: 0 });
  s.addNotes("OBJETIVO: Abrir con presencia profesional y dejar claro el marco (empresa, proyecto, rol).\nTIEMPO: 0:45.\nGUION: \"Buenas, soy Wbeimar. Durante mi práctica en Optimixage desarrollé esta plataforma full-stack de seguimiento de proyectos. Hoy les mostraré no solo el sistema, sino lo que construí, resolví y aprendí.\"");

  // ============ SLIDE 2 — PRESENTACIÓN PERSONAL ============
  s = pres.addSlide();
  contentHeader(s, "Quién soy", "Presentación personal");
  // left photo/initial panel
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.7, w: 3.8, h: 4.9, fill: { color: NAVY }, rectRadius: 0.1, shadow: sh() });
  s.addShape(pres.shapes.OVAL, { x: 1.85, y: 2.15, w: 1.3, h: 1.3, fill: { color: TEAL } });
  s.addImage({ data: I.user, x: 2.18, y: 2.48, w: 0.64, h: 0.64 });
  s.addText("Wbeimar", { x: 0.7, y: 3.55, w: 3.6, h: 0.5, align: "center", fontFace: HFONT, fontSize: 24, color: "FFFFFF", bold: true, margin: 0 });
  s.addText("Practicante de Ingeniería\nde Software — Desarrollo Full-Stack", { x: 0.7, y: 4.05, w: 3.6, h: 0.8, align: "center", fontFace: BFONT, fontSize: 13, color: ICE, margin: 0 });
  s.addText([
    { text: "72 / 76", options: { fontSize: 30, bold: true, color: "FFFFFF", breakLine: true } },
    { text: "commits del proyecto son míos", options: { fontSize: 12, color: ICE } },
  ], { x: 0.7, y: 5.0, w: 3.6, h: 1.2, align: "center", margin: 0 });

  const rows2 = [
    ["Rol", "Desarrollador principal del producto (backend, frontend, BD y DevOps)."],
    ["Enfoque", "Construir software real, no prototipos: portable, versionado y desplegable."],
    ["Modo de trabajo", "SCRUM con sprints documentados; iniciativa proactiva para añadir valor."],
    ["Meta de la práctica", "Pasar de aprender tecnologías a entregar un producto de extremo a extremo."],
  ];
  let yy = 1.85;
  rows2.forEach(([k, v]) => {
    card(s, 4.75, yy, 8.0, 1.05);
    s.addShape(pres.shapes.RECTANGLE, { x: 4.75, y: yy, w: 0.08, h: 1.05, fill: { color: TEAL } });
    s.addText(k, { x: 5.0, y: yy + 0.12, w: 7.6, h: 0.3, fontFace: BFONT, fontSize: 13, color: BLUE, bold: true, margin: 0 });
    s.addText(v, { x: 5.0, y: yy + 0.44, w: 7.55, h: 0.5, fontFace: BFONT, fontSize: 13, color: INK, margin: 0 });
    yy += 1.18;
  });
  pageFooter(s, 2);
  s.addNotes("OBJETIVO: Posicionarme como autor real del trabajo, no un observador.\nTIEMPO: 1:00.\nGUION: Recalcar el dato objetivo de 72/76 commits — yo fui el ejecutor del producto, con supervisión de la empresa.");

  // ============ SLIDE 3 — EMPRESA Y CONTEXTO ============
  s = pres.addSlide();
  contentHeader(s, "Contexto", "La empresa y el encargo");
  card(s, 0.6, 1.7, 5.9, 4.9);
  s.addText("Optimixage S.A.S.", { x: 0.95, y: 1.95, w: 5.2, h: 0.5, fontFace: HFONT, fontSize: 22, color: NAVY, bold: true, margin: 0 });
  s.addText("Consultora que acompaña a sus clientes a lo largo de proyectos por etapas. La relación con el cliente es el activo central del negocio.", { x: 0.95, y: 2.5, w: 5.25, h: 1.0, fontFace: BFONT, fontSize: 14, color: INK, margin: 0 });
  ["Primer contacto", "Diagnóstico", "Capacitación", "Desarrollo", "Entrega"].forEach((e, i) => {
    const cy = 3.65 + i * 0.56;
    s.addShape(pres.shapes.OVAL, { x: 0.98, y: cy, w: 0.34, h: 0.34, fill: { color: TEAL } });
    s.addText(String(i + 1), { x: 0.98, y: cy, w: 0.34, h: 0.34, align: "center", valign: "middle", fontFace: BFONT, fontSize: 12, color: "FFFFFF", bold: true, margin: 0 });
    s.addText(e, { x: 1.45, y: cy, w: 4.8, h: 0.34, valign: "middle", fontFace: BFONT, fontSize: 14, color: INK, margin: 0 });
  });
  // right — the gap
  card(s, 6.75, 1.7, 6.0, 4.9, NAVY);
  s.addText("El encargo", { x: 7.1, y: 1.95, w: 5.3, h: 0.5, fontFace: HFONT, fontSize: 22, color: "FFFFFF", bold: true, margin: 0 });
  s.addText([
    { text: "Construir desde cero una plataforma web que centralice el seguimiento de cada proyecto y la comunicación con el cliente.", options: { breakLine: true, paraSpaceAfter: 10 } },
    { text: "Antes:", options: { bold: true, color: TEAL, breakLine: true } },
    { text: "avance, documentos y mensajes vivían dispersos en correos, llamadas y archivos sueltos.", options: { breakLine: true, paraSpaceAfter: 10 } },
    { text: "Después:", options: { bold: true, color: TEAL, breakLine: true } },
    { text: "un único sistema, con roles, trazabilidad y visibilidad en tiempo real.", options: {} },
  ], { x: 7.1, y: 2.5, w: 5.35, h: 3.8, fontFace: BFONT, fontSize: 14.5, color: ICE, margin: 0 });
  pageFooter(s, 3);
  s.addNotes("OBJETIVO: Que el jurado entienda el negocio y por qué el proyecto importa.\nTIEMPO: 1:00.\nGUION: Las 5 etapas son el dominio del negocio; todo el sistema gira en torno a hacerlas visibles para el cliente.");

  // ============ SLIDE 4 — PROBLEMA ============
  s = pres.addSlide();
  contentHeader(s, "Problema", "El problema que identifiqué");
  s.addShape(pres.shapes.OVAL, { x: 0.6, y: 1.75, w: 0.7, h: 0.7, fill: { color: NAVY } });
  s.addImage({ data: I.problem, x: 0.74, y: 1.89, w: 0.42, h: 0.42 });
  s.addText("Sin una plataforma, la consultora no podía dar visibilidad ni trazabilidad del avance — y el cliente quedaba a ciegas entre reuniones.", { x: 1.5, y: 1.75, w: 11.2, h: 0.8, fontFace: BFONT, fontSize: 16, color: INK, italic: true, margin: 0 });
  const probs = [
    ["Información dispersa", "Avance, documentos y mensajes repartidos en correos y archivos sueltos."],
    ["Sin trazabilidad", "Imposible saber quién cambió qué y cuándo en el proyecto."],
    ["Comunicación frágil", "Sin un canal único; el cliente perdía contexto entre reuniones."],
    ["Sin control de acceso", "No había forma de que cada cliente viera solo lo suyo."],
    ["Proceso manual", "Cada actualización dependía de enviar correos a mano."],
    ["No reproducible", "Nada empaquetado: difícil de instalar, versionar o desplegar."],
  ];
  let px = 0.6, py = 2.85;
  probs.forEach((p, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.6 + col * 4.12, y = 2.85 + row * 1.85;
    card(s, x, y, 3.85, 1.65);
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 3.85, h: 0.08, fill: { color: TEAL } });
    s.addText(p[0], { x: x + 0.25, y: y + 0.2, w: 3.4, h: 0.4, fontFace: BFONT, fontSize: 15, color: NAVY, bold: true, margin: 0 });
    s.addText(p[1], { x: x + 0.25, y: y + 0.62, w: 3.4, h: 0.9, fontFace: BFONT, fontSize: 12.5, color: MUTE, margin: 0 });
  });
  pageFooter(s, 4);
  s.addNotes("OBJETIVO: Justificar la necesidad del proyecto con problemas concretos.\nTIEMPO: 1:00.\nGUION: Estos seis dolores definieron los requisitos. Cada funcionalidad que verán responde a uno de ellos.");

  // ============ SLIDE 5 — OBJETIVO ============
  s = pres.addSlide();
  contentHeader(s, "Objetivo", "Objetivo del proyecto");
  card(s, 0.6, 1.75, 12.13, 1.5, NAVY);
  s.addImage({ data: I.target, x: 0.95, y: 2.05, w: 0.9, h: 0.9 });
  s.addText("Desarrollar una plataforma web full-stack, segura y reproducible, que centralice el seguimiento de proyectos por etapas y la comunicación entre la consultora y sus clientes.", { x: 2.1, y: 1.95, w: 10.4, h: 1.1, fontFace: HFONT, fontSize: 18, color: "FFFFFF", bold: true, valign: "middle", margin: 0 });
  const objs = [
    ["Seguridad", "Autenticación JWT, roles y control de acceso por usuario.", I.lock],
    ["Centralización", "Proyectos, documentos, chat, reuniones y notificaciones en un lugar.", I.feat],
    ["Trazabilidad", "Historial de etapas y auditoría de cada cambio relevante.", I.chart],
    ["Reproducibilidad", "Docker, CI/CD y despliegue en la nube (Supabase).", I.docker],
  ];
  objs.forEach((o, i) => {
    const x = 0.6 + i * 3.04;
    card(s, x, 3.55, 2.85, 3.0);
    s.addShape(pres.shapes.OVAL, { x: x + 1.0, y: 3.85, w: 0.85, h: 0.85, fill: { color: NAVY } });
    s.addImage({ data: o[2], x: x + 1.18, y: 4.03, w: 0.49, h: 0.49 });
    s.addText(o[0], { x: x + 0.15, y: 4.85, w: 2.55, h: 0.4, align: "center", fontFace: BFONT, fontSize: 16, color: BLUE, bold: true, margin: 0 });
    s.addText(o[1], { x: x + 0.2, y: 5.3, w: 2.45, h: 1.1, align: "center", fontFace: BFONT, fontSize: 12.5, color: MUTE, margin: 0 });
  });
  pageFooter(s, 5);
  s.addNotes("OBJETIVO: Enunciar la meta y sus cuatro pilares medibles.\nTIEMPO: 0:50.\nGUION: Estos cuatro pilares son la vara con la que mido el éxito del proyecto en la diapositiva de resultados.");

  // ============ SLIDE 6 — PRODUCT BACKLOG ============
  s = pres.addSlide();
  contentHeader(s, "Planeación", "Product Backlog");
  s.addImage({ data: I.clipboard, x: 0.6, y: 1.55, w: 0.45, h: 0.45 });
  s.addText("Desglosé el encargo en ítems con criterios de aceptación y 3 referencias cada uno, agrupados en tres categorías.", { x: 1.2, y: 1.55, w: 11.5, h: 0.5, fontFace: BFONT, fontSize: 14, color: INK, italic: true, valign: "middle", margin: 0 });
  const backlog = [
    ["KA · Adquisición de conocimiento", "3 ítems", TEAL, "KA01 Stack tecnológico · KA02 Autenticación · KA03 Almacenamiento de archivos."],
    ["TW · Trabajos técnicos", "9 ítems", BLUE, "TW01 Arquitectura · TW02 Modelo ER · TW03 DevOps/Seguridad · TW04 Control de versiones · TW05–06 CI y Docker · TW07–09 Responsive, optimización y despliegue."],
    ["US · Historias de usuario", "14 ítems", NAVY, "US01–02 Autenticación y roles · US03–08 Proyectos, proceso de 5 etapas y dashboard · US09–14 Documentos, mensajería, perfil y reuniones."],
  ];
  let by = 2.25;
  backlog.forEach((b) => {
    card(s, 0.6, by, 7.55, 1.35);
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: by, w: 0.09, h: 1.35, fill: { color: b[2] } });
    s.addText(b[0], { x: 0.85, y: by + 0.16, w: 5.6, h: 0.35, fontFace: BFONT, fontSize: 15, color: NAVY, bold: true, margin: 0 });
    s.addText(b[1], { x: 6.4, y: by + 0.16, w: 1.6, h: 0.35, align: "right", fontFace: BFONT, fontSize: 12, color: b[2], bold: true, margin: 0 });
    s.addText(b[3], { x: 0.85, y: by + 0.56, w: 7.1, h: 0.72, fontFace: BFONT, fontSize: 12, color: MUTE, margin: 0 });
    by += 1.45;
  });
  shotFrame(s, 8.45, 2.25, 4.28, 3.55, "Tablero del backlog", "Ítems KA / TW / US con criterios de aceptación.");
  pageFooter(s, 6);
  s.addNotes("OBJETIVO: Mostrar que el trabajo partió de un backlog formal, no de improvisación.\nTIEMPO: 1:00.\nGUION: Expliqué el encargo como producto: lo dividí en adquisición de conocimiento (KA), trabajos técnicos (TW) e historias de usuario (US). Cada ítem tiene criterios de aceptación y referencias.");

  // ============ SLIDE 7 — PLAN DE SPRINTS ============
  s = pres.addSlide();
  contentHeader(s, "Planeación", "Plan de Sprints");
  shotFrame(s, 0.6, 1.55, 12.13, 1.95, "Roadmap / tablero de sprints", "Distribución del backlog en 3 sprints con fechas.");
  const planCols = [
    ["Sprint 1", "Fundamentos + CI", TEAL, ["KA01–03", "TW01–04", "US01–02"], "9 ítems del backlog"],
    ["Sprint 2", "MVP — Core del negocio", BLUE, ["US03–08", "TW05–06"], "8 ítems + 5 adelantados"],
    ["Sprint 3", "Interacción + CD", NAVY, ["US09–14", "TW07–09"], "Profesionalización y nube"],
  ];
  planCols.forEach((p, i) => {
    const x = 0.6 + i * 4.12;
    card(s, x, 4.15, 3.85, 2.35);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 4.15, w: 3.85, h: 0.62, fill: { color: p[2] }, rectRadius: 0.06 });
    s.addText(p[0], { x: x + 0.25, y: 4.2, w: 2.2, h: 0.5, fontFace: HFONT, fontSize: 17, color: "FFFFFF", bold: true, valign: "middle", margin: 0 });
    s.addText(p[4], { x: x + 1.6, y: 4.2, w: 2.05, h: 0.5, align: "right", fontFace: BFONT, fontSize: 9.5, color: "FFFFFF", valign: "middle", margin: 0 });
    s.addText(p[1], { x: x + 0.25, y: 4.9, w: 3.4, h: 0.4, fontFace: BFONT, fontSize: 13.5, color: NAVY, bold: true, margin: 0 });
    s.addText(p[3].map((t) => ({ text: t, options: { bullet: { code: "2022" }, color: INK, breakLine: true, paraSpaceAfter: 6 } })), { x: x + 0.35, y: 5.35, w: 3.3, h: 1.05, fontFace: BFONT, fontSize: 12.5, margin: 0 });
  });
  pageFooter(s, 7);
  s.addNotes("OBJETIVO: Relacionar explícitamente el backlog con los 3 sprints.\nTIEMPO: 1:00.\nGUION: Cada sprint cierra un lote del backlog. El Sprint 1 son los fundamentos, el 2 el core del negocio, el 3 la profesionalización. Lo que sigue es la ejecución de este plan.");

  // ============ SLIDE 8 — ARQUITECTURA ============
  s = pres.addSlide();
  contentHeader(s, "Arquitectura", "Arquitectura de la solución");
  const layers = [
    ["Frontend — SPA", "React 19 + Vite · React Router · Axios · i18n (ES/EN/PT)", I.react, "Navegador del usuario (admin / cliente)"],
    ["Backend — API REST", "FastAPI · 11 routers · ~33 endpoints · servicios · JWT + RBAC", I.server, "Lógica de negocio y seguridad"],
    ["Base de datos", "PostgreSQL (Supabase) · 13 tablas · UUID · auditoría · Alembic", I.db, "Persistencia y trazabilidad"],
  ];
  let ly = 1.7;
  layers.forEach((l, i) => {
    card(s, 0.6, ly, 8.4, 1.5);
    s.addShape(pres.shapes.OVAL, { x: 0.85, y: ly + 0.4, w: 0.7, h: 0.7, fill: { color: NAVY } });
    s.addImage({ data: l[2], x: 1.0, y: ly + 0.55, w: 0.4, h: 0.4 });
    s.addText(l[0], { x: 1.75, y: ly + 0.22, w: 7.0, h: 0.4, fontFace: BFONT, fontSize: 17, color: NAVY, bold: true, margin: 0 });
    s.addText(l[1], { x: 1.75, y: ly + 0.62, w: 7.0, h: 0.35, fontFace: BFONT, fontSize: 12.5, color: BLUE, margin: 0 });
    s.addText(l[3], { x: 1.75, y: ly + 0.95, w: 7.0, h: 0.35, fontFace: BFONT, fontSize: 11.5, color: MUTE, italic: true, margin: 0 });
    if (i < 2) {
      s.addText("▼", { x: 4.6, y: ly + 1.46, w: 0.5, h: 0.28, align: "center", fontSize: 14, color: TEAL, margin: 0 });
    }
    ly += 1.74;
  });
  // right column: cross-cutting
  card(s, 9.3, 1.7, 3.43, 4.78, NAVY);
  s.addText("Transversal", { x: 9.6, y: 1.95, w: 2.9, h: 0.4, fontFace: HFONT, fontSize: 18, color: "FFFFFF", bold: true, margin: 0 });
  const cross = [
    ["Seguridad", "JWT · bcrypt · roles"],
    ["Stateless", "Escala horizontal"],
    ["CORS", "Orígenes controlados"],
    ["Docker", "3 servicios + healthchecks"],
    ["CI/CD", "Tests + build automáticos"],
  ];
  let cyy = 2.5;
  cross.forEach((c) => {
    s.addImage({ data: I.check, x: 9.6, y: cyy + 0.03, w: 0.26, h: 0.26 });
    s.addText([
      { text: c[0] + "  ", options: { bold: true, color: "FFFFFF" } },
      { text: c[1], options: { color: ICE } },
    ], { x: 9.95, y: cyy, w: 2.65, h: 0.55, fontFace: BFONT, fontSize: 12.5, margin: 0 });
    cyy += 0.78;
  });
  pageFooter(s, 8);
  s.addNotes("OBJETIVO: Demostrar pensamiento arquitectónico (capas + preocupaciones transversales).\nTIEMPO: 1:30.\nGUION: Explicar el flujo: el navegador manda el JWT, FastAPI valida CORS y rol, el service usa el ORM y SQLAlchemy traduce a SQL. El backend es stateless: por eso escala en horizontal.");

  // ============ SLIDE 7 — TECNOLOGÍAS ============
  s = pres.addSlide();
  contentHeader(s, "Stack", "Tecnologías utilizadas");
  const tech = [
    ["Backend", "FastAPI · SQLAlchemy 2 · Pydantic · Alembic", I.server],
    ["Frontend", "React 19 · Vite 8 · React Router · Tailwind v4", I.react],
    ["Base de datos", "PostgreSQL · Supabase · SQLite (tests)", I.db],
    ["Seguridad", "JWT (python-jose) · bcrypt · RBAC", I.lock],
    ["i18n", "i18next · ES / EN / PT · 7 namespaces", I.globe],
    ["DevOps", "Docker Compose · GitHub Actions · pytest", I.docker],
  ];
  tech.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.6 + col * 4.12, y = 1.75 + row * 2.35;
    card(s, x, y, 3.85, 2.15);
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.32, w: 0.78, h: 0.78, fill: { color: NAVY } });
    s.addImage({ data: t[2], x: x + 0.46, y: y + 0.48, w: 0.46, h: 0.46 });
    s.addText(t[0], { x: x + 1.25, y: y + 0.38, w: 2.45, h: 0.6, fontFace: BFONT, fontSize: 17, color: BLUE, bold: true, valign: "middle", margin: 0 });
    s.addText(t[1], { x: x + 0.3, y: y + 1.25, w: 3.3, h: 0.8, fontFace: BFONT, fontSize: 13, color: INK, margin: 0 });
  });
  pageFooter(s, 9);
  s.addNotes("OBJETIVO: Mostrar dominio de un stack moderno y por qué cada pieza.\nTIEMPO: 1:15.\nGUION: No memoricé tecnologías: las elegí por una razón. FastAPI por tipado y docs automáticas; Supabase por Postgres gestionado; Docker por reproducibilidad. Si preguntan por una, justifico la decisión.");

  // ============ SLIDE 10 — HERRAMIENTAS DE TRABAJO ============
  s = pres.addSlide();
  contentHeader(s, "Entorno", "Herramientas de trabajo");
  s.addText("Más allá del stack, estas son las herramientas con las que desarrollé, probé, versioné y desplegué el proyecto.", { x: 0.6, y: 1.5, w: 12.1, h: 0.5, fontFace: BFONT, fontSize: 14, color: INK, italic: true, margin: 0 });
  const tools = [
    ["VS Code", "Editor y depuración del código.", I.code],
    ["Git + GitHub", "Versionado y repositorio remoto.", I.git],
    ["GitHub Actions", "CI/CD: tests y build en cada push.", I.github],
    ["Docker Desktop", "Entorno containerizado en local.", I.docker],
    ["Postman", "Pruebas manuales de la API REST.", I.paper],
    ["Supabase Studio", "Gestión de la base de datos en la nube.", I.db],
  ];
  tools.forEach((t, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.6 + col * 4.12, y = 2.15 + row * 2.2;
    card(s, x, y, 3.85, 2.0);
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.3, w: 0.78, h: 0.78, fill: { color: NAVY } });
    s.addImage({ data: t[2], x: x + 0.46, y: y + 0.46, w: 0.46, h: 0.46 });
    s.addText(t[0], { x: x + 1.25, y: y + 0.36, w: 2.45, h: 0.6, fontFace: BFONT, fontSize: 16, color: BLUE, bold: true, valign: "middle", margin: 0 });
    s.addText(t[1], { x: x + 0.3, y: y + 1.2, w: 3.3, h: 0.7, fontFace: BFONT, fontSize: 12.5, color: INK, margin: 0 });
  });
  pageFooter(s, 10);
  s.addNotes("OBJETIVO: Mostrar que manejo el entorno profesional de desarrollo, no solo el lenguaje.\nTIEMPO: 0:50.\nGUION: Diferenciar herramientas (cómo trabajo) de tecnologías (de qué está hecho el producto). Destacar GitHub Actions, Docker y Supabase Studio.");

  // ============ SLIDE 11 — ESTRATEGIA DE RAMAS ============
  s = pres.addSlide();
  contentHeader(s, "Control de versiones", "Estrategia de ramas — Git Flow");
  card(s, 0.6, 1.6, 7.05, 4.9);
  s.addText("Organicé el versionado en tres niveles para mantener siempre una rama estable y trabajar sin romperla.", { x: 0.9, y: 1.8, w: 6.45, h: 0.7, fontFace: BFONT, fontSize: 13.5, color: INK, margin: 0 });
  const branches = [
    ["main", "Código estable y entregable. Cada versión que se muestra sale de aquí.", TEAL],
    ["develop", "Rama de integración: aquí converge el trabajo terminado antes de pasar a main.", BLUE],
    ["feature-sprint2 / sprint3", "Una rama por sprint o funcionalidad; al terminar, se fusiona (merge) a develop.", NAVY],
  ];
  let bry = 2.65;
  branches.forEach((b) => {
    s.addShape(pres.shapes.OVAL, { x: 0.95, y: bry, w: 0.62, h: 0.62, fill: { color: b[2] } });
    s.addImage({ data: I.branch, x: 1.1, y: bry + 0.15, w: 0.32, h: 0.32 });
    s.addText(b[0], { x: 1.75, y: bry - 0.02, w: 5.7, h: 0.34, fontFace: "Consolas", fontSize: 14, color: b[2], bold: true, margin: 0 });
    s.addText(b[1], { x: 1.75, y: bry + 0.34, w: 5.7, h: 0.7, fontFace: BFONT, fontSize: 12, color: MUTE, margin: 0 });
    bry += 1.18;
  });
  s.addText("CI corre en main, develop y ramas de feature. · TW04 — establecido en Sprint 1 y usado en los 3.", { x: 0.9, y: 6.1, w: 6.45, h: 0.35, fontFace: BFONT, fontSize: 11, color: BLUE, italic: true, margin: 0 });
  shotFrame(s, 7.9, 1.85, 4.83, 4.0, "Grafo de ramas", "git log --graph o la red de ramas en GitHub.");
  pageFooter(s, 11);
  s.addNotes("OBJETIVO: Demostrar disciplina de versionado profesional (no commitear todo a main).\nTIEMPO: 1:00.\nGUION: Expliqué el flujo: trabajo en una rama de feature, integro a develop, y solo lo estable llega a main. Es la base de un trabajo en equipo ordenado.");

  // ============ SLIDES 12–17 — RECORRIDO POR SPRINTS ============
  // -- Sprint 1 --
  s = pres.addSlide();
  sprintNarrative(s, 1, "Fundamentos + CI", "Cimientos técnicos",
    "Sentar las bases del proyecto: arquitectura, modelo de datos, autenticación y pipeline de integración continua.",
    [
      "Definí la arquitectura por capas (Router → Service → Modelo) y monté el repositorio con Git Flow y README.",
      "Diseñé el modelo entidad-relación base: Usuarios, Proyectos y Etapas, normalizado.",
      "Implementé autenticación: registro, login, logout, JWT, hashing bcrypt y roles (RBAC).",
      "Protegí rutas y validé entradas; armé el layout base, el menú lateral y el dashboard inicial.",
      "Configuré el pipeline de CI en GitHub Actions.",
    ],
    [
      ["Instalación rota (UTF-16)", "pip fallaba en clones limpios por el encoding; reescribí requirements en UTF-8 y lo validé desde cero."],
      ["Login fallaba en silencio", "El navegador bloqueaba las respuestas (CORS); configuré CORSMiddleware con orígenes controlados."],
    ], 12);
  s.addNotes("OBJETIVO: Mostrar que arranqué por los cimientos correctos (arquitectura, datos, seguridad, CI).\nTIEMPO: 1:15.\nGUION: El Sprint 1 no produjo features vistosas, sino la base sobre la que se sostiene todo. Destacar las decisiones de arquitectura y los dos retos resueltos.");

  s = pres.addSlide();
  sprintShots(s, 1,
    "Capturas del Sprint 1: autenticación, navegación protegida y la integración continua en marcha.",
    [
      ["Pantalla de login", "Autenticación JWT con validación de campos."],
      ["Dashboard inicial", "Layout base, menú lateral y navegación protegida."],
      ["Pipeline CI en verde", "GitHub Actions ejecutando los tests en cada push."],
      ["Modelo ER y repositorio", "Tablas base y ramas con Git Flow."],
    ], 13);
  s.addNotes("OBJETIVO: Evidenciar el resultado tangible del Sprint 1.\nTIEMPO: 0:45.\nGUION: Mostrar el login y el pipeline en verde; reemplazar estos marcos por capturas reales antes de la sustentación.");

  // -- Sprint 2 --
  s = pres.addSlide();
  sprintNarrative(s, 2, "MVP — Core del negocio", "El corazón del negocio",
    "Construir el core: el proceso de 5 etapas, la gestión de proyectos, el dashboard dinámico y la trazabilidad.",
    [
      "Gestión de usuarios y proyectos: crear, asociar cliente y listar según el rol.",
      "Módulo Proceso (CORE): 5 etapas, cambio de estado por el admin, fechas, % de avance e historial.",
      "Dashboard dinámico con datos reales: etapa actual, % de avance y última actualización.",
      "Logging y auditoría (audit_log) de cada cambio relevante.",
      "Frontend React completo y orquestación con Docker Compose; mejoré el pipeline de CI.",
    ],
    [
      ["Doble archivo .env", "El backend usaba SQLite cuando creía usar Supabase; unifiqué la configuración y documenté su precedencia para que el error no se repitiera."],
    ], 14);
  s.addNotes("OBJETIVO: Mostrar el sprint donde nace el valor del producto (el proceso de 5 etapas).\nTIEMPO: 1:15.\nGUION: Este es el core del negocio. Explicar el cambio de etapa, el % de avance y la auditoría como la trazabilidad que la empresa no tenía antes.");

  s = pres.addSlide();
  sprintShots(s, 2,
    "Capturas del Sprint 2: el proceso de 5 etapas, el dashboard con datos reales y el entorno containerizado.",
    [
      ["Gestión de proyectos (admin)", "Crear proyectos y asociarlos a cada cliente."],
      ["Cambio de etapa del proceso", "El core del negocio: 5 etapas con historial."],
      ["Dashboard del cliente", "% de avance y etapa actual en tiempo real."],
      ["docker compose up", "Backend, base de datos y frontend orquestados."],
    ], 15);
  s.addNotes("OBJETIVO: Evidenciar el core funcionando de extremo a extremo.\nTIEMPO: 0:45.\nGUION: La captura clave es el cambio de etapa y cómo el dashboard del cliente lo refleja al instante.");

  // -- Sprint 3 --
  s = pres.addSlide();
  sprintNarrative(s, 3, "Interacción + CD", "Profesionalización y nube",
    "Profesionalizar el producto: documentos, comunicación, responsive, internacionalización y despliegue en la nube.",
    [
      "Gestión documental: carga (hasta 10 MB), descarga segura, estados y tipos.",
      "Módulo de comunicación: chat por proyecto, marcar leídos y notificaciones.",
      "Dashboard ampliado (próxima reunión, último documento, historial) y configuración de perfil.",
      "Mejora técnica: diseño responsive, manejo global de errores e i18n (ES/EN/PT).",
      "Migración a PostgreSQL en la nube (Supabase) y despliegue continuo (CD).",
    ],
    [
      ["Migración a la nube (UUID)", "Tipos incompatibles entre SQLite y Postgres; migración con Alembic y reparación idempotente en el arranque."],
      ["Texto quemado en español", "Imposible internacionalizar; refactor i18n: el backend envía keys + params y el front traduce."],
      ["Dependencias con CVEs", "Vulnerabilidades en el frontend; actualicé los paquetes y verifiqué el build."],
    ], 16);
  s.addNotes("OBJETIVO: Mostrar la madurez del producto y los retos más técnicos (migración a la nube, i18n).\nTIEMPO: 1:15.\nGUION: Aquí el producto se profesionaliza. Destacar la migración a Postgres en la nube y el refactor de i18n como decisiones de ingeniería, no solo features.");

  s = pres.addSlide();
  sprintShots(s, 3,
    "Capturas del Sprint 3: documentos, mensajería, soporte multiidioma y diseño responsive.",
    [
      ["Gestión documental", "Carga y descarga con estados y tipos."],
      ["Mensajería por proyecto", "Chat con leídos y notificaciones."],
      ["Selector de idioma (i18n)", "ES / EN / PT, traducción desacoplada."],
      ["Vista responsive (móvil)", "Adaptación a tablet y móvil."],
    ], 17);
  s.addNotes("OBJETIVO: Evidenciar la profesionalización del producto.\nTIEMPO: 0:45.\nGUION: Mostrar el cambio de idioma en vivo y la vista móvil; son las pruebas más visuales del valor añadido.");

  // ============ SLIDE 18 — DE POSTGRESQL LOCAL A SUPABASE ============
  s = pres.addSlide();
  contentHeader(s, "Decisión técnica · Sprint 3", "De PostgreSQL local a Supabase");
  // Antes
  card(s, 0.6, 1.65, 5.45, 2.35);
  s.addShape(pres.shapes.OVAL, { x: 0.9, y: 1.95, w: 0.7, h: 0.7, fill: { color: MUTE } });
  s.addImage({ data: I.serverW, x: 1.06, y: 2.11, w: 0.38, h: 0.38 });
  s.addText("Antes — PostgreSQL local", { x: 1.75, y: 2.0, w: 4.1, h: 0.6, fontFace: BFONT, fontSize: 15, color: NAVY, bold: true, valign: "middle", margin: 0 });
  s.addText("La base de datos vivía solo en mi equipo (o SQLite en pruebas). No era compartible ni accesible fuera de mi máquina.", { x: 0.9, y: 2.85, w: 4.9, h: 1.0, fontFace: BFONT, fontSize: 12.5, color: MUTE, margin: 0 });
  // arrow / cloud
  s.addShape(pres.shapes.OVAL, { x: 6.2, y: 2.35, w: 0.95, h: 0.95, fill: { color: TEAL } });
  s.addImage({ data: I.cloud, x: 6.42, y: 2.6, w: 0.51, h: 0.45 });
  s.addText("→", { x: 6.05, y: 3.3, w: 1.25, h: 0.4, align: "center", fontSize: 20, color: TEAL, bold: true, margin: 0 });
  // Despues
  card(s, 7.3, 1.65, 5.43, 2.35, NAVY);
  s.addShape(pres.shapes.OVAL, { x: 7.6, y: 1.95, w: 0.7, h: 0.7, fill: { color: TEAL } });
  s.addImage({ data: I.cloud, x: 7.78, y: 2.18, w: 0.36, h: 0.32 });
  s.addText("Después — Supabase", { x: 8.45, y: 2.0, w: 4.0, h: 0.6, fontFace: BFONT, fontSize: 15, color: "FFFFFF", bold: true, valign: "middle", margin: 0 });
  s.addText("PostgreSQL gestionado en la nube: accesible desde cualquier entorno, con respaldos y un panel de administración.", { x: 7.6, y: 2.85, w: 4.85, h: 1.0, fontFace: BFONT, fontSize: 12.5, color: ICE, margin: 0 });
  // como lo migre
  card(s, 0.6, 4.25, 6.0, 2.25);
  s.addText("Cómo lo migré", { x: 0.9, y: 4.42, w: 5.4, h: 0.4, fontFace: HFONT, fontSize: 16, color: NAVY, bold: true, margin: 0 });
  const migSteps = [
    "Conexión a Supabase vía pooler (rol postgres).",
    "Migración del esquema con Alembic.",
    "Conversión de tipos a UUID (SQLite → Postgres).",
    "Reparación idempotente del esquema en el arranque.",
  ];
  let msy = 4.95;
  migSteps.forEach((t) => {
    s.addImage({ data: I.check, x: 0.92, y: msy + 0.01, w: 0.24, h: 0.24 });
    s.addText(t, { x: 1.28, y: msy - 0.04, w: 5.2, h: 0.36, fontFace: BFONT, fontSize: 12, color: INK, valign: "middle", margin: 0 });
    msy += 0.37;
  });
  shotFrame(s, 6.85, 4.25, 5.88, 1.78, "Supabase Studio — tablas", "Esquema desplegado y gestionado en la nube.");
  pageFooter(s, 18);
  s.addNotes("OBJETIVO: Mostrar una decisión técnica de peso y cómo la ejecuté.\nTIEMPO: 1:00.\nGUION: La migración no fue trivial: cambiaron los tipos (UUID) y necesité que el esquema se reparara solo al arrancar. Es el paso que volvió el producto realmente desplegable, no atado a mi máquina.");

  // ============ SLIDE 19 — MI APORTE ============
  s = pres.addSlide();
  contentHeader(s, "Mi rol", "Mi aporte como practicante");
  // big stat panel
  card(s, 0.6, 1.75, 3.7, 4.8, NAVY);
  s.addText("95%", { x: 0.7, y: 2.4, w: 3.5, h: 1.0, align: "center", fontFace: HFONT, fontSize: 60, color: TEAL, bold: true, margin: 0 });
  s.addText("del producto desarrollado por mí", { x: 0.7, y: 3.45, w: 3.5, h: 0.6, align: "center", fontFace: BFONT, fontSize: 14, color: "FFFFFF", margin: 0 });
  s.addShape(pres.shapes.LINE, { x: 1.1, y: 4.2, w: 2.7, h: 0, line: { color: "3A5378", width: 1 } });
  s.addText([
    { text: "72 de 76 commits\n", options: { fontSize: 15, color: "FFFFFF", bold: true } },
    { text: "Responsable y facilitador de los 3 sprints", options: { fontSize: 12.5, color: ICE } },
  ], { x: 0.8, y: 4.4, w: 3.3, h: 1.8, align: "center", fontFace: BFONT, margin: 0 });
  // right contributions
  const contrib = [
    ["Construí", "Backend (11 routers, 13 modelos) y frontend (15 páginas) completos."],
    ["Diseñé", "La arquitectura por capas y el i18n desacoplado backend↔frontend."],
    ["Desplegué", "Containerización con Docker y migración a Postgres en la nube."],
    ["Propuse", "i18n multiidioma (no comprometido) y el Sprint 4 de robustez."],
    ["Documenté", "README fuente de verdad, reportes de sprint y guías técnicas."],
  ];
  let ay = 1.75;
  contrib.forEach((c) => {
    card(s, 4.5, ay, 8.23, 0.9);
    s.addText(c[0], { x: 4.75, y: ay + 0.1, w: 1.7, h: 0.7, fontFace: BFONT, fontSize: 15, color: TEAL, bold: true, valign: "middle", margin: 0 });
    s.addShape(pres.shapes.LINE, { x: 6.35, y: ay + 0.18, w: 0, h: 0.54, line: { color: "D7DEEA", width: 1 } });
    s.addText(c[1], { x: 6.55, y: ay + 0.1, w: 6.0, h: 0.7, fontFace: BFONT, fontSize: 13, color: INK, valign: "middle", margin: 0 });
    ay += 0.98;
  });
  pageFooter(s, 19);
  s.addNotes("OBJETIVO: El corazón de la defensa — qué hice YO, con evidencia.\nTIEMPO: 1:30.\nGUION: Apoyarme en el dato incontestable (72/76 commits) y en verbos de acción: construí, diseñé, desplegué, propuse, documenté. Diferenciar lo heredado (scaffolding inicial y maquetas) de lo que implementé.");

  // ============ SLIDE 11 — COMPETENCIAS ============
  s = pres.addSlide();
  contentHeader(s, "Crecimiento", "Competencias desarrolladas");
  card(s, 0.6, 1.75, 6.05, 4.8);
  s.addShape(pres.shapes.OVAL, { x: 0.9, y: 2.0, w: 0.6, h: 0.6, fill: { color: NAVY } });
  s.addImage({ data: I.code, x: 1.03, y: 2.13, w: 0.34, h: 0.34 });
  s.addText("Técnicas", { x: 1.65, y: 2.05, w: 4.5, h: 0.5, fontFace: HFONT, fontSize: 20, color: NAVY, bold: true, valign: "middle", margin: 0 });
  s.addText([
    "API REST con FastAPI e inyección de dependencias",
    "Modelado de datos, SQLAlchemy, Alembic y Postgres",
    "React 19, hooks, Context y consumo de APIs",
    "Seguridad: JWT, bcrypt, RBAC, validación de subidas",
    "Docker, CI/CD con GitHub Actions y testing con pytest",
    "Git Flow e internacionalización de extremo a extremo",
  ].map((t, i, a) => ({ text: t, options: { bullet: { code: "2022" }, color: INK, breakLine: true, paraSpaceAfter: 8 } })),
    { x: 1.0, y: 2.75, w: 5.4, h: 3.6, fontFace: BFONT, fontSize: 13.5, margin: 0 });

  card(s, 6.85, 1.75, 5.88, 4.8, NAVY);
  s.addShape(pres.shapes.OVAL, { x: 7.15, y: 2.0, w: 0.6, h: 0.6, fill: { color: TEAL } });
  s.addImage({ data: I.skills, x: 7.28, y: 2.13, w: 0.34, h: 0.34 });
  s.addText("Profesionales", { x: 7.9, y: 2.05, w: 4.5, h: 0.5, fontFace: HFONT, fontSize: 20, color: "FFFFFF", bold: true, valign: "middle", margin: 0 });
  s.addText([
    "SCRUM: planning, review y retrospectiva en 3 sprints",
    "Resolución de problemas y diagnóstico de causa raíz",
    "Aprendizaje autónomo de un stack moderno",
    "Comunicación con audiencias técnicas y de negocio",
    "Documentación clara y reproducible",
    "Gestión del tiempo y entregas en plazo",
  ].map((t) => ({ text: t, options: { bullet: { code: "2022" }, color: ICE, breakLine: true, paraSpaceAfter: 8 } })),
    { x: 7.25, y: 2.75, w: 5.25, h: 3.6, fontFace: BFONT, fontSize: 13.5, margin: 0 });
  pageFooter(s, 20);
  s.addNotes("OBJETIVO: Mostrar el salto profesional, no solo el técnico.\nTIEMPO: 1:00.\nGUION: La práctica me llevó de aprender tecnologías sueltas a entregar un producto completo aplicando SCRUM y comunicándome con la empresa.");

  // ============ SLIDE 12 — RESULTADOS ============
  s = pres.addSlide();
  contentHeader(s, "Resultados", "Resultados obtenidos");
  const stats = [
    ["~33", "endpoints REST"],
    ["13", "tablas con auditoría"],
    ["3", "idiomas (ES/EN/PT)"],
    ["3", "sprints entregados"],
  ];
  stats.forEach((st, i) => {
    const x = 0.6 + i * 3.04;
    card(s, x, 1.75, 2.85, 1.85, NAVY);
    s.addText(st[0], { x: x + 0.1, y: 1.95, w: 2.65, h: 0.95, align: "center", fontFace: HFONT, fontSize: 44, color: TEAL, bold: true, margin: 0 });
    s.addText(st[1], { x: x + 0.1, y: 2.95, w: 2.65, h: 0.5, align: "center", fontFace: BFONT, fontSize: 13, color: ICE, margin: 0 });
  });
  card(s, 0.6, 3.85, 12.13, 2.65);
  s.addText("Lo entregado, verificable", { x: 0.9, y: 4.05, w: 11, h: 0.45, fontFace: HFONT, fontSize: 18, color: NAVY, bold: true, margin: 0 });
  const delivered = [
    "Plataforma full-stack funcional con admin y cliente",
    "Suite de tests automatizados con gate de cobertura en CI",
    "Containerización completa: docker compose up levanta todo",
    "Despliegue en la nube sobre PostgreSQL gestionado (Supabase)",
    "Pipeline CI/CD que valida cada push (tests + build)",
    "Documentación que hace el proyecto reproducible por terceros",
  ];
  delivered.forEach((d, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.95 + col * 5.95, y = 4.6 + row * 0.58;
    s.addImage({ data: I.check, x, y: y + 0.02, w: 0.28, h: 0.28 });
    s.addText(d, { x: x + 0.38, y, w: 5.45, h: 0.4, fontFace: BFONT, fontSize: 12.5, color: INK, valign: "middle", margin: 0 });
  });
  pageFooter(s, 21);
  s.addNotes("OBJETIVO: Mostrar resultados concretos y verificables (evito métricas no comprobables).\nTIEMPO: 1:00.\nADVERTENCIA: Si preguntan por cobertura, el dato auditable es el gate de CI (60%). No defender el 85%/99.5% de los reportes de gestión como hechos: eran objetivos, no mediciones.");

  // ============ SLIDE 13 — LECCIONES ============
  s = pres.addSlide();
  contentHeader(s, "Aprendizaje", "Lecciones aprendidas");
  const lessons = [
    ["Requisitos claros aceleran todo", "Invertir en entender el problema al inicio evita retrabajo después."],
    ["La portabilidad se prueba clonando limpio", "\"Funciona en mi máquina\" no es suficiente: lo validé desde cero."],
    ["Documentar mientras se desarrolla", "Es más eficiente y preciso que documentar al final."],
    ["Conocer la deuda técnica es madurez", "Auditar mi propio trabajo y priorizar mejoras (Sprint 4)."],
  ];
  lessons.forEach((l, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * 6.13, y = 1.8 + row * 2.35;
    card(s, x, y, 5.9, 2.1);
    s.addShape(pres.shapes.OVAL, { x: x + 0.3, y: y + 0.35, w: 0.7, h: 0.7, fill: { color: NAVY } });
    s.addImage({ data: I.bulb, x: x + 0.45, y: y + 0.5, w: 0.4, h: 0.4 });
    s.addText(l[0], { x: x + 1.2, y: y + 0.3, w: 4.5, h: 0.8, fontFace: BFONT, fontSize: 16, color: BLUE, bold: true, valign: "middle", margin: 0 });
    s.addText(l[1], { x: x + 0.32, y: y + 1.2, w: 5.3, h: 0.8, fontFace: BFONT, fontSize: 13, color: MUTE, margin: 0 });
  });
  pageFooter(s, 22);
  s.addNotes("OBJETIVO: Mostrar reflexión y metacognición — aprendí del proceso, no solo del código.\nTIEMPO: 1:00.\nGUION: La cuarta lección es la más potente: ser capaz de auditar mi propio trabajo y reconocer pendientes es señal de criterio de ingeniero.");

  // ============ SLIDE 14 — CONCLUSIONES ============
  s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.22, h: H, fill: { color: TEAL } });
  s.addShape(pres.shapes.OVAL, { x: 10.2, y: -2.0, w: 6, h: 6, fill: { color: NAVY2 } });
  s.addText("CONCLUSIONES", { x: 0.9, y: 0.7, w: 10, h: 0.4, fontFace: BFONT, fontSize: 13, color: TEAL, bold: true, charSpacing: 4, margin: 0 });
  s.addText("Aproveché la práctica para entregar valor real", { x: 0.9, y: 1.1, w: 11.5, h: 0.9, fontFace: HFONT, fontSize: 30, color: "FFFFFF", bold: true, margin: 0 });
  const concl = [
    "Llevé un producto de cero a una plataforma full-stack funcional, segura y desplegada.",
    "Fui el desarrollador principal (72/76 commits) y responsable de los 3 sprints.",
    "Resolví problemas reales de integración, configuración, portabilidad y seguridad.",
    "Aporté valor extra por iniciativa propia (internacionalización en 3 idiomas).",
    "Conozco la deuda técnica del sistema y la tengo priorizada como siguiente fase.",
  ];
  let ny = 2.35;
  concl.forEach((c) => {
    s.addImage({ data: I.check, x: 0.95, y: ny + 0.04, w: 0.34, h: 0.34 });
    s.addText(c, { x: 1.45, y: ny, w: 10.6, h: 0.5, fontFace: BFONT, fontSize: 15.5, color: ICE, valign: "middle", margin: 0 });
    ny += 0.72;
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.9, y: 6.05, w: 11.5, h: 0.85, fill: { color: NAVY2 }, rectRadius: 0.08 });
  s.addText("De aprender tecnologías a entregar un producto de extremo a extremo — listo para desempeñarme como ingeniero de software.", { x: 1.2, y: 6.05, w: 11.0, h: 0.85, fontFace: HFONT, fontSize: 15, color: "FFFFFF", italic: true, bold: true, valign: "middle", margin: 0 });
  s.addNotes("OBJETIVO: Cerrar con una afirmación de valor memorable.\nTIEMPO: 1:00.\nGUION: Rematar con la frase del recuadro. Es la idea que quiero que el jurado retenga: pasé de aprender a entregar.");

  // ============ SLIDE 15 — PREGUNTAS ============
  s = pres.addSlide();
  s.background = { color: NAVY };
  s.addShape(pres.shapes.OVAL, { x: -1.6, y: 3.8, w: 5.5, h: 5.5, fill: { color: NAVY2 } });
  s.addShape(pres.shapes.OVAL, { x: 10.6, y: -2.0, w: 5.5, h: 5.5, fill: { color: NAVY2 } });
  s.addShape(pres.shapes.OVAL, { x: 5.96, y: 2.0, w: 1.4, h: 1.4, fill: { color: TEAL } });
  s.addImage({ data: I.chat, x: 6.33, y: 2.37, w: 0.66, h: 0.66 });
  s.addText("¿Preguntas?", { x: 1.5, y: 3.6, w: 10.3, h: 1.0, align: "center", fontFace: HFONT, fontSize: 44, color: "FFFFFF", bold: true, margin: 0 });
  s.addText("Gracias por su atención", { x: 1.5, y: 4.6, w: 10.3, h: 0.5, align: "center", fontFace: BFONT, fontSize: 18, color: TEAL, margin: 0 });
  s.addText("Wbeimar  ·  wbeimar224@gmail.com  ·  Práctica Profesional — Optimixage S.A.S.", { x: 1.5, y: 5.4, w: 10.3, h: 0.4, align: "center", fontFace: BFONT, fontSize: 13, color: ICE, margin: 0 });
  s.addNotes("OBJETIVO: Abrir el turno de preguntas con calma y seguridad.\nTIEMPO: restante (10–15 min).\nGUION: Tener a mano las respuestas preparadas (Fase 2 del informe). Ante seguridad o métricas, responder con honestidad: conozco mis pendientes y mis datos verificables.");

  await pres.writeFile({ fileName: "docs/Sustentacion_Practica_Optimixage.pptx" });
  console.log("OK escrito docs/Sustentacion_Practica_Optimixage.pptx");
})();
