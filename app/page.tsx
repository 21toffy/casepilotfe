import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Scale, Users, Brain, FileText, Calendar, Shield, Sparkles, TrendingUp, Search, Clock, Zap, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-blue-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">CasePilot</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with AI Focus */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container mx-auto text-center relative z-10">
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 border-blue-400/30 px-4 py-1 text-sm">
            <Sparkles className="h-3 w-3 mr-2" />
            AI-Powered Legal Intelligence
          </Badge>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your AI Assistant That
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Knows Your Cases Inside & Out
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
            <span className="text-blue-400 font-semibold">Rhoda AI</span> doesn't just manage your cases — 
            it researches, analyzes, and strategizes. Think beyond case management. Think intelligent legal automation.
          </p>
          <div className="flex justify-center">
            <Link href="/register">
              <Button size="lg" className="px-10 py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg shadow-blue-500/50">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span>Deep case research & analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span>Intelligent document processing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span>Real-time legal insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section className="py-20 px-4 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
              <Zap className="h-4 w-4 mr-2" />
              AI Superpowers
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-4">
              Your AI That Goes <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Beyond</span> Case Management
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Rhoda AI doesn't just store your case information — it actively researches, 
              learns from your work, and provides strategic insights that transform your practice.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all">
              <CardHeader>
                <div className="relative mb-4">
                  <Brain className="h-12 w-12 text-blue-400" />
                  <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-blue-300 animate-pulse" />
                </div>
                <CardTitle className="text-white text-xl font-bold">Intelligent Case Research</CardTitle>
                <CardDescription className="text-gray-200 mt-2 text-base">
                  Rhoda AI actively researches every aspect of your cases — 
                  similar precedents, relevant laws, case strategies, and more.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all">
              <CardHeader>
                <div className="relative mb-4">
                  <Search className="h-12 w-12 text-purple-400" />
                  <TrendingUp className="absolute -top-2 -right-2 h-6 w-6 text-purple-300 animate-pulse" />
                </div>
                <CardTitle className="text-white text-xl font-bold">Deep Document Analysis</CardTitle>
                <CardDescription className="text-gray-200 mt-2 text-base">
                  Upload any document and AI extracts, summarizes, and cross-references 
                  information automatically with your case memory.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all">
              <CardHeader>
                <div className="relative mb-4">
                  <Zap className="h-12 w-12 text-pink-400" />
                  <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-pink-300 animate-pulse" />
                </div>
                <CardTitle className="text-white text-xl font-bold">Live AI Chat Assistant</CardTitle>
                <CardDescription className="text-gray-200 mt-2 text-base">
                  Chat with Rhoda AI about your cases in real-time. Get instant answers, 
                  explanations, and strategic advice with full context awareness.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all">
              <CardHeader>
                <div className="relative mb-4">
                  <TrendingUp className="h-12 w-12 text-cyan-400" />
                  <Clock className="absolute -top-2 -right-2 h-6 w-6 text-cyan-300 animate-pulse" />
                </div>
                <CardTitle className="text-white text-xl font-bold">Predictive Insights</CardTitle>
                <CardDescription className="text-gray-200 mt-2 text-base">
                  AI learns from your case patterns and provides predictive analytics, 
                  risk assessments, and success probability estimates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all">
              <CardHeader>
                <div className="relative mb-4">
                  <FileText className="h-12 w-12 text-green-400" />
                  <CheckCircle2 className="absolute -top-2 -right-2 h-6 w-6 text-green-300 animate-pulse" />
                </div>
                <CardTitle className="text-white text-xl font-bold">Auto-Strategy Generation</CardTitle>
                <CardDescription className="text-gray-200 mt-2 text-base">
                  Based on case facts, AI generates detailed strategies, action plans, 
                  and recommendations tailored to your specific situation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all">
              <CardHeader>
                <div className="relative mb-4">
                  <Users className="h-12 w-12 text-orange-400" />
                  <Shield className="absolute -top-2 -right-2 h-6 w-6 text-orange-300 animate-pulse" />
                </div>
                <CardTitle className="text-white text-xl font-bold">Team Collaboration AI</CardTitle>
                <CardDescription className="text-gray-200 mt-2 text-base">
                  AI facilitates seamless collaboration, tracks team progress, 
                  suggests task assignments, and ensures nothing falls through the cracks.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section with AI Focus */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90" />
        <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        
        <div className="container mx-auto text-center relative z-10">
          <div className="mb-8">
            <Sparkles className="h-16 w-16 text-white mx-auto mb-4 animate-pulse" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Let Rhoda AI Transform
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Your Legal Practice
            </span>
          </h2>
          <p className="text-2xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Join forward-thinking law firms that are leveraging AI to research better, 
            analyze deeper, and win more cases.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="px-12 py-7 text-xl bg-white text-blue-600 hover:bg-gray-100 shadow-2xl font-semibold">
                <Sparkles className="mr-3 h-6 w-6" />
                Start Free Trial
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-300" />
              <span className="text-lg">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-300" />
              <span className="text-lg">14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-300" />
              <span className="text-lg">Full AI features included</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/10 py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-semibold text-white">CasePilot</span>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">Powered by AI</Badge>
            </div>
            <p className="text-gray-400 text-center">© 2024 CasePilot. All rights reserved. Built with ❤️ for legal professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
