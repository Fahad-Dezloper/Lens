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

export type ActionResponse = {
  success: boolean;
  data?: RepoContribution[];
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
          next: { revalidate: 3600 } // Cache for an hour
        }
      );

      if (!res.ok) {
        throw new Error(`GitHub API error: ${res.status}`);
      }

      return res.json();
    };

    // Fetch first page to get total_count and first batch
    const firstPageData = await fetchPage(1);
    let items = firstPageData.items || [];
    const totalCount = firstPageData.total_count || 0;

    // Fetch up to 3 pages total (300 PRs max) to balance comprehensiveness and API rate limits
    const MAX_PAGES = 3;
    const totalPages = Math.min(Math.ceil(totalCount / 100), MAX_PAGES);

    if (totalPages > 1) {
      const pagePromises = [];
      for (let i = 2; i <= totalPages; i++) {
        pagePromises.push(
          fetchPage(i).catch(e => {
            console.error(`Failed to fetch page ${i}`, e);
            return { items: [] }; // Graceful degradation if a single page fails
          })
        );
      }
      
      const remainingPagesData = await Promise.all(pagePromises);
      for (const data of remainingPagesData) {
        items = items.concat(data.items || []);
      }
    }

    // Map contributions by repository
    const repoMap = new Map<string, RepoContribution>();

    for (const item of items) {
      const repoApiUrl = item.repository_url as string;
      const id = repoApiUrl.replace('https://api.github.com/repos/', ''); // e.g. "facebook/react"
      const owner = id.split('/')[0];
      const isExternal = owner.toLowerCase() !== cleanUsername;
      const repoUrl = `https://github.com/${id}`;
      
      if (repoMap.has(id)) {
        const existing = repoMap.get(id)!;
        existing.prCount += 1;
        // Keep the latest PR info
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

    // Convert map to array and sort by PR count (descending)
    const sortedContributions = Array.from(repoMap.values()).sort((a, b) => b.prCount - a.prCount);

    return { 
      success: true, 
      data: sortedContributions, 
      totalPrs: totalCount 
    };

  } catch (error) {
    console.error('Error fetching contributions:', error);
    return { success: false, error: 'Failed to fetch data from GitHub. Rate limit may have been exceeded.' };
  }
}
