# Excel State-Wise Pricing Processor

A Node.js and Express web application that processes bulk county-level pricing spreadsheets (`.xlsx` / `.xls`) and converts them into organized, state-wise CSV files packaged into a single downloadable ZIP archive.

---

## 🚀 Features

- **File Upload Interface**: Simple web UI to upload Excel files.
- **Automated Data Extraction**: Reads county-wise pricing data across Tier 1 and Tier 3 services.
- **State-Wise Splitting**: Groups pricing records by US State Code (e.g., `AL.csv`, `TX.csv`, `FL.csv`).
- **Standardized CSV Format**: Outputs structured CSV columns (`S.No`, `Tier`, `State Code`, `FIPS Code`, `Service Code`, `Price`).
- **Dynamic ZIP Archiving**: Streams generated CSV files directly into a compressed ZIP file (`state_wise_pricing.zip`) on-the-fly.
- **Automatic Cleanup**: Removes temporary uploaded files from the server after processing.

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js](https://expressjs.com/)
- **File Uploads**: [Multer](https://github.com/expressjs/multer)
- **Excel Parsing**: [SheetJS (xlsx)](https://sheetjs.com/)
- **Archiving / Compression**: [Archiver](https://www.archiverjs.com/)
- **Template Engine**: [EJS](https://ejs.co/)

---

## 📁 Project Structure

```text
├── views/
│   └── excel.ejs          # Web UI upload form
├── uploads/               # Temporary storage for incoming files
├── index.js               # Main server logic and Excel parser
├── package.json           # Dependencies and scripts
└── README.md              # Project documentation
