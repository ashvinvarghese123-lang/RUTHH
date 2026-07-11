"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, Underline, List } from "lucide-react";

/**
 * A minimal contentEditable rich-text editor — enough for a journal
 * entry (bold, italic, underline, bullet lists) without pulling in a
 * heavy editor framework. Content is stored/exchanged as HTML.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Syncs external `value` changes (e.g. the AI Writer populating content for
  // the first time) into the DOM, but never while the user is actively
  // typing/focused in the editor — that would fight their cursor.
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  function exec(command: string) {
    document.execCommand(command, false);
    ref.current?.focus();
    handleInput();
  }

  function handleInput() {
    onChange(ref.current?.innerHTML ?? "");
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-card">
      <div className="flex items-center gap-1 border-b border-ink/10 px-3 py-2">
        <ToolbarButton onClick={() => exec("bold")} label="Bold">
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")} label="Italic">
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("underline")} label="Underline">
          <Underline size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => exec("insertUnorderedList")} label="Bullet list">
          <List size={15} />
        </ToolbarButton>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className="min-h-[220px] px-4 py-4 text-[15px] leading-relaxed text-text outline-none [&:empty]:before:text-ink/35 [&:empty]:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}

function ToolbarButton({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="rounded-lg p-1.5 text-ink/60 hover:bg-ink/5 hover:text-ink"
    >
      {children}
    </button>
  );
}
