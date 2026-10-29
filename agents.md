AGENTS.md — «Бабушка»
This file is the operating brief for coding, writing, research, and design agents (Codex, Claude Code, etc.). Read PROJECT.md and DIALOGUE_BIBLE.md first. PROJECT.md is the source of truth for the creative vision; DIALOGUE_BIBLE.md defines dialogue and choice writing rules. Do not change it silently.
Mission
Build a small, historically grounded, emotionally subtle browser narrative game. At the start of every new game, the player selects the grandmother's birth region and birth year, then the game generates a new grandmother. The player is a younger family member who calls her grandmother and listens to her, asks natural questions, sometimes resolves an as-yet-unknown turning point of her life, and eventually sees a quietly moving atlas of the life they have come to know. Aim for reflection and tender sadness, not gamification, therapy, or moral instruction.

Working language: Russian for story, design discussion, UI copy, and research notes. Code names and technical comments may be in English. Prefer commas and natural punctuation in drafted prose rather than excessive em dashes.
Authority and scope
1. User's latest explicit instructions override this file.
2. PROJECT.md governs vision and approved product decisions; DIALOGUE_BIBLE.md governs writing, themes, tone, dialogue and choice logic.
3. AGENTS.md governs execution standards and engineering workflow.
4. If these documents conflict, flag it; do not silently reinterpret a core principle.
5. Mark unmade product decisions as OPEN, offer a concise recommendation, and only implement the least committing reversible default required to keep progress moving.
Product decisions (ratified)
- The first supported setting is Kalinin (Tver) and its surrounding region. Show historical names for the relevant dates (Tver → Kalinin → Tver); keep place IDs stable across renaming.
- A new grandmother is generated on every new playthrough, not a predefined woman with only alternative plot lines. Use a fresh seed for each new run, and persist it along with canonical facts.
- The player is a younger relative who calls her “бабушка”, not a neutral interviewer. Kinship may be direct, adoptive, or cousin/grandaunt-like (двоюродная бабушка). She may have no children of her own. Build a consistent family graph without fabricating descendants for a childless character. Do not assume player gender.
- The opening screen asks for the grandmother's birth region and birth year. Both must materially influence eligibility, historical context, biographical generation, and potential later movements. Kalinin is the first fully covered region, other options must be gated by real available packs, not invented.
- The year range, conversation year, additional supported regions and kinship variants are not yet signed off. Read allowed options from a dataset manifest and label provisional assumptions as such.
Non-negotiables
- No face, body, or detailed room for the grandmother. The player should be free to imagine their own.
- No visible scores for happiness, success, morality, trust, or story completion.
- No binary happy/sad morality. Contradictory feelings and mixed consequences are expected.
- No mandatory tragedy or death of grandmother at the end. Keep the emotional register restrained and luminous.
- Natural questions instead of explicit life-choice controls. Choices can fix only previously unresolved facts, never rewrite disclosed canon.
- Historical facts are not invented. Fiction must be distinguishable in data provenance.
- No use of historical APIs during normal gameplay, and no mandatory runtime LLM calls.
- No copying copyrighted interview transcripts or archival texts into released game content without establishing permission/license; short research quotes should remain in research files with attribution and rights status.
- Offline-compatible architecture, with static hosting and gradual regional data packages.
- No ungrounded claims about real historical people, testimony, region-specific probabilities, or source coverage.
First implementation priorities
1. Inspect repository and current state before editing. If project is empty, propose a minimal layout.
2. Build a vertical slice: opening birth-region/year picker, generation of a new grandmother and a consistent family relationship (including childless cousin-grandmother paths), one conversation, one unresolved major choice, one later consequence, one minor memory, one final life-atlas view.
3. Use small, hand-reviewed fictional seed content marked as fiction. Do not block the vertical slice on large-scale archive collection.
4. Keep narrative content separate from UI and game logic.
5. Add persistence and deterministic replay early, so the same life remains the same.
6. Expand history after proof of coherence, emotional pacing and legibility.
Recommended repository structure (adapt to existing codebase)
/
  PROJECT.md
  AGENTS.md
  src/
    app/                   # screens, responsive UI
    engine/
      setup/               # starting region/year selection and validation
      biography/           # unique per-run canonical life and kinship graph, branching constraints
      memory/              # significance, repression/silence, recollection
      dialogue/            # questions, response selection, unlocks
      world/               # historical availability and locality
      atlas/               # derivation of the final overview
    data/                  # schemas, validators, manifests, adapters
  content/
    scenes/                # reviewed original narrative in RU
    historical/            # vetted event records
  scripts/
    ingest/                # offline import only
    verify/                # checks, provenance and consistency
    build-data/            # generate published packages
  public/data/             # compiled/versioned JSON packs + supported-region/year manifest
  tests/
  docs/
    sources.md             # source registry, license, access limitations
    decisions.md           # ADR / open decisions
Avoid introducing a service/database framework when static hosting and local state suffice. React/TypeScript is a reasonable default if no framework already exists, but the choice is not yet ratified.
Data boundaries
Treat StartSelection as immutable configuration within an individual save: birthRegionId, birthYear, runSeed, datasetVersion, conversationYear. Validate this against the manifest before generating a grandmother. A new run always creates a fresh seed and person/family graph, even with identical birth selection. birthRegionId is not current residence; migrations change residence over time. Only offer a birth region/year combination when there is adequate source coverage.

Keep five concepts separate:
- HistoricalEvent: anchored in verifiable place/date/evidence, not changed by player.
- LifeEvent: actual event in the character's canonical biography, with provenance fiction, derived, or documented-context.
- Branch: unresolved life fact; preconditions, compatible outcomes, downstream effects.
- Memory: what the character recalls, how significant it feels, what she may omit or reinterpret.
- ConversationFact: what was said or discovered by the player, when, with links to canonical facts.
Suggested fields across entities: unique stable id, localised name, date/time precision, historical place id and alias valid for that year, involved people ids, prerequisites, outcomes, affected states, significance, topic tags, source ids, confidence / uncertainty, content rights and review status. Do not overload an integer emotionScore as a global measure of a life.

Track three knowledge sets: worldTruth, characterMemory, playerKnowledge. Never show hidden canon as if player had learned it. For the final atlas, distinguish known episodes, background history and deliberately unknown gaps.
Narrative states and irreversible decisions
- Before a branch is resolved, multiple historically valid outcomes may be possible.
- Once an outcome is spoken as fact, record it in the save and mark it immutable.
- Choices must respect prerequisites: selected birth year/region, year, age, residence, existing relationships, alive/deceased characters, access to schooling/work, etc.
- Major choice impacts at least one later scene in another decade or life period; avoid fake choices.
- Not every question causes a branch; many merely reveal, empathize or change willingness to discuss.
- A generated run must contain a consistent grandmother-to-player kinship path; direct descent is optional. A cousin grandmother / great-aunt may be childless. Branches must not retroactively erase the player or established relationships.
- Regret, gratitude, pride and acceptance are independent, potentially coexisting qualities.
- Branches about having children must be historically and personally plausible; do not present childlessness as failure or guarantee regret. The dialogue must work coherently when scenes are visited in different orders; lock contradictory paths after commitment.
Historical data pipeline (offline only)
1. Register source and intended use in docs/sources.md.
2. Check license, terms, privacy and whether download/processing is permitted.
3. Capture evidence and preserve canonical URL/archive identifiers.
4. Normalise date granularity, historical place names, geography and units; record uncertainty explicitly.
5. Deduplicate, validate chronology and location, mark any inference as inference.
6. Have a human review sensitive or narratively central claims.
7. Compile small versioned JSON packs by geography/time, plus manifest with checksums/version.
8. Browser loads only relevant static packs, caches via IndexedDB, and persists the life state separately. A Service Worker may cache app assets for offline play.
Never treat unverified Sprouht research summary statistics, sample quotations, fake example video IDs or example transcript excerpts as verified primary data. Use as hypotheses for themes only until links and transcripts have been checked. No runtime scraping of external archives.
UX and visual design rules
- The text and pauses are primary. Allow breathing space, restrained typography, subtle transitions.
- Use only select evocative artifacts: dates, maps, routes, tickets, handwritten fragments, archival places/objects, contextual illustrations without imposing human faces.
- The opening screen should be minimal: birthplace + birth year, no character portraits or unnecessary form fields. Selections should have a clear impact; show only supported combinations.
- Ask 2–3 natural questions when needed; don't display themes as an eight-button menu.
- Don't plaster the UI with vintage textures, sepia, chat bubbles, icons, exclamation marks, completion percentages or mood meters.
- Respect keyboard, touch, screen readers, reduced motion and typography scaling. No essential story information only in colour, animation or audio.
- Design desktop and mobile from the same content model; avoid tiny tap targets and long unscrollable text panels.
- Keep images optional: a scene must work if all image assets are missing.
Writing standards
- Conversational, specific, understated Russian. Grandmother is fallible and individual, not always gentle or wise.
- Avoid motivational quotations, stock aphorisms, excessive literary solemnity and narrator explanations of what the player should feel.
- Include ordinary life, humour, practical details, pauses, misunderstandings and warmth alongside grief and loss.
- Stories should have place/time-specific textures that are sourced or expressly marked fictional.
- Never imply every elderly person has the same family structure, beliefs, relationships or life goals.
- Even if two options seem morally appealing, don't force a single correct one.
- The player calls her grandmother but may be a grandchild or more distant younger relative. Do not assume direct descent or children of the grandmother. Respect childlessness as a complete life path and keep kinship consistent.
Final atlas / ending
The atlas is not a leaderboard. Build it from canonical LifeEvent facts filtered through playerKnowledge, plus historically relevant background events. Include:
- Chronological life events, personal and historical, but label categories subtly.
- Locations/periods and routes computed from recorded residence events, not from invented approximate hops.
- Major relationships, losses, life choices and ordinary precious memories.
- Unknown periods, without gamified «missing X collectibles» labels.
- Personal salience is not proportional to historical magnitude.
- Quiet ending of conversation; the atlas becomes visible afterward, without mandatory death or grand moral.
Check actual coordinates and administrative names for time-specific accuracy. Keep map usable without map tiles/network access by supplying a small static base map or local vector geography, if needed.
Engineering quality bar
- Strict TypeScript where applicable, data schemas validated at build time and for untrusted inputs.
- Pure functions for birth selection validation, unique grandmother/family generation, and biography event eligibility; seeded random source, not uncontrolled Math.random() scattered across components.
- Tests: invalid/unavailable region+year rejected; region and year influence eligibility; differing seeds produce different lives; kinship consistency (including childless cousin-grandmother paths) survives every branch; historical rename of Tver/Kalinin; determinism; chronology; alive/dead consistency; branching immutability; no impossible travel; no contradictory dialogue after a branch; save/load roundtrip; missing/corrupt data fallback; atlas visibility rules; accessibility smoke tests.
- Version save format and dataset manifest; define migration/fallback instead of silently deleting a user's life.
- No silent network tracking or sensitive personal data collection. Prefer local-only saves unless explicitly asked for cloud sync.
- Keep dependencies lean, data chunks modest, assets lazy-loaded, and offline behaviour documented.
- For archival use, create source attribution and provenance documentation. Avoid exposing material whose rights have not been cleared.
Agent workflow for every substantive change
1. Read PROJECT.md, DIALOGUE_BIBLE.md, AGENTS.md, relevant code and data.
2. State a short implementation plan, including assumptions and user-visible effect.
3. Make the smallest change that validates the requested design hypothesis.
4. Keep content, engine and UI separate; don't hardcode plot facts into components.
5. Run available tests, lint and build; add tests for changed branching rules.
6. Manually play the changed path and at least one alternative to test emotional and logical coherence.
7. Summarise changed files, behaviour, test results, unresolved risks and decisions that still need owner input.
8. Do not mark research, citations, performance or tests as verified when they were not executed.
Definition of done — first vertical slice
- Can select Kalinin (Tver) birth region and a supported birth year, and generate a new coherent grandmother-to-player family relationship, including an optional childless cousin-grandmother. A new run with the same input generates a distinct life; saving/loading retains the same life.
- Can start a conversation, ask natural questions and reach at least one meaningful turning point.
- Two choices lead to distinct canon and at least one later scene reflects the difference.
- No contradiction with previously revealed facts.
- A mundane detail or memory offsets the major historical drama.
- Player can resume a saved life.
- Final screen shows an elegant chronology and any real movements in that branch; distinguishes what player knows from what is not revealed.
- No grandmother portrait, score, moralizing ending, mandatory cloud service or external history API call.
- Automated core state tests pass; mobile and keyboard interactions are usable.
Open questions — do not silently decide
- Allowed birth-year range and year of the conversation (must be age-consistent).
- Which other regions have reviewed packs and can be enabled alongside first-supported Kalinin (Tver).
- Which precise kinship variants beyond direct/adoptive/cousin-grandmother will be implemented first, and when to reveal the relation during dialogue.
- Session duration, voice/audio, editorial scope and use of commercially licensed archival materials.
No longer open: the player calls her grandmother but need not be her descendant, a childless cousin-grandmother is possible, a new grandmother is generated per run, and the initial inputs are birth region and birth year. Kalinin/Tver is the first region.

When blocked, keep assumptions reversible and record them in docs/decisions.md. Prioritise proving the emotional core over building a large content corpus.