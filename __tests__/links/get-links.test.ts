import { WindowsLinks } from '../../src/links/windows-links'
import { getLinks } from '../../src/links/get-links'

test.concurrent('getLinks returns WindowsLinks instance', async () => {
  const links = await getLinks()
  expect(links instanceof WindowsLinks).toBeTruthy()
})

test.concurrent(
  'Local and network versions have the same count and order',
  async () => {
    const localVersions =
      WindowsLinks.Instance.getAvailableLocalCudaVersions()
    const networkVersions =
      WindowsLinks.Instance.getAvailableNetworkCudaVersions()

    expect(localVersions.length).toBe(networkVersions.length)
    expect(localVersions).toEqual(networkVersions)
  }
)
