'use server';

export type RepoContribution = {
  id: string;
  repoName: string;
  repoUrl: string;
  owner: string;
  isExternal: boolean;
  prCount: number;
  latestPrTitle: string;
  latestPrUrl: string;
  latestPrDate: string;
};

export type UserProfile = {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
};

export type ActionResponse = {
  success: boolean;
  data?: RepoContribution[];
  user?: UserProfile;
  error?: string;
  totalPrs?: number;
};

export async function getOpenSourceContributions(username: string): Promise<ActionResponse> {
  if (!username) {
    return { success: false, error: 'Username is required' };
  }

  const cleanUsername = username.trim().toLowerCase();

  try {
    const fetchPage = async (page: number) => {
      const res = await fetch(
        `https://api.github.com/search/issues?q=type:pr+author:${encodeURIComponent(cleanUsername)}+is:public+is:merged&per_page=100&page=${page}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Github-Contributions-Viewer'
          },
          next: { revalidate: 3600 }
        }
      );

      if (!res.ok) {
        if (res.status === 403 || res.status === 429) {
          throw new Error('RATE_LIMIT');
        }
        throw new Error(`GitHub API error: ${res.status}`);
      }

      return res.json();
    };

    // Fetch first page to get total_count and first batch
    const firstPageData = await fetchPage(1);
    let items = firstPageData.items || [];
    const totalCount = firstPageData.total_count || 0;

    // Get user profile from the first PR item
    let userProfile: UserProfile | undefined;
    if (items.length > 0) {
      const user = items[0].user;
      userProfile = {
        login: user.login,
        avatarUrl: user.avatar_url,
        htmlUrl: user.html_url
      };
    }

    // Scale optimization: Fetch up to 5 pages (500 PRs) to balance depth vs speed/limits
    const MAX_PAGES = 5;
    const totalPages = Math.min(Math.ceil(totalCount / 100), MAX_PAGES);

    if (totalPages > 1) {
      const pagePromises = [];
      for (let i = 2; i <= totalPages; i++) {
        pagePromises.push(
          fetchPage(i).catch(e => {
            console.error(`Failed to fetch page ${i}`, e);
            return { items: [] };
          })
        );
      }
      
      const remainingPagesData = await Promise.all(pagePromises);
      for (const data of remainingPagesData) {
        items = items.concat(data.items || []);
      }
    }

    const repoMap = new Map<string, RepoContribution>();

    for (const item of items) {
      const repoApiUrl = item.repository_url as string;
      const id = repoApiUrl.replace('https://api.github.com/repos/', ''); 
      const owner = id.split('/')[0];
      const isExternal = owner.toLowerCase() !== cleanUsername;
      const repoUrl = `https://github.com/${id}`;
      
      if (repoMap.has(id)) {
        const existing = repoMap.get(id)!;
        existing.prCount += 1;
        if (new Date(item.created_at) > new Date(existing.latestPrDate)) {
          existing.latestPrTitle = item.title;
          existing.latestPrUrl = item.html_url;
          existing.latestPrDate = item.created_at;
        }
      } else {
        repoMap.set(id, {
          id,
          repoName: id,
          repoUrl,
          owner,
          isExternal,
          prCount: 1,
          latestPrTitle: item.title,
          latestPrUrl: item.html_url,
          latestPrDate: item.created_at,
        });
      }
    }

    const sortedContributions = Array.from(repoMap.values()).sort((a, b) => b.prCount - a.prCount);

    return { 
      success: true, 
      data: sortedContributions, 
      user: userProfile,
      totalPrs: totalCount 
    };

  } catch (error: any) {
    console.error('Error fetching contributions:', error);
    if (error.message === 'RATE_LIMIT') {
      return { success: false, error: 'GitHub API rate limit exceeded. Please try again in a few minutes.' };
    }
    return { success: false, error: 'Failed to fetch data from GitHub. The user might have no public contributions or the API is unavailable.' };
  }
}
