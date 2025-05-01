import type { Editor } from "@tiptap/core";
import { beforeEach, describe, expect, it } from "vitest";
import {
  getDisclosureContents,
  getDisclosureGroups,
  getDisclosureItems,
  getDisclosureTitles,
  newEditor,
} from "./utils";

describe("DisclosureItem", () => {
  let editor: Editor;

  beforeEach(() => {
    editor = newEditor();
  });

  it("creates a disclosure item with title and content", () => {
    editor.commands.toggleDisclosures();
    const disclosureItems = getDisclosureItems(editor);
    expect(disclosureItems).toHaveLength(1);
    expect(disclosureItems[0].node.childCount).toBe(2);
    expect(disclosureItems[0].node.firstChild?.type.name).toBe(
      "disclosureTitle",
    );
    expect(disclosureItems[0].node.lastChild?.type.name).toBe(
      "disclosureContent",
    );
  });

  it("adds a new disclosure after the current disclosure", () => {
    editor.commands.toggleDisclosures();
    editor.commands.insertDisclosure();

    const disclosures = getDisclosureGroups(editor);
    expect(disclosures).toHaveLength(1);

    const disclosureItems = getDisclosureItems(editor);
    expect(disclosureItems).toHaveLength(2);

    for (const disclosure of disclosureItems) {
      expect(disclosure.node.type.name).toBe("disclosure");
      expect(disclosure.node.childCount).toBe(2);
      expect(disclosure.node.firstChild?.type.name).toBe("disclosureTitle");
      expect(disclosure.node.lastChild?.type.name).toBe("disclosureContent");
    }
  });

  it("deletes entire disclosures node when deleting last empty disclosure", () => {
    // Create a disclosures node with one disclosure
    editor.commands.toggleDisclosures();

    // Delete the disclosure
    const didDelete = editor.commands.removeDisclosure();
    expect(didDelete).toBe(true);

    const json = editor.getJSON();

    // Two paragraphs remain /shrug
    expect(json.content).toHaveLength(2);
    expect(json.content?.[0].type).toBe("paragraph");
    expect(json.content?.[0].content).toBeUndefined();
    expect(json.content?.[1].type).toBe("paragraph");
    expect(json.content?.[1].content).toBeUndefined();
  });

  it("adds a new disclosure at the end of the list", () => {
    // Create a disclosures node with a disclosure item
    editor.commands.toggleDisclosures();

    // Get initial disclosure count
    const initialDisclosureItems = getDisclosureItems(editor);
    expect(initialDisclosureItems.length).toBe(1);

    // Focus at the start of the disclosure title
    const disclosureTitles = getDisclosureTitles(editor);
    editor.commands.focus(disclosureTitles[0].pos);

    // Add a title
    editor.commands.insertContent("First Disclosure");

    // Add a new disclosure
    editor.commands.insertDisclosure();

    // Check that a new disclosure was added
    const disclosureItems = getDisclosureItems(editor);
    expect(disclosureItems.length).toBe(2);

    // Check that focus moved to the new disclosure title
    const newDisclosureTitles = getDisclosureTitles(editor);
    expect(editor.state.selection.$from.pos).toBe(
      newDisclosureTitles[1].pos + 1,
    );
  });

  it("adds a new disclosure before the current disclosure", () => {
    // Create a disclosures node with a disclosure item
    editor.commands.toggleDisclosures();

    // Get initial disclosure count
    const initialDisclosureItems = getDisclosureItems(editor);
    expect(initialDisclosureItems.length).toBe(1);

    // Focus at the start of the disclosure title
    const disclosureTitles = getDisclosureTitles(editor);
    editor.commands.focus(disclosureTitles[0].pos);

    // Add a title
    editor.commands.insertContent("First Disclosure");

    // Add a new disclosure before
    editor.commands.insertDisclosure({ before: true });

    // Check that a new disclosure was added
    const disclosureItems = getDisclosureItems(editor);
    expect(disclosureItems.length).toBe(2);

    // Check that focus moved to the new disclosure title
    const newDisclosureTitles = getDisclosureTitles(editor);
    expect(editor.state.selection.$from.pos).toBe(
      newDisclosureTitles[0].pos + 1,
    );
  });

  it("deletes an empty disclosure", () => {
    // Create a disclosures node with a disclosure item
    editor.commands.toggleDisclosures();

    // Get initial disclosure count
    const initialDisclosureItems = getDisclosureItems(editor);
    expect(initialDisclosureItems.length).toBe(1);

    // Focus at the start of the disclosure title
    const disclosureTitles = getDisclosureTitles(editor);
    editor.commands.focus(disclosureTitles[0].pos);

    // Delete the disclosure
    editor.commands.removeDisclosure();

    // Check that the disclosure was deleted
    const disclosureItems = getDisclosureItems(editor);
    expect(disclosureItems.length).toBe(0);
  });

  it("deletes the entire disclosures list when deleting the last empty disclosure", () => {
    // Create a disclosures node with a disclosure item
    editor.commands.toggleDisclosures();

    // Get initial disclosure count
    const initialDisclosureItems = getDisclosureItems(editor);
    expect(initialDisclosureItems.length).toBe(1);

    // Focus at the start of the disclosure title
    const disclosureTitles = getDisclosureTitles(editor);
    editor.commands.focus(disclosureTitles[0].pos);

    // Delete the disclosure
    editor.commands.removeDisclosure();

    // Check that the disclosures node was deleted
    const disclosures = editor.state.doc.content.content.filter(
      (node) => node.type.name === "disclosures",
    );
    expect(disclosures.length).toBe(0);
  });
});
