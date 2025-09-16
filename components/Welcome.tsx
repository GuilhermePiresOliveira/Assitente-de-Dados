import React from 'react';
import { BarChartIcon, BrainCircuitIcon, UploadCloudIcon, DashboardIcon } from './icons';

interface WelcomeProps {
    t: (key: string) => string;
}

export const Welcome: React.FC<WelcomeProps> = ({ t }) => {
  return (
    <div className="text-center mt-12 p-8 bg-white dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-xl animate-fade-in">
      <BrainCircuitIcon className="mx-auto h-16 w-16 text-indigo-500 dark:text-indigo-400 animate-fade-in" style={{ animationDelay: '100ms' }}/>
      <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-white animate-fade-in-up" style={{ animationDelay: '200ms' }}>{t('welcome.title')}</h2>
      <p className="mt-2 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        {t('welcome.subtitle')}
      </p>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-600 text-white">
            <UploadCloudIcon className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-lg font-medium text-gray-900 dark:text-white">{t('welcome.step1.title')}</h3>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
            {t('welcome.step1.desc')}
          </p>
        </div>
        <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-600 text-white">
            <BarChartIcon className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-lg font-medium text-gray-900 dark:text-white">{t('welcome.step2.title')}</h3>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
            {t('welcome.step2.desc')}
          </p>
        </div>
        <div className="flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-600 text-white">
            <DashboardIcon className="h-6 w-6" />
          </div>
          <h3 className="mt-5 text-lg font-medium text-gray-900 dark:text-white">{t('welcome.step3.title')}</h3>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
            {t('welcome.step3.desc')}
          </p>
        </div>
      </div>
    </div>
  );
};