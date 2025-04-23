Thank you for specifying your preferred sports: NFL, NBA, and MLB. Below is an updated Product Requirements Document (PRD) in Markdown format for BetSmart, a personal web app designed to identify profitable betting opportunities on DraftKings, using Supabase for the database and shadcn/ui for UI components. The PRD is tailored to focus on NFL, NBA, and MLB, ensuring the app prioritizes these sports for odds analysis, bet recommendations, and performance tracking. The document incorporates your preferences, maintains a concise and actionable structure, and outlines the product’s purpose, features, technical requirements, and implementation plan.
Product Requirements Document (PRD): BetSmart

1. Overview
   1.1 Product Name
   BetSmart
   1.2 Purpose
   BetSmart is a personal web application that enables a single user to identify profitable betting opportunities on DraftKings for NFL, NBA, and MLB by analyzing odds, calculating expected value (EV), and recommending high-value bets. It also tracks betting history and performance metrics, tailored to the user’s preferred sports and markets (e.g., NFL spreads, NBA player props, MLB moneylines).
   1.3 Target User
   Primary User: A sports betting enthusiast seeking to place smarter bets on DraftKings for NFL, NBA, and MLB.
   Needs: Simple, data-driven bet recommendations; easy odds input; performance tracking; focus on NFL, NBA, and MLB markets.
   Context: Personal use, accessed via web browser on desktop or mobile.
   1.4 Goals
   Deliver 3-5 daily bet recommendations with positive EV for NFL, NBA, and MLB.
   Enable seamless odds input and storage in Supabase.
   Provide betting history and profit trend visualization.
   Offer a modern, responsive UI using shadcn/ui components.
   Minimize costs using free-tier services (Supabase, Vercel).
2. Features and Requirements
   2.1 Core Features
   2.1.1 Odds Analysis
   Description: Analyze DraftKings odds for NFL, NBA, and MLB to identify bets with positive EV.
   Requirements:
   Accept manual odds input (sport, market, team/player, odds, stake) via a web form, limited to NFL, NBA, and MLB.
   Support common markets: moneylines, spreads, over/under, player props (e.g., NFL passing yards, NBA points, MLB strikeouts).
   Calculate implied probability from American odds (e.g., +150 = 40%, -110 = 52.38%).
   Estimate true probability using historical stats (e.g., NFL team ATS records, NBA player averages, MLB pitcher ERA) from sources like ESPN, Yahoo Sports, or Basketball-Reference.
   Compute EV: EV = (True Probability _ Payout) - (1 - True Probability) _ Stake.
   Store odds and calculations in Supabase.
   User Story: As a user, I want to input DraftKings odds for NFL, NBA, or MLB and see their EV so I can identify profitable bets.
   2.1.2 Bet Recommendations
   Description: Suggest 3-5 high-value bets daily for NFL, NBA, and MLB based on EV and user preferences.
   Requirements:
   Filter bets by NFL, NBA, MLB, and user-selected markets (e.g., moneylines, props).
   Sort bets by EV, displaying top 3-5 on the Home page.
   Show brief explanations (e.g., “Undervalued due to team’s recent ATS performance” or “Player prop exceeds average vs. weak defense”).
   Allow refresh to re-run algorithm with new odds.
   User Story: As a user, I want daily bet recommendations for NFL, NBA, and MLB so I can quickly decide what to bet on.
   2.1.3 Bet Tracking
   Description: Log bets and track performance metrics for NFL, NBA, and MLB.
   Requirements:
   Log bets in Supabase (date, sport, market, team/player, odds, stake, outcome, profit).
   Support outcomes: “win,” “loss,” “pending.”
   Calculate metrics: win/loss record, total profit/loss, ROI, segmented by sport (NFL, NBA, MLB).
   Display history in a table and profit trend in a line chart.
   User Story: As a user, I want to log my NFL, NBA, and MLB bets and see my performance so I can track my progress.
   2.1.4 Filters and Preferences
   Description: Customize the app for NFL, NBA, and MLB preferences.
   Requirements:
   Allow selection of favorite sports (NFL, NBA, MLB) and markets (e.g., spreads, props).
   Set risk level: conservative (low-variance bets like moneylines), moderate, aggressive (e.g., parlays).
   Store preferences in Supabase.
   Apply preferences to filter recommendations (default: include all three sports).
   User Story: As a user, I want to set my preferences for NFL, NBA, and MLB so recommendations match my interests.
   2.2 User Interface
   Platform: Web app, responsive for desktop and mobile browsers.
   Pages:
   Home:
   List of 3-5 recommended bets (e.g., “NFL: Patriots +150, EV: +5%” or “NBA: LeBron Over 25.5 Pts -110”).
   Buttons: “Input New Bet,” “Refresh.”
   UI Components: shadcn/ui Card, Button, Table.
   Bet Input:
   Form: Sport (dropdown: NFL, NBA, MLB), market (dropdown: moneylines, spreads, etc.), team/player, odds, stake.
   “Save” button to store in Supabase.
   UI Components: shadcn/ui Input, Select, Button, Form.
   History:
   Table: Date, sport, bet, odds, outcome, profit.
   Line chart: Profit over time, filterable by NFL, NBA, MLB.
   UI Components: shadcn/ui Table, Card, Chart.js for chart.
   Settings:
   Form: Favorite sports (checkboxes: NFL, NBA, MLB), risk level (dropdown).
   UI Components: shadcn/ui Checkbox, Select, Button, Form.
   Design:
   Use shadcn/ui for accessible, Tailwind CSS-based components.
   Integrate Chart.js for profit trend visualization.
   Ensure accessibility: keyboard navigation, ARIA labels, high-contrast mode.
   Wireframes (Text-Based):
   Home:

```
BetSmart
Recommended Bets
[Card]
  [NFL] Patriots +150 vs. Jets (EV: +5%) [Button: Details]
[Card]
  [NBA] LeBron Over 25.5 Pts -110 (EV: +7%) [Button: Details]
[Button: Input New Bet] [Button: Refresh]
Bet Input:
Add Bet
[Form]
  Sport: [Select: NFL, NBA, MLB]
  Market: [Select: Moneyline, Spread, Over/Under, Player Prop]
  Team/Player: [Input]
  Odds: [Input: e.g., +150]
  Stake: [Input: e.g., $10]
  [Button: Save]
History:
```

Betting History
[Table]
Date | Sport | Bet | Odds | Outcome | Profit
4/20 | NBA | Lakers -6.5 | -110 | Win | +$9.09
[Card: Profit Chart - Line graph, Filter: NFL/NBA/MLB]
2.3 Non-Functional Requirements
Performance: Page load <2 seconds; handle up to 100 odds/bets daily.
Security: Optional Supabase authentication (email or anonymous); Row-Level Security (RLS) for data protection.
Scalability: Supabase free tier (500MB storage, 200K API requests/month) sufficient for personal use.
Cost: Free, using Supabase and Vercel free tiers; optional The Odds API ($10/month for 500 requests).
Browser Support: Chrome, Firefox, Safari (desktop and mobile). 3. Technical Requirements
3.1 Technology Stack
Frontend:
Framework: React (via Vite for fast setup).
UI Components: shadcn/ui (Tailwind CSS-based, customizable).
Components: Button, Card, Input, Select, Table, Checkbox, Form.
Pros: Accessible, lightweight, Tailwind integration.
Cons: Requires manual component installation (guided by shadcn/ui CLI).
Supabase Client: @supabase/supabase-js for database queries.
Charting: Chart.js with react-chartjs-2 for profit charts.
Backend:
Supabase: PostgreSQL database, REST API, optional authentication.
Tables: odds, bets, preferences.
Real-time: Optional for odds updates (if using API).
Pros: Free tier, no server management, auto-generated APIs.
Cons: Free tier limits (sufficient for personal use).
Algorithm: JavaScript (in-browser) for EV calculations.
Optional: Python (local) for advanced models (e.g., logistic regression for true probabilities).
Data Sources:
Odds: Manual input via form or The Odds API (free tier, $10/month for 500 requests).
Stats: ESPN, Yahoo Sports, Baseball-Reference (manual or scraped).
Hosting:
Frontend: Vercel (free tier, automatic scaling).
Backend: Supabase cloud (free tier).
Development: Local with Vite (npm create vite@latest).
Dependencies:
Node.js (v18+), npm.
shadcn/ui CLI (npx shadcn-ui@latest init).
3.2 Supabase Configuration
Project Setup:
Create project at app.supabase.com.
Save URL and API key in .env:
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_KEY=YOUR_SUPABASE_KEY
Database Schema:
sql
CREATE TABLE odds (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
sport TEXT NOT NULL CHECK (sport IN ('NFL', 'NBA', 'MLB')),
market TEXT NOT NULL CHECK (market IN ('moneyline', 'spread', 'over/under', 'player_prop')),
team_player TEXT NOT NULL,
odds INTEGER NOT NULL,
implied_probability FLOAT,
true_probability FLOAT,
expected_value FLOAT,
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bets (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
date DATE NOT NULL,
sport TEXT NOT NULL CHECK (sport IN ('NFL', 'NBA', 'MLB')),
market TEXT NOT NULL CHECK (market IN ('moneyline', 'spread', 'over/under', 'player_prop')),
team_player TEXT NOT NULL,
odds INTEGER NOT NULL,
stake FLOAT NOT NULL,
outcome TEXT CHECK (outcome IN ('win', 'loss', 'pending')),
profit FLOAT,
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE preferences (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
user_id UUID,
sports TEXT[] DEFAULT ARRAY['NFL', 'NBA', 'MLB'],
risk_level TEXT CHECK (risk_level IN ('conservative', 'moderate', 'aggressive')) DEFAULT 'moderate',
updated_at TIMESTAMP DEFAULT NOW()
);
Row-Level Security (RLS):
sql
ALTER TABLE odds ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_access ON odds FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_access ON bets FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_access ON preferences FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
Client Setup:
javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
3.3 Algorithm Details
Implied Probability:
Positive odds: 100 / (odds + 100) (e.g., +150 = 40%).
Negative odds: |odds| / (|odds| + 100) (e.g., -110 = 52.38%).
True Probability:
NFL: Use team ATS records, recent win rates, and context (e.g., injuries, home/away).
NBA: Use player prop averages (e.g., points, rebounds) and team stats, adjusted for opponent strength.
MLB: Use pitcher stats (ERA, WHIP), team batting averages, and park factors.
Source stats from ESPN, Yahoo Sports, or Baseball-Reference.
EV Calculation:
javascript
function calculateEV(odds, trueProbability, stake = 1) {
const impliedProb = odds > 0 ? 100 / (odds + 100) : Math.abs(odds) / (Math.abs(odds) + 100);
const payout = odds > 0 ? (odds / 100) _ stake : (100 / Math.abs(odds)) _ stake;
return (trueProbability _ payout) - ((1 - trueProbability) _ stake);
}
Execution: Run in-browser when odds are input; store results in Supabase’s odds table.
3.4 shadcn/ui Integration
Setup:
Initialize shadcn/ui in React project:
bash
npx shadcn-ui@latest init
Install components:
bash
npx shadcn-ui@latest add button card input select table checkbox form
Usage Example (Bet Input Page):
jsx
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import supabase from '@/lib/supabase';

function BetInput() {
const form = useForm({
defaultValues: { sport: 'NFL', market: 'moneyline', team_player: '', odds: '', stake: '' }
});

const onSubmit = async (data) => {
const { error } = await supabase.from('odds').insert([{
sport: data.sport,
market: data.market,
team_player: data.team_player,
odds: parseInt(data.odds),
implied_probability: calculateImpliedProbability(data.odds),
true_probability: calculateTrueProbability(data), // Placeholder
expected_value: calculateEV(data.odds, calculateTrueProbability(data))
}]);
if (error) console.error(error);
};

return (
<div className="container mx-auto p-4">
<h1 className="text-2xl font-bold mb-4">Add Bet</h1>
<Form {...form}>
<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
<FormField name="sport" render={({ field }) => (
<FormItem>
<FormLabel>Sport</FormLabel>
<Select onValueChange={field.onChange} defaultValue={field.value}>
<FormControl>
<SelectTrigger>
<SelectValue placeholder="Select sport" />
</SelectTrigger>
</FormControl>
<SelectContent>
<SelectItem value="NFL">NFL</SelectItem>
<SelectItem value="NBA">NBA</SelectItem>
<SelectItem value="MLB">MLB</SelectItem>
</SelectContent>
</Select>
</FormItem>
)} />
<FormField name="market" render={({ field }) => (
<FormItem>
<FormLabel>Market</FormLabel>
<Select onValueChange={field.onChange} defaultValue={field.value}>
<FormControl>
<SelectTrigger>
<SelectValue placeholder="Select market" />
</SelectTrigger>
</FormControl>
<SelectContent>
<SelectItem value="moneyline">Moneyline</SelectItem>
<SelectItem value="spread">Spread</SelectItem>
<SelectItem value="over/under">Over/Under</SelectItem>
<SelectItem value="player_prop">Player Prop</SelectItem>
</SelectContent>
</Select>
</FormItem>
)} />
<FormField name="team_player" render={({ field }) => (
<FormItem>
<FormLabel>Team/Player</FormLabel>
<FormControl>
<Input placeholder="e.g., Patriots or LeBron James" {...field} />
</FormControl>
</FormItem>
)} />
<FormField name="odds" render={({ field }) => (
<FormItem>
<FormLabel>Odds</FormLabel>
<FormControl>
<Input placeholder="e.g., +150 or -110" {...field} />
</FormControl>
</FormItem>
)} />
<FormField name="stake" render={({ field }) => (
<FormItem>
<FormLabel>Stake ($)</FormLabel>
<FormControl>
<Input placeholder="e.g., 10" type="number" {...field} />
</FormControl>
</FormItem>
)} />
<Button type="submit">Save</Button>
</form>
</Form>
</div>
);
} 4. Implementation Plan
4.1 Development Timeline (2-3 Weeks)
Week 1:
Set up React with Vite (npm create vite@latest).
Initialize shadcn/ui and Tailwind CSS (npx shadcn-ui@latest init).
Configure Supabase project and tables.
Build Home and Bet Input pages with shadcn/ui components.
Week 2:
Implement EV algorithm in JavaScript, tailored for NFL, NBA, MLB.
Add Supabase queries for odds and bets.
Build History page with shadcn/ui Table and Chart.js.
Week 3:
Build Settings page with shadcn/ui Checkbox and Select.
Deploy to Vercel (vercel --prod).
Test and polish UI.
4.2 Testing
Scope:
Input 10-20 sample bets (e.g., NFL moneylines, NBA props, MLB over/under).
Verify EV calculations for NFL, NBA, MLB markets.
Test Supabase sync (odds saved, bets logged).
Ensure UI responsiveness on Chrome, Firefox, Safari (desktop/mobile).
Tools: Browser DevTools, Supabase Dashboard.
Success Criteria:
100% of inputs saved correctly.
Recommendations match EV calculations.
UI loads <2 seconds.
4.3 Deployment
Frontend: Deploy to Vercel:
bash
vercel --prod
Backend: Supabase cloud (no deployment needed).
Domain: Vercel free domain (e.g., betsmart.vercel.app). 5. Assumptions and Constraints
Assumptions:
User manually inputs NFL, NBA, MLB odds or uses The Odds API (free tier).
Historical stats for NFL, NBA, MLB are sourced manually from ESPN, Yahoo Sports, or Baseball-Reference.
Supabase free tier meets storage and API needs.
User has basic JavaScript/React knowledge or access to tutorials.
Constraints:
Limited to DraftKings odds for NFL, NBA, MLB.
No real-time odds updates unless using paid API.
shadcn/ui requires Tailwind CSS familiarity. 6. Future Considerations
Enhancements:
Integrate The Odds API for automated NFL, NBA, MLB odds.
Add real-time odds updates via Supabase WebSockets.
Support DraftKings Sportsbook+ parlay recommendations.
Implement advanced models (e.g., machine learning for NFL ATS, NBA props).
Maintenance:
Monitor Supabase usage to stay within free tier.
Update shadcn/ui components as new versions release.
Refine true probability estimates based on betting outcomes. 7. Dependencies
DraftKings: Source of NFL, NBA, MLB odds and markets.
Supabase: Database and API provider.
Vercel: Hosting platform.
The Odds API: Optional odds data source.
shadcn/ui: UI component library.
Chart.js: Charting library. 8. Risks and Mitigation
Risk: Inaccurate true probability estimates for NFL, NBA, MLB.
Mitigation: Validate with historical outcomes; refine algorithm.
Risk: Supabase free tier limits exceeded.
Mitigation: Monitor usage; upgrade to paid tier ($25/month) if needed.
Risk: shadcn/ui setup complexity.
Mitigation: Follow shadcn/ui docs; use provided code examples. 9. Success Metrics
Functional: App delivers 3-5 accurate bet recommendations daily for NFL, NBA, MLB.
Performance: Pages load <2 seconds; no data sync errors.
Usability: User can input odds, view recommendations, and track bets in <5 minutes.
Accuracy: Recommendations achieve positive ROI over 30 days (tracked in History).
This PRD incorporates your preference for NFL, NBA, and MLB, ensuring BetSmart is tailored to these sports. The use of Supabase and shadcn/ui provides a robust, modern solution for your personal betting app. To proceed, please confirm if you’ll use manual odds input or The Odds API, specify preferred markets (e.g., NFL spreads, NBA props), and indicate your risk level (conservative, moderate, aggressive). I can also provide additional code snippets (e.g., Home page, EV algorithm, Supabase queries) or assist with shadcn/ui setup if needed.
Disclaimer: Grok is not a financial adviser; please consult one. Don't share information that can identify you.
