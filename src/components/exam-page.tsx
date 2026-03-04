"use client";

import { useState, useEffect } from "react";
import type { Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Printer, CheckCircle, Circle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const PaperPreview = ({ examName, examTime, totalMarks, questions, setName }: {
  examName: string;
  examTime: string;
  totalMarks: string;
  questions: Question[];
  setName: string;
}) => (
  <div id="printable-area" className="w-full max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-lg shadow-lg print:shadow-none print:rounded-none print:p-1">
    <header className="text-center pb-4 print:pb-2 border-b print:border-b-2 border-gray-200 print:border-black exam-header-print">
      <h1 className="text-2xl print:text-xl font-bold font-headline">{examName || "পরীক্ষার নাম"}</h1>
      <p className="text-lg font-semibold print:text-base">Md Jubayer | রংপুর মেডিকেল কলেজ</p>
      <div className="flex justify-between items-center mt-2 print:mt-1 text-base print:text-sm">
        <span>পূর্ণমান: {totalMarks || "..."}</span>
        <span className="font-bold">সেট: {setName}</span>
        <span>সময়: {examTime || "..."}</span>
      </div>
    </header>

    <section className="mt-4 print:mt-2">
      {questions.length > 0 ? (
        <div className="md:columns-2 print:columns-2 md:gap-x-12 print:gap-x-6">
          {questions.map((q, index) => (
            <article key={index} className="mb-2 print:mb-1 question-item-print break-inside-avoid">
              <p className="font-bold text-base print:text-sm mb-1">{index + 1}. {q.question}</p>
              <ul className="grid grid-cols-2 gap-x-6 print:gap-x-4 gap-y-0 pl-3 print:pl-2">
                {q.options.map((option, optIndex) => {
                  const optionLabel = String.fromCharCode(97 + optIndex); // a, b, c, d
                  const isCorrect = option === q.answer;

                  return (
                    <li key={optIndex} className="flex items-start space-x-2 print:space-x-1 print:text-xs">
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
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-1 text-xs print:bg-gray-100 print:border-gray-300">
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
  const [examName, setExamName] = useState("মডেল টেস্ট");
  const [examTime, setExamTime] = useState("২ ঘন্টা");
  const [totalMarks, setTotalMarks] = useState("১০০");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [displayQuestions, setDisplayQuestions] = useState<Question[]>([]);
  const [jsonInput, setJsonInput] = useState("");
  const [previewAnswers, setPreviewAnswers] = useState(false);
  const [selectedSet, setSelectedSet] = useState("A");
  const [isAnswerSheetOpen, setIsAnswerSheetOpen] = useState(false);

  const { toast } = useToast();
  
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
    if (questions.length > 0) {
      if (selectedSet === "A") {
        setDisplayQuestions(questions);
      } else {
        setDisplayQuestions(shuffleArray(questions, selectedSet));
      }
    } else {
      setDisplayQuestions([]);
    }
  }, [questions, selectedSet]);

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
        setQuestions(data);
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
      setQuestions([]);
    }
  };


  const handleExport = (withAnswers: boolean) => {
    if(displayQuestions.length === 0){
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

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground font-body">
      <aside className="w-full lg:w-[380px] lg:min-w-[380px] p-4 sm:p-6 border-b lg:border-r lg:border-b-0 print:hidden no-print">
        <div className="lg:sticky lg:top-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-headline">ExamPaperGen</CardTitle>
              <CardDescription>আপনার পরীক্ষার প্রশ্নপত্র তৈরি করুন।</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="examName">পরীক্ষার নাম</Label>
                <Input id="examName" value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="e.g., মডেল টেস্ট" />
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

              <div className="space-y-2">
                <Label htmlFor="jsonInput">প্রশ্নপত্র (JSON)</Label>
                <Textarea
                  id="jsonInput"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`[
  {
    "question": "আপনার প্রশ্ন এখানে লিখুন",
    "options": ["বিকল্প ১", "বিকল্প ২", "বিকল্প ৩", "বিকল্প ৪"],
    "answer": "সঠিক উত্তর",
    "explanation": "ঐচ্ছিক ব্যাখ্যা"
  }
]`}
                  className="h-40 font-code text-xs"
                />
              </div>

              <Button className="w-full" onClick={handleGenerate}>
                জেনারেট করুন
              </Button>

              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <Label htmlFor="preview-answers">প্রিভিউতে উত্তর দেখান</Label>
                <Switch id="preview-answers" checked={previewAnswers} onCheckedChange={setPreviewAnswers} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button className="w-full" onClick={() => handleExport(true)}>
                        <Printer className="mr-2" /> উত্তরসহ এক্সপোর্ট
                    </Button>
                    <Button variant="secondary" className="w-full" onClick={() => handleExport(false)}>
                        <Printer className="mr-2" /> উত্তর ছাড়া এক্সপোর্ট
                    </Button>
                </div>
                 <Dialog open={isAnswerSheetOpen} onOpenChange={setIsAnswerSheetOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full" disabled={displayQuestions.length === 0}>
                            উত্তরপত্র দেখুন
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <AnswerSheet questions={displayQuestions} setName={selectedSet} />
                    </DialogContent>
                </Dialog>
            </CardFooter>
          </Card>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6">
        <PaperPreview
          examName={examName}
          examTime={examTime}
          totalMarks={totalMarks}
          questions={displayQuestions}
          setName={selectedSet}
        />
      </main>
    </div>
  );
}
