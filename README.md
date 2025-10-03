# NSW Public Schools Dataset

A Next.js application to browse and search NSW Public Schools data from the official NSW Government API.

## Features

- 📊 **Data Display**: Clean table view with school information
- 🔍 **Search Functionality**: Filter by school name or suburb
- 📄 **Pagination**: Navigate through large datasets (20 records per page)
- 🎨 **Modern UI**: Built with TailwindCSS for a clean, responsive design
- ⚡ **Fast Loading**: Optimized for performance
- 📱 **Responsive**: Works on desktop and mobile devices

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS framework
- **Vercel** - Deployment platform

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment

This project is ready for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

Or deploy manually:
```bash
npm run build
npm start
```

## Data Source

This application fetches data from the NSW Government's official API:
- **API URL**: https://data.nsw.gov.au/data/dataset/78c10ea3-8d04-4c9c-b255-bbf8547e37e7/resource/b0026f18-2f23-4837-968c-959e5fb3311d/download/collections.json

## Project Structure

```
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Loading.tsx
│   ├── Pagination.tsx
│   ├── SchoolTable.tsx
│   └── SearchBar.tsx
├── types/
│   └── school.ts
└── package.json
```

## Features in Detail

### Search
- Real-time search by school name or suburb
- Case-insensitive matching
- Instant results as you type

### Table Display
- Responsive design that works on all screen sizes
- Sortable columns
- Clean, modern styling
- Clickable website links

### Pagination
- Navigate through large datasets
- Shows current page and total pages
- Previous/Next navigation
- Smart page number display

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.
=======
# nswpublicschool
