// In reading view, a callout card's front/back separator line ("> ?") would show up as a
// lone "?" paragraph. Replace it with a divider so the note reads like the card.
//
// The separator must be its own paragraph, i.e. preceded by an empty ">" line when it
// follows a nested callout; otherwise markdown's lazy continuation pulls it into the
// nested callout.
export function renderCalloutCardSeparators(
    el: HTMLElement,
    calloutCardTypes: string[],
    separator: string,
): void {
    const types = new Set(calloutCardTypes.map((type) => type.trim().toLowerCase()));
    if (types.size === 0 || !separator) return;

    const callouts: HTMLElement[] = [
        ...(el.matches(".callout") ? [el] : []),
        ...Array.from(el.querySelectorAll<HTMLElement>(".callout")),
    ];
    for (const callout of callouts) {
        const type = callout.dataset.callout?.toLowerCase();
        if (!type || !types.has(type)) continue;

        const content = callout.querySelector(":scope > .callout-content");
        if (!content) continue;
        for (const paragraph of Array.from(content.querySelectorAll(":scope > p"))) {
            const divider = activeDocument.createElement("hr");
            divider.className = "sr-callout-card-separator";

            // "?" on its own paragraph
            if (paragraph.textContent?.trim() === separator) {
                paragraph.replaceWith(divider);
                continue;
            }

            // "?" as the first line of the answer's paragraph: "?<br>answer…"
            const first = paragraph.firstChild;
            const next = first?.nextSibling;
            if (
                first?.nodeType === Node.TEXT_NODE &&
                first.textContent?.trim() === separator &&
                next instanceof HTMLElement &&
                next.tagName === "BR"
            ) {
                first.remove();
                next.remove();
                paragraph.before(divider);
            }
        }
    }
}
