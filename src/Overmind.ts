// Overmind class - manages colony-scale operations and contains references to all brain objects

import profiler = require('./lib/screeps-profiler');
import {Colony} from "./Colony";
import {Overlord} from "./Overlord";
import {TerminalBrain} from "./brains/Brain_Terminal";
import {AbstractCreepWrapper} from "./maps/map_roles";

export default class Overmind {
    name: string;
    Colonies: { [roomName: string]: Colony };
    Overlords: { [roomName: string]: Overlord };
    TerminalBrains: { [roomName: string]: TerminalBrain };

    constructor() {
        this.name = "Overmind";
        this.Colonies = {};
        this.Overlords = {};
        this.TerminalBrains = {};
    }

    verifyMemory(): void {
        if (!Memory.Overmind) {
            Memory.Overmind = {};
        }
        if (!Memory.colonies) {
            Memory.colonies = {};
        }
    }

    initializeColonies(): void {
        // Colony call object
        let protoColonies = {} as { [roomName: string]: string[] }; // key: lead room, values: outposts[]
        // Register colony capitols
        for (let name in Game.rooms) {
            if (Game.rooms[name].my) { // Add a new colony for each owned room
                Game.rooms[name].memory.colony = name; // register colony to itself
                protoColonies[name] = [];
            }
        }
        // Register colony outposts
        let colonyFlags = _.filter(Game.flags, flagCodes.territory.colony.filter);
        for (let flag of colonyFlags) {
            let colonyName = flag.memory.colony;
            let roomName = flag.pos.roomName;
            let thisRoom = Game.rooms[roomName];
            if (thisRoom) { // If there's vision, assign the room to a colony
                thisRoom.memory.colony = colonyName;
                protoColonies[colonyName].push(roomName);
            } else { // Else set it to null
                protoColonies[colonyName].push("");
            }
        }
        // Initialize the colonies
        for (let colName in protoColonies) {
            this.Colonies[colName] = new Colony(colName, protoColonies[colName]);
        }
    }

    spawnMoarOverlords(): void {
        // Instantiate an overlord for each colony
        for (let name in this.Colonies) {
            this.Overlords[name] = new Overlord(this.Colonies[name]);
        }
    }

    initializeTerminalBrains(): void {
        for (let name in this.Colonies) {
            if (Game.rooms[name].terminal) {
                this.TerminalBrains[name] = new TerminalBrain(name);
            }
        }
    }

    initializeCreeps(): void {
        // Wrap all creeps
        Game.icreeps = {};
        for (let name in Game.creeps) {
            Game.icreeps[name] = AbstractCreepWrapper(Game.creeps[name]);
        }
        // Register creeps
        let creepsByColony = _.groupBy(Game.icreeps, creep => creep.memory.colony) as { [colName: string]: ICreep[] };
        for (let colName in this.Colonies) {
            let colony = this.Colonies[colName];
            let colCreeps: ICreep[] = creepsByColony[colName];
            colony.creeps = colCreeps;
            colony.creepsByRole = _.groupBy(colCreeps, creep => creep.memory.role);
        }
    }

    init(): void {
        this.verifyMemory();
        this.initializeColonies();
        this.spawnMoarOverlords();
        this.initializeTerminalBrains();
        this.initializeCreeps();
    }
}


profiler.registerClass(Overmind, 'Overmind');