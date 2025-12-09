'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {
  ArrowDown,
  Search,
  PenTool,
  Code2,
  ShieldCheck,
  Rocket,
  Cpu,
  Users,
  Zap,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  FileText,
  Shield,
  Menu,
  X,
  LogIn,
  UserPlus
} from 'lucide-react'
import { ComingSoonModal } from '@/components/coming-soon-modal'
import { AUTH_ENABLED } from '@/lib/auth-config'

gsap.registerPlugin(ScrollTrigger)

function SignInSignUpButtons() {
  const [showModal, setShowModal] = useState(false)

  // If auth is disabled, show coming soon modal
  if (!AUTH_ENABLED) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="font-mono text-xs uppercase tracking-widest hover:text-design-accent transition-colors pointer-events-auto flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white/10 border border-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors duration-200 pointer-events-auto flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Sign Up
        </button>
        <ComingSoonModal open={showModal} onOpenChange={setShowModal} />
      </>
    )
  }

  // If auth is enabled, show actual links
  return (
    <>
      <Link
        href="/login"
        className="font-mono text-xs uppercase tracking-widest hover:text-design-accent transition-colors pointer-events-auto flex items-center gap-2"
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </Link>
      <Link
        href="/register"
        className="bg-white/10 border border-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors duration-200 pointer-events-auto flex items-center gap-2"
      >
        <UserPlus className="w-4 h-4" />
        Sign Up
      </Link>
    </>
  )
}

export default function HomePage() {
  const [loaderProgress, setLoaderProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeStep, setActiveStep] = useState(1)
  const [terminalInput, setTerminalInput] = useState('')
  const [terminalOutput, setTerminalOutput] = useState([
    { type: 'system', content: 'System online. Try asking: "What can Rhoda AI do?"' }
  ])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cursorDotRef = useRef<HTMLDivElement>(null)
  const cursorCircleRef = useRef<HTMLDivElement>(null)
  const terminalBodyRef = useRef<HTMLDivElement>(null)
  const loaderRef = useRef<HTMLDivElement>(null)

  // Initialize Lenis and GSAP
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.7,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  // Loader Animation
  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => setIsLoaded(true)
    })

    tl.to('#loader-progress', {
      width: '100%',
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: function () {
        setLoaderProgress(Math.round(this.progress() * 100))
      }
    })
      .to(loaderRef.current, {
        yPercent: -100,
        duration: 0.6,
        ease: 'power4.inOut',
        delay: 0.1
      })
      .to('.hero-glow', {
        opacity: 1,
        duration: 1.5,
        ease: 'power2.out'
      }, '-=0.5')
      .to('.hero-char', {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        stagger: 0.1,
        ease: 'power3.out'
      }, '-=1.0')
      .to('.hero-fade-in', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out'
      }, '-=0.8')

  }, [])

  // Scroll Animations
  useEffect(() => {
    if (!isLoaded) return

    const sections = document.querySelectorAll('section:not(:first-child)')
    sections.forEach(section => {
      gsap.from(section.querySelectorAll('h2, h3, p, .project-card, li, .anim-item'), {
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.out'
      })
    })
  }, [isLoaded])

  // Custom Cursor
  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) {
      const cursorDot = cursorDotRef.current
      const cursorCircle = cursorCircleRef.current

      let mouseX = 0, mouseY = 0
      let cursorX = 0, cursorY = 0

      const onMouseMove = (e: MouseEvent) => {
        mouseX = e.clientX
        mouseY = e.clientY
        if (cursorDot) {
          gsap.to(cursorDot, { x: mouseX, y: mouseY, duration: 0 })
        }
      }

      const onTicker = () => {
        cursorX += (mouseX - cursorX) * 0.2
        cursorY += (mouseY - cursorY) * 0.2
        if (cursorCircle) {
          cursorCircle.style.left = `${cursorX}px`
          cursorCircle.style.top = `${cursorY}px`
        }
      }

      document.addEventListener('mousemove', onMouseMove)
      gsap.ticker.add(onTicker)

      const hoverables = document.querySelectorAll('a, button, .magnetic-btn')
      hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hover-active'))
        el.addEventListener('mouseleave', () => document.body.classList.remove('hover-active'))
      })

      return () => {
        document.removeEventListener('mousemove', onMouseMove)
        gsap.ticker.remove(onTicker)
      }
    }
  }, [])

  // Magnetic Buttons
  useEffect(() => {
    const btns = document.querySelectorAll('.magnetic-btn')
    btns.forEach(btn => {
      const element = btn as HTMLElement
      element.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = element.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) * 0.2
        const y = (e.clientY - rect.top - rect.height / 2) * 0.2
        gsap.to(element, { x, y, duration: 0.2 })
      })
      element.addEventListener('mouseleave', () => {
        gsap.to(element, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' })
      })
    })
  }, [])

  // Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0, height = 0
    let particles: Particle[] = []

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number

      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = (Math.random() - 0.5) * 0.3
        this.size = Math.random() * 1.5
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        if (this.x < 0) this.x = width
        if (this.x > width) this.x = 0
        if (this.y < 0) this.y = height
        if (this.y > height) this.y = 0
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = '#cccccc'
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const resizeCanvas = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()

    for (let i = 0; i < 40; i++) {
      particles.push(new Particle())
    }

    const animateCanvas = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = 'rgba(0,0,0,0.04)'
      ctx.lineWidth = 1

      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)

          if (d < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
        particles[i].update()
        particles[i].draw()
      }
      requestAnimationFrame(animateCanvas)
    }

    animateCanvas()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  // Terminal Logic
  const handleTerminalCommand = async (cmd: string) => {
    const newOutput = [...terminalOutput, { type: 'user', content: cmd }]
    setTerminalOutput(newOutput)
    setTerminalInput('')

    // Scroll to bottom
    setTimeout(() => {
      if (terminalBodyRef.current) {
        terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
      }
    }, 10)

    // Simulate processing
    setTerminalOutput(prev => [...prev, { type: 'processing', content: 'Processing...' }])

    await new Promise(r => setTimeout(r, 600))

    setTerminalOutput(prev => prev.filter(item => item.type !== 'processing'))

    let response = "I can provide info on lawcentrai's features, pricing, or technology."
    const lCmd = cmd.toLowerCase()

    if (lCmd.includes('features') || lCmd.includes('what')) {
      response = "lawcentrai offers: Intelligent Case Research, Deep Document Analysis, Predictive Insights, and Automated Strategy Generation."
    } else if (lCmd.includes('pricing') || lCmd.includes('cost')) {
      response = "We offer flexible plans starting with a 14-day free trial. Contact sales for enterprise pricing."
    } else if (lCmd.includes('tech') || lCmd.includes('ai')) {
      response = "Powered by advanced LLMs and vector databases for precise legal context retrieval and reasoning."
    } else if (lCmd.includes('contact') || lCmd.includes('support')) {
      response = "Contact us at support@lawcentrai.com or book a demo."
    }

    setTerminalOutput(prev => [...prev, { type: 'system', content: response }])

    setTimeout(() => {
      if (terminalBodyRef.current) {
        terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight
      }
    }, 10)
  }

  return (
    <div className="overflow-x-hidden w-full font-sans bg-design-off-white text-design-primary">
      <div className="noise-overlay fixed top-0 left-0 w-full h-full pointer-events-none z-50 opacity-60 mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Loader */}
      <div ref={loaderRef} className="loader fixed inset-0 z-[10000] bg-[#111111] flex justify-center items-center text-[#F5F5F5]">
        <div className="flex flex-col items-center gap-4">
          <div className="font-mono text-6xl md:text-8xl font-bold tracking-tighter">
            {loaderProgress}%
            </div>
          <div className="w-32 h-[1px] bg-gray-800 relative overflow-hidden">
            <div id="loader-progress" className="absolute inset-0 bg-design-accent w-0"></div>
          </div>
        </div>
      </div>

      {/* Custom Cursor */}
      <div ref={cursorDotRef} className="cursor-dot hidden md:block fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[9999] mix-blend-exclusion -translate-x-1/2 -translate-y-1/2"></div>
      <div ref={cursorCircleRef} className="cursor-circle hidden md:block fixed top-0 left-0 w-8 h-8 border border-white rounded-full pointer-events-none z-[9999] mix-blend-exclusion -translate-x-1/2 -translate-y-1/2 transition-[width,height,background-color] duration-200"></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full px-4 md:px-6 py-5 flex justify-between items-center z-50 mix-blend-difference text-white pointer-events-none">
        <Link href="/" className="uppercase hover:text-design-accent transition-colors pointer-events-auto text-sm font-semibold tracking-widest font-mono">
          lawcentrai
          <br />
        </Link>
        <div className="flex items-center gap-4 md:gap-10 pointer-events-auto">
          <div className="hidden md:flex bg-white/10 border-white/10 border rounded-full pt-2 pr-6 pb-2 pl-6 backdrop-blur-md gap-x-8">
            <Link href="#features" className="font-mono text-xs uppercase tracking-widest hover:text-design-accent transition-colors">
              Features
            </Link>
            <Link href="#about" className="font-mono text-xs uppercase tracking-widest hover:text-design-accent transition-colors">
              About
            </Link>
            <Link href="#ai" className="font-mono text-xs uppercase tracking-widest hover:text-design-accent transition-colors">
              AI
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <SignInSignUpButtons />
            <Link href="#contact" className="bg-white text-black px-5 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-widest hover:bg-design-accent hover:text-white transition-colors duration-200 magnetic-btn shadow-lg">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col md:px-6 md:pt-0 overflow-hidden pt-20 pr-4 pl-4 relative items-center justify-center">
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"></canvas>

        <div className="hero-glow absolute w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(235,58,20,0.08)_0%,rgba(255,255,255,0)_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[-1] rounded-full blur-[60px] opacity-0"></div>
        
        <div className="flex flex-col text-center w-full max-w-[1800px] z-10 mx-auto relative items-center">
          <div className="mb-8 md:mb-12 flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/20 shadow-sm opacity-0 hero-fade-in translate-y-5">
            <div className="flex gap-1 h-3 items-center">
              <span className="w-1 h-full bg-design-accent rounded-full animate-[pulse_1s_ease-in-out_infinite]"></span>
              <span className="w-1 h-2/3 bg-design-accent rounded-full animate-[pulse_1.2s_ease-in-out_infinite]"></span>
              <span className="w-1 h-full bg-design-accent rounded-full animate-[pulse_0.8s_ease-in-out_infinite]"></span>
            </div>
            <span className="font-mono text-[10px] md:text-xs uppercase tracking-widest text-design-primary font-medium">
              AI Legal Assistant
            </span>
          </div>

          <h1 className="text-[14vw] md:text-[11vw] leading-[0.85] text-design-primary uppercase flex flex-col items-center font-bold tracking-tighter mix-blend-darken select-none z-20 relative">
            <div className="overflow-hidden">
              <span className="hero-char inline-block opacity-0 blur-sm translate-y-5">
                lawcentrai
              </span>
            </div>
            <div className="overflow-hidden">
              <span className="hero-char inline-block opacity-0 blur-sm translate-y-5">
                Legal Intelligence
              </span>
            </div>
          </h1>

          <div className="mt-8 md:mt-12 max-w-xl mx-auto opacity-0 hero-fade-in translate-y-5">
            <p className="text-design-secondary leading-relaxed text-balance text-lg md:text-2xl font-medium max-w-2xl mt-8 tracking-tight">
              We help law firms and legal professionals build scalable, digital practices with AI-powered insights.
          </p>
          </div>

          <div className="mt-10 md:mt-14 flex gap-4 opacity-0 hero-fade-in translate-y-5">
            <Link href="#contact" className="px-8 py-4 bg-[#0f0f0f] text-white rounded-full font-mono text-xs font-bold uppercase tracking-widest hover:bg-design-accent hover:shadow-lg hover:shadow-design-accent/20 transition-all duration-300 magnetic-btn">
              Start Free Trial
            </Link>
            <Link href="#features" className="px-8 py-4 border border-black/10 bg-white/50 backdrop-blur-sm rounded-full font-mono text-xs font-bold uppercase tracking-widest hover:bg-white hover:shadow-lg transition-all duration-300 magnetic-btn">
              Explore Features
            </Link>
          </div>
        </div>
          
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 hero-fade-in animate-bounce translate-y-5">
          <ArrowDown className="w-5 h-5 text-design-secondary/50" />
        </div>
      </section>

      {/* Marquee Skills */}
      <div className="py-6 md:py-8 bg-design-primary text-white overflow-hidden border-y border-white/10 select-none">
        <div className="marquee-track flex whitespace-nowrap w-max animate-[marquee_40s_linear_infinite] font-mono text-xs md:text-sm uppercase tracking-[0.3em]">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex">
              <span className="mx-4 md:mx-8">Case Research</span>
              <span className="text-design-accent">•</span>
              <span className="mx-4 md:mx-8">Document Analysis</span>
              <span className="text-design-accent">•</span>
              <span className="mx-4 md:mx-8">Strategy Generation</span>
              <span className="text-design-accent">•</span>
              <span className="mx-4 md:mx-8">Predictive Insights</span>
              <span className="text-design-accent">•</span>
              <span className="mx-4 md:mx-8">Team Collaboration</span>
              <span className="text-design-accent">•</span>
              <span className="mx-4 md:mx-8">Secure Cloud</span>
              <span className="text-design-accent">•</span>
              <span className="mx-4 md:mx-8">Real-time Chat</span>
              <span className="text-design-accent">•</span>
            </div>
          ))}
        </div>
          </div>
          
      {/* Vision & Mission */}
      <section className="py-20 px-4 md:px-6 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="p-8 md:p-14 bg-[#0a0a0a] text-white border border-white/10 rounded-2xl hover:border-design-accent/50 hover:shadow-[0_0_50px_rgba(235,58,20,0.15)] transition-all duration-500 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-design-accent/20 blur-[100px] rounded-full group-hover:bg-design-accent/30 transition-all duration-500"></div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 text-white group-hover:scale-110 group-hover:bg-design-accent group-hover:text-white transition-all duration-300 relative z-10 shadow-lg border border-white/10">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 relative z-10 group-hover:text-design-accent transition-colors">
              Our Vision
            </h3>
            <div className="space-y-4 text-gray-400 relative z-10 text-lg leading-relaxed group-hover:text-gray-200 transition-colors">
              <p>
                We envision a legal landscape where technology dissolves into the background,
                leaving only intuitive, human-centric experiences. We aim to redefine legal practice
                by merging AI precision with professional expertise.
              </p>
            </div>
          </div>
          <div className="p-8 md:p-14 bg-[#0a0a0a] text-white border border-white/10 rounded-2xl hover:border-blue-500/50 hover:shadow-[0_0_50px_rgba(59,130,246,0.15)] transition-all duration-500 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full group-hover:bg-blue-500/30 transition-all duration-500"></div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 text-white group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 relative z-10 shadow-lg border border-white/10">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 relative z-10 group-hover:text-blue-400 transition-colors">
              Our Mission
            </h3>
            <div className="space-y-4 text-gray-400 relative z-10 text-lg leading-relaxed group-hover:text-gray-200 transition-colors">
              <p>
                Our mission is to empower ambitious law firms with software that is as robust as it is beautiful.
                We strip away the unnecessary to focus on impact, delivering tailored AI solutions that drive growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lifecycle / How It Works */}
      <section className="py-20 md:py-32 bg-design-bg border-t border-black/5" id="features">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter uppercase mb-6">
              How lawcentrai Works
            </h2>
            <p className="text-design-secondary max-w-3xl mx-auto text-lg">
              A transparent, intelligent process ensuring success from intake to verdict.
              We leave nothing to chance, meticulously analyzing every detail.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Steps Nav */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              {[
                { id: 1, title: 'Case Intake & Setup' },
                { id: 2, title: 'AI Analysis' },
                { id: 3, title: 'Strategy Generation' },
                { id: 4, title: 'Collaboration' },
                { id: 5, title: 'Resolution' }
              ].map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`step-btn group flex items-center gap-4 p-4 rounded-lg transition-all ${activeStep === step.id
                    ? 'bg-white border border-design-accent/20 shadow-sm'
                    : 'border border-transparent hover:bg-white hover:border-black/5'
                    }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-colors ${activeStep === step.id
                    ? 'bg-design-accent text-white'
                    : 'bg-gray-200 text-gray-500 group-hover:bg-design-accent group-hover:text-white'
                    }`}>
                    0{step.id}
                  </span>
                  <span className={`text-left font-semibold tracking-tight transition-colors ${activeStep === step.id
                    ? 'text-design-primary'
                    : 'text-design-secondary group-hover:text-design-primary'
                    }`}>
                    {step.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="lg:col-span-8 bg-white border border-black/5 rounded-2xl p-8 md:p-12 min-h-[600px] relative overflow-hidden">
              {/* Step 1 */}
              <div className={`step-content absolute inset-0 p-8 md:p-12 transition-all duration-500 ${activeStep === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
                <div className="w-12 h-12 bg-design-accent/10 text-design-accent rounded-full flex items-center justify-center mb-6">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Case Intake & Setup</h3>
                <div className="space-y-4 text-design-secondary text-lg leading-relaxed mb-8">
                  <p>
                    Begin by seamlessly onboarding your case details. Upload documents, define parties,
                    and set key dates. Our system organizes everything instantly.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-gray-50 border border-black/5 rounded-full text-xs font-mono uppercase">Document Upload</span>
                  <span className="px-3 py-1 bg-gray-50 border border-black/5 rounded-full text-xs font-mono uppercase">OCR Processing</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`step-content absolute inset-0 p-8 md:p-12 transition-all duration-500 ${activeStep === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-6">
                  <PenTool className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold mb-4">AI Analysis</h3>
                <div className="space-y-4 text-design-secondary text-lg leading-relaxed mb-8">
                  <p>
                    Rhoda AI scans your documents to extract key facts, dates, and entities.
                    It cross-references with legal databases to find relevant precedents.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-gray-50 border border-black/5 rounded-full text-xs font-mono uppercase">Fact Extraction</span>
                  <span className="px-3 py-1 bg-gray-50 border border-black/5 rounded-full text-xs font-mono uppercase">Precedent Search</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`step-content absolute inset-0 p-8 md:p-12 transition-all duration-500 ${activeStep === 3 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
                <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Strategy Generation</h3>
                <div className="space-y-4 text-design-secondary text-lg leading-relaxed mb-8">
                  <p>
                    Based on the analysis, lawcentrai suggests legal strategies, potential arguments,
                    and drafts initial motions or correspondence.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-gray-50 border border-black/5 rounded-full text-xs font-mono uppercase">Drafting</span>
                  <span className="px-3 py-1 bg-gray-50 border border-black/5 rounded-full text-xs font-mono uppercase">Risk Assessment</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className={`step-content absolute inset-0 p-8 md:p-12 transition-all duration-500 ${activeStep === 4 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
                <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Collaboration</h3>
                <div className="space-y-4 text-design-secondary text-lg leading-relaxed mb-8">
                  <p>
                    Work with your team in real-time. Assign tasks, share notes, and review AI suggestions
                    together in a secure environment.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-gray-50 border border-black/5 rounded-full text-xs font-mono uppercase">Team Chat</span>
                  <span className="px-3 py-1 bg-gray-50 border border-black/5 rounded-full text-xs font-mono uppercase">Task Management</span>
                </div>
              </div>

              {/* Step 5 */}
              <div className={`step-content absolute inset-0 p-8 md:p-12 transition-all duration-500 ${activeStep === 5 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
                <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center mb-6">
                  <Rocket className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Resolution</h3>
                <div className="space-y-4 text-secondary text-lg leading-relaxed mb-8">
                  <p>
                    Bring your case to a successful close with organized evidence, clear arguments,
                    and comprehensive reporting.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-gray-50 border border-black/5 rounded-full text-xs font-mono uppercase">Reporting</span>
                  <span className="px-3 py-1 bg-gray-50 border border-black/5 rounded-full text-xs font-mono uppercase">Archiving</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Terminal Section */}
      <section id="ai" className="bg-[#050505] text-gray-300 py-20 md:py-32 px-4 md:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:3rem_3rem] md:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20"></div>

        <div className="max-w-[1000px] mx-auto relative z-10">
          <div className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-white">
                Rhoda AI Powered
              </span>
            </div>
            <h2 className="text-3xl md:text-6xl font-semibold tracking-tighter text-white mb-4 anim-item">
              Ask Rhoda AI
            </h2>
            <p className="text-gray-400 max-w-md mx-auto font-light text-sm md:text-lg anim-item">
              Query our AI about legal concepts, case strategies, or platform capabilities.
            </p>
          </div>

          <div className="w-full bg-[#0F0F0F] border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col anim-item">
            <div className="bg-[#151515] px-4 py-3 flex items-center gap-4 border-b border-white/5 shrink-0">
              <div className="flex gap-1.5 md:gap-2">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              <div className="flex-1 text-center font-mono text-[10px] md:text-xs text-gray-500">
                rhoda-ai — node — 80x24
              </div>
            </div>
            <div className="p-4 md:p-6 font-mono text-xs md:text-base h-[350px] md:h-[400px] flex flex-col bg-black/50 backdrop-blur-sm">
              <div ref={terminalBodyRef} className="space-y-3 md:space-y-4 mb-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                {terminalOutput.map((line, i) => (
                  <div key={i} className={`${line.type === 'user' ? 'text-white' : line.type === 'processing' ? 'text-gray-500 italic' : 'text-green-400/90'}`}>
                    {line.type === 'user' ? (
                      <div><span className="text-blue-400">➜</span> <span className="text-gray-300">~ {line.content}</span></div>
                    ) : (
                      <div>
                        {line.type === 'system' && <span className="text-accent mr-2">➜</span>}
                        {line.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 md:gap-3 pt-3 border-t border-white/10 shrink-0">
                <span className="text-accent">➜</span>
                <span className="text-blue-400">~</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && terminalInput.trim() && handleTerminalCommand(terminalInput)}
                  className="bg-transparent border-none outline-none text-white w-full placeholder-gray-700 focus:placeholder-gray-600"
                  placeholder="Type your question..."
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-6 md:mt-8">
            <button onClick={() => handleTerminalCommand("What are the core features?")} className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] md:text-xs font-mono text-gray-400 transition-colors">
              "Core features?"
            </button>
            <button onClick={() => handleTerminalCommand("How much does it cost?")} className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] md:text-xs font-mono text-gray-400 transition-colors">
              "Pricing?"
            </button>
            <button onClick={() => handleTerminalCommand("Is my data secure?")} className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] md:text-xs font-mono text-gray-400 transition-colors">
              "Security?"
            </button>
          </div>
        </div>
      </section>

      {/* Selected Work / Use Cases */}
      <section id="work" className="py-20 md:py-32 bg-white">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter uppercase mb-4">
                Use Cases
          </h2>
              <p className="text-secondary">Explore how lawcentrai helps.</p>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {/* Card 1 */}
            <div className="snap-center shrink-0 w-[85vw] md:w-[600px] lg:w-[700px] group bg-white rounded-[2rem] overflow-hidden border border-black/5 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative flex items-center justify-center">
                <FileText className="w-24 h-24 text-gray-300" />
              </div>
              <div className="p-6 md:p-8 bg-white">
                <div className="flex items-center gap-3 font-mono text-[10px] md:text-xs uppercase tracking-widest text-accent mb-4">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  Litigation Support
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-3">
                  Complex Litigation
                </h3>
                <p className="text-secondary text-sm md:text-base leading-relaxed mb-6">
                  Manage thousands of documents and find the needle in the haystack with AI search.
          </p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="snap-center shrink-0 w-[85vw] md:w-[600px] lg:w-[700px] group bg-white rounded-[2rem] overflow-hidden border border-black/5 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="aspect-[16/10] overflow-hidden bg-gray-100 relative flex items-center justify-center">
                <Shield className="w-24 h-24 text-gray-300" />
              </div>
              <div className="p-6 md:p-8 bg-white">
                <div className="flex items-center gap-3 font-mono text-[10px] md:text-xs uppercase tracking-widest text-accent mb-4">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  Corporate Law
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold mb-3">
                  Contract Review
                </h3>
                <p className="text-secondary text-sm md:text-base leading-relaxed mb-6">
                  Automate contract analysis and risk assessment for faster deal closings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience & About */}
      <section id="about" className="px-4 md:px-6 py-20 md:py-32 bg-[#050505] text-white">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Sticky Left Side */}
          <div className="relative">
            <div className="lg:sticky lg:top-32">
              <div className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/10 font-mono text-[10px] text-accent uppercase tracking-widest mb-6">
                Why lawcentrai
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase mb-6 leading-none">
                Building
                <br />
                The Future of Law
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-12 max-w-lg">
                Years of legal tech experience. We understand the nuances of the legal profession and the power of modern AI.
              </p>

              <div className="mb-12">
                <h3 className="font-bold text-2xl mb-6 flex items-center gap-3">
                  <span className="w-8 h-1 bg-accent"></span>
                  Accelerate Your Practice
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="group p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/30 transition-all duration-300 cursor-pointer h-full">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                      <Zap className="text-white w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors">
                      Rapid Analysis
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Analyze cases in minutes, not days.
                    </p>
                  </div>
                  <div className="group p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent/30 transition-all duration-300 cursor-pointer h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0 shadow-lg">
                        <Users className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1 group-hover:text-pink-400 transition-colors">
                          Team Sync
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Keep everyone aligned.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Timeline */}
          <div className="space-y-12 lg:space-y-16 pt-4 lg:pl-16 lg:border-l border-white/10">
            <div className="mb-10">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-6">
                Beyond Case Management
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Traditional software just stores data. lawcentrai thinks with you.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-white group-hover:text-accent transition-colors">
                    AI First
                  </h4>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  We don't just add AI as a feature. The entire platform is built around intelligent assistance.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    Bank-Grade Security
                  </h4>
                </div>
                <p className="text-gray-400 leading-relaxed">
                  Your client data is sacred. We use top-tier encryption and security practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="px-4 md:px-6 py-20 md:py-32 bg-[#050505] text-white border-t border-white/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <div className="flex flex-col justify-between">
              <div className="mb-16">
                <p className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-accent mb-6">
                  Start The Conversation
                </p>
                <h2 className="text-5xl md:text-8xl font-semibold tracking-tighter uppercase leading-[0.9] mb-8">
                  Let's Build
                  <br />
                  Your Future.
                </h2>
                <p className="text-gray-400 text-lg md:text-xl max-w-md">
                  Ready to transform your legal practice? Start your free trial today.
                </p>
              </div>
              <div className="space-y-8">
                <a href="mailto:hello@lawcentrai.com" className="inline-flex items-center gap-4 text-2xl md:text-4xl font-light tracking-tight hover:text-accent transition-colors group">
                  <span className="border-b border-white/20 group-hover:border-accent pb-2">
                    hello@lawcentrai.com
                  </span>
                </a>
                <div className="flex gap-4">
                  <Link href="/register" className="px-6 py-3 bg-black text-white rounded-full hover:bg-accent/80 transition-all font-mono text-xs uppercase tracking-widest">
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-10 md:gap-x-20 md:gap-y-16 pt-10 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-16">
              <div>
                <h4 className="font-mono text-xs uppercase text-gray-500 tracking-widest mb-6">
                  Platform
                </h4>
                <ul className="space-y-4">
                  <li className="text-lg md:text-xl text-gray-300 hover:text-white cursor-pointer">
                    Features
                  </li>
                  <li className="text-lg md:text-xl text-gray-300 hover:text-white cursor-pointer">
                    Pricing
                  </li>
                  <li className="text-lg md:text-xl text-gray-300 hover:text-white cursor-pointer">
                    Security
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-mono text-xs uppercase text-gray-500 tracking-widest mb-6">
                  Company
                </h4>
                <ul className="space-y-4">
                  <li className="text-lg md:text-xl text-gray-300 hover:text-white cursor-pointer">
                    About Us
                  </li>
                  <li className="text-lg md:text-xl text-gray-300 hover:text-white cursor-pointer">
                    Contact
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-20 md:mt-32 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">
              © 2025 lawcentrai. All rights reserved.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-primary py-6 text-center">
        <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
          
        </p>
      </footer>
    </div>
  )
}
