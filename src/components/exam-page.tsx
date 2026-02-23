"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import type { Question } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Upload, Printer, CheckCircle, Circle } from "lucide-react";

const PaperPreview = ({ examName, examTime, totalMarks, questions }: {
  examName: string;
  examTime: string;
  totalMarks: string;
  questions: Question[];
}) => (
  <div id="printable-area" className="w-full max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-lg shadow-lg print:shadow-none print:rounded-none">
    <header className="text-center pb-8 border-b-2 border-gray-200 print:border-black exam-header-print">
      <h1 className="text-3xl font-bold font-headline">{examName || "পরীক্ষার নাম"}</h1>
      <div className="flex justify-between items-center mt-4 text-lg">
        <span>পূর্ণমান: {totalMarks || "..."}</span>
        <span>সময়: {examTime || "..."}</span>
      </div>
    </header>

    <section className="mt-8">
      {questions.length > 0 ? (
        <div className="md:columns-2 md:gap-x-12 print:columns-2 print:gap-x-12">
          {questions.map((q, index) => (
            <article key={index} className="mb-8 question-item-print break-inside-avoid">
              <p className="font-bold text-lg mb-4">{index + 1}. {q.question}</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 pl-4">
                {q.options.map((option, optIndex) => {
                  const optionLabel = String.fromCharCode(97 + optIndex); // a, b, c, d
                  const isCorrect = option === q.answer;

                  return (
                    <li key={optIndex} className="flex items-start space-x-3">
                      <div className="answer-content text-green-600 print:text-green-600 mt-1">
                        {isCorrect ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5 text-gray-300 print:text-gray-300" />}
                      </div>
                       <div className="flex items-start">
                         <span className="font-medium mr-2">{optionLabel})</span>
                         <p>{option}</p>
                       </div>
                    </li>
                  );
                })}
              </ul>
              <div className="answer-content mt-4 pl-4">
                {q.explanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm print:bg-gray-100 print:border-gray-300">
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


export default function ExamPage() {
  const [examName, setExamName] = useState("মডেল টেস্ট");
  const [examTime, setExamTime] = useState("২ ঘন্টা");
  const [totalMarks, setTotalMarks] = useState("১০০");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [fileName, setFileName] = useState("");
  const [previewAnswers, setPreviewAnswers] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
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
            description: "অবৈধ JSON ফাইল। অনুগ্রহ করে সঠিক ফরম্যাটের ফাইল আপলোড করুন।",
          });
          setFileName("");
          setQuestions([]);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExport = (withAnswers: boolean) => {
    if(questions.length === 0){
        toast({
            variant: "destructive",
            title: "ত্রুটি",
            description: "প্রথমে একটি প্রশ্নপত্র আপলোড করুন।",
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

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".json"
                  className="hidden"
                />
                <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2" />
                  প্রশ্ন আপলোড করুন (.json)
                </Button>
                {fileName && <p className="text-xs text-muted-foreground mt-2 text-center">Loaded: {fileName}</p>}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <Label htmlFor="preview-answers">প্রিভিউতে উত্তর দেখান</Label>
                <Switch id="preview-answers" checked={previewAnswers} onCheckedChange={setPreviewAnswers} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button className="w-full" onClick={() => handleExport(true)}>
                <Printer className="mr-2" /> উত্তরসহ এক্সপোর্ট
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => handleExport(false)}>
                <Printer className="mr-2" /> উত্তর ছাড়া এক্সপোর্ট
              </Button>
            </CardFooter>
          </Card>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6">
        <PaperPreview
          examName={examName}
          examTime={examTime}
          totalMarks={totalMarks}
          questions={questions}
        />
      </main>
    </div>
  );
}
