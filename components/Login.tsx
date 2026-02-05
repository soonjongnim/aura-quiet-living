import React, { useState } from 'react';

interface LoginProps {
    onLogin: (username: string, password: string) => void;
    onBack: () => void;
    error?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, onBack, error }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2EB] px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-[#E5E1D8]">
                <h2 className="text-3xl font-light mb-8 text-center tracking-tight">로그인</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[#6B665F] mb-2">사용자 아이디</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-[#E5E1D8] focus:outline-none focus:ring-1 focus:ring-[#2C2A26] transition-all bg-[#FAF9F6]"
                            placeholder="아이디를 입력하세요"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#6B665F] mb-2">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-[#E5E1D8] focus:outline-none focus:ring-1 focus:ring-[#2C2A26] transition-all bg-[#FAF9F6]"
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full py-4 bg-[#2C2A26] text-white rounded-xl hover:bg-[#403D37] active:scale-95 transition-all duration-200 font-medium tracking-wide"
                    >
                        로그인하기
                    </button>
                </form>
                <button
                    onClick={onBack}
                    className="w-full mt-4 py-2 text-[#6B665F] hover:text-[#2C2A26] transition-colors text-sm"
                >
                    돌아가기
                </button>
            </div>
        </div>
    );
};

export default Login;
