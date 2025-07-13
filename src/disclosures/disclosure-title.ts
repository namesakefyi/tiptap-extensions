import { findParentNode, mergeAttributes, Node } from "@tiptap/core";

export interface DisclosureTitleOptions {
  HTMLAttributes: Record<string, any>;
}

export const DisclosureTitle = Node.create<DisclosureTitleOptions>({
  name: "disclosureTitle",
  content: "text*",
  marks: "italic",
  defining: true,
  selectable: false,

  parseHTML() {
    return [
      {
        tag: "summary[data-type='disclosure-title']",
        priority: 500,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "summary",
      mergeAttributes(
        { "data-type": "disclosure-title" },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      0,
    ];
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        try {
          const { state } = editor;
          const { selection } = state;
          const { $from, $to } = selection;

          // Only handle if we're in a disclosure title
          if ($from.parent.type.name !== "disclosureTitle") return false;

          const disclosures = findParentNode(
            (node) => node.type.name === "disclosures",
          )(editor.state.selection);
          if (!disclosures) return false;

          const disclosure = findParentNode(
            (node) => node.type.name === "disclosure",
          )(editor.state.selection);
          if (!disclosure) return false;

          const disclosureTitle = findParentNode(
            (node) => node.type.name === "disclosureTitle",
          )(editor.state.selection);
          if (!disclosureTitle) return false;

          const isFirstDisclosure = disclosure.start === disclosures.start + 1;
          const isCursorAtStartOfDisclosureTitle =
            $to.pos === disclosureTitle.start;
          const titleHasContent =
            disclosureTitle.node.textContent.trim() !== "";
          const posBeforeDisclosure = Math.max(0, disclosure.start - 2);

          // If we're at the start of the first disclosure title, insert paragraph above disclosure
          if (isFirstDisclosure && isCursorAtStartOfDisclosureTitle) {
            return editor
              .chain()
              .insertContentAt(posBeforeDisclosure, { type: "paragraph" })
              .focus(posBeforeDisclosure)
              .run();
          }

          // If we're at the start of a step title after the first item, insert a step item
          if (
            !isFirstDisclosure &&
            isCursorAtStartOfDisclosureTitle &&
            titleHasContent
          ) {
            return editor.chain().insertDisclosure({ before: true }).run();
          }

          const isLastDisclosure =
            disclosure.pos + disclosure.node.content.size + 1 ===
            disclosures.pos + disclosures.node.content.size;
          const isLastDisclosureEmpty =
            disclosure.node.textContent.trim() === "";

          // If we're at the end of the last step and the step is empty,
          // delete the step and then insert a paragraph below steps
          if (isLastDisclosure && isLastDisclosureEmpty) {
            editor.chain().removeDisclosure().run();

            // We have to find the steps node again to recalculate the position
            const disclosures = findParentNode(
              (node) => node.type.name === "disclosures",
            )(editor.state.selection);
            if (!disclosures) return false;

            const posAfterDisclosures =
              disclosures.start + disclosures.node.nodeSize;
            return editor
              .chain()
              .insertContentAt(posAfterDisclosures, {
                type: "paragraph",
              })
              .focus(posAfterDisclosures)
              .run();
          }

          const endOfTitle =
            disclosureTitle.start + disclosureTitle.node.content.size;
          // +3 for end token of title + start token of content + start of paragraph
          const startOfContent = endOfTitle + 3;

          // If cursor is at the end of the title text, just move to content
          if ($to.pos === endOfTitle) {
            return editor.chain().focus(startOfContent).run();
          }

          // Otherwise, cut the title text after the cursor and move to content
          return editor
            .chain()
            .cut({ from: $to.pos, to: endOfTitle }, startOfContent)
            .focus(startOfContent - (endOfTitle - $to.pos))
            .run();
        } catch (error) {
          console.error(error);
          return false;
        }
      },

      Backspace: ({ editor }) => {
        try {
          const { state } = editor;
          const { selection } = state;
          const { $from, $to } = selection;

          // Only handle if we're in a disclosure title
          const disclosureTitle = findParentNode(
            (node) => node.type.name === "disclosureTitle",
          )(editor.state.selection);
          if (!disclosureTitle) return false;

          // Only handle if we're at the start of the title and no text selected
          if ($from.pos !== disclosureTitle.start || $from.pos !== $to.pos)
            return false;

          return editor.chain().removeDisclosure().run();
        } catch (error) {
          console.error(error);
          return false;
        }
      },
    };
  },
});
