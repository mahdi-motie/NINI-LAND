// import { useState } from "react";
// import style from "./Nav.module.css";
// import { motion, AnimatePresence } from "framer-motion";
// import logo from "../../assets/images/cozen-logo-white.svg";

// const Nav = () => {
//   const [open, setOpen] = useState(false);

//   return (
//     <>
//       <nav dir="rtl">
//         <div className={style.backNav}>
//           <div className={style.navList}>
//             <ul>
//               <li>
//                 <a
//                   href="#"
//                   className={`${style.menuBtn} ${open ? style.active : ""}`}
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setOpen((prev) => !prev);
//                   }}
//                   aria-label={open ? "بستن منو" : "باز کردن منو"}
//                   aria-expanded={open}
//                 >
//                   <div className={style.Btn}>
//                     <div className={style.topLine} />
//                     <div className={style.bottomLine} />
//                   </div>
//                 </a>
//               </li>
//               <li>
//                 <a href="#">
//                   <img className={style.logo} src={logo} alt="" />
//                 </a>
//               </li>
//               <li>
//                 <a className={style.navCartBtn} href="#">
//                   <svg
//                     width="24px"
//                     height="24px"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
//                     <g
//                       id="SVGRepo_tracerCarrier"
//                       stroke-linecap="round"
//                       stroke-linejoin="round"
//                     ></g>
//                     <g id="SVGRepo_iconCarrier">
//                       {" "}
//                       <path
//                         d="M6.5098 8.46745H4.6797C3.66897 8.46745 2.84961 9.28681 2.84961 10.2975V14.2717C2.84961 15.2425 3.23524 16.1735 3.92165 16.8599L5.43775 18.376C6.12417 19.0624 7.05516 19.448 8.0259 19.448H15.9743C16.945 19.448 17.876 19.0624 18.5624 18.376L20.0785 16.8599C20.7649 16.1735 21.1506 15.2425 21.1506 14.2717V10.2975C21.1506 9.28681 20.3312 8.46745 19.3205 8.46745H17.4904M6.5098 8.46745V5.72231C6.5098 4.71157 7.32916 3.89221 8.3399 3.89221H15.6603C16.671 3.89221 17.4904 4.71157 17.4904 5.72231V8.46745M6.5098 8.46745H17.4904"
//                         stroke="#000"
//                         stroke-width="1.69905"
//                         stroke-linecap="round"
//                       ></path>{" "}
//                       <path
//                         d="M10.1699 13.0427H13.8301"
//                         stroke="#"
//                         stroke-width="1.69905"
//                         stroke-linecap="round"
//                       ></path>{" "}
//                     </g>
//                   </svg>
//                 </a>
//               </li>
//             </ul>
//           </div>
//         </div>
//         {/* Sidebar: rendered only while open, so exit animations need AnimatePresence */}
//         <AnimatePresence>
//           {open && (
//             <motion.div
//               key="overlay"
//               className={style.overlay}
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setOpen(false)}
//             />
//           )}

//           {open && (
//             <motion.aside
//               key="sidebar"
//               dir="rtl"
//               className={style.sidebar}
//               initial={{ y: "-100%" }}
//               animate={{ y: 0 }}
//               exit={{ y: "-100%" }}
//               transition={{ duration: 0.35, ease: "easeInOut" }}
//             >
//               <div className={style.sideLayout}>
//                 <a href="#" onClick={() => setOpen(false)}>
//                   <p>خانه</p>
//                   <svg
//                     width="24"
//                     height="24"
//                     viewBox="0 0 25 24"
//                     fill="none"
//                     stroke="currentColor"
//                     className={style.arrow}
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       d="M19.25 8.5L12.25 15.5L5.25 8.5"
//                       strokeWidth="2"
//                       strokeLinecap="square"
//                     />
//                   </svg>
//                 </a>
//                 <a href="#" onClick={() => setOpen(false)}>
//                   <p>محصولات</p>
//                   <svg
//                     width="24"
//                     height="24"
//                     viewBox="0 0 25 24"
//                     fill="none"
//                     stroke="currentColor"
//                     className={style.arrow}
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       d="M19.25 8.5L12.25 15.5L5.25 8.5"
//                       strokeWidth="2"
//                       strokeLinecap="square"
//                     />
//                   </svg>
//                 </a>
//                 <a href="#" onClick={() => setOpen(false)}>
//                   <p>درباره ما</p>
//                   <svg
//                     width="24"
//                     height="24"
//                     viewBox="0 0 25 24"
//                     fill="none"
//                     stroke="currentColor"
//                     className={style.arrow}
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       d="M19.25 8.5L12.25 15.5L5.25 8.5"
//                       strokeWidth="2"
//                       strokeLinecap="square"
//                     />
//                   </svg>
//                 </a>
//                 <a href="#" onClick={() => setOpen(false)}>
//                   <p>سبد خرید</p>
//                   <svg
//                     width="24"
//                     height="24"
//                     viewBox="0 0 25 24"
//                     fill="none"
//                     stroke="currentColor"
//                     className={style.arrow}
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       d="M19.25 8.5L12.25 15.5L5.25 8.5"
//                       strokeWidth="2"
//                       strokeLinecap="square"
//                     />
//                   </svg>
//                 </a>
//               </div>
//             </motion.aside>
//           )}
//         </AnimatePresence>
//       </nav>
//       <div className={style.navBackground}></div>
//     </>
//   );
// };

// export default Nav;
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const DEFAULT_ITEMS = [
  { label: "خانه", href: "#home" },
  { label: "کالکشن ها", href: "#work" },
  { label: "سبد خرید", href: "#about" },
  { label: "پروفایل", href: "#journal" },
];
import "./Nav.css";

export default function CreativeNav({
  items = DEFAULT_ITEMS,
  brand = "",
  activeHref,
  onNavigate,
  dripStretch = 1,
}) {
  const [internalActive, setInternalActive] = useState(items[0]?.href);
  const active = activeHref ?? internalActive;
  const [hovered, setHovered] = useState(null);
  const [open, setOpen] = useState(false);
  const [blob, setBlob] = useState({ x: 0, w: 0, ready: false });

  const listRef = useRef(null);
  const itemRefs = useRef({});
  const target = hovered ?? active;

  const measure = () => {
    const el = itemRefs.current[target];
    if (!el) return;
    setBlob({ x: el.offsetLeft, w: el.offsetWidth, ready: true });
  };

  useLayoutEffect(measure, [target, items]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [target]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (e, href) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
    setInternalActive(href);
    setOpen(false);
  };

  return (
    <>
      <header className="cn-wrap">
        <div className="cn-pillwrap">
          <nav className="cn-pill" dir="rtl" aria-label="Main" data-open={open}>
            <a
              className="cn-brand"
              href={items[0]?.href}
              onClick={(e) => go(e, items[0]?.href)}
              aria-label={`${brand} home`}
            >
              <span className="cn-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path
                    d="M12 2c2.2 4.6 5.4 7.8 10 10-4.6 2.2-7.8 5.4-10 10-2.2-4.6-5.4-7.8-10-10 4.6-2.2 7.8-5.4 10-10Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="cn-brand-text">{brand}</span>
            </a>

            <ul
              className="cn-list"
              ref={listRef}
              onMouseLeave={() => setHovered(null)}
            >
              <li
                className="cn-blob"
                aria-hidden="true"
                style={{
                  width: blob.w,
                  transform: `translateX(${blob.x}px)`,
                  opacity: blob.ready ? 1 : 0,
                }}
              />
              {items.map((item) => (
                <li
                  key={item.href}
                  ref={(el) => (itemRefs.current[item.href] = el)}
                >
                  <a
                    className="cn-link"
                    href={item.href}
                    data-on={target === item.href}
                    aria-current={active === item.href ? "page" : undefined}
                    onMouseEnter={() => setHovered(item.href)}
                    onFocus={() => setHovered(item.href)}
                    onBlur={() => setHovered(null)}
                    onClick={(e) => go(e, item.href)}
                  >
                    <span className="cn-roll">
                      <span>{item.label}</span>
                      <span aria-hidden="true">{item.label}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <button
              className="cn-toggle"
              type="button"
              aria-expanded={open}
              aria-controls="cn-panel"
              onClick={() => setOpen((o) => !o)}
            >
              <span className="cn-toggle-label">{open ? "بستن" : "منو"}</span>
              <span className="cn-bars" aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </nav>
          <div
            className="cn-drip-clip"
            aria-hidden="true"
            style={{ aspectRatio: `1008 / ${215 * dripStretch}` }}
          >
            <svg
              className="cn-drip"
              viewBox="0 0 1008 235"
              preserveAspectRatio="none"
              focusable="false"
              style={{ aspectRatio: `1008 / ${235 * dripStretch}` }}
            >
              {/* extra ink above the shape so no gap shows during the bounce */}
              <rect
                x="0"
                y="-300"
                width="1008"
                height="302"
                fill="currentColor"
              />
              <path
                d="M0 0H1008V72.944C1002.93 79.1696 999.1 81.8717 990.198 81.8717C988.812 81.3041 987.988 80.861 986.915 80.2915C976.16 74.5735 975.599 59.9348 974.275 49.5684C973.32 42.1242 972.503 33.7896 970.264 26.6357C968.379 20.6054 963.28 15.5742 957.649 12.7201C954.839 11.2957 950.562 11.9722 947.668 12.8897C924.038 20.3808 933.985 57.4365 924.83 74.9109C922.881 78.6329 920.021 81.2027 915.956 82.4714C912.068 83.6844 903.942 84.7516 900.265 82.7814C894.959 79.9366 895.648 67.2037 893.97 61.8762C892.198 56.2567 888.329 50.6937 882.97 47.9713C874.199 43.512 866.593 43.9925 857.893 49.1106C849.193 54.2287 842.551 86.6994 847.823 110.538C849.348 116.578 850.938 120.594 852.301 126.952C856.554 146.77 855.949 168.957 835.636 179.639C829.587 182.008 821.082 181.448 815.456 178.965C803.737 173.794 805.14 160.423 805.652 149.693C806.07 140.843 810.416 130.847 810.638 121.686C811.071 101.08 804.505 80.274 791.743 64.0443C782.706 52.5552 767.64 42.5214 754.056 53.6297C747.559 58.944 741.731 61.9357 737.056 69.5556C735.904 71.4288 731.149 74.7651 729.589 76.7241C703.105 110.483 680.508 94.3798 656.913 68.9871C655.19 67.1374 648.349 63.293 645.524 61.9425C611.937 46.7564 594.499 91.7836 561.586 88.5799C523.929 84.914 511.073 33.5536 469.819 48.9136C462.665 51.5776 460.279 55.8096 455.173 60.512C440.616 73.9187 439.397 95.3715 440.139 113.802C440.411 118.592 442.123 123.331 442.477 128.075C444.07 150.959 454.679 179.497 435.697 197.947C423.014 210.275 400.303 208.646 391.668 192.371C388.888 187.131 385.462 179.044 385.106 172.889C382.68 130.944 420.131 87.9305 395.414 48.0698C389.898 39.1347 388.28 38.3892 378.738 33.6945C365.582 27.2215 352.255 30.3635 343.386 42.1916C327.278 63.6738 339.994 91.4311 339.149 115.34C338.735 127.05 332.254 144.127 319.645 148.007C315.33 149.414 306.573 149.922 302.562 147.586C292.853 141.932 288.816 129.52 289.492 118.903C289.931 112.018 289.642 108.247 291.509 101.695C297.23 81.6206 310.311 64.2871 302.431 42.5828C300.265 36.03 292.918 29.328 286.981 25.9231C280.325 22.1061 273.336 24.209 267.57 29.3495C262.503 33.8677 261.095 38.1825 258.595 43.7364C255.321 51.0184 255.33 59.0596 253.137 66.7156C247.985 84.6999 238.52 94.8936 220.668 87.0553C212.982 80.9602 217.046 69.9471 213.723 58.1425C212.43 53.5493 208.643 46.7748 206.445 44.8705C204.247 42.9661 195.022 37.4331 186.513 36.6203C177.943 35.8016 166.217 40.431 159.836 45.8658C141.755 61.0878 139.644 90.2917 142.214 112.221C144.567 132.31 149.107 151.463 146.971 172.197C145.525 186.228 143.49 195.224 131.852 204.463C120.158 213.747 98.0595 211.62 89.2513 199.31C71.6487 176.821 80.7256 146.104 82.2194 120.278C83.2127 103.105 84.2723 84.1978 72.5637 70.3333C65.5672 62.0541 55.5512 57.6515 44.9268 56.5414C31.827 55.173 21.306 58.469 11.397 64.607C7.197 68.007 0.2 70.807 0 65.407V0Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        <div id="cn-panel" className="cn-panel" data-open={open}>
          <ul>
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  tabIndex={open ? 0 : -1}
                  aria-current={active === item.href ? "page" : undefined}
                  onClick={(e) => go(e, item.href)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </header>
    </>
  );
}
