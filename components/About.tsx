/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="bg-[#EBE7DE]">

      {/* Introduction / Story */}
      <div className="py-24 px-6 md:px-12 max-w-[1800px] mx-auto flex flex-col md:flex-row items-start gap-16 md:gap-32">
        <div className="md:w-1/3">
          <h2 className="text-4xl md:text-6xl font-serif text-[#2C2A26] leading-tight">
            대지에서 태어나, <br /> 마음을 위해 만들어진.
          </h2>
        </div>

        <div className="md:w-2/3 max-w-2xl">
          <p className="text-lg md:text-xl text-[#5D5A53] font-light leading-relaxed mb-8">
            Aura는 기술이 기술처럼 느껴지지 않아야 한다는 단순하지만 급진적인 전제 위에 설립되었습니다. 그것은 강물에 깎인 돌이나 책장이 넘어가는 느낌처럼 자연스러워야 합니다.
          </p>
          <p className="text-lg md:text-xl text-[#5D5A53] font-light leading-relaxed mb-8">
            무한한 집중 방해의 시대에, 우리는 당신의 정적을 존중하는 물건을 디자인합니다. 우리는 세월이 흐를수록 우아하게 변하는 소재(사암, 가공되지 않은 알루미늄, 유기농 면)를 사용하여 디지털 세계와 당신의 물리적 공간을 연결합니다.
          </p>

          <img
            src="https://images.pexels.com/photos/6583355/pexels-photo-6583355.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Aura Design Studio"
            className="w-full h-[400px] object-cover grayscale contrast-[0.9] brightness-110 mt-12"
          />
          <p className="text-sm font-medium uppercase tracking-widest text-[#A8A29E] mt-4">
            아우라 스튜디오, 교토
          </p>

        </div>
      </div>

      {/* Philosophy Blocks (Formerly Features) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
        <div className="order-2 lg:order-1 relative h-[500px] lg:h-auto overflow-hidden group">
          <img
            src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=1200"
            alt="Natural Stone Texture"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
          />
        </div>
        <div className="order-1 lg:order-2 flex flex-col justify-center p-12 lg:p-24 bg-[#D6D1C7]">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#5D5A53] mb-6">소재감</span>
          <h3 className="text-4xl md:text-5xl font-serif mb-8 text-[#2C2A26] leading-tight">
            우아하게 <br /> 나이 드는 소재.
          </h3>
          <p className="text-lg text-[#5D5A53] font-light leading-relaxed mb-12 max-w-md">
            우리는 일회용을 거부합니다. 모든 Aura 제품은 사암, 폴리싱되지 않은 알루미늄, 유기농 직물로 제작되어 시간이 지남에 따라 독특한 태닝(patina)이 생기며 사용자의 이야기를 들려줍니다.
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh]">
        <div className="flex flex-col justify-center p-12 lg:p-24 bg-[#2C2A26] text-[#F5F2EB]">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A8A29E] mb-6">생태계</span>
          <h3 className="text-4xl md:text-5xl font-serif mb-8 text-[#F5F2EB] leading-tight">
            기본적인 고요함.
          </h3>
          <p className="text-lg text-[#A8A29E] font-light leading-relaxed mb-12 max-w-md">
            우리의 장치는 당신의 집중력을 존중합니다. 깜박이는 불빛도, 방해되는 알림도 없습니다. 필요할 때만 담백하게 기능하고, 그렇지 않을 때는 그저 아름다운 오브제로 남습니다.
          </p>
        </div>

        <div className="relative h-[500px] lg:h-auto overflow-hidden group">
          <img
            src="https://images.pexels.com/photos/6801917/pexels-photo-6801917.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Woman sitting on wooden floor reading"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105 brightness-90"
          />
        </div>
      </div>
    </section>
  );
};

export default About;