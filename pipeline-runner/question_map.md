# Question map

Every question in `content.js`, its level, and the source it was taken from.
"SOP" is the IOM South Sudan Core Pipeline Operations SOP (Draft 1, September 2026). "Budget tool" and sheet names refer to CP Budget Tool v2 (October 2026). Both files are in `../source/`.

This file is generated from `content.js`. After editing questions, regenerate it with `node tools/make_question_map.js .` (needs Node.js), or edit the rows by hand.

## Level 1: The Journey

12 questions in the pool, 5 drawn at random per run (questions marked "always" appear every run).

| ID | Type | Question | Source |
|---|---|---|---|
| L1-01 (always) | Order (drag and drop) | Put all nine steps of the Core Pipeline in order, from first to last. | SOP §4, Figure 3 |
| L1-02 | Order (drag and drop) | Order the first five steps of the pipeline. | SOP §4, Figure 3 |
| L1-03 | Order (drag and drop) | Order the last six steps, from the request to closing the file. | SOP §4, Figure 3 |
| L1-04 | Order (drag and drop) | A request has arrived. Put the four review stages of Step 4 in order. | SOP §4.4 |
| L1-05 | Order (drag and drop) | Order the stock release procedure. | SOP §4.5.1 |
| L1-06 | Order (drag and drop) | Order the stock statuses an item moves through in IMS. | SOP §4.1.4, §5.1 |
| L1-07 | Order (drag and drop) | A consignment is coming in. Order the receipt steps. | SOP §4.1.4, §4.1.5 |
| L1-08 | Order (drag and drop) | A new organization wants to use the pipeline. Order the onboarding steps. | SOP §4.2.2 |
| L1-09 | Order (drag and drop) | Kits were stolen after collection. Order what happens next. | SOP §4.6.2, Figure 4 |
| L1-10 | Order (drag and drop) | Follow a kit through the supply chain. Put the stops in order. | SOP §2, Figure 1 |
| L1-11 | Order (drag and drop) | A partner keeps missing reports. Order the compliance ladder from mildest to most severe. | SOP §4.2.3 |
| L1-12 | Order (drag and drop) | Order the planning and sourcing steps for replenishment. | SOP §4.1.1, §4.1.3 |

## Level 2: Who Does What

11 questions in the pool, 6 drawn at random per run.

| ID | Type | Question | Source |
|---|---|---|---|
| L2-01 | Match | Which unit does each job? | SOP §3.1, Table 4 |
| L2-02 | Match | In the RACI, who is Accountable (A) for each activity? | SOP §3.2, Table 5 |
| L2-03 | Match | Tricky ones: who is Accountable (A)? | SOP §3.2, Table 5 |
| L2-04 | Match | In the RACI, who is Responsible (R): who actually does the work? | SOP §3.2, Table 5 |
| L2-05 | Match | Who signs each document? | SOP §4.11, Table 14 |
| L2-06 | Match | Step 5, stock release. Who does what? | SOP §4.5 |
| L2-07 | Match | Step 4, request and endorsement. Who handles each stage? | SOP §4.4 |
| L2-08 | Match | Onboarding and compliance. Who does it? | SOP §4.2.2, §4.2.3 |
| L2-09 | Match | Who sets each stock status in IMS? | SOP §5.1, Table 15 |
| L2-10 | Match | Who produces each report or alert? | SOP §5.2, §5.3, §4.7 |
| L2-11 | Match | Monitoring and closure. Who does it? | SOP §4.8, §4.9 |

## Level 3: Spot the Error

11 questions in the pool, 5 drawn at random per run.

| ID | Type | Question | Source |
|---|---|---|---|
| L3-01 | Spot the error | Grace has sent this Core Pipeline Request. What is wrong? | SOP §4.3, §4.4, §2.2 |
| L3-02 | Spot the error | A second request from Grace. Find the mistakes. | SOP §4.4, §2.1 |
| L3-03 | Spot the error; critical CR1 | Deng is about to release stock to a partner. Check the release file. | SOP §4.5, §4.5.1, §4.5.2 |
| L3-04 | Spot the error; critical CR1 | Stock is moving from Juba to Bentiu. Check the transfer. | SOP §4.5, §4.5.2 |
| L3-05 | Spot the error | A supplier truck has arrived in Juba. Check the receipt record. | SOP §4.1.4, Table 7 |
| L3-06 | Spot the error; critical CR5 | Review this distribution report before it is logged. | SOP §4.6, §4.6.2, §4.7 |
| L3-07 | Spot the error; critical CR3 | Check this partner file before the partner is allowed to request. | SOP §4.2.1, §4.2.2, §1 |
| L3-08 | Spot the error | Grace shares the distribution plan. What does not meet the standard? | SOP §4.6, Table 12 |
| L3-09 | Spot the error | After endorsement, Grace needs to change the site. Check the change note. | SOP §4.4, §4.6.1 |
| L3-10 | Spot the error | Check this draft of the monthly CP status snapshot. | SOP §5.3, §6, §6.1 |
| L3-11 | Spot the error; critical CR6 | Review the complaints log from a distribution. | SOP §7.2, §7.3 |

## Level 4: Buffer Watch

14 questions in the pool, 6 drawn at random per run.

| ID | Type | Question | Source |
|---|---|---|---|
| L4-01 | Choice | SNFI stock is 120,000 standard kits. Which band are we in? | SOP §6, Figure 6 |
| L4-02 | Choice | SNFI stock is 60,000 kits: Consuming buffer. What should the CP team do? | SOP §6.3, Table 19 |
| L4-03 | Choice | WASH stock is 50,000 standard kits. Which band? | SOP §6, Figure 6 |
| L4-04 | Choice | WASH stock is in the red band. What does the CP team do? | SOP §6.3, Table 19 |
| L4-05 | Choice | WASH stock is 100,000 kits. A colleague says "That is more than 88,000, so we are Healthy." Which band is it really? | SOP §1, §6, Figure 6 |
| L4-06 | Choice | Average SNFI consumption is 11,000 kits a month. What is the SNFI buffer? | SOP §6, Figure 6 |
| L4-07 | Choice | Imaginary example: consumption rises to 15,000 kits a month. What is the new buffer? | SOP §6, §6.1 |
| L4-08 | Choice | Why is the lead time factor 4 months? | SOP §6.1 |
| L4-09 | Choice | How often is the buffer refreshed against actual consumption? | SOP §6.1, §5.3 |
| L4-10 | Choice | There is enough of every WASH kit item for 50,000 kits, except filter cloths: only 10,000. How many complete WASH kits do we have? | SOP §6.2 |
| L4-11 | Choice | The buffer is... | SOP §6.1 |
| L4-12 | Choice; critical CR2 | SNFI stock is red. Grace calls: "Just release 2,000 kits now, the cluster will endorse next week." What do you do? | SOP §4.4, §4.5, §6.3 |
| L4-13 | Choice | For the pipeline break calculation, which stock is counted? | SOP §6.2 |
| L4-14 | Choice | Stock is less than need. Which of these is NOT a prioritisation criterion? | SOP §4.3, Table 10 |

## Level 5: Kit Builder

12 questions in the pool, 6 drawn at random per run.

| ID | Type | Question | Source |
|---|---|---|---|
| L5-01 | Choice, several answers | Pack the SNFI standard kit. Select every item that goes in it. | SOP §2.1, Table 2; Budget tool, Kits sheet |
| L5-02 | Choice, several answers | Pack the WASH standard kit. Select every item that goes in it. | SOP §2.1, Table 2; Budget tool, Kits sheet |
| L5-03 | Choice, several answers | Emergency shelter kit: which items are added only where they are not available locally? | SOP §2.1, Table 2 |
| L5-04 | Choice | How many plastic sheets (4x6m) are in one SNFI standard kit? | SOP §2.1, Table 2 |
| L5-05 | Choice | How many water purification tablets are in one WASH standard kit? | SOP §2.1, Table 2; Budget tool, Kits sheet |
| L5-06 | Match | Which cluster endorses each kit? | SOP §2.1, Table 2 |
| L5-07 | Match | Which kit does each item belong to? | SOP §2.1, Table 2 |
| L5-08 | Choice | Which list shows the five kit categories in the CP budget tool? | Budget tool, Kits sheet (Kit summary) |
| L5-09 | Choice, several answers | SNFI and WASH follow one CP process. Where do they differ? Select all that apply. | SOP §1 |
| L5-10 | Choice | A household received an SNFI standard kit. Can it also receive a WASH standard kit? | SOP §2.1 |
| L5-11 | Choice | What household size is used for planning? | SOP §2.1; Budget tool, Parameters (B. Targets) |
| L5-12 | Choice | In the pipeline break calculation, how are hygiene kits and MHM kits counted? | SOP §6.2 |

## Level 6: Budget Logic

21 questions in the pool, 6 drawn at random per run.

| ID | Type | Question | Source |
|---|---|---|---|
| L6-01 | Order (drag and drop) | Put the budget tool steps in order. | Budget tool, Parameters (How to use this tool) |
| L6-02 | Choice | Target: 1,000 households. 50% of households receive a WASH standard kit. How many WASH kits does the tool plan? | Budget tool, Parameters (C. Kit mix) |
| L6-03 | Choice | Kit mix: SNFI 100%, WASH 80%, Hygiene 50%. That adds up to 230%. Is that an error? | Budget tool, Parameters (C. Kit mix, D. Delivery plan); SOP §2.1 |
| L6-04 | Choice | Delivery plan: Bor 60%, Wau 30%. What does the tool say? | Budget tool, Parameters (D. Delivery plan); Budget sheet (5. Checks) |
| L6-05 | Choice | Where does the cost per kit come from? | Budget tool, Kits sheet; SOP §4.1.1 |
| L6-06 | Choice | LTA prices are quoted delivered to Juba. Should you add a separate line for freight to Juba? | SOP §4.1.1; Budget sheet (B. Supplies) |
| L6-07 | Choice, several answers | Which lines sit in category B, "Supplies, commodities and materials"? Select all that apply. | Budget sheet (3. Budget breakdown, B); SOP §1 |
| L6-08 | Choice | Insurance and the loss and damage allowance are a percentage of... | Budget sheet (B.9, B.10); Other Costs (1. Rates and percentages) |
| L6-09 | Choice | Blankets and plastic sheets are bulky but light. What usually sets the number of trucks? | Budget sheet (2. Delivery plan and transport); Other Costs (Truck loading assumptions) |
| L6-10 | Choice | Imaginary example: 100 chargeable tonnes go by road. Trucks carry 40 tonnes. How many trucks does the tool count? | Budget sheet (2. Delivery plan and transport, trucks) |
| L6-11 | Choice | Loading and offloading is charged at USD 200 per truck. Trucks go from 3 to 5. What happens to the loading line? | Budget sheet (B.8); Other Costs (5. Surge loading); SOP §4.1.5 |
| L6-12 | Choice | How does the tool cost warehousing (category C)? | Budget sheet (C. Warehousing); Other Costs (7. Warehouse rates per tonne) |
| L6-13 | Choice | Imaginary example: a post costs USD 10,000 a month. It spends 50% of its time on a 6-month project. What does the tool charge? | Budget tool, Parameters (F. Staff time); Budget sheet (A) |
| L6-14 | Choice | 1,000 target households; IOM will monitor 30% itself. At USD 15 per household, what is the PDM line? | Budget sheet (E. PDM); Other Costs (11. Post-distribution monitoring) |
| L6-15 | Choice | Imaginary example: total direct costs are USD 100,000. The Programme Support Cost is 7%. What is the total budget? | Budget sheet (G. Programme Support Cost); Other Costs (1. Rates) |
| L6-16 | Choice, several answers | New LTA: the blanket price goes up. Which lines change? Select all that apply. | Budget tool, Kits sheet; Budget sheet (B, G, 4. Unit costs) |
| L6-17 | Choice | Target households double, with the same kit mix and delivery plan. Which line does NOT rise by itself? | Budget sheet (A, B, C, E) |
| L6-18 | Choice | 500 households switch from the SNFI standard kit to the emergency shelter kit. Apart from supplies, which costs jump most? | Budget tool, Kits sheet (weight per kit); Budget sheet (B.6, C) |
| L6-19 | Choice | Imaginary example: total budget USD 600,000 for 1,000 households. What is the cost per person? | Budget sheet (4. Unit costs) |
| L6-20 | Choice | How is each transport mode charged in the tool? | Budget sheet (B.6, B.7); SOP §4.1.5 |
| L6-21 | Choice, several answers | Which inputs drive the travel line (category D)? Select all that apply. | Budget tool, Parameters (G. Travel); Budget sheet (D) |

## Level 7: Boss Round

3 branching scenarios; one is picked at random per run.

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

Total: 101 questions and decisions.
