/* app.js — NxtWave Referral Intelligence Dashboard with Gemini AI */

// =============================================
//  CONFIG
// =============================================
const CONFIG = {
  totalSeats: 500,
  geminiModel: "gemini-1.5-flash",
  baseUrl: window.location.origin + window.location.pathname.replace("index.html", ""),
};

// =============================================
//  STATE
// =============================================
let state = {
  registered: false,
  myCode: null,
  myName: null,
  myReferrals: 0,
  currentSeats: 347,
  chatOpen: false,
  leaderboard: [
    { name: "Rahul K.",   college: "VIT Vellore",     refs: 34, points: 340 },
    { name: "Priya S.",   college: "NIT Trichy",      refs: 18, points: 180 },
    { name: "Kiran M.",   college: "BITS Pilani",     refs: 12, points: 120 },
    { name: "Ananya R.",  college: "IIIT Hyderabad",  refs: 9,  points: 90  },
    { name: "Dev P.",     college: "SRM Chennai",     refs: 7,  points: 70  },
    { name: "Sneha T.",   college: "Manipal Uni",     refs: 6,  points: 60  },
    { name: "Arjun N.",   college: "SASTRA Univ",     refs: 5,  points: 50  },
    { name: "Meera K.",   college: "PSG Tech",        refs: 4,  points: 40  },
    { name: "Rohan V.",   college: "PESIT Bangalore", refs: 3,  points: 30  },
    { name: "Lakshmi A.", college: "AU College",      refs: 2,  points: 20  },
  ],
};

// =============================================
//  EXAMPLE PROFILES
// =============================================
const EXAMPLES = [
  "I'm a final-year CSE student at VIT Vellore. I know Python, JavaScript, and C++. I've done 2 internships — one in web development (ReactJS) and one in data analysis (Pandas, Numpy). I have 4 GitHub projects but none use AI. I'm preparing for product-based company placements and feel like I need to show something unique.",
  "I'm an ECE student in my 4th year at NIT Trichy. I know C and a bit of Python (learned during COVID). I'm not very confident in coding but I've done a project on IoT. I'm interested in moving towards AI/ML but don't know where to start. My friends who know ML are getting better placement offers.",
  "I'm a Mechanical Engineering final-year student at BITS Pilani. I taught myself Python last year and built a small attendance tracker. I don't have a CS background but I'm really interested in AI and want to transition into the tech industry. I'm unsure if workshops like this are meant for someone like me.",
];

// =============================================
//  UTILITY
// =============================================
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3000);
}

function generateCode(name) {
  const clean = name.replace(/\s+/g, "").toUpperCase().slice(0, 5);
  return `${clean}${Math.floor(1000 + Math.random() * 9000)}`;
}

function getReferralUrl(code) {
  return `${CONFIG.baseUrl}?ref=${code}`;
}

function countUp(el, from, to, duration = 1400) {
  const start = performance.now();
  const update = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 4);
    el.textContent = Math.round(from + (to - from) * ease);
    if (t < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// =============================================
//  API CALLS (Hitting the real FastAPI Backend)
// =============================================
// This points to the real backend holding the Gemini API key securely.
// For local testing, keep it http://localhost:8080. When deployed, change to your Vercel URL.
const BACKEND_URL = "https://nxtwave-eta.vercel.app";

async function fetchFromBackend(endpoint, bodyData) {
  try {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData)
    });
    const data = await res.json();
    if (!res.ok) return { error: data.detail || "Server error" };
    return { text: data.text };
  } catch (err) {
    return { error: "Failed to connect to backend server. Make sure FastAPI is running!" };
  }
}

// =============================================
//  HERO CODE PREVIEW ANIMATION
// =============================================
function initHeroAnimation() {
  const outputs = [
    "✅ Top 3 Strengths Identified:\n1. Strong full-stack foundation (Python + JS)\n2. Real internship experience — rare at student level\n3. High learning velocity shown across 4 projects\n\n💡 Gap: No AI/ML project yet. This workshop fixes that.",
    "✅ Career Analysis Complete:\n1. Strong IoT background — transferable to AI edge computing\n2. Python foundation gives you a head start\n3. Industry pivot potential: ML Engineer path is open\n\n💡 Recommendation: One AI project = 10x more offers.",
    "✅ Profile Analyzed:\n1. Self-taught = high initiative (top hiring signal)\n2. Cross-discipline = rare value in AI teams\n3. CS fundamentals through Python show genuine interest\n\n💡 This workshop is made for exactly your profile.",
  ];

  let idx = 0;
  const el = document.getElementById("heroOutput");

  function typeOut(text) {
    el.innerHTML = "";
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        el.innerHTML = text.slice(0, ++i).replace(/\n/g, "<br>") + '<span class="blink">▊</span>';
      } else {
        el.innerHTML = text.replace(/\n/g, "<br>");
        clearInterval(interval);
        setTimeout(() => {
          el.innerHTML = 'Running AI analysis<span class="blink">▊</span>';
          setTimeout(() => { idx = (idx + 1) % outputs.length; typeOut(outputs[idx]); }, 1500);
        }, 4000);
      }
    }, 18);
  }

  setTimeout(() => typeOut(outputs[0]), 1200);
}

// =============================================
//  SEATS COUNTER
// =============================================
function initSeats() {
  const bar = document.getElementById("spBar");
  const filled = document.getElementById("spFilled");
  const hcount = document.getElementById("heroCount");

  setTimeout(() => {
    bar.style.width = (state.currentSeats / CONFIG.totalSeats * 100) + "%";
    countUp(filled, 0, state.currentSeats);
    if (hcount) countUp(hcount, 0, state.currentSeats);
  }, 600);

  // Simulate live fills
  function tick() {
    if (state.currentSeats >= CONFIG.totalSeats) return;
    const inc = Math.floor(Math.random() * 2) + 1;
    state.currentSeats = Math.min(state.currentSeats + inc, CONFIG.totalSeats);
    bar.style.width = (state.currentSeats / CONFIG.totalSeats * 100) + "%";
    countUp(filled, state.currentSeats - inc, state.currentSeats, 500);
    if (hcount) countUp(hcount, state.currentSeats - inc, state.currentSeats, 500);
    const remaining = CONFIG.totalSeats - state.currentSeats;
    // Update topbar
    const tb = document.querySelector(".topbar strong");
    if (tb) tb.textContent = `${remaining} spots remaining`;
    setTimeout(tick, 18000 + Math.random() * 22000);
  }
  setTimeout(tick, 12000);
}

// =============================================
//  AI RESUME DEMO
// =============================================
const DEMO_SYSTEM = `You are an expert career coach analyzing a student's background for the NxtWave "Build Your First AI Project in 60 Minutes" workshop.

Analyze the student's background and give a structured response with:
1. **Your AI Readiness Score** (out of 10, be honest)
2. **Top 3 Strengths** (be specific to what they wrote)
3. **The 1 Gap** (what's missing that this workshop fixes)
4. **Why This Workshop Is Perfect For You** (2-3 sentences, personalized)
5. **What AI Project You Should Build** (suggest a specific, relevant project idea for them)

Be warm, specific, and encouraging. Use their actual details. Keep it under 200 words total. Format clearly with headers.`;

window.analyzeResume = async function () {
  const input = document.getElementById("resumeInput").value.trim();
  if (!input) { toast("⚠️ Please paste your background first"); return; }

  const btn = document.getElementById("analyzeBtn");
  const btnText = document.getElementById("analyzeBtnText");
  const spin = document.getElementById("analyzeSpin");
  const placeholder = document.getElementById("outputPlaceholder");
  const content = document.getElementById("outputContent");

  btnText.style.display = "none"; spin.style.display = "block";
  btn.disabled = true;
  placeholder.style.display = "none";
  content.style.display = "block";
  content.innerHTML = `<div style="text-align:center;padding:32px;color:var(--ink3)">
    <div style="font-size:28px;margin-bottom:12px">🤖</div>
    <div>AI is analyzing your profile...</div>
  </div>`;

  const result = await fetchFromBackend("/api/analyze", { resume_text: input });

  btnText.style.display = "inline"; spin.style.display = "none";
  btn.disabled = false;

  if (result.error) {
    content.innerHTML = `<div style="color:var(--red);padding:16px;background:#fef2f2;border-radius:10px;font-size:14px">
      ⚠️ ${result.error}
    </div>`;
    return;
  }

  // Render markdown-like formatting
  const html = result.text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/^### (.*)/gm, "<h4>$1</h4>")
    .replace(/^## (.*)/gm, "<h4>$1</h4>")
    .replace(/^# (.*)/gm, "<h4>$1</h4>")
    .replace(/^\d+\. (.*)/gm, "<li>$1</li>")
    .replace(/^- (.*)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");

  content.innerHTML = `${html}<p class="ai-disclaimer">🤖 Analysis by Groq AI · NxtWave Challenge</p>`;
  toast("✅ AI analysis complete!");
};

window.loadExample = function (idx) {
  document.getElementById("resumeInput").value = EXAMPLES[idx];
  document.getElementById("resumeInput").focus();
  toast("✅ Example loaded — hit Analyze!");
};

// =============================================
//  ARIA CHATBOT
// =============================================
const ARIA_SYSTEM = `You are ARIA (AI Registration & Intent Assistant), the friendly chatbot for NxtWave's free workshop: "Build Your First AI Project in 60 Minutes".

Your purpose: Help final-year engineering students decide if they should register and answer their questions about the workshop.

Key facts about the workshop:
- It's completely FREE. No hidden costs.
- Duration: 60 minutes, online via Zoom
- Students build a working AI project (using Gemini API / Python)
- No prior AI experience needed — just basic Python helps
- They'll get a GitHub repo, a certificate, and a project for interviews
- Run by NxtWave, a trusted ed-tech platform for engineers in India
- Registration link: On this page

Your tone: Warm, encouraging, honest, conversational. Like a helpful senior friend who genuinely wants them to register because it's good for them.

Keep responses under 80 words. Be specific. Don't be corporate. Use 1-2 relevant emojis max.`;

window.toggleChat = function () {
  const chatbot = document.getElementById("chatbot");
  const fab = document.getElementById("chatFab");
  state.chatOpen = !state.chatOpen;
  chatbot.classList.toggle("open", state.chatOpen);
  fab.classList.toggle("hidden", state.chatOpen);
};

window.askQuick = function (q) {
  document.getElementById("chatInput").value = q;
  sendChat();
};

window.sendChat = async function () {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;
  input.value = "";

  // Remove quick questions
  document.getElementById("quickQs").style.display = "none";

  // Add user message
  appendChatMsg("user", msg);

  // Typing indicator
  const typingId = "typing_" + Date.now();
  const typingHtml = `<div class="chat-msg bot" id="${typingId}">
    <span class="msg-avatar">🤖</span>
    <div class="msg-bubble msg-typing">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    </div>
  </div>`;
  document.getElementById("chatMessages").insertAdjacentHTML("beforeend", typingHtml);
  scrollChat();

  const result = await fetchFromBackend("/api/chat", { message: msg });

  // Remove typing
  document.getElementById(typingId)?.remove();

  if (result.error) {
    appendChatMsg("bot", `I need a Gemini API key to give you smart answers. Enter it below and ask again — or scroll up to try the AI demo! 🔑`);
  } else {
    appendChatMsg("bot", result.text);
  }
};

function appendChatMsg(role, text) {
  const avatar = role === "bot" ? "🤖" : "🧑‍💻";
  const html = `<div class="chat-msg ${role}">
    <span class="msg-avatar">${avatar}</span>
    <div class="msg-bubble">${text.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</div>
  </div>`;
  document.getElementById("chatMessages").insertAdjacentHTML("beforeend", html);
  scrollChat();
}

function scrollChat() {
  const msgs = document.getElementById("chatMessages");
  msgs.scrollTop = msgs.scrollHeight;
}

// =============================================
//  REGISTRATION FORM
// =============================================
function initRegForm() {
  const form = document.getElementById("regForm");
  const box = document.getElementById("formBox");
  const success = document.getElementById("formSuccess");

  // Check saved state
  const saved = JSON.parse(localStorage.getItem("nw_reg") || "null");
  if (saved?.registered) {
    box.style.display = "none";
    success.style.display = "block";
    document.getElementById("fsCode").textContent = `Your Code: ${saved.code}`;
    state.myCode = saved.code;
    state.myName = saved.name;
    state.registered = true;
  }

  // Pre-fill referral
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) {
    document.getElementById("fRef").value = ref;
    document.getElementById("refFg").style.display = "block";
    toast("🎉 You were referred by a campus rep!");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("fName").value.trim();
    const email = document.getElementById("fEmail").value.trim();
    const college = document.getElementById("fCollege").value.trim();
    const year = document.getElementById("fYear").value;

    // Validate
    let ok = true;
    [["fName", name], ["fEmail", email], ["fCollege", college], ["fYear", year]].forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (!val) { el.classList.add("err"); ok = false; }
      else el.classList.remove("err");
    });
    if (!ok) { toast("⚠️ Please fill in all fields"); return; }

    // Loading
    const btn = document.getElementById("submitBtn");
    document.getElementById("submitLabel").style.display = "none";
    document.getElementById("submitSpin").style.display = "block";
    btn.disabled = true;

    await new Promise(r => setTimeout(r, 1600));

    const code = generateCode(name);
    state.registered = true; state.myCode = code; state.myName = name;
    state.currentSeats = Math.min(state.currentSeats + 1, CONFIG.totalSeats);

    localStorage.setItem("nw_reg", JSON.stringify({ registered: true, code, name, email, college, year }));

    box.style.display = "none";
    success.style.display = "block";
    document.getElementById("fsCode").textContent = `Your Code: ${code}`;
    document.getElementById("repName").value = name;

    toast("🎉 You're registered! Check your email.");
  });
}

// =============================================
//  REFERRAL LINK GENERATOR
// =============================================
window.generateLink = function () {
  const nameEl = document.getElementById("repName");
  const name = nameEl.value.trim();
  if (!name) { nameEl.style.border = "1.5px solid var(--red)"; toast("⚠️ Enter your name first"); return; }
  nameEl.style.border = "";

  const code = state.myCode || generateCode(name);
  if (!state.myCode) { state.myCode = code; }

  const url = getReferralUrl(code);
  document.getElementById("linkText").textContent = url;
  document.getElementById("linkResult").style.display = "block";

  // Update WhatsApp template
  document.getElementById("waTemplateText").innerHTML =
    `Hey guys — found this free workshop where you build an actual AI project in 60 mins. 100% free + you get something to show in placements. Registering here: <em>${url}</em> — Let me know if anyone's joining 👀`;

  // Show stats
  document.getElementById("myStats").style.display = "block";
  document.getElementById("msRefs").textContent = state.myReferrals;
  document.getElementById("msPts").textContent = state.myReferrals * 10;
  document.getElementById("msRank").textContent = "—";

  toast("🔗 Your referral link is ready!");
};

window.copyLink = function () {
  const url = document.getElementById("linkText").textContent;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById("copyLinkBtn");
    btn.textContent = "Copied!"; btn.classList.add("ok");
    setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("ok"); }, 2000);
    toast("📋 Link copied!");
  });
};

window.waShare = function () {
  const url = document.getElementById("linkText").textContent;
  const msg = encodeURIComponent(`Hey guys — found this free workshop where you build an actual AI project in 60 mins. 100% free + you get something to show in placements. Registering here: ${url} — Let me know if anyone's joining 👀`);
  window.open(`https://wa.me/?text=${msg}`, "_blank");
};

window.liShare = function () {
  const url = document.getElementById("linkText").textContent;
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
};

window.copyTemplate = function () {
  const text = document.getElementById("waTemplateText").textContent;
  navigator.clipboard.writeText(text).then(() => toast("📋 Message copied! Paste in your group 💬"));
};

// =============================================
//  LEADERBOARD
// =============================================
function renderLeaderboard() {
  const tbody = document.getElementById("lbBody");
  const medals = ["🥇", "🥈", "🥉"];
  tbody.innerHTML = state.leaderboard.map((r, i) => `
    <tr>
      <td>${i < 3 ? `<span class="rank-m">${medals[i]}</span>` : `#${i + 1}`}</td>
      <td><strong>${r.name}</strong></td>
      <td style="color:var(--ink3)">${r.college}</td>
      <td class="refs-v">${r.refs}</td>
      <td class="pts-v">${r.points}pts</td>
    </tr>`).join("");

  const p = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  p("p1n", state.leaderboard[0]?.name); p("p1c", state.leaderboard[0]?.college); p("p1r", `${state.leaderboard[0]?.refs} referrals`);
  p("p2n", state.leaderboard[1]?.name); p("p2c", state.leaderboard[1]?.college); p("p2r", `${state.leaderboard[1]?.refs} referrals`);
  p("p3n", state.leaderboard[2]?.name); p("p3c", state.leaderboard[2]?.college); p("p3r", `${state.leaderboard[2]?.refs} referrals`);
  document.getElementById("lastUp").textContent = new Date().toLocaleTimeString();
}

function simulateLB() {
  const go = () => {
    const i = Math.floor(Math.random() * state.leaderboard.length);
    state.leaderboard[i].refs += 1; state.leaderboard[i].points += 10;
    state.leaderboard.sort((a, b) => b.refs - a.refs);
    renderLeaderboard();
    setTimeout(go, 40000 + Math.random() * 40000);
  };
  setTimeout(go, 35000);
}

// =============================================
//  SCROLL ANIMATIONS
// =============================================
function initAnimations() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll("[data-animate]").forEach(el => obs.observe(el));
}

// =============================================
//  INIT
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  initHeroAnimation();
  initSeats();
  initRegForm();
  renderLeaderboard();
  simulateLB();
  initAnimations();

  // Navbar scroll effect
  const nav = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    nav.style.boxShadow = window.scrollY > 40 ? "0 2px 24px rgba(26,18,8,0.1)" : "none";
  }, { passive: true });



  console.log(`
  ╔══════════════════════════════════════════╗
  ║  NxtWave Referral Intelligence Dashboard ║
  ║  ARIA Chatbot + AI Resume Demo          ║
  ║  Powered by Groq (LLaMA 3)              ║
  ╚══════════════════════════════════════════╝
  `);
});
