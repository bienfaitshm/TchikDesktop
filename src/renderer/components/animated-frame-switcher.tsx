import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { cn } from '@/renderer/utils';

// Définition des variantes d'animation
const frameVariants: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

interface AnimatedFrameSwitcherContextType {
  activeFrame: string;
  setActiveFrame: (frameName: string) => void;
}

const AnimatedFrameSwitcherContext = createContext<AnimatedFrameSwitcherContextType | null>(null);

export const useAnimatedFrameSwitcher = () => {
  const context = useContext(AnimatedFrameSwitcherContext);
  if (!context) {
    throw new Error('useAnimatedFrameSwitcher doit être utilisé à l\'intérieur de <AnimatedFrameSwitcherContent>');
  }
  return context;
};

export const useChangeAnimatedFrame = () => {
  const ctx = useAnimatedFrameSwitcher()
  return useCallback((frame: string) => ctx.setActiveFrame(frame), [])
}

interface AnimatedFrameSwitcherProps {
  defaultActiveFrame: string;
}

export const AnimatedFrameSwitcherProvider: React.FC<React.PropsWithChildren<AnimatedFrameSwitcherProps>> = ({ defaultActiveFrame, children }) => {
  const [activeFrame, setActiveFrame] = useState<string>(defaultActiveFrame);

  const contextValue = useMemo(() => ({
    activeFrame,
    setActiveFrame,
  }), [activeFrame]);

  return (
    <AnimatedFrameSwitcherContext.Provider value={contextValue}>
      {children}
    </AnimatedFrameSwitcherContext.Provider>
  );
};

export const AnimatedFrameSwitcherContent: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className='relative w-full h-full'>
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </div>
  );
};

interface AnimatedFrameProps {
  name: string;
  className?: string;
}

export const AnimatedFrame: React.FC<React.PropsWithChildren<AnimatedFrameProps>> = ({ name, children, className }) => {
  const { activeFrame } = useAnimatedFrameSwitcher();

  if (activeFrame !== name) {
    return null;
  }

  return (
    <motion.div
      key={name}
      variants={frameVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className={cn("absolute inset-0 w-full h-full", className)}
    >
      {children}
    </motion.div>
  );
};