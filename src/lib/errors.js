const DEFAULT_MESSAGE = 'Something went wrong. Please try again.'

const FRIENDLY_STATUS_MESSAGES = {
  400: 'The request could not be processed. Please check your input and try again.',
  401: 'Please sign in to continue.',
  403: 'Your account does not have access to this action.',
  404: 'The requested resource could not be found.',
  408: 'The request timed out. Please try again.',
  409: 'This action conflicts with current data. Refresh and try again.',
  413: 'The payload is too large. Try a smaller file or shorter input.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'A server error occurred. Please try again shortly.',
  502: 'The service is temporarily unavailable. Please try again shortly.',
  503: 'The service is temporarily unavailable. Please try again shortly.',
  504: 'The service took too long to respond. Please try again shortly.',
}

export function createAppError(message, options = {}) {
  const appError = new Error(String(message || DEFAULT_MESSAGE))

  if (options.status) appError.status = options.status
  if (options.code) appError.code = options.code
  if (options.payload) appError.payload = options.payload
  if (options.cause) appError.cause = options.cause

  return appError
}

export function getFriendlyErrorMessage(error, fallbackMessage = DEFAULT_MESSAGE) {
  const directMessage = String(error?.message ?? '').trim()
  if (directMessage) {
    return directMessage
  }

  const status = Number(error?.status ?? error?.response?.status ?? 0)
  if (status && FRIENDLY_STATUS_MESSAGES[status]) {
    return FRIENDLY_STATUS_MESSAGES[status]
  }

  return fallbackMessage
}

export function toServiceError(error, fallbackMessage, defaultStatus = 500) {
  const status = Number(error?.status ?? error?.response?.status ?? defaultStatus)

  const message =
    error?.response?.data?.message ??
    error?.response?.data?.error_description ??
    error?.response?.data?.error ??
    error?.message ??
    FRIENDLY_STATUS_MESSAGES[status] ??
    fallbackMessage ??
    DEFAULT_MESSAGE

  return createAppError(message, {
    status,
    code: error?.code,
    payload: error?.response?.data,
    cause: error,
  })
}