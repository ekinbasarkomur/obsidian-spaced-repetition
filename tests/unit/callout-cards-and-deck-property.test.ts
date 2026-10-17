import { CardType } from "src/data/data-structures/card/questions/question";
import { Deck } from "src/data/data-structures/deck/deck";
import { TopicPath } from "src/data/data-structures/deck/topic-path";
import { DEFAULT_SETTINGS, SRSettings } from "src/data/settings";
import { Note } from "src/note/note";
import { NoteFileLoader } from "src/note/note-file-loader";
import { NoteParser } from "src/note/note-parser";
import { parse, ParsedQuestionInfo, ParserOptions } from "src/parser";
import { TextDirection } from "src/utils/strings";

import { UnitTestSRFile } from "./helpers/unit-test-file";
import { unitTestSetupStandardDataStoreAlgorithm } from "./helpers/unit-test-setup";

const parserOptions: ParserOptions = {
    singleLineCardSeparator: "::",
    singleLineReversedCardSeparator: ":::",
    multilineCardSeparator: "?",
    multilineReversedCardSeparator: "??",
    multilineCardEndMarker: "",
    clozePatterns: ["==[123;;]answer[;;hint]=="],
    calloutCardTypes: ["question"],
};

function parseT(text: string, options: ParserOptions = parserOptions) {
    return parse(text, options).map((item: ParsedQuestionInfo) => [
        item.cardType,
        item.text,
        item.firstLineNum,
        item.lastLineNum,
    ]);
}

async function deckOf(noteText: string, settings: SRSettings = DEFAULT_SETTINGS): Promise<Deck> {
    const file = new UnitTestSRFile(noteText);
    const note: Note = await new NoteParser(settings).parse(
        file,
        TextDirection.Ltr,
        TopicPath.getTopicPathOfFile(file, settings),
    );
    const deck: Deck = Deck.emptyDeck;
    note.appendCardsToDeck(deck);
    return deck;
}

beforeAll(() => {
    unitTestSetupStandardDataStoreAlgorithm(DEFAULT_SETTINGS);
});

describe("Callout cards: parsing", () => {
    test("A question callout is one card", () => {
        const text = "> [!question]- Why?\n> Because.\n>\n> More detail.";
        expect(parseT(text)).toEqual([[CardType.Callout, text, 0, 3]]);
    });

    test("Callout type matching is case-insensitive and accepts +, - or no fold marker", () => {
        expect(parseT("> [!Question] Q\n> A")[0][0]).toEqual(CardType.Callout);
        expect(parseT("> [!question]+ Q\n> A")[0][0]).toEqual(CardType.Callout);
        expect(parseT(">[!QUESTION]- Q\n> A")[0][0]).toEqual(CardType.Callout);
    });

    test("Other callout types are not cards", () => {
        expect(parseT("> [!tip] Q\n> A")).toEqual([]);
        expect(parseT("> [!questions] Q\n> A")).toEqual([]);
    });

    test("A callout without a body is not a card", () => {
        expect(parseT("> [!question]- Just a title")).toEqual([]);
        expect(parseT("> [!question]- Title\n>\n> <!--SR:!2023-09-02,4,270-->")).toEqual([]);
    });

    test("Schedule inside or directly below the callout belongs to the card", () => {
        const inside = "> [!question]- Q\n> A\n> <!--SR:!2023-09-02,4,270-->";
        expect(parseT(inside)).toEqual([[CardType.Callout, inside, 0, 2]]);
        const below = "> [!question]- Q\n> A\n<!--SR:!2023-09-02,4,270-->";
        expect(parseT(below)).toEqual([[CardType.Callout, below, 0, 2]]);
    });

    test("Consecutive callouts and surrounding cards", () => {
        const text = [
            "Q1::A1",
            "",
            "> [!question]- Q2",
            "> A2",
            "",
            "> [!question]- Q3",
            "> A3",
            "Q4::A4",
        ].join("\n");
        expect(parseT(text)).toEqual([
            [CardType.SingleLineBasic, "Q1::A1", 0, 0],
            [CardType.Callout, "> [!question]- Q2\n> A2", 2, 3],
            [CardType.Callout, "> [!question]- Q3\n> A3", 5, 6],
            [CardType.SingleLineBasic, "Q4::A4", 7, 7],
        ]);
    });

    test("Separators inside a callout card don't create extra cards", () => {
        const text = "> [!question]- Formula?\n> a :: b\n> ?\n> c";
        expect(parseT(text)).toEqual([[CardType.Callout, text, 0, 3]]);
    });

    test("Inline cards inside non-card callouts still work", () => {
        expect(parseT("> [!note]\n> Q::A")[0][0]).toEqual(CardType.SingleLineBasic);
    });

    test("Disabled when no callout types are configured", () => {
        expect(parseT("> [!question]- Q\n> A", { ...parserOptions, calloutCardTypes: [] })).toEqual(
            [],
        );
        expect(
            parseT("> [!question]- Q\n> A", { ...parserOptions, calloutCardTypes: undefined }),
        ).toEqual([]);
    });
});

describe("Callout cards: front and back", () => {
    test("Title is the front, body is the back", async () => {
        const deck = await deckOf("#flashcards\n> [!question]- Why?\n> Because.\n>\n> **More.**\n");
        const card = deck.getDeck(new TopicPath(["flashcards"])).newRepItems[0];
        expect(card.front).toEqual("Why?");
        expect(card.back).toEqual("Because.\n\n**More.**");
    });

    test("Body lines before a separator line belong to the front", async () => {
        const text = [
            "#flashcards",
            "> [!question]- **1.** Compute:",
            "> $$z = 1 + i$$",
            "> > [!hint]- Hint",
            "> > Use $|z|^2$.",
            "> ?",
            "> $\\sqrt{2}$",
        ].join("\n");
        const card = (await deckOf(text)).getDeck(new TopicPath(["flashcards"])).newRepItems[0];
        expect(card.front).toEqual(
            "**1.** Compute:\n$$z = 1 + i$$\n> [!hint]- Hint\n> Use $|z|^2$.",
        );
        expect(card.back).toEqual("$\\sqrt{2}$");
    });

    test("Schedule is read from inside the callout", async () => {
        const text = "#flashcards\n> [!question]- Q\n> A\n> <!--SR:!2023-09-02,4,270-->\n";
        const deck = (await deckOf(text)).getDeck(new TopicPath(["flashcards"]));
        expect(deck.newRepItems.length).toEqual(0);
        expect(deck.dueRepItems.length).toEqual(1);
        expect(deck.dueRepItems[0].back).toEqual("A");
    });
});

describe("Callout cards: writing the schedule", () => {
    async function rewrite(originalText: string): Promise<string> {
        const file = new UnitTestSRFile(originalText);
        const note: Note = await new NoteFileLoader(DEFAULT_SETTINGS).load(
            file,
            TextDirection.Ltr,
            TopicPath.emptyPath,
        );
        for (const question of note.questionList) question.hasChanged = true;
        await note.writeNoteFile(DEFAULT_SETTINGS);
        return file.content;
    }

    test("Schedule stays as the last line of the callout", async () => {
        const text = "#flashcards\n> [!question]- Q\n> A\n> <!--SR:!2023-09-02,4,270-->\n\nafter\n";
        expect(await rewrite(text)).toEqual(text);
    });

    test("Schedule below the callout is moved inside it", async () => {
        const text = "#flashcards\n> [!question]- Q\n> A\n<!--SR:!2023-09-02,4,270-->\n";
        expect(await rewrite(text)).toEqual(
            "#flashcards\n> [!question]- Q\n> A\n> <!--SR:!2023-09-02,4,270-->\n",
        );
    });

    test("A card without a schedule is left untouched", async () => {
        const text = "#flashcards\n> [!question]- Q\n> A\n";
        expect(await rewrite(text)).toEqual(text);
    });
});

describe("Deck property", () => {
    const note = (deck: string, body: string = "Q1::A1\nQ2::A2\n") =>
        `---\ndeck: ${deck}\ntags:\n  - concept\n---\n${body}`;

    test("Creates nested decks of any depth, without flashcard tags", async () => {
        const deck = await deckOf(note("Math/Complex Analysis/Polar Representation/Euler Form"));
        const path = new TopicPath([
            "Math",
            "Complex Analysis",
            "Polar Representation",
            "Euler Form",
        ]);
        expect(deck.getDeck(path).newRepItems.map((c) => c.front)).toEqual(["Q1", "Q2"]);
    });

    test("Whitespace around segments and empty segments are ignored", () => {
        expect(TopicPath.getTopicPathFromDeckPath(" Math / Complex Analysis// ").path).toEqual([
            "Math",
            "Complex Analysis",
        ]);
    });

    test("Takes precedence over note-level flashcard tags", async () => {
        const deck = await deckOf(note("Math/Algebra", "#flashcards/other\nQ1::A1\n"));
        expect(deck.getDeck(new TopicPath(["Math", "Algebra"])).newRepItems.length).toEqual(1);
        expect(deck.getDeck(new TopicPath(["flashcards", "other"]))).toBeNull();
    });

    test("A question-specific tag still overrides it", async () => {
        const deck = await deckOf(note("Math/Algebra", "Q1::A1\n#flashcards/special Q2::A2\n"));
        expect(deck.getDeck(new TopicPath(["Math", "Algebra"])).newRepItems.length).toEqual(1);
        expect(deck.getDeck(new TopicPath(["flashcards", "special"])).newRepItems[0].front).toEqual(
            "Q2",
        );
    });

    test("Takes precedence over folders", () => {
        const settings = { ...DEFAULT_SETTINGS, convertFoldersToDecks: true };
        const file = new UnitTestSRFile(note("Math/Algebra"), "Folder/Note.md");
        expect(TopicPath.getTopicPathOfFile(file, settings).path).toEqual(["Math", "Algebra"]);
    });

    test("Custom property name, and disabled when empty", () => {
        const text = "---\nflashcard-deck: Math/Algebra\n---\nQ::A\n";
        const file = new UnitTestSRFile(text);
        expect(
            TopicPath.getTopicPathOfFile(file, {
                ...DEFAULT_SETTINGS,
                deckProperty: "flashcard-deck",
            }).path,
        ).toEqual(["Math", "Algebra"]);
        expect(TopicPath.getTopicPathOfFile(file, DEFAULT_SETTINGS).hasPath).toEqual(false);
        expect(
            TopicPath.getTopicPathOfFile(new UnitTestSRFile(note("Math")), {
                ...DEFAULT_SETTINGS,
                deckProperty: "",
            }).hasPath,
        ).toEqual(false);
    });

    test("Works together with callout cards", async () => {
        const deck = await deckOf(note("Math/Algebra", "> [!question]- Q\n> A\n"));
        expect(deck.getDeck(new TopicPath(["Math", "Algebra"])).newRepItems[0].back).toEqual("A");
    });
});
