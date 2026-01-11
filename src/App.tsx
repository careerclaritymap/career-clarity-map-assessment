import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Download, ArrowRight, RotateCcw } from "lucide-react";

// NOTE: This is a self-contained MVP you can extend.
// - 21 Likert questions (1–5)
// - Scoring for 6 motivation drivers
// - Auto-scroll to the relevant interpretation section (Top 1 + Top 2)
// - PDF export of the results/interpretation (client-side)
//
// You can replace/expand INTERPRETATIONS and/or question wording later.

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

// 21 questions total: 3 for certainty, 3 for variety, 4 for significance, 3 for connection, 4 for growth, 4 for contribution.
const QUESTIONS: Question[] = [
  // Certainty (3)
  { id: "q1", need: "certainty", text: "I feel best at work when expectations are clear and consistent." },
  { id: "q2", need: "certainty", text: "Stability and predictability matter more to me than constant change." },
  { id: "q3", need: "certainty", text: "I prefer roles with defined responsibilities rather than open-ended ambiguity." },

  // Variety (3)
  { id: "q4", need: "variety", text: "Too much routine quickly drains my motivation." },
  { id: "q5", need: "variety", text: "I feel energized by new challenges, change, and variety in my work." },
  { id: "q6", need: "variety", text: "I prefer flexibility and freedom over strict structure." },

  // Significance (4)
  { id: "q7", need: "significance", text: "Being recognized for my work strongly affects my job satisfaction." },
  { id: "q8", need: "significance", text: "I want my role to feel important and not easily replaceable." },
  { id: "q9", need: "significance", text: "I’m motivated by achieving visible results or measurable wins." },
  { id: "q10", need: "significance", text: "Responsibility, influence, or status plays a role in what motivates me." },

  // Connection (3)
  { id: "q11", need: "connection", text: "Positive relationships at work are essential for me to feel engaged." },
  { id: "q12", need: "connection", text: "I prefer collaboration and teamwork over working mostly alone." },
  { id: "q13", need: "connection", text: "Feeling like I belong in a team or culture matters a lot to me." },

  // Growth (4)
  { id: "q14", need: "growth", text: "I feel restless if I’m not learning, improving, or being challenged." },
  { id: "q15", need: "growth", text: "Personal development is a key part of what I want from my career." },
  { id: "q16", need: "growth", text: "I’m willing to face discomfort if it helps me grow." },
  { id: "q17", need: "growth", text: "I lose motivation in roles where I’ve already mastered everything." },

  // Contribution (4)
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

// Placeholder interpretations you can replace with your final copy.
// The app will auto-scroll the user to the sections for their Top 1 and Top 2.
const INTERPRETATIONS: Record<
  NeedKey,
  { title: string; meaning: string; seek: string[]; avoid: string[]; prompts: string[] }
> = {
  certainty: {
    title: "Certainty: You thrive on stability and clear expectations",
    meaning:
      "When Certainty is high, you feel safest and most energized in environments with clarity, predictability, and reliable standards. You don’t need constant surprises to stay engaged — you need confidence that the ground is solid.",
    seek: [
      "Clear goals, defined roles, and consistent expectations",
      "Reliable processes and transparent decision-making",
      "Steady pace and realistic planning horizons",
    ],
    avoid: [
      "Frequent chaos, shifting priorities, and unclear ownership",
      "Constant ‘firefighting’ culture with little structure",
      "Unpredictable income/conditions (unless offset elsewhere)",
    ],
    prompts: [
      "Where will I get clarity on success and priorities each week?",
      "How are decisions made when things change?",
      "What does stability look like in this role and team?",
    ],
  },
  variety: {
    title: "Variety: You thrive on freedom, change, and momentum",
    meaning:
      "When Variety is high, you feel alive in roles with flexibility, novelty, and room to explore. Too much routine can quietly drain you — even if everything looks ‘fine’ on paper.",
    seek: [
      "Flexible schedules, dynamic responsibilities, and experimentation",
      "Autonomy and room to change how you work",
      "Projects with variety, learning-by-doing, and movement",
    ],
    avoid: [
      "Highly repetitive tasks and rigid bureaucracy",
      "Slow environments where change is resisted",
      "Micromanagement that restricts freedom",
    ],
    prompts: [
      "How much autonomy will I have day-to-day?",
      "How often will work change and evolve here?",
      "Will this role still feel fresh in 6 months?",
    ],
  },
  significance: {
    title: "Significance: You thrive on achievement, recognition, and impact",
    meaning:
      "When Significance is high, you’re motivated by meaningful wins, being valued, and knowing your work matters. You don’t need ego-stroking — you need fair recognition and opportunities to contribute at a high level.",
    seek: [
      "Clear ownership and visible outcomes",
      "Feedback and recognition tied to real contribution",
      "Roles with responsibility, influence, or high standards",
    ],
    avoid: [
      "Being underutilized or invisible in a role",
      "Environments where excellence goes unnoticed",
      "Unclear performance signals or politics-only recognition",
    ],
    prompts: [
      "How is great work recognized here?",
      "What does success look like, and who notices it?",
      "Will I have ownership over meaningful outcomes?",
    ],
  },
  connection: {
    title: "Connection: You thrive on belonging and strong relationships",
    meaning:
      "When Connection is high, your energy is closely tied to people, culture, and trust. You’re at your best when you feel included, respected, and part of something.",
    seek: [
      "Supportive teams, healthy culture, and psychological safety",
      "Collaboration, mentoring, and clear communication",
      "Values alignment and a sense of belonging",
    ],
    avoid: [
      "Toxic competition or isolation",
      "Cold or dismissive communication norms",
      "Cultures where relationships are ‘optional’",
    ],
    prompts: [
      "How do people treat each other under stress?",
      "Who will I collaborate with most, and how?",
      "Do I feel respected and included here?",
    ],
  },
  growth: {
    title: "Growth: You thrive on learning, challenge, and development",
    meaning:
      "When Growth is high, stagnation is your enemy. You feel fulfilled when you’re stretching your skills, learning, and becoming more capable over time.",
    seek: [
      "Clear learning curve, feedback, and skill development",
      "Challenging goals and meaningful stretch projects",
      "Mentorship, training, and room to advance",
    ],
    avoid: [
      "Static roles with little learning",
      "Comfortable stagnation or ‘same year repeated’",
      "Environments that punish learning mistakes",
    ],
    prompts: [
      "What will I learn in the first 90 days?",
      "How does this company support development?",
      "Where is the growth path after 6–12 months?",
    ],
  },
  contribution: {
    title: "Contribution: You thrive on meaning and making a positive difference",
    meaning:
      "When Contribution is high, you need your work to stand for something. Even high pay or prestige won’t fully satisfy you if you can’t feel the purpose and impact.",
    seek: [
      "Mission clarity and real-world impact",
      "Work that helps customers, community, or a bigger purpose",
      "Organizations with values you respect",
    ],
    avoid: [
      "Work that feels empty or misaligned with your values",
      "Environments focused only on numbers with no meaning",
      "Roles where impact is unclear or purely extractive",
    ],
    prompts: [
      "Who benefits from my work, and how?",
      "Do I respect what this organization contributes?",
      "Will I feel proud of this work a year from now?",
    ],
  },
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatDateHuman(d: Date) {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

async function exportPdfFromElement(el: HTMLElement, filename: string) {
  // Client-side PDF export using html2canvas + jsPDF
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: el.scrollWidth,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Fit image to page width, paginate vertically if needed
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
}

export default function App() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, number | null>>(() =>
    QUESTIONS.reduce((acc, q) => {
      acc[q.id] = null;
      return acc;
    }, {} as Record<string, number | null>)
  );
  const [submitted, setSubmitted] = useState(false);
    const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const resultsRef = useRef<HTMLDivElement | null>(null);
  const top1Ref = useRef<HTMLDivElement | null>(null);
  const top2Ref = useRef<HTMLDivElement | null>(null);

  const completedCount = useMemo(() => Object.values(answers).filter((v) => v !== null).length, [answers]);

  const progress = Math.round((completedCount / QUESTIONS.length) * 100);

  const scores = useMemo(() => {
    const sums: Record<NeedKey, number> = {
      certainty: 0,
      variety: 0,
      significance: 0,
      connection: 0,
      growth: 0,
      contribution: 0,
    };
    const counts: Record<NeedKey, number> = {
      certainty: 0,
      variety: 0,
      significance: 0,
      connection: 0,
      growth: 0,
      contribution: 0,
    };

    for (const q of QUESTIONS) {
      const v = answers[q.id];
      if (v !== null) {
        sums[q.need] += v;
        counts[q.need] += 1;
      }
    }

    // Convert to 0–100 based on average (1–5)
    const normalized = (Object.keys(sums) as NeedKey[]).map((k) => {
      const avg = counts[k] ? sums[k] / counts[k] : 0;
      const pct = counts[k] ? ((avg - 1) / 4) * 100 : 0;
      return { key: k, label: NEED_LABELS[k], avg, pct: clamp(Math.round(pct), 0, 100) };
    });

    normalized.sort((a, b) => b.pct - a.pct);
    return normalized;
  }, [answers]);

  const topNeeds = useMemo(() => {
    const top1 = scores[0]?.key;
    const top2 = scores[1]?.key;
    return { top1, top2 } as { top1?: NeedKey; top2?: NeedKey };
  }, [scores]);

  useEffect(() => {
    if (!submitted) return;
    // Auto-scroll: first to results, then to top1 interpretation.
    const t = setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => top1Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 600);
    }, 200);
    return () => clearTimeout(t);
  }, [submitted]);

  const canSubmit = completedCount === QUESTIONS.length && !!email;

  const onReset = () => {
    setAnswers(
      QUESTIONS.reduce((acc, q) => {
        acc[q.id] = null;
        return acc;
      }, {} as Record<string, number | null>)
    );
    setSubmitted(false);
    // keep name
  };

    const handleCheckPayment = async () => {
    setIsCheckingPayment(true);
    setShowPaywall(false);

    try {
      const response = await fetch(`/api/verify-payment?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.paid) {
        // Payment verified - show results
        setSubmitted(true);
        setShowPaywall(false);
      } else {
        // Payment not found - show paywall
        setShowPaywall(true);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      // On error, show paywall to be safe
      setShowPaywall(true);
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const reportFilename = useMemo(() => {
    const safeName = (name || "Sample").trim().replace(/\s+/g, "-");
    return `Career-Motivation-Map-${safeName}.pdf`;
  }, [name]);

  const today = useMemo(() => formatDateHuman(new Date()), []);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Career Motivation Map</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                21-question assessment • 7 minutes • Receive a personalized interpretation and export it as a PDF.
              </p>
            </div>
            <Badge variant="secondary" className="mt-1">
              MVP
            </Badge>
          </div>
        </header>

        {!submitted ? (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Start your assessment</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Rate each statement from 1 (Not at all) to 5 (Very much). Answer instinctively.
                    </p>
                  </div>
                  <div className="w-44">
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                </div>

                <div className="max-w-sm space-y-3">
                  <div>
                    <label className="text-sm font-medium">First name</label>
                    <Input
                      className="mt-1"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Alex"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email address</label>
                    <Input
                      type="email"
                      className="mt-1"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      We’ll send your PDF report to this email. No marketing emails, no strings attached.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-6">
                  {QUESTIONS.map((q, idx) => {
                    const v = answers[q.id];
                    return (
                      <div key={q.id} className="rounded-2xl border p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-xs text-muted-foreground">
                              Question {idx + 1} of {QUESTIONS.length}
                            </div>
                            <div className="mt-1 text-base font-medium">{q.text}</div>
                            <div className="mt-1 text-xs text-muted-foreground">Maps to: {NEED_LABELS[q.need]}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
                          {SCALE.map((s) => (
                            <label
                              key={s.v}
                              className={
                                "flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-sm transition hover:bg-muted " +
                                (v === s.v ? "border-green-600 bg-green-100" : "")
                              }
                            >
                              <input
                                type="radio"
                                name={q.id}
                                value={s.v}
                                className="sr-only"
                                checked={v === s.v}
                                onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: s.v }))}
                              />
                              <span className="text-center">{s.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <Button
                onClick={handleCheckPayment}
                disabled={!canSubmit || isCheckingPayment}
                className={"rounded-2xl " + (canSubmit ? "bg-green-600 hover:bg-green-700 text-white" : "")}
              >
                <span>{isCheckingPayment ? "Checking payment..." : "See my results"}</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
                                {showPaywall && (
                <Card className="mt-4 rounded-2xl border-2 border-amber-200 bg-amber-50">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-semibold text-amber-900">Payment required</h3>
                    <p className="mt-3 text-sm text-amber-800">
                      To view your results and download your PDF report, please complete payment.
                    </p>
                    <Button
                      className="mt-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white"
                      onClick={() => window.open('https://buy.stripe.com/6oU5kbdZy3Jkce61b50Jq00', '_blank')}
                    >
                      Complete payment
                    </Button>
                  </CardContent>
                </Card>
              )}
                          </div>
