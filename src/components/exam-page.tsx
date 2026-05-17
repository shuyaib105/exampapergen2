"use client";

import { useState, useEffect } from "react";
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
  Upload
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

const DeveloperFooter = () => (
  <footer className="DeveloperFooter_wrapper mt-auto py-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2 no-print">
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
  flowType = null
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
  flowType: FlowType;
}) => {
  const ensureAbsoluteUrl = (url: string) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://${trimmed}`;
  };

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

        {/* Header - Only on first page */}
        <header className="exam-header-print relative z-10 w-full mb-4">
          <div className="flex flex-col items-center justify-center text-center relative">
            {showLogo && logoImage && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-14 w-14 no-print sm:flex hidden">
                <img src={logoImage} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <h1 className="text-2xl font-bold print:text-xl">{examName}</h1>
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
        <section className="mt-2 relative z-10 flex-grow">
          {(mode === "MCQ" || mode === "BOTH" || mode === "MCQ_WRITTEN") && mcqQuestions.length > 0 && (
            <div className="mcq-container-print">
              {mcqQuestions.map((q, index) => (
                <article key={index} className="mb-5 question-item-print break-inside-avoid">
                  <div className="flex items-start">
                    <span className="font-bold mr-1.5">{index + 1}.</span>
                    <div className="flex-1">
                      <p className="font-bold mb-1 leading-snug">{q.question}</p>
                      <ul className="options-grid-print">
                        {q.options.map((option, optIndex) => (
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
                    <p><span className="font-bold">ক)</span> {q.parts.a}</p>
                    <p><span className="font-bold">খ)</span> {q.parts.b}</p>
                    <p><span className="font-bold">গ)</span> {q.parts.c}</p>
                    <p><span className="font-bold">ঘ)</span> {q.parts.d}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {(mode === "WRITTEN" || mode === "MCQ_WRITTEN") && writtenQuestions.length > 0 && (
            <div className="mt-6 space-y-4">
              {writtenQuestions.map((q, index) => (
                <article key={index} className="question-item-print break-inside-avoid">
                  <p className="mb-1"><span className="font-bold mr-1">{index + 1}.</span> {q.question}</p>
                  <div className="answer-content">
                    {q.answer && <div className="text-gray-800">উত্তর: {q.answer}</div>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-8 pt-2 border-t border-black exam-footer-print hidden print:grid grid-cols-3 items-center text-[8pt] text-gray-600 relative z-10">
          <div className="flex items-center gap-1.5 justify-start">
            {youtubeUrl && (
              <a href={ensureAbsoluteUrl(youtubeUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                <Youtube className="h-3 w-3 text-red-600" />
                <span>{youtubeText || "YouTube"}</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            {telegramUrl && (
              <a href={ensureAbsoluteUrl(telegramUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                <Send className="h-3 w-3 text-blue-500" />
                <span>{telegramText || "Telegram"}</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            {facebookUrl && (
              <a href={ensureAbsoluteUrl(facebookUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                <Facebook className="h-3 w-3 text-blue-600" />
                <span>{facebookText || "Facebook"}</span>
              </a>
            )}
          </div>
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
  const [editingIndex, setEditingIndex] = useState<{type: 'MCQ' | 'CQ' | 'WRITTEN', index: number} | null>(null);

  const [watermarkType, setWatermarkType] = useState<WatermarkType>("text");
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkImage, setWatermarkImage] = useState<string | null>(null);
  const [watermarkOpacity, setWatermarkOpacity] = useState(5);

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

  const dynamicPrintStyles = `
    @media print {
      #printable-area .question-item-print { font-size: ${printFontSize}px !important; }
    }
  `;

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
          if (Array.isArray(json)) {
            processJsonQuestions(json);
          }
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

  // Manual states
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

  const handleAddWritten = () => {
    if (!writtenQuestion) return;
    const newQ: ShortQuestion = { question: writtenQuestion, answer: writtenAnswer };
    if (editingIndex?.type === 'WRITTEN') {
      const updated = [...writtenQuestions];
      updated[editingIndex.index] = newQ;
      setWrittenQuestions(updated);
      setEditingIndex(null);
    } else {
      setWrittenQuestions([...writtenQuestions, newQ]);
    }
    setWrittenQuestion(""); setWrittenAnswer("");
  };

  const handleAddCq = () => {
    if (!cqPartA || !cqPartB) return;
    const newQ: CQQuestion = { stimulus: cqStimulus, parts: { a: cqPartA, b: cqPartB, c: cqPartC, d: cqPartD } };
    if (editingIndex?.type === 'CQ') {
      const updated = [...cqQuestions];
      updated[editingIndex.index] = newQ;
      setCqQuestions(updated);
      setEditingIndex(null);
    } else {
      setCqQuestions([...cqQuestions, newQ]);
    }
    setCqStimulus(""); setCqPartA(""); setCqPartB(""); setCqPartC(""); setCqPartD("");
  };

  const handleAddMcq = () => {
    if (!mcqQuestion || mcqOptions.some(o => !o) || !mcqAnswer) return;
    const newQ: Question = { question: mcqQuestion, options: mcqOptions, answer: mcqAnswer, explanation: mcqExplanation || "" };
    if (editingIndex?.type === 'MCQ') {
      const updated = [...mcqQuestions];
      updated[editingIndex.index] = newQ;
      setMcqQuestions(updated);
      setEditingIndex(null);
    } else {
      setMcqQuestions([...mcqQuestions, newQ]);
    }
    setMcqQuestion(""); setMcqOptions(["", "", "", ""]); setMcqAnswer(""); setMcqExplanation("");
  };

  const handleEdit = (type: 'MCQ' | 'CQ' | 'WRITTEN', index: number) => {
    setEditingIndex({type, index});
    if (type === "MCQ") {
      const q = mcqQuestions[index];
      setMcqQuestion(q.question || ""); setMcqOptions(q.options || ["", "", "", ""]); setMcqAnswer(q.answer || ""); setMcqExplanation(q.explanation || "");
    } else if (type === "CQ") {
      const q = cqQuestions[index];
      setCqStimulus(q.stimulus || ""); setCqPartA(q.parts?.a || ""); setCqPartB(q.parts?.b || ""); setCqPartC(q.parts?.c || ""); setCqPartD(q.parts?.d || "");
    } else {
      const q = writtenQuestions[index];
      setWrittenQuestion(q.question || ""); setWrittenAnswer(q.answer || "");
    }
  };

  const processJsonQuestions = (json: any[]) => {
    const newMcqs: Question[] = [];
    const newCqs: CQQuestion[] = [];
    const newWritten: ShortQuestion[] = [];

    json.forEach(item => {
      // Handle MCQ with options object
      if (item.options && typeof item.options === 'object' && !Array.isArray(item.options)) {
        const optsObj = item.options as Record<string, string>;
        const ansKey = item.correct_answer || item.answer || "";
        const optionsArray = [
          optsObj.A || optsObj.a || "",
          optsObj.B || optsObj.b || "",
          optsObj.C || optsObj.c || "",
          optsObj.D || optsObj.d || ""
        ];
        let finalAnswer = "";
        if (ansKey.length === 1 && /[A-Da-d]/.test(ansKey)) {
          finalAnswer = optsObj[ansKey.toUpperCase()] || optsObj[ansKey.toLowerCase()] || "";
        } else {
          finalAnswer = ansKey;
        }
        newMcqs.push({ question: item.question || "", options: optionsArray, answer: finalAnswer, explanation: item.explanation || "" });
      } 
      else if (Array.isArray(item.options)) {
        newMcqs.push({ question: item.question || "", options: item.options, answer: item.answer || item.correct_answer || "", explanation: item.explanation || "" });
      }
      else if (item.parts) {
        newCqs.push(item as CQQuestion);
      }
      else if (item.question && !item.options && !item.parts) {
        newWritten.push({
          question: item.question || "",
          answer: item.answer || item.correct_answer || ""
        });
      }
    });

    setMcqQuestions(prev => [...prev, ...newMcqs]);
    setCqQuestions(prev => [...prev, ...newCqs]);
    setWrittenQuestions(prev => [...prev, ...newWritten]);
  };

  if (!flowType) {
    return (
      <div className="min-h-screen flex flex-col bg-background p-4">
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setFlowType("SHEET")}>
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileSpreadsheet className="h-12 w-12" />
                </div>
                <CardTitle className="text-2xl font-headline">PDF Sheet</CardTitle>
                <CardDescription>প্রশ্ন সাজান</CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setFlowType("EXAM")}>
              <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <FileSignature className="h-12 w-12" />
                </div>
                <CardTitle className="text-2xl font-headline">প্রশ্নপত্র তৈরি</CardTitle>
                <CardDescription>প্রফেশনাল প্রশ্ন</CardDescription>
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
            <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setMode("MCQ")}>
              <CardHeader className="text-center"><ListChecks className="h-10 w-10 mx-auto mb-4" /><CardTitle className="font-headline">MCQ মোড</CardTitle></CardHeader>
            </Card>
            <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setMode("CQ")}>
              <CardHeader className="text-center"><FileText className="h-10 w-10 mx-auto mb-4" /><CardTitle className="font-headline">CQ মোড</CardTitle></CardHeader>
            </Card>
            <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setMode("WRITTEN")}>
              <CardHeader className="text-center"><BookOpen className="h-10 w-10 mx-auto mb-4" /><CardTitle className="font-headline">সংক্ষিপ্ত প্রশ্ন</CardTitle></CardHeader>
            </Card>
            <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setMode("BOTH")}>
              <CardHeader className="text-center"><LayoutGrid className="h-10 w-10 mx-auto mb-4" /><CardTitle className="font-headline">MCQ ও CQ</CardTitle></CardHeader>
            </Card>
          </div>
        </div>
        <DeveloperFooter />
      </div>
    );
  }

  return (
    <>
      <style>{dynamicPrintStyles}</style>
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
                  <div className="space-y-1"><Label>ফন্ট সাইজ ({printFontSize}px)</Label><Slider min={8} max={24} step={0.5} value={[printFontSize]} onValueChange={(v) => setPrintFontSize(v[0])} /></div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="logo" className="border rounded-lg bg-white overflow-hidden shadow-sm">
                <AccordionTrigger className="px-4 py-3 font-bold text-lg font-headline">লোগো সেটিংস</AccordionTrigger>
                <AccordionContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between mb-2"><Label>লোগো দেখান</Label><Switch checked={showLogo} onCheckedChange={setShowLogo} /></div>
                  <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setLogoImage)} />
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
            </Accordion>

            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4"><TabsTrigger value="manual" className="font-headline">ম্যানুয়াল</TabsTrigger><TabsTrigger value="json" className="font-headline">JSON</TabsTrigger></TabsList>
              
              <TabsContent value="manual">
                <Card>
                  <CardHeader><CardTitle className="font-headline">{editingIndex ? "এডিট করুন" : "নতুন প্রশ্ন"}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs defaultValue="mcq">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="mcq">MCQ</TabsTrigger>
                        <TabsTrigger value="cq">CQ</TabsTrigger>
                        <TabsTrigger value="written">Short</TabsTrigger>
                      </TabsList>
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
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="font-headline">JSON ইনপুট</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild><Button variant="ghost" size="icon"><HelpCircle className="h-5 w-5" /></Button></DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader><DialogTitle className="font-headline">JSON উদাহরণ (Templates)</DialogTitle></DialogHeader>
                        <div className="space-y-6">
                          <div>
                            <p className="text-sm font-bold mb-2">১. এমসিকিউ (MCQ):</p>
                            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`[
  {
    "question": "১। বাংলাদেশের রাজধানীর নাম কি?",
    "options": {
      "A": "ঢাকা",
      "B": "খুলনা",
      "C": "রংপুর",
      "D": "সিলেট"
    },
    "correct_answer": "A"
  }
]`}
                            </pre>
                          </div>
                          <div>
                            <p className="text-sm font-bold mb-2">২. সংক্ষিপ্ত প্রশ্ন (Short Question):</p>
                            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`[
  {
    "question": "বাংলাদেশের রাজধানীর নাম কি?",
    "answer": "ঢাকা"
  }
]`}
                            </pre>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2"><Label className="flex items-center gap-2"><Upload className="h-4 w-4" /> JSON ফাইল আপলোড</Label><Input type="file" accept=".json" onChange={handleJsonFileUpload} /></div>
                    <Textarea placeholder="JSON অ্যারে পেস্ট করুন..." value={jsonInput || ""} onChange={(e) => setJsonInput(e.target.value)} className="h-32 font-mono text-xs" />
                    <Button className="w-full font-headline" onClick={() => { try { const j = JSON.parse(jsonInput); if (Array.isArray(j)) { processJsonQuestions(j); setJsonInput(""); } } catch(e) {} }}>ম্যানুয়ালি যুক্ত করুন</Button>
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

            <div className="space-y-2">
              <Label className="text-xs font-bold font-headline">প্রশ্ন তালিকা</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {mcqQuestions.map((q, i) => (
                  <div key={`mcq-${i}`} className="flex items-center justify-between p-2 bg-white border rounded text-xs group">
                    <span className="truncate flex-1">MCQ: {q.question}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit('MCQ', i)}><Edit2 className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setMcqQuestions(mcqQuestions.filter((_, idx) => idx !== i))}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
                {writtenQuestions.map((q, i) => (
                  <div key={`written-${i}`} className="flex items-center justify-between p-2 bg-white border rounded text-xs group">
                    <span className="truncate flex-1">Short: {q.question}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit('WRITTEN', i)}><Edit2 className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setWrittenQuestions(writtenQuestions.filter((_, idx) => idx !== i))}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-8 bg-gray-100/50 overflow-y-auto print:bg-white print:p-0">
          <PaperPreview {...{
            examName, authorName, examTime, totalMarks, mcqQuestions, cqQuestions, writtenQuestions, 
            setName: selectedSet, mode, logoImage, showLogo, watermarkText, watermarkOpacity, 
            watermarkType, watermarkImage, youtubeText, youtubeUrl, facebookText, facebookUrl, telegramText, telegramUrl,
            flowType
          }} />
        </main>
      </div>
      <DeveloperFooter />
    </>
  );
}
