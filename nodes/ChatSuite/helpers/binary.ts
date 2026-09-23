import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export interface UploadFile {
	value: Buffer;
	options: { filename: string; contentType?: string };
}

/**
 * Reads a binary input property and returns it in the shape n8n's form-data
 * serializer expects for multipart uploads.
 */
export async function getUploadFile(
	ctx: IExecuteFunctions,
	i: number,
	binaryPropertyName: string,
	fallbackFileName: string,
): Promise<UploadFile> {
	const binaryData = ctx.helpers.assertBinaryData(i, binaryPropertyName);
	const buffer = await ctx.helpers.getBinaryDataBuffer(i, binaryPropertyName);

	if (!buffer?.length) {
		throw new NodeOperationError(
			ctx.getNode(),
			`The binary property "${binaryPropertyName}" is empty`,
			{ itemIndex: i },
		);
	}

	return {
		value: buffer,
		options: {
			filename: binaryData.fileName ?? fallbackFileName,
			contentType: binaryData.mimeType,
		},
	};
}

/** Reads a binary input property and returns it base64 encoded for JSON bodies. */
export async function getBase64File(
	ctx: IExecuteFunctions,
	i: number,
	binaryPropertyName: string,
): Promise<{ fileName: string; contentType?: string; data: string }> {
	const binaryData = ctx.helpers.assertBinaryData(i, binaryPropertyName);
	const buffer = await ctx.helpers.getBinaryDataBuffer(i, binaryPropertyName);

	return {
		fileName: binaryData.fileName ?? binaryPropertyName,
		contentType: binaryData.mimeType,
		data: buffer.toString('base64'),
	};
}

function fileNameFromHeaders(headers: IDataObject, fallback: string): string {
	const disposition = String(headers['content-disposition'] ?? '');
	const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
	if (utf8Match) {
		try {
			return decodeURIComponent(utf8Match[1]);
		} catch {
			return utf8Match[1];
		}
	}
	const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
	return plainMatch ? plainMatch[1] : fallback;
}

/**
 * Wraps a downloaded buffer into an n8n item with the binary payload attached
 * under the property the user configured.
 */
export async function toBinaryItem(
	ctx: IExecuteFunctions,
	i: number,
	download: { body: Buffer; headers: IDataObject },
	fallbackFileName: string,
	json: IDataObject = {},
): Promise<INodeExecutionData> {
	const binaryPropertyName = ctx.getNodeParameter('binaryPropertyName', i, 'data') as string;
	const fileName = fileNameFromHeaders(download.headers, fallbackFileName);
	const mimeType = String(download.headers['content-type'] ?? '').split(';')[0] || undefined;

	const binaryData = await ctx.helpers.prepareBinaryData(download.body, fileName, mimeType);

	return {
		json: { fileName, mimeType: binaryData.mimeType, fileSize: binaryData.fileSize, ...json },
		binary: { [binaryPropertyName]: binaryData },
		pairedItem: { item: i },
	};
}
