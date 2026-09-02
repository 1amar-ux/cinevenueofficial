import { 
  ProductionProject, 
  CastingCall, 
  BehindTheScenesItem, 
  NewsArticle, 
  TalentProfileData,
  StorySubmission,
  BrandCampaignRequest,
  EventManagementRequest,
  FilmProjectApplication,
  PublicEvent,
  ArtistRequest,
  SponsorshipRequest,
  EventPortfolioItem,
  VenueRecord,
  ArtistRecord,
  PromotionCampaign
} from "../types/productions";

export const INITIAL_PRODUCTION_PROJECTS: ProductionProject[] = [
  {
    id: "PROD-001",
    title: "RAMA: THE UNTOLD CHRONICLES",
    tagline: "When Ancient Valor Meets Cosmic Destiny",
    category: "Feature Film",
    genre: ["Epic", "Action", "Mythology", "Fantasy"],
    language: "Telugu / Hindi / Pan-India",
    status: "Filming",
    releaseDate: "Diwali 2027",
    director: "S.S. Rajamouli & CineVenue Creative Board",
    leadCast: ["Prabhas", "Deepika Padukone", "Vijay Deverakonda"],
    producer: "CineVenue Productions & Vyjayanthi Movies",
    bannerImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80",
    posterImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80",
    description: "An extraordinary pan-Indian cinematic spectacle blending ancient Vedic mythology with futuristic visual magic and high-octane action sequences filmed across 5 continents.",
    synopsis: "In a world teetering on the edge of destruction, an ancient warrior lineage awakens to face a shadowy empire spanning dimensions. Uniting lost weapons and ancient wisdom, the heroes fight to protect humanity's soul.",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ticketMovieTitle: "RAMA: The Untold Chronicles",
    isFeatured: true,
    isUpcoming: false,
    budgetRange: "₹350 Crores",
    followersCount: 148500,
    cast: [
      { id: "c1", name: "Prabhas", role: "Lord Rama / Hero", characterName: "Rama Varma", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70", bio: "Pan-Indian superstar with iconic presence." },
      { id: "c2", name: "Deepika Padukone", role: "Princess Sita", characterName: "Sita Devi", photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=70", bio: "Internationally acclaimed leading actress." },
      { id: "c3", name: "Vijay Deverakonda", role: "Warrior Lakshmana", characterName: "Lakshmana", photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=70", bio: "Dynamic star performer." }
    ],
    crew: [
      { id: "cr1", name: "S.S. Rajamouli", role: "Director" },
      { id: "cr2", name: "CineVenue Studio Board", role: "Producer" },
      { id: "cr3", name: "M.M. Keeravani", role: "Music Director" },
      { id: "cr4", name: "K.K. Senthil Kumar", role: "Cinematographer" },
      { id: "cr5", name: "Makuta VFX", role: "VFX Supervisor" }
    ],
    media: [
      { id: "m1", type: "First Look", title: "Official Title Announcement Poster", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80" },
      { id: "m2", type: "Teaser", title: "Concept Teaser Reel (4K)", url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80" },
      { id: "m3", type: "BTS Video", title: "Making of the 10,000 Extra Battle Scene", url: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80" }
    ],
    updates: [
      { id: "u1", date: "2026-08-01", title: "Schedule 3 Wraps in Iceland", content: "Major VFX battle sequence wrapped in Iceland with a crew of 400 international artists.", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=70" },
      { id: "u2", date: "2026-07-10", title: "Music Recording Session Begins", content: "M.M. Keeravani records orchestra with London Symphony Orchestra.", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=70" }
    ]
  },
  {
    id: "PROD-002",
    title: "NEON ROYALS: HYDERABAD NIGHTS",
    tagline: "Power. Passion. High-Stakes Betrayal.",
    category: "Web Series",
    genre: ["Crime", "Thriller", "Drama"],
    language: "Telugu & English",
    status: "Post-Production",
    releaseDate: "December 2026",
    director: "Gautam Tinnanuri",
    leadCast: ["Rana Daggubati", "Sobhita Dhulipala", "Sharwanand"],
    producer: "CineVenue Originals",
    bannerImage: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&q=80",
    posterImage: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&q=80",
    description: "An 8-episode high-budget noir crime thriller following Hyderabad's elite night-life cartel and political power brokers fighting for control of Southern India's tech empire.",
    synopsis: "When a tech billionaire vanishes from a private yacht party, rival crime syndicates and undercover investigators unleash a dangerous cat-and-mouse game through lavish penthouses and underground clubs.",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isFeatured: false,
    isUpcoming: true,
    budgetRange: "₹45 Crores",
    followersCount: 89200,
    cast: [
      { id: "c4", name: "Rana Daggubati", role: "Vikram Reddy", characterName: "The Night Baron", photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=70" },
      { id: "c5", name: "Sobhita Dhulipala", role: "Maya Sen", characterName: "Undercover Agent", photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=70" }
    ],
    crew: [
      { id: "cr6", name: "Gautam Tinnanuri", role: "Director" },
      { id: "cr7", name: "Anirudh Ravichander", role: "Music Director" }
    ],
    media: [
      { id: "m4", type: "Poster", title: "Character Poster - Rana Daggubati", url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80" }
    ],
    updates: [
      { id: "u3", date: "2026-07-28", title: "Post-Production Color Grading in Progress", content: "Dolby Vision mastering taking place at CineVenue Post Studios.", image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&q=70" }
    ]
  },
  {
    id: "PROD-003",
    title: "KAAVYA: MOONLIGHT SERENADE",
    tagline: "A Musical Saga of Timeless Love",
    category: "Music Video",
    genre: ["Romance", "Musical"],
    language: "Tamil / Telugu / Hindi",
    status: "Released",
    releaseDate: "August 2026",
    director: "Gautham Vasudev Menon",
    leadCast: ["Dulquer Salmaan", "Sai Pallavi"],
    producer: "CineVenue Music & Productions",
    bannerImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80",
    posterImage: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=80",
    description: "A breathtaking romantic music video shot in rain-drenched Munnar tea estates, composed by AR Rahman.",
    synopsis: "Two estranged musicians reunite on a misty mountain pass to compose their final unfinished song.",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isFeatured: false,
    isUpcoming: false,
    budgetRange: "₹3.5 Crores",
    followersCount: 54100,
    cast: [
      { id: "c6", name: "Dulquer Salmaan", role: "Arjun", characterName: "Violinist", photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=70" },
      { id: "c7", name: "Sai Pallavi", role: "Kaavya", characterName: "Dancer", photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=70" }
    ],
    crew: [
      { id: "cr8", name: "Gautham Menon", role: "Director" },
      { id: "cr9", name: "A.R. Rahman", role: "Music Director" }
    ],
    media: [
      { id: "m5", type: "Trailer", title: "Official Video Stream (4K HDR)", url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80" }
    ],
    updates: [
      { id: "u4", date: "2026-08-05", title: "Crosses 25 Million Views in 48 Hours!", content: "Trending #1 on YouTube Music and Spotify India.", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=70" }
    ]
  },
  {
    id: "PROD-004",
    title: "THE LAST SINGLE: COMEDY SPECIAL",
    tagline: "Stand-Up Live From CineVenue Arena",
    category: "Short Film",
    genre: ["Comedy", "Lifestyle"],
    language: "Hindi & English",
    status: "Completed",
    releaseDate: "September 2026",
    director: "Kanan Gill",
    leadCast: ["Biswa Kalyan Rath", "Rahul Subramanian"],
    producer: "CineVenue Live & Productions",
    bannerImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
    posterImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80",
    description: "A hilarious 45-minute narrative short film and standup special documenting wedding survival in corporate India.",
    synopsis: "Three best friends navigate a weekend destination wedding equipped with zero social skills and 100% unwanted advice.",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isFeatured: false,
    isUpcoming: false,
    budgetRange: "₹1.8 Crores",
    followersCount: 32400,
    cast: [
      { id: "c8", name: "Biswa Kalyan Rath", role: "Protagonist", characterName: "Self", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70" }
    ],
    crew: [
      { id: "cr10", name: "Kanan Gill", role: "Director" }
    ],
    media: [
      { id: "m6", type: "Poster", title: "Official Short Film Poster", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80" }
    ],
    updates: []
  },
  {
    id: "PROD-005",
    title: "THE NEXT ERA: ONEPLUS 14 PRO BRAND FILM",
    tagline: "Speed Beyond Limits. Vision Beyond Boundary.",
    category: "Commercial Film",
    genre: ["Tech", "Commercial", "Brand"],
    language: "Global English",
    status: "Released",
    releaseDate: "August 2026",
    director: "CineVenue Brand Studio & Vasan Bala",
    leadCast: ["Shah Rukh Khan"],
    producer: "CineVenue Brand Studio",
    bannerImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80",
    posterImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
    description: "A cinematic IMAX commercial film shot on high-speed Phantom cameras highlighting 300fps cinematic smartphone video capabilities.",
    synopsis: "A high-speed adrenaline motorcycle chase across night cityscapes captured entirely in zero light.",
    isFeatured: false,
    isUpcoming: false,
    budgetRange: "₹12 Crores",
    followersCount: 61000,
    cast: [
      { id: "c9", name: "Shah Rukh Khan", role: "Brand Ambassador", characterName: "The Maverick", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=70" }
    ],
    crew: [
      { id: "cr11", name: "Vasan Bala", role: "Director" }
    ],
    media: [],
    updates: []
  }
];

export const INITIAL_CASTING_CALLS: CastingCall[] = [
  {
    id: "CAST-001",
    projectId: "PROD-001",
    projectTitle: "RAMA: THE UNTOLD CHRONICLES",
    roleTitle: "Young Warrior General (Supporting Lead)",
    category: "Supporting Actor",
    ageRange: "22 - 28 Years",
    gender: "Male",
    location: "Hyderabad Studio / On-Location Shoot",
    language: "Telugu & Hindi fluent",
    skillsRequired: ["Sword Fighting", "Martial Arts", "Horse Riding", "Commanding Screen Voice"],
    experienceRequirement: "Minimum 2 feature films or theatre background.",
    deadline: "2026-08-25",
    description: "Seeking a intense, physically fit actor for a pivotal warrior commander role who leads ancient battle ranks alongside Prabhas.",
    auditionDetails: "Submit a 2-minute dialogue monologue and a 30-second martial arts action clip.",
    status: "Urgent",
    postedDate: "2026-08-02"
  },
  {
    id: "CAST-002",
    projectId: "PROD-002",
    projectTitle: "NEON ROYALS: HYDERABAD NIGHTS",
    roleTitle: "Undercover Cyber Specialist",
    category: "Lead Actor",
    ageRange: "24 - 32 Years",
    gender: "Female",
    location: "Hyderabad & Bangalore",
    language: "Telugu & English",
    skillsRequired: ["Fluent English", "Stylized Screen Persona", "Improv Dialogue"],
    experienceRequirement: "Open to Fresh Talent with strong portfolio or web series work.",
    deadline: "2026-08-30",
    description: "Pivotal recurring character across 8 episodes. A tech-savvy informant who operates secretly between rival cartels.",
    auditionDetails: "Perform script audition scene #3 provided upon profile submission.",
    status: "Open",
    postedDate: "2026-08-04"
  },
  {
    id: "CAST-003",
    projectId: "PROD-001",
    projectTitle: "RAMA: THE UNTOLD CHRONICLES",
    roleTitle: "Lead Classical Dancers (Group Ensemble)",
    category: "Dancer",
    ageRange: "18 - 26 Years",
    gender: "Female",
    location: "Hyderabad / Ramoji Film City",
    language: "Any",
    skillsRequired: ["Kuchipudi", "Bharatanatyam", "Synchronized Choreography"],
    experienceRequirement: "Formal classical dance training required.",
    deadline: "2026-09-05",
    description: "15 classical lead dancers required for a grand kingdom celebration song choreographed by Prabhu Deva.",
    auditionDetails: "Upload 1-minute video performing Kuchipudi or Bharatanatyam piece.",
    status: "Open",
    postedDate: "2026-08-05"
  },
  {
    id: "CAST-004",
    projectId: "PROD-006",
    projectTitle: "UNNAMED SCI-FI SHORT FILM",
    roleTitle: "Lead Voice Artist (AI Voice Assistant)",
    category: "Voice Artist",
    ageRange: "Any",
    gender: "Any",
    location: "Remote / CineVenue Dubbing Studio",
    language: "English & Hindi",
    skillsRequired: ["Warm Voice Tone", "Clarity", "Studio Mic Recording"],
    experienceRequirement: "Voiceover experience in podcasts or commercials preferred.",
    deadline: "2026-08-20",
    description: "Voice actor required for an AI spaceship companion system with witty personality.",
    auditionDetails: "Record provided 40-word sample script.",
    status: "Open",
    postedDate: "2026-08-01"
  }
];

export const INITIAL_BTS_ITEMS: BehindTheScenesItem[] = [
  {
    id: "BTS-101",
    projectTitle: "RAMA: THE UNTOLD CHRONICLES",
    title: "Rigging 100-Meter High Wirework in Iceland",
    category: "Shooting",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
    caption: "Director S.S. Rajamouli inspecting 4K Phantom High Speed Rig in sub-zero Iceland glaciers.",
    date: "2026-07-22"
  },
  {
    id: "BTS-102",
    projectTitle: "NEON ROYALS",
    title: "Midnight Car Stunt Rehearsal on ORR Hyderabad",
    category: "Set Design",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
    caption: "Custom neon lighting array set up across 2km highway stretch for high-speed night chase.",
    date: "2026-07-18"
  },
  {
    id: "BTS-103",
    projectTitle: "RAMA: THE UNTOLD CHRONICLES",
    title: "Prosthetic Makeup Transformation",
    category: "Makeup",
    type: "image",
    mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
    caption: "3.5 hours prosthetic session for the demon lord villain revealing custom creature design.",
    date: "2026-07-10"
  }
];

export const INITIAL_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "NEWS-001",
    title: "CineVenue Productions Announces $100M Pan-Indian Slate For 2027-2028",
    category: "Movie Announcement",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
    date: "2026-08-05",
    author: "CineVenue Press Desk",
    summary: "CineVenue unveils 5 upcoming theatrical feature films, 3 original series, and a dedicated $10M Talent Incubator Fund for young storytellers.",
    content: "In a landmark entertainment announcement at the Hyderabad Film Expo, CineVenue Productions officially unveiled its slate for 2027-2028. Featuring multi-lingual mythological epics, action thrillers, and comedy web series, CineVenue continues its mission of creating stories, producing experiences, and building entertainment.",
    tags: ["Slate2027", "PressRelease", "Cinema"]
  },
  {
    id: "NEWS-002",
    title: "Global Auditions Open For 'RAMA: The Untold Chronicles' Supporting Cast",
    category: "Casting Announcement",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
    date: "2026-08-02",
    author: "CineVenue Casting Dept",
    summary: "Over 50 roles open across lead, supporting, warrior, and dancer categories. Aspiring actors can apply directly via CineVenue Talent Portal.",
    content: "CineVenue Productions has officially thrown open global auditions for S.S. Rajamouli's magnum opus. Actors, martial artists, and classical dancers can upload showreels and profile details straight from their smartphones.",
    tags: ["CastingCall", "Auditions", "Prabhas"]
  },
  {
    id: "NEWS-003",
    title: "CineVenue Brand Studio Partners With OnePlus For Immersive Theatre Campaigns",
    category: "Brand Partnership",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
    date: "2026-07-29",
    author: "CineVenue Brand Studio",
    summary: "Multi-city interactive screen takeover and 4K brand film rollout announced across 250+ multiplex partner screens.",
    content: "CineVenue Brand Studio today announced its multi-channel partnership with OnePlus India, integrating product placement in upcoming blockbuster films with high-impact lobby experiences.",
    tags: ["BrandStudio", "OnePlus", "Marketing"]
  }
];

export const INITIAL_STORY_SUBMISSIONS: StorySubmission[] = [];

export const INITIAL_BRAND_CAMPAIGN_REQUESTS: BrandCampaignRequest[] = [];

export const INITIAL_EVENT_MANAGEMENT_REQUESTS: EventManagementRequest[] = [];

export const INITIAL_PUBLIC_EVENTS: PublicEvent[] = [
  {
    id: "CVE-EV-101",
    title: "RAMA: MAGNUM OPUS PRE-RELEASE GRAND ARENA EVENT",
    category: "Film Event",
    date: "2026-10-18",
    time: "06:00 PM IST",
    venue: "Gachibowli Stadium Ground",
    city: "Hyderabad",
    posterUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80",
    description: "The biggest movie pre-release event of the decade featuring live performance by M.M. Keeravani live symphony orchestra, 3D laser stage mapping, drone show, and star cast appearance by Prabhas, Deepika Padukone, and S.S. Rajamouli.",
    artists: ["Prabhas", "Deepika Padukone", "S.S. Rajamouli", "M.M. Keeravani", "Vijay Deverakonda"],
    startingTicketPrice: 499,
    status: "Upcoming",
    isPublished: true,
    ticketMovieTitle: "RAMA: The Untold Chronicles",
    highlights: ["M.M. Keeravani Live Symphony", "500-Drone Light Show", "Interactive 3D Stage Projection", "Star Cast Q&A"],
    gallery: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80"
    ],
    promoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    sponsors: ["OnePlus", "Royal Enfield", "Myntra", "BookMyShow"],
    organizer: "CineVenue Productions",
    seatsTotal: 30000,
    seatsBooked: 21450
  },
  {
    id: "CVE-EV-102",
    title: "NEON SOUNDS: LIVE CONCERT FEAT. ANIRUDH RAVICHANDER",
    category: "Concert",
    date: "2026-11-05",
    time: "07:00 PM IST",
    venue: "HITEX Exhibition Center Grounds",
    city: "Hyderabad",
    posterUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
    description: "Anirudh Ravichander live in concert with a 40-member live band, pyrotechnics, immersive LED displays, and guest performances by top playback singers.",
    artists: ["Anirudh Ravichander", "Jonita Gandhi", "Arivu", "Nakash Aziz"],
    startingTicketPrice: 999,
    status: "Upcoming",
    isPublished: true,
    ticketMovieTitle: "NEON ROYALS: HYDERABAD NIGHTS",
    highlights: ["4-Hour High Energy Concert", "State-of-the-Art L-Acoustics Sound", "VIP Fan Pit Access"],
    gallery: [
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"
    ],
    sponsors: ["Red Bull", "Spotify", "Heineken"],
    organizer: "CineVenue Live & Events",
    seatsTotal: 20000,
    seatsBooked: 18200
  },
  {
    id: "CVE-EV-103",
    title: "SOUTH CINEMA AWARDS & CULTURAL FESTIVAL 2026",
    category: "Award Function",
    date: "2026-12-12",
    time: "05:30 PM IST",
    venue: "Ramoji Film City Open Arena",
    city: "Hyderabad",
    posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80",
    coverUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=1200&q=80",
    description: "Celebrating South Indian cinema excellence with celebrity performances, red carpet arrivals, fashion showcases, and lifetime achievement honors.",
    artists: ["Rana Daggubati", "Sai Pallavi", "Dulquer Salmaan", "Prabhu Deva"],
    startingTicketPrice: 1499,
    status: "Upcoming",
    isPublished: true,
    highlights: ["Red Carpet Glamour", "Live Dance Tributes", "Celebrity Interactions"],
    sponsors: ["Tanishq", "Mercedes-Benz", "Deccan Chronicle"],
    organizer: "CineVenue Productions",
    seatsTotal: 15000,
    seatsBooked: 9800
  }
];

export const INITIAL_ARTIST_REQUESTS: ArtistRequest[] = [];

export const INITIAL_SPONSORSHIP_REQUESTS: SponsorshipRequest[] = [];

export const INITIAL_EVENT_PORTFOLIO: EventPortfolioItem[] = [
  {
    id: "PORT-201",
    title: "BAAHUBALI CELEBRATION MUSIC CONCERT",
    category: "Concerts",
    client: "Arka Media Works & CineVenue",
    location: "LB Stadium, Hyderabad",
    year: "2025",
    description: "A monumental live music concert with 45,000 attendees, a 100-piece live orchestra, live choir, and full cast presence.",
    servicesProvided: ["Full Production", "Artist Management", "Ticketing", "Security", "Broadcast & Media"],
    artists: ["Prabhas", "Rana Daggubati", "M.M. Keeravani", "Tamannaah Bhatia"],
    sponsors: ["TVS Motor", "Kingfisher", "Sprite"],
    coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"
    ],
    highlights: ["45,000+ Live Audience", "100-Piece Orchestra", "4K Live Satellite Broadcast"],
    isPublished: true
  },
  {
    id: "PORT-202",
    title: "GLOBAL TECH SUMMIT GALA & AWARDS",
    category: "Corporate Events",
    client: "Global Tech Forum",
    location: "HICC Novotel, Hyderabad",
    year: "2025",
    description: "High-level corporate event with 1,200 delegates, custom LED curved wall, AI interactive registration booths, and gala dinner.",
    servicesProvided: ["Venue Management", "Stage & LED Production", "VIP Handling", "Creative & Content"],
    artists: ["Gautam Adani", "K.T. Rama Rao", "Shreya Ghoshal"],
    sponsors: ["Microsoft", "Google Cloud", "Deloitte"],
    coverImage: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80"
    ],
    highlights: ["1,200 Global Delegates", "Curved 8K LED Stage Wall", "Automated Facial Recognition Check-In"],
    isPublished: true
  }
];

export const INITIAL_VENUES: VenueRecord[] = [
  {
    id: "VEN-01",
    name: "Gachibowli Outdoor Stadium Arena",
    city: "Hyderabad",
    address: "Old Mumbai Highway, Gachibowli, Hyderabad",
    capacity: 35000,
    contactPerson: "K. Ramesh (Stadium In-Charge)",
    contactPhone: "+91 98480 12345",
    venueType: "Outdoor Arena",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
    facilities: ["Flood Lights", "Green Rooms (4)", "VIP Box", "Ample Parking", "Helipad"],
    hasParking: true,
    hasVIPGreenRoom: true
  },
  {
    id: "VEN-02",
    name: "HICC - Hyderabad International Convention Centre",
    city: "Hyderabad",
    address: "Novotel & HICC Complex, HITEC City, Hyderabad",
    capacity: 6000,
    contactPerson: "Sanjay Mehta (Events Lead)",
    contactPhone: "+91 91212 34567",
    venueType: "Convention Center",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
    facilities: ["Central AC", "Column-Free Hall", "5-Star Catering", "In-house AV & Sound", "Valet Parking"],
    hasParking: true,
    hasVIPGreenRoom: true
  }
];

export const INITIAL_ARTISTS: ArtistRecord[] = [
  {
    id: "ARTIST-01",
    name: "Sunidhi Chauhan",
    category: "Singers",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    languages: ["Hindi", "Telugu", "Tamil", "English"],
    startingFee: "₹25 Lakhs per show",
    availability: "Available",
    bio: "Powerhouse Indian playback singer with 20+ years of chart-topping anthems.",
    socialFollowers: "8.5M"
  },
  {
    id: "ARTIST-02",
    name: "Anirudh Ravichander",
    category: "Singers",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    languages: ["Tamil", "Telugu", "Hindi"],
    startingFee: "₹60 Lakhs per show",
    availability: "Selective",
    bio: "Rockstar music composer and live performer known for high-energy concert tours.",
    socialFollowers: "12.4M"
  }
];

export const INITIAL_PROMOTION_CAMPAIGN_DATA: PromotionCampaign[] = [
  {
    id: "MPRO-2026-001",
    name: "RAMA: Pre-Release Multi-City Social & Billboard Blitz",
    promotedType: "Film",
    relatedId: "PROD-001",
    relatedTitle: "RAMA: THE UNTOLD CHRONICLES",
    objective: "Ticket Sales",
    startDate: "2026-09-01",
    endDate: "2026-10-25",
    targetAudience: "Movie Lovers, Youth, Pan-India Families (15-45)",
    targetLocations: "Hyderabad, Chennai, Bengaluru, Mumbai, Delhi",
    languages: ["Telugu", "Hindi", "Tamil", "Kannada", "Malayalam"],
    budget: "₹2.5 Crores",
    status: "Active",
    manager: "Ananya Sharma (Head of Media)",
    description: "Comprehensive 360-degree promotional campaign involving character reveal posters, YouTube 4K teaser drops, Instagram Reels influencer trend, and multiplex standees.",
    deliverables: [
      { title: "Instagram Reels (Cast & BTS)", required: 20, completed: 14, status: "In Progress" },
      { title: "YouTube Trailers & Motion Posters", required: 5, completed: 5, status: "Completed" },
      { title: "Press Releases & News Coverage", required: 12, completed: 8, status: "In Progress" },
      { title: "Influencer Cross-Promotions", required: 15, completed: 10, status: "In Progress" }
    ],
    reachImpressions: 48500000,
    totalViews: 18200000,
    clicks: 640000,
    ticketConversions: 42100,
    trackingLink: "https://cinevenue.com/p/rama-blitz"
  },
  {
    id: "MPRO-2026-002",
    name: "ELAN & NVISION 2026 Campus Youth Surge",
    promotedType: "Event",
    relatedId: "CVE-2026-00001",
    relatedTitle: "ELAN & NVISION 2026 CULTURAL NIGHT",
    objective: "Event Registrations",
    startDate: "2026-08-15",
    endDate: "2026-10-12",
    targetAudience: "College Students, Tech Enthusiasts, Music Fans",
    targetLocations: "Hyderabad, Vijayawada, Vizag, Warangal",
    languages: ["English", "Telugu", "Hindi"],
    budget: "₹12 Lakhs",
    status: "Scheduled",
    manager: "Rohan Patel (Campus Lead)",
    description: "Digital campaign across 50 college ambassador networks, Spotify audio ads, and Instagram campus giveaways for passes.",
    deliverables: [
      { title: "Campus Poster Rollout", required: 50, completed: 20, status: "In Progress" },
      { title: "Instagram Contest Stories", required: 30, completed: 5, status: "Pending" }
    ],
    reachImpressions: 1200000,
    totalViews: 450000,
    clicks: 38000,
    ticketConversions: 4200,
    trackingLink: "https://cinevenue.com/p/elan2026"
  }
];

export const INITIAL_FILM_APPLICATIONS: FilmProjectApplication[] = [];


