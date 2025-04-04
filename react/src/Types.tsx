// Types.ts
export interface Friend {
    id: number;
    name: string;
    lastActive: Date; // Store last active time as a Date object
  }

export interface friend_progress {
  FriendEmail: string;
  LastActiveTime: string;
  TestId: number; // Store last active time as a Date object
  Progress: number;
}

// Types.ts
export interface Statistics {
    mostPopularWord: string;
    numberOfUsers: number;
    mostPopularSchool: string;
  }

export interface email_query {
    Email: string;
    WordId?: string;
    TestId?: string;
    Password?: string;
    FirebaseUID?: string;
    Username?: string; 
    FirstName?: string;
    LastName?: string;
    JoinedTime?: string;
    TargetSchoolId?: string;
}

export interface word {
  Word: string;
  PartOfSpeech: string;
  Description: string;
  Example: string;
  Source: string;
  Stem?: string;
  WordId?:number;
  TestId?:number;
}

export interface recent {
  Word: string;
  LastLearnedTime: string;
}

export interface least {
  Word: string;
  TestId: string;
  PercentLearned: number;
}

export interface progress {
  TestId: string;
  Progress: number;
}

export interface school {
  SchoolName: string;
  SchoolRank: number;
  Country: string;
  Size: string;
  Score: number;
  SchoolId?: number;
}

export interface pop_word {
  Word: string;
  Stem: string;
  UserCount: number;
}

export interface pop_school {
  SchoolName: string;
  SchoolRank: number;
  Country: string;
  UserCount: number;
}

export interface num_user {
  UserCount: number;
}

export interface AuthContextType {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: any) => void;
}

export interface word_progress {
  WordId: number;
  TestId: number;
  Word: string;
  PercentLearned: number;
  LastLearnedTime: string;
  Learned?: boolean;
}