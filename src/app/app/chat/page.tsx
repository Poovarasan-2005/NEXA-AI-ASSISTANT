"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  User,
  Bot,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Search,
  CheckCircle2,
  ChevronDown,
  Terminal,
  Paperclip,
  Download,
  Image as ImageIcon,
  FileSpreadsheet,
  FileText,
  Maximize2,
  X,
  Scale,
  FlaskConical,
  HelpCircle,
  FileCheck,
  Sliders,
  Layers,
  GitBranch,
  Eye,
  BarChart3,
  Compass,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Headphones,
  Radio,
} from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: Array<{ title: string; url?: string; publisher?: string; confidence: number }>;
  verification?: { score: number; passed: boolean };
  tokensUsed?: number;
  modelUsed?: string;
  personalMode?: string;
  isSimulation?: boolean;
  simulationPreview?: Array<{
    stepNumber: number;
    title: string;
    agent: string;
    simulatedAction: string;
    riskLevel: string;
    stateImpact: string;
  }>;
  actionContract?: {
    id: string;
    goal: string;
    agents: string[];
    tools: string[];
    allowedActions: string[];
    forbiddenActions: string[];
    riskLevel: string;
    expiresIn: string;
    requiresApproval: boolean;
  };
  decisionLedger?: {
    goal: string;
    planSummary: string;
    memoriesConsulted: string[];
    toolsInvoked: Array<{ tool: string; durationMs: number; status: string }>;
    rulesEnforced: string[];
    modelSelectionRationale: string;
    verificationChecklist: Array<{ name: string; passed: boolean; message: string }>;
    finalOutcome: string;
  };
  imageArtifact?: {
    imageUrl: string;
    prompt: string;
    resolution: string;
    downloadUrl: string;
  };
  datasetArtifact?: {
    datasetName: string;
    rowCount: number;
    columnCount: number;
    columns: string[];
    summaryStatistics?: Record<string, any>;
    csvDownloadUrl: string;
  };
  pdfArtifact?: {
    title: string;
    downloadUrl: string;
    status: string;
  };
  docxArtifact?: {
    title: string;
    downloadUrl: string;
    status: string;
  };
  pptxArtifact?: {
    title: string;
    downloadUrl: string;
    slideCount: number;
    status: string;
  };
  xlsxArtifact?: {
    title: string;
    downloadUrl: string;
    sheetCount: number;
    rowCount: number;
    status: string;
  };
  diagramArtifact?: {
    title: string;
    type: string;
    downloadUrl: string;
    status: string;
  };
  chartArtifact?: {
    title: string;
    type: string;
    downloadUrl: string;
    status: string;
  };
  dataProfileArtifact?: {
    datasetName: string;
    qualityScore: number;
    qualityGrade: string;
    completenessPct: number;
    downloadUrl: string;
    status: string;
  };
  researchArtifact?: {
    topic: string;
    groundingScore: number;
    hallucinationRisk: string;
    claimsCount: number;
    status: string;
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-1",
      role: "assistant",
      content:
        "Greetings. I am NEXA, your personal AI operating system. I operate with continuous memory, connected sandbox tools, neural diffusion, dataset compilation, and strict AI Constitution governance. How may I assist your workflow?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedModel, setSelectedModel] = useState("nexa-core-reasoner");
  const [selectedMode, setSelectedMode] = useState("SAFE");
  const [isDryRun, setIsDryRun] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeLedger, setActiveLedger] = useState<any | null>(null);
  const [activeContract, setActiveContract] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice Assistant & Hands-Free Conversation States
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef(input);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  const cleanSpokenText = (text: string) => {
    return text
      .replace(/```[\s\S]*?```/g, " code block omitted ")
      .replace(/\[.*?\]\(.*?\)/g, "")
      .replace(/[#*_~`]/g, "")
      .replace(/\|.*?\|/g, "")
      .replace(/\{[\s\S]*?\}/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const clean = cleanSpokenText(text);
    if (!clean) return;

    const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
    const spokenSlice = sentences.slice(0, 3).join(" ").substring(0, 320);

    const utterance = new SpeechSynthesisUtterance(spokenSlice);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") ||
          v.name.includes("Neural") ||
          v.name.includes("Google") ||
          v.name.includes("Samantha") ||
          v.name.includes("David"))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (handsFreeMode) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setInput(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        const latest = inputRef.current;
        if (handsFreeMode && latest && latest.trim()) {
          handleSend(latest.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Speech recognition start failed", e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (overrideText?: string, forceSimulation?: boolean) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || sending) return;

    stopSpeaking();

    const dryRunActive = forceSimulation !== undefined ? forceSimulation : isDryRun;
    const userText = textToSend.trim();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSimulation: dryRunActive,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!overrideText) setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/app/orchestrator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          preferredModel: selectedModel,
          personalMode: selectedMode,
          isSimulation: dryRunActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content:
            data.result.output ||
            (data.result.approvalRequired
              ? `[Human Approval Required]: Action '${data.result.approvalRequired.actionName}' paused waiting for your authorization. Please inspect the Approvals dashboard.`
              : "Task executed successfully."),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sources: data.result.sources,
          verification: data.result.verification,
          tokensUsed: data.result.tokensUsed,
          modelUsed: selectedModel,
          personalMode: selectedMode,
          isSimulation: data.result.isSimulation,
          simulationPreview: data.result.simulationPreview,
          actionContract: data.result.actionContract,
          decisionLedger: data.result.decisionLedger,
          imageArtifact: data.result.imageArtifact,
          datasetArtifact: data.result.datasetArtifact,
          pdfArtifact: data.result.pdfArtifact,
          docxArtifact: data.result.docxArtifact,
          pptxArtifact: data.result.pptxArtifact,
          xlsxArtifact: data.result.xlsxArtifact,
          diagramArtifact: data.result.diagramArtifact,
          chartArtifact: data.result.chartArtifact,
          dataProfileArtifact: data.result.dataProfileArtifact,
          researchArtifact: data.result.researchArtifact,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (voiceOutputEnabled || handsFreeMode) {
          speakText(assistantMsg.content);
        }
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `Execution error: ${data.error || "Unable to complete request."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errorMsg]);
        if (voiceOutputEnabled || handsFreeMode) {
          speakText(errorMsg.content);
        }
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Network or server connection failed. Your state has been preserved.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      if (voiceOutputEnabled || handsFreeMode) {
        speakText(errorMsg.content);
      }
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/app/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        const fileMsg: ChatMessage = {
          id: `file-${Date.now()}`,
          role: "assistant",
          content: `Successfully ingested document "${file.name}" (${(file.size / 1024).toFixed(1)} KB). RAG vector embeddings computed and indexed into active workspace memory.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          verification: { score: 100, passed: true },
        };
        setMessages((prev) => [...prev, fileMsg]);
      } else {
        alert(data.error || "File upload failed.");
      }
    } catch (err) {
      alert("Network error uploading file.");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      {/* Top Header */}
      <div className="glass-panel px-6 py-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 mb-4 shrink-0 bg-[#0A0D15]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm font-mono text-white">NEXA Agent Workspace</h2>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>AI Constitution Active // Multi-Agent Loop</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="bg-[#07090E] border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-cyan-300 focus:outline-none cursor-pointer"
            >
              <option value="SAFE">Mode: SAFE</option>
              <option value="RESEARCH">Mode: RESEARCH</option>
              <option value="CREATIVE">Mode: CREATIVE</option>
              <option value="DEVELOPER">Mode: DEVELOPER</option>
              <option value="DATA">Mode: DATA</option>
              <option value="AUTOMATION">Mode: AUTOMATION</option>
              <option value="PRIVATE">Mode: PRIVATE</option>
            </select>
          </div>

          {/* Model Selector */}
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[#07090E] border border-white/10 rounded-lg px-2 py-1 text-xs font-mono text-cyan-300 focus:outline-none cursor-pointer"
            >
              <option value="nexa-core-reasoner">nexa-core-reasoner</option>
              <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="gemini-1-5-pro">gemini-1-5-pro</option>
            </select>
          </div>

          {/* Voice Output Toggle */}
          <button
            type="button"
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setVoiceOutputEnabled(!voiceOutputEnabled);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              voiceOutputEnabled
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "bg-[#07090E] text-slate-400 border border-white/10 hover:text-slate-200"
            }`}
            title="Toggle Sovereign Voice Output"
          >
            {voiceOutputEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {voiceOutputEnabled ? "Voice: ON" : "Voice: OFF"}
            </span>
          </button>

          {/* Hands-Free Mode Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextState = !handsFreeMode;
              setHandsFreeMode(nextState);
              if (nextState) {
                setVoiceOutputEnabled(true);
                startListening();
              } else {
                stopListening();
                stopSpeaking();
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
              handsFreeMode
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-cyan animate-pulse"
                : "bg-[#07090E] text-slate-400 border border-white/10 hover:text-slate-200"
            }`}
            title="Toggle Hands-Free Voice Dialogue Loop"
          >
            <Headphones className={`w-3.5 h-3.5 ${handsFreeMode ? "text-emerald-400" : ""}`} />
            <span className="hidden sm:inline">
              {handsFreeMode ? "Hands-Free: LIVE" : "Hands-Free: OFF"}
            </span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-white/10 text-slate-300 border border-white/10"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-cyan-400" />}
            </div>

            <div
              className={`max-w-2xl rounded-2xl p-5 border text-sm leading-relaxed space-y-4 ${
                msg.role === "user"
                  ? "bg-cyan-500/10 border-cyan-500/30 text-white rounded-tr-none"
                  : "glass-panel border-white/10 bg-[#0C101C] text-slate-200 rounded-tl-none"
              }`}
            >
              {/* Simulation Banner */}
              {msg.isSimulation && (
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[11px] font-mono text-purple-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold">
                    <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
                    <span>SIMULATED DRY RUN // ZERO STATE MUTATIONS</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Mode: {msg.personalMode || selectedMode}</span>
                </div>
              )}

              <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

              {/* Simulation Steps Preview if present */}
              {msg.simulationPreview && (
                <div className="space-y-1.5 p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-xs">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">
                    Simulated Execution Pipeline:
                  </div>
                  {msg.simulationPreview.map((s) => (
                    <div key={s.stepNumber} className="flex items-center justify-between text-[11px] py-1 border-b border-white/5 last:border-0">
                      <span className="text-cyan-300">Step {s.stepNumber}: {s.title}</span>
                      <span className="text-emerald-400">{s.stateImpact}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Image Generation Artifact */}
              {msg.imageArtifact && (
                <div className="glass-panel p-3.5 rounded-xl border border-cyan-500/30 bg-black/60 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                      <ImageIcon className="w-4 h-4" />
                      <span>Synthesized Image Artifact</span>
                    </div>
                    <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-white/5">
                      {msg.imageArtifact.resolution}
                    </span>
                  </div>

                  <div className="relative rounded-xl overflow-hidden border border-white/10 group bg-black max-h-72">
                    <img
                      src={msg.imageArtifact.imageUrl}
                      alt={msg.imageArtifact.prompt}
                      className="w-full max-h-72 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewImage(msg.imageArtifact!.imageUrl)}
                        className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-mono text-xs backdrop-blur-md flex items-center gap-1"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Preview</span>
                      </button>
                      <a
                        href={msg.imageArtifact.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-glow-cyan flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download Image</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                    <span className="truncate max-w-xs">&ldquo;{msg.imageArtifact.prompt}&rdquo;</span>
                    <a
                      href={msg.imageArtifact.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-300 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Tabular Dataset Artifact */}
              {msg.datasetArtifact && (
                <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-black/60 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Dataset: {msg.datasetArtifact.datasetName}</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/20">
                      RFC-4180 CSV
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div className="p-2 rounded-lg bg-white/5">
                      <div className="text-[10px] text-slate-500">ROWS</div>
                      <div className="font-bold text-white text-xs">{msg.datasetArtifact.rowCount} Records</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5">
                      <div className="text-[10px] text-slate-500">COLUMNS</div>
                      <div className="font-bold text-white text-xs">{msg.datasetArtifact.columnCount} Features</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex justify-end">
                    <a
                      href={msg.datasetArtifact.csvDownloadUrl}
                      download
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CSV Dataset</span>
                    </a>
                  </div>
                </div>
              )}

              {/* PDF Document Artifact */}
              {msg.pdfArtifact && (
                <div className="glass-panel p-4 rounded-xl border border-rose-500/30 bg-black/60 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-400 font-bold">
                      <FileText className="w-4 h-4" />
                      <span>{msg.pdfArtifact.title}</span>
                    </div>
                    <span className="text-[10px] text-rose-300 px-2 py-0.5 rounded bg-rose-500/20">
                      PRINT TO PDF
                    </span>
                  </div>

                  <div className="pt-1 flex justify-end">
                    <a
                      href={msg.pdfArtifact.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Open / Download PDF</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Word (.docx) Artifact */}
              {msg.docxArtifact && (
                <div className="glass-panel p-4 rounded-xl border border-blue-500/30 bg-black/60 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-400 font-bold">
                      <FileText className="w-4 h-4" />
                      <span>{msg.docxArtifact.title}</span>
                    </div>
                    <span className="text-[10px] text-blue-300 px-2 py-0.5 rounded bg-blue-500/20">
                      WORD (.DOCX)
                    </span>
                  </div>
                  <div className="pt-1 flex justify-end">
                    <a
                      href={msg.docxArtifact.downloadUrl}
                      download
                      className="px-3.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .DOCX Brief</span>
                    </a>
                  </div>
                </div>
              )}

              {/* PowerPoint (.pptx) Artifact */}
              {msg.pptxArtifact && (
                <div className="glass-panel p-4 rounded-xl border border-amber-500/30 bg-black/60 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400 font-bold">
                      <Layers className="w-4 h-4" />
                      <span>{msg.pptxArtifact.title}</span>
                    </div>
                    <span className="text-[10px] text-amber-300 px-2 py-0.5 rounded bg-amber-500/20">
                      PPTX ({msg.pptxArtifact.slideCount} SLIDES)
                    </span>
                  </div>
                  <div className="pt-1 flex justify-end">
                    <a
                      href={msg.pptxArtifact.downloadUrl}
                      download
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .PPTX Deck</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Excel (.xlsx) Artifact */}
              {msg.xlsxArtifact && (
                <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-black/60 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{msg.xlsxArtifact.title}</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/20">
                      EXCEL ({msg.xlsxArtifact.sheetCount} TABS • {msg.xlsxArtifact.rowCount} ROWS)
                    </span>
                  </div>
                  <div className="pt-1 flex justify-end">
                    <a
                      href={msg.xlsxArtifact.downloadUrl}
                      download
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .XLSX Workbook</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Diagram (.svg) Artifact */}
              {msg.diagramArtifact && (
                <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 bg-black/60 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold">
                      <GitBranch className="w-4 h-4" />
                      <span>{msg.diagramArtifact.title}</span>
                    </div>
                    <span className="text-[10px] text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/20">
                      VECTOR SVG / MERMAID
                    </span>
                  </div>
                  <div className="pt-1 flex justify-end gap-2">
                    <Link
                      href={`/app/diagrams?type=${msg.diagramArtifact.type}`}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Inspect in Studio</span>
                    </Link>
                    <a
                      href={msg.diagramArtifact.downloadUrl}
                      download
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Diagram</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Chart (.svg) Artifact */}
              {msg.chartArtifact && (
                <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-black/60 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <BarChart3 className="w-4 h-4" />
                      <span>{msg.chartArtifact.title}</span>
                    </div>
                    <span className="text-[10px] text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/20">
                      CHART ({msg.chartArtifact.type})
                    </span>
                  </div>
                  <div className="pt-1 flex justify-end gap-2">
                    <Link
                      href="/app/data"
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Open Data Studio</span>
                    </Link>
                    <a
                      href={msg.chartArtifact.downloadUrl}
                      download
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Chart SVG</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Data Profile Quality Artifact */}
              {msg.dataProfileArtifact && (
                <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 bg-black/60 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Data Quality Profile: {msg.dataProfileArtifact.datasetName}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/20">
                      GRADE {msg.dataProfileArtifact.qualityGrade} ({msg.dataProfileArtifact.qualityScore}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div className="p-2 rounded-lg bg-white/5">
                      <div className="text-[10px] text-slate-500">COMPLETENESS</div>
                      <div className="font-bold text-emerald-400 text-xs">{msg.dataProfileArtifact.completenessPct}%</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5">
                      <div className="text-[10px] text-slate-500">HYGIENE STATUS</div>
                      <div className="font-bold text-cyan-300 text-xs">IQR Cleaned</div>
                    </div>
                  </div>
                  <div className="pt-1 flex justify-end">
                    <Link
                      href="/app/data"
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Schema in Data Studio</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Deep Research Fact Ledger Artifact */}
              {msg.researchArtifact && (
                <div className="glass-panel p-4 rounded-xl border border-purple-500/30 bg-black/60 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-400 font-bold">
                      <Compass className="w-4 h-4" />
                      <span>Deep Research: {msg.researchArtifact.topic}</span>
                    </div>
                    <span className="text-[10px] text-purple-300 px-2 py-0.5 rounded bg-purple-500/20">
                      FACT LEDGER ({msg.researchArtifact.claimsCount} CLAIMS)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div className="p-2 rounded-lg bg-white/5">
                      <div className="text-[10px] text-slate-500">GROUNDING SCORE</div>
                      <div className="font-bold text-purple-300 text-xs">{msg.researchArtifact.groundingScore}%</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5">
                      <div className="text-[10px] text-slate-500">HALLUCINATION RISK</div>
                      <div className="font-bold text-emerald-400 text-xs">{msg.researchArtifact.hallucinationRisk}</div>
                    </div>
                  </div>
                  <div className="pt-1 flex justify-end">
                    <Link
                      href="/app/research"
                      className="px-3.5 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Claim-by-Claim Ledger</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Citations block */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-1.5 font-mono text-xs">
                  <div className="text-[10px] text-cyan-400 uppercase tracking-wider">
                    CITATIONS:
                  </div>
                  {msg.sources.map((s, idx) => (
                    <div key={idx} className="text-slate-400 flex items-center gap-1.5">
                      <span className="text-cyan-400">[{idx + 1}]</span>
                      <span className="text-slate-200">{s.title}</span>
                      <span className="text-[10px] text-slate-500">({s.publisher})</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Governance & Explainability Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-2">
                  <span>{msg.timestamp}</span>
                  {msg.verification && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified ({msg.verification.score}%)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {msg.actionContract && (
                    <button
                      onClick={() => setActiveContract(msg.actionContract)}
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <FileCheck className="w-3 h-3" />
                      <span>Contract</span>
                    </button>
                  )}

                  {msg.decisionLedger && (
                    <button
                      onClick={() => setActiveLedger(msg.decisionLedger)}
                      className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 flex items-center gap-1 font-bold"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>Why did NEXA do this?</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-3 text-slate-400 font-mono text-xs py-2">
            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>NEXA is evaluating AI Constitution, planning, and executing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-3 pb-1">
        {[
          { label: "🎨 Generate AI Image", prompt: "Generate an image of a futuristic zero-trust AI operating system core with blue neon lights" },
          { label: "📊 Download Dataset (CSV)", prompt: "Analyze telemetry dataset and provide statistical distribution with CSV artifact" },
          { label: "📄 Export PDF Report", prompt: "Export an executive PDF report verifying system architecture and security score" },
          { label: "📝 Word Brief (.docx)", prompt: "Generate an executive Word document (.docx) on zero-trust autonomous governance" },
          { label: "📊 Slides (.pptx)", prompt: "Create a PowerPoint presentation deck (.pptx) summarizing NEXA operating system architecture" },
          { label: "📈 Excel Sheet (.xlsx)", prompt: "Export a multi-sheet Excel workbook (.xlsx) with system records and constitution matrix" },
          { label: "📐 System Diagram", prompt: "Create a system architecture diagram illustrating the multi-agent mesh and security firewall" },
          { label: "📊 Data Profiler", prompt: "Profile telemetry dataset and compute completeness, duplicate rows, and IQR anomaly report" },
          { label: "📈 Visual Chart", prompt: "Synthesize an analytical bar chart visualization comparing subsystem efficiency metrics" },
          { label: "🔍 Deep Research", prompt: "Run deep grounded research with claim-by-claim Fact Ledger on zero-trust AI architecture" },
          { label: "⚖️ AI Constitution Rules", prompt: "Inspect active AI Constitution rules and policy enforcement thresholds" },
        ].map((chip) => (
          <button
            key={chip.label}
            onClick={() => {
              setInput(chip.prompt);
              handleSend(chip.prompt);
            }}
            disabled={sending}
            className="text-[11px] font-mono px-3 py-1 rounded-xl glass-panel text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all border border-white/5 disabled:opacity-40"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-2 shrink-0"
      >
        <div className="glass-panel p-2 sm:p-2.5 rounded-2xl border border-white/10 flex items-center gap-2 bg-[#0A0D15]">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.csv,.json,.txt,.png,.jpg"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
            title="Upload Document or Dataset"
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            {uploadingFile ? (
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </button>

          {/* Push-to-Talk Microphone Button */}
          <button
            type="button"
            onClick={() => {
              if (isListening) {
                stopListening();
              } else {
                startListening();
              }
            }}
            className={`p-2 rounded-xl transition-all flex items-center justify-center ${
              isListening
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse shadow-glow-cyan"
                : "bg-white/5 text-slate-400 hover:text-cyan-300 border border-white/5"
            }`}
            title={isListening ? "Listening... Click to stop" : "Speak to NEXA (Speech-to-Text)"}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 text-rose-400" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Dry Run Toggle Button */}
          <button
            type="button"
            onClick={() => setIsDryRun((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1 ${
              isDryRun
                ? "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-glow-cyan"
                : "bg-white/5 text-slate-400 border-white/5 hover:text-slate-200"
            }`}
            title="Toggle Dry-Run Simulation Mode"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dry Run</span>
          </button>

          {isSpeaking && (
            <button
              type="button"
              onClick={stopSpeaking}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono flex items-center gap-1 animate-pulse"
              title="Stop Speaking"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stop Voice</span>
            </button>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? "Listening to voice input..."
                : `Ask NEXA (${selectedMode} Mode)...`
            }
            disabled={sending}
            className={`flex-1 bg-transparent px-2 text-sm text-white placeholder-slate-500 focus:outline-none font-sans ${
              isListening ? "placeholder-cyan-400 animate-pulse" : ""
            }`}
          />

          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs shadow-glow-cyan hover:opacity-95 disabled:opacity-40 transition-all flex items-center gap-1.5 font-mono"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Decision Ledger Explainability Modal */}
      {activeLedger && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/40 bg-[#0A0D17] max-w-2xl w-full space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <HelpCircle className="w-4 h-4" />
                <span>DECISION LEDGER // EXPLAINABILITY</span>
              </div>
              <button
                onClick={() => setActiveLedger(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 max-h-[65vh] overflow-y-auto pr-1">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">GOAL</span>
                <div className="text-white font-semibold font-sans mt-0.5">&ldquo;{activeLedger.goal}&rdquo;</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">PLAN SUMMARY</span>
                <div className="text-slate-200 mt-0.5">{activeLedger.planSummary}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">WHY THIS MODEL? (MODEL RATIONALE)</span>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-cyan-300">
                  {activeLedger.modelSelectionRationale}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">CONSTITUTION RULES ENFORCED</span>
                <div className="space-y-1 mt-1">
                  {activeLedger.rulesEnforced?.map((r: string, i: number) => (
                    <div key={i} className="text-emerald-400 text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">VERIFICATION CHECKLIST</span>
                <div className="space-y-1 mt-1">
                  {activeLedger.verificationChecklist?.map((c: any, i: number) => (
                    <div key={i} className="text-[11px] flex items-center gap-1.5">
                      <span className={c.passed ? "text-emerald-400" : "text-rose-400"}>
                        {c.passed ? "✓" : "✗"}
                      </span>
                      <span className="text-slate-300">{c.name}: {c.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setActiveLedger(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Contract Modal */}
      {activeContract && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 bg-[#0A0D17] max-w-xl w-full space-y-4 shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                <FileCheck className="w-4 h-4" />
                <span>CRYPTOGRAPHIC ACTION CONTRACT</span>
              </div>
              <button
                onClick={() => setActiveContract(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">CONTRACT ID:</span>
                <div className="text-cyan-400 font-bold">{activeContract.id}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">ALLOWED ACTIONS:</span>
                <ul className="list-disc list-inside text-emerald-400 space-y-0.5 mt-0.5">
                  {activeContract.allowedActions?.map((a: string, i: number) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">FORBIDDEN ACTIONS:</span>
                <ul className="list-disc list-inside text-rose-400 space-y-0.5 mt-0.5">
                  {activeContract.forbiddenActions?.map((f: string, i: number) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/5 text-[11px]">
                <span>Risk: <strong className="text-white">{activeContract.riskLevel}</strong></span>
                <span>Validity: <strong className="text-cyan-300">{activeContract.expiresIn}</strong></span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setActiveContract(null)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
              >
                Acknowledge Contract
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl w-full bg-[#0A0D17] rounded-3xl p-4 border border-white/20">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-black/60 text-white hover:bg-black/80"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewImage} alt="Preview" className="max-h-[75vh] w-auto mx-auto object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
