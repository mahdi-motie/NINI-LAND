import { useEffect, useRef } from "react";
import "./Bunto.css";

const K = [
  {
    n: "اورال",
    c: "اورال · ۱ تا ۵ سال",
    d: "کتان شسته‌شده با جیب جلوی پیش‌بند، بندهای قابل‌تنظیم و پاچه‌های تاخورده.",
  },
  {
    n: "سرهمی",
    c: "سرهمی · ۱ تا ۳ سال",
    d: "بافت نرم از پنبه‌ی ارگانیک، با دکمه‌های چوبی روی شانه و دکمه‌های فشاری برای تعویض آسان.",
  },
  {
    n: "تی‌شرت",
    c: "تی‌شرت آستین‌بلند · ۱ تا ۶ سال",
    d: "ژرسه‌ی ارگانیک ضخیم با جیب کوچک روی سینه و مچ‌های کشی.",
  },
  {
    n: "کاردیگان",
    c: "کاردیگان · ۱ تا ۶ سال",
    d: "بافت درشت و نرم با دکمه‌های چوبی، مناسب لایه‌پوشی در صبح‌های خنک.",
  },
  {
    n: "کلاه باکت",
    c: "کلاه باکت · ۱ تا ۶ سال",
    d: "بوم پنبه‌ای رنگ‌شده با لبه‌ی نرم که در هر جیبی تا می‌شود.",
  },
];
const COL = ["هلویی", "صورتی", "سبز مریمی", "کره‌ای"];
const HEX = ["#FEDBDA", "#FCB7CC", "#C8C997", "#F5B55A"];
// [column, starting colour row]
const START = [
  [1, 0],
  [2, 1],
  [0, 2],
  [3, 3],
  [4, 1],
  [3, 2],
  [0, 1],
  [4, 3],
];
const pos = (c, r) => `${c * 25}% ${r * 33.333}%`;
const label = (c, r) => `${K[c].n} ${COL[r]}`;

export default function Bunto() {
  const root = useRef(null);

  useEffect(() => {
    const R0 = root.current;
    const $ = (s) => R0.querySelector(s);
    const stage = $("#stage"),
      closeBtn = $("#close"),
      bag = $("#bag"),
      badge = $("#badge"),
      addBtn = $("#add");
    const els = [...R0.querySelectorAll(".item")];
    const dots = [...R0.querySelectorAll(".dot")];
    const swBtns = [...R0.querySelectorAll(".sw")];
    const shadow = $("#shadow"),
      dotsEl = $("#dots"),
      numEl = $("#num"),
      l1 = $("#l1");
    const it = START.map(([c, r]) => ({ c, r, bt: -1e9, sw: 0 }));
    const N = it.length,
      STEP = (Math.PI * 2) / N,
      OMEGA = STEP / 4.2;
    const CX = 718,
      CY = 418,
      R = 411,
      DROP = 110,
      S0 = 0.97,
      TILT = 9;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const phoneQ = matchMedia("(max-width:820px) and (min-height:521px)");
    const fa = (n, min = 1) =>
      n.toLocaleString("fa-IR", { minimumIntegerDigits: min });
    const pad = (n) => fa(n, 2);
    const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
    const ease = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const name = (i) => label(it[i].c, it[i].r);
    const timers = new Set();
    const later = (fn, ms) => {
      const t = setTimeout(() => {
        timers.delete(t);
        fn();
      }, ms);
      timers.add(t);
      return t;
    };

    /* index roll */
    let ix = pad(1),
      itm;
    const T = "transform .7s cubic-bezier(.65,0,.35,1)";
    function setIdx(t) {
      if (t === ix) return;
      ix = t;
      clearTimeout(itm);
      if (reduce) {
        numEl.textContent = t;
        return;
      }
      numEl.style.transition = T;
      numEl.style.transform = "translateY(-110%)";
      itm = later(() => {
        numEl.style.transition = "none";
        numEl.textContent = t;
        numEl.style.transform = "translateY(110%)";
        numEl.offsetWidth;
        numEl.style.transition = T;
        numEl.style.transform = "translateY(0)";
      }, 300);
    }
    function hov(i) {
      if (i < 0) {
        setIdx(pad(1));
        l1.innerHTML = "سرهمی<br>کالکشن";
      } else {
        setIdx(pad(i + 1));
        l1.innerHTML = K[it[i].c].n + "<br>کالکشن";
      }
    }

    /* state */
    let base = 0,
      aw = 1,
      fl = 0,
      drag = false,
      dragged = false,
      v = 0,
      moved = 0,
      lastX = 0,
      pt = 0;
    let cur = -1,
      d = 0,
      dFrom = 0,
      dTo = 0,
      dT0 = 0,
      entT = null,
      last = performance.now(),
      U = 1,
      lastD = -1,
      front = -1,
      isOpen = false;
    const go = (t) => {
      dFrom = d;
      dTo = t;
      dT0 = performance.now();
    };

    function fill(i) {
      const p = it[i],
        k = K[p.c];
      $("#pcat").textContent = k.c;
      $("#pname").textContent = name(i);
      $("#pdesc").textContent = k.d;
      swBtns.forEach((b, r) => b.setAttribute("aria-checked", r === p.r));
    }
    function openP(i) {
      if (cur >= 0 || dragged) return;
      cur = i;
      isOpen = true;
      fill(i);
      R0.classList.add("detail");
      go(1);
      setIdx(pad(i + 1));
      later(() => closeBtn.focus({ preventScroll: true }), 50);
    }
    function closeP() {
      if (!isOpen) return;
      isOpen = false;
      R0.classList.remove("detail");
      go(0);
      setIdx(pad(1));
      l1.innerHTML = "سرهمی<br>کالکشن";
      els[cur].focus({ preventScroll: true });
    }
    function swap(r) {
      if (cur < 0) return;
      const p = it[cur];
      if (p.sw || r === p.r) return;
      const e = els[cur],
        a = e.children[0],
        b = e.children[1],
        ps = pos(p.c, r);
      p.r = r;
      e.setAttribute("aria-label", name(cur));
      fill(cur);
      if (reduce) {
        a.style.backgroundPosition = b.style.backgroundPosition = ps;
        return;
      }
      p.sw = 1;
      b.style.backgroundPosition = ps;
      e.classList.add("swap");
      b.offsetWidth;
      b.style.opacity = 1;
      later(() => {
        a.style.backgroundPosition = ps;
        e.classList.remove("swap");
        b.style.opacity = 0;
        p.sw = 0;
        p.bt = performance.now();
      }, 360);
    }

    /* listeners */
    const cleanups = [];
    const on = (t, ev, fn) => {
      t.addEventListener(ev, fn);
      cleanups.push(() => t.removeEventListener(ev, fn));
    };
    els.forEach((e, i) => {
      on(e, "mouseenter", () => {
        if (cur < 0 && !drag) hov(i);
      });
      on(e, "mouseleave", () => {
        if (cur < 0) hov(-1);
      });
      on(e, "click", () => openP(i));
      on(e, "keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          openP(i);
        }
      });
    });
    swBtns.forEach((b, r) => on(b, "click", () => swap(r)));
    on(closeBtn, "click", closeP);
    on(document, "keydown", (e) => {
      if (e.key === "Escape") closeP();
    });
    on(stage, "pointerdown", (e) => {
      if (e.button !== 0 || cur >= 0) return;
      drag = true;
      dragged = false;
      moved = 0;
      v = 0;
      fl = 0;
      lastX = e.clientX;
      pt = performance.now();
    });
    on(window, "pointermove", (e) => {
      if (!drag) return;
      const dx =
        (e.clientX - lastX) / (stage.getBoundingClientRect().width / 1440);
      lastX = e.clientX;
      moved += Math.abs(dx);
      const th = dx / R;
      base += th;
      const n = performance.now(),
        m = Math.max(1, n - pt);
      pt = n;
      v = 0.6 * v + (0.4 * th * 16.7) / m;
      if (!dragged && moved > 6) {
        dragged = true;
        stage.classList.add("dragging");
        try {
          stage.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
    });
    const up = () => {
      if (!drag) return;
      drag = false;
      stage.classList.remove("dragging");
      if (dragged) {
        fl = clamp(v, -0.12, 0.12);
        aw = 0;
        later(() => (dragged = false), 0);
      }
    };
    on(window, "pointerup", up);
    on(window, "pointercancel", up);

    /* frame loop */
    let raf;
    function frame(now) {
      const dt = Math.min(50, now - last) / 1000;
      last = now;
      U = stage.getBoundingClientRect().width / 1440;
      if (!drag && cur < 0) {
        if (!reduce) {
          aw = Math.min(1, aw + 0.8 * dt);
          base += OMEGA * aw * dt;
        }
        if (fl) {
          base += fl;
          fl *= Math.pow(0.92, dt * 60);
          if (Math.abs(fl) < 0.0005) fl = 0;
        }
      }
      if (dT0) {
        const t = Math.min(1, (now - dT0) / (reduce ? 1 : 560));
        d = dFrom + (dTo - dFrom) * ease(t);
        if (t >= 1) {
          dT0 = 0;
          d = dTo;
          if (dTo === 0) cur = -1;
        }
      }
      const ph = phoneQ.matches,
        tx = ph ? 716 : 470,
        ty = ph ? 300 : 425,
        ts = ph ? 0.86 : 1.12;
      const tms = entT == null ? -1e9 : now - entT;
      const pose = it.map((_, i) => {
        const th = base + i * STEP,
          c = Math.cos(th),
          s = Math.sin(th),
          k = (1 + c) / 2;
        return {
          c,
          x: CX + R * s,
          y: CY + (1 - k) * DROP,
          sc: S0 * (0.72 + 0.28 * k),
          r: TILT * s,
          z: Math.round(k * 100) + 1,
        };
      });
      let f = 0;
      pose.forEach((q, i) => {
        if (q.c > pose[f].c) f = i;
      });
      if (f !== front) {
        front = f;
        dots.forEach((e, j) => e.classList.toggle("on", j === f % 5));
      }
      els.forEach((e, i) => {
        const q = pose[i];
        let { x, y, sc, r, z } = q;
        const pe = clamp((tms - (1 - q.c) * 260) / 1000, 0, 1),
          en = reduce ? 1 : 1 - Math.pow(1 - pe, 3);
        let op = en;
        y += 36 * (1 - en);
        sc *= 0.95 + 0.05 * en;
        if (cur >= 0) {
          if (i === cur) {
            x += (tx - x) * d;
            y += (ty - y) * d;
            sc += (ts - sc) * d;
            r *= 1 - d;
            z = 300;
          } else {
            x += 240 * d * (q.x >= pose[cur].x ? 1 : -1);
            sc *= 1 - 0.45 * d;
            op *= Math.max(0, 1 - 1.4 * d);
          }
        }
        const tb = (now - it[i].bt) / 420;
        if (tb >= 0 && tb < 1) sc *= 1 + 0.035 * Math.sin(Math.PI * tb);
        e.style.transform = `translate(${x * U}px,${y * U}px) scale(${sc}) rotate(${r}deg)`;
        e.style.opacity = op;
        e.style.zIndex = z;
        e.style.pointerEvents = cur >= 0 && i !== cur ? "none" : "";
      });
      shadow.style.transform = `translate(${(tx - 718) * 0.82 * d * U}px,${((ty - 418) * d - (ph ? 60 * d : 0)) * U}px) scaleX(${1 - 0.45 * d})`;
      closeBtn.style.left = (tx + 205 * ts) * U + "px";
      closeBtn.style.top = (ty - 200 * ts) * U + "px";
      if (d !== lastD) {
        lastD = d;
        if (d > 0) dotsEl.style.opacity = 1 - d;
        else if (dotsEl.style.opacity) dotsEl.style.opacity = 1;
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    /* entrance */
    const order = [
      "#logo",
      "#tag",
      "#nav",
      "#lblL",
      "#lblR",
      "#vert",
      "#ghost",
      "#shadow",
      "#dots",
      "#idx",
      "#hint",
    ].map($);
    if (!reduce) order.forEach((e) => e.classList.add("rv"));
    const anims = [];
    let started = false;
    function enter() {
      if (started) return;
      started = true;
      entT = performance.now() + 300;
      if (reduce) return;
      order.forEach((e, i) => {
        const g = e.id === "ghost";
        const a = e.animate(
          [
            { opacity: 0, translate: `0 ${g ? 40 : 14}px` },
            { opacity: 1, translate: "0 0" },
          ],
          {
            duration: g ? 1400 : 1000,
            delay: g ? 150 : 80 + 60 * i,
            easing: "cubic-bezier(.22,1,.36,1)",
            fill: "backwards",
          },
        );
        a.onfinish = () => {
          e.classList.remove("rv");
          a.cancel();
        };
        anims.push(a);
      });
    }
    const m = /url\(["']?(.*?)["']?\)/.exec(
      getComputedStyle(document.documentElement).getPropertyValue("--sheet"),
    );
    const img = new Image();
    img.onload = img.onerror = enter;
    if (m) img.src = m[1];
    later(enter, 2500);

    /* add to bag */
    let count = 0,
      addT;
    function land() {
      count++;
      badge.textContent = fa(count);
      bag.setAttribute("aria-label", `کیف خرید، ${fa(count)} مورد`);
      badge.classList.add("on");
      if (!reduce) {
        bag.animate(
          [
            { transform: "scale(1) rotate(-8deg)" },
            { transform: "scale(1.28) rotate(-8deg)", offset: 0.3 },
            { transform: "scale(.94) rotate(4deg)", offset: 0.65 },
            { transform: "scale(1) rotate(0)" },
          ],
          { duration: 520, easing: "ease-out" },
        );
        badge.animate(
          [{ scale: 1 }, { scale: 1.45, offset: 0.5 }, { scale: 1 }],
          { duration: 420, delay: 60, easing: "ease-out" },
        );
      }
    }
    on(addBtn, "click", () => {
      if (cur < 0) return;
      const i = cur,
        p = it[i];
      clearTimeout(addT);
      addBtn.textContent = "به کیف اضافه شد ✓";
      addT = later(() => (addBtn.textContent = "افزودن به کیف ←"), 1800);
      if (reduce) {
        land();
        return;
      }
      const rc = els[i].getBoundingClientRect(),
        bc = bag.getBoundingClientRect();
      const w = rc.width,
        h = rc.height,
        sx = rc.left,
        sy = rc.top;
      const ex = bc.left + bc.width / 2 - w / 2,
        ey = bc.top + bc.height / 2 - h / 2;
      const cx = sx + 0.62 * (ex - sx),
        cy = Math.max(0, Math.min(sy, ey) - 0.12 * h);
      const se = Math.max(0.04, (bc.width * 0.9) / w);
      const fly = document.createElement("div");
      fly.className = "fly";
      fly.style.width = w + "px";
      fly.style.height = h + "px";
      fly.style.backgroundPosition = pos(p.c, p.r);
      document.body.appendChild(fly);
      const kf = [];
      for (let j = 0; j <= 24; j++) {
        const t = j / 24,
          q = 1 - t;
        const x = q * q * sx + 2 * q * t * cx + t * t * ex,
          y = q * q * sy + 2 * q * t * cy + t * t * ey;
        const s =
          t < 0.12
            ? 1 + 0.06 * Math.sin(((Math.PI / 2) * t) / 0.12)
            : 1.06 + (se - 1.06) * Math.pow((t - 0.12) / 0.88, 0.55);
        kf.push({
          offset: t,
          transform: `translate(${x}px,${y}px) scale(${s}) rotate(${-14 * Math.sin(Math.PI * t)}deg)`,
          opacity: t > 0.9 ? 1 - (0.6 * (t - 0.9)) / 0.1 : 1,
        });
      }
      const a = fly.animate(kf, {
        duration: 950,
        easing: "cubic-bezier(.45,0,.25,1)",
        fill: "forwards",
      });
      a.onfinish = () => {
        fly.remove();
        land();
      };
    });

    return () => {
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
      timers.forEach(clearTimeout);
      anims.forEach((a) => a.cancel());
      document.querySelectorAll(".fly").forEach((e) => e.remove());
    };
  }, []);

  return (
    <main className="bunto" ref={root} dir="rtl" lang="fa">
      <svg
        width="0"
        height="0"
        style={{ position: "absolute" }}
        aria-hidden="true"
      >
        <filter id="clean" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncA type="linear" slope="1.1" intercept="-0.1" />
          </feComponentTransfer>
        </filter>
      </svg>
      <a id="logo" href="/">
        نی نی لند<sup>°</sup>
      </a>
      <div id="tag" className="caps">
       
      </div>
      <div id="nav">
        
        <button id="bag" aria-label="کیف خرید، ۰ مورد">
          <svg viewBox="0 0 16 16">
            <path d="M3.5 5.5h9l-.7 8h-7.6z" />
            <path d="M5.8 5.5V4.4a2.2 2.2 0 0 1 4.4 0v1.1" />
          </svg>
          <span className="badge" id="badge"></span>
        </button>
      </div>
      <div id="lblL" className="caps">
        پایه‌ها — ۱۶ قطعه
      </div>
      <div id="lblR" className="caps">
        پنبه‌ی ارگانیک
        <br />
        بافت
      </div>
      <div id="vert" className="caps">
        ضروریات روزمره برای کاوشگران کوچک
      </div>
      <div id="idx">
        <div className="num">
          <span id="num">۰۱</span>
        </div>
        <div className="bar"></div>
        <div className="labs caps">
          <div className="lab lab1" id="l1">
            سرهمی
            <br />
            کالکشن
          </div>
          <div className="lab lab2">
            رنگ را
            <br />
            انتخاب کنید
          </div>
        </div>
      </div>
      <div id="hint" className="caps">
        <svg viewBox="0 0 11 16">
          <path d="M5.5 1v13M1.5 10l4 4 4-4" />
        </svg>
        <span>برای کاوش پایین بروید</span>
      </div>

      <div className="stage" id="stage">
        <div id="ghost" aria-hidden="true">
          <strong>NINI LAND</strong>
        </div>
        <div id="shadow"></div>
        <div id="dots" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((n) => (
            <i className="dot" key={n} />
          ))}
        </div>
        {START.map(([c, r], i) => (
          <div
            className="item"
            key={i}
            role="button"
            tabIndex={0}
            aria-label={label(c, r)}
          >
            <div
              className="art"
              style={{ backgroundPosition: pos(c, r) }}
            ></div>
            <div
              className="art2"
              style={{ backgroundPosition: pos(c, r) }}
            ></div>
          </div>
        ))}
        <button className="close" id="close" aria-label="بستن">
          <svg viewBox="0 0 12 12">
            <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" />
          </svg>
        </button>
        <div className="panel" id="panel">
          <div className="pc" id="pcat"></div>
          <h2 id="pname"></h2>
          <p id="pdesc"></p>
          <div className="swr" role="radiogroup" aria-label="رنگ">
            {HEX.map((h, r) => (
              <button
                key={r}
                className="sw"
                style={{ background: h }}
                role="radio"
                aria-checked="false"
                aria-label={COL[r]}
              />
            ))}
          </div>
          <button className="add pc" id="add">
            افزودن به کیف ←
          </button>
        </div>
      </div>
    </main>
  );
}
