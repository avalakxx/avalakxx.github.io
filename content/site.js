/* =====================================================================
   THE SELECT — весь контент сайта. Это ЕДИНСТВЕННЫЙ файл, который нужно править.

   1. src: ''            — пустой слот. Сайт рисует плейсхолдер с подписью slot/spec.
                           Положи файл в папку из комментария рядом (→ assets/...)
                           и впиши путь в src, например src: 'assets/img/cases/wpwp/cover.jpg'.
   2. [[TODO: ...]]      — заметка себе. На сайте показывается синим карандашом.
                           Замени весь фрагмент [[...]] на настоящий текст/цифру.
   3. Новый кейс         — скопируй любой объект из cases (например wpwp), задай ему
                           новый ключ и id, поправь track/side, затем добавь этот id
                           в массив tracks нужной стороны (work.sides[...].tracks).
   4. Видео              — у type: 'video' заполни и src (mp4), и poster (jpg).
   5. Строки в одинарных кавычках: апостроф внутри пиши как ’ или меняй кавычки на "...".
   Подробный чеклист: КАК-ЗАПОЛНИТЬ.md
   ===================================================================== */

window.SITE = {
  meta: {
    title: 'Klim Tertychnyi — AI Content Producer',
    description: 'AI content producer: images, video, voice and copy for social and ads, plus the automation that ships it. I set the brief. Machines shoot the takes. I pick the cut.',
    url: '',
    ogImage: 'assets/img/og.jpg',
    year: 2026
  },

  person: {
    name: 'Klim Tertychnyi',
    short: 'KT',
    role: 'AI Content Producer',
    location: 'Ukraine · Remote',
    status: 'Open to work',
    email: 'tertychnyiklim@gmail.com',
    telegram: { handle: '@Lingerieeeee', url: 'https://t.me/Lingerieeeee' },
    linkedin: { label: 'in/klim-tertychnyi-534a63379', url: 'https://www.linkedin.com/in/klim-tertychnyi-534a63379' },
    cv: 'assets/docs/Klim_Tertychnyi_CV.pdf',
    portrait: 'assets/img/portrait.webp',
    // Turnaround: the same portrait from three angles (same size, light, background).
    // Hero turns between them; the DIRECT THE SHOT toy lets the visitor pick one.
    // Missing angle → falls back to portrait.
    portraitAngles: {
      front: 'assets/img/portrait.webp',
      profile: 'assets/img/portrait-profile.webp', // faces screen-right; mirrored in code for "left"
      back: 'assets/img/portrait-back.webp'
    }
  },

  hero: {
    // Display line: the name. One row on desktop, two stacked rows on phones; fit to width.
    titleLines: ['KLIM', 'TERTYCHNYI'],
    role: 'AI Content Producer & Content Automation',
    level: '2 YRS COMMERCIAL GEN-AI · UKRAINE / REMOTE · OPEN TO WORK', // ' · ' splits the items
    sub: 'I make AI images, video and copy for social and ads, and build the pipelines that ship them: 2,000+ products automated, 40+ qualified B2B leads.',
    tagline: 'I set the brief. Machines shoot the takes. I pick the cut.', // pencil caption by the portrait
    ctaWork: 'See the work',
    ctaCv: 'CV',
    frameCaption: 'KT_PORTRAIT_017.RAW — TAKE 17 OF 36',
    // Frame caption per angle (hero turnaround). flippedCaption: the mirrored profile.
    takes: [
      { angle: 'front', caption: 'KT_PORTRAIT_017.RAW — TAKE 17 OF 36' },
      { angle: 'profile', caption: 'KT_PORTRAIT_018.RAW — TAKE 18 OF 36', flippedCaption: 'KT_PORTRAIT_018.FLIP — TAKE 18 OF 36' },
      { angle: 'back', caption: 'KT_PORTRAIT_019.RAW — TAKE 19 OF 36' }
    ],
    pencilNote: 'select'
  },

  stats: [
    { value: '2,000+', num: 2000, prefix: '', suffix: '+', label: 'products in a content pipeline I automated', frame: '01' },
    { value: '40+', num: 40, prefix: '', suffix: '+', label: 'qualified B2B leads from one campaign', frame: '02' },
    { value: '16M', num: 16, prefix: '', suffix: 'M', label: 'views on one Reel, 21M+ across the top three', frame: '03' },
    { value: '5,000+', num: 5000, prefix: '', suffix: '+', label: 'new Spotify listeners, zero ad budget', frame: '04' }
  ],

  about: {
    label: '02 — ABOUT ME',
    statement: 'Generating is the easy part. *Choosing* is the job.',
    body: [
      'I have worked hands-on with generative AI since 2023. For the last two years I have used it in commercial work for a web development agency, a record label and the vinyl shops Echo UA & Echo Hits: images, video, voice and copy for social media and ads.',
      'I also build the plumbing. I made the vinyl shops’ content pipeline from scratch, and I am now scripting the repetitive parts of my own video editing with Claude Code.'
    ],
    toy: {
      title: 'DIRECT THE SHOT',
      hint: 'Your turn. Re-brief the portrait.',
      modes: [
        { id: 'raw', label: 'RAW', prompt: '/portrait --raw --film tri-x-400' },
        { id: 'halftone', label: 'HALFTONE', prompt: '/portrait --print newsprint --dots 45lpi --ink black' },
        { id: 'ascii', label: 'ASCII', prompt: '/portrait --render text --charset " .:-=+*#%@" --cols 120' },
        { id: 'blueprint', label: 'BLUEPRINT', prompt: '/portrait --style blueprint --grid 8px --annotate "do not crop"' },
        { id: 'threshold', label: 'THRESHOLD', prompt: '/portrait --contrast max --levels 2 --no-mercy' },
        { id: 'pixel', label: 'PIXEL', prompt: '/portrait --downscale 48px --palette 4 --nearest' }
      ],
      // ANGLE control: picks the source photo (person.portraitAngles). 'default' is pre-selected.
      angleLabel: 'ANGLE',
      angleDefault: 'profile',
      angles: [
        { id: 'front', label: 'FRONT' },
        { id: 'profile', label: 'PROFILE' },
        { id: 'back', label: 'BACK' }
      ]
    }
  },

  work: {
    label: '01 — THE RECORD', // mono caption (the metaphor); title = the plain heading
    title: 'Selected work',
    intro: 'Work is sorted like a record. Side A is commercial: leads, listings, workflow. Side B is music and culture, from the indie label I co-run. Same method on both sides.',
    sides: [
      { id: 'A', name: 'SIDE A', title: 'Commercial work', note: 'Work that had to earn its keep: leads and listings.', theme: 'paper', tracks: ['wpwp', 'vinyl'] },
      { id: 'B', name: 'SIDE B', title: 'Music & culture', note: 'Records, covers and a meme page with 21M+ views. Taste is the whole brief.', theme: 'film', tracks: ['garbagefunk', 'tilkytak'] }
    ]
  },

  cases: {

    /* ---------------------------------------------------------------- A1 */
    wpwp: {
      id: 'wpwp', track: 'A1', side: 'A',
      title: 'Leads on an AI-first content stack',
      client: 'wpwp.bz', clientNote: 'WordPress & WooCommerce development agency',
      oneLiner: 'An ad campaign of three fixed-price offer Reels that brought a web agency 40+ qualified B2B leads from small and medium businesses in about three weeks.',
      year: '2025–26',
      role: 'Marketing & AI Content Creator (SMM)',
      // home track card: ROLE · role · team · period
      card: { role: 'Junior Designer → Marketing & AI Content (SMM)', team: 'with 1 colleague on paid Meta', period: '2025–26' },
      tags: ['B2B', 'LEAD GEN', 'AI VIDEO', 'SMM'],
      tools: ['ElevenLabs', 'Claude', 'Higgsfield', 'Leonardo AI'],
      result: { value: '40+', label: 'qualified B2B leads' },
      cover: { type: 'image', src: 'assets/img/cases/wpwp/cover.webp', poster: '', alt: 'Fixed-price offer creatives for wpwp.bz, the $150 landing circled in blue pencil', ratio: '16/10', slot: 'Case cover: the single best-looking ad creative from the lead-gen campaign, clean export without platform UI', spec: 'JPG/WebP 2400×1500, ≤400 KB' },
      blocks: [
        {
          type: 'text', label: 'THE BRIEF', heading: 'A dev agency needs leads, not likes.',
          body: [
            'wpwp.bz builds WordPress and WooCommerce sites. The ask: find clients among small and medium businesses, not collect likes.',
            'I made the creatives for the agency’s fixed-price offers and ran its organic social media end to end.'
          ]
        },
        {
          type: 'media', size: 'half',
          media: { type: 'video', src: 'assets/video/wpwp/landing-150.mp4', poster: 'assets/img/cases/wpwp/landing-150-poster.jpg', alt: 'Voiced vertical video: a turnkey landing page for $150 in two days', ratio: '9/16', slot: '', spec: '' },
          caption: 'The $150 landing page video, the creative that worked best. The fixed price and the 2-day deadline are in the first frame, then four steps (brief, design, development, launch) and everything that is included. Voiced with ElevenLabs.'
        },
        {
          type: 'gallery', label: 'THE OFFER', columns: 3,
          caption: 'The three-slide carousel for the $150 landing page offer.',
          items: [
            { type: 'image', src: 'assets/img/cases/wpwp/offer-150-1.webp', poster: '', alt: 'Carousel slide 1: landing page for $150, launch in 2 days', ratio: '4/5', slot: '', spec: '' },
            { type: 'image', src: 'assets/img/cases/wpwp/offer-150-2.webp', poster: '', alt: 'Carousel slide 2: fixed price, everything included', ratio: '4/5', slot: '', spec: '' },
            { type: 'image', src: 'assets/img/cases/wpwp/offer-150-3.webp', poster: '', alt: 'Carousel slide 3: what the $150 includes', ratio: '4/5', slot: '', spec: '' }
          ]
        },
        {
          type: 'prompt', label: 'PROMPT RECEIPT', tool: 'ElevenLabs',
          prompt: "(translated from Ukrainian)\nA turnkey landing page for $150 and in two days. It looks expensive and works for your business. And that is no compromise. We have a proven process: brief, design, development, launch. Custom design, SEO + AI search and copy are already included. The price is fixed: $150, full stop. Leave a request: the consultation is free.",
          note: 'Voice: Ukrainian, female, energetic. The script is timed to the on-screen steps.',
          output: { type: 'image', src: 'assets/img/cases/wpwp/landing-150-poster.jpg', poster: '', alt: 'The finished $150 video, first frame', ratio: '9/16', slot: '', spec: '' }
        },
        {
          type: 'takes', label: 'TAKES & SELECT', selected: 1,
          note: 'Three fixed-price offers went out as full creative packs. The $150 landing did the most work.',
          items: [
            { type: 'image', src: 'assets/img/cases/wpwp/offer-150-cover.webp', poster: '', alt: 'Video cover: $150 landing page', ratio: '9/16', slot: '', spec: '' },
            { type: 'image', src: 'assets/img/cases/wpwp/offer-300-cover.webp', poster: '', alt: 'Video cover: $300 multi-page site', ratio: '9/16', slot: '', spec: '' },
            { type: 'image', src: 'assets/img/cases/wpwp/offer-450-cover.webp', poster: '', alt: 'Video cover: $450 online store', ratio: '9/16', slot: '', spec: '' }
          ]
        },
        {
          type: 'gallery', label: 'THE FEED', columns: 3,
          caption: 'The Black Friday series for WooCommerce store owners, in English and Ukrainian, on Instagram and LinkedIn: nine-slide carousels mixing animated and static slides, with links to a free 10-second store check as the lead magnet. The agency’s Instagram is instagram.com/wpwp_bz, and its 15 most recent posts are my creatives.',
          items: [
            { type: 'image', src: 'assets/img/cases/wpwp/feed-01.webp', poster: '', alt: "Black Friday slide: checkout is built live for every order", ratio: '4/5', slot: '', spec: '' },
            { type: 'image', src: 'assets/img/cases/wpwp/feed-02.webp', poster: '', alt: "Black Friday slide: a great speed-test score for the wrong visitor", ratio: '4/5', slot: '', spec: '' },
            { type: 'image', src: 'assets/img/cases/wpwp/feed-03.webp', poster: '', alt: "Black Friday slide: weekend sales divided by 36 equal one peak hour", ratio: '4/5', slot: '', spec: '' },
            { type: 'image', src: 'assets/img/cases/wpwp/feed-04.webp', poster: '', alt: "Black Friday slide: your checkout becomes a card checker", ratio: '4/5', slot: '', spec: '' },
            { type: 'image', src: 'assets/img/cases/wpwp/feed-05.webp', poster: '', alt: "Black Friday slide: is it the host or the store", ratio: '4/5', slot: '', spec: '' },
            { type: 'image', src: 'assets/img/cases/wpwp/feed-06.webp', poster: '', alt: "Black Friday slide: PHP 8.2 gets its last fix on 31 December", ratio: '4/5', slot: '', spec: '' }
          ]
        },
        {
          type: 'text', label: 'THE CAMPAIGN', heading: 'Fixed prices for small and medium businesses.',
          body: [
            'The agency’s last ad campaign was three Reels, one per fixed-price offer: a landing page for $150, a multi-page site for $300 and an online store for $450, aimed at small and medium businesses. I made the creatives; the paid placement on Meta was run by a colleague.',
            'Within about three weeks of launch the campaign brought 40+ qualified leads, and it kept bringing them in after I left the agency. The $150 landing Reel did the most work. A lead counted as qualified only once it reached a call and the agency took the request on. Alongside, I ran the agency’s organic feed, including the bilingual Black Friday series.'
          ]
        },
        {
          type: 'metrics', label: 'RESULT', items: [{ value: '40+', label: 'qualified B2B leads' }, { value: '3', label: 'offer Reels in the campaign' }, { value: '~12', label: 'bilingual posts in about 4 days (Black Friday series)' }, { value: '2', label: 'languages, EN + UA' }] },
        {
          type: 'credits',
          items: [
            { k: 'Role', v: 'Junior Designer → Marketing & AI Content Creator (SMM)' },
            { k: 'Client', v: 'wpwp.bz, WordPress & WooCommerce development agency' },
            { k: 'Period', v: 'Sep 2025 – Oct 2026' },
            { k: 'Tools', v: 'ElevenLabs, Claude, Higgsfield, Leonardo AI' },
            { k: 'Instagram', v: 'instagram.com/wpwp_bz — the latest 15 posts are mine' }
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- A2 */
    vinyl: {
      id: 'vinyl', track: 'A2', side: 'A',
      title: '2,000 listings, zero copy-paste',
      client: 'Echo UA & Echo Hits', clientNote: 'Vinyl shops on the Prom.ua marketplace',
      oneLiner: 'The shops’ first content system: from a photo of the record to a live Prom.ua card, for 2,000+ products.',
      year: '2024–now',
      role: 'Content Automation Specialist (part-time)',
      card: { role: 'Content Automation', team: 'solo · part-time', period: '2024–now' },
      tags: ['AUTOMATION', 'E-COMMERCE', 'PROM.UA', 'LLM'],
      tools: ['Claude Code', 'Claude API', 'Python', 'n8n', 'Telegram bot', 'GitHub Pages'],
      result: { value: '2,000+', label: 'products in the pipeline' },
      cover: { type: 'image', src: 'assets/img/cases/vinyl/cover.webp', poster: '', alt: 'A wall of Echo Hits product cards on Prom.ua, one circled in blue pencil', ratio: '16/10', slot: '', spec: '' },
      blocks: [
        {
          type: 'text', label: 'THE BRIEF', heading: 'Thousands of records, one person, one afternoon.',
          body: [
            'Echo UA and Echo Hits, the vinyl-only shop, sell on the Prom.ua marketplace. Every record needs a full product card in two languages, Ukrainian and Russian: title, characteristics, description, tracklist, photos. All of it was done by hand.',
            'There was no content automation at all. I built the shops’ first system from scratch, part-time, from March 2024.'
          ]
        },
        {
          type: 'beforeAfter', label: 'SAME CARD, BEFORE / AFTER',
          before: {
            title: 'By hand',
            points: ['Title: “Coil – Swanyard (CD)”', '4 characteristic fields', 'A one-line description', 'About 10–15 minutes per card by hand. One feed run now ships 50–100 records in about 15 minutes'],
            media: { type: 'image', src: 'assets/img/cases/vinyl/card-before.webp', poster: '', alt: 'The Prom.ua product card before: short title, four fields, one-line description', ratio: '900/1078', slot: '', spec: '' }
          },
          after: {
            title: 'Through the pipeline',
            points: ['Title: “Coil – Swanyard (2CD, Reissue)”', '8 characteristic fields', 'Three paragraphs of description plus the full tracklist'],
            media: { type: 'image', src: 'assets/img/cases/vinyl/card-after.webp', poster: '', alt: 'The same card after: full title, eight fields, three-paragraph description and tracklist', ratio: '900/1078', slot: '', spec: '' }
          }
        },
        {
          type: 'pipeline', label: 'THE PIPELINE',
          steps: [
            { name: 'INTAKE', tool: 'Photo + Balka Book / Discogs', desc: 'I photograph new arrivals and find each release on Balka Book, a Ukrainian distributor catalogue, or on Discogs if it is not there. The links go into a release list, and new items are checked against a catalogue snapshot (barcode and artist – album) to avoid duplicates.' },
            { name: 'GENERATE', tool: 'Python + Claude API', desc: 'A script built with Claude Code pulls release data and images from the source. Claude writes the card in Ukrainian and Russian: the title in one fixed template, characteristics, description, tracklist.' },
            { name: 'FEED', tool: 'Python + GitHub Pages', desc: 'The script builds a YML/XML product feed and hosts it on GitHub Pages.' },
            { name: 'APPROVE', tool: 'n8n + Telegram', desc: 'One run takes about 10–15 minutes: n8n executes the generator, builds the feed and sends a report to the Telegram bot. The feed goes live only after I tap Approve.' },
            { name: 'PUBLISH', tool: 'Prom.ua', desc: 'Once approved, Prom.ua imports the feed by URL and pulls the photos itself.' }
          ],
          media: { type: 'image', src: 'assets/img/cases/vinyl/n8n-workflow.webp', poster: '', alt: 'The n8n workflow behind one feed run', ratio: '1440/700', slot: '', spec: '' }
        },
        {
          type: 'prompt', label: 'PROMPT RECEIPT', tool: 'Claude Sonnet via API (prompt translated from Ukrainian)',
          prompt: `You are a copywriter for the Echo UA online shop, which sells vintage audio cassettes, CDs and vinyl on Prom.ua.
From the data below, create the content for a product card.

RELEASE DATA:
Title: {title}
Artist: {artist}
Label: {label}
(…)

IMPORTANT: DESCRIPTION FORMAT (mandatory, this is the shop's strict standard):
- The description is HTML, NOT plain text. Always use <p>...</p> tags
  for EVERY paragraph (at least 2, at most 4 paragraphs) - there must be
  real spacing between paragraphs, not just a line break.
- The first line is bold, in the format: <p><b>{media_adjective} {media_label} ({media_paren})</b></p>
- Then come the paragraphs: context of the release and the artist, the
  style/genre, the quality of the edition/mastering.
- Do NOT write paragraphs about rarity, value to collectors, "a rare
  find" or similar wording about limited availability - Prom.ua
  blocks such content under its listing rules.
- Write vividly, in a marketing style (as for collectors of vintage media),
  without bureaucratic phrasing and without invented facts that are not in the data above.

Reply STRICTLY in JSON (no text outside the JSON, no \`\`\`), with the keys:
{
  "title_ua": "the item title in Ukrainian",
  "title_ru": "the item title in Russian (or in the original language, if Ukrainian would be unusual)",
  "description_ua": "the description in Ukrainian as HTML with <p> tags, following the rules above, and at the end the full tracklist: {tracklist_style}",
  "description_ru": "the same description in the other language (for the field without the _ua suffix), also HTML with <p> tags + the same tracklist",
  "genre_field": "Rock/Folk/Pop/etc.",
  "artist_cyrillic": "if the artist's name is written in Latin letters, give its Cyrillic transliteration in Ukrainian (e.g. 'Gogol Bordello' -> 'Гоголь Борделло'); if the name is already in Cyrillic, leave an empty string",
  "edition_features": "if the notes mention a limited/numbered run or other edition features, describe them briefly in Ukrainian (e.g. 'Hand-numbered pressing'); if there is nothing like that, leave an empty string"
}`,
          note: 'Up to 3 retries if the model returns broken JSON. What it fills in for every card: the title by one template, Ukrainian and Russian text, characteristics, description, tracklist, front and back photos of the sleeve, and a barcode verified against the record itself.',
          output: { type: 'image', src: 'assets/img/cases/vinyl/card-after.webp', poster: '', alt: 'The Prom.ua card this prompt produced', ratio: '900/1078', slot: '', spec: '' }
        },
        {
          type: 'media', label: 'ON THE SHELF', size: 'wide',
          media: { type: 'image', src: 'assets/img/cases/vinyl/shelf.webp', poster: '', alt: 'The Echo Hits shop page on Prom.ua: shop header and the first two rows of products', ratio: '1114/1078', slot: '', spec: '' },
          caption: 'The Echo Hits shop on Prom.ua.'
        },
        {
          type: 'text', label: 'THE HARD PART', heading: 'Barcodes, bootlegs and duplicates.',
          body: [
            'Source data cannot be trusted blindly. A barcode copied from a catalogue can be wrong, so the code reads it from my own photo of the record. Unofficial releases exist in many versions, so for those the card claims only “Vinyl”, with no colour and no disc count, and shows just the front and back of the sleeve. Every card carries both sides of the sleeve.',
            'Duplicates are caught before generation, against the catalogue snapshot. And a human stays in the loop: every run ends with a report in Telegram, and the feed goes live only after I tap Approve.'
          ]
        },
        { type: 'metrics', label: 'RESULT', items: [{ value: '2,000+', label: 'products through the pipeline' }, { value: '50–100', label: 'records in one ~15-minute feed run; by hand, 10–15 minutes per card' }, { value: '330–500', label: 'hours of manual work saved (est., 2,000 cards × 10–15 min)' }, { value: '4 → 8', label: 'characteristic fields per card' }] },
        {
          type: 'credits',
          items: [
            { k: 'Role', v: 'Content Automation Specialist, part-time' },
            { k: 'Client', v: 'Echo UA & Echo Hits, vinyl shops on Prom.ua' },
            { k: 'Period', v: 'Mar 2024 – present' },
            { k: 'Tools', v: 'Claude Code, Claude API, Python, n8n, Telegram bot, GitHub Pages' }
          ]
        }
      ]
    },

    /* ------------------------------------------------ A3 (снят с сайта: hidden) */
    autoedit: {
      hidden: true,
      id: 'autoedit', track: 'A3', side: 'A',
      title: 'The edit that edits itself',
      client: 'Own workflow', clientNote: 'A lab case: video editing run through Claude Code',
      oneLiner: 'My video editing is automated with Claude Code: I write the brief, the machine assembles the cut, I review it.',
      year: '[[TODO: since when]]',
      role: 'Producer and reviewer',
      tags: ['CLAUDE CODE', 'VIDEO', 'AUTOMATION'],
      tools: ['Claude Code'],
      result: { value: '[[TODO]]', label: 'e.g. hours saved per video' },
      cover: { type: 'video', src: '', /* → assets/video/autoedit/cover.mp4 | poster assets/img/cases/autoedit/cover-poster.jpg */ poster: '', alt: 'Cover for the automated edit case', ratio: '16/10', slot: 'Case cover: a screen recording of Claude Code assembling a cut, 6–10 s loop', spec: 'MP4 H.264 1600×1000, ≤8 MB + poster JPG' },
      blocks: [
        {
          type: 'text', label: 'THE BRIEF', heading: 'Editing is mostly decisions. Decisions can be briefed.',
          body: [
            'Short-form video needs a lot of cutting: trims, pacing, captions, formats. Most of it is rules. The taste part is knowing which cut is right.',
            'So I wrote the rules down. I give Claude Code a brief, it assembles the edit, and I review the cut and send notes.'
          ]
        },
        {
          type: 'pipeline', label: 'THE PIPELINE',
          steps: [
            { name: 'BRIEF', tool: 'Claude Code', desc: 'I describe the piece: length, mood, structure. [[TODO: in what format — a text file, a template?]]' },
            { name: 'ASSEMBLE', tool: 'Claude Code', desc: 'The machine builds the edit from the source clips. [[TODO: what it runs under the hood — ffmpeg, scripts?]]' },
            { name: 'CUT', tool: 'Claude Code', desc: 'A first full cut comes back. [[TODO: how long it takes]]' },
            { name: 'REVIEW', tool: 'Me', desc: 'I watch it, pick what stays, send notes, and run it again.' }
          ],
          media: { type: 'image', src: '', /* → assets/img/cases/autoedit/terminal.png */ poster: '', alt: 'Claude Code session screenshot', ratio: '16/9', slot: 'Screenshot of a real Claude Code session producing an edit (hide private paths)', spec: 'PNG/WebP 2400×1350, ≤400 KB' }
        },
        {
          type: 'beforeAfter', label: 'BEFORE / AFTER',
          before: {
            title: 'Manual edit',
            points: ['Every trim and caption by hand', 'Same steps repeated for every video', '[[TODO: time per video, before]]'],
            media: { type: 'image', src: '', /* → assets/img/cases/autoedit/before-timeline.jpg */ poster: '', alt: 'Manual editing timeline', ratio: '4/3', slot: 'Screenshot of a classic editing timeline you used to work in', spec: 'JPG/WebP 1600×1200, ≤300 KB' }
          },
          after: {
            title: 'Briefed edit',
            points: ['I write the brief, the machine assembles', 'I review the cut and send notes', '[[TODO: time per video, after]]'],
            media: { type: 'image', src: '', /* → assets/img/cases/autoedit/after-brief.jpg */ poster: '', alt: 'Brief and cut', ratio: '4/3', slot: 'Screenshot of a brief file next to the resulting cut', spec: 'JPG/WebP 1600×1200, ≤300 KB' }
          }
        },
        {
          type: 'media', size: 'wide',
          media: { type: 'video', src: '', /* → assets/video/autoedit/raw-vs-final.mp4 | poster assets/img/cases/autoedit/raw-vs-final-poster.jpg */ poster: '', alt: 'Raw footage versus the final cut', ratio: '16/9', slot: 'Split-screen video: raw clips on the left, the finished cut on the right, 8–10 s', spec: 'MP4 H.264 1920×1080, ≤8 MB + poster JPG' },
          caption: 'Raw on the left, final on the right. [[TODO: which project this is]]'
        },
        {
          type: 'prompt', label: 'PROMPT RECEIPT', tool: 'Claude Code',
          prompt: '[[TODO: paste a real brief you gave Claude Code for an edit]]', takes: '[[TODO: N rounds of notes]]',
          note: 'The brief is the product. [[TODO: what you learned about writing a good one]]',
          output: { type: 'video', src: '', /* → assets/video/autoedit/prompt-output.mp4 | poster assets/img/cases/autoedit/prompt-output-poster.jpg */ poster: '', alt: 'The edit this brief produced', ratio: '9/16', slot: 'The finished edit produced from exactly this brief, 10–15 s', spec: 'MP4 H.264 1080×1920, ≤8 MB + poster JPG' }
        },
        { type: 'metrics', label: 'RESULT', items: [{ value: '[[TODO]]', label: 'hours saved per video' }, { value: '[[TODO]]', label: 'videos cut this way so far' }] },
        {
          type: 'credits',
          items: [
            { k: 'Role', v: 'Producer and reviewer' },
            { k: 'Type', v: 'Own workflow, lab case' },
            { k: 'Tools', v: 'Claude Code' }
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- B1 */
    garbagefunk: {
      id: 'garbagefunk', track: 'B1', side: 'B',
      title: '10+ albums and one Reel that hit 16M',
      client: 'GARBAGEFUNK', clientNote: 'Indie music project and label, co-founded in 2022',
      oneLiner: 'Co-founder of an indie label: 10+ albums by different artists, the visual identity, Reels for the label’s meme page with 21M+ views across the top three, and 5,000+ new Spotify listeners (per Spotify for Artists) won with zero ad budget.',
      year: '2022–now',
      role: 'Co-founder, Music & Visual Direction',
      card: { role: 'Co-founder', team: '2 founders', period: '2022–now' },
      tags: ['MUSIC', 'LABEL', 'MEME MARKETING', 'VISUAL IDENTITY'],
      tools: ['AI image generation', 'Figma'],
      result: { value: '16M', label: 'views on one Reel' },
      cover: { type: 'image', src: 'assets/img/cases/garbagefunk/cover.webp', poster: '', alt: 'Four GARBAGEFUNK release covers in a row on black', ratio: '16/10', slot: 'Case cover: a collage of GARBAGEFUNK album covers on a dark background, or the label logo in use', spec: 'JPG/WebP 2400×1500, ≤400 KB' },
      blocks: [
        {
          type: 'text', label: 'THE BRIEF', heading: 'A label is a sound and a look. I made both.',
          body: [
            'GARBAGEFUNK is an indie music project and label. I co-founded it in 2022 and co-created the music and the label’s visual identity.',
            'It has released 10+ albums by different artists; the main ones are Soundsystem, Wngs and Trashcanz. It earns through streaming, YouTube and commissions from a US client: several thousand dollars in revenue so far.'
          ]
        },
        {
          type: 'gallery', label: 'THE COVERS', columns: 3,
          caption: 'Album artwork and identity for the label’s releases. Every cover here is mine.',
          items: [
            { type: 'image', src: 'assets/img/cases/garbagefunk/covers/01.webp', poster: '', alt: 'Soundsystem — Triathlon, EP cover (2025)', ratio: '1/1', caption: 'Soundsystem — Triathlon', slot: 'Album cover 1: a favourite release, square, no streaming UI', spec: 'JPG/WebP 1600×1600, ≤300 KB' },
            { type: 'image', src: 'assets/img/cases/garbagefunk/covers/02.webp', poster: '', alt: 'Soundsystem — LowKeyJazz, album cover with two drawn portraits', ratio: '1/1', caption: 'Soundsystem — LowKeyJazz', slot: 'Album cover 2: a release with a very different look', spec: 'JPG/WebP 1600×1600, ≤300 KB' },
            { type: 'image', src: 'assets/img/cases/garbagefunk/covers/03.webp', poster: '', alt: 'Wngs — Pegasus, EP cover (2026)', ratio: '1/1', caption: 'Wngs — Pegasus', slot: 'Album cover 3: a release that shows the label’s identity', spec: 'JPG/WebP 1600×1600, ≤300 KB' },
            { type: 'image', src: 'assets/img/cases/garbagefunk/covers/04.webp', poster: '', alt: 'Soundsystem — Keep Your Soul Clean, And Your Boots Dirty, album cover (2024): line drawing of a horse', ratio: '1/1', caption: 'Soundsystem — Keep Your Soul Clean, And Your Boots Dirty', slot: 'Album cover 4: an AI-generated cover', spec: 'JPG/WebP 1600×1600, ≤300 KB' },
            { type: 'image', src: 'assets/img/cases/garbagefunk/covers/05.webp', poster: '', alt: 'Trashcanz — Spreengsteen Fields / Plasticine Laundry, single cover (2025): night photo of grass', ratio: '1/1', caption: 'Trashcanz — Spreengsteen Fields / Plasticine Laundry', slot: 'Album cover 5: a release by a different artist', spec: 'JPG/WebP 1600×1600, ≤300 KB' },
            { type: 'image', src: 'assets/img/cases/garbagefunk/covers/06.webp', poster: '', alt: 'The GARBAGEFUNK wordmark', ratio: '1/1', caption: 'Label wordmark', slot: 'Album cover 6: the label logo or a merch mock-up', spec: 'JPG/WebP 1600×1600, ≤300 KB' }
          ]
        },
        {
          type: 'gallery', label: 'THE FACES', columns: 2,
          caption: 'A poster for Wngs, one of the label’s main artists, and the two of us who founded the label and do everything in it together.',
          items: [
            { type: 'image', src: 'assets/img/cases/garbagefunk/identity/wngs-poster.webp', poster: '', alt: 'Wngs release poster: two men in suits, black and white', ratio: '4/5', caption: 'Wngs — poster', slot: 'Artist poster, vertical', spec: 'JPG/WebP 1080×1350, ≤350 KB' },
            { type: 'image', src: 'assets/img/cases/garbagefunk/identity/founders.webp', poster: '', alt: 'The two GARBAGEFUNK co-founders, black and white', ratio: '4/5', caption: 'The founders', slot: 'Photo of the label founders', spec: 'JPG/WebP 900×1200, ≤200 KB' }
          ]
        },
        {
          type: 'gallery', label: 'THE MEME PAGE', columns: 3,
          caption: 'The top three Reels I made for the label’s meme page, @garbagefunkshitpost on Instagram, all set to Soundsystem’s music: 21M+ views together. The top one reached 16M in about a month.',
          items: [
            { type: 'video', src: 'assets/video/garbagefunk/reel-16m.mp4', poster: 'assets/img/cases/garbagefunk/reel-16m-poster.jpg', alt: 'The top Reel, 16M views', ratio: '9/16', caption: '16M views', slot: 'Reel 1 of 3: the top one, 16M views. Original export, no app UI', spec: 'MP4 H.264 1080×1920, ≤8 MB + poster JPG' },
            { type: 'video', src: 'assets/video/garbagefunk/reel-3m.mp4', poster: 'assets/img/cases/garbagefunk/reel-3m-poster.jpg', alt: 'Second Reel, 3M views', ratio: '9/16', caption: '3M views', slot: 'Reel 2 of 3: 3M views. Original export, no app UI', spec: 'MP4 H.264 1080×1920, ≤8 MB + poster JPG' },
            { type: 'video', src: 'assets/video/garbagefunk/reel-2m.mp4', poster: 'assets/img/cases/garbagefunk/reel-2m-poster.jpg', alt: 'Third Reel, 2M views', ratio: '9/16', caption: '2M views', slot: 'Reel 3 of 3: 2M views. Original export, no app UI', spec: 'MP4 H.264 1080×1920, ≤8 MB + poster JPG' }
          ]
        },
        {
          type: 'text', label: 'THE CAMPAIGN', heading: '21M+ views turned into 5,000+ listeners.',
          body: [
            'The meme page was the promo campaign for Soundsystem: every Reel was set to their music. Zero ad budget, just memes and editing.',
            'In about two months it brought the project 5,000+ new listeners (listener growth in Spotify for Artists) and became the best advertising the project ever had. The track I was promoting then, Soundsystem — Slightly’Changed, now has 140,000 streams on Spotify.'
          ]
        },
        {
          type: 'takes', label: 'ONE TAKE', itemLabel: 'Layer', selected: 4,
          note: 'No alternates here: the AI generation for Soundsystem’s Triathlon landed on the first try. Everything after it was finishing in Figma. Below, the final cover taken apart into its layers: the take, the type zones, the type, the release.',
          items: [
            { type: 'image', src: 'assets/img/cases/garbagefunk/takes/01.webp', poster: '', alt: 'Triathlon artwork without type: the raw AI take', ratio: '1/1', slot: 'Layer 1 of 4: the raw take', spec: 'WebP 1200×1200' },
            { type: 'image', src: 'assets/img/cases/garbagefunk/takes/02.webp', poster: '', alt: 'Triathlon artwork with the type zones marked in blue', ratio: '1/1', slot: 'Layer 2 of 4: the type zones', spec: 'WebP 1200×1200' },
            { type: 'image', src: 'assets/img/cases/garbagefunk/takes/03.webp', poster: '', alt: 'The Triathlon type layer on its own', ratio: '1/1', slot: 'Layer 3 of 4: the type', spec: 'WebP 1200×1200' },
            { type: 'image', src: 'assets/img/cases/garbagefunk/takes/04.webp', poster: '', alt: 'Final Triathlon cover as released', ratio: '1/1', slot: 'Layer 4 of 4: the release', spec: 'WebP 1200×1200' }
          ]
        },
        {
          type: 'metrics', label: 'RESULT',
          items: [{ value: '16M', label: 'views on the top Reel, 21M+ across the top three' }, { value: '5,000+', label: 'new Spotify listeners (Spotify for Artists), zero ad budget' }, { value: '10+', label: 'albums released' }, { value: '140K', label: 'Spotify streams on Soundsystem — Slightly’Changed, the track the campaign promoted' }]
        },
        {
          type: 'credits',
          items: [
            { k: 'Role', v: 'Co-founder, Music & Visual Direction' },
            { k: 'Project', v: 'GARBAGEFUNK, indie music project and label' },
            { k: 'Period', v: '2022 – present' },
            { k: 'Tools', v: 'AI image generation, Figma' },
            { k: 'Meme page', v: 'instagram.com/garbagefunkshitpost' }
          ]
        }
      ]
    },

    /* ---------------------------------------------------------------- B2 */
    tilkytak: {
      id: 'tilkytak', track: 'B2', side: 'B',
      title: 'A gift certificate, built for the print shop',
      client: 'TILKYTAK Records (ТІЛЬКИТАК)', clientNote: 'Record label',
      oneLiner: 'A 3,000 UAH gift certificate for a record label: designed from the label’s own identity with Claude Code, then taken through 13 versions to a print-ready CMYK file.',
      year: '2026',
      role: 'Designer (AI-assisted), part-time',
      card: { role: 'Design', team: 'solo', period: '2026' },
      tags: ['DESIGN', 'PRINT', 'CLAUDE CODE'],
      tools: ['Claude Code', 'Higgsfield'],
      result: { value: '13', label: 'versions to the print-ready file' },
      cover: { type: 'image', src: 'assets/img/cases/tilkytak/cover.webp', poster: '', alt: 'TILKYTAK gift certificate, front and back, in a mockup scene', ratio: '16/10', slot: '', spec: '' },
      blocks: [
        {
          type: 'text', label: 'THE BRIEF', heading: 'Pretty is not the same as printable.',
          body: [
            'TILKYTAK Records, a record label, needed a gift certificate worth 3,000 UAH: A6 landscape, 148×105 mm, two sides, built from the identity of the label’s own site: its fonts, its colours, its grid. The QR code and the promo code were not ready yet, so the first version left white placeholders for both.',
            'I art-directed and iterated the design in Claude Code, then had it converted to a print-ready CMYK PDF with bleed and outlined text. The mockup imagery came from Higgsfield. This is one small project: since March 2024 I have taken on design tasks alongside the label’s main designer, from release covers to preparing artists’ artwork for production.'
          ]
        },
        {
          type: 'prompt', label: 'PROMPT RECEIPT', tool: 'Claude Code',
          prompt: 'We need to design a gift certificate for TILKYTAK Records.\n\nI’ve attached two photos, a reference for roughly how the certificate should look by STRUCTURE. Don’t look at the aesthetics.\n\nAs for the design:\n\nHere is their site https://tt-records.com.ua/. Take elements of their identity from it, and I’m attaching the logo.\nTake their identity and make a 3,000 UAH certificate from it.\nTake their fonts from the site.\nWhere the QR code should go, just leave a white square, same for the promo code. They’re not ready yet, we’ll insert them later.\n\nA6 300dpi\n1748x1240\n\n(translated from Russian)',
          takes: '13',
          note: 'The first message of the session, with the logo and two structure references attached. Thirteen versions later, it was print-ready.',
          output: { type: 'image', src: 'assets/img/cases/tilkytak/certificate-front.webp', poster: '', alt: 'The final certificate front: black and white record photo, ₴3000 in a gradient block, GIFT CARD in a stepped grid', ratio: '1748/1240', slot: '', spec: '' }
        },
        {
          type: 'takes', label: 'TAKES & SELECT', selected: 6,
          note: 'Six of the 13 versions, front side only. It began as a red label on a black record, moved to a real record photo from the label’s site with the gradient inside the label, then the gradient went into the amount block. I asked for that block shorter, then bigger again, and finally for a different photo: records and a turntable. After version 7 only the back changed.',
          items: [
            { type: 'image', src: 'assets/img/cases/tilkytak/takes/01.webp', poster: '', alt: 'Version 1: red record label on black', ratio: '1748/1240', slot: '', spec: '' },
            { type: 'image', src: 'assets/img/cases/tilkytak/takes/02.webp', poster: '', alt: 'Version 2: record photo with a gradient label', ratio: '1748/1240', slot: '', spec: '' },
            { type: 'image', src: 'assets/img/cases/tilkytak/takes/03.webp', poster: '', alt: 'Version 3: gradient moved into the amount block', ratio: '1748/1240', slot: '', spec: '' },
            { type: 'image', src: 'assets/img/cases/tilkytak/takes/04.webp', poster: '', alt: 'Version 5: shorter amount block', ratio: '1748/1240', slot: '', spec: '' },
            { type: 'image', src: 'assets/img/cases/tilkytak/takes/05.webp', poster: '', alt: 'Version 6: large amount block with centred digits', ratio: '1748/1240', slot: '', spec: '' },
            { type: 'image', src: 'assets/img/cases/tilkytak/takes/06.webp', poster: '', alt: 'Version 7 (selected): records and a turntable', ratio: '1748/1240', slot: '', spec: '' }
          ]
        },
        {
          type: 'gallery', label: 'THE CERTIFICATE', columns: 2,
          caption: 'Final front and back, version 13. The back carries the terms and a promo code; the QR code was dropped at the client’s request.',
          items: [
            { type: 'image', src: 'assets/img/cases/tilkytak/certificate-front.webp', poster: '', alt: 'Final certificate, front', ratio: '1748/1240', slot: '', spec: '', caption: 'Front' },
            { type: 'image', src: 'assets/img/cases/tilkytak/certificate-back.webp', poster: '', alt: 'Final certificate, back: title, promo code field, terms, logo and pulse line', ratio: '1748/1240', slot: '', spec: '', caption: 'Back' }
          ]
        },
        {
          type: 'media', label: 'MOCKUP', size: 'wide',
          caption: 'The final certificate in a mockup scene, front and back.',
          media: { type: 'image', src: 'assets/img/cases/tilkytak/mockup.webp', poster: '', alt: 'Mockup: the certificate front and back floating over soft gradient ribbons', ratio: '3/2', slot: '', spec: '' }
        },
        {
          type: 'beforeAfter', label: 'SCREEN / PRINT',
          before: {
            title: 'Screen file (RGB)',
            points: ['RGB, 1748×1240 px at 300 dpi', 'The gradient’s violet is vivid, about (66, 2, 246)'],
            media: { type: 'image', src: 'assets/img/cases/tilkytak/certificate-front.webp', poster: '', alt: 'Certificate front, screen RGB version', ratio: '1748/1240', slot: '', spec: '' }
          },
          after: {
            title: 'Print proof (CMYK)',
            points: ['CMYK only, Coated FOGRA39 as the output intent', 'Trim 148×105 mm, bleed out to 154×111 mm, all text in outlines', 'The violet dulls to a deep blue-purple, about (61, 71, 151), so the gradient was checked on a simulated proof'],
            media: { type: 'image', src: 'assets/img/cases/tilkytak/print-proof-front.webp', poster: '', alt: 'Certificate front, simulated CMYK print proof', ratio: '1748/1240', slot: '', spec: '' }
          }
        },
        { type: 'metrics', label: 'RESULT', items: [{ value: '13', label: 'versions, from first draft to final' }, { value: '5', label: 'print-PDF revisions' }, { value: '3,000', label: 'UAH face value' }, { value: '148×105', label: 'mm, A6 landscape, 3 mm bleed' }] },
        {
          type: 'credits',
          items: [
            { k: 'Role', v: 'Designer (AI-assisted), part-time' },
            { k: 'Client', v: 'TILKYTAK Records (ТІЛЬКИТАК), record label' },
            { k: 'Period', v: 'Nov 2026 (one project; designing for the label since Mar 2024)' },
            { k: 'Tools', v: 'Claude Code, Higgsfield' }
          ]
        }
      ]
    },

    /* ------------------------------------------------------------ TEMPLATE
       Скрытый шаблон нового кейса. В tracks не входит. Открывается по case.html?id=template.
       Чтобы добавить кейс: скопируй этот объект, смени ключ/id/track/side, убери hidden: true,
       заполни блоки (лишние удали), добавь id в work.sides[].tracks. */
    template: {
      hidden: true,
      id: 'template', track: 'X0', side: 'A',
      title: 'Case template',
      client: 'Your client', clientNote: 'One line on who they are: industry, size, what they sell',
      oneLiner: 'One plain sentence: what you did and what came out of it. If a stranger reads only this, they should know the point.',
      year: '2026',
      role: 'Your role on this project, as it would appear on a credits roll',
      tags: ['TAG ONE', 'TAG TWO', 'TAG THREE'],
      tools: ['Claude'],
      result: { value: '00', label: 'the one number that matters, with its unit' },
      cover: { type: 'image', src: '', /* → assets/img/cases/template/cover.jpg */ poster: '', alt: 'Cover for the case', ratio: '16/10', slot: 'Case cover: the single strongest visual from the project, clean export without platform UI or watermarks', spec: 'JPG/WebP 2400×1500, ≤400 KB' },
      blocks: [
        {
          type: 'text', label: 'THE BRIEF', heading: 'A one-line headline that states the problem.',
          body: [
            'Paragraph 1, the setup: who the client is, what they sell, and the task in plain words. Name the constraint too (budget, deadline, no existing assets). A constraint is what makes the result impressive.',
            'Paragraph 2, your part: what exactly you were responsible for, and what you decided yourself. Two or three sentences. No adjectives you cannot prove.'
          ]
        },
        {
          type: 'media', size: 'wide',
          media: { type: 'image', src: '', /* → assets/img/cases/template/hero.jpg */ poster: '', alt: 'Hero visual', ratio: '16/9', slot: 'One hero image or video of the final result. Sizes: full (edge to edge), wide, half (for vertical video, e.g. a Reel in 9/16)', spec: 'JPG/WebP 2400×1350, ≤400 KB' },
          caption: 'Caption: what the viewer is looking at, where it ran, and one fact about how it performed.'
        },
        {
          type: 'prompt', label: 'PROMPT RECEIPT', tool: 'The exact tool and model you used',
          prompt: 'Paste the real prompt, unedited. A strong receipt has: 1) subject and action, 2) style and references, 3) camera or composition, 4) constraints (what to avoid), 5) format and ratio.',
          takes: 'N',
          note: 'Say what the brief behind this prompt was and what you changed between the first and the last version. The proof is the output on the right.',
          output: { type: 'image', src: '', /* → assets/img/cases/template/prompt-output.jpg */ poster: '', alt: 'Output of the prompt', ratio: '4/5', slot: 'The final selected output that this exact prompt produced (image or video, no watermark)', spec: 'JPG/WebP 1600×2000, ≤300 KB' }
        },
        {
          type: 'takes', label: 'TAKES & SELECT', selected: 3,
          note: 'Say why this take won. One concrete reason beats a paragraph: it read at thumbnail size, the hands were right, it matched the brand colour, it tested best. The circle is your taste made visible.',
          items: [
            { type: 'image', src: '', /* → assets/img/cases/template/takes/01.jpg */ poster: '', alt: 'Take 1', ratio: '1/1', slot: 'Take 1 of 6: an honest first generation', spec: 'JPG/WebP 1200×1200, ≤200 KB' },
            { type: 'image', src: '', /* → assets/img/cases/template/takes/02.jpg */ poster: '', alt: 'Take 2', ratio: '1/1', slot: 'Take 2 of 6: a variation with a different composition', spec: 'JPG/WebP 1200×1200, ≤200 KB' },
            { type: 'image', src: '', /* → assets/img/cases/template/takes/03.jpg */ poster: '', alt: 'Take 3 (selected)', ratio: '1/1', slot: 'Take 3 of 6: the winner. Its position matches takes.selected (1-based) and gets the blue circle', spec: 'JPG/WebP 1200×1200, ≤200 KB' },
            { type: 'image', src: '', /* → assets/img/cases/template/takes/04.jpg */ poster: '', alt: 'Take 4', ratio: '1/1', slot: 'Take 4 of 6: a variation with different light or palette', spec: 'JPG/WebP 1200×1200, ≤200 KB' },
            { type: 'image', src: '', /* → assets/img/cases/template/takes/05.jpg */ poster: '', alt: 'Take 5', ratio: '1/1', slot: 'Take 5 of 6: a rejected take with a visible flaw. Showing a miss makes the pick credible', spec: 'JPG/WebP 1200×1200, ≤200 KB' },
            { type: 'image', src: '', /* → assets/img/cases/template/takes/06.jpg */ poster: '', alt: 'Take 6', ratio: '1/1', slot: 'Take 6 of 6: another variation. Use 6 or 8 items in total', spec: 'JPG/WebP 1200×1200, ≤200 KB' }
          ]
        },
        {
          type: 'gallery', label: 'THE SET', columns: 3,
          caption: 'Caption: what the set is (a feed, a series, a campaign) and how many pieces it really had.',
          items: [
            { type: 'image', src: '', /* → assets/img/cases/template/gallery/01.jpg */ poster: '', alt: 'Set item 1', ratio: '1/1', slot: 'Piece 1 of the delivered set, final export', spec: 'JPG/WebP 1600×1600, ≤300 KB' },
            { type: 'image', src: '', /* → assets/img/cases/template/gallery/02.jpg */ poster: '', alt: 'Set item 2', ratio: '1/1', slot: 'Piece 2: a different format or variation from the same set', spec: 'JPG/WebP 1600×1600, ≤300 KB' },
            { type: 'image', src: '', /* → assets/img/cases/template/gallery/03.jpg */ poster: '', alt: 'Set item 3', ratio: '1/1', slot: 'Piece 3: show the range, not three near-identical files. Columns can be 2 or 3', spec: 'JPG/WebP 1600×1600, ≤300 KB' }
          ]
        },
        {
          type: 'beforeAfter', label: 'BEFORE / AFTER',
          before: {
            title: 'Before: the old way',
            points: ['The state of things before you: the process, the quality, the time it took.', 'Put a number on it: hours per item, cost, error rate.'],
            media: { type: 'image', src: '', /* → assets/img/cases/template/before.jpg */ poster: '', alt: 'Before', ratio: '4/3', slot: 'Screenshot or photo of the old state (blur private data)', spec: 'JPG/WebP 1600×1200, ≤300 KB' }
          },
          after: {
            title: 'After: with your work',
            points: ['The same thing after you: what changed in the process or the output.', 'Put the matching number: same unit as before, so the gap is obvious.'],
            media: { type: 'image', src: '', /* → assets/img/cases/template/after.jpg */ poster: '', alt: 'After', ratio: '4/3', slot: 'Screenshot or photo of the new state, framed the same way as the before image', spec: 'JPG/WebP 1600×1200, ≤300 KB' }
          }
        },
        {
          type: 'pipeline', label: 'THE PIPELINE',
          steps: [
            { name: 'STEP ONE', tool: 'Tool name', desc: 'What goes in and what comes out of this step, in one sentence.' },
            { name: 'STEP TWO', tool: 'Tool name', desc: 'The transformation. Name the decision a human still makes here.' },
            { name: 'STEP THREE', tool: 'Tool name', desc: 'Where the result lands. Three to five steps is enough.' }
          ],
          media: { type: 'image', src: '', /* → assets/img/cases/template/workflow.png */ poster: '', alt: 'Workflow screenshot', ratio: '16/9', slot: 'Screenshot or screen recording frame of the real workflow (n8n, Claude Code, a spreadsheet). Hide tokens, keys and private paths', spec: 'PNG/WebP 2400×1350, ≤400 KB' }
        },
        { type: 'quote', text: 'A real one-line quote from the client, in their words. Short, specific, about the result or about working with you.', author: 'Full name', role: 'Role, company' },
        {
          type: 'metrics', label: 'RESULT',
          items: [{ value: '00', label: 'the main number, with unit and period' }, { value: '00', label: 'a supporting number that gives context' }, { value: '00', label: 'optional third number. Two to four items work best' }]
        },
        {
          type: 'credits',
          items: [
            { k: 'Role', v: 'Your role' },
            { k: 'Client', v: 'Client name and what they do' },
            { k: 'Period', v: 'Start – end' },
            { k: 'Tools', v: 'Only the tools that really did the work' }
          ]
        }
      ]
    }
  },

  process: {
    label: '03 — FROM BRIEF TO CUT',
    title: 'How I work',
    intro: 'Six steps. The machine does the heavy lifting in the middle. The beginning and the end are mine.',
    steps: [
      { n: '01', name: 'BRIEF', desc: 'Goal, audience, format, one number to hit. If the brief is vague, the takes will be too.', tools: ['Claude'] },
      { n: '02', name: 'PROMPT', desc: 'The brief becomes prompts: reference, style, constraints. Written, tested, rewritten.', tools: ['ChatGPT', 'Claude', 'DeepSeek'] },
      { n: '03', name: 'TAKES', desc: 'Images, video and voice, in bulk. Most of it is not good. That is the point.', tools: ['Higgsfield', 'Leonardo AI', 'ElevenLabs'] },
      { n: '04', name: 'SELECT', desc: 'Where the job actually is. Circle the take that works, bin the rest, and know why.', tools: [] },
      { n: '05', name: 'CUT', desc: 'Finishing, layout and edit. Design by hand where it matters, by script where it repeats.', tools: ['Claude Code', 'Photoshop', 'Figma'] },
      { n: '06', name: 'SHIP', desc: 'Scheduled, published, measured. Automated wherever the same step happens twice.', tools: ['n8n'] }
    ]
  },

  sheet: {
    hidden: true, // set to false (or delete) to show the contact sheet again; 11 of 12 frames are still placeholders
    label: '04 — CONTACT SHEET',
    title: 'TAKES & SELECTS',
    note: 'A wall of outputs. The circled ones shipped.',
    filters: ['all', 'image', 'video', 'voice', 'copy'],
    frames: [
      {
        id: '01', kind: 'image', title: 'Agency ad creative', tool: '[[TODO: tool]]',
        media: { type: 'image', src: '', /* → assets/img/sheet/01.jpg */ poster: '', alt: 'Ad creative for the agency', ratio: '4/5', slot: 'Ad creative for the web agency: a lead-gen visual, clean export', spec: 'JPG/WebP 1600×2000, ≤300 KB' },
        prompt: '[[TODO: paste the real prompt]]', selected: true, note: 'Shipped. [[TODO: where it ran]]'
      },
      {
        id: '02', kind: 'image', title: 'Album cover', tool: '[[TODO: tool]]',
        media: { type: 'image', src: '', /* → assets/img/sheet/02.jpg */ poster: '', alt: 'Album cover', ratio: '1/1', slot: 'A GARBAGEFUNK album cover, square, no streaming UI', spec: 'JPG/WebP 1600×1600, ≤300 KB' },
        prompt: '[[TODO: paste the real prompt]]', selected: true, note: 'Released. [[TODO: which album]]'
      },
      {
        id: '03', kind: 'image', title: 'Gift certificate art', tool: '[[TODO: tool]]',
        media: { type: 'image', src: '', /* → assets/img/sheet/03.jpg */ poster: '', alt: 'Gift certificate art', ratio: '16/9', slot: 'A TILKYTAK gift certificate design, flat view', spec: 'JPG/WebP 2000×1125, ≤300 KB' },
        prompt: '[[TODO: paste the real prompt]]', selected: false, note: 'Not the final. [[TODO: why it lost]]'
      },
      {
        id: '04', kind: 'image', title: 'Vinyl product card', tool: '[[TODO: tool]]',
        media: { type: 'image', src: '', /* → assets/img/sheet/04.jpg */ poster: '', alt: 'Product card for a vinyl listing', ratio: '1/1', slot: 'A product card for a vinyl listing on Prom.ua', spec: 'JPG/WebP 1600×1600, ≤300 KB' },
        prompt: '[[TODO: paste the real prompt]]', selected: true, note: 'Part of the 2,000+. [[TODO: confirm]]'
      },
      {
        id: '05', kind: 'image', title: 'Social post visual', tool: '[[TODO: tool]]',
        media: { type: 'image', src: '', /* → assets/img/sheet/05.jpg */ poster: '', alt: 'Social post visual', ratio: '4/5', slot: 'A social post visual for the agency feed, portrait crop', spec: 'JPG/WebP 1600×2000, ≤300 KB' },
        prompt: '[[TODO: paste the real prompt]]', selected: false, note: 'Close, not it. [[TODO: why it lost]]'
      },
      {
        id: '06', kind: 'video', title: 'Reel clip', tool: '[[TODO: tool]]',
        media: { type: 'video', src: '', /* → assets/video/sheet/06.mp4 | poster assets/img/sheet/06-poster.jpg */ poster: '', alt: 'Reel clip', ratio: '9/16', slot: 'A 5–8 s vertical clip from a Reel for the label, loopable', spec: 'MP4 H.264 1080×1920, ≤4 MB + poster JPG' },
        prompt: '[[TODO: paste the real prompt]]', selected: true, note: 'Went into the Reel. [[TODO: which one]]'
      },
      {
        id: '07', kind: 'video', title: 'Ad video, vertical', tool: '[[TODO: tool]]',
        media: { type: 'video', src: '', /* → assets/video/sheet/07.mp4 | poster assets/img/sheet/07-poster.jpg */ poster: '', alt: 'Vertical ad video', ratio: '9/16', slot: 'A vertical ad clip for the agency, 5–8 s', spec: 'MP4 H.264 1080×1920, ≤4 MB + poster JPG' },
        prompt: '[[TODO: paste the real prompt]]', selected: false, note: 'Alternative cut. [[TODO: why it lost]]'
      },
      {
        id: '08', kind: 'video', title: 'Label teaser', tool: '[[TODO: tool]]',
        media: { type: 'video', src: '', /* → assets/video/sheet/08.mp4 | poster assets/img/sheet/08-poster.jpg */ poster: '', alt: 'Label teaser', ratio: '16/9', slot: 'A widescreen teaser for a release, 5–8 s', spec: 'MP4 H.264 1280×720, ≤4 MB + poster JPG' },
        prompt: '[[TODO: paste the real prompt]]', selected: false, note: '[[TODO: one line]]'
      },
      {
        id: '09', kind: 'video', title: 'Claude Code edit', tool: 'Claude Code',
        media: { type: 'video', src: '', /* → assets/video/sheet/09.mp4 | poster assets/img/sheet/09-poster.jpg */ poster: '', alt: 'Edit assembled by Claude Code', ratio: '9/16', slot: 'A short edit assembled by Claude Code from a brief, 5–8 s', spec: 'MP4 H.264 1080×1920, ≤4 MB + poster JPG' },
        prompt: '[[TODO: paste the brief given to Claude Code]]', selected: false, note: '[[TODO: one line]]'
      },
      {
        id: '10', kind: 'voice', title: 'Ad voice-over', tool: 'ElevenLabs',
        media: { type: 'audio', src: '', /* → assets/audio/sheet/10.mp3 */ poster: '', alt: 'Voice-over for an ad', ratio: '16/9', slot: 'An ElevenLabs voice-over read for the agency ad, 5–10 s', spec: 'MP3 128 kbps, ≤500 KB' },
        prompt: '[[TODO: paste the text and voice settings]]', selected: true, note: 'Used in the ad. [[TODO: which one]]'
      },
      {
        id: '11', kind: 'voice', title: 'Voice test', tool: 'ElevenLabs',
        media: { type: 'audio', src: '', /* → assets/audio/sheet/11.mp3 */ poster: '', alt: 'Voice test', ratio: '16/9', slot: 'An ElevenLabs voice test in another tone or language, 5–10 s', spec: 'MP3 128 kbps, ≤500 KB' },
        prompt: '[[TODO: paste the text and voice settings]]', selected: false, note: 'Alternative voice. [[TODO: why it lost]]'
      },
      {
        id: '12', kind: 'copy', title: 'Reel caption', tool: '[[TODO: tool]]',
        media: null,
        text: '[[TODO: paste the final caption or ad copy, the one that shipped or a favourite reject]]',
        prompt: '[[TODO: paste the real prompt]]', selected: false, note: '[[TODO: one line on what makes it work]]'
      }
    ]
  },

  tools: {
    label: '05 — THE RIG',
    title: 'Tools',
    groups: [
      {
        name: 'Text & LLMs',
        items: [
          { name: 'ChatGPT', use: 'Drafting copy, briefs, ideas' },
          { name: 'Claude', use: 'Writing, briefs, long context' },
          { name: 'DeepSeek', use: 'Second opinion, drafts' }
        ]
      },
      {
        name: 'Image, video & voice',
        items: [
          { name: 'Higgsfield', use: 'AI video and motion' },
          { name: 'Leonardo AI', use: 'AI image generation' },
          { name: 'ElevenLabs', use: 'AI voice-over' }
        ]
      },
      {
        name: 'Automation & AI coding',
        items: [
          { name: 'n8n', use: 'Content pipelines, publishing' },
          { name: 'Claude Code', use: 'Pipelines, scripts, design iterations' },
          { name: 'Codex', use: 'AI coding assistant' }
        ]
      },
      {
        name: 'Design',
        items: [
          { name: 'Figma', use: 'Layout, certificates, artwork' },
          { name: 'Photoshop', use: 'Finishing AI images, print fixes' }
        ]
      }
    ]
  },

  record: {
    label: '06 — LINER NOTES',
    title: 'Experience',
    experience: [
      {
        role: 'Marketing & AI Content Creator (SMM)',
        org: 'wpwp.bz', orgNote: 'WordPress & WooCommerce development agency',
        period: 'Sep 2025 – Oct 2026', type: 'full-time',
        points: [
          'Joined as a junior designer (layouts, design tasks), promoted to marketing & AI content after ~7 months.',
          'Planned and launched a lead generation campaign that brought the agency 40+ qualified B2B leads.',
          'Ran the agency’s social media end to end: content plan, AI-generated visuals, video and copy.',
          'Built an AI-first content workflow (Higgsfield, Leonardo AI, ElevenLabs) for social media and ads.'
        ]
      },
      {
        role: 'Content Automation Specialist',
        org: 'Echo UA & Echo Hits', orgNote: 'Vinyl shops selling on the Prom.ua marketplace',
        period: 'Mar 2024 – present', type: 'part-time',
        points: [
          'Built the company’s first content automation system from scratch.',
          'Turned manual listing into a batch pipeline that prepares and publishes content for 2,000+ products on Prom.ua.',
          'Saved an estimated 330–500 hours of manual work across 2,000 cards; cards grew from 4 to 8 characteristic fields.'
        ]
      },
      {
        role: 'Designer (AI-assisted)',
        org: 'TILKYTAK Records (ТІЛЬКИТАК)', orgNote: 'Record label',
        period: 'Mar 2024 – present', type: 'part-time',
        points: [
          'Took on design tasks alongside the label’s main designer: release covers, artwork and print materials.',
          'Designed a print-ready gift certificate with Claude Code (13 versions, CMYK print files); Higgsfield for presentation imagery.',
          'Prepared artists’ artwork for production: technical fixes and layout adaptation.'
        ]
      },
      {
        role: 'Co-founder, Music & Visual Direction',
        org: 'GARBAGEFUNK', orgNote: 'Indie music project and label',
        period: '2022 – present', type: 'co-founder',
        points: [
          'Released 10+ albums by different artists; co-created the music and the label’s visual identity.',
          'Ran Instagram for one of the label’s artists; a zero-budget meme marketing campaign for the Soundsystem project brought 5,000+ new Spotify listeners (per Spotify for Artists).',
          'Monetised through streaming, YouTube and commissions from a US client: several thousand dollars in revenue.',
          'Created Reels for the label’s meme page: the top one reached 16M views, two more 3M and 2M.'
        ]
      }
    ],
    education: [
      { school: 'Simon Kuznets Kharkiv National University of Economics', detail: 'Bachelor’s, Management and Marketing, 4th year', period: 'Expected 2027' },
      { school: 'SKVOT', detail: 'Design course', period: '' }
    ],
    languages: [
      { name: 'Ukrainian', level: 'Native' },
      { name: 'English', level: 'B2' }
    ]
  },

  contact: {
    label: '07 — CONTACT',
    titleLines: ['GOT A BRIEF?', "LET'S MAKE THE CUT."],
    body: 'I am looking to bring this mix of content and automation to a larger content team. Remote works. Write to me — email or Telegram, whichever is faster for you.',
    links: [
      { label: 'Email', value: 'tertychnyiklim@gmail.com', url: 'mailto:tertychnyiklim@gmail.com' },
      { label: 'Telegram', value: '@Lingerieeeee', url: 'https://t.me/Lingerieeeee' },
      { label: 'LinkedIn', value: 'in/klim-tertychnyi-534a63379', url: 'https://www.linkedin.com/in/klim-tertychnyi-534a63379' },
      { label: 'CV', value: 'Download PDF', url: 'assets/docs/Klim_Tertychnyi_CV.pdf' }
    ]
  },

  footer: { note: 'Designed with a blue pencil. Built with Claude Code.' }
};
