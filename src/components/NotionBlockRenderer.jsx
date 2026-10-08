import { useState } from "react";
import { Link } from "react-router-dom";
import SubPageCard from "./SubPageCard";
import { slugifyHeading, slugify } from "../utils/slugify";

// Audio file detection regex supporting Notion AWS S3 query parameters
const AUDIO_REGEX = /\.(mp3|wav|m4a|aac)(\?.*)?$/i;

function AudioPlayerBlock({ audioUrl }) {
  return (
    <div className="my-5 w-full max-w-xl mx-auto p-4 rounded-2xl bg-pink-50/60 border border-pink-200/70 shadow-sm flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-medium text-pink-700">
        <span>🎵 Audio Track</span>
      </div>
      <audio
        controls
        preload="metadata"
        className="w-full h-10 accent-pink-500"
        src={audioUrl}
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

// Notion color mappings for text and background highlights
const NOTION_COLOR_MAP = {
  // Text colors
  gray: "text-slate-500",
  brown: "text-amber-800",
  orange: "text-orange-600",
  yellow: "text-amber-600",
  green: "text-emerald-600",
  blue: "text-blue-600",
  purple: "text-purple-600",
  pink: "text-pink-600",
  red: "text-red-600",

  // Highlight backgrounds
  gray_background: "bg-slate-200/80 text-slate-900 px-1.5 py-0.5 rounded",
  brown_background: "bg-amber-100 text-amber-950 px-1.5 py-0.5 rounded",
  orange_background: "bg-orange-100 text-orange-950 px-1.5 py-0.5 rounded",
  yellow_background: "bg-yellow-100 text-yellow-950 px-1.5 py-0.5 rounded",
  green_background: "bg-emerald-100 text-emerald-950 px-1.5 py-0.5 rounded",
  blue_background: "bg-blue-100 text-blue-950 px-1.5 py-0.5 rounded",
  purple_background: "bg-purple-100 text-purple-950 px-1.5 py-0.5 rounded",
  pink_background: "bg-pink-100 text-pink-950 px-1.5 py-0.5 rounded",
  red_background: "bg-red-100 text-red-950 px-1.5 py-0.5 rounded",
};

// Helper to render Notion rich text array with annotations and links
export function NotionRichText({ richText }) {
  if (!richText || !Array.isArray(richText) || richText.length === 0) {
    return null;
  }

  return (
    <>
      {richText.map((segment, idx) => {
        let content = segment.plain_text || segment.text?.content || "";
        if (!content) return null;

        const annotations = segment.annotations || {};
        let element = <span key={idx}>{content}</span>;

        // Code
        if (annotations.code) {
          element = (
            <code
              key={idx}
              className="bg-ink-100/60 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono font-medium"
            >
              {content}
            </code>
          );
        }

        // Bold
        if (annotations.bold) {
          element = <strong key={idx} className="font-bold text-inherit">{element}</strong>;
        }

        // Italic
        if (annotations.italic) {
          element = <em key={idx} className="italic text-inherit">{element}</em>;
        }

        // Strikethrough
        if (annotations.strikethrough) {
          element = <del key={idx} className="line-through">{element}</del>;
        }

        // Underline
        if (annotations.underline) {
          element = <u key={idx} className="underline underline-offset-4 decoration-current">{element}</u>;
        }

        // Color & background highlight
        if (annotations.color && annotations.color !== "default") {
          const colorClass = NOTION_COLOR_MAP[annotations.color] || "";
          element = (
            <span key={idx} className={`inline-annotation-color ${colorClass}`}>
              {element}
            </span>
          );
        }

        // Link
        const href = segment.href || segment.text?.link?.url;
        if (href) {
          if (AUDIO_REGEX.test(href)) {
            element = (
              <AudioPlayerBlock key={idx} audioUrl={href} />
            );
          } else {
            element = (
              <a
                key={idx}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mint-600 underline underline-offset-2 decoration-mint-300 hover:text-mint-700 hover:decoration-mint-500 transition-colors"
              >
                {element}
              </a>
            );
          }
        }

        return element;
      })}
    </>
  );
}

// Extract plain text string from rich_text array
function getRichTextString(richText) {
  if (!richText || !Array.isArray(richText)) return "";
  return richText.map((t) => t.plain_text || t.text?.content || "").join("");
}

// Notion Official Code Block with language tag and clipboard copy
function NotionCodeBlock({ block }) {
  const [copied, setCopied] = useState(false);
  const lang = block.code?.language || "plain text";
  const codeText = getRichTextString(block.code?.rich_text);
  const caption = getRichTextString(block.code?.caption);

  const handleCopy = () => {
    if (!codeText) return;
    navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="notion-code-block my-7 rounded-xl overflow-hidden shadow-sm border border-ink-300/30 bg-ink-950 font-mono text-sm">
      <div className="bg-ink-900/90 px-4 py-2 flex items-center justify-between text-xs text-ink-300 border-b border-ink-800">
        <span className="font-semibold text-mint-400 lowercase tracking-wide font-mono">
          {lang}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-ink-800/80 hover:bg-ink-700/80 text-ink-200 hover:text-white transition-colors duration-150 text-[11px] font-sans font-medium focus:outline-none"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <span className="text-mint-400 font-bold">✓</span>
              <span className="text-mint-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 sm:p-5 overflow-x-auto text-cream leading-relaxed text-[13px] sm:text-sm whitespace-pre">
        <code>{codeText}</code>
      </pre>
      {caption && (
        <div className="bg-ink-900/40 px-4 py-2 text-xs text-ink-400 italic font-sans border-t border-ink-800/60">
          {caption}
        </div>
      )}
    </div>
  );
}

// Notion Official Table Block (table and table_row blocks)
function NotionTableBlock({ block }) {
  const tableData = block.table || {};
  const hasColHeader = Boolean(tableData.has_column_header);
  const hasRowHeader = Boolean(tableData.has_row_header);
  const rows = block.children?.filter((b) => b.type === "table_row") || [];

  if (rows.length === 0) return null;

  return (
    <div className="notion-table-wrapper my-7 w-full overflow-x-auto rounded-xl border border-ink-200/80 shadow-sm bg-white">
      <table className="w-full border-collapse text-left text-sm sm:text-base">
        <tbody>
          {rows.map((rowBlock, rowIndex) => {
            const cells = rowBlock.table_row?.cells || [];
            const isHeaderRow = hasColHeader && rowIndex === 0;

            return (
              <tr
                key={rowBlock.id || rowIndex}
                className={`${isHeaderRow ? "bg-ink-50/80 font-semibold text-ink-900" : "hover:bg-ink-50/40 transition-colors"} border-b border-ink-200/60 last:border-b-0`}
              >
                {cells.map((cellRichText, colIndex) => {
                  const CellTag = isHeaderRow || (hasRowHeader && colIndex === 0) ? "th" : "td";

                  return (
                    <CellTag
                      key={colIndex}
                      className={`px-4 py-3 border-r border-ink-200/50 last:border-r-0 leading-relaxed align-top ${
                        hasRowHeader && colIndex === 0 && !isHeaderRow
                          ? "font-medium bg-ink-50/40 text-ink-800"
                          : ""
                      }`}
                    >
                      <NotionRichText richText={cellRichText} />
                    </CellTag>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Notion Official Database View Block (List View and Table View switcher)
function NotionDatabaseViewBlock({ block, categorySlug }) {
  const [viewMode, setViewMode] = useState("list"); // "list" | "table"
  const title = block.child_database?.title || "Database";
  const items = block.child_database?.items || [];

  return (
    <div className="notion-database-view my-8 rounded-2xl border border-ink-200/80 bg-white overflow-hidden shadow-sm">
      {/* Notion Database Header */}
      <div className="px-5 py-3.5 bg-ink-50/70 border-b border-ink-200/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🗃️</span>
          <h4 className="font-semibold text-ink-900 text-sm sm:text-base">
            {title}
          </h4>
          <span className="text-[11px] font-bold text-mint-700 bg-mint-100/70 px-2 py-0.5 rounded-full">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </div>

        {/* View Switcher Tabs (List view / Table view) */}
        <div className="flex items-center p-0.5 bg-ink-200/60 rounded-lg text-xs font-medium text-ink-600">
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              viewMode === "list"
                ? "bg-white text-ink-900 shadow-sm font-semibold"
                : "text-ink-600 hover:text-ink-900"
            }`}
          >
            <span>☰</span>
            <span>List</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              viewMode === "table"
                ? "bg-white text-ink-900 shadow-sm font-semibold"
                : "text-ink-600 hover:text-ink-900"
            }`}
          >
            <span>▦</span>
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* View Content */}
      {items.length === 0 ? (
        <div className="p-8 text-center text-sm text-ink-400 italic">
          No records found in this database view.
        </div>
      ) : viewMode === "list" ? (
        /* Notion List View */
        <div className="divide-y divide-ink-100">
          {items.map((item) => {
            const itemCat = item.categorySlug || categorySlug || "post";
            const itemUrl = `/${itemCat}/${item.slug}`;

            return (
              <div
                key={item.id}
                className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-mint-50/20 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-base shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                    📄
                  </span>
                  <Link
                    to={itemUrl}
                    className="font-medium text-ink-900 hover:text-mint-600 transition-colors text-sm sm:text-base truncate group-hover:underline underline-offset-2"
                  >
                    {item.title}
                  </Link>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 text-xs self-start sm:self-auto pl-7 sm:pl-0">
                  {item.category && (
                    <span className="badge-mint text-[11px] py-0.5 px-2">
                      {item.category}
                    </span>
                  )}
                  {item.date && (
                    <span className="text-ink-400 text-xs">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Notion Table View */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-ink-50/40 text-xs font-semibold text-ink-500 uppercase tracking-wider border-b border-ink-100">
                <th className="px-5 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {items.map((item) => {
                const itemCat = item.categorySlug || categorySlug || "post";
                const itemUrl = `/${itemCat}/${item.slug}`;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-mint-50/20 transition-colors group"
                  >
                    <td className="px-5 py-3 font-medium text-ink-900">
                      <Link
                        to={itemUrl}
                        className="hover:text-mint-600 transition-colors flex items-center gap-2 group-hover:underline underline-offset-2"
                      >
                        <span className="text-sm">📄</span>
                        <span>{item.title}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-600 text-xs">
                      {item.category ? (
                        <span className="badge-mint text-[11px] py-0.5 px-2">
                          {item.category}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-500 text-xs">
                      {item.tags && item.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] bg-ink-100 text-ink-600 px-1.5 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-ink-400 whitespace-nowrap">
                      {item.date
                        ? new Date(item.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function NotionBlockRenderer({
  blocks = [],
  categorySlug = "",
  parentSlug = "",
}) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  // Pre-group consecutive list items for valid semantic HTML (<ul>, <ol>, and to-do groups)
  const groupedElements = [];
  let currentList = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === "bulleted_list_item") {
        groupedElements.push({
          type: "bulleted_list_group",
          id: `list-group-${currentList.items[0].id}`,
          items: currentList.items,
        });
      } else if (currentList.type === "numbered_list_item") {
        groupedElements.push({
          type: "numbered_list_group",
          id: `list-group-${currentList.items[0].id}`,
          items: currentList.items,
        });
      } else if (currentList.type === "to_do") {
        groupedElements.push({
          type: "to_do_group",
          id: `todo-group-${currentList.items[0].id}`,
          items: currentList.items,
        });
      }
      currentList = null;
    }
  };

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type === "bulleted_list_item") {
      if (currentList && currentList.type === "bulleted_list_item") {
        currentList.items.push(block);
      } else {
        flushList();
        currentList = { type: "bulleted_list_item", items: [block] };
      }
    } else if (block.type === "numbered_list_item") {
      if (currentList && currentList.type === "numbered_list_item") {
        currentList.items.push(block);
      } else {
        flushList();
        currentList = { type: "numbered_list_item", items: [block] };
      }
    } else if (block.type === "to_do") {
      if (currentList && currentList.type === "to_do") {
        currentList.items.push(block);
      } else {
        flushList();
        currentList = { type: "to_do", items: [block] };
      }
    } else {
      flushList();
      groupedElements.push(block);
    }
  }
  flushList();

  return (
    <div className="notion-blocks-flow space-y-2">
      {groupedElements.map((item, idx) => {
        // Grouped bulleted list (Official Notion style with nested children)
        if (item.type === "bulleted_list_group") {
          return (
            <ul key={item.id} className="list-disc pl-6 my-4 space-y-2 text-inherit text-[1.25rem]">
              {item.items.map((b) => (
                <li key={b.id} className="leading-relaxed pl-1 marker:text-mint-500">
                  <NotionRichText richText={b.bulleted_list_item?.rich_text} />
                  {b.children && b.children.length > 0 && (
                    <div className="mt-1">
                      <NotionBlockRenderer
                        blocks={b.children}
                        categorySlug={categorySlug}
                        parentSlug={parentSlug}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          );
        }

        // Grouped numbered list (Official Notion style with nested children)
        if (item.type === "numbered_list_group") {
          return (
            <ol
              key={item.id}
              className="list-decimal pl-6 my-4 space-y-2 text-inherit text-[1.25rem]"
            >
              {item.items.map((b) => (
                <li key={b.id} className="leading-relaxed pl-1 marker:font-medium marker:text-mint-600">
                  <NotionRichText richText={b.numbered_list_item?.rich_text} />
                  {b.children && b.children.length > 0 && (
                    <div className="mt-1">
                      <NotionBlockRenderer
                        blocks={b.children}
                        categorySlug={categorySlug}
                        parentSlug={parentSlug}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ol>
          );
        }

        // Grouped to-do list (Official Notion style with nested children)
        if (item.type === "to_do_group") {
          return (
            <div key={item.id} className="my-4 space-y-2 text-[1.25rem] text-inherit">
              {item.items.map((b) => {
                const checked = Boolean(b.to_do?.checked);
                return (
                  <div key={b.id} className="space-y-1">
                    <div className="flex items-start gap-3">
                      <div className="pt-1.5 shrink-0 flex items-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          readOnly
                          className="w-4 h-4 rounded border-ink-300 text-mint-600 focus:ring-mint-500 cursor-default accent-mint-600"
                        />
                      </div>
                      <div className={`leading-relaxed flex-1 ${checked ? "line-through text-ink-400" : "text-inherit"}`}>
                        <NotionRichText richText={b.to_do?.rich_text} />
                      </div>
                    </div>
                    {b.children && b.children.length > 0 && (
                      <div className="pl-7 mt-1">
                        <NotionBlockRenderer
                          blocks={b.children}
                          categorySlug={categorySlug}
                          parentSlug={parentSlug}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }

        // Individual block types
        const block = item;
        const blockId = block.id || `notion-blk-${idx}`;

        switch (block.type) {
          case "paragraph": {
            const richText = block.paragraph?.rich_text;
            if (!richText || richText.length === 0) {
              return <div key={blockId} className="h-4" />;
            }

            const firstHref = richText[0]?.href || richText[0]?.text?.link?.url;
            const plainText = getRichTextString(richText).trim();
            const directAudioUrl =
              (richText.length === 1 && firstHref && AUDIO_REGEX.test(firstHref))
                ? firstHref
                : (AUDIO_REGEX.test(plainText) ? plainText : null);

            if (directAudioUrl) {
              return <AudioPlayerBlock key={blockId} audioUrl={directAudioUrl} />;
            }

            return (
              <p
                key={blockId}
                className="mb-6 leading-[1.85] text-[1.25rem] text-inherit"
              >
                <NotionRichText richText={richText} />
              </p>
            );
          }

          case "heading_1": {
            const richText = block.heading_1?.rich_text;
            const text = getRichTextString(richText);
            const id = slugifyHeading(text);
            return (
              <h1
                key={blockId}
                id={id}
                className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-8 mb-4 text-ink-900 leading-tight scroll-mt-24 group relative"
              >
                <span>
                  <NotionRichText richText={richText} />
                </span>
                <a
                  href={`#${id}`}
                  className="opacity-0 group-hover:opacity-100 ml-2 text-mint-500 hover:text-mint-600 transition-opacity text-base font-sans font-normal inline-block select-none"
                  aria-label={`Link to section: ${text}`}
                >
                  #
                </a>
              </h1>
            );
          }

          case "heading_2": {
            const richText = block.heading_2?.rich_text;
            const text = getRichTextString(richText);
            const id = slugifyHeading(text);
            return (
              <h2
                key={blockId}
                id={id}
                className="text-xl sm:text-2xl md:text-3xl font-bold mt-7 mb-3 text-ink-800 leading-tight scroll-mt-24 group relative"
              >
                <span>
                  <NotionRichText richText={richText} />
                </span>
                <a
                  href={`#${id}`}
                  className="opacity-0 group-hover:opacity-100 ml-2 text-mint-500 hover:text-mint-600 transition-opacity text-base font-sans font-normal inline-block select-none"
                  aria-label={`Link to section: ${text}`}
                >
                  #
                </a>
              </h2>
            );
          }

          case "heading_3": {
            const richText = block.heading_3?.rich_text;
            const text = getRichTextString(richText);
            const id = slugifyHeading(text);
            return (
              <h3
                key={blockId}
                id={id}
                className="text-lg sm:text-xl md:text-2xl font-semibold mt-6 mb-2 text-ink-700 leading-snug scroll-mt-24 group relative"
              >
                <span>
                  <NotionRichText richText={richText} />
                </span>
                <a
                  href={`#${id}`}
                  className="opacity-0 group-hover:opacity-100 ml-2 text-mint-500 hover:text-mint-600 transition-opacity text-sm font-sans font-normal inline-block select-none"
                  aria-label={`Link to subsection: ${text}`}
                >
                  #
                </a>
              </h3>
            );
          }

          case "toggle": {
            const richText = block.toggle?.rich_text;
            return (
              <details
                key={blockId}
                className="notion-toggle my-2.5 group open:mb-3"
              >
                <summary className="cursor-pointer font-medium text-[1.25rem] text-inherit select-none flex items-start gap-2 list-none focus:outline-none py-1 hover:bg-black/[0.02] rounded px-1 -mx-1 transition-colors">
                  <span className="inline-flex items-center justify-center w-5 h-6 text-xs text-ink-500 group-open:rotate-90 transition-transform duration-150 shrink-0 select-none">
                    ▶
                  </span>
                  <div className="leading-relaxed flex-1">
                    <NotionRichText richText={richText} />
                  </div>
                </summary>
                {block.children && block.children.length > 0 && (
                  <div className="pl-7 mt-1 space-y-1 border-l-2 border-mint-200/50">
                    <NotionBlockRenderer
                      blocks={block.children}
                      categorySlug={categorySlug}
                      parentSlug={parentSlug}
                    />
                  </div>
                )}
              </details>
            );
          }

          case "quote": {
            return (
              <blockquote
                key={blockId}
                className="border-l-4 border-mint-500/80 pl-5 py-2 my-6 bg-mint-50/40 rounded-r-lg italic text-[1.25rem] leading-relaxed text-inherit shadow-none"
              >
                <NotionRichText richText={block.quote?.rich_text} />
                {block.children && block.children.length > 0 && (
                  <div className="mt-2 not-italic space-y-1">
                    <NotionBlockRenderer
                      blocks={block.children}
                      categorySlug={categorySlug}
                      parentSlug={parentSlug}
                    />
                  </div>
                )}
              </blockquote>
            );
          }

          case "callout": {
            const icon = block.callout?.icon;
            const emoji = icon?.type === "emoji" ? icon.emoji : null;
            const iconUrl = icon?.file?.url || icon?.external?.url;
            return (
              <div
                key={blockId}
                className="my-6 flex items-start gap-3.5 p-4 sm:p-5 rounded-xl border border-mint-200/60 bg-mint-50/40 shadow-sm"
              >
                {emoji ? (
                  <span className="text-2xl shrink-0 select-none leading-none pt-0.5">{emoji}</span>
                ) : iconUrl ? (
                  <img src={iconUrl} alt="Callout icon" className="w-6 h-6 shrink-0 object-contain pt-0.5" />
                ) : (
                  <span className="text-2xl shrink-0 select-none leading-none pt-0.5">💡</span>
                )}
                <div className="text-inherit text-[1.2rem] leading-relaxed flex-1 min-w-0">
                  <NotionRichText richText={block.callout?.rich_text} />
                  {block.children && block.children.length > 0 && (
                    <div className="mt-3">
                      <NotionBlockRenderer
                        blocks={block.children}
                        categorySlug={categorySlug}
                        parentSlug={parentSlug}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          }

          case "code": {
            return <NotionCodeBlock key={blockId} block={block} />;
          }

          case "table": {
            return <NotionTableBlock key={blockId} block={block} />;
          }

          case "child_database": {
            return (
              <NotionDatabaseViewBlock
                key={blockId}
                block={block}
                categorySlug={categorySlug}
                parentSlug={parentSlug}
              />
            );
          }

          case "to_do": {
            const checked = Boolean(block.to_do?.checked);
            return (
              <div key={blockId} className="my-2 space-y-1 text-[1.25rem] text-inherit">
                <div className="flex items-start gap-3">
                  <div className="pt-1.5 shrink-0 flex items-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="w-4 h-4 rounded border-ink-300 text-mint-600 focus:ring-mint-500 cursor-default accent-mint-600"
                    />
                  </div>
                  <div className={`leading-relaxed flex-1 ${checked ? "line-through text-ink-400" : "text-inherit"}`}>
                    <NotionRichText richText={block.to_do?.rich_text} />
                  </div>
                </div>
                {block.children && block.children.length > 0 && (
                  <div className="pl-7 mt-1">
                    <NotionBlockRenderer
                      blocks={block.children}
                      categorySlug={categorySlug}
                      parentSlug={parentSlug}
                    />
                  </div>
                )}
              </div>
            );
          }

          case "divider": {
            return (
              <hr key={blockId} className="border-0 border-t border-ink-200/70 my-8" />
            );
          }

          // STRICTLY INLINE IMAGE BLOCK
          case "image": {
            const imgData = block.image;
            const url = imgData?.file?.url || imgData?.external?.url || "";
            if (!url) return null;
            const caption =
              imgData.caption?.map((c) => c.plain_text || c.text?.content || "").join("") || "";
            return (
              <figure key={blockId} className="my-8 w-full flex flex-col items-center">
                <img
                  src={url}
                  alt={caption || "Post media"}
                  loading="lazy"
                  className="w-full max-h-[650px] object-contain rounded-2xl shadow-sm border border-pink-100/50"
                />
                {caption && (
                  <figcaption className="mt-2.5 text-center text-xs text-ink-500 font-sans italic max-w-xl">
                    {caption}
                  </figcaption>
                )}
              </figure>
            );
          }

          // VIDEO BLOCK
          case "video": {
            const videoData = block.video;
            const url = videoData?.file?.url || videoData?.external?.url || "";
            if (!url) return null;
            return (
              <div key={blockId} className="my-7 w-full overflow-hidden rounded-2xl shadow-md bg-black/5">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full max-h-[500px] object-contain mx-auto"
                  src={url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            );
          }

          // PDF BLOCK
          case "pdf": {
            const pdfData = block.pdf;
            const url = pdfData?.file?.url || pdfData?.external?.url || "";
            if (!url) return null;
            return (
              <div key={blockId} className="my-7 w-full rounded-2xl overflow-hidden border border-pink-200/60 shadow-sm bg-white">
                <div className="bg-pink-50/80 px-4 py-2 border-b border-pink-100 flex items-center justify-between text-xs text-gray-600 font-medium">
                  <span>📄 Document Preview</span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:underline"
                  >
                    Download / Full View ↗
                  </a>
                </div>
                <iframe
                  src={`${url}#toolbar=1`}
                  className="w-full h-[600px] border-none"
                  title="PDF Preview"
                />
              </div>
            );
          }

          // AUDIO BLOCK
          case "audio": {
            const audioData = block.audio;
            const url = audioData?.file?.url || audioData?.external?.url || "";
            if (!url) return null;
            return <AudioPlayerBlock key={blockId} audioUrl={url} />;
          }

          // FILE BLOCK
          case "file": {
            const fileData = block.file;
            const url = fileData?.file?.url || fileData?.external?.url || "";
            const name = fileData?.name || "Download file";
            if (!url) return null;
            if (AUDIO_REGEX.test(url)) {
              return <AudioPlayerBlock key={blockId} audioUrl={url} />;
            }
            return (
              <div key={blockId} className="my-6">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-mint-600 hover:bg-mint-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
                >
                  <span>📁 {name}</span>
                </a>
              </div>
            );
          }

          // EMBED BLOCK
          case "embed": {
            const url = block.embed?.url;
            if (!url) return null;
            if (AUDIO_REGEX.test(url)) {
              return <AudioPlayerBlock key={blockId} audioUrl={url} />;
            }
            return (
              <div key={blockId} className="my-7 w-full overflow-hidden rounded-2xl shadow-sm border border-ink-300/30">
                <iframe
                  src={url}
                  className="w-full h-[450px] border-none"
                  title="Embedded content"
                  loading="lazy"
                />
              </div>
            );
          }

          // CHILD_PAGE BLOCK: Navigable sub-route card
          case "child_page": {
            const title = block.child_page?.title || "Sub-page";
            const childSlug = block.child_page?.slug || slugify(title);
            const cover =
              block.child_page?.cover ||
              block.child_page?.coverImage?.fields?.file?.url ||
              (typeof block.child_page?.coverImage === "string" ? block.child_page.coverImage : null) ||
              null;
            const icon =
              block.child_page?.icon?.emoji ||
              block.child_page?.icon?.external?.url ||
              block.child_page?.icon?.file?.url ||
              (typeof block.child_page?.icon === "string" ? block.child_page.icon : null) ||
              block.icon?.emoji ||
              block.icon?.external?.url ||
              null;
            const excerpt = block.child_page?.excerpt || null;
            return (
              <SubPageCard
                key={blockId}
                title={title}
                childSlug={childSlug}
                categorySlug={categorySlug}
                parentSlug={parentSlug}
                cover={cover}
                icon={icon}
                excerpt={excerpt}
              />
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
