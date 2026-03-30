import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Settings2,
  Volume2,
  VolumeX,
  Timer,
  Coffee,
  History,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppContext } from "@/hooks/useAppContext";

const PomodoroTimer = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } =
    useAppContext();
  useEffect(() => {
    const title = "Pomodoro Timer | EnableFlow";
    const description =
      "Focus with configurable Pomodoro work and break sessions. Track completed sessions with simple controls and gentle sound cues.";
    setMetaDescription(description);
    const keywords =
      "Pomodoro timer,focus timer,productivity,work sessions,break timer";
    setMetaKeywords(keywords);
    const origin = window.location.origin || "";
    const canonicalHref = `${origin}/tools/pomodoro-timer`;
    setCanonicalUrl(canonicalHref);
    document.title = title;
    const head = document.head;
    const breadcrumbJson = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: "Pomodoro Timer",
          item: canonicalHref,
        },
      ],
    };
    const webPageJson = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description: description,
      url: canonicalHref,
    };
    const addJsonLd = (json: Record<string, unknown>) => {
      const s = document.createElement("script");
      s.setAttribute("type", "application/ld+json");
      s.textContent = JSON.stringify(json);
      head.appendChild(s);
      return s;
    };
    const s1 = addJsonLd(breadcrumbJson);
    const s2 = addJsonLd(webPageJson);
    const faqJson = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the Pomodoro technique?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A productivity method that alternates focused work sessions with short breaks, typically 25 minutes work and 5 minutes break.",
          },
        },
        {
          "@type": "Question",
          name: "Can I change work and break durations?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Use the settings to adjust work and break lengths to suit your routine.",
          },
        },
        {
          "@type": "Question",
          name: "Are there sound alerts?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Gentle tones indicate start and end of sessions. You can toggle sounds on or off.",
          },
        },
      ],
    };
    const s3 = addJsonLd(faqJson);
    return () => {
      s1.remove();
      s2.remove();
      s3.remove();
    };
  }, []);

  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [sessions, setSessions] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }
  };

  const playSound = useCallback(
    (type: "start" | "end") => {
      if (!soundEnabled) return;
      initAudio();
      const ctx = audioContextRef.current;
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === "start") {
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(523.25, now);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
      } else {
        oscillator.type = "triangle";
        const beepDuration = 0.2;
        const pauseDuration = 0.1;
        for (let i = 0; i < 3; i++) {
          const startTime = now + i * (beepDuration + pauseDuration);
          oscillator.frequency.setValueAtTime(880, startTime);
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
          gainNode.gain.linearRampToValueAtTime(0, startTime + beepDuration);
        }
        oscillator.start(now);
        oscillator.stop(now + 3 * (beepDuration + pauseDuration));
      }
    },
    [soundEnabled],
  );

  const maxTime = mode === "work" ? workDuration * 60 : breakDuration * 60;

  const resetTimer = useCallback(
    (newMode?: "work" | "break") => {
      const targetMode = newMode || mode;
      setIsRunning(false);
      setTimeLeft(
        targetMode === "work" ? workDuration * 60 : breakDuration * 60,
      );
    },
    [mode, workDuration, breakDuration],
  );

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(mode === "work" ? workDuration * 60 : breakDuration * 60);
    }
  }, [workDuration, breakDuration, mode, isRunning]);

  const toggleTimer = () => {
    initAudio();
    if (!isRunning) {
      playSound("start");
    }
    setIsRunning(!isRunning);
  };

  const switchMode = (newMode: "work" | "break") => {
    setMode(newMode);
    resetTimer(newMode);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      playSound("end");
      setIsRunning(false);
      if (mode === "work") {
        setSessions((prev) => prev + 1);
        setMode("break");
        setTimeLeft(breakDuration * 60);
      } else {
        setMode("work");
        setTimeLeft(workDuration * 60);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, breakDuration, workDuration, playSound]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = maxTime > 0 ? ((maxTime - timeLeft) / maxTime) * 100 : 0;
  const totalFocusTime = sessions * workDuration;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-[1400px]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Tools
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Pomodoro Timer
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Boost your productivity with the Pomodoro technique. A simple,
                configurable timer for focus and breaks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* LEFT: Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b bg-slate-50/50">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-primary" />
                    Controls & Settings
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Customize your Pomodoro sessions
                  </p>
                </div>

                <div className="p-6 space-y-8">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">
                      Timer Mode
                    </label>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => switchMode("work")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase font-bold rounded-lg transition-all ${
                          mode === "work"
                            ? "bg-white shadow-sm text-primary"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <Timer className="h-4 w-4" />
                        Focus
                      </button>
                      <button
                        onClick={() => switchMode("break")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase font-bold rounded-lg transition-all ${
                          mode === "break"
                            ? "bg-white shadow-sm text-primary"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        <Coffee className="h-4 w-4" />
                        Break
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="work-duration" className="font-semibold">
                        Work Duration
                      </Label>
                      <span className="text-sm font-medium text-muted-foreground">
                        {workDuration} min
                      </span>
                    </div>
                    <Slider
                      id="work-duration"
                      value={[workDuration]}
                      onValueChange={(v) => setWorkDuration(v[0])}
                      min={1}
                      max={60}
                      step={1}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="break-duration" className="font-semibold">
                        Break Duration
                      </Label>
                      <span className="text-sm font-medium text-muted-foreground">
                        {breakDuration} min
                      </span>
                    </div>
                    <Slider
                      id="break-duration"
                      value={[breakDuration]}
                      onValueChange={(v) => setBreakDuration(v[0])}
                      min={1}
                      max={30}
                      step={1}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Label
                      htmlFor="sound-switch"
                      className="font-semibold flex items-center gap-2"
                    >
                      {soundEnabled ? (
                        <Volume2 className="h-4 w-4" />
                      ) : (
                        <VolumeX className="h-4 w-4" />
                      )}
                      Sound
                    </Label>
                    <Switch
                      id="sound-switch"
                      checked={soundEnabled}
                      onCheckedChange={setSoundEnabled}
                    />
                  </div>

                  <Button
                    onClick={() => resetTimer()}
                    variant="outline"
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Timer
                  </Button>
                </div>
              </div>
            </div>

            {/* RIGHT: Timer Display & Stats */}
            <div className="lg:col-span-7 space-y-8">
              <div
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${isRunning ? "shadow-primary/20" : ""}`}
              >
                <div className="p-8 flex flex-col items-center justify-center gap-8">
                  <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                    <svg
                      className="absolute inset-0 w-full h-full -rotate-90"
                      viewBox="0 0 200 200"
                    >
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-slate-100"
                      />
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 90}
                        strokeDashoffset={
                          2 * Math.PI * 90 * (1 - progress / 100)
                        }
                        className={`transition-all duration-1000 ${mode === "work" ? "text-primary" : "text-blue-500"}`}
                      />
                    </svg>
                    <div className="flex flex-col items-center z-10">
                      <span className="text-6xl md:text-7xl font-bold tabular-nums tracking-tight text-slate-900">
                        {formatTime(timeLeft)}
                      </span>
                      <span className="text-slate-400 font-medium mt-2 uppercase tracking-widest text-sm">
                        {mode === "work" ? "Focus Time" : "On a Break"}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className={`h-20 w-20 rounded-full shadow-lg transition-all duration-300 ${
                      isRunning
                        ? "bg-slate-800 hover:bg-slate-700"
                        : "bg-primary hover:bg-primary/90"
                    }`}
                    onClick={toggleTimer}
                  >
                    {isRunning ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <History className="h-5 w-5 text-slate-500" />
                    Session Stats
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-2 gap-6 text-center">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-muted-foreground font-medium">
                      Sessions Completed
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {sessions}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-muted-foreground font-medium">
                      Total Focus Time
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {totalFocusTime}{" "}
                      <span className="text-lg font-medium">min</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">
            <section className="bg-white border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                About this tool
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                The Pomodoro Timer helps you manage your time and stay focused
                by breaking down work into manageable intervals. This technique
                is proven to increase productivity and reduce burnout.
              </p>
              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Key Features
                  </h3>
                  <ul className="mt-3 space-y-2 text-muted-foreground text-sm list-disc list-inside">
                    <li>Adjustable work and break timers</li>
                    <li>Clean, distraction-free interface</li>
                    <li>Audio cues for session start and end</li>
                    <li>Tracks completed sessions and total focus time</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-white border rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-foreground">
                    What is the Pomodoro technique?
                  </h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    A focus method alternating work blocks (typically 25 mins)
                    with short breaks (5 mins) to improve concentration and
                    prevent mental fatigue.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    Can I change the timer durations?
                  </h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    Yes. Use the sliders in the "Controls & Settings" panel to
                    adjust the length of your focus and break sessions to fit
                    your workflow.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">
                    Do I need to keep the tab open?
                  </h3>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    Yes, the timer runs in your browser, so the tab must remain
                    open for it to function correctly.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PomodoroTimer;
