import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  className?: string;
}

export const ScrollReveal = ({ children, width = "fit-content", className = "" }: ScrollRevealProps) => {
  return (
    <div style={{ width }} className={className}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ScrollReveal;
