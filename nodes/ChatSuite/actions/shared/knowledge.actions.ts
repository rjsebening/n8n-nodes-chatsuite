import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';

import { cleanBody, toStringArray } from '../../helpers/params';

/** Normalizes the shared knowledge fields (category IDs, approval flag) */
export function knowledgeBody(fields: IDataObject): IDataObject {
	const body = cleanBody(fields);
	if (fields.ticketCategoryIds !== undefined) {
		body.ticketCategoryIds = toStringArray(fields.ticketCategoryIds);
	}
	if (fields.keywords !== undefined) {
		body.keywords = toStringArray(fields.keywords);
	}
	if (fields.isApproved !== undefined) {
		body.isApproved = fields.isApproved;
	}
	return body;
}

/** Builds the RAG query body from the question plus its options collection */
export function queryBody(ctx: IExecuteFunctions, i: number): IDataObject {
	const options = ctx.getNodeParameter('queryOptions', i, {}) as IDataObject;
	const body: IDataObject = { question: ctx.getNodeParameter('question', i) as string };
	if (options.topK !== undefined) body.topK = options.topK;
	if (options.minScore !== undefined && options.minScore !== 0) body.minScore = options.minScore;
	return body;
}
