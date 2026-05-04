import { Metadata } from 'next';
import { ContributionDashboard } from './components/ContributionDashboard';
import { getUserProfile, getOpenSourceContributions, ActionResponse } from './actions';
import { Suspense } from 'react';

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  
  if (q) {
    const user = await getUserProfile(q);
    if (user) {
      return {
        title: `${user.name || user.login}'s Open Source Contributions`,
        description: `View ${user.login}'s open source contributions across GitHub. ${user.bio || ''}`,
        openGraph: {
          title: `${user.name || user.login} // OSS Contributions`,
          description: `Tracking ${user.login}'s contributions to the open source ecosystem.`,
          images: [{ url: user.avatarUrl, width: 400, height: 400, alt: user.login }],
        },
        twitter: {
          card: 'summary_large_image',
          images: [user.avatarUrl],
        },
      };
    }
  }

  return {
    title: "GitHub Contributions Viewer",
    description: "Track and share your open source contributions across GitHub.",
  };
}

export default async function Home({ searchParams }: Props) {
  const { q } = await searchParams;
  let initialData: ActionResponse | undefined;

  if (q) {
    // Server-side pre-fetching for instant load
    initialData = await getOpenSourceContributions(q);
  }

  return (
    <div className="py-8 md:px-12 selection:bg-foreground selection:text-background">
      <Suspense fallback={<div className="animate-pulse bg-foreground/5 h-96 w-full" />}>
        <ContributionDashboard initialUsername={q} initialData={initialData} />
      </Suspense>
    </div>
  );
}
