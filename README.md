# Tiptap Extensions

A collection of extensions for [Tiptap](https://tiptap.dev/), including step-by-step guides and disclosures.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/namesakefyi/tiptap-extensions/tree/main/examples/react?file=src%2FApp.tsx&title=Tiptap%Extensions%20Demo)

![NPM Badge](https://img.shields.io/npm/v/@namesake/tiptap-extensions) [![CI](https://github.com/namesakefyi/tiptap-extensions/actions/workflows/test.yml/badge.svg)](https://github.com/namesakefyi/tiptap-extensions/actions/workflows/test.yml)

## Getting Started

### Installation

```zsh
npm install @namesake/tiptap-extensions
```

## `Steps`

To use steps, import `StepsKit` from `@namesake/tiptap-extensions`.

In order to insert and use steps, one or more nodes within your document need to accept the `"steps"` [content type](https://tiptap.dev/docs/editor/core-concepts/schema#content).

```tsx
import { StepsKit } from "@namesake/tiptap-extensions";
import Document from "@tiptap/extension-document";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        document: false,
      }),
      Document.extend({
        // Change from "block+" (default)
        content: "(block | steps)+", 
      }),
      // Pass in the steps extensions
      StepsKit
    ],
    content: "Hello world",
  });

  return <EditorContent editor={editor} />;
};

export default Editor;
```

### Styling

If you want the steps to look like the example, add this CSS to your app:

```css
ol[data-type="steps"] {
  counter-reset: steps;
  display: flex;
  flex-direction: column;

  &:not(:first-child) {
    margin-top: 1.5rem;
  }
}

li[data-type="step-item"] {
  padding: 0;
  counter-increment: steps;
  display: grid;
  column-gap: 1rem;
  grid-template-columns: 32px 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "number title"
    "line content";

  &::before {
    all: unset;
    width: 100%;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    grid-area: number;
    content: counter(steps);
    background-color: #00000017;
  }

  &::after {
    grid-area: line;
    width: 2px;
    height: 100%;
    margin-inline: auto;
    background-color: #0000000F;
    content: "";
  }

  &:last-child::after {
    visibility: hidden;
  }

  &:last-child div[data-type="step-content"] {
    padding-bottom: 0.75rem;
  }
}

div[data-type="step-title"] {
  grid-area: title;
  font-size: 2rem;
  font-weight: medium;
}

div[data-type="step-content"] {
  grid-area: content;
  padding-block-end: 1.5rem;
}
```

### Placeholders

If you want to display placeholder text for the title or description, add the [Tiptap Placeholder extension](https://tiptap.dev/docs/editor/extensions/functionality/placeholder):

```zsh
npm install @tiptap/extension-placeholder
```

Then add it to your editor config:

```tsx
import Placeholder from "@tiptap/extension-placeholder";

const Editor = () => {
  const editor = useEditor({
    extensions: [
      // ...other document extensions
      Placeholder.configure({
        includeChildren: true,
        showOnlyCurrent: false, 
        placeholder: ({ node }) => {
          // Return different placeholders depending on node type
          if (node.type.name === "stepTitle") {
            return "Add a title…";
          }
    
          if (node.type.name === "stepContent") {
            return "Add instructions…";
          }
    
          return "Write something…";
        },
      }),
      // Pass in the steps extensions
      StepsKit
    ]
  });

  return <EditorContent editor={editor} />;
};

export default Editor;
```

The placeholder is unstyled by default, so be sure to add CSS styles:

```css
div[data-type='step-title'].is-empty::before,
div[data-type='step-content'].is-empty::before {
  content: attr(data-placeholder);
  color: #00000050;
  float: left;
  height: 0;
  pointer-events: none;
}
```

Read more about the [Tiptap placeholder extension](https://tiptap.dev/docs/editor/extensions/functionality/placeholder).


### Commands

Just as with other Tiptap extensions, the `Steps` extension comes with [commands](https://tiptap.dev/docs/editor/api/commands) that you can chain together when working within Tiptap.

| Command | Description | Keyboard Shortcut |
|---------|-------------|-------------------|
| `toggleSteps` | Toggles between steps and text content. When inside a steps list, removes selected steps. When outside, creates new steps from selected content. | `Cmd/Ctrl-Alt-s` |
| `insertStep` | Insert a new step. Accepts `options`:  `{ title?: string; content?: JSONContent[]; before?: boolean }`. If `before` is true, inserts before the current step; otherwise, inserts after. | - |
| `removeStep` | Remove the current step, converting its content to regular text. Preserves the step's title as a heading if present. | - |

These commands can be used to create toolbar buttons which toggle the state of the steps component on or off.

```tsx
editor.chain().focus().toggleSteps().run()
```

## `Disclosures`

To use disclosures, import `DisclosuresKit` from `@namesake/tiptap-extensions`.

```tsx
import { DisclosuresKit } from "@namesake/tiptap-extensions";
import Document from "@tiptap/extension-document";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      DisclosuresKit
    ],
    content: "Hello world",
  });

  return <EditorContent editor={editor} />;
};

export default Editor;
```

### Commands

Just as with other Tiptap extensions, the `Disclosure` extension comes with [commands](https://tiptap.dev/docs/editor/api/commands) that you can chain together when working within Tiptap.

| Command | Description | Keyboard Shortcut |
|---------|-------------|-------------------|
| `toggleDisclosures` | Toggles between a disclosure and text content. When inside a disclosure group, removes selected disclosure items. When outside, creates new disclosure items from selected content. | `Cmd/Ctrl-Alt-d` |
| `insertDisclosure` | Insert a new disclosure item. Accepts `options`:  `{ title?: string; content?: JSONContent[]; before?: boolean }`. If `before` is true, inserts before the current step; otherwise, inserts after. | - |
| `removeDisclosure` | Remove the current disclosure item, converting its content to regular text. Preserves the disclosure's title as a heading if present. | - |

These commands can be used to create toolbar buttons which toggle the state of the disclosure component on or off.

```tsx
editor.chain().focus().toggleDisclosures().run()
```