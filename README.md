# Obsidian Spaced Repetition Plugin

![SR_Banner](./docs/media/en/SR_Banner.jpg)

<img src="https://img.shields.io/github/downloads/st3v3nmw/obsidian-spaced-repetition/total" /> <img src="https://img.shields.io/github/downloads/st3v3nmw/obsidian-spaced-repetition/latest/total" /> <img src="https://img.shields.io/github/manifest-json/v/st3v3nmw/obsidian-spaced-repetition" /> <img alt="Codecov" src="https://img.shields.io/codecov/c/gh/st3v3nmw/obsidian-spaced-repetition">

Fight the forgetting curve by reviewing flashcards & notes using the FSRS or the SM-2 [spaced repetition](https://en.wikipedia.org/wiki/Spaced_repetition) algorithms.

- For more information on how to use the plugin, check either the TL;DR on this page or the [documentation](https://stephenmwangi.com/obsidian-spaced-repetition/).
- Raise an [issue](https://github.com/st3v3nmw/obsidian-spaced-repetition/issues/) if you have a feature request or a bug report.
- Visit the [discussions](https://github.com/st3v3nmw/obsidian-spaced-repetition/discussions/) section for Q&A help, feedback, and general discussion.
- The plugin has been translated into _Arabic, Chinese, Czech, Dutch, French, German, Italian, Korean, Japanese, Polish, Portuguese, Spanish, Russian, Turkish, and Ukrainian_ by the Obsidian community 😄.
    - To help translate this plugin to your language, check the [translation guide here](https://stephenmwangi.com/obsidian-spaced-repetition/contributing/#translating_1).

## Fork additions🔧

This fork adds two features on top of upstream. Everything else works as in upstream, and existing cards and scheduling comments are read unchanged.

> [!warning]
> The fork has its own plugin id (`obsidian-spaced-repetition-callouts`), so the community store never overwrites it. Don't enable it together with the upstream plugin; both register the same views and commands.

### Callout cards

A callout of a card type (default: `question`) is a whole card: the callout **title is the front** and the **body is the back**. Collapsed callouts (`[!question]-`) keep the answer hidden while you read the note, and the same callout shows up in review.

```markdown
> [!question]- Why is the Sharpe ratio unaffected by leverage?
> Leverage multiplies both the excess return and the volatility by the same factor.
>
> More explanation, lists, LaTeX, images…
```

When the front needs more than one line, put a line containing only the multi-line separator (`> ?` with the default settings) in the body. Everything above it is the front, everything below it is the back. Nested callouts work, e.g. a collapsed hint:

```markdown
> [!question]- **Exercise 1.** Map $z = 1 + i$ to the Riemann sphere.
>
> > [!hint]- Hint
> > Compute $|z|^2$ first.
>
> ?
> $\left(\tfrac{2}{3}, \tfrac{2}{3}, \tfrac{1}{3}\right)$
```

- After a nested callout, leave an empty `>` line before `> ?`. Otherwise markdown's lazy continuation pulls the separator into the nested callout when the note is rendered (the card itself still parses).
- In the note view the separator line is rendered as a divider instead of a lone `?`.
- Type matching is case-insensitive; `[!question]`, `[!question]-` and `[!question]+` all work.
- A callout without a body is not a card.
- Scheduling info is written as the last line of the callout (`> <!--SR:!2026-10-25,3,250-->`). A scheduling comment directly below the callout is also read, and moved inside on the next review.
- `::` or `?` inside a callout card don't create extra cards. Inline cards inside other callouts (e.g. `> [!note]`) still work as before.
- Setting: **Callout card types** (space-separated, e.g. `question exercise`). Leave empty to disable.

### Deck property

A frontmatter property sets the deck of every card in the note. Each `/` opens a subdeck, with no depth limit:

```yaml
---
deck: Math/Complex Analysis/Polar Representation/Euler Form
---
```

- No `#flashcards` tag is needed; a note with a deck property is scanned for cards.
- Precedence: a question-specific tag (`#flashcards/x Q::A`) > deck property > folders or note-level tags.
- Whitespace around segments is trimmed: `Math / Complex Analysis` equals `Math/Complex Analysis`.
- Setting: **Deck property** (default `deck`). Leave empty to disable.

### Installing

Download `main.js`, `manifest.json` and `styles.css` from the [latest release](https://github.com/ekinbasarkomur/obsidian-spaced-repetition/releases/latest) into `<vault>/.obsidian/plugins/obsidian-spaced-repetition-callouts/`, then enable **Spaced Repetition (Callouts)** in _Settings → Community plugins_.

With [BRAT](https://github.com/TfTHacker/obsidian42-brat), add the beta plugin `ekinbasarkomur/obsidian-spaced-repetition` instead and it keeps the plugin updated.

To publish a release: add a section for the new version at the top of `docs/docs/changelog.md` (the release notes are taken from it), commit, then

```sh
npm version 1.15.4-callouts.2   # bumps package.json, manifest.json, versions.json; commits and tags
git push --follow-tags
```

`.github/workflows/release.yml` builds the plugin for the pushed tag and attaches `main.js`, `manifest.json`, `styles.css` and a zip to the release. On a fork, Actions must be enabled once in the repository's Actions tab.

### Building from source

```sh
pnpm install
pnpm build          # type-check + bundle into build/
pnpm test
```

Copy `build/main.js`, `manifest.json` and `styles.css` into `<vault>/.obsidian/plugins/obsidian-spaced-repetition-callouts/`, then enable the plugin in _Settings → Community plugins_. Cloning the source repository directly into the plugins folder does **not** work: Obsidian loads the bundled `main.js`, which only exists after a build.

<br/>

## Features⚡

#### Reviewing Flashcards🗃️

- [Getting started](https://stephenmwangi.com/obsidian-spaced-repetition/flashcards/flashcards-overview/) (Using Obsidian's hierarchical tags or folder structure)
- Creating Flashcards
    - [Single-line style](https://stephenmwangi.com/obsidian-spaced-repetition/flashcards/q-and-a-cards/#single-line-basic) (`Question::Answer`)
    - [Single-line reversed style](https://stephenmwangi.com/obsidian-spaced-repetition/flashcards/q-and-a-cards/#single-line-bidirectional) (`Question:::Answer`)
    - [Multi-line style](https://stephenmwangi.com/obsidian-spaced-repetition/flashcards/q-and-a-cards/#multi-line-basic) (Separated by `?`)
    - [Multi-line reversed style](https://stephenmwangi.com/obsidian-spaced-repetition/flashcards/q-and-a-cards/#multi-line-bidirectional) (Separated by `??`)
    - Callout cards (`> [!question]- Front` + body as back; fork addition, see above)
    - [Cloze cards](https://stephenmwangi.com/obsidian-spaced-repetition/flashcards/cloze-cards/) (`==highlight==` your cloze deletions!, `**bolded text**`, `{{text in curly braces}}`, or use custom cloze patterns)
    - Rich text support in flashcards (inherited from Obsidian)
        - Images, Audio, & Video
        - LaTeX
        - Code syntax highlighting
        - Footnotes
- [Organize Decks](https://stephenmwangi.com/obsidian-spaced-repetition/flashcards/decks/) (Using Obsidian's hierarchical tags or folder structure)
    - Or a `deck:` frontmatter property with a path of any depth (fork addition, see above)
- [Card context - automatic titles based on headings](https://stephenmwangi.com/obsidian-spaced-repetition/flashcards/reviewing/#context) (i.e. `Note title > Heading 1 > Subheading`)

#### Reviewing Notes📄

- [Getting started](https://stephenmwangi.com/obsidian-spaced-repetition/notes/)
- [Due Notes for review](https://stephenmwangi.com/obsidian-spaced-repetition/notes/#note-review-queue)
- [How to review a note](https://stephenmwangi.com/obsidian-spaced-repetition/notes/#reviewing)

#### [Statistics📈](https://stephenmwangi.com/obsidian-spaced-repetition/flashcards/statistics/)

<br/>
<br/>

## Usage TL;DR🚀

### Creating Decks

1. Add the tag `#flashcards` in a note, where you want to write your cards
2. If you want to have your cards in a specific sub deck, then add your sub deck name to the tag like so: `#flashcards/YOUR_SUB_DECK_NAME`
3. Write your card in the note which where you've added your tag

<br/>

### Creating Cards

##### 1. Decide what card type you need:

- Single line -> Card format:
  `Question::Answer`
- Single line reversable -> Card format:
  `Question:::Answer`
- Multi line -> Card format:
    ```
    Question
    ?
    Answer
    ```
- Multi line reversable -> Card format:
    ```
    Question
    ??
    Answer
    ```

##### 2. Write your card (In one of those formats) in a note that you have tagged as a deck

<br/>

### Reviewing Cards

##### 1.1. Open the list of all decks with either of two commands(ctrl+p):

- _Review Flashcards from all notes_
  -> Here the algorithm decides based on your past reviews, which cards are due to review
- _Select a deck to cram_
  -> All decks and all cards are reviewable and the algorithm is fully ignored

##### 1.2. Or open the list of all decks within your currently opened note(ctrl+p):

- _Review flashcards in this note_
  -> Here the algorithm decides based on your past reviews, which cards from this note are due to review
- _Cram flashcards in this note_
  -> All decks and all cards from this note are reviewable and the algorithm is fully ignored

![Deck view](./docs/media/en/deck-view.png)

##### 2. Select a deck via the list and click on the deck name

##### 3. Rate your ability to remember the answer to the current question

- This tells the algorithm what you know well and what you don't

![Card view](./docs/media/en/card-view.png)

<br/>

### Creating & reviewing whole notes

Sometimes it makes more sense to recall a whole note, when it isn't just pure facts which you have to learn.
This is where marking a note for review comes in handy.

1. Just like with decks add the tag `#review` to your note to mark them as reviewable
2. To see which notes are due for review open the note review queue via the command(ctrl+p): _Open Notes Review Queue in sidebar_
3. There you can open up the notes for review, just as if you would open them up in your file explorer, only that they are sorted her by when they are due for review
4. Once you have recalled/reviewed your note you can rate your recall ability by executing the command(ctrl+p, or just via the 3 dots next to the note): _Review note as YOUR_RATING_ - The algorithm will take your rating into account to calculate a new due date, when you have to review it again
   <br/>

## Links & Resources🔗

- [Documentation](https://stephenmwangi.com/obsidian-spaced-repetition/).
- [Roadmap](https://github.com/st3v3nmw/obsidian-spaced-repetition/projects/3/)
- [Dev News](https://github.com/st3v3nmw/obsidian-spaced-repetition/discussions/categories/development-news)
- [Issues](https://github.com/st3v3nmw/obsidian-spaced-repetition/issues/)
- [Discussions](https://github.com/st3v3nmw/obsidian-spaced-repetition/discussions/)

<br/>

## Support Development💻

<table>
    <thead>
        <tr>
            <th>Stephen Mwangi (Owner)</th>
            <th>Kyle Klus (Maintainer)</th>
        </tr>
    </thead>
    <tbody>
  <tr>
    <td align="center">
        <a href='https://ko-fi.com/M4M44DEN6' target='_blank' style="text-decoration: none;">
            <img height='30' style='border:0px;height:30px;' src='https://cdn.ko-fi.com/cdn/kofi3.png?v=2' border='0' alt='Buy Me a Coffee at ko-fi.com' />
        </a>
    </td>
    <td align="center">
      <a href="https://github.com/KyleKlus" style="text-decoration: none;">
        <img src="https://img.shields.io/badge/Kyle%20Klus-darkgreen?style=flat&logo=github&label=Github&link=https%3A%2F%2Fgithub.com%2FKyleKlus
        " alt="Github">
      </a>
    </td>
  </tr>
    </tbody>
</table>
