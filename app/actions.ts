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
  name?: string;
  bio?: string;
  location?: string;
  company?: string;
  followers?: number;
  following?: number;
  publicRepos?: number;
  email?: string;
  twitterUsername?: string;
  blog?: string;
  createdAt?: string;
  organizations?: {
    login: string;
    avatarUrl: string;
  }[];
  achievements?: {
    name: string;
    iconUrl: string;
    count?: number;
  }[];
};

export type ActionResponse = {
  success: boolean;
  data?: RepoContribution[];
  user?: UserProfile;
  error?: string;
  totalPrs?: number;
  externalPrs?: number;
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

    // Fetch full user profile
    const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Github-Contributions-Viewer'
      },
      next: { revalidate: 3600 }
    });

    let userProfile: UserProfile | undefined;
    if (userRes.ok) {
      const userData = await userRes.json();
      userProfile = {
        login: userData.login,
        avatarUrl: userData.avatar_url,
        htmlUrl: userData.html_url,
        name: userData.name,
        bio: userData.bio,
        location: userData.location,
        company: userData.company,
        followers: userData.followers,
        following: userData.following,
        publicRepos: userData.public_repos,
        email: userData.email,
        twitterUsername: userData.twitter_username,
        blog: userData.blog,
        createdAt: userData.created_at
      };

      // Fetch organizations
      const orgsRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}/orgs`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Github-Contributions-Viewer'
        },
        next: { revalidate: 3600 }
      });
      if (orgsRes.ok) {
        const orgsData = await orgsRes.json();
        userProfile.organizations = orgsData.map((org: any) => ({
          login: org.login,
          avatarUrl: org.avatar_url
        }));
      }

      // Scraping Achievements (as there is no official REST API for this)
      try {
        const profileRes = await fetch(`https://github.com/${encodeURIComponent(cleanUsername)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          next: { revalidate: 3600 }
        });
        
        if (profileRes.ok) {
          const html = await profileRes.text();
          const achievements: { name: string; iconUrl: string; count?: number }[] = [];
          
          // Regex to find achievement links and images
          // Looking for patterns like: <a ... achievement=NAME ...><img src="URL" alt="Achievement: NAME" ...>
          const achievementRegex = /<a[^>]+achievement=([^&"]+)[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]+alt="Achievement: ([^"]+)"[^>]*>/g;
          let match;
          
          while ((match = achievementRegex.exec(html)) !== null) {
            const name = match[3].replace('Achievement: ', '');
            const iconUrl = match[2];
            
            // Check for multiplier (e.g. x3)
            const countRegex = /<span[^>]+class="AchievementBadge-multiplier"[^>]*>\s*x(\d+)\s*<\/span>/;
            const multiplierMatch = match[0].match(countRegex);
            const count = multiplierMatch ? parseInt(multiplierMatch[1]) : undefined;
            
            // Avoid duplicates
            if (!achievements.find(a => a.name === name)) {
              achievements.push({ name, iconUrl, count });
            }
          }
          
          userProfile.achievements = achievements;
        }
      } catch (e) {
        console.error('Failed to scrape achievements:', e);
      }
    } else if (items.length > 0) {
      // Fallback to minimal profile if full profile fetch fails
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

    // Fetch total count for external PRs specifically to show in stats
    const externalRes = await fetch(
      `https://api.github.com/search/issues?q=type:pr+author:${encodeURIComponent(cleanUsername)}+is:public+is:merged+-user:${encodeURIComponent(cleanUsername)}&per_page=1`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Github-Contributions-Viewer'
        },
        next: { revalidate: 3600 }
      }
    );
    const externalTotalCount = externalRes.ok ? (await externalRes.json()).total_count : 0;

    return { 
      success: true, 
      data: sortedContributions, 
      user: userProfile,
      totalPrs: totalCount,
      externalPrs: externalTotalCount
    };

  } catch (error: any) {
    console.error('Error fetching contributions:', error);
    if (error.message === 'RATE_LIMIT') {
      return { success: false, error: 'GitHub API rate limit exceeded. Please try again in a few minutes.' };
    }
    return { success: false, error: 'Failed to fetch data from GitHub. The user might have no public contributions or the API is unavailable.' };
  }
}

export async function searchUsers(query: string): Promise<{ success: boolean; users?: UserProfile[]; error?: string }> {
  if (!query || query.length < 2) return { success: true, users: [] };

  try {
    const res = await fetch(
      `https://api.github.com/search/users?q=${encodeURIComponent(query)}+in:login&per_page=5`,
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
        return { success: false, error: 'RATE_LIMIT' };
      }
      return { success: false, error: 'Search failed' };
    }

    const data = await res.json();
    const users = (data.items || []).map((user: any) => ({
      login: user.login,
      avatarUrl: user.avatar_url,
      htmlUrl: user.html_url
    }));

    return { success: true, users };
  } catch (error) {
    return { success: false, error: 'Failed to search' };
  }
}
