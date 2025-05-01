import { Editor } from "@tiptap/core";
import type { JSONContent } from "@tiptap/core";
import { findChildren } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import StarterKit from "@tiptap/starter-kit";
import {
  StepContent,
  StepItem,
  StepTitle,
  Steps,
  Disclosures,
  Disclosure,
  DisclosureTitle,
  DisclosureContent,
} from "../src";

export const findNodesByType = (editor: Editor, nodeType: string) => {
  return findChildren(editor.state.doc, (node) => node.type.name === nodeType);
};

export const getSteps = (editor: Editor) => findNodesByType(editor, "steps");
export const getStepItems = (editor: Editor) =>
  findNodesByType(editor, "stepItem");
export const getStepTitles = (editor: Editor) =>
  findNodesByType(editor, "stepTitle");
export const getStepContents = (editor: Editor) =>
  findNodesByType(editor, "stepContent");

export const getDisclosureGroups = (editor: Editor) =>
  findNodesByType(editor, "disclosures");
export const getDisclosureItems = (editor: Editor) =>
  findNodesByType(editor, "disclosure");
export const getDisclosureTitles = (editor: Editor) =>
  findNodesByType(editor, "disclosureTitle");
export const getDisclosureContents = (editor: Editor) =>
  findNodesByType(editor, "disclosureContent");

// Helper to create a new editor with all required extensions
export function newEditor() {
  return new Editor({
    extensions: [
      StarterKit.configure({
        document: false,
      }),
      Document.extend({
        content: "(block | steps)+",
      }),
      Steps,
      StepItem,
      StepTitle,
      StepContent,
      Disclosures,
      Disclosure,
      DisclosureTitle,
      DisclosureContent,
    ],
  });
}

// Helper to create a basic step structure
export function createBasicStep(title: string, content: string): JSONContent {
  return {
    type: "steps",
    content: [
      {
        type: "stepItem",
        content: [
          {
            type: "stepTitle",
            content: [{ type: "text", text: title }],
          },
          {
            type: "stepContent",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: content }],
              },
            ],
          },
        ],
      },
    ],
  };
}

export function createBasicDisclosure(
  title: string,
  content: string,
): JSONContent {
  return {
    type: "disclosures",
    content: [
      {
        type: "disclosure",
        content: [
          {
            type: "disclosureTitle",
            content: [{ type: "text", text: title }],
          },
          {
            type: "disclosureContent",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: content }],
              },
            ],
          },
        ],
      },
    ],
  };
}

// Helper to create a paragraph
export function createParagraph(text: string): JSONContent {
  return {
    type: "paragraph",
    content: [{ type: "text", text }],
  };
}
