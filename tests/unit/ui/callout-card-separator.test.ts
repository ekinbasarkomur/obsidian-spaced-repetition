import { renderCalloutCardSeparators } from "src/ui/callout-card-separator";

function render(html: string, types: string[] = ["question"]): HTMLElement {
    const el = document.createElement("div");
    el.innerHTML = html;
    renderCalloutCardSeparators(el, types, "?");
    return el;
}

const callout = (type: string, content: string) =>
    `<div class="callout" data-callout="${type}"><div class="callout-title">Q</div><div class="callout-content">${content}</div></div>`;

beforeAll(() => {
    (globalThis as unknown as { activeDocument: Document }).activeDocument = document;
});

test("A lone separator paragraph in a card callout becomes a divider", () => {
    const el = render(callout("question", "<p>front</p><p>?</p><p>back</p>"));
    expect(el.querySelectorAll("p").length).toEqual(2);
    expect(el.querySelector(".callout-content > hr.sr-callout-card-separator")).not.toBeNull();
});

test("Other callouts, other text and nested callouts are left alone", () => {
    expect(render(callout("tip", "<p>?</p>")).querySelector("hr")).toBeNull();
    expect(render(callout("question", "<p>Why?</p>")).querySelector("hr")).toBeNull();
    const nested = render(callout("question", callout("hint", "<p>?</p>") + "<p>back</p>"), [
        "question",
    ]);
    expect(nested.querySelector("hr")).toBeNull();
});

test("Type matching is case-insensitive and the element itself can be the callout", () => {
    const el = document.createElement("div");
    el.className = "callout";
    el.dataset.callout = "Question";
    el.innerHTML = '<div class="callout-content"><p> ? </p></div>';
    renderCalloutCardSeparators(el, ["question"], "?");
    expect(el.querySelector("hr")).not.toBeNull();
});

test("A separator on the first line of the answer paragraph is split off", () => {
    const el = render(callout("question", "<p>front</p><p>?<br>back <em>line</em></p>"));
    const content = el.querySelector(".callout-content");
    expect(Array.from(content.children).map((c) => c.tagName)).toEqual(["P", "HR", "P"]);
    expect(content.lastElementChild.innerHTML).toEqual("back <em>line</em>");
});
