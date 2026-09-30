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

export default function NotionBlockRenderer({
  blocks = [],
  categorySlug = "",
  parentSlug = "",
}) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  // Pre-group consecutive list items for valid semantic HTML (<ul> and <ol>)
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
    } else {
      flushList();
      groupedElements.push(block);
    }
  }
  flushList();

  return (
    <div className="notion-blocks-flow space-y-2">
      {groupedElements.map((item, idx) => {
        // Grouped bulleted list
        if (item.type === "bulleted_list_group") {
          return (
            <ul key={item.id} className="list-none pl-0 my-6 space-y-3">
              {item.items.map((b) => (
                <li
                  key={b.id}
                  className="pl-6 relative text-inherit text-[1.25rem] leading-relaxed before:content-['—'] before:absolute before:left-0 before:text-mint-500 before:font-bold"
                >
                  <NotionRichText richText={b.bulleted_list_item?.rich_text} />
                </li>
              ))}
            </ul>
          );
        }

        // Grouped numbered list
        if (item.type === "numbered_list_group") {
          return (
            <ol
              key={item.id}
              className="list-decimal pl-6 my-6 space-y-3 text-inherit text-[1.25rem]"
            >
              {item.items.map((b) => (
                <li key={b.id} className="pl-2 leading-relaxed">
                  <NotionRichText richText={b.numbered_list_item?.rich_text} />
                </li>
              ))}
            </ol>
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

          case "quote": {
            return (
              <blockquote
                key={blockId}
                className="border-l-4 border-mint-400 pl-6 py-4 my-8 bg-mint-50/80 rounded-r-xl italic text-lg leading-relaxed shadow-sm"
              >
                <NotionRichText richText={block.quote?.rich_text} />
              </blockquote>
            );
          }

          case "callout": {
            const icon = block.callout?.icon;
            const emoji = icon?.type === "emoji" ? icon.emoji : "💡";
            return (
              <div
                key={blockId}
                className="my-7 flex items-start gap-4 p-5 rounded-2xl border border-pink-200/60 bg-pink-50/50 shadow-sm"
              >
                <span className="text-2xl shrink-0 select-none">{emoji}</span>
                <div className="text-inherit text-[1.2rem] leading-relaxed">
                  <NotionRichText richText={block.callout?.rich_text} />
                </div>
              </div>
            );
          }

          case "code": {
            const lang = block.code?.language || "code";
            const codeText = getRichTextString(block.code?.rich_text);
            return (
              <div
                key={blockId}
                className="my-8 rounded-xl overflow-hidden shadow-card border border-ink-300/30"
              >
                <div className="bg-ink-800 px-4 py-2 flex items-center justify-between text-xs text-ink-300 font-mono border-b border-ink-700">
                  <span>{lang}</span>
                </div>
                <pre className="bg-ink-900 text-cream p-5 overflow-x-auto text-sm font-mono leading-relaxed">
                  <code>{codeText}</code>
                </pre>
              </div>
            );
          }

          case "to_do": {
            const checked = Boolean(block.to_do?.checked);
            return (
              <div key={blockId} className="flex items-center gap-3 my-2 text-[1.2rem] text-inherit">
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="rounded border-ink-300 text-mint-600 focus:ring-mint-500 w-4 h-4 cursor-default"
                />
                <span className={checked ? "line-through text-ink-400" : "text-inherit"}>
                  <NotionRichText richText={block.to_do?.rich_text} />
                </span>
              </div>
            );
          }

          case "divider": {
            return (
              <hr key={blockId} className="border-0 border-t border-ink-300/40 my-10" />
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
