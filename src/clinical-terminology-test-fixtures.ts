import {CLINICAL_TERMINOLOGY_TEST_DATA, type ClinicalTerminologyCandidate} from './clinical-terminology.js';

type LabelEvidence=Readonly<{text:string;display:string;textLanguage:string;displayLanguage:string}>;
type LabelExpectation=Pick<ClinicalTerminologyCandidate,'display'|'text'|'language'>;
type LabelCase=Readonly<{labels?:LabelEvidence;expected:LabelExpectation}>;
const coding=CLINICAL_TERMINOLOGY_TEST_DATA.rabiesDisease;
const languages=Object.freeze({english:'en',spanish:'es'} as const);
const spanishText='rabia';
const bilingual=Object.freeze({text:spanishText,display:coding.display,textLanguage:languages.spanish,displayLanguage:languages.english});

/** Synthetic response-shape fixtures, not a Spanish catalogue or translation-coverage assertion. */
export const CLINICAL_TERMINOLOGY_LABEL_FIXTURES=Object.freeze({
 coding,languages,spanishText,
 rawSpanish:Object.freeze({labels:undefined,expected:Object.freeze({display:coding.code,text:spanishText,language:undefined})} satisfies LabelCase),
 englishFallback:Object.freeze({labels:Object.freeze({...bilingual,text:coding.display,textLanguage:languages.english}),expected:Object.freeze({display:coding.display,text:coding.display,language:languages.english})} satisfies LabelCase),
 bilingual:Object.freeze({labels:bilingual,expected:Object.freeze({display:coding.display,text:spanishText,language:languages.spanish})} satisfies LabelCase),
 nonEnglishDisplay:Object.freeze({labels:Object.freeze({...bilingual,display:spanishText,displayLanguage:languages.spanish}),expected:Object.freeze({display:coding.code,text:spanishText,language:languages.spanish})} satisfies LabelCase),
});
