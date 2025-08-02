import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
};

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 3000,
  onClose,
  isVisible,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, isVisible, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getToastClasses = () => {
    const baseClasses = "fixed z-50 flex items-center p-4 rounded-lg shadow-lg";
    
    // Position classes
    const positionClasses = "top-4 right-4";
    
    // Type-specific background classes
    let typeClasses = "bg-white border-l-4";
    switch (type) {
      case 'success':
        typeClasses += " border-green-500";
        break;
      case 'error':
        typeClasses += " border-red-500";
        break;
      case 'info':
        typeClasses += " border-blue-500";
        break;
    }
    
    // Animation classes
    const animationClasses = isVisible 
      ? "animate-toast-enter" 
      : "animate-toast-exit";
    
    return `${baseClasses} ${positionClasses} ${typeClasses} ${animationClasses}`;
  };

  if (!isVisible) return null;

  return (
    <div className={getToastClasses()}>
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="ml-2 mr-6">
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="ml-auto bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;