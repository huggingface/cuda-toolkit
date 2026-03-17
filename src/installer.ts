import * as core from '@actions/core'
import { SemVer } from 'semver'
import { exec } from '@actions/exec'

export async function install(
  executablePath: string,
  version: SemVer,
  subPackagesArray: string[]
): Promise<void> {
  // Install arguments, see: https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/index.html
  const command: string = executablePath

  // Install silently
  let installArgs: string[] = ['-s']

  // Add subpackages to command args (if any)
  // See: https://docs.nvidia.com/cuda/cuda-installation-guide-microsoft-windows/index.html#install-cuda-software
  installArgs = installArgs.concat(
    subPackagesArray.map((subPackage) => {
      // Display driver sub package name is not dependent on version
      if (subPackage === 'Display.Driver') {
        return subPackage
      }
      return `${subPackage}_${version.major}.${version.minor}`
    })
  )

  // Execution options which contain callback functions for stdout and stderr of install process
  const execOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        core.debug(data.toString())
      },
      stderr: (data: Buffer) => {
        core.debug(`Error: ${data.toString()}`)
      }
    }
  }

  // Run installer
  try {
    core.debug(`Running install executable: ${executablePath}`)
    const exitCode = await exec(command, installArgs, execOptions)
    core.debug(`Installer exit code: ${exitCode}`)
  } catch (error) {
    core.warning(`Error during installation: ${error}`)
    throw error
  }
}
