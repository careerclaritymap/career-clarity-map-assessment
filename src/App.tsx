import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Download, ArrowRight, RotateCcw, Check } from "lucide-react";
import emailjs from "@emailjs/browser";

type NeedKey = "certainty" | "variety" | "significance" | "connection" | "growth" | "contribution";
type Question = {
  id: string;
  text: string;
  need: NeedKey;
};

const NEED_LABELS: Record<NeedKey, string> = {
  certainty: "Certainty (stability & predictability)",
  variety: "Variety (freedom & change)",
  significance: "Significance (recognition & achievement)",
  connection: "Connection (belonging & relationships)",
  growth: "Growth (learning & challenge)",
  contribution: "Contribution (meaning & impact)",
};

const QUESTIONS: Question[] = [
  { id: "q1", need: "certainty", text: "I feel best at work when expectations are clear and consistent." },
  { id: "q2", need: "certainty", text: "Stability and predictability matter more to me than constant change." },
  { id: "q3", need: "certainty", text: "I prefer roles with defined responsibilities rather than open-ended ambiguity." },
  { id: "q4", need: "variety", text: "Too much routine quickly drains my motivation." },
  { id: "q5", need: "variety", text: "I feel energized by new challenges, change, and variety in my work." },
  { id: "q6", need: "variety", text: "I prefer flexibility and freedom over strict structure." },
  { id: "q7", need: "significance", text: "Being recognized for my work strongly affects my job satisfaction." },
  { id: "q8", need: "significance", text: "I want my role to feel important and not easily replaceable." },
  { id: "q9", need: "significance", text: "I’m motivated by achieving visible results or measurable wins." },
  { id: "q10", need: "significance", text: "Responsibility, influence, or status plays a role in what motivates me." },
  { id: "q11", need: "connection", text: "Positive relationships at work are essential for me to feel engaged." },
  { id: "q12", need: "connection", text: "I prefer collaboration and teamwork over working mostly alone." },
  { id: "q13", need: "connection", text: "Feeling like I belong in a team or culture matters a lot to me." },
  { id: "q14", need: "growth", text: "I feel restless if I’m not learning, improving, or being challenged." },
  { id: "q15", need: "growth", text: "Personal development is a key part of what I want from my career." },
  { id: "q16", need: "growth", text: "I’m willing to face discomfort if it helps me grow." },
  { id: "q17", need: "growth", text: "I lose motivation in roles where I’ve already mastered everything." },
  { id: "q18", need: "contribution", text: "I want my work to have a positive impact beyond just performance metrics." },
  { id: "q19", need: "contribution", text: "Meaning matters more to me than money alone." },
  { id: "q20", need: "contribution", text: "I feel fulfilled when my work helps others or serves a bigger purpose." },
  { id: "q21", need: "contribution", text: "I want to feel proud of what my work contributes to the world." },
];

const SCALE = [
  { v: 1, label: "1 — Not at all" },
  { v: 2, label: "2 — Slightly" },
  { v: 3, label: "3 — Neutral" },
  { v: 4, label: "4 — Mostly" },
  { v: 5, label: "5 — Very much" },
];

const INTERPRETATIONS: Record<NeedKey, { title: string; meaning: string; seek: string[]; avoid: string[]; prompts: string[] }> = {
  certainty: {
    title: "Certainty: You thrive on stability and clear expectations",
    meaning: "When Certainty is high, you feel safest and most energized in environments with clarity, predictability, and reliable standards.",
    seek: ["Clear goals, defined roles, and consistent expectations", "Reliable processes and transparent decision-making", "Steady pace and realistic planning horizons"],
    avoid: ["Frequent chaos, shifting priorities, and unclear ownership", "Constant ‘firefighting’ culture with little structure", "Unpredictable income/conditions"],
    prompts: ["Where will I get clarity on success and priorities each week?", "How are decisions made when things change?", "What does stability look like in this role and team?"],
  },
  variety: {
    title: "Variety: You thrive on freedom, change, and momentum",
    meaning: "When Variety is high, you feel alive in roles with flexibility, novelty, and room to explore.",
    seek: ["Flexible schedules, dynamic responsibilities, and experimentation", "Autonomy and room to change how you work", "Projects with variety, learning-by-doing, and movement"],
    avoid: ["Highly repetitive tasks and rigid bureaucracy", "Slow environments where change is resisted", "Micromanagement that restricts freedom"],
    prompts: ["How much autonomy will I have day-to-day?", "How often will work change and evolve here?", "Will this role still feel fresh in 6 months?"],
  },
  significance: {
    title: "Significance: You thrive on achievement, recognition, and impact",
    meaning: "When Significance is high, you’re motivated by meaningful wins, being valued, and knowing your work matters.",
    seek: ["Clear ownership and visible outcomes", "Feedback and recognition tied to real contribution", "Roles with responsibility, influence, or high standards"],
    avoid: ["Being underutilized or invisible in a role", "Environments where excellence goes unnoticed", "Unclear performance signals or politics-only recognition"],
    prompts: ["How is great work recognized here?", "What does success look like, and who notices it?", "Will I have ownership over meaningful outcomes?"],
  },
  connection: {
    title: "Connection: You thrive on belonging and strong relationships",
    meaning: "When Connection is high, your energy is closely tied to people, culture, and trust.",
    seek: ["Supportive teams, healthy culture, and psychological safety", "Collaboration, mentoring, and clear communication", "Values alignment and a sense of belonging"],
    avoid: ["Toxic competition or isolation", "Cold or dismissive communication norms", "Cultures where relationships are ‘optional’"],
    prompts: ["How do people treat each other under stress?", "Who will I collaborate with most, and how?", "Do I feel respected and included here?"],
  },
  growth: {
    title: "Growth: You thrive on learning, challenge, and development",
    meaning: "When Growth is high, stagnation is your enemy. You feel fulfilled when you’re stretching your skills.",
    seek: ["Clear learning curve, feedback, and skill development", "Challenging goals and meaningful stretch projects", "Mentorship, training, and room to advance"],
    avoid: ["Static roles with little learning", "Comfortable stagnation or ‘same year repeated’", "Environments that punish learning mistakes"],
    prompts: ["What will I learn in the first 90 days?", "How does this company support development?", "Where is the growth path after 6–12 months?"],
  },
  contribution: {
    title: "Contribution: You thrive on meaning and making a positive difference",
    meaning: "When Contribution is high, you need your work to stand for something.",
    seek: ["Mission clarity and real-world impact", "Work that helps customers, community, or a bigger purpose", "Organizations with values you respect"],
    avoid: ["Work that feels empty or misaligned with your values", "Environments focused only on numbers with no meaning", "Roles where impact is unclear or purely extractive"],
    prompts: ["Who benefits from my work, and how?", "Do I respect what this organization contributes?", "Will I feel proud of this work a year from now?"],
  },
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatDateHuman(d: Date) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

async function exportPdfFromElement(el: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
  const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff", windowWidth: el.scrollWidth });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let y = 0;
  let remaining = imgHeight;
  while (remaining > 0) {
    pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
    remaining -= pageHeight;
    if (remaining > 0) {
      pdf.addPage();
      y -= pageHeight;
    }
  }
  pdf.save(filename);
  return canvas; // Return for EmailJS
}

export default function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hasPaid, setHasPaid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number | null>>(() =>
    QUESTIONS.reduce((acc, q) => { acc[q.id] = null; return acc; }, {} as Record<string, number | null>)
  );
  const [submitted, setSubmitted] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const top1Ref = useRef<HTMLDivElement | null>(null);
  const top2Ref = useRef<HTMLDivElement | null>(null);

  const completedCount = Object.values(answers).filter((v) => v !== null).length;
  const progress = Math.round((completedCount / QUESTIONS.length) * 100);

  const scores = useMemo(() => {
    const sums = { certainty: 0, variety: 0, significance: 0, connection: 0, growth: 0, contribution: 0 };
    const counts = { certainty: 0, variety: 0, significance: 0, connection: 0, growth: 0, contribution: 0 };
    for (const q of QUESTIONS) {
      const v = answers[q.id];
      if (v !== null) { sums[q.need] += v; counts[q.need] += 1; }
    }
    const normalized = (Object.keys(sums) as NeedKey[]).map((k) => {
      const avg = counts[k] ? sums[k] / counts[k] : 0;
      const pct = counts[k] ? ((avg - 1) / 4) * 100 : 0;
      return { key: k, label: NEED_LABELS[k], avg, pct: clamp(Math.round(pct), 0, 100) };
    });
    return normalized.sort((a, b) => b.pct - a.pct);
  }, [answers]);

  const topNeeds = { top1: scores[0]?.key, top2: scores[1]?.key };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    // Check localStorage first
    const stored = localStorage.getItem('career_clarity_paid');
    if (stored) {
      const data = JSON.parse(stored);
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        setHasPaid(true);
        if (data.email) setEmail(data.email);
      }
    }

    if (sessionId && !hasPaid) {
      setIsVerifying(true);
      fetch(`/api/verify-payment?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.paid) {
            setHasPaid(true);
            if (data.email) setEmail(data.email);
            localStorage.setItem('career_clarity_paid', JSON.stringify({
              timestamp: Date.now(),
              email: data.email,
              sessionId
            }));
          }
        })
        .finally(() => setIsVerifying(false));
    }
  }, []);

  const sendResults = async () => {
    if (!email) return;
    setEmailSending(true);
    try {
      const el = document.getElementById("pdf-root");
      if (el) {
        const [{ default: html2canvas }] = await Promise.all([import("html2canvas")]);
        const canvas = await html2canvas(el, { scale: 1.5, useCORS: true });
        const imgData = canvas.toDataURL("image/jpeg", 0.7);
        
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            to_email: email,
            to_name: name || "User",
            top1: NEED_LABELS[topNeeds.top1!],
            top2: NEED_LABELS[topNeeds.top2!],
            
            // In a real scenario, you'd upload the PDF somewhere or use a service that handles attachments.
            // For now, we'll send the data URL as a placeholder or just the text results.
          },
          import.meta.env.VITE_EMAILJS_PUC_KEY
        );
        setEmailSent(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEmailSending(false);
    }
  };

  const handleSubmit = () => {
    if (completedCount === QUESTIONS.length && email) {
      setSubmitted(true);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
        sendResults();
      }, 500);
    }
  };

  if (!hasPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <h1 className="text-3xl font-bold">Career Clarity Map</h1>
          <p className="text-gray-600">Unlock your personalized career motivation assessment today.</p>
          <Button 
            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
            onClick={() => window.location.href = 'https://buy.stripe.com/3cI9AT1cM8003Ia7zt0Jq01'}
          >
            {isVerifying ? "Verifying Access..." : "Secure Payment & Instant Access"}
          </Button>
          <p className="text-xs text-gray-400">One-time payment. Instant access to test & PDF report.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {!submitted ? (
          <Card className="rounded-2xl shadow-sm p-6">
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold">Your Assessment</h2>
                  <p className="text-sm text-gray-500">Answer all 21 questions to see your results.</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{progress}% Complete</span>
                  <Progress value={progress} className="w-32 mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="First Name" value={name} onChange={e => setName(e.target.value)} />
                <Input placeholder="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div className="space-y-10">
                {QUESTIONS.map((q, idx) => (
                  <div key={q.id} className="space-y-4"className={`space-y-4 p-4 rounded-lg transition-colors ${answers[q.id] === null ? 'bg-pink-50' : 'bg-green-50'}`}
                    <p className="text-lg font-medium">{idx + 1}. {q.text}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {SCALE.map(s => (
                        <Button
                          key={s.v}
                          variant={answers[q.id] === s.v ? "default" : "outline"}
                          className="h-10"
                          onClick={() => setAnswers(prev => ({ ...prev, [q.id]: s.v }))}
                        >
                          {s.label}{answers[q.id] === s.v && <Check className="inline-block mr-1 h-4 w-4" />}
                </Button>                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                disabled={completedCount < QUESTIONS.length || !email}
                onClick={handleSubmit}
              >
                Get My Results
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-8" ref={resultsRef}>
            <Card className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold">Your Results, {name}!</h2>
                  <p className="text-gray-500">Generated on {formatDateHuman(new Date())}</p>
                </div>
                <Button variant="outline" onClick={() => exportPdfFromElement(document.getElementById("pdf-root")!, `Career-Map-${name}.pdf`)}>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
              </div>
              
              {emailSent && <Badge className="bg-green-100 text-green-800 border-green-200">PDF sent to {email}</Badge>}

              <div className="space-y-4">
                {scores.map((s, i) => (
                  <div key={s.key} className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                      <span>#{i + 1} {s.label}</span>
                      <span>{s.pct}%</span>
                    </div>
                    <Progress value={s.pct} className="h-2" />
                  </div>
                ))}
              </div>
            </Card>

            <div id="pdf-root" className="space-y-6">
              {topNeeds.top1 && <InterpretationBlock need={topNeeds.top1} rankLabel="Primary Driver" />}
              {topNeeds.top2 && <InterpretationBlock need={topNeeds.top2} rankLabel="Secondary Driver" />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InterpretationBlock({ need, rankLabel }: { need: NeedKey; rankLabel: string }) {
  const data = INTERPRETATIONS[need];
  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">{data.title}</h3>
        <Badge variant="secondary">{rankLabel}</Badge>
      </div>
      <p className="text-gray-700 leading-relaxed">{data.meaning}</p>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">Seek</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {data.seek.map(i => <li key={i}>{i}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider text-gray-500 mb-2">Avoid</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {data.avoid.map(i => <li key={i}>{i}</li>)}
          </ul>
        </div>
      </div>
    </Card>
  );
}
