// app/history/HistoryDisplay.tsx
'use client';

import { LeagueHistory } from '../../../../classes/custom/LeagueHistory';

type HistoryDisplayProps = {
  historyData: LeagueHistory;
};

console.log(HistoryData)

export default function HistoryDisplay({ historyData }: HistoryDisplayProps) {
  return (
    <div>
      <h1>League History</h1>
      {historyData.years.map((year) => (
        <div key={year.year}>
          <h2>{year.year}</h2>
          <h3>Season Standings</h3>
          <ul>
            {year.seasonStandings.map((standing) => (
              <li key={standing.rosterId}>
                {standing.teamName}: Wins {standing.wins}, Losses {standing.losses}
              </li>
            ))}
          </ul>
          {/* Add more details as needed */}
        </div>
      ))}
    </div>
  );
}
