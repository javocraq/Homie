import React, { useCallback, useRef, useState } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { uploadImage } from '../adminQueries';
import './editor.css';

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const RichEditor: React.FC<Props> = ({ value, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Image.configure({ HTMLAttributes: { class: 'editor-img' } }),
      Table.configure({ resizable: true, HTMLAttributes: { class: 'editor-table' } }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? 'Escribe aquí…' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  React.useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="rounded-xl ring-1 ring-dark-gray/[0.12] bg-white overflow-hidden shadow-[0_1px_2px_rgba(40,40,40,0.04)]">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="editor-surface" />
    </div>
  );
};

const Toolbar: React.FC<{ editor: Editor }> = ({ editor }) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const addLink = useCallback(() => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL del enlace', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const triggerImageUpload = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleImageFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      try {
        setUploading(true);
        const url = await uploadImage(file, 'content');
        const alt = window.prompt('Texto alternativo (SEO)', '') ?? '';
        editor.chain().focus().setImage({ src: url, alt }).run();
      } catch (err) {
        console.error(err);
        window.alert('No se pudo subir la imagen. Inténtalo de nuevo.');
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  const addTable = useCallback(() => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-dark-gray/[0.08] bg-dark-gray/[0.02]">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFile}
      />

      <Group>
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Deshacer">↶</Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Rehacer">↷</Btn>
      </Group>

      <Sep />

      <Group>
        <Select
          value={
            editor.isActive('heading', { level: 2 })
              ? 'h2'
              : editor.isActive('heading', { level: 3 })
              ? 'h3'
              : editor.isActive('heading', { level: 4 })
              ? 'h4'
              : 'p'
          }
          onChange={(v) => {
            const chain = editor.chain().focus();
            if (v === 'p') chain.setParagraph().run();
            else chain.toggleHeading({ level: Number(v.slice(1)) as 2 | 3 | 4 }).run();
          }}
          options={[
            { value: 'p', label: 'Párrafo' },
            { value: 'h2', label: 'Título H2' },
            { value: 'h3', label: 'Subtítulo H3' },
            { value: 'h4', label: 'Encabezado H4' },
          ]}
        />
      </Group>

      <Sep />

      <Group>
        <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrita">
          <b>B</b>
        </Btn>
        <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Cursiva">
          <i>I</i>
        </Btn>
        <Btn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Subrayado">
          <u>U</u>
        </Btn>
        <Btn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Tachado">
          <span className="line-through">S</span>
        </Btn>
        <Btn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Código inline">
          {'<>'}
        </Btn>
      </Group>

      <Sep />

      <Group>
        <Btn
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Lista con viñetas"
        >
          •☰
        </Btn>
        <Btn
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Lista enumerada"
        >
          1.☰
        </Btn>
        <Btn
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Cita"
        >
          ❝
        </Btn>
      </Group>

      <Sep />

      <Group>
        <Btn
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Alinear izquierda"
        >
          ⇤
        </Btn>
        <Btn
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Centrar"
        >
          ⇔
        </Btn>
        <Btn
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Alinear derecha"
        >
          ⇥
        </Btn>
        <Btn
          active={editor.isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          title="Justificar"
        >
          ≡
        </Btn>
      </Group>

      <Sep />

      <Group>
        <Btn onClick={addLink} active={editor.isActive('link')} title="Enlace">🔗</Btn>
        <Btn onClick={triggerImageUpload} title={uploading ? 'Subiendo…' : 'Insertar imagen'}>
          {uploading ? '⏳' : '🖼'}
        </Btn>
        <Btn onClick={addTable} title="Insertar tabla">▦</Btn>
        <Btn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Separador"
        >
          ―
        </Btn>
      </Group>

      {editor.isActive('table') && (
        <>
          <Sep />
          <Group>
            <Btn onClick={() => editor.chain().focus().addColumnBefore().run()} title="Añadir columna antes">+⇠</Btn>
            <Btn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Añadir columna después">+⇢</Btn>
            <Btn onClick={() => editor.chain().focus().deleteColumn().run()} title="Borrar columna">−|</Btn>
            <Btn onClick={() => editor.chain().focus().addRowBefore().run()} title="Añadir fila antes">+⇡</Btn>
            <Btn onClick={() => editor.chain().focus().addRowAfter().run()} title="Añadir fila después">+⇣</Btn>
            <Btn onClick={() => editor.chain().focus().deleteRow().run()} title="Borrar fila">−―</Btn>
            <Btn onClick={() => editor.chain().focus().deleteTable().run()} title="Borrar tabla">✕</Btn>
          </Group>
        </>
      )}
    </div>
  );
};

const Group: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-0.5">{children}</div>
);

const Sep: React.FC = () => <div className="w-px h-6 bg-dark-gray/[0.1] mx-1" />;

type BtnProps = {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
};
const Btn: React.FC<BtnProps> = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`min-w-[32px] h-8 px-2 rounded-md text-[13px] flex items-center justify-center transition-colors ${
      active
        ? 'bg-key-green text-dark-gray font-semibold'
        : 'text-dark-gray/70 hover:text-dark-gray hover:bg-dark-gray/[0.06]'
    }`}
  >
    {children}
  </button>
);

type SelectProps = {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
};
const Select: React.FC<SelectProps> = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="h-8 rounded-md bg-white ring-1 ring-dark-gray/15 text-[12.5px] text-dark-gray/80 px-2 focus:outline-none focus:ring-key-green"
  >
    {options.map((o) => (
      <option key={o.value} value={o.value} className="bg-white text-dark-gray">
        {o.label}
      </option>
    ))}
  </select>
);

export default RichEditor;
