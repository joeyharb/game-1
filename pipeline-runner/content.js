/* =============================================================================
 * PIPELINE RUNNER — GAME CONTENT
 * -----------------------------------------------------------------------------
 * Everything a trainer may want to edit lives in this file: settings, colours,
 * characters, critical rules, levels, questions, answers, explanations and
 * source references. The game logic in index.html only READS this object.
 *
 * Sources (all in ../source/):
 *   - "SOP"         = IOM South Sudan Core Pipeline Operations SOP (Draft 1, Sept 2026)
 *   - "Budget tool" = CP Budget Tool v2 (October 2026), sheets: Parameters, Kits,
 *                     Other Costs, Budget, Summary
 *
 * Every question carries a `ref` that points to the SOP section or budget
 * sheet it came from. See README.md for how to add, edit or remove items, and
 * question_map.md for the full traceability table.
 *
 * Question types (see README.md for the full field list):
 *   order  – drag cards into the right sequence        (items = correct order)
 *   choice – one answer, or several when multi: true   (options[].correct)
 *   match  – give each task the right role / owner     (pairs[].role)
 *   spot   – click every mistake on a mock form        (doc.fields[].error)
 *   Boss level uses branching `scenarios` instead of `questions`.
 * ========================================================================== */

window.GAME_CONTENT = {

  /* ---------------------------------------------------------------------------
   * META AND SETTINGS
   * ------------------------------------------------------------------------- */
  meta: {
    title: 'Pipeline Runner',
    subtitle: 'IOM South Sudan SNFI + WASH Core Pipeline training game',
    version: '1.0',
    sourceNote: 'Based on the IOM South Sudan Core Pipeline SOP (Draft 1, September 2026) and the CP Budget Tool v2 (October 2026).'
  },

  settings: {
    passMark: 0.80,              // overall accuracy needed to pass (0.80 = 80%)
    livesPerLevel: 3,
    pointsPerCorrect: 100,
    streakBonus: 20,             // extra points per answer in a streak (2nd correct in a row = +20, 3rd = +40 ...)
    streakBonusMax: 100,         // cap on the bonus for a single answer
    stars: { one: 0.5, two: 0.8, three: 1.0 },   // level accuracy needed for 1, 2, 3 stars
    timer: {
      enabledByDefault: false,   // the player can switch it on from the home screen
      secondsPerQuestion: 45,    // choice questions
      secondsPerPuzzle: 90       // order, match and spot questions
    },
    storageKey: 'pipelineRunner.v1'
  },

  /* Colours. IOM blue is the base; accents are used for levels and feedback.
   * Change a value here and reload: the game applies them as CSS variables. */
  theme: {
    iomBlue: '#0033A0',
    iomBlueDark: '#00205F',
    iomBlueLight: '#E6EEFA',
    background: '#F3F6FC',
    text: '#14213D',
    correct: '#12865A',
    wrong: '#C62E2E',
    warning: '#E08A00',
    gold: '#F5B301'
  },

  /* Ranks are based on overall accuracy across all 7 levels. */
  ranks: [
    { id: 'trainee', title: 'Trainee',         minAccuracy: 0,    requireAllLevels: false, note: 'Keep running: complete every level and reach the pass mark.' },
    { id: 'pro',     title: 'Pipeline Pro',    minAccuracy: 0.80, requireAllLevels: true,  note: 'You know how the pipeline runs. Well done.' },
    { id: 'master',  title: 'Pipeline Master', minAccuracy: 0.95, requireAllLevels: true,  note: 'Near-perfect. You could teach this SOP.' }
  ],

  /* Badges. `rule` is read by the game engine; supported rules:
   *   levelDone:<levelId> | stars3:<levelId> | flawless | streak:<n> | allLevels | noCritical | rank:<rankId> */
  badges: [
    { id: 'first-run',   title: 'First Run',        rule: 'levelDone:L1',  icon: 'route',  desc: 'Completed The Journey.' },
    { id: 'flawless',    title: 'Flawless',         rule: 'flawless',      icon: 'shield', desc: 'Finished a level without losing a life.' },
    { id: 'hot-streak',  title: 'Hot Streak',       rule: 'streak:5',      icon: 'flame',  desc: 'Five correct answers in a row.' },
    { id: 'buffer',      title: 'Buffer Guardian',  rule: 'stars3:L4',     icon: 'gauge',  desc: 'Three stars on Buffer Watch.' },
    { id: 'budget',      title: 'Budget Brain',     rule: 'stars3:L6',     icon: 'coin',   desc: 'Three stars on Budget Logic.' },
    { id: 'rule-keeper', title: 'Rule Keeper',      rule: 'noCritical',    icon: 'lock',   desc: 'All 7 levels done with no critical-rule mistake.' },
    { id: 'all-levels',  title: 'End of the Line',  rule: 'allLevels',     icon: 'flag',   desc: 'Completed all 7 levels.' },
    { id: 'master',      title: 'Pipeline Master',  rule: 'rank:master',   icon: 'star',   desc: 'Reached the top rank.' }
  ],

  /* ---------------------------------------------------------------------------
   * GLOSSARY — the game spells out each acronym the first time it appears in a
   * level, and shows the meaning on hover everywhere else.
   * ------------------------------------------------------------------------- */
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
    'RRC': 'Relief and Rehabilitation Commission',
    'ETT': 'Emergency Tracking Tool',
    'DTM': 'Displacement Tracking Matrix',
    '5W': 'Who does What, Where, When and for Whom',
    'WAVE': 'IOM ERP system for requisitions and purchase orders',
    'PO': 'purchase order',
    'HH': 'households',
    'MT': 'metric tonnes',
    'RACI': 'Responsible, Accountable, Consulted, Informed',
    'FIFO': 'First In, First Out',
    'LIFO': 'Last In, First Out',
    'QC': 'quality control',
    'PSC': 'Programme Support Cost',
    'UNHAS': 'UN Humanitarian Air Service',
    'DSA': 'Daily Subsistence Allowance',
    'HNRP': 'Humanitarian Needs and Response Plan',
    'SITREP': 'situation report',
    'UNGM': 'United Nations Global Marketplace'
  },

  /* ---------------------------------------------------------------------------
   * CHARACTERS — drawn as flat SVG avatars by the game.
   * look.hair: short | long | bun | headwrap | cap | bald
   * look.accessory: none | glasses | hardhat | lanyard | clipboard | tablet
   * Names are fictional.
   * ------------------------------------------------------------------------- */
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

  /* ---------------------------------------------------------------------------
   * CRITICAL RULES — breaking one ends the level at once.
   * Questions point to a rule with `critical: 'CR1'` on an option or form field.
   * This list is a first draft and can be changed with the SOP.
   * ------------------------------------------------------------------------- */
  criticalRules: {
    CR1: { title: 'No approved SWR, no dispatch',
           rule: 'The only authority to dispatch stock is an SWR approved in IMS by the CP Cluster Focal Point. No email, verbal instruction or other form replaces it, for releases to partners and for transfers between hubs.',
           ref: 'SOP §4.5' },
    CR2: { title: 'No cluster endorsement, no release',
           rule: 'Stock is released only against a request endorsed by the cluster. The cluster validates needs, endorses targeting and decides allocation; Step 5 starts only when the endorsed request reaches the CP team.',
           ref: 'SOP §3.1, §4.4, §4.5' },
    CR3: { title: 'The pipeline is free, without exception',
           rule: 'All CP activity is non-fee. Partners charge no fee, cost or overhead to IOM, to beneficiaries or to any third party. Charging beneficiaries leads to suspension.',
           ref: 'SOP §1, §4.2.3, §7.2' },
    CR4: { title: 'Only eligible partners in good standing',
           rule: 'CP access needs a completed onboarding (the DDA is mandatory). Requests from a partner on hold for that state, or suspended, are not processed.',
           ref: 'SOP §4.2' },
    CR5: { title: 'Loss, damage, theft or diversion: report within 24 hours',
           rule: 'The partner reports any incident to the CP team and the cluster within 24 hours of becoming aware, on the Loss and Damage form. IOM investigates every case. Nothing is hidden or left unreported.',
           ref: 'SOP §4.6.2' },
    CR6: { title: 'PSEA allegations go straight to IOM PSEA channels',
           rule: 'PSEA allegations are reported immediately through IOM PSEA channels. They bypass the normal complaints and feedback loop.',
           ref: 'SOP §7.2, §7.3' }
  },

  /* ---------------------------------------------------------------------------
   * BUFFER DATA used by the gauge in Buffer Watch (SOP §6, Figure 6)
   * ------------------------------------------------------------------------- */
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
   * LEVELS
   * Each level: id, number, title, station (map stop), colour, host character,
   * intro, questionsPerRun, and a pool of questions (shuffled each run).
   * Mark a question `always: true` to include it in every run.
   * ------------------------------------------------------------------------- */
  levels: [

    /* =========================================================================
     * LEVEL 1 — THE JOURNEY (order)
     * ======================================================================= */
    {
      id: 'L1', number: 1, title: 'The Journey', station: 'Juba main hub', color: '#F5B301',
      host: 'achol', topic: 'CP workflow order',
      intro: 'Welcome, new CP focal point! Every kit travels the same road, from procurement to closure. Show me you know the stops in the right order.',
      howTo: 'Drag the cards (or use the arrows) to put them in order, then press Check.',
      questionsPerRun: 5,
      questions: [
        {
          id: 'L1-01', type: 'order', speaker: 'achol', always: true,
          prompt: 'Put all nine steps of the Core Pipeline in order, from first to last.',
          items: ['Procurement and prepositioning', 'Partner onboarding', 'Trigger and needs assessment', 'Request and endorsement',
                  'Stock release', 'Distribution', 'Distribution reporting', 'Post-distribution monitoring', 'Closure'],
          explain: 'The CP runs in nine steps: procure and preposition, onboard partners, assess needs, request and endorse, release stock, distribute, report, monitor (PDM), then close.',
          ref: 'SOP §4, Figure 3'
        },
        {
          id: 'L1-02', type: 'order', speaker: 'achol',
          prompt: 'Order the first five steps of the pipeline.',
          items: ['Procurement and prepositioning', 'Partner onboarding', 'Trigger and needs assessment', 'Request and endorsement', 'Stock release'],
          explain: 'Stock must be procured and prepositioned and partners onboarded before a trigger leads to an assessment, a request, and then a release.',
          ref: 'SOP §4, Figure 3'
        },
        {
          id: 'L1-03', type: 'order', speaker: 'achol',
          prompt: 'Order the last six steps, from the request to closing the file.',
          items: ['Request and endorsement', 'Stock release', 'Distribution', 'Distribution reporting', 'Post-distribution monitoring', 'Closure'],
          explain: 'After endorsement comes release, then the partner distributes, reports (15 days target), PDM follows (2 weeks to 4 months), and the CP team closes within 30 days of PDM receipt.',
          ref: 'SOP §4, Figure 3'
        },
        {
          id: 'L1-04', type: 'order', speaker: 'nyakuoth',
          prompt: 'A request has arrived. Put the four review stages of Step 4 in order.',
          items: ['CP team completeness review (24 hours)', 'Sub-national review by the SFP (48 hours)', 'National approval by the cluster (24 hours)', 'CP team confirms stock and makes the final allocation'],
          explain: 'CP team checks completeness in 24 hours, the SFP reviews in 48 hours (no feedback = passes to national level), the cluster approves in 24 hours, then the CP team allocates and the partner confirms readiness.',
          ref: 'SOP §4.4'
        },
        {
          id: 'L1-05', type: 'order', speaker: 'lual',
          prompt: 'Order the stock release procedure.',
          items: ['CP team confirms availability and raises the SWR in IMS', 'CP Cluster Focal Point approves the SWR (stock becomes committed)', 'Partner confirms the collection date at least 24 hours ahead',
                  'Partner checks quantity and condition and signs', 'Warehouse records the release in IMS'],
          explain: 'Availability is confirmed within 72 hours and the SWR raised; approval commits the stock; the partner gives 24 hours notice, checks and signs (responsibility transfers at signature); the warehouse records the release.',
          ref: 'SOP §4.5.1'
        },
        {
          id: 'L1-06', type: 'order', speaker: 'deng',
          prompt: 'Order the stock statuses an item moves through in IMS.',
          items: ['Registered in IMS at purchase order stage', 'Available (warehouse approves the stock input)', 'Committed (SWR approved)', 'Released (dispatched on a signed waybill or issuance form)'],
          explain: 'Stock registers at PO stage, becomes available when the warehouse approves the stock input, committed when the SWR is approved, and released on dispatch and signature.',
          ref: 'SOP §4.1.4, §5.1'
        },
        {
          id: 'L1-07', type: 'order', speaker: 'deng',
          prompt: 'A consignment is coming in. Order the receipt steps.',
          items: ['Pre-alert sent with the purchase order', 'Goods arrive in Juba: joint visual control and two independent counts', 'Receipt signed once counts are reconciled',
                  'Warehouse approves the stock input: stock is available', 'Stock prepositioned to the field hubs'],
          explain: 'The pre-alert lets the warehouse plan space. All items are received and quality controlled in Juba, counted twice and reconciled before signing, then become available and can be prepositioned.',
          ref: 'SOP §4.1.4, §4.1.5'
        },
        {
          id: 'L1-08', type: 'order', speaker: 'nyakuoth',
          prompt: 'A new organization wants to use the pipeline. Order the onboarding steps.',
          items: ['Organization submits the DDA form and registration documents to the cluster', 'Cluster validates capacity, presence and coordination (3 to 5 working days)',
                  'CP team issues the distribution agreement', 'CP team registers one partner focal point as Requester', 'CP team delivers orientation (SOP, reporting, PSEA, non-fee model)'],
          explain: 'DDA and documents go to the cluster, the cluster validates, the CP team issues the agreement, registers one Requester and delivers orientation.',
          ref: 'SOP §4.2.2'
        },
        {
          id: 'L1-09', type: 'order', speaker: 'grace',
          prompt: 'Kits were stolen after collection. Order what happens next.',
          items: ['Partner becomes aware: the 24-hour clock starts', 'Partner reports to the CP team and cluster on the Loss and Damage form',
                  'CP team investigates and reports to IOM security', 'Corrective action and compliance ladder'],
          explain: 'The partner reports within 24 hours of becoming aware, on the Loss and Damage form (with a police or authority report where applicable). IOM investigates; late or missing reports trigger the compliance ladder.',
          ref: 'SOP §4.6.2, Figure 4'
        },
        {
          id: 'L1-10', type: 'order', speaker: 'peter',
          prompt: 'Follow a kit through the supply chain. Put the stops in order.',
          items: ['LTA supplier delivers to Juba', 'Juba main hub: consolidation and quality control', 'Transfer to a logistics hub or field warehouse',
                  'Partner collects on a signed issuance form', 'Distribution to affected households'],
          explain: 'Suppliers deliver to Juba, the only QC location. Stock is then moved to the hubs (Wau, Malakal, Bentiu, Bor) and field warehouses (Abyei, Renk), collected by partners and distributed.',
          ref: 'SOP §2, Figure 1'
        },
        {
          id: 'L1-11', type: 'order', speaker: 'achol',
          prompt: 'A partner keeps missing reports. Order the compliance ladder from mildest to most severe.',
          items: ['Reminder', 'Hold', 'Suspension', 'De-registration'],
          explain: 'Reminder (written, with deadline), Hold (new requests for that state not processed), Suspension (all CP access suspended), De-registration (agreement terminated).',
          ref: 'SOP §4.2.3'
        },
        {
          id: 'L1-12', type: 'order', speaker: 'peter',
          prompt: 'Order the planning and sourcing steps for replenishment.',
          items: ['CP team issues the demand forecast and bill of quantities (procurement plan)', 'Supply Chain market assessment: local or international sourcing',
                  'Funding confirmed and project activated', 'Purchase order raised in WAVE against the LTA'],
          explain: 'The procurement plan is the formal handoff: Supply Chain does not act without it. A PO is raised in WAVE only once funding is confirmed and the project activated.',
          ref: 'SOP §4.1.1, §4.1.3'
        }
      ]
    },

    /* =========================================================================
     * LEVEL 2 — WHO DOES WHAT (match)
     * ======================================================================= */
    {
      id: 'L2', number: 2, title: 'Who Does What', station: 'Bor hub', color: '#00A889',
      host: 'nyakuoth', topic: 'Roles, RACI and sign-off',
      intro: 'A pipeline only flows when everyone knows their part. Match each task to the right owner.',
      howTo: 'For each task, tap the role that owns it, then press Check.',
      questionsPerRun: 6,
      questions: [
        {
          id: 'L2-01', type: 'match', speaker: 'nyakuoth',
          prompt: 'Which unit does each job?',
          roles: ['CP team', 'Supply Chain', 'Warehouse', 'Cluster'],
          pairs: [
            { task: 'Demand forecast and procurement plan', role: 'CP team' },
            { task: 'Market assessment and LTA management', role: 'Supply Chain' },
            { task: 'Receipt, counting, storage and IMS stock input approval', role: 'Warehouse' },
            { task: 'Validate needs and decide allocation', role: 'Cluster' }
          ],
          explain: 'Each unit owns a segment: CP team plans, Supply Chain sources, Warehouse stores and dispatches, Clusters validate and allocate.',
          ref: 'SOP §3.1, Table 4'
        },
        {
          id: 'L2-02', type: 'match', speaker: 'achol',
          prompt: 'In the RACI, who is Accountable (A) for each activity?',
          roles: ['CP team', 'Supply Chain', 'Warehouse', 'Cluster', 'Partner'],
          pairs: [
            { task: 'Sourcing, LTAs and purchase orders', role: 'Supply Chain' },
            { task: 'Dispatch and release', role: 'Warehouse' },
            { task: 'Needs validation and request endorsement', role: 'Cluster' },
            { task: 'Distribution reporting and 5W', role: 'Partner' }
          ],
          explain: 'A owns the outcome, one per row. Supply Chain owns sourcing, Warehouse owns dispatch, the Cluster owns endorsement and the Partner owns its reporting.',
          ref: 'SOP §3.2, Table 5'
        },
        {
          id: 'L2-03', type: 'match', speaker: 'achol',
          prompt: 'Tricky ones: who is Accountable (A)?',
          roles: ['CP team', 'Supply Chain', 'Warehouse', 'Cluster'],
          pairs: [
            { task: 'Receipt, quality control and storage', role: 'Supply Chain' },
            { task: 'Prepositioning to the hubs', role: 'CP team' },
            { task: 'Partner onboarding and compliance', role: 'CP team' },
            { task: 'Stock status analysis and reporting', role: 'CP team' }
          ],
          explain: 'Supply Chain is accountable for receipt and QC (CP team and Warehouse do the work). The CP team is accountable for prepositioning, onboarding and stock status analysis.',
          ref: 'SOP §3.2, Table 5'
        },
        {
          id: 'L2-04', type: 'match', speaker: 'achol',
          prompt: 'In the RACI, who is Responsible (R): who actually does the work?',
          roles: ['CP team', 'Supply Chain', 'Warehouse', 'Partner'],
          pairs: [
            { task: 'Prepositioning to the hubs', role: 'Supply Chain' },
            { task: 'Post-distribution monitoring', role: 'Partner' },
            { task: 'Dispatch and release', role: 'Warehouse' },
            { task: 'Request review, allocation and SWR approval', role: 'CP team' }
          ],
          explain: 'Supply Chain moves stock to the hubs, partners carry out PDM (CP team accountable), the Warehouse dispatches, and the CP team reviews requests and approves SWRs.',
          ref: 'SOP §3.2, Table 5'
        },
        {
          id: 'L2-05', type: 'match', speaker: 'lual',
          prompt: 'Who signs each document?',
          roles: ['CP Cluster Focal Point', 'Partner focal point', 'CP Officer', 'Warehouse, CP and procurement jointly'],
          pairs: [
            { task: 'Stock Withdrawal Request (SWR)', role: 'CP Cluster Focal Point' },
            { task: 'Request form', role: 'Partner focal point' },
            { task: 'Procurement plan and bill of quantities', role: 'CP Officer' },
            { task: 'Receipt voucher and visual control form', role: 'Warehouse, CP and procurement jointly' }
          ],
          explain: 'The CP Cluster Focal Point signs the SWR in IMS; the partner focal point signs the request; the CP Officer signs the procurement plan and the closure record; receipt documents are signed jointly.',
          ref: 'SOP §4.11, Table 14'
        },
        {
          id: 'L2-06', type: 'match', speaker: 'lual',
          prompt: 'Step 5, stock release. Who does what?',
          roles: ['CP team', 'CP Cluster Focal Point', 'Warehouse', 'Partner'],
          pairs: [
            { task: 'Raises the SWR in IMS', role: 'CP team' },
            { task: 'Approves the SWR', role: 'CP Cluster Focal Point' },
            { task: 'Checks stock, picks and dispatches', role: 'Warehouse' },
            { task: 'Confirms collection 24 hours ahead and signs at collection', role: 'Partner' }
          ],
          explain: 'CP team raises; CP Cluster Focal Point approves; Warehouse dispatches; partner collects and signs.',
          ref: 'SOP §4.5'
        },
        {
          id: 'L2-07', type: 'match', speaker: 'nyakuoth',
          prompt: 'Step 4, request and endorsement. Who handles each stage?',
          roles: ['CP team', 'State Focal Point (SFP)', 'Cluster (national)', 'Partner'],
          pairs: [
            { task: 'Submits the request with the assessment attached', role: 'Partner' },
            { task: 'Completeness review within 24 hours', role: 'CP team' },
            { task: 'Sub-national review within 48 hours', role: 'State Focal Point (SFP)' },
            { task: 'National approval within 24 hours', role: 'Cluster (national)' }
          ],
          explain: 'Partner submits; CP team checks completeness; SFP reviews sub-nationally; the cluster approves nationally and forwards to the CP team.',
          ref: 'SOP §4.4'
        },
        {
          id: 'L2-08', type: 'match', speaker: 'nyakuoth',
          prompt: 'Onboarding and compliance. Who does it?',
          roles: ['Partner', 'Cluster', 'CP team', 'Core Pipeline Manager'],
          pairs: [
            { task: 'Submits the DDA form and registration documents', role: 'Partner' },
            { task: 'Validates capacity, presence and coordination compliance', role: 'Cluster' },
            { task: 'Issues the distribution agreement and registers the Requester', role: 'CP team' },
            { task: 'Decides a suspension (with the cluster coordinator)', role: 'Core Pipeline Manager' }
          ],
          explain: 'The partner applies, the cluster validates, the CP team issues the agreement and registers one Requester. Suspension is decided by the Core Pipeline Manager with the cluster coordinator.',
          ref: 'SOP §4.2.2, §4.2.3'
        },
        {
          id: 'L2-09', type: 'match', speaker: 'deng',
          prompt: 'Who sets each stock status in IMS?',
          roles: ['Warehouse', 'CP Cluster Focal Point (automatic on SWR approval)', 'Supply Chain', 'Partner'],
          pairs: [
            { task: 'Available', role: 'Warehouse' },
            { task: 'Committed', role: 'CP Cluster Focal Point (automatic on SWR approval)' },
            { task: 'Released', role: 'Warehouse' },
            { task: 'Impaired (CP confirms)', role: 'Warehouse' }
          ],
          explain: 'The warehouse sets Available (stock input approved), Released (dispatch and signature) and Impaired (CP confirms). Committed is set automatically when the CP Cluster Focal Point approves the SWR.',
          ref: 'SOP §5.1, Table 15'
        },
        {
          id: 'L2-10', type: 'match', speaker: 'achol',
          prompt: 'Who produces each report or alert?',
          roles: ['IMS (automatic)', 'CP team', 'Warehouse', 'Partner'],
          pairs: [
            { task: 'Daily stock status report', role: 'IMS (automatic)' },
            { task: 'Partner stock list on the 15th and 30th', role: 'CP team' },
            { task: 'Standing expiry alert', role: 'Warehouse' },
            { task: 'Distribution report and 5W update', role: 'Partner' }
          ],
          explain: 'IMS produces the daily report automatically; the CP team produces the stock list, monthly snapshot and quarterly buffer review; the warehouse issues expiry alerts; partners report distributions.',
          ref: 'SOP §5.2, §5.3, §4.7'
        },
        {
          id: 'L2-11', type: 'match', speaker: 'achol',
          prompt: 'Monitoring and closure. Who does it?',
          roles: ['Partner', 'CP team', 'Warehouse', 'Cluster'],
          pairs: [
            { task: 'PDM of the overall distribution process', role: 'Partner' },
            { task: 'CP PDM on a sample of distributions, focused on the items', role: 'CP team' },
            { task: 'Reconciles stock at closure', role: 'Warehouse' },
            { task: 'Closes the request reference', role: 'CP team' }
          ],
          explain: 'There are two PDMs: the partner monitors the process; the CP team monitors items on a sample. At closure the warehouse reconciles stock and the CP team closes the file.',
          ref: 'SOP §4.8, §4.9'
        }
      ]
    },

    /* =========================================================================
     * LEVEL 3 — SPOT THE ERROR (spot)
     * A field with `critical` ends the level if the player MISSES it.
     * ======================================================================= */
    {
      id: 'L3', number: 3, title: 'Spot the Error', station: 'Wau hub', color: '#E5554F',
      host: 'grace', topic: 'Forms and documents',
      intro: 'Paperwork keeps the pipeline honest. Each form below has one or more mistakes. Find them all before they cause trouble.',
      howTo: 'Click every field that is wrong (click again to unmark), then press Submit review.',
      questionsPerRun: 5,
      questions: [
        {
          id: 'L3-01', type: 'spot', speaker: 'grace',
          prompt: 'Grace has sent this Core Pipeline Request. What is wrong?',
          doc: {
            title: 'Core Pipeline Request (CPR Form 2026)', subtitle: 'Partner: Hope Relief (training example)',
            fields: [
              { label: 'Form version', value: 'CPR Form 2026 (current)' },
              { label: 'Target households', value: '500 households, Bor South county, Jonglei' },
              { label: 'Item line', value: 'SNFI standard kit, quantity 500' },
              { label: 'Warehouse code', value: 'WAU (Wau hub)', error: true, why: 'Bor is covered by the Bor logistics hub (Jonglei State). Wau covers Western Bahr el Ghazal. About 10% of requests carry a wrong item or warehouse.' },
              { label: 'Needs assessment date', value: '5 months ago', error: true, why: 'An assessment is valid for 3 months.' },
              { label: 'No overdue report for this state', value: 'Confirmed' }
            ]
          },
          explain: 'The CP team completeness review checks item codes, warehouse, quantities against caseload and kit, assessment validity and overdue reports.',
          ref: 'SOP §4.3, §4.4, §2.2'
        },
        {
          id: 'L3-02', type: 'spot', speaker: 'grace',
          prompt: 'A second request from Grace. Find the mistakes.',
          doc: {
            title: 'SNFI Pipeline Request Form', subtitle: 'Partner: Hope Relief (training example)',
            fields: [
              { label: 'Form version', value: 'Old form version from a previous year', error: true, why: 'The partner uses the current form version for each request.' },
              { label: 'Target households', value: '400 households (2,400 people)' },
              { label: 'SNFI standard kits requested', value: '2,400', error: true, why: 'Quantities are checked against caseload and kit. 2,400 is the number of people (400 HH × 6), not households.' },
              { label: 'Sent to', value: 'CP officer by WhatsApp only', error: true, why: 'The form is sent in Excel by email to the cluster pipeline mailbox, with the CP team in copy.' },
              { label: 'Planned response date', value: 'Stated' },
              { label: 'Same items funded from another source', value: 'None, declared' }
            ]
          },
          explain: 'Wrong version, wrong quantities and wrong channel are all returned in the 24-hour completeness review with the correction needed.',
          ref: 'SOP §4.4, §2.1'
        },
        {
          id: 'L3-03', type: 'spot', speaker: 'deng',
          prompt: 'Deng is about to release stock to a partner. Check the release file.',
          doc: {
            title: 'Release to partner', subtitle: 'Bentiu hub (training example)',
            fields: [
              { label: 'Dispatch authority', value: 'Email from the CP officer', error: true, critical: 'CR1', why: 'Only an SWR approved in IMS by the CP Cluster Focal Point authorizes dispatch. An email never replaces it.' },
              { label: 'Release document', value: 'Waybill', error: true, why: 'A release to a partner uses an issuance form. Waybills are for transfers between IOM locations.' },
              { label: 'Collection notice', value: 'Partner phoned on the morning of collection', error: true, why: 'The partner confirms the collection date and time at least 24 hours in advance; without notice the warehouse may refuse release.' },
              { label: 'Request reference', value: 'Quoted' },
              { label: 'Partner signature', value: 'To be signed at collection, after checking quantity and condition' }
            ]
          },
          explain: 'Approved SWR in IMS, issuance form for partners, 24 hours notice, and a signature at collection: responsibility transfers at signature.',
          ref: 'SOP §4.5, §4.5.1, §4.5.2'
        },
        {
          id: 'L3-04', type: 'spot', speaker: 'deng',
          prompt: 'Stock is moving from Juba to Bentiu. Check the transfer.',
          doc: {
            title: 'Hub transfer Juba to Bentiu', subtitle: '4 trucks (training example)',
            fields: [
              { label: 'Authority', value: 'Verbal instruction from the warehouse manager', error: true, critical: 'CR1', why: 'Transfers between hubs need an SWR approved in IMS by the CP Cluster Focal Point, exactly like releases. No verbal instruction replaces it.' },
              { label: 'Document', value: 'One issuance form for the whole consignment', error: true, why: 'Transfers between IOM locations use waybills, one per truck loaded. 4 trucks = 4 waybills.' },
              { label: 'Copies', value: 'Five: white, pink, yellow, green, blue' },
              { label: 'Signed by', value: 'Driver at pickup, receiver on delivery' },
              { label: 'Reference on the document', value: 'SWR number' }
            ]
          },
          explain: 'Waybills are generated from IMS, carry the SWR number and transport terms, and signed copies return to the warehouse within 3 working days.',
          ref: 'SOP §4.5, §4.5.2'
        },
        {
          id: 'L3-05', type: 'spot', speaker: 'deng',
          prompt: 'A supplier truck has arrived in Juba. Check the receipt record.',
          doc: {
            title: 'Receipt record', subtitle: 'Juba main hub (training example)',
            fields: [
              { label: 'Receipt location', value: 'Juba main hub' },
              { label: 'Counting', value: 'One count by the warehouse team', error: true, why: 'Two independent counts, warehouse and CP, reconciled before the receipt is signed, with the driver present.' },
              { label: 'Damaged cartons', value: 'Noted after the receipt was signed, no photos', error: true, why: 'Photographs are taken before signing; damage is recorded and agreed by warehouse, CP and procurement.' },
              { label: '50 extra blankets delivered', value: 'Added to stock', error: true, why: 'Excess quantities are refused or recorded on the overage report.' },
              { label: 'Supplier certificates', value: 'Certificate of Conformity and Quality Certificate collected' }
            ]
          },
          explain: 'Juba is the only QC location: joint visual control, two counts, photos before signing, overages refused or reported.',
          ref: 'SOP §4.1.4, Table 7'
        },
        {
          id: 'L3-06', type: 'spot', speaker: 'achol',
          prompt: 'Review this distribution report before it is logged.',
          doc: {
            title: 'SNFI distribution report', subtitle: 'Partner: Hope Relief (training example)',
            fields: [
              { label: 'Submitted', value: '6 weeks after distribution', error: true, why: 'Target is 15 days; one month is the maximum. Late reports trigger the compliance ladder.' },
              { label: 'Signed beneficiary list', value: 'Attached' },
              { label: 'Photographs of beneficiaries', value: 'Attached, no consent forms', error: true, why: 'Images of people require signed consent.' },
              { label: 'Loss', value: '20 blankets stolen on the way, first mentioned here', error: true, critical: 'CR5', why: 'Loss, theft or diversion is reported within 24 hours of becoming aware, on the Loss and Damage form, not weeks later in a report.' },
              { label: '5W', value: 'Updated, CP team in copy' }
            ]
          },
          explain: 'Reports are due in 15 days (1 month max), with consent for any image. Incidents have their own 24-hour route.',
          ref: 'SOP §4.6, §4.6.2, §4.7'
        },
        {
          id: 'L3-07', type: 'spot', speaker: 'nyakuoth',
          prompt: 'Check this partner file before the partner is allowed to request.',
          doc: {
            title: 'Partner file', subtitle: 'River Aid (training example)',
            fields: [
              { label: 'Registration documents', value: 'Current' },
              { label: 'Cluster membership', value: 'Attends coordination meetings and reports through the 5W' },
              { label: 'DDA', value: 'Last validated 30 months ago', error: true, why: 'The DDA is mandatory and re-validated every 24 months.' },
              { label: 'Requesters', value: 'Three focal points registered', error: true, why: 'The CP team registers one partner focal point as Requester.' },
              { label: 'Beneficiary registration', value: 'Small registration fee per household', error: true, critical: 'CR3', why: 'All CP activity is non-fee. Charging beneficiaries is a suspension trigger.' },
              { label: 'Presence', value: 'Distributes directly in the target area' }
            ]
          },
          explain: 'All six eligibility conditions apply and the cluster confirms them at onboarding and annually.',
          ref: 'SOP §4.2.1, §4.2.2, §1'
        },
        {
          id: 'L3-08', type: 'spot', speaker: 'grace',
          prompt: 'Grace shares the distribution plan. What does not meet the standard?',
          doc: {
            title: 'Distribution plan', subtitle: 'Hope Relief, Bor South (training example)',
            fields: [
              { label: 'Community information', value: 'Announced on the day of distribution', error: true, why: 'Targeting criteria, kit contents, timeline, complaint channels and free aid policy are communicated in advance.' },
              { label: 'Distribution team', value: 'All-male team', error: true, why: 'A mixed-gender team trained in PSEA and GBV risk mitigation, with a named team leader.' },
              { label: 'Complaints', value: 'Hotline only, no desk at the site', error: true, why: 'A complaints desk is staffed at every site by trained personnel.' },
              { label: 'Site layout', value: 'Separate entry, registration, distribution and exit points' },
              { label: 'People who cannot reach the site', value: 'Door-to-door delivery' }
            ]
          },
          explain: 'Distribution standards cover community information, team, site, complaints desk, verification and visibility.',
          ref: 'SOP §4.6, Table 12'
        },
        {
          id: 'L3-09', type: 'spot', speaker: 'grace',
          prompt: 'After endorsement, Grace needs to change the site. Check the change note.',
          doc: {
            title: 'Change to an agreed distribution', subtitle: 'Hope Relief (training example)',
            fields: [
              { label: 'Reason', value: 'Security incident near the original site' },
              { label: 'Decision', value: 'Partner decided; cluster to be told in the distribution report', error: true, why: 'Changes are justified in writing and agreed with the cluster before implementation.' },
              { label: 'Timing of notice', value: 'Sent 5 days after endorsement, activities already started', error: true, why: 'A change of location or caseload is justified in writing within 24 hours and before activities start.' },
              { label: 'CP team', value: 'In copy' },
              { label: 'Supporting documents', value: 'Attached' }
            ]
          },
          explain: 'Security is a valid reason, but the change must be written, justified and agreed with the cluster first, with the CP team informed.',
          ref: 'SOP §4.4, §4.6.1'
        },
        {
          id: 'L3-10', type: 'spot', speaker: 'achol',
          prompt: 'Check this draft of the monthly CP status snapshot.',
          doc: {
            title: 'Core Pipeline status snapshot (draft)', subtitle: 'Monthly (training example)',
            fields: [
              { label: 'SNFI standard kits', value: '60,000 kits, band: Healthy', error: true, why: 'SNFI buffer is 44,000. 60,000 is between one and two times the buffer: Consuming buffer.' },
              { label: 'WASH buffer', value: '17,000 kits a month × 4 = 68,000' },
              { label: 'Buffer', value: 'Reported to donors as a separate category', error: true, why: 'The buffer is a planning and advocacy figure at cluster level, not a donor reporting category.' },
              { label: 'Buffer review', value: 'Refreshed quarterly against actual consumption' },
              { label: 'Contents', value: 'Stock by hub, stock en route, pipeline break projection, band per stream' }
            ]
          },
          explain: 'The monthly snapshot is the main status product and states the buffer band for each stream explicitly.',
          ref: 'SOP §5.3, §6, §6.1'
        },
        {
          id: 'L3-11', type: 'spot', speaker: 'nyakuoth',
          prompt: 'Review the complaints log from a distribution.',
          doc: {
            title: 'Complaints and feedback log', subtitle: 'Distribution site (training example)',
            fields: [
              { label: 'Queue complaint', value: 'Resolved on the day' },
              { label: 'PSEA allegation against a staff member', value: 'Logged in the feedback register for monthly analysis', error: true, critical: 'CR6', why: 'PSEA allegations bypass the feedback loop and are reported immediately through IOM PSEA channels.' },
              { label: 'Missing item complaint', value: 'Closed with no reply to the person', error: true, why: 'The loop is: define, collect and sort, act (corrective action and response to the person), analyse.' },
              { label: 'Patterns', value: 'Reported in the distribution report and PDM' }
            ]
          },
          explain: 'Feedback is recorded, acted on and closed. PSEA and protection allegations go straight to IOM channels.',
          ref: 'SOP §7.2, §7.3'
        }
      ]
    },

    /* =========================================================================
     * LEVEL 4 — BUFFER WATCH (choice + gauge)
     * visual.hideBands: true hides the colours until the player answers.
     * ======================================================================= */
    {
      id: 'L4', number: 4, title: 'Buffer Watch', station: 'Bentiu hub', color: '#F28C28',
      host: 'peter', topic: 'Buffer and pipeline break',
      intro: 'Stock takes 4 to 5 months to arrive. If we wait until it is low, it is already too late. Read the gauge and act on the band.',
      howTo: 'Read the stock gauge and choose the right answer.',
      questionsPerRun: 6,
      questions: [
        {
          id: 'L4-01', type: 'choice', speaker: 'peter',
          prompt: 'SNFI stock is 120,000 standard kits. Which band are we in?',
          visual: { type: 'gauge', stream: 'SNFI', stock: 120000, hideBands: true },
          options: [
            { text: 'Healthy', correct: true },
            { text: 'Consuming buffer', why: 'Consuming buffer is 44,000 to 88,000 for SNFI.' },
            { text: 'Urgent replenishment', why: 'Urgent is below 44,000 for SNFI.' }
          ],
          explain: 'SNFI buffer = 11,000 a month × 4 = 44,000. Healthy is above twice the buffer: above 88,000.',
          ref: 'SOP §6, Figure 6'
        },
        {
          id: 'L4-02', type: 'choice', speaker: 'peter',
          prompt: 'SNFI stock is 60,000 kits: Consuming buffer. What should the CP team do?',
          visual: { type: 'gauge', stream: 'SNFI', stock: 60000 },
          options: [
            { text: 'Start replenishment now: update consumption, issue the bill of quantities, confirm funding, raise the PO on activation, and notify clusters and donors', correct: true },
            { text: 'Wait until stock reaches 44,000, then order', why: 'With a 4 to 5 month lead time, an order raised at the buffer floor arrives after stock-out.' },
            { text: 'Ration all allocations immediately', why: 'Rationing is the action for Urgent replenishment (below the buffer).' },
            { text: 'Nothing changes: keep prepositioning as normal', why: 'That is the Healthy band action.' }
          ],
          explain: 'In the amber band replenishment starts at once, so the new stock lands before the buffer is used up.',
          ref: 'SOP §6.3, Table 19'
        },
        {
          id: 'L4-03', type: 'choice', speaker: 'peter',
          prompt: 'WASH stock is 50,000 standard kits. Which band?',
          visual: { type: 'gauge', stream: 'WASH', stock: 50000, hideBands: true },
          options: [
            { text: 'Urgent replenishment', correct: true },
            { text: 'Consuming buffer', why: 'For WASH, Consuming buffer is 68,000 to 136,000.' },
            { text: 'Healthy', why: 'For WASH, Healthy is above 136,000.' }
          ],
          explain: 'WASH buffer = 17,000 a month × 4 = 68,000. 50,000 is below the buffer: Urgent replenishment.',
          ref: 'SOP §6, Figure 6'
        },
        {
          id: 'L4-04', type: 'choice', speaker: 'achol',
          prompt: 'WASH stock is in the red band. What does the CP team do?',
          visual: { type: 'gauge', stream: 'WASH', stock: 50000 },
          options: [
            { text: 'Escalate in writing to CP management, clusters and donors; ration allocations against the prioritisation criteria; examine emergency procurement and regional stock borrowing', correct: true },
            { text: 'Release to whoever requests first until stock runs out', why: 'In the red band allocations are rationed against the Section 4.3 criteria, not first come first served.' },
            { text: 'Stop all releases until new stock arrives', why: 'The SOP rations allocations; it does not stop the pipeline.' },
            { text: 'Start replenishment and notify clusters, nothing more', why: 'That is the amber action. Red needs written escalation and rationing too.' }
          ],
          explain: 'Urgent replenishment means written escalation, rationing, and looking at emergency procurement and regional borrowing.',
          ref: 'SOP §6.3, Table 19'
        },
        {
          id: 'L4-05', type: 'choice', speaker: 'peter',
          prompt: 'WASH stock is 100,000 kits. A colleague says "That is more than 88,000, so we are Healthy." Which band is it really?',
          visual: { type: 'gauge', stream: 'WASH', stock: 100000, hideBands: true },
          options: [
            { text: 'Consuming buffer: WASH has its own thresholds', correct: true },
            { text: 'Healthy', why: '88,000 is the SNFI threshold. For WASH, Healthy starts above 136,000.' },
            { text: 'Urgent replenishment', why: 'Urgent for WASH is below 68,000.' }
          ],
          explain: 'Buffer thresholds differ between SNFI and WASH. WASH: 68,000 to 136,000 is Consuming buffer.',
          ref: 'SOP §1, §6, Figure 6'
        },
        {
          id: 'L4-06', type: 'choice', speaker: 'peter',
          prompt: 'Average SNFI consumption is 11,000 kits a month. What is the SNFI buffer?',
          visual: { type: 'formula', parts: ['11,000 kits a month', '×', '4 months', '=', '?'] },
          options: [
            { text: '44,000 kits', correct: true },
            { text: '33,000 kits', why: 'The lead time factor is 4 months, not 3.' },
            { text: '55,000 kits', why: 'The lead time factor is 4 months, not 5.' },
            { text: '88,000 kits', why: '88,000 is twice the buffer: the line between Healthy and Consuming buffer.' }
          ],
          explain: 'Buffer = average monthly consumption × procurement lead time (4 months).',
          ref: 'SOP §6, Figure 6'
        },
        {
          id: 'L4-07', type: 'choice', speaker: 'peter',
          prompt: 'Imaginary example: consumption rises to 15,000 kits a month. What is the new buffer?',
          visual: { type: 'formula', parts: ['15,000 kits a month', '×', '4 months', '=', '?'] },
          options: [
            { text: '60,000 kits, and Healthy now starts above 120,000', correct: true },
            { text: 'Still 44,000: the buffer is fixed', why: 'The buffer is refreshed quarterly against actual consumption. Fixed figures were the old approach this SOP replaced.' },
            { text: '45,000 kits', why: '15,000 × 4 = 60,000.' }
          ],
          explain: 'The buffer moves with consumption. That is why the SOP replaced the old fixed figures with a calculation.',
          ref: 'SOP §6, §6.1'
        },
        {
          id: 'L4-08', type: 'choice', speaker: 'peter',
          prompt: 'Why is the lead time factor 4 months?',
          options: [
            { text: 'It is the average time for regionally procured items to reach South Sudan, so the buffer covers consumption while an order is in transit', correct: true },
            { text: 'It is the length of the rainy season', why: 'The factor is about procurement lead time, not the season.' },
            { text: 'Donors require four months of reporting', why: 'The buffer is not a donor reporting category.' }
          ],
          explain: 'The lead time factor is reviewed annually against procurement performance.',
          ref: 'SOP §6.1'
        },
        {
          id: 'L4-09', type: 'choice', speaker: 'achol',
          prompt: 'How often is the buffer refreshed against actual consumption?',
          options: [
            { text: 'Quarterly (the lead time factor is reviewed annually)', correct: true },
            { text: 'Once, at the start of the project year', why: 'It is refreshed quarterly against actual consumption.' },
            { text: 'Daily, from the IMS stock report', why: 'IMS gives daily stock status, but the buffer is refreshed quarterly.' }
          ],
          explain: 'Changes are recorded in the monthly snapshot. The consumption and buffer review is a quarterly CP team product.',
          ref: 'SOP §6.1, §5.3'
        },
        {
          id: 'L4-10', type: 'choice', speaker: 'deng',
          prompt: 'There is enough of every WASH kit item for 50,000 kits, except filter cloths: only 10,000. How many complete WASH kits do we have?',
          options: [
            { text: '10,000: one missing item breaks the kit', correct: true },
            { text: '50,000: filter cloths are a minor item', why: 'The break date is when any item of a kit runs out. One missing item breaks the kit.' },
            { text: '30,000: the average', why: 'Kits are counted by the scarcest item, not an average.' }
          ],
          explain: 'Each kit is assessed on its own item list. Hygiene kits and the MHM kit count as single items.',
          ref: 'SOP §6.2'
        },
        {
          id: 'L4-11', type: 'choice', speaker: 'achol',
          prompt: 'The buffer is...',
          options: [
            { text: 'A planning and advocacy figure at cluster level', correct: true },
            { text: 'A donor reporting category', why: 'Donor reporting tracks kits against the project that funded them.' },
            { text: 'Stock reserved for IOM staff use', why: 'The buffer is about supply cover, not reserved stock for staff.' }
          ],
          explain: 'Donor reporting tracks kits against the project that funded them; the buffer is a planning and advocacy figure.',
          ref: 'SOP §6.1'
        },
        {
          id: 'L4-12', type: 'choice', speaker: 'grace',
          prompt: 'SNFI stock is red. Grace calls: "Just release 2,000 kits now, the cluster will endorse next week." What do you do?',
          visual: { type: 'gauge', stream: 'SNFI', stock: 30000 },
          options: [
            { text: 'Route the request for endorsement; allocations are rationed against the prioritisation criteria', correct: true },
            { text: 'Release the 2,000 kits now; endorsement can follow', critical: 'CR2', why: 'Stock is released only against an endorsed request, even in an emergency.' },
            { text: 'Release half now and half after endorsement', critical: 'CR2', why: 'Any release before endorsement breaks the rule.' }
          ],
          explain: 'Low stock makes endorsement and fair prioritisation more important, not less.',
          ref: 'SOP §4.4, §4.5, §6.3'
        },
        {
          id: 'L4-13', type: 'choice', speaker: 'peter',
          prompt: 'For the pipeline break calculation, which stock is counted?',
          options: [
            { text: 'In country, en route and under procurement, reported separately', correct: true },
            { text: 'Only stock physically in Juba', why: 'Stock in all hubs, en route and under procurement is counted.' },
            { text: 'Only stock that is committed', why: 'Committed stock is held against approved SWRs; the calculation looks at all pipeline stock.' }
          ],
          explain: 'Locally sourced bamboo and wooden poles are excluded from the calculation.',
          ref: 'SOP §6.2'
        },
        {
          id: 'L4-14', type: 'choice', speaker: 'nyakuoth',
          prompt: 'Stock is less than need. Which of these is NOT a prioritisation criterion?',
          options: [
            { text: 'First come, first served', correct: true },
            { text: 'Severity and scale of need', why: 'This is a "need and urgency" criterion.' },
            { text: 'Protection risks and highly vulnerable groups', why: 'This is a "need and urgency" criterion.' },
            { text: 'Access and safe delivery within the season', why: 'This is a "feasibility and fairness" criterion.' }
          ],
          explain: 'The cluster and CP team apply need, urgency, feasibility and fairness criteria together; within a location, the vulnerability index is used.',
          ref: 'SOP §4.3, Table 10'
        }
      ]
    },

    /* =========================================================================
     * LEVEL 5 — KIT BUILDER (choice tiles + match)
     * The 5 kit categories follow the CP Budget Tool (Kits sheet).
     * ======================================================================= */
    {
      id: 'L5', number: 5, title: 'Kit Builder', station: 'Malakal hub', color: '#7A5CFA',
      host: 'deng', topic: 'Kit categories and contents',
      intro: 'Five kits leave this warehouse. Pack them right and know who endorses them.',
      howTo: 'Pick every item that belongs, then press Check. Some questions ask for one answer only.',
      questionsPerRun: 6,
      questions: [
        {
          id: 'L5-01', type: 'choice', speaker: 'deng', multi: true, layout: 'tiles',
          prompt: 'Pack the SNFI standard kit. Select every item that goes in it.',
          options: [
            { text: 'Plastic sheets 4x6m', correct: true }, { text: 'Rubber rope ties', correct: true },
            { text: 'Blankets', correct: true }, { text: 'Mosquito nets', correct: true },
            { text: 'Kanga', correct: true }, { text: 'Kitchen set', correct: true },
            { text: 'Sleeping mat', correct: true }, { text: 'Solar lamp', correct: true },
            { text: 'NFI bag', correct: true },
            { text: 'Bucket with tap' }, { text: 'Bars of soap' }, { text: 'Wooden poles' }
          ],
          explain: 'SNFI standard kit: 2 plastic sheets 4x6m, 2 rubber rope ties, 2 blankets, 2 mosquito nets, 2 kanga, 1 kitchen set, 1 sleeping mat, 1 solar lamp, 1 NFI bag.',
          ref: 'SOP §2.1, Table 2; Budget tool, Kits sheet'
        },
        {
          id: 'L5-02', type: 'choice', speaker: 'deng', multi: true, layout: 'tiles',
          prompt: 'Pack the WASH standard kit. Select every item that goes in it.',
          options: [
            { text: 'Bucket with tap', correct: true }, { text: 'Bucket without tap', correct: true },
            { text: 'Filter cloth', correct: true }, { text: 'Bars of soap', correct: true },
            { text: 'Water purification tablets', correct: true }, { text: 'PuR flocculant sachets', correct: true },
            { text: 'Blanket' }, { text: 'Mosquito net' }, { text: 'Kitchen set' }, { text: 'Plastic sheet' }
          ],
          explain: 'WASH standard kit: 1 bucket with tap, 1 bucket without tap, 1 filter cloth, 2 bars of soap, 290 water purification tablets, 45 PuR flocculant sachets.',
          ref: 'SOP §2.1, Table 2; Budget tool, Kits sheet'
        },
        {
          id: 'L5-03', type: 'choice', speaker: 'deng', multi: true, layout: 'tiles',
          prompt: 'Emergency shelter kit: which items are added only where they are not available locally?',
          options: [
            { text: 'Bamboo (2 bundles)', correct: true }, { text: 'Wooden poles (6)', correct: true },
            { text: 'Plastic sheets 4x6m', why: 'The 2 plastic sheets are always in the kit.' },
            { text: 'Rope (2 bundles)', why: 'The 2 bundles of rope are always in the kit.' }
          ],
          explain: 'Emergency shelter kit: 2 plastic sheets 4x6m and 2 bundles of rope; 2 bundles of bamboo and 6 wooden poles where not available locally.',
          ref: 'SOP §2.1, Table 2'
        },
        {
          id: 'L5-04', type: 'choice', speaker: 'deng',
          prompt: 'How many plastic sheets (4x6m) are in one SNFI standard kit?',
          options: [ { text: '2', correct: true }, { text: '1' }, { text: '3' }, { text: '4' } ],
          explain: 'Both the SNFI standard kit and the emergency shelter kit contain 2 plastic sheets 4x6m.',
          ref: 'SOP §2.1, Table 2'
        },
        {
          id: 'L5-05', type: 'choice', speaker: 'deng',
          prompt: 'How many water purification tablets are in one WASH standard kit?',
          options: [ { text: '290', correct: true }, { text: '45' }, { text: '145' }, { text: '580' } ],
          explain: '290 water purification tablets and 45 PuR flocculant sachets per WASH standard kit.',
          ref: 'SOP §2.1, Table 2; Budget tool, Kits sheet'
        },
        {
          id: 'L5-06', type: 'match', speaker: 'nyakuoth',
          prompt: 'Which cluster endorses each kit?',
          roles: ['SLSC Cluster', 'WASH Cluster'],
          pairs: [
            { task: 'SNFI standard kit', role: 'SLSC Cluster' },
            { task: 'Emergency shelter kit', role: 'SLSC Cluster' },
            { task: 'WASH standard kit', role: 'WASH Cluster' },
            { task: 'Hygiene kit', role: 'WASH Cluster' }
          ],
          explain: 'Endorsement routing is one of the three ways SNFI and WASH differ.',
          ref: 'SOP §2.1, Table 2'
        },
        {
          id: 'L5-07', type: 'match', speaker: 'deng',
          prompt: 'Which kit does each item belong to?',
          roles: ['SNFI standard kit', 'Emergency shelter kit', 'WASH standard kit'],
          pairs: [
            { task: 'Kanga', role: 'SNFI standard kit' },
            { task: 'PuR flocculant sachets', role: 'WASH standard kit' },
            { task: 'Wooden poles', role: 'Emergency shelter kit' },
            { task: 'Filter cloth', role: 'WASH standard kit' },
            { task: 'Solar lamp', role: 'SNFI standard kit' }
          ],
          explain: 'Kit contents are set by the clusters and are the basis of the pipeline break calculation.',
          ref: 'SOP §2.1, Table 2'
        },
        {
          id: 'L5-08', type: 'choice', speaker: 'achol',
          prompt: 'Which list shows the five kit categories in the CP budget tool?',
          options: [
            { text: 'SNFI standard kit, Emergency shelter kit, WASH standard kit, Hygiene kit, MHM kit', correct: true },
            { text: 'SNFI standard kit, Kitchen kit, WASH standard kit, Hygiene kit, Dignity kit', why: 'There is no separate kitchen or dignity kit: the kitchen set is inside the SNFI kit.' },
            { text: 'Shelter kit, Blanket kit, Bucket kit, Soap kit, Lamp kit', why: 'Items are grouped into kits; they are not kits on their own.' }
          ],
          explain: 'The budget tool costs five kits: SNFI standard (SNFI), Emergency shelter (ES), WASH standard (WASH), Hygiene (HYG) and MHM (MHM).',
          ref: 'Budget tool, Kits sheet (Kit summary)'
        },
        {
          id: 'L5-09', type: 'choice', speaker: 'nyakuoth', multi: true,
          prompt: 'SNFI and WASH follow one CP process. Where do they differ? Select all that apply.',
          options: [
            { text: 'Kit contents', correct: true },
            { text: 'Buffer thresholds', correct: true },
            { text: 'Endorsement routing', correct: true },
            { text: 'The nine workflow steps', why: 'SNFI and WASH follow one process.' },
            { text: 'The non-fee model', why: 'All CP activity is non-fee, for both streams.' }
          ],
          explain: 'SNFI and WASH follow one process and are separated only where they differ: kit contents, buffer thresholds and endorsement routing.',
          ref: 'SOP §1'
        },
        {
          id: 'L5-10', type: 'choice', speaker: 'grace',
          prompt: 'A household received an SNFI standard kit. Can it also receive a WASH standard kit?',
          options: [
            { text: 'Yes: kits are issued separately and a household may receive more than one', correct: true },
            { text: 'No: one kit per household, always', why: 'The SOP says a household may receive more than one kit.' },
            { text: 'Only if the SNFI kit is returned', why: 'There is no such rule.' }
          ],
          explain: 'Kits are issued separately; a household may receive more than one.',
          ref: 'SOP §2.1'
        },
        {
          id: 'L5-11', type: 'choice', speaker: 'achol',
          prompt: 'What household size is used for planning?',
          options: [ { text: '6 persons', correct: true }, { text: '5 persons' }, { text: '4 persons' }, { text: '8 persons' } ],
          explain: 'Planning uses an average household size of 6 persons. The budget tool uses the same figure to turn households into individuals.',
          ref: 'SOP §2.1; Budget tool, Parameters (B. Targets)'
        },
        {
          id: 'L5-12', type: 'choice', speaker: 'peter',
          prompt: 'In the pipeline break calculation, how are hygiene kits and MHM kits counted?',
          options: [
            { text: 'As single items', correct: true },
            { text: 'Item by item, like the SNFI kit', why: 'Hygiene kits and the MHM kit count as single items.' },
            { text: 'They are not counted', why: 'They are counted, as single items. Only locally sourced bamboo and poles are excluded.' }
          ],
          explain: 'Each kit is assessed on its own item list; hygiene kits and MHM kits count as single items.',
          ref: 'SOP §6.2'
        }
      ]
    },

    /* =========================================================================
     * LEVEL 6 — BUDGET LOGIC (choice / multi / order)
     * Teaches the logic of the CP Budget Tool. Round, imaginary numbers only.
     * ======================================================================= */
    {
      id: 'L6', number: 6, title: 'Budget Logic', station: 'Abyei field warehouse', color: '#19A7E0',
      host: 'peter', topic: 'CP budget tool logic',
      intro: 'A donor wants a CP project budget. You won\'t need a calculator, just the logic: what goes in, what drives each line, and why the total moves.',
      howTo: 'Choose the right answer. Numbers are round, imaginary examples.',
      questionsPerRun: 6,
      questions: [
        {
          id: 'L6-01', type: 'order', speaker: 'peter',
          prompt: 'Put the budget tool steps in order.',
          items: ['Enter project details and target households', 'Set the share of households receiving each kit', 'Fill the delivery plan: destinations and share of households',
                  'Set the share of households covered by IOM-led PDM', 'Set the share of each post\'s time charged to the project', 'Read the result on the Budget and Summary sheets'],
          explain: 'Yellow cells are inputs; everything else calculates.',
          ref: 'Budget tool, Parameters (How to use this tool)'
        },
        {
          id: 'L6-02', type: 'choice', speaker: 'peter',
          prompt: 'Target: 1,000 households. 50% of households receive a WASH standard kit. How many WASH kits does the tool plan?',
          visual: { type: 'formula', parts: ['1,000 HH', '×', '50%', '=', '? kits'] },
          options: [ { text: '500', correct: true }, { text: '1,000', why: 'Only half of the households receive this kit.' }, { text: '3,000', why: 'That is half the number of people (1,000 × 6 × 50%). Kits are planned per household.' } ],
          explain: 'Kits required = share of households × target households.',
          ref: 'Budget tool, Parameters (C. Kit mix)'
        },
        {
          id: 'L6-03', type: 'choice', speaker: 'grace',
          prompt: 'Kit mix: SNFI 100%, WASH 80%, Hygiene 50%. That adds up to 230%. Is that an error?',
          options: [
            { text: 'No: a household may receive more than one kit, so kit shares do not need to add up to 100%', correct: true },
            { text: 'Yes: kit shares must add up to 100%', why: 'Each kit share is independent. It is the delivery plan shares that must add up to 100%.' }
          ],
          explain: 'Kits are issued separately. Only the delivery plan (where the households are) must total 100%.',
          ref: 'Budget tool, Parameters (C. Kit mix, D. Delivery plan); SOP §2.1'
        },
        {
          id: 'L6-04', type: 'choice', speaker: 'peter',
          prompt: 'Delivery plan: Bor 60%, Wau 30%. What does the tool say?',
          options: [
            { text: 'Warning: shares must add up to 100%', correct: true },
            { text: 'OK: the rest goes to Juba automatically', why: 'Nothing is added automatically: the tool flags the gap.' },
            { text: 'OK: shares can be anything', why: 'Delivery plan shares describe where all target households are, so they must total 100%.' }
          ],
          explain: 'The delivery plan check reads "WARNING: shares must add up to 100%" until the total is exactly 100%.',
          ref: 'Budget tool, Parameters (D. Delivery plan); Budget sheet (5. Checks)'
        },
        {
          id: 'L6-05', type: 'choice', speaker: 'peter',
          prompt: 'Where does the cost per kit come from?',
          options: [
            { text: 'Each item\'s quantity per kit × its LTA price per piece, added up. LTA prices include freight to Juba', correct: true },
            { text: 'A fixed average set by the donor', why: 'Kit cost is built item by item from the LTA price lists on the Kits sheet.' },
            { text: 'Last year\'s total spend divided by kits', why: 'The tool builds the cost from current LTA prices.' }
          ],
          explain: 'LTA prices are fixed for the year and quoted delivered to the Juba warehouse, freight included.',
          ref: 'Budget tool, Kits sheet; SOP §4.1.1'
        },
        {
          id: 'L6-06', type: 'choice', speaker: 'peter',
          prompt: 'LTA prices are quoted delivered to Juba. Should you add a separate line for freight to Juba?',
          options: [
            { text: 'No: freight to Juba is already in the LTA price', correct: true },
            { text: 'Yes: freight is always a separate line', why: 'That would count freight twice. LTA prices are quoted delivered to Juba, freight included.' }
          ],
          explain: 'Supplies lines read "at LTA prices, freight to Juba included". Transport lines in the budget cover Juba to the destinations.',
          ref: 'SOP §4.1.1; Budget sheet (B. Supplies)'
        },
        {
          id: 'L6-07', type: 'choice', speaker: 'achol', multi: true,
          prompt: 'Which lines sit in category B, "Supplies, commodities and materials"? Select all that apply.',
          options: [
            { text: 'Kits at LTA prices', correct: true },
            { text: 'Road transport from Juba to destinations', correct: true },
            { text: 'Loading and offloading', correct: true },
            { text: 'Insurance on procurement value', correct: true },
            { text: 'Loss and damage allowance', correct: true },
            { text: 'Warehouse storage', why: 'Storage is in category C, warehousing.' },
            { text: 'Partner staff salaries', why: 'IOM does not fund partner operational costs.' }
          ],
          explain: 'Category B holds kits, transport, loading, insurance and the loss and damage allowance. Warehousing is C, staff A, travel D, PDM E.',
          ref: 'Budget sheet (3. Budget breakdown, B); SOP §1'
        },
        {
          id: 'L6-08', type: 'choice', speaker: 'peter',
          prompt: 'Insurance and the loss and damage allowance are a percentage of...',
          options: [
            { text: 'The supplies (kit) procurement value only', correct: true },
            { text: 'The total project budget', why: 'Both are applied to the kits\' procurement value, not to transport, staff or overheads.' },
            { text: 'Transport costs', why: 'Both are applied to the kits\' procurement value.' }
          ],
          explain: 'Insurance (1.61%) and loss and damage (0.2%) are both percentages of the supplies cost.',
          ref: 'Budget sheet (B.9, B.10); Other Costs (1. Rates and percentages)'
        },
        {
          id: 'L6-09', type: 'choice', speaker: 'deng',
          prompt: 'Blankets and plastic sheets are bulky but light. What usually sets the number of trucks?',
          options: [
            { text: 'Volume: the tool charges whichever is higher, the weight or the volume turned into truck tonnage', correct: true },
            { text: 'Weight only', why: 'Pipeline cargo fills a truck on volume before weight.' },
            { text: 'The number of households', why: 'Households drive kits; kits drive weight and volume, which drive trucks.' }
          ],
          explain: 'Chargeable tonnage = the higher of real tonnage and volume converted to truck tonnage. Pipeline cargo fills a truck on volume first.',
          ref: 'Budget sheet (2. Delivery plan and transport); Other Costs (Truck loading assumptions)'
        },
        {
          id: 'L6-10', type: 'choice', speaker: 'deng',
          prompt: 'Imaginary example: 100 chargeable tonnes go by road. Trucks carry 40 tonnes. How many trucks does the tool count?',
          visual: { type: 'formula', parts: ['100 MT', '÷', '40 MT', '=', '2 full + remainder'] },
          options: [
            { text: '3 trucks: 2 full trucks plus 1 for the remaining 20 tonnes', correct: true },
            { text: '2.5 trucks', why: 'Trucks are whole: a remainder needs one more truck.' },
            { text: '2 trucks', why: 'The 20 tonnes left over still need a truck.' }
          ],
          explain: 'The tool counts full 40 MT trucks plus one for any remainder. A remainder of 25 MT or less can use the 20/25 MT truck rate.',
          ref: 'Budget sheet (2. Delivery plan and transport, trucks)'
        },
        {
          id: 'L6-11', type: 'choice', speaker: 'deng',
          prompt: 'Loading and offloading is charged at USD 200 per truck. Trucks go from 3 to 5. What happens to the loading line?',
          options: [
            { text: 'It goes from USD 600 to USD 1,000', correct: true },
            { text: 'It stays the same: loading is a lump sum', why: 'Loading is charged per truck loaded.' },
            { text: 'It goes from USD 600 to USD 800', why: '5 trucks × USD 200 = USD 1,000.' }
          ],
          explain: 'Loading and offloading = road trucks × rate per truck.',
          ref: 'Budget sheet (B.8); Other Costs (5. Surge loading); SOP §4.1.5'
        },
        {
          id: 'L6-12', type: 'choice', speaker: 'deng',
          prompt: 'How does the tool cost warehousing (category C)?',
          options: [
            { text: 'Project tonnage × cost per tonne for handling, storage and warehouse staff', correct: true },
            { text: 'A fixed monthly fee per hub', why: 'Hub costs are turned into a cost per tonne and charged on the project\'s tonnage.' },
            { text: 'Per kit, at the same rate for every kit', why: 'It is per tonne, so heavy kits cost more to store and handle.' }
          ],
          explain: 'Annual crew, storage and warehouse staff costs are spread over the pipeline tonnage to give rates per tonne.',
          ref: 'Budget sheet (C. Warehousing); Other Costs (7. Warehouse rates per tonne)'
        },
        {
          id: 'L6-13', type: 'choice', speaker: 'achol',
          prompt: 'Imaginary example: a post costs USD 10,000 a month. It spends 50% of its time on a 6-month project. What does the tool charge?',
          visual: { type: 'formula', parts: ['USD 10,000', '×', '6 months', '×', '50%', '=', '?'] },
          options: [
            { text: 'USD 30,000', correct: true },
            { text: 'USD 60,000', why: 'Only 50% of the time is charged.' },
            { text: 'USD 5,000', why: 'The monthly cost is charged for each month of the project.' }
          ],
          explain: 'Staff cost = monthly cost × project months × % of time. The share must match the post\'s workplan and be justifiable to the donor.',
          ref: 'Budget tool, Parameters (F. Staff time); Budget sheet (A)'
        },
        {
          id: 'L6-14', type: 'choice', speaker: 'achol',
          prompt: '1,000 target households; IOM will monitor 30% itself. At USD 15 per household, what is the PDM line?',
          visual: { type: 'formula', parts: ['1,000 HH', '×', '30%', '×', 'USD 15', '=', '?'] },
          options: [
            { text: 'USD 4,500', correct: true },
            { text: 'USD 15,000', why: 'Only the 30% IOM monitors itself is costed.' },
            { text: 'USD 450', why: '300 households × USD 15 = USD 4,500.' }
          ],
          explain: 'PDM = households covered by IOM-led PDM × rate. USD 15 per household comes from USD 4,500 per exercise of about 300 households.',
          ref: 'Budget sheet (E. PDM); Other Costs (11. Post-distribution monitoring)'
        },
        {
          id: 'L6-15', type: 'choice', speaker: 'achol',
          prompt: 'Imaginary example: total direct costs are USD 100,000. The Programme Support Cost is 7%. What is the total budget?',
          options: [
            { text: 'USD 107,000', correct: true },
            { text: 'USD 100,000: PSC is already inside', why: 'PSC is applied on top of total direct costs.' },
            { text: 'USD 93,000', why: 'PSC is added, not deducted.' }
          ],
          explain: 'PSC (7%, the standard IOM overhead) is applied to total direct costs. Check the ceiling each donor allows.',
          ref: 'Budget sheet (G. Programme Support Cost); Other Costs (1. Rates)'
        },
        {
          id: 'L6-16', type: 'choice', speaker: 'peter', multi: true,
          prompt: 'New LTA: the blanket price goes up. Which lines change? Select all that apply.',
          options: [
            { text: 'Kit cost and supplies line', correct: true },
            { text: 'Insurance and loss and damage allowance', correct: true },
            { text: 'Programme Support Cost and cost per household', correct: true },
            { text: 'Number of trucks', why: 'Price does not change weight or volume, so trucks stay the same.' },
            { text: 'Staff costs', why: 'Staff costs depend on monthly cost, months and % of time.' }
          ],
          explain: 'A price change flows through supplies to the percentages based on procurement value, then to PSC and every unit cost.',
          ref: 'Budget tool, Kits sheet; Budget sheet (B, G, 4. Unit costs)'
        },
        {
          id: 'L6-17', type: 'choice', speaker: 'peter',
          prompt: 'Target households double, with the same kit mix and delivery plan. Which line does NOT rise by itself?',
          options: [
            { text: 'Staff costs', correct: true },
            { text: 'Supplies', why: 'More households = more kits = more supplies cost.' },
            { text: 'Warehousing', why: 'More kits = more tonnes handled and stored.' },
            { text: 'Transport', why: 'More tonnes = more trucks.' }
          ],
          explain: 'Staff cost is driven by monthly cost, months and % of time, not by households. Kits, tonnage, transport, warehousing and PDM scale with households.',
          ref: 'Budget sheet (A, B, C, E)'
        },
        {
          id: 'L6-18', type: 'choice', speaker: 'deng',
          prompt: '500 households switch from the SNFI standard kit to the emergency shelter kit. Apart from supplies, which costs jump most?',
          options: [
            { text: 'Transport and warehousing: the emergency shelter kit is much heavier and bulkier', correct: true },
            { text: 'Staff costs', why: 'Staff costs do not depend on the kit mix.' },
            { text: 'Travel', why: 'Travel depends on trips and nights, not on kits.' }
          ],
          explain: 'Weight and volume per kit drive tonnage, which drives transport and warehousing. With poles and bamboo, the emergency shelter kit weighs far more than an SNFI kit.',
          ref: 'Budget tool, Kits sheet (weight per kit); Budget sheet (B.6, C)'
        },
        {
          id: 'L6-19', type: 'choice', speaker: 'achol',
          prompt: 'Imaginary example: total budget USD 600,000 for 1,000 households. What is the cost per person?',
          visual: { type: 'formula', parts: ['USD 600,000', '÷', '(1,000 HH × 6)', '=', '?'] },
          options: [
            { text: 'USD 100 per person (USD 600 per household)', correct: true },
            { text: 'USD 600 per person', why: 'USD 600 is per household. Each household is 6 people.' },
            { text: 'USD 60 per person', why: '1,000 households × 6 = 6,000 people. USD 600,000 ÷ 6,000 = USD 100.' }
          ],
          explain: 'Cost per household = total ÷ target households. Cost per person = total ÷ target individuals: the figure that feeds HNRP costing.',
          ref: 'Budget sheet (4. Unit costs)'
        },
        {
          id: 'L6-20', type: 'choice', speaker: 'peter',
          prompt: 'How is each transport mode charged in the tool?',
          options: [
            { text: 'Road per truck, river per cubic metre, air per tonne', correct: true },
            { text: 'All modes per kit', why: 'Transport is costed per truck, cubic metre or tonne depending on mode.' },
            { text: 'Road per tonne, river per truck, air per kit', why: 'Road is per truck (by destination and truck size), river per m³, air per MT.' }
          ],
          explain: 'Road rates come per truck by destination and truck size under the transport LTA, checkpoints included.',
          ref: 'Budget sheet (B.6, B.7); SOP §4.1.5'
        },
        {
          id: 'L6-21', type: 'choice', speaker: 'achol', multi: true,
          prompt: 'Which inputs drive the travel line (category D)? Select all that apply.',
          options: [
            { text: 'Number of UNHAS return trips', correct: true },
            { text: 'Number of DSA nights', correct: true },
            { text: 'Target households', why: 'Travel is planned for monitoring and verification missions, not per household.' },
            { text: 'Kit weight', why: 'Kit weight drives transport and warehousing, not travel.' }
          ],
          explain: 'Travel = UNHAS return trips × rate per trip + DSA nights × rate per night.',
          ref: 'Budget tool, Parameters (G. Travel); Budget sheet (D)'
        }
      ]
    },

    /* =========================================================================
     * LEVEL 7 — BOSS ROUND (branching scenarios)
     * One scenario is picked at random each run.
     * Each node: speaker, text, optional visual, options[{ text, correct,
     * feedback, next, critical }]. next: null ends the scenario.
     * ======================================================================= */
    {
      id: 'L7', number: 7, title: 'Boss Round', station: 'Renk field warehouse', color: '#D6246E',
      host: 'achol', topic: 'Mixed emergency scenario', boss: true,
      intro: 'Final stop. An emergency lands on your desk. Pressure is high, stock is tight and people push you to cut corners. Every choice has consequences.',
      howTo: 'Choose what you would do. Wrong choices cost a life; breaking a critical rule ends the round.',
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
