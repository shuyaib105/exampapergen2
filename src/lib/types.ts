
export type Question = {
  id?: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  image?: string;
  type?: string;
  stimulus?: string;
  stimulusImage?: string;
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
