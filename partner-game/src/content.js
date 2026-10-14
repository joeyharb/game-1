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
    version: '1.0',
    sourceNote: 'Based on the IOM South Sudan Core Pipeline SOP (Draft 1, September 2026), the CP Distribution Agreement 2026 and its annexes, and the WASH Cluster Core Pipeline SOP (January 2026).',
    cardNote: 'Training record, not a certification.',
    mockLabel: 'Training example'   // shown on every mock form in the game
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
      reportDays: 15,
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
      reportDays: 30,
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
    { id: 'rule-keeper', title: 'Rule Keeper',  rule: 'noCritical',     desc: 'Every attempt so far without breaking a critical rule.' },
    { id: 'last-mile-hero', title: 'Last Mile Hero', rule: 'allMissions', desc: 'Finished every mission.' }
  ],

  /* Unlockables shown on the NGO compound and the truck. */
  unlocks: [
    { id: 'truck-teal',   kind: 'truckColor', value: '#00A889', label: 'Teal truck',   rule: 'start' },
    { id: 'truck-sunset', kind: 'truckColor', value: '#F28C28', label: 'Sunset truck', rule: 'missionDone:M6' },
    { id: 'flag',         kind: 'decor',      value: 'flag',    label: 'Compound flag', rule: 'stars3:M6' }
  ],

  /* ---------------------------------------------------------------------------
   * MISSIONS (the journey), in map order. A mission shows on the map only
   * when its game code exists; set playable: false to hide one. See README.md.
   * ------------------------------------------------------------------------- */
  missions: [
    /* =========================================================================
     * MISSION 1: GET ON THE PIPELINE  (SOP §4.2)
     * Walk the compound, pick up the right documents, take the file to the
     * cluster first, then sign up with the IOM CP team.
     * ======================================================================= */
    {
      id: 'M1', number: 1, title: 'Get on the Pipeline', place: 'Your office', color: '#F5B301',
      topic: 'Eligibility and onboarding', host: 'nyakuoth', playable: true,
      intro: 'Your organisation wants to join the Core Pipeline. Gather the right documents, take the file to the cluster, then sign up with the IOM CP team.',
      howTo: [
        'Tap the ground to walk (arrow keys work too).',
        'Tap a glowing document to pick it up. Leave the wrong ones.',
        'Take the full file to the cluster desk first, then to the IOM CP desk.'
      ],
      rulesInPlay: ['R1', 'R2', 'R7'],
      docsRef: 'SOP §4.2.1, §4.2.2',
      docs: [
        { id: 'D-01', text: 'Current registration documents', good: true, why: 'Legally registered: current registration documents in the partner file.', ref: 'SOP §4.2.1' },
        { id: 'D-02', text: 'DDA form, completed', good: true, why: 'The DDA is mandatory for CP access.', ref: 'SOP §4.2.2' },
        { id: 'D-03', text: 'Proof of cluster membership: meetings and 5W reports', good: true, why: 'Active cluster member: attends coordination meetings and reports through the 5W.', ref: 'SOP §4.2.1' },
        { id: 'D-04', text: 'Project plan: response or preparedness', good: true, why: 'Humanitarian purpose: a response or preparedness intervention consistent with the response plan.', ref: 'SOP §4.2.1' },
        { id: 'D-05', text: 'Budget for transport and insurance', good: true, why: 'Own funding: transport from the warehouse and insurance of items in your custody.', ref: 'SOP §4.2.1' },
        { id: 'D-06', text: 'All distribution reports submitted', good: true, why: 'Reporting up to date: no distribution report overdue for the same state.', ref: 'SOP §4.2.1' },
        { id: 'D-07', text: 'Registration certificate (expired)', why: 'Registration documents must be current.', ref: 'SOP §4.2.1' },
        { id: 'D-08', text: 'DDA validated 30 months ago', why: 'The DDA is re-validated every 24 months.', ref: 'SOP §4.2.2' },
        { id: 'D-09', text: 'Letter: another NGO will distribute for us', critical: 'R7', why: 'You must distribute directly in the target area, without an intermediary.', ref: 'SOP §4.2.1' },
        { id: 'D-10', text: 'Report list: one distribution report overdue', why: 'No distribution report may be overdue for the same state.', ref: 'SOP §4.2.1' }
      ],
      badPerRun: 3,
      clusterFirst: { why: 'The DDA and registration documents go to the cluster first. The CP team issues the agreement after validation.', ref: 'SOP §4.2.2' },
      incomplete: { why: 'The cluster validates from a complete file. Collect every right document first.', ref: 'SOP §4.2.2 (Step 2 timeline)' },
      validation: { speaker: 'nyakuoth', text: 'Thank you. We check your capacity, presence and coordination within 3 to 5 working days from a complete file.', ref: 'SOP §4.2.2' },
      /* At the IOM CP desk, in this order. */
      signup: [
        { id: 'S-01', speaker: 'lual', prompt: 'Here is the CP distribution agreement. What does signing it give you?',
          options: [
            { text: 'The right to request. Each release still depends on cluster endorsement and stock.', correct: true },
            { text: 'Kits whenever we ask for them.', why: 'The agreement does not guarantee release.' }
          ], explain: 'You also sign the data protection annex.', ref: 'SOP §4.2.2, §8 (A); A1 Step 1' },
        { id: 'S-02', speaker: 'lual', prompt: 'Who will be your Requester?',
          options: [
            { text: 'One focal point, for requests, reporting and liaison with IOM.', correct: true },
            { text: 'Three staff, so someone is always free.', why: 'The CP team registers one partner focal point as Requester.' }
          ], explain: 'One Requester keeps requests and reports in one place.', ref: 'SOP §4.2.2' },
        { id: 'S-03', speaker: 'lual', prompt: 'Orientation day. What will it cover?',
          options: [
            { text: 'The SOP, reporting, data protection, PSEA, GBV risk mitigation and the non-fee model.', correct: true },
            { text: 'Only how to fill in the request form.', why: 'Orientation covers the SOP, reporting, data protection, PSEA, GBV risk mitigation and the non-fee model.' }
          ], explain: 'A refresher runs twice a year and when a form or system changes.', ref: 'SOP §4.2.2' }
      ],
      /* Majok's shortcuts while you collect. */
      eventsPerRun: 2,
      events: [
        { id: 'E-11', speaker: 'majok', prompt: '"Let\'s send a request today and sign the agreement later."',
          options: [
            { text: 'No. No request before onboarding is complete.', correct: true },
            { text: 'Send it, they will understand.', critical: 'R2' }
          ], explain: 'CP access starts after the DDA, cluster validation and the signed agreement.', ref: 'SOP §4.2; A1 Step 1' },
        { id: 'E-12', speaker: 'majok', prompt: '"River Aid can request and distribute for us up north. Easy!"',
          options: [
            { text: 'No. We distribute directly, without an intermediary.', correct: true },
            { text: 'Good idea, it saves us a trip.', critical: 'R7' }
          ], explain: 'Direct distribution is an eligibility condition.', ref: 'SOP §4.2.1' },
        { id: 'E-13', speaker: 'majok', prompt: '"Should we pay a small fee to speed up the validation?"',
          options: [
            { text: 'No. All Core Pipeline activity is non-fee.', correct: true },
            { text: 'Yes, a small one.', critical: 'R1' }
          ], explain: 'No fee, cost or overhead, to anyone.', ref: 'SOP §1 (Modality)' }
      ]
    },

    /* =========================================================================
     * MISSION 2: NEEDS CHECK  (SOP §4.3)
     * Visit households: consent first, count households, skip duplicates,
     * note the most vulnerable. Then answer the cluster.
     * ======================================================================= */
    {
      id: 'M2', number: 2, title: 'Needs Check', place: 'Village', color: '#7A5CFA',
      topic: 'Needs assessment', host: 'nyakuoth', playable: true,
      intro: 'An alert reports families arriving in a village. Assess the needs: visit households, ask consent, and count households, not people.',
      howTo: [
        'Tap a house with a bubble: you walk there.',
        'Ask consent before you write anything.',
        'Count households. Skip families already covered.'
      ],
      rulesInPlay: ['R5', 'R8'],
      householdsPerRun: 5,
      households: [
        { id: 'H-01', kind: 'count',    text: 'A family of nine arrived last week. They sleep under a tree.' },
        { id: 'H-02', kind: 'count',    text: 'A family displaced by floods two weeks ago lost all their belongings.' },
        { id: 'H-03', kind: 'count',    text: 'A young couple with a baby arrived three days ago.' },
        { id: 'H-04', kind: 'priority', text: 'An older man lives alone. He walks with a stick.' },
        { id: 'H-05', kind: 'priority', text: 'A mother heads this household alone, with five children.' },
        { id: 'H-06', kind: 'priority', text: 'A girl cares for her three younger brothers. No adult lives here.' },
        { id: 'H-07', kind: 'priority', text: 'A family whose father uses a wheelchair.' },
        { id: 'H-08', kind: 'assisted', text: 'This family got the same kits from another partner last month. It shows in the 5W.' },
        { id: 'H-09', kind: 'assisted', text: 'Another partner registered this family for the same items last week.' },
        { id: 'H-10', kind: 'refuse',   text: 'A woman says she does not want to give her name or any details.' }
      ],
      consent: {
        ask: 'Introduce yourself and ask consent',
        skip: 'Start writing their names',
        why: 'Get consent before collecting any personal data.', ref: 'AG Art. 3; A6 (principles 1 and 4)'
      },
      outcomes: {
        count:    { ok: 'Count 1 household', bad: 'Count every person as one kit', why: 'Kits are planned per household: about 6 people on average.', badWhy: 'Count households, not people. Kits are planned per household.', ref: 'SOP §2.1, §4.4' },
        priority: { ok: 'Count 1 household and note the vulnerability', bad: 'Skip them, they can come later', why: 'Protection risks and highly vulnerable groups come first in prioritisation.', badWhy: 'Highly vulnerable households are a priority, not an afterthought.', ref: 'SOP §4.3 (Table 10); §4.6' },
        assisted: { ok: 'Skip: already assisted (checked in the 5W)', bad: 'Count them again', why: 'Needs are cross-checked against the 5W to avoid duplication.', badWhy: 'Counting them again duplicates assistance. Check the 5W.', ref: 'SOP §4.3; A1 Step 2' },
        refuse:   { ok: 'Respect it: record nothing personal', bad: 'Write her details anyway', critical: 'R8', why: 'Consent is free and voluntary. No consent, no personal data.', ref: 'A6 (principle 4); AG Art. 3' }
      },
      eventsPerRun: 2,
      events: [
        { id: 'E-21', speaker: 'majok', prompt: '"We assessed this village four months ago. Just reuse that report!"',
          options: [
            { text: 'No. An assessment is valid for 3 months.', correct: true },
            { text: 'Reuse it, it saves time.', why: 'An assessment is valid for 3 months.' }
          ], explain: 'A fresh assessment is done within 1 to 5 days of the alert.', ref: 'SOP §4.3' },
        { id: 'E-22', speaker: 'majok', prompt: '"Report people, not households. More kits for us!"',
          options: [
            { text: 'No. Kits are per household, and quantities are checked against the caseload.', correct: true },
            { text: 'Good idea.', why: 'Quantities are checked against caseload and kit. Kits are per household.' }
          ], explain: 'Honest numbers keep the request clean.', ref: 'SOP §2.1, §4.4' },
        { id: 'E-23', speaker: 'mabior', prompt: '"Put my relatives from town on your list too."',
          options: [
            { text: 'Only households assessed here, validated by the cluster.', correct: true },
            { text: 'Of course, chief.', critical: 'R5' }
          ], explain: 'Items go to the households identified in the assessment.', ref: 'AG Art. 3; SOP §4.3' },
        { id: 'E-24', speaker: 'nyakuoth', prompt: 'Who validates your assessment?',
          options: [
            { text: 'The cluster, cross-checking it with the 5W.', correct: true },
            { text: 'Nobody. It goes straight to the warehouse.', why: 'Needs are validated through the cluster and cross-checked against the 5W.' }
          ], explain: 'The assessment is attached to the request afterwards.', ref: 'SOP §4.3' },
        { id: 'E-25', speaker: 'nyakuoth', prompt: 'How soon after the alert should the assessment happen?',
          options: [
            { text: 'Within 1 to 5 days.', correct: true },
            { text: 'Within a month.', why: 'The assessment is done within 1 to 5 days of the trigger.' }
          ], explain: 'The target is 14 days at most from trigger to delivery.', ref: 'SOP §4.3; §4 (Figure 3)' }
      ],
      /* One track-specific question at the end. */
      trackEvents: {
        SNFI: { id: 'E-26', speaker: 'nyakuoth', prompt: 'Bamboo and wooden poles are easy to find here. What does that change?',
          options: [
            { text: 'The emergency shelter kit comes without bamboo and poles here.', correct: true },
            { text: 'Request bamboo and poles anyway.', why: 'Bamboo and poles are given only where they are not available locally.' }
          ], explain: 'Request exactly what is needed.', ref: 'SOP §2.1 (Table 2), §4.10; A5 §7' },
        WASH: { id: 'E-27', speaker: 'nyakuoth', prompt: 'What must go with your WASH request?',
          options: [
            { text: 'The assessment (less than 3 months old) and a project document.', correct: true },
            { text: 'Only the request form.', why: 'WASH requests need an assessment under 3 months old and a project document.' }
          ], explain: 'The WASH Cluster may ask for more documents.', ref: 'WS §1, §2' }
      }
    },

    /* =========================================================================
     * MISSION 3: REQUEST BUILDER  (SOP §4.4)
     * Snap the request together, pick the hub on the map, send it, then follow
     * it through the review gates.
     * ======================================================================= */
    {
      id: 'M3', number: 3, title: 'Request Builder', place: 'Cluster office', color: '#19A7E0',
      topic: 'Request and endorsement', host: 'lual', playable: true,
      intro: 'Your assessment is validated. Build the request like a puzzle, send it, and follow it through the review.',
      howTo: [
        'Read the request card at the top.',
        'Tap a piece below, then the matching slot on the form.',
        'Tap the right hub on the map, then send.'
      ],
      rulesInPlay: [],
      ref: 'SOP §4.4',
      hubs: [
        { id: 'Bor',     covers: 'Jonglei',                                x: 2.0,  z: 1.4 },
        { id: 'Bentiu',  covers: 'Unity',                                  x: 0.3,  z: -1.6 },
        { id: 'Malakal', covers: 'Upper Nile',                             x: 2.6,  z: -1.9 },
        { id: 'Renk',    covers: 'Renk returns and the Sudan crisis',      x: 3.0,  z: -3.4 },
        { id: 'Wau',     covers: 'Western Bahr el Ghazal',                 x: -2.4, z: 0.0, notTrack: 'WASH' },
        { id: 'Abyei',   covers: 'Abyei: returns, Sudan crisis, outbreaks', x: -1.6, z: -2.9 },
        { id: 'Juba',    covers: 'Main hub: consolidation and dispatch',   x: 1.0,  z: 3.3 }
      ],
      hubRef: 'SOP §2.2 (Table 3)',
      scenarios: [
        { id: 'Q-01', track: 'SNFI', place: 'Bor South, Jonglei', hh: 420, hub: 'Bor', kit: 'SNFI standard kit', assessed: '2 weeks ago' },
        { id: 'Q-02', track: 'SNFI', place: 'Rubkona, Unity', hh: 300, hub: 'Bentiu', kit: 'Emergency shelter kit', assessed: '10 days ago' },
        { id: 'Q-03', track: 'SNFI', place: 'Malakal, Upper Nile', hh: 250, hub: 'Malakal', kit: 'SNFI standard kit', assessed: '3 weeks ago' },
        { id: 'Q-04', track: 'SNFI', place: 'Jur River, Western Bahr el Ghazal', hh: 180, hub: 'Wau', kit: 'SNFI standard kit', assessed: '1 week ago' },
        { id: 'Q-05', track: 'SNFI', place: 'Abyei town', hh: 150, hub: 'Abyei', kit: 'Emergency shelter kit', assessed: '5 days ago' },
        { id: 'Q-06', track: 'WASH', place: 'Bor South, Jonglei', hh: 500, hub: 'Bor', kit: 'WASH standard kit', assessed: '2 weeks ago' },
        { id: 'Q-07', track: 'WASH', place: 'Rubkona, Unity', hh: 350, hub: 'Bentiu', kit: 'WASH standard kit', assessed: '1 week ago' },
        { id: 'Q-08', track: 'WASH', place: 'Renk, Upper Nile (returnees)', hh: 280, hub: 'Renk', kit: 'WASH standard kit', assessed: '4 days ago' },
        { id: 'Q-09', track: 'WASH', place: 'Abyei town', hh: 200, hub: 'Abyei', kit: 'WASH standard kit', assessed: '3 weeks ago' },
        { id: 'Q-10', track: 'WASH', place: 'Malakal, Upper Nile', hh: 240, hub: 'Malakal', kit: 'WASH standard kit', assessed: '10 days ago' }
      ],
      /* Form slots. Pieces use {hh}, {people}, {assessed}, {kit}. */
      slots: [
        { id: 'form', label: 'Form',
          pieces: {
            SNFI: [{ text: 'SNFI Pipeline Request Form, current version', ok: true },
                   { text: 'CPR Form 2026 (WASH)', why: 'Use your track\'s form: the SNFI Pipeline Request Form.' },
                   { text: 'Last year\'s request form', why: 'Use the current form version for each request.' }],
            WASH: [{ text: 'CPR Form 2026, a new copy', ok: true },
                   { text: 'SNFI Pipeline Request Form', why: 'Use your track\'s form: the CPR Form 2026.' },
                   { text: 'An old CPR form, reused', why: 'Download the latest CPR form for every new request.' }] },
          ref: 'SOP §4.4; WS §2' },
        { id: 'qty', label: 'Items and quantity',
          pieces: { ALL: [{ text: '{kit}: {hh}, one per household', ok: true },
                          { text: '{kit}: {people}, one per person', why: 'Quantities are checked against caseload and kit: one kit per household.' }] },
          ref: 'SOP §2.1, §4.4' },
        { id: 'att', label: 'Attachment',
          pieces: {
            SNFI: [{ text: 'Assessment, {assessed}, validated by the cluster', ok: true },
                   { text: 'Assessment from 4 months ago', why: 'An assessment is valid for 3 months.' }],
            WASH: [{ text: 'Assessment ({assessed}) and project document', ok: true },
                   { text: 'Assessment from 4 months ago', why: 'An assessment must be less than 3 months old.' }] },
          ref: 'SOP §4.3, §4.4; WS §1' },
        { id: 'decl', label: 'Reports',
          pieces: { ALL: [{ text: 'No overdue distribution report for this state', ok: true },
                          { text: 'One report overdue: send anyway', why: 'A request needs confirmation of no overdue report for the state.' }] },
          ref: 'SOP §4.2.1, §4.4' },
        { id: 'fmt', label: 'File',
          pieces: {
            SNFI: [{ text: 'Excel file', ok: true },
                   { text: 'Photo of a printed form', why: 'The form is sent in Excel by email.' }],
            WASH: [{ text: 'Excel, named SS_WC_CorePipeline_Org_Day_Month_Year', ok: true },
                   { text: 'PDF file', why: 'Excel only, no PDF, named SS_WC_CorePipeline_Orgname_Day_Month_Year.' }] },
          ref: 'SOP §4.4; WS §2' },
        { id: 'send', label: 'Send to',
          pieces: { ALL: [{ text: 'Email: cluster pipeline mailbox, CP team in copy', ok: true },
                          { text: 'WhatsApp to the CP officer', why: 'Send the form by email to the cluster pipeline mailbox, CP team in copy.' },
                          { text: 'Straight to the warehouse', why: 'Requests go through the cluster for endorsement. The warehouse releases only after that.' }] },
          ref: 'SOP §4.4' }
      ],
      gates: [
        { label: 'CP completeness check', time: '24 hours' },
        { label: 'State focal point review', time: '48 hours' },
        { label: 'Cluster national approval', time: '24 hours' }
      ],
      gatesRef: 'SOP §4.4',
      eventsPerRun: 2,
      events: [
        { id: 'E-31', speaker: 'lual', prompt: 'Completeness check: one line has the wrong item code.',
          options: [
            { text: 'Fix it and reply in the same email chain, quoting the request reference.', correct: true },
            { text: 'Leave it, the warehouse will sort it out.', why: 'Incomplete requests are returned with the correction needed.' }
          ], explain: 'About 1 request in 10 carries a wrong item or warehouse.', ref: 'SOP §4.4' },
        { id: 'E-32', speaker: 'majok', prompt: '"48 hours and the state focal point hasn\'t answered. Let\'s go and collect!"',
          options: [
            { text: 'No. Without feedback in 48 hours, the review passes to national level.', correct: true },
            { text: 'Go, silence means yes.', why: 'Silence moves the request up to national level. It is not endorsement.' }
          ], explain: 'Stock is released only against an endorsed request.', ref: 'SOP §4.4; A1 Step 1' },
        { id: 'E-33', speaker: 'nyakuoth', prompt: 'Another donor already funds your organisation to buy some of these items.',
          options: [
            { text: 'Disclose it in the request. Allocation takes it into account.', correct: true },
            { text: 'Keep quiet and get both.', why: 'A partner already funded for the same items discloses it at review.' }
          ], explain: 'Avoids duplication and stretches limited stock.', ref: 'SOP §4.4' },
        { id: 'E-34', speaker: 'lual', prompt: 'After endorsement, more households arrive at the site.',
          options: [
            { text: 'Justify the change in writing to the cluster, CP team in copy, within 24 hours and before activities start.', correct: true },
            { text: 'Just collect more kits at the warehouse.', why: 'Changes of location or caseload after endorsement are justified in writing first.' }
          ], explain: 'The endorsed request is what the warehouse releases.', ref: 'SOP §4.4' },
        { id: 'E-35', speaker: 'lual', prompt: 'Your request is approved. What happens next?',
          options: [
            { text: 'The CP team confirms availability within 72 hours, then I book the collection.', correct: true },
            { text: 'I can collect today without notice.', why: 'Availability is confirmed within 72 hours; collection is confirmed at least 24 hours ahead.' }
          ], explain: 'Release follows within 3 working days.', ref: 'SOP §4.5, §4.5.1' }
      ]
    },
    /* =========================================================================
     * MISSION 4: WAREHOUSE PICKUP  (SOP §4.5)
     * Book the collection, drive in, check the load and the kit, sign the
     * issuance form: the truck becomes yours.
     * ======================================================================= */
    {
      id: 'M4', number: 4, title: 'Warehouse Pickup', place: 'IOM hub', color: '#0033A0',
      topic: 'Collection', host: 'deng', playable: true,
      intro: 'Your request is endorsed and the stock is confirmed. Book the collection, drive in, check the load, and sign for it.',
      howTo: [
        'Tap a day on the calendar to book the collection.',
        'Tap the damaged cartons, then check the kit.',
        'Sign the right document: the truck becomes yours.'
      ],
      rulesInPlay: ['R5'],
      book: {
        prompt: 'It is Monday morning. Stock is confirmed and approved stock is held 15 days. When will you collect?',
        days: 20, hold: 15,
        tooSoon: { why: 'Confirm the collection at least 24 hours ahead. Without notice the warehouse may refuse release.', ref: 'SOP §4.5.1' },
        tooLate: { why: 'Approved stock is held 15 days. Uncollected lines then return to available stock for other partners.', ref: 'SOP §4.5.1, §4.10' },
        ok: { why: 'Booked at least 24 hours ahead, within the 15-day hold.', ref: 'SOP §4.5.1' }
      },
      inspect: {
        cartons: 10, damaged: 3,
        ok: { why: 'At collection you check quantity and condition before you sign.', ref: 'SOP §4.5.1; §7.2 (Quality)' },
        missed: { why: 'A damaged carton was missed. Check condition before you sign: after signature it is yours.', ref: 'SOP §4.5.1' },
        good: { why: 'That carton is fine. Look for torn or wet ones.', ref: 'SOP §4.5.1' }
      },
      kitCheck: {
        prompt: 'Which item does not belong in it?',
        intruders: {
          SNFI: ['1 bucket with tap', '1 filter cloth', '290 water purification tablets', '2 bars of soap'],
          WASH: ['2 blankets', '1 kitchen set', '1 solar lamp', '2 plastic sheets 4x6m']
        },
        ok: { why: 'Kit contents are set by the clusters. A wrong item is raised before signing.', ref: 'SOP §2.1 (Table 2); §7.2 (Quality)' },
        bad: { why: 'That item belongs in this kit. Check the list again.', ref: 'SOP §2.1 (Table 2)' }
      },
      sign: { id: 'S-41', speaker: 'deng', prompt: 'Everything is checked. Which document do you sign?',
        options: [
          { text: 'The issuance form: signed by both of us, stamped and dated. I keep a copy.', correct: true },
          { text: 'A waybill.', why: 'Waybills are for transfers between IOM locations. A release to a partner uses an issuance form.' }
        ], explain: 'Responsibility transfers to you at signature.', ref: 'SOP §4.5.1, §4.5.2 (Table 11)' },
      handover: { why: 'Signed: the kits are now yours to transport, keep safe and insure until distribution.', ref: 'SOP §4.5.1, §4.6.2; AG Art. 2' },
      eventsPerRun: 2,
      events: [
        { id: 'E-41', speaker: 'majok', prompt: '"We\'re late! Skip the checks and just sign."',
          options: [
            { text: 'No. Check quantity and condition first, then sign.', correct: true },
            { text: 'Fine, sign quickly.', why: 'At collection the partner checks quantity and condition, then signs.' }
          ], explain: 'Once signed, any problem is yours.', ref: 'SOP §4.5.1' },
        { id: 'E-42', speaker: 'majok', prompt: '"Load a few extra kits. Nobody will notice."',
          options: [
            { text: 'No. Only the approved quantity, for the assessed households.', correct: true },
            { text: 'Good idea.', critical: 'R5' }
          ], explain: 'Items go only to the households identified in the assessment.', ref: 'AG Art. 3; SOP §4.2.3' },
        { id: 'E-43', speaker: 'deng', prompt: 'Who takes the kits from here to your site?',
          options: [
            { text: 'We do. Transport from the warehouse is ours, funded by our donors.', correct: true },
            { text: 'IOM drives them to our site.', why: 'Partners hold full responsibility for last-mile transport.' }
          ], explain: 'The Logistics Cluster can support with common services.', ref: 'SOP §4.5.3, §4.2.1' },
        { id: 'E-44', speaker: 'majok', prompt: '"Insurance? IOM insures the kits until we hand them out, right?"',
          options: [
            { text: 'No. We insure the items from collection until distribution.', correct: true },
            { text: 'Yes, IOM covers it.', why: 'IOM does not insure CP items after release.' }
          ], explain: 'Insurance of items in custody is part of eligibility.', ref: 'SOP §4.6.2, §4.2.1' },
        { id: 'E-45', speaker: 'deng', prompt: 'Your truck is small. Take half now and the rest next month?',
          options: [
            { text: 'No. We collect everything within the 15-day hold.', correct: true },
            { text: 'Yes, next month is fine.', why: 'Approved stock is held 15 days, then uncollected lines return to available stock.' }
          ], explain: 'Plan transport so you can collect in time.', ref: 'SOP §4.5.1, §4.10' }
      ]
    },

    /* =========================================================================
     * MISSION 5: ROAD TO THE SITE  (SOP §4.5.3, §4.6.1, §4.6.2)
     * Drive the kits to the site: steer around mud and rocks, and make the
     * right call at each stop.
     * ======================================================================= */
    {
      id: 'M5', number: 5, title: 'Road to the Site', place: 'River road', color: '#8B5E34',
      topic: 'Transport and loss reporting', host: 'majok', playable: true,
      intro: 'The kits are yours now. Drive them safely to the distribution site. Steer around mud and rocks, and make the right call when trouble comes.',
      howTo: [
        'Swipe left or right, tap the arrows, or use the arrow keys to change lane.',
        'Avoid mud and rocks.',
        'When the truck stops, make the call.'
      ],
      rulesInPlay: ['R3', 'R5'],
      drive: { seconds: 36 },
      first: { id: 'E-51', speaker: 'nyakuoth', prompt: 'Before you leave: who clears the movement and the distribution?',
        options: [
          { text: 'The RRC (Relief and Rehabilitation Commission), at state and county level.', correct: true },
          { text: 'Nobody, we just go.', why: 'The RRC gives government clearance for movement and distribution.' }
        ], explain: 'Clearance comes before distribution.', ref: 'SOP §3.1 (Table 4)' },
      eventsPerRun: 3,
      events: [
        { id: 'E-52', speaker: 'majok', prompt: 'The road ahead is cut by water. Can anyone help move the kits by river?',
          options: [
            { text: 'Ask the Logistics Cluster: it supports partners\' last-mile transport.', correct: true },
            { text: 'Call IOM to deliver them for us.', why: 'Partners hold full responsibility for last-mile transport.' }
          ], explain: 'The Logistics Cluster supports partners, not CP prepositioning.', ref: 'SOP §3.1, §4.5.3' },
        { id: 'E-53', speaker: 'majok', prompt: 'A trader offers good cash for ten kits.',
          options: [
            { text: 'No sale, ever. The kits go to the assessed households.', correct: true },
            { text: 'Sell ten, we have plenty.', critical: 'R5' }
          ], explain: 'Selling kits is diversion.', ref: 'AG Art. 3; SOP §4.2.3' },
        { id: 'E-54', speaker: 'majok', prompt: 'At a checkpoint, a man wants a few kits to let you pass.',
          options: [
            { text: 'Refuse. Kits go only to the assessed households.', correct: true },
            { text: 'Give him a few, it is easier.', critical: 'R5' }
          ], explain: 'If items are taken anyway, report it within 24 hours.', ref: 'AG Art. 3; SOP §4.6.2' },
        { id: 'E-55', speaker: 'majok', prompt: 'At night, thieves take kits from the truck.',
          options: [
            { text: 'Report it to the CP team and the cluster within 24 hours, on the Loss and Damage form, with a police report.', correct: true },
            { text: 'Mention it in next month\'s distribution report.', critical: 'R3' }
          ], explain: 'The 24-hour clock starts when you become aware.', ref: 'SOP §4.6.2' },
        { id: 'E-56', speaker: 'majok', prompt: 'Heavy rain soaks some cartons. Some items are ruined.',
          options: [
            { text: 'Report the damage within 24 hours on the Loss and Damage form.', correct: true },
            { text: 'Hide the damaged ones and say nothing.', critical: 'R3' }
          ], explain: 'Loss and damage both follow the 24-hour route.', ref: 'SOP §4.6.2' },
        { id: 'E-57', speaker: 'nyakuoth', prompt: 'Fighting closes the road to the site. Distribute in the next village instead?',
          options: [
            { text: 'Only with a written justification, agreed with the cluster first, CP team informed.', correct: true },
            { text: 'Yes, go there now.', why: 'Changes of site are justified in writing and agreed with the cluster before implementation.' }
          ], explain: 'The change is also reported in the distribution report.', ref: 'SOP §4.6.1' },
        { id: 'E-58', speaker: 'majok', prompt: '"Let\'s keep some kits in our store for the next project."',
          options: [
            { text: 'No. Released kits cannot be kept or repurposed without written agreement.', correct: true },
            { text: 'Good idea.', why: 'Items released but not distributed cannot be retained, repurposed or moved without written agreement.' }
          ], explain: 'The CP team and the cluster decide what happens to them.', ref: 'SOP §4.10' },
        { id: 'E-59', speaker: 'majok', prompt: '"Let\'s rest a week before we distribute."',
          options: [
            { text: 'No. We distribute within 1 to 5 days of collection.', correct: true },
            { text: 'Sure, we earned it.', why: 'Distribution happens within 1 to 5 days of collection.' }
          ], explain: 'Kits waiting in a truck or store are at risk.', ref: 'SOP §4.6' }
      ],
      obstacles: { avoidPoints: 20, hitSlow: 1.4 }
    },

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
        seconds: 25,              // a short, busy rush (event calls pause the clock)
        spawnEvery: 1.7,          // a new arrival every ... seconds
        patience: 11,             // seconds a person waits for you before leaving
        doorToDoorEvery: 9,       // a household that cannot reach the site calls for help
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
      eventsPerRun: 2,
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

    /* =========================================================================
     * MISSION 7: REPORT BACK  (SOP §4.7, §4.8, §4.2.3) + the final emergency
     * ======================================================================= */
    {
      id: 'M7', number: 7, title: 'Report Back', place: 'Your office', color: '#D6246E',
      topic: 'Reporting, PDM and compliance', host: 'lual', playable: true,
      intro: 'The distribution is done. Report on time for your track, update the 5W, welcome monitoring, then lead one last emergency.',
      howTo: [
        'Tap the right pieces into the report before the deadline.',
        'Answer the calls.',
        'Finish the emergency: every rule counts.'
      ],
      rulesInPlay: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8'],
      report: {
        ref: 'SOP §4.7',
        seconds: 24,        // real seconds the calendar takes to reach the track deadline
        callAt: 0.4,        // share of the race when the first call (data request) rings
        pieces: [
          { id: 'P-01', text: 'Signed beneficiary list', good: true },
          { id: 'P-02', text: 'Items distributed, by location', good: true },
          { id: 'P-03', text: 'Results and difficulties', good: true },
          { id: 'P-04', text: 'Any loss or damage', good: true },
          { id: 'P-05', text: 'Photos, with signed consent', good: true },
          { id: 'P-06', text: 'Training on item use: attendance by sex, age and disability', good: true },
          { id: 'P-11', text: 'Estimated numbers, no list', why: 'The report rests on the signed beneficiary list, not estimates.', ref: 'SOP §4.7; A2 §4' },
          { id: 'P-12', text: 'Photos taken without consent', why: 'Images of people require signed consent.', ref: 'SOP §4.6 (Visibility), §4.7' },
          { id: 'P-13', text: 'Names added after the distribution', critical: 'R6', why: 'No name is added to the beneficiary list without IOM written consent.', ref: 'AG Art. 3' },
          { id: 'P-14', text: 'Beneficiary phone list for a trader', critical: 'R8', why: 'Beneficiary data is shared only on a need-to-know basis.', ref: 'AG Art. 3; A6' }
        ],
        badPerRun: 2,
        late: { why: 'The report was late. Late reports trigger a reminder, then a hold on new requests for that state.', ref: 'SOP §4.7, §4.2.3' },
        onTime: { why: 'On time, with the signed list, photos with consent and training attendance.', ref: 'SOP §4.7' }
      },
      callsPerRun: 3,
      firstCall: { id: 'K-01', speaker: 'lual', prompt: 'IOM asks for the beneficiary data. How do you send it?',
        options: [
          { text: 'An encrypted, password-protected Excel file by email; the password by another channel.', correct: true },
          { text: 'A plain list in a WhatsApp group.', critical: 'R8' }
        ], explain: 'Need-to-know, confidential, secure.', ref: 'AG Art. 3; A6' },
      calls: [
        { id: 'K-02', speaker: 'nyakuoth', prompt: 'The month ends. What about the 5W?',
          options: [
            { text: 'Update it by month end, CP team in copy.', correct: true },
            { text: 'Skip it, the report is enough.', why: 'The partner updates the 5W by month end, CP team in copy.' }
          ], explain: 'The 5W shows who is doing what, where.', ref: 'SOP §4.7; A1 Step 4' },
        { id: 'K-03', speaker: 'lual', prompt: 'The CP team arrives for a monitoring visit, without notice.',
          options: [
            { text: 'Welcome them and share our records.', correct: true },
            { text: 'Ask them to come back after giving notice.', why: 'Site visits can happen at any time, and spot checks can be unannounced.' }
          ], explain: 'Records are available on request.', ref: 'AG Art. 5; WS §5; SOP §7' },
        { id: 'K-04', speaker: 'lual', prompt: 'How long do you keep the distribution records?',
          options: [
            { text: 'Seven years after the agreement ends.', correct: true },
            { text: 'Until the report is sent.', why: 'Records are kept for 7 years after termination.' }
          ], explain: 'The CP is donor funded and subject to audit.', ref: 'AG Art. 5; SOP §7' },
        { id: 'K-05', speaker: 'nyakuoth', prompt: 'A partner keeps missing its reports. What happens?',
          options: [
            { text: 'A reminder, then a hold on new requests for that state, then suspension.', correct: true },
            { text: 'Nothing, reports are optional.', why: 'The compliance ladder: reminder, hold, suspension, de-registration.' }
          ], explain: 'Reporting is mandatory.', ref: 'SOP §4.2.3' },
        { id: 'K-06', speaker: 'lual', prompt: 'A suspended partner wants to come back. What is needed?',
          options: [
            { text: 'Meet the obligation, agree a corrective action plan, get written confirmation from the CP Manager.', correct: true },
            { text: 'Just send a new request.', why: 'Reinstatement needs the obligation met, a corrective action plan and written confirmation.' }
          ], explain: 'The path back is clear and written.', ref: 'SOP §4.2.3' }
      ],
      pdmCall: {
        SNFI: { id: 'K-07', speaker: 'lual', prompt: 'Who does post-distribution monitoring (PDM)?',
          options: [
            { text: 'We monitor our whole distribution; the CP team also checks a sample, on the items.', correct: true },
            { text: 'Only IOM does PDM.', why: 'Two PDMs: the partner\'s on the whole process, and the CP team\'s on a sample of distributions.' }
          ], explain: 'PDM runs 2 weeks to 4 months after the distribution.', ref: 'SOP §4.8' },
        WASH: { id: 'K-08', speaker: 'lual', prompt: 'When is your WASH PDM due?',
          options: [
            { text: 'Within 2 months of the distribution, to the WASH Cluster and the CP team, quoting the CPR reference.', correct: true },
            { text: 'Only if IOM asks.', why: 'WASH partners run PDM within 2 months and share it.' }
          ], explain: 'The CP team may also run its own PDM on a sample.', ref: 'WS §5; SOP §4.8' }
      },
      /* The final emergency: one scenario per run. A wrong (non-critical)
       * answer can lead to a consequence node. next: null ends the scenario. */
      finales: [
        { id: 'F-A', title: 'Floods near Bor', start: 'a1', nodes: {
          a1: { speaker: 'nyakuoth', text: 'Floods displace families near Bor. Your organisation is onboarded. What comes first?', ref: 'SOP §4.3',
                options: [{ text: 'Assess the needs within 1 to 5 days, with the cluster.', correct: true, next: 'a2' },
                          { text: 'Go to the warehouse and ask for kits today.', why: 'Stock is released only against an endorsed request, based on a validated assessment.', next: 'a1b' }] },
          a1b: { speaker: 'deng', text: 'The warehouse turns you away: no endorsed request. What now?', ref: 'SOP §4.4, §4.5',
                options: [{ text: 'Assess, then request through the cluster.', correct: true, next: 'a2' },
                          { text: 'Insist until they give in.', why: 'The endorsed request is the only route to release.', next: 'a2' }] },
          a2: { speaker: 'lual', text: 'You request kits for the flooded area. Which hub?', ref: 'SOP §2.2 (Table 3)',
                options: [{ text: 'Bor: it covers Jonglei.', correct: true, next: 'a3' }, { text: 'Wau.', why: 'Wau covers Western Bahr el Ghazal. Bor covers Jonglei.', next: 'a3' }, { text: 'Juba.', why: 'Bor is the hub for Jonglei.', next: 'a3' }] },
          a3: { speaker: 'majok', text: 'On the boat, water ruins some kits.', ref: 'SOP §4.6.2',
                options: [{ text: 'Report within 24 hours on the Loss and Damage form.', correct: true, next: 'a4' }, { text: 'Mention it in the final report.', critical: 'R3' }] },
          a4: { speaker: 'ayen', text: 'At the site, a woman says a staff member asked for sex in exchange for her kit.', ref: 'SOP §7.2, §7.3; IN/234',
                options: [{ text: 'Report it immediately through IOM PSEA channels.', correct: true, next: 'a5' }, { text: 'Log it for the monthly analysis.', critical: 'R4' }] },
          a5: { speaker: 'nyakuoth', text: 'The distribution is done. When is your report due?', ref: 'AG Art. 6; SOP §4.7',
                options: [{ text: 'Within {deadline}, on the {report}.', correct: true, next: null }, { text: 'When we find the time.', why: 'Your track\'s deadline is {deadline}.', next: null }] } } },
        { id: 'F-B', title: 'Returns in Renk', start: 'b1', nodes: {
          b1: { speaker: 'majok', text: 'Returnees arrive in Renk. "River Aid can request and distribute for us!"', ref: 'SOP §4.2.1',
                options: [{ text: 'No. We request and distribute ourselves.', correct: true, next: 'b2' }, { text: 'Great, less work.', critical: 'R7' }] },
          b2: { speaker: 'nyakuoth', text: 'Your assessment of the area is 4 months old.', ref: 'SOP §4.3',
                options: [{ text: 'Do a new one: an assessment is valid for 3 months.', correct: true, next: 'b3' }, { text: 'Use it anyway.', why: 'An assessment is valid for 3 months.', next: 'b2b' }] },
          b2b: { speaker: 'lual', text: 'The CP team returns your request: the assessment has expired. What now?', ref: 'SOP §4.4',
                options: [{ text: 'Do a new assessment and resend, quoting the reference.', correct: true, next: 'b3' }, { text: 'Complain and wait.', why: 'Incomplete requests come back with the correction needed.', next: 'b3' }] },
          b3: { speaker: 'lual', text: 'The state focal point has not answered for 48 hours.', ref: 'SOP §4.4',
                options: [{ text: 'The review passes to national level. We wait for approval.', correct: true, next: 'b4' }, { text: 'Silence means yes: go and collect.', why: 'Silence moves the request up. It is not endorsement.', next: 'b4' }] },
          b4: { speaker: 'mabior', text: '"Ask each family for a small fee for transport."', ref: 'SOP §1, §7.2',
                options: [{ text: 'No. The distribution is free.', correct: true, next: 'b5' }, { text: 'A small fee is fine.', critical: 'R1' }] },
          b5: { speaker: 'majok', text: '"Three late families: add them to the signed list."', ref: 'AG Art. 3',
                options: [{ text: 'Not without IOM written consent.', correct: true, next: null }, { text: 'Add them.', critical: 'R6' }] } } },
        { id: 'F-C', title: 'A rush week', start: 'c1', nodes: {
          c1: { speaker: 'deng', text: 'At collection, someone hands you a waybill to sign.', ref: 'SOP §4.5.2',
                options: [{ text: 'Releases to partners use the issuance form.', correct: true, next: 'c2' }, { text: 'Sign the waybill.', why: 'Waybills are for transfers between IOM locations.', next: 'c2' }] },
          c2: { speaker: 'majok', text: 'A trader offers cash for "spare" kits.', ref: 'AG Art. 3; SOP §4.2.3',
                options: [{ text: 'No sale: the kits go to assessed households.', correct: true, next: 'c3' }, { text: 'Sell the spares.', critical: 'R5' }] },
          c3: { speaker: 'ayen', text: 'A photographer wants pictures of children for the donor.', ref: 'SOP §4.6; A7',
                options: [{ text: 'Only with signed consent. If a child says no, no photo.', correct: true, next: 'c4' }, { text: 'Children are fine without consent.', critical: 'R8' }] },
          c4: { speaker: 'nyakuoth', text: 'The road to the site is blocked. Move the distribution?', ref: 'SOP §4.6.1',
                options: [{ text: 'Justify it in writing, agree with the cluster first, inform the CP team.', correct: true, next: 'c5' }, { text: 'Move now, explain later.', why: 'Changes are agreed with the cluster before implementation.', next: 'c5' }] },
          c5: { speaker: 'lual', text: 'Your report is overdue and a reminder arrives.', ref: 'SOP §4.2.3',
                options: [{ text: 'Send it now: otherwise new requests for the state go on hold.', correct: true, next: null }, { text: 'Ignore the reminder.', why: 'Next comes a hold on new requests for that state.', next: null }] } } }
      ]
    }
  ]
};
