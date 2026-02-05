/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useMemo } from 'react';
import { Product } from '../types';

import ProductCard from './ProductCard';

const categories = [
  { id: 'All', label: '전체' },
  { id: 'Audio', label: '오디오' },
  { id: 'Wearable', label: '웨어러블' },
  { id: 'Mobile', label: '모바일' },
  { id: 'Home', label: '홈' }
];


interface ProductGridProps {
  onProductClick: (product: Product) => void;
  products: Product[];
  onAiRecommend: () => void;
  isAiLoading?: boolean;
  aiRecommendations?: any[];
  showAiSection?: boolean;
  onCloseAiSection?: () => void;
}


const ProductGrid: React.FC<ProductGridProps> = ({
  onProductClick,
  products,
  onAiRecommend,
  isAiLoading,
  aiRecommendations,
  showAiSection,
  onCloseAiSection
}) => {

  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory, products]);


  return (
    <section id="products" className="py-32 px-6 md:px-12 bg-[#F5F2EB]">
      <div className="max-w-[1800px] mx-auto">

        {/* AI Recommendations Section (Inline Fallback) */}
        {showAiSection && aiRecommendations && aiRecommendations.length > 0 && (
          <div className="mb-20 p-8 bg-white border-4 border-black rounded-none animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif">✨ 당신을 위한 AI의 발견</h3>
              <button
                onClick={onCloseAiSection}
                className="text-sm uppercase tracking-widest border-b border-black"
              >
                닫기
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aiRecommendations.slice(0, 3).map(rec => {
                const fullProduct = products.find(p => p.id === rec.id);
                if (!fullProduct) return null;
                return (
                  <div key={rec.id} className="border border-[#EBE7DE] p-4">
                    <div className="aspect-[4/5] mb-4 bg-[#EBE7DE]">
                      <img src={fullProduct.imageUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="font-serif">{fullProduct.name}</h4>
                        <p className="text-xs text-[#A8A29E] uppercase">{fullProduct.category}</p>
                      </div>
                      <span className="text-sm font-bold">{rec.probability}% 매칭</span>
                    </div>
                    <button
                      onClick={() => onProductClick(fullProduct)}
                      className="w-full mt-4 py-2 bg-[#2C2A26] text-white text-xs uppercase"
                    >
                      상세보기
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Header Area */}
        <div className="flex flex-col items-center text-center mb-24 space-y-8">
          <h2 className="text-4xl md:text-6xl font-serif text-[#2C2A26]">컬렉션</h2>


          {/* Minimal Filter */}
          <div className="flex flex-wrap justify-center gap-8 pt-4 border-t border-[#D6D1C7]/50 w-full max-w-2xl">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`text-sm uppercase tracking-widest pb-1 border-b transition-all duration-300 ${activeCategory === cat.id
                  ? 'border-[#2C2A26] text-[#2C2A26]'
                  : 'border-transparent text-[#A8A29E] hover:text-[#2C2A26]'
                  }`}
              >
                {cat.label}
              </button>
            ))}

            <button
              onClick={onAiRecommend}
              disabled={isAiLoading}
              className={`text-sm uppercase tracking-widest py-2 border-b border-dashed border-[#2C2A26] text-[#2C2A26] ml-auto hover:bg-[#2C2A26] hover:text-white active:scale-95 transition-all px-4 bg-[#F5F2EB] rounded-lg ${isAiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isAiLoading ? '✨ 유영 중...' : '✨ AI 추천받기'}
            </button>
          </div>
        </div>

        {/* Large Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onClick={onProductClick} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
