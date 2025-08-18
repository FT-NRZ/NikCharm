import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingModal = ({ isVisible, onClose }) => {
  const [showModal, setShowModal] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShowModal(true);
      const timer = setTimeout(() => {
        setShowModal(false);
        if (onClose) onClose();
      }, 3000); // 3-second fade-out

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="loading-modal absolute top-0 w-dvw h-dvh z-50 bg-white/50 backdrop-blur-2xl flex flex-col justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingModal;