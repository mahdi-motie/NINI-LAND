import { motion } from "framer-motion";

const variants = {
  initial: { clipPath: "inset(0 0 100% 0)" }, // fully hidden (collapsed at top)
  animate: {
    clipPath: "inset(0 0 0% 0)", // fully visible
    transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
  },
  exit: {
    clipPath: "inset(100% 0 0 0)", // wipes away upward
    transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
  },
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ minHeight: "100vh" }}
    >
      {children}
    </motion.div>
  );
}
