import { StepsKit, DisclosuresKit } from '@namesake/tiptap-extensions';
import { EditorProvider, useCurrentEditor } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';
import './App.css';
import { useState } from 'react';

function App() {
  const MenuBar = () => {
    const { editor } = useCurrentEditor();
    const [isEditing, setIsEditing] = useState(editor?.isEditable);

    if (!editor) {
      return null;
    }

    const toggleEditing = () => {
      editor.setEditable(!editor.isEditable);
      setIsEditing(!isEditing);
    }

    return (
      <div className="control-group">
        <button onClick={toggleEditing}>
          Editing {isEditing ? 'ON' : 'OFF'}
        </button>
        {isEditing && (<div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleSteps().run()}
            disabled={!editor.can().chain().focus().toggleSteps().run()}
            className={editor.isActive('steps') ? 'is-active' : ''}
          >
            Toggle Steps
          </button>
          <button
            onClick={() => editor.chain().focus().insertStep().run()}
            disabled={!editor.can().chain().focus().insertStep().run()}
          >
            Insert Step
          </button>
          <button
            onClick={() => editor.chain().focus().insertStep({ before: true }).run()}
            disabled={!editor.can().chain().focus().insertStep({ before: true }).run()}
          >
            Insert Step Before
          </button>
          <button
            onClick={() => editor.chain().focus().removeStep().run()}
            disabled={!editor.can().chain().focus().removeStep().run()}
          >
            Remove Step
          </button>
        </div>)}
        {isEditing && (<div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleDisclosures().run()}
            disabled={!editor.can().chain().focus().toggleDisclosures().run()}
            className={editor.isActive('disclosures') ? 'is-active' : ''}
          >
            Toggle Disclosure Group
          </button>
          <button
            onClick={() => editor.chain().focus().insertDisclosure().run()}
            disabled={!editor.can().chain().focus().insertDisclosure().run()}
          >
            Insert Disclosure
          </button>
          <button
            onClick={() => editor.chain().focus().insertDisclosure({ before: true }).run()}
            disabled={!editor.can().chain().focus().insertDisclosure({ before: true }).run()}
          >
            Insert Disclosure Before
          </button>
          <button
            onClick={() => editor.chain().focus().removeDisclosure().run()}
            disabled={!editor.can().chain().focus().removeDisclosure().run()}
          >
            Remove Disclosure
          </button>
        </div>)}
      </div>
    );
  };

  const extensions = [
    StarterKit.configure({
      document: false,
    }),
    Document.extend({
      content: '(block | steps)+',
    }),
    Placeholder.configure({
      includeChildren: true,
      showOnlyCurrent: false,
      placeholder: ({ node }) => {
        if (node.type.name === "stepTitle") {
          return "Add a title…";
        }
  
        if (node.type.name === "stepContent") {
          return "Add instructions…";
        }
  
        return "Write something…";
      },
    }),
    StepsKit,
    DisclosuresKit,
  ];

  const content = `
    <ol data-type="steps">
      <li data-type="step-item">
        <div data-type="step-title">Step one</div>
        <div data-type="step-content">
          <p>Pick a focus word, short phrase, or prayer that is firmly rooted in your belief system.</p>
        </div>
      </li>
      <li data-type="step-item">
        <div data-type="step-title">Step two</div>
        <div data-type="step-content">
          <p>Sit quietly in a comfortable position.</p>
        </div>
      </li>
      <li data-type="step-item">
        <div data-type="step-title">Step three</div>
        <div data-type="step-content">
          <p>Close your eyes.</p>
        </div>
      </li>
      <li data-type="step-item">
        <div data-type="step-title">Step four</div>
        <div data-type="step-content">
          <p>Relax your muscles, progressing from your feet to your calves, thighs, abdomen, shoulders, head, and neck.</p>
        </div>
      </li>
      <li data-type="step-item">
        <div data-type="step-title">Step five</div>
        <div data-type="step-content">
          <p>Breathe slowly and naturally, and as you do, say your focus word, sound phrase, or prayer silently to yourself as you exhale.</p>
        </div>
      </li> 
      <li data-type="step-item">
        <div data-type="step-title">Step six</div>
        <div data-type="step-content">
          <p>Assume a passive attitude. Don't worry about how well you're doing. When other thoughts come to mind, simply say to yourself, "Oh well," and gently return to your repetition&hellip;</p>
        </div>
      </li>
    </ol>
    <p>&mdash; From <em>The Relaxation Response</em> by Herbert Benson</p>
    <p></p>
    <aside data-type="disclosures">
      <details data-type="disclosure">
        <summary data-type="disclosure-title">What… is your name?</summary>
        <div data-type="disclosure-content">
          <p>My name is Sir Lancelot of Camelot.</p>
        </div>
      </details>
      <details data-type="disclosure">
        <summary data-type="disclosure-title">What… is your quest?</summary>
        <div data-type="disclosure-content">
          <p>To seek the Holy Grail.</p>
        </div>
      </details>
      <details data-type="disclosure">
        <summary data-type="disclosure-title">What… is your favorite color?</summary>
        <div data-type="disclosure-content">
          <p>Blue.</p>
        </div>
      </details>
    </aside>`;

  return (
    <main className="container">
      <h1><code>@namesake/tiptap-extensions</code></h1>
      <EditorProvider
        slotBefore={<MenuBar />}
        extensions={extensions}
        content={content}
      ></EditorProvider>
    </main>
  );
};

export default App;
