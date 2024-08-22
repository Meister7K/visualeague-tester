// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import Cors from 'cors'
import {LeagueSettings} from '../../../classes/sleeper/LeagueSettings'
import LeagueData from '../../../classes/sleeper/SleeperLeague'
import {SleeperUser} from '../../../classes/sleeper/SleeperUser'
import {SleeperMatchup} from '../../../classes/sleeper/SleeperMatchup'
import {SleeperRoster} from '../../../classes/sleeper/SleeperRoster'
import {
	getMultiPlayerDetails,
	getMultiPlayerProjections,
	getMultiPlayerStats,
	getWeeklyPlayerStats,
} from '../player/[...player]'
import {SleeperPlayerDetails} from '../../../classes/custom/Player'
import { getLeague, getLeagueMembers } from '../league/[league]'
const {connectToDatabase} = require('../../../lib/mongodb')
const {MongoClient} = require('mongodb')

const cors = Cors({
	methods: ['GET', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
	return new Promise((resolve, reject) => {
		fn(req, res, (result: any) => {
			if (result instanceof Error) {
				return reject(result)
			}

			return resolve(result)
		})
	})
}

type Data = {
	league: LeagueData
}


async function getPreviousLeaguesData(leagueId: string) {
    let currentLeagueId = leagueId;
    const leagueIds: string[] = [leagueId];
    const allLeaguesData: any[] = [];
  
    while (currentLeagueId) {
      const leagueSettings: LeagueSettings = await getLeague(currentLeagueId) as LeagueSettings;
      
      // Fetch data for the current league
      const leagueUsers = await getLeagueMembers(currentLeagueId) as SleeperUser[];
      const leagueRosters = await getLeagueRosters(currentLeagueId) as SleeperRoster[];
      const matchups = await getAllMatchups(currentLeagueId, leagueSettings);
  
      allLeaguesData.push({
        leagueId: currentLeagueId,
        settings: leagueSettings,
        users: leagueUsers,
        rosters: leagueRosters,
        matchups: matchups
      });
  
      // Get the previous league ID
      currentLeagueId = leagueSettings.previous_league_id || null;
      if (currentLeagueId) {
        leagueIds.push(currentLeagueId);
      }
    }
  
    return { leagueIds, allLeaguesData };
  }
  
  async function getAllMatchups(leagueId: string, leagueSettings: LeagueSettings) {
    const startWeek = 1;
    const endWeek = 17; // Assuming a standard 17-week season
    const matchupPromises = [];
  
    for (let week = startWeek; week <= endWeek; week++) {
      matchupPromises.push(
        fetch(`https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`)
          .then(response => response.json())
      );
    }
  
    return Promise.all(matchupPromises);
  }
  
  // Modify the handler function to include this new functionality
  export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { league } = req.query;
    await runMiddleware(req, res, cors);
  
    if (league) {
      let leagueId = league.toString();
      let db = connectToDatabase();
      
      // Get data for the current league and all previous leagues
      const { leagueIds, allLeaguesData } = await getPreviousLeaguesData(leagueId);
      
      // Process the current league data (first in the array)
      const currentLeagueData = allLeaguesData[0];
      const playerDetails = await getMultiPlayerDetails(
        db, 
        [...new Set(currentLeagueData.matchups.flat().flatMap((m: SleeperMatchup) => m.players))],
        currentLeagueData.settings.season
      );
  
      res.status(200).json({
        league: new LeagueData(
          currentLeagueData.users,
          currentLeagueData.settings,
          currentLeagueData.matchups,
          currentLeagueData.rosters,
          playerDetails
        ),
        previousLeagues: allLeaguesData.slice(1), // Exclude current league
        allLeagueIds: leagueIds
      });
    } else {
      res.status(401).json({
        league: new LeagueData([], {} as LeagueSettings, [], [], []),
      });
    }
  }