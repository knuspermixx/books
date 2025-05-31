interface GoogleBooksVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
    imageLinks?: {
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
    };
    publisher?: string;
    language?: string;
    averageRating?: number;
    ratingsCount?: number;
  };
}

interface GoogleBooksResponse {
  totalItems: number;
  items: GoogleBooksVolume[];
}

export interface Book {
  id: string;
  title: string;
  authors: string[];
  description?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  isbn?: string;
  publisher?: string;
  language?: string;
  imageLinks?: {
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
  };
  cover?: string;
  rating?: number;
  ratingsCount?: number;
  genre?: string;
}

const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Sucht Bücher über die Google Books API
 */
export async function searchBooks(
  query: string,
  maxResults: number = 10,
  startIndex: number = 0,
  orderBy: 'relevance' | 'newest' = 'relevance'
): Promise<Book[]> {
  try {
    const params = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
      startIndex: startIndex.toString(),
      orderBy,
      langRestrict: 'de', // Bevorzuge deutsche Bücher
    });

    const url = `${GOOGLE_BOOKS_API_BASE}?${params}`;
    console.log('Google Books API Request:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Books API Error: ${response.status}`);
    }
    
    const data: GoogleBooksResponse = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return [];
    }
    
    return data.items.map(transformGoogleBookToBook).filter(book => book !== null) as Book[];
  } catch (error) {
    console.error('Fehler beim Laden der Bücher:', error);
    return [];
  }
}

/**
 * Lädt ein spezifisches Buch anhand der ID
 */
export async function getBookById(id: string): Promise<Book | null> {
  try {
    const url = `${GOOGLE_BOOKS_API_BASE}/${id}`;
    console.log('Google Books API Single Book Request:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Books API Error: ${response.status}`);
    }
    
    const volume: GoogleBooksVolume = await response.json();
    return transformGoogleBookToBook(volume);
  } catch (error) {
    console.error('Fehler beim Laden des Buches:', error);
    return null;
  }
}

/**
 * Transformiert ein Google Books Volume zu unserem Book-Format
 */
function transformGoogleBookToBook(volume: GoogleBooksVolume): Book | null {
  const { volumeInfo } = volume;
  
  // Grundlegende Validierung
  if (!volumeInfo.title) {
    return null;
  }
  
  // ISBN extrahieren (bevorzuge ISBN-13, dann ISBN-10)
  let isbn: string | undefined;
  if (volumeInfo.industryIdentifiers) {
    const isbn13 = volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13');
    const isbn10 = volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10');
    isbn = isbn13?.identifier || isbn10?.identifier;
  }
  
  // Genre aus Kategorien extrahieren (erstes Element)
  const genre = volumeInfo.categories?.[0] || 'Unbekannt';
  
  // Cover Emoji basierend auf Genre/Kategorie generieren
  const cover = generateCoverEmoji(genre, volumeInfo.title);
  
  return {
    id: volume.id,
    title: volumeInfo.title,
    authors: volumeInfo.authors || ['Unbekannter Autor'],
    description: volumeInfo.description,
    publishedDate: volumeInfo.publishedDate,
    pageCount: volumeInfo.pageCount,
    categories: volumeInfo.categories,
    isbn,
    publisher: volumeInfo.publisher,
    language: volumeInfo.language,
    imageLinks: volumeInfo.imageLinks ? {
      thumbnail: volumeInfo.imageLinks.thumbnail?.replace('http:', 'https:'),
      small: volumeInfo.imageLinks.small?.replace('http:', 'https:'),
      medium: volumeInfo.imageLinks.medium?.replace('http:', 'https:'),
      large: volumeInfo.imageLinks.large?.replace('http:', 'https:')
    } : undefined,
    cover,
    rating: volumeInfo.averageRating ? Math.round(volumeInfo.averageRating) : undefined,
    ratingsCount: volumeInfo.ratingsCount,
    genre,
  };
}

/**
 * Generiert ein Cover-Emoji basierend auf Genre/Titel
 */
function generateCoverEmoji(genre: string, title: string): string {
  const genreLower = genre.toLowerCase();
  const titleLower = title.toLowerCase();
  
  // Fantasy
  if (genreLower.includes('fantasy') || titleLower.includes('magic') || titleLower.includes('dragon')) {
    const fantasyEmojis = ['🧙‍♂️', '🐉', '⚔️', '🏰', '🦄', '✨', '🔮'];
    return fantasyEmojis[Math.floor(Math.random() * fantasyEmojis.length)];
  }
  
  // Science Fiction
  if (genreLower.includes('science') || genreLower.includes('fiction') || titleLower.includes('space')) {
    const scifiEmojis = ['🚀', '👽', '🛸', '🌌', '🤖', '⭐'];
    return scifiEmojis[Math.floor(Math.random() * scifiEmojis.length)];
  }
  
  // Romance
  if (genreLower.includes('romance') || titleLower.includes('love')) {
    const romanceEmojis = ['💕', '💖', '❤️', '🌹', '💐'];
    return romanceEmojis[Math.floor(Math.random() * romanceEmojis.length)];
  }
  
  // Mystery/Crime
  if (genreLower.includes('mystery') || genreLower.includes('crime') || genreLower.includes('thriller')) {
    const mysteryEmojis = ['🕵️', '🔍', '🗝️', '🚪', '🌃'];
    return mysteryEmojis[Math.floor(Math.random() * mysteryEmojis.length)];
  }
  
  // Horror
  if (genreLower.includes('horror')) {
    const horrorEmojis = ['👻', '🎃', '🦇', '🌙', '⚰️'];
    return horrorEmojis[Math.floor(Math.random() * horrorEmojis.length)];
  }
  
  // Biography
  if (genreLower.includes('biography') || genreLower.includes('memoir')) {
    return '👤';
  }
  
  // History
  if (genreLower.includes('history')) {
    return '🏛️';
  }
  
  // Philosophy
  if (genreLower.includes('philosophy')) {
    return '🤔';
  }
  
  // Standard-Buch-Emoji
  return '📚';
}

/**
 * Sucht Fantasy-Bücher
 */
export async function getFantasyBooks(maxResults: number = 10): Promise<Book[]> {
  const queries = [
    'subject:fantasy dragons magic',
    'subject:fantasy tolkien',
    'subject:fantasy witches wizards',
    'subject:fantasy adventure'
  ];
  
  const allBooks: Book[] = [];
  
  for (const query of queries) {
    const books = await searchBooks(query, Math.ceil(maxResults / queries.length));
    allBooks.push(...books);
    
    if (allBooks.length >= maxResults) {
      break;
    }
  }
  
  // Duplikate entfernen und auf maxResults begrenzen
  const uniqueBooks = allBooks.filter((book, index, self) => 
    index === self.findIndex(b => b.id === book.id)
  );
  
  return uniqueBooks.slice(0, maxResults);
}

/**
 * Sucht empfohlene/beliebte Bücher
 */
export async function getRecommendedBooks(maxResults: number = 10): Promise<Book[]> {
  const queries = [
    'bestseller',
    'award winning books',
    'classic literature',
    'popular fiction'
  ];
  
  const allBooks: Book[] = [];
  
  for (const query of queries) {
    const books = await searchBooks(query, Math.ceil(maxResults / queries.length), 0, 'relevance');
    allBooks.push(...books);
    
    if (allBooks.length >= maxResults) {
      break;
    }
  }
  
  // Duplikate entfernen und auf maxResults begrenzen
  const uniqueBooks = allBooks.filter((book, index, self) => 
    index === self.findIndex(b => b.id === book.id)
  );
  
  return uniqueBooks.slice(0, maxResults);
}

/**
 * Lädt Trending-Bücher (simuliert durch beliebte/neue Bücher)
 */
export async function getTrendingBooks(maxResults: number = 10): Promise<Book[]> {
  return getRecommendedBooks(maxResults);
}

/**
 * Sucht deutsche Klassiker
 */
export async function getClassicBooks(maxResults: number = 10): Promise<Book[]> {
  const queries = [
    'subject:classics german literature',
    'author:Goethe OR author:Schiller OR author:Kafka',
    'subject:german classics',
    'classics literature deutsch'
  ];
  
  const allBooks: Book[] = [];
  
  for (const query of queries) {
    const books = await searchBooks(query, Math.ceil(maxResults / queries.length));
    allBooks.push(...books);
    
    if (allBooks.length >= maxResults) {
      break;
    }
  }
  
  // Duplikate entfernen und auf maxResults begrenzen
  const uniqueBooks = allBooks.filter((book, index, self) => 
    index === self.findIndex(b => b.id === book.id)
  );
  
  return uniqueBooks.slice(0, maxResults);
}

/**
 * Sucht Philosophie-Bücher
 */
export async function getPhilosophyBooks(maxResults: number = 10): Promise<Book[]> {
  const queries = [
    'subject:philosophy',
    'philosophy wisdom self-help',
    'subject:philosophy ethics',
    'philosophical books'
  ];
  
  const allBooks: Book[] = [];
  
  for (const query of queries) {
    const books = await searchBooks(query, Math.ceil(maxResults / queries.length));
    allBooks.push(...books);
    
    if (allBooks.length >= maxResults) {
      break;
    }
  }
  
  // Duplikate entfernen und auf maxResults begrenzen
  const uniqueBooks = allBooks.filter((book, index, self) => 
    index === self.findIndex(b => b.id === book.id)
  );
  
  return uniqueBooks.slice(0, maxResults);
}

/**
 * Sucht Krimi & Thriller Bücher
 */
export async function getMysteryBooks(maxResults: number = 10): Promise<Book[]> {
  const queries = [
    'subject:mystery crime thriller',
    'detective mystery novels',
    'subject:thriller suspense',
    'crime fiction mystery'
  ];
  
  const allBooks: Book[] = [];
  
  for (const query of queries) {
    const books = await searchBooks(query, Math.ceil(maxResults / queries.length));
    allBooks.push(...books);
    
    if (allBooks.length >= maxResults) {
      break;
    }
  }
  
  // Duplikate entfernen und auf maxResults begrenzen
  const uniqueBooks = allBooks.filter((book, index, self) => 
    index === self.findIndex(b => b.id === book.id)
  );
  
  return uniqueBooks.slice(0, maxResults);
}

/**
 * Sucht Science Fiction Bücher
 */
export async function getSciFiBooks(maxResults: number = 10): Promise<Book[]> {
  const queries = [
    'subject:science fiction',
    'sci-fi space technology',
    'subject:fiction science',
    'future technology fiction'
  ];
  
  const allBooks: Book[] = [];
  
  for (const query of queries) {
    const books = await searchBooks(query, Math.ceil(maxResults / queries.length));
    allBooks.push(...books);
    
    if (allBooks.length >= maxResults) {
      break;
    }
  }
  
  // Duplikate entfernen und auf maxResults begrenzen
  const uniqueBooks = allBooks.filter((book, index, self) => 
    index === self.findIndex(b => b.id === book.id)
  );
  
  return uniqueBooks.slice(0, maxResults);
}

/**
 * Sucht Romance Bücher
 */
export async function getRomanceBooks(maxResults: number = 10): Promise<Book[]> {
  const queries = [
    'subject:romance love',
    'romantic novels fiction',
    'subject:romance contemporary',
    'love story romance'
  ];
  
  const allBooks: Book[] = [];
  
  for (const query of queries) {
    const books = await searchBooks(query, Math.ceil(maxResults / queries.length));
    allBooks.push(...books);
    
    if (allBooks.length >= maxResults) {
      break;
    }
  }
  
  // Duplikate entfernen und auf maxResults begrenzen
  const uniqueBooks = allBooks.filter((book, index, self) => 
    index === self.findIndex(b => b.id === book.id)
  );
  
  return uniqueBooks.slice(0, maxResults);
}
