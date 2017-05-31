/* This is the withdrawal task for non-energy resources. */

import {Task} from './Task';

type targetType = StructureStorage | StructureContainer | StructureTerminal;
export class taskWithdrawResource extends Task {
	target: targetType;

	constructor(target: targetType) {
		super('withdrawResource', target);
		// Settings
		this.taskData.moveColor = 'blue';
		this.data.resourceType = null; // this needs to be overwritten on assignment
	}

	isValidTask() {
		var creep = this.creep;
		return (_.sum(creep.carry) < creep.carryCapacity);
	}

	isValidTarget() {
		let target = this.target;
		return target && target.store && target.store[this.data.resourceType] > 0;
	}

	work() {
		return this.creep.withdraw(this.target, this.data.resourceType);
	}
}