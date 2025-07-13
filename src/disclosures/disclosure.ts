import {
  findParentNode,
  type JSONContent,
  mergeAttributes,
  Node,
} from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";
import { joinListBackwards, joinListForwards } from "../helpers";

export interface DisclosureOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  type InsertDisclosureOptions = {
    /**
     * The title/summary of the new disclosure.
     */
    title?: string;

    /**
     * The content/details of the new disclosure.
     */
    content?: JSONContent[];

    /**
     * Whether to add the new disclosure before the current disclosure.
     * @default false
     */
    before?: boolean;
  };

  interface Commands<ReturnType> {
    disclosure: {
      /**
       * Add a new disclosure after or before the current disclosure.
       * Optionally provide a title and content for the new disclosure.
       */
      insertDisclosure: (options?: InsertDisclosureOptions) => ReturnType;

      /**
       * Remove the current disclosure, putting contents back into the parent.
       */
      removeDisclosure: () => ReturnType;
    };
  }
}

export const Disclosure = Node.create<DisclosureOptions>({
  name: "disclosure",
  group: "disclosure",
  content: "disclosureTitle disclosureContent",
  inline: false,
  defining: false,
  draggable: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: "details[data-type='disclosure']",
        priority: 500,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "details",
      mergeAttributes(
        { "data-type": "disclosure" },
        this.editor?.isEditable ? { open: true } : {},
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
      0,
    ];
  },

  addCommands() {
    return {
      insertDisclosure:
        (options) =>
        ({ state, tr, dispatch }) => {
          try {
            const shouldInsertBefore = options?.before ?? false;
            const range = state.selection.$from.blockRange(state.selection.$to);
            if (!range) return false;

            // Find if we're inside a disclosure
            const currentDisclosure = findParentNode(
              (node) => node.type.name === "disclosure",
            )(state.selection);

            // Calculate position once, preserving the original logic
            const positionToInsert = currentDisclosure
              ? shouldInsertBefore
                ? currentDisclosure.pos
                : currentDisclosure.pos + currentDisclosure.node.nodeSize
              : range.start;

            // Prepare content only once
            const titleToInsert =
              options?.title && options.title.length > 0
                ? [{ type: "text", text: options.title }]
                : undefined;

            const contentToInsert =
              options?.content && options.content.length > 0
                ? options.content
                : [{ type: "paragraph" }];

            const innerContent: JSONContent = {
              type: this.name,
              content: [
                { type: "disclosureTitle", content: titleToInsert },
                { type: "disclosureContent", content: contentToInsert },
              ],
            };

            // Check if we need to wrap in a steps node
            const needsDisclosuresWrapper = !findParentNode(
              (node) => node.type.name === "disclosures",
            )(state.selection);

            const positionToFocus = needsDisclosuresWrapper
              ? positionToInsert + 3
              : positionToInsert + 2;

            // Create a single transaction for all operations
            if (dispatch) {
              // Insert the content
              tr.insert(
                positionToInsert,
                state.schema.nodeFromJSON(
                  needsDisclosuresWrapper
                    ? { type: "disclosures", content: [innerContent] }
                    : innerContent,
                ),
              );

              // Join lists if needed
              joinListBackwards(tr, "disclosures");
              joinListForwards(tr, "disclosures");

              // Set selection
              tr.setSelection(TextSelection.create(tr.doc, positionToFocus));
            }

            return true;
          } catch (error) {
            console.error(error);
            return false;
          }
        },

      removeDisclosure:
        () =>
        ({ state, tr, dispatch }) => {
          try {
            const disclosures = findParentNode(
              (node) => node.type.name === "disclosures",
            )(state.selection);
            const disclosure = findParentNode(
              (node) => node.type.name === "disclosure",
            )(state.selection);
            if (!disclosure) return false;

            const title = disclosure.node.firstChild;
            const content = disclosure.node.lastChild;

            if (!title || !content) return false;

            const contentToPreserve: JSONContent = [];

            const hasTitle = title.textContent.length > 0;
            if (hasTitle) {
              contentToPreserve.push({
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: title.textContent,
                  },
                ],
              });
            }

            const disclosureContent = content.content.toJSON();
            const hasContent =
              disclosureContent && disclosureContent.length > 0;
            if (hasContent) {
              contentToPreserve.push(...disclosureContent);
            }

            const isNotEmpty = hasTitle || hasContent;
            const isLastDisclosure = disclosures?.node.children.length === 1;
            const isFirstChild =
              disclosures?.node.firstChild === disclosure.node;

            const positionToInsert = Math.max(
              0,
              // If the disclosure is the first child, we need to
              // account for the disclosures start token
              isFirstChild ? disclosure.pos - 1 : disclosure.pos,
            );
            const positionToFocus = Math.max(1, positionToInsert - 1);

            if (dispatch) {
              if (isLastDisclosure) {
                // If this is the last disclosure, delete the container disclosures group
                tr.delete(
                  disclosures.pos,
                  disclosures.pos + disclosures.node.nodeSize,
                );
              } else {
                // Otherwise just delete the disclosure
                tr.delete(
                  disclosure.pos,
                  disclosure.pos + disclosure.node.nodeSize,
                );
              }

              if (isNotEmpty) {
                // If there's content to insert, insert it
                tr.insert(
                  positionToInsert,
                  state.schema.nodeFromJSON({
                    type: "doc",
                    content: contentToPreserve,
                  }),
                );
              }

              // Join lists if needed
              joinListBackwards(tr, "disclosures");
              joinListForwards(tr, "disclosures");

              // Set selection
              tr.setSelection(TextSelection.create(tr.doc, positionToFocus));
            }

            return true;
          } catch (error) {
            console.error(error);
            return false;
          }
        },
    };
  },
});
