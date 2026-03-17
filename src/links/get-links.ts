import { WindowsLinks } from './windows-links.js'

// Returns Windows links singleton
export async function getLinks(): Promise<WindowsLinks> {
  return WindowsLinks.Instance
}
