import React from 'react';
import { UndoIcon, RedoIcon } from './icons';

interface HistoryControlsProps {
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    t: (key: string) => string;
}

export const HistoryControls: React.FC<HistoryControlsProps> = ({ onUndo, onRedo, canUndo, canRedo, t }) => {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onUndo}
                disabled={!canUndo}
                title={t('history.undo')}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 enabled:hover:bg-gray-200 dark:enabled:hover:bg-gray-600 enabled:hover:text-gray-900 dark:enabled:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <UndoIcon className="h-5 w-5" />
            </button>
            <button
                onClick={onRedo}
                disabled={!canRedo}
                title={t('history.redo')}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 enabled:hover:bg-gray-200 dark:enabled:hover:bg-gray-600 enabled:hover:text-gray-900 dark:enabled:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <RedoIcon className="h-5 w-5" />
            </button>
        </div>
    );
};
