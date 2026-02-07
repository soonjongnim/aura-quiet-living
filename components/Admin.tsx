import React, { useState, useEffect } from 'react';

interface ModelWeights {
    bias: number;
    w_view: number;
    w_click: number;
    w_buy: number;
    accuracy: number;
    updated_at: string;
}

interface TrainingLog {
    id: number;
    status: string;
    message: string;
    timestamp: string;
}

const Admin: React.FC = () => {
    const [weights, setWeights] = useState<ModelWeights | null>(null);
    const [logs, setLogs] = useState<TrainingLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [autoBatch, setAutoBatch] = useState(true);

    const fetchStatus = async () => {
        const API_BASE_URL = '';
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/status`);
            if (!res.ok) throw new Error('서버 응답 오류 (Status: ' + res.status + ')');
            const data = await res.json();
            setWeights(data.weights);
            setLogs(data.logs);
        } catch (err) {
            console.error('Failed to fetch admin status', err);
            setError('데이터를 불러오지 못했습니다. 서버가 실행 중인지 확인해 주세요.');
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const handleTrain = async () => {
        const API_BASE_URL = '';
        setLoading(true);
        try {
            await fetch(`${API_BASE_URL}/api/admin/train`, { method: 'POST' });
            await fetchStatus();
        } catch (err) {
            console.error('Training failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-32 pb-24 px-6 md:px-12 bg-[#F5F2EB] min-h-screen">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-serif text-[#2C2A26] mb-12">AI 관리자 대시보드</h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-12 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">⚠️</span>
                            <span>{error}</span>
                        </div>
                        <button
                            onClick={fetchStatus}
                            className="bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-800 transition-colors"
                        >
                            다시 시도
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">

                    {/* Weights Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E5E1D8]">
                        <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            현재 모델 가중치 (로지스틱 회귀)
                        </h2>
                        {weights ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-[#FAF9F6]">
                                    <span className="text-[#6B665F]">AI 정확도 (Accuracy)</span>
                                    <span className="font-mono font-medium text-green-600">
                                        {(weights.accuracy || 0).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-[#FAF9F6]">
                                    <span className="text-[#6B665F]">조회 가중치 (View)</span>
                                    <span className="font-mono font-medium">{weights.w_view.toFixed(4)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-[#FAF9F6]">
                                    <span className="text-[#6B665F]">클릭 가중치 (Click)</span>
                                    <span className="font-mono font-medium">{weights.w_click.toFixed(4)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-[#FAF9F6]">
                                    <span className="text-[#6B665F]">구매 가중치 (Buy)</span>
                                    <span className="font-mono font-medium">{weights.w_buy.toFixed(4)}</span>
                                </div>
                                <p className="text-xs text-[#A8A29E] mt-4">최근 업데이트: {new Date(weights.updated_at).toLocaleString()}</p>
                            </div>
                        ) : (
                            <p>데이터를 불러오는 중...</p>
                        )}
                    </div>

                    {/* Controls Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E5E1D8]">
                        <h2 className="text-xl font-medium mb-6">배치 및 학습 제어</h2>
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium">일 배치 자동 실행</h3>
                                    <p className="text-sm text-[#6B665F]">매일 자정 자동으로 모델을 재학습합니다.</p>
                                </div>
                                <button
                                    onClick={() => setAutoBatch(!autoBatch)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${autoBatch ? 'bg-[#2C2A26]' : 'bg-[#D6D1C7]'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${autoBatch ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="pt-4 border-t border-[#FAF9F6]">
                                <button
                                    onClick={handleTrain}
                                    disabled={loading}
                                    className="w-full py-4 bg-[#2C2A26] text-white rounded-xl hover:bg-[#403D37] transition-all disabled:opacity-50 font-medium"
                                >
                                    {loading ? '학습 진행 중...' : '지금 수동 학습 시작'}
                                </button>
                                <p className="text-xs text-[#A8A29E] mt-4 text-center">수동 학습은 실시간 데이터를 기반으로 가중치를 즉시 업데이트합니다.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logs Section */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E5E1D8]">
                    <h2 className="text-xl font-medium mb-6">학습 로그</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-[#E5E1D8] text-[#6B665F]">
                                    <th className="pb-4 font-medium">상태</th>
                                    <th className="pb-4 font-medium">메시지</th>
                                    <th className="pb-4 font-medium">일시</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#FAF9F6]">
                                {logs.map(log => (
                                    <tr key={log.id}>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                                                log.status === 'ERROR' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-[#2C2A26]">{log.message}</td>
                                        <td className="py-4 text-[#6B665F]">{new Date(log.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
