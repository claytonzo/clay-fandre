// ── Animated particle/node background ──
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, nodes = [], RAF;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function initNodes(n = 60) {
  nodes = Array.from({ length: n }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.random() * 1.5 + 0.5,
  }));
}

// Mouse interaction
const mouse = { x: -9999, y: -9999 };
addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Update & draw nodes
  for (const n of nodes) {
    // gentle attraction toward the cursor within 200px
    const mdx = mouse.x - n.x, mdy = mouse.y - n.y;
    const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
    if (mdist < 200 && mdist > 0.1) {
      n.vx += (mdx / mdist) * 0.012;
      n.vy += (mdy / mdist) * 0.012;
    }
    // speed cap so they don't swarm violently
    const sp = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
    if (sp > 0.8) { n.vx *= 0.8 / sp; n.vy *= 0.8 / sp; }

    n.x += n.vx; n.y += n.vy;
    if (n.x < 0 || n.x > W) n.vx *= -1;
    if (n.y < 0 || n.y > H) n.vy *= -1;
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(74,158,255,0.6)';
    ctx.fill();

    // link nodes to the cursor
    if (mdist < 180) {
      ctx.beginPath();
      ctx.moveTo(n.x, n.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.strokeStyle = `rgba(0,212,255,${0.25 * (1 - mdist / 180)})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
  }

  // Draw edges between close nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.strokeStyle = `rgba(74,158,255,${0.15 * (1 - dist / 140)})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  RAF = requestAnimationFrame(draw);
}

resize();
initNodes();
draw();
window.addEventListener('resize', () => { resize(); initNodes(); });

// ── Terminal typing animation ──
const termLines = document.querySelectorAll('.terminal-body p');
termLines.forEach(p => p.style.visibility = 'hidden');

(async function playTerminal() {
  await new Promise(r => setTimeout(r, 1400)); // wait for hero fade-in

  for (const line of termLines) {
    line.style.visibility = 'visible';
    const cmd = line.querySelector('.t-cmd');

    if (cmd) {
      // type the command character by character
      const text = cmd.textContent;
      cmd.textContent = '';
      for (const ch of text) {
        cmd.textContent += ch;
        await new Promise(r => setTimeout(r, 35 + Math.random() * 45));
      }
      await new Promise(r => setTimeout(r, 220));
    } else {
      // output lines appear quickly
      await new Promise(r => setTimeout(r, 90));
    }
  }
})();

// ── Scroll progress bar ──
const bar = document.createElement('div');
bar.id = 'progress-bar';
document.body.appendChild(bar);
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (scrollY / max * 100) + '%';
}, { passive: true });

// ── Glitch effect on hero name ──
const heroName = document.querySelector('.hero-name');
if (heroName) {
  heroName.classList.add('glitchable');
  heroName.dataset.text = heroName.innerText; // preserves the line break
  setInterval(() => {
    heroName.classList.add('glitching');
    setTimeout(() => heroName.classList.remove('glitching'), 350);
  }, 4200);
}

// ── Sticky nav ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ── Scroll fade-in ──
const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  }),
  { threshold: 0.1 }
);

const style = document.createElement('style');
style.textContent = `
  .fade-in { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .fade-in.visible { opacity: 1; transform: none; }
`;
document.head.appendChild(style);

document.querySelectorAll('.tl-content, .exp-card, .beyond-card, .about-text p, .a-stat')
  .forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    observer.observe(el);
  });
