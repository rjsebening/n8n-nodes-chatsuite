import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

/** Everything a resource handler may hand back to the node's execute loop */
export type HandlerResult = IDataObject | IDataObject[] | INodeExecutionData | INodeExecutionData[];

export type ResourceHandler = (
	this: IExecuteFunctions,
	i: number,
	operation: string,
) => Promise<HandlerResult>;
