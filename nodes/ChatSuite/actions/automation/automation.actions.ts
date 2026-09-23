import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csGetMany, csRequest } from '../../helpers/apiclient';
import { buildListQuery, seg } from '../../helpers/params';

const BASE = '/api/v1/automation';

export async function handleAutomation(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[]> {
	const automationId =
		operation === 'getAll' ? '' : (this.getNodeParameter('automationId', i) as string);

	switch (operation) {
		case 'getAll':
			return await csGetMany<IDataObject>(this, i, BASE, buildListQuery(this, i));

		case 'get':
			return await csRequest<IDataObject>(this, 'GET', `${BASE}/${seg(automationId)}`);

		case 'execute':
			return await csRequest<IDataObject>(this, 'POST', `${BASE}/${seg(automationId)}/execute`);

		case 'getExecutions':
			return await csGetMany<IDataObject>(
				this,
				i,
				`${BASE}/${seg(automationId)}/execution`,
				buildListQuery(this, i),
			);

		case 'getExecution': {
			const executionId = this.getNodeParameter('executionId', i) as string;
			return await csRequest<IDataObject>(
				this,
				'GET',
				`${BASE}/${seg(automationId)}/execution/${seg(executionId)}`,
			);
		}

		case 'getVersions':
			return await csGetMany<IDataObject>(
				this,
				i,
				`${BASE}/${seg(automationId)}/version`,
				buildListQuery(this, i),
			);

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported automation operation: ${operation}`,
				{ itemIndex: i },
			);
	}
}
