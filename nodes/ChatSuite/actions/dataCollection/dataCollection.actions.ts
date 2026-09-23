import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csGetMany, csRequest } from '../../helpers/apiclient';
import { buildListQuery, cleanBody, seg, toStringArray } from '../../helpers/params';

const BASE = '/api/v1/data-collection';

export async function handleDataCollection(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'getAll':
			return await csGetMany<IDataObject>(this, i, BASE, buildListQuery(this, i));

		case 'execute': {
			const dataCollectionId = this.getNodeParameter('dataCollectionId', i) as string;
			const options = this.getNodeParameter('executeOptions', i, {}) as IDataObject;

			const body = cleanBody({
				scope: this.getNodeParameter('scope', i) as string,
				...options,
			});
			if (options.groupCategoryNames !== undefined) {
				body.groupCategoryNames = toStringArray(options.groupCategoryNames);
			}

			return await csRequest<IDataObject>(
				this,
				'POST',
				`${BASE}/${seg(dataCollectionId)}/execute`,
				{ body },
			);
		}

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported data collection operation: ${operation}`,
				{ itemIndex: i },
			);
	}
}
