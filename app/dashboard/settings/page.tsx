"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Volume2, Focus, Eye, Type, Palette, Clock, Brain, Sparkles, Mail, ExternalLink } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  
  // Load settings from localStorage on mount
  const [voiceNarration, setVoiceNarration] = useState(false)
  const [soundEffects, setSoundEffects] = useState(true)
  const [pomodoroTimer, setPomodoroTimer] = useState(false)
  const [breakReminders, setBreakReminders] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [dyslexiaFont, setDyslexiaFont] = useState(false)
  const [increasedSpacing, setIncreasedSpacing] = useState(false)
  const [fontSize, setFontSize] = useState([16])
  const [focusDuration, setFocusDuration] = useState([25])
  const [showEmailSetup, setShowEmailSetup] = useState(false)
  const [voiceSpeed, setVoiceSpeed] = useState("normal")
  const [layoutMode, setLayoutMode] = useState("consistent")
  const [sessionLength, setSessionLength] = useState("30")
  const [breakDuration, setBreakDuration] = useState("5")

  // Load settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('accessibility-settings')
        if (saved) {
          const settings = JSON.parse(saved)
          setVoiceNarration(settings.voiceNarration ?? false)
          setSoundEffects(settings.soundEffects ?? true)
          setPomodoroTimer(settings.pomodoroTimer ?? false)
          setBreakReminders(settings.breakReminders ?? true)
          setReducedMotion(settings.reducedMotion ?? false)
          setHighContrast(settings.highContrast ?? false)
          setDyslexiaFont(settings.dyslexiaFont ?? false)
          setIncreasedSpacing(settings.increasedSpacing ?? false)
          setFontSize(settings.fontSize ?? [16])
          setFocusDuration(settings.focusDuration ?? [25])
          setVoiceSpeed(settings.voiceSpeed ?? "normal")
          setLayoutMode(settings.layoutMode ?? "consistent")
          setSessionLength(settings.sessionLength ?? "30")
          setBreakDuration(settings.breakDuration ?? "5")
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
    loadSettings()
  }, [])

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement
    
    // Apply dyslexia font
    if (dyslexiaFont) {
      root.style.setProperty('--font-family', '"OpenDyslexic", -apple-system, sans-serif')
    } else {
      root.style.removeProperty('--font-family')
    }

    // Apply increased spacing
    if (increasedSpacing) {
      root.style.setProperty('--line-height', '1.8')
      root.style.setProperty('--letter-spacing', '0.05em')
    } else {
      root.style.removeProperty('--line-height')
      root.style.removeProperty('--letter-spacing')
    }

    // Apply font size
    root.style.setProperty('--base-font-size', `${fontSize[0]}px`)

    // Apply reduced motion
    if (reducedMotion) {
      root.style.setProperty('--transition-duration', '0ms')
      root.classList.add('reduce-motion')
    } else {
      root.style.removeProperty('--transition-duration')
      root.classList.remove('reduce-motion')
    }

    // Apply high contrast
    if (highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
  }, [dyslexiaFont, increasedSpacing, fontSize, reducedMotion, highContrast])

  const handleSaveSettings = () => {
    try {
      const settings = {
        voiceNarration,
        soundEffects,
        pomodoroTimer,
        breakReminders,
        reducedMotion,
        highContrast,
        dyslexiaFont,
        increasedSpacing,
        fontSize,
        focusDuration,
        voiceSpeed,
        layoutMode,
        sessionLength,
        breakDuration,
        savedAt: new Date().toISOString()
      }
      
      localStorage.setItem('accessibility-settings', JSON.stringify(settings))
      
      // Show success feedback
      const button = document.querySelector('[data-save-button]') as HTMLButtonElement
      if (button) {
        const originalText = button.textContent
        button.textContent = '✓ Saved!'
        button.disabled = true
        setTimeout(() => {
          button.textContent = originalText
          button.disabled = false
        }, 2000)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings. Please try again.')
    }
  }

  const webhookUrl =
    typeof window !== "undefined" ? `${window.location.origin}/api/email-webhook` : "/api/email-webhook"

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Accessibility Settings</h1>
        <p className="text-lg text-muted-foreground">
          Customize your learning experience for optimal comfort and focus
        </p>
      </div>

      {/* Neurodivergent-Friendly Features Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Brain className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold">Designed for Neurodivergent Learners</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                MentorVerse includes features specifically designed for ADHD, Autism, and Dyslexia. Customize these
                settings to create your ideal learning environment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Forwarding Setup Section */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Email Forwarding Setup</CardTitle>
                <CardDescription>Configure automatic interview scheduling from emails</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowEmailSetup(!showEmailSetup)}>
              {showEmailSetup ? "Hide" : "Show"} Setup
            </Button>
          </div>
        </CardHeader>
        {showEmailSetup && (
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-lg border space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    1
                  </span>
                  Webhook Endpoint
                </h4>
                <p className="text-xs text-muted-foreground">
                  Use this URL to configure your email service to forward interview emails
                </p>
                <div className="flex gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded text-xs font-mono break-all">{webhookUrl}</code>
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(webhookUrl)}>
                    Copy
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-background rounded-lg border space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    2
                  </span>
                  Choose Your Email Service
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">SendGrid Inbound Parse</p>
                      <Button size="sm" variant="ghost" asChild>
                        <a
                          href="https://docs.sendgrid.com/for-developers/parsing-email/setting-up-the-inbound-parse-webhook"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Configure inbound parse to POST to the webhook URL above
                    </p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Mailgun Routes</p>
                      <Button size="sm" variant="ghost" asChild>
                        <a
                          href="https://documentation.mailgun.com/en/latest/user_manual.html#routes"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Create a route to forward emails to the webhook URL</p>
                  </div>

                  <div className="p-3 bg-muted/50 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">AWS SES</p>
                      <Button size="sm" variant="ghost" asChild>
                        <a
                          href="https://docs.aws.amazon.com/ses/latest/dg/receiving-email-action-lambda.html"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Set up receipt rules to invoke the webhook</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-background rounded-lg border space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    3
                  </span>
                  Test Your Setup
                </h4>
                <p className="text-xs text-muted-foreground">
                  Forward a test interview email to verify the integration is working correctly
                </p>
                <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                  <a href="/dashboard/mentor">Go to AI Mentor to Test</a>
                </Button>
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg space-y-2">
              <p className="text-xs font-medium text-yellow-600">Note</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Email forwarding requires setting up a third-party email service. Once configured, interview invitations
                will be automatically parsed and added to your schedule.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Audio Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Audio Settings</CardTitle>
                <CardDescription>Voice narration and sound preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="voice-narration" className="flex flex-col gap-1 cursor-pointer">
                <span>Voice Narration</span>
                <span className="text-sm font-normal text-muted-foreground">Read questions and feedback aloud</span>
              </Label>
              <Switch id="voice-narration" checked={voiceNarration} onCheckedChange={setVoiceNarration} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-effects" className="flex flex-col gap-1 cursor-pointer">
                <span>Sound Effects</span>
                <span className="text-sm font-normal text-muted-foreground">Enable audio feedback for actions</span>
              </Label>
              <Switch id="sound-effects" checked={soundEffects} onCheckedChange={setSoundEffects} />
            </div>
            <div className="space-y-3">
              <Label>Voice Speed</Label>
              <Select value={voiceSpeed} onValueChange={setVoiceSpeed}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Focus Mode - ADHD Support */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Focus className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <CardTitle>Focus Mode (ADHD Support)</CardTitle>
                <CardDescription>Minimize distractions and manage time</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="pomodoro" className="flex flex-col gap-1 cursor-pointer">
                <span>Pomodoro Timer</span>
                <span className="text-sm font-normal text-muted-foreground">Structured focus sessions</span>
              </Label>
              <Switch id="pomodoro" checked={pomodoroTimer} onCheckedChange={setPomodoroTimer} />
            </div>
            <div className="space-y-3">
              <Label>Focus Duration (minutes)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={focusDuration}
                  onValueChange={setFocusDuration}
                  min={15}
                  max={60}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-12 text-right">{focusDuration[0]} min</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="break-reminders" className="flex flex-col gap-1 cursor-pointer">
                <span>Break Reminders</span>
                <span className="text-sm font-normal text-muted-foreground">Gentle reminders to take breaks</span>
              </Label>
              <Switch id="break-reminders" checked={breakReminders} onCheckedChange={setBreakReminders} />
            </div>
          </CardContent>
        </Card>

        {/* Visual Settings - Autism Support */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle>Visual Settings (Autism Support)</CardTitle>
                <CardDescription>Display and motion preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion" className="flex flex-col gap-1 cursor-pointer">
                <span>Reduced Motion</span>
                <span className="text-sm font-normal text-muted-foreground">Minimize animations and transitions</span>
              </Label>
              <Switch id="reduced-motion" checked={reducedMotion} onCheckedChange={setReducedMotion} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast" className="flex flex-col gap-1 cursor-pointer">
                <span>High Contrast Mode</span>
                <span className="text-sm font-normal text-muted-foreground">Increase color contrast for clarity</span>
              </Label>
              <Switch id="high-contrast" checked={highContrast} onCheckedChange={setHighContrast} />
            </div>
            <div className="space-y-3">
              <Label>Layout Consistency</Label>
              <Select value={layoutMode} onValueChange={setLayoutMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consistent">Always Consistent</SelectItem>
                  <SelectItem value="adaptive">Adaptive</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Consistent layouts reduce cognitive load</p>
            </div>
          </CardContent>
        </Card>

        {/* Reading Settings - Dyslexia Support */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <Type className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <CardTitle>Reading Settings (Dyslexia Support)</CardTitle>
                <CardDescription>Typography and text preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="dyslexia-font" className="flex flex-col gap-1 cursor-pointer">
                <span>Dyslexia-Friendly Font</span>
                <span className="text-sm font-normal text-muted-foreground">Use OpenDyslexic typeface</span>
              </Label>
              <Switch id="dyslexia-font" checked={dyslexiaFont} onCheckedChange={setDyslexiaFont} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="increased-spacing" className="flex flex-col gap-1 cursor-pointer">
                <span>Increased Line Spacing</span>
                <span className="text-sm font-normal text-muted-foreground">More space between lines</span>
              </Label>
              <Switch id="increased-spacing" checked={increasedSpacing} onCheckedChange={setIncreasedSpacing} />
            </div>
            <div className="space-y-3">
              <Label>Font Size</Label>
              <div className="flex items-center gap-4">
                <Slider value={fontSize} onValueChange={setFontSize} min={12} max={24} step={1} className="flex-1" />
                <span className="text-sm font-medium w-12 text-right">{fontSize[0]}px</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-chart-5/10 flex items-center justify-center">
                <Palette className="h-5 w-5 text-chart-5" />
              </div>
              <div>
                <CardTitle>Theme & Colors</CardTitle>
                <CardDescription>Choose your preferred color scheme</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Color Theme</Label>
              <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <p className="text-sm font-medium">Current Theme: {theme}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {theme === "dark"
                  ? "Dark mode reduces eye strain in low-light environments"
                  : theme === "light"
                    ? "Light mode provides clear contrast for daytime use"
                    : "Automatically switches between light and dark based on your system preferences"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Time Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Time Management</CardTitle>
                <CardDescription>Session and reminder preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Default Session Length</Label>
              <Select value={sessionLength} onValueChange={setSessionLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Break Duration</Label>
              <Select value={breakDuration} onValueChange={setBreakDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Your settings are automatically saved</p>
                <p className="text-xs text-muted-foreground">
                  Changes take effect immediately and sync across all your devices
                </p>
              </div>
            </div>
            <Button onClick={handleSaveSettings} size="lg" data-save-button>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Resources</CardTitle>
          <CardDescription>Learn more about our neurodivergent-friendly features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">ADHD Support</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pomodoro timers, break reminders, and focus mode help manage attention and time
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Autism Support</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Reduced motion, consistent layouts, and predictable patterns reduce sensory overload
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Dyslexia Support</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dyslexia-friendly fonts, increased spacing, and cream mode improve reading comfort
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
