import { useState, useEffect, useRef, type ReactElement, type ComponentType } from 'react'
import { PORTRAIT, AWARD, HACKATHON } from './images'
import { WORLDMAP } from './worldmap'
import { SiTypescript, SiReact, SiNextdotjs, SiNodedotjs, SiPython, SiSpringboot, SiPostgresql, SiMongodb, SiRedis, SiDocker, SiAmazonwebservices, SiGraphql, SiTailwindcss, SiOpenai, SiPrisma, SiLangchain, SiGit } from 'react-icons/si'
import { FaJava } from 'react-icons/fa'
import './App.css'

// ═══ LAYER 1: ENVIRONMENT (dot grid near cursor) ═══
function EnvLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse = useRef({ x: -1000, y: -1000 })
  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    let raf: number
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    window.addEventListener('mousemove', e => { mouse.current = { x: e.clientX, y: e.clientY } })
    const sp = 24, rad = 340
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      const mx = mouse.current.x, my = mouse.current.y
      for (let col = Math.max(0, Math.floor((mx-rad)/sp)); col <= Math.min(Math.ceil(c.width/sp), Math.ceil((mx+rad)/sp)); col++)
        for (let row = Math.max(0, Math.floor((my-rad)/sp)); row <= Math.min(Math.ceil(c.height/sp), Math.ceil((my+rad)/sp)); row++) {
          const x = col*sp+12, y = row*sp+12, d = Math.sqrt((x-mx)**2+(y-my)**2)
          if (d < rad) { const t = 1-d/rad; ctx.beginPath(); ctx.arc(x, y, 1+t*0.8, 0, Math.PI*2); ctx.fillStyle = `rgba(160,160,170,${t*0.35})`; ctx.fill() }
        }
      raf = requestAnimationFrame(draw)
    }
    draw(); return () => cancelAnimationFrame(raf)
  }, [])
  return <div className="env-layer"><canvas ref={canvasRef}/></div>
}

// ═══ LAYER 2: ATMOSPHERE (cursor glow) ═══
function AtmoLayer() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const move = (e: MouseEvent) => { if (ref.current) { ref.current.style.left = e.clientX+'px'; ref.current.style.top = e.clientY+'px' } }
    window.addEventListener('mousemove', move); return () => window.removeEventListener('mousemove', move)
  }, [])
  return <div ref={ref} className="atmo-glow"/>
}

// ═══ SCROLL PROGRESS BAR ═══
function ScrollProgress() {
  const [w, setW] = useState(0)
  useEffect(() => { const h = () => { setW(window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100) }; window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h) }, [])
  return <div className="scroll-progress" style={{ width: `${w}%` }}/>
}

// ═══ 3D TILT CARD ═══
function TiltCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(800px) rotateY(${x*6}deg) rotateX(${-y*6}deg) translateY(-4px) scale(1.02)`
  }
  const handleLeave = () => { if (ref.current) ref.current.style.transform = '' }
  return <div ref={ref} className={`premium-card ${className}`} style={style} onMouseMove={handleMove} onMouseLeave={handleLeave}>{children}</div>
}

// ═══ SCROLL REVEAL ═══
function AS({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null); const [v, setV] = useState(false)
  useEffect(() => { const el = ref.current; if (!el) return; const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setV(true), delay); obs.unobserve(el) } }, { threshold: 0.06 }); obs.observe(el); return () => obs.disconnect() }, [delay])
  return <div ref={ref} className={`transition-all duration-700 ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`} style={{ transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)' }}>{children}</div>
}


// ═══ INTERACTIVE GLOBE (BIGGER) ═══
function SkillGlobe() {
  const [rotY,setRotY]=useState(0);const [rotX,setRotX]=useState(-15);const dragging=useRef(false);const lastPos=useRef({x:0,y:0})
  const [hovered,setHovered]=useState<number|null>(null)
  useEffect(()=>{let raf:number;const tick=()=>{if(!dragging.current)setRotY(p=>p+0.12);raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf)},[])
  const onDown=(e:React.MouseEvent|React.TouchEvent)=>{dragging.current=true;const p='touches' in e?e.touches[0]:e;lastPos.current={x:p.clientX,y:p.clientY}}
  const onMove=(e:React.MouseEvent|React.TouchEvent)=>{if(!dragging.current)return;const p='touches' in e?e.touches[0]:e;setRotY(prev=>prev+(p.clientX-lastPos.current.x)*0.4);setRotX(prev=>Math.max(-60,Math.min(60,prev-(p.clientY-lastPos.current.y)*0.4)));lastPos.current={x:p.clientX,y:p.clientY}}
  useEffect(()=>{const up=()=>{dragging.current=false};window.addEventListener('mouseup',up);window.addEventListener('touchend',up);return()=>{window.removeEventListener('mouseup',up);window.removeEventListener('touchend',up)}},[])
  const R=210,toRad=(d:number)=>d*Math.PI/180
  const getPos=(lat:number,lon:number)=>{const la=toRad(lat),lo=toRad(lon+rotY),rx=toRad(rotX);const x=R*Math.cos(la)*Math.sin(lo),y=-R*Math.sin(la),z=R*Math.cos(la)*Math.cos(lo);const y2=y*Math.cos(rx)-z*Math.sin(rx),z2=y*Math.sin(rx)+z*Math.cos(rx);return{x,y:y2,z:z2}}
  const icons:{n:string,c:string,la:number,lo:number,ic:ComponentType<{size?:number,color?:string,style?:React.CSSProperties}>}[]=[
    {n:'TypeScript',c:'#3178C6',la:20,lo:0,ic:SiTypescript},
    {n:'React',c:'#61DAFB',la:20,lo:51,ic:SiReact},
    {n:'Next.js',c:'#ffffff',la:20,lo:102,ic:SiNextdotjs},
    {n:'Node.js',c:'#339933',la:20,lo:153,ic:SiNodedotjs},
    {n:'Python',c:'#3776AB',la:20,lo:204,ic:SiPython},
    {n:'Java',c:'#ED8B00',la:20,lo:255,ic:FaJava},
    {n:'Spring Boot',c:'#6DB33F',la:20,lo:306,ic:SiSpringboot},
    {n:'PostgreSQL',c:'#4169E1',la:-20,lo:36,ic:SiPostgresql},
    {n:'MongoDB',c:'#47A248',la:-20,lo:108,ic:SiMongodb},
    {n:'Redis',c:'#DC382D',la:-20,lo:180,ic:SiRedis},
    {n:'Docker',c:'#2496ED',la:-20,lo:252,ic:SiDocker},
    {n:'AWS',c:'#FF9900',la:-20,lo:324,ic:SiAmazonwebservices},
    {n:'GraphQL',c:'#E10098',la:55,lo:60,ic:SiGraphql},
    {n:'Tailwind',c:'#06B6D4',la:55,lo:180,ic:SiTailwindcss},
    {n:'OpenAI',c:'#10A37F',la:55,lo:300,ic:SiOpenai},
    {n:'Prisma',c:'#2D3748',la:-55,lo:90,ic:SiPrisma},
    {n:'LangChain',c:'#1C3C3C',la:-55,lo:210,ic:SiLangchain},
    {n:'Git',c:'#F05032',la:-55,lo:330,ic:SiGit},
  ]
  const wires:ReactElement[]=[];for(let lon=0;lon<180;lon+=30){const pts:string[]=[];const pts2:string[]=[];for(let lat=-90;lat<=90;lat+=5){const p=getPos(lat,lon);pts.push(`${p.x+R+50},${p.y+R+50}`);const p2=getPos(lat,lon+90);pts2.push(`${p2.x+R+50},${p2.y+R+50}`)};wires.push(<polyline key={`a${lon}`} points={pts.join(' ')} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8"/>);wires.push(<polyline key={`b${lon}`} points={pts2.join(' ')} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8"/>)}
  for(let lat=-60;lat<=60;lat+=30){const pts:string[]=[];for(let lon=0;lon<=360;lon+=5){const p=getPos(lat,lon);pts.push(`${p.x+R+50},${p.y+R+50}`)};wires.push(<polyline key={`c${lat}`} points={pts.join(' ')} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8"/>)}
  const positioned=icons.map((ic,idx)=>({...ic,idx,...getPos(ic.la,ic.lo)})).sort((a,b)=>a.z-b.z)
  return(
    <div className="relative w-full flex items-center justify-center select-none" style={{height:580,cursor:dragging.current?'grabbing':'grab'}} onMouseDown={onDown} onMouseMove={onMove} onTouchStart={onDown} onTouchMove={onMove}>
      <svg width={R*2+100} height={R*2+100} className="absolute"><circle cx={R+50} cy={R+50} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>{wires}</svg>
      <div className="absolute w-32 h-32 rounded-full blur-[60px]" style={{background:'rgba(212,165,116,0.15)'}}/>
      {positioned.map((ic)=>{const s=0.55+(ic.z+R)/(2*R)*0.5,o=0.3+(ic.z+R)/(2*R)*0.7;const isH=hovered===ic.idx;const Icon=ic.ic;return(
        <div key={ic.idx} className={`absolute skill-icon-wrap ${isH?'skill-icon-glow':''}`}
          style={{left:`calc(50% + ${ic.x}px)`,top:`calc(50% + ${ic.y}px)`,transform:`translate(-50%,-50%) scale(${isH?s*1.4:s})`,opacity:isH?1:o,zIndex:isH?999:Math.round(ic.z+R)}}
          onMouseEnter={()=>setHovered(ic.idx)} onMouseLeave={()=>setHovered(null)}>
          <div className="skill-icon-inner">
            <Icon size={isH?32:22} color={isH?'#fff':ic.c} style={isH?{filter:`drop-shadow(0 0 10px ${ic.c}) drop-shadow(0 0 20px rgba(255,255,255,0.4))`}:{}}/>
            <span className="skill-label font-mono font-semibold whitespace-nowrap rounded-full px-2.5 py-0.5"
              style={{fontSize:isH?11:9,background:isH?`${ic.c}30`:'transparent',color:isH?ic.c:`${ic.c}99`,opacity:isH?1:0.7,transform:isH?'translateY(0)':'translateY(-2px)',letterSpacing:'0.05em'}}>
              {ic.n.toUpperCase()}
            </span>
          </div>
        </div>
      )})}
    </div>
  )
}


// ═══ INFO CARDS (horizontal group, focus-shift hover) ═══
function InfoCards() {
  const [hovered, setHovered] = useState<number | null>(null)
  const cards = [
    { t: 'Coding Club', txt: 'Active member building AI-powered applications and collaborative learning systems at Chitkara.' },
    { t: 'University', txt: 'Pursuing B.E. Computer Science at Chitkara University, Rajpura (CGPA 8.87/10, graduating May 2027). Coursework: DSA, DBMS, OS, Computer Networks, OOD.' },
    { t: 'Competitions', txt: 'Winner at Phosphenes Hackathon. Active competitor focused on AI/ML rapid prototyping under pressure.' },
  ]

  return (
    <div className="flex items-stretch gap-3 w-full h-full p-2">
      {cards.map((c, i) => {
        const isHovered = hovered === i
        const isOther = hovered !== null && !isHovered
        return (
          <div
            key={i}
            className="relative flex-1 rounded-2xl p-5 cursor-default backdrop-blur-md"
            style={{
              background: isHovered
                ? 'linear-gradient(145deg, rgba(28,28,30,0.98), rgba(34,34,38,0.9))'
                : 'linear-gradient(145deg, rgba(20,20,22,0.95), rgba(26,26,30,0.7))',
              border: isHovered
                ? '1px solid rgba(212,165,116,0.4)'
                : '1px solid rgba(255,255,255,0.06)',
              boxShadow: isHovered
                ? '0 0 24px rgba(212,165,116,0.1), 0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
                : '0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
              transform: isHovered
                ? 'translateY(-10px) scale(1.04)'
                : isOther
                ? 'translateY(2px) scale(0.97)'
                : 'translateY(0) scale(1)',
              opacity: isOther ? 0.65 : 1,
              zIndex: isHovered ? 20 : 1,
              transition: 'all 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
              filter: isOther ? 'brightness(0.8)' : 'brightness(1)',
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {isHovered && (
              <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
                background: 'radial-gradient(ellipse at center, rgba(212,165,116,0.06) 0%, transparent 70%)',
              }}/>
            )}
            <span className="text-[11px] font-bold text-white uppercase tracking-wider block mb-2 relative z-10">{c.t}</span>
            <p className="text-[10px] text-zinc-400 leading-relaxed relative z-10">{c.txt}</p>
          </div>
        )
      })}
    </div>
  )
}

// ═══ BENTO ABOUT ═══
function BentoAbout() {
  return (
    <section id="about" className="py-28 px-4 max-w-[1200px] mx-auto relative z-10">
      <AS><div className="text-center mb-16"><div className="section-label justify-center"><div className="section-label-line"/><span className="section-label-text">About</span></div><h2 className="text-4xl sm:text-5xl md:text-[56px] font-bold tracking-tighter text-white leading-[1]">Who I <span className="shimmer-text">am</span>.</h2></div></AS>
      <div className="grid grid-cols-3 gap-4" style={{gridTemplateRows:'210px 300px 175px'}}>
        {/* Name */}
          <AS delay={50}><TiltCard className="h-full flex flex-col justify-center items-center text-center p-8">
            <h3 className="text-3xl md:text-[42px] font-extrabold tracking-tighter text-white leading-[1] mb-4" style={{letterSpacing:'-0.02em'}}>PRANJAL<br/>UDHWANI</h3>
            <div className="h-0.5 w-14 rounded-full mb-3" style={{background:'linear-gradient(to right, #d4a574, #e8c4a0)'}}/>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em]">Full-Stack AI Developer</span>
          </TiltCard></AS>

          {/* Info strip - Pawel-style stacked fanning cards */}
          <AS delay={100} className="col-span-2"><TiltCard className="h-full p-5 flex flex-col">
            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest text-center mb-2">Hover to read more</span>
            <div className="flex-1 flex items-center justify-center">
              <InfoCards />
            </div>
          </TiltCard></AS>

          {/* Mindset */}
          <AS delay={150} className="row-span-2"><TiltCard className="h-full p-7 flex flex-col justify-between">
            <div><h4 className="text-2xl font-bold text-white mb-2">Mindset</h4><div className="h-0.5 w-8 rounded-full mb-4" style={{background:'rgba(212,165,116,0.5)'}}/><p className="text-sm text-zinc-400 leading-relaxed"><strong className="text-zinc-200">Building more than software.</strong> My passions provide the <strong className="text-zinc-200">discipline and focus</strong> I need to grow.</p></div>
            <div className="mt-4 rounded-xl overflow-hidden img-hover" style={{maxWidth:220,border:'2px solid rgba(212,165,116,0.15)'}}><img src={HACKATHON} alt="Phosphenes Hackathon" className="w-full h-32 object-cover" loading="lazy"/><div className="bg-black/60 px-3 py-2"><span className="text-[9px] font-bold uppercase tracking-wider" style={{color:'#d4a574'}}>Phosphenes Hackathon</span></div></div>
            <p className="text-xs text-zinc-500 mt-4"><strong className="text-zinc-300">Mastering craft and mind</strong> is my path to <strong className="text-zinc-300">excellence</strong>.</p>
          </TiltCard></AS>

          {/* Photo slideshow */}
          <AS delay={200}><div className="premium-card h-full overflow-hidden relative" style={{borderRadius:28}}>
            <img src={PORTRAIT} alt="Pranjal" className="absolute inset-0 w-full h-full object-cover slide-a" style={{objectPosition:'center 30%'}} loading="lazy"/>
            <img src={AWARD} alt="Award" className="absolute inset-0 w-full h-full object-cover slide-b" loading="lazy"/>
            <div className="absolute inset-0 rounded-[28px] pointer-events-none" style={{border:'1px solid rgba(212,165,116,0.1)'}}/>
          </div></AS>

          {/* Craft */}
          <AS delay={250} className="row-span-2"><TiltCard className="h-full flex flex-col justify-between overflow-hidden">
            <div className="p-7 pb-0"><h4 className="text-2xl font-bold text-white mb-2">Craft</h4><div className="h-0.5 w-8 rounded-full mb-4" style={{background:'rgba(212,165,116,0.5)'}}/><p className="text-sm text-zinc-400 leading-relaxed">Building scalable <strong className="text-zinc-200">apps, websites, and AI systems</strong>.</p><p className="text-sm text-zinc-400 leading-relaxed mt-2">I understand what modern tech can provide, helping deliver solutions a business <strong className="text-zinc-200">actually needs</strong>.</p></div>
            <div className="relative w-full py-3 border-y border-white/[0.04] my-3 overflow-hidden"><div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#111113] to-transparent z-10"/><div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#111113] to-transparent z-10"/><div className="animate-marquee">{[0,1].map(s=><div key={s} className="flex gap-5 items-center shrink-0 pr-5">{['React','Next.js','Node.js','Spring Boot','TypeScript','Python','PostgreSQL','Docker','AWS','Redis'].map(t=><span key={`${s}-${t}`} className="text-[9px] font-mono font-medium text-zinc-500 uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 hover:text-amber-300 transition-colors cursor-default"><span className="w-1.5 h-1.5 rounded-sm" style={{background:'rgba(212,165,116,0.25)'}}/>{t}</span>)}</div>)}</div></div>
            <div className="p-7 pt-0"><p className="text-xs text-zinc-400 mb-3">Active Hackathon competitor. Feel free to invite me to collaborate.</p><div className="flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"/><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"/></span><span className="text-[10px] font-medium text-zinc-400">Open to collaboration & freelance</span></div></div>
          </TiltCard></AS>

          {/* Location */}
          <AS delay={300} className="col-start-2"><div className="location-card h-full">
            <div className="absolute inset-0 opacity-[0.18]" style={{backgroundImage:`url(${WORLDMAP})`,backgroundSize:'cover',backgroundPosition:'center 40%',filter:'blur(0.3px) grayscale(100%)'}}/>
            <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage:'radial-gradient(circle,rgba(212,165,116,.4) .5px,transparent .5px)',backgroundSize:'12px 12px'}}/>
            <div className="absolute inset-0 opacity-[0.025]" style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(212,165,116,.15) 3px,rgba(212,165,116,.15) 4px)'}}/>
            <div className="scan-beam"/><div className="scan-bright"/>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-800/25 to-transparent"/>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-800/15 to-transparent"/>
            <div className="relative h-full flex flex-col justify-end p-6 z-20"><span className="text-2xl md:text-3xl font-extrabold text-white uppercase tracking-tighter block leading-[1]">Chandigarh, India</span><span className="text-[11px] font-mono text-zinc-400 mt-1.5 tracking-wide">30.7333° N, 76.7794° E</span><div className="flex items-center gap-1 mt-1"><span className="font-bold text-sm" style={{color:'#d4a574'}}>–</span><span className="text-[11px] font-mono font-semibold" style={{color:'#d4a574'}}>GMT+5:30</span></div></div>
          </div></AS>
      </div>
    </section>
  )
}

// ═══ EXPERIENCE ═══
function ExperienceSection() {
  const metrics = [
    { stat: '28%', label: 'Page load reduced (2.5s → 1.8s) via code-splitting, React.memo & lazy loading' },
    { stat: '15+', label: 'Legacy components refactored into reusable library, eliminating 40% duplicated UI logic' },
    { stat: '99.5%', label: 'Frontend stability achieved by resolving 12 critical UI-API integration issues' },
    { stat: '78%', label: 'Test coverage (up from 45%) with Jest & React Testing Library (WCAG 2.1 AA)' },
  ]
  return (
    <section id="experience" className="py-28 px-4 max-w-[1200px] mx-auto relative z-10">
      <AS><div className="text-center mb-16"><div className="section-label justify-center"><div className="section-label-line"/><span className="section-label-text">Experience</span></div><h2 className="text-4xl sm:text-5xl md:text-[56px] font-bold tracking-tighter text-white leading-[1]">Where I've <span className="shimmer-text">worked</span>.</h2></div></AS>
      <AS delay={150}><TiltCard className="p-8 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Front-End Developer Intern</h3>
            <p className="text-sm text-zinc-400 mt-1">Souleeze Ventures Private Limited <span className="text-zinc-600">•</span> Faridabad, Haryana</p>
          </div>
          <span className="text-[11px] font-mono tracking-wide shrink-0" style={{color:'var(--accent)'}}>Mar 2025 – Oct 2025</span>
        </div>
        <div className="h-px w-full mb-6" style={{background:'linear-gradient(to right, rgba(212,165,116,0.2), rgba(212,165,116,0.1), transparent)'}}/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {metrics.map((m, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-lg font-extrabold shrink-0 w-14 text-right" style={{color:'var(--accent)'}}>{m.stat}</span>
              <p className="text-sm text-zinc-400 leading-relaxed">{m.label}</p>
            </div>
          ))}
        </div>
      </TiltCard></AS>
    </section>
  )
}

// ═══ PROJECTS ═══
const projects=[{num:'01',type:'Real-Time Platform',title:'Real-Time Incident Response Platform',desc:'Built a real-time incident coordination platform supporting 500+ concurrent users with WebSocket-based state synchronization, live presence indicators, and immutable audit logging.',result:'500+ concurrent users • 35% faster incident resolution • Event-driven architecture with REST + WebSockets',tags:['React','Node.js','Socket.io','MongoDB','Zustand','JWT'],gradient:'from-amber-700 to-orange-600',img:'/incident-hub.png',link:'https://github.com/Pranjal0410/Real-Time-Incident-Response-System'},{num:'02',type:'AI Platform',title:'AI Career Coach Platform',desc:'Full-stack career coaching app with OAuth 2.0 authentication, personalized onboarding, GPT-4 and Gemini API integration for resume analysis, cover letter generation, and mock interviews.',result:'1,000+ resume analyses • Sub-2s response times • ATS-optimized PDF export • Scheduled cron jobs for industry insights',tags:['Next.js 14','Prisma','PostgreSQL','OpenAI API','Gemini API','Clerk Auth'],gradient:'from-emerald-500 to-cyan-500',img:'/career-coach.png',link:'https://github.com/Pranjal0410/AI-CareerCoach'},{num:'03',type:'Backend System',title:'Real Estate Investment Platform',desc:'Role-based investment system backend handling 10,000+ daily transactions with ACID-compliant operations, JWT authentication with refresh token rotation, and normalized MySQL schema.',result:'10,000+ daily transactions • 95% code coverage • RBAC for investor/admin/analyst roles',tags:['Java 17','Spring Boot 3','MySQL','REST APIs','JWT'],gradient:'from-orange-500 to-amber-500',img:'/real-estate.png',link:'https://github.com/Pranjal0410/real-estate-project'}]

function Navbar() {
  const [s,setS]=useState(false);const [o,setO]=useState(false)
  useEffect(()=>{const h=()=>setS(window.scrollY>40);window.addEventListener('scroll',h);return()=>window.removeEventListener('scroll',h)},[])
  const links=['Home','About','Experience','Projects','Skills','Contact']
  return(<header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${s?'py-3':'py-5'}`}><nav className="max-w-6xl mx-auto px-5 lg:px-8"><div className="hidden lg:flex items-center justify-center relative"><div className="absolute left-0"><a href="#home" className="text-[15px] font-semibold tracking-tight text-white">pranjal<span style={{color:'var(--accent)'}}>.</span></a></div><div className="flex items-center gap-1 nav-glass rounded-full h-11 px-5">{links.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-[13px] font-normal rounded-full px-4 py-2 text-zinc-500 hover:text-white transition-colors">{l}</a>)}</div><div className="absolute right-0"><a href="mailto:udhwanipranjal@gmail.com" className="nav-glass rounded-full h-11 px-5 flex items-center gap-2 text-[13px] font-medium text-white hover:scale-105 transition-transform min-h-[44px]">Get in touch</a></div></div><div className="flex lg:hidden items-center justify-between"><a href="#home" className="text-[15px] font-semibold tracking-tight text-white">pranjal<span style={{color:'var(--accent)'}}>.</span></a><button onClick={()=>setO(!o)} className="nav-glass rounded-full p-3 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Menu"><div className="w-5 h-4 flex flex-col justify-between"><span className={`block h-0.5 w-5 rounded-full bg-white transition-transform duration-300 ${o?'rotate-45 translate-y-[7px]':''}`}/><span className={`block h-0.5 w-5 rounded-full bg-white transition-opacity duration-300 ${o?'opacity-0':''}`}/><span className={`block h-0.5 w-5 rounded-full bg-white transition-transform duration-300 ${o?'-rotate-45 -translate-y-[7px]':''}`}/></div></button></div>{o&&<div className="lg:hidden nav-glass rounded-2xl mt-3 p-4 flex flex-col gap-1">{links.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setO(false)} className="text-[13px] font-normal rounded-full px-5 py-3 text-zinc-400 hover:text-white text-center min-h-[44px] flex items-center justify-center">{l}</a>)}</div>}</nav></header>)
}

// ═══ HERO ═══
function Hero() {
  return(<section id="home" className="relative flex items-center justify-center px-4 overflow-hidden z-10" style={{minHeight:'100vh',paddingTop:'7rem',paddingBottom:'4rem'}}><div className="relative z-10 w-full max-w-3xl mx-auto text-center">
    <AS><div className="flex items-center justify-center gap-3 mb-8"><span className="hero-status-dot"/><span className="text-xs font-mono text-zinc-500 uppercase tracking-[0.2em]">Open to opportunities</span></div></AS>
    <AS delay={100}><h1 className="text-4xl sm:text-5xl md:text-[72px] font-extrabold tracking-tighter leading-[1] mb-6" style={{letterSpacing:'-0.035em'}}>I build systems<br/>that <span className="shimmer-text">ship</span>.</h1></AS>
    <AS delay={200}><p className="text-lg sm:text-xl text-zinc-400 max-w-lg mx-auto font-light" style={{lineHeight:1.8}}>Full-stack developer specializing in real-time platforms, AI-powered applications, and production-grade systems.</p></AS>
    <AS delay={350}><div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"><a href="mailto:udhwanipranjal@gmail.com?subject=Let's%20connect" className="btn-primary">Get in touch <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></a><a href="#projects" className="btn-secondary">View work <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg></a></div></AS>
    <AS delay={450}><div className="flex flex-wrap items-center justify-center gap-5 mt-12">{[{n:'3',l:'Shipped Products'},{n:'500+',l:'Concurrent Users'},{n:'🏆',l:'Hackathon Winner'}].map((s,i)=><div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.05]"><span className="text-sm font-bold" style={{color:'var(--accent)'}}>{s.n}</span><span className="text-xs text-zinc-500">{s.l}</span></div>)}</div></AS>
    <AS delay={550}><div className="mt-16 flex flex-col items-center gap-2 text-zinc-600"><svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg></div></AS>
  </div></section>)
}

// SVG icons
const GH=<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
const LI=<><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></>

// ═══ MAIN PAGE ═══
function MainPage() {
  return(<>
    <EnvLayer/><AtmoLayer/><div className="noise-overlay"/><ScrollProgress/><Navbar/><Hero/><BentoAbout/><ExperienceSection/>    <section id="projects" className="py-28 relative z-10"><div className="max-w-6xl mx-auto px-4">
      <AS><div className="text-center mb-20"><div className="section-label justify-center"><div className="section-label-line"/><span className="section-label-text">Featured Projects</span></div><h2 className="text-4xl sm:text-5xl md:text-[56px] font-bold tracking-tighter text-white leading-[1]">Work that shipped.</h2><p className="mt-5 text-lg text-zinc-500 max-w-xl mx-auto font-light" style={{lineHeight:1.7}}>Deep dives into systems I've built — from problem to shipped product.</p></div></AS>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{projects.map((p,i)=>(
        <AS key={i} delay={i*120}><a href={p.link} target="_blank" rel="noopener noreferrer" className="block"><div className="premium-card p-0 overflow-hidden group"><div className={`relative w-full aspect-[5/3] bg-gradient-to-br ${p.gradient} p-6 md:p-8 flex flex-col justify-end overflow-hidden`}>{'img' in p && p.img && <img src={p.img} alt={p.title} className="absolute inset-0 w-full h-full object-cover object-top" loading="lazy"/>}{'img' in p && p.img && <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"/>}<div className="absolute top-4 left-6 flex items-center gap-3 z-10"><span className="text-[10px] font-mono tracking-wider uppercase text-white/50">{p.num}</span><span className="w-5 h-px bg-white/20"/><span className="text-[10px] font-mono tracking-wider uppercase text-white/50">{p.type}</span></div><p className="text-white/90 text-sm font-medium max-w-md relative z-10">{p.desc}</p><div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-8"><p className="text-white text-center text-sm font-medium">{p.result}</p></div></div><div className="p-5"><h3 className="text-base font-semibold text-white mb-2 tracking-tight">{p.title}</h3><div className="flex flex-wrap gap-2">{p.tags.map(t=><span key={t} className="px-3 py-1 text-[10px] font-mono rounded-md tracking-wider bg-white/[0.03] border border-white/[0.06] text-zinc-500">{t}</span>)}</div></div></div></a></AS>
      ))}</div>
      <AS delay={500}><div className="text-center mt-14"><a href="https://github.com/Pranjal0410?tab=repositories" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium transition-colors group" style={{color:'var(--accent)'}}>Explore all on GitHub <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></a></div></AS>
    </div></section>
    <section id="skills" className="py-28 px-4 relative z-10"><AS><div className="mb-6"><div className="section-label justify-center"><div className="section-label-line"/><span className="section-label-text">Tech Stack</span></div><h2 className="text-4xl sm:text-5xl md:text-[56px] font-bold tracking-tighter text-white leading-[1] text-center">Tools I <span className="shimmer-text">use</span>.</h2><p className="mt-4 text-sm text-zinc-600 text-center">Drag to rotate</p></div></AS><AS delay={200}><SkillGlobe/></AS></section>
    <section id="contact" className="py-28 px-4 max-w-3xl mx-auto relative z-10">
      <AS><div className="text-center"><div className="section-label justify-center"><div className="section-label-line"/><span className="section-label-text">Contact</span></div><h2 className="text-4xl sm:text-5xl md:text-[56px] font-bold tracking-tighter text-white mb-5 leading-[1]">Let's work together.</h2><p className="text-base text-zinc-400 max-w-md mx-auto mb-10 font-light" style={{lineHeight:1.7}}>Open to internships, full-time roles, and collaborations on interesting projects.</p></div></AS>
      <AS delay={200}><div className="flex flex-col sm:flex-row items-center justify-center gap-4"><a href="mailto:udhwanipranjal@gmail.com?subject=Let's%20connect&body=Hi%20Pranjal%20—%20I'd%20like%20to%20talk%20about..." className="btn-primary">Get in touch <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></a><a href="https://www.linkedin.com/in/pranjal-udhwani/" target="_blank" rel="noopener noreferrer" className="btn-secondary"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">{LI}</svg>LinkedIn</a><a href="https://github.com/Pranjal0410" target="_blank" rel="noopener noreferrer" className="btn-secondary"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">{GH}</svg>GitHub</a></div></AS>
    </section>
    <footer className="py-10 px-4 border-t border-white/[0.04] relative z-10"><div className="max-w-6xl mx-auto text-center"><p className="text-xs font-mono text-zinc-600 tracking-wide">Designed & built by Pranjal Udhwani · 2026</p></div></footer>
  </>)
}

export default function App() {
  return <div className="min-h-screen bg-[#09090b] text-white antialiased overflow-x-hidden" style={{fontFamily:'var(--font-heading)'}}><MainPage/></div>
}
