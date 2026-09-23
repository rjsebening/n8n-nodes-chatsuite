import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csRequest } from '../../helpers/apiclient';
import { cleanBody } from '../../helpers/params';

const BASE = '/api/v1/group';

/** kanalName + (groupId | groupName), the addressing every group endpoint shares */
function groupSelector(ctx: IExecuteFunctions, i: number): IDataObject {
	const kanalName = (ctx.getNodeParameter('kanalName', i, '') as string).trim();
	const groupId = (ctx.getNodeParameter('groupId', i, '') as string).trim();
	const groupName = (ctx.getNodeParameter('groupName', i, '') as string).trim();

	if (!groupId && !groupName) {
		throw new NodeOperationError(
			ctx.getNode(),
			'Provide either a Group ID or a Group Name to address the WhatsApp group',
			{ itemIndex: i },
		);
	}

	return cleanBody({ kanalName, groupId, groupName });
}

/** email | phoneNumber, the addressing the team member endpoints share */
function memberSelector(ctx: IExecuteFunctions, i: number): IDataObject {
	const email = (ctx.getNodeParameter('email', i, '') as string).trim();
	const phoneNumber = (ctx.getNodeParameter('memberPhoneNumber', i, '') as string).trim();

	if (!email && !phoneNumber) {
		throw new NodeOperationError(
			ctx.getNode(),
			'Provide either a Team Member Email or a Team Member Phone Number',
			{ itemIndex: i },
		);
	}

	return cleanBody({ email, phoneNumber });
}

export async function handleGroup(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'getParticipants':
			return await csRequest<IDataObject>(this, 'GET', `${BASE}/participants`, {
				qs: groupSelector(this, i),
			});

		case 'update': {
			const body = {
				...groupSelector(this, i),
				...cleanBody(this.getNodeParameter('updateFields', i, {}) as IDataObject),
			};
			return await csRequest<IDataObject>(this, 'PATCH', BASE, { body });
		}

		case 'leave': {
			const options = this.getNodeParameter('leaveOptions', i, {}) as IDataObject;
			const body: IDataObject = { ...groupSelector(this, i) };
			for (const key of [
				'removeOtherParticipants',
				'removeTeamMembers',
				'deleteGroup',
				'operationId',
			]) {
				if (options[key] !== undefined && options[key] !== '') body[key] = options[key];
			}
			return await csRequest<IDataObject>(this, 'POST', `${BASE}/leave`, { body });
		}

		case 'addTeamMember': {
			const body = {
				...groupSelector(this, i),
				...memberSelector(this, i),
				promoteToAdmin: this.getNodeParameter('promoteToAdmin', i) as boolean,
			};
			return await csRequest<IDataObject>(this, 'POST', `${BASE}/team-members`, { body });
		}

		case 'setTeamMemberAdmin': {
			const body = {
				...groupSelector(this, i),
				...memberSelector(this, i),
				isGroupAdmin: this.getNodeParameter('isGroupAdmin', i) as boolean,
			};
			return await csRequest<IDataObject>(this, 'PATCH', `${BASE}/team-members`, { body });
		}

		case 'removeTeamMember': {
			const qs = { ...groupSelector(this, i), ...memberSelector(this, i) };
			const response = await csRequest<IDataObject>(this, 'DELETE', `${BASE}/team-members`, {
				qs,
			});
			return response ?? { success: true, ...qs };
		}

		case 'setTicketDetection': {
			const kanalName = (this.getNodeParameter('kanalName', i, '') as string).trim();
			const enabledChoice = this.getNodeParameter('ticketDetectionEnabled', i) as string;
			const groupsCollection = this.getNodeParameter('ticketDetectionGroups', i, {}) as {
				group?: IDataObject[];
			};
			const where = cleanBody(this.getNodeParameter('ticketDetectionWhere', i, {}) as IDataObject);

			const groups = (groupsCollection.group ?? [])
				.map((entry) => cleanBody(entry))
				.filter((entry) => Object.keys(entry).length > 0);

			if (groups.length === 0 && Object.keys(where).length === 0) {
				throw new NodeOperationError(
					this.getNode(),
					'Select at least one group or add a Where filter',
					{ itemIndex: i },
				);
			}

			const body: IDataObject = {
				// `default` is expressed as an explicit null in the API contract
				enabled: enabledChoice === 'default' ? null : enabledChoice === 'on',
			};
			if (kanalName) body.kanalName = kanalName;
			if (groups.length) body.groups = groups;
			if (Object.keys(where).length) body.where = where;

			return await csRequest<IDataObject>(this, 'PATCH', `${BASE}/ticket-detection`, { body });
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unsupported group operation: ${operation}`, {
				itemIndex: i,
			});
	}
}
