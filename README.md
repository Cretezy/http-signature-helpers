# http-signature-helpers

Helpers for the [HTTP Signature spec](https://tools.ietf.org/id/draft-cavage-http-signatures-09.html).

## Install

```bash
yarn add http-signature-helpers
# or
npm install http-signature-helpers
```

```js
import { getSignatureString, createSignatureHeader, parseSignatureHeader } from "http-signature-helpersr";
# or
const { getSignatureString, createSignatureHeader, parseSignatureHeader } = require("http-signature-helpers");
```

## Usage

### `getSignatureString(options)`

Get the [signature string](https://tools.ietf.org/id/draft-cavage-http-signatures-09.html#canonicalization) (this is the content to create the signature from).

Options (object):

* `body`: (string) Body content
* `headers`: (object) Key-value of HTTP headers to be used with `signatureHeaders`
* `signatureHeaders` (array) Which headers to include in signature string
* `target`: (object) Values to use with `(request-target)` `signatureHeader` (optional)
  * `method`: (string) HTTP method (`GET`, `POST`, etc)
  * `path`: (string) Request path (`/`, etc)
* `nonce`: (object) Used for [signature nonce spec](https://web-payments.org/specs/source/http-signature-nonces/) (optional)
  * `clientId`: (string/number)
  * `nonce`: (string/number)

Example:

```js
getSignatureString({
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
```

```
(request-target): get /foo
host: example.org
date: Tue, 07 Jun 2014 20:51:35 GMT
cache-control: max-age=60, must-revalidate
x-example: Example header with some whitespace.
body
```

### `createSignatureHeader(options)`

Get the [signature header](https://tools.ietf.org/id/draft-cavage-http-signatures-09.html#auth-scheme) to set to `Authorization`.

Options (object):

* `keyId`: (string) Key identifier
* `algorithm`: (string) Algorithm (known/recommended values: `rsa-sha256`, `hmac-sha256`. The algorithm link on the draft spec is dead)
* `signature`: (string) Signature generated from `getSignatureString`
* `signatureHeaders`: (array) Headers to be included in `header` param. Matching from `getSignatureString`
* `nonce`: (object) Used for [signature nonce spec](https://web-payments.org/specs/source/http-signature-nonces/) (optional). Matching from `getSignatureString`
  * `clientId`: (string/number)
  * `nonce`: (string/number)
* `prefix` (booleam, default: `true`) If it should prefix with `Signature`.

Example:

```js
createSignatureHeader({
	keyId: "rsa-key-1",
	algorithm: "rsa-sha256",
	signatureHeaders: [
		"(request-target)",
		"host",
		"date",
		"digest",
		"content-length"
	],
	signature: "rsa-signature-1"
});
```

```
Signature keyId="rsa-key-1",algorithm="rsa-sha256",headers="(request-target) host date digest content-length",signature="rsa-signature-1"
```

### `parseSignatureHeader(value, prefix = true)`

Parse the value from `createSignatureHeader`. If `prefix` is true, it will remove the `Signature` prefix.

Example:

```js
parseSignatureHeader(
	`Signature keyId="rsa-key-1",algorithm="rsa-sha256",headers="(request-target) host date digest content-length",signature="rsa-signature-1"`
);
```

```js
{
    keyId: "rsa-key-1",
    algorithm: "rsa-sha256",
    signatureHeaders: ["(request-target)", "host", "date", "digest", "content-length"],
    signature: "rsa-signature-1"
}
```
