import { transpose } from '@transposerx/utils'
import { transpositionRepository } from '../repositories/transposition.repository.js'

interface EyeInput {
  inputSphere: number
  inputCylinder: number
  inputAxis: number
}

export const transpositionService = {
  async getHistory(userId: string) {
    return transpositionRepository.findByUser(userId, 2)
  },

  async transposeSingleEye(userId: string, eye: string, input: EyeInput) {
    const result = transpose({ sphere: input.inputSphere, cylinder: input.inputCylinder, axis: input.inputAxis })
    const record = await transpositionRepository.upsertForEye(userId, eye, input, {
      outSphere: result.sphere,
      outCylinder: result.cylinder,
      outAxis: result.axis,
    })
    return {
      id: record.id,
      outSphere: result.sphere,
      outCylinder: result.cylinder,
      outAxis: result.axis,
    }
  },

  async transposeBothEyes(userId: string, od: EyeInput, os: EyeInput) {
    const odResult = transpose({ sphere: od.inputSphere, cylinder: od.inputCylinder, axis: od.inputAxis })
    const osResult = transpose({ sphere: os.inputSphere, cylinder: os.inputCylinder, axis: os.inputAxis })
    await transpositionRepository.upsertBothEyes(
      userId,
      { input: od, output: { outSphere: odResult.sphere, outCylinder: odResult.cylinder, outAxis: odResult.axis } },
      { input: os, output: { outSphere: osResult.sphere, outCylinder: osResult.cylinder, outAxis: osResult.axis } },
    )
    return {
      od: odResult,
      os: osResult,
    }
  },
}
