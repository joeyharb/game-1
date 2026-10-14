/* =============================================================================
 * PIPELINE RUNNER v2: GAME CONTENT
 * -----------------------------------------------------------------------------
 * Everything a trainer may want to edit lives in this file: settings, colours,
 * characters, critical rules and the seven missions. The game logic in
 * index.html only READS this object.
 *
 * Sources (all in ../source/):
 *   "SOP"         = IOM South Sudan Core Pipeline Operations SOP (Draft 1, Sept 2026)
 *   "Budget tool" = CP Budget Tool v2 (Oct 2026): Parameters, Kits, Other Costs,
 *                   Budget, Summary sheets
 *
 * Every playable item carries a `ref` to the SOP section or budget sheet it
 * came from. See README.md for editing help and question_map.md for the
 * full traceability table.
 *
 * Mission types (one per level, see README.md):
 *   route   – drive a truck to the signposts in the right order
 *   catch   – a task card drops; send it to the right desk before it lands
 *   inspect – stamp forms APPROVE or RETURN (and point to the problem line)
 *   buffer  – run the warehouse month by month and act on the buffer band
 *   pack    – sort items on a conveyor belt into the right kit box
 *   budget  – predict which budget bars grow when something changes
 *   convoy  – drive an emergency convoy; each checkpoint is a decision
 * ========================================================================== */

window.GAME_CONTENT = {

  /* ---------------------------------------------------------------------------
   * META AND SETTINGS
   * ------------------------------------------------------------------------- */
  meta: {
    title: 'Pipeline Runner',
    subtitle: 'IOM South Sudan SNFI + WASH Core Pipeline training game',
    version: '2.0',
    sourceNote: 'Based on the IOM South Sudan Core Pipeline SOP (Draft 1, September 2026) and the CP Budget Tool v2 (October 2026).'
  },

  settings: {
    passMark: 0.80,              // overall accuracy needed to pass (0.80 = 80%)
    livesPerLevel: 3,
    pointsPerCorrect: 100,
    streakBonus: 20,             // extra points per answer in a streak
    streakBonusMax: 100,
    stars: { one: 0.5, two: 0.8, three: 1.0 },   // mission accuracy for 1, 2, 3 stars
    relaxedPaceFactor: 1.7,      // "Relaxed pace" on the home screen slows timed missions by this factor
    storageKey: 'pipelineRunner.v2'
  },

  /* Colours. IOM blue is the base. Change a value and reload. */
  theme: {
    iomBlue: '#0033A0',
    iomBlueDark: '#00205F',
    iomBlueLight: '#E6EEFA',
    background: '#EEF3FB',
    text: '#14213D',
    correct: '#12865A',
    wrong: '#C62E2E',
    warning: '#E08A00',
    gold: '#F5B301',
    grass: '#9BD08A',            // 3D world ground
    road: '#D9C08F',
    water: '#7CC3EA'
  },

  ranks: [
    { id: 'trainee', title: 'Trainee',         minAccuracy: 0,    requireAllLevels: false, note: 'Keep running: finish every mission and reach the pass mark.' },
    { id: 'pro',     title: 'Pipeline Pro',    minAccuracy: 0.80, requireAllLevels: true,  note: 'You know how the pipeline runs. Well done.' },
    { id: 'master',  title: 'Pipeline Master', minAccuracy: 0.95, requireAllLevels: true,  note: 'Near-perfect. You could teach this SOP.' }
  ],

  /* Badge rules: levelDone:<id> | stars3:<id> | flawless | streak:<n> | allLevels | noCritical | rank:<rankId> */
  badges: [
    { id: 'first-run',   title: 'First Run',        rule: 'levelDone:L1',  icon: 'route',  desc: 'Drove the full nine-step route.' },
    { id: 'flawless',    title: 'Flawless',         rule: 'flawless',      icon: 'shield', desc: 'Finished a mission without losing a life.' },
    { id: 'hot-streak',  title: 'Hot Streak',       rule: 'streak:6',      icon: 'flame',  desc: 'Six right moves in a row.' },
    { id: 'buffer',      title: 'Buffer Guardian',  rule: 'stars3:L4',     icon: 'gauge',  desc: 'Three stars on Buffer Watch.' },
    { id: 'budget',      title: 'Budget Brain',     rule: 'stars3:L6',     icon: 'coin',   desc: 'Three stars on Budget Builder.' },
    { id: 'rule-keeper', title: 'Rule Keeper',      rule: 'noCritical',    icon: 'lock',   desc: 'All 7 missions done with no critical-rule mistake.' },
    { id: 'all-levels',  title: 'End of the Line',  rule: 'allLevels',     icon: 'flag',   desc: 'Completed all 7 missions.' },
    { id: 'master',      title: 'Pipeline Master',  rule: 'rank:master',   icon: 'star',   desc: 'Reached the top rank.' }
  ],

  /* Acronyms are spelled out the first time they appear in a mission. */
  glossary: {
    'IOM': 'International Organization for Migration',
    'CP': 'Core Pipeline',
    'SOP': 'Standard Operating Procedure',
    'SNFI': 'Shelter and Non-Food Items',
    'NFI': 'Non-Food Items',
    'WASH': 'Water, Sanitation and Hygiene',
    'SWR': 'Stock Withdrawal Request',
    'IMS': 'Information Management System',
    'CPR': 'Core Pipeline Request',
    'DDA': 'Due Diligence Assessment',
    'LTA': 'Long Term Agreement',
    'LTAs': 'Long Term Agreements',
    'PDM': 'Post-Distribution Monitoring',
    'SFP': 'State Focal Point',
    'SLSC': 'Shelter, Land and Settlements Cluster',
    'MHM': 'Menstrual Hygiene Management',
    'PSEA': 'Prevention of Sexual Exploitation and Abuse',
    'GBV': 'Gender-Based Violence',
    'ETT': 'Emergency Tracking Tool',
    'DTM': 'Displacement Tracking Matrix',
    '5W': 'Who does What, Where, When and for Whom',
    'WAVE': 'IOM ERP system for requisitions and purchase orders',
    'PO': 'purchase order',
    'HH': 'households',
    'MT': 'metric tonnes',
    'FIFO': 'First In, First Out',
    'LIFO': 'Last In, First Out',
    'QC': 'quality control',
    'PSC': 'Programme Support Cost',
    'UNHAS': 'UN Humanitarian Air Service',
    'DSA': 'Daily Subsistence Allowance',
    'HNRP': 'Humanitarian Needs and Response Plan'
  },

  /* Characters (fictional names). look.hair: short|long|bun|headwrap|cap|bald
   * look.accessory: none|glasses|hardhat|lanyard|clipboard|tablet */
  characters: {
    achol:    { name: 'Achol',    role: 'Core Pipeline Manager',
                look: { skin: '#6B4226', hair: 'headwrap', hairColor: '#F5B301', shirt: '#0033A0', accessory: 'lanyard',   bg: '#DCE6F7' } },
    grace:    { name: 'Grace',    role: 'Partner Field Officer (NGO)',
                look: { skin: '#8D5524', hair: 'bun',      hairColor: '#1E1E1E', shirt: '#00A889', accessory: 'clipboard', bg: '#D3F2EA' } },
    deng:     { name: 'Deng',     role: 'Warehouse Manager',
                look: { skin: '#5A3A22', hair: 'short',    hairColor: '#1E1E1E', shirt: '#F28C28', accessory: 'hardhat',   bg: '#FDE7D1' } },
    peter:    { name: 'Peter',    role: 'Supply Chain Officer',
                look: { skin: '#7A4B2A', hair: 'short',    hairColor: '#2A2A2A', shirt: '#7A5CFA', accessory: 'glasses',   bg: '#E9E3FE' } },
    nyakuoth: { name: 'Nyakuoth', role: 'Cluster Coordinator',
                look: { skin: '#4E2F1C', hair: 'long',     hairColor: '#1E1E1E', shirt: '#D6246E', accessory: 'none',      bg: '#FBDDE9' } },
    lual:     { name: 'Lual',     role: 'CP Cluster Focal Point',
                look: { skin: '#6B4226', hair: 'cap',      hairColor: '#19A7E0', shirt: '#19A7E0', accessory: 'tablet',    bg: '#D8F0FB' } }
  },

  /* CRITICAL RULES: breaking one ends the mission at once. First draft, can
   * change with the SOP. Items point here with `critical: 'CR1'`. */
  criticalRules: {
    CR1: { title: 'No approved SWR, no dispatch',
           rule: 'The only authority to dispatch stock is an SWR approved in IMS by the CP Cluster Focal Point. No email, verbal instruction or other form replaces it, for releases to partners and for transfers between hubs.',
           ref: 'SOP §4.5' },
    CR2: { title: 'No cluster endorsement, no release',
           rule: 'Stock is released only against a request endorsed by the cluster. Step 5 starts only when the endorsed request reaches the CP team.',
           ref: 'SOP §3.1, §4.4, §4.5' },
    CR3: { title: 'The pipeline is free, without exception',
           rule: 'All CP activity is non-fee. Partners charge no fee, cost or overhead to IOM, to beneficiaries or to any third party. Charging beneficiaries leads to suspension.',
           ref: 'SOP §1, §4.2.3, §7.2' },
    CR4: { title: 'Only eligible partners in good standing',
           rule: 'CP access needs a completed onboarding (the DDA is mandatory). Requests from a partner on hold for that state, or suspended, are not processed.',
           ref: 'SOP §4.2' },
    CR5: { title: 'Loss, damage, theft or diversion: report within 24 hours',
           rule: 'The partner reports any incident to the CP team and the cluster within 24 hours of becoming aware, on the Loss and Damage form. IOM investigates every case.',
           ref: 'SOP §4.6.2' },
    CR6: { title: 'PSEA allegations go straight to IOM PSEA channels',
           rule: 'PSEA allegations are reported immediately through IOM PSEA channels. They bypass the normal complaints and feedback loop.',
           ref: 'SOP §7.2, §7.3' }
  },

  /* Buffer data (SOP §6, Figure 6). */
  buffer: {
    leadTimeMonths: 4,
    streams: {
      SNFI: { label: 'SNFI standard kits', monthlyConsumption: 11000 },
      WASH: { label: 'WASH standard kits', monthlyConsumption: 17000 }
    },
    bands: {
      green: { name: 'Healthy',              rule: 'above twice the buffer' },
      amber: { name: 'Consuming buffer',     rule: 'one to two times the buffer' },
      red:   { name: 'Urgent replenishment', rule: 'below the buffer' }
    }
  },

  /* ---------------------------------------------------------------------------
   * MISSIONS (levels)
   * ------------------------------------------------------------------------- */
  levels: [

    /* =========================================================================
     * MISSION 1: THE JOURNEY (route)
     * The truck drives to each signpost in turn. `stops` are in the correct
     * order; the game scatters them on the map.
     * ======================================================================= */
    {
      id: 'L1', number: 1, title: 'The Journey', station: 'Juba main hub', color: '#F5B301',
      host: 'achol', topic: 'CP workflow order', mission: 'route',
      intro: 'Welcome, new CP focal point! Every kit travels the same road. Drive the truck to each signpost in the right order.',
      howTo: 'Click the signpost the truck should go to next. Wrong turns cost a life.',
      routesPerRun: 2,
      routes: [
        { id: 'R-01', always: true, title: 'The nine CP steps',
          prompt: 'Drive a kit through the nine Core Pipeline steps, from first to last.',
          stops: ['Procurement and prepositioning', 'Partner onboarding', 'Trigger and needs assessment', 'Request and endorsement',
                  'Stock release', 'Distribution', 'Distribution reporting', 'Post-distribution monitoring', 'Closure'],
          explain: 'Procure and preposition, onboard partners, assess needs, request and endorse, release, distribute, report, monitor (PDM), close.',
          ref: 'SOP §4, Figure 3' },
        { id: 'R-02', title: 'Request review',
          prompt: 'A request has arrived. Drive it through the Step 4 review stages.',
          stops: ['CP completeness check (24h)', 'SFP sub-national review (48h)', 'Cluster national approval (24h)', 'CP confirms stock and allocates'],
          explain: 'CP team checks completeness in 24 hours, the SFP reviews in 48 hours (no feedback = passes to national level), the cluster approves, then the CP team allocates.',
          ref: 'SOP §4.4' },
        { id: 'R-03', title: 'Stock release',
          prompt: 'The request is endorsed. Drive it through the release procedure.',
          stops: ['CP team raises the SWR in IMS', 'CP Cluster Focal Point approves the SWR', 'Partner confirms collection 24h ahead', 'Partner checks and signs', 'Warehouse records the release in IMS'],
          explain: 'Approval commits the stock. The partner gives 24 hours notice, checks and signs (responsibility transfers at signature), then the warehouse records the release.',
          ref: 'SOP §4.5.1' },
        { id: 'R-04', title: 'Receipt in Juba',
          prompt: 'A supplier consignment is coming. Drive it through receipt.',
          stops: ['Pre-alert sent with the PO', 'Joint visual control and two counts', 'Receipt signed', 'Warehouse approves stock input', 'Prepositioned to field hubs'],
          explain: 'All items are received and quality controlled in Juba, counted twice and reconciled before signing, then become available and can be prepositioned.',
          ref: 'SOP §4.1.4, §4.1.5' },
        { id: 'R-05', title: 'Partner onboarding',
          prompt: 'A new organization wants CP access. Drive it through onboarding.',
          stops: ['DDA and registration to the cluster', 'Cluster validates (3 to 5 days)', 'CP team issues the agreement', 'One Requester registered', 'Orientation (SOP, PSEA, non-fee)'],
          explain: 'The DDA is mandatory and re-validated every 24 months. The agreement does not guarantee release.',
          ref: 'SOP §4.2.2' },
        { id: 'R-06', title: 'Supply chain journey',
          prompt: 'Follow a kit from supplier to household.',
          stops: ['LTA supplier delivers to Juba', 'Juba hub: consolidation and QC', 'Transfer to a field hub', 'Partner collects on a signed issuance form', 'Distribution to households'],
          explain: 'Juba is the only QC location. Stock then moves to the hubs (Wau, Malakal, Bentiu, Bor) and field warehouses (Abyei, Renk).',
          ref: 'SOP §2, Figure 1' },
        { id: 'R-07', title: 'Stock status in IMS',
          prompt: 'Follow one kit through its IMS stock statuses.',
          stops: ['Registered at PO stage', 'Available', 'Committed (SWR approved)', 'Released (dispatched and signed)'],
          explain: 'Stock registers at PO stage, becomes available when the warehouse approves the stock input, committed when the SWR is approved, and released on dispatch and signature.',
          ref: 'SOP §4.1.4, §5.1' },
        { id: 'R-08', title: 'Compliance ladder',
          prompt: 'A partner keeps missing reports. Climb the compliance ladder.',
          stops: ['Reminder', 'Hold', 'Suspension', 'De-registration'],
          explain: 'Reminder (written, with deadline), Hold (new requests for that state stop), Suspension (all CP access), De-registration (agreement terminated).',
          ref: 'SOP §4.2.3' }
      ]
    },

    /* =========================================================================
     * MISSION 2: WHO DOES WHAT (catch)
     * A task card drops. The player sends it to the right desk before it lands.
     * Every task's `role` must match a desk `role`.
     * ======================================================================= */
    {
      id: 'L2', number: 2, title: 'Who Does What', station: 'Bor hub', color: '#00A889',
      host: 'nyakuoth', topic: 'Roles and sign-off', mission: 'catch',
      intro: 'Tasks are raining down on the office! Send each one to the desk that owns it before it hits the floor.',
      howTo: 'Click the right desk (or press 1 to 6) before the card lands.',
      cardsPerRun: 8,
      fallSeconds: 9,
      desks: [
        { role: 'CP team',                char: 'achol' },
        { role: 'CP Cluster Focal Point', char: 'lual' },
        { role: 'Supply Chain',           char: 'peter' },
        { role: 'Warehouse',              char: 'deng' },
        { role: 'Cluster',                char: 'nyakuoth' },
        { role: 'Partner',                char: 'grace' }
      ],
      tasks: [
        { id: 'T-01', task: 'Demand forecast and procurement plan', role: 'CP team', ref: 'SOP §3.1, §3.2' },
        { id: 'T-02', task: 'Market assessment, LTAs and purchase orders in WAVE', role: 'Supply Chain', ref: 'SOP §3.1' },
        { id: 'T-03', task: 'Receipt, counting, storage and IMS stock input approval', role: 'Warehouse', ref: 'SOP §3.1' },
        { id: 'T-04', task: 'Validate needs, endorse targeting, decide allocation', role: 'Cluster', ref: 'SOP §3.1' },
        { id: 'T-05', task: 'Approve the SWR in IMS', role: 'CP Cluster Focal Point', ref: 'SOP §4.5, §4.11' },
        { id: 'T-06', task: 'Raise the SWR in IMS', role: 'CP team', ref: 'SOP §4.5' },
        { id: 'T-07', task: 'Pick, load and dispatch the stock', role: 'Warehouse', ref: 'SOP §4.5, §3.2' },
        { id: 'T-08', task: 'Confirm collection 24 hours ahead and sign at collection', role: 'Partner', ref: 'SOP §4.5.1' },
        { id: 'T-09', task: 'Needs assessment within 1 to 5 days', role: 'Partner', ref: 'SOP §4.3' },
        { id: 'T-10', task: 'Request completeness review within 24 hours', role: 'CP team', ref: 'SOP §4.4' },
        { id: 'T-11', task: 'Freight, customs clearance and transport from Juba to the hubs', role: 'Supply Chain', ref: 'SOP §3.1' },
        { id: 'T-12', task: 'Distribution report within 15 days and 5W update', role: 'Partner', ref: 'SOP §4.7' },
        { id: 'T-13', task: 'PDM on a sample of distributions, focused on the items', role: 'CP team', ref: 'SOP §4.8' },
        { id: 'T-14', task: 'Issue the distribution agreement and register the Requester', role: 'CP team', ref: 'SOP §4.2.2' },
        { id: 'T-15', task: 'Validate a new partner\'s capacity and presence', role: 'Cluster', ref: 'SOP §4.2.2' },
        { id: 'T-16', task: 'Report loss or theft within 24 hours', role: 'Partner', ref: 'SOP §4.6.2' },
        { id: 'T-17', task: 'Send the standing expiry alert', role: 'Warehouse', ref: 'SOP §5.2' },
        { id: 'T-18', task: 'National approval of the request', role: 'Cluster', ref: 'SOP §4.4' },
        { id: 'T-19', task: 'Monthly CP status snapshot', role: 'CP team', ref: 'SOP §5.3' }
      ]
    },

    /* =========================================================================
     * MISSION 3: SPOT THE ERROR (inspect)
     * Each form has at most ONE problem line (error: true) or none (clean).
     * APPROVE a clean form; for a faulty one, click the problem line, then
     * RETURN. Approving a form with a `critical` line ends the mission.
     * ======================================================================= */
    {
      id: 'L3', number: 3, title: 'Spot the Error', station: 'Wau hub', color: '#E5554F',
      host: 'grace', topic: 'Forms and documents', mission: 'inspect',
      intro: 'Your inbox is full. Check each form: stamp APPROVE if it is right, or point to the problem and stamp RETURN.',
      howTo: 'Clean form: APPROVE. Problem: click the wrong line, then RETURN.',
      docsPerRun: 6,
      docs: [
        { id: 'D-01', clean: true, title: 'Core Pipeline Request (CPR Form 2026)', subtitle: 'Hope Relief, Bor South (training example)',
          fields: [
            { label: 'Form version', value: 'CPR Form 2026 (current)' },
            { label: 'Target households', value: '500 households, Bor South, Jonglei' },
            { label: 'Item line', value: 'SNFI standard kit, quantity 500' },
            { label: 'Warehouse', value: 'Bor hub' },
            { label: 'Needs assessment', value: '3 weeks ago, validated by the cluster' }
          ],
          explain: 'Current form, quantities match the caseload, the right hub, a valid assessment: approve.', ref: 'SOP §4.3, §4.4' },
        { id: 'D-02', title: 'Core Pipeline Request (CPR Form 2026)', subtitle: 'Hope Relief, Bor South (training example)',
          fields: [
            { label: 'Form version', value: 'CPR Form 2026 (current)' },
            { label: 'Target households', value: '500 households, Bor South, Jonglei' },
            { label: 'Item line', value: 'SNFI standard kit, quantity 500' },
            { label: 'Warehouse', value: 'Wau hub', error: true, why: 'Bor is covered by the Bor logistics hub (Jonglei). Wau covers Western Bahr el Ghazal. About 10% of requests carry a wrong item or warehouse.' },
            { label: 'Needs assessment', value: '3 weeks ago, validated by the cluster' }
          ],
          explain: 'The completeness review checks item codes, warehouse, quantities, assessment validity and overdue reports.', ref: 'SOP §2.2, §4.4' },
        { id: 'D-03', title: 'Core Pipeline Request (CPR Form 2026)', subtitle: 'Hope Relief, Bor South (training example)',
          fields: [
            { label: 'Form version', value: 'CPR Form 2026 (current)' },
            { label: 'Target households', value: '500 households, Bor South, Jonglei' },
            { label: 'Item line', value: 'SNFI standard kit, quantity 500' },
            { label: 'Warehouse', value: 'Bor hub' },
            { label: 'Needs assessment', value: '5 months ago', error: true, why: 'A needs assessment is valid for 3 months.' }
          ],
          explain: 'Assessment validity is part of the 24-hour completeness review.', ref: 'SOP §4.3, §4.4' },
        { id: 'D-04', title: 'SNFI Pipeline Request Form', subtitle: 'Hope Relief (training example)',
          fields: [
            { label: 'Form version', value: 'Current version' },
            { label: 'Target households', value: '400 households (2,400 people)' },
            { label: 'SNFI standard kits requested', value: '2,400', error: true, why: 'Quantities are checked against caseload and kit. 2,400 is the number of people (400 HH × 6), not households.' },
            { label: 'Sent to', value: 'Cluster pipeline mailbox, CP team in copy' }
          ],
          explain: 'Planning uses 6 persons per household; kits are planned per household.', ref: 'SOP §2.1, §4.4' },
        { id: 'D-05', title: 'SNFI Pipeline Request Form', subtitle: 'Hope Relief (training example)',
          fields: [
            { label: 'Form version', value: 'Current version' },
            { label: 'Target households', value: '400 households' },
            { label: 'SNFI standard kits requested', value: '400' },
            { label: 'Sent to', value: 'CP officer by WhatsApp only', error: true, why: 'The form is sent in Excel by email to the cluster pipeline mailbox, with the CP team in copy.' }
          ],
          explain: 'The request reference is then quoted in all later correspondence.', ref: 'SOP §4.4' },
        { id: 'D-06', clean: true, title: 'Release to partner', subtitle: 'Bentiu hub (training example)',
          fields: [
            { label: 'Dispatch authority', value: 'SWR approved in IMS by the CP Cluster Focal Point' },
            { label: 'Release document', value: 'Issuance form' },
            { label: 'Collection notice', value: 'Confirmed 2 days ahead' },
            { label: 'Partner signature', value: 'At collection, after checking quantity and condition' }
          ],
          explain: 'Approved SWR, issuance form, 24 hours notice and a signature at collection: approve.', ref: 'SOP §4.5, §4.5.1, §4.5.2' },
        { id: 'D-07', title: 'Release to partner', subtitle: 'Bentiu hub (training example)',
          fields: [
            { label: 'Dispatch authority', value: 'Email from the CP officer', error: true, critical: 'CR1', why: 'Only an SWR approved in IMS by the CP Cluster Focal Point authorizes dispatch. An email never replaces it.' },
            { label: 'Release document', value: 'Issuance form' },
            { label: 'Collection notice', value: 'Confirmed 2 days ahead' },
            { label: 'Partner signature', value: 'At collection, after checking quantity and condition' }
          ],
          explain: 'No email, verbal instruction or other form replaces the approved SWR.', ref: 'SOP §4.5' },
        { id: 'D-08', title: 'Release to partner', subtitle: 'Bentiu hub (training example)',
          fields: [
            { label: 'Dispatch authority', value: 'SWR approved in IMS by the CP Cluster Focal Point' },
            { label: 'Release document', value: 'Waybill', error: true, why: 'A release to a partner uses an issuance form. Waybills are for transfers between IOM locations.' },
            { label: 'Collection notice', value: 'Confirmed 2 days ahead' },
            { label: 'Partner signature', value: 'At collection, after checking quantity and condition' }
          ],
          explain: 'Both documents are generated from IMS and carry the SWR number.', ref: 'SOP §4.5.2' },
        { id: 'D-09', clean: true, title: 'Hub transfer Juba to Bentiu', subtitle: '4 trucks (training example)',
          fields: [
            { label: 'Authority', value: 'SWR approved in IMS by the CP Cluster Focal Point' },
            { label: 'Documents', value: '4 waybills, one per truck' },
            { label: 'Signed by', value: 'Driver at pickup, receiver on delivery' },
            { label: 'Reference', value: 'SWR number on every waybill' }
          ],
          explain: 'Transfers need an approved SWR too, with one waybill per truck loaded: approve.', ref: 'SOP §4.5, §4.5.2' },
        { id: 'D-10', title: 'Hub transfer Juba to Bentiu', subtitle: '4 trucks (training example)',
          fields: [
            { label: 'Authority', value: 'Verbal instruction from the warehouse manager', error: true, critical: 'CR1', why: 'Transfers between hubs need an SWR approved in IMS by the CP Cluster Focal Point. No verbal instruction replaces it.' },
            { label: 'Documents', value: '4 waybills, one per truck' },
            { label: 'Signed by', value: 'Driver at pickup, receiver on delivery' },
            { label: 'Reference', value: 'SWR number on every waybill' }
          ],
          explain: 'The approved SWR is the only dispatch authority, for partner releases and hub transfers.', ref: 'SOP §4.5' },
        { id: 'D-11', title: 'Receipt record', subtitle: 'Juba main hub (training example)',
          fields: [
            { label: 'Receipt location', value: 'Juba main hub' },
            { label: 'Visual control', value: 'Joint: warehouse, CP and procurement' },
            { label: 'Counting', value: 'One count by the warehouse team', error: true, why: 'Two independent counts, warehouse and CP, reconciled before the receipt is signed, with the driver present.' },
            { label: 'Damage', value: 'Photographed before signing' }
          ],
          explain: 'Juba is the only QC location: joint visual control, two counts, photos before signing.', ref: 'SOP §4.1.4' },
        { id: 'D-12', title: 'Partner file', subtitle: 'River Aid (training example)',
          fields: [
            { label: 'Registration documents', value: 'Current' },
            { label: 'Cluster membership', value: 'Attends meetings and reports through the 5W' },
            { label: 'DDA', value: 'Last validated 30 months ago', error: true, why: 'The DDA is mandatory and re-validated every 24 months.' },
            { label: 'Requester', value: 'One partner focal point' }
          ],
          explain: 'The cluster confirms eligibility at onboarding and annually.', ref: 'SOP §4.2.1, §4.2.2' },
        { id: 'D-13', title: 'Partner file', subtitle: 'River Aid (training example)',
          fields: [
            { label: 'Registration documents', value: 'Current' },
            { label: 'DDA', value: 'Validated 6 months ago' },
            { label: 'Beneficiary registration', value: 'Small fee per household to cover staff costs', error: true, critical: 'CR3', why: 'All CP activity is non-fee. Charging beneficiaries is a suspension trigger.' },
            { label: 'Requester', value: 'One partner focal point' }
          ],
          explain: 'Distribution is free without exception.', ref: 'SOP §1, §4.2.3, §7.2' },
        { id: 'D-14', title: 'SNFI distribution report', subtitle: 'Hope Relief (training example)',
          fields: [
            { label: 'Submitted', value: '12 days after distribution' },
            { label: 'Signed beneficiary list', value: 'Attached' },
            { label: 'Loss', value: '20 blankets stolen 3 weeks ago, first reported here', error: true, critical: 'CR5', why: 'Loss or theft is reported within 24 hours of becoming aware, on the Loss and Damage form, not weeks later in a report.' },
            { label: '5W', value: 'Updated, CP team in copy' }
          ],
          explain: 'Incidents have their own 24-hour route.', ref: 'SOP §4.6.2, §4.7' },
        { id: 'D-15', clean: true, title: 'SNFI distribution report', subtitle: 'Hope Relief (training example)',
          fields: [
            { label: 'Submitted', value: '12 days after distribution' },
            { label: 'Signed beneficiary list', value: 'Attached' },
            { label: 'Photographs', value: 'Attached, with signed consent' },
            { label: '5W', value: 'Updated, CP team in copy' }
          ],
          explain: 'Within the 15-day target, signed list, consent for images, 5W updated: approve.', ref: 'SOP §4.6, §4.7' },
        { id: 'D-16', title: 'Distribution plan', subtitle: 'Hope Relief, Bor South (training example)',
          fields: [
            { label: 'Community information', value: 'Shared in advance through leaders and authorities' },
            { label: 'Distribution team', value: 'Mixed-gender, trained in PSEA and GBV risk mitigation' },
            { label: 'Complaints', value: 'Hotline only, no desk at the site', error: true, why: 'A complaints desk is staffed at every site by trained personnel.' },
            { label: 'People who cannot reach the site', value: 'Door-to-door delivery' }
          ],
          explain: 'Distribution standards cover information, team, site, complaints desk, verification and visibility.', ref: 'SOP §4.6' },
        { id: 'D-17', title: 'Complaints and feedback log', subtitle: 'Distribution site (training example)',
          fields: [
            { label: 'Queue complaint', value: 'Resolved on the day' },
            { label: 'PSEA allegation against a staff member', value: 'Logged in the register for monthly analysis', error: true, critical: 'CR6', why: 'PSEA allegations bypass the feedback loop and are reported immediately through IOM PSEA channels.' },
            { label: 'Patterns', value: 'Reported in the distribution report and PDM' }
          ],
          explain: 'Feedback is recorded, acted on and closed. PSEA allegations go straight to IOM channels.', ref: 'SOP §7.2, §7.3' }
      ]
    },

    /* =========================================================================
     * MISSION 4: BUFFER WATCH (buffer)
     * Run a warehouse for several months. Each month: act on the band.
     * The SOP gives consumption, buffer and band actions. The `sim` numbers
     * below are GAME SIMPLIFICATIONS (start stock, delivery size, spikes,
     * rationing effect) and are shown as such to players.
     * ======================================================================= */
    {
      id: 'L4', number: 4, title: 'Buffer Watch', station: 'Bentiu hub', color: '#F28C28',
      host: 'peter', topic: 'Buffer bands and replenishment', mission: 'buffer',
      intro: 'You run the stock for the next months. Orders take 4 months to arrive. Read the band every month and act before it is too late.',
      howTo: 'Each month pick one action. Watch the crates and the gauge.',
      months: 8,
      eventMonths: [2, 5],            // a phone call event happens before these months' decision
      eventsPerRun: 2,
      sim: {
        startStockBuffers: 2.5,       // start stock = 2.5 × buffer (Healthy)
        deliveryBuffers: 1,           // one order delivers 1 × buffer (4 months of supply)
        spikeFactor: 1.5,             // one month has a demand spike of +50%
        rationFactor: 0.7             // rationing cuts that month's consumption by 30%
      },
      actions: {
        normal:   { label: 'Business as usual', sub: 'Prepositioning continues' },
        order:    { label: 'Start replenishment', sub: 'Bill of quantities, funding, PO' },
        escalate: { label: 'Escalate and ration', sub: 'Write to management, clusters, donors' }
      },
      bandFeedback: {
        green: 'Healthy (above twice the buffer): normal operations, prepositioning continues.',
        amber: 'Consuming buffer (one to two times the buffer): replenishment starts at once and clusters and donors are notified. An order raised at the buffer floor arrives after stock-out.',
        amberPending: 'Consuming buffer, and replenishment is already on its way: carry on and watch the band.',
        red: 'Urgent replenishment (below the buffer): written escalation to CP management, clusters and donors; ration allocations; examine emergency procurement and regional borrowing.'
      },
      ref: 'SOP §6, §6.3',
      events: [
        { id: 'E-01', speaker: 'grace', prompt: '"Stock is tight. Just release 2,000 kits now, the cluster will endorse next week."',
          options: [
            { text: 'Route the request for endorsement first', correct: true },
            { text: 'Release now, endorsement can follow', critical: 'CR2', why: 'Stock is released only against an endorsed request, even in an emergency.' }
          ],
          explain: 'Low stock makes endorsement and fair prioritisation more important, not less.', ref: 'SOP §4.4, §4.5' },
        { id: 'E-02', speaker: 'deng', prompt: 'We hold enough of every WASH kit item for 50,000 kits, except filter cloths: only 10,000. How many complete kits?',
          options: [
            { text: '10,000: one missing item breaks the kit', correct: true },
            { text: '50,000: filter cloths are minor', why: 'The break date is when any item of a kit runs out.' }
          ],
          explain: 'Each kit is assessed on its own item list.', ref: 'SOP §6.2' },
        { id: 'E-03', speaker: 'achol', prompt: 'A donor asks: "Can you report the buffer as its own line in our report?"',
          options: [
            { text: 'No: it is a planning and advocacy figure; donors see kits against the project that funded them', correct: true },
            { text: 'Yes: the buffer is a donor reporting category', why: 'The buffer is a planning and advocacy figure at cluster level, not a donor reporting category.' }
          ],
          explain: 'Donor reporting tracks kits against the project that funded them.', ref: 'SOP §6.1' },
        { id: 'E-04', speaker: 'nyakuoth', prompt: 'Two locations need kits and there is not enough for both. How do we choose?',
          options: [
            { text: 'Apply the criteria: severity, recency, protection risks, time since last assistance, access', correct: true },
            { text: 'First come, first served', why: 'Prioritisation uses need, urgency, feasibility and fairness criteria, not arrival order.' }
          ],
          explain: 'The cluster and CP team apply the criteria together.', ref: 'SOP §4.3' },
        { id: 'E-05', speaker: 'peter', prompt: '"Funding is not confirmed yet, but shall I raise the PO in WAVE now to save time?"',
          options: [
            { text: 'No: a PO is raised only once funding is confirmed and the project activated', correct: true },
            { text: 'Yes, raise it now', why: 'A purchase order is raised in WAVE only once funding is confirmed and the project activated.' }
          ],
          explain: 'Plan early with the procurement plan; order once funding is confirmed.', ref: 'SOP §4.1.1' },
        { id: 'E-06', speaker: 'lual', prompt: 'A partner has not collected approved stock 15 days after SWR approval. What happens?',
          options: [
            { text: 'Cancel the uncollected lines: they return from committed to available', correct: true },
            { text: 'Keep it committed until the partner comes', why: 'Approved stock is held 15 days maximum, then uncollected lines return to available stock.' }
          ],
          explain: 'No physical movement is needed; partner and cluster are notified.', ref: 'SOP §4.5.1, §4.10' }
      ]
    },

    /* =========================================================================
     * MISSION 5: KIT BUILDER (pack)
     * Items ride a conveyor belt. Drop each into the right kit box.
     * `kits` lists every box that accepts the item.
     * ======================================================================= */
    {
      id: 'L5', number: 5, title: 'Kit Builder', station: 'Malakal hub', color: '#7A5CFA',
      host: 'deng', topic: 'Kit contents, SNFI vs WASH', mission: 'pack',
      intro: 'The packing line is running! Drop each item into the right kit box before it falls off the belt.',
      howTo: 'Click the kit box the item belongs in (or press 1, 2, 3).',
      itemsPerRun: 10,
      beltSeconds: 7,
      boxes: [
        { id: 'SNFI', label: 'SNFI standard kit', color: '#0033A0' },
        { id: 'ES',   label: 'Emergency shelter kit', color: '#8B5E34' },
        { id: 'WASH', label: 'WASH standard kit', color: '#19A7E0' }
      ],
      items: [
        { id: 'I-01', name: 'Plastic sheet 4x6m', kits: ['SNFI', 'ES'], color: '#2E86DE', why: 'Both the SNFI standard kit and the emergency shelter kit contain 2 plastic sheets 4x6m.' },
        { id: 'I-02', name: 'Rubber rope ties', kits: ['SNFI'], color: '#3D3D3D', why: 'The SNFI standard kit has 2 rubber rope ties.' },
        { id: 'I-03', name: 'Rope bundle', kits: ['ES'], color: '#C49A6C', why: 'The emergency shelter kit has 2 bundles of rope.' },
        { id: 'I-04', name: 'Blanket', kits: ['SNFI'], color: '#8E6CC4', why: 'The SNFI standard kit has 2 blankets.' },
        { id: 'I-05', name: 'Mosquito net', kits: ['SNFI'], color: '#7FB3D5', why: 'The SNFI standard kit has 2 mosquito nets.' },
        { id: 'I-06', name: 'Kanga', kits: ['SNFI'], color: '#E67E22', why: 'The SNFI standard kit has 2 kanga.' },
        { id: 'I-07', name: 'Kitchen set', kits: ['SNFI'], color: '#95A5A6', why: 'The SNFI standard kit has 1 kitchen set.' },
        { id: 'I-08', name: 'Sleeping mat', kits: ['SNFI'], color: '#D4AC0D', why: 'The SNFI standard kit has 1 sleeping mat.' },
        { id: 'I-09', name: 'Solar lamp', kits: ['SNFI'], color: '#F4D03F', why: 'The SNFI standard kit has 1 solar lamp.' },
        { id: 'I-10', name: 'NFI bag', kits: ['SNFI'], color: '#2471A3', why: 'The SNFI standard kit has 1 NFI bag.' },
        { id: 'I-11', name: 'Bamboo bundle', kits: ['ES'], color: '#A9CF54', why: 'The emergency shelter kit adds 2 bundles of bamboo where not available locally.' },
        { id: 'I-12', name: 'Wooden poles', kits: ['ES'], color: '#935116', why: 'The emergency shelter kit adds 6 wooden poles where not available locally.' },
        { id: 'I-13', name: 'Bucket with tap', kits: ['WASH'], color: '#48C9B0', why: 'The WASH standard kit has 1 bucket with tap.' },
        { id: 'I-14', name: 'Bucket without tap', kits: ['WASH'], color: '#76D7C4', why: 'The WASH standard kit has 1 bucket without tap.' },
        { id: 'I-15', name: 'Filter cloth', kits: ['WASH'], color: '#EAECEE', why: 'The WASH standard kit has 1 filter cloth.' },
        { id: 'I-16', name: 'Bars of soap', kits: ['WASH'], color: '#F5CBA7', why: 'The WASH standard kit has 2 bars of soap.' },
        { id: 'I-17', name: 'Water purification tablets', kits: ['WASH'], color: '#AED6F1', why: 'The WASH standard kit has 290 water purification tablets.' },
        { id: 'I-18', name: 'PuR flocculant sachets', kits: ['WASH'], color: '#5DADE2', why: 'The WASH standard kit has 45 PuR flocculant sachets.' }
      ],
      ref: 'SOP §2.1, Table 2; Budget tool, Kits sheet',
      /* One quick card at the end of the line. */
      bonus: {
        id: 'K-B1', speaker: 'nyakuoth', prompt: 'Boxes are sealed. Who endorses the SNFI and emergency shelter kits?',
        options: [
          { text: 'SLSC Cluster', correct: true },
          { text: 'WASH Cluster', why: 'The WASH Cluster endorses the WASH standard kit and the hygiene kit.' },
          { text: 'Supply Chain', why: 'Kit contents are set and endorsed by the clusters.' }
        ],
        explain: 'Endorsement routing is one of the three ways SNFI and WASH differ (with kit contents and buffer thresholds).', ref: 'SOP §1, §2.1'
      }
    },

    /* =========================================================================
     * MISSION 6: BUDGET BUILDER (budget)
     * 3D bars follow the budget tool logic. The player predicts which bars
     * grow when one input changes. Values are never shown in USD: the bars
     * only show direction. The model uses the budget tool's kit costs and
     * weights, rates and formulas.
     * ======================================================================= */
    {
      id: 'L6', number: 6, title: 'Budget Builder', station: 'Abyei field warehouse', color: '#19A7E0',
      host: 'peter', topic: 'CP budget tool logic', mission: 'budget',
      intro: 'Each bar is a line of the CP budget. Change one input and some bars grow. Can you predict which ones?',
      howTo: 'Tap the bars you think will grow, then press Check.',
      challengesPerRun: 4,
      /* Budget categories shown as bars (budget tool categories A to G; RMU share F left out).
       * B Kits = kits at LTA prices + insurance + loss and damage allowance (B.1 to B.5, B.9, B.10).
       * B Transport = road, river/air transport and loading (B.6 to B.8). G PSC = 7% of direct costs. */
      bars: [
        { id: 'A',  label: 'A Staff',       color: '#7A5CFA' },
        { id: 'B1', label: 'B Kits',        color: '#0033A0' },
        { id: 'B2', label: 'B Transport',   color: '#F28C28' },
        { id: 'C',  label: 'C Warehousing', color: '#00A889' },
        { id: 'D',  label: 'D Travel',      color: '#D6246E' },
        { id: 'E',  label: 'E PDM',         color: '#E5554F' },
        { id: 'G',  label: 'G PSC',         color: '#55607A' }
      ],
      /* Model inputs. Kit cost and weight per kit: Budget tool, Kits sheet.
       * Rates: Other Costs sheet. Staff, months, trips and nights are an
       * imaginary base project (never shown as numbers). */
      model: {
        kits: {
          SNFI: { cost: 62.43, kg: 18.194 },
          ES:   { cost: 74.68, kg: 142.4 },
          WASH: { cost: 19.01, kg: 3.892 }
        },
        insurancePct: 0.0161, lossPct: 0.002, pscPct: 0.07,
        truckMT: 40, truck40Rate: 1400, truck25Rate: 1300, loadingPerTruck: 200,   // Bor road rates, Halane LTA
        warehousePerMT: 99.94,          // handling + storage + staff per tonne (Other Costs, section 7)
        pdmPerHH: 15, tripRate: 550, dsaRate: 91,
        base: { hh: 1000, share: { SNFI: 1.0, WASH: 0.5, ES: 0 }, months: 6, staffMonthly: 10000, staffPct: 0.2, trips: 2, nights: 10, pdmShare: 0 }
      },
      challenges: [
        { id: 'B-01', prompt: 'Target households double, same kit mix.', change: { hhFactor: 2 },
          explain: 'More households means more kits: kits, tonnes (transport and warehousing) grow. Staff and travel depend on time and trips. PSC follows the total.', ref: 'Budget sheet (A to G)' },
        { id: 'B-02', prompt: 'New LTA: the SNFI kit price goes up.', change: { priceUp: { kit: 'SNFI', pct: 0.15 } },
          explain: 'A higher LTA price raises kit cost, and insurance and loss allowance with it (both % of procurement value). Weight is the same, so transport and warehousing stay. PSC follows the total.', ref: 'Kits sheet; Budget sheet (B, G)' },
        { id: 'B-03', prompt: '500 households switch from the SNFI kit to the emergency shelter kit.', change: { shift: { from: 'SNFI', to: 'ES', hh: 500 } },
          explain: 'The emergency shelter kit costs more and weighs far more (poles and bamboo). Kits, transport and warehousing all grow.', ref: 'Kits sheet (weight per kit); Budget sheet (B, C)' },
        { id: 'B-04', prompt: 'Staff time charged to the project goes from 20% to 40%.', change: { staffPct: 0.4 },
          explain: 'Staff cost = monthly cost × months × % of time. Only staff, and PSC on top, change.', ref: 'Parameters (F); Budget sheet (A)' },
        { id: 'B-05', prompt: 'IOM will now monitor 30% of households itself (PDM was 0%).', change: { pdmShare: 0.3 },
          explain: 'IOM-led PDM = households covered × USD 15. Only PDM and PSC change.', ref: 'Parameters (E); Budget sheet (E)' },
        { id: 'B-06', prompt: 'Two more UNHAS monitoring trips are planned.', change: { extraTrips: 2 },
          explain: 'Travel = UNHAS return trips × rate + DSA nights × rate. Only travel and PSC change.', ref: 'Parameters (G); Budget sheet (D)' },
        { id: 'B-07', prompt: 'The project runs 12 months instead of 6.', change: { months: 12 },
          explain: 'Staff is charged per month. Kits, transport and warehousing depend on households, not duration.', ref: 'Parameters (A, F); Budget sheet (A)' }
      ]
    },

    /* =========================================================================
     * MISSION 7: BOSS CONVOY (convoy)
     * One scenario is picked at random. Each node is a checkpoint on the road.
     * Node: speaker, text, optional visual, options[{ text, correct,
     * feedback, next, critical }]. next: null ends the run.
     * ======================================================================= */
    {
      id: 'L7', number: 7, title: 'Boss Convoy', station: 'Renk field warehouse', color: '#D6246E',
      host: 'achol', topic: 'Mixed emergency scenario', mission: 'convoy',
      intro: 'Final run. An emergency lands on your desk. Drive the convoy through every checkpoint. People will push you to cut corners. Don\'t.',
      howTo: 'At each checkpoint, choose what you would do.',
      scenarios: [
        {
          id: 'BOSS-A', title: 'Floods in Jonglei',
          nodes: {
            a1: {
              speaker: 'achol', ref: 'SOP §4.3',
              text: 'An ETT alert reports flooding near Bor. Thousands of households are displaced. Grace\'s organization is ready to respond. What happens first?',
              options: [
                { text: 'The partner assesses needs, the cluster validates them and the CP team checks stock', correct: true, next: 'a2',
                  feedback: 'Right. Step 3: assessment within 1 to 5 days, validated through the cluster, cross-checked against the 5W.' },
                { text: 'Send kits from the Bor hub today, paperwork can follow', critical: 'CR1', next: null,
                  feedback: 'Nothing leaves a warehouse without an SWR approved in IMS.' },
                { text: 'Wait for the next monthly status snapshot', next: 'a2',
                  feedback: 'Too slow. The target is 14 days from trigger to delivery. The alert itself triggers Step 3.' }
              ]
            },
            a2: {
              speaker: 'grace', ref: 'SOP §4.4',
              text: 'Grace sends a request by WhatsApp: 2,400 SNFI kits for 400 households, from the Wau warehouse. What do you do?',
              options: [
                { text: 'Return it within 24 hours with the corrections: kits per household, the Bor warehouse, and the form by email to the cluster pipeline mailbox, CP team in copy', correct: true, next: 'a3',
                  feedback: 'Right. The completeness review returns incomplete requests with the correction needed.' },
                { text: 'Quietly fix it yourself and push it through', next: 'a3',
                  feedback: 'Requests are returned with the correction needed, so the partner learns and the file is clean. About 10% of requests carry a wrong item or warehouse.' },
                { text: 'Reject it with no explanation', next: 'a3',
                  feedback: 'Rejected requests are returned with reasons.' }
              ]
            },
            a3: {
              speaker: 'peter', ref: 'SOP §6.3',
              text: 'You check the monthly figures: SNFI stock is 70,000 kits. What should happen with replenishment?',
              visual: { type: 'gauge', stream: 'SNFI', stock: 70000 },
              options: [
                { text: 'Start replenishment now and notify clusters and donors', correct: true, next: 'a4',
                  feedback: 'Right. 70,000 is Consuming buffer (44,000 to 88,000). An order raised later would land after stock-out.' },
                { text: 'Wait until stock falls below 44,000', next: 'a3b',
                  feedback: 'With a 4 to 5 month lead time, an order raised at the buffer floor arrives after stock-out.' },
                { text: 'Stop all releases to protect the stock', next: 'a4',
                  feedback: 'Amber means start replenishment, not stop the pipeline.' }
              ]
            },
            a3b: {
              speaker: 'peter', ref: 'SOP §6.3',
              text: 'Consequence: two months later SNFI stock is 40,000 and no order is on the way. What now?',
              visual: { type: 'gauge', stream: 'SNFI', stock: 40000 },
              options: [
                { text: 'Written escalation to CP management, clusters and donors; ration allocations; examine emergency procurement and regional borrowing', correct: true, next: 'a4',
                  feedback: 'Right. That is the Urgent replenishment action. Better to start at amber next time.' },
                { text: 'Keep releasing normally and hope new funding comes', next: 'a4',
                  feedback: 'Below the buffer, allocations are rationed and the situation is escalated in writing.' }
              ]
            },
            a4: {
              speaker: 'grace', ref: 'SOP §4.4',
              text: 'The corrected request is with the SFP. 48 hours pass with no feedback. Grace: "Can\'t you just release now?"',
              options: [
                { text: 'No. Without feedback in 48 hours the review passes to national level, where the cluster approves', correct: true, next: 'a5',
                  feedback: 'Right. Silence moves the request up, it does not skip endorsement.' },
                { text: 'Yes, 48 hours of silence counts as endorsement', critical: 'CR2', next: null,
                  feedback: 'Silence is not endorsement. The review passes to national level.' }
              ]
            },
            a5: {
              speaker: 'lual', ref: 'SOP §4.5, §4.5.1',
              text: 'The cluster endorses the request. Deng asks how to go ahead.',
              options: [
                { text: 'CP team raises the SWR in IMS; the CP Cluster Focal Point approves it; stock becomes committed', correct: true, next: 'a6',
                  feedback: 'Right. That approved SWR is the only authority to dispatch.' },
                { text: 'Hold the request until other partners request too, to fill a full truck', next: 'a6',
                  feedback: 'There is no minimum volume and requests are not held for consolidation.' },
                { text: 'Deng releases on your email confirmation', critical: 'CR1', next: null,
                  feedback: 'No email replaces the SWR approved in IMS.' }
              ]
            },
            a6: {
              speaker: 'deng', ref: 'SOP §4.5.1',
              text: 'Grace\'s team arrives at the warehouse with no notice. The SWR is approved. What can the warehouse do?',
              options: [
                { text: 'It may refuse release: the partner must confirm collection at least 24 hours in advance', correct: true, next: 'a7',
                  feedback: 'Right. 24 hours notice lets the warehouse plan loading. Approved stock is held for 15 days.' },
                { text: 'Release without the partner signing, to save time', next: 'a7',
                  feedback: 'At collection the partner checks quantity and condition and signs. Responsibility transfers at signature.' }
              ]
            },
            a7: {
              speaker: 'grace', ref: 'SOP §4.6.2',
              text: 'A week after distribution Grace mentions that 20 kits were stolen on the road, 5 days ago. What do you do?',
              options: [
                { text: 'Get the Loss and Damage form now, investigate, inform IOM staff security, and apply the compliance ladder for the late report', correct: true, next: null,
                  feedback: 'Right. Reports are due within 24 hours; late or missing reports trigger the compliance ladder.' },
                { text: 'It\'s only 20 kits: leave it out of the records', critical: 'CR5', next: null,
                  feedback: 'Every loss is reported and investigated. Unreported loss is a suspension trigger.' }
              ]
            }
          },
          start: 'a1'
        },
        {
          id: 'BOSS-B', title: 'Returns in Upper Nile',
          nodes: {
            b1: {
              speaker: 'nyakuoth', ref: 'SOP §4.2',
              text: 'Returnees are arriving in Renk. A new NGO, River Aid, asks for 1,000 WASH kits: "We\'ll sign the agreement later." What do you do?',
              options: [
                { text: 'Start onboarding: DDA and registration documents to the cluster, validation, then the agreement', correct: true, next: 'b2',
                  feedback: 'Right. Onboarding takes 3 to 5 working days from a complete file.' },
                { text: 'Process the request now and onboard later', critical: 'CR4', next: null,
                  feedback: 'CP access needs a completed onboarding. The DDA is mandatory.' },
                { text: 'Ask an onboarded partner to request on River Aid\'s behalf', next: 'b2',
                  feedback: 'Partners must distribute directly in the target area, without an intermediary.' }
              ]
            },
            b2: {
              speaker: 'nyakuoth', ref: 'SOP §4.3, §4.4',
              text: 'River Aid is onboarded. Its request arrives with a needs assessment done 4 months ago.',
              options: [
                { text: 'Return it: an assessment is valid for 3 months', correct: true, next: 'b3',
                  feedback: 'Right. Assessment validity is part of the 24-hour completeness review.' },
                { text: 'Accept it: any assessment is fine', next: 'b3',
                  feedback: 'Assessments are valid for 3 months.' }
              ]
            },
            b3: {
              speaker: 'peter', ref: 'SOP §6.3',
              text: 'WASH stock stands at 60,000 kits. What band are we in, and what follows?',
              visual: { type: 'gauge', stream: 'WASH', stock: 60000 },
              options: [
                { text: 'Urgent replenishment: written escalation, rationed allocations, look at emergency procurement and regional borrowing', correct: true, next: 'b4',
                  feedback: 'Right. 60,000 is below the WASH buffer of 68,000.' },
                { text: 'Consuming buffer: start replenishment only', next: 'b4',
                  feedback: 'For WASH, 60,000 is below the buffer of 68,000: that is red, not amber.' },
                { text: 'Healthy: carry on', next: 'b4',
                  feedback: 'WASH is Healthy only above 136,000.' }
              ]
            },
            b4: {
              speaker: 'nyakuoth', ref: 'SOP §4.3',
              text: 'Two locations need WASH kits, and there is not enough for both. How do you decide?',
              options: [
                { text: 'With the cluster, apply the criteria: severity, recency, protection risks, time since last assistance, access, do no harm', correct: true, next: 'b5',
                  feedback: 'Right. Within a location, the cluster vulnerability index is used.' },
                { text: 'Whoever requested first', next: 'b5',
                  feedback: 'Prioritisation uses need, urgency, feasibility and fairness criteria, not arrival order.' },
                { text: 'The partner with the biggest team', next: 'b5',
                  feedback: 'Partner capacity is one criterion among many, not the deciding one.' }
              ]
            },
            b5: {
              speaker: 'grace', ref: 'SOP §1, §7.2',
              text: 'River Aid proposes a small "registration fee" per household to cover its staff costs. What is your answer?',
              options: [
                { text: 'No. Distribution is free without exception; partners charge no fee to anyone', correct: true, next: 'b6',
                  feedback: 'Right. The non-fee model is enforced without exception.' },
                { text: 'Fine if the fee is very small', critical: 'CR3', next: null,
                  feedback: 'No fee of any size. Charging beneficiaries leads to suspension.' }
              ]
            },
            b6: {
              speaker: 'nyakuoth', ref: 'SOP §7.2, §7.3',
              text: 'At the distribution, a community member reports a sexual exploitation allegation against a River Aid staff member.',
              options: [
                { text: 'Report it immediately through IOM PSEA channels', correct: true, next: null,
                  feedback: 'Right. PSEA allegations bypass the feedback loop and go straight to IOM PSEA channels.' },
                { text: 'Log it in the feedback register for the monthly analysis', critical: 'CR6', next: null,
                  feedback: 'PSEA allegations never wait in the normal feedback loop.' },
                { text: 'Ask River Aid to investigate internally first', critical: 'CR6', next: null,
                  feedback: 'PSEA allegations are reported immediately through IOM PSEA channels.' }
              ]
            }
          },
          start: 'b1'
        },
        {
          id: 'BOSS-C', title: 'Rush week at the Juba warehouse',
          nodes: {
            c1: {
              speaker: 'deng', ref: 'SOP §4.1.4',
              text: 'A truck of blankets arrives in Juba. The driver is in a hurry. How do you receive it?',
              options: [
                { text: 'Joint visual control, two independent counts (warehouse and CP) with the driver present, photos of any damage before signing', correct: true, next: 'c2',
                  feedback: 'Right. Counts are reconciled before the receipt is signed.' },
                { text: 'One quick warehouse count and sign', next: 'c2',
                  feedback: 'Two independent counts, warehouse and CP, are required.' },
                { text: 'Send the truck straight on to Bentiu and count there', next: 'c2',
                  feedback: 'All items are received and quality controlled in Juba before dispatch to the field.' }
              ]
            },
            c2: {
              speaker: 'deng', ref: 'SOP §4.1.4',
              text: 'The count shows 300 more blankets than ordered, and some cartons are water damaged.',
              options: [
                { text: 'Refuse the excess or record it on the overage report; record the damage, agreed by warehouse, CP and procurement; return unacceptable items to the vendor', correct: true, next: 'c3',
                  feedback: 'Right. Unacceptable items go back at no cost to IOM; minor deficiencies attract a penalty per item.' },
                { text: 'Keep the extra blankets and accept the damaged cartons', next: 'c3',
                  feedback: 'Excess is refused or recorded on the overage report, and damage is recorded and agreed jointly.' }
              ]
            },
            c3: {
              speaker: 'peter', ref: 'SOP §4.5',
              text: 'Bentiu needs stock fast. Peter says: "Just load the trucks, I\'ll email the approval later."',
              options: [
                { text: 'Wait for the SWR approved in IMS by the CP Cluster Focal Point, then dispatch with waybills', correct: true, next: 'c4',
                  feedback: 'Right. Transfers between hubs need an approved SWR, exactly like partner releases.' },
                { text: 'Load now; the email will cover it', critical: 'CR1', next: null,
                  feedback: 'No email replaces an SWR approved in IMS, for hub transfers too.' }
              ]
            },
            c4: {
              speaker: 'deng', ref: 'SOP §4.5.2',
              text: 'The approved SWR covers 10 trucks to Bentiu. How many waybills?',
              options: [
                { text: '10: one waybill per truck loaded', correct: true, next: 'c5',
                  feedback: 'Right. One SWR on ten trucks gives ten waybills.' },
                { text: '1: one per SWR', next: 'c5',
                  feedback: 'A waybill is issued per truck loaded.' },
                { text: 'None: use issuance forms', next: 'c5',
                  feedback: 'Issuance forms are for releases to partners. Transfers between IOM locations use waybills.' }
              ]
            },
            c5: {
              speaker: 'deng', ref: 'SOP §5.2',
              text: 'An expiry alert shows that a newer batch of water purification tablets in Bor expires before the older one.',
              options: [
                { text: 'Release the newer batch first and record the exception', correct: true, next: 'c6',
                  feedback: 'Right. FIFO is the rule; LIFO is a recorded exception where newer stock expires sooner.' },
                { text: 'Stick to FIFO, no exceptions', next: 'c6',
                  feedback: 'The SOP allows a recorded LIFO exception where newer stock expires sooner.' }
              ]
            },
            c6: {
              speaker: 'lual', ref: 'SOP §4.5.1, §4.10',
              text: 'A partner has not collected approved stock 15 days after SWR approval.',
              options: [
                { text: 'Cancel the uncollected lines from the SWR: they return from committed to available, and the partner and cluster are notified', correct: true, next: null,
                  feedback: 'Right. No physical movement is needed; the stock can be released to other partners.' },
                { text: 'Keep the stock committed until the partner comes', next: null,
                  feedback: 'Approved stock is held 15 days maximum, then uncollected lines return to available.' },
                { text: 'Truck the stock back to Juba', next: null,
                  feedback: 'Cancelled lines return to available in IMS without physical movement.' }
              ]
            }
          },
          start: 'c1'
        }
      ]
    }
  ]
};
