import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const WelcomeSplashScreen: React.FC = () => {
  const [visible, setVisible] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  const greeting = user?.firstName ? `Hello, ${user.firstName}` : 'Welcome to Nexus';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center select-none bg-slate-950"
          style={{ background: 'linear-gradient(135deg, #052e16 0%, #020617 65%, #064e3b 100%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          onClick={() => setVisible(false)}
        >
          <motion.div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500 text-white shadow-2xl shadow-brand-500/30"
            initial={{ scale: 0.7, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: 'backOut' }}
          >
            <ShoppingBag className="h-10 w-10" />
          </motion.div>

          <div className="px-4 text-center">
            <motion.h1
              className="text-4xl font-black tracking-tight text-white sm:text-5xl"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              {greeting}
            </motion.h1>
            <motion.p
              className="mt-2 text-lg font-light text-green-200"
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Premium technology, thoughtfully curated.
            </motion.p>
          </div>

          <p className="absolute bottom-8 text-xs text-green-100/60">Click anywhere to skip</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
