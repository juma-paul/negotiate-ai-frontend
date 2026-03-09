# NegotiateAI Frontend

Real-time dashboard for the Multi-Agent Negotiation System.

Built for the Lanesurf Agent Engineer portfolio.

## Tech Stack
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Server-Sent Events** - Real-time updates

## Features
- Real-time negotiation visualization
- Multiple provider cards with live conversation updates
- Price comparison and savings display
- Responsive design

## Local Development

```bash
# Install dependencies
npm install

# Set backend URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run dev server
npm run dev
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (required)

## Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variable: `NEXT_PUBLIC_API_URL` = your Render backend URL
4. Deploy!
