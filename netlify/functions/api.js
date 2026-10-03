import handler from '../../api/index.js'

export async function handlerNetlify(event) {
  let responseBody = ''
  let responseBodyIsBinary = false
  const responseHeaders = {}

  const req = {
    method: event.httpMethod,
    url: event.rawUrl || `${event.path}${event.rawQuery ? `?${event.rawQuery}` : ''}`,
    headers: event.headers || {},
    body: event.body ? (event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString() : event.body) : undefined,
    socket: {remoteAddress: event.headers?.['x-nf-client-connection-ip'] || 'netlify'}
  }

  const res = {
    statusCode: 200,
    setHeader(name, value) {
      responseHeaders[name] = value
    },
    end(value = '') {
      responseBody = value
      responseBodyIsBinary = Buffer.isBuffer(value)
    }
  }

  await handler(req, res)

  return {
    statusCode: res.statusCode,
    headers: responseHeaders,
    body: responseBodyIsBinary ? responseBody.toString('base64') : String(responseBody),
    isBase64Encoded: responseBodyIsBinary
  }
}

export {handlerNetlify as handler}