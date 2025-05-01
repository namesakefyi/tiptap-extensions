import { Disclosures, Disclosure, DisclosureTitle, DisclosureContent } from '../../../';
import { EditorProvider, useCurrentEditor } from '@tiptap/react';
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
    StarterKit,
    Disclosures,
    Disclosure,
    DisclosureTitle,
    DisclosureContent,
  ];

  const content = `
    <aside data-type="disclosures">
      <details data-type="disclosure">
        <summary data-type="disclosure-title">Step one</summary>
        <div data-type="disclosure-content">
          <p>Pick a focus word, short phrase, or prayer that is firmly rooted in your belief system.</p>
        </div>
      </details>
      <details data-type="disclosure">
        <summary data-type="disclosure-title">Step two</summary>
        <div data-type="disclosure-content">
          <p>Sit quietly in a comfortable position.</p>
        </div>
      </details>
      <details data-type="disclosure">
        <summary data-type="disclosure-title">Step three</summary>
        <div data-type="disclosure-content">
          <p>Close your eyes.</p>
        </div>
      </details>
      <details data-type="disclosure">
        <summary data-type="disclosure-title">Step four</summary>
        <div data-type="disclosure-content">
          <p>Relax your muscles, progressing from your feet to your calves, thighs, abdomen, shoulders, head, and neck.</p>
        </div>
      </details>
      <details data-type="disclosure">
        <summary data-type="disclosure-title">Step five</summary>
        <div data-type="disclosure-content">
          <p>Breathe slowly and naturally, and as you do, say your focus word, sound phrase, or prayer silently to yourself as you exhale.</p>
        </div>
      </details>
    </aside>
    <p>&mdash; From <em>The Relaxation Response</em> by Herbert Benson</p>`;

  return (
    <div>
      <h1>Tiptap Disclosure Demo</h1>
      <EditorProvider
        slotBefore={<MenuBar />}
        extensions={extensions}
        content={content}
      ></EditorProvider>
    </div>
  );
}

export default App;
