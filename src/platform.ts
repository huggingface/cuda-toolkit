import os from 'os'

export async function getRelease(): Promise<string> {
  return os.release()
}
