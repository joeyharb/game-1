# Question map

Every playable item in `content.js`, the mission it belongs to, and its source.
"SOP" is the IOM South Sudan Core Pipeline Operations SOP (Draft 1, September 2026). "Budget tool" and sheet names refer to CP Budget Tool v2 (October 2026). Both files are in `../source/`.

This file is generated from `content.js`. After editing, regenerate it with `node tools/make_question_map.js .` (needs Node.js), or edit the rows by hand.

## Mission 1: The Journey (route)

8 routes, 2 per run (the route marked "always" is in every run). Each correct stop is one scored move.

| ID | Route | Stops in order | Source |
|---|---|---|---|
| R-01 (always) | The nine CP steps | Procurement and prepositioning > Partner onboarding > Trigger and needs assessment > Request and endorsement > Stock release > Distribution > Distribution reporting > Post-distribution monitoring > Closure | SOP §4, Figure 3 |
| R-02 | Request review | CP completeness check (24h) > SFP sub-national review (48h) > Cluster national approval (24h) > CP confirms stock and allocates | SOP §4.4 |
| R-03 | Stock release | CP team raises the SWR in IMS > CP Cluster Focal Point approves the SWR > Partner confirms collection 24h ahead > Partner checks and signs > Warehouse records the release in IMS | SOP §4.5.1 |
| R-04 | Receipt in Juba | Pre-alert sent with the PO > Joint visual control and two counts > Receipt signed > Warehouse approves stock input > Prepositioned to field hubs | SOP §4.1.4, §4.1.5 |
| R-05 | Partner onboarding | DDA and registration to the cluster > Cluster validates (3 to 5 days) > CP team issues the agreement > One Requester registered > Orientation (SOP, PSEA, non-fee) | SOP §4.2.2 |
| R-06 | Supply chain journey | LTA supplier delivers to Juba > Juba hub: consolidation and QC > Transfer to a field hub > Partner collects on a signed issuance form > Distribution to households | SOP §2, Figure 1 |
| R-07 | Stock status in IMS | Registered at PO stage > Available > Committed (SWR approved) > Released (dispatched and signed) | SOP §4.1.4, §5.1 |
| R-08 | Compliance ladder | Reminder > Hold > Suspension > De-registration | SOP §4.2.3 |

## Mission 2: Who Does What (catch)

19 task cards, 8 per run.

| ID | Task | Owner | Source |
|---|---|---|---|
| T-01 | Demand forecast and procurement plan | CP team | SOP §3.1, §3.2 |
| T-02 | Market assessment, LTAs and purchase orders in WAVE | Supply Chain | SOP §3.1 |
| T-03 | Receipt, counting, storage and IMS stock input approval | Warehouse | SOP §3.1 |
| T-04 | Validate needs, endorse targeting, decide allocation | Cluster | SOP §3.1 |
| T-05 | Approve the SWR in IMS | CP Cluster Focal Point | SOP §4.5, §4.11 |
| T-06 | Raise the SWR in IMS | CP team | SOP §4.5 |
| T-07 | Pick, load and dispatch the stock | Warehouse | SOP §4.5, §3.2 |
| T-08 | Confirm collection 24 hours ahead and sign at collection | Partner | SOP §4.5.1 |
| T-09 | Needs assessment within 1 to 5 days | Partner | SOP §4.3 |
| T-10 | Request completeness review within 24 hours | CP team | SOP §4.4 |
| T-11 | Freight, customs clearance and transport from Juba to the hubs | Supply Chain | SOP §3.1 |
| T-12 | Distribution report within 15 days and 5W update | Partner | SOP §4.7 |
| T-13 | PDM on a sample of distributions, focused on the items | CP team | SOP §4.8 |
| T-14 | Issue the distribution agreement and register the Requester | CP team | SOP §4.2.2 |
| T-15 | Validate a new partner's capacity and presence | Cluster | SOP §4.2.2 |
| T-16 | Report loss or theft within 24 hours | Partner | SOP §4.6.2 |
| T-17 | Send the standing expiry alert | Warehouse | SOP §5.2 |
| T-18 | National approval of the request | Cluster | SOP §4.4 |
| T-19 | Monthly CP status snapshot | CP team | SOP §5.3 |

## Mission 3: Spot the Error (inspect)

17 forms, 6 per run (at least one clean form each run).

| ID | Form | Problem line (or clean) | Source |
|---|---|---|---|
| D-01 | Core Pipeline Request (CPR Form 2026) | Clean: approve | SOP §4.3, §4.4 |
| D-02 | Core Pipeline Request (CPR Form 2026) | Warehouse: Wau hub | SOP §2.2, §4.4 |
| D-03 | Core Pipeline Request (CPR Form 2026) | Needs assessment: 5 months ago | SOP §4.3, §4.4 |
| D-04 | SNFI Pipeline Request Form | SNFI standard kits requested: 2,400 | SOP §2.1, §4.4 |
| D-05 | SNFI Pipeline Request Form | Sent to: CP officer by WhatsApp only | SOP §4.4 |
| D-06 | Release to partner | Clean: approve | SOP §4.5, §4.5.1, §4.5.2 |
| D-07 | Release to partner | Dispatch authority: Email from the CP officer (critical CR1) | SOP §4.5 |
| D-08 | Release to partner | Release document: Waybill | SOP §4.5.2 |
| D-09 | Hub transfer Juba to Bentiu | Clean: approve | SOP §4.5, §4.5.2 |
| D-10 | Hub transfer Juba to Bentiu | Authority: Verbal instruction from the warehouse manager (critical CR1) | SOP §4.5 |
| D-11 | Receipt record | Counting: One count by the warehouse team | SOP §4.1.4 |
| D-12 | Partner file | DDA: Last validated 30 months ago | SOP §4.2.1, §4.2.2 |
| D-13 | Partner file | Beneficiary registration: Small fee per household to cover staff costs (critical CR3) | SOP §1, §4.2.3, §7.2 |
| D-14 | SNFI distribution report | Loss: 20 blankets stolen 3 weeks ago, first reported here (critical CR5) | SOP §4.6.2, §4.7 |
| D-15 | SNFI distribution report | Clean: approve | SOP §4.6, §4.7 |
| D-16 | Distribution plan | Complaints: Hotline only, no desk at the site | SOP §4.6 |
| D-17 | Complaints and feedback log | PSEA allegation against a staff member: Logged in the register for monthly analysis (critical CR6) | SOP §7.2, §7.3 |

## Mission 4: Buffer Watch (buffer)

8 monthly decisions on one stream (SNFI or WASH, random), plus 2 call events from a pool of 6.

| ID | Item | Right move | Source |
|---|---|---|---|
| Monthly | Healthy band | Business as usual | SOP §6, §6.3 |
| Monthly | Consuming buffer, no order on the way | Start replenishment | SOP §6, §6.3 |
| Monthly | Consuming buffer, order on the way | Carry on (or order) | SOP §6, §6.3 |
| Monthly | Urgent replenishment | Escalate and ration | SOP §6, §6.3 |
| E-01 | "Stock is tight. Just release 2,000 kits now, the cluster will endorse next week." (critical CR2) | Route the request for endorsement first | SOP §4.4, §4.5 |
| E-02 | We hold enough of every WASH kit item for 50,000 kits, except filter cloths: only 10,000. How many complete kits? | 10,000: one missing item breaks the kit | SOP §6.2 |
| E-03 | A donor asks: "Can you report the buffer as its own line in our report?" | No: it is a planning and advocacy figure; donors see kits against the project that funded them | SOP §6.1 |
| E-04 | Two locations need kits and there is not enough for both. How do we choose? | Apply the criteria: severity, recency, protection risks, time since last assistance, access | SOP §4.3 |
| E-05 | "Funding is not confirmed yet, but shall I raise the PO in WAVE now to save time?" | No: a PO is raised only once funding is confirmed and the project activated | SOP §4.1.1 |
| E-06 | A partner has not collected approved stock 15 days after SWR approval. What happens? | Cancel the uncollected lines: they return from committed to available | SOP §4.5.1, §4.10 |

## Mission 5: Kit Builder (pack)

18 items, 10 per run, then one bonus card.

| ID | Item | Right box(es) | Source |
|---|---|---|---|
| I-01 | Plastic sheet 4x6m | SNFI standard kit or Emergency shelter kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-02 | Rubber rope ties | SNFI standard kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-03 | Rope bundle | Emergency shelter kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-04 | Blanket | SNFI standard kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-05 | Mosquito net | SNFI standard kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-06 | Kanga | SNFI standard kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-07 | Kitchen set | SNFI standard kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-08 | Sleeping mat | SNFI standard kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-09 | Solar lamp | SNFI standard kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-10 | NFI bag | SNFI standard kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-11 | Bamboo bundle | Emergency shelter kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-12 | Wooden poles | Emergency shelter kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-13 | Bucket with tap | WASH standard kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-14 | Bucket without tap | WASH standard kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-15 | Filter cloth | WASH standard kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-16 | Bars of soap | WASH standard kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-17 | Water purification tablets | WASH standard kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| I-18 | PuR flocculant sachets | WASH standard kit | SOP §2.1, Table 2; Budget tool, Kits sheet |
| K-B1 | Boxes are sealed. Who endorses the SNFI and emergency shelter kits? | SLSC Cluster | SOP §1, §2.1 |

## Mission 6: Budget Builder (budget)

7 challenges, 4 per run. The right answer (which bars grow) is calculated by the game from the budget tool logic.

| ID | Change | Bars that grow | Source |
|---|---|---|---|
| B-01 | Target households double, same kit mix. | B Kits, B Transport, C Warehousing, G PSC | Budget sheet (A to G) |
| B-02 | New LTA: the SNFI kit price goes up. | B Kits, G PSC | Kits sheet; Budget sheet (B, G) |
| B-03 | 500 households switch from the SNFI kit to the emergency shelter kit. | B Kits, B Transport, C Warehousing, G PSC | Kits sheet (weight per kit); Budget sheet (B, C) |
| B-04 | Staff time charged to the project goes from 20% to 40%. | A Staff, G PSC | Parameters (F); Budget sheet (A) |
| B-05 | IOM will now monitor 30% of households itself (PDM was 0%). | E PDM, G PSC | Parameters (E); Budget sheet (E) |
| B-06 | Two more UNHAS monitoring trips are planned. | D Travel, G PSC | Parameters (G); Budget sheet (D) |
| B-07 | The project runs 12 months instead of 6. | A Staff, G PSC | Parameters (A, F); Budget sheet (A) |

## Mission 7: Boss Convoy (convoy)

3 branching scenarios; one per run. Each checkpoint is one decision.

| ID | Scenario | Decision | Source |
|---|---|---|---|
| BOSS-A/a1 | Floods in Jonglei | An ETT alert reports flooding near Bor. Thousands of households are displaced. Grace's organization is ready to respond. What happens first? (critical CR1) | SOP §4.3 |
| BOSS-A/a2 | Floods in Jonglei | Grace sends a request by WhatsApp: 2,400 SNFI kits for 400 households, from the Wau warehouse. What do you do? | SOP §4.4 |
| BOSS-A/a3 | Floods in Jonglei | You check the monthly figures: SNFI stock is 70,000 kits. What should happen with replenishment? | SOP §6.3 |
| BOSS-A/a3b | Floods in Jonglei | Consequence: two months later SNFI stock is 40,000 and no order is on the way. What now? | SOP §6.3 |
| BOSS-A/a4 | Floods in Jonglei | The corrected request is with the SFP. 48 hours pass with no feedback. Grace: "Can't you just release now?" (critical CR2) | SOP §4.4 |
| BOSS-A/a5 | Floods in Jonglei | The cluster endorses the request. Deng asks how to go ahead. (critical CR1) | SOP §4.5, §4.5.1 |
| BOSS-A/a6 | Floods in Jonglei | Grace's team arrives at the warehouse with no notice. The SWR is approved. What can the warehouse do? | SOP §4.5.1 |
| BOSS-A/a7 | Floods in Jonglei | A week after distribution Grace mentions that 20 kits were stolen on the road, 5 days ago. What do you do? (critical CR5) | SOP §4.6.2 |
| BOSS-B/b1 | Returns in Upper Nile | Returnees are arriving in Renk. A new NGO, River Aid, asks for 1,000 WASH kits: "We'll sign the agreement later." What do you do? (critical CR4) | SOP §4.2 |
| BOSS-B/b2 | Returns in Upper Nile | River Aid is onboarded. Its request arrives with a needs assessment done 4 months ago. | SOP §4.3, §4.4 |
| BOSS-B/b3 | Returns in Upper Nile | WASH stock stands at 60,000 kits. What band are we in, and what follows? | SOP §6.3 |
| BOSS-B/b4 | Returns in Upper Nile | Two locations need WASH kits, and there is not enough for both. How do you decide? | SOP §4.3 |
| BOSS-B/b5 | Returns in Upper Nile | River Aid proposes a small "registration fee" per household to cover its staff costs. What is your answer? (critical CR3) | SOP §1, §7.2 |
| BOSS-B/b6 | Returns in Upper Nile | At the distribution, a community member reports a sexual exploitation allegation against a River Aid staff member. (critical CR6) | SOP §7.2, §7.3 |
| BOSS-C/c1 | Rush week at the Juba warehouse | A truck of blankets arrives in Juba. The driver is in a hurry. How do you receive it? | SOP §4.1.4 |
| BOSS-C/c2 | Rush week at the Juba warehouse | The count shows 300 more blankets than ordered, and some cartons are water damaged. | SOP §4.1.4 |
| BOSS-C/c3 | Rush week at the Juba warehouse | Bentiu needs stock fast. Peter says: "Just load the trucks, I'll email the approval later." (critical CR1) | SOP §4.5 |
| BOSS-C/c4 | Rush week at the Juba warehouse | The approved SWR covers 10 trucks to Bentiu. How many waybills? | SOP §4.5.2 |
| BOSS-C/c5 | Rush week at the Juba warehouse | An expiry alert shows that a newer batch of water purification tablets in Bor expires before the older one. | SOP §5.2 |
| BOSS-C/c6 | Rush week at the Juba warehouse | A partner has not collected approved stock 15 days after SWR approval. | SOP §4.5.1, §4.10 |

## Critical rules

| ID | Rule | Source |
|---|---|---|
| CR1 | No approved SWR, no dispatch | SOP §4.5 |
| CR2 | No cluster endorsement, no release | SOP §3.1, §4.4, §4.5 |
| CR3 | The pipeline is free, without exception | SOP §1, §4.2.3, §7.2 |
| CR4 | Only eligible partners in good standing | SOP §4.2 |
| CR5 | Loss, damage, theft or diversion: report within 24 hours | SOP §4.6.2 |
| CR6 | PSEA allegations go straight to IOM PSEA channels | SOP §7.2, §7.3 |

Total: 100 playable items.
