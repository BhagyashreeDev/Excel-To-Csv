import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ZipArchive } from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

const upload = multer({ dest: 'uploads/' });

// Service definitions mapped to column indices
const tier1Services = [
    { colIndex: 10, serviceCode: 'cos' },
    { colIndex: 11, serviceCode: 'cosl' },
    { colIndex: 12, serviceCode: 'tos' },
    { colIndex: 13, serviceCode: 'fs' },
    { colIndex: 14, serviceCode: 'ubd' },
    { colIndex: 15, serviceCode: 'EU' },
    { colIndex: 16, serviceCode: 'dlvs' },
    // { colIndex: 17, serviceCode: 'ms' },
    { colIndex: 18, serviceCode: 'dr' },
    { colIndex: 19, serviceCode: 'js' }
];
const tier3Services = [
    { colIndex: 21, serviceCode: 'cos' },
    { colIndex: 22, serviceCode: 'cosl' },
    { colIndex: 23, serviceCode: 'tos' },
    { colIndex: 24, serviceCode: 'fs' },
    { colIndex: 25, serviceCode: 'ubd' },
    { colIndex: 26, serviceCode: 'EU' },
    { colIndex: 27, serviceCode: 'dlvs' },
    // { colIndex: 28, serviceCode: 'ms' },
    { colIndex: 29, serviceCode: 'dr' },
    { colIndex: 30, serviceCode: 'js' }
];

app.get('/', (req, res) => {
    res.render('excel');
});

// end point
app.post('/upload-excel', upload.single('excelFile'), (req, res) => {
    // Good practice: check if the file was actually uploaded
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Fixed: using correct __dirname (two underscores)
    const filePath = path.join(__dirname, 'uploads', req.file.filename);

    try {
        // Read the book and sheet
        const workbook = XLSX.readFile(filePath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Reading the data as JSON
        // const data = XLSX.utils.sheet_to_json(worksheet);

        // res.json({
        //     message: 'Excel file uploaded successfully',
        //     data
        // });

        // 2. Parse sheet as a 2D array of rows
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        //   res.json({
        //     message: 'Excel file uploaded successfully',
        //     rows
        // });

        const stateData = {};

        // 3. Prepare CSV rows with header matching sample.csv
        // const csvRows = [
        //     ['S.No', 'Tier', 'State Code', 'FIPS Code', 'Service Code', 'Price']
        // ];

        for (let i = 2; i < rows.length; i++) {
            const row = rows[i];
            const stateCode = row[0] ? String(row[0].toUpperCase()).trim() : '';
            // const county = row[1] ? String(row[1].toLowerCase()).trim() : '';
            const fipsCode = row[4] ? String(row[4]).trim() : '';

            // Initialize state array if not already present
            if (!stateData[stateCode]) {
                stateData[stateCode] = [
                    ['S.No', 'Tier', 'State Code', 'FIPS Code', 'Service Code', 'Price']
                ];
            }

            const processTier = (tierNumber, serviceList) => {
                for (const svc of serviceList) {
                    let priceVal = row[svc.colIndex];

                    if (priceVal === undefined || priceVal === null || priceVal === '' || priceVal === '-') {
                        continue; // Skip services not available for this county
                    }
                    let price = String(priceVal).replace('$', '').trim();
                    const sNo = stateData[stateCode].length;

                    stateData[stateCode].push([
                        sNo,
                        tierNumber,
                        stateCode,
                        `"${fipsCode}"`, // quoted in case of commas/notes
                        svc.serviceCode,
                        price
                    ]);

                }
            };

            processTier(1, tier1Services);
            processTier(3, tier3Services);
        }
        // const csvContent = csvRows.map(r => r.join(',')).join('\n');

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="state_wise_pricing.zip"');
       
        // Zip file that has each state in it
        // Create zip archive and pipe directly to the response
        const archive = new ZipArchive({ zlib: { level: 9 } });
        archive.pipe(res);

        // Add each state's CSV to the zip file
        for (const [state, stateRows] of Object.entries(stateData)) {
            const csvContent = stateRows.map(r => r.join(',')).join('\n');
            // Creates AL.csv, FL.csv, etc., inside the zip
            archive.append(csvContent, { name: `${state}.csv` });
        }

        // Finalize the archive (completes the download)
        archive.finalize();

    } catch (error) {
        console.error('Error processing Excel file:', error);
        res.status(500).send('Error processing Excel file.');
    } finally {
        fs.unlink(filePath, () => { });
    }
});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});