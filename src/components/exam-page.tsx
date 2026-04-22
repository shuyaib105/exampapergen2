
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
  CheckCircle, 
  Circle, 
  FileText, 
  ListChecks, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit2,
  Info,
  LayoutGrid,
  Youtube,
  Facebook,
  Type,
  Send,
  FileSpreadsheet,
  FileSignature,
  Sparkles,
  Loader2,
  Copy,
  FileUp,
  Image as ImageIcon,
  BookOpen,
  ClipboardList
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { generateQuestions } from "@/ai/flows/generate-questions-flow";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type AppMode = "MCQ" | "CQ" | "WRITTEN" | "BOTH" | "MCQ_WRITTEN" | null;
type FlowType = "SHEET" | "EXAM" | null;
type WatermarkType = "text" | "image";

const PaperPreview = ({ 
  examName, 
  authorName, 
  examTime, 
  totalMarks, 
  mcqQuestions, 
  cqQuestions, 
  writtenQuestions,
  setName, 
  mode,
  flowType,
  logoImage,
  showLogo,
  watermarkText,
  watermarkOpacity,
  watermarkType,
  watermarkImage,
  youtubeText,
  youtubeUrl,
  facebookText,
  facebookUrl,
  telegramText,
  telegramUrl
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
  flowType: FlowType;
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
}) => {
  const ensureAbsoluteUrl = (url: string) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://${trimmed}`;
  };

  const getMcqStimulusDisplay = (currentIndex: number) => {
    const q = mcqQuestions[currentIndex];
    if (!q.stimulus && !q.stimulusImage) return null;

    if (currentIndex > 0) {
      const prevQ = mcqQuestions[currentIndex - 1];
      if (prevQ.stimulus === q.stimulus && prevQ.stimulusImage === q.stimulusImage) {
        return "SKIP";
      }
    }

    let endIdx = currentIndex;
    for (let i = currentIndex + 1; i < mcqQuestions.length; i++) {
      if (mcqQuestions[i].stimulus === q.stimulus && mcqQuestions[i].stimulusImage === q.stimulusImage) {
        endIdx = i;
      } else {
        break;
      }
    }

    const rangeText = endIdx > currentIndex 
      ? `${currentIndex + 1}-${endIdx + 1}` 
      : `${currentIndex + 1}`;

    return {
      header: `নিচের উদ্দীপকটি পড় এবং ${rangeText} নং প্রশ্নের উত্তর দাও:`,
      stimulus: q.stimulus,
      image: q.stimulusImage
    };
  };

  return (
    <div id="printable-area" className="w-full max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-lg shadow-lg print:shadow-none print:rounded-none print:p-2 min-h-[11in] relative overflow-hidden">
      <div className="watermark-container no-print">
        {watermarkType === 'text' && watermarkText && (
          <div className="watermark-text" style={{ opacity: watermarkOpacity / 100 }}>{watermarkText}</div>
        )}
        {watermarkType === 'image' && watermarkImage && (
          <img src={watermarkImage} alt="Watermark" className="watermark-image-el" style={{ opacity: watermarkOpacity / 100 }} />
        )}
      </div>
      
      <div className="watermark-container-print hidden print:flex">
        {watermarkType === 'text' && watermarkText && (
          <div className="watermark-text" style={{ opacity: watermarkOpacity / 100 }}>{watermarkText}</div>
        )}
        {watermarkType === 'image' && watermarkImage && (
          <img src={watermarkImage} alt="Watermark" className="watermark-image-el" style={{ opacity: watermarkOpacity / 100 }} />
        )}
      </div>

      <header className="pb-4 print:pb-2 border-b print:border-b-2 border-gray-200 print:border-black exam-header-print relative z-10">
        <div className="flex items-center justify-center relative min-h-[80px]">
          {showLogo && logoImage && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-20 w-20 flex items-center justify-center">
              <img src={logoImage} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          )}
          <div className="text-center px-10">
            <h1 className="text-2xl font-bold font-headline print-h1">{examName || "পরীক্ষার নাম"}</h1>
            <p className="text-lg font-semibold print-header-p">{authorName || "পরিচালনায়: নাম"}</p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2 print:mt-1 text-base print-header-div px-2">
          {flowType === 'EXAM' && <span>পূর্ণমান: {totalMarks || "..."}</span>}
          {(mode === "MCQ" || mode === "BOTH" || mode === "MCQ_WRITTEN") && flowType === 'EXAM' && <span className="font-bold">সেট: {setName}</span>}
          {flowType === 'EXAM' && <span>সময়: {examTime || "..."}</span>}
        </div>
      </header>

      <section className="mt-4 print:mt-2 relative z-10">
        {(mode === "MCQ" || mode === "BOTH" || mode === "MCQ_WRITTEN") && (
          <div className={mcqQuestions.length > 0 ? "mb-8" : ""}>
            {(mode === "BOTH" || mode === "MCQ_WRITTEN") && mcqQuestions.length > 0 && <h2 className="text-lg font-bold border-b mb-4 pb-1">বহুনির্বাচনি অংশ</h2>}
            {mcqQuestions.length > 0 && (
              <div className="md:columns-2 print:columns-2 md:gap-x-12 print:gap-x-6 [column-fill:auto]">
                {mcqQuestions.map((q, index) => {
                  const stimulusData = getMcqStimulusDisplay(index);
                  return (
                    <article key={index} className="mb-2 print:mb-1 question-item-print break-inside-avoid-column">
                      {stimulusData && stimulusData !== "SKIP" && (
                        <div className="mb-3 p-2 print:p-0 print:mb-2 border-none">
                          <p className="font-bold text-sm mb-1">{stimulusData.header}</p>
                          {stimulusData.image && (
                            <div className="mb-2 flex justify-center">
                              <img src={stimulusData.image} alt="Stimulus" className="max-h-32 object-contain rounded" />
                            </div>
                          )}
                          {stimulusData.stimulus && <p className="text-sm leading-relaxed">{stimulusData.stimulus}</p>}
                        </div>
                      )}
                      <div className="mt-1">
                        <p className="font-bold text-base mb-1 print-question-p">{index + 1}. {q.question}</p>
                        {q.image && (
                          <div className="mb-2 max-w-full h-auto flex justify-center">
                            <img src={q.image} alt="Question" className="max-h-32 object-contain" />
                          </div>
                        )}
                        <ul className="grid grid-cols-2 gap-x-6 print:gap-x-4 gap-y-0 pl-3 print:pl-2">
                          {q.options.map((option, optIndex) => {
                            const optionLabel = String.fromCharCode(97 + optIndex);
                            const isCorrect = option === q.answer;
                            return (
                              <li key={optIndex} className="flex items-start space-x-2 print:space-x-1 print-option-li">
                                <div className="answer-content text-blue-600 print:text-blue-600 mt-1">
                                  {isCorrect ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4 text-gray-300" />}
                                </div>
                                 <div className="flex items-start">
                                   <span className="font-medium mr-1">{optionLabel})</span>
                                   <p>{option}</p>
                                 </div>
                              </li>
                            );
                          })}
                        </ul>
                        {q.explanation && (
                          <div className="answer-content mt-1 pl-6 text-xs italic text-gray-600 border-l-2 border-blue-200">
                            ব্যাখ্যা: {q.explanation}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(mode === "WRITTEN" || mode === "MCQ_WRITTEN") && (
          <div className={writtenQuestions.length > 0 ? "mb-8" : ""}>
             {mode === "MCQ_WRITTEN" && writtenQuestions.length > 0 && <h2 className="text-lg font-bold border-b mb-4 pb-1">সংক্ষিপ্ত প্রশ্ন অংশ</h2>}
             {writtenQuestions.length > 0 && (
               <div className="space-y-4">
                 {writtenQuestions.map((q, index) => (
                   <article key={index} className="question-item-print break-inside-avoid">
                     <p className="font-bold text-base"><span className="mr-1">{index + 1}.</span> {q.question}</p>
                     {q.image && <img src={q.image} alt="Question" className="max-h-32 object-contain my-2" />}
                     {q.answer && (
                       <p className="answer-content text-blue-600 ml-6 text-sm italic border-l-2 border-blue-200 pl-2">
                         উত্তর: {q.answer}
                       </p>
                     )}
                   </article>
                 ))}
               </div>
             )}
          </div>
        )}

        {(mode === "CQ" || mode === "BOTH") && (
          <div>
            {mode === "BOTH" && cqQuestions.length > 0 && <h2 className="text-lg font-bold border-b mb-4 pb-1">সৃজনশীল অংশ</h2>}
            {cqQuestions.length > 0 && (
              <div className="space-y-6 print:space-y-4">
                {cqQuestions.map((q, index) => (
                  <article key={index} className="question-item-print break-inside-avoid border-b pb-4 print:pb-2 last:border-0">
                    <p className="font-bold mb-2 print:mb-1">{index + 1}. নিচের উদ্দীপকটি পড় এবং প্রশ্নগুলোর উত্তর দাও:</p>
                    {q.stimulusImage && (
                      <div className={cn(
                        "mb-3 print:mb-2 flex",
                        q.stimulusImageAlign === 'left' ? 'justify-start' : q.stimulusImageAlign === 'right' ? 'justify-end' : 'justify-center'
                      )}>
                        <img 
                          src={q.stimulusImage} 
                          alt="Stimulus" 
                          className="max-h-80 object-contain rounded border" 
                          style={{ width: `${q.stimulusImageWidth || 100}%` }}
                        />
                      </div>
                    )}
                    {q.stimulus && <div className="mb-3 print:mb-2 italic text-gray-700 bg-gray-50 p-2 rounded print:bg-white print:p-0 print:italic">{q.stimulus}</div>}
                    <div className="grid grid-cols-1 gap-y-2 pl-4 print:pl-2">
                      <div className="flex flex-col">
                        <p><span className="font-bold">ক)</span> {q.parts.a}</p>
                        {q.answers?.a && <p className="answer-content ml-6 text-sm text-blue-600 italic border-l-2 border-blue-200 pl-2">উত্তর: {q.answers.a}</p>}
                      </div>
                      <div className="flex flex-col">
                        <p><span className="font-bold">খ)</span> {q.parts.b}</p>
                        {q.answers?.b && <p className="answer-content ml-6 text-sm text-blue-600 italic border-l-2 border-blue-200 pl-2">উত্তর: {q.answers.b}</p>}
                      </div>
                      <div className="flex flex-col">
                        <p><span className="font-bold">গ)</span> {q.parts.c}</p>
                        {q.answers?.c && <p className="answer-content ml-6 text-sm text-blue-600 italic border-l-2 border-blue-200 pl-2">উত্তর: {q.answers.c}</p>}
                      </div>
                      <div className="flex flex-col">
                        <p><span className="font-bold">ঘ)</span> {q.parts.d}</p>
                        {q.answers?.d && <p className="answer-content ml-6 text-sm text-blue-600 italic border-l-2 border-blue-200 pl-2">উত্তর: {q.answers.d}</p>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="mt-8 pt-4 border-t print:mt-auto print-footer grid grid-cols-3 items-center text-xs text-gray-500 relative z-10">
        <div className="flex items-center gap-1 justify-start">
          {youtubeUrl && (
            <a href={ensureAbsoluteUrl(youtubeUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-red-600 transition-colors">
              <Youtube className="h-4 w-4 text-red-600" />
              <span>{youtubeText || "YouTube"}</span>
            </a>
          )}
        </div>
        <div className="flex items-center gap-1 justify-center">
          {telegramUrl && (
            <a href={ensureAbsoluteUrl(telegramUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-500 transition-colors">
              <Send className="h-4 w-4 text-blue-500" />
              <span>{telegramText || "Telegram"}</span>
            </a>
          )}
        </div>
        <div className="flex items-center gap-1 justify-end">
          {facebookUrl && (
            <a href={ensureAbsoluteUrl(facebookUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              <Facebook className="h-4 w-4 text-blue-600" />
              <span>{facebookText || "Facebook"}</span>
            </a>
          )}
        </div>
      </footer>
    </div>
  );
};

export default function ExamPage() {
  const [flowType, setFlowType] = useState<FlowType>(null);
  const [mode, setMode] = useState<AppMode>(null);
  const [examName, setExamName] = useState("মডেল টেস্ট");
  const [authorName, setAuthorName] = useState("Md Jubayer | রংপুর মেডিকেল কলেজ");
  const [examTime, setExamTime] = useState("২ ঘন্টা");
  const [totalMarks, setTotalMarks] = useState("১০০");
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [showLogo, setShowLogo] = useState(true);
  
  const [mcqQuestions, setMcqQuestions] = useState<Question[]>([]);
  const [displayMcqQuestions, setDisplayMcqQuestions] = useState<Question[]>([]);
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
  const [watermarkOpacity, setWatermarkOpacity] = useState(10);

  const [youtubeText, setYoutubeText] = useState("আমাদের ইউটিউব চ্যানেল");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [facebookText, setFacebookText] = useState("আমাদের ফেসবুক পেজ");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [telegramText, setTelegramText] = useState("আমাদের টেলিগ্রাম চ্যানেল");
  const [telegramUrl, setTelegramUrl] = useState("");

  const [aiText, setAiText] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [aiType, setAiType] = useState<'MCQ' | 'CQ' | 'WRITTEN'>('MCQ');
  const [isGenerating, setIsGenerating] = useState(false);

  // Form states
  const [mcqQuestion, setMcqQuestion] = useState("");
  const [mcqImage, setMcqImage] = useState<string | null>(null);
  const [mcqStimulus, setMcqStimulus] = useState("");
  const [mcqStimulusImage, setMcqStimulusImage] = useState<string | null>(null);
  const [mcqOptions, setMcqOptions] = useState(["", "", "", ""]);
  const [mcqAnswer, setMcqAnswer] = useState("");
  const [mcqExplanation, setMcqExplanation] = useState("");
  const [keepStimulus, setKeepStimulus] = useState(false);

  const [cqStimulus, setCqStimulus] = useState("");
  const [cqStimulusImage, setCqStimulusImage] = useState<string | null>(null);
  const [cqStimulusWidth, setCqStimulusWidth] = useState(100);
  const [cqStimulusAlign, setCqStimulusAlign] = useState<'left' | 'center' | 'right'>('center');
  const [cqPartA, setCqPartA] = useState("");
  const [cqPartB, setCqPartB] = useState("");
  const [cqPartC, setCqPartC] = useState("");
  const [cqPartD, setCqPartD] = useState("");
  const [cqAnsA, setCqAnsA] = useState("");
  const [cqAnsB, setCqAnsB] = useState("");
  const [cqAnsC, setCqAnsC] = useState("");
  const [cqAnsD, setCqAnsD] = useState("");

  const [writtenQuestion, setWrittenQuestion] = useState("");
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [writtenImage, setWrittenImage] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    document.title = examName || "ExamPaperGen";
  }, [examName]);

  const dynamicPrintStyles = `
    @media print {
      #printable-area .print-h1 { font-size: ${printFontSize * 1.25}px !important; }
      #printable-area .print-header-p { font-size: ${printFontSize * 1.15}px !important; }
      #printable-area .print-header-div { font-size: ${printFontSize}px !important; }
      #printable-area .print-question-p { font-size: ${printFontSize}px !important; }
      #printable-area .print-option-li { font-size: ${printFontSize * 0.95}px !important; }
      #printable-area .question-item-print { font-size: ${printFontSize}px !important; }
    }
  `;

  const shuffleArraySeeded = <T,>(array: T[], seed: string): T[] => {
    const newArr = [...array];
    let aSeed = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = () => {
      var x = Math.sin(aSeed++) * 10000;
      return x - Math.floor(x);
    };
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const shuffleGroupedQuestions = (questions: Question[], seed: string): Question[] => {
    if (seed === "A") return questions;
    const groups: Question[][] = [];
    if (questions.length === 0) return [];

    let currentGroup: Question[] = [questions[0]];
    for (let i = 1; i < questions.length; i++) {
      const q = questions[i];
      const prevQ = questions[i - 1];
      const hasSameStimulus = (q.stimulus === prevQ.stimulus && q.stimulusImage === prevQ.stimulusImage);
      if (hasSameStimulus && (q.stimulus || q.stimulusImage)) {
        currentGroup.push(q);
      } else {
        groups.push(currentGroup);
        currentGroup = [q];
      }
    }
    groups.push(currentGroup);
    const shuffledGroups = shuffleArraySeeded(groups, seed);
    return shuffledGroups.flat();
  };

  useEffect(() => {
    document.body.setAttribute('data-preview-answers', String(previewAnswers));
  }, [previewAnswers]);
  
  useEffect(() => {
    if (mcqQuestions.length > 0) {
      const setToShow = flowType === 'EXAM' ? selectedSet : 'A';
      setDisplayMcqQuestions(shuffleGroupedQuestions(mcqQuestions, setToShow));
    } else {
      setDisplayMcqQuestions([]);
    }
  }, [mcqQuestions, selectedSet, flowType]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddWritten = () => {
    if (!writtenQuestion) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "প্রশ্ন অবশ্যই পূরণ করতে হবে।" });
      return;
    }
    const newQ: ShortQuestion = {
      question: writtenQuestion,
      answer: writtenAnswer,
      image: writtenImage || undefined
    };
    if (editingIndex?.type === 'WRITTEN') {
      const updated = [...writtenQuestions];
      updated[editingIndex.index] = newQ;
      setWrittenQuestions(updated);
      setEditingIndex(null);
    } else {
      setWrittenQuestions([...writtenQuestions, newQ]);
    }
    setWrittenQuestion(""); setWrittenAnswer(""); setWrittenImage(null);
  };

  const handleAddCq = () => {
    if (!cqPartA || !cqPartB || !cqPartC || !cqPartD) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "ক, খ, গ, ঘ প্রশ্নগুলো অবশ্যই পূরণ করতে হবে।" });
      return;
    }
    const newQ: CQQuestion = {
      stimulus: cqStimulus,
      stimulusImage: cqStimulusImage || undefined,
      stimulusImageWidth: cqStimulusWidth,
      stimulusImageAlign: cqStimulusAlign,
      parts: { a: cqPartA, b: cqPartB, c: cqPartC, d: cqPartD },
      answers: { a: cqAnsA, b: cqAnsB, c: cqAnsC, d: cqAnsD }
    };
    if (editingIndex?.type === 'CQ') {
      const updated = [...cqQuestions];
      updated[editingIndex.index] = newQ;
      setCqQuestions(updated);
      setEditingIndex(null);
    } else {
      setCqQuestions([...cqQuestions, newQ]);
    }
    setCqStimulus(""); setCqStimulusImage(null); setCqStimulusWidth(100); setCqStimulusAlign('center'); setCqPartA(""); setCqPartB(""); setCqPartC(""); setCqPartD(""); setCqAnsA(""); setCqAnsB(""); setCqAnsC(""); setCqAnsD("");
  };

  const handleAddMcq = () => {
    if (!mcqQuestion || mcqOptions.some(o => !o) || !mcqAnswer) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "প্রশ্ন, বিকল্প এবং সঠিক উত্তর অবশ্যই পূরণ করতে হবে।" });
      return;
    }
    const newQ: Question = {
      question: mcqQuestion,
      image: mcqImage || undefined,
      stimulus: mcqStimulus || undefined,
      stimulusImage: mcqStimulusImage || undefined,
      options: mcqOptions,
      answer: mcqAnswer,
      explanation: mcqExplanation || undefined
    };
    if (editingIndex?.type === 'MCQ') {
      const updated = [...mcqQuestions];
      updated[editingIndex.index] = newQ;
      setMcqQuestions(updated);
      setEditingIndex(null);
    } else {
      setMcqQuestions([...mcqQuestions, newQ]);
    }
    setMcqQuestion(""); setMcqImage(null); if (!keepStimulus) { setMcqStimulus(""); setMcqStimulusImage(null); } setMcqOptions(["", "", "", ""]); setMcqAnswer(""); setMcqExplanation("");
  };

  const handleEdit = (type: 'MCQ' | 'CQ' | 'WRITTEN', index: number) => {
    setEditingIndex({type, index});
    if (type === "MCQ") {
      const q = mcqQuestions[index];
      setMcqQuestion(q.question); setMcqImage(q.image || null); setMcqStimulus(q.stimulus || ""); setMcqStimulusImage(q.stimulusImage || null); setMcqOptions(q.options); setMcqAnswer(q.answer); setMcqExplanation(q.explanation || ""); setKeepStimulus(!!(q.stimulus || q.stimulusImage));
    } else if (type === "CQ") {
      const q = cqQuestions[index];
      setCqStimulus(q.stimulus || ""); 
      setCqStimulusImage(q.stimulusImage || null); 
      setCqStimulusWidth(q.stimulusImageWidth || 100);
      setCqStimulusAlign(q.stimulusImageAlign || 'center');
      setCqPartA(q.parts.a); setCqPartB(q.parts.b); setCqPartC(q.parts.c); setCqPartD(q.parts.d); setCqAnsA(q.answers?.a || ""); setCqAnsB(q.answers?.b || ""); setCqAnsC(q.answers?.c || ""); setCqAnsD(q.answers?.d || "");
    } else {
      const q = writtenQuestions[index];
      setWrittenQuestion(q.question); setWrittenAnswer(q.answer || ""); setWrittenImage(q.image || null);
    }
    document.getElementById('input-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const processJsonQuestions = (json: any[]) => {
    const mapped = json.map((q: any) => {
      if (q.parts) {
        return { type: 'CQ', ...q };
      }
      if (q.options && q.options.length === 4) {
        let correctAnswer = q.answer;
        if (typeof q.answer === 'number') {
          correctAnswer = q.options[q.answer - 1] || "";
        }
        return { type: 'MCQ', ...q, answer: correctAnswer };
      }
      return { type: 'WRITTEN', ...q };
    });

    const mcqs = mapped.filter(q => q.type === 'MCQ').map(({type, ...r}) => r as Question);
    const cqs = mapped.filter(q => q.type === 'CQ').map(({type, ...r}) => r as CQQuestion);
    const wrs = mapped.filter(q => q.type === 'WRITTEN').map(({type, ...r}) => r as ShortQuestion);

    setMcqQuestions(prev => [...prev, ...mcqs]);
    setCqQuestions(prev => [...prev, ...cqs]);
    setWrittenQuestions(prev => [...prev, ...wrs]);
    
    toast({ title: "সফল", description: "প্রশ্ন যুক্ত করা হয়েছে।" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          processJsonQuestions(json);
        }
      } catch (err) {
        toast({ variant: "destructive", title: "ত্রুটি", description: "ভুল JSON ফরম্যাট।" });
      }
    };
    reader.readAsText(file);
  };

  const handleAiGenerate = async () => {
    if (!aiText.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateQuestions({ text: aiText, count: aiCount, type: aiType });
      if (aiType === 'MCQ') {
        const mapped = result.questions.map(q => ({
          question: q.question || '',
          options: q.options || [],
          answer: q.answer || '',
          explanation: q.explanation || '',
          stimulus: q.stimulus,
        }));
        setMcqQuestions(prev => [...prev, ...mapped]);
      } else if (aiType === 'CQ') {
        const mapped: CQQuestion[] = result.questions.map(q => ({
          stimulus: q.stimulus,
          parts: q.parts || { a: '', b: '', c: '', d: '' },
          answers: q.answers
        }));
        setCqQuestions(prev => [...prev, ...mapped]);
      } else {
        const mapped: ShortQuestion[] = result.questions.map(q => ({
          question: q.question,
          answer: q.answer,
          stimulus: q.stimulus
        }));
        setWrittenQuestions(prev => [...prev, ...mapped]);
      }
      setAiText("");
      toast({ title: "সফল", description: "AI প্রশ্ন জেনারেট করেছে।" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "ত্রুটি", description: error.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (withAnswers: boolean) => {
    document.body.setAttribute('data-print-with-answers', String(withAnswers));
    window.print();
  };

  if (!flowType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 flex-col gap-6">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setFlowType("SHEET")}>
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <FileSpreadsheet className="h-12 w-12" />
              </div>
              <CardTitle className="text-2xl">PDF Sheet</CardTitle>
              <CardDescription>প্রশ্ন সাজান</CardDescription>
            </CardHeader>
          </Card>
          <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setFlowType("EXAM")}>
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <FileSignature className="h-12 w-12" />
              </div>
              <CardTitle className="text-2xl">প্রশ্নপত্র তৈরি</CardTitle>
              <CardDescription>প্রফেশনাল প্রশ্ন</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 flex-col gap-6">
        <Button variant="ghost" onClick={() => setFlowType(null)}><ArrowLeft className="mr-2 h-4 w-4" /> আগের ধাপে ফিরে যান</Button>
        <div className="max-w-5xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setMode("MCQ")}>
            <CardHeader className="text-center"><ListChecks className="h-10 w-10 mx-auto mb-4" /><CardTitle>MCQ মোড</CardTitle></CardHeader>
          </Card>
          <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setMode("CQ")}>
            <CardHeader className="text-center"><FileText className="h-10 w-10 mx-auto mb-4" /><CardTitle>CQ মোড</CardTitle></CardHeader>
          </Card>
          <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setMode("WRITTEN")}>
            <CardHeader className="text-center"><BookOpen className="h-10 w-10 mx-auto mb-4" /><CardTitle>সংক্ষিপ্ত প্রশ্ন</CardTitle></CardHeader>
          </Card>
          <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setMode("BOTH")}>
            <CardHeader className="text-center"><LayoutGrid className="h-10 w-10 mx-auto mb-4" /><CardTitle>MCQ ও CQ</CardTitle></CardHeader>
          </Card>
          <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group" onClick={() => setMode("MCQ_WRITTEN")}>
            <CardHeader className="text-center"><ClipboardList className="h-10 w-10 mx-auto mb-4" /><CardTitle>MCQ ও লিখিত</CardTitle></CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{dynamicPrintStyles}</style>
      <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground font-body">
        <aside className="w-full lg:w-[420px] lg:min-w-[420px] p-4 sm:p-6 border-b lg:border-r lg:border-b-0 print:hidden no-print overflow-y-auto max-h-screen scrollbar-hide">
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setMode(null)}><ArrowLeft className="mr-2 h-4 w-4" /> মোড পরিবর্তন</Button>
            <Accordion type="multiple" defaultValue={["basic"]} className="space-y-4">
              <AccordionItem value="basic" className="border rounded-lg bg-white overflow-hidden shadow-sm">
                <AccordionTrigger className="px-4 py-3 hover:no-underline font-bold text-lg">বেসিক সেটিংস</AccordionTrigger>
                <AccordionContent className="p-4 space-y-4">
                  <div className="space-y-1"><Label>পরীক্ষার নাম</Label><Input value={examName} onChange={(e) => setExamName(e.target.value)} /></div>
                  <div className="space-y-1"><Label>পরিচালনায়</Label><Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} /></div>
                  {flowType === 'EXAM' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1"><Label>সময়</Label><Input value={examTime} onChange={(e) => setExamTime(e.target.value)} /></div>
                      <div className="space-y-1"><Label>পূর্ণমান</Label><Input value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} /></div>
                    </div>
                  )}
                  <div className="space-y-1"><Label>প্রিন্ট ফন্ট সাইজ ({printFontSize}px)</Label><Slider min={8} max={16} step={0.5} value={[printFontSize]} onValueChange={(v) => setPrintFontSize(v[0])} /></div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="watermark" className="border rounded-lg bg-white overflow-hidden shadow-sm">
                <AccordionTrigger className="px-4 py-3 font-bold text-lg">ওয়াটারমার্ক</AccordionTrigger>
                <AccordionContent className="p-4 space-y-4">
                  <RadioGroup value={watermarkType} onValueChange={(val) => setWatermarkType(val as WatermarkType)} className="flex gap-4">
                    <div className="flex items-center space-x-2"><RadioGroupItem value="text" id="wt-text" /><Label htmlFor="wt-text">টেক্সট</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="image" id="wt-image" /><Label htmlFor="wt-image">ইমেজ</Label></div>
                  </RadioGroup>
                  {watermarkType === "text" ? <Input placeholder="টেক্সট..." value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} /> : <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setWatermarkImage)} />}
                  <Slider min={0} max={50} value={[watermarkOpacity]} onValueChange={(v) => setWatermarkOpacity(v[0])} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="manual">আলাদা</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="upload">ফাইল</TabsTrigger>
                <TabsTrigger value="ai">AI</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual">
                <Card id="input-form">
                  <CardHeader><CardTitle>{editingIndex ? "এডিট করুন" : "নতুন প্রশ্ন"}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs defaultValue="mcq">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="mcq" disabled={mode === "CQ" || mode === "WRITTEN"}>MCQ</TabsTrigger>
                        <TabsTrigger value="cq" disabled={mode === "MCQ" || mode === "WRITTEN" || mode === "MCQ_WRITTEN"}>CQ</TabsTrigger>
                        <TabsTrigger value="written" disabled={mode === "MCQ" || mode === "CQ" || mode === "BOTH"}>Short</TabsTrigger>
                      </TabsList>
                      <TabsContent value="mcq" className="space-y-3">
                        <Input placeholder="প্রশ্ন..." value={mcqQuestion} onChange={(e) => setMcqQuestion(e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">{mcqOptions.map((opt, i) => <Input key={i} placeholder={`বিকল্প ${i+1}`} value={opt} onChange={(e) => { const newOpts = [...mcqOptions]; newOpts[i] = e.target.value; setMcqOptions(newOpts); }} />)}</div>
                        <Select value={mcqAnswer} onValueChange={setMcqAnswer}><SelectTrigger><SelectValue placeholder="সঠিক উত্তর" /></SelectTrigger><SelectContent>{mcqOptions.map((opt, i) => opt && <SelectItem key={i} value={opt}>{opt}</SelectItem>)}</SelectContent></Select>
                        <Button className="w-full" onClick={handleAddMcq}>{editingIndex ? "আপডেট" : "যুক্ত করুন"}</Button>
                      </TabsContent>
                      <TabsContent value="cq" className="space-y-4">
                        <Textarea placeholder="উদ্দীপক..." value={cqStimulus} onChange={(e) => setCqStimulus(e.target.value)} />
                        <div className="space-y-2 border p-3 rounded-lg bg-gray-50/50">
                          <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> উদ্দীপক ছবি</Label>
                          <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setCqStimulusImage)} />
                          {cqStimulusImage && (
                            <div className="space-y-3 pt-2">
                              <div className="flex flex-col gap-1.5">
                                <Label className="text-xs">ছবির আকার: {cqStimulusWidth}%</Label>
                                <Slider min={20} max={100} step={1} value={[cqStimulusWidth]} onValueChange={(v) => setCqStimulusWidth(v[0])} />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <Label className="text-xs">অবস্থান</Label>
                                <Select value={cqStimulusAlign} onValueChange={(v: any) => setCqStimulusAlign(v)}>
                                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                  <SelectContent><SelectItem value="left">বামে</SelectItem><SelectItem value="center">মাঝখানে</SelectItem><SelectItem value="right">ডানে</SelectItem></SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <Input placeholder="ক)" value={cqPartA} onChange={(e) => setCqPartA(e.target.value)} />
                          <Input placeholder="খ)" value={cqPartB} onChange={(e) => setCqPartB(e.target.value)} />
                          <Input placeholder="গ)" value={cqPartC} onChange={(e) => setCqPartC(e.target.value)} />
                          <Input placeholder="ঘ)" value={cqPartD} onChange={(e) => setCqPartD(e.target.value)} />
                        </div>
                        <Button className="w-full" onClick={handleAddCq}>{editingIndex ? "আপডেট" : "যুক্ত করুন"}</Button>
                      </TabsContent>
                      <TabsContent value="written" className="space-y-3">
                        <Input placeholder="প্রশ্ন..." value={writtenQuestion} onChange={(e) => setWrittenQuestion(e.target.value)} />
                        <Textarea placeholder="উত্তর..." value={writtenAnswer} onChange={(e) => setWrittenAnswer(e.target.value)} />
                        <Button className="w-full" onClick={handleAddWritten}>{editingIndex ? "আপডেট" : "যুক্ত করুন"}</Button>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="json">
                <Card>
                  <CardHeader><CardTitle>JSON ইনপুট</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea placeholder="JSON অ্যারে পেস্ট করুন..." value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} className="h-32 font-mono text-xs" />
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => {
                        try {
                          const json = JSON.parse(jsonInput);
                          if (Array.isArray(json)) {
                            processJsonQuestions(json);
                            setJsonInput("");
                          }
                        } catch (e) { toast({ variant: "destructive", title: "ত্রুটি", description: "ভুল JSON।" }); }
                      }}>যুক্ত করুন</Button>
                      <Button variant="outline" onClick={() => {
                        const all = [...mcqQuestions, ...cqQuestions, ...writtenQuestions];
                        navigator.clipboard.writeText(JSON.stringify(all, null, 2));
                        toast({ title: "সফল", description: "JSON কপি করা হয়েছে।" });
                      }}><Copy className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upload">
                <Card>
                  <CardHeader><CardTitle>ফাইল আপলোড</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer relative">
                      <FileUp className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">JSON ফাইল সিলেক্ট করুন</p>
                      <input type="file" accept=".json" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai">
                <Card>
                  <CardHeader><CardTitle>AI জেনারেটর</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea placeholder="টেক্সট পেস্ট করুন..." value={aiText} onChange={(e) => setAiText(e.target.value)} className="h-32" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">সংখ্যা</Label>
                        <Input type="number" value={aiCount} onChange={(e) => setAiCount(parseInt(e.target.value))} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">ধরণ</Label>
                        <Select value={aiType} onValueChange={(v: any) => setAiType(v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MCQ">MCQ</SelectItem>
                            <SelectItem value="CQ">CQ</SelectItem>
                            <SelectItem value="WRITTEN">সংক্ষিপ্ত প্রশ্ন</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleAiGenerate} disabled={isGenerating}>{isGenerating ? <Loader2 className="animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" /> AI জেনারেট করুন</>}</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="space-y-3 pt-4 border-t">
              <div className="grid grid-cols-2 gap-2">
                <Button className="w-full" onClick={() => handleExport(true)}><Printer className="mr-2 h-4 w-4" /> উত্তরসহ PDF</Button>
                <Button variant="secondary" className="w-full" onClick={() => handleExport(false)}><FileText className="mr-2 h-4 w-4" /> উত্তর ছাড়া PDF</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 bg-white shadow-sm">
                <div className="flex flex-col">
                  <Label className="text-sm font-bold">উত্তর দেখান</Label>
                  <span className="text-[10px] text-gray-500">প্রিভিউতে উত্তর হাইলাইট করুন</span>
                </div>
                <Switch checked={previewAnswers} onCheckedChange={setPreviewAnswers} />
              </div>
              {(mode === "MCQ" || mode === "BOTH" || mode === "MCQ_WRITTEN") && flowType === 'EXAM' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">সেট নির্বাচন করুন</Label>
                  <Select value={selectedSet} onValueChange={setSelectedSet}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Set A (মূল)</SelectItem>
                      <SelectItem value="B">Set B (শাফেলড্)</SelectItem>
                      <SelectItem value="C">Set C (শাফেলড্)</SelectItem>
                      <SelectItem value="D">Set D (শাফেলড্)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">প্রশ্ন তালিকা</Label>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {mcqQuestions.map((q, i) => (
                  <div key={`mcq-${i}`} className="flex items-center justify-between p-2 bg-white border rounded text-xs group">
                    <span className="truncate flex-1">MCQ {i+1}: {q.question}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit('MCQ', i)}><Edit2 className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setMcqQuestions(mcqQuestions.filter((_, idx) => idx !== i))}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
                {writtenQuestions.map((q, i) => (
                  <div key={`written-${i}`} className="flex items-center justify-between p-2 bg-white border rounded text-xs group">
                    <span className="truncate flex-1">Short {i+1}: {q.question}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit('WRITTEN', i)}><Edit2 className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setWrittenQuestions(writtenQuestions.filter((_, idx) => idx !== i))}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
                {cqQuestions.map((q, i) => (
                  <div key={`cq-${i}`} className="flex items-center justify-between p-2 bg-white border rounded text-xs group">
                    <span className="truncate flex-1">CQ {i+1}: {q.parts.a}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit('CQ', i)}><Edit2 className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setCqQuestions(cqQuestions.filter((_, idx) => idx !== i))}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-8 bg-gray-100/50 overflow-y-auto">
          <PaperPreview {...{examName, authorName, examTime, totalMarks, mcqQuestions: displayMcqQuestions, cqQuestions, writtenQuestions, setName: selectedSet, mode, flowType, logoImage, showLogo, watermarkText, watermarkOpacity, watermarkType, watermarkImage, youtubeText, youtubeUrl, facebookText, facebookUrl, telegramText, telegramUrl}} />
        </main>
      </div>
    </>
  );
}
