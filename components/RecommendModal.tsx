import React, { useEffect } from 'react';

interface Recommendation {
    id: string;
    name: string;
    probability: number;
}

interface RecommendModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    recommendations: Recommendation[];
}

const RecommendModal: React.FC<RecommendModalProps> = ({ isOpen, onClose, username, recommendations }) => {
    useEffect(() => {
        if (isOpen) {
            alert('모달 내부 진입 성공: ' + recommendations.length + '개 상품');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80">
            {/* Modal Box */}
            <div className="relative bg-white w-full max-w-lg rounded-none shadow-2xl p-8 border-4 border-black">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-[#A8A29E] hover:text-[#2C2A26] transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2C2A26] rounded-full flex items-center justify-center">
                            <span className="text-white text-lg">✨</span>
                        </div>
                        <h3 className="text-xl font-medium text-[#2C2A26]">{username}님을 위한 추천이에요 😊</h3>
                    </div>

                    <p className="text-[#6B665F] leading-relaxed">
                        최근 관심사와 비슷한 상품들이에요:
                    </p>

                    <div className="space-y-4 pt-2">
                        {recommendations.slice(0, 5).map((rec) => (
                            <div key={rec.id} className="group">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-[#2C2A26] group-hover:translate-x-1 transition-transform inline-block">
                                        {rec.name}
                                    </span>
                                    <span className="text-sm font-medium text-[#2C2A26]">
                                        꿀템 <span className="text-[#2C2A26] font-bold">{rec.probability}%</span>
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-[#FAF9F6] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#2C2A26] transition-all duration-1000 ease-out"
                                        style={{ width: `${rec.probability}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-[#2C2A26] text-white rounded-2xl hover:bg-[#403D37] transition-colors font-medium"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecommendModal;
