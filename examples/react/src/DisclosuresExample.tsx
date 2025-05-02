import { Disclosures, Disclosure, DisclosureTitle, DisclosureContent } from '@namesakefyi/tiptap-extensions';
import { EditorProvider, useCurrentEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './App.css';
import { useState } from 'react';

function DisclosuresExample() {
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
        <summary data-type="disclosure-title">What… is your favourite color?</summary>
        <div data-type="disclosure-content">
          <p>Blue.</p>
        </div>
      </details>
    </aside>`;

  return (
    <div>
      <h2>Disclosures</h2>
      <EditorProvider
        slotBefore={<MenuBar />}
        extensions={extensions}
        content={content}
      ></EditorProvider>
    </div>
  );
}

export default DisclosuresExample;
