/* @flow */

export type AphorismType = {
  quote: string,
  by: string
}

export type AphorismStateType = {
  current: ?AphorismType,
  fetching: boolean,
  fetchError: boolean,
  all: Array<AphorismType>
}

export type AphorismRequestStateType = {
  aphorism: AphorismStateType
}
