import * as core from '@actions/core'
import { Method, parseMethod } from './method.js'
import { download } from './downloader.js'
import { getVersion } from './version.js'
import { install } from './installer.js'
import { updatePath } from './update-path.js'
import { parsePackages } from './parser.js'

async function run(): Promise<void> {
  try {
    const cuda: string = core.getInput('cuda')
    core.debug(`Desired cuda version: ${cuda}`)
    const subPackagesArgName = 'sub-packages'
    const subPackages: string = core.getInput(subPackagesArgName)
    core.debug(`Desired subPackages: ${subPackages}`)
    const methodString: string = core.getInput('method')
    core.debug(`Desired method: ${methodString}`)
    const useGitHubCache: boolean = core.getBooleanInput('use-github-cache')
    core.debug(`Desired GitHub cache usage: ${useGitHubCache}`)
    const useLocalCache: boolean = core.getBooleanInput('use-local-cache')
    core.debug(`Desired local cache usage: ${useLocalCache}`)

    // Parse subPackages array
    const subPackagesArray: string[] = await parsePackages(
      subPackages,
      subPackagesArgName
    )

    // Parse method
    const methodParsed: Method = parseMethod(methodString)
    core.debug(`Parsed method: ${methodParsed}`)

    // Parse version string
    const version = await getVersion(cuda, methodParsed)

    // Download
    const executablePath: string = await download(
      version,
      methodParsed,
      useLocalCache,
      useGitHubCache
    )

    // Install
    await install(executablePath, version, subPackagesArray)

    // Add CUDA environment variables to GitHub environment variables
    const cudaPath: string = await updatePath(version)

    // Set output variables
    core.setOutput('cuda', cuda)
    core.setOutput('CUDA_PATH', cudaPath)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error)
    } else {
      core.setFailed('Unknown error')
    }
  }
}

run()
