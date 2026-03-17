import * as core from '@actions/core'
import * as path from 'path'
import { SemVer } from 'semver'

export async function updatePath(version: SemVer): Promise<string> {
  const cudaPath = `C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA\\v${version.major}.${version.minor}`
  core.debug(`Cuda path: ${cudaPath}`)
  // Export $CUDA_PATH
  core.exportVariable('CUDA_PATH', cudaPath)
  core.debug(`Cuda path vx_y: ${cudaPath}`)
  // Export $CUDA_PATH_VX_Y
  core.exportVariable(`CUDA_PATH_V${version.major}_${version.minor}`, cudaPath)
  core.exportVariable(
    'CUDA_PATH_VX_Y',
    `CUDA_PATH_V${version.major}_${version.minor}`
  )
  // Add $CUDA_PATH/bin to $PATH
  const binPath = path.join(cudaPath, 'bin')
  core.debug(`Adding to PATH: ${binPath}`)
  core.addPath(binPath)
  // Return cuda path
  return cudaPath
}
