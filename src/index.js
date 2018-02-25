// @flow
import { stringifyAuthParams, parseAuthParams } from "auth-param-parser";

// These strings should be 128 and 32 bit uint
export type Nonce = {
	clientId: string,
	nonce: string
};

export type Target = {
	path: string,
	method: string
};

export type SignatureStringParams = {
	body: string,
	headers: Object,
	signatureHeaders: string[],
	target?: Target,
	nonce?: Nonce
};

// https://tools.ietf.org/id/draft-cavage-http-signatures-09.html#canonicalization
export function getSignatureString({
	body,
	headers,
	signatureHeaders = ["date"],
	target,
	nonce
}: SignatureStringParams) {
	// Lowercase all headers
	headers = Object.keys(headers).reduce(
		(lowerCasedHeaders, header) => ({
			...lowerCasedHeaders,
			[header.toLowerCase()]: headers[header]
		}),
		{}
	);

	// Add date header in case
	if (!headers.date) {
		headers.date = new Date().toUTCString();
	}

	const output = []; // Remove any values not found

	// Add nonce
	if (nonce) {
		output.push(`${nonce.clientId} ${nonce.nonce}`);
	}

	// Generate output for each header
	output.push(
		...signatureHeaders
			.map(signatureHeader => signatureHeader.toLowerCase()) // Lowercase the signature header
			.map(signatureHeader => {
				let value =
					signatureHeader === "(request-target)" && target
						? `${target.method.toLowerCase()} ${target.path}`
						: headers[signatureHeader];

				if (!value) {
					return;
				}

				// https://tools.ietf.org/html/rfc7230#section-3.2.4
				value = value
					.split("\n")
					.map(value => value.trim())
					.join(" ");

				return `${signatureHeader}: ${value}`;
			})
			.filter(Boolean)
	);

	// Add body
	output.push(body);

	return output.join("\n");
}

export type SignatureHeaderParams = {
	keyId: string,
	algorithm: string,
	signature: string,
	signatureHeaders: string[],
	nonce?: Nonce
};

export type SignatureHeaderCreateParams = SignatureHeaderParams & {
	prefix: boolean
};

// https://tools.ietf.org/id/draft-cavage-http-signatures-09.html#auth-scheme
export function createSignatureHeader({
	keyId,
	algorithm,
	signature,
	signatureHeaders = ["date"],
	nonce,
	prefix = true
}: SignatureHeaderCreateParams) {
	return (
		(prefix ? "Signature " : "") +
		stringifyAuthParams({
			keyId,
			algorithm,
			headers:
				signatureHeaders.map(header => header.toLowerCase()).join(" ") || undefined,
			signature,
			...nonce
		})
	);
}

export function parseSignatureHeader(
	value: string,
	prefix: boolean = true
): SignatureHeaderParams {
	if (prefix) {
		value = value.replace(/^Signature /i, "");
	}
	const {
		keyId,
		algorithm,
		signature,
		headers,
		nonce,
		clientId
	} = parseAuthParams(value);

	const results: SignatureHeaderParams = {
		keyId,
		algorithm,
		signatureHeaders: headers.split(" "),
		signature
	};

	if (nonce && clientId) {
		results.nonce = {
			nonce,
			clientId
		};
	}
	return results;
}
