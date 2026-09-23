import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csRequest, unwrapList } from '../../helpers/apiclient';
import { buildBody, cleanBody, getRlRequired, seg, toStringArray } from '../../helpers/params';

const BASE = '/api/v1/team-member';

function memberBody(fields: IDataObject): IDataObject {
	const body = cleanBody(fields);
	for (const key of ['expertiseNames', 'topicNames']) {
		if (fields[key] !== undefined) body[key] = toStringArray(fields[key]);
	}
	for (const key of ['acceptsAutoAssignments', 'isActive']) {
		if (fields[key] !== undefined) body[key] = fields[key];
	}
	return body;
}

function absenceBody(ctx: IExecuteFunctions, i: number): IDataObject {
	return {
		startDate: ctx.getNodeParameter('startDate', i) as string,
		endDate: ctx.getNodeParameter('endDate', i) as string,
	};
}

export async function handleTeamMember(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[]> {
	const email = [
		'get',
		'update',
		'patch',
		'delete',
		'resendWelcome',
		'getAbsences',
		'createAbsence',
		'updateAbsence',
		'deleteAbsence',
	].includes(operation)
		? getRlRequired(this, 'email', i, 'Team Member')
		: '';

	switch (operation) {
		case 'getAll':
			return unwrapList<IDataObject>(await csRequest(this, 'GET', BASE));

		case 'get':
			return await csRequest<IDataObject>(this, 'GET', `${BASE}/${seg(email)}`);

		case 'create': {
			const body = buildBody(
				{
					email: this.getNodeParameter('newEmail', i) as string,
					firstName: this.getNodeParameter('firstName', i) as string,
					lastName: this.getNodeParameter('lastName', i) as string,
				},
				memberBody(this.getNodeParameter('additionalFields', i, {}) as IDataObject),
			);
			return await csRequest<IDataObject>(this, 'POST', BASE, { body });
		}

		case 'update':
			return await csRequest<IDataObject>(this, 'PUT', `${BASE}/${seg(email)}`, {
				body: memberBody(this.getNodeParameter('updateFields', i, {}) as IDataObject),
			});

		case 'patch':
			return await csRequest<IDataObject>(this, 'PATCH', `${BASE}/${seg(email)}`, {
				body: memberBody(this.getNodeParameter('updateFields', i, {}) as IDataObject),
			});

		case 'delete': {
			const response = await csRequest<IDataObject>(this, 'DELETE', `${BASE}/${seg(email)}`);
			return response ?? { success: true, email };
		}

		case 'resendWelcome': {
			const response = await csRequest<IDataObject>(
				this,
				'POST',
				`${BASE}/${seg(email)}/resend-welcome`,
			);
			return response ?? { success: true, email };
		}

		case 'getAbsences':
			return unwrapList<IDataObject>(await csRequest(this, 'GET', `${BASE}/${seg(email)}/absence`));

		case 'createAbsence':
			return await csRequest<IDataObject>(this, 'POST', `${BASE}/${seg(email)}/absence`, {
				body: absenceBody(this, i),
			});

		case 'updateAbsence': {
			const absenceId = this.getNodeParameter('absenceId', i) as string;
			return await csRequest<IDataObject>(
				this,
				'PUT',
				`${BASE}/${seg(email)}/absence/${seg(absenceId)}`,
				{ body: absenceBody(this, i) },
			);
		}

		case 'deleteAbsence': {
			const absenceId = this.getNodeParameter('absenceId', i) as string;
			const response = await csRequest<IDataObject>(
				this,
				'DELETE',
				`${BASE}/${seg(email)}/absence/${seg(absenceId)}`,
			);
			return response ?? { success: true, absenceId };
		}

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported team member operation: ${operation}`,
				{ itemIndex: i },
			);
	}
}
