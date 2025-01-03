import { getVotes } from "./actions/getVotes";
import AnalyticsContainer from "./components/AnalyticsContainer";
import { getDelegates } from "./actions/getDelegates";
const AnalyticsPage = async () => {
  const [votes, delegates] = await Promise.all([getVotes(), getDelegates()]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mt-6">
        Agora analytics dashboard
      </h1>
      <AnalyticsContainer votes={votes} delegates={delegates} />
    </div>
  );
};

export default AnalyticsPage;
