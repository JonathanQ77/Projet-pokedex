import { motion, spring } from "framer-motion";

export default function Logo() {
  return (
    <motion.img
      src="/logo.png"
      alt="logo"
      className="w-[300px] mx-auto mt-10 mb-14"
      animate={{
        // x: 50,
        // // rotate: 50,
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
        // type: "spring",
      }}
      initial={{
        opacity: 0,
        y: -40,
      }}
    />
  );
}
