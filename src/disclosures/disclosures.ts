import {
  findChildren,
  findParentNode,
  type JSONContent,
  mergeAttributes,
  Node,
} from "@tiptap/core";

const ALLOWED_TITLE_TYPES = ["paragraph", "heading"];

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    disclosures: {
      toggleDisclosures: () => ReturnType;
    };
  }
}

export interface DisclosuresOptions {
  HTMLAttributes: Record<string, any>;
}

export const Disclosures = Node.create<DisclosuresOptions>({
  name: "disclosures",
  group: "block",
  content: "disclosure+",
  inline: false,
  defining: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: "aside[data-type='disclosures']",
        priority: 500,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "aside",
      mergeAttributes(
        { "data-type": "disclosures" },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      0,
    ];
  },

  addCommands() {
    return {
      toggleDisclosures:
        () =>
        ({ chain: chainCommand, state }) => {
          const range = state.selection.$from.blockRange(state.selection.$to);
          if (!range) return false;

          const disclosures = findParentNode(
            (node) => node.type.name === "disclosures",
          )(state.selection);

          const slice = state.doc.slice(range.start, range.end);
          const selectedContent =
            slice.content.size > 0 ? slice.toJSON().content : [];

          // If we're inside a disclosures container, toggling will remove the disclosures
          if (disclosures) {
            const selectedDisclosures = findChildren(
              disclosures.node,
              (node) => node.type.name === "disclosure",
            ).filter((disclosure) => {
              return (
                disclosure.pos >= range.start - 1 &&
                disclosure.pos + disclosure.node.content.size <= range.end
              );
            });

            // If nothing is in the selection, run the default removeDisclosure command
            if (selectedDisclosures.length === 0) {
              return chainCommand().removeDisclosure().run();
            }

            // If we have selected disclosures, remove them all
            if (selectedDisclosures.length > 0) {
              // First collect all content that needs to be preserved
              const contentToPreserve: JSONContent[] = [];

              for (const disclosure of selectedDisclosures) {
                const title = disclosure.node.firstChild;
                const content = disclosure.node.lastChild;

                if (!title || !content) continue;

                const hasTitle = title.textContent.length > 0;
                if (hasTitle) {
                  contentToPreserve.push({
                    type: "paragraph",
                    marks: [{ type: "bold" }],
                    content: [{ type: "text", text: title.textContent }],
                  });
                }

                // Add the disclosure content
                const disclosureContent = content.content.toJSON();
                if (disclosureContent && disclosureContent.length > 0) {
                  contentToPreserve.push(...disclosureContent);
                }
              }

              // Now perform the operations
              return chainCommand()
                .deleteRange({
                  from: Math.max(0, range.start - 1),
                  to: range.end,
                })
                .insertContentAt(
                  Math.max(0, range.start - 1),
                  contentToPreserve,
                )
                .run();
            }
          }

          // If no content is selected, just insert a blank disclosure
          // Subtract 2 for start and end tokens
          if (slice.content.size - 2 <= 0) {
            return chainCommand().insertDisclosure().run();
          }

          // Otherwise, attempt to insert the selected content as a disclosure
          let titleToInsert = "";
          let contentToInsert: JSONContent[] = [];

          // Try to get a title from the selected content
          const [firstNode, ...remainingNodes] = selectedContent;

          if (firstNode?.type && ALLOWED_TITLE_TYPES.includes(firstNode.type)) {
            titleToInsert = firstNode.content?.[0]?.text || "";
            contentToInsert = remainingNodes;
          } else {
            contentToInsert = selectedContent;
          }

          return chainCommand()
            .deleteRange({ from: range.start, to: range.end })
            .insertDisclosure({
              title: titleToInsert,
              content: contentToInsert,
            })
            .run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Alt-d": () => this.editor.commands.toggleDisclosures(),
    };
  },
});
