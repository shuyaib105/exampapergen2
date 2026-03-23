
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Question, CQQuestion, StoredQuestion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
  Database, 
  Save, 
  Search,
  CheckSquare,
  Square,
  Edit2,
  XCircle,
  ChevronDown
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

type AppMode = "MCQ" | "CQ" | null;

const PaperPreview = ({ 
  examName, 
  authorName, 
  examTime, 
  totalMarks, 
  mcqQuestions, 
  cqQuestions, 
  setName, 
  mode 
}: {
  examName: string;
  authorName: string;
  examTime: string;
  totalMarks: string;
  mcqQuestions: Question[];
  cqQuestions: CQQuestion[];
  setName: string;
  mode: AppMode;
}) => (
  <div id="printable-area" className="w-full max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-lg shadow-lg print:shadow-none print:rounded-none print:p-1 min-h-[11in]">
    <header className="text-center pb-4 print:pb-2 border-b print:border-b-2 border-gray-200 print:border-black exam-header-print">
      <h1 className="text-2xl font-bold font-headline print-h1">{examName || "পরীক্ষার নাম"}</h1>
      <p className="text-lg font-semibold print-header-p">{authorName || "পরিচালনায়: নাম"}</p>
      <div className="flex justify-between items-center mt-2 print:mt-1 text-base print-header-div">
        <span>পূর্ণমান: {totalMarks || "..."}</span>
        {mode === "MCQ" && <span className="font-bold">সেট: {setName}</span>}
        <span>সময়: {examTime || "..."}</span>
      </div>
    </header>

    <section className="mt-4 print:mt-2">
      {mode === "MCQ" ? (
        mcqQuestions.length > 0 ? (
          <div className="md:columns-2 print:columns-2 md:gap-x-12 print:gap-x-6 [column-fill:auto]">
            {mcqQuestions.map((q, index) => (
              <article key={index} className="mb-2 print:mb-1 question-item-print break-inside-avoid-column">
                {/* MCQ Stimulus Rendering */}
                {q.stimulus && (
                  <div className="mb-2 italic text-sm border-l-2 border-gray-300 pl-2 bg-gray-50/50 print:bg-transparent">
                    {q.stimulus}
                  </div>
                )}
                {q.stimulusImage && (
                  <div className="mb-2 flex justify-center">
                    <img src={q.stimulusImage} alt="Stimulus" className="max-h-32 object-contain rounded" />
                  </div>
                )}
                
                <p className="font-bold text-base mb-1 print-question-p">{index + 1}. {q.question}</p>
                {q.image && (
                  <div className="mb-2 max-w-full h-auto flex justify-center">
                    <img src={q.image} alt="Question" className="max-h-32 object-contain" />
                  </div>
                )}
                <ul className="grid grid-cols-2 gap-x-6 print:gap-x-4 gap-y-0 pl-3 print:pl-2">
                  {q.options.map((option, optIndex) => {
                    const optionLabel = String.fromCharCode(97 + optIndex); // a, b, c, d
                    const isCorrect = option === q.answer;

                    return (
                      <li key={optIndex} className="flex items-start space-x-2 print:space-x-1 print-option-li">
                        <div className="answer-content text-green-600 print:text-green-600 mt-1">
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
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-20">
            <p>এখানে আপনার পরীক্ষার প্রশ্নপত্রের প্রিভিউ দেখা যাবে।</p>
          </div>
        )
      ) : (
        cqQuestions.length > 0 ? (
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
                <div className="grid grid-cols-1 gap-y-1 pl-4 print:pl-2">
                  <p><span className="font-bold">ক)</span> {q.parts.a}</p>
                  <p><span className="font-bold">খ)</span> {q.parts.b}</p>
                  <p><span className="font-bold">গ)</span> {q.parts.c}</p>
                  <p><span className="font-bold">ঘ)</span> {q.parts.d}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-20">
            <p>এখানে আপনার সৃজনশীল (CQ) প্রশ্নপত্রের প্রিভিউ দেখা যাবে।</p>
          </div>
        )
      )}
    </section>
  </div>
);

export default function ExamPage() {
  const [mode, setMode] = useState<AppMode>(null);
  const [examName, setExamName] = useState("মডেল টেস্ট");
  const [authorName, setAuthorName] = useState("Md Jubayer | রংপুর মেডিকেল কলেজ");
  const [examTime, setExamTime] = useState("২ ঘন্টা");
  const [totalMarks, setTotalMarks] = useState("১০০");
  const [mcqQuestions, setMcqQuestions] = useState<Question[]>([]);
  const [displayMcqQuestions, setDisplayMcqQuestions] = useState<Question[]>([]);
  const [cqQuestions, setCqQuestions] = useState<CQQuestion[]>([]);
  const [jsonInput, setJsonInput] = useState("");
  const [previewAnswers, setPreviewAnswers] = useState(false);
  const [selectedSet, setSelectedSet] = useState("A");
  const [printFontSize, setPrintFontSize] = useState(11);
  const [currentChapter, setCurrentChapter] = useState("সাধারণ");

  // Editing State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // MCQ Manual Inputs
  const [mcqQuestion, setMcqQuestion] = useState("");
  const [mcqImage, setMcqImage] = useState<string | null>(null);
  const [mcqStimulus, setMcqStimulus] = useState("");
  const [mcqStimulusImage, setMcqStimulusImage] = useState<string | null>(null);
  const [mcqOptions, setMcqOptions] = useState(["", "", "", ""]);
  const [mcqAnswer, setMcqAnswer] = useState("");

  // CQ Manual Inputs
  const [cqStimulus, setCqStimulus] = useState("");
  const [cqStimulusImage, setCqStimulusImage] = useState<string | null>(null);
  const [cqPartA, setCqPartA] = useState("");
  const [cqPartB, setCqPartB] = useState("");
  const [cqPartC, setCqPartC] = useState("");
  const [cqPartD, setCqPartD] = useState("");

  const { toast } = useToast();
  const db = useFirestore();

  // Storage related states
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [searchChapter, setSearchChapter] = useState("");
  const [selectedStoredQuestions, setSelectedStoredQuestions] = useState<string[]>([]);

  const questionsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, "questions"), orderBy("createdAt", "desc"));
  }, [db]);

  const { data: storedQuestionsData, loading: storageLoading } = useCollection(questionsQuery);
  const storedQuestions = (storedQuestionsData || []) as StoredQuestion[];

  const filteredStoredQuestions = storedQuestions.filter(q => 
    q.chapterName.toLowerCase().includes(searchChapter.toLowerCase()) && q.type === mode
  );

  const chapters = Array.from(new Set(filteredStoredQuestions.map(q => q.chapterName)));

  const dynamicPrintStyles = `
    @media print {
      #printable-area .print-h1 { font-size: ${printFontSize * 1.25}px !important; }
      #printable-area .print-header-p { font-size: ${printFontSize * 1.15}px !important; }
      #printable-area .print-header-div { font-size: ${printFontSize}px !important; }
      #printable-area .print-question-p { font-size: ${printFontSize}px !important; }
      #printable-area .print-option-li { font-size: ${printFontSize * 0.95}px !important; }
      #printable-area .question-item-print { font-size: ${printFontSize}px !important; }
      #printable-area .md\\:columns-2, #printable-area .print\\:columns-2 {
        column-fill: auto !important;
        height: auto;
      }
    }
  `;

  const shuffleArray = (array: Question[], seed: string): Question[] => {
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

  useEffect(() => {
    document.body.setAttribute('data-preview-answers', String(previewAnswers));
  }, [previewAnswers]);
  
  useEffect(() => {
    if (mcqQuestions.length > 0) {
      if (selectedSet === "A") {
        setDisplayMcqQuestions(mcqQuestions);
      } else {
        setDisplayMcqQuestions(shuffleArray(mcqQuestions, selectedSet));
      }
    } else {
      setDisplayMcqQuestions([]);
    }
  }, [mcqQuestions, selectedSet]);

  const saveQuestionToFirestore = (type: 'MCQ' | 'CQ', content: any) => {
    if (!db) return;
    addDoc(collection(db, "questions"), {
      chapterName: currentChapter || "সাধারণ",
      type,
      content,
      createdAt: serverTimestamp()
    }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: "questions",
        operation: "create",
        requestResourceData: { type, chapterName: currentChapter }
      });
      errorEmitter.emit("permission-error", permissionError);
    });
  };

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
      parts: { a: cqPartA, b: cqPartB, c: cqPartC, d: cqPartD }
    };

    if (editingIndex !== null) {
      const updated = [...cqQuestions];
      updated[editingIndex] = newQ;
      setCqQuestions(updated);
      setEditingIndex(null);
      toast({ title: "সফল", description: "সৃজনশীল প্রশ্ন আপডেট হয়েছে।" });
    } else {
      const updated = [...cqQuestions, newQ];
      setCqQuestions(updated);
      saveQuestionToFirestore('CQ', newQ);
      toast({ title: "সফল", description: `সৃজনশীল প্রশ্ন যুক্ত হয়েছে। বর্তমানে মোট প্রশ্ন: ${updated.length}টি` });
    }
    
    // Reset
    setCqStimulus("");
    setCqStimulusImage(null);
    setCqPartA("");
    setCqPartB("");
    setCqPartC("");
    setCqPartD("");
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
    };

    if (editingIndex !== null) {
      const updated = [...mcqQuestions];
      updated[editingIndex] = newQ;
      setMcqQuestions(updated);
      setEditingIndex(null);
      toast({ title: "সফল", description: "MCQ প্রশ্ন আপডেট হয়েছে।" });
    } else {
      const updated = [...mcqQuestions, newQ];
      setMcqQuestions(updated);
      saveQuestionToFirestore('MCQ', newQ);
      toast({ title: "সফল", description: `MCQ প্রশ্ন যুক্ত হয়েছে। বর্তমানে মোট প্রশ্ন: ${updated.length}টি` });
    }

    // Reset
    setMcqQuestion("");
    setMcqImage(null);
    setMcqStimulus("");
    setMcqStimulusImage(null);
    setMcqOptions(["", "", "", ""]);
    setMcqAnswer("");
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    if (mode === "MCQ") {
      const q = mcqQuestions[index];
      setMcqQuestion(q.question);
      setMcqImage(q.image || null);
      setMcqStimulus(q.stimulus || "");
      setMcqStimulusImage(q.stimulusImage || null);
      setMcqOptions(q.options);
      setMcqAnswer(q.answer);
    } else {
      const q = cqQuestions[index];
      setCqStimulus(q.stimulus || "");
      setCqStimulusImage(q.stimulusImage || null);
      setCqPartA(q.parts.a);
      setCqPartB(q.parts.b);
      setCqPartC(q.parts.c);
      setCqPartD(q.parts.d);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    if (mode === "MCQ") {
      setMcqQuestion("");
      setMcqImage(null);
      setMcqStimulus("");
      setMcqStimulusImage(null);
      setMcqOptions(["", "", "", ""]);
      setMcqAnswer("");
    } else {
      setCqStimulus("");
      setCqStimulusImage(null);
      setCqPartA("");
      setCqPartB("");
      setCqPartC("");
      setCqPartD("");
    }
  };

  const handleDelete = (index: number) => {
    if (confirm("আপনি কি নিশ্চিতভাবে এই প্রশ্নটি মুছে ফেলতে চান?")) {
      if (mode === "MCQ") {
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
        let currentTotal = 0;
        if (mode === "MCQ") {
          const updated = [...mcqQuestions, ...data];
          setMcqQuestions(updated);
          data.forEach(q => saveQuestionToFirestore('MCQ', q));
          currentTotal = updated.length;
        } else {
          const updated = [...cqQuestions, ...data];
          setCqQuestions(updated);
          data.forEach(q => saveQuestionToFirestore('CQ', q));
          currentTotal = updated.length;
        }
        setJsonInput("");
        toast({ title: "সফল!", description: `${data.length}টি প্রশ্ন যুক্ত হয়েছে। বর্তমানে মোট প্রশ্ন: ${currentTotal}টি` });
      } else {
        throw new Error("JSON is not an array.");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "অবৈধ JSON ফরম্যাট।" });
    }
  };

  const handleExport = (withAnswers: boolean) => {
    const count = mode === "MCQ" ? displayMcqQuestions.length : cqQuestions.length;
    if(count === 0){
        toast({ variant: "destructive", title: "ত্রুটি", description: "প্রথমে প্রশ্ন যুক্ত করুন।" });
        return;
    }
    document.body.setAttribute('data-print-with-answers', String(withAnswers));
    window.print();
  };

  const toggleStoredQuestionSelection = (id: string) => {
    setSelectedStoredQuestions(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const addSelectedStoredToExam = () => {
    const selected = storedQuestions.filter(q => selectedStoredQuestions.includes(q.id));
    let currentTotal = 0;
    if (mode === "MCQ") {
      const updated = [...mcqQuestions, ...selected.map(s => s.content as Question)];
      setMcqQuestions(updated);
      currentTotal = updated.length;
    } else {
      const updated = [...cqQuestions, ...selected.map(s => s.content as CQQuestion)];
      setCqQuestions(updated);
      currentTotal = updated.length;
    }
    setSelectedStoredQuestions([]);
    setIsStorageOpen(false);
    toast({ title: "সফল", description: `${selected.length}টি প্রশ্ন যুক্ত হয়েছে। বর্তমানে মোট প্রশ্ন: ${currentTotal}টি` });
  };

  const deleteStoredQuestion = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, "questions", id)).then(() => {
      toast({ title: "সফল", description: "প্রশ্নটি স্টোরেজ থেকে মুছে ফেলা হয়েছে।" });
    });
  };

  if (!mode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-2xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <CardTitle className="text-2xl">CQ (সৃজনশীল) মোড</CardTitle>
              <CardDescription>সৃজনশীল বা লিখিত প্রশ্নপত্র তৈরি করুন</CardDescription>
            </CardHeader>
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
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                className="pl-0 hover:bg-transparent" 
                onClick={() => setMode(null)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> মোড পরিবর্তন
              </Button>
              <Dialog open={isStorageOpen} onOpenChange={setIsStorageOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Database className="h-4 w-4" /> প্রশ্ন স্টোরেজ
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <Database className="h-5 w-5" /> আপনার প্রশ্ন স্টোরেজ ({mode})
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                        <Input 
                          placeholder="চ্যাপ্টারের নাম দিয়ে খুঁজুন..." 
                          className="pl-8" 
                          value={searchChapter}
                          onChange={(e) => setSearchChapter(e.target.value)}
                        />
                      </div>
                      <Button 
                        disabled={selectedStoredQuestions.length === 0}
                        onClick={addSelectedStoredToExam}
                      >
                        নির্বাচিতগুলো যোগ করুন ({selectedStoredQuestions.length})
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {chapters.length > 0 ? (
                        <Accordion type="multiple" className="w-full">
                          {chapters.map((chapter, idx) => {
                            const chapterQuestions = filteredStoredQuestions.filter(q => q.chapterName === chapter);
                            if (chapterQuestions.length === 0) return null;
                            return (
                              <AccordionItem key={chapter + idx} value={`chapter-${idx}`} className="border rounded-lg mb-2 px-2">
                                <AccordionTrigger className="hover:no-underline py-3">
                                  <div className="flex items-center justify-between w-full pr-4">
                                    <span className="font-bold text-lg">{chapter}</span>
                                    <span className="text-sm font-normal text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">{chapterQuestions.length}টি প্রশ্ন</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="grid grid-cols-1 gap-3 py-3">
                                    {chapterQuestions.map((q) => (
                                      <div 
                                        key={q.id} 
                                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${selectedStoredQuestions.includes(q.id) ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'}`}
                                        onClick={() => toggleStoredQuestionSelection(q.id)}
                                      >
                                        <div className="mt-1">
                                          {selectedStoredQuestions.includes(q.id) ? (
                                            <CheckSquare className="h-5 w-5 text-primary" />
                                          ) : (
                                            <Square className="h-5 w-5 text-gray-300" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          {q.type === 'MCQ' ? (
                                            <div>
                                              <p className="font-medium">{(q.content as Question).question}</p>
                                              <p className="text-xs text-muted-foreground mt-1">সঠিক উত্তর: {(q.content as Question).answer}</p>
                                            </div>
                                          ) : (
                                            <div>
                                              <p className="font-medium line-clamp-2">{(q.content as CQQuestion).stimulus}</p>
                                              <div className="grid grid-cols-2 gap-x-4 mt-1 text-xs text-muted-foreground">
                                                <span>ক) {(q.content as CQQuestion).parts.a}</span>
                                                <span>খ) {(q.content as CQQuestion).parts.b}</span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if(confirm("স্টোরেজ থেকে মুছে ফেলতে চান?")) deleteStoredQuestion(q.id);
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      ) : (
                        <div className="text-center py-20 text-gray-400">
                          <Database className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>আপনার প্রশ্ন স্টোরেজে কোনো প্রশ্ন নেই।</p>
                        </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card className="shadow-lg border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                   ExamPaperGen
                </CardTitle>
                <CardDescription>বেসিক সেটিংস</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <Label>সময়</Label>
                    <Input value={examTime} onChange={(e) => setExamTime(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>পূর্ণমান</Label>
                    <Input value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>প্রিন্ট ফন্ট সাইজ ({printFontSize}px)</Label>
                  <Slider min={8} max={16} step={0.5} value={[printFontSize]} onValueChange={(v) => setPrintFontSize(v[0])} />
                </div>
                <div className="space-y-1 border-t pt-4">
                  <Label className="flex items-center gap-2">
                    <Database className="h-4 w-4" /> চ্যাপ্টারের নাম
                  </Label>
                  <Input 
                    placeholder="যেমন: কোষ ও কোষের গঠন" 
                    value={currentChapter} 
                    onChange={(e) => setCurrentChapter(e.target.value)} 
                  />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="manual">আলাদা ইনপুট</TabsTrigger>
                <TabsTrigger value="json">JSON ইনপুট</TabsTrigger>
              </TabsList>
              
              <TabsContent value="manual">
                <Card className="shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">
                      {editingIndex !== null ? "প্রশ্ন এডিট করুন" : "নতুন প্রশ্ন"}
                    </CardTitle>
                    {editingIndex !== null && (
                      <Button variant="ghost" size="icon" onClick={cancelEdit}>
                        <XCircle className="h-5 w-5 text-destructive" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mode === "CQ" ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label>উদ্দীপক (টেক্সট)</Label>
                          <Textarea value={cqStimulus} onChange={(e) => setCqStimulus(e.target.value)} className="h-20" />
                        </div>
                        <div className="space-y-1">
                          <Label>উদ্দীপক ছবি</Label>
                          <div className="flex items-center gap-2">
                            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setCqStimulusImage)} className="text-xs" />
                            {cqStimulusImage && <Button variant="outline" size="icon" onClick={() => setCqStimulusImage(null)}><Trash2 className="h-4 w-4" /></Button>}
                          </div>
                          {cqStimulusImage && <img src={cqStimulusImage} className="mt-2 h-20 object-contain rounded border" />}
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <Input placeholder="ক) প্রশ্ন" value={cqPartA} onChange={(e) => setCqPartA(e.target.value)} />
                          <Input placeholder="খ) প্রশ্ন" value={cqPartB} onChange={(e) => setCqPartB(e.target.value)} />
                          <Input placeholder="গ) প্রশ্ন" value={cqPartC} onChange={(e) => setCqPartC(e.target.value)} />
                          <Input placeholder="ঘ) প্রশ্ন" value={cqPartD} onChange={(e) => setCqPartD(e.target.value)} />
                        </div>
                        <Button className="w-full" onClick={handleAddCq}>
                          {editingIndex !== null ? "আপডেট করুন" : <><Plus className="mr-2 h-4 w-4" /> প্রশ্ন যুক্ত ও সেভ করুন</>}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="stimulus" className="border-none">
                            <AccordionTrigger className="py-2 hover:no-underline text-xs bg-gray-50 px-2 rounded">
                              উদ্দীপক যোগ করুন (ঐচ্ছিক)
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 space-y-2">
                               <Textarea 
                                 placeholder="উদ্দীপক টেক্সট..." 
                                 value={mcqStimulus} 
                                 onChange={(e) => setMcqStimulus(e.target.value)} 
                                 className="h-20 text-xs"
                               />
                               <div className="flex items-center gap-2">
                                  <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setMcqStimulusImage)} className="text-xs" />
                                  {mcqStimulusImage && <Button variant="outline" size="icon" onClick={() => setMcqStimulusImage(null)}><Trash2 className="h-4 w-4" /></Button>}
                               </div>
                               {mcqStimulusImage && <img src={mcqStimulusImage} className="mt-2 h-20 object-contain rounded border" />}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                        
                        <div className="space-y-1">
                          <Label>প্রশ্ন</Label>
                          <Input value={mcqQuestion} onChange={(e) => setMcqQuestion(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label>প্রশ্ন ছবি (ঐচ্ছিক)</Label>
                          <div className="flex items-center gap-2">
                            <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setMcqImage)} className="text-xs" />
                            {mcqImage && <Button variant="outline" size="icon" onClick={() => setMcqImage(null)}><Trash2 className="h-4 w-4" /></Button>}
                          </div>
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
                        <Button className="w-full" onClick={handleAddMcq}>
                          {editingIndex !== null ? "আপডেট করুন" : <><Plus className="mr-2 h-4 w-4" /> প্রশ্ন যুক্ত ও সেভ করুন</>}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="json">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">JSON ইনপুট</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea 
                      className="h-40 text-xs font-mono" 
                      value={jsonInput} 
                      onChange={(e) => setJsonInput(e.target.value)} 
                      placeholder="JSON ডেটা এখানে পেস্ট করুন..."
                    />
                    <Button className="w-full" onClick={handleJsonGenerate}>জেনারেট ও সেভ করুন</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Current List Section */}
            {(mode === "MCQ" ? mcqQuestions.length : cqQuestions.length) > 0 && (
               <Card className="shadow-lg border-accent/30">
                 <CardHeader className="py-3 px-4 bg-accent/5">
                   <CardTitle className="text-sm font-bold flex items-center justify-between">
                     বর্তমান প্রশ্নসমূহ
                     <span className="bg-accent px-2 py-0.5 rounded text-[10px]">{mode === "MCQ" ? mcqQuestions.length : cqQuestions.length}টি</span>
                   </CardTitle>
                 </CardHeader>
                 <CardContent className="p-0 max-h-60 overflow-y-auto">
                    <div className="divide-y">
                       {(mode === "MCQ" ? mcqQuestions : cqQuestions).map((q, i) => (
                         <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group">
                            <span className="text-sm truncate flex-1">
                              {i+1}. {mode === "MCQ" ? (q as Question).question : (q as CQQuestion).stimulus?.slice(0, 30) + "..."}
                            </span>
                            <div className="flex items-center gap-1">
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(i)}>
                                 <Edit2 className="h-4 w-4" />
                               </Button>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(i)}>
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
                  <Printer className="mr-2 h-5 w-5" /> {mode === "MCQ" ? "উত্তরসহ পিডিএফ" : "পিডিএফ এক্সপোর্ট"}
                </Button>
                {mode === "MCQ" && (
                  <>
                    <Button variant="secondary" className="w-full" onClick={() => handleExport(false)}>
                      <Printer className="mr-2 h-4 w-4" /> উত্তর ছাড়া পিডিএফ
                    </Button>
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm bg-white">
                      <Label>প্রিভিউতে উত্তর দেখান</Label>
                      <Switch checked={previewAnswers} onCheckedChange={setPreviewAnswers} />
                    </div>
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
                  </>
                )}
              </div>
              
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={() => {
                  if(confirm("সব প্রশ্ন মুছে ফেলতে চান? এটি শুধুমাত্র বর্তমান তালিকা থেকে মুছবে, স্টোরেজ থেকে নয়।")){
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
          />
        </main>
      </div>
    </>
  );
}
