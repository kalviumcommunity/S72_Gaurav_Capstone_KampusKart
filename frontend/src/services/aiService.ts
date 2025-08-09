import { API_BASE } from '../config';

export interface AutocompleteSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'ai' | 'category' | 'data';
  category?: string;
  confidence?: number;
}

export interface SearchContext {
  section: 'lostfound' | 'complaints' | 'events' | 'news' | 'facilities' | 'clubs';
  userRole?: string;
  recentSearches?: string[];
  popularSearches?: string[];
}

class AIService {
  private cache = new Map<string, AutocompleteSuggestion[]>();
  private recentSearches: string[] = [];
  private searchHistory: Map<string, number> = new Map();

  async getSuggestions(
    input: string,
    context: SearchContext,
    preExistingStrings: string[] = []
  ): Promise<AutocompleteSuggestion[]> {
    const cacheKey = `${input.toLowerCase()}_${context.section}_${preExistingStrings.length}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const suggestions: AutocompleteSuggestion[] = [];

    // Data-derived suggestions
    const dataSuggestions = this.getPreExistingSuggestions(input, preExistingStrings);
    suggestions.push(...dataSuggestions);

    // Recent searches
    const recentSuggestions = this.getRecentSuggestions(input);
    suggestions.push(...recentSuggestions);

    // Trending searches
    const trendingSuggestions = this.getTrendingSuggestions(input, context);
    suggestions.push(...trendingSuggestions);

    // AI-generated suggestions
    const aiSuggestions = await this.getAISuggestions(input, context);
    suggestions.push(...aiSuggestions);

    // Category-based suggestions
    const categorySuggestions = this.getCategorySuggestions(input, context);
    suggestions.push(...categorySuggestions);

    const uniqueSuggestions = this.removeDuplicates(suggestions);
    const sortedSuggestions = this.sortByRelevance(uniqueSuggestions, input);

    this.cache.set(cacheKey, sortedSuggestions);
    return sortedSuggestions;
  }

  private getPreExistingSuggestions(input: string, preExistingStrings: string[]): AutocompleteSuggestion[] {
    if (!preExistingStrings || preExistingStrings.length === 0) return [];
    const lowerInput = input.toLowerCase();

    const filtered = preExistingStrings
      .filter(Boolean)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .filter((s, idx, arr) => arr.indexOf(s) === idx)
      .filter(s => s.toLowerCase().includes(lowerInput))
      .slice(0, 5);

    return filtered.map((text, index) => ({
      id: `data_${index}_${text}`,
      text,
      type: 'data',
      confidence: 0.92 - index * 0.05,
    }));
  }

  private getRecentSuggestions(input: string): AutocompleteSuggestion[] {
    const suggestions: AutocompleteSuggestion[] = [];
    const lowerInput = input.toLowerCase();
    const matchingRecent = this.recentSearches
      .filter(search => search.toLowerCase().includes(lowerInput))
      .slice(0, 3);

    matchingRecent.forEach((search, index) => {
      suggestions.push({
        id: `recent_${index}`,
        text: search,
        type: 'recent',
        confidence: 0.88 - (index * 0.08)
      });
    });

    return suggestions;
  }

  private getTrendingSuggestions(input: string, context: SearchContext): AutocompleteSuggestion[] {
    const suggestions: AutocompleteSuggestion[] = [];
    const lowerInput = input.toLowerCase();

    const trendingSearches = this.getTrendingSearchesForContext(context);
    const matchingTrending = trendingSearches
      .filter(search => search.toLowerCase().includes(lowerInput))
      .slice(0, 2);

    matchingTrending.forEach((search, index) => {
      suggestions.push({
        id: `trending_${index}`,
        text: search,
        type: 'trending',
        confidence: 0.84 - (index * 0.08)
      });
    });

    return suggestions;
  }

  private async getAISuggestions(input: string, context: SearchContext): Promise<AutocompleteSuggestion[]> {
    const suggestions: AutocompleteSuggestion[] = [];
    if (input.trim().length < 2) return suggestions;

    try {
      const aiSuggestions = this.generateAISuggestions(input, context);
      aiSuggestions.forEach((suggestion, index) => {
        suggestions.push({
          id: `ai_${index}`,
          text: suggestion,
          type: 'ai',
          confidence: 0.8 - (index * 0.08)
        });
      });
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    }

    return suggestions;
  }

  private getCategorySuggestions(input: string, context: SearchContext): AutocompleteSuggestion[] {
    const suggestions: AutocompleteSuggestion[] = [];
    const lowerInput = input.toLowerCase();

    const categoryKeywords = this.getCategoryKeywords(context.section);
    const matchingCategories = categoryKeywords
      .filter(keyword => keyword.toLowerCase().includes(lowerInput))
      .slice(0, 2);

    matchingCategories.forEach((category, index) => {
      suggestions.push({
        id: `category_${index}`,
        text: category,
        type: 'category',
        category: context.section,
        confidence: 0.76 - (index * 0.08)
      });
    });

    return suggestions;
  }

  private generateAISuggestions(input: string, context: SearchContext): string[] {
    const suggestions: string[] = [];
    const lowerInput = input.toLowerCase();

    switch (context.section) {
      case 'lostfound':
        if (lowerInput.includes('phone')) {
          suggestions.push('lost phone', 'iPhone', 'Android phone');
        } else if (lowerInput.includes('laptop')) {
          suggestions.push('laptop bag', 'MacBook', 'gaming laptop');
        } else if (lowerInput.includes('wallet') || lowerInput.includes('id')) {
          suggestions.push('wallet', 'student ID', 'ID card');
        } else {
          suggestions.push('backpack', 'bottle', 'keys');
        }
        break;
      case 'complaints':
        if (lowerInput.includes('wifi')) {
          suggestions.push('WiFi issue', 'slow internet', 'network down');
        } else if (lowerInput.includes('facility')) {
          suggestions.push('maintenance', 'AC not working', 'leakage');
        } else {
          suggestions.push('security', 'academic concern', 'administrative');
        }
        break;
      case 'events':
        if (lowerInput.includes('music')) {
          suggestions.push('music fest', 'concert', 'open mic');
        } else if (lowerInput.includes('sport')) {
          suggestions.push('tournament', 'match', 'sports day');
        } else {
          suggestions.push('workshop', 'seminar', 'club meetup');
        }
        break;
      case 'news':
        suggestions.push('campus updates', 'student achievements', 'research');
        break;
      case 'facilities':
        suggestions.push('library', 'gym', 'cafeteria');
        break;
      case 'clubs':
        suggestions.push('tech club', 'art club', 'sports club');
        break;
    }

    return suggestions.slice(0, 3);
  }

  private getTrendingSearchesForContext(context: SearchContext): string[] {
    const trendingMap = {
      lostfound: ['iPhone', 'laptop', 'wallet', 'keys', 'bottle', 'bag'],
      complaints: ['WiFi issues', 'facility maintenance', 'security', 'academic'],
      events: ['music', 'sports', 'workshop', 'festival'],
      news: ['research', 'student', 'campus', 'policy'],
      facilities: ['library', 'gym', 'cafeteria', 'parking'],
      clubs: ['tech', 'sports', 'art', 'academic']
    } as const;

    const arr = trendingMap[context.section] || [] as readonly string[];
    return Array.from(arr);
  }

  private getCategoryKeywords(section: string): string[] {
    const categoryMap = {
      lostfound: ['Electronics', 'Accessories', 'Documents', 'Clothing', 'Books'],
      complaints: ['Academic', 'Administrative', 'Facilities', 'IT', 'Security'],
      events: ['Academic', 'Cultural', 'Sports', 'Social', 'Professional'],
      news: ['Academic', 'Student Life', 'Campus', 'Research', 'Community'],
      facilities: ['Academic', 'Recreational', 'Administrative', 'Support', 'Parking'],
      clubs: ['Academic', 'Cultural', 'Sports', 'Professional', 'Social']
    } as const;

    return (categoryMap as any)[section] || [];
  }

  private removeDuplicates(suggestions: AutocompleteSuggestion[]): AutocompleteSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {
      const key = `${suggestion.type}:${suggestion.text.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private sortByRelevance(suggestions: AutocompleteSuggestion[], input: string): AutocompleteSuggestion[] {
    const lowerInput = input.toLowerCase();

    return suggestions.sort((a, b) => {
      const aExact = a.text.toLowerCase() === lowerInput;
      const bExact = b.text.toLowerCase() === lowerInput;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      const aStartsWith = a.text.toLowerCase().startsWith(lowerInput);
      const bStartsWith = b.text.toLowerCase().startsWith(lowerInput);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      if ((a.confidence || 0) !== (b.confidence || 0)) {
        return (b.confidence || 0) - (a.confidence || 0);
      }

      return a.text.localeCompare(b.text);
    });
  }

  recordSearch(search: string, context: SearchContext) {
    this.recentSearches = [search, ...this.recentSearches.filter(s => s !== search)].slice(0, 10);
    const key = `${search}_${context.section}`;
    this.searchHistory.set(key, (this.searchHistory.get(key) || 0) + 1);
  }

  clearCache() {
    this.cache.clear();
  }
}

export const aiService = new AIService();
