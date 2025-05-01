import { Node, findParentNode, mergeAttributes } from "@tiptap/core";

export interface DisclosureContentOptions {
  HTMLAttributes: Record<string, string>;
}

export const DisclosureContent = Node.create<DisclosureContentOptions>({
  name: "disclosureContent",
  content: "block+",
  defining: false,
  selectable: false,

  parseHTML() {
    return [
      {
        tag: "div[data-type='disclosure-content']",
        priority: 500,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(
        { "data-type": "disclosure-content" },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      0,
    ];
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $anchor } = selection;

        // If we're not in disclosure content, ignore
        if (this.type.name !== "disclosureContent") return false;

        const disclosureContent = findParentNode(
          (node) => node.type.name === "disclosureContent",
        )(state.selection);

        // If no disclosure content found, ignore
        if (!disclosureContent) return false;

        const endOfContent =
          disclosureContent.pos + disclosureContent.node.content.size;

        // If cursor is not at the end of the content, ignore
        if ($anchor.pos !== endOfContent) return false;

        // If the selected node has text, ignore
        if ($anchor.node().textContent.length > 0) return false;

        // Otherwise, we're at the end of the content with an empty line,
        // so delete the empty line and add a new disclosure
        return editor.chain().joinTextblockBackward().insertDisclosure().run();
      },

      Backspace: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $to } = selection;

        const disclosureContent = findParentNode(
          (node) => node.type.name === "disclosureContent",
        )(state.selection);
        if (!disclosureContent) return false;

        // If we're not in disclosure content, ignore
        if (this.type.name !== "disclosureContent") return false;

        // If we're not at the start of the content, ignore
        // +1 to account for the start token of the paragraph node
        if ($to.pos !== disclosureContent.start + 1) return false;

        const positionToFocus = disclosureContent.start - 2;

        // Otherwise, jump back to the end of the title node
        return editor.chain().focus(positionToFocus).run();
      },
    };
  },
});
