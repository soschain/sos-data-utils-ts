/** SOS routing taxonomy; an advertised sector never establishes eligibility or authority. */
export const DataspaceSectors=Object.freeze({
  HealthCare:'health-care',HealthLab:'health-lab',HealthResearch:'health-research',
  HealthTech:'health-tech',HealthInsurance:'health-insurance',
  AnimalCare:'animal-care',AnimalLab:'animal-lab',AnimalResearch:'animal-research',
  AnimalInsurance:'animal-insurance',AnimalTech:'animal-tech',
  OneHealthResearch:'onehealth-research',OneHealthLab:'onehealth-lab',OneHealthTech:'onehealth-tech',
} as const)
export type DataspaceSector=typeof DataspaceSectors[keyof typeof DataspaceSectors]
