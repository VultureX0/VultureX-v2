export type InvestorType = 'vc' | 'angel' | 'family_office' | 'corporate_vc';

export type InvestorProfile = {
  // Section 1
  fullName: string;
  email: string;
  phone: string;
  linkedIn: string;
  location: string;
  // Section 2
  investorType: InvestorType;
  firmName: string;
  firmWebsite: string;
  fundSize: string;
  stageFocus: string[];
  investingAsIndividual: boolean;
  syndicateMember: string;
  // Section 3
  checkSizeMin: number;
  checkSizeMax: number;
  preferredSectors: string[];
  geographyFocus: string;
  portfolioCompanies: string;
  // Section 4
  investmentThesis: string;
  lookingTo: 'lead' | 'co_invest' | 'passive';
  openToColdPitches: boolean;
  submittedAt?: string;
};

export const defaultInvestorProfile: InvestorProfile = {
  fullName: '',
  email: '',
  phone: '',
  linkedIn: '',
  location: '',
  investorType: 'angel',
  firmName: '',
  firmWebsite: '',
  fundSize: '',
  stageFocus: [],
  investingAsIndividual: true,
  syndicateMember: '',
  checkSizeMin: 0,
  checkSizeMax: 500,
  preferredSectors: [],
  geographyFocus: '',
  portfolioCompanies: '',
  investmentThesis: '',
  lookingTo: 'co_invest',
  openToColdPitches: false,
};
