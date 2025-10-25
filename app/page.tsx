import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Brain, Sparkles, Target, BarChart3, Volume2, Focus } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center shadow-lg">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MentorVerse
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Features
            </Link>
            <Link
              href="#accessibility"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Accessibility
            </Link>
            <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hover-lift">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 gradient-bg">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-primary text-sm font-medium hover-lift">
            <Sparkles className="h-4 w-4" />
            <span>Designed for Neurodivergent Learners</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight text-balance">
            Your AI Study Companion for{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              CS Success
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed text-pretty max-w-3xl mx-auto">
            Master computer science concepts and ace your interviews with adaptive AI mentorship designed specifically
            for ADHD, Autism, and Dyslexia.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg glow-effect"
              asChild
            >
              <Link href="/signup">Start Learning Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover-lift bg-transparent" asChild>
              <Link href="#features">Explore Features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Comprehensive tools designed with accessibility and focus in mind
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4 hover-lift border-border/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">Study Practice</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI-generated questions across data structures, algorithms, and system design with adaptive difficulty.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover-lift border-border/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
                <Brain className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">AI Mentor Chat</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get instant explanations, hints, and guidance from your personal AI mentor powered by Gemini.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover-lift border-border/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-chart-3/20 to-chart-3/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-chart-3" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">Mock Interviews</h3>
              <p className="text-muted-foreground leading-relaxed">
                Practice technical interviews with AI-powered feedback and performance analysis.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover-lift border-border/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-chart-4/20 to-chart-4/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-chart-4" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">Progress Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Visualize your learning journey with detailed analytics and achievement milestones.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover-lift border-border/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-chart-5/20 to-chart-5/10 flex items-center justify-center">
                <Volume2 className="h-6 w-6 text-chart-5" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">Voice Narration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Listen to questions and explanations with natural voice synthesis via ElevenLabs.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover-lift border-border/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
                <Focus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">Focus Mode</h3>
              <p className="text-muted-foreground leading-relaxed">
                Minimize distractions with Pomodoro timers and customizable focus environments.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Accessibility Section */}
      <section id="accessibility" className="container mx-auto px-4 py-20 gradient-bg">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              Built for Neurodivergent Minds
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Every feature is designed with ADHD, Autism, and Dyslexia in mind
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 space-y-4 hover-lift border-border/50">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold text-center text-foreground">ADHD Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Pomodoro timer integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Focus mode with minimal distractions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Progress gamification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Break reminders</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 space-y-4 hover-lift border-border/50">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center mx-auto">
                <span className="text-3xl">🧩</span>
              </div>
              <h3 className="text-2xl font-semibold text-center text-foreground">Autism Friendly</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-1">•</span>
                  <span>Consistent, predictable layouts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-1">•</span>
                  <span>Reduced motion options</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-1">•</span>
                  <span>Clear visual hierarchy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary mt-1">•</span>
                  <span>Sensory-friendly themes</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 space-y-4 hover-lift border-border/50">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-chart-3/20 to-chart-3/10 flex items-center justify-center mx-auto">
                <span className="text-3xl">📖</span>
              </div>
              <h3 className="text-2xl font-semibold text-center text-foreground">Dyslexia Tools</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-chart-3 mt-1">•</span>
                  <span>Read-aloud functionality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-chart-3 mt-1">•</span>
                  <span>Dyslexia-friendly fonts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-chart-3 mt-1">•</span>
                  <span>Cream mode for reduced glare</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-chart-3 mt-1">•</span>
                  <span>Adjustable text spacing</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto text-center space-y-8 p-12 glass-effect border-border/50">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-muted-foreground text-pretty">
            Join thousands of students who are mastering CS with MentorVerse
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity shadow-lg glow-effect"
            asChild
          >
            <Link href="/signup">Start Your Journey Today</Link>
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 glass-effect mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  MentorVerse
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered study platform designed for neurodivergent learners.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-primary transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#accessibility" className="hover:text-primary transition-colors">
                    Accessibility
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-primary transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/docs" className="hover:text-primary transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-primary transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-primary transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 MentorVerse. Built with accessibility in mind.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
