import type { ContentBlock } from "@/lib/document-templates/types";

export async function renderDocumentDocx(blocks: ContentBlock[]): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import("docx");

  const children = blocks.map((block) => {
    switch (block.type) {
      case "heading":
        return new Paragraph({ text: block.text, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 160 } });
      case "paragraph":
        return new Paragraph({
          children: block.text.split("\n").flatMap((line, i, arr) => {
            const run = new TextRun(line);
            return i < arr.length - 1 ? [run, new TextRun({ break: 1 })] : [run];
          }),
          spacing: { after: 200 },
          alignment: AlignmentType.JUSTIFIED
        });
      case "date-place":
        return new Paragraph({ text: block.text, alignment: AlignmentType.RIGHT, spacing: { after: 300 } });
      case "signature-line":
        return new Paragraph({
          spacing: { before: 500, after: 60 },
          border: { top: { style: BorderStyle.SINGLE, size: 6, color: "999999", space: 4 } },
          children: [new TextRun({ text: block.label, color: "666666", size: 18 })]
        });
      case "spacer":
      default:
        return new Paragraph({ text: "" });
    }
  });

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBlob(doc);
}
