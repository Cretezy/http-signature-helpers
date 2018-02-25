import {
	getSignatureString,
	createSignatureHeader,
	parseSignatureHeader
} from ".";

test("create signature string", () => {
	const correct =
		"(request-target): get /foo\nhost: example.org\ndate: Tue, 07 Jun 2014 20:51:35 GMT\ncache-control: max-age=60, must-revalidate\nx-example: Example header with some whitespace.\nbody";

	const check = getSignatureString({
		body: "body",
		headers: {
			Host: "example.org",
			Date: "Tue, 07 Jun 2014 20:51:35 GMT",
			"X-Example": `Example header
                            with some whitespace.`,
			"Cache-Control": "max-age=60, must-revalidate"
		},
		signatureHeaders: [
			"(request-target)",
			"host",
			"date",
			"cache-control",
			"x-example"
		],
		target: {
			method: "GET",
			path: "/foo"
		}
	});

	expect(check).toBe(correct);
});

test("creates signature header", () => {
	const correct = `Signature keyId="rsa-key-1",algorithm="rsa-sha256",headers="(request-target) host date digest content-length",signature="rsa-signature-1"`;
	const check = createSignatureHeader({
		keyId: "rsa-key-1",
		algorithm: "rsa-sha256",
		signatureHeaders: ["(request-target)", "host", "date", "digest", "content-length"],
		signature: "rsa-signature-1"
	});

	expect(check).toBe(correct);
});

test("parses signature header", () => {
	const correct = {
		keyId: "rsa-key-1",
		algorithm: "rsa-sha256",
		signatureHeaders: ["(request-target)", "host", "date", "digest", "content-length"],
		signature: "rsa-signature-1"
	};
	const check = parseSignatureHeader(
		`Signature keyId="rsa-key-1",algorithm="rsa-sha256",headers="(request-target) host date digest content-length",signature="rsa-signature-1"`
	);

	expect(check).toEqual(correct);
});
