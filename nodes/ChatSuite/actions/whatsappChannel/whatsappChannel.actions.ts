import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csRequest, unwrapList } from '../../helpers/apiclient';
import { seg } from '../../helpers/params';

const BASE = '/api/v1/whatsapp-channel';

export async function handleWhatsappChannel(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[]> {
	const kanalName = operation === 'getAll' ? '' : (this.getNodeParameter('kanalName', i) as string);

	switch (operation) {
		case 'getAll':
			return unwrapList<IDataObject>(await csRequest(this, 'GET', BASE));

		case 'get':
			return await csRequest<IDataObject>(this, 'GET', `${BASE}/${seg(kanalName)}`);

		case 'getQrCode':
			return await csRequest<IDataObject>(this, 'GET', `${BASE}/${seg(kanalName)}/qr-code`);

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported WhatsApp channel operation: ${operation}`,
				{ itemIndex: i },
			);
	}
}
