import { useAnimation as useFramerAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

export const useAnimation = (threshold = 0.1) => {
  const controls = useFramerAnimation();
  const [ref, inView] = useInView({ threshold });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return { ref, controls, inView };
};

export const useScrollAnimation = (variants) => {
  const { ref, controls } = useAnimation();

  return {
    ref,
    variants,
    animate: controls,
    initial: "hidden",
  };
};
