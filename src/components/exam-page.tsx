
"use client";

import { useState, useEffect } from "react";
import type { Question, CQQuestion } from "@/lib/types";
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
  Send
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

type AppMode = "MCQ" | "CQ" | "BOTH" | null;

const PaperPreview = ({ 
  examName, 
  authorName, 
  examTime, 
  totalMarks, 
  mcqQuestions, 
  cqQuestions, 
  setName, 
  mode,
  logoImage,
  showLogo,
  watermarkText,
  watermarkOpacity,
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
  setName: string;
  mode: AppMode;
  logoImage: string | null;
  showLogo: boolean;
  watermarkText: string;
  watermarkOpacity: number;
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
      {/* Watermark */}
      {watermarkText && (
        <div className="watermark-container">
          <div 
            className="watermark-text" 
            style={{ opacity: watermarkOpacity / 100 }}
          >
            {watermarkText}
          </div>
        </div>
      )}

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
          <span>পূর্ণমান: {totalMarks || "..."}</span>
          {(mode === "MCQ" || mode === "BOTH") && <span className="font-bold">সেট: {setName}</span>}
          <span>সময়: {examTime || "..."}</span>
        </div>
      </header>

      <section className="mt-4 print:mt-2 relative z-10">
        {(mode === "MCQ" || mode === "BOTH") && (
          <div className={mcqQuestions.length > 0 ? "mb-8" : ""}>
            {mode === "BOTH" && mcqQuestions.length > 0 && <h2 className="text-lg font-bold border-b mb-4 pb-1">বহুনির্বাচনি অংশ</h2>}
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
                          {stimulusData.stimulus && (
                            <p className="text-sm leading-relaxed">{stimulusData.stimulus}</p>
                          )}
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

        {(mode === "CQ" || mode === "BOTH") && (
          <div>
            {mode === "BOTH" && cqQuestions.length > 0 && <h2 className="text-lg font-bold border-b mb-4 pb-1">সৃজনশীল অংশ</h2>}
            {cqQuestions.length > 0 && (
              <div className="space-y-6 print:space-y-4">
                {cqQuestions.map((q, index) => (
                  <article key={index} className="question-item-print break-inside-avoid border-b pb-4 print:pb-2 last:border-0">
                    <p className="font-bold mb-2 print:mb-1">{index + 1}. নিচের উদ্দীপকটি পড় এবং প্রশ্নগুলোর উত্তর দাও:</p>
                    {q.stimulusImage && (
                      <div className="mb-3 print:mb-2 flex justify-center">
                        <img src={q.stimulusImage} alt="Stimulus" className="max-h-60 object-contain rounded border" />
                      </div>
                    )}
                    {q.stimulus && (
                      <div className="mb-3 print:mb-2 italic text-gray-700 bg-gray-50 p-2 rounded print:bg-white print:p-0 print:italic">
                        {q.stimulus}
                      </div>
                    )}
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

      {/* Footer Links */}
      <footer className="mt-8 pt-4 border-t print:mt-auto print-footer grid grid-cols-3 items-center text-xs text-gray-500 relative z-10">
        <div className="flex items-center gap-1 justify-start">
          {youtubeUrl && (
            <a 
              href={ensureAbsoluteUrl(youtubeUrl)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 hover:text-red-600 transition-colors"
            >
              <Youtube className="h-4 w-4 text-red-600" />
              <span>{youtubeText || "YouTube"}</span>
            </a>
          )}
        </div>
        <div className="flex items-center gap-1 justify-center">
          {telegramUrl && (
            <a 
              href={ensureAbsoluteUrl(telegramUrl)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 hover:text-blue-500 transition-colors"
            >
              <Send className="h-4 w-4 text-blue-500" />
              <span>{telegramText || "Telegram"}</span>
            </a>
          )}
        </div>
        <div className="flex items-center gap-1 justify-end">
          {facebookUrl && (
            <a 
              href={ensureAbsoluteUrl(facebookUrl)} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
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
  const [jsonInput, setJsonInput] = useState("");
  const [previewAnswers, setPreviewAnswers] = useState(false);
  const [selectedSet, setSelectedSet] = useState("A");
  const [printFontSize, setPrintFontSize] = useState(11);
  const [editingIndex, setEditingIndex] = useState<{type: 'MCQ' | 'CQ', index: number} | null>(null);

  // Watermark state
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkOpacity, setWatermarkOpacity] = useState(10);

  // Social Footer state
  const [youtubeText, setYoutubeText] = useState("আমাদের ইউটিউব চ্যানেল");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [facebookText, setFacebookText] = useState("আমাদের ফেসবুক পেজ");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [telegramText, setTelegramText] = useState("আমাদের টেলিগ্রাম চ্যানেল");
  const [telegramUrl, setTelegramUrl] = useState("");

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
  const [cqPartA, setCqPartA] = useState("");
  const [cqPartB, setCqPartB] = useState("");
  const [cqPartC, setCqPartC] = useState("");
  const [cqPartD, setCqPartD] = useState("");
  const [cqAnsA, setCqAnsA] = useState("");
  const [cqAnsB, setCqAnsB] = useState("");
  const [cqAnsC, setCqAnsC] = useState("");
  const [cqAnsD, setCqAnsD] = useState("");

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
      
      const hasSameStimulus = 
        (q.stimulus === prevQ.stimulus && q.stimulusImage === prevQ.stimulusImage);

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
      setDisplayMcqQuestions(shuffleGroupedQuestions(mcqQuestions, selectedSet));
    } else {
      setDisplayMcqQuestions([]);
    }
  }, [mcqQuestions, selectedSet]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCq = () => {
    if (!cqPartA || !cqPartB || !cqPartC || !cqPartD) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "ক, খ, গ, ঘ প্রশ্নগুলো অবশ্যই পূরণ করতে হবে।" });
      return;
    }
    const newQ: CQQuestion = {
      stimulus: cqStimulus,
      stimulusImage: cqStimulusImage || undefined,
      parts: { a: cqPartA, b: cqPartB, c: cqPartC, d: cqPartD },
      answers: { a: cqAnsA, b: cqAnsB, c: cqAnsC, d: cqAnsD }
    };

    if (editingIndex?.type === 'CQ') {
      const updated = [...cqQuestions];
      updated[editingIndex.index] = newQ;
      setCqQuestions(updated);
      setEditingIndex(null);
      toast({ title: "সফল", description: "সৃজনশীল প্রশ্ন আপডেট হয়েছে।" });
    } else {
      const updated = [...cqQuestions, newQ];
      setCqQuestions(updated);
      toast({ title: "সফল", description: `সৃজনশীল প্রশ্ন যুক্ত হয়েছে। বর্তমানে মোট প্রশ্ন: ${updated.length}টি` });
    }
    
    setCqStimulus("");
    setCqStimulusImage(null);
    setCqPartA("");
    setCqPartB("");
    setCqPartC("");
    setCqPartD("");
    setCqAnsA("");
    setCqAnsB("");
    setCqAnsC("");
    setCqAnsD("");
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
      toast({ title: "সফল", description: "MCQ প্রশ্ন আপডেট হয়েছে।" });
    } else {
      const updated = [...mcqQuestions, newQ];
      setMcqQuestions(updated);
      toast({ title: "সফল", description: `MCQ প্রশ্ন যুক্ত হয়েছে। বর্তমানে মোট প্রশ্ন: ${updated.length}টি` });
    }

    setMcqQuestion("");
    setMcqImage(null);
    if (!keepStimulus) {
      setMcqStimulus("");
      setMcqStimulusImage(null);
    }
    setMcqOptions(["", "", "", ""]);
    setMcqAnswer("");
    setMcqExplanation("");
  };

  const handleEdit = (type: 'MCQ' | 'CQ', index: number) => {
    setEditingIndex({type, index});
    if (type === "MCQ") {
      const q = mcqQuestions[index];
      setMcqQuestion(q.question);
      setMcqImage(q.image || null);
      setMcqStimulus(q.stimulus || "");
      setMcqStimulusImage(q.stimulusImage || null);
      setMcqOptions(q.options);
      setMcqAnswer(q.answer);
      setMcqExplanation(q.explanation || "");
      setKeepStimulus(!!(q.stimulus || q.stimulusImage));
    } else {
      const q = cqQuestions[index];
      setCqStimulus(q.stimulus || "");
      setCqStimulusImage(q.stimulusImage || null);
      setCqPartA(q.parts.a);
      setCqPartB(q.parts.b);
      setCqPartC(q.parts.c);
      setCqPartD(q.parts.d);
      setCqAnsA(q.answers?.a || "");
      setCqAnsB(q.answers?.b || "");
      setCqAnsC(q.answers?.c || "");
      setCqAnsD(q.answers?.d || "");
    }
    const formElement = document.getElementById('input-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setMcqQuestion("");
    setMcqImage(null);
    setMcqStimulus("");
    setMcqStimulusImage(null);
    setMcqOptions(["", "", "", ""]);
    setMcqAnswer("");
    setMcqExplanation("");
    setCqStimulus("");
    setCqStimulusImage(null);
    setCqPartA("");
    setCqPartB("");
    setCqPartC("");
    setCqPartD("");
    setCqAnsA("");
    setCqAnsB("");
    setCqAnsC("");
    setCqAnsD("");
  };

  const handleDelete = (type: 'MCQ' | 'CQ', index: number) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই প্রশ্নটি মুছে ফেলতে চান?")) {
      if (type === "MCQ") {
        setMcqQuestions(prev => prev.filter((_, i) => i !== index));
      } else {
        setCqQuestions(prev => prev.filter((_, i) => i !== index));
      }
      toast({ title: "সফল", description: "প্রশ্নটি বর্তমান তালিকা থেকে মুছে ফেলা হয়েছে।" });
    }
  };

  const handleJsonGenerate = () => {
    if (!jsonInput.trim()) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "JSON ইনপুট খালি হতে পারে না।" });
      return;
    }
    try {
      const data = JSON.parse(jsonInput);
      if (Array.isArray(data)) {
        let mcqAdded = 0;
        let cqAdded = 0;
        const newMcqs: Question[] = [];
        const newCqs: CQQuestion[] = [];

        data.forEach((item: any) => {
          if (item.options && item.answer) {
            newMcqs.push(item);
            mcqAdded++;
          } else if (item.parts) {
            newCqs.push(item);
            cqAdded++;
          }
        });

        if (mcqAdded > 0) setMcqQuestions(prev => [...prev, ...newMcqs]);
        if (cqAdded > 0) setCqQuestions(prev => [...prev, ...newCqs]);

        setJsonInput("");
        toast({ 
          title: "সফল!", 
          description: `${mcqAdded}টি MCQ এবং ${cqAdded}টি সৃজনশীল প্রশ্ন যুক্ত হয়েছে। মোট প্রশ্ন: ${mcqQuestions.length + cqQuestions.length + mcqAdded + cqAdded}টি` 
        });
      } else {
        throw new Error("JSON is not an array.");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "অবৈধ JSON ফরম্যাট।" });
    }
  };

  const handleExport = (withAnswers: boolean) => {
    const totalCount = mcqQuestions.length + cqQuestions.length;
    if(totalCount === 0){
        toast({ variant: "destructive", title: "ত্রুটি", description: "প্রথমে প্রশ্ন যুক্ত করুন।" });
        return;
    }
    document.body.setAttribute('data-print-with-answers', String(withAnswers));
    const originalTitle = document.title;
    document.title = examName || "Exam Paper";
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  if (!mode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 flex-col gap-6">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group"
            onClick={() => setMode("MCQ")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <ListChecks className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl">MCQ মোড</CardTitle>
              <CardDescription>মাল্টিপল চয়েস প্রশ্নপত্র তৈরি করুন</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group"
            onClick={() => setMode("CQ")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <FileText className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl">CQ মোড</CardTitle>
              <CardDescription>সৃজনশীল বা লিখিত প্রশ্নপত্র তৈরি করুন</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="hover:border-primary cursor-pointer transition-all hover:shadow-xl group"
            onClick={() => setMode("BOTH")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <LayoutGrid className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl">MCQ + CQ মোড</CardTitle>
              <CardDescription>এমসিকিউ এবং সৃজনশীল এক ফাইলে আনুন</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-8 text-sm text-muted-foreground flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            Developed By 
            <a 
              href="https://t.me/shu_yaib" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="font-bold text-primary hover:underline flex items-center gap-1"
            >
              <Send className="h-3 w-3" /> Md.Shuyaib Islam
            </a>
          </div>
          <p className="text-[10px] opacity-50">Telegram ID: @shu_yaib</p>
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
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                className="pl-0 hover:bg-transparent" 
                onClick={() => setMode(null)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> মোড পরিবর্তন
              </Button>
            </div>
            
            <Accordion type="multiple" defaultValue={["basic"]} className="space-y-4">
              <AccordionItem value="basic" className="border rounded-lg bg-white overflow-hidden shadow-sm">
                <AccordionTrigger className="px-4 py-3 hover:no-underline font-bold text-lg">
                   বেসিক সেটিংস
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0 space-y-4">
                  <div className="space-y-1">
                    <Label>পরীক্ষার নাম</Label>
                    <Input value={examName} onChange={(e) => setExamName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>পরিচালনায়</Label>
                    <Input value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label>সময়</Label>
                      <Input value={examTime} onChange={(e) => setExamTime(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>পূর্ণমান</Label>
                      <Input value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="flex items-center justify-between">
                      লোগো আপলোড
                      <div className="flex items-center gap-1 scale-75 origin-right">
                        <span className="text-[10px] text-muted-foreground">দেখাবেন?</span>
                        <Switch checked={showLogo} onCheckedChange={setShowLogo} />
                      </div>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setLogoImage)} className="text-xs" />
                      {logoImage && <Button variant="outline" size="icon" onClick={() => setLogoImage(null)}><Trash2 className="h-4 w-4" /></Button>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>প্রিন্ট ফন্ট সাইজ ({printFontSize}px)</Label>
                    <Slider min={8} max={16} step={0.5} value={[printFontSize]} onValueChange={(v) => setPrintFontSize(v[0])} />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="watermark" className="border rounded-lg bg-white overflow-hidden shadow-sm">
                <AccordionTrigger className="px-4 py-3 hover:no-underline font-bold text-lg">
                  <div className="flex items-center gap-2">
                    <Type className="h-5 w-5" /> ওয়াটারমার্ক
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0 space-y-4">
                  <div className="space-y-1">
                    <Label>ওয়াটারমার্ক টেক্সট</Label>
                    <Input 
                      placeholder="যেমন: Confidential, My Institution" 
                      value={watermarkText} 
                      onChange={(e) => setWatermarkText(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>স্বচ্ছতা (Transparency: {watermarkOpacity}%)</Label>
                    <Slider min={0} max={50} step={1} value={[watermarkOpacity]} onValueChange={(v) => setWatermarkOpacity(v[0])} />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="footer" className="border rounded-lg bg-white overflow-hidden shadow-sm">
                <AccordionTrigger className="px-4 py-3 hover:no-underline font-bold text-lg">
                  <div className="flex items-center gap-2">
                    <Youtube className="h-5 w-5" /> সোশ্যাল লিঙ্ক
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0 space-y-4">
                  <div className="space-y-3 border-b pb-3">
                    <h4 className="font-bold text-sm text-red-600 flex items-center gap-1"><Youtube className="h-4 w-4" /> ইউটিউব সেটিংস</h4>
                    <div className="space-y-1">
                      <Label>ডিসপ্লে টেক্সট</Label>
                      <Input value={youtubeText} onChange={(e) => setYoutubeText(e.target.value)} placeholder="ইউটিউব ওয়ার্ড..." />
                    </div>
                    <div className="space-y-1">
                      <Label>লিঙ্ক (URL)</Label>
                      <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="youtube.com/..." />
                    </div>
                  </div>
                  <div className="space-y-3 border-b pb-3">
                    <h4 className="font-bold text-sm text-blue-500 flex items-center gap-1"><Send className="h-4 w-4" /> টেলিগ্রাম সেটিংস</h4>
                    <div className="space-y-1">
                      <Label>ডিসপ্লে টেক্সট</Label>
                      <Input value={telegramText} onChange={(e) => setTelegramText(e.target.value)} placeholder="টেলিগ্রাম ওয়ার্ড..." />
                    </div>
                    <div className="space-y-1">
                      <Label>লিঙ্ক (URL)</Label>
                      <Input value={telegramUrl} onChange={(e) => setTelegramUrl(e.target.value)} placeholder="t.me/..." />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-blue-600 flex items-center gap-1"><Facebook className="h-4 w-4" /> ফেসবুক সেটিংস</h4>
                    <div className="space-y-1">
                      <Label>ডিসপ্লে টেক্সট</Label>
                      <Input value={facebookText} onChange={(e) => setFacebookText(e.target.value)} placeholder="ফেসবুক ওয়ার্ড..." />
                    </div>
                    <div className="space-y-1">
                      <Label>লিঙ্ক (URL)</Label>
                      <Input value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="facebook.com/..." />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="manual">আলাদা ইনপুট</TabsTrigger>
                <TabsTrigger value="json">JSON ইনপুট</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual">
                <Card id="input-form" className={`shadow-lg transition-all duration-300 ${editingIndex !== null ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">
                      {editingIndex !== null ? "প্রশ্ন এডিট করুন" : "নতুন প্রশ্ন"}
                    </CardTitle>
                    {editingIndex !== null && (
                      <Badge variant="outline" className="text-primary border-primary animate-pulse">সম্পাদনা মোড সক্রিয়</Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Tabs defaultValue={editingIndex?.type === 'CQ' ? "cq" : "mcq"} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="mcq" disabled={mode === "CQ"}>MCQ</TabsTrigger>
                        <TabsTrigger value="cq" disabled={mode === "MCQ"}>CQ</TabsTrigger>
                      </TabsList>

                      <TabsContent value="mcq">
                        <div className="space-y-3">
                          <Accordion type="single" collapsible className="w-full" defaultValue={(mcqStimulus || mcqStimulusImage) ? "stimulus" : undefined}>
                            <AccordionItem value="stimulus" className="border rounded-md bg-gray-50/50">
                              <AccordionTrigger className="py-2 hover:no-underline text-xs px-3">
                                <div className="flex items-center gap-2">
                                  <Info className="h-3 w-3 text-primary" />
                                  {mcqStimulus || mcqStimulusImage ? "উদ্দীপক যুক্ত করা হয়েছে" : "উদ্দীপক যোগ করুন (ঐচ্ছিক)"}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-2 px-3 pb-3 space-y-3">
                                 <Textarea 
                                   placeholder="উদ্দীপক টেক্সট..." 
                                   value={mcqStimulus} 
                                   onChange={(e) => setMcqStimulus(e.target.value)} 
                                   className="h-20 text-xs bg-white"
                                 />
                                 <div className="flex items-center gap-2">
                                    <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setMcqStimulusImage)} className="text-xs bg-white" />
                                 </div>
                                 <div className="flex items-center space-x-2 pt-2 border-t">
                                   <Checkbox 
                                     id="keepStimulus" 
                                     checked={keepStimulus} 
                                     onCheckedChange={(checked) => setKeepStimulus(!!checked)} 
                                   />
                                   <Label htmlFor="keepStimulus" className="text-[10px] font-medium leading-none cursor-pointer">
                                     এই উদ্দীপকটি পরবর্তী প্রশ্নের জন্যও রাখুন
                                   </Label>
                                 </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                          <div className="space-y-1">
                            <Label>প্রশ্ন</Label>
                            <Input value={mcqQuestion} onChange={(e) => setMcqQuestion(e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label>প্রশ্ন ছবি (ঐচ্ছিক)</Label>
                            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setMcqImage)} className="text-xs" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {mcqOptions.map((opt, i) => (
                              <Input key={i} placeholder={`বিকল্প ${i+1}`} value={opt} onChange={(e) => {
                                const newOpts = [...mcqOptions];
                                newOpts[i] = e.target.value;
                                setMcqOptions(newOpts);
                              }} />
                            ))}
                          </div>
                          <div className="space-y-1">
                            <Label>সঠিক উত্তর</Label>
                            <Select value={mcqAnswer} onValueChange={setMcqAnswer}>
                              <SelectTrigger>
                                <SelectValue placeholder="সঠিক উত্তর বেছে নিন" />
                              </SelectTrigger>
                              <SelectContent>
                                {mcqOptions.map((opt, i) => (
                                  opt && <SelectItem key={i} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>ব্যাখ্যা (ঐচ্ছিক)</Label>
                            <Textarea value={mcqExplanation} onChange={(e) => setMcqExplanation(e.target.value)} className="h-16 text-xs" placeholder="সঠিক উত্তরের কারণ বা ব্যাখ্যা..." />
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1" onClick={handleAddMcq}>
                              {editingIndex?.type === 'MCQ' ? "আপডেট করুন" : <><Plus className="mr-2 h-4 w-4" /> প্রশ্ন যুক্ত করুন</>}
                            </Button>
                            {editingIndex !== null && (
                              <Button variant="outline" onClick={cancelEdit}>বাতিল</Button>
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="cq">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <Label>উদ্দীপক (টেক্সট)</Label>
                            <Textarea value={cqStimulus} onChange={(e) => setCqStimulus(e.target.value)} className="h-20" />
                          </div>
                          <div className="space-y-1">
                            <Label>উদ্দীপক ছবি</Label>
                            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setCqStimulusImage)} className="text-xs" />
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2 border-l-2 border-primary pl-3">
                              <Label className="text-xs font-bold text-primary">ক নং প্রশ্ন ও উত্তর</Label>
                              <Input placeholder="ক) প্রশ্ন" value={cqPartA} onChange={(e) => setCqPartA(e.target.value)} />
                              <Textarea placeholder="ক এর উত্তর (ঐচ্ছিক)" value={cqAnsA} onChange={(e) => setCqAnsA(e.target.value)} className="h-12 text-xs" />
                            </div>
                            <div className="space-y-2 border-l-2 border-primary pl-3">
                              <Label className="text-xs font-bold text-primary">খ নং প্রশ্ন ও উত্তর</Label>
                              <Input placeholder="খ) প্রশ্ন" value={cqPartB} onChange={(e) => setCqPartB(e.target.value)} />
                              <Textarea placeholder="খ এর উত্তর (ঐচ্ছিক)" value={cqAnsB} onChange={(e) => setCqAnsB(e.target.value)} className="h-12 text-xs" />
                            </div>
                            <div className="space-y-2 border-l-2 border-primary pl-3">
                              <Label className="text-xs font-bold text-primary">গ নং প্রশ্ন ও উত্তর</Label>
                              <Input placeholder="গ) প্রশ্ন" value={cqPartC} onChange={(e) => setCqPartC(e.target.value)} />
                              <Textarea placeholder="গ এর উত্তর (ঐচ্ছিক)" value={cqAnsC} onChange={(e) => setCqAnsC(e.target.value)} className="h-12 text-xs" />
                            </div>
                            <div className="space-y-2 border-l-2 border-primary pl-3">
                              <Label className="text-xs font-bold text-primary">ঘ নং প্রশ্ন ও উত্তর</Label>
                              <Input placeholder="ঘ) প্রশ্ন" value={cqPartD} onChange={(e) => setCqPartD(e.target.value)} />
                              <Textarea placeholder="ঘ এর উত্তর (ঐচ্ছিক)" value={cqAnsD} onChange={(e) => setCqAnsD(e.target.value)} className="h-12 text-xs" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1" onClick={handleAddCq}>
                              {editingIndex?.type === 'CQ' ? "আপডেট করুন" : <><Plus className="mr-2 h-4 w-4" /> প্রশ্ন যুক্ত করুন</>}
                            </Button>
                            {editingIndex !== null && (
                              <Button variant="outline" onClick={cancelEdit}>বাতিল</Button>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="json">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">JSON ইনপুট (MCQ + CQ)</CardTitle>
                    <CardDescription className="text-[10px]">
                       নিচের ফরম্যাটটি অনুসরণ করুন (CQ উত্তরের জন্য "answers" ফিল্ড ব্যবহার করুন):
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea 
                      className="h-60 text-xs font-mono" 
                      value={jsonInput} 
                      onChange={(e) => setJsonInput(e.target.value)} 
                      placeholder='[
  {
    "question": "MCQ প্রশ্ন এখানে?",
    "options": ["ক", "খ", "গ", "ঘ"],
    "answer": "ক",
    "explanation": "ব্যাখ্যা"
  },
  {
    "stimulus": "উদ্দীপক এখানে...",
    "parts": {
      "a": "ক নং প্রশ্ন",
      "b": "খ নং প্রশ্ন",
      "c": "গ নং প্রশ্ন",
      "d": "ঘ নং প্রশ্ন"
    },
    "answers": {
      "a": "ক উত্তর",
      "b": "খ উত্তর",
      "c": "গ উত্তর",
      "d": "ঘ উত্তর"
    }
  }
]'
                    />
                    <Button className="w-full" onClick={handleJsonGenerate}>জেনারেট করুন</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {(mcqQuestions.length + cqQuestions.length) > 0 && (
               <Card className="shadow-lg border-accent/30">
                 <CardHeader className="py-3 px-4 bg-accent/5">
                   <CardTitle className="text-sm font-bold flex items-center justify-between">
                     বর্তমান প্রশ্নসমূহ
                     <span className="bg-accent px-2 py-0.5 rounded text-[10px]">{mcqQuestions.length + cqQuestions.length}টি</span>
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="p-0 max-h-60 overflow-y-auto scrollbar-hide">
                    <div className="divide-y">
                       {mcqQuestions.map((q, i) => (
                         <div key={`mcq-${i}`} className={`flex items-center justify-between p-3 transition-colors group ${editingIndex?.type === 'MCQ' && editingIndex.index === i ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-gray-50'}`}>
                            <div className="flex flex-col flex-1 truncate mr-2">
                              <span className="text-xs truncate font-medium">MCQ {i+1}. {q.question}</span>
                              {(q.stimulus || q.stimulusImage) && <Badge variant="secondary" className="w-fit text-[10px] h-4 mt-1 px-2 bg-blue-100 text-blue-700 font-bold border-blue-200">উদ্দীপকসহ</Badge>}
                            </div>
                            <div className="flex items-center gap-1">
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEdit('MCQ', i)}>
                                 <Edit2 className="h-4 w-4" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete('MCQ', i)}>
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                            </div>
                         </div>
                       ))}
                       {cqQuestions.map((q, i) => (
                         <div key={`cq-${i}`} className={`flex items-center justify-between p-3 transition-colors group ${editingIndex?.type === 'CQ' && editingIndex.index === i ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-gray-50'}`}>
                            <div className="flex flex-col flex-1 truncate mr-2">
                              <span className="text-xs truncate font-medium">CQ {i+1}. {q.stimulus?.slice(0, 30)}...</span>
                            </div>
                            <div className="flex items-center gap-1">
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEdit('CQ', i)}>
                                 <Edit2 className="h-4 w-4" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete('CQ', i)}>
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </CardContent>
               </Card>
            )}

            <div className="mt-6 space-y-4">
              <div className="flex flex-col gap-2">
                <Button className="w-full h-12 text-lg font-bold" onClick={() => handleExport(true)}>
                  <Printer className="mr-2 h-5 w-5" /> উত্তরসহ পিডিএফ
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => handleExport(false)}>
                  <Printer className="mr-2 h-4 w-4" /> উত্তর ছাড়া পিডিএফ
                </Button>
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-white">
                  <Label>প্রিভিউতে উত্তর দেখান</Label>
                  <Switch checked={previewAnswers} onCheckedChange={setPreviewAnswers} />
                </div>
                {(mode === "MCQ" || mode === "BOTH") && (
                  <div className="space-y-1">
                    <Label>সেট নির্বাচন</Label>
                    <Select value={selectedSet} onValueChange={setSelectedSet}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Set A</SelectItem>
                        <SelectItem value="B">Set B</SelectItem>
                        <SelectItem value="C">Set C</SelectItem>
                        <SelectItem value="D">Set D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={() => {
                  if(confirm("সব প্রশ্ন মুছে ফেলতে চান?")){
                    setMcqQuestions([]);
                    setCqQuestions([]);
                    toast({ title: "সফল", description: "বর্তমান তালিকা খালি করা হয়েছে।" });
                  }
                }}
              >
                সব প্রশ্ন মুছুন
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-8 bg-gray-100/50 overflow-y-auto scrollbar-hide">
          <PaperPreview
            examName={examName}
            authorName={authorName}
            examTime={examTime}
            totalMarks={totalMarks}
            mcqQuestions={displayMcqQuestions}
            cqQuestions={cqQuestions}
            setName={selectedSet}
            mode={mode}
            logoImage={logoImage}
            showLogo={showLogo}
            watermarkText={watermarkText}
            watermarkOpacity={watermarkOpacity}
            youtubeText={youtubeText}
            youtubeUrl={youtubeUrl}
            facebookText={facebookText}
            facebookUrl={facebookUrl}
            telegramText={telegramText}
            telegramUrl={telegramUrl}
          />
        </main>
      </div>
    </>
  );
}
