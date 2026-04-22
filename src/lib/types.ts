
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
  stimulusImageWidth?: number;
  stimulusImageAlign?: 'left' | 'center' | 'right';
  parts: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  answers?: {
    a?: string;
    b?: string;
    c?: string;
    d?: string;
  };
};

export type ShortQuestion = {
  id?: string;
  question: string;
  answer?: string;
  explanation?: string;
  image?: string;
  stimulus?: string;
  stimulusImage?: string;
};
