import { describe, expect, it } from "vitest";
import {
  createBasicDisclosure,
  getDisclosureContents,
  getDisclosureGroups,
  getDisclosureItems,
  getDisclosureTitles,
  newEditor,
} from "./utils";

describe("DisclosureTitle", () => {
  it("renders with correct HTML attributes", () => {
    const editor = newEditor();
    editor.commands.toggleDisclosures();
    const disclosureTitles = getDisclosureTitles(editor);
    expect(disclosureTitles[0].node.type.name).toBe("disclosureTitle");
  });

  it("handles Enter key at end of title", () => {
    const editor = newEditor();
    editor.commands.toggleDisclosures();

    // Focus at the start of the disclosure title
    const disclosureTitles = getDisclosureTitles(editor);
    editor.commands.focus(disclosureTitles[0].pos);

    // Add a title
    editor.commands.insertContent("Title");

    const disclosureTitlesAfterInsert = getDisclosureTitles(editor);
    expect(disclosureTitlesAfterInsert[0].node.textContent).toBe("Title");

    // Focus at the end of the title
    const endOfTitle =
      disclosureTitlesAfterInsert[0].pos +
      disclosureTitlesAfterInsert[0].node.content.size;
    editor.commands.focus(endOfTitle);

    // Simulate Enter key
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Should move focus to the content
    const disclosureContents = getDisclosureContents(editor);
    expect(editor.state.selection.$from.pos).toBe(
      disclosureContents[0].pos + 2,
    );
  });

  it("handles Enter key in the middle of title", () => {
    const editor = newEditor();
    editor.commands.toggleDisclosures();

    // Focus at the start of the disclosure title
    const disclosureTitles = getDisclosureTitles(editor);
    editor.commands.focus(disclosureTitles[0].pos);

    // Add a title
    editor.commands.insertContent("Long Title");

    // Focus in the middle of the title
    const middleOfTitle = disclosureTitles[0].pos + 5;
    editor.commands.focus(middleOfTitle);

    // Simulate Enter key
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Should move focus to the content
    const disclosureContents = getDisclosureContents(editor);
    expect(editor.state.selection.$from.pos).toBe(
      disclosureContents[0].pos + 2,
    );

    // Should have cut the title at the cursor position
    const disclosureTitlesAfterEnter = getDisclosureTitles(editor);
    expect(disclosureTitlesAfterEnter[0].node.textContent).toBe("Long");
  });

  it("handles Enter key at start of first disclosure title", () => {
    const editor = newEditor();

    // Create disclosures
    editor.commands.toggleDisclosures();

    // Focus at the start of the disclosure title
    const disclosureTitles = getDisclosureTitles(editor);
    editor.commands.focus(disclosureTitles[0].pos);

    // Simulate Enter key press
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Check that a paragraph was inserted above disclosures
    const json = editor.getJSON();
    expect(json.content?.[0].type).toBe("paragraph");
    expect(json.content?.[1].type).toBe("disclosures");
  });

  it("handles Enter key at start of non-first disclosure title with content", () => {
    const editor = newEditor();

    // Create disclosures with content
    editor.commands.toggleDisclosures();
    editor.commands.focus("end");
    editor.commands.insertContent("Disclosure 1 content");

    // Add a second disclosure
    editor.commands.insertDisclosure();
    editor.commands.focus("end");
    editor.commands.insertContent("Disclosure 2 content");

    // Focus at the start of the second disclosure title
    const disclosureItems = getDisclosureItems(editor);
    const secondDisclosureTitle = getDisclosureTitles(editor)[1];
    editor.commands.focus(secondDisclosureTitle.pos);

    // Simulate Enter key press
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Check that a new disclosure was inserted before the current disclosure
    const updatedDisclosureItems = getDisclosureItems(editor);
    expect(updatedDisclosureItems.length).toBe(3);
  });

  it("handles Enter key at end of last empty disclosure", () => {
    const editor = newEditor();

    // Create disclosures
    editor.commands.insertContent(
      createBasicDisclosure("Test Title", "Test Content"),
    );

    editor.commands.insertDisclosure();

    const disclosureItems = getDisclosureItems(editor);
    expect(disclosureItems.length).toBe(2);

    // Focus at the end of the second disclosure title
    const disclosureTitles = getDisclosureTitles(editor);
    const secondTitlePos = disclosureTitles[1].pos + 1;
    editor.commands.focus(secondTitlePos);

    // Simulate Enter key press
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    const disclosures = getDisclosureGroups(editor);
    expect(disclosures.length).toBe(1);

    const disclosureItemsAfter = getDisclosureItems(editor);
    expect(disclosureItemsAfter.length).toBe(1);

    const json = editor.getJSON();
    expect(json.content?.[0].type).toBe("disclosures");
    expect(json.content?.[1].type).toBe("paragraph");
  });

  it("handles Enter key at end of title text", () => {
    const editor = newEditor();

    // Create disclosures with title
    editor.commands.insertContent(
      createBasicDisclosure("Disclosure title", "Disclosure content"),
    );

    // Focus at the end of the title text
    const disclosureTitles = getDisclosureTitles(editor);
    const endOfTitle =
      disclosureTitles[0].pos + disclosureTitles[0].node.content.size;
    editor.commands.focus(endOfTitle);

    // Simulate Enter key press
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    // Check that cursor moved to content
    const disclosureContents = getDisclosureContents(editor);
    const startOfDisclosureContent = disclosureContents[0].pos;

    expect(editor.state.selection.to).toEqual(startOfDisclosureContent + 2);
  });

  it("handles Enter key in middle of title text", () => {
    const editor = newEditor();

    // Create disclosures with title
    editor.commands.insertContent(
      createBasicDisclosure("Disclosure title text", "Disclosure content"),
    );

    // Focus in the middle of the title text
    const disclosureTitles = getDisclosureTitles(editor);
    const middleOfTitle = disclosureTitles[0].pos + 5; // Position after "Disclosure"
    editor.commands.focus(middleOfTitle);

    // Simulate Enter key press
    editor.view.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    const disclosureTitlesAfterEnter = getDisclosureTitles(editor);
    expect(disclosureTitlesAfterEnter[0].node.textContent).toBe("Disc");

    const disclosureContentsAfterEnter = getDisclosureContents(editor);
    expect(disclosureContentsAfterEnter[0].node.textContent).toBe(
      "losure title textDisclosure content",
    );
  });

  it("handles Backspace key at start of title", () => {
    const editor = newEditor();

    // Create disclosures
    editor.commands.toggleDisclosures();

    // Focus at the start of the disclosure title
    const disclosureTitles = getDisclosureTitles(editor);
    editor.commands.focus(disclosureTitles[0].pos);

    // Simulate Backspace key press
    editor.view.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Backspace" }),
    );

    // Check that the disclosure was removed
    const disclosures = getDisclosureGroups(editor);
    expect(disclosures.length).toBe(0);
  });
});
