import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import { SemVer } from 'semver'
import { WindowsLinks } from './links/windows-links.js'
import { Method } from './method.js'
import fs from 'fs'
import path from 'path'

// Download helper which returns the installer executable and caches it for next runs
export async function download(
  version: SemVer,
  method: Method,
  useLocalCache: boolean
): Promise<string> {
  // First try to find tool with desired version in tool cache (local to machine)
  const toolName = 'cuda_installer'
  const toolId = `${toolName}-windows`
  const destFileName = `${toolId}_${version}.exe`
  // Path that contains the executable file
  let executablePath: string | undefined
  if (useLocalCache) {
    const toolPath = tc.find(toolId, `${version}`)
    if (toolPath) {
      // Tool is already in cache — tc.find returns a directory, resolve the exe inside it
      core.debug(`Found in local machine cache ${toolPath}`)
      executablePath = await findExeInDir(toolPath)
    } else {
      core.debug(`Not found in local cache`)
    }
  }
  if (executablePath === undefined) {
    // Download tool from NVIDIA servers
    core.debug(`Not found in local cache, downloading...`)
    // Get download URL
    const url: URL = await getDownloadURL(method, version)
    const downloadDirectory = `cuda_download`
    const destFilePath = `${downloadDirectory}/${destFileName}`
    // Check if file already exists
    if (!(await fileExists(destFilePath))) {
      core.debug(`File at ${destFilePath} does not exist, downloading`)
      // Download executable
      await tc.downloadTool(url.toString(), destFilePath)
    } else {
      core.debug(`File at ${destFilePath} already exists, skipping download`)
    }
    if (useLocalCache) {
      // Cache download to local machine cache
      const localCacheDirectory = await tc.cacheFile(
        destFilePath,
        destFileName,
        toolId,
        `${version}`
      )
      core.debug(
        `Cached download to local machine cache at ${localCacheDirectory}`
      )
    }
    executablePath = destFilePath
  }
  core.debug(`Executable path ${executablePath}`)
  // Return full executable path
  return executablePath
}

// Find a single .exe file inside a directory (used for tool-cache directories)
async function findExeInDir(dir: string): Promise<string> {
  const entries = await fs.promises.readdir(dir)
  const exeFiles = entries.filter((f) => f.endsWith('.exe'))
  if (exeFiles.length === 1) {
    return path.join(dir, exeFiles[0])
  } else if (exeFiles.length === 0) {
    throw new Error(`No .exe file found in cache directory: ${dir}`)
  } else {
    throw new Error(
      `Multiple .exe files found in cache directory: ${dir} (${exeFiles.join(', ')})`
    )
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(filePath)
    core.debug(`Got the following stats for ${filePath}: ${stats}`)
    return !!stats
  } catch (e) {
    core.debug(`Got error while checking if ${filePath} exists: ${e}`)
    return false
  }
}

async function getDownloadURL(method: string, version: SemVer): Promise<URL> {
  const links = WindowsLinks.Instance
  switch (method) {
    case 'local':
      return await links.getLocalURLFromCudaVersion(version)
    case 'network':
      return links.getNetworkURLFromCudaVersion(version)
    default:
      throw new Error(
        `Invalid method: expected either 'local' or 'network', got '${method}'`
      )
  }
}
