import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaSignOutAlt, FaTimes } from 'react-icons/fa';
import styles from './ConfirmModal.module.css';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onCancel,
    onConfirm, 
    title = 'Confirmar Ação', 
    message = 'Tem certeza que deseja realizar esta ação?', 
    confirmText = 'Confirmar', 
    cancelText = 'Cancelar',
    type = 'danger' // danger, warning, info
}) => {
    const handleClose = onClose || onCancel;

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <FaSignOutAlt />;
            case 'warning': return <FaExclamationTriangle />;
            default: return <FaExclamationTriangle />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlay} onClick={handleClose}>
                    <motion.div 
                        className={styles.modal}
                        onClick={e => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        <button className={styles.closeBtn} onClick={handleClose}>
                            <FaTimes />
                        </button>

                        <div className={styles.header}>
                            <div className={`${styles.iconWrapper} ${styles[type]}`}>
                                {getIcon()}
                            </div>
                            <h2 className={styles.title}>{title}</h2>
                        </div>

                        <div className={styles.body}>
                            <p className={styles.message}>{message}</p>
                        </div>

                        <div className={styles.footer}>
                            <button className={styles.cancelBtn} onClick={handleClose}>
                                {cancelText}
                            </button>
                            <button className={`${styles.confirmBtn} ${styles[type]}`} onClick={onConfirm}>
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
