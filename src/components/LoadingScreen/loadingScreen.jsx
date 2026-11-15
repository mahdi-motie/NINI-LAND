import { motion } from "framer-motion";

const css = `
.loading-screen {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  z-index: 9999;
}
.loading-ring {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #e5e5e5;
  border-top-color: #111;
}
@media (prefers-color-scheme: dark) {
  .loading-screen { background: #fff; }
  .loading-ring { border-color: #262626; border-top-color: #fff; }
}
`;

export default function LoadingScreen() {
  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <style>{css}</style>

      <motion.div
        className="loading-ring"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, rotate: 360 }}
        transition={{
          opacity: { duration: 0.3 },
          scale: { duration: 0.3 },
          rotate: { duration: 0.9, repeat: Infinity, ease: "linear" },
        }}
      />
    </motion.div>
  );
}