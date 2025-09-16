import React from 'react';

interface LoaderProps {
  message: string;
  t: (key: string) => string;
}

export const Loader: React.FC<LoaderProps> = ({ message, t }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-16">
      <div className="w-12 h-12 border-4 border-t-indigo-500 border-gray-200 dark:border-gray-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 font-semibold">{t(message)}</p>
      <p className="text-sm text-gray-500 dark:text-gray-500">{t('loader.submessage')}</p>
    </div>
  );
};