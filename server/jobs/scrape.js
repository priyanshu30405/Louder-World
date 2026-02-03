import axios from 'axios';
import * as cheerio from 'cheerio';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import 'dotenv/config';

// Sydney event sources - using public listing pages that allow scraping
// Note: some sites use JS rendering, for those we'd need puppeteer - using static ones for now
const SOURCES = [
  { name: 'Timeout Sydney', url: 'https://www.timeout.com/sydney/things-to-do' },
  { name: 'Eventbrite Sydney', url: 'https://www.eventbrite.com.au/d/australia--sydney/events/' }
];

async function scrapeTimeout(html, sourceUrl) {
  const $ = cheerio.load(html);
  const events = [];
  const now = new Date();

  // Timeout structure - card-based listings
  $('[data-testid="card"], .card, article').each((i, el) => {
    const $el = $(el);
    const title = $el.find('h2, h3, [data-testid="card-title"]').first().text().trim();
    const link = $el.find('a[href*="/sydney/"]').attr('href');
    const img = $el.find('img').attr('src');
    const desc = $el.find('p, [data-testid="card-description"]').first().text().trim();

    if (!title || title.length < 3) return;

    const fullUrl = link?.startsWith('http') ? link : `https://www.timeout.com${link || ''}`;
    if (!fullUrl.includes('sydney')) return;

    events.push({
      title,
      dateTime: new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000), // fallback
      venueName: '',
      venueAddress: '',
      city: 'Sydney, Australia',
      description: desc || 'Check the source for details.',
      category: ['Sydney', 'Events'],
      imageUrl: img || '',
      sourceWebsite: 'Timeout Sydney',
      originalUrl: fullUrl,
      lastScrapedAt: new Date()
    });
  });

  return events;
}

async function scrapeEventbrite(html) {
  const $ = cheerio.load(html);
  const events = [];
  const now = new Date();

  $('[data-testid="event-card"], .event-card, [data-event-id]').each((i, el) => {
    const $el = $(el);
    const title = $el.find('h2, h3, [data-testid="event-title"]').first().text().trim();
    const link = $el.find('a[href*="eventbrite"]').attr('href');
    const img = $el.find('img').attr('src');
    const dateText = $el.find('[data-testid="event-date"], .event-date').text().trim();
    const venue = $el.find('[data-testid="event-venue"], .event-venue').text().trim();
    const desc = $el.find('p').first().text().trim();

    if (!title || title.length < 3) return;

    let dateTime = now;
    if (dateText) {
      const parsed = new Date(dateText);
      if (!isNaN(parsed.getTime())) dateTime = parsed;
      else dateTime = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
    }

    events.push({
      title,
      dateTime,
      venueName: venue || '',
      venueAddress: '',
      city: 'Sydney, Australia',
      description: desc || 'Check Eventbrite for full details.',
      category: ['Sydney', 'Events'],
      imageUrl: img || '',
      sourceWebsite: 'Eventbrite',
      originalUrl: link || 'https://www.eventbrite.com.au/d/australia--sydney/events/',
      lastScrapedAt: new Date()
    });
  });

  return events;
}

// Fallback: seed with sample events when scraping returns little (common with SPAs)
async function getSampleEvents() {
  const base = new Date();
  return [
    {
      title: 'Sydney Opera House Tours',
      dateTime: new Date(base.getTime() + 2 * 24 * 60 * 60 * 1000),
      venueName: 'Sydney Opera House',
      venueAddress: 'Bennelong Point, Sydney NSW 2000',
      city: 'Sydney, Australia',
      description: 'Guided tours of one of the world\'s most iconic buildings.',
      category: ['Tour', 'Culture'],
      imageUrl: 'https://images.unsplash.com/photo-1523059623039-a9ed027e7fad?w=400',
      sourceWebsite: 'Sample Source',
      originalUrl: 'https://www.sydneyoperahouse.com/',
      lastScrapedAt: new Date()
    },
    {
      title: 'Bondi Beach Yoga',
      dateTime: new Date(base.getTime() + 3 * 24 * 60 * 60 * 1000),
      venueName: 'Bondi Beach',
      venueAddress: 'Bondi Beach, Sydney NSW',
      city: 'Sydney, Australia',
      description: 'Free community yoga session at Bondi Beach.',
      category: ['Fitness', 'Outdoor'],
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      sourceWebsite: 'Sample Source',
      originalUrl: 'https://www.timeout.com/sydney/things-to-do',
      lastScrapedAt: new Date()
    },
    {
      title: 'The Rocks Markets',
      dateTime: new Date(base.getTime() + 1 * 24 * 60 * 60 * 1000),
      venueName: 'The Rocks',
      venueAddress: 'George St, The Rocks NSW 2000',
      city: 'Sydney, Australia',
      description: 'Weekend markets with local crafts and food.',
      category: ['Markets', 'Shopping'],
      imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400',
      sourceWebsite: 'Sample Source',
      originalUrl: 'https://therocks.com/',
      lastScrapedAt: new Date()
    },
    {
      title: 'Vivid Sydney Light Festival',
      dateTime: new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000),
      venueName: 'Circular Quay',
      venueAddress: 'Circular Quay, Sydney NSW 2000',
      city: 'Sydney, Australia',
      description: 'Annual light art and music festival across Sydney.',
      category: ['Festival', 'Arts'],
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
      sourceWebsite: 'Sample Source',
      originalUrl: 'https://www.vividsydney.com/',
      lastScrapedAt: new Date()
    },
    {
      title: 'Cooking Class - Thai Cuisine',
      dateTime: new Date(base.getTime() + 5 * 24 * 60 * 60 * 1000),
      venueName: 'Sydney Cooking School',
      venueAddress: 'Surry Hills, Sydney',
      city: 'Sydney, Australia',
      description: 'Learn to cook authentic Thai dishes.',
      category: ['Food', 'Workshop'],
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      sourceWebsite: 'Sample Source',
      originalUrl: 'https://www.eventbrite.com.au/d/australia--sydney/food/',
      lastScrapedAt: new Date()
    }
  ];
}

export async function runScraper() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sydney-events');
  const allEvents = [];

  for (const src of SOURCES) {
    try {
      const res = await axios.get(src.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 10000
      });
      let events = [];
      if (src.name.includes('Timeout')) events = await scrapeTimeout(res.data, src.url);
      else if (src.name.includes('Eventbrite')) events = await scrapeEventbrite(res.data);
      allEvents.push(...events);
    } catch (err) {
      console.log(`Scrape ${src.name} failed:`, err.message);
    }
  }

  // if we got very few from scraping, add samples so the app has data to show
  if (allEvents.length < 3) {
    const samples = await getSampleEvents();
    allEvents.push(...samples);
  }

  for (const ev of allEvents) {
    const existing = await Event.findOne({ originalUrl: ev.originalUrl, title: ev.title });
    if (existing) {
      const changed = existing.title !== ev.title || 
        existing.dateTime?.getTime() !== ev.dateTime?.getTime() ||
        existing.venueName !== ev.venueName;
      existing.title = ev.title;
      existing.dateTime = ev.dateTime;
      existing.venueName = ev.venueName;
      existing.venueAddress = ev.venueAddress;
      existing.description = ev.description;
      existing.imageUrl = ev.imageUrl;
      existing.lastScrapedAt = ev.lastScrapedAt;
      if (changed && existing.status !== 'imported') existing.status = 'updated';
      await existing.save();
    } else {
      await Event.create({ ...ev, status: 'new' });
    }
  }

  // mark past events as inactive
  await Event.updateMany(
    { dateTime: { $lt: new Date() }, status: { $ne: 'imported' } },
    { $set: { status: 'inactive' } }
  );

  console.log(`Scrape complete. Processed ${allEvents.length} events.`);
}

// run when called directly
if (process.argv[1]?.endsWith('scrape.js')) {
  runScraper().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
