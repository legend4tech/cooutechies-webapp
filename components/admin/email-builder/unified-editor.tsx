"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Blockquote from "@tiptap/extension-blockquote";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { useCallback, useState } from "react";
import { InsertImageDialog } from "./dialogs/insert-image-dialog";
import { InsertLinkDialog } from "./dialogs/insert-link-dialog";
import { InsertButtonDialog } from "./dialogs/insert-button-dialog";
import { EditorToolbar } from "./editor-toolbar";

interface UnifiedEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Simple button HTML - just a styled link
function createButtonHTML(
  text: string,
  url: string,
  bgColor: string,
  textColor: string
): string {
  return `<p style="text-align: center; margin: 32px 0;"><button href="${url}" style="display: inline-block; padding: 12px 36px; background-color: ${bgColor}; color: ${textColor}; border-radius: 10px; font-weight: 700; font-size: 18px; text-decoration: none; border: 2px solid ${bgColor};">${text}</button></p>`;
}

// Generate image HTML with configurable alignment
function createImageHTML(
  url: string,
  alt: string,
  alignment: "left" | "center" | "right"
): string {
  return `<p style="text-align: ${alignment}; margin: 24px 0;"><img src="${url}" alt="${alt}" style="max-width: 400px; max-height: 300px; width: auto; height: auto; display: inline-block; border-radius: 14px; border: 0;" /></p>`;
}

export function UnifiedEditor({
  content,
  onChange,
  placeholder = "Start writing your email...",
}: UnifiedEditorProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showButtonDialog, setShowButtonDialog] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        blockquote: false,
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: "tiptap-blockquote",
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: "tiptap-hr",
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      Image.configure({
        HTMLAttributes: {
          class: "tiptap-image",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "blockquote"],
      }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class: "tiptap-editor min-h-[400px] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const handleInsertImage = useCallback(
    (url: string, alt: string, alignment: "left" | "center" | "right") => {
      if (editor && url) {
        const imageHtml = createImageHTML(url, alt, alignment);
        editor.chain().focus().insertContent(imageHtml).run();
      }
      setShowImageDialog(false);
    },
    [editor]
  );

  const handleInsertLink = useCallback(
    (url: string, text: string) => {
      if (editor && url) {
        if (text) {
          editor
            .chain()
            .focus()
            .insertContent(`<a href="${url}">${text}</a>`)
            .run();
        } else {
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        }
      }
      setShowLinkDialog(false);
    },
    [editor]
  );

  const handleInsertButton = useCallback(
    (text: string, url: string, bgColor: string, textColor: string) => {
      if (editor && text && url) {
        const buttonHtml = createButtonHTML(text, url, bgColor, textColor);
        editor.chain().focus().insertContent(buttonHtml).run();
      }
      setShowButtonDialog(false);
    },
    [editor]
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="glass rounded-xl p-3 border-glow sticky top-0 z-10">
        <EditorToolbar
          editor={editor}
          onInsertImage={() => setShowImageDialog(true)}
          onInsertLink={() => setShowLinkDialog(true)}
          onInsertButton={() => setShowButtonDialog(true)}
        />
      </div>

      {/* Editor Content */}
      <div className="glass rounded-2xl border-glow p-6 md:p-8 min-h-125">
        <EditorContent editor={editor} />
      </div>

      {/* Dialogs */}
      <InsertImageDialog
        open={showImageDialog}
        onOpenChange={setShowImageDialog}
        onInsert={handleInsertImage}
      />
      <InsertLinkDialog
        open={showLinkDialog}
        onOpenChange={setShowLinkDialog}
        onInsert={handleInsertLink}
      />
      <InsertButtonDialog
        open={showButtonDialog}
        onOpenChange={setShowButtonDialog}
        onInsert={handleInsertButton}
      />
    </div>
  );
}
