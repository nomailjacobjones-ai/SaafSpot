import type { Category, Status } from './types';

export type Lang = 'en' | 'ur';

export interface Dict {
  dir: 'ltr' | 'rtl';
  appName: string;
  tagline: string;
  nav: {
    home: string;
    newReport: string;
    about: string;
  };
  home: {
    title: string;
    subtitle: string;
    countsReal: string;
    countsDemo: string;
    hotspots: string;
    recentActivity: string;
    list: string;
    map: string;
    search: string;
    allCategories: string;
    allStatuses: string;
    noHotspots: string;
    noHotspotsHint: string;
    observations: string;
    confirmations: string;
    firstSeen: string;
    lastSeen: string;
    viewDetails: string;
    demoLabel: string;
    realLabel: string;
    reportCta: string;
  };
  categories: Record<Category, string>;
  statuses: Record<Status, string>;
  statusHelp: Record<Status, string>;
  newReport: {
    title: string;
    subtitle: string;
    category: string;
    categoryPlaceholder: string;
    locationLabel: string;
    locationHint: string;
    locationPlaceholder: string;
    useMyLocation: string;
    locating: string;
    locationDenied: string;
    coordinates: string;
    lat: string;
    lng: string;
    coordsHint: string;
    observedAt: string;
    description: string;
    descriptionPlaceholder: string;
    photo: string;
    photoHint: string;
    photoError: string;
    isCleanup: string;
    isCleanupHint: string;
    preview: string;
    previewHint: string;
    submit: string;
    submitting: string;
    success: string;
    duplicateTitle: string;
    duplicateHint: string;
    duplicateNone: string;
    addToExisting: string;
    createNew: string;
    errors: {
      category: string;
      locationLabel: string;
      coords: string;
      observedAt: string;
      futureDate: string;
      description: string;
    };
  };
  detail: {
    back: string;
    location: string;
    observations: string;
    evidence: string;
    noPhotos: string;
    communityConfirmations: string;
    confirm: string;
    confirming: string;
    alreadyConfirmed: string;
    confirmError: string;
    timeline: string;
    recurrence: string;
    firstObserved: string;
    latestObserved: string;
    reportCount: string;
    markCleanup: string;
    prepareBrief: string;
    getOfficialHelp: string;
    call1139: string;
    officialRef: string;
    officialRefPlaceholder: string;
    saveRef: string;
    refSaved: string;
    demoBanner: string;
  };
  brief: {
    title: string;
    subtitle: string;
    caseTitle: string;
    category: string;
    location: string;
    status: string;
    summary: string;
    observations: string;
    firstObserved: string;
    latestObserved: string;
    confirmations: string;
    evidence: string;
    evidenceItems: string;
    noEvidence: string;
    timeline: string;
    recommendedAction: string;
    recommendedActionBody: string;
    officialHandoff: string;
    officialHandoffBody: string;
    getOfficialHelp: string;
    call1139: string;
    copy: string;
    copied: string;
    print: string;
    download: string;
    back: string;
    disclaimer: string;
    generatedAt: string;
    referenceLabel: string;
  };
  about: {
    title: string;
    what: string;
    whatBody: string;
    notGov: string;
    notGovBody: string;
    evidence: string;
    evidenceBody: string;
    privacy: string;
    privacyBody: string;
    how: string;
    howSteps: string[];
    credits: string;
    creditsBody: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    close: string;
    cancel: string;
    back: string;
    demoMode: string;
    demoModeHint: string;
    liveMode: string;
    language: string;
    footerNote: string;
  };
}

const en: Dict = {
  dir: 'ltr',
  appName: 'SaafSpot',
  tagline: 'Spot it. Document it. Track what changes.',
  nav: { home: 'Dashboard', newReport: 'New report', about: 'About' },
  home: {
    title: 'Your neighborhood, cleaner — together.',
    subtitle:
      'Document recurring garbage hotspots, build community evidence, and prepare a clear handoff for official sanitation channels.',
    countsReal: 'live records',
    countsDemo: 'demo records',
    hotspots: 'Community hotspots',
    recentActivity: 'Recent activity',
    list: 'List',
    map: 'Map',
    search: 'Search by location or keyword',
    allCategories: 'All categories',
    allStatuses: 'All statuses',
    noHotspots: 'No hotspots match your filters.',
    noHotspotsHint: 'Try clearing filters or report a new hotspot.',
    observations: 'observations',
    confirmations: 'confirmations',
    firstSeen: 'First seen',
    lastSeen: 'Last seen',
    viewDetails: 'View details',
    demoLabel: 'Demo',
    realLabel: 'Live',
    reportCta: 'Report a hotspot',
  },
  categories: {
    overflowing_bin: 'Overflowing bin',
    uncollected_waste: 'Uncollected waste',
    illegal_dumping: 'Illegal dumping',
    missing_damaged_bin: 'Missing or damaged bin',
    other: 'Other',
  },
  statuses: {
    reported: 'Reported',
    corroborated: 'Community corroborated',
    brief_prepared: 'Brief prepared',
    cleanup_observed: 'Cleanup observed',
    recurring: 'Recurring',
  },
  statusHelp: {
    reported: 'A new observation has been logged by the community.',
    corroborated: 'Multiple community members have confirmed the issue.',
    brief_prepared: 'An action brief has been prepared for handoff.',
    cleanup_observed: 'A cleanup was observed and recorded with evidence.',
    recurring: 'The issue returned after a cleanup was observed.',
  },
  newReport: {
    title: 'Report a hotspot',
    subtitle:
      'Log what you saw. Use a public street or landmark — never a home address.',
    category: 'Category',
    categoryPlaceholder: 'Select a category',
    locationLabel: 'Public location label',
    locationHint:
      'A street name, landmark, or nearby public place. Do not enter a home address.',
    locationPlaceholder: 'e.g. Liberty Market Roundabout, Gulberg III',
    useMyLocation: 'Use my location',
    locating: 'Locating…',
    locationDenied:
      'Location permission denied. You can still type coordinates manually.',
    coordinates: 'Approximate coordinates',
    lat: 'Latitude',
    lng: 'Longitude',
    coordsHint:
      'Drop a pin on the map or use your device location. Use an approximate public point.',
    observedAt: 'When did you observe this?',
    description: 'Description',
    descriptionPlaceholder: 'Describe what you saw, how bad it is, and any smell or blockage.',
    photo: 'Photo (optional)',
    photoHint: 'JPG or PNG, up to 5 MB. No people’s faces, please.',
    photoError: 'Photo must be a JPG or PNG under 5 MB.',
    isCleanup: 'This is a cleanup observation',
    isCleanupHint:
      'Mark this only if the spot looks cleaned up. A dated record or photo is required as evidence.',
    preview: 'Preview',
    previewHint: 'Review your report before submitting.',
    submit: 'Submit report',
    submitting: 'Submitting…',
    success: 'Report submitted. Thank you for documenting your neighborhood.',
    duplicateTitle: 'Possible existing hotspot nearby',
    duplicateHint:
      'A similar report exists nearby. You can add your observation to it, or create a new separate hotspot. Reports are never automatically merged.',
    duplicateNone: 'No nearby matching hotspot found. A new hotspot will be created.',
    addToExisting: 'Add my observation to this hotspot',
    createNew: 'Create a new separate hotspot',
    errors: {
      category: 'Pick a category.',
      locationLabel: 'Enter a public location label (at least 3 characters).',
      coords: 'Enter valid latitude and longitude.',
      observedAt: 'Choose when you observed this.',
      futureDate: 'The observation date cannot be in the future.',
      description: 'Add a short description (at least 10 characters).',
    },
  },
  detail: {
    back: 'Back to dashboard',
    location: 'Location',
    observations: 'Observations',
    evidence: 'Evidence gallery',
    noPhotos: 'No photos attached yet.',
    communityConfirmations: 'Community confirmations',
    confirm: 'I can confirm this',
    confirming: 'Confirming…',
    alreadyConfirmed: 'You already confirmed this hotspot',
    confirmError: 'Could not record your confirmation. Please try again.',
    timeline: 'Status timeline',
    recurrence: 'Recurrence history',
    firstObserved: 'First observed',
    latestObserved: 'Latest observed',
    reportCount: 'reports',
    markCleanup: 'Mark cleanup observed',
    prepareBrief: 'Prepare action brief',
    getOfficialHelp: 'Get official help',
    call1139: 'Call 1139',
    officialRef: 'Official complaint reference',
    officialRefPlaceholder: 'Paste your complaint reference (optional)',
    saveRef: 'Save reference',
    refSaved: 'Reference saved',
    demoBanner:
      'This is a fictional demo case, shown so judges can explore the interface.',
  },
  brief: {
    title: 'Action brief',
    subtitle:
      'A clear, printable summary you can share with official sanitation channels. This is not an official submission.',
    caseTitle: 'Case title',
    category: 'Category',
    location: 'Public location',
    status: 'Community status',
    summary: 'Summary',
    observations: 'Observations',
    firstObserved: 'First observed',
    latestObserved: 'Latest observed',
    confirmations: 'Independent confirmations',
    evidence: 'Evidence references',
    evidenceItems: 'evidence items',
    noEvidence: 'No photo evidence attached.',
    timeline: 'Timeline of events',
    recommendedAction: 'Recommended next action',
    recommendedActionBody:
      'Share this brief with the official sanitation complaint channel for your union council. Keep your complaint reference below for tracking.',
    officialHandoff: 'Official handoff (manual)',
    officialHandoffBody:
      'SaafSpot does not submit anything on your behalf. Use the official links below to file your complaint and record the reference you receive.',
    getOfficialHelp: 'Open Suthra Punjab complaints',
    call1139: 'Call 1139',
    copy: 'Copy brief',
    copied: 'Copied to clipboard',
    print: 'Print',
    download: 'Download',
    back: 'Back to hotspot',
    disclaimer:
      'SaafSpot is a community evidence tool, not a government service. Statuses are community-evidence states, not official service statuses.',
    generatedAt: 'Generated',
    referenceLabel: 'Your official complaint reference',
  },
  about: {
    title: 'About SaafSpot',
    what: 'What is SaafSpot?',
    whatBody:
      'SaafSpot is a small community tool for documenting recurring garbage hotspots in one neighborhood or school-adjacent public area. Neighbors log observations, group nearby same-category reports into cases, and track whether issues come back after a cleanup.',
    notGov: 'SaafSpot is not a government service',
    notGovBody:
      'SaafSpot is an independent civic-tech project built for a hackathon. It is not affiliated with, endorsed by, or connected to any government body. It does not submit complaints for you and does not claim any official status.',
    evidence: 'The limits of community evidence',
    evidenceBody:
      'Observations and confirmations reflect what community members chose to report. They are not verified by inspectors and are not official records. Use them as a starting point for dialogue with sanitation authorities, not as proof of service failures.',
    privacy: 'Privacy',
    privacyBody:
      'SaafSpot never asks for your home address, email, or phone number. It stores only an opaque, random identity used to prevent duplicate confirmations on the same device. Photo uploads should not include identifiable faces.',
    how: 'How it works',
    howSteps: [
      'Spot a recurring garbage issue in a public place.',
      'Log an observation with a public location label and an approximate pin.',
      'Nearby same-category reports are suggested — you choose to add to an existing case or start a new one. Reports are never automatically merged.',
      'Neighbors confirm the case and add their own observations over time.',
      'When a cleanup is observed, record it with a dated note or photo.',
      'If the issue returns, the case is marked recurring — history is preserved.',
      'Prepare an action brief and hand it off manually to official sanitation channels.',
    ],
    credits: 'Credits',
    creditsBody:
      'Built for Neighborhood Hacks 2026 with React, TypeScript, Vite, Tailwind CSS, Supabase, and Leaflet/OpenStreetMap. Map data © OpenStreetMap contributors.',
  },
  common: {
    loading: 'Loading…',
    error: 'Something went wrong.',
    retry: 'Try again',
    close: 'Close',
    cancel: 'Cancel',
    back: 'Back',
    demoMode: 'Demo mode',
    demoModeHint:
      'Backend not configured. Showing local demo data — nothing is saved or shared.',
    liveMode: 'Live',
    language: 'Language',
    footerNote:
      'SaafSpot is an independent community tool, not a government service. Map © OpenStreetMap contributors.',
  },
};

const ur: Dict = {
  dir: 'rtl',
  appName: 'صاف اسپاٹ',
  tagline: 'دیکھیے۔ ریکارڈ کریں۔ تبدیلی کا مشاہدہ کریں۔',
  nav: { home: 'ڈیش بورڈ', newReport: 'نئی رپورٹ', about: 'تعارف' },
  home: {
    title: 'آپ کا محلہ، مل کر صاف — ایک ساتھ۔',
    subtitle:
      'بار بار آنے والے کچرے کے نقطوں کو ریکارڈ کریں، کمیونٹی کا ثبوت بنائیں، اور صفائی کے سرکاری ذرائع کے لیے واضح مختصر تیار کریں۔',
    countsReal: 'لائیو ریکارڈ',
    countsDemo: 'ڈیمو ریکارڈ',
    hotspots: 'کمیونٹی ہاٹ اسپاٹس',
    recentActivity: 'حالیہ سرگرمی',
    list: 'فہرست',
    map: 'نقشہ',
    search: 'مقام یا کلیدی لفظ سے تلاش کریں',
    allCategories: 'تمام اقسام',
    allStatuses: 'تمام حالتیں',
    noHotspots: 'کوئی ہاٹ اسپاٹ آپ کے فلٹر سے مطابقت نہیں رکھتا۔',
    noHotspotsHint: 'فلٹر صاف کریں یا نیا ہاٹ اسپاٹ رپورٹ کریں۔',
    observations: 'مشاہدات',
    confirmations: 'تصدیقات',
    firstSeen: 'پہلی بار دیکھا گیا',
    lastSeen: 'آخری بار دیکھا گیا',
    viewDetails: 'تفصیل دیکھیں',
    demoLabel: 'ڈیمو',
    realLabel: 'لائیو',
    reportCta: 'ہاٹ اسپاٹ رپورٹ کریں',
  },
  categories: {
    overflowing_bin: 'بھرا ہوا ڈبہ',
    uncollected_waste: 'اٹھایا نہ گیا کچرا',
    illegal_dumping: 'غیر قانونی کچرا پھینکنا',
    missing_damaged_bin: 'غیر موجود یا ٹوٹا ڈبہ',
    other: 'دیگر',
  },
  statuses: {
    reported: 'رپورٹ ہو گیا',
    corroborated: 'کمیونٹی نے تصدیق کی',
    brief_prepared: 'مختصر تیار ہے',
    cleanup_observed: 'صفائی کا مشاہدہ ہوا',
    recurring: 'دہراتا ہے',
  },
  statusHelp: {
    reported: 'کمیونٹی نے ایک نیا مشاہدہ ریکارڈ کیا ہے۔',
    corroborated: 'کئی کمیونٹی اراکین نے مسئلے کی تصدیق کی ہے۔',
    brief_prepared: 'حوالے کے لیے ایک مختصر تیار کیا گیا ہے۔',
    cleanup_observed: 'صفائی کا مشاہدہ ثبوت کے ساتھ ریکارڈ کیا گیا۔',
    recurring: 'صفائی کے بعد مسئلہ دوبارہ سامنے آیا۔',
  },
  newReport: {
    title: 'ہاٹ اسپاٹ رپورٹ کریں',
    subtitle:
      'جو دیکھا وہ ریکارڈ کریں۔ عوامی گلی یا نشان استعمال کریں — گھر کا پتہ کبھی نہیں۔',
    category: 'قسم',
    categoryPlaceholder: 'ایک قسم منتخب کریں',
    locationLabel: 'عوامی مقام کا لیبل',
    locationHint:
      'گلی کا نام، نشان، یا قریبی عوامی جگہ۔ گھر کا پتہ درج نہ کریں۔',
    locationPlaceholder: 'مثلاً لبرٹی مارکیٹ چوک، گلبرگ III',
    useMyLocation: 'میری جگہ استعمال کریں',
    locating: 'مقام معلوم ہو رہا ہے…',
    locationDenied:
      'مقام کی اجازت نہیں ملی۔ آپ اب بھی نقاط ہاتھ سے درج کر سکتے ہیں۔',
    coordinates: 'تقریبی نقاط',
    lat: 'عرض البلد',
    lng: 'طول البلد',
    coordsHint:
      'نقشے پر پن لگائیں یا اپنے آلے کا مقام استعمال کریں۔ تقریبی عوامی نقطہ استعمال کریں۔',
    observedAt: 'آپ نے یہ کب دیکھا؟',
    description: 'تفصیل',
    descriptionPlaceholder: 'جو دیکھا، کتنا برا، اور کوئی بو یا رکاوٹ بیان کریں۔',
    photo: 'تصویر (اختیاری)',
    photoHint: 'JPG یا PNG، 5 ایم بی تک۔ براہ کرم چہرے شامل نہ کریں۔',
    photoError: 'تصویر JPG یا PNG اور 5 ایم بی سے کم ہونی چاہیے۔',
    isCleanup: 'یہ صفائی کا مشاہدہ ہے',
    isCleanupHint:
      'اسے تب ہی منتخب کریں جب جگہ صاف نظر آئے۔ ثبوت کے لیے بتاریخ ریکارڈ یا تصویر ضروری ہے۔',
    preview: 'جائزہ',
    previewHint: 'جمع کرانے سے پہلے اپنی رپورٹ کا جائزہ لیں۔',
    submit: 'رپورٹ جمع کریں',
    submitting: 'جمع ہو رہی ہے…',
    success: 'رپورٹ جمع ہو گئی۔ اپنے محلے کو ریکارڈ کرنے کا شکریہ۔',
    duplicateTitle: 'قریب ممکنہ موجودہ ہاٹ اسپاٹ',
    duplicateHint:
      'قریب ایک ملتی جلتی رپورٹ موجود ہے۔ آپ اپنا مشاہدہ اس میں شامل کر سکتے ہیں، یا نیا الگ ہاٹ اسپاٹ بنا سکتے ہیں۔ رپورٹس کبھی خود بخود ضم نہیں ہوتیں۔',
    duplicateNone: 'قریب کوئی ملتی ہاٹ اسپاٹ نہیں ملا۔ نیا ہاٹ اسپاٹ بنایا جائے گا۔',
    addToExisting: 'اپنا مشاہدہ اس ہاٹ اسپاٹ میں شامل کریں',
    createNew: 'نیا الگ ہاٹ اسپاٹ بنائیں',
    errors: {
      category: 'ایک قسم منتخب کریں۔',
      locationLabel: 'عوامی مقام کا لیبل درج کریں (کم از کم 3 حروف)۔',
      coords: 'درست عرض البلد اور طول البلد درج کریں۔',
      observedAt: 'مشاہدے کا وقت منتخب کریں۔',
      futureDate: 'مشاہدے کی تاریخ مستقبل میں نہیں ہو سکتی۔',
      description: 'مختصر تفصیل درج کریں (کم از کم 10 حروف)۔',
    },
  },
  detail: {
    back: 'ڈیش بورڈ پر واپس',
    location: 'مقام',
    observations: 'مشاہدات',
    evidence: 'ثبوت کی گیلری',
    noPhotos: 'ابھی کوئی تصویر منسلک نہیں۔',
    communityConfirmations: 'کمیونٹی کی تصدیقات',
    confirm: 'میں اس کی تصدیق کر سکتا ہوں',
    confirming: 'تصدیق ہو رہی ہے…',
    alreadyConfirmed: 'آپ پہلے ہی اس ہاٹ اسپاٹ کی تصدیق کر چکے ہیں',
    confirmError: 'تصدیق ریکارڈ نہیں ہو سکی۔ دوبارہ کوشش کریں۔',
    timeline: 'حالت کی ٹائم لائن',
    recurrence: 'دہراؤ کی تاریخ',
    firstObserved: 'پہلا مشاہدہ',
    latestObserved: 'آخری مشاہدہ',
    reportCount: 'رپورٹس',
    markCleanup: 'صفائی کا مشاہدہ ریکارڈ کریں',
    prepareBrief: 'مختصر تیار کریں',
    getOfficialHelp: 'سرکاری امداد حاصل کریں',
    call1139: '1139 پر کال کریں',
    officialRef: 'سرکاری شکایت کا حوالہ',
    officialRefPlaceholder: 'اپنا شکایت کا حوالہ پیسٹ کریں (اختیاری)',
    saveRef: 'حوالہ محفوظ کریں',
    refSaved: 'حوالہ محفوظ ہو گیا',
    demoBanner:
      'یہ ایک فرضی ڈیمو کیس ہے، جو جج کے لیے دکھایا گیا ہے۔',
  },
  brief: {
    title: 'ایکشن مختصر',
    subtitle:
      'ایک واضح، قابلِ طباعت خلاصہ جو آپ سرکاری صفائی ذرائع کے ساتھ شیئر کر سکتے ہیں۔ یہ سرکاری جمع کرانہ نہیں۔',
    caseTitle: 'کیس کا عنوان',
    category: 'قسم',
    location: 'عوامی مقام',
    status: 'کمیونٹی کی حالت',
    summary: 'خلاصہ',
    observations: 'مشاہدات',
    firstObserved: 'پہلا مشاہدہ',
    latestObserved: 'آخری مشاہدہ',
    confirmations: 'آزادانہ تصدیقات',
    evidence: 'ثبوت کے حوالہ جات',
    evidenceItems: 'ثبوت کی اشیاء',
    noEvidence: 'کوئی تصویری ثبوت منسلک نہیں۔',
    timeline: 'واقعات کی ٹائم لائن',
    recommendedAction: 'اگلی تجویز کردہ کارروائی',
    recommendedActionBody:
      'یہ مختصر اپنی یونین کونسل کے سرکاری صفائی شکایت چینل کے ساتھ شیئر کریں۔ اپنا شکایت کا حوالہ نیچے رکھیں۔',
    officialHandoff: 'سرکاری حوالہ (دستی)',
    officialHandoffBody:
      'صاف اسپاٹ آپ کی طرف سے کچھ جمع نہیں کرتا۔ نیچے دیے گئے سرکاری لنکس استعمال کریں اور موصول ہوا حوالہ ریکارڈ کریں۔',
    getOfficialHelp: 'سuthra پنجاب شکایات کھولیں',
    call1139: '1139 پر کال کریں',
    copy: 'مختصر کاپی کریں',
    copied: 'کلپ بورڈ پر کاپی ہو گیا',
    print: 'طباعت',
    download: 'ڈاؤن لوڈ',
    back: 'ہاٹ اسپاٹ پر واپس',
    disclaimer:
      'صاف اسپاٹ ایک کمیونٹی ثبوت آلہ ہے، سرکاری سروس نہیں۔ حالتیں کمیونٹی ثبوت کی حالتیں ہیں، سرکاری سروس کی حالتیں نہیں۔',
    generatedAt: 'تیار شدہ',
    referenceLabel: 'آپ کا سرکاری شکایت کا حوالہ',
  },
  about: {
    title: 'صاف اسپاٹ کے بارے میں',
    what: 'صاف اسپاٹ کیا ہے؟',
    whatBody:
      'صاف اسپاٹ ایک چھوٹا کمیونٹی آلہ ہے جو ایک محلے یا اسکول کے قریبی عوامی علاقے میں بار بار آنے والے کچرے کے نقطوں کو ریکارڈ کرتا ہے۔ پڑوسی مشاہدے لاگ کرتے ہیں، قریبی یکساں قسم کی رپورٹس کو کیس میں جمع کرتے ہیں، اور صفائی کے بعد مسئلہ واپس آتا ہے یا نہیں دیکھتے ہیں۔',
    notGov: 'صاف اسپاٹ سرکاری سروس نہیں ہے',
    notGovBody:
      'صاف اسپاٹ ایک آزاد سول ٹیک پراجیکٹ ہے جو ہیکاتھون کے لیے بنا ہے۔ یہ کسی بھی حکومتی ادارے سے وابستہ، تسلیم شدہ، یا منسلک نہیں۔ یہ آپ کی طرف سے شکایات جمع نہیں کرتا اور نہ سرکاری حیثیت کا دعویٰ کرتا ہے۔',
    evidence: 'کمیونٹی ثبوت کی حدود',
    evidenceBody:
      'مشاہدات اور تصدیقات اس بات کی عکاسی کرتے ہیں جو کمیونٹی اراکین نے رپورٹ کرنا چنا۔ ان کی تصدیق انسپکٹرز سے نہیں ہوئی اور نہ یہ سرکاری ریکارڈ ہیں۔ انہیں صفائی حکام کے ساتھ مکالمے کے نقطہ آغاز کے طور پر استعمال کریں۔',
    privacy: 'رازداری',
    privacyBody:
      'صاف اسپاٹ آپ سے گھر کا پتہ، ای میل، یا فون نمبر کبھی نہیں مانگتا۔ یہ صرف ایک غیر شفاف، بے ترتیب شناخت محفوظ کرتا ہے جو ایک ہی آلے پر دوہری تصدیق روکنے کے لیے استعمال ہوتی ہے۔ تصویر اپ لوڈ کرتے وقت شناخت نہ ہونے والے چہرے شامل نہ کریں۔',
    how: 'یہ کیسے کام کرتا ہے',
    howSteps: [
      'عوامی جگہ پر بار بار آنے والا کچرے کا مسئلہ دیکھیں۔',
      'عوامی مقام کے لیبل اور تقریبی پن کے ساتھ مشاہدہ ریکارڈ کریں۔',
      'قریبی یکساں قسم کی رپورٹس تجویز کی جاتی ہیں — آپ موجودہ کیس میں شامل یا نیا شروع کرنا چنتے ہیں۔ رپورٹس کبھی خود بخود ضم نہیں ہوتیں۔',
      'پڑوسی کیس کی تصدیق کرتے ہیں اور وقت کے ساتھ اپنے مشاہدے شامل کرتے ہیں۔',
      'جب صفائی کا مشاہدہ ہو، اسے بتاریخ نوٹ یا تصویر کے ساتھ ریکارڈ کریں۔',
      'اگر مسئلہ واپس آئے، کیس دہراتا ہوا mark ہوتا ہے — تاریخ محفوظ رہتی ہے۔',
      'ایکشن مختصر تیار کریں اور اسے سرکاری صفائی چینلز کو دستی طور پر پیش کریں۔',
    ],
    credits: 'اسناد',
    creditsBody:
      'نیبرہڈ ہیکس 2026 کے لیے React، TypeScript، Vite، Tailwind CSS، Supabase، اور Leaflet/OpenStreetMap کے ساتھ بنا۔ نقشہ ڈیٹا © OpenStreetMap معاونین۔',
  },
  common: {
    loading: 'لوڈ ہو رہا ہے…',
    error: 'کچھ غلط ہو گیا۔',
    retry: 'دوبارہ کوشش کریں',
    close: 'بند کریں',
    cancel: 'منسوخ',
    back: 'واپس',
    demoMode: 'ڈیمو موڈ',
    demoModeHint:
      'بیک اینڈ کنفیگر نہیں۔ مقامی ڈیمو ڈیٹا دکھائی دے رہا ہے — کچھ محفوظ یا شیئر نہیں ہو رہا۔',
    liveMode: 'لائیو',
    language: 'زبان',
    footerNote:
      'صاف اسپاٹ ایک آزاد کمیونٹی آلہ ہے، سرکاری سروس نہیں۔ نقشہ © OpenStreetMap معاونین۔',
  },
};

export const dictionaries: Record<Lang, Dict> = { en, ur };
