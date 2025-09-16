import React, { useState, useEffect, useCallback } from 'react';
import { StarIcon, XIcon, CheckCircleIcon } from './icons';

interface FeedbackPopupProps {
    isOpen: boolean;
    onClose: () => void;
    t: (key: string) => string;
}

export const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ isOpen, onClose, t }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const handleClose = useCallback(() => {
        // Reset state for next time
        setTimeout(() => {
            setRating(0);
            setComment('');
            setIsSubmitted(false);
            setHoverRating(0);
        }, 300); // Wait for fade-out animation
        onClose();
    }, [onClose]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleClose]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Feedback Submitted:', { rating, comment });
        // In a real app, you would send this to a server.
        setIsSubmitted(true);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={handleClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md m-4 transform animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                {isSubmitted ? (
                    <div className="p-8 text-center">
                        <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{t('feedback.popup.thanks.title')}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('feedback.popup.thanks.message')}</p>
                        <button
                            onClick={handleClose}
                            className="mt-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {t('feedback.popup.thanks.button.close')}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('feedback.popup.title')}</h2>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="p-1 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                aria-label="Close"
                            >
                                <XIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('feedback.popup.rating')}</label>
                                <div className="flex items-center space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                            className="focus:outline-none"
                                        >
                                            <StarIcon
                                                className={`h-8 w-8 transition-colors ${
                                                    (hoverRating || rating) >= star
                                                        ? 'text-yellow-400'
                                                        : 'text-gray-300 dark:text-gray-600'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="feedback-comment" className="sr-only">{t('feedback.popup.placeholder')}</label>
                                <textarea
                                    id="feedback-comment"
                                    rows={4}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-3 text-gray-700 dark:text-gray-300 font-sans text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                    placeholder={t('feedback.popup.placeholder')}
                                />
                            </div>
                        </div>

                        <div className="p-6 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {t('feedback.popup.button.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={rating === 0 && comment.trim() === ''}
                                className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {t('feedback.popup.button.submit')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};