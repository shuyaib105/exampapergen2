
export type Question = {
  id?: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  image?: string;
  type?: string;
};

export type CQQuestion = {
  id?: string;
  stimulus?: string;
  stimulusImage?: string;
  parts: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
};

export type StoredQuestion = {
  id: string;
  chapterName: string;
  type: 'MCQ' | 'CQ';
  content: Question | CQQuestion;
  createdAt: any;
};
