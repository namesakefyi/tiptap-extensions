import type { Editor } from "@tiptap/core";
import { beforeEach, describe, expect, it } from "vitest";
import {
  getDisclosureContents,
  getDisclosureItems,
  getDisclosureTitles,
  newEditor,
} from "./utils";

describe("DisclosureContent", () => {
  let editor: Editor;

  beforeEach(() => {
    editor = newEditor();
  });

  it("renders with correct HTML attributes and placeholder", () => {
    editor.commands.toggleDisclosures();

    const html = editor.getHTML();
    expect(html).toMatch(/aside data-type="disclosures"/);
  });

  it("handles Backspace key at start of content", () => {
    // Create a disclosure node with a disclosure item
    editor.commands.toggleDisclosures();

    // Focus at the start of the disclosure title
    const disclosureTitles = getDisclosureTitles(editor);
    editor.commands.focus(disclosureTitles[0].pos);

    // Add a title
    editor.commands.insertContent("Title");

    // Press enter to jump to contents
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Add content
    editor.commands.insertContent("Content");

    // Focus at the start of the content
    const disclosureContents = getDisclosureContents(editor);
    editor.commands.focus(disclosureContents[0].pos + 2);

    // Paragraph within content
    expect(editor.state.selection.$from.parent.type.name).toBe("paragraph");

    // Simulate Backspace key
    editor.view.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Backspace" }),
    );

    // Should move focus to the end of the title
    expect(editor.state.selection.$from.parent.type.name).toBe(
      "disclosureTitle",
    );

    // Content should remain
    const disclosureTitlesAfterBackspace = getDisclosureTitles(editor);
    expect(disclosureTitlesAfterBackspace[0].node.textContent).toBe("Title");

    const disclosureContentsAfterBackspace = getDisclosureContents(editor);
    expect(disclosureContentsAfterBackspace[0].node.textContent).toBe(
      "Content",
    );
  });

  it("handles Enter key at end of empty content", () => {
    // Create a disclosure node with a disclosure item
    editor.commands.toggleDisclosures();

    // Focus at the start of the disclosure title
    const disclosureTitles = getDisclosureTitles(editor);
    editor.commands.focus(disclosureTitles[0].pos);

    // Add a title
    editor.commands.insertContent("Title");

    // Press enter to jump to contents
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Focus at the end of the content
    const disclosureContents = getDisclosureContents(editor);
    const endOfContent =
      disclosureContents[0].pos + disclosureContents[0].node.content.size;
    editor.commands.focus(endOfContent);

    // Simulate Enter key at end of empty content
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Should add a new disclosure
    const disclosureItems = getDisclosureItems(editor);
    expect(disclosureItems.length).toBe(2);
  });
});
