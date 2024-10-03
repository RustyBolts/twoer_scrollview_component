export class TowerData {

    private _id: string;
    get id(): string {
        return this._id;
    }

    private _name: string;
    get name(): string {
        return this._name;
    }

    private _reward: string[];
    get reward(): string[] {
        return this._reward;
    }

    private _challengeRank: number;
    get challengeRank(): number {
        return this._challengeRank;
    }

    private _enemyTeams: string[];
    get enemyTeams(): string[] {
        return this._enemyTeams;
    }

    private _events: string[];
    get events(): string[] {
        return this._events;
    }

    private _chests: string[];
    get chests(): string[] {
        return this._chests;
    }

    constructor(id: string, name: string, reward: string[], challengeRank: number, enemyTeams: string[], events: string[], chests: string[]) {
        this._id = id;
        this._name = name;
        this._reward = reward;
        this._challengeRank = challengeRank;
        this._enemyTeams = enemyTeams;
        this._events = events;
        this._chests = chests;
    }

    static fromCSV(raw: any): TowerData {
        const cr = parseInt(raw.challengeRank);
        return new TowerData(raw.id, raw.name, raw.reward.split(' '), cr, raw.enemyTeams, raw.events, raw.chests);
    }
}