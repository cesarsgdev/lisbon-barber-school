const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const csv = require("csv-parser");
const streamifier = require("streamifier");
const fs = require("fs");
const path = require("path");
const { PDFDocument } = require("pdf-lib");
const { encode } = require("uint8-to-base64");
const { PassThrough } = require("stream");
const fontkit = require("@pdf-lib/fontkit");
const JSZip = require("jszip");

// Endpoint to create a single certificate => POST /api/certificates
router.post("/", async (req, res) => {
  const { student } = req.body;
  const formPdfBytes = fs.readFileSync(
    path.join(__dirname, "..", "templates/certificate.pdf")
  );

  const fontBytes = fs.readFileSync(
    path.join(__dirname, "..", "fonts/permanent-marker.ttf")
  );

  const pdfDoc = await PDFDocument.load(formPdfBytes);

  pdfDoc.registerFontkit(fontkit);
  const permanentMarker = await pdfDoc.embedFont(fontBytes);

  const form = pdfDoc.getForm();

  const studentField = form.getTextField("student");
  studentField.setText(student);
  studentField.updateAppearances(permanentMarker);
  form.flatten();
  const pdfBytes = await pdfDoc.save();

  const base64 = encode(pdfBytes);
  res.status(200).json({ success: true, base64 });
});

// Endpoint to create bulk certificates => POST /api/certificates/bulk
router.post("/bulk", upload.single("list"), async (req, res) => {
  let students = [];
  const zip = new JSZip();
  await streamifier
    .createReadStream(req.file.buffer)
    .pipe(csv())
    .on("data", (data) => {
      students.push(data);
    })
    .on("end", async () => {});

  if (students.length > 50) {
    res.status(200).json({
      success: false,
      message: "The list is longer than 50 rows...",
    });
    return;
  }
  for (const student of students) {
    const formPdfBytes = fs.readFileSync(
      path.join(__dirname, "..", "templates/certificate.pdf")
    );

    const fontBytes = fs.readFileSync(
      path.join(__dirname, "..", "fonts/permanent-marker.ttf")
    );

    const pdfDoc = await PDFDocument.load(formPdfBytes);

    pdfDoc.registerFontkit(fontkit);
    const permanentMarker = await pdfDoc.embedFont(fontBytes);

    const form = pdfDoc.getForm();

    const studentField = form.getTextField("student");
    studentField.setText(`${student.First} ${student.Last}`);
    studentField.updateAppearances(permanentMarker);
    form.flatten();
    const pdfBytes = await pdfDoc.save();
    zip.file(`${student.First} ${student.Last}.pdf`, pdfBytes);
  }

  zip
    .generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    })
    .then(function (content) {
      const readStream = new PassThrough();
      readStream.end(content);

      res.set(
        "Content-disposition",
        "attachment; filename=listCertificates.zip"
      );
      res.set("Content-Type", "application/zip");

      readStream.pipe(res);
    });
});

module.exports = router;
