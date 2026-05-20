"use client";

import { useState, useEffect, useCallback } from "react";
import type { Question, CQQuestion, ShortQuestion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Printer, 
  FileText, 
  ListChecks, 
  ArrowLeft, 
  Trash2, 
  Edit2,
  LayoutGrid,
  Youtube,
  Facebook,
  Send,
  FileSpreadsheet,
  FileSignature,
  BookOpen,
  HelpCircle,
  Upload,
  Settings2
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

type AppMode = "MCQ" | "CQ" | "WRITTEN" | "BOTH" | "MCQ_WRITTEN" | null;
type FlowType = "SHEET" | "EXAM" | null;
type WatermarkType = "text" | "image";
type FooterMode = "social" | "plain" | "ribbon";

const DeveloperFooter = () => (
  <footer className="mt-auto py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2 no-print">
    <span>Developed By</span>
    <a 
      href="https://t.me/shu_yaib" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="flex items-center gap-1.5 font-bold text-primary hover:underline transition-all font-body"
    >
      <Send className="h-4 w-4" />
      Shu Yaib
    </a>
  </footer>
);

const PaperPreview = ({ 
  examName = "", 
  authorName = "", 
  examTime = "", 
  totalMarks = "", 
  mcqQuestions = [], 
  cqQuestions = [], 
  writtenQuestions = [],
  setName = "A", 
  mode = null,
  logoImage = null,
  showLogo = false,
  watermarkText = "",
  watermarkOpacity = 5,
  watermarkType = "text",
  watermarkImage = null,
  youtubeText = "",
  youtubeUrl = "",
  facebookText = "",
  facebookUrl = "",
  telegramText = "",
  telegramUrl = "",
  footerPlainText = "",
  footerMode = "ribbon",
  flowType = null,
  headerFontSize = 24,
  printFontSize = 11
}: {
  examName: string;
  authorName: string;
  examTime: string;
  totalMarks: string;
  mcqQuestions: Question[];
  cqQuestions: CQQuestion[];
  writtenQuestions: ShortQuestion[];
  setName: string;
  mode: AppMode;
  logoImage: string | null;
  showLogo: boolean;
  watermarkText: string;
  watermarkOpacity: number;
  watermarkType: WatermarkType;
  watermarkImage: string | null;
  youtubeText: string;
  youtubeUrl: string;
  facebookText: string;
  facebookUrl: string;
  telegramText: string;
  telegramUrl: string;
  footerPlainText: string;
  footerMode: FooterMode;
  flowType: FlowType;
  headerFontSize: number;
  printFontSize: number;
}) => {
  const optionLabels = ['ক', 'খ', 'গ', 'ঘ'];

  return (
    <div id="printable-area-wrapper" className="w-full flex justify-center">
      <div id="printable-area" className="w-full max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-lg shadow-lg print:shadow-none print:rounded-none print:p-0 min-h-[11in] print:min-h-0 relative flex flex-col">
        
        {/* Watermarks */}
        <div className="watermark-container-print hidden print:flex">
          {watermarkType === 'text' && watermarkText && (
            <div className="watermark-text" style={{ opacity: (watermarkOpacity || 0) / 100 }}>{watermarkText}</div>
          )}
          {watermarkType === 'image' && watermarkImage && (
            <img src={watermarkImage} alt="Watermark" className="watermark-image-el" style={{ opacity: (watermarkOpacity || 0) / 100 }} />
          )}
        </div>

        <div className="watermark-container print:hidden">
          {watermarkType === 'text' && watermarkText && (
            <div className="watermark-text" style={{ opacity: (watermarkOpacity || 0) / 100 }}>{watermarkText}</div>
          )}
          {watermarkType === 'image' && watermarkImage && (
            <img src={watermarkImage} alt="Watermark" className="watermark-image-el" style={{ opacity: (watermarkOpacity || 0) / 100 }} />
          )}
        </div>

        {/* Header - First Page Only */}
        <header className="exam-header-print relative z-10 w-full mb-4">
          <div className="flex flex-col items-center justify-center text-center relative">
            {showLogo && logoImage && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-14 w-14 no-print sm:flex hidden">
                <img src={logoImage} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <h1 className="font-bold print:leading-tight" style={{ fontSize: `${headerFontSize}px` }}>{examName}</h1>
            <p className="text-lg font-medium print:text-sm mt-1">{authorName}</p>
          </div>
          
          <div className="border-t-2 border-black my-2 w-full"></div>
          
          {flowType === "EXAM" && (
            <>
              <div className="flex justify-between items-center px-2 font-bold text-sm meta-line-print">
                <span>পূর্ণমান: {totalMarks}</span>
                <span>সেট: {setName}</span>
                <span>সময়: {examTime}</span>
              </div>
              <div className="border-t-2 border-black mt-1.5 w-full"></div>
            </>
          )}
        </header>

        {/* Content Section */}
        <section className="mt-2 relative z-10 flex-grow" style={{ fontSize: `${printFontSize}px` }}>
          {(mode === "MCQ" || mode === "BOTH" || mode === "MCQ_WRITTEN") && mcqQuestions.length > 0 && (
            <div className="two-column-container-print">
              {mcqQuestions.map((q, index) => (
                <article key={index} className="mb-5 question-item-print break-inside-avoid">
                  <div className="flex items-start">
                    <span className="font-bold mr-1.5">{index + 1}.</span>
                    <div className="flex-1">
                      <p className="font-bold mb-1 leading-snug">{q.question}</p>
                      <ul className="options-grid-print">
                        {q.options?.map((option, optIndex) => (
                          <li key={optIndex} className="flex items-start space-x-1.5 print-option-li">
                            <span className="font-medium">{optionLabels[optIndex]})</span>
                            <span className="flex-1">{option}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="answer-content">
                        {q.answer && <div className="font-bold">সঠিক উত্তর: {q.answer}</div>}
                        {q.explanation && <div>ব্যাখ্যা: {q.explanation}</div>}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {(mode === "CQ" || mode === "BOTH") && cqQuestions.length > 0 && (
            <div className="mt-6 space-y-8 print:space-y-4">
              {cqQuestions.map((q, index) => (
                <article key={index} className="question-item-print break-inside-avoid">
                  <p className="font-bold mb-2">{index + 1}. নিচের উদ্দীপকটি পড় এবং প্রশ্নগুলোর উত্তর দাও:</p>
                  {q.stimulus && <div className="mb-3 italic text-gray-700 bg-gray-50 p-3 rounded print:bg-white print:p-0">{q.stimulus}</div>}
                  <div className="grid grid-cols-1 gap-y-2 pl-4">
                    <p><span className="font-bold">ক)</span> {q.parts?.a}</p>
                    <p><span className="font-bold">খ)</span> {q.parts?.b}</p>
                    <p><span className="font-bold">গ)</span> {q.parts?.c}</p>
                    <p><span className="font-bold">ঘ)</span> {q.parts?.d}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {(mode === "WRITTEN" || mode === "MCQ_WRITTEN") && writtenQuestions.length > 0 && (
            <div className="mt-6 two-column-container-print">
              {writtenQuestions.map((q, index) => (
                <article key={index} className="mb-5 question-item-print break-inside-avoid">
                  <div className="flex items-start">
                    <span className="font-bold mr-1.5">{index + 1}.</span>
                    <div className="flex-1">
                      <p className="mb-1 leading-snug font-bold">{q.question}</p>
                      <div className="answer-content-written" style={{ fontSize: 'inherit' }}>
                        {q.answer && <div className="text-gray-800">উত্তর: {q.answer}</div>}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Footer - Repeated on Every Page */}
        <footer className="mt-8 exam-footer-print hidden print:block relative z-10">
          {footerMode === 'ribbon' ? (
            <div className="footer-ribbon-container">
              <div className="ribbon-left">{footerPlainText || examName}</div>
              <div className="ribbon-divider"></div>
              <div className="ribbon-right">
                <span className="ribbon-page-num"></span>
              </div>
            </div>
          ) : footerMode === 'plain' ? (
            <div className="w-full text-center py-2 font-bold border-t border-black bg-white">
              {footerPlainText}
            </div>
          ) : (
            <div className="grid grid-cols-3 w-full border-t border-black py-2 bg-white">
              <div className="flex items-center gap-1.5 justify-center">
                {youtubeUrl && <><Youtube className="h-3 w-3 text-red-600" /><span className="text-[8pt]">{youtubeText || "YouTube"}</span></>}
              </div>
              <div className="flex items-center gap-1.5 justify-center">
                {telegramUrl && <><Send className="h-3 w-3 text-blue-500" /><span className="text-[8pt]">{telegramText || "Telegram"}</span></>}
              </div>
              <div className="flex items-center gap-1.5 justify-center">
                {facebookUrl && <><Facebook className="h-3 w-3 text-blue-600" /><span className="text-[8pt]">{facebookText || "Facebook"}</span></>}
              </div>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default function ExamPage() {
  const [flowType, setFlowType] = useState<FlowType>(null);
  const [mode, setMode] = useState<AppMode>(null);
  
  const [examName, setExamName] = useState("উদ্ভিদ শারীরতত্ত্ব");
  const [authorName, setAuthorName] = useState("Md Jubayer | রংপুর মেডিকেল কলেজ");
  const [examTime, setExamTime] = useState("২৫ মিনিট");
  const [totalMarks, setTotalMarks] = useState("২৫");
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [showLogo, setShowLogo] = useState(false);
  
  const [mcqQuestions, setMcqQuestions] = useState<Question[]>([]);
  const [cqQuestions, setCqQuestions] = useState<CQQuestion[]>([]);
  const [writtenQuestions, setWrittenQuestions] = useState<ShortQuestion[]>([]);
  
  const [jsonInput, setJsonInput] = useState("");
  const [previewAnswers, setPreviewAnswers] = useState(false);
  const [selectedSet, setSelectedSet] = useState("A");
  const [printFontSize, setPrintFontSize] = useState(11);
  const [headerFontSize, setHeaderFontSize] = useState(24);
  const [editingIndex, setEditingIndex] = useState<{type: 'MCQ' | 'CQ' | 'WRITTEN', index: number} | null>(null);

  const [watermarkType, setWatermarkType] = useState<WatermarkType>("text");
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null);
  const [watermarkOpacity, setWatermarkOpacity] = useState(5);

  const [footerMode, setFooterMode] = useState<FooterMode>("ribbon");
  const [footerPlainText, setFooterPlainText] = useState("রেটিনা গাইড");
  const [youtubeText, setYoutubeText] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [facebookText, setFacebookText] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [telegramText, setTelegramText] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    document.title = examName || "ExamPaperGen";
  }, [examName]);

  useEffect(() => {
    document.body.setAttribute('data-preview-answers', String(previewAnswers));
  }, [previewAnswers]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleJsonFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const json = JSON.parse(content);
          if (Array.isArray(json)) processJsonQuestions(json);
        } catch (err) {
          toast({ variant: "destructive", title: "Error", description: "Invalid JSON file." });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExport = (withAnswers: boolean) => {
    document.body.setAttribute('data-print-with-answers', String(withAnswers));
    setTimeout(() => window.print(), 500);
  };

  // Input states
  const [mcqQuestion, setMcqQuestion] = useState("");
  const [mcqOptions, setMcqOptions] = useState(["", "", "", ""]);
  const [mcqAnswer, setMcqAnswer] = useState("");
  const [mcqExplanation, setMcqExplanation] = useState("");
  const [cqStimulus, setCqStimulus] = useState("");
  const [cqPartA, setCqPartA] = useState("");
  const [cqPartB, setCqPartB] = useState("");
  const [cqPartC, setCqPartC] = useState("");
  const [cqPartD, setCqPartD] = useState("");
  const [writtenQuestion, setWrittenQuestion] = useState("");
  const [writtenAnswer, setWrittenAnswer] = useState("");

  const handleAddMcq = () => {
    if (!mcqQuestion) return;
    const newQ: Question = { question: mcqQuestion, options: mcqOptions, answer: mcqAnswer, explanation: mcqExplanation };
    if (editingIndex?.type === 'MCQ') {
      const updated = [...mcqQuestions]; updated[editingIndex.index] = newQ; setMcqQuestions(updated); setEditingIndex(null);
    } else setMcqQuestions([...mcqQuestions, newQ]);
    setMcqQuestion(""); setMcqOptions(["", "", "", ""]); setMcqAnswer(""); setMcqExplanation("");
  };

  const handleAddCq = () => {
    if (!cqPartA) return;
    const newQ: CQQuestion = { stimulus: cqStimulus, parts: { a: cqPartA, b: cqPartB, c: cqPartC, d: cqPartD } };
    if (editingIndex?.type === 'CQ') {
      const updated = [...cqQuestions]; updated[editingIndex.index] = newQ; setCqQuestions(updated); setEditingIndex(null);
    } else setCqQuestions([...cqQuestions, newQ]);
    setCqStimulus(""); setCqPartA(""); setCqPartB(""); setCqPartC(""); setCqPartD("");
  };

  const handleAddWritten = () => {
    if (!writtenQuestion) return;
    const newQ: ShortQuestion = { question: writtenQuestion, answer: writtenAnswer };
    if (editingIndex?.type === 'WRITTEN') {
      const updated = [...writtenQuestions]; updated[editingIndex.index] = newQ; setWrittenQuestions(updated); setEditingIndex(null);
    } else setWrittenQuestions([...writtenQuestions, newQ]);
    setWrittenQuestion(""); setWrittenAnswer("");
  };

  const handleEdit = (type: 'MCQ' | 'CQ' | 'WRITTEN', index: number) => {
    setEditingIndex({type, index});
    if (type === "MCQ") {
      const q = mcqQuestions[index]; setMcqQuestion(q.question || ""); setMcqOptions(q.options || ["","","",""]); setMcqAnswer(q.answer || ""); setMcqExplanation(q.explanation || "");
    } else if (type === "CQ") {
      const q = cqQuestions[index]; setCqStimulus(q.stimulus || ""); setCqPartA(q.parts?.a || ""); setCqPartB(q.parts?.b || ""); setCqPartC(q.parts?.c || ""); setCqPartD(q.parts?.d || "");
    } else {
      const q = writtenQuestions[index]; setWrittenQuestion(q.question || ""); setWrittenAnswer(q.answer || "");
    }
  };

  const processJsonQuestions = useCallback((json: any[]) => {
    const newMcqs: Question[] = []; const newCqs: CQQuestion[] = []; const newWritten: ShortQuestion[] = [];
    json.forEach(item => {
      if (!item) return;
      if (item.options && typeof item.options === 'object' && !Array.isArray(item.options)) {
        const optsObj = item.options as Record<string, string>;
        const ansKey = String(item.correct_answer || item.answer || "");
        const optionsArray = [optsObj.A || optsObj.a || "", optsObj.B || optsObj.b || "", optsObj.C || optsObj.c || "", optsObj.D || optsObj.d || ""];
        let finalAnswer = (ansKey.length === 1 && /[A-Da-d]/.test(ansKey)) ? (optsObj[ansKey.toUpperCase()] || optsObj[ansKey.toLowerCase()] || "") : ansKey;
        newMcqs.push({ question: item.question || "", options: optionsArray, answer: finalAnswer, explanation: item.explanation || "" });
      } else if (Array.isArray(item.options)) {
        newMcqs.push({ question: item.question || "", options: item.options, answer: item.answer || item.correct_answer || "", explanation: item.explanation || "" });
      } else if (item.parts) {
        newCqs.push(item as CQQuestion);
      } else if (item.question) {
        newWritten.push({ question: item.question, answer: item.answer || item.correct_answer || "" });
      }
    });
    setMcqQuestions(prev => [...prev, ...newMcqs]); setCqQuestions(prev => [...prev, ...newCqs]); setWrittenQuestions(prev => [...prev, ...newWritten]);
  }, []);

  if (!flowType) {
    return (
      <div className="min-h-screen flex flex-col bg-background p-4">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setFlowType("SHEET")}>
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 group-hover:bg-primary group-hover:text-white transition-colors"><FileSpreadsheet className="h-12 w-12" /></div>
                <CardTitle className="text-2xl font-headline">PDF Sheet</CardTitle>
                <CardDescription>প্রশ্ন সাজান (সেট/পূর্ণমান ছাড়া)</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setFlowType("EXAM")}>
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 group-hover:bg-primary group-hover:text-white transition-colors"><FileSignature className="h-12 w-12" /></div>
                <CardTitle className="text-2xl font-headline">প্রশ্নপত্র তৈরি</CardTitle>
                <CardDescription>প্রফেশনাল ফুল প্রশ্ন (সেট/পূর্ণমান সহ)</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
        <DeveloperFooter />
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="min-h-screen flex flex-col bg-background p-4">
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <Button variant="ghost" onClick={() => setFlowType(null)}><ArrowLeft className="mr-2 h-4 w-4" /> আগের ধাপে ফিরে যান</Button>
          <div className="max-w-5xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setMode("MCQ")}><CardHeader className="text-center"><ListChecks className="h-10 w-10 mx-auto mb-4" /><CardTitle className="font-headline">MCQ মোড</CardTitle></CardHeader></Card>
            <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setMode("CQ")}><CardHeader className="text-center"><FileText className="h-10 w-10 mx-auto mb-4" /><CardTitle className="font-headline">CQ মোড</CardTitle></CardHeader></Card>
            <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setMode("WRITTEN")}><CardHeader className="text-center"><BookOpen className="h-10 w-10 mx-auto mb-4" /><CardTitle className="font-headline">সংক্ষিপ্ত প্রশ্ন</CardTitle></CardHeader></Card>
            <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setMode("BOTH")}><CardHeader className="text-center"><LayoutGrid className="h-10 w-10 mx-auto mb-4" /><CardTitle className="font-headline">MCQ ও CQ</CardTitle></CardHeader></Card>
          </div>
        </div>
        <DeveloperFooter />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground font-body">
        <aside className="w-full lg:w-[420px] p-4 sm:p-6 border-b lg:border-r print:hidden no-print overflow-y-auto max-h-screen scrollbar-hide">
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setMode(null)}><ArrowLeft className="mr-2 h-4 w-4" /> আগের ধাপে ফিরে যান</Button>
            
            <Accordion type="multiple" defaultValue={["basic"]} className="space-y-4">
              <AccordionItem value="basic" className="border rounded-lg bg-white overflow-hidden shadow-sm">
                <AccordionTrigger className="px-4 py-3 font-bold text-lg font-headline">বেসিক সেটিংস</AccordionTrigger>
                <AccordionContent className="p-4 space-y-4">
                  <div className="space-y-1"><Label>পরীক্ষার নাম</Label><Input value={examName || ""} onChange={(e) => setExamName(e.target.value)} /></div>
                  <div className="space-y-1"><Label>পরিচালনায়</Label><Input value={authorName || ""} onChange={(e) => setAuthorName(e.target.value)} /></div>
                  {flowType === "EXAM" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><Label>সময়</Label><Input value={examTime || ""} onChange={(e) => setExamTime(e.target.value)} /></div>
                      <div className="space-y-1"><Label>পূর্ণমান</Label><Input value={totalMarks || ""} onChange={(e) => setTotalMarks(e.target.value)} /></div>
                    </div>
                  )}
                  <div className="space-y-1"><Label>প্রশ্ন সাইজ ({printFontSize}px)</Label><Slider min={8} max={40} step={0.5} value={[printFontSize]} onValueChange={(v) => setPrintFontSize(v[0])} /></div>
                  <div className="space-y-1"><Label>হেডার সাইজ ({headerFontSize}px)</Label><Slider min={12} max={60} step={1} value={[headerFontSize]} onValueChange={(v) => setHeaderFontSize(v[0])} /></div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="watermark" className="border rounded-lg bg-white overflow-hidden shadow-sm">
                <AccordionTrigger className="px-4 py-3 font-bold text-lg font-headline">ওয়াটারমার্ক</AccordionTrigger>
                <AccordionContent className="p-4 space-y-4">
                  <RadioGroup value={watermarkType || "text"} onValueChange={(val) => setWatermarkType(val as WatermarkType)} className="flex gap-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="text" id="wt-text" /><Label htmlFor="wt-text">টেক্সট</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="image" id="wt-image" /><Label htmlFor="wt-image">ইমেজ</Label></div>
                  </RadioGroup>
                  {watermarkType === "text" ? <Input placeholder="টেক্সট..." value={watermarkText || ""} onChange={(e) => setWatermarkText(e.target.value)} /> : <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setWatermarkImage)} />}
                  <div className="space-y-1"><Label className="text-xs">অপাাসিটি ({watermarkOpacity}%)</Label><Slider min={0} max={50} value={[watermarkOpacity]} onValueChange={(v) => setWatermarkOpacity(v[0])} /></div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="footer" className="border rounded-lg bg-white overflow-hidden shadow-sm">
                <AccordionTrigger className="px-4 py-3 font-bold text-lg font-headline">ফুটার সেটিংস</AccordionTrigger>
                <AccordionContent className="p-4 space-y-4">
                  <RadioGroup value={footerMode || "ribbon"} onValueChange={(v) => setFooterMode(v as FooterMode)} className="flex flex-col gap-2 mb-2">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="ribbon" id="fm-ribbon" /><Label htmlFor="fm-ribbon">প্রফেশনাল রিবন (বইয়ের মতো)</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="social" id="fm-social" /><Label htmlFor="fm-social">সোশ্যাল লিংক</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="plain" id="fm-plain" /><Label htmlFor="fm-plain">সেন্টার টেক্সট</Label></div>
                  </RadioGroup>
                  <Input placeholder="ফুটার মেইন টেক্সট..." value={footerPlainText || ""} onChange={(e) => setFooterPlainText(e.target.value)} />
                  {footerMode === 'social' && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-2"><Input placeholder="Youtube" value={youtubeText || ""} onChange={(e) => setYoutubeText(e.target.value)} /><Input placeholder="Link" value={youtubeUrl || ""} onChange={(e) => setYoutubeUrl(e.target.value)} /></div>
                      <div className="grid grid-cols-2 gap-2"><Input placeholder="Facebook" value={facebookText || ""} onChange={(e) => setFacebookText(e.target.value)} /><Input placeholder="Link" value={facebookUrl || ""} onChange={(e) => setFacebookUrl(e.target.value)} /></div>
                      <div className="grid grid-cols-2 gap-2"><Input placeholder="Telegram" value={telegramText || ""} onChange={(e) => setTelegramText(e.target.value)} /><Input placeholder="Link" value={telegramUrl || ""} onChange={(e) => setTelegramUrl(e.target.value)} /></div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4"><TabsTrigger value="manual" className="font-headline">ম্যানুয়াল</TabsTrigger><TabsTrigger value="json" className="font-headline">JSON</TabsTrigger></TabsList>
              <TabsContent value="manual">
                <Card><CardHeader><CardTitle className="font-headline">{editingIndex ? "এডিট করুন" : "নতুন প্রশ্ন"}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs defaultValue="mcq">
                      <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="mcq">MCQ</TabsTrigger><TabsTrigger value="cq">CQ</TabsTrigger><TabsTrigger value="written">Short</TabsTrigger></TabsList>
                      <TabsContent value="mcq" className="space-y-3">
                        <Input placeholder="প্রশ্ন..." value={mcqQuestion || ""} onChange={(e) => setMcqQuestion(e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">{mcqOptions.map((opt, i) => <Input key={i} placeholder={`বিকল্প ${['ক', 'খ', 'গ', 'ঘ'][i]}`} value={opt || ""} onChange={(e) => { const n = [...mcqOptions]; n[i] = e.target.value; setMcqOptions(n); }} />)}</div>
                        <Select value={mcqAnswer || ""} onValueChange={setMcqAnswer}><SelectTrigger><SelectValue placeholder="সঠিক উত্তর" /></SelectTrigger><SelectContent>{mcqOptions.map((opt, i) => opt && <SelectItem key={i} value={opt}>{['ক', 'খ', 'গ', 'ঘ'][i]}) {opt}</SelectItem>)}</SelectContent></Select>
                        <Button className="w-full font-headline" onClick={handleAddMcq}>{editingIndex ? "আপডেট" : "যুক্ত করুন"}</Button>
                      </TabsContent>
                      <TabsContent value="cq" className="space-y-3">
                        <Textarea placeholder="উদ্দীপক..." value={cqStimulus || ""} onChange={(e) => setCqStimulus(e.target.value)} />
                        <div className="grid grid-cols-1 gap-2"><Input placeholder="ক) প্রশ্ন" value={cqPartA || ""} onChange={(e) => setCqPartA(e.target.value)} /><Input placeholder="খ) প্রশ্ন" value={cqPartB || ""} onChange={(e) => setCqPartB(e.target.value)} /><Input placeholder="গ) প্রশ্ন" value={cqPartC || ""} onChange={(e) => setCqPartC(e.target.value)} /><Input placeholder="ঘ) প্রশ্ন" value={cqPartD || ""} onChange={(e) => setCqPartD(e.target.value)} /></div>
                        <Button className="w-full font-headline" onClick={handleAddCq}>{editingIndex ? "আপডেট" : "যুক্ত করুন"}</Button>
                      </TabsContent>
                      <TabsContent value="written" className="space-y-3">
                        <Input placeholder="প্রশ্ন..." value={writtenQuestion || ""} onChange={(e) => setWrittenQuestion(e.target.value)} />
                        <Textarea placeholder="উত্তর..." value={writtenAnswer || ""} onChange={(e) => setWrittenAnswer(e.target.value)} />
                        <Button className="w-full font-headline" onClick={handleAddWritten}>{editingIndex ? "আপডেট" : "যুক্ত করুন"}</Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="json" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="font-headline">JSON ইনপুট</CardTitle>
                    <Dialog><DialogTrigger asChild><Button variant="ghost" size="icon"><HelpCircle className="h-5 w-5" /></Button></DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto"><DialogHeader><DialogTitle className="font-headline">JSON টেমপ্লেট</DialogTitle></DialogHeader>
                        <div className="space-y-6"><pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">{`[ { "question": "...", "answer": "..." } ]`}</pre></div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input type="file" accept=".json" onChange={handleJsonFileUpload} />
                    <Textarea placeholder="JSON অ্যারে..." value={jsonInput || ""} onChange={(e) => setJsonInput(e.target.value)} className="h-32 font-mono text-xs" />
                    <Button className="w-full font-headline" onClick={() => { try { const j = JSON.parse(jsonInput); if (Array.isArray(j)) processJsonQuestions(j); setJsonInput(""); } catch(e) {} }}>যুক্ত করুন</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="space-y-3 pt-4 border-t">
              <div className="grid grid-cols-2 gap-2">
                <Button className="w-full font-headline" onClick={() => handleExport(true)}><Printer className="mr-2 h-4 w-4" /> উত্তরসহ PDF</Button>
                <Button variant="secondary" className="w-full font-headline" onClick={() => handleExport(false)}><FileText className="mr-2 h-4 w-4" /> উত্তর ছাড়া PDF</Button>
              </div>
              <div className="flex items-center justify-between border p-3 bg-white rounded-lg"><Label className="font-bold">উত্তর প্রিভিউ</Label><Switch checked={previewAnswers} onCheckedChange={setPreviewAnswers} /></div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-8 bg-gray-100/50 overflow-y-auto print:bg-white print:p-0">
          <PaperPreview {...{ examName, authorName, examTime, totalMarks, mcqQuestions, cqQuestions, writtenQuestions, setName: selectedSet, mode, logoImage, showLogo, watermarkText, watermarkOpacity, watermarkType, watermarkImage, youtubeText, youtubeUrl, facebookText, facebookUrl, telegramText, telegramUrl, footerPlainText, footerMode, flowType, headerFontSize, printFontSize }} />
        </main>
      </div>
      <DeveloperFooter />
    </>
  );
}
