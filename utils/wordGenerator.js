import fs from "fs";
import path from "path";
import { Document, Packer } from "docx";

export async function generateWordFile(athlete, system, sport) {
  const templatePath = path.join(
    __dirname,
    `../public/templates/${sport.toLowerCase()}.docx`
  );
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template for sport "${sport}" not found.`);
  }

  // Load the template and modify it
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: `Athlete: ${athlete.name}`,
            bold: true,
          }),
          new Paragraph({
            text: `System: ${system.type} - ${system.calories} cal`,
          }),
          new Paragraph({
            text: `Sport: ${sport}`,
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const filePath = path.join(
    __dirname,
    `../public/athletes/${athlete.name}.docx`
  );
  fs.writeFileSync(filePath, buffer);

  return filePath;
}
