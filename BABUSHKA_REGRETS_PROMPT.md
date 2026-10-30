# Babushka — Sprouht Regrets Dataset & Late-Life Dialogue

## Task

Extend the existing Babushka game and the 200-entry five-year memory atlas with a **separate, evidence-based regrets system**, grounded in verifiable transcripts of older interviewees from Sprouht: https://www.youtube.com/@Sprouht

This system culminates in an **essential late-life conversation when the grandmother is between 80 and 90 years old**. The player asks a natural question about what, if anything, she would change in her life. The answer should be selected from **seven empirically most common regret clusters** in the verified Sprouht sample, **but must emerge logically from this grandmother's actual life and earlier player-influenced choices**.

**Important:** The seven clusters have NOT yet been established from a reproducible full-channel transcript analysis. Do not present hypothetical labels, illustrative transcripts, unsupported percentages, or inferred rankings as verified. Research and calculate them first. When actual verified data is insufficient, use a clearly labeled provisional set and report the limitation.

## 1. Read the project's source of truth

- `AGENTS.md`
- `PROJECT.md`
- `DIALOGUE_BIBLE.md`
- `babushka_memory_atlas_5year_200.json` (or its current equivalent)
- Current biography generator, dialogue engine, event graph, save system, and life-summary timeline.

Preserve existing gameplay, offline-first architecture, and narrative consistency. Keep this as a new separate research dataset and narrative subsystem, not an overwrite of the 200-memory atlas.

## 2. Retrieve and audit actual Sprouht evidence

Collect available captions/transcripts of Sprouht interviews with older adults, prioritizing interviews explicitly about regrets, choices, the younger self, family, and time. Use source-authorized methods and respect copyright, access controls, and rate limits.

Record per interview/video:
- `video_id`, `video_url`, `title`, `published_at`
- `speaker_id` (pseudonym or stable identifier), age **only if explicitly stated**, interview context
- `timestamp_start`, `timestamp_end`, transcript/caption provenance
- A **brief verified quote** when appropriate and permitted; otherwise a factual paraphrase
- `regret_expressed` = yes / no / ambivalent / unclear
- `regret_subject`, `life_choice_or_nonchoice`, `expressed_consequence`, `expressed_value`
- `confidence`, `evidence_status`, `source_url`

Do not treat the interviewer's leading questions as evidence of the respondent's values. Do not copy long transcripts into redistributed game assets. Keep original transcripts in research-only storage where permitted; use original game dialogue.

Distinguish *regret about something done*, *regret about something not done*, *grief/loss without regret*, *acceptance/no regret*, and *unclear*. These are not interchangeable.

## 3. Calculate the seven most common regret clusters

- First define a transparent codebook with clear inclusion/exclusion rules.
- Code each **distinct respondent**, not each repeated mention or re-uploaded clip. Deduplicate compilations, shorts, excerpts, and reused interviews.
- Allow multiple clusters per respondent, but count each cluster at most once per respondent.
- Report both (a) cluster count / number of respondents expressing any regret and (b) cluster count / all eligible respondents; state denominators and missingness.
- Separate verified transcripts from automatically transcribed/uncertain ones. Check an auditable sample manually.
- Exclude general life advice that is not a stated regret from regret-frequency ranking.
- Preserve respondents who explicitly say they have *no regrets* or *mixed feelings* in a separate count and as valid narrative outcomes.
- Account for editorial selection bias: Sprouht is not a representative sample of all elderly people; these are *frequencies within the analyzed channel sample*, not universal rates.
- Never manufacture a seven-way ranking. If fewer than seven robust clusters are evidenced, retain the evidenced clusters and flag the rest as provisional until better coverage exists.

### Provisional candidate clusters (NOT a verified Sprouht top seven)

Use only as an initial labeling vocabulary pending transcript analysis:
1. Not spending enough time with loved ones.
2. Living according to other people's expectations or fear of judgment.
3. Working too much / prioritizing achievement or money over life outside work.
4. Not taking a chance: travel, moving, learning, or pursuing a dream.
5. A relationship decision: marrying too early, staying too long, leaving, or not speaking honestly.
6. Postponing meaningful decisions: children, reconciliation, creative work, or a new beginning.
7. Neglecting health, rest, or one's own needs.

Treat these as potentially overlapping. The final taxonomic labels must follow actual observed evidence. Do not equate childlessness with regret: a person may regret it, feel ambivalent, or be fully content. Similarly do not imply a good life requires marriage or children.

## 4. Create validated machine-readable outputs

Create:
- `data/research/sprouht_regrets_sources.jsonl` — audited interview-level evidence, source URLs/timestamps, provenance.
- `data/research/sprouht_regrets_codebook.md` — theme rules and exceptions.
- `data/research/sprouht_regrets_top7.json` — seven ranked clusters when validated, with counts, denominators, uncertainty, exemplars as short paraphrases, related values and counterexamples.
- `data/game/regret_archetypes.json` — compact **original** narrative templates derived from the validated clusters, without copyrighted verbatim dialogue.
- `docs/SPROUHT_REGRETS_REPORT.md` — sample size, coverage, coding approach, source examples, biases, license limitations and clear distinction between measured findings and creative adaptation.

The game's regret archetypes should reference `cluster_id`, `biography_requirements`, `trigger_events`, `incompatible_facts`, `possible_responses`, `emotional_tensions`, and `followup_question_templates`.

If downloading source content is prohibited or impossible, document this plainly and produce an evidence-limited prototype, not a fabricated validated dataset.

## 5. Mandatory late-life dialogue: ages 80–90

Schedule **one deliberate, emotionally significant reflective conversation** when the grandmother is between 80 and 90 (inclusive). If playtime skips years, schedule it based on the narrative's late-life phase. If the character never reaches that age or dies earlier, do not invent a conversation after death; provide an age-appropriate earlier reflection if narratively suitable and flag the omission.

Questions should sound like a caring person, not a survey. Examples:
- «А если бы можно было прожить всё заново, ты бы что-нибудь изменила?»
- «Есть что-то, о чём ты до сих пор жалеешь?»
- «А что ты тогда считала важным, а теперь уже нет?»

Let the grandmother hesitate, reject the premise, laugh, or ask why the player wants to know. The dialogue must be in the game's actual language and localized naturally.

### Selection algorithm

1. Take all **confirmed biographical events** and locked player-influenced decisions from earlier ages.
2. Filter regret clusters and subtypes whose prerequisites actually occurred; do not invent a child, spouse, missed university offer, reconciliation opportunity, or specific relationship just to fit a frequent regret.
3. Select from the **empirically ranked seven clusters** only after filtering for narrative eligibility. Weight by validated cluster frequency *and* the person's own past priorities, emotions, outcomes, relationships, and memory salience.
4. Derive a **concrete recollection** tied to one or more established events (year, place, person, choice) and show a believable counterfactual: what she wonders might have happened, while admitting she cannot know.
5. Allow **ambivalence**: pride and regret, gratitude and grief can coexist. The grandmother may instead say she regrets nothing, or that the word 'regret' is not right. Do not force a negative moral lesson in those cases.
6. Lock the response in the save data (`late_life_reflection`) so later questions and the end-of-game life summary remain consistent. Player questions may change the interpretation or degree of openness, not retroactively contradict established facts.
7. Ensure the ending remains warm and gently bittersweet, not a lecture or punishment.

### Examples of constraints

- `regret_not_spending_time_with_children` is ineligible if she never had or cared for children; consider other specific loved ones only when the content truly fits.
- `regret_not_having_children` is eligible only if the established life includes no children **and** some prior desire or ambivalence makes it believable. No automatic assignment.
- `regret_working_too_much` needs sustained work and an established sacrifice or missed opportunity.
- `regret_not_traveling` needs a documented desire, feasible missed opportunity, or previously expressed wish.
- `regret_married_too_young` is ineligible without an established early marriage.
- `regret_not_reconciling` needs an actual unresolved rupture.

A single life event may map to multiple philosophical meanings; avoid always choosing the most dramatic or cliché interpretation.

## 6. Dialogue tone: absolutely essential

Write in concrete first-person memories, not generic inspirational aphorisms. Avoid: "Time is precious, cherish every moment." Prefer a small specific event, e.g. "She called that Sunday. I was cleaning the kitchen and told her I'd ring back. I didn't." (Illustrative fictional example, not a Sprouht quote.)

Grandmother is not a therapist, coach, preacher, or omniscient narrator. She can be funny, evasive, inconsistent, proud, uncertain, affectionate, irritable, or silent. Do not impose any single definition of a meaningful life. Especially avoid default pronatalism, compulsory marriage, or assuming caregiving is women's only purpose.

## 7. Integrate with atlas and final life map

- Link regret archetypes to existing memory IDs, life events, people, cities, and age.
- Add a late-life memory node to the dialogue graph; make it discoverable through a question, with a gentle fallback if the player does not select that exact wording.
- In the final timeline, display the **actual event** and, if it was revealed, the later interpretation. Do not present speculative alternative lives as factual historical outcomes.
- Maintain a distinction between event impact, personal significance, memory salience, and expressed regret.
- Avoid a numerical regret score visible to the player.
- Store locally with the existing JSON + IndexedDB system; no live Sprouht API calls during play.

## 8. Tests and deliverables

Tests must cover: (1) a moved grandmother who regrets leaving; (2) one who is grateful she moved; (3) childless by choice and satisfied; (4) childless with ambivalence; (5) no spouse; (6) close relationships outside direct descent, e.g. great-aunt; (7) regret about missed friendship; (8) earlier choice reflected accurately at 85; (9) no contradictions in the final timeline; (10) no exact unverified quote or invented frequency; (11) age 80–90 scene fires exactly once when eligible; (12) a person with no stated regrets can answer naturally.

Deliver verified source records, ranked clusters with transparent counts, original dialogue templates, code integration, tests, and a clear research limitations report. Where verification is incomplete, leave placeholders labeled `provisional` rather than making up numbers.

**Creative objective:** The player's late-life question should make them see a choice they helped shape decades earlier in a new light. The feeling afterward should be quiet reflection, warmth, and gentle sadness, not the sense that they selected a 'wrong' answer.
