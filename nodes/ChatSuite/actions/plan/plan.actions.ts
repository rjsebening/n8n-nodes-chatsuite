import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csRequest } from '../../helpers/apiclient';

export async function handlePlan(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject[]> {
	switch (operation) {
		case 'getUsage': {
			let response = await csRequest<IDataObject | string>(this, 'GET', '/api/v1/plan/usage');
			// The endpoint is declared as text/plain as well as JSON
			if (typeof response === 'string') {
				try {
					response = JSON.parse(response) as IDataObject;
				} catch {
					throw new NodeOperationError(this.getNode(), 'Unexpected plan usage response', {
						itemIndex: i,
					});
				}
			}
			// One item per plan right, so `limit` / `remaining` can be checked per resource
			return (response?.items as IDataObject[] | undefined) ?? [];
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unsupported plan operation: ${operation}`, {
				itemIndex: i,
			});
	}
}
