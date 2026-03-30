import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Settings2,
  Volume2,
  VolumeX,
  CheckCircle2,
  MoreVertical,
  Plus,
  Trash2,
  Edit2,
  Settings,
  ChevronRight,
  ChevronLeft,
  Timer,
  Coffee,
  Layout,
  History as HistoryIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/hooks/useAppContext";

interface Task {
  id: string;
  title: string;
  estPomodoros: number;
  actPomodoros: number;
  completed: boolean;
}

interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number;
  soundEnabled: boolean;
}

const PomodoroTimer = () => {
  const { setMetaDescription, setMetaKeywords, setCanonicalUrl } =
    useAppContext();

  // --- State & Persistence ---
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem("pomodoro-settings");
    return saved
      ? JSON.parse(saved)
      : {
          workDuration: 25,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          autoStartBreaks: false,
          autoStartPomodoros: false,
          longBreakInterval: 4,
          soundEnabled: true,
        };
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("pomodoro-tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [mode, setMode] = useState<"work" | "short_break" | "long_break">(
    "work",
  );
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [pomodorosUntilLongBreak, setPomodorosUntilLongBreak] = useState(
    settings.longBreakInterval,
  );
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem("pomodoro-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("pomodoro-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // --- Meta Tags & JSON-LD ---
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
  }, [setMetaDescription, setMetaKeywords, setCanonicalUrl]);

  // --- Task Management Logic ---
  const addTask = (title: string, estPomodoros: number) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      estPomodoros,
      actPomodoros: 0,
      completed: false,
    };
    setTasks([...tasks, newTask]);
    if (!currentTaskId) setCurrentTaskId(newTask.id);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    if (currentTaskId === id)
      setCurrentTaskId(tasks.length > 1 ? tasks[0].id : null);
  };

  const clearCompletedTasks = () => {
    setTasks(tasks.filter((t) => !t.completed));
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  };

  // --- Audio Logic ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const initAudio = () => {
    if (!audioContextRef.current) {
      const AudioContextClass =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current?.state === "suspended")
      audioContextRef.current.resume();
  };

  const playSound = useCallback(
    (type: "start" | "end") => {
      if (!settings.soundEnabled) return;
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
        for (let i = 0; i < 3; i++) {
          const startTime = now + i * 0.3;
          oscillator.frequency.setValueAtTime(880, startTime);
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
          gainNode.gain.linearRampToValueAtTime(0, startTime + 0.2);
        }
        oscillator.start(now);
        oscillator.stop(now + 1);
      }
    },
    [settings.soundEnabled],
  );

  // --- Timer Logic ---
  const getCurrentDuration = useCallback(
    (m: typeof mode) => {
      switch (m) {
        case "work":
          return settings.workDuration * 60;
        case "short_break":
          return settings.shortBreakDuration * 60;
        case "long_break":
          return settings.longBreakDuration * 60;
      }
    },
    [settings],
  );

  const switchMode = useCallback(
    (newMode: typeof mode) => {
      setMode(newMode);
      setTimeLeft(getCurrentDuration(newMode));
      setIsRunning(false);
    },
    [getCurrentDuration],
  );

  const toggleTimer = () => {
    if (!isRunning) playSound("start");
    setIsRunning(!isRunning);
  };

  const skipSession = () => {
    setIsRunning(false);
    handleSessionEnd();
  };

  const handleSessionEnd = useCallback(() => {
    playSound("end");
    setIsRunning(false);

    if (mode === "work") {
      setSessions((prev) => prev + 1);
      // Increment actPomodoros for current task
      if (currentTaskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === currentTaskId
              ? { ...t, actPomodoros: t.actPomodoros + 1 }
              : t,
          ),
        );
      }

      const nextPomodorosCount = pomodorosUntilLongBreak - 1;
      if (nextPomodorosCount <= 0) {
        setMode("long_break");
        setTimeLeft(settings.longBreakDuration * 60);
        setPomodorosUntilLongBreak(settings.longBreakInterval);
        if (settings.autoStartBreaks) setIsRunning(true);
      } else {
        setPomodorosUntilLongBreak(nextPomodorosCount);
        setMode("short_break");
        setTimeLeft(settings.shortBreakDuration * 60);
        if (settings.autoStartBreaks) setIsRunning(true);
      }
    } else {
      setMode("work");
      setTimeLeft(settings.workDuration * 60);
      if (settings.autoStartPomodoros) setIsRunning(true);
    }
  }, [mode, currentTaskId, pomodorosUntilLongBreak, settings, playSound]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleSessionEnd();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, handleSessionEnd]);

  // --- Formatting & Stats ---
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = (timeLeft / getCurrentDuration(mode)) * 100;
  const currentTask = tasks.find((t) => t.id === currentTaskId);
  const totalEstPomodoros = tasks.reduce((acc, t) => acc + t.estPomodoros, 0);
  const totalActPomodoros = tasks.reduce((acc, t) => acc + t.actPomodoros, 0);
  const finishTime = new Date(
    Date.now() +
      (totalEstPomodoros - totalActPomodoros) * settings.workDuration * 60000,
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-[1000px]">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
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
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Timer Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-4">
                    <Label className="text-base font-bold">
                      Durations (minutes)
                    </Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="work">Work</Label>
                        <Input
                          id="work"
                          type="number"
                          value={settings.workDuration}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              workDuration: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="short">Short</Label>
                        <Input
                          id="short"
                          type="number"
                          value={settings.shortBreakDuration}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              shortBreakDuration: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="long">Long</Label>
                        <Input
                          id="long"
                          type="number"
                          value={settings.longBreakDuration}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              longBreakDuration: parseInt(e.target.value) || 1,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <Label className="text-base font-bold">Automation</Label>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-breaks">Auto-start Breaks</Label>
                      <Switch
                        id="auto-breaks"
                        checked={settings.autoStartBreaks}
                        onCheckedChange={(v) =>
                          setSettings({ ...settings, autoStartBreaks: v })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-work">Auto-start Pomodoros</Label>
                      <Switch
                        id="auto-work"
                        checked={settings.autoStartPomodoros}
                        onCheckedChange={(v) =>
                          setSettings({ ...settings, autoStartPomodoros: v })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="long-interval">Long Break Interval</Label>
                      <Input
                        id="long-interval"
                        className="w-20"
                        type="number"
                        value={settings.longBreakInterval}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            longBreakInterval: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="sound-toggle"
                        className="flex items-center gap-2"
                      >
                        {settings.soundEnabled ? (
                          <Volume2 className="h-4 w-4" />
                        ) : (
                          <VolumeX className="h-4 w-4" />
                        )}
                        Sound Enabled
                      </Label>
                      <Switch
                        id="sound-toggle"
                        checked={settings.soundEnabled}
                        onCheckedChange={(v) =>
                          setSettings({ ...settings, soundEnabled: v })
                        }
                      />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Timer Card */}
            <div
              className={`bg-white rounded-3xl border-2 shadow-xl overflow-hidden transition-all duration-500 ${
                mode === "work"
                  ? "border-primary/20"
                  : mode === "short_break"
                    ? "border-blue-400/20"
                    : "border-indigo-400/20"
              }`}
            >
              <div className="p-8 md:p-12 flex flex-col items-center">
                {/* Mode Switcher */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-12 w-full max-w-md">
                  {(["work", "short_break", "long_break"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => switchMode(m)}
                      className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                        mode === m
                          ? "bg-white shadow-md text-primary scale-[1.02]"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {m === "work"
                        ? "Focus"
                        : m === "short_break"
                          ? "Short Break"
                          : "Long Break"}
                    </button>
                  ))}
                </div>

                {/* Timer Display */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mb-12">
                  <svg
                    className="absolute inset-0 w-full h-full -rotate-90"
                    viewBox="0 0 200 200"
                  >
                    <circle
                      cx="100"
                      cy="100"
                      r="92"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-100"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="92"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 92}
                      strokeDashoffset={2 * Math.PI * 92 * (1 - progress / 100)}
                      className={`transition-all duration-1000 ${
                        mode === "work"
                          ? "text-primary"
                          : mode === "short_break"
                            ? "text-blue-500"
                            : "text-indigo-500"
                      }`}
                    />
                  </svg>
                  <div className="flex flex-col items-center z-10">
                    <span className="text-7xl md:text-8xl font-black tabular-nums tracking-tighter text-slate-900">
                      {formatTime(timeLeft)}
                    </span>
                    <div className="flex items-center gap-2 mt-2 text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">
                      {mode === "work" ? (
                        <>
                          <Timer className="h-3 w-3" />
                          Focusing
                        </>
                      ) : (
                        <>
                          <Coffee className="h-3 w-3" />
                          Resting
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                  <Button
                    size="lg"
                    className={`h-20 px-12 rounded-2xl text-xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 ${
                      isRunning ? "bg-slate-800" : "bg-primary"
                    }`}
                    onClick={toggleTimer}
                  >
                    {isRunning ? (
                      <span className="flex items-center gap-3">
                        <Pause className="h-6 w-6 fill-current" /> PAUSE
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        <Play className="h-6 w-6 fill-current" /> START
                      </span>
                    )}
                  </Button>

                  {isRunning && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-14 w-14 rounded-2xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                      onClick={skipSession}
                    >
                      <ChevronRight className="h-8 w-8" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Current Task Footer */}
              <div className="bg-slate-50 border-t p-6 text-center">
                <p className="text-sm font-medium text-slate-400 mb-1">
                  #{sessions + 1}
                </p>
                <h3 className="text-lg font-bold text-slate-700">
                  {currentTask ? currentTask.title : "Time to focus!"}
                </h3>
              </div>
            </div>

            {/* Task Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b-2 border-slate-200">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  Tasks
                </h2>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={clearCompletedTasks}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTasks([])}
                      className="text-red-600 font-bold"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Tasks
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Task List */}
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setCurrentTaskId(task.id)}
                    className={`group relative bg-white p-5 rounded-2xl border-2 transition-all cursor-pointer hover:border-primary/30 ${
                      currentTaskId === task.id
                        ? "border-primary ring-4 ring-primary/5"
                        : "border-transparent"
                    } ${task.completed ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTaskComplete(task.id);
                          }}
                          className={`h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all ${
                            task.completed
                              ? "bg-primary border-primary text-white"
                              : "border-slate-200 text-transparent hover:border-primary"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <span
                          className={`font-bold text-lg ${task.completed ? "line-through text-slate-400" : "text-slate-700"}`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-slate-400 font-bold tabular-nums">
                          <span className="text-slate-900 text-xl">
                            {task.actPomodoros}
                          </span>
                          <span className="mx-1">/</span>
                          <span>{task.estPomodoros}</span>
                        </div>

                        <Dialog
                          open={editingTaskId === task.id}
                          onOpenChange={(open) =>
                            !open && setEditingTaskId(null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTaskId(task.id);
                              }}
                            >
                              <Edit2 className="h-4 w-4 text-slate-400 hover:text-primary" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Task</DialogTitle>
                            </DialogHeader>
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const title = formData.get("title") as string;
                                const est =
                                  parseInt(formData.get("est") as string) || 1;
                                if (title) {
                                  updateTask(task.id, {
                                    title,
                                    estPomodoros: est,
                                  });
                                  setEditingTaskId(null);
                                }
                              }}
                              className="space-y-6 py-4"
                            >
                              <div className="space-y-2">
                                <Label htmlFor="edit-task-title">
                                  Task Name
                                </Label>
                                <Input
                                  id="edit-task-title"
                                  name="title"
                                  placeholder="Task name..."
                                  defaultValue={task.title}
                                  required
                                  autoFocus
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-task-est">
                                  Estimated Pomodoros
                                </Label>
                                <div className="flex items-center gap-4">
                                  <Input
                                    id="edit-task-est"
                                    name="est"
                                    type="number"
                                    defaultValue={task.estPomodoros}
                                    min={1}
                                    className="w-24"
                                  />
                                  <span className="text-sm text-slate-400 font-medium">
                                    approx.{" "}
                                    {task.estPomodoros * settings.workDuration}{" "}
                                    mins
                                  </span>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit" className="w-full">
                                  Update Task
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(task.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Task Dialog */}
                <Dialog
                  open={addTaskDialogOpen}
                  onOpenChange={setAddTaskDialogOpen}
                >
                  <DialogTrigger asChild>
                    <button className="w-full py-6 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 font-bold hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                      <Plus className="h-5 w-5" />
                      Add Task
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Task</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const title = formData.get("title") as string;
                        const est =
                          parseInt(formData.get("est") as string) || 1;
                        if (title) {
                          addTask(title, est);
                          (e.target as HTMLFormElement).reset();
                          setAddTaskDialogOpen(false);
                        }
                      }}
                      className="space-y-6 py-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="task-title">
                          What are you working on?
                        </Label>
                        <Input
                          id="task-title"
                          name="title"
                          placeholder="Task name..."
                          required
                          autoFocus
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-est">Estimated Pomodoros</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            id="task-est"
                            name="est"
                            type="number"
                            defaultValue={1}
                            min={1}
                            className="w-24"
                          />
                          <span className="text-sm text-slate-400 font-medium">
                            approx. {1 * settings.workDuration} mins
                          </span>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="w-full">
                          Create Task
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Task Summary Card */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-wrap justify-between items-center gap-6">
                <div className="flex gap-8">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                      Pomos
                    </p>
                    <p className="text-2xl font-black tabular-nums">
                      {totalActPomodoros}
                      <span className="text-slate-500 mx-1">/</span>
                      {totalEstPomodoros}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                      Finish At
                    </p>
                    <p className="text-2xl font-black tabular-nums">
                      {finishTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md">
                  <p className="text-xs font-bold text-primary-foreground/70 uppercase tracking-widest">
                    Total Focus
                  </p>
                  <p className="text-xl font-black">
                    {totalActPomodoros * settings.workDuration}m
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
            <section className="bg-white border rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                <div className="h-8 w-1.5 bg-primary rounded-full" />
                The Pomodoro Technique
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
                <p>
                  Developed by Francesco Cirillo in the late 1980s, this method
                  uses a timer to break work into intervals, traditionally 25
                  minutes in length, separated by short breaks.
                </p>
                <div className="grid gap-3 pt-2">
                  {[
                    "Choose a single task to focus on",
                    "Set the timer for 25 minutes (one Pomodoro)",
                    "Work on the task until the timer rings",
                    "Take a short 5-minute break",
                    "Every 4 Pomodoros, take a longer break (15-30 mins)",
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="h-6 w-6 rounded-full bg-slate-100 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-white border rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-black text-slate-800 mb-6">
                Pro Tips
              </h2>
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-1">
                    <HistoryIcon className="h-4 w-4" />
                    Respect the Breaks
                  </h3>
                  <p className="text-blue-700/80 text-sm font-medium">
                    When the timer goes off, stop working immediately. Breaks
                    are essential for long-term focus and preventing burnout.
                  </p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-1">
                    <Layout className="h-4 w-4" />
                    Batch Small Tasks
                  </h3>
                  <p className="text-indigo-700/80 text-sm font-medium">
                    If you have several tiny tasks (like replying to emails),
                    group them into a single Pomodoro session.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Estimation is Key
                  </h3>
                  <p className="text-slate-700/80 text-sm font-medium">
                    Over time, you'll get better at estimating how many
                    Pomodoros a task takes. This improves your planning skills!
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
