import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { cn } from '@/renderer/utils';

// Définition des variantes d'animation
const frameVariants: Variants = {
  initial: { opacity: 0, },
  animate: { opacity: 1, },
  exit: { opacity: 0, },
};

// --- API du Contexte ---
interface AnimatedFrameSwitcherContextType {
  activeFrame: string;
  setActiveFrame: (frameName: string) => void;
}

const AnimatedFrameSwitcherContext = createContext<AnimatedFrameSwitcherContextType | null>(null);

export const useAnimatedFrameSwitcher = () => {
  const context = useContext(AnimatedFrameSwitcherContext);
  if (!context) {
    throw new Error('useAnimatedFrameSwitcher doit être utilisé à l\'intérieur de <AnimatedFrameSwitcherProvider>');
  }
  return context;
};

export const useChangeAnimatedFrame = () => {
  const ctx = useAnimatedFrameSwitcher();
  return useCallback((frame: string) => ctx.setActiveFrame(frame), [ctx]);
};

// --- Composants de l'API ---
interface AnimatedFrameSwitcherProps {
  defaultActiveFrame: string;
  children: ReactNode;
}

export const AnimatedFrameSwitcherProvider = ({ defaultActiveFrame, children }: AnimatedFrameSwitcherProps) => {
  const [activeFrame, setActiveFrame] = useState<string>(defaultActiveFrame);

  const contextValue = useMemo(() => ({
    activeFrame,
    setActiveFrame,
  }), [activeFrame]);

  const activeChild = useMemo(() => {
    const childrenArray = Array.isArray(children) ? children : [children];
    return childrenArray.find(child => (child as any)?.props?.name === activeFrame);
  }, [activeFrame, children]);

  return (
    <AnimatedFrameSwitcherContext.Provider value={contextValue}>
      <div className='relative w-full h-fit '>
        <AnimatePresence mode="wait" initial={false}>
          {activeChild}
        </AnimatePresence>
      </div>
    </AnimatedFrameSwitcherContext.Provider>
  );
};

interface AnimatedFrameProps {
  name: string;
  className?: string;
  children: ReactNode;
}

export const AnimatedFrame = ({ name, children, className }: AnimatedFrameProps) => {
  // Pas besoin de la logique de condition ici
  return (
    <motion.div
      key={name}
      variants={frameVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className={cn("w-full", className)}
    >
      {children}
    </motion.div>
  );
};