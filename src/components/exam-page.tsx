"use client";

import { useState, useEffect } from "react";
import type { Question, CQQuestion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Printer, CheckCircle, Circle, FileText, ListChecks, ArrowLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

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
  <div id="printable-area" className="w-full max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-lg shadow-lg print:shadow-none print:rounded-none print:p-1">
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
          <div className="md:columns-2 print:columns-2 md:gap-x-12 print:gap-x-6">
            {mcqQuestions.map((q, index) => (
              <article key={index} className="mb-2 print:mb-1 question-item-print break-inside-avoid">
                <p className="font-bold text-base mb-1 print-question-p">{index + 1}. {q.question}</p>
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
                <div className="answer-content mt-1 pl-3 print:pl-2">
                  {q.explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-1 text-xs print:bg-gray-100 print:border-gray-300 print-explanation-div">
                      <p><span className="font-bold">ব্যাখ্যা:</span> {q.explanation}</p>
                    </div>
                  )}
                </div>
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
                <div className="mb-3 print:mb-2 italic text-gray-700 bg-gray-50 p-2 rounded print:bg-white print:p-0 print:italic">
                  {q.stimulus}
                </div>
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

const AnswerSheet = ({ questions, setName }: { questions: Question[], setName: string }) => {
  if (questions.length === 0) return null;

  const getOptionLabel = (q: Question) => {
    const index = q.options.findIndex(opt => opt === q.answer);
    if (index === -1) return '?';
    return String.fromCharCode(97 + index).toUpperCase();
  };

  return (
    <div className="p-6">
      <DialogHeader>
        <DialogTitle>উত্তরপত্র - সেট: {setName}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2 mt-4 text-sm">
        {questions.map((q, index) => (
          <div key={index} className="flex">
            <span className="font-bold w-8">{index + 1}.</span>
            <span>{getOptionLabel(q)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};


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
  const [isAnswerSheetOpen, setIsAnswerSheetOpen] = useState(false);
  const [printFontSize, setPrintFontSize] = useState(11);

  const { toast } = useToast();
  
  const dynamicPrintStyles = `
    @media print {
      #printable-area .print-h1 { font-size: ${printFontSize * 1.25}px !important; }
      #printable-area .print-header-p { font-size: ${printFontSize * 1.15}px !important; }
      #printable-area .print-header-div { font-size: ${printFontSize}px !important; }
      #printable-area .print-question-p { font-size: ${printFontSize}px !important; }
      #printable-area .print-option-li { font-size: ${printFontSize * 0.95}px !important; }
      #printable-area .print-explanation-div { font-size: ${printFontSize * 0.85}px !important; }
      #printable-area .question-item-print { font-size: ${printFontSize}px !important; }
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
    const handleAfterPrint = () => {
      document.body.removeAttribute('data-print-with-answers');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

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

  const handleGenerate = () => {
    if (!jsonInput.trim()) {
      toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: "JSON ইনপুট খালি হতে পারে না।",
      });
      return;
    }
    try {
      const data = JSON.parse(jsonInput);
      if (Array.isArray(data)) {
        if (mode === "MCQ") {
          setMcqQuestions(data);
        } else {
          setCqQuestions(data);
        }
        toast({
          title: "সফল!",
          description: `${data.length}টি প্রশ্ন সফলভাবে লোড করা হয়েছে।`,
        });
      } else {
        throw new Error("JSON is not an array.");
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      toast({
        variant: "destructive",
        title: "ত্রুটি",
        description: "অবৈধ JSON ফরম্যাট। অনুগ্রহ করে আপনার ইনপুট চেক করুন।",
      });
      if (mode === "MCQ") setMcqQuestions([]);
      else setCqQuestions([]);
    }
  };

  const handleExport = (withAnswers: boolean) => {
    const count = mode === "MCQ" ? displayMcqQuestions.length : cqQuestions.length;
    if(count === 0){
        toast({
            variant: "destructive",
            title: "ত্রুটি",
            description: "প্রথমে একটি প্রশ্নপত্র জেনারেট করুন।",
        });
        return;
    }
    document.body.setAttribute('data-print-with-answers', String(withAnswers));
    window.print();
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
        <aside className="w-full lg:w-[380px] lg:min-w-[380px] p-4 sm:p-6 border-b lg:border-r lg:border-b-0 print:hidden no-print">
          <div className="lg:sticky lg:top-6">
            <Button 
              variant="ghost" 
              className="mb-4 pl-0 hover:bg-transparent" 
              onClick={() => setMode(null)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> মোড পরিবর্তন করুন
            </Button>
            
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl font-headline">ExamPaperGen</CardTitle>
                <CardDescription>
                  {mode === "MCQ" ? "MCQ প্রশ্নপত্র তৈরি করুন" : "সৃজনশীল (CQ) প্রশ্নপত্র তৈরি করুন"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="examName">পরীক্ষার নাম</Label>
                  <Input id="examName" value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="e.g., মডেল টেস্ট" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authorName">পরিচালনায় (নাম ও প্রতিষ্ঠান)</Label>
                  <Input id="authorName" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="e.g., Md Jubayer | রংপুর মেডিকেল কলেজ" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="examTime">সময়</Label>
                    <Input id="examTime" value={examTime} onChange={(e) => setExamTime(e.target.value)} placeholder="e.g., ২ ঘন্টা" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalMarks">পূর্ণমান</Label>
                    <Input id="totalMarks" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} placeholder="e.g., ১০০" />
                  </div>
                </div>

                {mode === "MCQ" && (
                   <div className="space-y-2">
                    <Label htmlFor="set">সেট</Label>
                    <Select value={selectedSet} onValueChange={setSelectedSet}>
                      <SelectTrigger id="set">
                        <SelectValue placeholder="সেট নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="printFontSize">প্রিন্ট ফন্ট সাইজ ({printFontSize}px)</Label>
                  <Slider
                    id="printFontSize"
                    min={8}
                    max={16}
                    step={0.5}
                    value={[printFontSize]}
                    onValueChange={(value) => setPrintFontSize(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jsonInput">প্রশ্নপত্র (JSON)</Label>
                  <Textarea
                    id="jsonInput"
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder={mode === "MCQ" ? `[
  {
    "question": "আপনার প্রশ্ন এখানে লিখুন",
    "options": ["বিকল্প ১", "বিকল্প ২", "বিকল্প ৩", "বিকল্প ৪"],
    "answer": "সঠিক উত্তর",
    "explanation": "ঐচ্ছিক ব্যাখ্যা"
  }
]` : `[
  {
    "stimulus": "উদ্দীপক এখানে লিখুন...",
    "parts": {
      "a": "জ্ঞানমূলক প্রশ্ন",
      "b": "অনুধাবনমূলক প্রশ্ন",
      "c": "প্রয়োগমূলক প্রশ্ন",
      "d": "উচ্চতর দক্ষতামূলক প্রশ্ন"
    }
  }
]`}
                    className="h-40 font-code text-xs"
                  />
                </div>

                <Button className="w-full" onClick={handleGenerate}>
                  জেনারেট করুন
                </Button>

                {mode === "MCQ" && (
                  <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <Label htmlFor="preview-answers">প্রিভিউতে উত্তর দেখান</Label>
                    <Switch id="preview-answers" checked={previewAnswers} onCheckedChange={setPreviewAnswers} />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button className="w-full" onClick={() => handleExport(true)}>
                          <Printer className="mr-2" /> {mode === "MCQ" ? "উত্তরসহ এক্সপোর্ট" : "এক্সপোর্ট"}
                      </Button>
                      {mode === "MCQ" && (
                        <Button variant="secondary" className="w-full" onClick={() => handleExport(false)}>
                            <Printer className="mr-2" /> উত্তর ছাড়া এক্সপোর্ট
                        </Button>
                      )}
                  </div>
                   {mode === "MCQ" && (
                     <Dialog open={isAnswerSheetOpen} onOpenChange={setIsAnswerSheetOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full" disabled={displayMcqQuestions.length === 0}>
                                উত্তরপত্র দেখুন
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <AnswerSheet questions={displayMcqQuestions} setName={selectedSet} />
                        </DialogContent>
                    </Dialog>
                   )}
              </CardFooter>
            </Card>
          </div>
        </aside>

        <main className="flex-1 p-4 sm:p-6">
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
