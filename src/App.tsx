import { useState, useEffect, useRef, useCallback, type ReactElement } from 'react'
import { PORTRAIT, AWARD, HACKATHON } from './images'
import { WORLDMAP } from './worldmap'
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
          if (d < rad) { ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI*2); ctx.fillStyle = `rgba(139,92,246,${(1-d/rad)*0.2})`; ctx.fill() }
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

// ═══ TYPEWRITER ═══
function Typewriter({ lines, speed = 40 }: { lines: string[]; speed?: number }) {
  const [text, setText] = useState(''); const [li, setLi] = useState(0); const [ci, setCi] = useState(0); const [del, setDel] = useState(false)
  useEffect(() => {
    const cur = lines[li]
    const t = setTimeout(() => {
      if (!del) { if (ci < cur.length) { setText(cur.slice(0, ci+1)); setCi(c=>c+1) } else setTimeout(() => setDel(true), 1800) }
      else { if (ci > 0) { setText(cur.slice(0, ci-1)); setCi(c=>c-1) } else { setDel(false); setLi(i=>(i+1)%lines.length) } }
    }, del ? speed/2 : speed)
    return () => clearTimeout(t)
  }, [ci, del, li, lines, speed])
  return <span>{text}<span className="typewriter-cursor"/></span>
}

// ═══ Q&A CHAT ═══
const qa: Record<string,string> = {
  'Work':"I architect scalable, AI-driven web and mobile systems for performance, reliability, and growth.",
  'About':"CS student at Chitkara University. I turn complex problems into elegant solutions. Shipped 2+ production projects.",
  'Skills':"TypeScript, React, Next.js, Node.js, Python, Tailwind, PostgreSQL, MongoDB, Docker, Spring Boot, Expo, C++.",
  'Contact':"udhwanipranjal@gmail.com • linkedin.com/in/pranjal-udhwani • github.com/Pranjal0410",
  'Hackathons':"Winner at Phosphenes hackathon (Chitkara). I thrive on rapid prototyping AI/ML projects under pressure.",
  'Education':"B.Tech CS at Chitkara University. Strong in algorithms, data structures, system design, and AI/ML.",
}
function Chat() {
  const [msgs, setMsgs] = useState<{r:string;t:string}[]>([]); const [typing, setTyping] = useState(false); const [input, setInput] = useState(''); const scrollRef = useRef<HTMLDivElement>(null)
  const topics = Object.keys(qa)
  const ask = useCallback((q:string)=>{const m=topics.find(t=>q.toLowerCase().includes(t.toLowerCase()));const a=m?qa[m]:"Ask about Work, Skills, About, Hackathons, Education, or Contact!";setMsgs(p=>[...p,{r:'u',t:q}]);setTyping(true);setTimeout(()=>{setTyping(false);setMsgs(p=>[...p,{r:'a',t:a}])},600+Math.random()*400)},[])
  const submit=(e:React.FormEvent)=>{e.preventDefault();if(!input.trim()||typing)return;ask(input.trim());setInput('')}
  useEffect(()=>{scrollRef.current?.scrollTo({top:scrollRef.current.scrollHeight,behavior:'smooth'})},[msgs,typing])
  return(
    <div className="w-full max-w-2xl mx-auto premium-card" style={{borderRadius:24,padding:0}}>
      <div ref={scrollRef} className="flex flex-col gap-3 overflow-y-auto chat-scroll" style={{height:'12rem',padding:'14px'}}>
        {msgs.length===0&&<div className="flex-1 flex items-center justify-center"><p className="text-sm text-zinc-600 italic">Ask me anything about Pranjal...</p></div>}
        {msgs.map((m,i)=><div key={i} className={`flex ${m.r==='u'?'justify-end':'justify-start'}`}><div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.r==='u'?'bg-violet-600/15 text-violet-200 rounded-br-md':'bg-white/[0.04] text-zinc-300 rounded-bl-md'}`}>{m.t}</div></div>)}
        {typing&&<div className="flex justify-start"><div className="bg-white/[0.04] px-4 py-3 rounded-2xl rounded-bl-md flex gap-1"><div className="w-2 h-2 rounded-full bg-zinc-500 typing-dot"/><div className="w-2 h-2 rounded-full bg-zinc-500 typing-dot"/><div className="w-2 h-2 rounded-full bg-zinc-500 typing-dot"/></div></div>}
      </div>
      <div className="border-t border-white/[0.06] p-4">
        <div className="flex flex-wrap gap-1.5 justify-center mb-3">{topics.map(t=><button key={t} onClick={()=>ask(t)} disabled={typing} className="text-xs rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-zinc-500 hover:border-violet-500/30 hover:text-zinc-300 active:scale-95 transition-all disabled:opacity-40 min-h-[36px]">{t}</button>)}</div>
        <form onSubmit={submit} className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-1.5"><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask anything..." className="flex-1 bg-transparent text-sm outline-none text-white placeholder:text-zinc-600 py-2.5" aria-label="Ask a question"/><button type="submit" disabled={!input.trim()||typing} className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white shrink-0 disabled:opacity-0 hover:scale-105 transition-all" aria-label="Send"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg></button></form>
      </div>
    </div>
  )
}

// ═══ INTERACTIVE GLOBE (BIGGER) ═══
function SkillGlobe() {
  const [rotY,setRotY]=useState(0);const [rotX,setRotX]=useState(-15);const dragging=useRef(false);const lastPos=useRef({x:0,y:0})
  useEffect(()=>{let raf:number;const tick=()=>{if(!dragging.current)setRotY(p=>p+0.12);raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf)},[])
  const onDown=(e:React.MouseEvent|React.TouchEvent)=>{dragging.current=true;const p='touches' in e?e.touches[0]:e;lastPos.current={x:p.clientX,y:p.clientY}}
  const onMove=(e:React.MouseEvent|React.TouchEvent)=>{if(!dragging.current)return;const p='touches' in e?e.touches[0]:e;setRotY(prev=>prev+(p.clientX-lastPos.current.x)*0.4);setRotX(prev=>Math.max(-60,Math.min(60,prev-(p.clientY-lastPos.current.y)*0.4)));lastPos.current={x:p.clientX,y:p.clientY}}
  useEffect(()=>{const up=()=>{dragging.current=false};window.addEventListener('mouseup',up);window.addEventListener('touchend',up);return()=>{window.removeEventListener('mouseup',up);window.removeEventListener('touchend',up)}},[])
  const R=210,toRad=(d:number)=>d*Math.PI/180
  const getPos=(lat:number,lon:number)=>{const la=toRad(lat),lo=toRad(lon+rotY),rx=toRad(rotX);let x=R*Math.cos(la)*Math.sin(lo),y=-R*Math.sin(la),z=R*Math.cos(la)*Math.cos(lo);const y2=y*Math.cos(rx)-z*Math.sin(rx),z2=y*Math.sin(rx)+z*Math.cos(rx);return{x,y:y2,z:z2}}
  const icons=[{n:'TypeScript',c:'#3178C6',la:20,lo:0},{n:'React',c:'#61DAFB',la:20,lo:72},{n:'Next.js',c:'#fff',la:20,lo:144},{n:'Node.js',c:'#339933',la:20,lo:216},{n:'Python',c:'#3776AB',la:20,lo:288},{n:'Tailwind',c:'#06B6D4',la:-20,lo:36},{n:'PostgreSQL',c:'#4169E1',la:-20,lo:108},{n:'Docker',c:'#2496ED',la:-20,lo:180},{n:'Git',c:'#F05032',la:-20,lo:252},{n:'C++',c:'#00599C',la:-20,lo:324},{n:'MongoDB',c:'#47A248',la:55,lo:60},{n:'Spring',c:'#6DB33F',la:55,lo:180},{n:'Figma',c:'#F24E1E',la:55,lo:300},{n:'Expo',c:'#aaa',la:-55,lo:120},{n:'Vercel',c:'#fff',la:-55,lo:240}]
  const wires:ReactElement[]=[];for(let lon=0;lon<180;lon+=30){const pts:string[]=[];const pts2:string[]=[];for(let lat=-90;lat<=90;lat+=5){const p=getPos(lat,lon);pts.push(`${p.x+R+50},${p.y+R+50}`);const p2=getPos(lat,lon+90);pts2.push(`${p2.x+R+50},${p2.y+R+50}`)};wires.push(<polyline key={`a${lon}`} points={pts.join(' ')} fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="0.8"/>);wires.push(<polyline key={`b${lon}`} points={pts2.join(' ')} fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="0.8"/>)}
  for(let lat=-60;lat<=60;lat+=30){const pts:string[]=[];for(let lon=0;lon<=360;lon+=5){const p=getPos(lat,lon);pts.push(`${p.x+R+50},${p.y+R+50}`)};wires.push(<polyline key={`c${lat}`} points={pts.join(' ')} fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="0.8"/>)}
  const positioned=icons.map(ic=>({...ic,...getPos(ic.la,ic.lo)})).sort((a,b)=>a.z-b.z)
  return(
    <div className="relative w-full flex items-center justify-center select-none" style={{height:580,cursor:dragging.current?'grabbing':'grab'}} onMouseDown={onDown} onMouseMove={onMove} onTouchStart={onDown} onTouchMove={onMove}>
      <svg width={R*2+100} height={R*2+100} className="absolute"><circle cx={R+50} cy={R+50} r={R} fill="none" stroke="rgba(139,92,246,0.18)" strokeWidth="1"/>{wires}</svg>
      <div className="absolute w-32 h-32 bg-violet-500/25 rounded-full blur-[60px]"/>
      {positioned.map((ic,i)=>{const s=0.55+(ic.z+R)/(2*R)*0.5,o=0.3+(ic.z+R)/(2*R)*0.7;return(<div key={i} className="absolute pointer-events-none" style={{left:`calc(50% + ${ic.x}px)`,top:`calc(50% + ${ic.y}px)`,transform:`translate(-50%,-50%) scale(${s})`,opacity:o,zIndex:Math.round(ic.z+R)}}><div className="px-3 py-1.5 rounded-xl border border-white/[0.12] backdrop-blur-sm font-mono font-semibold text-[11px] whitespace-nowrap" style={{background:`${ic.c}20`,color:ic.c,boxShadow:`0 0 16px ${ic.c}18`}}>{ic.n}</div></div>)})}
    </div>
  )
}

// ═══ AI THINKING SECTION ═══
function AISection() {
  const [line, setLine] = useState(0)
  const lines = ['import model from "neural-engine"','const agent = model.create({ type: "reasoning" })','await agent.think({ context: portfolio })','// Generating intelligent experiences...','export default agent.deploy()']
  useEffect(() => { const t = setInterval(() => setLine(l => (l+1)%lines.length), 2500); return () => clearInterval(t) }, [])
  return (
    <section className="py-20 px-4 relative z-10">
      <AS><div className="max-w-4xl mx-auto premium-card p-8 md:p-12 relative overflow-hidden" style={{borderRadius:32}}>
        {/* Neural grid bg */}
        <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'linear-gradient(rgba(139,92,246,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,.3) 1px, transparent 1px)',backgroundSize:'40px 40px'}}/>
        {/* Pulsing nodes */}
        {[{x:15,y:20,d:0},{x:75,y:30,d:1},{x:40,y:70,d:2},{x:85,y:75,d:3},{x:25,y:85,d:1.5}].map((n,i)=><div key={i} className="absolute w-2 h-2 rounded-full bg-violet-500" style={{left:`${n.x}%`,top:`${n.y}%`,opacity:0.15,animation:`ambient-pulse 3s ease-in-out ${n.d}s infinite`}}/>)}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6"><div className="w-3 h-3 rounded-full bg-violet-500 animate-pulse"/><span className="text-xs font-mono text-violet-400 uppercase tracking-widest">AI Thinking Mode</span></div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-4 tracking-tight">Not just building software.<br/><span className="shimmer-text">Engineering intelligence.</span></h3>
          <p className="text-sm text-zinc-400 max-w-lg leading-relaxed mb-8">I don't just write code — I design systems that think, adapt, and scale. From neural architectures to production deployment, I build AI that works in the real world.</p>
          {/* Terminal */}
          <div className="bg-black/40 rounded-2xl border border-white/[0.06] p-5 font-mono text-sm overflow-hidden">
            <div className="flex items-center gap-2 mb-4"><div className="w-3 h-3 rounded-full bg-red-500/60"/><div className="w-3 h-3 rounded-full bg-yellow-500/60"/><div className="w-3 h-3 rounded-full bg-green-500/60"/><span className="text-[10px] text-zinc-600 ml-2">neural-engine.ts</span></div>
            {lines.map((l,i)=><div key={i} className="transition-all duration-500" style={{opacity:i<=line?1:0.2,transform:`translateY(${i<=line?0:4}px)`}}><span className="text-zinc-600 mr-3 select-none">{i+1}</span><span className={i===line?'text-violet-300':'text-zinc-500'}>{l}</span></div>)}
          </div>
          <p className="text-[10px] font-mono text-zinc-600 mt-4 animate-pulse">Currently training models...</p>
        </div>
      </div></AS>
    </section>
  )
}

// ═══ INFO CARDS (horizontal group, focus-shift hover) ═══
function InfoCards() {
  const [hovered, setHovered] = useState<number | null>(null)
  const cards = [
    { t: 'Coding Club', txt: 'Active member building AI-powered applications and collaborative learning systems at Chitkara.' },
    { t: 'University', txt: 'Pursuing Computer Science at Chitkara University. Strong foundations in AI, systems design, and scalable architecture.' },
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
                ? 'linear-gradient(145deg, rgba(30,24,52,0.98), rgba(40,30,65,0.9))'
                : 'linear-gradient(145deg, rgba(20,16,32,0.95), rgba(28,22,44,0.7))',
              border: isHovered
                ? '1px solid rgba(139,92,246,0.5)'
                : '1px solid rgba(80,70,110,0.2)',
              boxShadow: isHovered
                ? '0 0 24px rgba(139,92,246,0.15), 0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
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
            {/* Purple radial glow behind hovered card */}
            {isHovered && (
              <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
                background: 'radial-gradient(ellipse at center, rgba(139,92,246,0.08) 0%, transparent 70%)',
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
      <AS><div className="text-center mb-16"><span className="text-sm font-bold text-violet-400 uppercase tracking-[0.2em]">About Me</span><h2 className="mt-4 text-4xl sm:text-5xl md:text-[64px] font-extrabold tracking-tighter text-white leading-[1]">Who I <span className="shimmer-text">Am</span></h2></div></AS>
      <div className="bento-master-wrapper">
        <div className="bento-inner-glow"/>
        <div className="relative z-10 grid grid-cols-3 gap-4" style={{gridTemplateRows:'210px 440px 175px'}}>
          {/* Name */}
          <AS delay={50}><TiltCard className="h-full flex flex-col justify-center items-center text-center p-8">
            <h3 className="text-3xl md:text-[42px] font-extrabold tracking-tighter text-white leading-[1] mb-4" style={{letterSpacing:'-0.02em'}}>PRANJAL<br/>UDHWANI</h3>
            <div className="h-0.5 w-14 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full mb-3"/>
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
          <AS delay={150}><TiltCard className="h-full p-7 flex flex-col justify-between">
            <div><h4 className="text-2xl font-bold text-white mb-2">Mindset</h4><div className="h-0.5 w-8 bg-violet-500/60 rounded-full mb-4"/><p className="text-sm text-zinc-400 leading-relaxed"><strong className="text-zinc-200">Building more than software.</strong> My passions provide the <strong className="text-zinc-200">discipline and focus</strong> I need to grow.</p></div>
            <div className="mt-4 rounded-xl overflow-hidden border-2 border-violet-500/20 img-hover" style={{maxWidth:220}}><img src={HACKATHON} alt="Phosphenes Hackathon" className="w-full h-32 object-cover" loading="lazy"/><div className="bg-black/60 px-3 py-2"><span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider">Phosphenes Hackathon</span></div></div>
            <p className="text-xs text-zinc-500 mt-4"><strong className="text-zinc-300">Mastering craft and mind</strong> is my path to <strong className="text-zinc-300">excellence</strong>.</p>
          </TiltCard></AS>

          {/* Photo slideshow */}
          <AS delay={200}><div className="premium-card h-full overflow-hidden relative" style={{borderRadius:28}}>
            <img src={PORTRAIT} alt="Pranjal" className="absolute inset-0 w-full h-full object-cover object-top slide-a" loading="lazy"/>
            <img src={AWARD} alt="Award" className="absolute inset-0 w-full h-full object-cover slide-b" loading="lazy"/>
            <div className="absolute inset-0 border border-violet-500/10 rounded-[28px] pointer-events-none"/>
          </div></AS>

          {/* Craft */}
          <AS delay={250}><TiltCard className="h-full flex flex-col justify-between overflow-hidden">
            <div className="p-7 pb-0"><h4 className="text-2xl font-bold text-white mb-2">Craft</h4><div className="h-0.5 w-8 bg-fuchsia-500/60 rounded-full mb-4"/><p className="text-sm text-zinc-400 leading-relaxed">Building scalable <strong className="text-zinc-200">apps, websites, and AI systems</strong>.</p><p className="text-sm text-zinc-400 leading-relaxed mt-2">I understand what modern tech can provide, helping deliver solutions a business <strong className="text-zinc-200">actually needs</strong>.</p></div>
            <div className="relative w-full py-3 border-y border-white/[0.04] my-3 overflow-hidden"><div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[rgba(18,16,32,1)] to-transparent z-10"/><div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[rgba(18,16,32,1)] to-transparent z-10"/><div className="animate-marquee">{[0,1].map(s=><div key={s} className="flex gap-5 items-center shrink-0 pr-5">{['Docker','Git','Next.js','React','TS','Python','Node','Tailwind'].map(t=><span key={`${s}-${t}`} className="text-[9px] font-mono font-medium text-zinc-500 uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 hover:text-violet-400 transition-colors cursor-default"><span className="w-1.5 h-1.5 rounded-sm bg-violet-500/30"/>{t}</span>)}</div>)}</div></div>
            <div className="p-7 pt-0"><p className="text-xs text-zinc-400 mb-3">Active Hackathon competitor. Feel free to invite me to collaborate.</p><div className="flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"/><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"/></span><span className="text-[10px] font-medium text-zinc-400">Open to collaboration & freelance</span></div></div>
          </TiltCard></AS>

          {/* Location */}
          <AS delay={300} className="col-start-2"><div className="location-card h-full">
            <div className="absolute inset-0 opacity-[0.18]" style={{backgroundImage:`url(${WORLDMAP})`,backgroundSize:'cover',backgroundPosition:'center 40%',filter:'blur(0.3px) grayscale(100%)'}}/>
            <div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage:'radial-gradient(circle,rgba(139,92,246,.4) .5px,transparent .5px)',backgroundSize:'12px 12px'}}/>
            <div className="absolute inset-0 opacity-[0.025]" style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(139,92,246,.15) 3px,rgba(139,92,246,.15) 4px)'}}/>
            <div className="scan-beam"/><div className="scan-bright"/>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"/>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"/>
            <div className="relative h-full flex flex-col justify-end p-6 z-20"><span className="text-2xl md:text-3xl font-extrabold text-white uppercase tracking-tighter block leading-[1]">Chandigarh, India</span><span className="text-[11px] font-mono text-zinc-400 mt-1.5 tracking-wide">30.7333° N, 76.7794° E</span><div className="flex items-center gap-1 mt-1"><span className="text-violet-400 font-bold text-sm">–</span><span className="text-[11px] font-mono text-violet-400 font-semibold">GMT+5:30</span></div></div>
          </div></AS>
        </div>
      </div>
    </section>
  )
}

// ═══ PROJECTS ═══
const projects=[{num:'01',type:'AI Platform',title:'AI-Powered Web Platform',desc:'Full-stack generative AI platform with real-time inference and intelligent workflows.',result:'Shipped to production — 1000+ daily requests.',tags:['Next.js','Python','OpenAI','PostgreSQL'],gradient:'from-violet-600 to-fuchsia-600'},{num:'02',type:'Mobile App',title:'Cross-Platform Mobile App',desc:'Production-ready mobile app with real-time sync and offline-first architecture.',result:'Built in 3 weeks with React Native + Expo.',tags:['React Native','Expo','Node.js','MongoDB'],gradient:'from-emerald-500 to-cyan-500'},{num:'03',type:'Backend',title:'Scalable Microservices',desc:'High-performance microservices with sub-100ms latency at scale.',result:'Handles 5000+ concurrent connections.',tags:['Node.js','Docker','PostgreSQL','Redis'],gradient:'from-orange-500 to-amber-500'},{num:'04',type:'Web App',title:'Real-Time Dashboard',desc:'Live data visualization with complex filtering and responsive analytics.',result:'Used daily for team decision-making.',tags:['React','TypeScript','Tailwind','D3.js'],gradient:'from-sky-500 to-blue-600'}]

// ═══ GUESTBOOK ═══
function Guestbook({onBack}:{onBack:()=>void}) {
  const [entries,setEntries]=useState([{name:'Deepanshu Udhwani',date:'Feb 2025',msg:'Proud of you! Keep building 🚀',avatar:'🧔'},{name:'Chitkara CS',date:'Jan 2025',msg:'Outstanding Phosphenes hackathon work!',avatar:'🎓'},{name:'Tech Community',date:'Jan 2025',msg:'Great portfolio!',avatar:'💻'}])
  const [name,setName]=useState('');const [msg,setMsg]=useState('')
  const add=()=>{if(!name.trim()||!msg.trim())return;setEntries(p=>[{name:name.trim(),date:new Date().toLocaleDateString('en-US',{month:'short',year:'numeric'}),msg:msg.trim(),avatar:'👤'},...p]);setName('');setMsg('')}
  return(<div className="min-h-screen bg-[#0b0b16] text-white relative" style={{fontFamily:'var(--font-heading)'}}><EnvLayer/><AtmoLayer/><div className="noise-overlay"/>
    <header className="fixed top-0 left-0 right-0 z-50 py-5"><nav className="max-w-6xl mx-auto px-5 flex items-center justify-between"><button onClick={onBack} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>Back to home</button><span className="text-xl font-extrabold tracking-tighter text-white">P<span className="shimmer-text">U</span></span></nav></header>
    <div className="relative z-10 max-w-3xl mx-auto px-4 pt-32 pb-20"><div className="text-center mb-12"><span className="text-sm font-bold text-violet-400 uppercase tracking-[0.2em]">The Community Wall</span><h1 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter leading-[1]">Leave Your <span className="shimmer-text">Mark</span></h1><p className="mt-5 text-lg text-zinc-500 font-light">Share your thoughts, feedback, or just say hi!</p></div>
    <div className="guestbook-glow rounded-3xl p-6 mb-10"><p className="text-sm text-zinc-400 text-center mb-4">Pin your message to this board</p><div className="flex flex-col gap-3"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm outline-none text-white placeholder:text-zinc-600 focus:border-violet-500/30 transition-colors" aria-label="Name"/><textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Leave a message..." rows={3} className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm outline-none text-white placeholder:text-zinc-600 resize-none focus:border-violet-500/30 transition-colors" aria-label="Message"/><button onClick={add} disabled={!name.trim()||!msg.trim()} className="btn-primary w-full justify-center disabled:opacity-40">Post Message</button></div></div>
    <div className="flex flex-col gap-4">{entries.map((e,i)=><TiltCard key={i} className="p-5 flex gap-4 items-start"><div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center text-lg shrink-0">{e.avatar}</div><div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-sm font-bold text-white uppercase tracking-tight">{e.name}</span><span className="text-[10px] text-zinc-600">{e.date}</span></div><p className="text-sm text-zinc-400">{e.msg}</p></div></TiltCard>)}</div></div>
  </div>)
}

// ═══ MY LINKS PAGE ═══
function MyLinks({onBack}:{onBack:()=>void}) {
  const links = [
    { name:'GitHub', url:'https://github.com/Pranjal0410', icon:<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">{GH}</svg>, color:'#06b6d4' },
    { name:'LinkedIn', url:'https://www.linkedin.com/in/pranjal-udhwani/', icon:<svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">{LI}</svg>, color:'#06b6d4' },
    { name:'Email', url:'mailto:udhwanipranjal@gmail.com', icon:<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>, color:'#06b6d4' },
  ]
  return(<div className="min-h-screen bg-[#0b0b16] text-white relative" style={{fontFamily:'var(--font-heading)'}}><EnvLayer/><AtmoLayer/><div className="noise-overlay"/>
    <header className="fixed top-0 left-0 right-0 z-50 py-5"><nav className="max-w-6xl mx-auto px-5 flex items-center justify-between"><button onClick={onBack} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>Back to home</button><span className="text-xl font-extrabold tracking-tighter text-white">P<span className="shimmer-text">U</span></span></nav></header>
    <div className="relative z-10 max-w-3xl mx-auto px-4 pt-32 pb-20">
      <div className="text-center mb-12"><span className="text-sm font-bold text-cyan-400 uppercase tracking-[0.2em]">Connect With Me</span><h1 className="mt-4 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter leading-[1]">My <span style={{background:'linear-gradient(135deg,#06b6d4,#3b82f6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Links</span></h1><p className="mt-5 text-lg text-zinc-500 font-light">Find me across the web and social platforms</p></div>
      <div className="flex flex-col gap-4">{links.map((l,i)=>(
        <a key={i} href={l.url} target={l.url.startsWith('mailto')?undefined:'_blank'} rel="noopener noreferrer" className="premium-card p-5 flex items-center gap-4 group cursor-pointer no-underline" style={{borderRadius:20}}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-cyan-500/30 bg-zinc-900/60 text-cyan-400 shrink-0 group-hover:border-cyan-400/50 transition-colors">{l.icon}</div>
          <span className="text-lg font-bold text-white flex-1">{l.name}</span>
          <svg className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/></svg>
        </a>
      ))}</div>
    </div>
  </div>)
}

// ═══ MORE TO EXPLORE SECTION ═══
function ExploreSection({onGuestbook, onLinks}:{onGuestbook:()=>void; onLinks:()=>void}) {
  const [hovered, setHovered] = useState<number|null>(null)
  const cards = [
    { title:'Guestbook', desc:'Leave your mark and see what others have to say', color:'#8b5cf6', icon:<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h6"/><path d="M8 11h8"/></svg>, action:onGuestbook },
    { title:'My Links', desc:'Find me across the web and social platforms', color:'#06b6d4', icon:<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>, action:onLinks },
  ]
  return(
    <section className="py-28 px-4 relative z-10">
      <AS><div className="text-center mb-16"><h2 className="text-4xl sm:text-5xl md:text-[64px] font-extrabold tracking-tighter text-white leading-[1]">More to <span className="shimmer-text">Explore</span></h2><p className="mt-5 text-lg text-zinc-500 font-light">Check out these additional resources and connect with me</p></div></AS>
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((c,i)=>{
          const isH = hovered===i, isO = hovered!==null&&!isH
          return(
            <AS key={i} delay={i*120}><div
              className="relative rounded-3xl p-8 text-center cursor-pointer backdrop-blur-md"
              style={{
                background: isH ? `linear-gradient(145deg, rgba(${c.color==='#8b5cf6'?'139,92,246':'6,182,212'},0.12), rgba(20,16,32,0.95))` : 'linear-gradient(145deg, rgba(18,16,32,0.95), rgba(28,24,48,0.6))',
                border: isH ? `1px solid ${c.color}80` : '1px solid rgba(80,70,120,0.2)',
                boxShadow: isH ? `0 0 30px ${c.color}18, 0 12px 40px rgba(0,0,0,0.4)` : '0 4px 20px rgba(0,0,0,0.3)',
                transform: isH ? 'translateY(-10px) scale(1.03)' : isO ? 'translateY(2px) scale(0.97)' : '',
                opacity: isO ? 0.6 : 1,
                filter: isO ? 'brightness(0.75)' : 'brightness(1)',
                transition: 'all 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)} onClick={c.action}
            >
              {isH && <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{background:`radial-gradient(ellipse at center, ${c.color}10 0%, transparent 70%)`}}/>}
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center border bg-zinc-900/60" style={{borderColor:`${c.color}40`,color:c.color}}>{c.icon}</div>
                <h3 className="text-2xl font-extrabold mb-2" style={{color:c.color}}>{c.title}</h3>
                <p className="text-sm text-zinc-400 mb-5">{c.desc}</p>
                <span className="text-sm font-semibold inline-flex items-center gap-1" style={{color:c.color}}>Explore <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></span>
              </div>
            </div></AS>
          )
        })}
      </div>
    </section>
  )
}
function Navbar({onGuestbook}:{onGuestbook:()=>void}) {
  const [s,setS]=useState(false);const [o,setO]=useState(false)
  useEffect(()=>{const h=()=>setS(window.scrollY>40);window.addEventListener('scroll',h);return()=>window.removeEventListener('scroll',h)},[])
  const links=['Home','About','Projects','Skills','Contact']
  return(<header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${s?'py-3':'py-5'}`}><nav className="max-w-6xl mx-auto px-5 lg:px-8"><div className="hidden lg:flex items-center justify-center relative"><div className="absolute left-0"><a href="#home" className="text-xl font-extrabold tracking-tighter text-white" style={{letterSpacing:'-0.03em'}}>P<span className="shimmer-text">U</span></a></div><div className="flex items-center gap-1 nav-glass rounded-full h-12 px-6">{links.map(l=><a key={l} href={`#${l.toLowerCase()}`} className="text-sm font-medium rounded-full px-4 py-2 text-zinc-400 hover:text-white transition-colors">{l}</a>)}<button onClick={onGuestbook} className="text-sm font-medium rounded-full px-4 py-2 text-violet-400 hover:text-violet-300 transition-colors">Guestbook</button></div><div className="absolute right-0"><a href="mailto:udhwanipranjal@gmail.com" className="nav-glass rounded-full h-12 px-5 flex items-center gap-2 text-sm font-semibold text-white hover:scale-105 transition-transform min-h-[44px]">✉️ Get in Touch</a></div></div><div className="flex lg:hidden items-center justify-between"><a href="#home" className="text-xl font-extrabold tracking-tighter text-white">P<span className="shimmer-text">U</span></a><button onClick={()=>setO(!o)} className="nav-glass rounded-full p-3 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Menu"><div className="w-5 h-4 flex flex-col justify-between"><span className={`block h-0.5 w-5 rounded-full bg-white transition-transform duration-300 ${o?'rotate-45 translate-y-[7px]':''}`}/><span className={`block h-0.5 w-5 rounded-full bg-white transition-opacity duration-300 ${o?'opacity-0':''}`}/><span className={`block h-0.5 w-5 rounded-full bg-white transition-transform duration-300 ${o?'-rotate-45 -translate-y-[7px]':''}`}/></div></button></div>{o&&<div className="lg:hidden nav-glass rounded-2xl mt-3 p-4 flex flex-col gap-1">{links.map(l=><a key={l} href={`#${l.toLowerCase()}`} onClick={()=>setO(false)} className="text-sm font-medium rounded-full px-5 py-3 text-zinc-300 hover:text-white text-center min-h-[44px] flex items-center justify-center">{l}</a>)}<button onClick={()=>{setO(false);onGuestbook()}} className="text-sm font-medium rounded-full px-5 py-3 text-violet-400 text-center min-h-[44px]">Guestbook</button></div>}</nav></header>)
}

// ═══ HERO ═══
function Hero() {
  return(<section id="home" className="relative flex items-center justify-center px-4 overflow-hidden z-10" style={{minHeight:'100vh',paddingTop:'7rem',paddingBottom:'4rem'}}><div className="relative z-10 w-full max-w-3xl mx-auto text-center">
    <AS><div className="flex justify-center mb-6"><div className="text-8xl sm:text-9xl" style={{filter:'drop-shadow(0 0 40px rgba(139,92,246,0.15))'}}>👩‍💻</div></div></AS>
    <AS delay={100}><h1 className="text-4xl sm:text-5xl md:text-[68px] font-extrabold tracking-tighter leading-[1] mb-3" style={{letterSpacing:'-0.03em'}}>Hi, I'm <span className="shimmer-text">Pranjal Udhwani</span></h1><p className="text-lg sm:text-xl md:text-2xl text-zinc-400 font-medium tracking-tight mb-5">I design intelligent product experiences that scale.</p></AS>
    <AS delay={250}><p className="text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto mb-2" style={{lineHeight:1.8}}><Typewriter lines={["Full-stack AI systems — let's build yours.","Scalable platforms. Shipped to production.","Design systems that people remember.","Let's build something together."]} speed={38}/></p><p className="text-sm text-zinc-600 mt-2">Open to internships & freelance</p></AS>
    <AS delay={400}><div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"><a href="#contact" className="btn-primary">Let's connect <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></a><a href="#projects" className="btn-secondary">See projects <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg></a></div></AS>
    <AS delay={500}><div className="flex flex-wrap items-center justify-center gap-5 mt-10">{[{n:'2+',l:'Production Projects'},{n:'🏆',l:'Hackathon Winner'},{n:'CS',l:'Chitkara University'}].map((s,i)=><div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.05]"><span className="text-sm font-bold text-violet-400">{s.n}</span><span className="text-xs text-zinc-500">{s.l}</span></div>)}</div></AS>
    <AS delay={600}><div className="mt-10"><Chat/></div></AS>
    <AS delay={700}><div className="mt-10 flex flex-col items-center gap-2 text-zinc-600"><span className="text-xs tracking-widest uppercase">Scroll to explore</span><svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg></div></AS>
  </div></section>)
}

// SVG icons
const GH=<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
const LI=<><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></>

// ═══ MAIN PAGE ═══
function MainPage({onGuestbook,onLinks}:{onGuestbook:()=>void;onLinks:()=>void}) {
  return(<>
    <EnvLayer/><AtmoLayer/><div className="noise-overlay"/><ScrollProgress/><Navbar onGuestbook={onGuestbook}/><Hero/><BentoAbout/><AISection/>
    <section id="projects" className="py-28 relative z-10"><div className="max-w-6xl mx-auto px-4">
      <AS><div className="text-center mb-20"><span className="text-sm font-bold text-violet-400 uppercase tracking-[0.2em]">Portfolio</span><h2 className="mt-4 text-4xl sm:text-5xl md:text-[64px] font-extrabold tracking-tighter text-white leading-[1]">Featured <span className="shimmer-text">Projects</span></h2><p className="mt-6 text-lg text-zinc-500 max-w-2xl mx-auto font-light" style={{lineHeight:1.7}}>Deep dives into systems I've built — from problem to shipped product.</p></div></AS>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">{projects.map((p,i)=>(
        <AS key={i} delay={i*120}><div className="premium-card p-0 overflow-hidden group"><div className={`relative w-full aspect-[5/3] bg-gradient-to-br ${p.gradient} p-6 md:p-8 flex flex-col justify-end overflow-hidden`}><div className="absolute top-4 left-6 flex items-center gap-3"><span className="text-[10px] font-mono tracking-wider uppercase text-white/50">{p.num}</span><span className="w-5 h-px bg-white/20"/><span className="text-[10px] font-mono tracking-wider uppercase text-white/50">{p.type}</span></div><p className="text-white/90 text-sm font-medium max-w-md relative z-10">{p.desc}</p><div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 rounded-bl-[100px] group-hover:bg-white/10 transition-colors duration-500"/><div className="absolute -bottom-8 -right-8 w-32 h-32 border border-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"/><div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-8"><p className="text-white text-center text-sm font-medium">{p.result}</p></div></div><div className="p-5"><h3 className="text-lg font-bold text-white mb-2 tracking-tight">{p.title}</h3><div className="flex flex-wrap gap-2">{p.tags.map(t=><span key={t} className="px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider bg-white/[0.03] border border-white/[0.06] text-zinc-500">{t}</span>)}</div></div></div></AS>
      ))}</div>
      <AS delay={500}><div className="text-center mt-16"><a href="https://github.com/Pranjal0410?tab=repositories" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-base font-semibold text-violet-400 hover:text-violet-300 transition-colors group">Explore all on GitHub <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6v6M10 14L21 3M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/></svg></a></div></AS>
    </div></section>
    <section id="skills" className="py-28 px-4 relative z-10"><AS><div className="text-center mb-6"><span className="text-sm font-bold text-violet-400 uppercase tracking-[0.2em]">Tech Stack</span><h2 className="mt-4 text-4xl sm:text-5xl md:text-[64px] font-extrabold tracking-tighter text-white leading-[1]">My <span className="shimmer-text">Skills</span></h2><p className="mt-4 text-sm text-zinc-600">Drag to rotate</p></div></AS><AS delay={200}><SkillGlobe/></AS></section>
    <section id="contact" className="py-28 px-4 max-w-4xl mx-auto text-center relative z-10">
      <AS><span className="text-sm font-bold text-violet-400 uppercase tracking-[0.2em]">Get in Touch</span><h2 className="mt-4 text-4xl sm:text-5xl md:text-[64px] font-extrabold tracking-tighter text-white mb-4 leading-[1]">Let's <span className="shimmer-text">Connect</span></h2><p className="text-lg text-zinc-400 max-w-xl mx-auto mb-4 font-light" style={{lineHeight:1.7}}>Open to internships, freelance, and ambitious collaborations.</p><img src={PORTRAIT} alt="Pranjal" className="w-20 h-20 rounded-full object-cover object-top mx-auto mb-8 border-2 border-violet-500/15" loading="lazy"/></AS>
      <AS delay={200}><div className="flex flex-col sm:flex-row items-center justify-center gap-4"><a href="mailto:udhwanipranjal@gmail.com?subject=Let's%20connect&body=Hi%20Pranjal%20—%20I'd%20like%20to%20talk%20about..." className="btn-primary">✉️ Let's connect</a><a href="https://www.linkedin.com/in/pranjal-udhwani/" target="_blank" rel="noopener noreferrer" className="btn-secondary"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">{LI}</svg>LinkedIn</a><a href="https://github.com/Pranjal0410" target="_blank" rel="noopener noreferrer" className="btn-secondary"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">{GH}</svg>GitHub</a></div></AS>
    </section>
    <ExploreSection onGuestbook={onGuestbook} onLinks={onLinks}/>
    <footer className="py-12 px-4 border-t border-white/[0.04] relative z-10"><div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-zinc-600"><div className="flex items-center gap-2"><span className="font-extrabold text-white">P<span className="shimmer-text">U</span></span><span>•</span><span>© 2025 Pranjal Udhwani</span></div><div className="flex items-center gap-5"><a href="https://github.com/Pranjal0410" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-violet-400 transition-colors" aria-label="GitHub"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">{GH}</svg></a><a href="https://www.linkedin.com/in/pranjal-udhwani/" target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-violet-400 transition-colors" aria-label="LinkedIn"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">{LI}</svg></a><a href="mailto:udhwanipranjal@gmail.com" className="text-zinc-600 hover:text-violet-400 transition-colors" aria-label="Email"><svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg></a></div><div>Built with ❤️</div></div></footer>
    <a href="mailto:udhwanipranjal@gmail.com?subject=Let's%20connect" className="sticky-cta" aria-label="Email"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>Let's connect</a>
  </>)
}

export default function App() {
  const [page, setPage] = useState<'home'|'guestbook'|'links'>('home')
  useEffect(() => { window.scrollTo(0,0) }, [page])
  return <div className="min-h-screen bg-[#0b0b16] text-white antialiased overflow-x-hidden" style={{fontFamily:'var(--font-heading)'}}>{page==='home'?<MainPage onGuestbook={()=>setPage('guestbook')} onLinks={()=>setPage('links')}/>:page==='guestbook'?<Guestbook onBack={()=>setPage('home')}/>:<MyLinks onBack={()=>setPage('home')}/>}</div>
}
