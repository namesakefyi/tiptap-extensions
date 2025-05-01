import type { Editor } from "@tiptap/core";
import { beforeEach, describe, expect, it } from "vitest";
import {
  createBasicDisclosure,
  createParagraph,
  getDisclosureContents,
  getDisclosureGroups,
  getDisclosureItems,
  getDisclosureTitles,
  newEditor,
} from "./utils";

describe("Disclosures", () => {
  let editor: Editor;

  beforeEach(() => {
    editor = newEditor();
  });

  it("includes all commands", () => {
    expect(editor).toBeDefined();
    expect(editor.commands.toggleSteps).toBeDefined();
    expect(editor.commands.insertStep).toBeDefined();
    expect(editor.commands.removeStep).toBeDefined();
  });

  it("creates empty disclosure when no content is selected", () => {
    editor.commands.toggleDisclosures();

    const disclosures = getDisclosureGroups(editor);
    expect(disclosures).toBeDefined();

    const disclosureItems = getDisclosureItems(editor);
    expect(disclosureItems).toHaveLength(1);
    expect(disclosureItems[0].node.childCount).toBe(2); // title and content

    const disclosureContents = getDisclosureContents(editor);
    expect(disclosureContents).toHaveLength(1);
    expect(disclosureContents[0].node.childCount).toBe(1); // empty paragraph in content
  });

  it("converts selected paragraph to disclosure title", () => {
    editor.commands.insertContent(createParagraph("This will be title"));
    editor.commands.selectAll();
    editor.commands.toggleDisclosures();

    const disclosureTitles = getDisclosureTitles(editor);
    expect(disclosureTitles).toHaveLength(1);
    expect(disclosureTitles[0].node.type.name).toBe("disclosureTitle");
    expect(disclosureTitles[0].node.textContent).toBe("This will be title");
  });

  it("converts multiple paragraphs to disclosure content", () => {
    // Insert multiple paragraphs
    editor.commands.insertContent([
      createParagraph("First paragraph"),
      createParagraph("Second paragraph"),
    ]);

    editor.commands.selectAll();
    editor.commands.toggleDisclosures();

    // First paragraph becomes the title
    const disclosureTitles = getDisclosureTitles(editor);
    expect(disclosureTitles).toHaveLength(1);
    expect(disclosureTitles[0].node.type.name).toBe("disclosureTitle");
    expect(disclosureTitles[0].node.textContent).toBe("First paragraph");

    // Second paragraph becomes the content
    const disclosureContents = getDisclosureContents(editor);
    expect(disclosureContents).toHaveLength(1);
    expect(disclosureContents[0].node.type.name).toBe("disclosureContent");
    expect(disclosureContents[0].node.textContent).toBe("Second paragraph");
  });

  it("toggles disclosures on and off", () => {
    editor.commands.insertContent(createParagraph("Test content"));
    editor.commands.selectAll();

    editor.commands.toggleDisclosures();
    const disclosuresAfterToggleOn = getDisclosureGroups(editor);
    expect(disclosuresAfterToggleOn).toHaveLength(1);

    editor.commands.toggleDisclosures();
    const jsonAfterToggleOff = editor.getJSON();
    expect(jsonAfterToggleOff.content?.[0].type).toBe("paragraph");
  });

  it("renders with correct HTML attributes", () => {
    editor.commands.toggleDisclosures();

    const html = editor.getHTML();
    expect(html).toMatch(/aside data-type="disclosures"/);
    expect(html).toMatch(/details data-type="disclosure"/);
    expect(html).toMatch(/summary data-type="disclosure-title"/);
    expect(html).toMatch(/div data-type="disclosure-content"/);
  });

  it("toggles disclosures", () => {
    editor.commands.insertContent(createParagraph("Test content"));
    editor.commands.selectAll();
    editor.commands.toggleDisclosures();

    const disclosures = getDisclosureGroups(editor);
    expect(disclosures).toHaveLength(1);

    const disclosureItems = getDisclosureItems(editor);
    expect(disclosureItems).toHaveLength(1);

    const disclosureTitles = getDisclosureTitles(editor);
    expect(disclosureTitles).toHaveLength(1);
    expect(disclosureTitles[0].node.textContent).toBe("Test content");
  });

  it("converts an empty paragraph to disclosures", () => {
    editor.commands.insertContent(createParagraph(" "));
    editor.commands.selectAll();
    editor.commands.toggleDisclosures();

    const disclosureTitles = getDisclosureTitles(editor);
    expect(disclosureTitles).toHaveLength(1);
    expect(disclosureTitles[0].node.textContent).toBe(" ");
  });

  it("converts formatted paragraph to disclosure title", () => {
    editor.commands.insertContent([
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            marks: [{ type: "bold" }],
            text: "Example title in bold",
          },
        ],
      },
    ]);

    editor.commands.selectAll();
    editor.commands.toggleDisclosures();

    const disclosureTitles = getDisclosureTitles(editor);
    expect(disclosureTitles).toHaveLength(1);
    expect(disclosureTitles[0].node.textContent).toBe("Example title in bold");
  });

  it("converts headings to disclosure titles", () => {
    editor.commands.insertContent([
      {
        type: "heading",
        content: [
          {
            type: "text",
            text: "Example heading",
          },
        ],
      },
    ]);

    editor.commands.selectAll();
    editor.commands.toggleDisclosures();

    const disclosureTitles = getDisclosureTitles(editor);
    expect(disclosureTitles).toHaveLength(1);
    expect(disclosureTitles[0].node.textContent).toBe("Example heading");
  });

  it("handles unsetting disclosures with empty title and content", () => {
    editor.commands.toggleDisclosures();
    editor.commands.toggleDisclosures();

    const json = editor.getJSON();
    expect(json.content?.[0].type).toBe("paragraph");
  });

  it("handles unsetting disclosures with empty title and non-empty content", () => {
    editor.commands.toggleDisclosures();
    editor.commands.focus(5);
    editor.commands.insertContent("Disclosure content");
    editor.commands.toggleDisclosures();

    const json = editor.getJSON();
    expect(json.content?.[0].type).toBe("paragraph");
    expect(json.content?.[0].content?.[0].text).toBe("Disclosure content");
  });

  it("creates disclosures from selected content", () => {
    // Insert some content
    editor.commands.insertContent([
      createParagraph("Title"),
      createParagraph("Content 1"),
      createParagraph("Content 2"),
    ]);

    // Select all content
    editor.commands.selectAll();

    // Convert to disclosures
    editor.commands.toggleDisclosures();

    // Check that disclosures were created
    const disclosures = getDisclosureGroups(editor);
    expect(disclosures.length).toBe(1);

    // Check that disclosure items were created
    const disclosureItems = getDisclosureItems(editor);
    expect(disclosureItems.length).toBe(1);

    // Check that title was extracted
    const disclosureTitles = getDisclosureTitles(editor);
    expect(disclosureTitles[0].node.textContent).toBe("Title");

    // Check that content was preserved
    const disclosureContents = getDisclosureContents(editor);
    expect(disclosureContents[0].node.textContent).toBe("Content 1Content 2");
  });

  it("creates empty disclosures when no content is selected", () => {
    // Convert to disclosures
    editor.commands.toggleDisclosures();

    // Check that disclosures were created
    const disclosures = getDisclosureGroups(editor);
    expect(disclosures.length).toBe(1);

    // Check that disclosure items were created
    const disclosureItems = getDisclosureItems(editor);
    expect(disclosureItems.length).toBe(1);

    // Check that title is empty
    const disclosureTitles = getDisclosureTitles(editor);
    expect(disclosureTitles[0].node.textContent).toBe("");

    // Check that content is empty
    const disclosureContents = getDisclosureContents(editor);
    expect(disclosureContents[0].node.textContent).toBe("");
  });

  it("converts disclosures back to paragraphs", () => {
    // Create disclosures
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

    // Convert back to paragraphs
    editor.commands.toggleDisclosures();

    // Check that disclosures were removed
    const disclosures = getDisclosureGroups(editor);
    expect(disclosures.length).toBe(0);

    // Check that paragraphs were created
    const doc = editor.state.doc;
    expect(doc.children[0]?.type.name).toBe("paragraph");
    expect(doc.children[0]?.textContent).toBe("Title");

    // Check that content was preserved
    expect(doc.children[1]?.type.name).toBe("paragraph");
    expect(doc.children[1]?.textContent).toBe("Content");
  });

  // New tests for updated toggleSteps functionality
  it("converts selected content to disclosures with title and content", () => {
    // Insert content with a title and content
    editor.commands.insertContent([
      createParagraph("Disclosure Title"),
      createParagraph("Disclosure Content 1"),
      createParagraph("Disclosure Content 2"),
    ]);

    // Select all content
    editor.commands.selectAll();

    // Toggle disclosures
    editor.commands.toggleDisclosures();

    // Check that disclosures were created
    const disclosures = getDisclosureGroups(editor);
    expect(disclosures.length).toBe(1);

    // Check that disclosure items were created
    const disclosureItems = getDisclosureItems(editor);
    expect(disclosureItems.length).toBe(1);

    // Check that title was extracted
    const disclosureTitles = getDisclosureTitles(editor);
    expect(disclosureTitles[0].node.textContent).toBe("Disclosure Title");

    // Check that content was preserved
    const disclosureContents = getDisclosureContents(editor);
    expect(disclosureContents[0].node.textContent).toBe(
      "Disclosure Content 1Disclosure Content 2",
    );
  });

  it("removes disclosures and preserves content when toggling off", () => {
    // Create disclosures with title and content
    editor.commands.insertContent(
      createBasicDisclosure("Test Title", "Test Content"),
    );

    // Toggle disclosures off
    editor.commands.toggleDisclosures();

    // Check that disclosures were removed
    const disclosures = getDisclosureGroups(editor);
    expect(disclosures.length).toBe(0);

    // Check that content was preserved
    const json = editor.getJSON();
    expect(json.content?.[0].type).toBe("paragraph");
    expect(json.content?.[0].content?.[0].marks?.[0].type).toBe("bold");
    expect(json.content?.[0].content?.[0].text).toBe("Test Title");
    expect(json.content?.[1].type).toBe("paragraph");
    expect(json.content?.[1].content?.[0].text).toBe("Test Content");
  });

  it("handles removing multiple selected disclosure items", () => {
    // Create multiple disclosures
    editor.commands.insertContent([
      createBasicDisclosure("Disclosure 1", "Content 1"),
    ]);

    editor.commands.insertDisclosure({
      title: "Step 2",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Content 2" }],
        },
      ],
    });

    editor.commands.insertDisclosure({
      title: "Step 3",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Content 3" }],
        },
      ],
    });

    const disclosures = getDisclosureGroups(editor);
    expect(disclosures.length).toBe(1);

    const disclosureItems = getDisclosureItems(editor);
    expect(disclosureItems.length).toBe(3);

    // Select all disclosures
    editor.commands.setTextSelection({
      from: 0,
      to: disclosureItems[2].pos + disclosureItems[2].node.nodeSize,
    });

    // Toggle disclosures to remove the selected disclosure
    editor.commands.toggleDisclosures();

    // Check that no disclosures remain
    const remainingDisclosures = getDisclosureItems(editor);
    expect(remainingDisclosures.length).toBe(0);

    // Check that the content of all removed disclosures was preserved
    const json = editor.getJSON();
    expect(json.content?.[0].type).toBe("paragraph");
    expect(json.content?.[0].content?.[0].text).toBe("Disclosure 1");
    expect(json.content?.[1].type).toBe("paragraph");
    expect(json.content?.[1].content?.[0].text).toBe("Content 1");

    expect(json.content?.[2].type).toBe("paragraph");
    expect(json.content?.[2].content?.[0].text).toBe("Step 2");
    expect(json.content?.[3].type).toBe("paragraph");
    expect(json.content?.[3].content?.[0].text).toBe("Content 2");

    expect(json.content?.[4].type).toBe("paragraph");
    expect(json.content?.[4].content?.[0].text).toBe("Step 3");
    expect(json.content?.[5].type).toBe("paragraph");
    expect(json.content?.[5].content?.[0].text).toBe("Content 3");
  });

  it("handles empty selection when toggling disclosures", () => {
    // Create disclosures
    editor.commands.insertContent(
      createBasicDisclosure("Test Title", "Test Content"),
    );

    // Focus in the editor without selecting anything
    editor.commands.focus();

    // Toggle disclosures
    editor.commands.toggleDisclosures();

    // Check that disclosures were removed
    const disclosures = getDisclosureGroups(editor);
    expect(disclosures.length).toBe(0);

    // Check that content was preserved
    const json = editor.getJSON();

    expect(json.content?.[0].type).toBe("paragraph");
    expect(json.content?.[0].content?.[0].text).toBe("Test Title");
    expect(json.content?.[0].content?.[0].marks?.[0].type).toBe("bold");
    expect(json.content?.[1].type).toBe("paragraph");
    expect(json.content?.[1].content?.[0].text).toBe("Test Content");
  });
});
