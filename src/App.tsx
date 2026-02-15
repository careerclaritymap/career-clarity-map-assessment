import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Download, ArrowRight, RotateCcw, CheckCircle2, Target, Calendar } from "lucide-react";
import emailjs from "@emailjs/browser";

type NeedKey = "certainty" | "variety" | "significance" | "connection" | "growth" | "contribution";

type Question = {
  id: string;
  text: string;
  need: NeedKey;
};

interface MotivationInfo {
  title: string;
  description: string;
  seek: string[];
  avoid: string[];
  reflection: string[];
  actionSteps: string[];
}

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
  { id: "q11", need: "connection", text: "Strong relationships with my colleagues are essential for my happiness at work." },
  { id: "q12", need: "connection", text: "I prefer collaborative environments over working entirely in isolation." },
  { id: "q13", need: "connection", text: "Feeling like I belong to a team or community is a top priority." },
  { id: "q14", need: "growth", text: "I constantly seek opportunities to learn new skills and improve myself." },
  { id: "q15", need: "growth", text: "I feel stagnant if I’m not being pushed out of my comfort zone." },
  { id: "q16", need: "growth", text: "Personal and professional development are more important than just a steady paycheck." },
  { id: "q17", need: "growth", text: "I enjoy tasks that require deep thinking and problem-solving." },
  { id: "q18", need: "contribution", text: "I want my work to have a positive impact on others or the world." },
  { id: "q19", need: "contribution", text: "Helping others succeed gives me a deep sense of fulfillment." },
  { id: "q20", need: "contribution", text: "I care about the 'why' behind my work more than the specific tasks." },
  { id: "q21", need: "contribution", text: "Generosity and giving back are core values in my career." },
];

const MOTIVATIONS: Record<NeedKey, MotivationInfo> = {
  certainty: {
    title: "Certainty & Stability",
    description: "You thrive when you have a clear roadmap and a stable environment. Your primary driver is the need for security, order, and predictability. You are excellent at creating systems and ensuring that things run smoothly and reliably.",
    seek: ["Standard Operating Procedures (SOPs)", "Long-term security and benefits", "Clear hierarchies and reporting lines", "Predictable schedules"],
    avoid: ["Constant 'pivoting' without clear reasons", "Unstructured environments", "High-risk startups without a plan", "Ambiguous job descriptions"],
    reflection: ["How can I create more structure in my current role?", "What systems can I build to reduce daily stress?"],
    actionSteps: [
      "Document your core processes to create a 'Standard Operating Procedure' for your role.",
      "Schedule a 1-on-1 with your manager to clarify long-term expectations and KPIs.",
      "Create a 'buffer' in your schedule to handle unexpected tasks without losing focus.",
      "Review your financial plan to ensure your need for security is met outside of work.",
      "Identify one area of ambiguity in your project and proactively define its boundaries."
    ]
  },
  variety: {
    title: "Variety & Adventure",
    description: "Routine is your enemy. You need frequent changes in tasks, environments, or challenges to stay engaged. You are likely a natural problem solver who enjoys 'firefighting' or exploring new territories.",
    seek: ["Diverse projects and tasks", "Travel or remote work flexibility", "Cross-departmental collaboration", "Opportunities for innovation"],
    avoid: ["Highly repetitive data entry", "Static roles with no growth", "Strict 9-to-5 desk environments", "Micromanagement"],
    reflection: ["What new skill can I start learning this week?", "How can I introduce more variety into my daily routine?"],
    actionSteps: [
      "Volunteer for a cross-functional project outside your immediate department.",
      "Redesign your workspace or change your working location twice a week.",
      "Pitch a 'pilot project' for a new tool or methodology you've discovered.",
      "Set a goal to learn one new technical or soft skill every month.",
      "Request a rotation of tasks with a colleague to experience a different perspective."
    ]
  },
  significance: {
    title: "Significance & Achievement",
    description: "You are driven by the desire to be unique, important, and recognized for your excellence. You thrive on feedback, measurable results, and the feeling that your contribution is vital to the organization's success.",
    seek: ["Leadership opportunities", "Public recognition and awards", "High-visibility projects", "Clear paths to promotion"],
    avoid: ["Behind-the-scenes roles with no credit", "Generalist roles where you're 'just a number'", "Lack of performance feedback", "Flat organizational structures"],
    reflection: ["What are the top 3 wins I've achieved this month?", "Who needs to know about the impact I'm having?"],
    actionSteps: [
      "Keep a 'Wins Journal' and share a monthly summary with your leadership team.",
      "Take ownership of a high-stakes project that has clear, measurable outcomes.",
      "Apply for an industry award or a speaking slot at an internal event.",
      "Identify a mentor who has reached the level of influence you aspire to.",
      "Clearly define your unique selling proposition (USP) within the company."
    ]
  },
  connection: {
    title: "Connection & Belonging",
    description: "For you, work is about people. You thrive in collaborative, supportive environments where you feel a sense of shared mission and deep personal connection with your colleagues.",
    seek: ["Team-based projects", "Mentorship roles", "Collaborative tools and spaces", "Companies with a strong culture"],
    avoid: ["Highly competitive 'shark' cultures", "Isolated remote roles without social contact", "Transactional communication", "Siloed departments"],
    reflection: ["Who can I help or support today?", "How can I strengthen my relationship with my key stakeholders?"],
    actionSteps: [
      "Organize a casual coffee chat or team-building activity once a week.",
      "Become a mentor to a new hire or a junior team member.",
      "Initiate a collaborative brainstorming session for a shared challenge.",
      "Send at least three 'shout-outs' or notes of appreciation to colleagues weekly.",
      "Participate in or lead an internal community or employee resource group."
    ]
  },
  growth: {
    title: "Growth & Learning",
    description: "You have an insatiable hunger for progress. If you aren't learning, you're dying (professionally). You value challenges that force you to expand your capabilities and evolve into a better version of yourself.",
    seek: ["Challenging assignments", "Budget for courses and conferences", "Intellectually stimulating work", "A culture of continuous feedback"],
    avoid: ["'Comfort zone' roles with no new skills", "Static technology stacks", "Repetitive tasks you've already mastered", "Lack of professional development"],
    reflection: ["Where am I being challenged the most right now?", "What is the biggest gap in my knowledge that I want to close?"],
    actionSteps: [
      "Dedicate 4 hours a week (Deep Work) to learning a complex new skill.",
      "Request a 360-degree feedback review to identify your growth areas.",
      "Enroll in an advanced certification or professional development program.",
      "Teach a 'Lunch and Learn' session on a topic you are currently mastering.",
      "Set a 'stretch goal' for your next project that feels slightly beyond your current reach."
    ]
  },
  contribution: {
    title: "Contribution & Impact",
    description: "You are focused on the 'Big Picture'. You need to know that your work is serving a purpose beyond yourself or even the company. You find meaning in giving, helping, and creating a positive legacy.",
    seek: ["Mission-driven organizations", "CSR (Corporate Social Responsibility) initiatives", "Roles with direct impact on end-users", "Ethical and sustainable projects"],
    avoid: ["Purely profit-driven companies", "Work that feels 'meaningless' or harmful", "Lack of transparency about company impact", "Self-centered leadership"],
    reflection: ["How does my daily work improve someone else's life?", "What legacy do I want to leave in my professional career?"],
    actionSteps: [
      "Identify one way to make your current project more sustainable or ethical.",
      "Connect directly with an end-user to hear how your work has helped them.",
      "Lead a charity or volunteering initiative within your organization.",
      "Advocate for a more mission-aligned approach in your team's strategy.",
      "Create a 'Mission Statement' for your own role that focuses on the value you give."
    ]
  }
};

const App = () => {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<NeedKey, number>>({
    certainty: 0,
    variety: 0,
    significance: 0,
    connection: 0,
    growth: 0,
    contribution: 0,
  });
  const [showResults, setShowResults] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalQuestions = QUESTIONS.length;
  const progress = ((currentStep) / totalQuestions) * 100;

  const handleAnswer = (value: number) => {
    const question = QUESTIONS[currentStep];
    setScores(prev => ({
      ...prev,
      [question.need]: prev[question.need] + value
    }));

    if (currentStep < totalQuestions - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const sortedResults = useMemo(() => {
    return Object.entries(scores)
      .map(([key, score]) => ({
        key: key as NeedKey,
        score,
        percentage: Math.round((score / (QUESTIONS.filter(q => q.need === key).length * 5)) * 100)
      }))
      .sort((a, b) => b.score - a.score);
  }, [scores]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const templateParams = {
        to_email: email,
        results_summary: sortedResults.map(r => `${NEED_LABELS[r.key]}: ${r.percentage}%`).join("
"),
        primary_driver: MOTIVATIONS[sortedResults[0].key].title,
        secondary_driver: MOTIVATIONS[sortedResults[1].key].title,
        full_results_link: window.location.href,
      };

      await emailjs.send(
        "service_id", // Replace with your Service ID
        "template_id", // Replace with your Template ID
        templateParams,
        "public_key" // Replace with your Public Key
      );
      setSubmitted(true);
    } catch (error) {
      console.error("Email failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!started) {
    return (
      <div className=\"min-h-screen bg-slate-50 flex items-center justify-center p-4\">
        <Card className=\"max-w-2xl w-full\">
          <CardContent className=\"pt-12 pb-12 text-center\">
            <Badge className=\"mb-4 px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none\">Career Strategy Tool</Badge>
            <h1 className=\"text-4xl font-bold mb-4 text-slate-900\">Career Clarity Map</h1>
            <p className=\"text-xl text-slate-600 mb-8\">Discover your core professional drivers and build a career that truly fits you.</p>
            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8\">
              <div className=\"flex items-start gap-3\">
                <CheckCircle2 className=\"text-blue-600 mt-1 h-5 w-5 shrink-0\" />
                <p className=\"text-slate-600\">Identify what truly motivates you at work</p>
              </div>
              <div className=\"flex items-start gap-3\">
                <CheckCircle2 className=\"text-blue-600 mt-1 h-5 w-5 shrink-0\" />
                <p className=\"text-slate-600\">30+ actionable steps for your career growth</p>
              </div>
              <div className=\"flex items-start gap-3\">
                <CheckCircle2 className=\"text-blue-600 mt-1 h-5 w-5 shrink-0\" />
                <p className=\"text-slate-600\">Custom 30-day personalized action plan</p>
              </div>
              <div className=\"flex items-start gap-3\">
                <CheckCircle2 className=\"text-blue-600 mt-1 h-5 w-5 shrink-0\" />
                <p className=\"text-slate-600\">Full PDF report with detailed analysis</p>
              </div>
            </div>
            <Button onClick={() => setStarted(true)} size=\"lg\" className=\"w-full md:w-auto px-12 h-14 text-lg bg-blue-600 hover:bg-blue-700\">
              Start My Assessment <ArrowRight className=\"ml-2 h-5 w-5\" />
            </Button>
            <p className=\"mt-4 text-sm text-slate-400 font-medium\">Takes about 3 minutes • 21 Questions</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className=\"min-h-screen bg-slate-50 py-12 px-4\">
        <div className=\"max-w-4xl mx-auto space-y-8\">
          <div className=\"text-center space-y-2\">
            <h1 className=\"text-3xl font-bold text-slate-900\">Your Career Clarity Map</h1>
            <p className=\"text-slate-500\">Analysis of your core professional motivations</p>
          </div>

          <Card className=\"overflow-hidden border-none shadow-lg\">
            <div className=\"bg-blue-600 p-8 text-white\">
              <h2 className=\"text-xl font-semibold mb-6 opacity-90\">Motivation Overview</h2>
              <div className=\"space-y-6\">
                {sortedResults.map((result) => (
                  <div key={result.key} className=\"space-y-2\">
                    <div className=\"flex justify-between text-sm font-medium\">
                      <span>{NEED_LABELS[result.key]}</span>
                      <span>{result.percentage}%</span>
                    </div>
                    <Progress value={result.percentage} className=\"h-2 bg-blue-400/30 indicator-white\" />
                  </div>
                ))}
              </div>
            </div>

            <CardContent className=\"p-8 bg-white\">
              <div className=\"flex flex-col md:flex-row gap-6 items-center justify-between mb-8 p-6 bg-blue-50 rounded-xl border border-blue-100\">
                <div className=\"space-y-1 text-center md:text-left\">
                  <p className=\"text-sm font-semibold text-blue-600 uppercase tracking-wider\">Primary Driver</p>
                  <h3 className=\"text-2xl font-bold text-slate-900\">{MOTIVATIONS[sortedResults[0].key].title}</h3>
                </div>
                {!submitted ? (
                  <form onSubmit={handleEmailSubmit} className=\"flex flex-col sm:flex-row gap-2 w-full md:w-auto\">
                    <Input 
                      type=\"email\" 
                      placeholder=\"Enter email for full report\" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className=\"min-w-[240px]\"
                    />
                    <Button type=\"submit\" disabled={isSubmitting} className=\"bg-blue-600 hover:bg-blue-700\">
                      {isSubmitting ? \"Sending...\" : \"Get Full PDF Report\"}
                    </Button>
                  </form>
                ) : (
                  <div className=\"flex items-center gap-2 text-green-600 font-medium bg-green-50 px-4 py-2 rounded-lg\">
                    <CheckCircle2 className=\"h-5 w-5\" /> Report sent! Check your inbox.
                  </div>
                )}
              </div>

              {/* 30-Day Action Plan Section */}
              <div className=\"mb-12 space-y-6\">
                <div className=\"flex items-center gap-2 mb-4\">
                  <Calendar className=\"text-blue-600 h-6 w-6\" />
                  <h2 className=\"text-2xl font-bold text-slate-900\">Your Personalized 30-Day Action Plan</h2>
                </div>
                
                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                  <div className=\"p-5 border border-slate-200 rounded-xl space-y-3\">
                    <div className=\"flex items-center gap-2\">
                      <Badge className=\"bg-slate-900\">Week 1</Badge>
                      <h4 className=\"font-bold\">Assessment & Awareness</h4>
                    </div>
                    <p className=\"text-sm text-slate-600\">Focus on observing how your top drivers ({MOTIVATIONS[sortedResults[0].key].title}) manifest in your current daily tasks. Note down energy-draining vs. energy-giving moments.</p>
                  </div>
                  
                  <div className=\"p-5 border border-blue-200 bg-blue-50/50 rounded-xl space-y-3\">
                    <div className=\"flex items-center gap-2\">
                      <Badge className=\"bg-blue-600\">Week 2</Badge>
                      <h4 className=\"font-bold\">Quick Wins</h4>
                    </div>
                    <p className=\"text-sm text-slate-600\">Implement the first two action steps from your Primary Driver profile: \"{MOTIVATIONS[sortedResults[0].key].actionSteps[0]}\"</p>
                  </div>
                  
                  <div className=\"p-5 border border-slate-200 rounded-xl space-y-3\">
                    <div className=\"flex items-center gap-2\">
                      <Badge className=\"bg-slate-900\">Week 3</Badge>
                      <h4 className=\"font-bold\">Strategic Planning</h4>
                    </div>
                    <p className=\"text-sm text-slate-600\">Review your Secondary Driver ({MOTIVATIONS[sortedResults[1].key].title}) and identify one structural change you can propose to your manager to better align with it.</p>
                  </div>
                  
                  <div className=\"p-5 border border-slate-200 rounded-xl space-y-3\">
                    <div className=\"flex items-center gap-2\">
                      <Badge className=\"bg-slate-900\">Week 4</Badge>
                      <h4 className=\"font-bold\">Commitment & Accountability</h4>
                    </div>
                    <p className=\"text-sm text-slate-600\">Establish a monthly check-in habit. Review your 'Wins Journal' and set growth targets for the next quarter based on your motivators.</p>
                  </div>
                </div>
                
                <div className=\"bg-amber-50 border border-amber-100 p-4 rounded-lg flex items-start gap-3\">
                  <Target className=\"text-amber-600 h-5 w-5 mt-0.5\" />
                  <p className=\"text-sm text-amber-800\"><span className=\"font-bold\">Pro Tip:</span> Share these results with your manager. 72% of professionals report higher satisfaction when their leaders understand their core drivers.</p>
                </div>
              </div>

              <Separator className=\"my-12\" />

              <div className=\"space-y-16\">
                <h2 className=\"text-2xl font-bold text-slate-900 text-center mb-8\">Complete Motivation Profile</h2>
                {sortedResults.map((result, index) => {
                  const info = MOTIVATIONS[result.key];
                  const strengthLabel = index === 0 ? \"Primary Driver\" : index === 1 ? \"Important Factor\" : index < 4 ? \"Moderate Need\" : \"Lower Priority\";
                  const strengthColor = index === 0 ? \"bg-blue-600\" : index === 1 ? \"bg-blue-500\" : index < 4 ? \"bg-slate-600\" : \"bg-slate-400\";

                  return (
                    <div key={result.key} className=\"space-y-6 pb-12 border-b border-slate-100 last:border-0\">
                      <div className=\"flex flex-wrap items-center justify-between gap-4\">
                        <div className=\"space-y-1\">
                          <div className=\"flex items-center gap-2\">
                            <h3 className=\"text-2xl font-bold text-slate-900\">{info.title}</h3>
                            <Badge className={`${strengthColor} text-white border-none`}>{strengthLabel}</Badge>
                          </div>
                          <p className=\"text-slate-500\">{NEED_LABELS[result.key]}</p>
                        </div>
                        <div className=\"text-3xl font-bold text-slate-300\">{result.percentage}%</div>
                      </div>

                      <p className=\"text-lg text-slate-700 leading-relaxed\">{info.description}</p>

                      <div className=\"grid grid-cols-1 md:grid-cols-2 gap-8\">
                        <div className=\"space-y-4 bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100\">
                          <h4 className=\"font-bold text-emerald-800 flex items-center gap-2\">
                            <div className=\"h-1.5 w-1.5 rounded-full bg-emerald-500\" />
                            What to Seek
                          </h4>
                          <ul className=\"space-y-2\">
                            {info.seek.map((item, i) => (
                              <li key={i} className=\"text-sm text-emerald-700 flex items-start gap-2 italic\">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className=\"space-y-4 bg-rose-50/50 p-6 rounded-2xl border border-rose-100\">
                          <h4 className=\"font-bold text-rose-800 flex items-center gap-2\">
                            <div className=\"h-1.5 w-1.5 rounded-full bg-rose-500\" />
                            What to Avoid
                          </h4>
                          <ul className=\"space-y-2\">
                            {info.avoid.map((item, i) => (
                              <li key={i} className=\"text-sm text-rose-700 flex items-start gap-2 italic\">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className=\"bg-blue-50 border border-blue-100 p-6 rounded-2xl space-y-4\">
                        <h4 className=\"font-bold text-blue-900\">Top 5 Action Steps for {info.title}:</h4>
                        <div className=\"space-y-3\">
                          {info.actionSteps.map((step, i) => (
                            <div key={i} className=\"flex items-start gap-3\">
                              <div className=\"h-5 w-5 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5\">{i+1}</div>
                              <p className=\"text-sm text-blue-800\">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className=\"p-6 bg-slate-50 rounded-2xl border border-slate-100\">
                        <h4 className=\"font-bold text-slate-900 mb-4 italic\">Reflect on this:</h4>
                        <ul className=\"space-y-4\">
                          {info.reflection.map((q, i) => (
                            <li key={i} className=\"text-slate-600 border-l-2 border-slate-200 pl-4\">{q}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className=\"mt-12 pt-12 border-t border-slate-100 text-center space-y-6\">
                <div className=\"space-y-2\">
                  <h3 className=\"text-xl font-bold text-slate-900\">Ready to transform your career?</h3>
                  <p className=\"text-slate-500\">Use these insights to guide your next career move or improve your current role.</p>
                </div>
                <div className=\"flex flex-col sm:flex-row gap-4 justify-center\">
                  <Button onClick={() => window.location.reload()} variant=\"outline\" className=\"gap-2\">
                    <RotateCcw className=\"h-4 w-4\" /> Retake Assessment
                  </Button>
                  <Button className=\"bg-slate-900 hover:bg-slate-800 gap-2\">
                    <Download className=\"h-4 w-4\" /> Download Results as PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const question = QUESTIONS[currentStep];

  return (
    <div className=\"min-h-screen bg-slate-50 flex items-center justify-center p-4\">
      <Card className=\"max-w-2xl w-full shadow-xl border-none\">
        <div className=\"h-2 bg-slate-100 w-full\">
          <div 
            className=\"h-full bg-blue-600 transition-all duration-500 ease-out\"
            style={{ width: `${progress}%` }}
          />
        </div>
        <CardContent className=\"p-8 md:p-12\">
          <div className=\"flex justify-between items-center mb-10\">
            <span className=\"text-sm font-bold text-slate-400 uppercase tracking-widest\">Question {currentStep + 1} of {totalQuestions}</span>
            <Badge variant=\"secondary\" className=\"bg-slate-100 text-slate-600 border-none\">{NEED_LABELS[question.need]}</Badge>
          </div>
          
          <h2 className=\"text-2xl md:text-3xl font-bold text-slate-900 mb-12 leading-tight\">
            {question.text}
          </h2>

          <div className=\"grid grid-cols-1 gap-3\">
            {[
              { label: \"Strongly Agree\", value: 5, color: \"bg-blue-600 hover:bg-blue-700 text-white\" },
              { label: \"Agree\", value: 4, color: \"bg-white hover:bg-slate-50 border-slate-200 text-slate-700\" },
              { label: \"Neutral\", value: 3, color: \"bg-white hover:bg-slate-50 border-slate-200 text-slate-700\" },
              { label: \"Disagree\", value: 2, color: \"bg-white hover:bg-slate-50 border-slate-200 text-slate-700\" },
              { label: \"Strongly Disagree\", value: 1, color: \"bg-white hover:bg-slate-50 border-slate-200 text-slate-700\" },
            ].map((option) => (
              <Button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                variant=\"outline\"
                className={`h-16 text-lg font-medium justify-start px-8 rounded-xl transition-all duration-200 ${option.color}`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
