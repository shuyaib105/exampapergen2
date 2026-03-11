export type Question = {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  image?: string;
  type?: string;
};

export type CQQuestion = {
  stimulus?: string;
  stimulusImage?: string;
  parts: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
};
