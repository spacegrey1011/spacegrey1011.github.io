const { useState, useEffect, useRef } = React;
const { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} = Recharts;
const { motion, useScroll, useMotionValueEvent } = window.Motion;

// Icons
const Icons = {
  Sparkles: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Video: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>,
  TrendingUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  Filter: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
};

// ==========================================
// Sub-components for Visuals (Mount Animated)
// ==========================================

const Visual1Problem = () => {
  return (
    <motion.div initial={{ y: 20 }} animate={{ y: 0 }} transition={{ duration: 0.8 }} className="flex flex-col items-center justify-center h-full w-full">
      <h2 className="text-4xl lg:text-5xl font-bold mb-12 text-center text-gray-300">
        <span className="text-white">K-Beauty</span>의 근본적 한계
      </h2>
      
      <div className="relative w-full max-w-lg flex flex-col items-center">
         <div className="w-full lg:w-[400px] h-20 bg-[#222] border border-[#444] rounded-lg flex flex-col items-center justify-center text-gray-300 relative z-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
           <span className="text-3xl font-black text-white">30,000+</span>
           <span className="text-xs uppercase tracking-widest text-[#888]">Active Brands</span>
        </div>
        
        <svg width="400" height="250" viewBox="0 0 400 250" className="absolute top-16 z-0 text-[#333]">
          <polygon points="0,0 400,0 250,250 150,250" fill="currentColor" opacity="0.4" />
          <polygon points="0,0 400,0 250,250 150,250" fill="none" stroke="#555" strokeWidth="2" strokeDasharray="6 6" />
          <motion.polygon 
            points="0,0 400,0 250,250 150,250" 
            fill="none" 
            stroke="#FF0055" 
            strokeWidth="4"
            initial={{ strokeDasharray: '0 1000' }}
            animate={{ strokeDasharray: '1000 1000' }}
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
          />
        </svg>

        <motion.div 
          className="w-[120px] h-20 bg-red-950 border border-red-500 rounded-lg flex flex-col items-center justify-center text-red-500 relative z-10 mt-[230px]"
          animate={{ boxShadow: ['0 0 0px rgba(255,0,85,0)', '0 0 50px rgba(255,0,85,0.6)', '0 0 0px rgba(255,0,85,0)'], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-2xl font-black">2,000</span>
          <span className="text-[10px] uppercase font-bold text-red-400">Offline Dist.</span>
        </motion.div>
        
        <motion.div className="mt-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          <div className="text-red-500 font-bold text-xl uppercase tracking-widest">93% Death Rate</div>
          <div className="text-gray-500 text-sm mt-1">물리적 유통망의 병목으로 인한 폐기</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const Visual2AIFlow = () => {
  return (
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.8 }} className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-black text-[#00F0FF]">AI CORE OS</h2>
        <p className="text-xl text-gray-400 mt-4 tracking-widest uppercase">Touchless Auto-Matching</p>
      </div>

      <div className="w-full relative">
        <motion.div 
          className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-[#111] to-[#050505] border-[4px] border-[#00F0FF] flex items-center justify-center relative z-20"
          animate={{ boxShadow: ['0 0 20px #00F0FF', '0 0 80px rgba(0,240,255,0.8)', '0 0 20px #00F0FF'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="absolute inset-3 rounded-full bg-[#050505] flex items-center justify-center flex-col">
            <Icons.Activity />
            <span className="font-black text-[#00F0FF] text-xl tracking-wider mt-2">CORE</span>
          </div>
          <motion.div className="absolute inset-0 rounded-full border-2 border-dashed border-[#FF00FF]" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} />
        </motion.div>

        <motion.div 
          className="absolute top-1/2 -left-4 md:left-4 -translate-y-1/2 flex flex-col items-center"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-[#111] border-2 border-[#333] flex items-center justify-center relative shadow-[0_0_20px_#FF00FF]">
            <span className="text-[#FF00FF] font-black text-xl">TT</span>
            <motion.div 
              className="absolute -right-16 top-1/2 -translate-y-1/2 h-1 bg-[#FF00FF]" 
              initial={{ width: "0%" }}
              animate={{ width: "4rem" }}
              transition={{ delay: 1.5, duration: 1 }}
            />
          </div>
          <div className="mt-4 text-center">
            <div className="font-bold text-gray-200 uppercase tracking-widest text-sm">Data Intake</div>
            <div className="text-[#FF00FF] font-black mt-1">3 Days</div>
          </div>
        </motion.div>

        <motion.div className="mt-16 w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}>
          <div className="flex justify-between text-sm uppercase font-bold tracking-widest mb-2">
            <span className="text-gray-400">Trend Decoded</span>
            <span className="text-[#00F0FF]">Product Ready</span>
          </div>
          <div className="h-4 w-full bg-[#111] rounded-full overflow-hidden border border-[#333] relative p-[1px]">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#00F0FF] to-[#FF00FF] rounded-full shadow-[0_0_15px_#00F0FF]" 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 2.5, duration: 3, ease: "easeOut" }}
            />
          </div>
          <div className="mt-4 text-center border-t border-[#333] pt-4">
            <span className="text-4xl font-black text-white">45</span>
            <span className="text-xl text-gray-400 ml-2">Days Lead Time</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const Visual3Explosion = () => {
  const particles = Array.from({ length: 48 });
  return (
    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.8 }} className="flex items-center justify-center h-full w-full relative overflow-hidden">
      <div className="relative z-10 text-center flex flex-col items-center">
        <div className="relative">
           <div className="w-32 h-32 rounded-3xl bg-[#00F0FF]/10 border-2 border-[#00F0FF] flex items-center justify-center relative shadow-[0_0_50px_rgba(0,240,255,0.5)] z-20 backdrop-blur-sm">
             <Icons.Video className="text-[#00F0FF] w-12 h-12" />
           </div>
           <div className="absolute inset-0 flex items-center justify-center">
             {particles.map((_, i) => {
               const angle = (i / particles.length) * Math.PI * 2;
               const radius = 150 + Math.random() * 200;
               const tx = Math.cos(angle) * radius;
               const ty = Math.sin(angle) * radius;
               const delay = Math.random() * 2;
               return (
                 <motion.div
                   key={i}
                   className="absolute w-8 h-8 flex items-center justify-center rounded-lg bg-[#FF00FF]/20 border border-[#FF00FF]/50 text-[#FF00FF]"
                   initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
                   animate={{ x: tx, y: ty, scale: 1.5, opacity: [0, 1, 0], rotate: 360 }}
                   transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: delay }}
                 >
                   <Icons.Video className="w-4 h-4" />
                 </motion.div>
               );
             })}
           </div>
        </div>

        <motion.div className="mt-12 bg-[#111]/80 backdrop-blur p-6 rounded-2xl border border-green-500/30">
          <div className="text-xl text-gray-400 font-bold uppercase tracking-widest">Customer Acquisition Cost</div>
          <div className="text-6xl font-black text-green-400 mt-2 text-shadow-glow-green">$2.00</div>
          <div className="text-green-500/80 mt-2 font-bold">-86% vs Industry Avg ($15.00)</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const Visual4Paradox = () => {
  const [dataIndex, setDataIndex] = useState(1);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const data = [];
    let s2Base = 100;
    let usBase = 100;
    const s2Multiplier = Math.pow(1.4, 2);
    const usMultiplier = Math.pow(1.2, 8);

    for (let year = 0; year <= 5; year++) {
      data.push({
        year: `Y${year}`,
        "Silicon2 (Margin 40%)": year === 0 ? 100 : Math.round(s2Base * s2Multiplier),
        "TrendLab OS (Margin 20%)": year === 0 ? 100 : Math.round(usBase * usMultiplier),
      });
      if (year > 0) {
        s2Base *= s2Multiplier;
        usBase *= usMultiplier;
      }
    }
    setChartData(data);
    setDataIndex(6); // Render all data immediately for stability
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <h2 className="text-3xl lg:text-5xl font-bold flex items-center gap-4 mb-4">
        <Icons.Activity className="w-10 h-10 text-[#FF00FF]" />
        마진 <span className="text-[#FF00FF]">20%</span>의 역설
      </h2>
      <p className="text-gray-400 text-lg mb-12">마진을 낮춰 시장을 독점하고, 회전율로 수익성을 극대화합니다.</p>

      <div className="w-full h-[400px] lg:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData.slice(0, dataIndex)} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis dataKey="year" stroke="#888" tick={{fill: '#888', fontSize: 14}} axisLine={false} tickLine={false} />
            <YAxis stroke="#888" tickFormatter={(v) => `$${v.toLocaleString()}`} tick={{fill: '#888', fontSize: 14}} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(5,5,5,0.9)', borderColor: '#333', borderRadius: '12px', padding: '16px' }}
              itemStyle={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}
              labelStyle={{ color: '#aaa', marginBottom: '8px' }}
              formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '16px' }} />
            <Line 
              type="monotone" 
              dataKey="Silicon2 (Margin 40%)" 
              stroke="#555" 
              strokeWidth={4} 
              dot={{ r: 6, fill: '#555', strokeWidth: 0 }} 
              isAnimationActive={true}
            />
            <Line 
              type="monotone" 
              dataKey="TrendLab OS (Margin 20%)" 
              stroke="#00F0FF" 
              strokeWidth={6} 
              dot={{ r: 8, fill: '#00F0FF', strokeWidth: 0 }} 
              activeDot={{ r: 12, fill: '#fff', stroke: '#00F0FF', strokeWidth: 4 }} 
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <motion.div className="w-full mt-8 bg-[#111] border border-[#333] rounded-2xl p-6 flex justify-around" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
         <div className="text-center">
            <div className="text-gray-500 uppercase font-bold text-xs tracking-widest mb-2">Turnover Rate</div>
            <div className="text-4xl font-black text-[#00F0FF]">8<span className="text-lg">x/Yr</span></div>
         </div>
         <div className="w-px bg-[#333]"></div>
         <div className="text-center">
            <div className="text-gray-500 uppercase font-bold text-xs tracking-widest mb-2">Compounded ROI (5Y)</div>
            <div className="text-4xl font-black text-[#FF00FF]">4,300<span className="text-lg">%</span></div>
         </div>
      </motion.div>
    </div>
  );
};

const Visual5Vision = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative">
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.2)_0%,transparent_60%)] z-0"
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,255,0.1)_0%,transparent_70%)] z-0"
        animate={{ opacity: [0.5, 1, 0.5], scale: [1.2, 1, 1.2] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      
      <motion.div 
        className="z-10 text-center"
        initial={{ scale: 3, filter: 'blur(10px)' }}
        animate={{ scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <Icons.Sparkles className="w-20 h-20 text-[#00F0FF] mx-auto mb-8 animate-pulse" />
        <h1 className="text-6xl lg:text-[8rem] font-black text-[#FF00FF] tracking-tighter drop-shadow-[0_0_80px_rgba(255,0,255,0.6)] leading-none">
          K-BEAUTY OS
        </h1>
        <p className="text-2xl lg:text-4xl text-gray-200 mt-8 font-medium tracking-widest uppercase">
          디지털 혁명이 뷰티를 만났을 때
        </p>
      </motion.div>
    </div>
  );
};

// ==========================================
// Main Scrollytelling App
// ==========================================
const App = () => {
  const { scrollYProgress } = useScroll();
  const [activeStep, setActiveStep] = useState(1);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.18) setActiveStep(1);
    else if (latest < 0.45) setActiveStep(2);
    else if (latest < 0.68) setActiveStep(3);
    else if (latest < 0.88) setActiveStep(4);
    else setActiveStep(5);
  });

  const ScrollScript = ({ title, desc, h = "h-screen" }) => (
    <div className={`w-full ${h} flex flex-col justify-center px-8 lg:px-16`}>
      <motion.div 
        initial={{ opacity: 0.2 }}
        whileInView={{ opacity: 1, scale: 1.05 }}
        viewport={{ amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="backdrop-blur-xl bg-black/40 border border-gray-800 p-8 lg:p-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <h3 className="text-3xl lg:text-4xl font-bold mb-6 text-white border-b-2 border-[#00F0FF]/50 pb-4 inline-block">{title}</h3>
        <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed">
          {desc}
        </p>
      </motion.div>
    </div>
  );

  return (
    <div className="bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-[#FF00FF]/50 selection:text-white relative">
      <motion.div 
        className="fixed top-0 left-0 h-2 bg-gradient-to-r from-[#00F0FF] to-[#FF00FF] z-50 rounded-r-full"
        style={{ width: useTransform(scrollYProgress, v => `${v * 100}%`) }}
      />
      <div className="fixed bottom-4 left-4 bg-red-600 z-[100] text-white p-4 font-mono font-bold rounded-lg shadow-2xl">
        DEBUG STEP: {activeStep}
      </div>
      <div className="flex w-full relative">
        {/* Left Sticky Visual Area (70%) */}
        <div className="hidden lg:block w-[70%] h-screen sticky top-0 overflow-hidden border-r border-[#111] bg-[#050505]">
          
          <div 
            className="absolute inset-0 z-0"
            style={{ backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPPHBhdGggZD0iTTAgNDBoNDBNNDAgMHY0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')`, opacity: 0.3 }}
          ></div>

          <div 
            className="absolute inset-0 px-12 py-8 pointer-events-none"
            style={{ opacity: activeStep === 1 ? 1 : 0, zIndex: activeStep === 1 ? 10 : -10, transition: 'opacity 0.7s ease' }}
          >
            <Visual1Problem />
          </div>

          <div 
            className="absolute inset-0 px-12 py-8 pointer-events-none"
            style={{ opacity: activeStep === 2 ? 1 : 0, zIndex: activeStep === 2 ? 10 : -10, transition: 'opacity 0.7s ease' }}
          >
            <Visual2AIFlow />
          </div>

          <div 
            className="absolute inset-0 px-12 py-8 pointer-events-none"
            style={{ opacity: activeStep === 3 ? 1 : 0, zIndex: activeStep === 3 ? 10 : -10, transition: 'opacity 0.7s ease' }}
          >
            <Visual3Explosion />
          </div>

          <div 
            className="absolute inset-0 px-12 py-8"
            style={{ opacity: activeStep === 4 ? 1 : 0, zIndex: activeStep === 4 ? 10 : -10, transition: 'opacity 0.7s ease', pointerEvents: activeStep === 4 ? 'auto' : 'none' }}
          >
            <Visual4Paradox />
          </div>

          <div 
            className="absolute inset-0 px-12 py-8 pointer-events-none"
            style={{ opacity: activeStep === 5 ? 1 : 0, zIndex: activeStep === 5 ? 10 : -10, transition: 'opacity 0.7s ease' }}
          >
            <Visual5Vision />
          </div>
        </div>

        {/* Right Scroll Script Area (30%) */}
        <div className="w-full lg:w-[30%] min-h-screen z-10 relative">
          <ScrollScript 
            h="h-[120vh]"
            title="The Problem" 
            desc="대한민국 3만 개 브랜드의 비명. 올리브영이라는 좁은 입구에 막힌 K-뷰티의 병목을 우리는 데이터로 뚫습니다." 
          />
          <ScrollScript 
            h="h-[150vh]"
            title="AI Multi-Agentic Flow" 
            desc="트렌드 분석부터 제품 완성까지 단 45일. 틱톡 내러티브를 역설계하여 '이미 성공이 보장된' 제품을 기획합니다." 
          />
          <ScrollScript 
            h="h-[120vh]"
            title="Content Explosion" 
            desc="제품이 생산되는 동안 AI 에이전트가 수천 개의 숏폼을 양산합니다. 마케팅 비용(CAC)은 Zero에 수렴하며 오가닉 트래픽을 장악합니다." 
          />
          <ScrollScript 
            h="h-[150vh]"
            title="The 20% Paradox" 
            desc="실리콘투의 40% 마진보다 무서운 것은 우리의 8회전 복리입니다. 낮은 마진은 시장 독점의 무기이며, AI는 수익성을 극대화합니다." 
          />
          <ScrollScript 
            h="h-[100vh]"
            title="The Grand Vision" 
            desc="우리는 단순 유통사가 아닙니다. 전 세계 3만 개 브랜드가 우리 엔진 없이는 생존할 수 없는 K-뷰티의 운영체제가 되겠습니다." 
          />
          <div className="h-[20vh]"></div>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
