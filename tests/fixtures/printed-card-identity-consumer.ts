import {normalizePrintedAnimalSpeciesId7,buildPrintedAnimalCardNumber21,validatePrintedAnimalCardNumber21,buildPrintedHumanCardNumber21,buildPrintedHumanCardDidWeb,buildProviderScopedPersonalDigits} from '../../dist/index.js'
import {buildPrintedAnimalCardNumber21 as leaf} from '../../dist/printed-card-identity.js'
import {REPOSITORY_SAFE_EXAMPLES as safe} from '../../dist/repository-privacy.js'
const speciesId7=normalizePrintedAnimalSpeciesId7('9615')
const animal={profile:'animal21-v1' as const,speciesId7,jurisdictionCode5:'00000',animalNumericId15:'000000000000000'}
const cardNumber21=buildPrintedAnimalCardNumber21(animal);leaf(animal)
validatePrintedAnimalCardNumber21({profile:'animal21-v1',speciesId7,cardNumber21})
const subjectCode12=buildProviderScopedPersonalDigits({profile:'provider-damm-v1',providerId:'000000000',personalIdWithoutCheckDigit:'00000000000'})
const human=buildPrintedHumanCardNumber21({profile:'human21-v1',providerCode9:'000000000',subjectCode12})
buildPrintedHumanCardDidWeb({profile:'uhc-personal-v1',host:safe.domain,cardNumber21:human})
// @ts-expect-error Human and animal printed profiles must not be confused.
buildPrintedHumanCardNumber21({profile:'animal21-v1',providerCode9:'000000000',subjectCode12})
// @ts-expect-error A numeric species input is not the declared public API.
normalizePrintedAnimalSpeciesId7(9615)
// @ts-expect-error Missing explicit profile is not a creation fallback.
buildPrintedAnimalCardNumber21({speciesId7,jurisdictionCode5:'00000',animalNumericId15:'000000000000000'})
