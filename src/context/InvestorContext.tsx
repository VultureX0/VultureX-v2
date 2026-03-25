import { useInvestor } from "../context/InvestorContext";

const InvestorContext = createContext(null);

export const useInvestor = () => useContext(InvestorContext);

export default InvestorContext;