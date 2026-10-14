/* =============================================================================
 * LAST MILE HEROES: GAME CONTENT  (edit text here, nothing else needed)
 * -----------------------------------------------------------------------------
 * Everything the CP team may want to change lives in this block: settings,
 * colours, the fictional NGO, tracks and kits, characters, critical rules,
 * acronyms and the missions. The game code further down only READS it.
 *
 * Editing tips
 *  - Change only the text between quotes. Keep commas, brackets and quotes.
 *  - An apostrophe inside single quotes needs a backslash: 'the partner\'s file'
 *  - Every item has an id (keep it unique) and a ref (the source shown to the
 *    player). Topics to review on the end screen are grouped by ref.
 *  - If the game shows a blank page after an edit, undo the last change:
 *    a comma or a quote is probably missing.
 *
 * Sources (all in ./source/):
 *  SOP     IOM South Sudan Core Pipeline Operations SOP (Draft 1, Sept 2026).
 *          The main source: it wins where sources differ.
 *  AG      CP Distribution Agreement 2026 (partner clauses), by article
 *  A1..A7  Agreement annexes: A1 Access Guideline, A2 SNFI report, A3 WASH
 *          report, A4 Loss and Damage form, A5 Needs Analysis report,
 *          A6 IOM Data Protection Principles, A7 Audio-visual consent form
 *  WS      WASH Cluster Core Pipeline SOP (Jan 2026), WASH-only points
 *  IN/234  IOM policy on PSEA
 * ========================================================================== */

window.CONTENT = {

  /* ---------------------------------------------------------------------------
   * META AND SETTINGS
   * ------------------------------------------------------------------------- */
  meta: {
    title: 'Last Mile Heroes',
    subtitle: 'Partner onboarding game for the IOM South Sudan Core Pipeline (SNFI and WASH)',
    version: '0.2 prototype (Mission 6)',
    sourceNote: 'Based on the IOM South Sudan Core Pipeline SOP (Draft 1, September 2026), the CP Distribution Agreement 2026 and its annexes, and the WASH Cluster Core Pipeline SOP (January 2026).',
    cardNote: 'Training record, not a certification.'
  },

  settings: {
    livesPerMission: 3,
    pointsPerCorrect: 100,
    streakBonus: 20,              // extra points per move in a streak
    streakBonusMax: 100,
    stars: { one: 0.5, two: 0.75, three: 0.92 },   // mission accuracy for 1, 2, 3 stars
    relaxedPaceFactor: 1.6,       // "Relaxed pace" makes timed parts this much slower
    storageKey: 'lastMileHeroes.v1'
  },

  /* Colours. IOM blue is the base. Change a value and reload. */
  theme: {
    iomBlue: '#0033A0', iomBlueDark: '#00205F', iomBlueLight: '#E6EEFA',
    background: '#F3F6FB', text: '#14213D',
    correct: '#12865A', wrong: '#C62E2E', warning: '#E08A00', gold: '#F5B301',
    earth: '#C98B5B', grass: '#9CC46B', water: '#5FB4E0', road: '#B8774A'
  },

  /* Logos shown on the home screen and the completion card.
   * Paste a data URI (data:image/svg+xml;base64,... or data:image/png;base64,...)
   * between the quotes. Empty = a labelled placeholder is shown. */
  logos: {
    iom: '',
    slsc: '',
    wash: ''
  },

  /* The player's organisation in the game is fictional on purpose. The real
   * organisation typed on the home screen appears only on the completion card
   * and in the CSV export. */
  ngo: { name: 'Nile Lantern Relief', short: 'NLR', color: '#00A889' },

  states: ['Central Equatoria', 'Eastern Equatoria', 'Jonglei', 'Lakes', 'Northern Bahr el Ghazal',
           'Unity', 'Upper Nile', 'Warrap', 'Western Bahr el Ghazal', 'Western Equatoria',
           'Abyei Administrative Area'],

  /* ---------------------------------------------------------------------------
   * TRACKS: the player picks one at the start. Shared content applies to both.
   * Kit contents: SOP §2.1, Table 2.
   * ------------------------------------------------------------------------- */
  tracks: {
    SNFI: {
      label: 'Shelter and NFI',
      short: 'SNFI',
      blurb: 'Shelter and non-food items: plastic sheets, blankets, kitchen sets...',
      cluster: 'SLSC Cluster',
      color: '#0033A0',
      kits: [
        { id: 'snfi', name: 'SNFI standard kit', ref: 'SOP §2.1, Table 2',
          items: ['2 plastic sheets 4x6m', '2 rubber rope ties', '2 blankets', '2 mosquito nets', '2 kanga',
                  '1 kitchen set', '1 sleeping mat', '1 solar lamp', '1 NFI bag'] },
        { id: 'es', name: 'Emergency shelter kit', ref: 'SOP §2.1, Table 2',
          items: ['2 plastic sheets 4x6m', '2 bundles of rope',
                  '2 bundles of bamboo (where not available locally)', '6 wooden poles (where not available locally)'] }
      ],
      demo: 'how to put up the plastic sheet',
      report: 'SNFI distribution report (Annex 2)',
      reportDeadline: '15 days',
      reportRef: 'AG Art. 6; A1 Step 4; SOP §4.7'
    },
    WASH: {
      label: 'WASH',
      short: 'WASH',
      blurb: 'Water, sanitation and hygiene: buckets, filter cloth, soap, water treatment...',
      cluster: 'WASH Cluster',
      color: '#19A7E0',
      kits: [
        { id: 'wash', name: 'WASH standard kit', ref: 'SOP §2.1, Table 2',
          items: ['1 bucket with tap', '1 bucket without tap', '1 filter cloth', '2 bars of soap',
                  '290 water purification tablets', '45 PuR flocculant sachets', '1 MHM kit'] }
      ],
      demo: 'how to use the filter cloth and the water purification tablets',
      report: 'WASH distribution and utilisation report (Annex 3)',
      reportDeadline: 'one month',
      reportRef: 'AG Art. 6; A1 Step 4; WS §5; SOP §4.7'
    }
  },

  /* ---------------------------------------------------------------------------
   * CHARACTERS (all fictional). look.hair: short|long|bun|headwrap|cap|bald
   * ------------------------------------------------------------------------- */
  characters: {
    you:      { name: 'You',       role: 'Field focal point, Nile Lantern Relief',
                look: { skin: '#6B4226', hair: 'short', hairColor: '#1E1E1E', shirt: '#00A889' } },
    nyakuoth: { name: 'Nyakuoth',  role: 'Cluster coordinator',
                look: { skin: '#4E2F1C', hair: 'long', hairColor: '#1E1E1E', shirt: '#D6246E' } },
    lual:     { name: 'Lual',      role: 'IOM Core Pipeline officer',
                look: { skin: '#6B4226', hair: 'cap', hairColor: '#0033A0', shirt: '#0033A0' } },
    deng:     { name: 'Deng',      role: 'IOM warehouse manager',
                look: { skin: '#5A3A22', hair: 'short', hairColor: '#1E1E1E', shirt: '#F28C28' } },
    mabior:   { name: 'Chief Mabior', role: 'Community leader',
                look: { skin: '#4A2C1A', hair: 'bald', hairColor: '#1E1E1E', shirt: '#7A5CFA' } },
    majok:    { name: 'Majok',     role: 'Your colleague (loves shortcuts)',
                look: { skin: '#7A4B2A', hair: 'cap', hairColor: '#C62E2E', shirt: '#E5554F' } },
    ayen:     { name: 'Ayen',      role: 'Community member',
                look: { skin: '#5C3A21', hair: 'headwrap', hairColor: '#F5B301', shirt: '#F5B301' } }
  },

  /* ---------------------------------------------------------------------------
   * CRITICAL RULES: breaking one ends the mission at once.
   * `scene` is the short dramatic consequence line.
   * ------------------------------------------------------------------------- */
  criticalRules: {
    R1: { title: 'Distribution is free',
          rule: 'No fee, cost or contribution from anyone: not from IOM, not from beneficiaries, not from any third party.',
          scene: 'Families turn away. The pipeline stops for your organisation.',
          ref: 'SOP §1, §7.2; AG Art. 5' },
    R2: { title: 'No request before onboarding',
          rule: 'CP access starts only after onboarding is complete: DDA, cluster validation and a signed agreement.',
          scene: 'The request bounces back. Onboarding comes first.',
          ref: 'SOP §4.2, §4.2.2; A1 Step 1' },
    R3: { title: 'Report loss within 24 hours',
          rule: 'Any loss, damage, theft or diversion goes to the CP team and the cluster within 24 hours of becoming aware, on the Loss and Damage form.',
          scene: 'The silence becomes the problem. Your access is suspended.',
          ref: 'SOP §4.6.2, §4.2.3' },
    R4: { title: 'PSEA: report immediately',
          rule: 'Allegations of sexual exploitation and abuse go immediately to IOM PSEA channels. They never wait in the normal complaints loop.',
          scene: 'Someone at risk was left unprotected.',
          ref: 'SOP §7.2, §7.3; AG 8.3; IN/234' },
    R5: { title: 'Only assessed households',
          rule: 'Items go only to the households identified in the assessment. No sale, no diversion, no gifts to others.',
          scene: 'Kits leave the list. Diversion leads to suspension.',
          ref: 'AG Art. 3; SOP §4.2.3, §4.10' },
    R6: { title: 'No names added to the list',
          rule: 'No name is added to the beneficiary list without IOM written consent.',
          scene: 'The list can no longer be trusted.',
          ref: 'AG Art. 3' },
    R7: { title: 'Distribute directly',
          rule: 'You distribute yourself, in the target area, without an intermediary.',
          scene: 'Your organisation no longer meets the eligibility conditions.',
          ref: 'SOP §4.2.1' },
    R8: { title: 'Protect people\'s data and images',
          rule: 'Beneficiary data is shared only on a need-to-know basis. Photos of people only with signed consent.',
          scene: 'People\'s privacy and safety are exposed.',
          ref: 'AG Art. 3; SOP §4.6, §7.2; A6; A7' }
  },

  /* Acronyms are spelled out the first time they appear in a mission. */
  glossary: {
    'IOM': 'International Organization for Migration',
    'CP': 'Core Pipeline',
    'SOP': 'Standard Operating Procedure',
    'NGO': 'non-governmental organisation',
    'SNFI': 'Shelter and Non-Food Items',
    'NFI': 'Non-Food Items',
    'WASH': 'Water, Sanitation and Hygiene',
    'SLSC': 'Shelter, Land and Settlements Cluster',
    'PSEA': 'Prevention of Sexual Exploitation and Abuse',
    'GBV': 'Gender-Based Violence',
    'MHM': 'Menstrual Hygiene Management',
    'PDM': 'Post-Distribution Monitoring',
    'DDA': 'Due Diligence Assessment',
    'RRC': 'Relief and Rehabilitation Commission',
    '5W': 'Who does What, Where, When and for Whom',
    'ID': 'identity document'
  },

  /* Badge rules: missionDone:<id> | stars3:<id> | flawless | streak:<n> | noCritical | allMissions */
  badges: [
    { id: 'site-boss',  title: 'Site Boss',     rule: 'missionDone:M6', desc: 'Ran a full distribution day.' },
    { id: 'flawless',   title: 'Flawless',      rule: 'flawless',       desc: 'Finished a mission without losing a life.' },
    { id: 'hot-streak', title: 'Hot Streak',    rule: 'streak:8',       desc: 'Eight right moves in a row.' },
    { id: 'rule-keeper', title: 'Rule Keeper',  rule: 'noCritical',     desc: 'Every attempt so far without breaking a critical rule.' }
  ],

  /* Unlockables shown on the NGO compound and the truck. */
  unlocks: [
    { id: 'truck-teal',   kind: 'truckColor', value: '#00A889', label: 'Teal truck',   rule: 'start' },
    { id: 'truck-sunset', kind: 'truckColor', value: '#F28C28', label: 'Sunset truck', rule: 'missionDone:M6' },
    { id: 'flag',         kind: 'decor',      value: 'flag',    label: 'Compound flag', rule: 'stars3:M6' }
  ],

  /* ---------------------------------------------------------------------------
   * MISSIONS (the journey). Only Mission 6 is playable in this prototype; the
   * other six show on the map and are built in the full version.
   * ------------------------------------------------------------------------- */
  missions: [
    { id: 'M1', number: 1, title: 'Get on the Pipeline', place: 'Your office', color: '#F5B301', topic: 'Eligibility and onboarding', playable: false },
    { id: 'M2', number: 2, title: 'Needs Check', place: 'Village', color: '#7A5CFA', topic: 'Needs assessment', playable: false },
    { id: 'M3', number: 3, title: 'Request Builder', place: 'Cluster office', color: '#19A7E0', topic: 'Request and endorsement', playable: false },
    { id: 'M4', number: 4, title: 'Warehouse Pickup', place: 'IOM hub', color: '#0033A0', topic: 'Collection', playable: false },
    { id: 'M5', number: 5, title: 'Road to the Site', place: 'River road', color: '#8B5E34', topic: 'Transport and loss reporting', playable: false },

    /* =========================================================================
     * MISSION 6: DISTRIBUTION DAY
     * Phase 1 Announce: load the right messages into the chief's megaphone.
     * Phase 2 Build: place the stations of a safe, fair site.
     * Phase 3 Rush: route people to the right station; handle event calls.
     * ======================================================================= */
    {
      id: 'M6', number: 6, title: 'Distribution Day', place: 'Distribution site', color: '#F28C28',
      topic: 'Distribution standards', host: 'mabior', playable: true,
      intro: 'Today your team hands out the kits. Tell the community what to expect, build a safe site, then keep people moving fairly.',
      howTo: [
        'Announce: tap the right messages to load the megaphone.',
        'Build: tap a station card, then a glowing plot.',
        'Rush: tap a person\'s bubble, then the station they need.'
      ],
      rulesInPlay: ['R1', 'R4', 'R5', 'R6', 'R7', 'R8'],

      /* Phase 1: community information, given in advance (SOP §4.6, Table 12). */
      announce: {
        speaker: 'mabior',
        prompt: 'I will tell everyone through the leaders. What must people know before the day?',
        ref: 'SOP §4.6, Table 12 (Community information)',
        items: [
          { id: 'A-01', text: 'Who can receive (the targeting criteria)', correct: true },
          { id: 'A-02', text: 'What is in the kit', correct: true },
          { id: 'A-03', text: 'Date and place of the distribution', correct: true },
          { id: 'A-04', text: 'What to bring on the day', correct: true },
          { id: 'A-05', text: 'How to complain or give feedback', correct: true },
          { id: 'A-06', text: 'The aid is free', correct: true },
          { id: 'A-07', text: 'Special outreach to older people, people with disabilities, and women- and child-headed households', correct: true },
          { id: 'A-08', text: 'Bring a small fee for the porters', critical: 'R1',
            why: 'Even a small fee for porters turns free aid into paid aid. Your organisation covers its own costs.', ref: 'SOP §1, §7.2' },
          { id: 'A-09', text: 'Only names the chief chooses will be served',
            why: 'Kits go to the households identified in the assessment, verified on the attested list.', ref: 'AG Art. 3; SOP §4.6' },
          { id: 'A-10', text: 'Everyone will be photographed for the donor',
            why: 'Images of people need signed consent, and people can say no.', ref: 'SOP §4.6 (Visibility); A7' }
        ],
        decoysPerRun: 2
      },

      /* Phase 2: the site. kind 'path' stations go in order along the flow. */
      stations: [
        { id: 'entry',    label: 'Entry point',        kind: 'path', order: 1, icon: 'entry' },
        { id: 'register', label: 'Registration and ID check', kind: 'path', order: 2, icon: 'register' },
        { id: 'waiting',  label: 'Shaded waiting area', kind: 'path', order: 3, icon: 'shade' },
        { id: 'handout',  label: 'Distribution point', kind: 'path', order: 4, icon: 'kit' },
        { id: 'exit',     label: 'Exit point',         kind: 'path', order: 5, icon: 'exit' },
        { id: 'complaints', label: 'Complaints desk',  kind: 'side', icon: 'complaint' },
        { id: 'aid',      label: 'Water and first aid', kind: 'side', icon: 'aid' },
        { id: 'door',     label: 'Door-to-door team',  kind: 'side', icon: 'door' },
        { id: 'banner',   label: 'Visibility banner',  kind: 'side', icon: 'banner' }
      ],
      stationsRef: 'SOP §4.6, Table 12 (Team and site)',
      flowWhy: 'The flow runs entry, registration, waiting, distribution, exit: each at its own point.',
      decoys: [
        { id: 'X-fee',   label: 'Fee table', icon: 'register',            critical: 'R1',
          why: 'A fee table at the gate tells families they must pay. Charging beneficiaries leads to suspension.', ref: 'SOP §1, §7.2, §4.2.3' },
        { id: 'X-vip',   label: 'Chief\'s fast lane (no ID check)', icon: 'entry',
          why: 'Everyone is verified against the attested list. Aid is impartial.', ref: 'SOP §4.6 (Verification); AG Art. 5' },
        { id: 'X-photo', label: 'Photo corner for everyone', icon: 'banner',
          why: 'Images of people need signed consent.', ref: 'SOP §4.6 (Visibility); A7' },
        { id: 'X-sell',  label: 'Spare kit sales stall', icon: 'kit', critical: 'R5',
          why: 'Selling kits is diversion. Spare kits stay yours to report, and the CP team and cluster decide what happens to them.', ref: 'AG Art. 3; SOP §4.2.3, §4.10' },
        { id: 'X-gate',  label: 'One gate for in and out', icon: 'exit',
          why: 'Entry and exit are separate points, for safety and crowd control.', ref: 'SOP §4.6, Table 12' }
      ],
      decoysPerRun: 2,

      /* Phase 3: the rush. Seconds are at normal pace. */
      rush: {
        seconds: 95,
        spawnEvery: 3.6,          // a new arrival every ... seconds
        patience: 16,             // seconds a person waits for you before leaving
        doorToDoorEvery: 24,      // a household that cannot reach the site calls for help
        mix: { register: 0.6, complaint: 0.13, faint: 0.11, notListed: 0.16 }
      },
      routing: {
        register:  { why: 'Everyone is registered and their ID checked against the attested list first.', ref: 'SOP §4.6 (Verification)' },
        complaint: { why: 'Questions and complaints go to the complaints desk, staffed by trained people.', ref: 'SOP §4.6 (Complaints desk)' },
        faint:     { why: 'Water and first aid are part of every site.', ref: 'SOP §4.6, Table 12' },
        notListedOk:  { why: 'Right: the case is recorded and answered on the day. No kit leaves the list.', ref: 'SOP §7.3; AG Art. 3' },
        notListedBad: { why: 'Kits go only to assessed households on the list. Send the case to the complaints desk.', ref: 'AG Art. 3; SOP §4.6' },
        door:      { why: 'Door-to-door delivery for those who cannot reach the site.', ref: 'SOP §4.6, Table 12' },
        patience:  { why: 'Long waits push people away. Keep the queue moving and shaded.', ref: 'SOP §4.6, Table 12' }
      },

      /* Event calls during the rush. {demo}, {cluster} and {kit} follow the track. */
      eventsPerRun: 4,
      events: [
        { id: 'E-01', speaker: 'majok', prompt: '"My cousin\'s family missed registration. Just add them to the list, it\'s one family."',
          options: [
            { text: 'No. No name is added without IOM written consent.', correct: true },
            { text: 'Add them quietly.', critical: 'R6' }
          ], explain: 'The list stays as assessed and attested.', ref: 'AG Art. 3' },
        { id: 'E-02', speaker: 'majok', prompt: '"The porters want a small contribution from each family. Just a little?"',
          options: [
            { text: 'No. Distribution is free: no fee or contribution from anyone.', correct: true },
            { text: 'Fine, it is very small.', critical: 'R1' }
          ], explain: 'Your organisation covers its own costs. Beneficiaries pay nothing.', ref: 'SOP §1, §7.2; AG Art. 5' },
        { id: 'E-03', speaker: 'majok', prompt: '"Quick, snap the whole queue for the donor report!"',
          options: [
            { text: 'Only people who sign the consent form, and respect what they choose.', correct: true },
            { text: 'Take them all, it is for the report.', critical: 'R8' }
          ], explain: 'People can refuse, or ask to hide their face or name.', ref: 'SOP §4.6 (Visibility); A7' },
        { id: 'E-04', speaker: 'ayen', prompt: 'A mother agrees to a photo of her family. Her young daughter says no.',
          options: [
            { text: 'No photo of the girl.', correct: true },
            { text: 'The parent said yes, that is enough.', why: 'If a child declines, no recording is made, even with the parent\'s consent.' }
          ], explain: 'A child\'s refusal is respected.', ref: 'A7 (consent note)' },
        { id: 'E-05', speaker: 'ayen', prompt: 'At the complaints desk: "A volunteer said I must meet him tonight to get my kit."',
          options: [
            { text: 'Report it immediately and confidentially through IOM PSEA channels.', correct: true },
            { text: 'Log it for the monthly complaints analysis.', critical: 'R4' },
            { text: 'Ask the volunteer to explain himself first.', critical: 'R4' }
          ], explain: 'PSEA allegations bypass the feedback loop. Assistance is never exchanged for sex.', ref: 'SOP §7.2, §7.3; IN/234' },
        { id: 'E-06', speaker: 'nyakuoth', prompt: 'A rumour: a driver offers extra kits to girls in the queue "for favours".',
          options: [
            { text: 'Report it immediately through IOM PSEA channels.', correct: true },
            { text: 'Wait until it is confirmed.', critical: 'R4' }
          ], explain: 'Report allegations and suspicions at once. Exchanging assistance for sex is prohibited.', ref: 'SOP §7.2; IN/234; AG 8.3' },
        { id: 'E-07', speaker: 'mabior', prompt: '"These are my relatives from the next village. Give them kits, you have extra."',
          options: [
            { text: 'Items go only to assessed households. Record the request at the complaints desk.', correct: true },
            { text: 'Give them, there are spares.', critical: 'R5' }
          ], explain: 'Kits follow the assessment, not the request of the day.', ref: 'AG Art. 3; SOP §4.10' },
        { id: 'E-08', speaker: 'you', prompt: 'Registration shows the same ID twice, on two different households.',
          options: [
            { text: 'Serve once. Report it to the CP team and the cluster today.', correct: true },
            { text: 'Give two kits, they both waited.', why: 'Duplicates and attempted fraud are reported the same day.' },
            { text: 'Ignore it, it is busy.', why: 'Duplicates and attempted fraud are reported the same day.' }
          ], explain: 'Discrepancies, duplicates and fraud attempts: same-day report.', ref: 'SOP §4.6 (Verification)' },
        { id: 'E-09', speaker: 'mabior', prompt: '"Old Garang cannot walk here. His family is on the list."',
          options: [
            { text: 'Send the door-to-door team to him.', correct: true },
            { text: 'Sorry, kits are only given at the site.', why: 'Door-to-door delivery is for those who cannot reach the site.' }
          ], explain: 'Nobody on the list is left out because they cannot come.', ref: 'SOP §4.6, Table 12' },
        { id: 'E-10', speaker: 'ayen', prompt: '"We have waited so long in the sun!"',
          options: [
            { text: 'Fix it today: move people to the shade and speed up the line.', correct: true },
            { text: 'Note it for next month\'s report.', why: 'Issues raised during a distribution are resolved on the day.' }
          ], explain: 'Feedback is recorded, acted on and closed.', ref: 'SOP §7.3' },
        { id: 'E-11', speaker: 'ayen', prompt: 'The women\'s group asks {demo}.',
          options: [
            { text: 'Run a demonstration and record attendance by sex, age and disability.', correct: true },
            { text: 'No time today.', why: 'Training on item use is part of the job and goes into the report.' }
          ], explain: 'Training and its attendance are reported.', ref: 'SOP §4.7; A1 Step 4' },
        { id: 'E-12', speaker: 'majok', prompt: '"A trader wants the beneficiary list with phone numbers. He says he can help."',
          options: [
            { text: 'No. Beneficiary data is shared only on a need-to-know basis.', correct: true },
            { text: 'Share it, he means well.', critical: 'R8' }
          ], explain: 'Personal data goes to no third party without IOM written permission.', ref: 'AG Art. 3; A6' },
        { id: 'E-13', speaker: 'majok', prompt: '"Where is IOM? We can\'t start without them."',
          options: [
            { text: 'IOM is not at distributions. After handover, it is our responsibility.', correct: true },
            { text: 'Wait for IOM to come and supervise.', why: 'IOM has no presence at distributions; it does PDM on the items afterwards.' }
          ], explain: 'Responsibility passed to your organisation at signature.', ref: 'SOP §4.6 (Registration), §4.5.1' },
        { id: 'E-14', speaker: 'majok', prompt: '"Today\'s team: only men, and nobody trained in PSEA. Let\'s go?"',
          options: [
            { text: 'No: a mixed-gender team trained in PSEA and GBV, with a named team leader.', correct: true },
            { text: 'Go, we are late.', why: 'The team must be mixed-gender and trained in PSEA and GBV risk mitigation.' }
          ], explain: 'The team is part of the distribution standard.', ref: 'SOP §4.6, Table 12' },
        { id: 'E-15', speaker: 'nyakuoth', prompt: 'Another NGO offers to distribute half of your kits in the next village.',
          options: [
            { text: 'No. We distribute directly, without an intermediary.', correct: true },
            { text: 'Yes, it saves time.', critical: 'R7' }
          ], explain: 'Direct distribution is an eligibility condition.', ref: 'SOP §4.2.1' },
        { id: 'E-16', speaker: 'majok', prompt: 'Some kits are left over. "Let\'s keep them in our store for the next project."',
          options: [
            { text: 'Tell the CP team and the cluster in writing. They decide.', correct: true },
            { text: 'Keep them for later.', why: 'Items not distributed cannot be kept, reused or moved without written agreement.' }
          ], explain: 'Leftover items stay your responsibility until redirected.', ref: 'SOP §4.10; AG Art. 2', last: true }
      ]
    },

    { id: 'M7', number: 7, title: 'Report Back', place: 'Your office', color: '#D6246E', topic: 'Reporting, PDM and compliance', playable: false }
  ]
};
