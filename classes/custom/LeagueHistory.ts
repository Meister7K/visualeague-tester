export class LeagueHistory {
    years: YearData[]
  
    constructor(historyData: any[]) {
      this.years = historyData.map(yearData => new YearData(yearData))
    }
  }
  
  class YearData {
    year: number
    leagueId: string
    seasonStandings: Standing[]
    podium: PodiumPlace[]
    toiletBowl: ToiletBowlPlace[]
  
    constructor(data: any) {
      this.year = data.year
      this.leagueId = data.league_id
      this.seasonStandings = data.season_standings.map((standing: any) => new Standing(standing))
      this.podium = data.podium.map((place: any) => new PodiumPlace(place))
      this.toiletBowl = data.toilet_bowl.map((place: any) => new ToiletBowlPlace(place))
    }
  }
  
  class Standing {
    rosterId: number
    ownerId: string
    displayName: string
    teamName: string
    wins: number
    losses: number
    ties: number
    fpts: number
    fptsAgainst: number
    rank: number
  
    constructor(data: any) {
      this.rosterId = data.roster_id
      this.ownerId = data.owner_id
      this.displayName = data.display_name
      this.teamName = data.team_name
      this.wins = data.wins
      this.losses = data.losses
      this.ties = data.ties
      this.fpts = data.fpts
      this.fptsAgainst = data.fpts_against
      this.rank = data.rank
    }
  }
  
  class PodiumPlace {
    rosterId: number
    ownerId: string
    displayName: string
    teamName: string
  
    constructor(data: any) {
      this.rosterId = data.roster_id
      this.ownerId = data.owner_id
      this.displayName = data.display_name
      this.teamName = data.team_name
    }
  }
  
  class ToiletBowlPlace extends PodiumPlace {
    isLoser: boolean
  
    constructor(data: any) {
      super(data)
      this.isLoser = data.is_loser
    }
  }