import { ContributionDashboard } from './components/ContributionDashboard';

export default function Home() {
  return (
    <div className="py-8 md:px-12 selection:bg-foreground selection:text-background">
      <ContributionDashboard />
    </div>
  );
}
