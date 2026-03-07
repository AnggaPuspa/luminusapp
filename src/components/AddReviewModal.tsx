"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import StarRating from './common/StarRating';

interface AddReviewModalProps {
    courseId: string;
    courseTitle: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({
    courseId,
    courseTitle,
    isOpen,
    onClose,
    onSuccess
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error("Silakan berikan rating bintang (1-5)");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/student/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId, rating, comment }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Gagal mengirim ulasan');
            }

            toast.success("Terima kasih atas ulasanmu!");
            if (onSuccess) onSuccess();
            onClose();

        } catch (error: any) {
            toast.error(error.message || 'Terjadi kesalahan sistem');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Beri Ulasan</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6 focus-within:ring-2 ring-blue-100 rounded-xl p-4 bg-gray-50 border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Kelas:</p>
                        <p className="font-semibold text-gray-900 leading-tight">{courseTitle}</p>
                    </div>

                    <div className="mb-8 flex flex-col items-center">
                        <p className="text-sm font-medium text-gray-600 mb-3">Berapa rating untuk kelas ini?</p>
                        <StarRating
                            rating={rating}
                            onRatingChange={setRating}
                            size="lg"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                            Tulis ulasanmu (Opsional)
                        </label>
                        <textarea
                            id="comment"
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none text-gray-700"
                            placeholder="Ceritakan pengalaman belajarmu di kelas ini..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
                    >
                        {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddReviewModal;
